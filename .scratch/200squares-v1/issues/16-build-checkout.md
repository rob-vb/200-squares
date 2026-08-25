# 16 — Build: the checkout

Type: task
Status: open
Blocked by: 06, 14, 15 (15 done 2026-08-25)
Parent: ../map.md

## Question

Nothing to decide. [Ticket 06](06-buying-for-real.md) settled the whole flow; this puts
it in the repo. Read its answer first, and
[ADR 0002](../../../docs/adr/0002-vat-inclusive-priced-and-computed-here.md) with it.

Build, in this order:

- **The panel**, one screen. `src/components/panel/buy-flow.tsx` loses company, link and
  artwork, and gains buyer type (radio, no default), country, name, the conditional EU VAT
  number, the unticked withdrawal box with the Art. 6(1)(h) text, and the digital-invoice
  line. The button says *Order now — obliges you to pay*.
- **VIES synchronously** before the Checkout Session, with both failure paths from ticket
  06, and the `requestIdentifier` kept.
- **VAT computed here**, three cases, frozen into `orders`. `tax_behavior: inclusive`,
  set explicitly. Stripe Tax off.
- **Reservation, Turnstile and the three limits** — one per IP, 10% of free squares, token
  required by the mutation.
- **The Stripe session**, with the reservation id as idempotency key and in the metadata,
  `billing_address_collection: required`, email on, phone off.
- **The webhook**, signature-verified, session id as the key against double processing,
  and the ticket 05 race: webhook wins if the squares are free, automatic full refund if
  they are not.
- **The return page**: subscribe by session id, 10-second server-side fallback that
  retrieves the session, artwork upload granted by the session id.
- **`sessionStorage`** for the reservation id and Stripe URL. No cookie.
- **The countdown** in the panel and on the return, and release on Stripe's back link.

The artwork upload itself is [ticket 09](09-artwork-storage.md)'s, and the account behind
the magic link is [ticket 08](08-accounts.md)'s. Build the seams for both; do not build
them here.

Check it on the Vercel preview URL, in Stripe test mode, including a German B2C sale —
that one test also settles the `txcd_10701000` question ticket 03 left open, if Stripe Tax
is ever turned on.
