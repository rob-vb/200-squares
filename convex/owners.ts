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
import { squareRange } from "./lib/board";
import { invoiceUrl } from "./invoices";
import { liveWithdrawUrl } from "./lib/withdrawal";
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
      /**
       * Every invoice this owner has, newest first.
       *
       * ⚠️ The second of the two places ticket 17 delivers a document — the
       * order-confirmed mail is the first. It is here because a mail is lost more
       * easily than an account, and the link is permanent: the token is the whole
       * address, so an owner can hand it to their own bookkeeper without handing
       * over the account.
       */
      invoices: v.array(
        v.object({
          number: v.string(),
          issuedAt: v.number(),
          url: v.string(),
          what: v.string(),
          totalCents: v.number(),
          /**
           * The second entry point of art. 6:230oa lid 1 (ticket 43), under the
           * order row it belongs to. Empty where there is nothing to offer: a
           * business order, a period that has run, one already withdrawn from.
           */
          withdrawUrl: v.string(),
        }),
      ),
      bids: v.array(
        v.object({
          id: v.string(),
          amountCents: v.number(),
          placedAt: v.number(),
          /** Where the banner will point if this bid wins. Ticket 19. */
          url: v.string(),
          /**
           * Whether a picture is already attached. A boolean and not the
           * artwork: the panel only has to know which word the button says, and
           * the file itself is drawn on the banner, never in this list.
           */
          artwork: v.boolean(),
        }),
      ),
      /**
       * The auction that has already closed, and how it ended for this owner.
       *
       * ⚠️ One row and no more — ticket 38's words. `bids` above holds only
       * standing holds on tomorrow's banner, so the morning after a close this
       * panel said *You have not bid.* to somebody who bid all day and lost. A
       * full bidding history is somebody else's question; this is the one row
       * that stops the panel forgetting him.
       */
      settled: v.array(
        v.object({
          id: v.string(),
          date: v.string(),
          amountCents: v.number(),
          /** `declined` is a bank that refused; `not-won` is an ordinary release. */
          outcome: v.union(v.literal("declined"), v.literal("not-won")),
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

    // Bounded at fifty orders: this is a panel, not the ten-year record, and an
    // owner with more than fifty of them has a bookkeeper rather than a scroll.
    const invoices = [];
    for (const order of await ctx.db
      .query("orders")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .order("desc")
      .take(50)) {
      if (order.refundedAt) continue;
      const invoice = await ctx.db
        .query("invoices")
        .withIndex("by_order", (q) => q.eq("orderId", order._id))
        .unique();
      // Every order that stands. The number and the link belong only to an
      // invoice the site itself issued before ADR 0006; the withdrawal function
      // of art. 6:230oa lid 1 hangs under the row either way (ticket 43).
      const withdraw = await liveWithdrawUrl(ctx, order);
      invoices.push({
        number: invoice?.storageId ? invoice.number : "",
        issuedAt: invoice?.issuedAt ?? order.createdAt,
        url: invoice?.storageId ? invoiceUrl(invoice.token) : "",
        what:
          order.kind === "banner"
            ? `Banner ${order.bannerDate ?? ""}`
            : order.rect
              ? `Square ${squareRange(order.rect)}`
              : "",
        totalCents: order.totalCents,
        withdrawUrl: withdraw,
      });
    }

    const bidRows = await ctx.db
      .query("bids")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .collect();

    const bids = bidRows
      .filter((r) => r.date === nextDate(today) && r.status === "held")
      .map((r) => ({
        id: r._id as string,
        amountCents: r.amountCents,
        placedAt: r.placedAt,
        url: r.url ?? "",
        artwork: Boolean(r.artwork),
      }));

    // ⚠️ `today`, not yesterday. The close at 00:00 UTC this morning decided
    // **today's** banner, so the bid it settled carries today's date.
    //
    // ⚠️ Only these two endings. A `late` or `closed` failure never held any
    // money and the bidder was told so at the keyboard, on the screen he was
    // already looking at; putting *Declined* beside it would invent a refusal
    // that never happened.
    const settled = bidRows
      .filter(
        (r) =>
          r.date === today &&
          (r.status === "released" || (r.status === "failed" && r.failure === "declined")),
      )
      .map((r) => ({
        id: r._id as string,
        date: r.date,
        amountCents: r.amountCents,
        outcome: r.status === "released" ? ("not-won" as const) : ("declined" as const),
      }));

    return {
      id: owner._id as string,
      name: owner.name,
      strikes: liveStrikes(owner.strikeAt, now),
      blocks,
      bannerDays,
      invoices,
      bids,
      settled,
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
      name: v.string(),
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
      name: last.name,
    };
  },
});
