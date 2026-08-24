# 07 — The auction on real card holds

Type: grilling
Status: open
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
