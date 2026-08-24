# 12 — Reselling with real money

Type: grilling
Status: open
Blocked by: 01, 05, 06
Parent: ../map.md

## Question

[Ticket 01](01-resale-platform-cost.md) brings back what a resale really costs — the
Connect account type, the KYC, DAC7, VAT on the 10%, and whether the cheaper roads
(site credit, introduction only) are worth taking. **Read its answer first.** If the
cost turns out to be more than the rest of the site put together, the honest move is
to put this question to the dev again rather than build past it.

The product model is settled and is not reopened:
[ticket 11](../../200squares-frontend/issues/11-resale.md) and
[ticket 12](../../200squares-frontend/issues/12-build-resale.md). A listing is a
rectangle of a block at a price **per square** with a **$1 floor**; the buyer drags
any rectangle out of it, down to one square; the site keeps **10%**; listing is free;
a sold block arrives **empty** — no artwork, no link, no clicks; the block splits at
the moment of sale into at most four rectangles, and blocks never merge.

What is undecided is the money and the trust between two strangers:

- **Who holds the money and for how long.** The buyer pays now; the seller is paid
  when. Is there a gap, and what is the gap for?
- **Onboarding a seller.** They bought one square for $100 and want to list it. How
  much identification stands between them and their money, and where in the flow does
  it happen — at listing, or at the first sale?
- **A seller who never finishes onboarding** after their square has already sold. The
  buyer has paid and the block has changed hands.
- **Chargebacks.** The buyer disputes the charge weeks later, and the seller has been
  paid. Ticket 01 says who carries it.
- **A block that is removed** by [ticket 11](11-admin-removal.md) while it is listed,
  or after it was sold on.
- **The seller's own tax.** The site pays out; the seller owes something. What must
  the site tell them, and does DAC7 mean the site tells the Belastingdienst too.
- **The buyer needs no account** — ticket 11 on the prototype map decided that, the
  same as a first-hand purchase. Check that still holds once the money goes to a
  person rather than to the site.

## From resolved research

[Ticket 01](01-resale-platform-cost.md) changed the money leg under this ticket. The
model from the prototype survives whole; how the money moves does not.

- **Site credit, not cash.** The seller is paid in credit usable on the board. No
  payout rail, no KYC, no Connect onboarding — and, decisively, no PSD2 question. DNB
  says a platform that takes the buyer's money and pays the seller provides a payment
  service, and an eenmanszaak is **forbidden to operate and unable to be licensed**.
  So this ticket builds a **credit ledger**, not a payout.
- ⚠️ **VAT is owed on the whole resale price, not on the 10%.** Art. 9a of Reg.
  282/2011 deems the site to supply in its own name, and art. 28 deems it to buy and
  resell. Priced VAT-inclusive an EU resale **loses $19**; priced **VAT on top** about
  **$6** survives. The price the board shows must therefore gain VAT on top for an EU
  consumer, which is a copy change as much as a build change.
- ⚠️ **The gross counts for every turnover test.** €10,000 is crossed at **67**
  resales, not 670.
- **Stripe restricted business, twice** — "payment facilitation and aggregation" and
  "stored value or credits". Credit escapes DNB, not Stripe's review.
- Open for a professional, and it decides when VAT falls: is site credit a
  **single-purpose or multi-purpose voucher**, and is credit paid to a seller a
  voucher transfer at all. See also the new **Site credit as a product** fog on the map.
