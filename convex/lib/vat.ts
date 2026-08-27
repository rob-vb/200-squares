// The VAT arithmetic, on the server that writes the order.
//
// ⚠️ It is a copy of one line from `src/lib/checkout/vat.ts`, for the same reason
// `convex/lib/board.ts` copies the geometry: a Convex function may not import
// from the Next.js app. If one changes, both change.
//
// Only the arithmetic is here. *Which* case a buyer is in was decided before the
// Checkout Session existed — it is what VIES and the panel settled — and it
// travels to the webhook in the session metadata. What the webhook will not take
// on trust is the money: it recomputes the VAT against the amount Stripe
// actually captured, so the invoice can never disagree with the card statement.

/** The VAT inside a VAT-inclusive total. `bps` is basis points: 2100 is 21.00%. */
export const vatInsideCents = (totalCents: number, bps: number) =>
  bps === 0 ? 0 : Math.round((totalCents * bps) / (10000 + bps));
