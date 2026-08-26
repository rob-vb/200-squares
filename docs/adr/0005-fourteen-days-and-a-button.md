# A square's withdrawal right runs 14 days and then ends, and the site gives it a button

A consumer buying a square has 14 days, counted from the day of purchase. The site makes
**no claim** that a square is ever fully performed, and it does not need one. It obeys
art. 6:230oa BW by putting a withdrawal function on the interface.

Decided in
[ticket 42](../../.scratch/200squares-v1/issues/42-the-withdrawal-function.md).

## Context

[Research 03](../../.scratch/200squares-v1/research/03-vat-invoices-withdrawal.md) §5.5 left
one question open and flagged it as an inference rather than a source: **is a permanent
service ever "fully performed"?** A square is sold "for as long as this site runs". If such a
contract is never fully performed, art. 6:230p sub d never fires, and a consumer's right of
withdrawal never dies. On a full board that is a permanent near-full-refund right on every
consumer square — and it sits under a site whose every page says a square is final.

[Research 37](../../.scratch/200squares-v1/research/37-when-a-bid-binds.md) §3.5 then found
something the map had not charted at all. **Art. 6:230oa BW, in force since 19 June 2026**,
requires a trader selling through an online interface to offer a *clearly visible and easily
accessible function* for withdrawing. `/terms` and the bid panel both said *email us*, which
[ticket 31](../../.scratch/200squares-v1/issues/31-a-bid-that-does-not-stand.md) called honest
and legal and which is now honest and **insufficient**.

The two arrived together and read as one problem. They are not.

⚠️ **The button does not set the right's length.** The law does. Building the function
lengthens nothing and shortens nothing. What the function decides is whether the site obeys
art. 6:230oa — and, through art. 6:230m lid 1 sub h, whether the withdrawal period stays at
14 days or is extended by up to **twelve months** under art. 6:230o lid 2. That tail is the
same mechanism research 03 §5.6 called the largest number in that document. ACM names fines
alongside it.

So the real question was never *how long does the right last*. It was **what does the site
assert**, and the function follows from the assertion.

Three positions were available.

- **The right never dies**, following research 03 §5.5 straight through. Safest in law.
  It puts a permanent refund right on every square, contradicts every page, and asks for a
  button that is there for ever.
- **The right dies when the square goes live** — an assertion of full performance at the
  moment the artwork and the link are on the board. It matches the story the site tells. It
  rests on exactly the inference research 03 §8 flagged as unproven, and if it is wrong the
  twelve-month tail opens on every consumer sale already made.
- **The ordinary 14 days, with no claim of full performance at all.**

## Decision

**14 days from the day of purchase, and no full-performance claim for a square.**

The ordinary period under art. 6:230o lid 1 runs, and it ends. Because the art. 6:230m lid 1
sub h information is then given in full — the right, the model form, and the existence and
placement of the function — **the twelve-month tail cannot open**. The exposure that the
"never dies" position removes is already closed by the information duty, so that position
buys nothing and costs the product.

The site therefore asserts nothing about full performance for a square. The tick box in
`src/lib/checkout/consent.ts` keeps its express request to begin at once — art. 6:230s lid 4
needs it to charge *pro rata* at all — and **loses** its second sentence, *"I understand that
I lose my right to cancel once the square has been fully delivered."*

**The banner is unchanged.** Research 37 §3.1 confirmed research 03's finding: a banner day
ends, so it can be fully performed, so art. 6:230p sub d works. The right is born at the close
and dies at 00:00 UTC the next day.

**The function is built**, at `/withdraw/<token>`, on its own token, for consumer orders only,
reached from `/thanks` and from My squares. The pre-close revocation of a bid
(art. 6:230q lid 1) stays an email: art. 6:230oa reaches concluded contracts only, and a
one-press revoke on a live bid is precisely what
[ADR 0003](0003-a-bid-is-an-irrevocable-offer.md) was written to prevent.

## Consequences

**The exposure on a square is 14 days and one refund**, and it is knowable. It is not a
standing position on the whole board.

**Every consumer order carries its assertion.** `withdrawalText` freezes the words at the
moment of sale, so orders written under the old sentence keep the old sentence and orders
written after keep the new one. That is why this is an ADR: the position cannot be revisited
for orders already written.

**A refunded square goes back on the market.** A new mutation deletes the block, so ticket
27's sold-out count reads true. A block that stays owned and empty after a full refund is the
one shape nobody could defend.

**A seventh mail.** Art. 6:230oa lid 4 requires a confirmation without delay, on a durable
medium, stating the content of the declaration and the date and time it was made.
[Ticket 13](../../.scratch/200squares-v1/issues/13-email.md) fixed the list at six.
[Ticket 32](../../.scratch/200squares-v1/issues/32-build-withdrawn-banner-day.md) chose *no
mail* on the ground that "the dev is already in the thread" — a button has no thread, so that
ground is gone.

**The refund stays manual**, as ADR 0003 said, but now under a clock: art. 6:230r lid 1 gives
14 days from the declaration. `/admin` therefore lists what is not yet refunded.

⚠️ **The §5.5 question is chosen, not resolved.** This ADR takes the cheaper of two defensible
readings. Research 37 §6 item 1 calls the scope of the art. 6:230oa obligation *"the one item
worth paying for on its own"*. Have both confirmed before launch;
[ticket 25](../../.scratch/200squares-v1/issues/25-launch.md) carries it. If the reading does
not hold, the fallback is the "never dies" position: the same button, available without an end
date, and `/terms` more generous than intended. The site still works.

Sources, each with the date it was read:
[`research/03-vat-invoices-withdrawal.md`](../../.scratch/200squares-v1/research/03-vat-invoices-withdrawal.md)
and
[`research/37-when-a-bid-binds.md`](../../.scratch/200squares-v1/research/37-when-a-bid-binds.md).
