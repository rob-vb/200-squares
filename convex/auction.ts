// Reading the auction. Placing a bid is ticket 19's, and so is the close.
//
// The auction day is a **UTC date string**, never an offset. Bidding right now
// is bidding for tomorrow: today's banner was won at the 00:00 UTC that started
// today, which is what makes it today's.
//
// ⚠️ No row in `bannerDays` for a day means **nobody won it**, which is the house
// ad. That is the same reading the prototype had and it survives unchanged.

import { v } from "convex/values";
import { query } from "./_generated/server";
import { artwork } from "./schema";
import { nextDate, nextMidnightUtc, todayUtc } from "./lib/time";

/** The floor bid, and the step over the top bid. Both in cents. */
export const BID_FLOOR_CENTS = 100_00;
export const BID_STEP_CENTS = 10_00;

const bidShape = v.object({
  id: v.string(),
  ownerId: v.string(),
  ownerName: v.string(),
  amountCents: v.number(),
  /** Absolute UTC ms. The client renders "how long ago" from its own clock. */
  placedAt: v.number(),
});

/**
 * The auction running right now: every live hold on tomorrow's banner.
 *
 * A released or failed bid is not in it. Being outbid cancels the hold at once
 * (ticket 07), so a released row is a bid that has already been answered and
 * showing it would put a number on screen that nobody can be raised over.
 */
export const live = query({
  args: {},
  returns: v.object({
    date: v.string(),
    /** The 00:00 UTC this auction closes at. Absolute ms. */
    closesAt: v.number(),
    bids: v.array(bidShape),
    topCents: v.union(v.number(), v.null()),
    minNextCents: v.number(),
  }),
  handler: async (ctx) => {
    const now = Date.now();
    const date = nextDate(todayUtc(now));
    const rows = await ctx.db
      .query("bids")
      .withIndex("by_date", (q) => q.eq("date", date))
      .collect();
    const held = rows.filter((r) => r.status === "held");

    const owners = new Map<string, string>();
    for (const bid of held) {
      if (owners.has(bid.ownerId)) continue;
      owners.set(bid.ownerId, (await ctx.db.get(bid.ownerId))?.name ?? "");
    }

    const bids = held
      .map((r) => ({
        id: r._id as string,
        ownerId: r.ownerId as string,
        ownerName: owners.get(r.ownerId) ?? "",
        amountCents: r.amountCents,
        placedAt: r.placedAt,
      }))
      .sort((a, b) => b.placedAt - a.placedAt);

    const topCents = held.reduce<number | null>(
      (top, r) => (top === null || r.amountCents > top ? r.amountCents : top),
      null,
    );

    return {
      date,
      closesAt: nextMidnightUtc(now),
      bids,
      topCents,
      minNextCents: topCents === null ? BID_FLOOR_CENTS : topCents + BID_STEP_CENTS,
    };
  },
});

/**
 * The banner days behind us, newest first. What `/how-it-works` prints as the
 * record, and the only place a past winning bid is public.
 */
export const record = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(
    v.object({
      date: v.string(),
      ownerName: v.string(),
      url: v.string(),
      artwork: v.union(artwork, v.null()),
      wonWithCents: v.union(v.number(), v.null()),
      clicks: v.number(),
    }),
  ),
  handler: async (ctx, { limit }) => {
    const today = todayUtc(Date.now());
    const rows = (await ctx.db.query("bannerDays").collect())
      .filter((d) => d.date <= today && d.ownerId)
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, limit ?? 14);

    const out = [];
    for (const day of rows) {
      const owner = day.ownerId ? await ctx.db.get(day.ownerId) : null;
      const counter = await ctx.db
        .query("clickCounts")
        .withIndex("by_target", (q) => q.eq("target", { kind: "banner", date: day.date }))
        .unique();
      out.push({
        date: day.date,
        ownerName: owner?.name ?? "",
        url: day.url ?? "",
        artwork: day.artwork,
        wonWithCents: day.wonWithCents ?? null,
        clicks: counter?.count ?? 0,
      });
    }
    return out;
  },
});
