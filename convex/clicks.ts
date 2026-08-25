// The one write a stranger may cause, and the smallest one on the site.
//
// ⚠️ One row per clickable thing, patched in place. Never a row per click.
// Ticket 10: there is nothing you could ever do with a row per click except
// count them, because /privacy forbids the one field — the time — that would
// make them worth keeping. 199 rows, not 199,000.
//
// ⚠️ Nothing here is public. The door is `/clicks` in `http.ts`, which is the
// only place that can check a Turnstile permit over the network. A public
// mutation beside it would be the free way past the one control this endpoint
// has.
//
// ⚠️ The target is checked against the tables before anything is written. The
// count of a block is private to its owner, but the **sum** of every row here is
// printed on /how-it-works, so a row for a block or a day that does not exist is
// a way to write on a public page. A caller who names one gets silence.

import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

/**
 * Add one.
 *
 * The id arrives as a bare string off the internet, so it is normalised here
 * rather than validated as an `Id` at the edge: `normalizeId` answers null for
 * anything that is not one, where the validator would throw and hand a caller a
 * way to tell a real id from a made-up one.
 */
export const count = internalMutation({
  args: {
    kind: v.union(v.literal("block"), v.literal("banner")),
    /** A block's document id, or a banner day's `YYYY-MM-DD`. */
    id: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { kind, id }) => {
    let target;

    if (kind === "block") {
      const blockId = ctx.db.normalizeId("blocks", id);
      if (!blockId) return null;
      const block = await ctx.db.get(blockId);
      // A block with no link sends nobody anywhere, and a frozen one has had the
      // right to point at anything taken away (ticket 11). Neither is clickable
      // on the board, so neither may be counted from off it.
      if (!block || !block.url || block.frozen) return null;
      target = { kind, blockId } as const;
    } else {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(id)) return null;
      const day = await ctx.db
        .query("bannerDays")
        .withIndex("by_date", (q) => q.eq("date", id))
        .unique();
      // No row is the house ad, and a removed day is the house ad again. The
      // house ad opens the bid flow; it is not a link and it leaves nobody.
      if (!day?.url || day.removedAt) return null;
      target = { kind, date: id } as const;
    }

    const row = await ctx.db
      .query("clickCounts")
      .withIndex("by_target", (q) => q.eq("target", target))
      .unique();

    // ⚠️ A viral block contends on its own row through Convex's optimistic
    // concurrency. Ticket 10 named the escape — shard the counter across N rows
    // and sum them — and deliberately left it unbuilt: one row per block is
    // right for a board with no traffic yet, and sharding is then a known move
    // rather than a surprise.
    if (row) await ctx.db.patch(row._id, { count: row.count + 1 });
    else await ctx.db.insert("clickCounts", { target, count: 1 });

    return null;
  },
});
