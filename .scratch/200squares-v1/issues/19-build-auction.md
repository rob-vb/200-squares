# 19 — Build: the auction on real card holds

Type: task
Status: resolved
Blocked by: 07, 14, 15, 18 (all done 2026-08-25 — this is now on the frontier)
Parent: ../map.md

## Question

Nothing to decide. [Ticket 07](07-auction-holds.md) settled it; this puts it in the repo.
Read its answer first.

Build, in this order:

- **The bid panel.** `src/components/panel/bid-flow.tsx` gains the ticket 03 fields —
  buyer type, country, name, the conditional EU VAT number, the withdrawal box with the
  Art. 6(1)(h) text, the invoice line — pre-filled from `owners` for a signed-in bidder.
  The button says *Place bid — obliges you to pay if you win*. **Cards only**; iDEAL
  cannot do manual capture.
- **The three true sentences** beside the box, and the *next bid that can be collected*
  line. Copy from ticket 07's answer verbatim.
- **Placing a bid** — Turnstile, VIES where a VAT number is given, then a PaymentIntent
  with `capture_method: manual` for exactly the bid amount, `tax_behavior: inclusive`.
  A bid below top + $10 is refused, not queued.
- ⚠️ **Read `capture_before` on the new PaymentIntent.** If it falls before the coming
  00:00 UTC, refuse the bid immediately so the bidder can use another card.
- **Being outbid** — cancel that PaymentIntent at once, and mail the bidder
  ([ticket 13](13-email.md)).
- ⚠️ **The close.** Capture the top bid **first**. Cancel every other hold **only after
  that capture succeeds**. On failure, promote the next bid and capture it for its own
  amount. If all fail, the house ad takes the day and every hold is cancelled. Nothing is
  released until somebody has paid.
- **The rollover** — a Convex cron at 00:00 UTC **and** lazy closing on read, the same
  pattern ticket 05 used for reservation expiry. `bannerDays` keyed on the date;
  `closedAt` makes a second run a no-op. A day past its close with no `closedAt` closes
  late and shows the house ad until it does.
- **Artwork on a standing bid** — optional, replaceable, reached from the bid panel and
  from My squares. A winner with none gets the house ad in their place.
- **The order and the invoice** — a banner day freezes its own ticket 03 fields, the same
  three VAT cases as a square. The document is [ticket 17](17-invoice-document.md)'s.

Bidding still opens at **$100** with a **$10** minimum raise. The square going to $250
does not move either number.

Not this ticket: a mid-day pro-rata withdrawal. Ticket 07 put it in `/terms` and
deliberately left it unbuilt.

The prototype's fake rival — the one that outbids the visitor about 20 seconds later —
goes away with the mock data.

Check it on the Vercel preview URL in Stripe test mode. The case worth forcing by hand is
**a declined capture at the close**, because it is the one path that has never run and the
one the copy now promises.

## Answer

**The auction runs on real card holds, and nothing is released until somebody has
paid.** The ticket said nothing was left to decide. That was not true: ticket 07
carried two rules that cannot both hold, and the build could not start until the
dev chose between them.

### ⚠️ The contradiction, and the choice

Ticket 07 says both of these:

- *Outbid during the day → cancel that PaymentIntent at once.* (Inherited from charting.)
- *At the close, capture the top bid first; on failure, promote the next bid that
  can be collected.*

If every outbid hold is cancelled the moment it is passed, then at 00:00 UTC there
is exactly **one** hold standing and there is nothing to promote. The ladder — the
answer to the declined card, to the runner-up and to the hostage attack, and the
sentence the panel and `/terms` both promise — would be decoration.

The dev chose the ladder (2026-08-25). **An outbid hold stays on the card until
the close.** The courtesy is paid for in the copy instead: the outbid mail and the
panel both say the hold stays, why it stays, and when it goes.

### ⚠️ The consequence nobody had named: your own earlier hold

Under the rule ticket 07 inherited, raising your own bid released your own last
one for free. Under the rule the dev kept, it would freeze the same card twice —
and buy nothing, because a second hold on the same card can never be *the next bid
that can be collected* after the first one has failed.

So **a bidder's own earlier hold is released the moment their new one lands, and
only their own.** Other bidders' holds stay. That is the ladder; this is only fair.

### What is in the repo

- **Two steps, the same two a purchase has.** `/auction/bid` on Convex opens a
  `pending` bid behind Turnstile — it judges the amount and the caller and writes
  a row, with no card and no money. `/api/bid` on Vercel then does VIES, the VAT
  case and the Checkout Session, behind that bid id.
  ⚠️ The split is ticket 02's, not tidiness: a bid has no reserve step in front of
  it, so a single Vercel route would have been the most floodable thing on the
  site, and on Hobby a flood of invocations **pauses production**. The floodable
  half lives where a flood breaks the site instead.
- **The minimum is checked inside the mutation**, never in the action around it.
  Convex runs mutations serialisably against what they read, so two bidders at the
  same number cannot both pass. A bid below top + $10 is refused, not queued.
