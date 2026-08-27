// The withdrawal right as arithmetic and words: how long it lasts, where the
// function lives, and what the consumer confirms.
//
// ⚠️ **A leaf, and that is why it exists.** `convex/withdrawal.ts` holds the
// queries and mutations and has to reach `convex/admin.ts` for ticket 32's
// take-down effect; `convex/owners.ts` and `convex/mail.ts` need only the
// address and the period. Putting those here keeps `owners → withdrawal → admin
// → owners` from ever being a circle.
//
// [Ticket 42](../../.scratch/200squares-v1/issues/42-the-withdrawal-function.md)
// and [ADR 0005](../../docs/adr/0005-fourteen-days-and-a-button.md) decided
// every number in this file.

import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { squareRange } from "./board";
import { midnightOf, nextDate } from "./time";

/**
 * Where the function lives.
 *
 * ⚠️ **On the interface, because a mail is not one.** Art. 6:230oa lid 1 asks
 * for a function *displayed on the online interface*; the link in the
 * order-confirmed mail is the art. 6:230m lid 1 sub h *information* about it,
 * which is a different duty and is satisfied by naming where the button is.
 */
export const withdrawUrl = (token: string) =>
  `${process.env.SITE_URL ?? "https://200squares.com"}/withdraw/${token}`;

/**
 * Fourteen days on a square, and the site asserts nothing about full performance.
 *
 * ⚠️ [ADR 0005](../../docs/adr/0005-fourteen-days-and-a-button.md): the cheaper
 * of two defensible readings of research 03 §5.5, chosen rather than resolved,
 * and frozen onto every consumer order at the moment of sale.
 */
export const WITHDRAWAL_MS = 14 * 24 * 60 * 60 * 1000;

/** The refund clock art. 6:230r lid 1 starts on the declaration. */
export const REFUND_MS = 14 * 24 * 60 * 60 * 1000;

/**
 * When the right dies, in absolute UTC ms.
 *
 * ⚠️ Two rules and not one, and the banner's is the short one: it is born at the
 * close — 00:00 UTC of its own date — and art. 6:230p sub d kills it when the
 * day is fully performed, which is the next 00:00 UTC. A square gets the
 * ordinary period, counted from the day of purchase.
 */
export function periodEnds(order: Doc<"orders">): number {
  return order.kind === "banner"
    ? midnightOf(nextDate(order.bannerDate ?? ""))
    : order.createdAt + WITHDRAWAL_MS;
}

/**
 * The line that identifies the contract — art. 11a lid 2 sub b.
 *
 * What was bought, when it was paid for, and what it cost. A consumer looking at
 * the page has to be able to tell it is the right purchase without opening
 * anything else.
 */
export function contractLine(order: Doc<"orders">): string {
  const what =
    order.kind === "banner"
      ? `The banner on ${order.bannerDate ?? ""}`
      : order.rect
        ? `Square ${squareRange(order.rect)}`
        : "A square";
  const day = new Date(order.createdAt).toISOString().slice(0, 10);
  const paid = `$${(order.totalCents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
  return `${what}, bought on ${day} for ${paid}`;
}

/**
 * The exact words above the button, kept with the declaration.
 *
 * ⚠️ Words and not a version number, the same rule ticket 06 set for the tick
 * boxes: art. 11a lid 4 asks the confirmation to state *the content of the
 * declaration*, and in 2036 that has to be readable without the code of the day.
 *
 * ⚠️ *I do not have to give a reason* is not decoration. Art. 6:230o lid 1 gives
 * the right **zonder opgaaf van redenen**, and the optional line beside it would
 * otherwise read as a field somebody has to fill in.
 */
export const DECLARATION_TEXT =
  "I withdraw from this contract. I do not have to give a reason.";

/**
 * The address to put under an order row, or an empty string for *no link here*.
 *
 * ⚠️ **The entry point appears only while the function is live**, which is what
 * art. 6:230oa lid 5 asks for and no more: *gedurende deze termijn te allen
 * tijde beschikbaar*. After the period, and after a declaration has been made,
 * the page itself still answers — with the expired or the done state, which is
 * honest — but the site stops offering a door that leads nowhere.
 *
 * Empty in four cases: a business order, an order refunded for the ticket 05
 * race, a period that has run, and an order already withdrawn from.
 */
export async function liveWithdrawUrl(
  ctx: QueryCtx,
  order: Doc<"orders">,
): Promise<string> {
  if (!order.withdrawalToken || order.refundedAt) return "";
  if (Date.now() >= periodEnds(order)) return "";
  const declared = await ctx.db
    .query("withdrawals")
    .withIndex("by_order", (q) => q.eq("orderId", order._id))
    .unique();
  if (declared) return "";
  return withdrawUrl(order.withdrawalToken);
}
