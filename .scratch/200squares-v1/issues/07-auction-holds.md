# 07 — The auction on real card holds

Type: grilling
Status: resolved
Blocked by: 05
Parent: ../map.md

## Question

Charting fixed the mechanism: **a bid is a card authorization**. At 00:00 UTC the
site captures the winner's hold and releases every other one. The close is **hard** —
no extension window — because the whole site says 00:00 UTC and tomorrow's banner
hangs on it. The minimum raise stays **$10** over the top bid, and bidding starts at
$100. With no bids at all the banner shows the house ad.

The mechanism is chosen. The failure modes are not:

- **How long a hold survives.** A bid placed just after 00:00 UTC must survive nearly
  24 hours. Card authorizations do not always live that long, and some issuers drop
  them sooner. Check what Stripe actually guarantees, and what happens to a bid whose
  hold died before the close.
- **The capture is declined at 00:00 UTC.** The winner has no banner and the day has
  no occupant. Does it fall to the second bidder, whose hold was released seconds
  earlier? Does it fall to the house ad? Say it out loud, because the copy must say it
  too.
- **Being outbid.** Charting says the hold is released at once. Confirm that is right:
  it is friendly, but it means a rival can be bounced and come straight back, and the
  released money takes days to reappear on the bidder's statement whatever the site
  does.
- **The rollover itself.** A Convex cron at 00:00 UTC that closes the auction,
  captures, assigns the banner day, and opens tomorrow's auction. What if it does not
  run, or runs twice? A banner day is public and dated: a missed rollover is visible
  to everyone.
- **The winner's artwork.** They won at 00:00 UTC and occupy the banner from that
  moment. When do they supply the image and the link — before bidding, or in the
  hours after winning? Whatever the answer, there is a window where the banner is
  won and empty. The house ad is one way out.
- **Bid abuse.** Bidding is an unauthenticated write against a card. A bidder with no
  intention of paying can hold the top spot all day for free. Does bidding need an
  account, unlike buying?
- **The tick box.** outbid.lol's wording is the model: bidding does not guarantee the
  spot, and bids are not refundable. What is literally true here, given a hold is not
  a payment.

The prototype's fake rival that outbids the visitor once, ~20 seconds later, goes
away with the mock data.

## From resolved research

[Ticket 03](03-vat-invoices-withdrawal.md) settled three facts this ticket runs on:

- **The auction must be card-only.** iDEAL does not support manual capture.
- **A card-not-present authorization holds for 7 days** (Visa, Mastercard, Amex,
  Discover; Visa MIT is 4 days 18 hours). The authoritative per-payment value is
  `payment_method_details.card.capture_before`. A daily auction fits easily.
- ⚠️ **Authorization amount must equal capture amount.** Stripe Tax calculates at
  session completion — at authorization, not at capture — and *"when the capture
  amount is lower than the original amount, Stripe Tax doesn't reduce the total
  balance of the collected tax"*. "Authorize high, capture the winning bid" would
  overstate VAT on every OSS return with no automatic correction.
- **The banner can be fully performed**, unlike a square, so the withdrawal waiver
  actually works for a bid — which is what outbid.lol relies on.

## Answer

**Nothing is released until somebody has paid.** That one rule answers the decline, the
runner-up and the "hold the auction hostage" attack together, and it costs nothing to
build.

### The mechanism, stated once

One bid is one Stripe PaymentIntent with `capture_method: manual`, for **exactly** the
bid amount. Card only — ticket 03 found iDEAL cannot do manual capture, so the bid panel
offers cards and nothing else.

- Outbid **during the day** → cancel that PaymentIntent at once. Friendly, and charting
  already chose it. The bidder's bank may take days to show the money again whatever the
  site does, and the copy says so.
- At the close → **capture the top bid first. Cancel the rest only after it succeeds.**

### The hold survives easily, and the site checks anyway

Ticket 03 established 7 days for a card-not-present authorization, with
`payment_method_details.card.capture_before` as the authoritative per-payment value. The
longest a bid can live here is just under 24 hours.

That is comfortable, and comfortable is not the same as guaranteed. **Read
`capture_before` on every bid as it is placed.** If it falls before the coming 00:00 UTC,
refuse the bid then and there, while the bidder is still at the keyboard and can use
another card. A hold that dies later is not a special case — it fails at capture, and the
next paragraph already covers that.

### The capture is declined at 00:00 UTC

**The banner falls to the next bid that can be collected**, walking down the list.

This is only possible because nothing was released. Charting said the losing holds go at
00:00; **they do not.** At the close the site captures the top bid, and only when that
capture succeeds does it cancel every other hold. If it fails, the runner-up is promoted
and captured — for **their own** bid amount, which is what they agreed to. If every bid
fails, the day shows the house ad and every hold is cancelled.

⚠️ This is the fix for the **abuse the ticket asked about**. A bidder with no intention of
paying can hold the top spot all day; they cannot take the day away from anybody. The
attack costs them a real hold on a real card and wins them nothing.

