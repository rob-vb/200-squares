# 19 — Build: the auction on real card holds

Type: task
Status: open
Blocked by: 07, 14, 15, 18 (15 done 2026-08-25)
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
