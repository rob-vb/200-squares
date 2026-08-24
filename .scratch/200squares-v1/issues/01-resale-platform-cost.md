# 01 — Reselling: what a platform is allowed to do, and what it costs

Type: research
Status: resolved
Parent: ../map.md

## Question

The dev chose to keep the resale market in V1.0, knowing it is the heaviest part.
Find out what it actually costs a Dutch eenmanszaak to move money between two
strangers.

[Ticket 11](../../200squares-frontend/issues/11-resale.md) and
[ticket 12](../../200squares-frontend/issues/12-build-resale.md) fixed the model:
an owner lists part of a block at a price **per square** with a $1 floor, a buyer
drags any rectangle out of the listing, the site takes the money and keeps **10%**,
and the block splits at the moment of sale. Listing is free. That model is not in
question here — only what it takes to run it with real money.

Answer these:

1. **Stripe Connect.** Which account type fits — Express or Standard? Who carries
   the liability for a chargeback on a resale? What does onboarding look like for a
   seller who bought one square for $100 and now wants $150 for it — is full KYC
   demanded before they can be paid?
2. **The 10%.** How is a platform fee taken (`application_fee_amount`,
   destination charges, separate charges and transfers)? What does the platform owe
   VAT on — the whole $150, or its own $15?
3. **DAC7.** The EU reporting duty for digital platforms. Does a board that
   facilitates the sale of a square between two parties fall under it? What does it
   demand — seller identification, yearly reporting to the Belastingdienst — and
   from what volume? Is there a threshold below which a small platform is exempt?
4. **The cheaper roads.** Two alternatives were named while charting:
   - **Site credit** — the seller is paid in credit usable on the board (other
     squares, banner bids) instead of cash. No payout rail, so possibly no Connect
     and no KYC. What does that do to DAC7, and is credit itself regulated?
   - **Introduction only** — the site shows the listing, the two parties settle
     between themselves, and the site takes nothing. Kills the 10%.
5. **Money held for someone else.** Is there a point at which this becomes a
   regulated payment service under PSD2, and does Stripe Connect stand between the
   dev and that?

Report what is true, not what is convenient. If the honest answer is that resale
costs more than the rest of the site put together, say so plainly — the dev can then
choose again with real numbers, and the decision to keep it was taken without them.

Primary sources only: Stripe's own Connect and Tax documentation, the EU DAC7
directive and the Belastingdienst's own pages. Capture the findings as a markdown
file in the repo and link it from this ticket.

## Answer

Findings: [`research/01-resale-platform-cost.md`](../research/01-resale-platform-cost.md),
1798 lines, every claim carrying its URL and the date it was read (2026-08-24).

**Run resale on site credit, not cash, and charge VAT on top of the seller's listed
price.** That keeps the model from tickets 11 and 12 intact — price per square, $1
floor, drag any rectangle, 10%, free listing, block splits on sale — and it is the only
road that does not put a sole trader into KYC, payouts, merchant risk and a live
regulator question for the sake of a few dollars a sale.

### The finding the ticket did not anticipate: VAT is owed on $150, not $15

A square is an electronically supplied service by name — Reg. 282/2011 Annex I(3)(h),
*"the provision of advertising space including banner ads on a website/web page"*.
**Art. 9a presumes the platform supplies in its own name**, and its third subparagraph
bars rebuttal by anyone who authorises the charge, authorises the delivery, **or** sets
the general terms — any one is enough, and this site does all three. Art. 28 then deems
the site to buy the square and resell it. There is no margin scheme (art. 311 is
tangible-only) and no input VAT to reclaim from a private seller. The Belastingdienst's
own commissionaire page: *"U berekent dan btw over het totale bedrag."*

Priced VAT-inclusive the way a first-hand square is, **an EU resale loses $19**. Priced
**VAT on top**, about **$6** survives. Worse: every turnover test counts the **gross**,
so 67 resales cross the €10,000 art. 59c threshold, not 670. ViDA (Dir. 2025/516) fixes
exactly this asymmetry — for accommodation and passenger transport only, from 2028.

### DAC7 does not apply

Two independent grounds. A square is intangible, so it is not "Goods" (Annex V I.C(9):
*"any tangible property"*), and an eenmanszaak is not an "Entity" and therefore not a
Platform Operator — the Belastingdienst says so in those words. ⚠️ The second ground
disappears on incorporating into a BV; the first does not. There is **no small-platform
exemption** anywhere in the directive.

### PSD2 is the reason cash is the expensive road

DNB has published since 2017 that a platform which takes the buyer's money and pays the
seller provides a payment service *"ongeacht of de betaaldiensten een hoofd- of
nevenactiviteit zijn"*, and it kills the commercial-agent exclusion for two-sided
markets outright. The Dutch vrijstelling excludes money remittance and non-Dutch
activity. ⚠️ And art. 37(1) with art. 11(1) mean an eenmanszaak would be **forbidden to
operate and unable to be licensed**. The escape DNB names is to leave payments to a
licensed third party and never possess or control client funds — which is what Connect
provides (Stripe **Technology** Europe Ltd, Irish EMI, CBI C187865, in DNB's register
since 2019) — but it depends on **paying out immediately**, which is also the only cheap
chargeback defence, so you would have to give that up. **Site credit removes the whole
question.**

### The numbers on the cash road, for the record

Stripe takes **$7.94** of a $15 commission on an EEA card and **$10.42** on an
international one (1.5% / 3.15% + €0.25, +2% FX, 0.25% + €0.10 payout, €2 per active
seller per month). The platform carries the chargeback: the full **$150 plus €20**
(€40 if contested), uncapped, off its own balance. Full KYC always — a Dutch platform
cannot use the light recipient agreement — and sellers must live in one of **43
countries**, while buyers may live anywhere.

⚠️ **Resale is a Stripe restricted business twice over**: "payment facilitation and
aggregation" and "stored value or credits". Both need approval Stripe *"may modify or
revoke at any time"*. The credit road does not escape Stripe's own review — it escapes
DNB's.

### What it costs against the rest of the site

**In hosting money, resale does not cost more than the rest of the site** — the whole
site is $0-45 a month. In risk, law and work it plainly does: nine pieces of permanent
machinery, a second VAT analysis, and an uncapped dispute tail. The decision to keep
resale was taken without these numbers; they are now on the table, and the credit road
is what makes keeping it defensible.

### What a professional must still confirm

Is site credit a **single-purpose or multi-purpose voucher** — it decides whether VAT
falls at issue; is credit paid to a seller a voucher transfer at all; and one narrow
DNB question about destination charges.

### What this changes elsewhere

**[Ticket 12](12-resale-for-real.md)** now builds a credit ledger, not a payout rail,
and the resale price shown on the board gains VAT on top for an EU consumer. The
prototype's model survives; the money leg under it does not.
