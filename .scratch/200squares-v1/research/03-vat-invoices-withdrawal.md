# Research 03 — VAT, invoices and the right of withdrawal

Answers [issue 03](../issues/03-vat-invoices-withdrawal.md). Read on **2026-08-24**; every
URL below was fetched that day. Primary sources only: EUR-Lex / `publications.europa.eu`
(the EU Publications Office Cellar, which serves the same authenticated texts as EUR-Lex
and was used because eur-lex.europa.eu sits behind a bot challenge), `curia.europa.eu`,
`wetten.overheid.nl`, `belastingdienst.nl`, `ec.europa.eu`, and `docs.stripe.com` /
`stripe.com`.

Where a source could not be reached, or where the text does not settle the question, it
says so in those words. **This is facts and a draft, not legal cover.** Section 8 lists
what a lawyer or an accountant must still confirm before the site takes money.

Scope: the **primary sale** ($100 per square, sold by the site) and the **daily banner
auction**. The money leg of a resale — VAT on the 10% cut, DAC7 — is
[issue 01](../issues/01-resale-platform-cost.md), not this one.

**Completeness.** All eight sections are written and every claim carries a source and a read
date. Three limits are worth knowing before relying on it. **First**, the newest consolidated
texts the EU Publications Office serves are 2006/112/EC as at 01-01-2025 and 282/2011 as at
01-07-2022; later consolidation dates return 404, so the ViDA amendments of Directive (EU)
2025/516 — which apply from 01-01-2027 and change Art. 59c without moving the €10 000 figure —
are noted but not incorporated. **Second**, the questions this document could not answer are
not hidden in the prose: they are named in the section where they arise, in the words "not
researched", "could not be confirmed" or "not settled by any source I could reach", and they
are collected and ranked in §8. Chief among them: whether a *permanent* service is ever "fully
performed" (§5.5), which EU place-of-supply rule Stripe applies behind its Website Advertising
tax code (§3.3), and non-EU registration duties, which were not researched at all (§2.3).
**Third**, §5.2's non-EU consumer problem is flagged rather than solved, because it is not
solvable at this scale. Sections 4, 5 and 7 were written first and are unchanged.

---

## 1. What is being sold?

All sources read **2026-08-24**. EU texts via `publications.europa.eu`; the consolidated
Directive 2006/112/EC reached is *"Consolidated TEXT: 32006L0112 — EN — 01.01.2025"* and the
consolidated Implementing Regulation 282/2011 is *"— EN — 01.07.2022"*. Those are the newest
consolidations the Cellar serves; later dates return 404. Dutch text is the Wet OB 1968
*"Geldend van 01-01-2026 t/m heden"*.

### 1.1 Three different classifications, and only one of them is the VAT one

The same product is classified three times by three bodies of law, and the answers do not
have to agree:

1. **Consumer law** asks *service or digital content?* — §5.3 answered it: a service, under
   Art. 2(2) of Directive (EU) 2019/770. That governs the withdrawal right and nothing else.
2. **VAT** asks two separate questions: *goods or services?* (§1.2) and, if services, *is it
   an **electronically supplied service**?* (§1.3). "Digital content" is not a VAT category
   at all.
3. **The Stripe dashboard** asks for a product tax code, which is a proxy for question 2 and
   is not law (§3.3, §7.4).

Do not carry a conclusion across. They happen to point the same way here, but the tests are
unrelated.

### 1.2 It is a supply of services. That part is not arguable.

> ‘Supply of services’ shall mean any transaction which does not constitute a supply of
> goods.

