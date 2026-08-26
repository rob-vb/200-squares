# 30 — The auction as a paid bid, not a card hold

Type: grilling
Status: open
Blocked by: —
Parent: ../map.md

## Question

The dev wants the banner auction to work the way **[outbid.lol](https://outbid.lol)** works,
and gave a reason: *"dan hoeven we ook geen factuur of shit te sturen."*

Read [ticket 07](07-auction-holds.md) and [ticket 19](19-build-auction.md) first. They are
what this would replace, and they were expensive.

### What outbid.lol actually does

Read off the live site on 2026-08-26:

- You submit a URL or handle, **pick any amount, and pay it there and then.** The amount is
  the score. The board is sorted by score, so money is rank.
- **New spots start at $5.** Paying less than the leader still puts you on the board, at
  whatever place that bid can hold. There is no floor to clear except the entry price.
- **Bids are permanent.** Nothing is refunded and nothing is released. The top price only
  ratchets up — the page reads *"Claim #1 for $17005"*, one dollar over the standing
  $17,000.
- An existing listing **tops up the difference** to climb, rather than paying again.
- Ties break in favour of the older entry.
- There is no close, no winner, no loser. There is a leaderboard that never resets, plus a
  *Today* view over the same data.

### What that would replace here

Today the banner is a **daily** slot decided by a **hard close at 00:00 UTC**, on card
authorizations: bidding opens at $100, the minimum raise is $10, the top hold is captured
first, every other hold is cancelled only after that capture succeeds, a declined capture
promotes the next bid, and with nothing standing the house ad takes the day.

Moving to a paid bid deletes real weight, and this is the honest case for the change:

- The 24-hour hold problem goes. Ticket 07 spent itself on whether a card authorization
  survives from just after one close to the next; it does not have to survive anything now.
- The declined capture at the close goes — the one path ticket 19 said *"has never run and
  the copy now promises"*.
- The outbid-release mail and the cancel-at-once rule go.
- *Place bid — obliges you to pay if you win* becomes *pay now*, which is a much smaller
  promise to keep.

### ⚠️ The invoice does not go away

This is the premise to grill, because the change was asked for on it.

The seller is a Dutch eenmanszaak. **Taking money is a sale whether or not a card was held
first.** The hold was never what created the paperwork; the payment was. A paid bid is a
completed sale at the moment it is paid — sooner than today, not later.

What actually changes is **when** the document is owed and **how many** are owed:

- Today one document is owed per banner day, to one winner.
- Under a paid board, one is owed **per bid**, including every bid that never reaches #1,
  and including each top-up.

So the change as stated does not remove the invoice. It arguably multiplies it. Say out loud
whether that is understood before anything is built, because it inverts the reason given for
the change.

⚠️ [Ticket 29](29-invoice-address.md) is downstream of this: the dev's home address is frozen
into each document at issue time. More documents means the address reaches more buyers.

### The questions

- **Does the banner stay a day, or become a rank?** outbid.lol has no clock. 200 squares'
  banner is *"auctioned every day"* — the counter says so, `/how-it-works` says so, and
  [ticket 27](27-label-and-sellout.md) just recorded that the banner is the one thing a
  sold-out board still has. A permanent leaderboard and a daily slot are different products.
  If the banner still turns over daily, what happens to yesterday's paid bid?
- **Are bids non-refundable?** That is the engine of the ratchet, and it is the hardest part
  to sell to an EU consumer. `/terms` carries an Art. 6(1)(h) withdrawal text today
  ([ticket 03](03-checkout-fields.md), ticket 19's bid panel). Check whether a
  non-refundable bid survives contact with the consumer right of withdrawal at all, or
  whether bids must be **business-only** to work this way.
- **Does a losing bid buy anything?** On outbid.lol it buys a visible rank. Here there is one
  banner. If a $5 bid buys nothing and is not refunded, that is money for nothing, which
  `PRODUCT.md` will not carry. If it buys a place in a visible list, that list has to exist —
  which is a new surface, not a change to an old one.
- **What happens to money already taken** if the rules change again. Permanent means
  permanent.
- **Is this V1.0 or V1.1?** Ticket 19 is resolved and built. This is a rewrite of a shipped
  path, not a tweak, and [ticket 25](25-launch.md) is waiting.

## Context

- The dev raised this on 2026-08-26, immediately after ticket 27 was resolved, and sent a
  screenshot of the outbid.lol front page.
- Nothing is claimed and nothing is built. This ticket only records the ask and the premise
  that has to be tested before it is.