- **The hold**: a Checkout Session with `payment_intent_data.capture_method:
  "manual"`, `payment_method_types: ["card"]` and `tax_behavior: "inclusive"`, for
  exactly the bid amount. ⚠️ Its session comes back **`payment_status: unpaid`**
  and stays that way until the close, so `settle()` in `convex/http.ts` branches on
  `metadata.kind` and reads the PaymentIntent's own state instead.
- **The close**, `auction.closeDue`: capture the top bid, and only when that
  succeeds cancel every other hold. On failure, walk down and capture the next for
  **its own** amount. If all fail, the house ad takes the day and every hold goes.
  ⚠️ A capture that throws is not the same as a card that declined — a run that
  captured and then died answers `payment_intent_unexpected_state` on the retry,
  and the money is already ours. Stripe is asked; getting that wrong would charge
  the runner-up as well.
- **The order and the invoice**: the winning bid writes an `orders` row with
  `kind: "banner"`, the ticket 03 fields off the session metadata, and the VAT
  recomputed against what Stripe actually captured — never trusted from metadata,
  the same rule `checkout.fulfil` follows.
- **The bid panel** carries the ticket 03 fields, the three true sentences, the
  banner's own withdrawal box, the invoice line, Turnstile and the button *Place
  bid — obliges you to pay if you win*.
- **A standing bid can be pointed somewhere**, from the bid panel and from My
  squares, and the link is copied onto the banner day at the close.

### ⚠️ Three places the ticket asked for something the platform will not do

- **`capture_before` cannot be read at the keyboard.** Ticket 07 wanted a card
  whose authorization dies before 00:00 refused while the bidder can still reach
  for another one. A **hosted** checkout page only produces the value afterwards.
  The refusal moved one screen: the hold is cancelled the instant the webhook
  reads it, and `/bid` says *that card cannot hold long enough* with the board one
  link away. Building it any earlier would mean Elements in the panel — a second
  payment path beside ticket 16's, for one rare case.
- **Lazy closing on read is unbuildable as written.** A Convex query may not
  capture money, and the only other reader is a browser — an unauthenticated
  endpoint that moves money is a road a flood walks down, which is the one thing
  ticket 02 forbids. What the reads *do* do needs no code: a day with no owner
  shows the house ad, so a late close is visible rather than broken. The catch-up
  is the cron itself, **hourly on the hour** — it is both the 00:00 close and its
  own retry, and a missed run costs an hour of house ad. `closedAt` makes every
  run after the first a no-op.
- **The remembered ticket 03 fields are not on `owners`.** Ticket 07 asked for
  four columns there and ticket 15 never added them. They stay off it on purpose:
  `owners` is read whole by the board query (ADR 0001), so every column on it is
  paid for by every viewer on every write. The bidder's **last order** is the same
  answer for free, and it is honest about what ticket 07 called it — a form
  filler, not the record.

### ⚠️ What the copy now owes

- `/terms` says *"The highest bid at 00:00 UTC wins and is charged; every other bid
  is not."* That is now false in the case the whole mechanism exists for. It must
  say the banner goes to the **highest bid that can be collected**, that a hold
  stays on the card until the close, and — ticket 07's own instruction — that a
  consumer who withdraws mid-day is owed a **pro-rata refund** nobody builds.
- `/privacy` must add that a **pending bid** keeps the same salted address hash a
  reservation does, for the same fifteen minutes and the same reason.

Both ride with **making the copy true again** on the map.

### ⚠️ Nobody tells a bidder their card was declined

A bidder who held the top spot and whose capture failed at 00:00 is told nothing.
Ticket 13 fixed the list at six messages and this is not one of them, so adding a
seventh here would be deciding ticket 13's question in a build ticket. It is on the
map under *Not yet specified*.

### Proved on staging, in Stripe test mode

Two bids from two addresses, $100 then $150, both holds standing at once — the
$100 was **not** released when it was passed, which is the rule. The top hold was
then cancelled at Stripe by hand to force the case the ticket named, and the close
run:

- `$150` → `failed`. `$100` → `captured`, **for its own amount**.
- `bannerDays` for the day: that owner, `wonWithCents: 10000`, `closedAt` set.
- `orders`: `kind: "banner"`, `totalCents: 10000`, `vatCents: 1736`, `nl21`,
  `pricing: "inclusive"`, the banner withdrawal wording frozen verbatim.
- The board drew the house ad, because the winner brought no artwork — which is
  ticket 07's answer to the empty hour, already built into `BannerCell`.
- The outbid mail was scheduled and ran; the first bid of each address created an
  account and sent a magic link, and no bid sent a receipt (ticket 13).

Two new tools, both `SEED_ENABLED`-guarded and both in `docs/environments.md`'s
spirit: `node scripts/bid.mjs <email> [amount]` drives one bid end to end, and
`npx convex run seed:ageAuction` brings tomorrow's auction forward so the close can
be watched happening instead of waited for.

### Not built, and on purpose

The **image** on a standing bid. The field, the link beside it, and the copy onto
the banner day are here; `generateUploadUrl`, the two WebP sizes and the crop are
[ticket 20](20-build-artwork.md)'s, and a winning bid shows the house ad until it
lands. The mid-day pro-rata refund stays unbuilt, as ticket 07 asked.
