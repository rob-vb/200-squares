# 12 — Reselling with real money

Type: grilling
Status: closed
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

## From resolved decisions

[Ticket 06](06-buying-for-real.md) priced the **first** sale VAT-**inclusive** — $100 is
what the buyer pays — while [ticket 01](01-resale-platform-cost.md) priced the **resale**
VAT-**on-top**, because inclusive loses $19 there. Both are deliberate and both stand.
This ticket owns the consequence: the site now has two pricing rules, and the copy must
say which is which without making the resale look like a trick.

## Closed — out of scope, 2026-08-25

**Resale moves to V1.1. It is not built in V1.0 and the site launches without it.**

The dev's reasons: keep the build smaller, and let scarcity do its work before a
second-hand market softens it. Both are sound. Ticket 01 called resale *"in risk, law and
work the heaviest thing on the map"*, so removing it takes more weight out of V1.0 than
any other single cut.

⚠️ **This ticket is closed, not resolved.** Nothing here was decided; it was ruled beyond
the destination. It does not appear in the map's Decisions so far, because that section
records the route actually walked and a scope boundary is not a step on it.

### Nothing is lost

[Ticket 01](01-resale-platform-cost.md) stays **resolved and stands**. Site credit instead
of cash, VAT on the whole resale price, PSD2 as the reason cash is the expensive road, DAC7
not applying — all of it is research V1.1 starts with rather than research V1.1 has to do.
The same is true of the product model in prototype tickets 11 and 12.

### What V1.0 gains by not doing this

- ⚠️ **One pricing rule instead of two.** [Ticket 06](06-buying-for-real.md) priced the
  first sale VAT-**inclusive**; ticket 01 priced a resale VAT-**on-top**. This ticket owned
  explaining that difference to buyers without it looking like a trick. The problem is
  gone.
- **No credit ledger.** [Ticket 05](05-convex-model.md) put its shape in the schema for
  this ticket to fill. [Ticket 15](15-build-schema.md) drops it: a table nothing writes to
  is speculation.
- **No `listings` in the board query.** Every field there is paid for on every rerun for
  every viewer (ticket 05), and the asking price was one of them.
- **Blocks never split.** [Ticket 09](09-artwork-storage.md)'s crop-rectangle answer for a
  cut block still stands as written, but nothing in V1.0 exercises it.
- **No second VAT treatment on the invoice.** [Ticket 17](17-invoice-document.md)'s warning
  that the template must not hard-code inclusive arithmetic is **deferred with this
  ticket**, not solved — V1.1 must read it before touching the invoice.

### What replaces it

⚠️ A **promise**, which is not nothing. The dev wants a small label in the top bar saying
that when all 199 squares are sold, owners will be able to sell theirs on — the hard
wording, chosen deliberately over a softer one. That is
[ticket 27](27-label-and-sellout.md), and the risk it carries is recorded there with the
dev's decision beside it.

`/terms` says only the state of today: a square cannot be sold and cannot be handed back.
