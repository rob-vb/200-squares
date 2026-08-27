// The withdrawal function art. 6:230oa BW / art. 11a CRD has required since
// 19 June 2026, and the refund it books for the dev.
//
// [Ticket 42](../.scratch/200squares-v1/issues/42-the-withdrawal-function.md)
// decided every line of this and [ADR 0005](../docs/adr/0005-fourteen-days-and-a-button.md)
// froze the part that cannot be revisited. In short:
//
//   The right   — 14 days from purchase on a square, and the site makes **no**
//                 claim that a square is ever fully performed. On a banner, born
//                 at the close and dead at 00:00 UTC the next day (art. 6:230p
//                 sub d).
//   The function — one route, `/withdraw/<token>`, two entry points on the
//                 interface, consumers only.
//   The effect  — a `withdrawals` row always; a banner comes down at that
//                 instant; a square does not move and the dev pays by hand.
//
// ⚠️ **The token is the whole grant and there is no sign-in.** That is not a
// shortcut, it is the requirement: ACM says an account may be offered and not
// required, and a buyer who never made one still has to be able to press this.
// The same shape as ticket 06's Stripe-session-id grant and ticket 17's invoice
// token — and it is deliberately **not** the invoice token, which goes to
// bookkeepers.
//
// ⚠️ **Art. 11a lid 2, read on 2026-08-27 from the directive that inserted it
// (Directive (EU) 2023/2673 art. 1(3)), because research 37 §3.5 had quoted only
// lid 1, 4 and 5.** It is the paragraph that says what the statement collects:
//
//   > That online withdrawal statement shall enable the consumer to easily
//   > provide **or confirm** the following information: (a) his or her name;
//   > (b) details identifying the contract from which he or she wishes to
//   > withdraw; (c) details of the electronic means by which the confirmation of
//   > the withdrawal will be sent to the consumer.
//
// *Or confirm* is what saves the design ticket 43 assumed: the token names the
// order, so all three are shown filled in and the consumer confirms them. Two of
// them stay **editable** all the same — the name and the address — because
// "provide or confirm" is not "read", and the address in (c) is the one the
// confirmation is actually sent to.

import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import {
  internalQuery,
  mutation,
  query,
  type QueryCtx,
} from "./_generated/server";
import { requireAdmin } from "./auth";
import { release } from "./art";
import { withdrawBannerDay } from "./admin";
import {
  contractLine,
  DECLARATION_TEXT,
  periodEnds,
  REFUND_MS,
} from "./lib/withdrawal";

async function orderByToken(ctx: QueryCtx, token: string) {
  if (!/^[0-9a-f]{32}$/.test(token)) return null;
  return await ctx.db
    .query("orders")
    .withIndex("by_withdrawal_token", (q) => q.eq("withdrawalToken", token))
    .unique();
}

// ---------------------------------------------------------------------------
// The page.

/**
 * What `/withdraw/<token>` shows, in one read.
 *
 * ⚠️ **`null` is a 404 and not an explanation.** An unknown token, and a
 * business order — which has no token at all — are the same answer, because
 * art. 6:230oa lid 1 reaches a consumer contract and there is nothing to explain
 * to somebody who is not in one.
 *
 * `expired` is deliberately **not** a 404. The 14 days have run, or the banner
 * day has passed, and a page that says so with an address on it is honest where
 * a 404 is not.
 *
 * `done` is the second visit. Art. 11a has no third step: once the declaration
 * is in, showing the button again would invite a consumer to make it twice and
 * wonder which one counted.
 */
export const byToken = query({
  args: { token: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      state: v.union(v.literal("live"), v.literal("expired"), v.literal("done")),
      kind: v.union(v.literal("squares"), v.literal("banner")),
      /** Art. 11a lid 2 sub b. */
      what: v.string(),
      /** Sub a, prefilled and editable. */
      name: v.string(),
      /** Sub c, prefilled and editable: where the confirmation is sent. */
      email: v.string(),
      /** When the right dies. Absolute UTC ms; the page says the day. */
      endsAt: v.number(),
      /** The words the button confirms. */
      text: v.string(),
      /** Set on `done`: when the declaration was made. */
      declaredAt: v.union(v.number(), v.null()),
    }),
  ),
  handler: async (ctx, { token }) => {
    const order = await orderByToken(ctx, token);
    if (!order || order.refundedAt) return null;

    const existing = await ctx.db
      .query("withdrawals")
      .withIndex("by_order", (q) => q.eq("orderId", order._id))
      .unique();
    const owner = await ctx.db.get(order.ownerId);
    const endsAt = periodEnds(order);

    return {
      state: existing
        ? ("done" as const)
        : Date.now() < endsAt
          ? ("live" as const)
          : ("expired" as const),
      kind: order.kind,
      what: contractLine(order),
      // ⚠️ `orders.name` and never `owners.name`: the first is the party to the
      // contract as they gave it at checkout, the second is the *company* name
      // shown in a public tooltip and may be empty or somebody's brand.
      name: existing?.name ?? order.name,
      email: existing?.email ?? owner?.email ?? "",
      endsAt,
      text: DECLARATION_TEXT,
      declaredAt: existing?.declaredAt ?? null,
    };
  },
});

