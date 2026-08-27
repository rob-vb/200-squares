# Stripe is the merchant of record, and the site computes no tax

Every Checkout Session runs under Stripe Managed Payments. Stripe (through Link) is the
merchant of record: it decides the payment methods, calculates and remits the tax, mails
the receipt and the invoice, and handles refund requests and disputes. The site asks for
no country and no VAT number, freezes no VAT case, and issues no invoice.

Decided by the owner on 2026-08-27, when the first bid on production was refused.

## Context

[ADR 0002](0002-vat-inclusive-priced-and-computed-here.md) had the site do the tax
itself: three VAT cases decided from buyer type and country, a VIES check beside the
Checkout Session, Stripe Tax off, and an invoice of the site's own with the VAT in euros
at the ECB rate. That was a working design and a heavy one — four `BUSINESS_*` variables,
two crons, an invoice series, and a bookkeeping obligation in every EU country the
threshold is crossed in.

The Stripe account had Managed Payments enabled by default. Under it Stripe refuses
`payment_method_types`, which is how the bid route failed and how the question came up.
The owner's answer: use Managed Payments, it saves 200 squares a great deal of trouble.

## Decision

- Both routes create Managed Payments sessions. `payment_method_types` and
  `automatic_tax` are gone; `tax_code: "txcd_10000000"` (General — Electronically
  Supplied Services) is on the inline product, and `tax_behavior: "inclusive"` stays, so
  $250 is $250 and Stripe carves its tax out of it.
- The panel asks buyer type and name, nothing more. Buyer type stays for ADR 0005 — only
  a consumer has the 14 days — not for tax.
- The order keeps `country` as the billing country Stripe collected. `vatCase`,
  `vatCents`, `vatRateBps`, `pricing`, `vatNumber`, `viesRequestIdentifier` and the fx
  fields are optional legacy columns; nothing writes them.
- The site issues no invoice. `convex/invoices.ts` keeps only `fileByToken`, so the
  invoices issued before this date stay readable. The two crons, the ECB rate, the
  template and the `BUSINESS_*` variables are gone.
- The confirmation mail says the receipt and the invoice come from Stripe. Stripe's own
  receipts, switched off under ticket 13, must be on again in the Dashboard — under
  Managed Payments they are sent from Link regardless of that setting.
- `INVOICE_TEXT`, frozen onto every new order: *Payment goes through Stripe. Stripe
  emails you the receipt and the invoice.*

## Consequences

- The buyer's contract of sale for the payment is with Link ("Sold through Link"); the
  statement reads `LINK.COM* 200SQUARES`. `/terms` says so in one paragraph.
- Adaptive Pricing is always on: a buyer may pay the local-currency equivalent. A bid is
  still typed and compared in USD; what the card is charged may differ by Stripe's rate.
- Stripe can refund within 60 days without the site's approval. The 14-day withdrawal
  function (ADR 0005) stays; it is the site's own duty and Stripe's refund is on top.
- Manual capture (the hold behind a bid) is not on Stripe's list of unsupported
  parameters. It is verified by placing a real bid on staging, not by this document.
- The VIES `requestIdentifier`, the euro line and the invoice series are no longer
  produced. Orders before 2026-08-27 keep theirs.

Supersedes ADR 0002.
