# 23 — Build: the invoice document

Type: task
Status: open
Blocked by: 17, 14, 15, 16 (15 done 2026-08-25)
Parent: ../map.md

## Question

Nothing to decide. [Ticket 17](17-invoice-document.md) settled it. Read its answer first.

⚠️ **Added by [ticket 16](16-build-checkout.md) (2026-08-25): skip refunded orders.** A
payment that landed on squares somebody else had already bought is written to `orders`
with `refundedAt` set and **no block behind it**. It must take no invoice number: a number
is allocated once, in sequence, and one spent on a sale that did not happen is a gap in the
series that has to be explained to an inspector.

- **Numbering** — one series per calendar year, `2026-0001`, allocated **inside the
  mutation that writes the invoice**. One invoice per order, unique index on the order id.
  A hot counter row is fine here; invoices are rare.
- **The ECB rate** — a cron pulling
  `https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml` after ~16:00 CET on
  working days. ⚠️ No rate on weekends or TARGET closing days, so use the most recent
  published one and freeze **`fxRate`, `fxRateDate` and `fxSource`** onto the order. The
  date is what makes a weekend invoice defensible.
- **The document** — trading name, address, KVK, BTW-identificatienummer, date of issue,
  the number, *advertising space on a web page*, the date of supply, the customer's name
  and address.
  ⚠️ **The business identity comes from Convex environment variables, not from code**:
  `BUSINESS_NAME`, `BUSINESS_ADDRESS`, `BUSINESS_KVK`, `BUSINESS_VAT_ID`. The dev sets them
  the way they set the Stripe keys. The values never enter git, never enter a ticket, and
  the address can change without a deploy. Build the template against the names; do not ask
  for the values and never invent one — a wrong VAT number on an invoice is a real problem,
  not a typo.
  This is safe with ticket 17's "written once, never recomputed" rule, and it is why:
  the values are **frozen into the stored document** at issue time, so changing the address
  in 2029 does not rewrite an invoice from 2026, which is what the law wants. Then one of the three cases from ticket 17, with ⚠️ **the VAT amount in
  euros beside the USD total** for the Dutch-21% case.
- **Stored, not rendered on demand** — HTML written once into Convex file storage. No PDF
  at V1.0.
- ⚠️ **A permanent, unguessable URL keyed on a random token**, never on the invoice
  number. An invoice carries a name and an address.
- **Delivered as a link** in the order-confirmed mail ([ticket 22](22-build-email.md)) and
  in My squares.
- ⚠️ **The template must not hard-code inclusive arithmetic.** A first sale is
  VAT-inclusive and a resale is VAT-on-top; the order row says which. Getting this wrong
  makes every resale invoice wrong by 21%.

The VIES `requestIdentifier` is stored on the order and **not printed**.

Not this ticket: the seller-side self-billed document for a resale. Different law, and it
sits with [ticket 12](12-resale-for-real.md).
