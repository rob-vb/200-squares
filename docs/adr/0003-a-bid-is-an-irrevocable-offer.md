# A bid is an irrevocable offer, and the contract is concluded at the close

A bidder cannot take a bid back. The auction's close at 00:00 UTC is the moment the
contract comes into being, not the moment the bid is placed.

Decided in
[ticket 31](../../.scratch/200squares-v1/issues/31-a-bid-that-does-not-stand.md).

## Context

The dev's fear, in their own words: *"het moet niet zo zijn dat iemand biedt en vervolgens
vlak voor de teller zijn bod intrekt als die aan het winnen is."*

The site had three answers to that and they disagreed. The build had no withdraw path at
all. The card had one anyway — a bid is a `capture_method: manual` PaymentIntent, and a
bidder who cancels the card outside the site is out. And the copy said withdrawal was
allowed, twice and differently: the bid panel gave a consumer 14 days with a pro-rata
refund, while `/terms` said only *"a bid is binding while it stands"* and never mentioned
the 14 days at all. Read plainly, *binding while it stands* grants exactly the withdrawal
the dev wanted to prevent, and of the two surfaces the more generous one wins.

Underneath sat a question nobody had asked: **when is the contract concluded?** If it is
concluded when the bid is placed, a consumer's 14-day withdrawal period starts hours before
the close, while the bid is standing and winning — and Art. 14(4)(a) CRD means they walk
away for nothing, because no performance has begun. That is the dev's fear, protected by
law and invited by the site's own text.

[Ticket 03](../../.scratch/200squares-v1/issues/03-vat-invoices-withdrawal.md) had already
closed the escape routes. An online auction is not a *public auction* under Art. 2(13) CRD —
Recital 24 says so outright — so Art. 16(1)(k) offers no shelter. And Art. 16(1)(a) ends the
right only on **full performance**, which is a fact about the world and not something a tick
box can supply.

Two alternatives were considered and rejected. Copying outbid.lol's *"bids are
non-refundable"* checkbox does nothing: that site is American, and its wording describes a
pay-every-bid model this site dropped in
[ticket 30](../../.scratch/200squares-v1/issues/30-auction-tension.md). Replacing the
auction with a direct claim on the banner block does nothing either — a day claimed at a
fixed price is still a day — and selling the banner permanently is worse, because ticket 03
found a perpetual service is never fully performed.

## Decision

**A bid is an offer. The close is the acceptance.** No contract exists before 00:00 UTC, so
there is no withdrawal period to run during the bidding day and nothing for a consumer to
walk away from.

**The offer is irrevocable**, on the ground that an offer naming a term for acceptance
cannot be revoked (6:219 lid 1 BW). This auction names one: 00:00 UTC, fixed, published, no
extension window. That ground binds a consumer as firmly as a business, because it concerns
the offer stage and not the withdrawal right. `/terms` must say *a bid cannot be withdrawn*
in those words.

**Consumers may keep bidding.** Business-only was the one lever that removes the withdrawal
right entirely and it was declined: the residual risk is 24 hours long, pro rata, and one
bid in size, while the price would be paid in bidders every single day.

## Consequences

**The residual exposure is 24 hours.** A consumer's right is born at the close and dies at
full performance, which is the end of the same banner day. It is pro rata, so a withdrawal
at 12:00 costs the house half of one bid. That is the whole of it.

**A withdrawn day falls to the house ad, not to the runner-up.** By the close, ticket 07 has
released every other hold, so there is nobody left to promote.

**The refund stays manual.** No pro-rata engine and no self-service cancel button. Art. 14(3)
fixes the amount at the moment the consumer sends the message, not the moment the dev acts,
so a late reply costs the house free banner hours and shortens nobody's refund. Art. 13(1)
still requires payment within 14 days.

⚠️ **The 6:219 ground has not been checked against a source.** Ticket 03's research covered
the withdrawal right and the auction exemption; it never had to ask when an auction contract
is concluded, and this ADR's reasoning is the ticket's own. It is the load-bearing sentence
of the whole arrangement and it is worth an hour before launch. If it does not hold, the
fallback is the same 24-hour pro-rata window moved earlier in the day — the site still works,
it is simply more generous than intended.
