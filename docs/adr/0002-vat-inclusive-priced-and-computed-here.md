# $250 includes VAT, and the site computes it, not Stripe

A square costs $250. That is what the buyer pays, whoever they are and wherever they
are. Whatever VAT is due comes out of the $250, and the site works out how much —
Stripe Tax is off.

Two settings, one of them irreversible, decided together in
[ticket 06](../../.scratch/200squares-v1/issues/06-buying-for-real.md).

## Context

[Ticket 03](../../.scratch/200squares-v1/issues/03-vat-invoices-withdrawal.md)
established what is being sold — advertising space on a web page, an electronically
supplied service under Annex I(3)(h) of Regulation 282/2011 — and therefore that an EU
consumer pays Dutch 21% while an EU business reverse-charges and a non-EU buyer is
outside the scope of Dutch VAT. Three cases, all decided by two fields the panel
already has to collect: buyer type and country.

Stripe forces two choices on top of that.

**`tax_behavior` is set once per price and cannot be changed.** Stripe's recommended
"Automatic" resolves to *exclusive* for USD prices, which would turn the site's own
copy — "$250 per square" — into $302.50 for an EU consumer at the last screen. Inclusive
keeps the number the site has said everywhere, at the cost of $43.39 per EU consumer
sale.

**Stripe Tax costs 0.5% per transaction in every country of registration**, and the fee
follows the registration rather than the tax: a reverse-charged EU B2B sale with €0 of
VAT still costs $0.50. Stripe does not publish which EU rule it applies behind
`txcd_10701000`, the closest published tax code, and ticket 03 put that on the list of
things an accountant would have to confirm.

## Decision

**`tax_behavior: inclusive`**, set explicitly, never left on Automatic.

**Stripe Tax is off.** The site computes VAT from buyer type, country and a VIES check
it already performs synchronously before the Checkout Session, and freezes the rate and
the amount into the `orders` row at the moment of sale.

## Consequences

- **The price is honest and constant.** $250 is $250 on the board, in the panel, in the
  copy and on the card statement. Nothing appears at the last screen.
- **Revenue depends on who buys.** An EU consumer leaves $206.61; a non-EU buyer or a
  reverse-charged EU business leaves $250. A full board is worth between $41,116 and
  $49,750, not a single number.
- **A country mismatch stops being an emergency.** The card country arrives after
  payment, when refusing would mean refunding. Because the buyer always pays $250, a
  disagreement between the declared country and the card country changes only what the
  site owes, never what the buyer paid. The site records both, flags the order, and
  eats at most $43.39.
- **The resale is priced the other way.**
  [Ticket 01](../../.scratch/200squares-v1/issues/01-resale-platform-cost.md) found that
  a VAT-inclusive EU resale loses $19, so resale is priced VAT-on-top. The first sale and
  the resale therefore follow different rules, and
  [ticket 12](../../.scratch/200squares-v1/issues/12-resale-for-real.md) owns explaining
  that difference.
- **Crossing €10,000 of cross-border B2C is the trigger to revisit Stripe Tax.** Above
  the threshold the Unieregeling brings destination rates for 27 countries, and 0.5%
  starts to earn itself back. Below it, every EU consumer pays 21% and the arithmetic
  is one line. ⚠️ **At $250 the threshold arrives two and a half times sooner** than the
  charting price of $100 — it is now a matter of tens of sales, not hundreds, so the
  watch the map already calls for is nearer than it was.
- **`tax_behavior` is per price, not per account.** The banner auction may still choose
  differently; that stays with
  [ticket 07](../../.scratch/200squares-v1/issues/07-auction-holds.md).
