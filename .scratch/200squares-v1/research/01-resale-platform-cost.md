# Research 01 — Reselling: what a platform is allowed to do, and what it costs

Answers [issue 01](../issues/01-resale-platform-cost.md). Everything below was read on
**2026-08-24** and every URL was fetched that day. Primary sources only:
`stripe.com` / `docs.stripe.com`, EUR-Lex, `wetten.overheid.nl`,
`zoek.officielebekendmakingen.nl`, `belastingdienst.nl`, `dnb.nl`, and the vendors'
own pricing pages. No blogs, no advisory-firm write-ups.

Where a page could not be reached by automated fetch, or where the text does not
settle the question, it says so in those words. Two fetch quirks are worth knowing, since
they defeated earlier passes over this note: **dnb.nl returns HTTP 403 to plain automated
fetch and serves normally to a full browser header set** — its PSD2 platform guidance is
quoted in §5.3 — and **wetten.overheid.nl serves Burgerlijk Wetboek Boek 3 with its article
bodies collapsed**, so the one figure that needed it could not be read (§4.2). EU texts come
from the EU Publications Office Cellar
(`publications.europa.eu/resource/celex/…`), which serves the same authenticated
texts as EUR-Lex; eur-lex.europa.eu itself sits behind a bot challenge.

This is a fact-finding note, not legal or tax advice.

## 0. The short version

- The ticket's own framing is already out of date. **Express and Standard are
  deprecated.** Stripe now steers new platforms to the Accounts v2 API with
  *configurations* (`merchant` / `customer` / `recipient`) and explicit
  responsibility flags.
- **The platform carries the chargeback.** In the only funds flow that fits this
  product, the disputed amount *and* the €20 dispute fee come off the platform's own
  balance, and Stripe's Connect Terms say that liability "is not limited or excluded
  in any way".
- **Full KYC, always.** A Dutch platform cannot use the light "recipient service
  agreement"; every one of the 43 permitted seller countries offers only the `full`
  agreement. Name, date of birth, address, phone, business URL and a bank account
  before the seller is paid.
- **Sellers cannot live worldwide.** Buyers can. Sellers must sit in one of 43
  countries; cross-border payouts from an EEA platform reach only the US, UK, EEA,
  Canada and Switzerland.
- **DAC7 does not apply — on two independent grounds.** A square is intangible, and
  "Goods" under DAC7 means *tangible* property, so there is no Relevant Activity at
  all; and an eenmanszaak is not an "Entity", so it cannot be a Platform Operator.
  Neither ground is a grey area. ⚠️ But **there is no small-platform exemption** to
  fall back on if either ground goes: the €2,000 / 30-transactions threshold excuses a
  *seller*, never the platform, and the Dutch maximum administrative fine is a
  sixth-category fine of **€1,100,000** from 1 January 2026. **Incorporating into a BV
  removes the second ground.** Selling anything tangible removes the first. §3.
