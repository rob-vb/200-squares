// The exact words the buyer was shown, kept as words.
//
// Ticket 06: the order records "the **exact wording** of the tick boxes as text
// (not a version number, so it stays readable without the code of that day)".
// So these constants are shown in the panel, travel with the order, and land in
// the `orders` row verbatim. Changing one changes what new orders record and
// nothing about old ones.
//
// ⚠️ Ticket 03 found that **the waiver as charted does not work**. A square is a
// service, so only Art. 16(1)(a) is available and it needs the service to be
// *fully performed* — which a `pending`, permanent square never is. The box is
// kept for the Art. 6(1)(h) information, not for the waiver, and the wording
// below says only what is true: the buyer asks for an immediate start, and the
// right goes when the thing is fully delivered. Without that information the 14
// days become twelve months and fourteen days, which is the $49,750 that
// actually matters.

/** The tick itself. Unticked by default, and a consumer cannot order without it. */
export const WITHDRAWAL_TEXT =
  "I ask 200 Squares to put my square on the board straight away, before the 14 days are up. " +
  "I understand that I lose my right to cancel once the square has been fully delivered.";

/** The Art. 6(1)(h) information, under the box. Not a tick — a statement. */
export const WITHDRAWAL_INFO =
  "You have 14 days to cancel this purchase, counted from the day you buy it. " +
  "To cancel, email hello@200squares.com and say so — a plain sentence is enough. " +
  "If you asked us to start straight away, you pay for what has already been delivered.";

/**
 * The digital-invoice line. Ticket 03 asked for one line, not a second tick:
 * placing the order is the acceptance, and two required ticks over one screen is
 * a form nobody reads.
 */
export const INVOICE_TEXT =
  "Your invoice is a digital document. We email it to you and keep it at a private link for you. " +
  "There is no paper copy.";

/** What the order button says. ⚠️ Under *Fuhrmann-2* only these words count. */
export const ORDER_BUTTON = "ORDER NOW — OBLIGES YOU TO PAY";
