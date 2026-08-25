// What one owner holds. Everything here is private to them.
//
// ⚠️ **This file is keyed on an owner id passed in by the client, and ticket 18
// replaces that with the Better Auth session.** Until then, anybody who knows an
// owner id can read that owner's click counts and bids. That is why `mine` is
// only reachable through the seeded viewer (`seedViewer` below), which refuses
// unless `SEED_ENABLED` is set — so on production there is no way to call it
// with an id at all.
//
// When ticket 18 lands, `mine` takes no argument and resolves the owner through
// `requireOwner(ctx)`, and `seedViewer` is deleted with the prototype's fake
// sign-in.

import { v } from "convex/values";
import { query } from "./_generated/server";
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
  args: { ownerId: v.id("owners") },
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
      bids: v.array(v.object({ id: v.string(), amountCents: v.number(), placedAt: v.number() })),
    }),
  ),
  handler: async (ctx, { ownerId }) => {
    const owner = await ctx.db.get(ownerId);
    if (!owner) return null;
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
      .map((r) => ({ id: r._id as string, amountCents: r.amountCents, placedAt: r.placedAt }));

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
 * ⚠️ The prototype's fake sign-in, and nothing more.
 *
 * It hands back one seeded owner so the panel can be looked at on a preview URL
 * before [ticket 18](../.scratch/200squares-v1/issues/18-build-accounts.md)
 * builds real accounts. It refuses unless `SEED_ENABLED` is set, so on
 * production it returns null and the fake sign-in has nobody to be.
 *
 * Delete this with ticket 18.
 */
export const seedViewer = query({
  args: {},
  returns: v.union(v.null(), v.object({ id: v.string(), name: v.string() })),
  handler: async (ctx) => {
    if (!process.env.SEED_ENABLED) return null;
    const owner = await ctx.db
      .query("owners")
      .withIndex("by_email", (q) => q.eq("emailNormalised", "vb@example.invalid"))
      .unique();
    return owner ? { id: owner._id as string, name: owner.name } : null;
  },
});
