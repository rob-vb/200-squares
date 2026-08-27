# 17 — The invoice as a document

Type: grilling
Status: resolved
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

## Answer

**One series a year, the ECB rate frozen on the invoice date, and an HTML document written
once to Convex storage and never recomputed.**

### Numbering

**One series per calendar year: `2026-0001`.** Art. 35a allows "one or more series", and a
year boundary that is visible in the number makes the annual return and the ten-year
retention legible. A single endless run is also legal and tells you nothing.

**The number is allocated inside the mutation that writes the invoice**, never at order
time. A number is therefore never handed to something that then fails, and the sequence
has no gap to explain.

⚠️ **The double-write the ticket worried about cannot happen.** Ticket 06 keys the order
on the **Stripe session id**, and there is exactly one invoice per order, enforced by a
unique index on the order id. The 10-second fallback path and the webhook can both arrive;
only one writes, and only one number is taken.

The counter is one row per year, patched in a mutation. That is a hot row, and here it is
fine — an invoice is rare. The click counter in [ticket 10](10-clicks-for-real.md) is the
same shape and needed a warning; this one does not.

### The euro amount

**The ECB daily reference rate, frozen into the order at invoice time.**

Art. 8 lid 6 allows the last quoted selling rate or the ECB rate. The ECB rate wins on one
argument: it is published, dated, free and auditable years later. A commercial selling
rate would have to be sourced and then proved, in 2036, for a sale made in 2026.

- Fetched from `https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml` by a Convex
  cron, after the ECB publishes at about 16:00 CET.
- ⚠️ **Published on working days only** — not on weekends, not on TARGET closing days. On
  a day with no new rate, the **most recent published rate** is used.
- The order therefore freezes three fields, not one: **`fxRate`, `fxRateDate` and
  `fxSource: "ECB"`**. The date is what makes a weekend invoice defensible, and without it
  the number is unprovable.

This sits beside the VAT rate ticket 06 already freezes, under ticket 05's rule that an
invoice is never recomputed.

### What the document shows

On every invoice: trading name and address, **KVK number**, and the
**BTW-identificatienummer** (the `NL…B..` id, never the fiscal number). Date of issue,
the sequential number, the description — *advertising space on a web page*, in those
words, because that is what ticket 03 established the supply to be — the date of supply,
and the customer's name and address.

Then one of three:

| Case | The document shows |
| --- | --- |
| **NL or EU consumer** | Taxable amount, 21%, the VAT amount, the total. ⚠️ The **VAT amount in euros** beside the USD total, which is the art. 35a lid 4 requirement Stripe Invoicing could not meet. |
| **EU business outside NL, valid VAT number** | Both VAT numbers, no VAT amount, and the words **«btw verlegd»** / *VAT reverse-charged*. |
| **Outside the EU** | No VAT line, and one sentence: *outside the scope of Dutch VAT.* |

The VIES `requestIdentifier` from ticket 03 is **stored on the order, not printed**. It is
proof for an inspector, not information for a customer.

⚠️ **A consumer gets an invoice too**, although a B2C electronically supplied service
mostly does not require one. Ticket 06 already takes consent to a digital invoice at
checkout, the data is already frozen, and issuing one removes a support case for the price
of nothing. Deciding who *needs* an invoice is more work than sending everybody one.

### Where it lives

**Written once as HTML into Convex file storage, and served at a permanent, unguessable
URL.**

Both of the ticket's own arguments point here — ten years of retention, and ticket 05's
"an invoice is never recomputed" — and rendering on demand would quietly re-derive a legal
document from code that has changed since.

**No PDF at V1.0.** Dutch law is format-neutral and the consent to a digital invoice was
taken at checkout, so HTML is sufficient; a browser prints it to PDF in one keystroke; and
generating PDFs server-side would spend action compute out of the same free plan
[ticket 09](09-artwork-storage.md) is protecting. ⚠️ If a real business complains, that is
the moment to revisit — noted as fog, not built now.

⚠️ **The URL is keyed on a random token, not on the invoice number.** An invoice carries a
name and an address, and a guessable URL would hand them out in order. Same shape as
ticket 06's Stripe-session-id grant: permanent, unguessable, and no sign-in needed.

### Delivery

**A link in the one order-confirmed mail** from [ticket 13](13-email.md), and the same
link in the account under My squares. Not an attachment.

### The resale invoice

**The same document, the same numbering series, a different VAT rule.**

Ticket 01 put the site **in the supply chain** — art. 9a deems it to supply in its own
name and art. 28 deems it to buy and resell — so the site issues the buyer's invoice for a
resale exactly as it does for a first sale. What differs is the arithmetic:
[ADR 0002](../../../docs/adr/0002-vat-inclusive-priced-and-computed-here.md) prices a first
sale VAT-**inclusive** and ticket 01 prices a resale VAT-**on-top**.

⚠️ **So the template must not hard-code inclusive arithmetic.** The order row carries which
rule applied and the document reads it. Get this wrong and every resale invoice is quietly
wrong by 21%.

⚠️ **The seller side is not this ticket.** The other supply — private seller to the site —
is a self-billed document under different law, and the seller is usually a private person
with no VAT to charge and no input VAT to give
([ticket 01](01-resale-platform-cost.md)). It belongs with
[ticket 12](12-resale-for-real.md), which is the dev's, and it is flagged there rather
than answered here.