The copy must say it plainly, on the bid panel and in `/terms`: *if the top bid cannot be
collected, the banner goes to the next bid that can.*

### The rollover

A Convex cron at 00:00 UTC, and **lazy closing on read beside it** — the same pattern
ticket 05 chose for reservation expiry, so it is the codebase's idiom rather than a new
one.

- A `bannerDays` row is keyed on the **date**, so creating it twice is impossible.
- Closing writes `closedAt`. A second run sees it set and does nothing. **Idempotent by
  construction**, which is the only defence worth having against a cron that fires twice.
- **A missed run is visible, not broken.** Any read of the banner notices that a day whose
  close has passed has no `closedAt`, and closes it late. Until it does, the day shows the
  house ad.

Whether the dev is *told* a rollover ran late belongs to the monitoring fog on the map,
not here.

### The winner's artwork, and the empty hour

The auction closes at 00:00 UTC and the day it decides begins at 00:00 UTC. The winner
gets **no preparation time at all**. That is the ticket's real problem and it has no
mechanism that removes it, so:

- **A bidder may attach artwork and a link to their bid at any time while it stands.**
  Not required. Same upload machinery as ticket 09, reached from the bid panel and from
  My squares.
- **A winner with no artwork gets the house ad in their place** until they upload. They
  keep the day; they lose the hours.
- The mail at 00:00 says which of the two happened.

A prepared bidder gets the whole day. That is the incentive, and it is better than a rule.

### Bidding needs no account — and makes one

The same shape as buying, which charting already fixed. The first bid collects an email
and the ticket 03 fields, creates an `owners` row, and sends a magic link
([ticket 08](08-accounts.md)). A signed-in bidder re-bids with one click, because
everything is remembered.

The difference from a purchase is worth naming: a purchase is one moment, a bid is a
**relationship over a day** — you are outbid, you come back, you win, you upload. That
relationship wants a session. It does not want a signup wall in front of the first bid, on
a site whose auction has no bidders on day one.

**Turnstile guards placing a bid**, as it guards the reservation in ticket 16 and the
sign-in form in ticket 08. The deeper defence is that a bid freezes real money on a real
card.

### The banner is priced VAT-inclusive, like a square

⚠️ **This closes the warning ticket 03 left open.** That warning — authorization amount
must equal capture amount, or Stripe Tax overstates VAT — was about Stripe Tax, which
[ticket 06](06-buying-for-real.md) switched **off**. And here authorize always equals
capture, because a bid is captured for exactly the bid amount. There is no "authorize
high, capture the winning bid". The problem cannot arise.

[ADR 0002](../../../docs/adr/0002-vat-inclusive-priced-and-computed-here.md) left the
banner's `tax_behavior` to this ticket. **Inclusive.** A bid is a number the bidder types
themselves, and two bids of $250 must mean the same thing whoever placed them. Exclusive
pricing would make the top bid depend on the bidder's tax status, which is not an auction.

⚠️ The consequence is the same one the ADR names for squares, and it is sharper here: **the
highest bid is not always the most valuable bid.** An EU consumer bidding $250 leaves
$206.61; a non-EU bidder leaves $250. The site takes the highest bid anyway. An auction
that quietly preferred some bidders would not be an auction.

Bidding still starts at **$100** and the minimum raise stays **$10**, both unchanged by
the square going to $250. A banner is one day; a square is forever.

### The tick box, and what is literally true

Under *Fuhrmann-2* the button carries the obligation, so it reads
**"Place bid — obliges you to pay if you win"**, mirroring ticket 06's *Order now —
obliges you to pay*.

Beside it, three sentences that are literally true:

- A bid places a **hold** on your card. No money is taken unless you win.
- If you win, the hold is collected at 00:00 UTC. If you lose, it is released at once,
  and your bank may take some days to show it.
- If the top bid cannot be collected, the banner goes to the next bid that can.

Then the withdrawal box. ⚠️ **It is not the same box as a square's, and it actually
works.** Ticket 03 found a square can never be fully performed, so its box only buys the
Art. 6(1)(h) information. A **banner day can** be fully performed — at the end of the day.
So the box takes express consent to begin at 00:00 and acknowledgement that the right is
lost on full performance, and the right ends when the day ends.

A consumer who withdraws mid-day is owed a **pro-rata refund** under Art. 14(3). Say it
in `/terms`; do not build it. At these amounts it is a support case, and building a
mid-day proration for an event that may never happen is the wrong order of work.

### Two things this hands on

- **`owners` gains the ticket 03 fields as remembered defaults** — buyer type, country,
  name, VAT number. ⚠️ They are a **form filler, not the record**. The order freezes its
  own copy, so ticket 05's "an invoice is never recomputed" stands untouched. Ticket 15
  adds the columns; ticket 19 uses them.
- **The invoice for a banner day** is [ticket 17](17-invoice-document.md)'s. It is the same
  three VAT cases as a square, on a different supply.

The prototype's fake rival that outbids the visitor about 20 seconds later goes away with
the mock data.
