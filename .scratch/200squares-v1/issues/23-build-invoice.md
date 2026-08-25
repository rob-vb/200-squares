# 23 — Build: the invoice document

Type: task
Status: resolved
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

## Answer

**Built and deployed. The number is taken in the mutation, the file is written by the
action a moment later, and the four `BUSINESS_` variables are the dev's to set.**

### The shape it had to take

Ticket 17 asked for two things that pull against each other: the number is **allocated
inside the mutation that writes the invoice**, and the number is **printed in the
document**. A Convex mutation cannot write a file. So the work is three steps:

```
allocate  (mutation)  take the number, mint the token, freeze the ECB rate onto the order
issue     (action)    render that into HTML and store the file
attach    (mutation)  point the row at the file
```

⚠️ **`invoices.storageId` is therefore optional**, and that is the only place this departs
from the ticket as written. A row without a file is an invoice still being written — never
a gap in the series, because the number and the token are already fixed and every field
rendered from is already frozen, so a second render produces the same document. The daily
`finish unwritten invoices` cron is what finishes one whose action died. The alternative —
allocate in one mutation, insert in another — spends a number on something that can fail,
which is the exact thing ticket 17 forbade.

### The rest, as decided

- **`2026-0001`, one series per calendar year**, read from the `by_year` index rather than
  from a counter row: the row that would hold the counter is the row being written, and a
  counter that can disagree with its own series is a second source of truth.
- **One invoice per order**, checked on `by_order` inside the mutation. Convex's
  serialisable transactions are what make that a constraint and not a hope.
- **Refunded orders take no number.** `allocate` answers `none` and writes nothing.
- **The ECB rate** is pulled daily at 17:00 UTC by `invoices.pullFxRate` into the `cached`
  row `fx`, and frozen onto the order as `fxRate`, `fxRateDate`, `fxSource` at issue time.
  It publishes on working days only, so a weekend invoice quotes Friday's rate **and says
  which day that was**. Verified live: `1.1662`, dated `2026-08-25`.
  The XML is read with a regular expression — there is no DOMParser in Convex's runtime,
  and an XML dependency in the path of the site's own bookkeeping is not worth it.
- **The document** is one self-contained HTML file, no network, no font, no PDF. All four
  cases were rendered and read:

  | Case | What it prints |
  | --- | --- |
  | `nl21` + inclusive | net $1,239.67 · VAT 21% $260.33 · total $1,500.00 · **VAT in euros €223.23** with the rate and its date |
  | `reverse` | both VAT numbers (From and To), no VAT amount, **btw verlegd** |
  | `none` | no VAT line, *outside the scope of Dutch VAT* |
  | `nl21` + **onTop** | net $1,500.00 · VAT $315.00 · total $1,815.00 |

  ⚠️ That last row is the ticket's warning, answered: the template takes the net as
  `total − vat` from two stored numbers and never recomputes VAT from a rate, so a V1.1
  resale is not quietly wrong by 21%. `pricing` chooses which sentence says so.
- **The URL is `/invoice/<32 hex>`** on 200squares.com, streamed from Convex the way `/art`
  is — but `private, no-store` at both ends, never `s-maxage`. `/art` serves a public
  picture and wants a year of shared caching; this is one person's name and address.
- **Delivered twice**: the link in the order-confirmed mail ([ticket 22](22-build-email.md)),
  and the list in My squares, which is there because a mail is lost more easily than an
  account and the token can be handed to a bookkeeper without the account behind it.
- The VIES `requestIdentifier` is stored and **not printed**.

### ⚠️ What the dev must do before any invoice exists

`BUSINESS_NAME`, `BUSINESS_ADDRESS`, `BUSINESS_KVK`, `BUSINESS_VAT_ID` on the Convex
deployment. They were **not invented and not asked for** — the ticket forbade both. Until
they are set, `issue` throws after the row is written, which is the recoverable failure:
the number and the token are already fixed and the nightly sweep renders the document the
day the variables appear. Added as *Part 1, step 7* of
[`docs/setup-checklist.md`](../../../docs/setup-checklist.md).

`allocate` was run once against a test order on the dev deployment and behaved: number
`2026-0001`, a token, and the rate frozen onto the order. **No document has been rendered
on a deployment**, because that needs those four values.

### Not this ticket, and still not

The seller-side self-billed document for a resale. It sits with
[ticket 12](12-resale-for-real.md), which is out of scope for V1.0.
