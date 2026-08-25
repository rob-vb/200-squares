# 17 — The invoice as a document

Type: grilling
Status: open
Blocked by: 06, 13
Parent: ../map.md

## Question

[Ticket 06](06-buying-for-real.md) decided **the site issues the invoice, not Stripe** —
a Stripe receipt is not a VAT invoice, and Stripe Invoicing cannot put the VAT amount in
euros beside a USD total the way art. 35a lid 4 Wet OB requires. The `orders` row already
carries everything, frozen. What the document *is* was never decided.

- **Numbering.** Art. 35a demands a sequential number. One run, or a run per year? What
  happens to a gap, and what happens if an order is written twice by the fallback path in
  ticket 06?
- **The euro amount.** Art. 8 lid 6 allows the last quoted selling rate or the ECB rate,
  and nothing else. Which one, where it is fetched, and — since the rate must be the one
  of the invoice date — whether it is frozen into the order like the VAT rate is.
- **What the document shows** for each of the three cases: Dutch 21%, «btw verlegd» with
  the customer's VAT number, and outside the scope. Plus KVK, BTW-id and address.
- **Where it lives.** Rendered on demand from the order, or written once and stored? Ten
  years of retention argues one way; "an invoice is never recomputed" (ticket 05) argues
  the same way.
- **Delivery.** Attached to the ticket 13 confirmation mail, or fetched from the account?
  A consumer needs no invoice at all; a business always does.
- **The resale invoice.** Ticket 01 put the site in the supply chain for a resale, at a
  different VAT treatment. Whether that is the same document with different numbers, or
  another document, may belong here or with [ticket 12](12-resale-for-real.md).

The legal findings are settled — see §4 and §5 of
[`research/03-vat-invoices-withdrawal.md`](../research/03-vat-invoices-withdrawal.md).
This ticket is about the document, not the law.
