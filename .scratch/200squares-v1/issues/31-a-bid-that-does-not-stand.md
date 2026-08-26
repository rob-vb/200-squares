# 31 — A bid that does not stand

Type: grilling
Status: open
Blocked by: —
Parent: ../map.md

## Question

[Ticket 30](30-auction-tension.md) asked for tension in the bidding and the dev settled that
**only the winner pays**. That leaves one thing unsettled underneath it, and it is not a
design question: **what happens when a standing bid stops standing.**

The dev's words: *"het moet niet zo zijn dat iemand biedt en vervolgens vlak voor de teller
zijn bod intrekt als die aan het winnen is."*

The site has three different answers to that today, on three different surfaces, and they do
not agree.

### 1. The build says it cannot happen

Nothing in `src/` or `convex/` cancels a bidder's own bid. There is no withdraw button, no
API route, no mutation. `withdrawalWaived` is the Art. 6(1)(h) consumer field, not an exit.

### 2. The card says it can

A bid is a `capture_method: manual` PaymentIntent. A bidder who wants out does not need the
site: cancel the card, or let the issuer drop the authorization. The site learns at 00:00 UTC,
when the capture is declined.

⚠️ **The close already survives it.** [Ticket 19](19-build-auction.md) built the answer —
capture the top bid first, promote the next bid and capture it for its own amount, and if
every one fails the house ad takes the day and every hold is cancelled. So the day is never
lost. **What is missing is a consequence for the bidder who caused it.**

[Ticket 11](11-house-rules.md)'s strike counter on the `owners` row is the existing shape for
that, and `convex/admin.ts` already reasons in exactly these words about a removed banner:

> The bid is not returned. `/terms` says so, and ticket 11 held it: this is the bidder
> breaking the contract rather than withdrawing from it.

A dead hold is the same act with nothing attached to it. Decide whether it earns a strike,
and — because the strike is on `owners` — whether it can be attached at all to a bidder who
was never charged.

### 3. ⚠️ The copy says it is allowed, and says it twice, differently

This is the part the dev brought to the ticket, and it is the sharpest of the three.

**In the bid panel** (`src/lib/checkout/consent.ts`), a consumer cannot bid without ticking:

> I ask 200 Squares to start my banner day at 00:00 UTC, before the 14 days are up. I
> understand that I lose my right to cancel once the day has been fully delivered.

and under it, as Art. 6(1)(h) information:

> You have 14 days to cancel, counted from the day you win. To cancel, email
> hello@200squares.com and say so — a plain sentence is enough. If your banner day has already
> started, you pay for the part of it that has run.

**In `/terms`**, the same event:

> A bid is binding while it stands. The highest bid at 00:00 UTC wins and is charged; every
> other bid is not.

The consent file is right about the law and it knows why — its own comment records that a
square can never be *fully performed*, so the box there buys only information, while **a
banner day can** be fully performed because it ends at 00:00 UTC. That reasoning holds. The
problems are elsewhere:

- ⚠️ **"A bid is binding while it stands"** does not say a bid must keep standing. Read
  plainly it grants the withdrawal the dev is trying to prevent. If a bid is irrevocable,
  `/terms` has to say *a bid cannot be withdrawn*, in those words.
- ⚠️ **`/terms` never mentions the 14 days or the pro-rata at all.** The bid panel gives a
  consumer a cancellation right that the terms page does not carry. Two surfaces, two stories,
  and the more generous one wins.
- ⚠️ **"Counted from the day you win" is the wrong start date, and it is generous in the
  wrong direction.** A withdrawal period for a service runs from the conclusion of the
  contract. If the contract is concluded when the **bid is placed**, the clock starts hours
  earlier — during the day the bid stands — and a consumer may cancel then, before any
  performance at all, for **nothing**. That is the dev's exact fear, protected by law and
  invited by the site's own text. If the contract is concluded only at the **close**, the
  wording is right. ⚠️ **Which one it is has never been decided**, and everything else here
  depends on it.
- ⚠️ **The pro-rata is not built.** *"You pay for the part of it that has run"* has no code.
  There is no partial refund anywhere in the repo — `refundedAt` and `mail:refunded` exist
  only for a full refund on the squares-already-sold collision. [Ticket 07](07-auction-holds.md)
  put mid-day pro-rata withdrawal in `/terms` and left it unbuilt on purpose, and ticket 19
  repeated *"Not this ticket."* It is still nobody's.
- **The mechanism is an inbox.** Cancelling is an email to `hello@200squares.com`. That is
  honest and it is legal, but it means every cancellation is the dev doing arithmetic by hand
  against a Stripe dashboard, on a day that has already partly run.

### The questions

- **Is a bid irrevocable, or is it not?** Answer this first; the rest follows. A consumer's
  statutory right cannot be written away, so the honest answers are: irrevocable for
  businesses and cancellable for consumers, or **business bidders only**, or cancellable for
  everybody with the consequence priced in.
- **When is the contract concluded — at the bid, or at the close?** This sets the start of the
  14 days and decides whether a consumer can walk away for free while their bid is winning.
- **What does a cancelled winning bid do to the day?** The close is over, the capture
  succeeded, the banner is up. Does the day fall to the next bidder who was already released,
  to the house ad, or does it stay up and only the money moves?
- **Does a dead hold earn a strike?** And can a strike land on somebody who never paid?
- **Is the pro-rata built or removed?** If it is built, something must compute hours run
  against a bid and issue a partial refund. If it stays an inbox, `/terms` and the panel must
  both say so in the same words.
- **What does `/terms` need to say?** Right now it is the thinner of the two documents on the
  one point where thinner means more generous.

## Context

- Opened 2026-08-26 out of [ticket 30](30-auction-tension.md), at the dev's request, with the
  bid panel's consent block in hand.
- ⚠️ `/terms` already promises something ticket 30 wants: *"the day stays in the public record
  with the winning bid on it."* A public record of winning bids is committed to; a list of
  **losing** bids is not.
- Nothing is claimed and nothing is built.