- **VAT is owed on the $150, not on the $15.** A square is an electronically supplied
  service by name (Reg. 282/2011, Annex I(3)(h): "the provision of advertising space
  including banner ads on a website/web page"). Art. 9a makes the site the **deemed
  supplier** because it authorises the charge, authorises the delivery *and* sets the
  terms — any one of the three is enough, and it does all three, so the presumption
  cannot be rebutted. Art. 28 then deems it to buy and resell the square itself.
  ⚠️ **Priced VAT-inclusive the way a first-hand square is, an EU resale loses about
  $19.** VAT must be charged *on top* of the seller's listed price. There is no margin
  scheme — art. 311 limits it to "movable tangible property" — and no input VAT on a
  private seller's leg. ViDA (Directive (EU) 2025/516) fixes exactly this asymmetry
  for two other sectors and leaves digital platforms with it. §2.3.
- **On the money, resale is thin, then negative.** On a $150 resale the 10% is $15 and
  Stripe takes $8–10 of it before tax. Then the VAT above decides whether ≈$7 is left
  or $19 is lost. §6.3.
- **The cost is not a monthly bill.** The rest of the site runs inside free tiers —
  $0–45 a month at list price for Vercel, Convex and Resend together (§6.1) — and
  resale adds only **€2 per seller in a month they are paid** (Radar has a €0.05
  pay-as-you-go tier, so fraud tooling is cents). What resale really costs is
  per-transaction economics that range from **+$6 to −$19** on a $150 sale, an uncapped
  dispute tail (€20 received, €40 if contested, plus the full disputed amount), and nine
  pieces of permanent machinery nothing else in V1.0 needs. **In hosting money, no. In
  risk, law and work, more than the rest of the site put together.** §6.
- ⚠️ **Resale is a Stripe *restricted business*, twice over.** "Payment facilitation and
  aggregation (including receiving settlement proceeds for goods or services that you
  did not provide…)" and, for the credit road, "Sale of stored value or credits". Both
  need Stripe's approval with "proof of relevant licences or more details about your
  business model", and approval "may be modified or revoked by Stripe at any time".
  This is an application, not a setting. §4.1.
- **Site credit is the cheapest road that keeps the model intact.** No Connect, no KYC,
  no payout fee, no €2 account fee, **no 43-country limit** — a credit market can be
  worldwide where the cash market cannot — and a chargeback becomes recoverable because
  the site still holds the value. On the text it is not e-money (EMD2 art. 2(2) requires
  acceptance "by a natural or legal person other than the … issuer") and it sits inside
  PSD2's limited-network exclusion, whose €1,000,000 trip-wire is unreachable here.
  ⚠️ **But it does not touch the VAT**, it is a voucher (art. 30a) whose tax point may
  fall at *issue* rather than at redemption, and unspent credit is a liability with no
  established lifetime. §4.2.
- **"Introduction only" escapes everything, by giving up everything.** No Connect, no
  VAT on $150, no PSD2 — but only if the site takes literally nothing. ⚠️ Charge any
  fee while still owning the ledger that transfers the square and art. 9a returns: the
  deemed-supplier VAT on $150 and none of the $15. And §3.5 already established it does
  not escape DAC7 by itself. §4.3.
- ⚠️ **PSD2 is a live question, and DNB has published on exactly this shape since 2017.**
  DNB describes a platform that receives the buyer's money and then pays the seller and
  says PSD2 applies, "ongeacht of de betaaldiensten een hoofd- of nevenactiviteit zijn".
  It closes the commercial-agent exclusion for a two-sided market in one line — "De
  handelsagent die voor beide optreedt wordt dus wél als betaaldienstverlener
  gekwalificeerd" — and its threshold for "carrying on the business" is deliberately
  low. The Dutch small-provider vrijstelling is closed twice over: it excludes
  **betaaldienst 6, geldtransfers**, and requires Dutch-only activity. And art. 37(1)
  prohibits **natural** persons while art. 11(1) says a licence "shall only be granted
  to a **legal person**" — **an eenmanszaak would be forbidden to operate and unable to
  be licensed**, the same shape as the DAC7 point above. **The one escape DNB names is
  to leave the payment services to a licensed third party and never at any moment
  possess or control client funds** — which is what Stripe Connect provides (Stripe
  Technology Europe, Limited, Irish EMI, CBI C187865, in DNB's own register since
  25-03-2019; funds in Stripe's Pooled Accounts, which the platform "is not entitled to
  draw funds from"). So: pay out immediately, hold nothing. ⚠️ DNB says nothing on point
  about destination charges specifically, and **site credit removes the question rather
  than answering it.** §5.
- ⚠️ **Two pressures with no configuration that satisfies both.** Holding the seller's
  money is the only cheap defence against a chargeback (§1.3) and is exactly what Stripe
  advises against and what makes §5.2 worse. Credit resolves it; cash does not. §5.1.
- **The ticket's own question, answered: yes.** Resale costs more than the rest of the
  site put together. Ticket 12 says that is the moment to put the choice back to the
  dev rather than build past it. See the Recommendation.

## 1. Stripe Connect — which account type, who carries a chargeback, what onboarding demands

### 1.1 "Express or Standard?" is the wrong question now

`docs.stripe.com/connect/accounts` carries a **Deprecated feature** banner:

> The information on this page applies only to platforms that already use legacy
> connected account types (Standard, Express, or Custom accounts). If you're setting
> up a new Connect platform, or your integration uses the Accounts v2 API, see the
> Interactive platform guide.

The same page carries an instruction aimed at agents and LLMs telling them to ignore
it and use the Accounts v2 API instead. Treat any memory of "pick Express" as stale.

Source: https://docs.stripe.com/connect/accounts (read 2026-08-24).

The current model has three orthogonal parts.

**Configurations** — what an account is allowed to do
(https://docs.stripe.com/connect/accounts-v2, read 2026-08-24):

- `merchant` — the account can accept payments from customers (`card_payments`,
  `stripe_balance.payouts`).
- `customer` — the platform can charge the account as a customer.
- `recipient` — the account can receive transfers
  (`stripe_balance.stripe_transfers`). This is what indirect charges need.

An account can hold more than one. They are roles, not tiers, and they do **not** map
one-to-one onto Standard / Express / Custom — Stripe publishes no such table.

**Responsibilities** — who eats what
(https://docs.stripe.com/connect/accounts-v2/connected-account-configuration, read
2026-08-24):

| Property | Values |
| --- | --- |
| `defaults.responsibilities.fees_collector` | `application` (platform pays Stripe's fees) or `stripe` |
| `defaults.responsibilities.losses_collector` | `application` (platform liable for the connected account's negative balances) or `stripe` |
| `dashboard` | `full`, `express`, `none` |
| `defaults.responsibilities.requirements_collector` | computed, not settable — "You can't set it." |

> If you set `losses_collector` to `application`, then you must also set
> `fees_collector` to `application`.

> If you use destination charges with an Account, we recommend that you set both
> `losses_collector` and `fees_collector` to `application`.

**Legacy mapping**, for reading old code
(https://docs.stripe.com/connect/migrate-to-controller-properties, read 2026-08-24):
Express = `losses.payments: application`, `fees.payer: application_express`,
`requirement_collection: stripe`, `stripe_dashboard.type: express`. Standard =
`losses.payments: stripe`, `fees.payer: account`, `stripe_dashboard.type: full`.

### 1.2 What fits this product

The seller never charges the buyer — the site does, then pays the seller. That is a
`recipient` configuration with `stripe_transfers`, `dashboard: express` (or `none`),
and both responsibilities set to `application`. In legacy words, Express.

**Standard is wrong.** Standard supports "Direct only" charges
(https://docs.stripe.com/connect/accounts), and a direct charge makes the *seller*
the merchant of record. A person who bought one square for $100 is not a merchant,
cannot answer a chargeback, and would be signing up to a full Stripe account to sell
one square.

Stripe's own recommendation table for indirect charges
(https://docs.stripe.com/connect/integration-recommendations, read 2026-08-24):

| Option | Destination / Separate charges |
| --- | --- |
| Dashboard | Custom-Embedded or Express |
| Negative balance liability | **Platform** |
| Payment fee collector | **Platform** |

> Don't assign Stripe liability for negative balances on connected accounts. Because
> these charges occur on the platform, the platform is responsible for related
> negative balances.

### 1.3 Who carries a chargeback on a resale — the platform, without a cap

`https://docs.stripe.com/connect/charges` (read 2026-08-24):

> For disputes where payments were created on your platform using destination charges
> or separate charges and transfers, with or without `on_behalf_of`, your platform
> balance is automatically debited for the disputed amount and fee.

Note the "with or without `on_behalf_of`". `on_behalf_of` moves the *merchant of
record* to the seller (https://docs.stripe.com/connect/merchant-of-record) but does
**not** move the dispute debit. It stays on the platform.

Recovery is a transfer reversal against the seller's Stripe balance — which, for
someone who sold one square and was paid out weeks ago, is empty:

> Stripe debits your platform balance for the refund amount. You can reverse the
> transfers made to your connected accounts to recover your refund cost.

And there is no cap. Stripe Connect Terms, §3.1 and §7
(https://stripe.com/en-nl/legal/ssa-services-terms, last modified 18 November 2025,
read 2026-08-24):

> As between User and Stripe, User is responsible for all Activity on its Connected
> Accounts, whether initiated by User or not. User is liable to Stripe for all: (a)
> Transactions, Disputes, Refunds, Reversals and resulting Merchant Losses … User
> remains jointly and severally liable with the applicable Connected Accounts to
> Stripe for these amounts.

> Except to the extent covered by Stripe Managed Risk Services if applicable, User's
> liability for all Connected Accounts as described in these Stripe Connect Terms, is
> not limited or excluded in any way, notwithstanding anything to the contrary in
> this Agreement.

Stripe Managed Risk is the only contractual relief, and it does not apply here: it
covers losses "where the Connected Account is the settlement merchant", and with
destination charges the platform is the settlement merchant.

Also relevant to the 180-day tail
(https://docs.stripe.com/connect/risk-management, read 2026-08-24):

> if a connected account's balance remains negative for 180 days, we transfer funds
> from the platform reserve to cover the negative amount.

**The practical shape of the risk.** A buyer pays $150 for a square, the seller is
paid $135, the buyer disputes eight weeks later. The platform is debited $150 plus a
€20 dispute fee and has $135 to chase from a stranger. It earned $15 on that sale.
One lost dispute erases the margin on roughly forty successful ones.

### 1.4 Onboarding — is full KYC demanded before the seller can be paid?

**Yes, and the light path is closed to a Dutch platform.**

Stripe offers a lighter `recipient` service agreement
(https://docs.stripe.com/connect/service-agreement-types). Querying Stripe's own live
requirements endpoint for a Netherlands platform
(`https://docs.stripe.com/_endpoint/get-requirement-selections-for-platform-country?platformCountry=NL`,
read 2026-08-24) returns `tos_types: ["full"]` for **every** permitted seller
country. Not one offers `recipient`. Confirmed from the other side
(https://docs.stripe.com/connect/cross-border-payouts):

> You can't make cross-border payouts to connected accounts under a recipient service
> agreement. For those accounts, use Global payouts.

Global payouts is available in **GB and US only**
(https://docs.stripe.com/global-payouts) — closed to a Dutch eenmanszaak.

**What the seller must hand over.** For an NL platform onboarding an NL individual
with the `transfers` capability under the `full` agreement, the live requirements
endpoint returns:

`individual.first_name`, `individual.last_name`, `individual.dob.{day,month,year}`,
`individual.address.{line1,postal_code,city}`, `individual.phone`,
`business_profile.url`, `tos_acceptance.{ip,date}`, `external_account` (a bank
account).

Enforcement is time-based for NL: payouts pause after 7 days, capabilities after 14,
if the data is missing. For a **US** seller the gate is volume-based:
`payout_limit_amount: 300000` — a US seller can be paid up to **USD 3,000** before
`individual.ssn_last_4` and date of birth must be verified.

So the honest answer to "is full KYC demanded before they can be paid?" is: a real
identity record is demanded up front, and a *verified* one is demanded within days
(NL) or after a few thousand dollars (US). It is not a name and an IBAN.

Stripe's prose (https://docs.stripe.com/connect/identity-verification, read
2026-08-24):

> At certain variable thresholds—usually when a specified amount of time has passed
> or volume of charges have been made—you might need to collect and verify additional
> information. Stripe temporarily pauses charges or payouts if the information isn't
> provided or verified according to the thresholds.

> In some cases, Stripe might be able to verify an account by confirming some or all
> of the keyed-in data provided. In other cases, Stripe might require additional
> information, including, for example, a scan of a valid government-issued ID, a
> proof of address document, or both.

> Even after Stripe verifies a connected account, platforms still must monitor for
> and prevent fraud. Don't rely on Stripe's verification to meet any independent
> legal KYC or verification requirements.

`collection_options.fields` lets the platform choose **incremental** onboarding
(collect only `currently_due`) over **up-front** onboarding. Incremental is the
gentler flow for someone selling one square, and it is the right default here.

### 1.5 Where a seller may live — 43 countries, not the world

`get-requirement-selections-for-platform-country?platformCountry=NL` (read
2026-08-24) returns these connected-account countries:

`AE, AT, AU, BE, BG, BR, CA, CH, CY, CZ, DE, DK, EE, ES, FI, FR, GB, GI, GR, HK, HR,
HU, IE, IT, JP, LI, LT, LU, LV, MT, MX, NL, NO, NZ, PL, PT, RO, SE, SG, SI, SK, TH,
US`

And `https://docs.stripe.com/connect/cross-border-payouts` (read 2026-08-24):

> Platforms based in the United States, United Kingdom, EEA, Canada, and Switzerland
> can transfer funds to connected accounts located in any of these same regions.

> Stripe doesn't support self-serve cross-border payouts to countries outside the
> listed regions. Contact sales to discuss alternatives.

Those two lists do not agree — the requirements endpoint is broader than the
cross-border payouts page (BR, JP, HK, SG, TH, MX, AE, AU, NZ appear in one and not
the other). **UNSETTLED — confirm with Stripe before promising resale to a seller
outside the EEA/UK/US/CA/CH.** The safe assumption is the narrower list.

The same page adds a design constraint:

> Supported funds flows: Separate charges and transfers **without** `on_behalf_of`;
> Top-ups and transfers; Destination charges **without** `on_behalf_of`.

So for any non-Dutch seller the platform is permanently the merchant of record. That
is not only a Stripe fact — it feeds straight into the VAT question in §2.

**This is a product decision hiding in a payments detail.** The board sells to the
world. The market can only buy back from about forty countries. The copy has to say
so, or a buyer in India discovers at listing time that their only exit is closed.

## 2. The 10% — how the fee is taken, and what VAT is owed on

### 2.1 Taking the fee

Three shapes exist (https://docs.stripe.com/connect/charges, read 2026-08-24):

| | Direct | Destination (no `on_behalf_of`) | Separate charges and transfers |
| --- | --- | --- | --- |
| Charge lives on | connected account | platform | platform |
| Merchant of record | connected account | **platform** | **platform** |
| Stripe's processing fee debited from | either (your choice) | **platform** | **platform** |
| Platform's cut | `application_fee_amount` | `application_fee_amount` | the residual you don't transfer |
| Refunds debited from | connected account | **platform** | **platform** |
| Dispute + €20 fee debited from | connected account | **platform** | **platform** |
| Cross-border allowed | n/a | yes, without `on_behalf_of` | yes, without `on_behalf_of` |

**Destination charges with `application_fee_amount` is the fit.** One buyer, one
seller, one payment, and the platform sets the price.
https://docs.stripe.com/connect/destination-charges (read 2026-08-24):

> the full charge amount is immediately transferred from the platform to the
> `transfer_data[destination]` account after the charge is captured. The
> `application_fee_amount` (capped at the full amount of the charge) is then
> transferred back to the platform.

> Your platform pays the Stripe fee after the `application_fee_amount` is transferred
> to your account.

> No additional Stripe fees are applied to the amount.

> The application fee settles in the same currency as the connected account's
> settlement currency. For cross-border destination charges, this might differ from
> your platform's settlement currency.

Two traps worth writing into the build ticket:

- **Refunds do not claw the fee back by themselves.** `reverse_transfer=true` must be
  passed, or "by default the destination account keeps the funds that were
  transferred to it, leaving the platform account to cover the negative balance from
  the refund".
- **`transfer_data[amount]` hides the gross from the seller**; the connected account
  "can't view the total amount of the charge. They only see the amount transferred."
  Not needed here — the seller set the price — but it exists.

Separate charges and transfers is the wrong tool: it is for one payment split across
several sellers, or a charge made before the seller is known. Neither happens here.
It costs a harder integration and buys nothing.

### 2.2 Merchant of record — what the site must say out loud

https://docs.stripe.com/connect/merchant-of-record (read 2026-08-24):

> The customer-facing website, payment flow, and terms of service must clearly
> identify that party, whether it's your platform or a connected account. The
> customer needs to understand that any transaction is with the MoR, and only with
> the MoR.

> The card networks enforce MoR rules, and violations can result in significant fines
> for your platform and for Stripe.

> for most SaaS platforms, connected accounts are the MoRs, and for most
> marketplaces, the platform is the MoR. If you onboard as a marketplace, Stripe asks
> you to acknowledge the responsibilities of being the MoR.

So `/terms` and the resale receipt must say the buyer is transacting with the
eenmanszaak, not with the person who owned the square. That is a copy change with a
legal reason behind it, and it belongs with the "making the copy true again" work.

### 2.3 VAT — the $15, or the $150?

**The $150.** Not the $15. The ticket offered two answers and the wrong one is the
intuitive one. This is the single most expensive finding in this note, and it follows from
four articles in a row with no discretion anywhere along the chain.

Sources: the consolidated VAT Directive 2006/112/EC as in force **20-03-2025**
(<https://publications.europa.eu/resource/celex/02006L0112-20250320>) and the consolidated
VAT Implementing Regulation (EU) No 282/2011 as in force **14-04-2025**
(<https://publications.europa.eu/resource/celex/02011R0282-20250414>), both fetched from the
EU Publications Office Cellar on 2026-08-24 in English; eur-lex.europa.eu itself sits behind
a bot challenge, and the Cellar serves the same authenticated texts. ⚠️ **There is no 2026
consolidation of either instrument.** `02006L0112-20260101`, `02006L0112-20250701`,
`02011R0282-20260101` and `02011R0282-20250101` all return 404 or 400; the two above are the
latest that exist. Both carry the header "This text is meant purely as a documentation tool
and has no legal effect." Dutch law from
<https://wetten.overheid.nl/BWBR0002629/2026-01-01> ("Geldend van 01-01-2026 t/m heden").

#### Step 1 — a square is an electronically supplied service, by name

Reg. 282/2011 art. 7(1):

> 'Electronically supplied services' as referred to in Directive 2006/112/EC shall include
> services which are delivered over the Internet or an electronic network and the nature of
> which renders their supply essentially automated and involving minimal human intervention,
> and impossible to ensure in the absence of information technology.

And the list is not left to interpretation. **Annex I, point (3)(h)** of the same Regulation:

> the provision of advertising space including banner ads on a website/web page;

That is what a square is, in the Regulation's own words. It settles §2.3, and it settles the
banner auction too.

#### Step 2 — art. 28, the commissionaire rule

Directive 2006/112/EC **art. 28**:

> Where a taxable person acting in his own name but on behalf of another person takes part in
> a supply of services, he shall be deemed to have received and supplied those services
> himself.

"Deemed to have received **and supplied**" — one supply becomes two. The seller supplies the
square to the site; the site supplies it to the buyer. The site is not an agent earning a
commission. It is a principal, twice.

#### Step 3 — art. 9a, which makes the site the deemed supplier and blocks the way out

Reg. 282/2011 **art. 9a(1)**, inserted by Reg. (EU) 1042/2013:

> For the application of Article 28 of Directive 2006/112/EC, where electronically supplied
> services are supplied through a telecommunications network, an interface or a portal such
> as a marketplace for applications, a taxable person taking part in that supply shall be
> presumed to be acting in his own name but on behalf of the provider of those services
> unless that provider is explicitly indicated as the supplier by that taxable person and
> that is reflected in the contractual arrangements between the parties.

So the default is: the site is the supplier. There is a stated escape — name the seller as
the supplier on the invoice and the receipt, and in the contract — and then the third
subparagraph slams it shut:

> For the purposes of this paragraph, a taxable person who, with regard to a supply of
> electronically supplied services, **authorises the charge to the customer or the delivery
> of the services, or sets the general terms and conditions of the supply, shall not be
> permitted to explicitly indicate another person as the supplier** of those services.

Read the three disqualifiers against §2.1 and §2.2 of this note:

| Art. 9a disqualifier | This site |
| --- | --- |
| authorises the charge to the customer | **Yes** — the destination charge is created on the platform's own account (§2.1) |
| or authorises the delivery of the services | **Yes** — the site's own database is what transfers the square |
| or sets the general terms and conditions of the supply | **Yes** — `/terms` are the site's, the $1 floor and the 10% are the site's (ticket 11/12) |

⚠️ **Any one of the three is enough. This site does all three.** The presumption cannot be
rebutted. There is no version of the resale model — as fixed by tickets 11 and 12 — that
escapes art. 9a, because the site is the thing that owns the board.

There is one carve-out, art. 9a(3), and it does not help:

> This Article shall not apply to a taxable person who only provides for processing of
> payments in respect of electronically supplied services … and who does not take part in
> the supply of those electronically supplied services.

That describes Stripe. It does not describe 200squares.

**Stripe says the same thing in its own words.**
<https://stripe.com/en-nl/guides/guide-to-sales-tax-and-vat-for-marketplace-sellers>
(read 2026-08-24):

> The following conditions define a marketplace as the facilitator of a sale: Setting the
> terms of the supply either directly or indirectly · Being involved in authorising the
> payment · Being involved in the delivery of the product. Meeting any of these three
> conditions would mean the marketplace becomes a deemed seller and is responsible for
> collecting VAT on certain sales that it facilitates. A platform is a deemed seller if it
> acts in its own name but on behalf of the seller. The deemed seller rule applies only if
> the marketplace is facilitating a B2C sale for: **Digital services** · Goods imported from
> non-EU countries in consignments not exceeding €150 · Goods of any value owned by non-EU
> sellers and located in the EU at the time of the sale.

Note "Digital services" is the first item. This is not an obscure reading.

**And the Netherlands?** There is **no separate Dutch enactment of art. 9a** — the whole
01-01-2026 Wet OB was searched for "elektronische interface", "platform", "portaal" and
"eigen naam". The only Dutch platform fiction, **art. 3c Wet OB**, is goods-only
("afstandsverkopen van uit een derdelandsgebied of een derde-land ingevoerde goederen in
zendingen met een intrinsieke waarde van niet meer dan € 150"). The own-name rule for
services is the generic commissionaire article, **art. 4 lid 4 Wet OB**:

> Diensten welke worden verleend door tussenkomst van een commissionair of dergelijke
> ondernemer die overeenkomsten sluit op eigen naam maar op order en voor rekening van een
> ander, worden geacht aan en vervolgens door die ondernemer te zijn verleend.

Art. 9a needs no Dutch enactment: the Regulation closes with "This Regulation shall be
binding in its entirety and directly applicable in all Member States."

⚠️ **The Belastingdienst has no published page on art. 9a, on the deemed-supplier rule for
electronically supplied *services*, or on platforms in relation to services.** Its
platform-fiction pages ("Ik lever goederen via een platform") cover goods only, and its
"digitale diensten" page does not mention advertising space. Those pages do not settle this
question either way. What the Belastingdienst *does* say, on the commissionaire page
"Bemiddeling bij overeenkomsten", is the answer to the ticket's question in one sentence:

> Als u de overeenkomst op eigen naam sluit, werkt u als commissionair. … U handelt dan
> alsof de goederen of diensten aan u geleverd worden. De leverancier stuurt u een factuur
> voor de goederen of diensten. Vervolgens stuurt u een factuur aan uw opdrachtgever, de
> koper. Naast de prijs voor goederen of diensten, berekent u daarbij uw provisie. **U
> berekent dan btw over het totale bedrag.**
> — <https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/btw_berekenen_aan_uw_klanten/waarover_btw_berekenen/diensten/bemiddeling_bij_overeenkomsten> (read 2026-08-24)

"Btw over het totale bedrag." The same page gives the contrasting case — "Bemiddelt u tussen
2 partijen die uiteindelijk met elkaar de overeenkomst sluiten? … U berekent dan btw over
deze vergoeding" — which is the *introduction-only* road of §4.3, and the only shape in
which the answer is the $15.

#### Step 4 — the tax base is the whole price, and nothing reduces it

Directive art. **73**:

> In respect of the supply of goods or services … the taxable amount shall include everything
> which constitutes consideration obtained or to be obtained by the supplier, in return for
> the supply, from the customer or a third party …

The consideration the site obtains from the buyer is $150. Not $15.

**There is no margin scheme.** Art. **311(1)(1)**:

> 'second-hand goods' means **movable tangible property** that is suitable for further use as
> it is or after repair …

A square is intangible — the same fact that kills DAC7 in §3 also kills the one relief that
would have taxed only the $15 spread. ⚠️ **The two answers pull in opposite directions:
intangibility saves the site from DAC7 and costs it the margin scheme.**

**And on most resales there is nothing to deduct on the other leg.** Under art. 28 the seller
makes a deemed supply to the site for $135. Art. **168(a)** allows deduction of

> the VAT due or paid in that Member State in respect of supplies to him of goods or
> services, carried out or to be carried out **by another taxable person**;

A private individual who bought one square for $100 is not a taxable person, charges no VAT
and issues no invoice. Two independent blockers, on the text: there is no VAT "due or paid",
and the supply is not "carried out … by another taxable person". The site's input VAT on that
leg is zero. A seller who *is* a Dutch BTW-ondernemer must invoice the site with VAT, which
the site then deducts — neutral, but it means the site has to know which kind of seller it is
dealing with, and ask.

**The EU legislature knows this asymmetry exists, and has just fixed it — for two other
sectors.** Council Directive (EU) **2025/516** of 11 March 2025 ("VAT rules for the digital
age", ViDA; OJ L 2025/516, 25.3.2025;
<https://publications.europa.eu/resource/celex/32025L0516>, read 2026-08-24) inserts a new
art. 28a making platforms the deemed supplier — and confines it, by name, to

> short-term accommodation rental services, namely the uninterrupted rental of accommodation
> to the same person for a maximum of 30 nights, or of passenger transport services by road

Recital (26) explains why those two and not others: the distortion "has been most acute in the
two largest sectors of the platform economy **behind e-commerce**". E-commerce is treated as
already handled — goods by art. 14a, electronically supplied services by art. 9a. ⚠️ **And
ViDA gives its art. 28a platforms exactly the relief art. 9a platforms do not get:**

> Where a taxable person is deemed to have received and supplied services in accordance with
> Article 28a, Member States shall **exempt** the supply of those services to that taxable
> person. (new art. 136c)

> Where a taxable person is deemed to have received and supplied services in accordance with
> Article 28a, those supplies shall **not affect the right of deduction** of that taxable
> person… (addition to art. 169)

There is no equivalent for an art. 9a supply. ViDA does not amend art. 28 (art. 28a opens
"Notwithstanding Article 28"), does not touch art. 9a, and its companion instruments
(Reg. (EU) 2025/517 and Implementing Reg. (EU) 2025/518) do not amend art. 9a either. Art. 28a
applies at the earliest from **1 July 2028** and at the latest from **1 January 2030**, at each
Member State's choice, and it will not reach a digital square when it arrives. **Nothing on
the legislative horizon improves this position.**

#### Step 5 — where the supply lands, and which rate

Art. **58(1)(c)**: for a non-taxable person, the place of supply of

> electronically supplied services, in particular those referred to in Annex II

is "the place where that person is established, has his permanent address or usually
resides". So a resale to a consumer in Germany is a German supply at the German rate, exactly
like a first-hand square. Art. **44** puts a supply to a business at the customer's place, and
art. **196** shifts the liability to that customer (reverse charge) where the supplier is not
established there. A consumer outside the EU is outside art. 58's reach.

The relief that matters at this size is art. **59c(1)**: art. 58 does not apply where the
supplier is established in only one Member State and

> the total value, exclusive of VAT, of the supplies referred to in point (b) does not in the
> current calendar year exceed **EUR 10 000** , or the equivalent in national currency, nor
> did it do so in the course of the preceding calendar year.

⚠️ **And here is the second sting.** The €10,000 is measured on *supplies* — "the total value
… of **the supplies**", not of the commissions — and under art. 28 the site's supply is the
whole $150. **Every resale burns roughly ten times more threshold than the commission
suggests.** Sixty-seven resales at $150 to EU consumers push the eenmanszaak over the line
and into OSS or 26 local registrations, on about $1,000 of actual income.

#### Step 5b — the eenmanszaak's own position: KOR, EU-KOR and OSS

**Wet OB art. 25a lid 1** — the KOR:

> Een ondernemer die in Nederland is gevestigd en van wie de **jaaromzet in Nederland** niet
> meer bedraagt dan **€ 20.000** kan kiezen voor toepassing van vrijstelling van belasting ter
> zake van door de ondernemer **in Nederland verrichte** leveringen van goederen en diensten.

And **art. 25 lid 1 onderdeel a** defines that turnover as "het totaal van **de vergoedingen**
ter zake van de volgende leveringen van goederen en diensten **verricht door een ondernemer**".
⚠️ **That is decisive for this ticket's question.** The vergoeding for the supply the site
makes is what counts — so if the site is the deemed supplier, its KOR turnover on a resale is
**$150**, and if it were a true intermediary it would be **$15**. The gross-versus-commission
question does not have a separate KOR answer; it collapses back into art. 9a. The
Belastingdienst says the same in plain words — "Uw omzet is het totaal van alle bedragen die u
aan uw klanten berekent, exclusief de btw" — and closes the obvious escape:

> Past u de margeregeling of de reisbureauregeling toe? Ga dan voor het bepalen van de omzet
> niet uit van de **winstmarge**, maar van het bedrag waarvoor u de goederen en/of diensten
> hebt geleverd.
> — <https://www.belastingdienst.nl/wps/wcm/connect/nl/btw/content/kor-voorwaarden> (read 2026-08-24)

Two thresholds, two different measures, and they interact badly:

| | Counts | Does not count |
| --- | --- | --- |
| **€20,000** KOR (art. 25a) | supplies taxed **in the Netherlands** | "prestaties die belast zijn in een ander land … telt niet mee" |
| **€10,000** art. 59c / art. 6k Wet OB | supplies to consumers in **other** Member States | domestic supplies |

So a resale to a German consumer escapes the KOR limit and consumes the €10,000 limit; a
resale to a Dutch consumer does the reverse. Both are counted at $150.

Above €10,000 the site must either register in every Member State of consumption or use the
**Unieregeling** (OSS). Art. **369b(c)** permits it for "a taxable person not established in
the Member State of consumption supplying services to a non-taxable person", and the last
sentence makes it all-or-nothing: "This special scheme applies to all those goods or services
supplied in the Community by the taxable person concerned." The Belastingdienst spells out the
alternative — "U bent niet verplicht om de Unieregeling te gebruiken. Kiest u ervoor om zelf
btw-aangifte te doen in het buitenland, dan moet u zich registreren in elk EU-land waar u btw
over uw diensten aan particulieren verschuldigd bent" — and one consequence that matters here:
"Btw die u hebt betaald in andere EU-landen kunt u niet terugvragen met de Unieregeling."

There is a genuine relief, and it is the one piece of good news in this section. Since
1 January 2025 the **EU-KOR** (art. 25a lid 2 Wet OB, "de jaaromzet in de Unie niet meer
bedraagt dan € 100.000") can exempt the cross-border supplies too, **and it combines with
OSS**:

> Maakt u gebruik van de Unieregeling? U kunt dan ook gebruikmaken van de EU-KOR. Maar alleen
> als uw omzet in de EU maximaal € 100.000 is in dit én vorig kalenderjaar … In elk EU-land
> waar u zakendoet kunt u dan kiezen of u een btw-vrijstelling wilt.
> — <https://www.belastingdienst.nl/wps/wcm/connect/nl/btw/content/deelnemen-aan-de-eu-kor-en-andere-btw-regelingen> (read 2026-08-24)

⚠️ But the EU-KOR is a quarterly filing of its own ("Wel moet u elk kwartaal een opgaaf
kwartaalomzet bij ons indienen"), it is per-country opt-in, and under art. 25a lid 4 the site
"heeft geen recht op aftrek van belasting" — no input deduction on Vercel, Convex, Stripe or
anything else. **UNSETTLED — whether the KOR/EU-KOR is worth taking at all is an accountant's
call for the whole business, not a resale question, and it is research 03's subject. What this
note contributes is the input: under art. 9a a resale counts at $150 in every one of these
tests, not at $15.**

#### Step 6 — what this does to the 10%, in money

The site owes VAT on $150. It keeps $15. There are exactly two ways to arrange that.

| | Buyer pays the listed price | Buyer pays the listed price + VAT |
| --- | --- | --- |
| Buyer pays | $150.00 | $181.50 |
| VAT at 21% | $26.03 (= 150 × 21/121) | $31.50 |
| Paid to seller | $135.00 | $135.00 |
| Stripe (§6.3, EEA card) | ≈ $7.94 | ≈ $9.04 |
| **Left to the site** | **≈ −$18.97** | **≈ $5.96** |

⚠️ **Pricing a resale VAT-inclusive, the way the board prices a first-hand square at "$100
flat", turns every EU resale into a nineteen-dollar loss.** The site must charge VAT *on top*
of the seller's listed price. That is a visible product change: the market's prices stop
matching what the buyer is charged, and the amount added depends on where the buyer lives.
The board's own copy — "a square stays $100, flat" — does not survive contact with the
market's pricing.

Note the asymmetry that follows: a resale to a **non-EU consumer** carries no EU VAT at all,
and a resale to an **EU business** is reverse-charged. Only the EU-consumer case takes the
hit, and it is the most likely case.

#### Step 7 — what Stripe does, and the one thing it will not do

Stripe's marketplace path exists and matches this analysis exactly.
<https://docs.stripe.com/tax/tax-for-marketplaces> (read 2026-08-24) is explicitly for
platforms where the platform is liable:

> Many countries and US states require marketplace operators to collect sales tax and VAT on
> their facilitated sales. The US refers to these businesses as marketplace facilitators,
> while other regions, such as Europe, might refer to them as **deemed sellers**.

The integration is `automatic_tax[liability][type]=self` plus
`payment_intent_data[transfer_data][destination]`, and — a trap worth writing into the build
ticket — Stripe does **not** withhold the tax for you on a destination charge:

> You must make sure that the tax collected is transferred to your marketplace account, so
> that you can then remit the tax to relevant jurisdictions.

> To withhold the collected tax amount for a Checkout Session or Payment Link integration use
> a transfer reversal … include an amount with the value to be reversed from the connected
> account to your platform equivalent to the total tax amount present in the Checkout Session
> object.

So the site must fire a **transfer reversal** on `checkout.session.completed` for the tax, on
top of the `application_fee_amount`, or it pays the VAT out of its own pocket. Stripe also
notes it ignores the seller entirely for tax purposes:

> We calculate taxes based on your platform's head office location, preset tax code, and tax
> registrations. **We don't use the connected account information for tax purposes.**

⚠️ **And the one thing Stripe will not do: tax the commission.** Neither
<https://docs.stripe.com/tax/tax-for-marketplaces> nor
<https://docs.stripe.com/tax/tax-for-platforms> (both read 2026-08-24) documents any way to
calculate or collect VAT on the `application_fee_amount` itself — the phrase "application
fee" does not appear on either page. Under art. 28 that is *correct*, because under the
deemed-supplier fiction there is no separate commission service to tax: the $15 is just the
site's margin between two supplies it is deemed to make. But it means there is no Stripe
feature to fall back on if an accountant ever concludes the site is a true agent instead.

`docs.stripe.com/tax/connect` states the rest plainly:

> The first step for using Stripe Tax with Connect requires you to determine which entity has
> the obligation to collect and report taxes. … Consult with a tax advisor who understands
> your business model to determine the tax obligations for both your platform and your
> connected accounts.

Stripe will not make this call. Neither will this note. But the text of art. 9a leaves very
little room, and every fact it turns on is a fact this product cannot change.

#### For completeness — the branch where the site is a true intermediary

If, contrary to the above, the site were a genuine disclosed agent charging a 10% service to
the seller, the answer would be different and also worse to operate: art. **44** would put a
commission charged to a business seller at the seller's place (reverse charge under art.
**196** for a non-Dutch EU business, Dutch VAT for a Dutch one), while art. **46** puts an
intermediary service to a **non-taxable** person at "the place where the underlying
transaction is supplied" — which for an electronically supplied service is the *buyer's*
country under art. 58. A consumer seller in Spain selling to a consumer buyer in Poland would
generate a Polish-rate commission. **That branch is not available here** — art. 9a's third
subparagraph forbids it — and it is recorded only so that nobody reaches for it later as the
cheap answer. It is not cheaper.

## 3. DAC7

**Verdict: DAC7 does not apply to this site. Two independent grounds, neither of them a
grey area.** Sources fetched 2026-08-24 from the EU Publications Office Cellar
(`publications.europa.eu/resource/celex/32021L0514`, and the consolidated Directive
2011/16/EU as in force 01-01-2026, `02011L0016-20260101`, checked so that nothing later —
DAC8 / Directive (EU) 2023/2226 — altered these definitions; it did not), plus
`wetten.overheid.nl/BWBR0003954` (WIB) and the Belastingdienst DAC7 pages and FAQ.

### 3.1 Ground one — a square is not "Goods", because Goods means tangible property

Annex V, Section I, **C(9)**: *"'Goods' means any tangible property."* Dutch text:
*"'Goederen': elke lichamelijke zaak."* WIB art. 2e sub x: *"goederen: alle materiële
zaken;"*

Belastingdienst DAC7 FAQ **Q22**: *"Onder het begrip goederen wordt verstaan alle
materiële zaken. Voor materiële zaken wordt aangesloten bij Richtlijn 2006/112/EG (de BTW
Richtlijn). Hierdoor valt de verkoop van immateriële activa of goederen, zoals muziek,
film, software, energierechten of vouchers, niet onder de definitie van goederen."*
FAQ **Q7** applies this to a purely digital item: it is *"niet tastbaar en daardoor geen
fysiek goed"*.

A square is intangible. It is not Goods, not a Personal Service (I.A(11): *"a service
involving time- or task-based work performed by one or more individuals"*), not immovable
property, not a mode of transport. **No Relevant Activity → no Platform → no reporting
duty.** Calling it "advertising space" does not help: it stays intangible, and I.A(1)(b)
separately excludes software that only lets *"users to list or advertise a Relevant
Activity"*.

This is the **durable** ground: it does not depend on legal form and survives
incorporation.

### 3.2 Ground two — an eenmanszaak cannot be a Platform Operator

Annex V I.A(2): *"'Platform Operator' means an **Entity** that contracts with Sellers…"*
I.C(1): *"'Entity' means a legal person or a legal arrangement, such as a corporation,
partnership, trust or foundation."* An eenmanszaak is neither. The Belastingdienst says it
outright:

> "Een eenmanszaak is geen platformexploitant voor DAC7 en hoeft dus niet te rapporteren."
> (<https://www.belastingdienst.nl/wps/wcm/connect/nl/ondernemers/content/informatie-voor-platformexploitanten-dac7>)

**This ground disappears the day the business becomes a BV.** Ground one does not.

### 3.3 What is NOT a way out: size

There is **no platform-size de minimis anywhere in the directive**. The only thresholds
are per-seller. Belastingdienst: *"Grote en kleine platformen en platformexploitanten
kunnen vallen onder de rapportageplicht."* A 199-square site with trivial turnover gets no
pass for being small. Relief for a small platform is not a threshold but the **Excluded
Platform Operator** beschikking (I.A(3)), which must be demonstrated *"upfront and on an
annual basis to the satisfaction of the competent authority"*, by **31 January** following
the reportable year. It is not needed here — the Belastingdienst says to file that form
only if the platform check says you *do* have to report.

### 3.4 The per-seller carve-out, for the record

Annex V I.B(4)(d) — an Excluded Seller is one *"for which the Platform Operator facilitated
**less than 30** Relevant Activities by means of the sale of Goods and for which the total
amount of Consideration paid or credited did not exceed **EUR 2 000** during the Reporting
Period."* The test is **conjunctive** — both limbs must hold — and is counted per seller,
per operator, per period. Most casual resellers on a 199-square board would fall inside it
anyway.

### 3.5 Handling the money is not what triggers DAC7

Worth knowing, because it kills a tempting escape route. I.A(1): a Platform is software
*"allowing Sellers to be connected to other users…"* and *"**also** includes any
arrangement for the collection and payment of a Consideration"* — payment handling is an
**additional** inclusion, not a precondition. A connect-only site that knows the prices is
squarely in scope. What matters is knowability: Consideration is defined in I.A(10) as
compensation *"the amount of which is known or reasonably knowable by the Platform
Operator."* So **"introduction only" (§4) does not escape DAC7 by itself** — it escapes
only because a square is intangible.

### 3.6 What would be owed if it did apply

For calibration, since the answer could change on incorporation *and* a tangible add-on:
seller identification per II.B (name, Primary Address, TIN or place of birth, VAT number,
date of birth; for entities also business registration number), the Financial Account
Identifier, due diligence **by 31 December of the Reportable Period**, reporting **by 31
January** to both the Belastingdienst and the seller (III.A(5), WIB art. 10o), quarterly
figures, a 7-year Dutch retention (Uitvoeringsbesluit art. 10(2), via AWR art. 52), an AVG
notification duty to each natural person **before** reporting (WIB art. 10p), and the
IV.A(2) enforcement duty: after two reminders and not before 60 days from the initial
request, the operator must **close the seller's account or withhold their money**.

**Penalty exposure:** WIB art. 11(3) — for **opzet of grove schuld** — a bestuurlijke boete
up to the sixth category, **EUR 1 100 000** since 1 January 2026 (Stb. 2025, 401). The
Belastingdienst FAQ Q31 still quotes the old EUR 1 030 000; it has not been updated.
WIB art. 11(6) also opens the criminal route, with the usual *"te weinig belasting"*
requirement stripped out.

### 3.7 Non-EU sellers, and one surprise

Reportable Seller (I.B(3)) means an Active Seller *"resident in a Member State"* or renting
out EU immovable property — so non-EU sellers are generally out. **But the Dutch definition
is wider than the directive**: WIB art. 2e sub n pulls in residents of a *gekwalificeerd
niet-Unierechtsgebied*, and per the Belastingdienst that means, **since 2025**, sellers
tax-resident in **Canada and the United Kingdom** (goods, immovable property, transport,
personal services) and **New Zealand** (personal services, immovable property). "Non-EU" is
no longer a clean exemption line. Irrelevant while squares stay intangible; relevant the
moment they do not.

### 3.8 What would change this answer

- **Incorporating into a BV** — removes ground two. Ground one still holds.
- **Anything tangible** — shipping a physical print or canvas of a square, bundled
  merchandise. That engages the sale of Goods and the EUR 1 100 000 exposure becomes live.
- **Human work commissioned through the site** — custom artwork to order engages the
  Personal Service limb independently of tangibility.

For written comfort, the Belastingdienst DAC7 helpdesk takes concrete (non-hypothetical)
cases with your own analysis at `DAC7@belastingdienst.nl` (FAQ Q35).

## 4. The cheaper roads

### 4.1 A constraint that sits over both roads: Stripe's own rulebook

Before the law, there is the contract. `https://stripe.com/legal/restricted-businesses`
("Last updated: 2026-05-13", read 2026-08-24) splits the world into **prohibited**
("Industries that can't use Stripe, and products Stripe doesn't support") and
**restricted** ("Industries and products that require additional due diligence"). Three
bullets on that page point straight at this product, and they were not in the ticket.

⚠️ **The resale model itself is a *restricted* business.** Under **Third-party agents**:

> Payment facilitation and aggregation (including receiving settlement proceeds for goods
> or services that you did not provide, on behalf of one or multiple third-party sellers)

That is a literal description of a destination charge for someone else's square. The
consequence is spelled out at the head of the Restricted list:

> Businesses in these categories require additional due diligence by Stripe in order to
> confirm our ability to support them. When you create your Stripe account, you will be
> asked to provide additional information (such as proof of relevant licences or more
> details about your business model) to confirm your eligibility to use Stripe. Due to
> card network rules, requirements of financial partners and our own compliance and legal
> obligations, if your business falls into one of the categories below, Stripe might not
> be able to grant approval for your business to use our products. If we do provide
> approval, note that the approval is specific to each service offer and it may be
> modified or revoked by Stripe at any time per the terms of the Stripe Services
> Agreement.

So resale is not a switch the dev flips. It is an application, with "proof of relevant
licences" possibly asked for (see §5), which Stripe may refuse and may later revoke.
The primary $100 sale is not affected — that is the site selling its own product.

⚠️ **Site credit is a *restricted* business too.** Under **Non-fiat currency and stored
value**, on the same page:

> Sale of stored value or credits maintained, accepted and issued by anyone other than the
> seller. Seller-maintained stored value or credits may be subject to limits.

> Pre-loaded payment cards, gift cards, virtual credits or other products and services in
> which a monetary value is stored within the item (digital or physical)

Read carefully, the first bullet's restriction bites on credits issued by *someone other
than the seller*; site credit issued, maintained and accepted by 200squares itself is the
better half of that sentence — but the same sentence then says such credit "may be subject
to limits", and the second bullet ("virtual credits … in which a monetary value is stored")
has no such carve-out. **The cheaper road is not outside Stripe's due-diligence net.** It
is a different queue, not no queue.

Two more bullets are worth knowing about even though they most likely do not bite. Both sit
under **Prohibited Businesses → Unfair, deceptive or abusive acts or practices**:

> No-value-added services, including the sale or resale of a service without added benefit
> to the buyer and resale of government offerings without authorisation or added value

> Sales of online traffic or engagement

The site sells advertising space and reports clicks; it does not sell traffic, and a resold
square carries real advertising value to its buyer. Neither bullet is aimed at this
product. But "introduction only" (§4.3), where the site takes a cut for doing nothing but
showing a listing, moves *towards* the first one rather than away from it. Worth a sentence
of care in how any listing fee is described.

### 4.2 Site credit instead of a cash payout

**What it removes is real, and larger than the ticket assumed. What it does not remove is
the VAT.**

#### What it removes

No cash leaves the site, so there is no payout rail, and everything hanging off the payout
rail goes with it:

- **No Connect, no connected account, no KYC.** Nothing in §1.4 applies. No
  `individual.dob`, no `external_account`, no 7-day payout pause, no government ID scan.
- **No €2 monthly active-account fee and no 0.25% + €0.10 payout fee** (§6.3). The card
  charge is the site's own, exactly like a first-hand square.
- **⚠️ The 43-country limit disappears.** This is the biggest and least obvious win. §1.5
  restricts *sellers* to about forty countries because payouts must land in a bank account
  Stripe can reach. Credit needs no bank account. **A credit-only market can be worldwide,
  and the cash market cannot.** That repairs the product hole §1.5 opened.
- **The chargeback becomes recoverable.** §1.3's nightmare is that the seller was paid and
  is gone. With credit, the site still holds the value; a dispute is answered by clawing
  back credit it issued itself. The €20 dispute fee and the disputed $150 still hit the
  platform, but the $135 is not lost to a stranger.

#### Is the credit itself regulated? — on the text, no. Twice.

**Not e-money.** Directive 2009/110/EC (EMD2) art. 2(2), consolidated as in force
13-01-2018 (<https://publications.europa.eu/resource/celex/02009L0110-20180113>, read
2026-08-24):

> 'electronic money' means electronically, including magnetically, stored monetary value as
> represented by a claim on the issuer which is issued on receipt of funds for the purpose
> of making payment transactions … **and which is accepted by a natural or legal person
> other than the electronic money issuer**;

The limbs are cumulative. Credit accepted **only by 200squares** fails the last one. It is
not e-money, and EMD2 art. 11's redemption duty — "upon request by the electronic money
holder, electronic money issuers redeem, at any moment and at par value, the monetary value
of the electronic money held" — never engages. ⚠️ **That last point is worth holding on to:
if the credit were e-money, the site would be legally obliged to convert it back to cash on
demand, which would destroy the whole reason for taking this road.** Non-cashability is not
a nicety; it is what keeps the road open.

EMD2 art. 1(4) adds a second, independent exit: "This Directive does not apply to monetary
value stored on instruments exempted as specified in Article 3(k) of Directive 2007/64/EC"
— now PSD2 art. 3(k), which excludes

> services based on specific payment instruments that can be used only in a limited way,
> that meet one of the following conditions: (i) instruments allowing the holder to acquire
> goods or services **only in the premises of the issuer** or within a limited network of
> service providers under direct commercial agreement with a professional issuer;
> (ii) instruments which can be used only to acquire a **very limited range** of goods or
> services;

(<https://publications.europa.eu/resource/celex/02015L2366-20240408>, read 2026-08-24.)
Credit spendable only on 200squares, only on squares and banner bids, meets (i) and (ii)
both. Dutch law says the same twice over: **Wft art. 1:1** defines elektronisch geld as value
"waarmee betalingen kunnen worden verricht aan **een andere persoon dan de uitgever**", and
**Wft art. 1:5** takes instruments under art. 1:5a lid 2 onderdeel k out of the Act entirely.
The prohibition it would otherwise trip is **Wft art. 2:10a lid 1** — "Het is een ieder met
zetel in Nederland verboden zonder een daartoe door de Nederlandsche Bank verleende vergunning
elektronisch geld uit te geven" (<https://wetten.overheid.nl/BWBR0020368>, version geldend
2026-08-15, read 2026-08-24).

⚠️ **One nuance if the analysis ever goes the other way.** EMD2 art. 11(7): "redemption rights
of a person, **other than a consumer**, who accepts electronic money shall be subject to the
contractual agreement". So even in the bad case, a business seller's redemption right could be
shaped by contract; a private individual's could not. That is a reason to know which kind of
seller you are crediting — the same reason §2.3 gives.

There is a reporting trip-wire, PSD2 **art. 37(2)**, and it is nowhere near:

> Member States shall require that service providers carrying out either of the activities
> referred to in points (i) and (ii) of point (k) of Article 3 … for which the total value
> of payment transactions executed over the preceding 12 months exceeds the amount of
> **EUR 1 million**, send a notification to competent authorities…

In Dutch law that duty sits in **Besluit Markttoegang financiële ondernemingen Wft art. 1a**
(<https://wetten.overheid.nl/BWBR0020413>, version geldend 2026-07-24, read 2026-08-24), and
DNB runs it through the Digitaal Loket Toezicht, publishing the result inside the
Betaalinstellingen register — 82 firms are listed under it today, among them Albert Heijn,
Jumbo, Apple Distribution International, Airbnb Ireland and Zalando Payments
(<https://www.dnb.nl/voor-de-sector/open-boek-toezicht/wet-regelgeving/psd2/procedure-voor-het-melden-van-een-uitzondering/>,
gepubliceerd 22 september 2017, read 2026-08-24; register figures from DNB's own daily CSV
download, 2026-08-24). A 199-square board cannot reach €1,000,000 in credit turnover.

**UNSETTLED only in one direction: if credit were ever made spendable outside the site, or
cashable, both exits close at once** — and ⚠️ **EMD2 art. 2(2) has a second limb this note
cannot close either.** It requires the value to be "issued on receipt of funds", and in this
design the seller hands over no funds; the buyer's card money reaches the site. Whether that
is "receipt of funds" as against the credit holder is not settled by the text. Keep the credit
closed-loop and non-cashable, or do not do it.

#### Where it does bite: vouchers

Site credit **is a voucher**. Directive 2006/112/EC art. **30a(1)**, as inserted by Council
Directive (EU) 2016/1065 (<https://publications.europa.eu/resource/celex/32016L1065>):

> 'voucher' means an instrument where there is an obligation to accept it as consideration
> or part consideration for a supply of goods or services and where the goods or services to
> be supplied or the identities of their potential suppliers are either indicated on the
> instrument itself or **in related documentation, including the terms and conditions of use
> of such instrument**;

Both limbs hold: the site is bound to accept it, and the T&Cs say what it buys. Recital (4)
of 2016/1065 excludes mere discount instruments — "instruments entitling the holder to a
discount upon purchase … but carrying no right to receive such goods or services should not
be targeted by these rules" — and this is not one.

Then art. **30a(2)–(3)**:

> 'single-purpose voucher' means a voucher where **the place of supply** of the goods or
> services to which the voucher relates, **and the VAT due** on those goods or services, are
> known **at the time of issue** of the voucher; … 'multi-purpose voucher' means a voucher,
> other than a single-purpose voucher.

⚠️ **On the design as charted, it is a single-purpose voucher**, because everything it buys
is the same kind of electronically supplied service, the site is the sole supplier, and the
holder is a known account with a known country. And art. **30b(1)** then moves the tax
forward to the moment the credit is granted:

> Each transfer of a single-purpose voucher made by a taxable person acting in his own name
> shall be regarded as a supply of the goods or services to which the voucher relates. The
> actual handing over of the goods or the actual provision of the services in return for a
> single-purpose voucher … shall not be regarded as an independent transaction.

The Belastingdienst states the consequence flatly:

> Bij enkelvoudige vouchers is op het moment van de uitgifte van de bon al bekend wat de
> btw-gevolgen zijn. … **De btw moet afgedragen worden bij de uitgifte van de voucher.** Bij
> het inwisselen van de voucher is dus geen btw meer verschuldigd.
> — <https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/bijzondere_regelingen/vouchers-zegels-waardebonnen/vouchers-zegels-waardebonnen> (read 2026-08-24)

If instead the credit is transferable, or its holder's country can change, or a banner bid
can redeem against a supply someone else makes, art. 30a(2) is not satisfied at issue and it
becomes a **multi-purpose** voucher: no VAT on issue, VAT at redemption on "the consideration
paid for the voucher" (art. 73a). ⚠️ **UNSETTLED — which of the two it is turns on facts the
build ticket has not fixed yet, and the directive does not settle it for a borderline case.
Decide non-transferability and a fixed account country deliberately, because that decision
picks the tax point.**

⚠️ **And one thing the voucher articles do not answer at all.** Arts. 30a, 30b and 73a govern
the VAT treatment of a voucher *sold* for money. **They say nothing about whether credit
issued to a seller, as payment for that seller's deemed supply of a square to the site, is
itself a voucher transfer.** The texts do not settle it. That is the exact transaction this
road is built on, and it needs an accountant.

#### What site credit does NOT fix

⚠️ **It does not touch §2.3.** The buyer still pays the site $150 by card for a square, the
site is still the deemed supplier under art. 9a — it still authorises the charge, still
authorises the delivery, still sets the terms — and it still owes VAT on the whole $150 with
nothing to deduct on the seller leg. **Every number in §2.3 is unchanged.** Paying the seller
in credit changes what the site hands over, not what it supplies.

⚠️ **It does not help with DAC7 either way.** §3 already puts DAC7 out of scope. But note for
the record that credit would have counted: Annex V I.A(10) defines Consideration as
compensation "paid **or credited** to a Seller". Site credit is credited. If DAC7 ever
applied (a BV, or anything tangible — §3.8), this road would not dodge it.

⚠️ **It is still a Stripe restricted business** — §4.1, "Sale of stored value or credits …
Seller-maintained stored value or credits may be subject to limits."

⚠️ **It creates a liability that does not go away.** Every dollar of unspent credit is money
the site owes in squares. The Voucher Directive deliberately leaves breakage alone — recital
(12): "This Directive does not target the situations where a multi-purpose voucher is not
redeemed by the final consumer during its validity period, and the consideration received for
such voucher is kept by the seller" — and for a single-purpose voucher the Belastingdienst
says a refund of the VAT requires actually taking it back and repaying: "U moet dan wel de
voucher terugnemen en de vergoeding terugbetalen aan de consument." **UNSETTLED — how long an
unredeemed credit balance survives as a civil claim under Dutch law could not be established
from a primary source: wetten.overheid.nl serves Burgerlijk Wetboek Boek 3 with its article
bodies collapsed and they did not render to automated fetch on 2026-08-24. This note does not
guess at a limitation period.**

⚠️ **It collides with the banner auction.** Charting fixed the auction on **card holds** — a
bid is an authorization, captured at 00:00 UTC. Credit cannot be authorized and captured; it
can only be reserved in the site's own ledger. Letting credit bid means building a second,
parallel bidding mechanism with its own failure modes, or excluding credit from the auction
and shrinking what it is good for — which in turn makes the "very limited range" argument
under PSD2 art. 3(k)(ii) *stronger* and the product *weaker*. Pick one deliberately.

### 4.3 Introduction only

The site shows the listing, the two parties settle between themselves, the site takes
nothing. It is the only road that genuinely escapes everything — and it escapes by giving up
the thing the road was built for.

**What it escapes.** No Connect, no KYC, no connected account, no payout, no chargeback (the
site never took the money), no PSD2 question (§5), no merchant-of-record duty (§2.2), no
Stripe restricted-business application for payment facilitation (§4.1), and no VAT on $150 —
because the site makes no supply of the square. The Belastingdienst's own contrast case:

> Bemiddelt u tussen 2 partijen die uiteindelijk met elkaar de overeenkomst sluiten?
> Bijvoorbeeld als makelaar? Dan gelden uw werkzaamheden als dienst. Voor deze dienst brengt
> u een vergoeding in rekening aan uw opdrachtgever. **U berekent dan btw over deze
> vergoeding.**

⚠️ **But only if the vergoeding is nothing.** The moment the site charges *anything* for the
resale — a listing fee, a success fee, a "featured listing" — two things happen at once.
First, art. 46 does **not** apply, because it reaches only "an intermediary acting **in the
name and on behalf of** another person", and this site trades in its own name on its own
board; a commission to a consumer seller would fall under art. 45 (Dutch VAT) and to a
business seller under art. 44 with art. 196 reverse charge — three regimes for one fee.
Second and much worse, **art. 9a comes back.** Its third disqualifier is "sets the general
terms and conditions of the supply" and its second is "authorises **the delivery of the
services**" — and the site's own database is what moves the square from one owner to the
other. A site that owns the board authorises every delivery on it, by construction. **Taking
a fee while controlling the ledger is the worst of both worlds: the deemed-supplier VAT of
§2.3 on $150, and none of the $15.** The only safe version of this road is the literal one:
the site takes nothing at all.

**DAC7 is not a reason to prefer this road.** §3.5 already establishes that "introduction
only" does not escape DAC7 by itself — Annex V I.A(1) makes payment handling an *additional*
inclusion, not a precondition, and a connect-only site that knows the prices is squarely in
scope. It escapes here only because a square is intangible, which is equally true of the
other two roads.

⚠️ **What it costs is the product.** Ticket 12 asks how two strangers trust each other. This
road answers: they do not, and the site does not help. There is no escrow, so the buyer pays
first and hopes, or the seller transfers first and hopes. And the site cannot stand aside,
because the site is still the thing that flips the ownership row — it becomes the arbiter of
every "I paid and he never transferred it" dispute, with no money to settle it and no
evidence of what happened off-site. It also brushes §4.1's prohibited category
"No-value-added services, including the sale or resale of a service without added benefit to
the buyer", which is not aimed at this but is not a good neighbourhood either.

And it kills the 10%, which is the whole revenue case for resale existing.

## 5. Money held for someone else — PSD2

### 5.1 Where the money actually sits, and how long the site may sit on it

Start with the mechanics, because they decide how much of the legal question is even
live. With destination charges the buyer's money lands in the **platform's** Stripe
balance and Stripe moves it to the seller's connected-account balance; neither balance is
a bank account the eenmanszaak controls.
`https://docs.stripe.com/connect/account-balances` (read 2026-08-24):

> Both your platform account and a connected account are nothing more than regular Stripe
> accounts, each with their own separate account balance.

The same page has a section called **Holding funds**, and its advice is unusually blunt:

> We recommend that platforms hold funds only when there's a clear purpose and a commitment
> to transfer them or pay them out when an event occurs or a precondition is satisfied.

> We advise against platforms holding funds arbitrarily, and instead paying out to their
> connected accounts as soon as they're identified. This is usually when the charge is
> made. **If you aren't sure about holding funds, speak with your legal advisor.**

And there is a hard ceiling that is not the platform's to set:

| Country | Holding Period |
| --- | --- |
| Thailand | 10 days |
| United States | 2 years |
| All other countries | 90 days |

Stripe frames that table as "For compliance reasons, we can hold funds in reserve for a
period of time that's based on the country the business is in" — that is Stripe's own
reserve power, not a permission granted to the platform.

**The design consequence is the useful part.** A square is delivered the instant the
database row changes: there is no shipment, no service window, nothing to wait for. So
there is no "clear purpose" for holding a resale's money at all, and the site should pay
the seller out immediately. That is also the shape that keeps §5.2's legal question at its
smallest — the site never sits on a stranger's money.

⚠️ It also removes the only cheap defence against §1.3. Immediate payout means the seller's
Stripe balance is empty when a chargeback lands eight weeks later, and the transfer
reversal has nothing to bite on. Holding money would help — and is exactly what Stripe
advises against and what §5.2 makes riskier. **These two pressures point in opposite
directions and there is no configuration that satisfies both.**

### 5.2 Is this a regulated payment service?

All PSD2 text below from the consolidated Directive (EU) 2015/2366 as in force **08-04-2024**
(<https://publications.europa.eu/resource/celex/02015L2366-20240408>, the latest consolidation
— `-20250101`, `-20260101` and `-20241009` all return 404) and, for the recitals which the
consolidated text omits, the directive as published
(<https://publications.europa.eu/resource/celex/32015L2366>). Both read 2026-08-24; the
articles quoted here are word-for-word identical in the 2015 and 2024 consolidations.

**The activity is on the list.** Art. 4(3): "'payment service' means any business activity
set out in Annex I". Annex I item **3** is "Execution of payment transactions, including
transfers of funds on a payment account … (b) execution of payment transactions through a
payment card or a similar device"; item **5** is "Issuing of payment instruments and/or
acquiring of payment transactions"; item **6** is "Money remittance", defined in art. 4(22)
as a service "where funds are received from a payer, without any payment accounts being
created in the name of the payer or the payee, for the sole purpose of transferring a
corresponding amount to a payee". Taking a buyer's card money and passing $135 of it to a
seller is, described neutrally, item 6.

**The commercial-agent exclusion, art. 3(b), verbatim:**

> payment transactions from the payer to the payee through a commercial agent authorised via
> an agreement to negotiate or conclude the sale or purchase of goods or services on behalf
> of **only the payer or only the payee**;

⚠️ **"Only the payer or only the payee" is the whole game, and PSD2 narrowed it deliberately
to catch platforms exactly like this one.** Recital (11) of the directive as published says
so in as many words:

> The exclusion from the scope of Directive 2007/64/EC of payment transactions through a
> commercial agent on behalf of the payer or the payee is applied very differently across the
> Member States. Certain Member States allow the use of the exclusion by **e-commerce
> platforms that act as an intermediary on behalf of both individual buyers and sellers**
> without a real margin to negotiate or conclude the sale or purchase of goods or services.
> Such application of the exclusion goes beyond the intended scope set out in that Directive
> … To address those concerns, the exclusion should therefore apply when agents act only on
> behalf of the payer or only on behalf of the payee, regardless of whether or not they are
> in possession of client funds. **Where agents act on behalf of both the payer and the payee
> (such as certain e-commerce platform), they should be excluded only if they do not, at any
> time enter into possession or control of client funds.**

A resale market serves both sides by definition. So art. 3(b) is available to this site only
on the "does not, at any time enter into possession or control of client funds" limb — which
is precisely the question §5.1 is about, and precisely what "Holding funds" would destroy.

**The prohibition, in both texts, and the thing that makes it strange here.** PSD2 art.
**37(1)**:

> Member States shall prohibit **natural** or legal persons that are neither payment service
> providers nor explicitly excluded from the scope of this Directive from providing payment
> services.

Dutch enactment, **Wft art. 2:3a lid 1** (<https://wetten.overheid.nl/BWBR0020368>, which
redirects to the version "geldend van 2026-08-15"; read 2026-08-24):

> Het is een ieder met zetel in Nederland verboden zonder een daartoe door de Nederlandsche
> Bank verleende vergunning het bedrijf uit te oefenen van betaaldienstverlener.

And the exclusion, in Dutch, is **Wft art. 1:5a lid 2 onderdeel b** — in the Wft itself, not
in the Besluit uitvoering Wft:

> het verrichten van betalingstransacties tussen de betaler en de betalingsbegunstigde, die
> worden uitgevoerd via een handelsagent die krachtens een overeenkomst gemachtigd is om
> **voor rekening van alleen de betaler of alleen de betalingsbegunstigde** de verkoop of
> aankoop van goederen of diensten via onderhandelingen tot stand te brengen of te sluiten;

⚠️ **Now the trap.** PSD2 art. **11(1)** says authorisation "shall only be granted to a
**legal person** established in a Member State", while art. 37(1) prohibits **natural**
persons from providing payment services unless excluded. Put together: **an eenmanszaak that
needed a licence would be forbidden to operate and unable to obtain one.** The same fact that
takes the site out of DAC7 in §3.2 becomes a wall here. There is no "apply and carry on".

**And the Dutch small-provider exemption is closed to this business on two independent
grounds.** DNB publishes the conditions of art. 1a Vrijstellingsregeling Wft
(<https://www.dnb.nl/voor-de-sector/open-boek-toezicht/sectoren/betaalinstellingen/vergunningaanvraag-betaaldiensten-overzichtspagina/vrijstelling-vergunningplicht/>,
gepubliceerd 19 februari 2019, read 2026-08-24):

> De betaaldiensten die u voornemens bent te verrichten, zijn een of meer van de betaaldiensten
> zoals bedoeld onder 1 tot en met 5 van de bijlage bij de Europese richtlijn betaaldiensten …
> **Voor betaaldienst 6 (geldtransfers)**, 7 (betalingsinitiatiediensten) en 8
> (rekeninginformatiediensten) **geldt artikel 1a van de Vrijstellingsregeling Wft niet.**

> **U verleent uitsluitend betaaldiensten in Nederland.**

> Het gemiddelde van het totale bedrag van de betalingstransacties die in de voorafgaande
> twaalf maanden zijn verricht, is niet hoger dan EUR 3 miljoen per maand.

⚠️ Taking a buyer's money for the sole purpose of passing a corresponding amount to a seller
is **Annex I item 6, money remittance** (art. 4(22)) — the one service the Dutch exemption
explicitly does not cover. And the site sells worldwide, so "uitsluitend betaaldiensten in
Nederland" fails too. **The €3,000,000 ceiling, which this site would never approach, is not
the binding constraint. The category is.**

### 5.3 What DNB actually says about platforms — and it is not comfortable

DNB has published on exactly this question since 2017, and the earlier draft of this note was
wrong to record it as unreachable: dnb.nl returns HTTP 403 to plain automated fetch, but
serves normally to a full browser header set.
<https://www.dnb.nl/voor-de-sector/open-boek-toezicht/wet-regelgeving/psd2/elektronische-handelsplatformen-e-commerce-platforms-psd2/>
(Q&A, gepubliceerd 26 oktober 2017, read 2026-08-24):

> Elektronische handelsplatformen zijn websites of apps voor het bijeenbrengen van vraag en
> aanbod van goederen en diensten (van derden). Die activiteiten vallen in beginsel buiten het
> toezicht van DNB. Maar als een handelsplatform daarbij ook zelf betaaldiensten aanbiedt,
> valt die activiteit vanaf de invoering van de PSD2 in beginsel wél onder het toezicht van
> DNB.

⚠️ And then DNB describes this site's funds flow, and calls it a payment service:

> **De PSD2 is van toepassing als een elektronisch handelsplatform de betaling van de koper
> aan de verkoper faciliteert. Bij een aankoop ontvangt het platform de gelden van de koper op
> een eigen rekening of op een rekening van een aan het platform gelieerde stichting
> derdengelden. Daarna betaalt het platform de verkoper. Omdat gedurende enige tijd het geld
> op een rekening van het platform staat, bestaat een financieel risico.**

> Vanaf moment van implementatie zijn elektronische handelsplatformen die zelf betaaldiensten
> verlenen vergunningplichtig, **ongeacht of de betaaldiensten een hoofd- of nevenactiviteit
> zijn voor het platform.**

That last clause removes the obvious defence — "but payments are a side-activity of an
advertising site". DNB says the split does not matter. Its threshold for "het bedrijf
uitoefenen van" is deliberately low
(<https://www.dnb.nl/voor-de-sector/open-boek-toezicht/sectoren/betaalinstellingen/vergunningaanvraag-betaaldiensten-overzichtspagina/reikwijdte-betaaldienstverlening/>,
gepubliceerd 29 mei 2012, read 2026-08-24):

> Het is in het algemeen niet eenvoudig precies aan te geven waar wel en waar niet sprake is
> van 'het bedrijf uitoefenen van'. **DNB hanteert hier een laagdrempelige aanpak; in de
> praktijk wordt snel geconcludeerd dat een betaaldienst als 'zelfstandig identificeerbare
> activiteit' geldt.**

**And DNB closes art. 3(b) for a two-sided market in one sentence**
(<https://www.dnb.nl/voor-de-sector/open-boek-toezicht/sectoren/betaalinstellingen/vergunningaanvraag-betaaldiensten-overzichtspagina/diensten-waarvoor-geen-vergunning-nodig-is/>,
gepubliceerd 18 februari 2019, read 2026-08-24):

> Betalingstransacties die worden verricht via een handelsagent die optreedt namens ofwel
> alleen de betaler ofwel alleen betalingsbegunstigde worden niet gekwalificeerd als
> betaaldiensten. **De handelsagent die voor beide optreedt wordt dus wél als
> betaaldienstverlener gekwalificeerd.**

DNB adds two cumulative requirements a resale market cannot meet anyway: the agent must
actually negotiate or conclude the sale, and

> Een handelsagent heeft altijd een **duurzame (commerciële) samenwerking** met de betaler of
> degene aan wie wordt betaald. Deze samenwerking beslaat meer dan een incidentele transactie.
> Ook gaat deze samenwerking verder dan het alleen faciliteren van de betalingen.

A stranger who sells one square is an incidental transaction, not a duurzame samenwerking.
⚠️ **Do not plan on art. 3(b). It is not available to this site, and the Dutch regulator has
said so in writing since 2019.**

**DNB names exactly one clean way out, and it is the whole answer to the ticket's question.**
Same platform Q&A:

> Een elektronisch handelsplatform dat zelf betaaldiensten aanbiedt, zal dus tijdig een
> vergunning moeten aanvragen bij DNB, ofwel zorgen dat de activiteiten binnen de grenzen van
> een vrijstelling of wettelijke uitzonderingen vallen, **ofwel die betaaldiensten moeten
> overlaten [1] aan een derde zoals een vergunninghoudende betaalinstelling of bank.**
>
> [1] **dat betekent dat zij op geen enkel ogenblik in het bezit mogen zijn van of de controle
> hebben over de geldmiddelen van de cliënten**

The English page says the same: "make use of a third-party payment services provider such as
a licensed payment institution or bank. … This means they may not at any time be in
possession or control of customer funds."
(<https://www.dnb.nl/en/sector-information/open-book-supervision/laws-and-eu-regulations/psd2/electronic-trading-platforms-e-commerce-platforms-under-psd2/>,
read 2026-08-24.)

**So the whole PSD2 question reduces to one factual test: at no moment may the site be in
possession or control of the buyer's or seller's money.** That is the same test as recital
(11), stated by the regulator that would enforce it.

### 5.4 Does Stripe Connect satisfy that test?

**Stripe is unambiguously the licensed third party.** Stripe Services Agreement
(<https://stripe.com/en-nl/legal/ssa>, "Last modified: November 18, 2025", read 2026-08-24)
names **Stripe Payments Europe, Limited** and **Stripe Technology Europe, Limited** as the
contracting entities for a Netherlands user, and the Stripe Financial Services Terms, EEA
Regional Terms §5.1 (<https://stripe.com/en-nl/legal/ssa-services-terms>, "Last modified:
November 18, 2025") separates them:

> Stripe Technology Europe, Limited ("Stripe PSP") is an additional party to this Agreement
> solely for the purposes of (a) providing Regulated Financial Services; and (b) acting as a
> Payment Method Acquirer. … **Stripe PSP is regulated by the Central Bank of Ireland. The
> Central Bank of Ireland has authorised Stripe PSP as an electronic money institution under
> reference number C187865.** … To the extent the Services are Regulated Financial Services,
> Stripe PSP is the only provider of those Services.

⚠️ **Note which entity that is.** The regulated firm is **Stripe Technology Europe, Limited**,
not Stripe Payments Europe, Limited. Anything the site's `/terms` says about who holds the
money must name the right one. And it is in DNB's own register: DNB's public register CSV
(<https://www.dnb.nl/nl-NL/registerdownload/csv/WFTEG>, downloaded 2026-08-24) carries
"Stripe Technology Europe, Limited", Dublin, LEI 549300T7WU87LQYO0K16, `RegistratieType`
**"Europees paspoort inkomend"**, `Wetsartikel` **"Art. 2:10e Wft Grensoverschrijdende
dienstverrichting in Nederland door een elektronischgeldinstelling uit de EER"**, begindatum
**25-03-2019**, no einddatum — covering Annex I items 3, 4, 5, 6, 7 and 8 plus e-money issue,
distribution and redemption. "Stripe Payments Europe" returns **zero** rows in the whole
46,760-row register. ⚠️ (DNB's interactive register search is a JavaScript app and its API
returned HTTP 403; these figures come from DNB's own daily CSV downloads, which state
"Deze downloads worden elke werkdag om 6.00 uur geüpdatet.")

**And Stripe holds the funds, not the platform.** Stripe Payments Terms §4.2, Pooled Accounts
(same Service Terms page, this section "Last modified: April 24, 2026"):

> User appoints Stripe as User's agent for the limited purpose of directing, receiving,
> holding and settling funds under this Agreement. All settlement funds Stripe receives for
> Transactions are combined with settlement funds for other users and held in one or more
> Pooled Accounts at one or more Financial Providers. … **User has no rights to earnings
> generated by funds held in any Pooled Account and is not entitled to draw funds from any
> Pooled Account and has no rights to direct transactions into and out of any Pooled
> Accounts.**

Financial Services Terms §5.2 puts the collection duty on Stripe PSP: "Stripe PSP will be the
only Stripe party liable to User for collecting payment proceeds from Transactions on User's
behalf, safeguarding those proceeds according to Law, and settling those proceeds…". And
Stripe contracts with the seller directly — Connect Infrastructure Terms §2.1: "**Stripe has
a direct contractual relationship with each Connected Account** under the Connected Account
Agreement and will provide the Services directly to each Connected Account."

**Stripe says out loud that this is the point of Connect payouts.**
<https://docs.stripe.com/connect/cross-border-payouts> (read 2026-08-24) contrasts its two
products in a compliance row:

> **Connect payouts:** Shift legal and compliance requirements to Stripe using the Stripe
> Money Transmitter license.
>
> **Global payouts:** Manage your own legal and compliance requirements. **This might require
> a Money Transmitter license if you manage your customers' funds.**

The Connect marketing page is blunter still
(<https://stripe.com/en-nl/connect/features>, read 2026-08-24 — a product page, not legal
terms, and flagged as such): "Benefit from Stripe's money licences around the world instead of
getting your own licences in every region that you operate… **E-Money (EMI) Licence in
Europe**", and "Scale your business internationally without worrying about payments licensing".

**The verdict, stated as precisely as the sources allow.** Stripe does stand between the dev
and PSD2, and DNB's own escape route — leave the payment services to a licensed third party
and never possess or control client funds — is exactly what Connect provides, with the funds
in Stripe's Pooled Accounts and a direct Stripe-to-seller contract. Two things qualify it:

1. ⚠️ **The escape depends on a behaviour, not on a product.** DNB's footnote is "op geen
   enkel ogenblik in het bezit … of de controle". §5.1 established that a destination charge
   lands in the *platform's* Stripe balance first, that the platform sets the payout schedule,
   and that Stripe documents `payouts.schedule` as `manual` and a `delay_days_override` "up to
   31" — i.e. the platform **can** control when a seller is paid. Whether "control" in DNB's
   sense is engaged by a balance the platform cannot withdraw from but can time is **not
   settled by any source read here.** The safe operating rule follows from §5.1 anyway: pay
   out immediately, never hold, never delay.
2. ⚠️ **Stripe nowhere warns a Dutch Connect platform that it may need its own licence, and
   nowhere makes it represent that it is licensed or exempt.** All of
   `stripe.com/legal/licenses`, `/en-nl/legal/licenses`, `/legal/licences`, `/licenses` and
   `/legal/connect-account-management-terms` return **HTTP 404** — there is no EU licences
   page. The only licensing representation anywhere in the Stripe terms sits in the unrelated
   Stripe Capital for Platforms Terms. The SSA offers only the generic §11.1: "**User is
   solely responsible for evaluating and configuring the Services to comply with User's legal
   obligations.**" **Stripe's silence is not an opinion, and §4.1 shows Stripe reserves the
   right to ask a payment-facilitation applicant for "proof of relevant licences".**

⚠️ **What no source settles.** **DNB says nothing on point** about a marketplace that uses a
licensed PSP with destination charges and split payouts — funds routed by the PSP into the
seller's own connected account with the platform taking an application fee. Its published test
stops at possession or control. Its dedicated handelsagent Q&A **could not be reached**: DNB's
own link to it is a dead `href="#"` anchor, and the candidate URLs return 404 and 403. **A
Dutch financial-law lawyer, or a written DNB enquiry, is the only way to close it**, and the
question to put is narrow: *does a destination-charge flow, where the money sits momentarily
in the platform's Stripe balance and the platform can set the payout timing, put the platform
in "bezit of controle over de geldmiddelen van de cliënten"?*

**Site credit sidesteps all of it** (§4.2). No money is ever routed to a third party, so
there is no payment transaction between payer and payee to regulate, no Annex I service, and
DNB's platform Q&A never engages. That is the second reason the recommendation lands where it
does.

## 6. What it costs, against what the rest of the site costs

### 6.1 The baseline — what the rest of the site runs on

The dev's own ceiling, fixed while charting on 2026-08-24, is **$25 a month** for
infrastructure in a normal month. The stack's list prices, read 2026-08-24:

| | Free tier | First paid tier |
| --- | --- | --- |
| Vercel (<https://vercel.com/pricing>) | Hobby **$0/mo** — 1M edge requests, 100 GB fast data transfer, 1M function invocations, 4 h Fluid Active CPU per month | Pro **$20/mo**, 10M edge requests, 1 TB transfer, "$20 included credit" |
| Convex (<https://www.convex.dev/pricing>) | Starter **$0/month and pay as you go** — 1M function calls, 0.5 GB database storage, 1 GB file storage, 20 GB-hours action compute | Professional **$25 per developer/month** — 25M function calls, 50 GB database |
| Resend (<https://resend.com/pricing>) | **$0/mo**, 3,000 emails/month | Pro **$20/mo**, 50,000 emails/month |

A 199-square board with a handful of sales a month sits inside every free tier. The
honest baseline is therefore **$0–$45 a month**: $0 while everything stays free, $45 if
Vercel Pro and Convex Pro both become necessary. Against that baseline, everything
below is what resale adds.

### 6.2 What resale adds, in work

Money is the smaller half. This is the list of things that exist **only** because squares
can be resold, and every one of them is work the dev does once and then maintains forever.

1. **A Stripe application, not a Stripe setting.** Resale is a *restricted business* under
   §4.1 and needs Stripe's approval, with "more details about your business model", and
   the approval "may be modified or revoked by Stripe at any time".
2. **A second onboarding flow.** Connect account creation, the hosted or embedded
   onboarding page, the `account.updated` webhook, the requirements state machine, the
   "your payout is paused, finish onboarding" email, and the 7-day / 14-day NL enforcement
   clock from §1.4. None of this exists for a first-hand $100 sale.
3. **KYC support.** Real people will fail verification on a mistyped date of birth and will
   write to a human about it. §1.4: "Stripe might require additional information, including,
   for example, a scan of a valid government-issued ID."
4. **A dispute desk.** §1.3 puts the disputed amount and the €20 fee on the platform with
   no cap, and the platform must answer the dispute for a sale it did not make, about
   artwork it did not create.
5. **Risk operations that a one-person business does not have.** Stripe's own best-practice
   page (<https://docs.stripe.com/connect/risk-management/best-practices>, read 2026-08-24)
   assumes a team:

   > We advise that new platforms have Stripe take responsibility for negative balances on
   > connected accounts. Only consider taking responsibility as the platform if you're
   > confident in your ability to manage merchant risk.

   ⚠️ **That advice is not available here.** §1.2 shows that the only funds flow that fits
   this product — destination charges — forces `losses_collector: application`. Stripe
   recommends against exactly the configuration this product requires. The same page then
   lists what taking it on means: "Risk screening infrastructure…", "Systems to monitor risk
   signals and take action…", and "**Risk specialists:** Risk operations teams can monitor
   risk exposure and intervene in response to signals."
6. **A second VAT position.** §2.3 is a different analysis from the primary sale's, on a
   different tax base, with a different party's status to worry about, and Stripe Tax does
   not do it for you — see §2.3.
7. **Merchant-of-record copy.** §2.2: `/terms`, the checkout and the resale receipt must
   say the buyer's counterparty is the eenmanszaak, not the previous owner.
8. **A country gate in the product.** §1.5: the board sells worldwide, the market buys back
   from roughly forty countries, and the listing UI has to say so before someone lists.
9. **A permanent liability if the credit road is taken.** §4.2.

Against this, the whole rest of V1.0 — board, checkout, accounts, artwork upload, the daily
auction, click counting, removal — is one codebase talking to one Stripe account and one
Convex deployment, with no second party's money in it and no regulator anywhere near it.

### 6.3 What resale adds, in money

**First: the free Connect option is closed to this product.**
`https://stripe.com/en-nl/connect/pricing` (read 2026-08-24) offers two models. The free
one is "Stripe handles pricing for your users":

> Platforms that choose to let Stripe bill their connected accounts for payment fees
> directly do not incur additional account, payout volume, tax reporting, or per-payout
> fees.

That requires the *connected account* to pay Stripe's processing fees — `fees_collector:
stripe` in §1.1's table. §1.2 established that destination charges force
`losses_collector: application`, and §1.1 quotes Stripe: "If you set `losses_collector` to
`application`, then you must also set `fees_collector` to `application`." So this product
is on the paid model, "You handle pricing for your users… Recommended for marketplaces":

> **€2** per monthly active account — An account is active in any month payouts are sent
> to its bank account or debit card.

> **0.25% + €0.10** per payout sent — A payout occurs each time funds are sent to a user's
> bank account or debit card.

Cross-border payouts are "Starting at 0.25% of payout volume" on top. Card rates on the
same page: **1.5% + €0.25** for standard European cards, **2.5% + €0.25** for UK cards;
`https://stripe.com/en-nl/pricing` gives **3.15% + €0.25** for international cards and a
**+2%** currency-conversion surcharge on a USD charge settling to EUR.

**One $150 resale, end to end.** Euro amounts converted at roughly €1 ≈ $1, the same rough
convention research 03 used; treat every figure as approximate.

| | EEA card | Non-EEA card |
| --- | --- | --- |
| Charge | $150.00 | $150.00 |
| Card fee | −$2.50 (1.5% + €0.25) | −$4.98 (3.15% + €0.25) |
| Currency conversion (USD → EUR payout) | −$3.00 (2%) | −$3.00 |
| Connect payout fee on $135 | −$0.44 (0.25% + €0.10) | −$0.44 |
| Monthly active account fee | −$2.00 (€2) | −$2.00 |
| Paid to seller | −$135.00 | −$135.00 |
| **Left to the platform, before VAT** | **≈ $7.06** | **≈ $4.58** |

The 10% is $15. Stripe takes **half to two-thirds of it** before a single tax question is
asked. And ⚠️ the €2 active-account fee is per *account* per *month*, not per sale: a seller
who sells one square in a month costs €2 whether the square went for $150 or $101.

**Then VAT.** §2.3 is the part that decides whether the ≈$7 is a margin or a hole. If the
site is the deemed supplier and prices the resale VAT-inclusive the way it prices a
first-hand square — buyer pays exactly the listed $150 — the VAT on a 21% sale is
$150 × 21/121 = **$26.03**, against a $15 commission. That is a **loss of about $19 on a
sale that looked like a $7 win.** If the site instead charges VAT on top ($150 + $31.50),
about $6 survives — the card and conversion fees grow with the larger charge — and the listed
price stops being what the buyer pays. There is no third
option. See §2.3.

**Disputes cost more than §1.3 said.** <https://stripe.com/en-nl/pricing> (read 2026-08-24)
prices a Dutch account at "**Dispute received fee — €20.00** for each dispute you receive"
**plus** "**Dispute countered fee — €20.00** for each dispute you respond to manually. You get
this fee back for won disputes. You don't get this fee back for lost disputes." So contesting
a dispute puts **€40** at risk, of which €20 comes back only on a win — on top of the $150
that §1.3 says is debited from the platform balance either way.

**And the fixed costs that only resale triggers.** Stripe's own risk best practices tell a
platform carrying negative-balance liability to enable Radar and consider Identity.

| | Price | Source (read 2026-08-24) |
| --- | --- | --- |
| Radar — pay as you go | "Starting at **€0.05** per screened transaction" | <https://stripe.com/en-nl/pricing> |
| Radar Standard — monthly, **businesses** | "Starting at €10.00 per month" | same |
| Radar Standard — monthly, **platforms** | "Starting at €20 per month" | <https://stripe.com/en-nl/radar/pricing> |
| Radar Plus / Pro — monthly, platforms | "Starting at €39" / "Starting at €62 per month" | same |
| Stripe Identity — ID document + selfie | "€1.25 per successful verification" | <https://stripe.com/en-nl/identity> |
| Stripe Identity — ID number lookup | "€0.40 per lookup" | same |
| Managed Risk | **no figure is printed anywhere on the Connect pricing page** — the only entry is "Ongoing risk monitoring — Varies" | <https://stripe.com/en-nl/connect/pricing> |
| Dispute | disputed amount + €20, and €40 if contested, uncapped, on the platform | above, §1.3 |

⚠️ **An earlier draft of this note claimed resale carries €20–62 a month in fixed Radar cost.
That was wrong and is corrected here.** Radar has a pay-as-you-go tier at €0.05 per screened
transaction, so at this site's volume the fraud tooling costs **cents, not tens of euros a
month**. Being a platform doubles the *monthly-plan* price (€20 vs €10 for the business
column) but nothing forces the monthly plan. ⚠️ **UNSETTLED — whether the €0.05
pay-as-you-go rate is the same for platforms as for businesses is not printed:
`stripe.com/en-nl/radar/pricing` shows separate "for businesses" and "for platforms" monthly
figures and says only "Or pay as you go", without a platform figure. Check it in the
dashboard before relying on it.**

### 6.4 The comparison, stated plainly

The rest of the site — board, checkout, accounts, artwork, the daily auction, clicks,
removal — runs inside free tiers today and costs **$0–$45 a month** at list price (§6.1),
against the dev's own $25 ceiling, which is what charting fixed on 2026-08-24.

**In pure monthly money, resale is not what makes that number bigger.** With Radar on
pay-as-you-go the only recurring resale cost is **€2 per seller in a month they are paid**.
Three resales in a month from three different sellers is €6. That is the honest figure, and
an earlier draft of this note overstated it. Anyone quoting "€20–62 a month" from this
document is quoting a corrected error.

**Where resale actually costs more than the rest of the site put together is in three places
that are not a monthly bill.**

1. **Per transaction, it is thin and it can be negative.** ≈$7 of a $15 commission survives
   Stripe on an EEA card, ≈$4.58 on an international one (§6.3). Then §2.3 decides whether
   about $6 is left or **$19 is lost**, depending on one pricing decision. There is no volume
   at which this improves: a 199-square board cannot grow, so the fixed cost of building the
   thing is amortised over a small, bounded number of resales.
2. **The tail is uncapped and the site's own margin cannot absorb it.** §1.3: the platform is
   debited the full disputed amount plus €20, or €40 if it contests, with Stripe Connect Terms
   §7 saying liability "is not limited or excluded in any way". One lost $150 dispute erases
   the margin on roughly **twenty to forty** successful resales. The rest of the site has no
   equivalent exposure — a disputed first-hand square costs the site a square it still owns.
3. **The work, which is the real bill.** §6.2 lists nine things that exist only because of
   resale — a Stripe restricted-business application, a second onboarding flow, KYC support,
   a dispute desk, risk operations Stripe itself says need a team, a second VAT position,
   merchant-of-record copy, a country gate, and a regulatory question DNB has published on and
   not answered for this shape (§5.3). **That is more surface area than the entire rest of
   V1.0, which is one codebase talking to one Stripe account and one Convex deployment with no
   second party's money in it.**

⚠️ **So the answer to the ticket's question, stated precisely rather than dramatically: no,
resale does not add more to the monthly hosting bill than the rest of the site. Yes, it adds
more risk, more law and more work than everything else in V1.0 combined, and its per-sale
economics range from about $6 of profit to about $19 of loss on a $150 sale.** The ticket
asked for real numbers so the dev could choose again. Those are the real numbers.

## Recommendation

### The one-line answer

**Run resale on site credit, not cash, and charge VAT on top of the listed price.** That is
the cheapest road that leaves the model from tickets 11 and 12 completely intact — price per
square, $1 floor, drag any rectangle, 10% to the site, free listing, block splits on sale —
and it is the only road that does not put a Dutch sole trader into merchant risk management,
KYC operations and cross-border payouts for the sake of $7 a transaction.

### Why credit, not cash

| | Cash payout (Connect) | Site credit | Introduction only |
| --- | --- | --- | --- |
| The 10% survives | yes | **yes** | no |
| Stripe Connect + KYC | yes (§1.4) | **no** | no |
| Seller may live anywhere | no — ~43 countries (§1.5) | **yes** | yes |
| Fixed monthly cost | €2 per seller paid that month (§6.3) | **€0** | €0 |
| Per-sale Stripe cost on $150 | ≈$8–10 (§6.3) | **≈$5.50** (no payout, no account fee) | $0 |
| Chargeback recoverable | no — seller is gone (§1.3) | **yes — claw back the credit** | n/a |
| Owes VAT on the whole $150 | yes (§2.3) | **yes (§2.3) — unchanged** | no, if it takes nothing |
| PSD2 exposure | live question DNB has published on (§5.3) | **none — no third-party payout** | none |
| Stripe restricted business | yes, "payment facilitation" | yes, "stored value" | no |
| New machinery to build | onboarding, payouts, disputes, risk ops | a ledger | a listing page |

Credit wins on every row except the one nothing wins on. It also does the thing the cash road
cannot: **it lets a buyer in India, Brazil or Nigeria resell the square they bought.** §1.5
quietly amputates the market for everyone outside about forty countries; credit restores it.

### What has to be true for it to work

1. **Non-cashable and non-transferable, spendable only on 200squares, only on squares and
   banner bids.** That is what keeps it outside e-money (§4.2) and outside PSD2 art. 3(k), and
   what keeps the EMD2 art. 11 "redeem at par on demand" duty from ever attaching. Write it
   into `/terms` in those words. If credit ever becomes cashable, every conclusion in §4.2 and
   §5.2 changes at once.
2. **VAT on top of the listed price, not inside it.** §2.3, Step 6: a VAT-inclusive resale is
   a $19 loss. The market's listing UI must show "seller receives $135 · you pay $150 + VAT"
   or equivalent, and the amount depends on where the buyer is. ⚠️ This breaks the "a square
   is $100, flat" promise for the *market*, and the copy has to say so.
3. **`/terms` and the resale receipt name the eenmanszaak as the counterparty.** §2.2 — this
   is a card-network rule with fines behind it, not a preference.
4. **Pay out — that is, credit — immediately on sale.** §5.1: there is nothing to wait for,
   and holding funds is what turns §5.2 from a defensible position into a real question.
5. **Ask Stripe first.** §4.1: both "payment facilitation and aggregation" and "stored value
   or credits" are restricted categories. The account has to be approved for this, approval
   "is specific to each service offer", and Stripe "may modify or revoke it at any time".
   Find this out before building, not after.

### The honest bottom line, which the ticket asked for

**In hosting money, no. In everything else, yes — and the ticket was right to suspect it.**
The rest of V1.0 runs on $0–45 a month inside free tiers, and the cash version of resale adds
only €2 per seller paid in a month to that bill (§6.4 corrects an earlier draft of this note
that put it at €20–62). What resale actually costs is elsewhere: $8–10 of Stripe fees on a
$150 sale against a $15 commission, an uncapped dispute tail where one lost dispute erases
twenty to forty good sales, nine pieces of permanent machinery that nothing else in V1.0 needs
(§6.2), a live PSD2 question that DNB has published on without answering this shape (§5.3),
and — the finding the ticket did not anticipate — **VAT on the whole $150 rather than on the
$15**, which turns a resale into a $19 loss unless the price the buyer pays stops being the
price the seller listed.

The credit version cuts the per-sale cost to roughly $5.50, removes the €2, removes Connect,
KYC and the 43-country limit, and takes the PSD2 question off the table entirely. It is the
recommendation. But it does **not** remove the VAT, it does not remove the Stripe approval,
and it adds a permanent liability of unspent credit that nobody in this note could put a legal
lifetime on.

**Ticket 12 says: "If the cost turns out to be more than the rest of the site put together,
the honest move is to put this question to the dev again rather than build past it." It is.
Put it to them, with these numbers.** The decision to keep resale in V1.0 was taken without
them, and the dev is entitled to take it again with them.

If the answer is still yes, build the credit version. If the answer is "then let's not", the
market page can stay as a listing board with no money in it (§4.3) and the site loses the 10%
and nothing else.

### What only a lawyer or an accountant can close

These are the questions this note reached the edge of. Each names the exact source that was
read and what it did not settle.

1. **Is the site the deemed supplier under art. 9a?** The text says yes on all three
   disqualifiers (§2.3) and the Belastingdienst's commissionaire page says the base is then
   "btw over het totale bedrag". But **"taking part in the supply" is not defined** in Reg.
   282/2011, no recital of Reg. 1042/2013 elaborates it, and the Belastingdienst has **no
   published page on art. 9a or on platforms in relation to services** — its platform-fiction
   material is goods-only. An accountant must sign this off; it decides everything downstream.
2. **VAT-inclusive or VAT-on-top, and how it is shown.** §2.3 Step 6 is arithmetic; which one
   is legally required, and how the market must display it, is not.
3. **KOR / EU-KOR / OSS at gross.** §2.3 Step 5b establishes that a resale counts at $150 in
   every turnover test. Whether to be in the KOR at all, and whether to take the EU-KOR beside
   the Unieregeling, is a whole-business decision belonging to research 03 and an accountant.
4. **Is site credit issued to a seller a voucher transfer at all?** Arts. 30a, 30b and 73a
   govern vouchers *sold*; they say **nothing** about credit issued as consideration for a
   deemed supply the site receives (§4.2). The texts do not settle it.
5. **Single-purpose or multi-purpose voucher.** Decides whether VAT falls at issue or at
   redemption (§4.2). Turns on transferability and on whether a banner bid can ever redeem
   against someone else's supply — facts the build ticket has not fixed.
6. **How long unredeemed credit survives as a claim under Dutch civil law.**
   wetten.overheid.nl serves Burgerlijk Wetboek Boek 3 with its article bodies collapsed and
   they did not render to automated fetch on 2026-08-24. **This note has no figure.**
7. **The one PSD2 question, and it is narrow (§5.3–§5.4).** Everything else is now settled:
   DNB says a platform that facilitates the buyer's payment to the seller is providing a
   payment service "ongeacht of de betaaldiensten een hoofd- of nevenactiviteit zijn"; the
   handelsagent exclusion is closed to a two-sided market in DNB's own words; the Dutch
   small-provider vrijstelling excludes money remittance and requires Dutch-only activity, so
   it is unavailable; and art. 11(1) plus art. 37(1) mean an eenmanszaak would be forbidden
   to operate and unable to be licensed. What is left is the single factual test DNB names:
   **does a destination-charge flow — money momentarily in the platform's Stripe balance, the
   platform able to set payout timing — put the platform "op enig moment in het bezit … of de
   controle" over client funds?** DNB says nothing on point about that shape, and its
   dedicated handelsagent Q&A could not be reached (its own link is a dead anchor; candidate
   URLs return 404 and 403). Put that one question to a Dutch financial-law lawyer or to DNB
   in writing. ⚠️ **Site credit removes this question rather than answering it.**
8. **Whether Stripe will approve this business at all.** §4.1. That is not a legal question —
   it is an email to Stripe, and it should be sent before any of the above is paid for.
9. **The seller's own tax.** Ticket 12 asks what the site must tell a seller who is paid.
   DAC7 does not require it (§3), but a seller paid $135 — or credited $135 — has income.
   **This note did not research the seller's position and does not answer it.**

Two questions that earlier drafts of this note left open are now **closed**, and are recorded
here so nobody re-opens them: the Dutch small-payment-institution regime (§5.2 — it exists,
and it excludes this business twice over), and which Stripe entity is regulated (§5.4 — Stripe
Technology Europe, Limited, an Irish EMI, CBI reference C187865, in DNB's register under
Wft art. 2:10e since 25-03-2019; **not** Stripe Payments Europe, Limited).