(Art. 24(1) of Directive 2006/112/EC,
<https://publications.europa.eu/resource/celex/02006L0112-20250101>, read 2026-08-24)

**Wet OB 1968 art. 4 lid 1**: *"Diensten zijn alle prestaties, niet zijnde leveringen van
goederen in de zin van artikel 3."*
(<https://wetten.overheid.nl/BWBR0002629/2026-01-01>, read 2026-08-24)

Nothing tangible moves. A square is a service.

### 1.3 It is an electronically supplied service — and the EU named this exact product

The definition, Art. 7(1) of Implementing Regulation (EU) No 282/2011:

> ‘Electronically supplied services’ as referred to in Directive 2006/112/EC shall include
> services which are delivered over the Internet or an electronic network and the nature of
> which renders their supply **essentially automated and involving minimal human
> intervention**, and impossible to ensure in the absence of information technology.

Art. 7(2) then says paragraph 1 *"shall cover, in particular"*, among others:

> (b) services providing or **supporting a business or personal presence on an electronic
> network such as a website or a webpage**;
>
> (f) the services listed in Annex I.

And Annex I, under **"(3) Point (3) of Annex II to Directive 2006/112/EC"**, contains the
sentence that settles this ticket:

> (h) **the provision of advertising space including banner ads on a website/web page;**

(<https://publications.europa.eu/resource/celex/02011R0282-20220701>, read 2026-08-24)

That expands Annex II point (3) of the Directive — *"supply of images, text and information
and making available of databases"* — which Art. 58(1)(c) makes the operative category
(<https://publications.europa.eu/resource/celex/02006L0112-20250101>, read 2026-08-24).

**Dutch law imports the same list by reference.** Wet OB art. 2a lid 1 sub q:

> q. elektronische diensten: langs elektronische weg verrichte diensten, met name de in
> **bijlage II van de BTW-richtlijn 2006** beschreven diensten;

and art. 6h lid 1: *"De plaats van dienst van de volgende diensten, die worden verricht voor
een andere dan ondernemer, is de plaats waar deze persoon gevestigd is… c. elektronische
diensten."*

**Conclusion. Both the $100 square and the daily banner are the supply of advertising space
on a web page, which is an electronically supplied service.** The words "advertising space"
and "banner ads on a website/web page" are not an analogy here; they are the product, in the
Regulation's own vocabulary. This is as certain as anything in this document gets.

⚠️ **The Dutch sources do not say it, and that is worth knowing before quoting one at an
inspector.** The Belastingdienst's own description of an *elektronische dienst* — *"diensten
die via internet of een digitaal netwerk worden geleverd. Ze zijn grotendeels geautomatiseerd,
vergen slechts een geringe mate van menselijk ingrijpen en kunnen niet zonder
informatietechnologie worden geleverd"* — is followed by examples that do **not** include
advertising
(<https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/internationaal/btw_voor_buitenlandse_ondernemers/digitale_diensten_door_ondernemers_uit_niet-eu-landen/digitale_diensten>,
read 2026-08-24). The word *advertentieruimte* appears on no Belastingdienst VAT page that
could be reached, and the Wet OB 1968 contains no annex listing electronically supplied
services at all — it imports Annex II by reference (art. 2a lid 1 sub q) and stops. What the
Belastingdienst does publish is a **separate** category, *reclamediensten*, listed among the
*uitgezonderde diensten* alongside — not inside — *"telecommunicatie-, omroep- en elektronische
diensten (digitale diensten)"*
(<https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/zakendoen_met_het_buitenland/goederen_en_diensten_naar_andere_eu_landen/btw_berekenen_bij_diensten/btw_berekenen_bij_uitgezonderde_diensten>,
read 2026-08-24). That is the art. 6i list, and art. 6i reaches **only non-EU consumers**, so
the two categories cannot collide for an EU buyer — but a reader who starts from the Dutch
pages instead of the Regulation can easily conclude the opposite. **The authority for the
classification is Annex I(3)(h) of 282/2011, which is directly applicable Union law and needs
no Dutch restatement.** Say so, and cite it.

### 1.4 ⚠️ Two exclusions that look like they bite, and do not

Art. 7(3) lists what is **not** an electronically supplied service. Two entries look aimed
at this site:

> (m) **advertising services**, in particular as in newspapers, on posters and on television;

> (p) **conventional auctioneers' services** reliant on direct human intervention,
> irrespective of how bids are made;

Neither applies, and the reason is the same in both cases — Art. 7(1)'s automation test:

- **(m) is about the medium, not the word "advertising".** Its three examples are newspapers,
  posters and television: media where a human sells, designs and places the ad. Reading (m)
  to cover online advertising space would repeal Annex I point (3)(h), which the same
  Regulation enacts. The specific beats the general.
- **(p) needs "direct human intervention".** The banner auction has none: bids arrive through
  the site, the top bid is whatever is largest, and a cron closes it at 00:00 UTC with no
  extension window (fixed by charting). There is no auctioneer.

The automation test is also **a fact the build must keep true.** Three of charting's fixed
answers currently supply it: *"Artwork comes after payment"* (the buyer uploads it
themselves), *"Buying needs no account"* (the account is created automatically), and above
all **"No moderation before publishing. The dev does not approve artwork up front."** The
last one is the strongest single piece of evidence that supply is *"essentially automated and
involving minimal human intervention"*.

⚠️ **This is reversible, and nobody will tell you.** If the dev ever starts approving artwork
before it goes live, designing artwork for buyers, or hand-placing blocks, the automation
argument weakens — and with it the Art. 58 classification, which would push EU B2C sales back
to Art. 45 and Dutch VAT. **How much human intervention is too much is not quantified
anywhere in the Regulation or the Directive**, and I found no case law on the point in the
sources reachable here. It is one for the accountant (§8).

### 1.5 The link the buyer gets does not create a second supply

`PRODUCT.md` is explicit that the link is part of the product: *"A buyer supplies artwork and
a URL; their block sends a click to their site. The link is part of what they are paying for,
not a side effect."* `/how-it-works` promises it too: *"A click on your block opens your
website in a new tab."*

For VAT this changes nothing. Art. 7(2)(b) — *"supporting a business or personal presence on
an electronic network such as a website or a webpage"* — describes the image **and** the link
together, and Annex I(3)(h) describes the space they sit in. One price, one block, one
supply, one classification.

⚠️ **One caveat, flagged not researched.** `PRODUCT.md` leaves open *"Whether owner links are
followed or nofollowed"* and calls it "a product promise, not a technical detail". If the
site ever advertises a **dofollow** link as a distinct benefit, it is selling an SEO
outcome. Whether that is still the same single supply, or a separately-classified service, is
not something I found addressed in any primary source. Today the site promises a click, not a
ranking, and the question does not arise.

### 1.6 Why the classification matters: it decides exactly one cell

Applying Art. 44, Art. 58(1)(c), Art. 59 and their Dutch counterparts:

| Buyer | Rule | Place of supply | Who pays the VAT |
|---|---|---|---|
| NL business | Art. 44 / art. 6 lid 1 | Netherlands | Seller charges **21%** |
| EU business, not NL | Art. 44 / art. 6 lid 1 | Buyer's country | **Buyer**, reverse charge (Art. 196) |
| NL consumer | Art. 58(1)(c) / art. 6h | Netherlands | Seller charges **21%** |
| **EU consumer, not NL** | **Art. 58(1)(c) / art. 6h** | **Buyer's country** | **Seller, at the buyer's rate** — unless the €10 000 threshold applies (§2.2) |
| Non-EU consumer | Art. 58(1) — not limited to EU customers | Outside the EU | **Nobody**, no EU VAT |
| Non-EU business | Art. 44 | Outside the EU | Nobody, no EU VAT |

The classification changes **only the fourth row** — and it changes it completely. Art. 45 is
the default for services to a non-taxable person:

> The place of supply of services to a non-taxable person shall be the place where the
> supplier has established his business.

If a square were an ordinary service rather than an electronically supplied one, every EU
consumer sale would be Dutch, at 21%, forever: no destination rates, no threshold to watch,
no OSS, no 10-year retention (§4.7). Because it *is* an electronically supplied service, none
of that simplicity is available. **That single row is what §2 is about, and it is the row
Stripe's product tax code silently picks (§3.3).**

**Non-EU consumers get the same answer twice over.** Art. 58(1) as consolidated is not
limited to EU customers, so it already puts the place of supply outside the EU. And even on
the older "advertising services" route, Art. 59(b) — *"advertising services"* — and its Dutch
implementation art. 6i sub b, *"diensten op het gebied van de reclame"*, put the place of
supply of advertising services to a non-EU non-taxable person where that person resides. Two
independent routes, one result: **no Dutch VAT on a buyer outside the EU.**

⚠️ **And no "use and enjoyment" rule pulls it back.** Art. 59a lets a Member State re-site
such a supply where it is effectively used. The Netherlands used that option narrowly: art.
6j applies only to services performed by *"ondernemers die **buiten de Unie** wonen of zijn
gevestigd"*. A Dutch eenmanszaak is not caught by it. A US buyer stays a US buyer even though
their banner is looked at from Utrecht.

### 1.7 What §1 does not decide

The KOR can switch the Dutch rows off entirely (§6). The 10% cut on a **resale** is
[issue 01](../issues/01-resale-platform-cost.md), not here. And whether a given buyer is a
*consumer* — the word that drives both the fourth row above and the whole of §5 — is a
question the checkout has to ask, which is §2.


## 2. VAT, in three cases

§1 fixed the classification. This section turns it into checkout fields. All sources read
**2026-08-24**; article numbers are the consolidated texts named in §1.

### 2.1 Case A — a business buyer inside the EU

**The rule.** Art. 44 puts the place of supply where the customer is established, and Art.
196 moves the tax to them:

> VAT shall be payable by any taxable person, or non-taxable legal person identified for VAT
> purposes, to whom the services referred to in Article 44 are supplied, if the services are
> supplied by a taxable person not established within the territory of the Member State.

So: **no Dutch VAT, no VAT of any kind charged by the site**, and an invoice is mandatory
(§4.1) carrying both VAT numbers and the words «btw verlegd» / `VAT reverse charged` (§4.2
sub d and sub m, §4.3; Art. 226(11a) of the Directive: *"where the customer is liable for the
payment of the VAT, the mention ‘Reverse charge’"*). Note this row does **not** depend on §1:
Art. 44 governs every service, electronically supplied or not.

**A Dutch business buyer is not this row.** Art. 44 puts them in the Netherlands, the seller
charges 21%, and there is no reverse charge — Stripe gets this right by itself (§3.4).

#### Must the VAT number be validated through VIES? — Yes in practice, and no in theory. Both halves matter.

**In theory, no.** Neither Art. 44 nor Art. 196 mentions a VAT identification number. Art.
196's qualifier *"identified for VAT purposes"* attaches to *"non-taxable legal person"*, not
to *"taxable person"*. The substantive condition is that the buyer **is a taxable person
acting as such** — the number is evidence of that, not the thing itself. For **goods**, the
Court said so repeatedly, e.g. C-21/16 *Euro Tyre*, paragraph 32:

> neither the acquisition by the purchaser of a VAT identification number valid for the
> purpose of carrying out intra-Community transactions nor the inclusion of that number in
> the VIES system constitute substantive conditions for exemption from VAT of an
> intra-Community supply. Those are merely formal requirements…

(<https://publications.europa.eu/resource/celex/62016CJ0021>, read 2026-08-24; same line in
C-273/11 *Mecsek-Gabona* §60 and C-24/15 *Plöckl*.)

⚠️ **Those are all goods cases, and for goods the rule was reversed anyway.** Since 1 January
2020 Art. 138(1)(b) makes the number a substantive condition for an intra-Community supply of
goods. **No equivalent exists for services.** I found no case law deciding the point for
Art. 44/196 services in the sources reachable here — I say that as a statement about what
could be reached, not as a claim that no such case exists.

**In practice, yes**, because the only protection the law offers a seller is conditional on
the check. Art. 18(1) of Implementing Regulation 282/2011:

> Unless he has information to the contrary, the supplier **may** regard a customer
> established within the Community as a taxable person:
> (a) where the customer has communicated his individual VAT identification number to him,
> and **the supplier obtains confirmation of the validity of that identification number and
> of the associated name and address** in accordance with Article 31 of Council Regulation
> (EC) No 904/2010…

(<https://publications.europa.eu/resource/celex/02011R0282-20220701>, read 2026-08-24)

Art. 31 of Regulation 904/2010 is the VIES legal basis:

> The competent authorities of each Member State shall ensure that persons involved in the
> intra-Community supply of goods or of services and non-established taxable persons
> supplying services, are allowed to obtain, for the purposes of such transactions,
> **confirmation by electronic means of the validity of the VAT identification number of any
> specified person as well as the associated name and address.**

(<https://publications.europa.eu/resource/celex/02010R0904-20240101>, read 2026-08-24)

And the Belastingdienst does not hedge: *"Vraag het btw-identificatienummer aan uw klant.
**Controleer het btw-identificatienummer altijd.**"* (quoted in full in §4.3).

And the Belastingdienst says plainly what happens when it goes wrong:

> **U moet dan wel zeker weten dat uw klant ondernemer is. Als namelijk blijkt dat dit niet zo
> is, kunt u een naheffingsaanslag en een boete krijgen. U moet dan alsnog btw betalen over de
> goederen en diensten die u zonder btw hebt geleverd.**

> **Past u de verleggingsregeling toe? Zorg dan dat wij kunnen vaststellen wie uw afnemer is.**
> Bijvoorbeeld met een (geldig) btw-identificatienummer van uw afnemer. Als onduidelijk is wie
> uw afnemer is, hebt u de verleggingsregeling ten onrechte toegepast en kunnen wij de
> verschuldigde btw bij u naheffen. … **U blijft wel verantwoordelijk voor de btw die u
> verlegt.**

(<https://www.belastingdienst.nl/wps/wcm/connect/nl/btw/content/btw-id-controleren> and
<https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/btw_berekenen_aan_uw_klanten/waarover_btw_berekenen/verleggingsregeling/hoe_werkt_btw_verleggen>,
both read 2026-08-24)

**Put together: the check is not a statutory condition of the reverse charge, it is the price
of the safe harbour.** Without it, if the buyer turns out not to have been a taxable person,
the seller carries the VAT with nothing to point at — plus a boete. With it, the seller was
entitled to treat them as one. Do the check.

#### ⚠️ §7.2 assumed Stripe was the only way to check. It is not.

§7.2 established that Stripe validates tax IDs only for **format** before payment, and runs
the real VIES check **asynchronously afterwards** via `customer.tax_id.updated`. It concluded
that the least-bad option was to stop collecting VAT numbers at all. **That conclusion can be
improved on: the site can call VIES itself, synchronously, before it creates the Checkout
Session.** The Commission runs a public REST endpoint, and I exercised it live on 2026-08-24:

```
POST https://ec.europa.eu/taxation_customs/vies/rest-api/check-vat-number
{"countryCode":"NL","vatNumber":"…","requesterMemberStateCode":"NL","requesterNumber":"…"}
```

returns `valid`, `name`, `address` and — when requester details are supplied — a
**`requestIdentifier`**, which is the consultation reference to keep as proof. A live call
against a valid Irish number returned `"valid": true`, `"name": "GOOGLE IRELAND LIMITED"`,
`"address": "3RD FLOOR, GORDON HOUSE, BARROW STREET, DUBLIN 4"` and
`"requestIdentifier": "WAPIAAAAaA1D8cQK"`. There is also
`GET …/vies/rest-api/check-status`, which reports per-country availability
(`{"countryCode":"FR","availability":"Available"}`). No key, no cost.

Three failure modes seen in the same test session, all of which the build must handle:

- ⚠️ **Not every member state returns a name and address.** A valid German number came back
  `"valid": true, "name": "---", "address": "---"`, and so did a valid Spanish one. Art.
  18(1)(a) asks for confirmation *"of the validity of that identification number **and of the
  associated name and address**"*, so on the face of the Regulation the second half is missing.
  **The Belastingdienst answers this directly**, and the answer is that the number alone is
  enough:

  > **Let op!** Het controleren van naam- en adresgegevens van klanten in **Duitsland** is op
  > die website niet mogelijk. Wel kunt u er het btw-id controleren. **Als daaruit blijkt dat
  > het btw-id geldig is, dan hebt u voldoende bewijs dat u zakendoet met een ondernemer.**

  (<https://www.belastingdienst.nl/wps/wcm/connect/nl/btw/content/btw-id-controleren>, read
  2026-08-24. The page says Germany; it does not mention Spain, which behaved the same way in
  today's test. Treat the Spanish case as unconfirmed.) The same page also says what to do with
  the answer: *"**Wilt u het resultaat bewaren? Sla het dan op in uw computer.**"* Stripe wants
  more — *"you still need to verify the customer's name and address to match the registration
  information"* (§7.2) — but Stripe is not the tax authority here.
- **The service can refuse.** A concurrent request returned
  `{"actionSucceed": false, "errorWrappers": [{"error": "MS_MAX_CONCURRENT_REQ"}]}`. A member
  state's database being busy is a normal outcome, not an exception.
- **A number can be valid and yet not in VIES**, because some member states record only
  numbers registered for intra-EU transactions.

So the checkout needs a decided answer for "VIES said no" and a different one for "VIES could
not answer". The honest pair: **invalid → charge VAT** (the buyer can correct and buy again);
**unavailable → charge VAT**, and refund the difference later if the number checks out. Never
let an unanswered check silently produce a zero-VAT sale, which is exactly what Stripe does
today (§7.2).

#### ⚠️ Collecting a VAT number creates a filing obligation nobody asked for

**Wet OB 1968 art. 37a lid 1** requires a monthly electronic listing — the *opgaaf
intracommunautaire prestaties* (ICP) — naming, among others:

> c. voor wie hij diensten heeft verricht die met toepassing van artikel 6, eerste lid, niet
> belastbaar zijn in Nederland en waarover de belasting ingevolge artikel 196 van
> BTW-richtlijn 2006 in de lidstaat van de afnemer wordt geheven van de afnemer, tenzij het
> verrichten van die dienst in die lidstaat is vrijgesteld;

lid 4 allows a **calendar quarter** instead for these services, and the lead of lid 1 exempts
*"de ondernemer … bedoeld in artikel 7, zesde lid, of **artikel 25a, eerste lid**"* — i.e. a
KOR user files no ICP at all (§6).
(<https://wetten.overheid.nl/BWBR0002629/2026-01-01>, read 2026-08-24)

**Every reverse-charged EU B2B square therefore becomes a line in a quarterly return**, on top
of the btw-aangifte. One field on a payment page, four filings a year, forever.

### 2.2 Case B — a consumer inside the EU

**The rule** is the fourth row of §1.6: Art. 58(1)(c) / art. 6h — **the buyer's country, at
the buyer's rate** — subject to one threshold.

#### The €10 000 threshold: Art. 59c, and Wet OB art. 6k

**Wet OB 1968 art. 6k lid 1** (the Dutch implementation; Art. 59c of the Directive is
word-for-word the same):

> Artikel 5a, eerste lid, onderdeel a, en artikel 6h, eerste lid, zijn niet van toepassing
> wanneer aan de volgende voorwaarden is voldaan:
> a. de leverancier of dienstverrichter is gevestigd … in **slechts één lidstaat**;
> b. de diensten worden verleend aan andere dan ondernemers die gevestigd zijn … in een
> andere dan de lidstaat, bedoeld in onderdeel a…; en
> c. het totale bedrag van de leveringen van diensten of goederen, bedoeld in onderdeel b, de
> belasting niet inbegrepen, is in het lopende kalenderjaar **niet hoger dan € 10 000** …
> en heeft dit bedrag ook niet overschreden in de loop van het **voorafgaande kalenderjaar**.

> 2 Wanneer de drempel … in de loop van een kalenderjaar wordt overschreden, zijn artikel 5a,
> eerste lid, onderdeel a, en artikel 6h **vanaf die datum** van toepassing.

> 3 In afwijking van het eerste lid, zijn [zij] van toepassing wanneer de … dienstverrichter
> … daarvoor **kiest**…
> 4 Wanneer de lidstaat … Nederland is, **meldt** de … dienstverrichter … dit bij de
> inspecteur. Deze melding geldt tot wederopzegging door die ondernemer doch **ten minste
> voor twee kalenderjaren**.

(read 2026-08-24)

Five things fall out of that text, and each one is a build requirement:

1. **Below the threshold, every EU consumer sale is Dutch: 21%, no OSS, no destination
   rates.** This is Stripe's "small seller option" (§7.1).
2. **The threshold counts cross-border EU B2C only.** Dutch consumers do not count. Business
   buyers do not count. Non-EU buyers do not count. **The site must count the right subset
   itself**, because Stripe's threshold monitoring does not start until *"10,000 USD in
   revenue in the previous year"* and never watches the home country (§7.1).
3. **It is a two-year test** — current *and* preceding calendar year. Crossing it in year one
   keeps you out of it for year two even if year two is quiet.
4. **It breaks mid-transaction.** *"vanaf die datum"* — the sale that crosses €10 000 is
   itself destination-taxed. There is no grace period and no "from next quarter".
5. **Opting in early is possible and it locks you in for two calendar years.** Useful if the
   dev would rather build the OSS path once than build a switch.

**The Belastingdienst adds one rule the statute leaves implicit — how you get back:**

> Zodra uw omzet boven de € 10.000 komt, brengt u uw klanten de btw in rekening van het EU-land
> waar de dienst belast is. **Pas als uw omzet een volledig kalenderjaar € 10.000 of lager is,
> mag u vanaf 1 januari van het jaar daarna weer Nederlandse btw berekenen.**

and names the opt-in instrument: the form *"Melding keuze plaats van prestatie digitale
diensten en afstandsverkopen"*, with *"Uw keuze geldt voor minimaal 2 jaar."* It also warns:
*"Heeft uw onderneming een vaste inrichting in 1 of meer andere EU-landen…? Dan geldt de
omzetdrempel van € 10.000 niet."* — irrelevant to a one-person eenmanszaak, but it is why the
threshold is a one-country privilege.
(<https://www.belastingdienst.nl/wps/wcm/connect/nl/btw/content/btw-diensten-particulieren>,
read 2026-08-24)

**Scale check.** €10 000 at roughly €85–95 per $100 square (§4.4) is **about 105–115 squares
sold to EU consumers**. The board has 199. This is not a theoretical threshold; a good year
crosses it.

⚠️ **One change is already law and takes effect from 1 January 2027.** Directive (EU) 2025/516
(ViDA) rewrites Art. 59c(1)(b) and (3). **The €10 000 figure itself is unchanged**, but the new
paragraph 3 adds: *"The option referred to in the first subparagraph of this paragraph is deemed
to have been exercised by taxable persons registered in the special scheme provided for in Title
XII, Chapter 6, Section 3."* — i.e. registering for the Union scheme will itself count as opting
out of the threshold. Member States must apply it from 01-01-2027
(<https://publications.europa.eu/resource/celex/32025L0516>, read 2026-08-24). It is **not** in
the consolidated text used elsewhere in this document, which stops at 01-01-2025. Nothing in it
changes a build decision taken today; it is here so nobody is surprised in eighteen months.

#### Above the threshold: the Unieregeling

Art. 369b(c) admits *"a taxable person not established in the Member State of consumption
supplying services to a non-taxable person"*; for a Dutch eenmanszaak the Member State of
identification is the Netherlands (Art. 369a(2)). Then:

- **Art. 369f** — a return *"for each calendar quarter, whether or not supplies … have been
  carried out"*, due *"by the end of the month following the end of the tax period"*. Nil
  returns included.
- **Art. 369h** — *"The VAT return shall be made out in euro… If the supplies have been made
  in other currencies, the taxable person … shall use the exchange rate applying on the last
  date of the tax period"*, being the ECB rate for that day. Prices here are in USD, so this
  bites on every line — and it is **not** the rate Stripe's reports use (§3.5) and **not** the
  invoice rate of §4.6.
- **Art. 369j** — no input VAT may be deducted inside the OSS return; it goes through the
  ordinary Dutch return or a Directive 2008/9 refund instead.
- ⚠️ **§4.7: the retention period becomes 10 years**, not 7, for everything the scheme covers.

(Directive articles at <https://publications.europa.eu/resource/celex/02006L0112-20250101>;
the Commission's own summary at <https://vat-one-stop-shop.ec.europa.eu/index_en>, both read
2026-08-24: *"Below this EUR 10 000 threshold, supplies of TBE … services and distance sales
of goods within the EU may remain subject to VAT in the Member State where the taxable person
is established."*)

**How it is actually operated, from the Belastingdienst**
(<https://www.belastingdienst.nl/wps/wcm/connect/nl/btw/content/btw-melden-eenloketsysteem>,
read 2026-08-24) — five details that are build requirements, not background:

- **Registration** is in Mijn Belastingdienst Zakelijk under *btw → E-commerce → Registratie*,
  and it is not instant: *"U kunt de Unieregeling gebruiken vanaf de 1e dag van het kwartaal
  dat volgt op uw registratie."* ⚠️ There is one escape for a first sale: *"Levert u voor het
  eerst een dienst of product? Dan mag u meteen uw btw melden met de Unieregeling. Uw
  registratie moet dan wel uiterlijk bij ons binnen zijn op de 10e dag van de maand die volgt
  op de maand van de levering."* Miss that and the first cross-border quarter has to be filed
  country by country.
- **A melding every quarter, nil included**, due the last day of the following month.
- **The rate, verbatim:** *"U meldt en betaalt de btw in euro's. Moet u valuta naar euro's
  omrekenen? Dan gebruikt u de wisselkoers die de Europese Centrale Bank bekend maakt op de
  laatste dag van het kwartaal"* — confirming §4.6 and contradicting Stripe's reports (§3.5).
- ⚠️ **Corrections cannot be filed.** *"Wilt u uw eerder ingediende btw-melding wijzigen? Dat is
  niet mogelijk… Wat u wel kunt doen, is de gewenste wijziging doorgeven in uw eerstvolgende
  btw-melding."* A refunded square is a line in the next quarter, never an amendment to the
  last one. That is the same shape as the Stripe reversal behaviour in §7.7.
- ⚠️ **Three missed quarters is a two-year ban:** *"Als u 3 kwartalen achter elkaar geen
  btw-melding doet, sluiten wij u uit: u kunt de Unieregeling dan 2 jaar niet meer gebruiken."*
  And *"Stopt u met uw onderneming? … Zorg dan zelf voor de afmelding. Uw registratie voor de
  Unieregeling eindigt namelijk niet vanzelf."*

**And it removes the invoice duty rather than adding one** — §4.1 already quoted it: *"U
gebruikt de Unieregeling … Dan volgt u gewoon de Nederlandse regels voor facturering. Dit
betekent dat u voor de btw geen factuur hoeft te sturen."* The mirror is the reason to join:
*"Gebruikt u de Unieregeling niet? Dan gelden de regels voor facturering en administratie van
het land waar u btw moet betalen."* — twenty-six sets of invoicing rules instead of one.

#### ⚠️ Which country the consumer is in must be *proved*, not asked

This is the part the current `/privacy` copy contradicts (§5.9), and it is the one genuinely
hard evidentiary duty in the whole ticket. Art. 24b(d) of 282/2011:

> under circumstances other than those referred to in Article 24a and in points (a), (b) and
> (c) of this Article, it shall be presumed that the customer is established, has his
> permanent address or usually resides at the place identified as such by the supplier on the
> basis of **two items of non-contradictory evidence** as listed in Article 24f…

Art. 24f lists them: (a) the billing address of the customer; (b) the IP address of the device
used or any method of geolocation; (c) bank details such as the location of the bank account
used for payment or the billing address held by that bank; (d) the SIM's Mobile Country Code;
(e) the fixed land line's location; (f) other commercially relevant information.

**There is a simplification, and this business qualifies for it.** Art. 24b, second paragraph:

> Without prejudice to point (d) of the first paragraph … where the total value of such
> supplies, exclusive of VAT … does not exceed **EUR 100 000** … in the current and the
> preceding calendar year, the presumption shall be that the customer is established … at the
> place identified as such by the supplier on the basis of **one item of evidence provided by
> a person involved in the supply of the services other than the supplier or the customer**,
> as listed in points (a) to (e) of Article 24f.

⚠️ **Read the qualifier.** The single item must come from **somebody other than the customer**.
A billing country the buyer typed into a form is Art. 24f(a) — and it is customer-provided, so
**it cannot be the one item**. What can be: the **card's issuing country / the location of the
bank account used for payment** (Art. 24f(c)), which Stripe returns on the PaymentIntent, or an
**IP geolocation** the site performs itself (Art. 24f(b)) — the site is a person involved in
the supply, but it is the supplier, so ⚠️ whether a supplier-run geolocation counts as
*"provided by a person involved … other than the supplier or the customer"* is doubtful on the
face of the text. **The safe single item is the card country from Stripe.** Point (f), "other
commercially relevant information", is excluded from the simplification by its own wording.

**The Belastingdienst restates all three tiers in one paragraph**, which is the cleanest Dutch
authority for the simplification:

> Als u wilt afwijken van deze richtlijnen, dan kunt u de plaats waar uw klant woont zelf
> bepalen. Hiervoor hebt u dan **3 niet-tegenstrijdige bewijsmiddelen** nodig, zoals het
> factuuradres, bankgegevens, het internetprotocoladres (IP-adres) of andere zakelijke
> gegevens. … Als u andere digitale diensten levert dan de hierboven genoemde diensten, hebt u
> **2 niet-tegenstrijdige zakelijke bewijsmiddelen** nodig… **Is uw omzet digitale diensten in
> het lopende of voorafgaande kalenderjaar niet hoger dan € 100.000? Dan hebt u maar 1
> bewijsstuk nodig. Dit bewijsstuk moet worden uitgegeven door iemand die bij de
> dienstverrichting betrokken is, maar niet uzelf of de afnemer.**

(<https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/zakendoen_met_het_buitenland/goederen_en_diensten_naar_andere_eu_landen/btw_berekenen_bij_diensten/wijziging_in_digitale_diensten_vanaf_2015/wijziging_in_digitale_diensten_vanaf_2015>,
read 2026-08-24. ⚠️ Note it names four examples and **no closed list** — the closed list is
Art. 24f, quoted above.)

And Stripe will not do this test for you — §7.3, verbatim: *"Stripe Tax prioritizes a single
address as the customer's location … instead of comparing two pieces of non-contradictory
evidence."* Nor does Checkout look at IP: *"Checkout and Payment Links use the address
collected during the session."* **The site must capture the client IP itself, at the moment it
creates the Checkout Session**, and store it with the billing country and the card country.

⚠️ **Four thresholds, four jobs. They are easy to confuse and they are all live at once:**

| Amount | What it governs | Where |
|---|---|---|
| **€10 000** | cross-border EU B2C: Dutch VAT below, destination VAT above | art. 6k / Art. 59c — §2.2 |
| **€100 000** | one item of location evidence below, two above | Art. 24b — §2.2 |
| **€20 000** | the Dutch KOR turnover ceiling | §6 |
| **€100 000** | the EU-KOR Union-wide turnover ceiling | Art. 284(2)(a) — §6 |

### 2.3 Case C — any buyer outside the EU

**No EU VAT, on either branch.** §1.6 set this out: Art. 58(1) is not limited to EU customers,
and the "advertising services" route of Art. 59(b) / art. 6i sub b reaches the same place. Art.
59a's use-and-enjoyment override is implemented in the Netherlands only for suppliers
established outside the Union (art. 6j), so it cannot pull a US or Brazilian sale back into
Dutch VAT.

For a **business** outside the EU the answer is Art. 44 and equally simple. Art. 18(3) of
282/2011 says how a supplier may establish that status — a tax-authority certificate, or *"the
VAT number, or a similar number attributed to the customer by the country of establishment"*
plus *"a reasonable level of verification"*. **Since the VAT outcome is identical either way,
there is nothing to gain by asking.** For a non-EU buyer, business or consumer, the site needs
only enough evidence that they are outside the EU.

⚠️ **What this section does not cover, and what I did not research.** "No EU VAT" is not "no
tax anywhere". Other countries impose their own registration duties on inbound digital
services — US state sales-tax economic nexus, UK VAT, Norwegian VOEC, Australian GST, and
others — often with thresholds far above anything a 199-square board can reach, and sometimes
with none. **I did not research non-EU registration thresholds, and this document does not
tell you whether any of them are triggered.** It is item 10 in §8. Stripe's own threshold
monitoring is the cheap partial answer (§7.1). Note also the excluded-territory trap in §7.3:
Bonaire, Curaçao, Saba, Sint Eustatius and Sint Maarten are outside Dutch VAT despite the
country code, and the EU has similar carve-outs which I have not enumerated.

### 2.4 What the checkout must collect

§5.8 already concluded the order is placed **on 200squares.com** and Stripe is the payment
step. That splits the fields cleanly.

**On the 200 SQUARES detail panel, before the redirect:**

| Field | Why | Collected or verified |
|---|---|---|
| **Buyer type** — "for a business" / "as a private person", radio, no default | decides consumer status for §5, and whether an invoice is mandatory (§4.1) | collected |
| **Country**, ISO 3166-1 alpha-2, required | the place-of-supply rule, and the price itself if `tax_behavior=exclusive` (§3.2) | collected — **and cross-checked** against the card country |
| **Legal name** (business) or **full name** (consumer) | art. 35a lid 1 sub b; and it is the §5.2 evidence that the buyer is a trader | collected |
| **EU VAT number** — shown only when buyer type = business and country ∈ EU minus NL | Art. 196 reverse charge; Art. 18(1)(a) safe harbour | **VERIFIED** — VIES, synchronously, before the Checkout Session (§2.1) |
| **Withdrawal tick box** + the Art. 6(1)(h) text under it | §5.7 — its own box, unticked, not bundled into the Terms |
| **One line accepting a digital invoice** | §4.2: *"uw afnemer moet ermee akkoord gaan dat u digitaal factureert"* | collected |
| *(silent)* **client IP at session creation** | Art. 24f(b) location evidence — Stripe will not give it to you (§7.3) | captured |
| *(silent)* **the exact tick-box wording and a timestamp** | §5.7 point 3 — the only proof of Art. 8(8) | stored |

**On Stripe's hosted page:**

| Field | Why |
|---|---|
| **Email** | receipt, magic link, and the invoice (§7.5) |
| **Full billing address** — set `billing_address_collection=required` | art. 35a lid 1 sub b needs street, postcode and city; `auto` collects country alone (§7.3) |
| **Card issuing country** — read back off the PaymentIntent | Art. 24f(c), the one third-party item of location evidence (§2.2) |

**Explicitly not collected:** a non-EU tax number (§2.3), and anything else. `PRODUCT.md`'s
"Claim nothing that does not exist" has a privacy twin: ask for nothing the law does not need.

### 2.5 What must be *verified* rather than merely collected

Exactly two things. Everything else on that list is self-declared, and self-declared is
legally adequate for it.

1. **The EU VAT number** — VIES, before the money moves, with the `requestIdentifier`, the
   returned name and the returned address stored against the purchase. Art. 18(1)(a).
2. **The buyer's country** — one third-party item below €100 000 of cross-border B2C, two
   non-contradictory items above it. Art. 24b/24f.

⚠️ **A third thing is verified by omission.** Art. 18(2), second subparagraph:

> However, **irrespective of information to the contrary**, the supplier of
> telecommunications, broadcasting or **electronically supplied services** may regard a
> customer established within the Community as a **non-taxable person as long as that customer
> has not communicated his individual VAT identification number** to him.

This is unusually generous, and it is available here precisely because §1 classified the
square as an electronically supplied service. **If the checkout never asks for a VAT number,
every EU buyer is legally a consumer** — no VIES, no ICP listing (§2.1), no reverse-charge
invoice wording, and no exposure to the fake-number hole of §7.2, even if the seller knows
perfectly well the buyer is a business. That is the legal basis §7.2's option 1 was missing.

The price of taking it: EU business buyers are charged VAT they must reclaim through a
Directive 2008/9 refund claim rather than their own return, which for a $100 purchase they
will simply not bother to do; and the site loses the cleanest evidence that a buyer was a
trader and therefore not a consumer under §5.2. ⚠️ **I did not verify the deduction position
of a business buyer charged VAT under this route** — that is an accountant's question (§8).

**Recommendation, and it differs from §7.2 by one step.** Collect the VAT number **and verify
it yourself against VIES before creating the Checkout Session.** It costs one HTTP call, no
money, and it buys the Art. 18(1)(a) safe harbour, the §5.2 trader evidence, and a correct
invoice — while closing the Stripe hole entirely, because the decision is taken before the
payment rather than after it. Fall back to charging VAT whenever VIES says no or says nothing.


## 3. Stripe Tax

All URLs read **2026-08-24**. §7 already covers Stripe across the whole integration —
registrations, the tax-ID hole, location evidence, product tax codes, invoicing and the
total cost of one square. This section does not repeat it. It adds only the Stripe **Tax**
layer: what Stripe Tax decides on its own, what it costs, and the two settings that are
wrong by default for a flat $100 price.

### 3.1 What it costs, and when the fee lands

Netherlands pricing page (<https://stripe.com/en-nl/tax/pricing>): **Tax Basic**, no-code
integration — *"0.5% per transaction, where you're registered to collect taxes"*; API
integration — *"€0.45 per transaction, where you're registered to collect taxes"*, each
transaction including 10 calculation calls and *"€0.04 per calculation API call above 10"*.
**Tax Complete** is a monthly plan from **€80 a month**. **No free tier is published.**

The trigger, from <https://docs.stripe.com/tax/how-tax-works>:

> Checkout Session created with `automatic_tax` enabled, in payment mode | Fee charged when
> the Checkout Session is completed, **if there's an active tax registration covering the
> customer jurisdiction at the time**

and

> The tax calculation fee is distinct from the transaction completion and might apply even
> when: … **The tax amount calculated is zero**

Three consequences worth building around:

- **No registration in the buyer's country ⇒ no fee and no tax.** A US buyer costs $0 of
  Stripe Tax and is charged $0 of VAT. That is correct here (see §2), but it is correct by
  accident: the same silence is what §7.1 warns about for an EU consumer before OSS exists.
- **A reverse-charged EU B2B sale still costs 0.5%**, because the fee follows the
  registration, not the tax. €0 of VAT, $0.50 of Stripe Tax.
- Refunds, credit notes and chargebacks add no second fee: *"Fee is charged for the initial
  transaction"*. The banner hold is the exception already flagged in §7.7 — the fee lands at
  authorization, whether or not the capture ever happens.

### 3.2 ⚠️ `tax_behavior` — the setting that decides who eats the VAT

This is the single Stripe Tax decision with a price tag on it, and the default is against
the site's own copy.

> You must specify a `tax_behavior` on a price, or a default tax behavior in the tax
> settings in the Dashboard, which determines how tax is presented to the customer.
>
> Stripe recommends setting the tax behavior to **Automatic**. This selects **exclusive
> pricing for USD** and CAD and inclusive pricing for all other currencies…
>
> Tax-inclusive prices are common for B2C sales in many markets outside the US. When set to
> inclusive, **the amount your customer pays remains constant, regardless of the tax
> amount** (zero or positive). This applies to sales subject to reverse charge as well.

(<https://docs.stripe.com/tax/products-prices-tax-codes-tax-behavior.md>, read 2026-08-24)

The prices here are in **USD**, so "Automatic" resolves to **exclusive**. On one square:

| `tax_behavior` | Dutch consumer pays | German consumer pays | EU business pays | US buyer pays | Site keeps, ex-VAT |
|---|---|---|---|---|---|
| `exclusive` (the USD default) | $121.00 | $119.00 | $100.00 | $100.00 | $100.00 always |
| `inclusive` | $100.00 | $100.00 | $100.00 | $100.00 | $82.64 / $84.03 / $100 / $100 |

`exclusive` keeps the margin whole and breaks *"A square costs $100"* — the headline number
on the board, in `PRODUCT.md` and on `/how-it-works` — for every EU consumer, with a
different final total per country. `inclusive` keeps the promise and makes the site's net
revenue depend on where the buyer lives, which is exactly what the EU B2C rule is for.

⚠️ **It cannot be undone:** *"You can't change `tax_behavior` after it's been set to
exclusive or inclusive."* A wrong choice means new Price objects, not an edit. And note the
last sentence of the quote: with `inclusive`, a reverse-charged B2B buyer also pays exactly
$100 — the reverse charge does not become a discount, it becomes margin.

This is a **product decision, not a tax decision**, and it belongs to the dev. The honest
default for a board that shouts one price at every visitor is `inclusive`, priced knowing
that a German consumer nets ~$82.64.

### 3.3 The product tax code chooses the place-of-supply rule — Stripe says so outright

§7.4 lists the candidate codes and the fact that Stripe does not publish which EU rule sits
behind `txcd_10701000`. What §7.4 does not say is how far apart the candidates are. Stripe's
EU page states the rules it applies, per category
(<https://docs.stripe.com/tax/supported-countries/european-union>, read 2026-08-24):

> **Digital goods or electronically supplied services**: Generally taxable in the
> **customer's country**. … If you indicated your business is a small seller, the VAT of the
> country your business is based in applies.

> **Services that can be delivered remotely**: Taxable in the customer's country when
> they're provided to individuals **outside** the European Union or other businesses. When
> they're provided to individuals in other EU countries, **they're taxable in the seller's
> country**.

> **Other services**: Taxable in the country your business is based in when provided to
> individuals. Taxable in the customer's country when provided to other businesses. These
> rules apply if you select product tax code `txcd_20030000` General - Services.

So for an Irish consumer, the ESS branch charges Irish VAT and the other two branches charge
Dutch VAT. **That is the whole of §2's B2C question, decided by a dropdown.** §1 settles
which branch is legally right; the build must then confirm, in test mode, which branch
`txcd_10701000` actually takes — because Stripe does not document it, and Stripe's own
instruction is *"Don't make the legal tax classification for the user"*.

### 3.4 Reverse charge: two assumptions Stripe makes for you

> If your customer is eligible for a reverse charge and provides their European VAT number
> in Stripe, we treat their transactions as a reverse charge and don't calculate tax for
> them. If your customer provides a **domestic** tax identification number, **reverse charge
> doesn't apply**. The transaction is treated as a business-to-consumer (B2C) sale…
>
> **Domestic reverse charge**: … Stripe supports reverse charge only for cross-border sales,
> not for sales within the same country.
>
> **Cross-border conditions**: … **Stripe assumes that all services sold to customers with a
> business tax ID are eligible for reverse charge.**

(same page, read 2026-08-24)

Both assumptions happen to be right for this product — a Dutch business buyer is charged
21% and gets a Dutch invoice with VAT on it, and a cross-border EU business buyer is
reverse-charged under Art. 44/196 (§2.1). The point is that they are **assumptions Stripe
applies to every service**, not a determination about this one. Combined with §7.2 — a
correctly-formatted, entirely fake VAT number is enough to trigger them — the reverse-charge
path is the only place in the checkout where an unverified user input moves money.

### 3.5 Reports: enough to prepare an OSS return, not enough to file one

> If you've registered for the One Stop Shop (OSS) within the European Union, you can
> download an itemized export of all your EU transactions. This export can assist in
> preparing your VAT OSS return. Itemized exports include **non-taxable transactions**
> (unless purposely excluded) and **domestic transactions, which you don't need to report in
> an OSS return. Make sure to filter out domestic transactions in your export.**

(<https://docs.stripe.com/tax/reports>, read 2026-08-24)

⚠️ **The currency conversion in those reports is not the conversion the OSS return wants.**
Same page:

> Tax calculation amounts are recorded in the **integration currency** … When the integration
> currency differs from the filing currency, Stripe Tax converts amounts using **available
> exchange rates at the time of the transaction** to calculate the filing currency.

The exports carry `currency` (here `usd`), `filing_currency`, `filing_exchange_rate`,
`filing_tax_amount` and `filing_taxable_amount`. But §4.6 established that the OSS return
must use *"de wisselkoers die de Europese Centrale Bank bekendmaakt op de **laatste dag van
het kwartaal**"* — one rate for the whole quarter, applied at the end of it. Stripe uses a
per-transaction rate at transaction time. **The `filing_*` columns therefore cannot be
copied into the OSS aangifte.** Take `gross_amount` / `tax_amount` in USD per country from
the summarized export and convert them yourself at the quarter-end ECB rate. This is a
build requirement, not a preference.

`Location reports` do not help either: *"Stripe provides location reports for the US and
Canada"* and *"Location reports support sales or use tax types only"*.

### 3.6 Where it stops — pointers, not repetition

Registration and filing (§7.1), tax-ID validity (§7.2), the two-evidence location test and
`billing_address_collection` (§7.3), the product tax code catalogue (§7.4), whether Stripe
prints the invoice and the reverse-charge sentence (§7.5), the all-in cost per square
(§7.6), and the auction hold (§7.7). Nothing in Stripe Tax changes any of those. The
one-line summary Stripe itself gives is the honest one: *"You register, Stripe Tax tracks
your registrations"* — the tracking is automatic, the registering, deciding and filing are
not.


## 4. Invoices, and prices in USD while the books are in EUR

All sources read **2026-08-24**. Statutory text is the consolidated Wet OB 1968
*"Geldend van 01-01-2026 t/m heden"* (<https://wetten.overheid.nl/BWBR0002629/2026-01-01>).

### 4.1 Must an invoice be issued for a $100 sale to a consumer? — No.

**Wet OB 1968 art. 34c lid 1** lists who must be invoiced: *"a. de goederenleveringen of
diensten die hij heeft verricht voor **een andere ondernemer of een rechtspersoon, andere
dan ondernemer**"*, plus afstandsverkopen (34c(1)(b), unless the Unieregeling is used),
nieuwe vervoermiddelen, and vooruitbetalingen. **There is no entry for supplies to
natural-person consumers.** The Belastingdienst states it directly:

> "Verkoopt u goederen of diensten aan particulieren? Dan bent u **niet verplicht** een
> factuur uit te reiken, met uitzondering van de volgende situaties: [groothandel in
> levensmiddelen/tabak/tandheelkunde met ≥80% zakelijke afnemers]; [nieuw of bijna nieuw
> vervoermiddel naar een ander EU-land]."
> (<https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/administratie_bijhouden/facturen_maken/wie_zijn_verplicht_te_factureren>)

And on B2C services abroad: *"U gebruikt de Unieregeling en/of de Invoerregeling — Dan
volgt u gewoon de Nederlandse regels voor facturering. Dit betekent dat u voor de btw geen
factuur hoeft te sturen."* If the Unieregeling is **not** used, the invoicing rules of the
country where the VAT is due apply instead.

**For a business buyer an invoice is always mandatory** — including a foreign
rechtspersoon-geen-ondernemer, and always for an intracommunautaire levering.

**Practical consequence for the checkout:** a consumer needs no invoice, but a business
buyer does, and the site cannot know which it has until it asks. A Stripe receipt is not a
VAT invoice. See §7.5.

### 4.2 The mandatory data (art. 35a lid 1)

Belastingdienst list, verbatim
(<https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/administratie_bijhouden/facturen_maken/factuureisen/factuureisen>):
full name of you and your customer (legal name; a handelsnaam only if registered with
address at the KVK); full address of both (a postbus alone is not enough); **your
btw-identificatienummer** with `NL` in front; **your KVK-nummer**; the date the invoice was
issued; **a sequential invoice number**, each number used once; the nature and extent of
the service; the date of supply or of a prepayment; **the amount excluding VAT** (split per
rate, with the unit price); **the VAT rate**; **the VAT amount**.

The statute (art. 35a lid 1) matches, and adds the ones that matter here:
**sub d** — the **customer's** btw-identificatienummer where the customer owes the tax;
**sub g** — the supply date *"voor zover die datum vastgesteld is en verschilt van de
uitreikingsdatum"*; **sub m** — where the customer owes the tax, the words **«btw
verlegd»**.

⚠️ **The KVK number is not a VAT requirement.** It is absent from art. 35a. Its basis is
**Handelsregisterwet 2007 art. 27 lid 1** (*"…op alle van die onderneming uitgaande
brieven, orders, **facturen**, offertes…"*). Omitting it breaches the Handelsregisterwet,
not the VAT invoice rules — it does not cost the customer their aftrek. Include it anyway.

**Deadline — art. 34g:** *"De factuur wordt uitgereikt uiterlijk op de **vijftiende dag van
de maand volgende op die waarin de goederenlevering of de dienst is verricht**."*

**Digital invoicing needs the customer's agreement:** *"uw afnemer moet ermee akkoord gaan
dat u digitaal factureert. Ook moet u zekerheid kunnen geven over de echtheid van
herkomst, de inhoud en de leesbaarheid."* A tick box or a terms clause covers this.

### 4.3 Reverse charge — the exact wording

*"Bij zo'n verleggingsregeling rekent u geen btw, maar vermeldt u op de factuur: **'btw
verlegd' en het btw-identificatienummer van die afnemer**."* For EU B2B services the
Belastingdienst adds: *"de btw-identificatienummers van u én uw klant. Vraag het
btw-identificatienummer aan uw klant. **Controleer het btw-identificatienummer altijd.**"*
and *"'btw verlegd'. U kunt dat ook doen in het Engels, Duits of Frans."* So
`VAT reverse charged` on an English invoice is accepted.

### 4.4 The €100 simplified invoice — real, but do not rely on it

**Wet OB 1968 art. 34d lid 1**, still in force in the 01-01-2026 text: a vereenvoudigde
factuur is allowed *"a. wanneer het bedrag van de factuur niet hoger is dan **€ 100**"*,
for a corrective invoice, and *"c. wanneer de ondernemer gebruikmaakt van de vrijstelling,
bedoeld in artikel 25a, eerste lid [KOR]"* — note the KOR trigger is in the law but missing
from the Belastingdienst page. Content is set by art. 35a lid 2: date, supplier identity,
nature of the service, the tax amount **or the data from which it can be calculated**.

**It is prohibited** (art. 34d lid 2, and the Belastingdienst "Let op!") for
intracommunautaire leveringen, **afstandsverkopen**, and supplies in another EU country
where the VAT is reverse-charged to the customer.

**For this product:** the threshold is on the **invoice amount in euros**. USD 100 is
roughly €85–95 at 2026 rates, so a $100 square usually sits under it — but that is a
knife-edge that flips with the exchange rate, and the regime is barred exactly where this
site most often lands (reverse-charged EU B2B). **Issue a full art. 35a invoice every
time.** Simpler to build once than to branch on a moving rate.

### 4.5 USD is allowed. The VAT amount must still be in euros.

**Wet OB 1968 art. 35a lid 4** — the controlling rule, unambiguous:

> "Op een factuur kunnen bedragen in **willekeurig welke munteenheid** voorkomen, mits het
> te betalen of te herziene **bedrag van de belasting is uitgedrukt in euro's** en daarbij
> gebruik wordt gemaakt van het in artikel 91 van de BTW-richtlijn 2006 bedoelde
> wisselkoersmechanisme."

Belastingdienst confirmation, per rate: *"het btw-bedrag **in euro's**"*
(<https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/internationaal/btw_voor_buitenlandse_ondernemers/btw_administratie/verplichte_gegevens_op_uw_factuur>).

⚠️ That page is addressed to entrepreneurs established **outside** the Netherlands, and the
Dutch-entrepreneur "factuureisen" page says nothing about currency at all. The rule is not
addressee-specific — rely on art. 35a lid 4, not on the website.

**What the invoice must look like:** `USD 100.00` for the vergoeding is fine, but the VAT
line must also carry a euro figure — `BTW 21%: USD 21.00 (€ 18,06)`. Where the supply is
reverse-charged or outside Dutch VAT, there is no tax amount, so the euro requirement is
inert and a pure-USD invoice is complete.

### 4.6 Which exchange rate — exactly two are permitted

**Wet OB 1968 art. 8 lid 6:**

> "Indien gegevens voor het bepalen van de vergoeding zijn uitgedrukt in een andere
> munteenheid dan de euro, wordt de wisselkoers vastgesteld overeenkomstig de **laatst
> genoteerde verkoopkoers** op het tijdstip waarop de belasting verschuldigd wordt. In
> plaats van het hiervoor bedoelde wisselkoersmechanisme mag ook gebruik gemaakt worden van
> de wisselkoers die, op het tijdstip waarop de belasting verschuldigd wordt, door de
> **Europese Centrale Bank** laatstelijk was bekendgemaakt."

Reference moment for a service: the invoice date, or the date the invoice must at the
latest be issued (the 15th of the following month). The Belastingdienst's fullest published
text on this is written for **incoming** invoices, but art. 8 lid 6 is symmetrical.

⚠️ **Three things that are commonly claimed and that I could not source:**
1. **The douane (customs) rate is NOT available for invoicing.** Art. 91(2) of the VAT
   Directive lets a Member State offer it; **the Netherlands did not implement it** in art.
   8 lid 6. The customs rate is confined to import VAT (art. 19 Wet OB).
2. **No permission is needed** to choose the ECB rate. Art. 8 lid 6 says *"mag ook gebruik
   gemaakt worden van"* — a free election, no beschikking.
3. **No "rate agreed with the inspector" exists** for VAT. The Uitvoeringsbeschikking
   omzetbelasting 1968 contains **no** exchange-rate provision at all (searched for
   *wisselkoers*, *valuta*, *omreken*: zero hits). The Regeling functionele valuta is
   **corporate income tax**, not VAT — do not confuse them.

**Consistency:** no explicit statutory consistency rule for the rate could be found; the
published *"vaste lijn"* requirement is for **rounding** only. Recommendation regardless:
pick the **daily ECB reference rate**, because it is published, free, auditable and named
by the Belastingdienst — document the choice, and never switch per invoice.

**Rounding (art. relevant page):** arithmetic rounding, *"€ 20,124 afrondt naar € 20,12 en
€ 20,125 naar € 20,13"*; you may round per line **or** on the total but **not both**, and
must keep one method consistently. The VAT return is rounded to whole euros, and that may
be done in your favour.

**If you ever register for the Unieregeling**, the OSS return uses a **different, mandatory**
rate: *"de wisselkoers die de Europese Centrale Bank bekendmaakt op de **laatste dag van
het kwartaal**"*. Do not confuse it with the invoice rate.

### 4.7 Retention

*"U bewaart de facturen **7 jaar**."* Digital invoices are kept digitally, in the form sent
or received; scanning paper is allowed if the reproduction is complete and the
authenticity features are kept.

⚠️ **The Unieregeling raises it to 10 years:** *"Hebt u gekozen voor de Unieregeling of de
Invoerregeling…? Dan geldt voor de leveringen en diensten die daaronder vallen een
**bewaarplicht van 10 jaar**."* If OSS is chosen in §2, this is a consequence to accept.


## 5. The right of withdrawal

### 5.1 The short version

Charting decided to waive the withdrawal right with a tick box at checkout, the way
outbid.lol does for bids. **That decision does not survive contact with the Directive.**
A tick box is necessary but it is not sufficient, and on the facts as charted it does not
extinguish anything on the day of purchase.

The chain is:

1. A square is a **service** (a digital service), not digital content. → §5.3
2. Services get exception **Art. 16(1)(a)**, which needs the service to be **fully
   performed** before the right is gone. → §5.4
3. A square that lands `pending` with no artwork is not fully performed, and a square
   sold as **permanent** is arguably never fully performed. → §5.5
4. So a consumer buyer keeps a 14-day right, and the tick box buys the site only a
   **pro-rata** claim under Art. 14(3) — which, spread over a permanent contract, is
   worth close to nothing. → §5.6
5. The tick box is still worth having, because without it the buyer owes **nothing at
   all** under Art. 14(4)(a). → §5.6

### 5.2 Does the right apply here at all?

Only to **consumers**. Art. 2(1) of Directive 2011/83/EU:

> ‘consumer’ means any natural person who, in contracts covered by this Directive, is
> acting for purposes which are outside his trade, business, craft or profession

(consolidated text 02011L0083-20220528, Art. 2(1); read via
<https://publications.europa.eu/resource/celex/02011L0083-20220528>, 2026-08-24)

Most buyers of an advertising square are buying advertising **for** a trade — an indie
maker, a SaaS, a crypto project, a local business. Those are not consumers and have no
withdrawal right. That is a real defence, but it is not a plan, for three reasons:

- The site does not currently ask whether the buyer is a business. `PRODUCT.md` names
  four segments, and "anyone who wants a durable, visible link to their own website"
  includes a private person linking a personal blog.
- Recital 17 of the original Directive extends "consumer" to dual-purpose contracts:

  > in the case of dual purpose contracts, where the contract is concluded for purposes
  > partly within and partly outside the person’s trade and the trade purpose is so
  > limited as not to be predominant in the overall context of the contract, that person
  > should also be considered as a consumer

  (Recital 17, <https://publications.europa.eu/resource/celex/32011L0083>, 2026-08-24)
- The burden of showing the buyer was acting professionally falls on the trader in
  practice. A VAT number on file is the cleanest evidence — which links this directly to
  the checkout fields in §2.

**Non-EU consumers.** The CRD does not reach them directly, but Rome I applies:

> a contract concluded by a natural person for a purpose which can be regarded as being
> outside his trade or profession (the consumer) with another person acting in the
> exercise of his trade or profession (the professional) shall be governed by the law of
> the country where the consumer has his habitual residence, provided that the
> professional … (b) by any means, directs such activities to that country

(Regulation (EU) No 593/2008, Art. 6(1);
<https://publications.europa.eu/resource/celex/32008R0593>, 2026-08-24)

A worldwide English-language site priced in USD directs activities everywhere. So a
consumer in California or Brazil gets **their own** local cooling-off rules, not the
CRD's. That is unmappable for a one-person business and is one of the open questions in
§8.

**Choice of law does not fix it.** Art. 6(2) Rome I: a choice of law "may not … have the
result of depriving the consumer of the protection afforded to him by provisions that
cannot be derogated from" under their home law. And CRD Art. 25: "consumers may not waive
the rights conferred on them"; contrary terms "shall not be binding on the consumer"
(same sources, 2026-08-24). A clause in `/terms` saying "no way back" is void against an
EU consumer.

### 5.3 Service or digital content? — decisive, and it is a service

The two Art. 16 exceptions have different conditions, so the classification decides
everything.

"Digital content" is narrow. CRD Art. 2(11) points at Directive (EU) 2019/770 Art. 2(1):

> ‘digital content’ means data which are produced and supplied in digital form

"Digital service" (Art. 2(2) of the same directive) is:

> (a) a service that allows the consumer to create, process, store or access data in
> digital form; or (b) a service that allows the sharing of or any other interaction with
> data in digital form uploaded or created by the consumer or other users of that service

(<https://publications.europa.eu/resource/celex/32019L0770>, 2026-08-24)

Point (b) describes 200 squares almost word for word: the buyer **uploads** artwork and a
link, and the site shares it. And CRD Art. 2(6) puts digital services inside "service
contract":

> ‘service contract’ means any contract other than a sales contract under which the
> trader supplies or undertakes to supply a service, including a digital service, to the
> consumer

The CJEU has settled the same point. In **C-641/19 PE Digital** the Court held:

> a service … that allows the consumer to create, process, store or access data in
> digital form and allows the sharing of or any other interaction with data in digital
> form uploaded or created by the consumer or other users of that service, cannot, as
> such, be regarded as the supply of ‘digital content’ within the meaning of
> Article 16(m)

and added that Art. 16(m), "as a provision of EU law which restricts the rights granted
for reasons relating to consumer protection, [is] to be interpreted strictly"
(paragraphs 43–44; <https://publications.europa.eu/resource/celex/62019CJ0641>,
2026-08-24).

The Commission's own guidance closes the door on any residual doubt. Commission Notice —
Guidance on the Consumer Rights Directive (OJ C 525, 29.12.2021), section 5.7:

> The right of withdrawal from contracts for digital services is discussed in previous
> section 5.6 dealing with service contracts in general.

and, quoting Recital 30 of Directive (EU) 2019/2161:

> [w]here there is doubt as to whether the contract is a service contract or a contract
> for the supply of digital content which is not supplied on a tangible medium, the rules
> on right of withdrawal for services should apply

(<https://publications.europa.eu/resource/celex/52021XC1229%2804%29>, 2026-08-24. The
Commission Notice is guidance, not binding law; it is cited here because it states the
Commission's reading of provisions that are binding.)

**Conclusion: Art. 16(1)(m) is not available. Art. 16(1)(a) is the only route.**

### 5.4 What Art. 16(1)(a) actually requires

> (a) service contracts **after the service has been fully performed** but, if the
> contract places the consumer under an obligation to pay, only if the performance has
> begun with the consumer’s **prior express consent** and **acknowledgement that he will
> lose his right of withdrawal once the contract has been fully performed by the
> trader**;

(consolidated Art. 16, first paragraph, point (a), 2026-08-24. Emphasis added.)

Three cumulative conditions, and the first is the one charting missed. The tick box
supplies conditions 2 and 3. **Condition 1 — full performance — is a fact about the
world, not something a buyer can agree to.**

The mirror obligation on the trader is Art. 8(8) (distance contracts):

> Where a consumer wants the performance of services … to begin during the withdrawal
> period provided for in Article 9(2), and the contract places the consumer under an
> obligation to pay, the trader shall require that the consumer make an express request
> and request the consumer to acknowledge that, once the contract has been fully
> performed by the trader, the consumer will no longer have the right of withdrawal.

The clock, meanwhile, runs from the day of purchase: Art. 9(2)(a), "in the case of
service contracts, the day of the conclusion of the contract".

**Dutch implementation.** Art. 6:230p sub d BW:

> d. een overeenkomst tot het verrichten van diensten, na nakoming van de overeenkomst,
> en voor zover de overeenkomst voor de consument een betalingsverplichting inhoudt,
> indien: 1°. de nakoming is begonnen met uitdrukkelijke voorafgaande instemming van de
> consument; en 2°. de consument heeft verklaard afstand te doen van zijn recht van
> ontbinding zodra de handelaar de overeenkomst is nagekomen;

and Art. 6:230v lid 8:

> Nakoming van een overeenkomst op afstand tot het verrichten van een dienst … geschiedt
> tijdens de ontbindingstermijn slechts op uitdrukkelijk verzoek van de consument, en de
> consument heeft verklaard dat hij afstand doet van zijn recht op ontbinding zodra de
> handelaar de overeenkomst **volledig is nagekomen**.

(BW Boek 6, afdeling 6.5.2B, version in force on 2026-08-24;
<https://wetten.overheid.nl/BWBR0005289/2026-01-01/0/Boek6/Titeldeel5/Afdeling2B>,
read 2026-08-24. Emphasis added.)

Note that Dutch law uses "na nakoming" / "volledig nagekomen" — after performance, fully
performed. Same trap, same words.

Note also what 6:230p sub g requires that sub d does **not**: the durable-medium
confirmation. 6:230v lid 7 sub b requires the confirmation email to repeat the consent
only "overeenkomstig artikel 230p onderdeel g". Since we are on sub d, that is not
strictly required — but see §5.7 for why the site should do it anyway.

### 5.5 The `pending` problem, and the "permanent" problem

Charting fixed two things that collide here:

- **"Artwork comes after payment. The block lands `pending`."**
- **"A square is permanent … it does not expire."** (`/how-it-works`, "What you get")

Neither is compatible with "fully performed".

**The `pending` half.** On the day of purchase the buyer has paid $100 and holds a
reserved rectangle with no image and no link. `CONTEXT.md` says a `pending` square is
"paid for, artwork not supplied yet" and `Clicks` says "a `pending` block has no count,
because a click on it opens nothing". The thing the buyer paid for — a visible image and
a working link — does not exist yet. No court is going to call that fully performed. The
site cannot even argue the buyer caused the delay: charting deliberately designed it that
way, and the FAQ sells it as a feature ("You can add it later: your squares stay reserved
until you do").

**The `permanent` half is worse, and it survives the artwork upload.** Even after the
buyer uploads, what they bought is an ongoing display "for as long as this site runs"
(`/terms`, "What you buy"). A contract of indeterminate duration is not fully performed on
day one; it is being performed continuously. There is no primary source that says a
perpetual service is never fully performed — that is an inference, and it is flagged in
§8 — but the direction of travel is unmistakable given PE Digital's instruction to read
these exceptions strictly.

**A single-day service is different, and this is why the outbid.lol analogy fails.** The
banner is one day of occupancy that ends at 00:00 UTC. There, "fully performed" is a real
moment. A square is not a banner day, and copying the bid flow onto the square flow copies
the wording without copying the fact that makes the wording work.

**Auctions get no shelter either.** Art. 16(1)(k) exempts "contracts concluded at a public
auction", and Art. 2(13) defines that as a method of sale where consumers "attend or are
given the possibility to attend the auction in person". Recital 24 kills the online case
outright:

> The use of online platforms for auction purposes which are at the disposal of consumers
> and traders should not be considered as a public auction within the meaning of this
> Directive.

(<https://publications.europa.eu/resource/celex/32011L0083>, 2026-08-24)

So a consumer who wins the banner auction has the same 14-day right as a square buyer. The
banner's saving grace is only that it *can* be fully performed, at the end of its day.

### 5.6 What the tick box is actually worth

It is worth having. It just does not do what charting thought.

**Without the tick box**, Art. 14(4)(a):

> The consumer shall bear no cost for: (a) the performance of services … in full or in
> part, during the withdrawal period, where: (i) the trader has failed to provide
> information in accordance with points (h) or (j) of Article 6(1); or (ii) the consumer
> has not expressly requested performance to begin during the withdrawal period in
> accordance with Article 7(3) and Article 8(8)

A consumer who withdraws on day 13, after two weeks of a live block on the board, pays
**nothing**. Full $100 refund, no offset.

**With the tick box**, Art. 14(3):

> the consumer shall pay to the trader an amount which is in proportion to what has been
> provided until the time the consumer has informed the trader of the exercise of the
> right of withdrawal, in comparison with the full coverage of the contract. The
> proportionate amount … shall be calculated on the basis of the total price agreed in the
> contract.

And **C-641/19 PE Digital**, ruling 1: the amount is calculated

> in principle, to take account of the price agreed in the contract for the full coverage
> of the contract and to calculate the amount owed *pro rata temporis*. It is only where
> the contract concluded expressly provides that one or more of the services are to be
> provided in full from the beginning of the performance of the contract and separately,
> for a price which must be paid separately, that the full price for such a service should
> be taken into account

(<https://publications.europa.eu/resource/celex/62019CJ0641>, 2026-08-24)

*Pro rata temporis* over a **permanent** contract is the punchline: 14 days out of forever
is approximately zero. On a $100 square the site keeps cents. So the honest accounting is:

| | Consumer withdraws within 14 days |
|---|---|
| No tick box | Refund $100. Site keeps $0. Plus the Art. 10 extension below. |
| Tick box, done properly | Refund ~$100. Site keeps a *pro rata* sliver. |
| Tick box + square fully performed first | No withdrawal right at all. |

The third row is only reachable for the banner, not for a permanent square.

**The Art. 10 tail is the expensive part.** If the site never tells the buyer the right
exists, the period does not stay at 14 days:

> If the trader has not provided the consumer with the information on the right of
> withdrawal as required by point (h) of Article 6(1), the withdrawal period shall expire
> **12 months** from the end of the initial withdrawal period

(Art. 10(1); Dutch equivalent 6:230o lid 2, "doch met ten hoogste twaalf maanden.") A
`/terms` page that says "There is no way to hand a square back to the site" and nothing
else does not inform anybody of anything. That converts a 14-day exposure into a
**12-month-and-14-day** exposure on every consumer sale, refundable in full under
Art. 14(4)(a). On a full board that is a theoretical $19,900 open position. That, not the
tick box, is the number worth caring about.

**Penalties.** Art. 24(3), as amended by the Omnibus directive, requires member states to
provide fines with a maximum "of at least 4 % of the trader’s annual turnover in the
Member State or Member States concerned", and Art. 24(4) at least EUR 2 million where
turnover is unknown. For a one-person business these are ceilings, not forecasts, and they
apply to widespread cross-border infringements — but they are the reason to not treat
"nobody will ever ask" as a strategy.

### 5.7 The tick box: exact wording, exact placement

**It must be a real tick box, not a term.** Commission guidance, section 5.6.1:

> By analogy with the rules on additional payments under Article 22, the terms ‘express
> request/consent’ in this context should be interpreted as implying a positive action by
> the consumer, such as ticking a box on the website. The use of a **pre-ticked box** or
> of a **clause in the general terms and conditions** for this purpose would not satisfy
> these requirements.

and

> The consumer’s express consent and acknowledgement can be acquired before, during, or
> after the contract is concluded, as long as it happens **before the performance starts**.
> The consumer’s request and acknowledgement can be expressed in one go.

(<https://publications.europa.eu/resource/celex/52021XC1229%2804%29>, 2026-08-24)

Two consequences that decide the build:

- **Bundling it into "I agree to the Terms" is exactly the thing the guidance rules out.**
  It must be its own box, unticked, with its own sentence.
- **Putting it on 200squares.com before the Stripe redirect satisfies "prior".** Consent
  given before the contract is concluded is fine, so long as performance has not started.
  Performance cannot start before payment here, so the panel is a legal place for the box.

The Commission's own model formula for the services case is:

> […] I hereby request [immediate performance or performance on/as from specific date
> during the withdrawal period] of the service contract and acknowledge that I will lose
> my right of withdrawal from the contract once the service contract is fully performed.

**Proposed wording for 200 squares** (English, since the UI is English), adapted from that
formula and from Art. 16(1)(a)'s own words. One box, unticked, immediately above the
button that sends the visitor to Stripe:

> ☐ Start now. I ask 200 SQUARES to reserve my squares straight away, during the 14-day
> withdrawal period, and I accept that I lose my right to withdraw once this square has
> been fully delivered to me.

And directly under it, in the same block, as plain text — this is the Art. 6(1)(h)
information, and it is the part that keeps the 12-month tail closed:

> You have 14 days to change your mind, counting from today. Email
> `<contact address>` and say so — no reason needed — and you get your $100 back within
> 14 days. Once your square is live with your image and your link, that right ends. If
> you withdraw before then, we may keep a small part of the price for the days your
> square was reserved.
>
> [Full withdrawal terms and the model withdrawal form](/terms#withdrawal)

For the **banner auction**, the box goes on the bid panel, and it can say the thing that
is actually true:

> ☐ Start now. I ask 200 SQUARES to run my bid straight away, during the 14-day
> withdrawal period, and I accept that I lose my right to withdraw once my banner day has
> finished.

**Placement, concretely.**

1. The box lives in the detail panel (`Detail panel` in `CONTEXT.md`), in the buy flow,
   below the price line and above the button that creates the Checkout Session.
2. It is unticked on load. The button that leaves for Stripe is **disabled** until it is
   ticked, or the box is optional and the site simply does not claim the exception when it
   is not ticked. Disabling is simpler and matches "express request".
3. The site stores, per purchase: the boolean, the **exact wording shown**, and a
   timestamp. Wording changes over time; what matters in a dispute is the sentence *that
   buyer* saw. This is not required by any article — it is the only way to prove Art.
   8(8) was satisfied, and the burden is on the trader.
4. The confirmation email (Art. 8(7) / 6:230v lid 7) repeats the tick box wording verbatim.
   Strictly, sub d does not demand it — only sub g does — but it costs nothing, it is
   `durable medium` proof, and it removes an argument.

**Do not put this box on Stripe's page.** Stripe can render exactly one custom consent
checkbox: `consent_collection[terms_of_service]=required` plus
`custom_text[terms_of_service_acceptance][message]`, up to 1200 characters, markdown links
allowed, result recorded as `consent.terms_of_service = 'accepted'` on the session
(<https://docs.stripe.com/payments/checkout/custom-components.md?platform=web&payment-ui=stripe-hosted>,
read 2026-08-24). One box. Using it for the withdrawal waiver means either dropping the
terms-of-service box or bundling the two — and bundling is the failure mode the guidance
names. Stripe also warns on that page: "You're prohibited from using this feature to create
custom text that violates or creates ambiguity with the Stripe generated text on Checkout
… and applicable laws."

### 5.8 The order button — a separate defect, and it is the sharper one

Art. 8(2), second subparagraph:

> The trader shall ensure that the consumer, when placing his order, explicitly
> acknowledges that the order implies an obligation to pay. If placing an order entails
> activating a button or a similar function, the button or similar function shall be
> labelled in an easily legible manner **only with the words ‘order with obligation to
> pay’ or a corresponding unambiguous formulation** indicating that placing the order
> entails an obligation to pay the trader. If the trader has not complied with this
> subparagraph, **the consumer shall not be bound by the contract or order.**

Dutch: 6:230v lid 3 ends "Een overeenkomst die in strijd met dit lid tot stand komt, is
**vernietigbaar**" — voidable — and names "bestelling met betalingsverplichting" as the
safe formulation.

**C-249/21 Fuhrmann-2** decided how strictly to read it:

> only the words that appear on that button or that similar function should be taken into
> account

(<https://publications.europa.eu/resource/celex/62021CJ0249>, 2026-08-24)

Surrounding text does not rescue a bad button label. Now look at what Stripe offers.
`submit_type` on a Checkout Session takes exactly `auto`, `book`, `donate`, `pay`,
`subscribe`; `pay` renders a button labelled **"Buy"**, and the label is not otherwise
settable. `custom_text[submit][message]` renders text **above** the button, and
`custom_text[after_submit][message]` **below** it — never on it
(<https://docs.stripe.com/api/checkout/sessions/create> and the custom-components page,
both read 2026-08-24). Under Fuhrmann-2, text above and below the button is legally
invisible.

So there are two designs and the site must pick one deliberately:

- **(A) The order is placed on 200squares.com.** The panel's own button carries the
  compliant label — `Order with obligation to pay — $600` — and the Stripe page is
  presented as the payment step for an order already placed. This is the safe reading, it
  costs one label change, and it keeps the tick box and the button on the same screen.
- **(B) The order is placed on Stripe.** The button says "Buy", and whether "Buy" is a
  "corresponding unambiguous formulation" under Dutch law is an open question nobody has
  answered. The downside is not a fine; it is that every consumer contract is voidable.

**Take (A).** It is free.

### 5.9 Copy that is currently untrue and must change

This is the §5 half of the map's "Making the copy true again" item.

| Where | Line today | Why it breaks |
|---|---|---|
| `/terms`, "Selling your square on" | "There is no way to hand a square back to the site." | Flatly wrong for an EU consumer in the first 14 days. Void under Art. 25 / and it is the omission that triggers the 12-month Art. 10 extension. |
| `/terms`, "What you buy" | "You pay once, and the square is yours for as long as this site runs." | Fine as a promise, fatal as an argument that the service is fully performed on day one. Keep the promise; stop leaning on it. |
| `/terms`, "What you buy" | "There is no subscription, no renewal and no invoice after the first one." | Implies exactly one invoice is issued. See §4 — that has to be true, or the sentence goes. |
| `/terms`, "The daily banner" | "A bid is binding while it stands." | True between businesses. For a consumer winner, binding *and* withdrawable for 14 days unless the banner day has finished. |
| `/terms`, "The daily banner" | "A banner that breaks them is removed for the rest of its day and the bid is not returned." | Separate from withdrawal, but a total forfeiture clause against a consumer invites an unfair-terms challenge. Flagged, not researched. |
| `/how-it-works`, step 3 | "You can add it later: your squares stay reserved until you do." | This sentence is the site's own admission that it has not fully performed. It is good copy and honest; it just cannot coexist with "the right is gone at checkout". |
| `/privacy`, "What you give it" | "To buy a square: a company name, a web address, an email address for the receipt" | Does not mention country, billing address, VAT number or the location evidence VAT law requires. See §2. |
| `/privacy`, intro | "It does not need to know much about you, so it does not ask." | Becomes untrue the moment the checkout collects and stores billing country plus a second piece of location evidence. |

`/terms` needs a new **Withdrawal** section carrying the Art. 6(1)(h) information: the
14 days, when they start, how to say so, the 14-day refund deadline, the *pro rata*
deduction, and the model withdrawal form of Annex I(B) — which Art. 11(1) says the
consumer "may" use, so the site must offer it but may also accept "any other unequivocal
statement".

---

## 6. The KOR — kleineondernemersregeling

Statutory text is the consolidated Wet OB 1968 *"Geldend van 01-01-2026 t/m heden"*
(<https://wetten.overheid.nl/BWBR0002629/2026-01-01>, read 2026-08-24). The scheme was
rebuilt on 1 January 2025 to implement Directive (EU) 2020/285, and the 2026 text is the
rebuilt one: art. 25 (definitions), 25a–25b (KOR in the Netherlands), 25c–25g (the EU-KOR).

### 6.1 What it is

**Art. 25a lid 1:**

> Een ondernemer die in Nederland is gevestigd en van wie de **jaaromzet in Nederland niet
> meer bedraagt dan € 20.000** kan kiezen voor toepassing van vrijstelling van belasting ter
> zake van door de ondernemer **in Nederland** verrichte leveringen van goederen en diensten.

It is a **vrijstelling**, not a reduced rate: no VAT on the invoice, and none owed. Two words
in that sentence do all the work — *"in Nederland"* twice.

### 6.2 Which turnover counts — this is the whole answer for a business selling abroad

**Art. 25 lid 1 sub a** defines *jaaromzet in Nederland* as the total of the vergoedingen for
supplies:

> verricht door een ondernemer **binnen Nederland** gedurende een kalenderjaar:
> 1°. leveringen van goederen en diensten, **voor zover die zonder toepassing van artikel
> 25a, eerste lid, belast zouden zijn in Nederland**; […]

So the €20 000 counts only what Dutch VAT would otherwise bite. Applied to §1.6's table:

| Buyer | Counts toward €20 000? |
|---|---|
| NL consumer, NL business | **Yes** |
| EU consumer, **while** the €10 000 threshold of §2.2 still holds | **Yes** — art. 6k parks the supply in the Netherlands |
| EU consumer, **after** the €10 000 threshold is crossed | No — art. 6h moves the place of supply abroad |
| EU business (reverse charge) | No — art. 6 lid 1 puts it in the buyer's country |
| Any buyer outside the EU | No |

The Belastingdienst says the same thing in plain words, and adds one trap:

> **Deze omzet telt u niet mee:** … **prestaties die belast zijn in een ander land.** Wanneer u
> goederen of diensten levert in een ander land, is uw prestatie mogelijk daar belast. **De
> hiermee behaalde omzet telt niet mee voor de omzetgrens van de KOR.** ⚠️ **Leveringen van
> goederen en diensten die in Nederland belast zijn met 0% btw tellen wél mee voor de
> omzetgrens van de KOR.**

(<https://www.belastingdienst.nl/wps/wcm/connect/nl/btw/content/kor-voorwaarden>, read
2026-08-24. The same page counts *nationale verlegging* — NL-to-NL reverse charge — as turnover
that **does** count, and reverse charge *received* as turnover that never does.)

**At roughly €85–95 per $100 square (§4.4), €20 000 is about 210–235 squares of Dutch and
EU-consumer sales — more than the 199 the board contains.** For a board sold mostly abroad
the ceiling is close to unreachable. The KOR is an easy fit here. The question is whether it
is a good one.

### 6.3 What it costs: the deduction, unconditionally

**Art. 25a lid 4:**

> De ondernemer die de vrijstelling toepast, **heeft geen recht op aftrek van belasting** en
> **mag op de factuur op geen enkele wijze melding maken van omzetbelasting**.

Mirrored by Art. 289 of the Directive: *"Taxable persons exempt from VAT shall not be entitled
to deduct VAT … and may not show the VAT on their invoices"*
(<https://publications.europa.eu/resource/celex/02006L0112-20250101>, read 2026-08-24).

⚠️ **The KOR exempts what you sell. It does not exempt what you buy.** Services bought from
abroad still reverse-charge onto the buyer under art. 12, and under lid 4 that VAT is not
deductible — it simply becomes a cost. The statute confirms the point from the side door:
art. 25b lid 3 excludes *"de aan de ondernemer verrichte leveringen van goederen en diensten,
bedoeld in: a. artikel 12, tweede, derde en vijfde lid"* from the administrative relief of
art. 25b. Reverse-charged purchases stay the entrepreneur's problem.

The Belastingdienst says the same from both ends: *"U trekt de btw over uw zakelijke kosten en
investeringen niet af. Dit geldt ook voor btw die u hebt betaald in een ander EU-land"*, and
⚠️ *"Koopt of verkoopt u goederen en/of diensten binnen de EU én maakt u gebruik van de KOR? Dan
gelden er aangepaste regels en is het soms lastig om te bepalen wat u met de btw moet doen.
**Vaak moet u dan incidenteel btw-aangifte doen.**"*
(<https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/hoe_werkt_de_btw/kleineondernemersregeling/kleineondernemersregeling>,
read 2026-08-24). "No btw-aangifte" is therefore not true for this business: a KOR user buying
reverse-charged services from abroad files occasional returns to pay VAT it cannot deduct.

This site's whole cost base is exactly that kind of purchase: Vercel, Convex, Resend, Stripe
Tax, the domain. The map fixes the infrastructure ceiling at **$25 a month in a normal month**,
so the non-deductible slice is small in absolute terms — on the order of tens of euros a year.
⚠️ **I did not verify which of those supplier invoices carry VAT and which are exempt
financial services** (Stripe's payment processing plausibly being the latter). That is an
accountant's line item, not a research finding.

### 6.4 What it does to invoicing

- **No VAT may appear anywhere on the invoice** (art. 25a lid 4, above).
- **A simplified invoice becomes available regardless of amount.** §4.4 already found art. 34d
  lid 1: *"c. wanneer de ondernemer gebruikmaakt van de vrijstelling, bedoeld in artikel 25a,
  eerste lid"*. The $100/€100 knife-edge of §4.4 stops mattering for the supplies the KOR
  covers. It still does not help for the ones it does not, because art. 34d lid 2 bars
  simplified invoices exactly there.
- **The KVK number is still required** — its basis is the Handelsregisterwet, not the VAT rules
  (§4.2).
- ⚠️ **A KOR user is *not* relieved of invoicing.** Art. 25b lid 2 grants relief from arts. 34,
  34c–35b and 37a, but art. 25b is the separate micro-case for an entrepreneur who *"heeft zich
  voor de omzetbelasting niet gemeld bij de inspecteur of de Kamer van Koophandel en is daartoe
  ook niet verplicht"*. An eenmanszaak with a KVK and a BTW number is not that entrepreneur.
  Business buyers still get a full art. 35a invoice.
- ⚠️ **The statute contradicts itself, and only the Belastingdienst resolves it.** A
  reverse-charged EU B2B square is not covered by the KOR (§6.2), so its invoice must carry
  «btw verlegd» and the buyer's VAT number (§4.3). But art. 25a lid 4 says the KOR user *"mag op
  de factuur **op geen enkele wijze** melding maken van omzetbelasting"*. **The statute does not
  say which supplies lid 4 governs.** The Belastingdienst does, in one sentence on the
  factuureisen page: the relaxation for exempt entrepreneurs, *"Dit geldt ook voor ondernemers
  die meedoen met de kleineondernemersregeling (KOR)"*, is immediately followed by *"**Bent u
  gedeeltelijk vrijgesteld, dan moet u voor de belaste goederen of diensten wel
  factureren.**"*
  (<https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/administratie_bijhouden/facturen_maken/wie_zijn_verplicht_te_factureren>,
  read 2026-08-24). So: full art. 35a invoice with «btw verlegd» for the EU B2B squares, no VAT
  mentioned on anything the KOR covers. That is the workable reading; it rests on a website
  sentence, not on art. 25a, and it stays on the accountant's list (§8).
- **For the supplies the KOR does cover, invoicing becomes optional:** *"U vermeldt geen btw op
  uw facturen. U hoeft zelfs helemaal geen facturen te versturen voor de btw. … Als u zelf
  facturen wilt versturen, of als uw klanten daarom vragen, kunt u dat wel doen. **U vermeldt
  dan op de factuur dat een vrijstelling van toepassing is.**"*
  (<https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/hoe_werkt_de_btw/kleineondernemersregeling/wat-betekent-meedoen-met-de-kleineondernemersregeling/wat-betekent-meedoen-met-de-kleineondernemersregeling>,
  read 2026-08-24)

### 6.5 One genuine simplification, and it is a surprising one

**Art. 37a lid 1** opens:

> De ondernemer, **uitgezonderd die bedoeld in artikel 7, zesde lid, of artikel 25a, eerste
> lid**, is verplicht … een lijst … waarop zijn vermeld de afnemers: […] c. voor wie hij
> diensten heeft verricht die met toepassing van artikel 6, eerste lid, niet belastbaar zijn
> in Nederland en waarover de belasting ingevolge artikel 196 van BTW-richtlijn 2006 in de
> lidstaat van de afnemer wordt geheven van de afnemer…

**A KOR user files no ICP listing at all** — including for the reverse-charged EU B2B services
that §2.1 said would otherwise mean four returns a year forever. That is a bigger practical
saving than the VAT itself for a business at this scale. ⚠️ It is also counter-intuitive
enough to be worth confirming with the accountant (§8), because it means the Dutch tax
authority receives no notification of supplies on which a foreign business is self-accounting.

### 6.6 Getting in, and — the part that changed — getting out

- **In:** art. 25a lid 5 — a melding to the inspecteur, effective *"vanaf het eerstvolgende
  belastingtijdvak dat **minimaal vier weken** na ontvangst van de melding aanvangt"*.
- **Out:** art. 25a lid 7 — *"De toepassing … geldt **tot beëindiging door wederopzegging**…
  De beëindiging … wordt van kracht op de eerste dag van het eerstvolgende kalenderkwartaal
  dat minimaal vier weken na ontvangst van de wederopzegging aanvangt."*

⚠️ **The old three-year lock-in is gone from the 2026 text.** You may leave at the next
quarter. What replaced it is a **re-entry ban**, in the same lid: *"De ondernemer kan na de
beëindiging door wederopzegging pas na het verstrijken van het kalenderjaar waarin de
vrijstelling is beëindigd en het daaropvolgende kalenderjaar opnieuw de vrijstelling
toepassen."* Out is cheap; back in is up to two years away.

The Belastingdienst puts the same two rules in operational form, and confirms the exit is
online-only: *"Deze vrijwillige afmelding kan alleen met ingang van de 1e dag van uw
aangiftetijdvak… uiterlijk 4 weken voor u de afmelding in wilt laten gaan"*, and *"Na de
definitieve beëindigingsdatum gaat een periode in waarin u tijdelijk niet kunt deelnemen aan de
KOR. Het gaat om de rest van het kalenderjaar waarin u bent afgemeld, en het jaar erop."*
Joining has its own lead time: *"Uw deelname start op z'n vroegst met ingang van het
eerstvolgende kwartaal of aangiftetijdvak. Houd daarbij ook rekening met een administratieve
verwerkingstijd van 4 weken."*
(<https://www.belastingdienst.nl/wps/wcm/connect/nl/btw/content/afmelden-kor> and
<https://www.belastingdienst.nl/wps/wcm/connect/nl/btw/content/aanmelden-kor>, read 2026-08-24)

- **Overshoot:** art. 25a lid 9 — exceeding €20 000 kills the exemption *"voor de levering van
  het goed of de dienst waardoor die overschrijding tot stand komt, gedurende het resterende
  kalenderjaar en het daaropvolgende kalenderjaar"*. ⚠️ **The Netherlands took the strict
  option.** Art. 288a(1) of the Directive lets a Member State allow a 10% or 25% tolerance;
  the Dutch text has none. The square that crosses €20 000 is itself taxed, mid-sale, and the
  KOR is gone for the rest of that year and all of the next. The board has to count this
  itself — and it is a **third** running total, alongside the €10 000 and €100 000 of §2.2.

### 6.7 The EU-KOR, in force since 1 January 2025

Arts. 25c–25g implement Art. 284(2)–(5) of the Directive: a Dutch business can be exempt from
VAT **in other member states** too.

- **Art. 25c lid 1** — a *voorafgaande kennisgeving* to the inspecteur, and *"in Nederland door
  de inspecteur zijn geïdentificeerd door een **individueel nummer met het achtervoegsel
  «EX»**"*. Art. 25c lid 5: the number arrives within 35 working days, and is refused if
  *"de jaaromzet in de Unie meer bedraagt dan **€ 100.000**"*.
- **Art. 25a lid 2 / Art. 284(2)(b)** — you must also be under **each member state's own
  national threshold**, separately.
- **Art. 25e** — a quarterly information return, within one month of the quarter's end, of
  turnover in the Netherlands and in the other member states, *"of «0» indien geen leveringen
  van goederen of diensten zijn verricht"*. Plus a **15-working-day** notification the moment
  Union turnover passes €100 000.
- ⚠️ **Art. 25f lid 2 introduces a third mandatory exchange rate:**

  > Indien een vergoeding … in een andere munteenheid dan de euro is uitgedrukt, hanteert de
  > ondernemer de wisselkoers die gold op de **eerste dag van het kalenderjaar**.

  So a USD-priced board that used both the KOR and OSS would be converting at three different
  ECB rates for three different purposes: the rate at the chargeable event for the invoice
  (§4.6), the last day of the quarter for the OSS return (§2.2), and the first day of the year
  for the EU-KOR return. Do not let one helper function serve all three.

⚠️ **The two schemes count turnover differently, and the difference is exactly this product's
biggest segment.** For the **national** KOR's €20 000, reverse-charged EU B2B sales do not
count (§6.2). For the **EU-KOR**'s €100 000 they do: the Belastingdienst lists among the
turnover that counts *"omzet waarbij u de btw hebt verlegd naar uw afnemer uit een ander
EU-land"*, while excluding *"prestaties die belast zijn buiten de EU"*
(<https://www.belastingdienst.nl/wps/wcm/connect/nl/btw/content/omzet-die-meetelt-voor-de-eu-kor>,
read 2026-08-24). Two ceilings, two definitions of the same word, one spreadsheet. The same
page confirms art. 25f lid 2's rate: *"Gebruik daarbij de wisselkoers van de eerste dag van het
kalenderjaar."*

**It can run alongside OSS**, per country: *"Maakt u gebruik van de Unieregeling? U kunt dan ook
gebruikmaken van de EU-KOR… Tegelijkertijd kan het voorkomen dat u voor een bepaald land niet
aan de omzetgrens voldoet. Dan hebt u in dat land geen btw-vrijstelling en blijft u voor dat
land de Unieregeling toepassen."*
(<https://www.belastingdienst.nl/wps/wcm/connect/nl/btw/content/deelnemen-aan-de-eu-kor-en-andere-btw-regelingen>,
read 2026-08-24) ⚠️ Per-country opt-in means per-country VAT logic in the checkout: some EU
consumers exempt, others taxed at their own rate, decided by a table the dev maintains by hand.
Stripe has no representation for that at all.

**What the EU-KOR would actually do here:** it is the alternative to OSS *above* the €10 000
threshold. Cross-border EU consumer sales would be exempt in the buyer's country instead of
taxed there — no OSS registration, no 10-year retention (§4.7), one quarterly turnover report
instead of a quarterly VAT return.

### 6.8 Verdict

**Year one, before either threshold is crossed, the KOR is genuinely attractive.** With the
KOR on and cross-border B2C under €10 000, *nobody* is charged VAT: Dutch and EU consumers are
exempt under art. 25a, EU businesses reverse-charge, and non-EU buyers are outside the scope
anyway. A flat, worldwide, honest **$100 = $100** — which is precisely what `/how-it-works`
and the board already promise, and it makes the `tax_behavior` dilemma of §3.2 disappear while
it lasts. Add no ICP listing (§6.5) and simplified invoices (§6.4), and the administrative
saving is the real prize; the VAT saved is small because most buyers were never going to be
charged Dutch VAT.

**The costs are the mirror image.** No input VAT deduction on a cost base that is almost
entirely reverse-charged foreign services (§6.3) — small in euros, unconditional in principle.
No VAT on any invoice, which collides awkwardly with the reverse-charge wording (§6.4). And
three thresholds to track instead of two, with the strictest overshoot rule in the Directive
(§6.6) and a re-entry ban if the dev changes their mind.

⚠️ **The ugly case is the middle.** Crossing €10 000 in cross-border B2C while staying under
€20 000 domestically leaves the business KOR-exempt at home and OSS-registered abroad at the
same time — two regimes, two return cycles, two exchange-rate rules. **Stripe Tax has no
concept of the Dutch KOR**: nothing in the registration model expresses "registered, but
exempt domestically", and a `standard` NL registration will calculate 21% on a Dutch sale that
must carry none. **Whether Stripe Tax can be configured to produce a correct zero-VAT Dutch
line for a KOR user could not be determined from any Stripe page I read** (§3, §7.1). Assume
it cannot, and price that in.

**Recommendation:** put the KOR on the accountant's list as a *year-one* choice with a planned
exit, not as a permanent posture — and decide it against the expected Dutch-versus-foreign
buyer mix, which nobody knows yet because the site has no buyers (`PRODUCT.md`, "Evidence on
Hand"). If the dev expects the board to sell mostly abroad, the KOR's benefit is small and its
cost is small, and the deciding factor is the ICP and aangifte relief, not the tax.


## 7. Stripe: what it does and where it stops

Merged from the Stripe research leg. Every URL read 2026-08-24.

### 7.1 It calculates; it does not decide, register, validate or file

- Stripe Tax calculates **only where you have entered an active registration**. "Without a
  registration in the customer's location, the calculation returns zero tax."
  (<https://docs.stripe.com/tax/calculating>) So before OSS exists in the account,
  cross-border EU B2C sales come out at **zero VAT**, silently, and that is a liability the
  site carries, not Stripe.
- You add registrations yourself: "You must then register with the tax authorities in the
  applicable jurisdictions, and add your registrations to Stripe."
  (<https://docs.stripe.com/tax/registering>) Stripe can register on your behalf **outside
  the US only through Taxually**, and files through partners (Taxually, Marosa for the EU)
  — never itself. (<https://docs.stripe.com/tax/filing>)
- Stripe models the EUR 10,000 threshold explicitly, as the "small seller option" on a
  `standard` NL registration, and tracks EU-wide sales against it. Crossing it is a
  **manual** three-step migration in the dashboard — end the small-seller registration, add
  a domestic one answering *No*, add an `oss_union` registration. Stripe does not flip it
  for you. (<https://docs.stripe.com/tax/supported-countries/european-union>)
- Threshold-monitoring emails only start once "You've had 10,000 USD in revenue in the
  previous year", and the home country is not monitored at all.
  (<https://docs.stripe.com/tax/monitoring>) At $100 a square that is 100 sales of silence.

### 7.2 The tax-ID hole — the single most important Stripe finding

> During the Checkout Session, Stripe verifies that the provided tax IDs are formatted
> correctly, but not that they're valid. You're responsible for ensuring the validity of
> customer information collected during checkout.
>
> If you use Stripe Tax and your customer provides a tax ID, Stripe Tax applies the
> reverse charge or zero rate according to applicable laws, **as long as the tax ID
> conforms to the necessary number format, regardless of its validity**.

(<https://docs.stripe.com/tax/checkout/tax-ids>, read 2026-08-24; the same sentence appears
at <https://docs.stripe.com/tax/invoicing/tax-ids>)

VIES validation does happen — "Stripe also automatically validates all European
Value-Added-Tax (EU VAT) numbers with the European Commission's VAT Information Exchange
System (VIES)" — but **asynchronously, after the payment**, surfacing on the
`customer.tax_id.updated` webhook with `verification.status` of `pending` / `verified` /
`unverified` / `unavailable`. (<https://docs.stripe.com/billing/customer/tax-ids>) Stripe
also notes it "only validates whether or not the tax ID is valid—you still need to verify
the customer's name and address to match the registration information", and that a number,
once resolved, "won't be validated again automatically".

Practical effect: anyone who types a well-formed but fake EU VAT number pays $100 with no
VAT and the site owes the VAT. Three ways out, and the decision belongs in the build
ticket:

1. **Don't collect tax IDs at all.** Charge VAT to everyone; EU businesses reclaim it
   themselves. Zero exposure, one less field, and it costs the buyer nothing net.
2. **Collect, but gate.** Keep the square `pending` and un-published until
   `customer.tax_id.updated` reports `verified`; re-invoice with VAT or refund-and-recharge
   on `unverified`. More moving parts, and it delays a purchase behind a third-party
   database.
3. Collect and accept the risk. At $100 × 21% = $21 per bad number, with no volume, this
   is survivable but it is a slow leak with no alarm on it.

Option 1 is the one that matches a one-person business. It also removes the "is this buyer
a business?" signal that §5.2 wanted — so if it is chosen, the site should still ask for a
company name and country, just not act on a VAT number.

### 7.3 Location evidence — Stripe says outright that it does not do the EU test

> **For cross-border sales of digital services within the EU, Stripe Tax prioritizes a
> single address as the customer's location when calculating tax instead of comparing two
> pieces of non-conflicting evidence. However, we store and retain all location evidence
> used in the transaction on the Customer object.**

(<https://docs.stripe.com/tax/supported-countries/european-union>, read 2026-08-24)

So Stripe knows about the two-evidence rule, declines to implement it, and hands the
retained evidence back for the site to defend an audit with. Nothing flags a French-issued
card on a German billing address from a Dutch IP.

Also: `billing_address_collection` defaults to `auto`, and with `automatic_tax` on, `auto`
means "Checkout will collect the minimum number of fields required for tax calculation" —
often **country alone** for a European buyer
(<https://docs.stripe.com/api/checkout/sessions/create>). Country alone is enough for
Stripe to compute a rate and not enough for anything else; it is also blind to excluded
territories, which for the Netherlands are Bonaire, Curaçao, Saba, Sint Eustatius and Sint
Maarten (<https://docs.stripe.com/tax/zero-tax>). **Set
`billing_address_collection=required`.**

Note the split in how Stripe uses IP: Checkout uses only the address collected in the
session — "Checkout and Payment Links use the address collected during the session" — while
Invoicing and threshold monitoring fall back to IP
(<https://docs.stripe.com/tax/customer-locations>, <https://docs.stripe.com/tax/monitoring>).
So an IP-based second piece of evidence has to be captured by the site, at the moment the
Checkout Session is created, not read out of Stripe afterwards.

### 7.4 Product tax code

The closest published code is **`txcd_10701000` — Website Advertising**: "Online
advertising services such as creating and uploading advertisements on the internet. This is
a standalone service that doesn't involve the sale of tangible personal property."
Alternatives are `txcd_20060002` (Advertising Services), `txcd_10000000` (General -
Electronically Supplied Services) and `txcd_20030000` (General - Services)
(<https://docs.stripe.com/tax/tax-codes>).

The choice is not cosmetic: Stripe's own description of `txcd_20030000` says "EU only:
Business-to-consumer sales are taxable at origin; business-to-business are taxable at
destination" — the opposite treatment from an electronically supplied service. **Stripe does
not publish which EU rule it applies behind `txcd_10701000`.** That is a gap, it is the
accountant's call, and it should be verified in test mode against a German B2C buyer before
launch. Stripe's own instruction is "Don't make the legal tax classification for the user"
(<https://docs.stripe.com/tax/digital-products>).

### 7.5 Invoices from Checkout

Stripe can produce a real invoice for a one-off payment, and it is not the Invoicing
product: `invoice_creation[enabled]=true` on the Checkout Session. "For subscriptions,
Stripe generates invoices automatically, but you need to enable them for one-time payments…
After the payment completes successfully, Stripe sends an invoice summary to the email that
the customer provided [with] links to download PDFs of both the invoice and payment
receipt." (<https://docs.stripe.com/payments/checkout/receipts>) Cost: **0.4% of the
transaction, capped at $2** per invoice — $0.40 on a square
(<https://support.stripe.com/questions/pricing-for-post-payment-invoices-for-one-time-purchases-via-checkout-and-payment-links>).
It forces a Customer to be created.

What it gives you for §4:

- `invoice_creation[invoice_data][account_tax_ids]` puts **the seller's BTW number** in the
  PDF header; the customer's tax ID appears there too. Immutable after finalisation.
  (<https://docs.stripe.com/tax/invoicing/tax-ids>)
- **Numbering is right by default for a Dutch account**: "European Union member countries
  and the United Kingdom typically require account level sequencing" — so Stripe defaults NL
  to account-level sequential numbering, `PREFIX-0001`, `PREFIX-0002`
  (<https://docs.stripe.com/invoicing/customize>).
- `invoice_creation[invoice_data][footer]`, `[custom_fields]` (up to four, shown in the
  header) and `[description]` are the hooks for anything Stripe does not print — including,
  if needed, the reverse-charge sentence.
- ⚠️ **Whether Stripe prints "Reverse charge" on the PDF by itself could not be confirmed
  from a quotable Stripe page.** Stripe states the *obligation* ("Your business must provide
  an invoice that specifies the reverse charge instead of including a tax amount",
  <https://docs.stripe.com/tax/supported-countries/european-union>) without stating that it
  renders the text. Generate one in test mode and look. If it is absent, put it in the
  footer.
- Stripe disclaims the rest: "Invoice requirements vary by jurisdiction… You're responsible
  for verifying that the invoices you issue meet local tax requirements."
  (<https://docs.stripe.com/invoicing/customize>)

### 7.6 Costs, end to end, on one $100 square

From <https://stripe.com/en-nl/pricing> and <https://stripe.com/en-nl/tax/pricing>, read
2026-08-24:

| Item | Rate | On $100 |
|---|---|---|
| Card — standard EEA | 1.5% + €0.25 | ~$1.75 |
| Card — international | 3.15% + €0.25 | ~$3.40 |
| Currency conversion (USD charge → EUR payout) | +2% | ~$2.00 |
| Stripe Tax (Checkout integration) | 0.5%, only where registered | ~$0.50 |
| `invoice_creation` | 0.4%, cap $2 | $0.40 |

Worst realistic case on an international card: **~6% all in**, i.e. ~$6 of a $100 square.
No free Stripe Tax tier is documented on the current NL pricing page; the old "first 10
transactions free" language is gone.

### 7.7 The auction hold

- Card-not-present, customer-initiated authorizations hold for **7 days** on Visa,
  Mastercard, Amex and Discover (Visa MIT is 4 days 18 hours). The authoritative per-payment
  value is `payment_method_details.card.capture_before`.
  (<https://docs.stripe.com/payments/place-a-hold-on-a-payment-method>) A daily auction fits
  easily.
- **iDEAL does not support manual capture.** The auction must be card-only. Same page.
- Tax is calculated **at session completion, i.e. at authorization, not at capture** — "Tax
  liability is determined when the transaction is created, not when payment is received"
  (<https://docs.stripe.com/tax/calculating/adaptive-pricing>), and the Stripe Tax fee is
  charged then even if the payment is never captured
  (<https://docs.stripe.com/tax/how-tax-works>).
- ⚠️ **Partial capture breaks the tax reports.** "Refunds of uncaptured amounts of a
  payment… When the capture amount is lower than the original amount, Stripe Tax doesn't
  reduce the total balance of the collected tax."
  (<https://docs.stripe.com/tax/reports>) Charting already avoids this — the site
  authorizes the exact bid and captures the exact bid — but if that ever changes to
  "authorize high, capture the winning amount", every OSS return will overstate VAT with no
  automatic correction. Keep authorization amount == capture amount.


---

## 8. What a lawyer or an accountant must still confirm

Ranked by what it costs to be wrong, not by how interesting it is. Everything above is
sourced; everything below is a place where the sources ran out, disagreed, or answered a
different question. **This document is facts and a draft. It is not legal cover.**

### For a lawyer — consumer law

1. **The Art. 10 twelve-month tail is the largest number in this document.** §5.6: if the
   site never gives the Art. 6(1)(h) withdrawal information, the 14-day period becomes
   **12 months and 14 days**, refundable in full under Art. 14(4)(a) because no *pro rata*
   claim survives an information failure. On a full board that is a **$19,900 open position**.
   Confirm the new `/terms` **Withdrawal** section and the tick-box block of §5.7 actually
   discharge Art. 6(1)(h) and 6:230m BW, in the language the site uses. This is the one item
   that is worth paying for on its own.
2. **Is a "permanent" square ever fully performed?** §5.5 concludes it is not, and says so
   honestly: *"There is no primary source that says a perpetual service is never fully
   performed — that is an inference."* Everything in §5.6's table hangs off it. A lawyer
   should either confirm the inference or find the case that settles it.
3. **The order button.** §5.8: under C-249/21 *Fuhrmann-2* only the words on the button count,
   Stripe's `pay` renders **"Buy"**, and a non-compliant button makes the contract
   *vernietigbaar* — not fineable, **voidable**, on every consumer sale. Design (A) — place the
   order on 200squares.com behind `Order with obligation to pay — $600` — removes the question
   for free. Confirm that (A) is in fact what the flow does, and that the Stripe page reads as
   payment of an order already placed.
4. **Consumers outside the EU.** §5.2: Rome I Art. 6 gives a consumer in California or Brazil
   *their own* local cooling-off rules, and a worldwide English-language site priced in USD
   directs activities everywhere. **This is unmappable for a one-person business.** The
   decision is commercial before it is legal: accept the exposure, or geo-restrict. Ask for the
   cheapest defensible answer, not a survey.
5. **The banner forfeiture clause.** §5.9: *"A banner that breaks them is removed for the rest
   of its day and the bid is not returned."* Total forfeiture against a consumer invites an
   unfair-terms challenge. **Flagged, not researched.**

### For an accountant — VAT

6. **Which EU rule Stripe applies behind the product tax code.** §3.3 and §7.4: Stripe publishes
   three different place-of-supply treatments for services and does **not** publish which one
   `txcd_10701000` (Website Advertising) takes. For an Irish consumer the electronically-supplied
   branch charges Irish VAT and the other two charge Dutch VAT. §1 says the ESS branch is
   correct. **Verify it with one test-mode transaction against a German B2C buyer before
   launch**, and have the accountant sign off the code choice. Stripe's own instruction is
   *"Don't make the legal tax classification for the user"*.
7. **`tax_behavior`: inclusive or exclusive.** §3.2. Irreversible once set on a Price, and it
   decides whether *"A square costs $100"* stays true for an EU consumer or becomes $119–$121.
   A pricing decision with a tax consequence; the dev owns the pricing half, the accountant the
   tax half.
8. **The KOR, as a year-one choice with a planned exit.** §6.8. Bring the accountant three
   things: the expected Dutch-versus-foreign buyer mix (which nobody knows — `PRODUCT.md`,
   "Evidence on Hand"), the €20 000 / €10 000 / €100 000 interaction of §6.6, and the
   contradiction in §6.4 between art. 25a lid 4's *"op geen enkele wijze melding maken van
   omzetbelasting"* and the «btw verlegd» an EU B2B invoice must carry. **The statute does not
   resolve that contradiction; only a Belastingdienst web page does.**
9. **The automation test, and what would break it.** §1.4: the classification rests on Art.
   7(1)'s *"essentially automated and involving minimal human intervention"*, which today is
   true because charting fixed **"No moderation before publishing."** **How much intervention is
   too much is quantified nowhere**, and no case law on the point was reachable. Ask what the
   dev may start doing by hand before the answer changes.
10. **Registration duties outside the EU.** §2.3: US state sales-tax economic nexus, UK VAT,
    Norwegian VOEC, Australian GST and their equivalents. **I did not research any of them, and
    this document does not tell you whether any are triggered.** Stripe's threshold monitoring
    (§7.1) is the cheap partial answer and it does not start until $10,000 of prior-year revenue.
11. **The deduction position of an EU business buyer who was charged VAT** because the checkout
    never asked for a VAT number (§2.5, Art. 18(2) second subparagraph). Legally clean for the
    seller; **the buyer's side was not verified.**
12. **Whether a supplier-run IP geolocation counts** as *"one item of evidence provided by a
    person involved in the supply … other than the supplier or the customer"* (§2.2, Art. 24b
    second paragraph). On the face of the text it does not, which is why §2.4 leans on the card
    country instead. Worth one sentence of confirmation, because it decides whether the site
    needs Stripe's card data at all.
13. **The invoice exchange rate, and consistency.** §4.6: two rates are permitted, **no
    statutory consistency rule could be found**, and the published *vaste lijn* requirement
    covers rounding only. Confirm that picking the daily ECB rate and never switching is
    sufficient.

### The dev can settle these alone, in test mode — no professional needed

14. **Does Stripe print "Reverse charge" on the PDF?** §7.5 — Stripe states the obligation
    without stating that it renders the text. Generate one and look. If not, use
    `invoice_creation[invoice_data][footer]`.
15. **Can Stripe Tax express a KOR user's domestic exemption?** §6.8 — nothing in the
    registration model says "registered, but exempt domestically", and a `standard` NL
    registration will compute 21% on a Dutch sale that must carry none. **Could not be
    determined from any Stripe page read.** Assume it cannot until shown otherwise.
16. **The excluded territories.** §7.3 names the Dutch ones — Bonaire, Curaçao, Saba, Sint
    Eustatius and Sint Maarten. **The EU's own carve-outs were not enumerated here.** Check
    Stripe's behaviour for the handful that matter before relying on a country code.