/**
 * The confirmation function of art. 11a lid 3 — *confirm withdrawal*.
 *
 * One press does all of it, in one transaction: the row, the banner coming down,
 * and the two messages booked. ⚠️ Scheduled rather than sent, for the reason
 * every other mail on this site is: a mutation may not reach the network, and a
 * Resend outage must never undo a declaration a consumer has already made.
 *
 * ⚠️ **The declaration is the moment that counts, not this press being read.**
 * Art. 6:230s lid 4 prices a banner refund from the moment the message was
 * *sent* and art. 6:230r lid 1 starts the 14-day refund clock there, so
 * `declaredAt` is stamped here and nothing downstream may re-date it.
 */
export const declare = mutation({
  args: {
    token: v.string(),
    /** Art. 11a lid 2 sub a, as confirmed or corrected. */
    name: v.string(),
    /** Sub c, as confirmed or corrected. The confirmation goes here. */
    email: v.string(),
    /** Their own line, if they wrote one. Optional: no reason is owed. */
    note: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const order = await orderByToken(ctx, args.token);
    if (!order || order.refundedAt)
      throw new ConvexError("There is nothing to withdraw from here.");

    // ⚠️ Idempotent rather than an error. A double press, or a reload of the
    // form, must not read as a refusal to somebody who has already declared.
    const existing = await ctx.db
      .query("withdrawals")
      .withIndex("by_order", (q) => q.eq("orderId", order._id))
      .unique();
    if (existing) return null;

    const now = Date.now();
    if (now >= periodEnds(order))
      throw new ConvexError(
        "The time to withdraw from this has run out. Write to hello@200squares.com.",
      );

    const owner = await ctx.db.get(order.ownerId);
    const name = args.name.trim().slice(0, 200) || order.name;
    // The address on file is the fallback, never a blank: lid 4 owes a
    // confirmation and a declaration with nowhere to send it is not receivable.
    const email = args.email.trim().slice(0, 200) || owner?.email || "";
    if (!email) throw new ConvexError("An address for the confirmation is needed.");
    const note = args.note.trim().slice(0, 1000);

    const withdrawalId = await ctx.db.insert("withdrawals", {
      orderId: order._id,
      kind: order.kind,
      declaredAt: now,
      name,
      what: contractLine(order),
      email,
      shownText: DECLARATION_TEXT,
      note: note || undefined,
    });

    // ⚠️ A banner comes down at this instant, and it costs nothing to do so:
    // art. 6:230s lid 4 already prices the refund from the declaration, so
    // waiting only serves an advertisement the consumer has withdrawn from.
    // Ticket 32's effect, without its guard — see `convex/admin.ts`.
    if (order.kind === "banner" && order.bannerDate) {
      await withdrawBannerDay(
        ctx,
        order.bannerDate,
        `Withdrawn by the consumer through /withdraw at ${new Date(now).toISOString()}.${
          note ? ` They wrote: ${note}` : ""
        }`,
      );
    }

    // ⚠️ **A square does not move** (ADR 0003). The dev judges the refund and
    // pays it by hand, and `settle` below is what then takes the block off the
    // board so ticket 27's sold-out count reads true again.

    await ctx.scheduler.runAfter(0, internal.mail.withdrawalDeclared, {
      withdrawalId,
    });
    return null;
  },
});

// ---------------------------------------------------------------------------
// What the two messages say, gathered in one read.

