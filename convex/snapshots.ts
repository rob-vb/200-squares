// The cached rows, and why they exist.
//
// A live Convex query reruns for every subscriber on every write it depends on.
// That is the product for the board, which takes at most a few hundred writes in
// its whole life. It is a bomb for anything written often.
//
// So: a query that reads one cached row instead of the tables reruns only when
// the cron rewrites that row. The cost stops following the writes. The same idea
// answers two different problems here.

import { v } from "convex/values";
import { internalMutation, query, type MutationCtx } from "./_generated/server";
import { readBoardLive } from "./board";

/** Write a cached row, creating it the first time. */
async function put(ctx: MutationCtx, key: "board" | "siteClicks", value: unknown) {
  const row = await ctx.db
    .query("cached")
    .withIndex("by_key", (q) => q.eq("key", key))
    .unique();
  const builtAt = Date.now();
  if (row) await ctx.db.patch(row._id, { value, builtAt });
  else await ctx.db.insert("cached", { key, value, builtAt });
}

/**
 * The board, frozen. What `BOARD_MODE=snapshot` serves.
 *
 * ⚠️ It is built on a schedule and not on demand, so the switch takes effect the
 * moment it is set. A snapshot built when the switch is thrown would be built
 * under exactly the load the switch exists to escape.
 */
export const buildBoard = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    await put(ctx, "board", await readBoardLive(ctx));
    return null;
  },
});

/**
 * Every click on every block and every banner day, added up.
 *
 * ⚠️ It must not be live and it must not join the board query. `/how-it-works`
 * holds a websocket by design, so a live total would rerun that page for every
 * viewer on every click anywhere on the site — the fan-out bomb ticket 10 named.
 * An hour old is the honest answer, and the copy says the count is a floor.
 */
export const buildSiteClicks = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const rows = await ctx.db.query("clickCounts").collect();
    await put(ctx, "siteClicks", rows.reduce((n, r) => n + r.count, 0));
    return null;
  },
});

/** The public total. One row read, and it is an hour old on purpose. */
export const siteClicks = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const row = await ctx.db
      .query("cached")
      .withIndex("by_key", (q) => q.eq("key", "siteClicks"))
      .unique();
    return typeof row?.value === "number" ? row.value : 0;
  },
});
