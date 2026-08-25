// What one owner holds. Everything here is private to them.
//
// ⚠️ **It takes no owner id.** Ticket 15 keyed this on an id the client passed
// in, which meant anybody holding an id could read that owner's click counts and
// bids — safe only because the fake sign-in refused to hand one out unless
// `SEED_ENABLED` was set. Ticket 18 replaces that with the session: the caller
// is whoever Better Auth says they are, and the answer is about them or it is
// null. There is no argument left to get wrong.

import { v } from "convex/values";
import { query } from "./_generated/server";
import { currentOwner } from "./auth";
import { artwork, rect } from "./schema";
import { nextDate, todayUtc, STRIKE_MS } from "./lib/time";

/**
 * The number of strikes that still count against an owner.
 *
 * A strike expires after twelve months, because the rule is for a pattern that
 * runs over days and not for a mistake made a year ago. Ticket 11.
 */
export const liveStrikes = (strikeAt: number[], now: number) =>
  strikeAt.filter((t) => now - t < STRIKE_MS).length;

export const mine = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      id: v.string(),
      name: v.string(),
      strikes: v.number(),
      blocks: v.array(
        v.object({
          id: v.string(),
          rect,
          url: v.string(),
          artwork: v.union(artwork, v.null()),
          frozen: v.boolean(),
          clicks: v.number(),
        }),
      ),
      bannerDays: v.array(
        v.object({ date: v.string(), wonWithCents: v.number(), clicks: v.number() }),
      ),
      bids: v.array(
        v.object({
          id: v.string(),
          amountCents: v.number(),
          placedAt: v.number(),
          /** Where the banner will point if this bid wins. Ticket 19. */
          url: v.string(),
        }),
      ),
    }),
  ),
  handler: async (ctx) => {
    // Null covers three cases and the panel treats them alike: nobody is signed
    // in, the session is stale, or the address has no owner row behind it —
    // somebody who made an account before they ever bought anything.
    const owner = await currentOwner(ctx);
    if (!owner) return null;
    const ownerId = owner._id;
    const now = Date.now();

    const blockRows = await ctx.db
      .query("blocks")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .collect();

    const blocks = [];
    for (const b of blockRows) {
      const counter = await ctx.db
        .query("clickCounts")
        .withIndex("by_target", (q) => q.eq("target", { kind: "block", blockId: b._id }))
        .unique();
      blocks.push({
        id: b._id as string,
        rect: b.rect,
        url: b.url,
        artwork: b.artwork,
        frozen: b.frozen,
        clicks: counter?.count ?? 0,
      });
    }

    const today = todayUtc(now);
    const dayRows = (await ctx.db.query("bannerDays").collect())
      .filter((d) => d.ownerId === ownerId && d.date <= today)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
    const bannerDays = [];
    for (const day of dayRows) {
      const counter = await ctx.db
        .query("clickCounts")
        .withIndex("by_target", (q) => q.eq("target", { kind: "banner", date: day.date }))
        .unique();
      bannerDays.push({
        date: day.date,
        wonWithCents: day.wonWithCents ?? 0,
        clicks: counter?.count ?? 0,
      });
    }

    const bids = (
      await ctx.db
        .query("bids")
        .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
        .collect()
    )
      .filter((r) => r.date === nextDate(today) && r.status === "held")
      .map((r) => ({
        id: r._id as string,
        amountCents: r.amountCents,
        placedAt: r.placedAt,
        url: r.url ?? "",
      }));

    return {
      id: owner._id as string,
      name: owner.name,
      strikes: liveStrikes(owner.strikeAt, now),
      blocks,
      bannerDays,
      bids,
    };
  },
});

/**
 * The ticket 03 fields this owner last gave, to fill a form in with.
 *
 * ⚠️ **A form filler, not the record** — ticket 07's own words. Every order
 * freezes its own copy, so `05`'s "an invoice is never recomputed" is untouched
 * and changing an answer here changes nothing that was already sold. It reads
 * the last order rather than four columns on `owners`, because `owners` is read
 * whole by the board query and every column on it is paid for by every viewer.
 */
export const lastDeclared = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      buyerType: v.union(v.literal("business"), v.literal("consumer")),
      country: v.string(),
      name: v.string(),
      vatNumber: v.string(),
    }),
  ),
  handler: async (ctx) => {
    const owner = await currentOwner(ctx);
    if (!owner) return null;
    const last = await ctx.db
      .query("orders")
      .withIndex("by_owner", (q) => q.eq("ownerId", owner._id))
      .order("desc")
      .first();
    if (!last) return null;
    return {
      buyerType: last.buyerType,
      country: last.country,
      name: last.name,
      vatNumber: last.vatNumber ?? "",
    };
  },
});
