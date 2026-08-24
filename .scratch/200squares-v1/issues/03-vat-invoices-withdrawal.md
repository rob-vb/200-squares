# 03 — VAT, invoices and the right of withdrawal

Type: research
Status: resolved
Parent: ../map.md

## Question

The seller is a Dutch **eenmanszaak** with a KVK number and a BTW number. It sells a
place on a board to buyers anywhere in the world, priced in USD. Find out what the
checkout must legally do, because that decides the fields on the payment page and
the words next to the button.

1. **What is being sold?** Advertising space, a digital service, or something else?
   The answer changes the VAT rule. Note that a buyer also gets a link to their
   site — [`PRODUCT.md`](../../../PRODUCT.md) calls that a product promise.
2. **VAT.** For a Dutch eenmanszaak: a business buyer inside the EU (reverse charge,
   VAT number validation), a consumer inside the EU (which rate — the buyer's
   country, OSS?), and any buyer outside the EU. What must the checkout collect —
   country, VAT number — and must it be verified?
3. **Stripe Tax.** Can it do this automatically for this case, what does it cost, and
   where does it stop? Does it also produce the invoice?
4. **Invoices.** What must an invoice show, and must one be issued for a $100 sale to
   a consumer? Prices are in **USD** while the books are in EUR — what does that
   demand?
5. **The right of withdrawal.** An EU consumer has 14 days. The site's copy says
   permanent, pay once, no way back. Charting decided to waive it with an explicit
   tick box at checkout, the way outbid.lol does for bids. **Check that this is
   actually allowed here**: what exactly must the buyer tick, when must they tick it,
   and what has to be delivered before the right is gone? A square that lands
   `pending` with no artwork yet is not obviously "delivered".
6. **The KOR.** Is the small business scheme relevant, and would it help or hurt a
   business selling mostly abroad?

Also state what a lawyer or an accountant must still confirm. This ticket produces
facts and a draft, not legal cover.

Note: the money leg of a **resale** — VAT on the 10% cut, DAC7 — belongs to
[ticket 01](01-resale-platform-cost.md), not here. This ticket is the primary sale
and the banner.

Primary sources: Belastingdienst, the EU VAT rules, the consumer rights directive
and Stripe's own tax documentation. Capture the findings as a markdown file in the
repo and link it from this ticket.

## Answer

Findings: [`research/03-vat-invoices-withdrawal.md`](../research/03-vat-invoices-withdrawal.md),
sections 1-8, every claim carrying its URL and the date it was read (2026-08-24).

**What is being sold: advertising space on a web page.** Annex I(3)(h) of Implementing
Regulation 282/2011 names it in those exact words as an **electronically supplied
service**. The buyer's link is part of the same single supply, not a second one. That
classification changes exactly one cell of the place-of-supply table — the EU consumer
— and that cell is what the whole checkout is built around.

**What the panel must collect before the Stripe redirect:** buyer type (business or
private person, radio, **no default**), country, legal or full name, an EU VAT number
when the buyer is a business outside NL, an **unticked** withdrawal box with the
Art. 6(1)(h) information under it, one line accepting a digital invoice, and —
silently — the client IP and the exact tick-box wording with a timestamp. Stripe
supplies the email and, with `billing_address_collection=required`, the full billing
address; the card's issuing country is read back off the PaymentIntent.

**Only two of those must be verified rather than believed.** The **VAT number**,
against **VIES synchronously before the Checkout Session** — the Commission's REST
endpoint is free and returns a `requestIdentifier` to keep as proof. This closes a
hole Stripe leaves open: Stripe checks the **format** before payment and the
**validity** only afterwards, so a fake number that looks right gets a zero-VAT sale
through. And the **buyer's country**, for which one third-party item — the card
country — suffices while cross-border B2C stays under €100,000.

**VAT, in three cases.** Below **€10,000** of cross-border EU B2C, every EU consumer
pays Dutch **21%**. Above it, destination rates and the **Unieregeling**, which raises
the retention period to **ten years** and uses a **quarter-end ECB rate** that Stripe's
own filing columns do not match. EU business buyers outside NL: reverse charge, with
«btw verlegd» and the customer's VAT number on the invoice. Outside the EU: outside
the scope of Dutch VAT.

**Invoices:** not required for a consumer, always required for a business buyer — and
the site cannot know which it has until it asks, which is why buyer type is a field
and not an inference. A Stripe receipt is not a VAT invoice. USD is allowed on the
invoice, but any **VAT amount must also be shown in euros** (art. 35a lid 4 Wet OB),
using either the last quoted selling rate or the ECB rate (art. 8 lid 6 — those two
and no others; the customs rate is **not** available, and no inspector-agreed rate
exists for VAT). The €100 simplified invoice is real but a knife-edge on the exchange
rate and barred exactly where this site most often lands. Issue a full invoice every
time.

### The withdrawal waiver as charted does not work

A square is a **service**, so only **Art. 16(1)(a)** is available, and it requires the
service to be **fully performed** — a fact about the world, not something a buyer can
tick away. A `pending` square with no artwork is plainly not performed, and a square
sold as **permanent** is arguably never performed. So an EU consumer keeps a 14-day
right, and the tick box buys only a *pro rata temporis* sliver of a perpetual
contract, which is close to nothing.

**Keep the box anyway.** Without it the buyer owes **nothing at all** under
Art. 14(4)(a). And without the Art. 6(1)(h) information the 14 days become **twelve
months and fourteen days** — a theoretical **$19,900** open position on a full board.
That number, not the tick box, is what actually matters.

**The banner is different:** one day of occupancy can genuinely be fully performed, so
the waiver does work there.

⚠️ **A separate defect, and the sharper one: the order button.** Stripe's hosted page
says "Buy", and under *Fuhrmann-2* only the words on the button count. The order must
therefore be **placed on 200squares.com** behind a compliant label, or every consumer
contract is voidable. This cuts across the charting decision that checkout is Stripe's
hosted page — see [ticket 06](06-buying-for-real.md).

### What a lawyer or an accountant must still confirm

Ranked in §8 of the findings. The load-bearing ones: whether a **permanent** service is
ever fully performed (an inference, not a sourced finding); the order-button label;
non-EU consumer cooling-off rules under Rome I, unmappable at this scale; which EU rule
Stripe applies behind `txcd_10701000`, which Stripe does not publish and one test-mode
German B2C sale would settle; **`tax_behavior` inclusive versus exclusive, irreversible
once set** — the difference between "$100" staying true and becoming $119-121; the KOR
as a year-one choice, where art. 25a lid 4's ban on mentioning VAT collides with the
«btw verlegd» an EU B2B invoice needs; how much human intervention would break the
automation test; and non-EU registration duties, which were not researched at all.
