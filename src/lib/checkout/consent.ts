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

// ---------------------------------------------------------------------------
// The banner. ⚠️ A different box, and this one actually works.
//
// Ticket 03 found a square can never be *fully performed* — it is permanent, so
// Art. 16(1)(a) can never be reached and the box above buys only the Art. 6(1)(h)
// information. A **banner day can** be fully performed: it ends at 00:00 UTC. So
// this box takes express consent to begin at once and acknowledges that the
// right is lost on full performance, and the right really does end when the day
// does (ticket 07).

/** The tick. A consumer cannot bid without it. */
export const BANNER_WITHDRAWAL_TEXT =
  "I ask 200 Squares to start my banner day at 00:00 UTC, before the 14 days are up. " +
  "I understand that I lose my right to cancel once the day has been fully delivered.";

/** The Art. 6(1)(h) information, under the box. Not a tick — a statement. */
export const BANNER_WITHDRAWAL_INFO =
  "You have 14 days to cancel, counted from the day you win. " +
  "To cancel, email hello@200squares.com and say so — a plain sentence is enough. " +
  "If your banner day has already started, you pay for the part of it that has run.";

/**
 * ⚠️ What the bid button says. Under *Fuhrmann-2* only these words count, and a
 * bid is an obligation with a condition on it — so the condition is on the
 * button, mirroring ticket 06's *Order now — obliges you to pay*.
 */
export const BID_BUTTON = "PLACE BID — OBLIGES YOU TO PAY IF YOU WIN";

/**
 * The three sentences beside the box, and every one of them is literally true.
 *
 * ⚠️ The middle one is **not** ticket 07's wording. It said an outbid hold "is
 * released at once", which was that ticket's own inherited contradiction: a
 * runner-up with no hold cannot be promoted, and the third sentence promises
 * exactly that promotion. The dev settled it on 2026-08-25 in favour of the
 * ladder, so the hold stays until the close and the sentence says so. A promise
 * on this box has to survive being read at 23:59.
 */
export const BID_TRUTHS = [
  "A bid places a hold on your card. No money is taken unless you win.",
  "If you win, the hold is collected at 00:00 UTC. If you do not, it is released at the close, and your bank may take some days to show it.",
  "If the top bid cannot be collected, the banner goes to the next bid that can.",
];