export const forMail = internalQuery({
  args: { withdrawalId: v.id("withdrawals") },
  returns: v.union(
    v.null(),
    v.object({
      email: v.string(),
      name: v.string(),
      what: v.string(),
      shownText: v.string(),
      note: v.string(),
      declaredAt: v.number(),
      kind: v.union(v.literal("squares"), v.literal("banner")),
      totalCents: v.number(),
    }),
  ),
  handler: async (ctx, { withdrawalId }) => {
    const row = await ctx.db.get(withdrawalId);
    if (!row) return null;
    const order = await ctx.db.get(row.orderId);
    return {
      email: row.email,
      name: row.name,
      what: row.what,
      shownText: row.shownText,
      note: row.note ?? "",
      declaredAt: row.declaredAt,
      kind: row.kind,
      totalCents: order?.totalCents ?? 0,
    };
  },
});

// ---------------------------------------------------------------------------
// The admin's half: who is still owed money, and the press that finishes it.

/**
 * Declarations not yet refunded, oldest first.
 *
 * ⚠️ **It is an alarm and not a record**, the same shape as ticket 36's
 * un-purged list. Art. 6:230r lid 1 starts a 14-day clock on every declaration,
 * a mail can be lost, and a list of what is still owed is the only thing that
 * stops one being missed. `daysLeft` goes negative on purpose: a clock that
 * stops at nought hides the case that matters.
 */
export const owed = query({
  args: {},
  returns: v.array(
    v.object({
      id: v.id("withdrawals"),
      kind: v.union(v.literal("squares"), v.literal("banner")),
      what: v.string(),
      name: v.string(),
      email: v.string(),
      note: v.string(),
      declaredAt: v.number(),
      totalCents: v.number(),
      /** Days left on the art. 6:230r lid 1 refund clock. May be negative. */
      daysLeft: v.number(),
      /** Whether a block is still on the board waiting to be taken off. */
      hasBlock: v.boolean(),
    }),
  ),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const now = Date.now();
    const rows = await ctx.db
      .query("withdrawals")
      .withIndex("by_refunded", (q) => q.eq("refundedAt", undefined))
      .collect();
    rows.sort((a, b) => a.declaredAt - b.declaredAt);

    const out = [];
    for (const row of rows) {
      const order = await ctx.db.get(row.orderId);
      const block = order
        ? (
            await ctx.db
              .query("blocks")
              .withIndex("by_owner", (q) => q.eq("ownerId", order.ownerId))
              .collect()
          ).find((b) => b.orderId === order._id)
        : undefined;
      out.push({
        id: row._id,
        kind: row.kind,
        what: row.what,
        name: row.name,
        email: row.email,
        note: row.note ?? "",
        declaredAt: row.declaredAt,
        totalCents: order?.totalCents ?? 0,
        daysLeft: Math.ceil((row.declaredAt + REFUND_MS - now) / (24 * 60 * 60 * 1000)),
        hasBlock: Boolean(block),
      });
    }
    return out;
  },
});

/**
 * The refund is paid: stamp it, and give the rectangle back to the board.
 *
 * ⚠️ **The block is deleted rather than emptied**, and ticket 42 refused every
 * other shape: a block that stays owned and empty after a full refund is the one
 * thing nobody could defend, and ticket 27's sold-out count would go on counting
 * a square nobody has bought.
 *
 * ⚠️ It is the dev who decides there was a refund. Nothing here talks to Stripe
 * (ADR 0003) — the amount is a judgement, and pressing this is the dev saying
 * they have already made it.
 *
 * The artwork goes with the block. `release` deletes the files nothing else
 * points at and books the edge purge, exactly as a strip does — a picture whose
 * square no longer exists must stop answering at `/art/<id>` like any other.
 */
export const settle = mutation({
  args: { withdrawalId: v.id("withdrawals") },
  returns: v.null(),
  handler: async (ctx, { withdrawalId }) => {
    await requireAdmin(ctx);
    const row = await ctx.db.get(withdrawalId);
    if (!row) throw new ConvexError("There is no such declaration.");
    if (row.refundedAt) return null;

    const order = await ctx.db.get(row.orderId);
    if (order && row.kind === "squares") {
      const block = (
        await ctx.db
          .query("blocks")
          .withIndex("by_owner", (q) => q.eq("ownerId", order.ownerId))
          .collect()
      ).find((b) => b.orderId === order._id);
      if (block) {
        const old = block.artwork;
        await ctx.db.delete(block._id);
        // After the delete: `release` asks what is still pointed at, and the row
        // it is asking about has to have gone first.
        await release(ctx, old);
      }
    }
    // ⚠️ The banner needs nothing here. It came down at the declaration, which
    // is what art. 6:230s lid 4 already charged the consumer for.

    await ctx.db.patch(withdrawalId, { refundedAt: Date.now() });
    return null;
  },
});
