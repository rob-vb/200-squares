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
// below says only what is true: the buyer asks for an immediate start. Without
// that information the 14 days become twelve months and fourteen days, which is
// the $49,750 that actually matters.
//
// ⚠️ **Ticket 42 rewrote three of these on 2026-08-26, and this file ships with
// its build rather than with ticket 40's sweep.** The reason is that these
// constants are **frozen onto the order** at the moment of sale: a square sold
// tomorrow under words the site no longer honours cannot be corrected by editing
// a page later. What has to change and why:
//
//   `WITHDRAWAL_TEXT` loses its second sentence. Under
//   [ADR 0005](../../../docs/adr/0005-fourteen-days-and-a-button.md) the site
//   makes **no** claim that a square is ever fully performed, so a sentence
//   saying the right goes on full delivery asserts something the site has
//   dropped. The first sentence stays: art. 6:230s lid 4 needs the express
//   request before anything can be charged *pro rata* at all.
//
//   `WITHDRAWAL_INFO` and `BANNER_WITHDRAWAL_INFO` stop sending the buyer to an
//   inbox as the only way out, and name **the button and where it is**. That
//   last part is art. 6:230m lid 1 sub h, and it is the clause the twelve-month
//   tail of art. 6:230o lid 2 hangs on.
//
// `/terms`, `/how-it-works`, `/privacy` and the FAQ are
// [ticket 40](../../../.scratch/200squares-v1/issues/40-copy-true-again.md)'s,
// which writes them once.

/** The tick itself. Unticked by default, and a consumer cannot order without it. */
export const WITHDRAWAL_TEXT =
  "I ask 200 Squares to put my square on the board straight away, before the 14 days are up.";

/**
 * The art. 6:230m lid 1 sub h information, under the box. Not a tick — a
 * statement.
 *
 * ⚠️ **The placement of the function is half the duty.** Sub h asks for *de
 * beschikbaarheid en de plaats* of the art. 6:230oa function, so naming the
 * button without saying where it is leaves the tail open. It is on the
 * thank-you page and in My squares (ticket 43), and this says both.
 */
export const WITHDRAWAL_INFO =
  "You have 14 days to cancel this purchase, counted from the day you buy it. " +
  "To cancel, press *withdraw from contract here* — it is on your thank-you page after payment, " +
  "and under your order in My squares. An email to hello@200squares.com works too. " +
  "You pay for what has already been delivered.";

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
//
// ⚠️ Ticket 31 sharpened the information line. *"If your banner day has already
// started"* was a condition that is never false — the close and the start of the
// day are the same instant — so it said nothing while reading as if it might not
// apply. What replaced it says when the banner comes down and what is paid for,
// and Art. 14(3) prices that from the moment the message was **sent**, not from
// the moment it is read.

/**
 * The tick. A consumer cannot bid without it.
 *
 * ⚠️ **This one keeps its second sentence** where the square's box loses one,
 * and the difference is not an oversight. A banner day really is fully performed
 * — it ends at 00:00 UTC — so art. 6:230p sub d can be reached and the sentence
 * is true. A square is permanent and the site asserts nothing (ADR 0005).
 */
export const BANNER_WITHDRAWAL_TEXT =
  "I ask 200 Squares to start my banner day at 00:00 UTC, before the 14 days are up. " +
  "I understand that I lose my right to cancel once the day has been fully delivered.";

/**
 * The art. 6:230m lid 1 sub h information, under the box. Not a tick — a
 * statement.
 *
 * ⚠️ *"As soon as we have read your message"* is gone, and ticket 42 called that
 * the point of building the button: nobody has to read anything now. The banner
 * comes off the board the instant the function is pressed, and art. 6:230s lid 4
 * prices the refund from that moment either way.
 */
export const BANNER_WITHDRAWAL_INFO =
  "You have 14 days to cancel, counted from the day you win — but a banner day is over at " +
  "00:00 UTC, and the right ends with it. " +
  "To cancel, press *withdraw from contract here* under your order in My squares. " +
  "Your banner comes off the board at once, and you pay for the hours that had run.";

/**
 * ⚠️ What the bid button says. Under *Fuhrmann-2* only these words count, and a
 * bid is an obligation with a condition on it — so the condition is on the
 * button, mirroring ticket 06's *Order now — obliges you to pay*.
 */
export const BID_BUTTON = "PLACE BID — OBLIGES YOU TO PAY IF YOU WIN";

/**
 * The four sentences beside the box, and every one of them is literally true.
 *
 * ⚠️ The second one is **not** ticket 07's wording. It said an outbid hold "is
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
  // ⚠️ Ticket 31: the bid is the offer, the close at 00:00 UTC is the
  // acceptance, and an offer naming a term for acceptance is irrevocable
  // (6:219 lid 1 BW). So there is nothing to withdraw from until the close.
  //
  // ⚠️ **Ticket 42 split it by buyer type, and the flat sentence was the sub h
  // failure in miniature.** Art. 6:230q lid 1 lets a *consumer* take an offer
  // back before the close, which ticket 42 deliberately left as an email rather
  // than a second button — a one-press revoke at 23:59 unwinds the ladder
  // tickets 30 and 31 built, and email friction is lawful. A business bid really
  // cannot be withdrawn. Saying so of both was true for one of them.
  "A business bid cannot be withdrawn. If you are bidding as a private person, you can take a bid back before the close by emailing hello@200squares.com — and after you win, the banner day has its own withdrawal button.",
];
