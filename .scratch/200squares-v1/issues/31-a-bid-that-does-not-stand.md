# 31 — A bid that does not stand

Type: grilling
Status: resolved
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

## Answer

**A bid cannot be withdrawn, because there is nothing to withdraw from until the auction
closes.** The contract is concluded at the close, not at the bid. Everything else on this
ticket follows from that one sentence, and most of it costs nothing to build.

### 1. The contract is concluded at the close

A bid is an **offer**. The close at 00:00 UTC is the acceptance. Before the close there is no
contract, so there is no withdrawal period to run and nothing for a consumer to walk away
from — which is the dev's exact fear, gone, at the price of one sentence in `/terms`.

And the offer itself is **irrevocable**: an offer that names a term for acceptance cannot be
revoked (6:219 lid 1 BW), and this auction names one — 00:00 UTC, fixed, published, no
extension window. That ground works against a consumer as well as a business, because it is
about the offer stage and not about the withdrawal right.

⚠️ **The 6:219 reasoning is this ticket's, not a read source.** Ticket 03's research covered
the withdrawal right and the auction exemption; it never had to ask when an auction contract
is concluded. The sentence *a bid cannot be withdrawn* is load-bearing, so it is worth an
hour of checking before launch. It is on the map as fog, not as a blocker: the fallback if it
does not hold is the same 24-hour pro-rata window described below, moved earlier in the day.

### 2. The consumer's 14 days survive, and they are 24 hours long

They cannot be tick-boxed away. ⚠️ **The dev asked for outbid.lol's checkbox** — *"bids are
non-refundable"* — and it does not work here, for three reasons:

- **outbid.lol is American.** The CRD does not reach it. Their box has nothing to remove.
- **Their box describes a model this site dropped.** Every bidder pays immediately there and
  nobody is refunded. [Ticket 30](30-auction-tension.md) settled that **only the winner pays**,
  so *"bids are non-refundable"* has almost no content here: a loser is never charged.
- **This site's box already does the maximum.** `BANNER_WITHDRAWAL_TEXT` is the Art. 16(1)(a)
  wording. Full performance is a fact about the world, which is ticket 03's finding, and no
  tick changes a fact.

What survives is small. The right is born at the close and dies at full performance, which is
the end of the same banner day. **It lives 24 hours.** It belongs to consumers only. And it is
**pro rata**: withdraw at 12:00 and you pay half. The exposure is the un-run hours of one bid,
once, on one day.

⚠️ **The dev also proposed dropping the auction** — claim the banner block directly, *"dan heb
je direct volledige levering"* — and it does not work either. A day claimed at a fixed price is
still a day: full performance still lands at 00:00 UTC and the 24 hours are unchanged. Selling
the banner **permanently** is worse: ticket 03 found a perpetual service is never fully
performed, so the right would live the full 14 days with a pro-rata offset of *"close to
nothing"*. **The banner day is the safest thing on this site precisely because it ends.**
The auction stays.

### 3. Everyone may bid

Business-only was the one lever that removes the 14 days completely, and it was declined.
The risk it buys off is 24 hours long, pro rata, and one bid in size; the price is bidders,
and fewer bidders is a lower price every day. `buyerType` is already collected in the bid
panel and already rides in the Stripe session metadata, so the lever stays available if the
judgement ever changes.

### 4. A withdrawn winning day falls to the house ad, and the money goes by hand

Withdrawal stops the service, so the banner comes off and the house ad takes the rest of the
day. It cannot fall to the runner-up: ticket 07 releases every other hold the moment the top
capture succeeds, so by then there is nobody left to promote.

The refund is **not built**. The dev computes the hours and refunds in the Stripe dashboard,
as tickets 07 and 19 both intended. Two findings make that safe:

- ⚠️ **The money is fixed at the mail, not at the takedown.** Art. 14(3) CRD: the consumer pays
  in proportion to what was supplied *"until the time the consumer has informed the trader"*.
  So a dev who reads the mail eight hours late has given away eight hours of banner and has
  **not** shortened anybody's refund. The inbox delay costs the house, not the bidder — which
  is why no self-service cancel button was built. ⚠️ Art. 13(1) still applies: refund within
  **14 days** of the message.
- ⚠️ **`removeBanner` cannot be reused.** `convex/admin.ts:226` does take a banner day off for
  the rest of its day, but it also counts a **strike**, sends the **removal mail** (*you broke
  rule X*) and writes a `removals` row with a rule that does not exist. Withdrawal is not a
  rule break — the file says so itself. A separate, smaller mutation is needed.

### 5. A dead hold earns nothing, for now

*"Laten we afwachten of dit echt gaat gebeuren."* The ladder already protects the day, and the
attack costs the bidder a real hold on a real card and wins them nothing.

⚠️ **This ticket's own premise was wrong and it is worth recording.** It said a strike could
not be attached because the bidder was never charged. `convex/auction.ts:407` makes an `owners`
row the moment the hold lands — *"an owner exists the moment money is on the line"* — so the
row is there and a strike would land fine. What is missing is not the row, it is the
**target**: ticket 11's third strike freezes a *block*, and a bidder has none. Whoever revisits
this starts from that, not from the ticket's question.

### 6. The words

`/terms`, the daily banner paragraph, four sentences instead of three:

> A bid cannot be withdrawn. Bidding closes at 00:00 UTC and every bid stands until it does.
>
> The banner goes to the highest bid that **can be collected** at 00:00 UTC. If the top bid
> cannot be collected, the next one takes the day. Every other bid is released.
>
> The winner holds the banner from 00:00 to 00:00 UTC, and the day stays in the public record
> with the winning bid on it.
>
> If you bid as a private person, you have 14 days to cancel, counted from the close. A banner
> day is fully delivered at 00:00 UTC, so the right ends there. To cancel, email
> `hello@200squares.com`. Your banner comes down as soon as we have read your message, and you
> pay for the hours that had run when you sent it.

Sentence one is the whole decision. Sentence two also settles ticket 19's debt — *"the highest
bid at 00:00 UTC wins and is charged"* is false in the case the ladder exists for, and it is
the same paragraph. ⚠️ Sentence three stays and is **still untrue**: ticket 30 left a promise of
a public record that nobody has built. That debt is not this ticket's.

`src/lib/checkout/consent.ts`, two changes:

- A **fourth line on `BID_TRUTHS`**, above the button: *"A bid cannot be withdrawn."*
- **`BANNER_WITHDRAWAL_INFO` is sharpened.** *"If your banner day has already started"* is a
  condition that is never false — the close and the start of the day are the same instant. It
  becomes: *"Your banner comes down as soon as we have read your message, and you pay for the
  hours that had run when you sent it."*
- **`BANNER_WITHDRAWAL_TEXT` does not change.** The tick is already correct.

### What this hands on

- [Ticket 32 — Build: a withdrawn banner day](32-build-withdrawn-banner-day.md): the mutation
  and these words.
- The 6:219 check, on the map as fog.
- Nothing else. No strike work, no pro-rata engine, no cancel button, no change to the auction.
