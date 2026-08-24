# 06 — Buying with real money

Type: grilling
Status: open
Blocked by: 03, 05
Parent: ../map.md

## Question

Charting fixed the shape: the visitor drags a rectangle in the panel, the site holds
it for **15 minutes**, and sends them to **Stripe's hosted checkout page**. Artwork
comes **after** payment; the block lands `pending`. No account is needed to buy —
Stripe supplies the email and
[ticket 08](08-accounts.md) turns it into an account afterwards.

What is not decided is everything that can go wrong. Work through it:

- **The order of events.** Reserve, then pay, then webhook, then `pending`. What
  creates the block — the browser coming back, or the webhook? They arrive in either
  order, and sometimes only one arrives.
- **Idempotency.** A webhook that fires twice must not sell the same squares twice.
- **The 15 minutes running out** while the buyer is still on Stripe's page. Someone
  else takes the squares, the payment succeeds. What then — refund, or a rule that
  makes it impossible?
- **Failure the buyer sees.** Card declined, browser closed, back button, paying
  twice in two tabs.
- **What the board shows** during a reservation. Charting said it reads as taken.
  Does it read as `pending`, or does it need a fourth appearance? Note that
  [ticket 11 on the prototype map](../../200squares-frontend/issues/11-resale.md)
  refused a fourth square state once already, for good reasons.
- **The thank-you page.** What it says when artwork is still missing, and how the
  buyer gets from there to uploading. This is the moment the account is created.
- **The tick box.** Charting decided the buyer waives the right of withdrawal with an
  explicit tick, the way outbid.lol does for bids.
  [Ticket 03](03-vat-invoices-withdrawal.md) says whether that holds up and what the
  words must be. Stripe's hosted page limits what can be put next to the button —
  find out whether the tick belongs on the board instead, before the redirect.
- **What Stripe's page must collect** — country, VAT number, business or consumer —
  and whether Stripe Tax is on. Ticket 03 decides; this places it in the flow.
- **The receipt and the invoice.** Stripe's, or the site's.

Selection, drag and the 4 x 4 limit are settled and are not reopened.

## From resolved research

[Ticket 03](03-vat-invoices-withdrawal.md) and [ticket 02](02-ddos-and-the-bill.md)
put three new things on this ticket's plate:

- ⚠️ **The order button.** Stripe's hosted page says "Buy", and under *Fuhrmann-2*
  only the words on the button count. The order must be **placed on 200squares.com**
  behind a compliant label, or every EU consumer contract is voidable. This cuts
  across the charting decision that checkout is Stripe's hosted page. Decide the
  shape: an order button on the panel that then redirects, or something else.
- ⚠️ **`tax_behavior`, inclusive or exclusive, and it is irreversible once set.**
  This is the difference between "$100" staying true and becoming $119-121 for an EU
  consumer. It is a product decision wearing a Stripe flag.
- **The fields before the redirect**: buyer type (radio, no default), country, name,
  EU VAT number for a business outside NL, an unticked withdrawal box with the
  Art. 6(1)(h) information, consent to a digital invoice — plus VIES validation
  **synchronously, before** the Checkout Session, because Stripe validates too late.
- ⚠️ **The 15-minute reservation is an attack surface with no cost to the attacker.**
  A distributed script can freeze the whole board with fake reservations while the
  site stays up and bills nothing. Offline is acceptable to the dev; a board nobody
  can buy from was never considered. Turnstile in front of starting a checkout is the
  free control that reaches it.
