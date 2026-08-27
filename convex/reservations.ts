// The write path: exactly one winner on a rectangle, and the remainder the
// loser is offered instead.
//
// A reservation is the claim a visitor holds while they are away paying. It
// lasts 15 minutes and, apart from the salted IP hash ticket 06's flood control
// needs, it identifies nobody — no cookie, no session, no address. The id rides
// in the Stripe session metadata and the webhook brings it back, which is what
// keeps the board page cookie-free (ticket 02).
//
// Expiry is **lazy on read plus a cron that sweeps**. Every reader here filters
// on `expiresAt` itself, so a row the sweep has not reached yet still counts as
// gone. The cron is housekeeping, never correctness.
//
// ⚠️ `reserve` is **internal**. It is reached only through the HTTP action in
// `convex/http.ts`, which is the one place that can see the caller's IP and spend
// a Turnstile token — a public mutation here would hand the flood back the free
// road ticket 06 closed. `release` and `attachSession` stay public on purpose:
// both take a reservation id, and a reservation id is a 32-character random
// string that exists in exactly one browser tab. Knowing one *is* the proof.

import { v, ConvexError } from "convex/values";
import { mutation, internalMutation, query, type QueryCtx } from "./_generated/server";
import { rect as rectValidator } from "./schema";
import { largestFreePart, rectIsSellable, cellCount, MAX_BLOCK, SQUARE_COUNT, type Rect } from "./lib/board";
import { RESERVATION_MS } from "./lib/time";

/**
 * ⚠️ Ticket 06's third free control: at most a tenth of the free squares may be
 * in reservation at one time. It is the ceiling that stops a distributed script
 * freezing the whole board for nothing.
 *
 * The floor under it is this build's, not the ticket's. Ten percent of the free
 * squares is 19 while the board is empty and **zero** by the time nine are left,
 * which would refuse the last real buyers on the site's best day. One full 3 × 3
 * is always allowed through, so the endgame still sells.
 */
export const reservationCeiling = (freeSquares: number) =>
  Math.max(MAX_BLOCK * MAX_BLOCK, Math.floor(freeSquares / 10));

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
 * second one is retried against the first one's write and fails it. The two
 * limits below are inside the same transaction for the same reason — a limit
 * checked in the HTTP action around it would be a limit two requests can walk
 * past together.
 *
 * The loser is not sent away with an error. `offer` is the largest part of what
 * they drew that is still free, so the panel can redraw their selection without
 * the part that went and they take it in one tap. Only a total overlap returns
 * `offer: null`, and that is the one case with nothing to say but no.
 */
export const reserve = internalMutation({
  args: { rect: rectValidator, ipHash: v.string() },
  returns: v.union(
    v.object({ ok: v.literal(true), reservationId: v.id("reservations"), expiresAt: v.number() }),
    v.object({ ok: v.literal(false), reason: v.literal("taken"), offer: v.union(rectValidator, v.null()) }),
    v.object({ ok: v.literal(false), reason: v.union(v.literal("ip"), v.literal("ceiling")) }),
  ),
  handler: async (ctx, { rect, ipHash }) => {
    if (!rectIsSellable(rect)) {
      throw new ConvexError("That is not a rectangle this site sells.");
    }

    const blocks = await ctx.db.query("blocks").collect();
    const held = await liveReservations(ctx);

    // One live reservation per visitor. A second attempt is told plainly rather
    // than being handed a second hold on another part of the board.
    if (held.some((r) => r.ipHash === ipHash)) {
      return { ok: false as const, reason: "ip" as const };
    }

    const soldCells = blocks.reduce((n, b) => n + cellCount(b.rect), 0);
    const heldCells = held.reduce((n, r) => n + cellCount(r.rect), 0);
    if (heldCells + cellCount(rect) > reservationCeiling(SQUARE_COUNT - soldCells)) {
      return { ok: false as const, reason: "ceiling" as const };
    }

    const taken = [...blocks.map((b) => b.rect), ...held.map((r) => r.rect)];
    const free = largestFreePart(rect, taken);

    // Anything smaller than what they drew means somebody got there first, so
    // the reservation is refused and the smaller rectangle is what is offered.
    if (!free || free.w !== rect.w || free.h !== rect.h) {
      return { ok: false as const, reason: "taken" as const, offer: free };
    }

    const now = Date.now();
    const reservationId = await ctx.db.insert("reservations", {
      rect,
      expiresAt: now + RESERVATION_MS,
      ipHash,
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
 * What the checkout route needs to know before it asks Stripe for anything.
 *
 * It is deliberately thin: the rectangle to price, whether the hold is still
 * alive, and the session this reservation already has. Nothing about the buyer,
 * because a reservation knows nothing about the buyer.
 */
export const forCheckout = query({
  args: { reservationId: v.id("reservations") },
  returns: v.union(
    v.null(),
    v.object({
      rect: rectValidator,
      expiresAt: v.number(),
      live: v.boolean(),
      stripeSessionId: v.union(v.string(), v.null()),
    }),
  ),
  handler: async (ctx, { reservationId }) => {
    const row = await ctx.db.get(reservationId);
    if (!row) return null;
    return {
      rect: row.rect,
      expiresAt: row.expiresAt,
      live: !row.releasedAt && row.expiresAt > Date.now(),
      stripeSessionId: row.stripeSessionId ?? null,
    };
  },
});

/**
 * Remember which Stripe session this reservation became.
 *
 * ⚠️ It writes once and then refuses, which is what makes *pressing order twice*
 * safe: the second press finds the id already there and is sent to the same
 * Stripe page. Together with the reservation id as Stripe's idempotency key, one
 * reservation has exactly one session for its whole life (ticket 06).
 */
export const attachSession = mutation({
  args: { reservationId: v.id("reservations"), stripeSessionId: v.string() },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, { reservationId, stripeSessionId }) => {
    const row = await ctx.db.get(reservationId);
    if (!row) return null;
    if (row.stripeSessionId) return row.stripeSessionId;
    await ctx.db.patch(reservationId, { stripeSessionId });
    return stripeSessionId;
  },
});

/**
 * The sweep. Housekeeping only — every reader already ignores an expired row.
 *
 * It exists so the table does not grow without bound, so the board query's
 * `collect()` stays cheap, and so the IP hash on a dead hold does not outlive
 * the reason it was kept.
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
