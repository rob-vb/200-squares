// Taking a released picture off Vercel's edge.
//
// ⚠️ [Ticket 34](../.scratch/200squares-v1/issues/34-stripped-art-stays-cached.md)
// and [ADR 0004](../../docs/adr/0004-a-year-is-a-cache-not-a-promise.md). A file
// deleted from Convex storage is not gone: `/art/<id>` is cached for a year in
// every region that ever served it, so a picture taken down for adult content or
// impersonation keeps answering at the address somebody reported. The route tags
// what it caches — `art-<id>` — and this deletes the tag.
//
// ⚠️ **It fires on `release`, not on the strip.** `release` in `convex/art.ts` is
// where a file stops being pointed at, and the admin's press is one of its six
// callers. The other five are replacements, and each of them leaves the same
// year-long copy of the *old* picture on the edge. An owner who replaces a
// picture *because* it was the wrong one has the identical hole, and nobody would
// have called that a removal.
//
// ⚠️ **An action, because a mutation may not reach the network** — the same shape
// as the removal mail. Scheduling it inside the transaction is what keeps the
// press one act: if the write rolls back, no purge was ever booked.

import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction, internalMutation } from "./_generated/server";

/** Vercel's bulk limit. `release` sends at most two; the route chunks anyway. */
const MAX_TAGS = 16;

/**
 * How long the site keeps trying, and then stops.
 *
 * Six attempts over about eight hours. It stops rather than retrying forever
 * because a wrong `PURGE_URL` is not a thing that comes right on its own, and a
 * job that reschedules for ever is a bill on a plan that has none. **Stopping is
 * not giving up quietly**: the `removals` row keeps no `purgedAt` and `/admin`
 * goes on listing it, which is the alarm.
 */
const BACKOFF_MS = [30_000, 120_000, 600_000, 3_600_000, 21_600_000];

/** The tag the route puts on the answer it caches. One file, one tag. */
export const tagFor = (storageId: string) => `art-${storageId}`;

/**
 * The purge happened. Stamped once — a second success must not move the date.
 */
export const markPurged = internalMutation({
  args: { removalId: v.id("removals") },
  returns: v.null(),
  handler: async (ctx, { removalId }) => {
    const row = await ctx.db.get(removalId);
    if (row && !row.purgedAt) await ctx.db.patch(removalId, { purgedAt: Date.now() });
    return null;
  },
});

/**
 * Post the tags to the site and record what happened.
 *
 * ⚠️ **`PURGE_URL` decides which environment is purged**, because cache tags are
 * scoped per project *and* environment and the route reads its environment from
 * the deployment it runs in. The dev deployment must point at staging and prod at
 * `200squares.com`. Getting it wrong purges the wrong edge and reports success.
 *
 * ⚠️ **A replacement carries no `removals` row**, so a failed purge on one leaves
 * nothing but this log. That is deliberate: the `removals` table is the ten-year
 * record of things taken off after a report, and writing a row there every time an
 * owner changed their own picture would make `/admin` list them as removals. What
 * is at stake also differs — a stale replacement is the owner's own former
 * picture, with nobody outside waiting to see it gone — so the retries are the
 * whole answer there.
 */
export const purgeArt = internalAction({
  args: {
    tags: v.array(v.string()),
    removalId: v.optional(v.id("removals")),
    attempt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, { tags, removalId, attempt }) => {
    const url = process.env.PURGE_URL;
    const secret = process.env.PURGE_SECRET;

    let why = "";
    if (!url || !secret) {
      why = "PURGE_URL or PURGE_SECRET is not set";
    } else {
      try {
        const answer = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-purge-secret": secret },
          body: JSON.stringify({ tags: tags.slice(0, MAX_TAGS) }),
        });
        if (answer.ok) {
          if (removalId) await ctx.runMutation(internal.purge.markPurged, { removalId });
          return null;
        }
        why = `the site answered ${answer.status}: ${(await answer.text()).slice(0, 200)}`;
      } catch (error) {
        why = `the request failed: ${String(error).slice(0, 200)}`;
      }
    }

    const next = BACKOFF_MS[attempt];
    if (next === undefined) {
      // The last word on a purge that never happened. For a removal `/admin`
      // says it too, and keeps saying it.
      console.error(`purge gave up after ${attempt + 1} attempts on ${tags.join(", ")}: ${why}`);
      return null;
    }
    console.error(`purge attempt ${attempt + 1} on ${tags.join(", ")} failed: ${why}`);
    await ctx.scheduler.runAfter(next, internal.purge.purgeArt, {
      tags,
      removalId,
      attempt: attempt + 1,
    });
    return null;
  },
});
