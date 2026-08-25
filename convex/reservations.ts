// The write path: exactly one winner on a rectangle, and the remainder the
// loser is offered instead.
//
// A reservation is the claim a visitor holds while they are away paying. It
// lasts 15 minutes and identifies nobody — no cookie, no session, no address.
// The id rides in the Stripe session metadata and the webhook brings it back,
// which is what keeps the board page cookie-free (ticket 02).
//
// Expiry is **lazy on read plus a cron that sweeps**. Every reader here filters
// on `expiresAt` itself, so a row the sweep has not reached yet still counts as
// gone. The cron is housekeeping, never correctness.
//
// ⚠️ Not in this file: Turnstile, one reservation per IP, and the 10% ceiling on
// the free squares. Those are ticket 16's three limits and they sit **on top of**
// this mutation. Until they land, `reserve` is open to the flood ticket 02 and
// ticket 05 both left standing.

import { v, ConvexError } from "convex/values";
import { mutation, internalMutation, type QueryCtx } from "./_generated/server";
import { rect as rectValidator } from "./schema";
import { largestFreePart, rectIsSellable, type Rect } from "./lib/board";
import { RESERVATION_MS } from "./lib/time";

/**
 * Every reservation still standing, right now.
 *
 * Read in full rather than through the index, because the index is on
 * `expiresAt` and a live row is one whose expiry is in the *future* — the range
 * a `by_expiry` scan is worst at. There are never many: a reservation lives 15
 * minutes and the board holds 199 squares.
 */
export async function liveReservations(ctx: QueryCtx) {
  const now = Date.now();
  const all = await ctx.db.query("reservations").collect();
  return all.filter((r) => !r.releasedAt && r.expiresAt > now);
}

/** Every rectangle that is not free right now: blocks first, then live holds. */
export async function takenRects(ctx: QueryCtx): Promise<Rect[]> {
  const blocks = await ctx.db.query("blocks").collect();
  const held = await liveReservations(ctx);
  return [...blocks.map((b) => b.rect), ...held.map((r) => r.rect)];
}

/**
 * Claim a rectangle for 15 minutes.
 *
 * ⚠️ The whole point of this function is the read-then-write inside one Convex
 * mutation. Convex runs mutations serialisably against what they read, so two
 * visitors dragging the same square cannot both pass the overlap check: the
 * second one is retried against the first one's write and fails it.
 *
 * The loser is not sent away with an error. `offer` is the largest part of what
 * they drew that is still free, so the panel can redraw their selection without
 * the part that went and they take it in one tap. Only a total overlap returns
 * `offer: null`, and that is the one case with nothing to say but no.
 */
export const reserve = mutation({
  args: { rect: rectValidator },
  returns: v.union(
    v.object({ ok: v.literal(true), reservationId: v.id("reservations"), expiresAt: v.number() }),
    v.object({ ok: v.literal(false), offer: v.union(rectValidator, v.null()) }),
  ),
  handler: async (ctx, { rect }) => {
    if (!rectIsSellable(rect)) {
      throw new ConvexError("That is not a rectangle this site sells.");
    }

    const taken = await takenRects(ctx);
    const free = largestFreePart(rect, taken);

    // Anything smaller than what they drew means somebody got there first, so
    // the reservation is refused and the smaller rectangle is what is offered.
    if (!free || free.w !== rect.w || free.h !== rect.h) {
      return { ok: false as const, offer: free };
    }

    const now = Date.now();
    const reservationId = await ctx.db.insert("reservations", {
      rect,
      expiresAt: now + RESERVATION_MS,
      createdAt: now,
    });
    return { ok: true as const, reservationId, expiresAt: now + RESERVATION_MS };
  },
});

/**
 * Give a rectangle back before its time is up.
 *
 * Stripe's back link is the reason this exists: a visitor who changes their mind
 * on the payment page should not freeze five squares for the rest of the quarter
 * hour. It is safe to call on a row that is already gone.
 */
export const release = mutation({
  args: { reservationId: v.id("reservations") },
  returns: v.null(),
  handler: async (ctx, { reservationId }) => {
    const row = await ctx.db.get(reservationId);
    if (!row || row.releasedAt) return null;
    await ctx.db.patch(reservationId, { releasedAt: Date.now() });
    return null;
  },
});

/**
 * The sweep. Housekeeping only — every reader already ignores an expired row.
 *
 * It exists so the table does not grow without bound, and so the board query's
 * `collect()` stays cheap. Rows are deleted rather than marked: an expired
 * reservation that never became an order is not a record of anything.
 */
export const sweep = internalMutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    // An hour's grace, so a webhook arriving late at a reservation that just
    // expired still finds the row and can tell "expired" from "never existed".
    const cutoff = Date.now() - 60 * 60 * 1000;
    const stale = await ctx.db
      .query("reservations")
      .withIndex("by_expiry", (q) => q.lt("expiresAt", cutoff))
      .collect();
    for (const row of stale) await ctx.db.delete(row._id);
    return stale.length;
  },
});
