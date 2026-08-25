// The board, as the canvas draws it. One query, subscribed to by every visitor.
//
// ⚠️ Read ADR 0001 before adding a field here. This query reruns for every
// subscriber on every write it depends on, so every byte in the payload is paid
// for by everybody, every time. What is in it is what the canvas puts on screen
// and nothing else: no orders, no VAT, no email addresses, no click counts.
//
// It is live for a stranger with no account, which is deliberately not what
// ticket 02 recommended. Convex Free cannot bill — hard caps, no overage rate —
// so an overrun breaks the site instead of invoicing it, which is the dev's own
// rule enforced by the platform. And the board is cold: at most 199 sales in its
// whole life.

import { v } from "convex/values";
import { query, type QueryCtx } from "./_generated/server";
import { artwork, rect } from "./schema";
import { liveReservations } from "./reservations";
import { todayUtc } from "./lib/time";

/**
 * One block as the canvas needs it.
 *
 * ⚠️ `url` and `ownerName` are here and ticket 05 said they would not be. That
 * answer predates two later ones and both need them on the client:
 *
 *   Ticket 10 made a click a **native anchor** with an un-awaited mutation
 *   beside it — no redirect, no Vercel invocation, no blocked tab. An anchor
 *   needs its `href` at render, so the address has to be in this payload. A
 *   `/go/<id>` route would put it back on the server and undo that whole answer.
 *
 *   The tooltip has always named the owner, and the company name is public the
 *   moment the block goes live — /privacy says so in those words.
 *
 * The cost is real and it is small: ~199 blocks with a short name and a bare
 * host is a payload in the tens of kilobytes. ADR 0001 is amended to say so.
 * Nothing else moved: money and identity stay out.
 */
const boardBlock = v.object({
  id: v.string(),
  rect,
  ownerId: v.string(),
  ownerName: v.string(),
  url: v.string(),
  artwork: v.union(artwork, v.null()),
  frozen: v.boolean(),
});

const boardShape = v.object({
  blocks: v.array(boardBlock),
  /** Rectangles somebody is away paying for. They read as unavailable. */
  reserved: v.array(rect),
  banner: v.union(
    v.object({
      date: v.string(),
      ownerName: v.string(),
      url: v.string(),
      artwork: v.union(artwork, v.null()),
    }),
    v.null(),
  ),
  /**
   * `live` straight off the tables, or `snapshot` off one cached row. The
   * client is told which so it can say so; it changes nothing it renders.
   */
  mode: v.union(v.literal("live"), v.literal("snapshot")),
  /** When a snapshot was built. Absolute UTC ms, null when live. */
  builtAt: v.union(v.number(), v.null()),
});

/**
 * The kill switch, and the only answer available at 03:00 on a viral day.
 *
 * `BOARD_LIVE=false` on the Convex deployment moves the board off the tables and
 * onto one cached row that a cron rewrites. The websocket stays; what stops is
 * the fan-out, because a block write no longer reruns anybody's query. No deploy,
 * no code change, and it goes back by setting it to `true`.
 *
 * ⚠️ It defaults to **live** when the variable is missing or misspelt. A board
 * that quietly went cold because somebody typed `BOARD_LIV` would be a much
 * worse failure than one that stayed live: only `"false"` throws the switch.
 */
const boardMode = () => (process.env.BOARD_LIVE === "false" ? "snapshot" : "live");

/** The board off the tables. Also what the snapshot cron stores. */
export async function readBoardLive(ctx: QueryCtx) {
  const blocks = await ctx.db.query("blocks").collect();
  const owners = await ctx.db.query("owners").collect();
  const nameById = new Map(owners.map((o) => [o._id, o.name]));

  const reservations = await liveReservations(ctx);

  const date = todayUtc(Date.now());
  const day = await ctx.db
    .query("bannerDays")
    .withIndex("by_date", (q) => q.eq("date", date))
    .unique();
  // No row, no owner, or removed for the day: all three are the house ad, and
  // the canvas already reads a missing banner as exactly that.
  const banner =
    day && day.ownerId && !day.removedAt
      ? {
          date: day.date,
          ownerName: nameById.get(day.ownerId) ?? "",
          url: day.url ?? "",
          artwork: day.artwork,
        }
      : null;

  return {
    blocks: blocks.map((b) => ({
      id: b._id as string,
      rect: b.rect,
      ownerId: b.ownerId as string,
      ownerName: nameById.get(b.ownerId) ?? "",
      url: b.url,
      artwork: b.artwork,
      frozen: b.frozen,
    })),
    reserved: reservations.map((r) => r.rect),
    banner,
  };
}

export const state = query({
  args: {},
  returns: boardShape,
  handler: async (ctx) => {
    if (boardMode() === "snapshot") {
      const row = await ctx.db
        .query("cached")
        .withIndex("by_key", (q) => q.eq("key", "board"))
        .unique();
      // An empty cache is not a reason to fall back to the live read: falling
      // back is exactly the load the switch was thrown to stop. An empty board
      // for the minute until the cron runs is the cheaper wrong answer.
      const value = row?.value ?? { blocks: [], reserved: [], banner: null };
      return { ...value, mode: "snapshot" as const, builtAt: row?.builtAt ?? null };
    }
    return { ...(await readBoardLive(ctx)), mode: "live" as const, builtAt: null };
  },
});
