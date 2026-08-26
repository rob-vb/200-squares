# Research 37 — When a bid binds

Answers [issue 37](../issues/37-when-a-bid-binds.md). Read on **2026-08-26**; every URL below
was fetched that day. Primary sources only: `wetten.overheid.nl` (BW Boek 6 and Boek 3),
`zoek.officielebekendmakingen.nl` (the parliamentary history of the implementing act),
`publications.europa.eu` — the EU Publications Office Cellar, used because
`eur-lex.europa.eu` still sits behind a bot challenge and returned an empty body on
2026-08-26 — `data.rechtspraak.nl` for case law, and `acm.nl` for regulator action.

Where a source could not be reached, or where the text does not settle the question, it says
so in those words. **This is facts and a draft, not legal cover.** §6 lists what a lawyer must
still confirm. §7 is the copy list that [ticket 40](../issues/40-copy-true-again.md) acts on.

Scope: the **daily banner auction** — a bid, the close at 00:00 UTC, and what a bidder can and
cannot do in between. Prices as they stand today: a square is **$250**, the banner auction
opens at **$100** with a $10 minimum increment.

**Completeness.** All seven sections are written and every claim carries a source and a read
date. Five limits are worth knowing before relying on it.

**First**, the headline finding is a statute I found by reading the whole afdeling rather than
by looking for it, and **I could reach no Dutch judgment applying it**. Art. 6:230q lid 1 BW
says a consumer's offer to a trader can be revoked notwithstanding art. 6:219. ⚠️ The search
was weaker than I wanted: `uitspraken.rechtspraak.nl`'s own search endpoint refused every
request I could form (HTTP 411, then 302 to a 400 page), so I fell back to a domain-restricted
web search for "6:230q" and pulled the three most promising results in full from
`data.rechtspraak.nl`. **None of them mentions the article.** That is not the same as
establishing there is no case law. The statute and its memorie van toelichting are unambiguous;
the absence of case law is not established.

**Second**, the one judgment I read that is squarely about an internet auction bid is about a
**professional** bidder and **immovable property**, which is outside the CRD twice over
(art. 6:230h lid 2 sub f, lid 4). It tells you what a Dutch court thinks a bid *is*. It does
not tell you what a consumer bidder may do.

**Third**, I could not settle whether the **moment of conclusion** in this auction is the bid
or the close. Dutch law leaves it to the auction's own terms (art. 6:217 lid 2 BW), and the
site's terms do not say. §2 sets out what each answer costs and recommends which one to write
down. That is a drafting choice, not a discovery.

**Fourth**, §3.5 turns up an obligation that is **already in force and not built**: the
withdrawal function of art. 6:230oa BW / art. 11a of Directive 2011/83, applicable since
19 June 2026. It is not what this ticket asked about. It is the largest single defect the
reading found.

**Fifth**, non-EU consumers are not revisited here. Research 03 §5.2 flagged the Rome I
problem and called it unmappable at this scale; nothing read today changes that.

---

## 1. Does art. 6:219 lid 1 BW make a bid irrevocable?

All BW text below is the version **"Geldend van 16-07-2026 t/m heden"**, read 2026-08-26 at
<https://wetten.overheid.nl/BWBR0005289/2026-08-26/0/Boek6/Titeldeel5/Afdeling2> (afdeling
6.5.2) and
<https://wetten.overheid.nl/BWBR0005289/2026-08-26/0/Boek6/Titeldeel5/Afdeling2B> (afdeling
6.5.2B). Boek 3 is "Geldend van 01-07-2025 t/m heden",
<https://wetten.overheid.nl/BWBR0005291/2026-08-26/0/Boek3/Titeldeel2>, read 2026-08-26.

### 1.1 The default is that an offer *can* be revoked

Art. 6:217 lid 1: *"Een overeenkomst komt tot stand door een aanbod en de aanvaarding
daarvan."* Art. 6:219 lid 1, in full:

> 1. Een aanbod kan worden herroepen, tenzij het een termijn voor de aanvaarding inhoudt of
> de onherroepelijkheid ervan op andere wijze uit het aanbod volgt.

The rule is the other way up from how [ADR 0003](../../../docs/adr/0003-a-bid-is-an-irrevocable-offer.md)
states it. Revocability is the default; irrevocability is the exception. The Parket bij de
Hoge Raad puts it in one sentence:

> Uit artikel 6:219, lid 1, BW volgt dat een aanbod om een overeenkomst aan te gaan in
> beginsel kan worden herroepen.

(Conclusie A-G, ECLI:NL:PHR:2022:1005, para. 4.13;
<https://data.rechtspraak.nl/uitspraken/content?id=ECLI:NL:PHR:2022:1005>, read 2026-08-26)

That does not defeat the ADR — the exception is real and this auction is inside it — but the
ADR's phrasing ("an offer that names a term for acceptance cannot be revoked") states a
carve-out as if it were the rule, and a carve-out has conditions.

### 1.2 This auction meets the exception, twice over

**A term for acceptance.** The bid is made into a published auction whose close is 00:00 UTC,
fixed, daily, with no extension window. `/terms` states it and the bid panel restates it. A
bid made on those terms "houdt een termijn voor de aanvaarding in" on any ordinary reading.

**And, independently, the offer can simply say so.** The second limb of 6:219 lid 1 — *"of de
onherroepelijkheid ervan op andere wijze uit het aanbod volgt"* — lets the offer declare its
own irrevocability. And art. 6:217 lid 2 makes the whole of arts. 219-225 default law:

> 2. De artikelen 219-225 zijn van toepassing, tenzij iets anders voortvloeit uit het aanbod,
> uit een andere rechtshandeling of uit een gewoonte.

⚠️ **This cuts both ways and the site should notice it.** The terms a bidder accepts before
bidding are part of the offer they make. So the site can nail down irrevocability against a
business bidder by writing it into the auction rules, and does not have to rely on the term
alone. It also means the site must be careful what *else* it writes, because the same
mechanism can displace the parts of 219-225 it wants.

**One place where it must be careful, and is not.** Art. 6:221 lid 2: *"Een aanbod vervalt,
doordat het wordt verworpen."* Ticket 07's ladder depends on **outbid bids staying open** until
the close, so that a runner-up can be promoted if the top capture fails. `BID_TRUTHS` says the
hold stays. `/terms` does not say the *offer* stays. If being outbid were read as a rejection,
there would be nothing left to accept at 00:00 and the ladder would have no legal object. The
fix is one clause in the terms, not a code change — see §7.

**Art. 6:220 is not this.** It governs an *uitloving* — a public promise of a reward for a
performance. A banner auction is not one; art. 6:220 has no application here.

**Art. 6:218** is not about revocability at all in the current text: *"Een aanbod is geldig,
nietig of vernietigbaar overeenkomstig de regels voor meerzijdige rechtshandelingen."* It
matters for one reason only: it is the hook by which the *Fuhrmann-2* / art. 6:230v lid 3
button defect makes an order **vernietigbaar** (research 03 §5.8).

### 1.3 Art. 3:37 BW: when a bid takes effect, and the difference between *intrekken* and *herroepen*

> 3. Een tot een bepaalde persoon gerichte verklaring moet, om haar werking te hebben, die
> persoon hebben bereikt. […]
>
> 5. Intrekking van een tot een bepaalde persoon gerichte verklaring moet, om haar werking te
> hebben, die persoon eerder dan of gelijktijdig met de ingetrokken verklaring bereiken.

(art. 3:37 leden 3 and 5 BW, source and date above)

Two consequences.

- A bid takes effect when it **reaches** the site — for an HTTP request, on receipt. There is
  no window in which a bid is in flight and can be caught.
- *Intrekking* under 3:37 lid 5 is therefore **structurally impossible** online: a retraction
  cannot arrive before or with the bid it retracts. Every real-world attempt to take a bid
  back is a *herroeping* under 6:219, not an *intrekking*. The distinction matters because
  6:219 has an exception and 3:37 lid 5 does not.

Art. 6:219 lid 2 adds the outer limit: revocation is only possible *"zolang het aanbod niet is
aanvaard en evenmin een mededeling, houdende de aanvaarding is verzonden."* After 00:00 UTC
there is nothing to revoke in any case.

### 1.4 ⚠️ And then art. 6:230q lid 1 undoes all of it for a consumer

This is the finding this ticket was opened to get, and it goes the other way from the ADR.

> **Artikel 230q**
>
> 1. **In afwijking van artikel 219** kan een aanbod van de consument tot het aangaan van een
> overeenkomst aan de handelaar op de in artikel 230o bepaalde wijze worden herroepen.

(art. 6:230q lid 1 BW, afdeling 6.5.2B, version in force 2026-08-26,
<https://wetten.overheid.nl/BWBR0005289/2026-08-26/0/Boek6/Titeldeel5/Afdeling2B>, read
2026-08-26. Emphasis added.)

Read the words against the facts. A bid on 200squares.com is *een aanbod van de consument tot
het aangaan van een overeenkomst aan de handelaar*. The site is the *handelaar*. The article
says that offer may be revoked **in derogation from art. 219** — which is to say, the term for
acceptance does not hold it. In the manner of art. 230o: art. 6:230o lid 3, *"het ingevulde
modelformulier voor ontbinding […] of een andere daartoe strekkende ondubbelzinnige
verklaring"*. An email saying "I take my bid back" is enough.

**The memorie van toelichting says exactly this, and says why.** Kamerstukken II 2012/13,
33 520, nr. 3 (Implementatiewet richtlijn consumentenrechten), toelichting bij art. 230q:

> Doet een consument een aanbod, dan bepaalt artikel 6:219 BW onder meer dat als een aanbod
> een termijn voor de aanvaarding inhoudt of de onherroepelijkheid ervan op andere wijze uit
> het aanbod volgt, het aanbod niet meer kan worden herroepen. De Afdeling advisering van de
> Raad van State wees erop dat volgens de richtlijn ontbinding vóór het sluiten van de
> overeenkomst steeds mogelijk moet zijn […]. Naar aanleiding hiervan is artikel 230q lid 1
> aangepast, zodat **de consument het aanbod op elk moment kan herroepen**. Deze mogelijkheid
> tot herroeping van het aanbod **wijkt dus expliciet af van de in artikel 6:219 BW getroffen
> regeling**.

(<https://zoek.officielebekendmakingen.nl/kst-33520-3.html>, read 2026-08-26. Emphasis added.)

The Raad van State raised precisely the case the ADR relies on — an offer with a term for
acceptance — and the legislator amended the bill to defeat it.

**It cannot be contracted around.** Art. 6:230i lid 1: *"Van het bepaalde bij of krachtens deze
afdeling kan niet ten nadele van de consument worden afgeweken."* So the site's terms cannot
restore irrevocability against a consumer bidder, and art. 6:217 lid 2 does not help either:
230q is not one of arts. 219-225.

### 1.5 The EU basis, so this is not a Dutch peculiarity

Art. 12 of Directive 2011/83/EU:

> The exercise of the right of withdrawal shall terminate the obligations of the parties:
>
> (a) to perform the distance or off-premises contract; or
>
> **(b) to conclude the distance or off-premises contract, in cases where an offer was made by
> the consumer.**

(consolidated text 02011L0083-20220528, read via
<https://publications.europa.eu/resource/celex/02011L0083-20220528>, 2026-08-24 and again
2026-08-26. Emphasis added. This is the newest consolidation the Cellar serves; requests for
02011L0083-20260619, -20250101 and -20231218 all return 404, so the 2023/2673 amendments in
§3.5 are taken from the amending directive itself.)

So art. 6:230q lid 1 is the Dutch implementation of a rule the Directive itself carries. There
is no maximum-harmonisation objection to make (art. 4 CRD), and art. 3(5) — *"This Directive
shall not affect national general contract law such as the rules on the validity, formation or
effect of a contract, in so far as general contract law aspects are not regulated in this
Directive"* — does not save 6:219 either, because this aspect **is** regulated in the
Directive.

**And the Commission says it in the auction context specifically.** Commission Notice —
Guidance on the interpretation and application of Directive 2011/83/EU (OJ C 525, 29.12.2021),
section 1.9 *Rules for public auctions*:

> Accordingly, online auctions should be fully subject to the Directive regarding, e.g., the
> pre-contractual information to be provided before the consumer is bound by the contract (the
> bid) and the right of withdrawal.

and, of an online platform running a bidding procedure that is not a public auction:

> Thus, **consumers would retain the right to withdraw a bid once made** within the terms
> prescribed by the CRD.

(<https://publications.europa.eu/resource/celex/52021XC1229%2804%29>, read 2026-08-26.
Emphasis added. The Commission Notice is guidance, not binding law; it is cited because it
states the Commission's reading of provisions that are binding.)

⚠️ The second sentence is not perfectly worded — "withdraw a bid" could conceivably be loose
shorthand for "withdraw from the contract". It is quoted here because the parenthesis in the
first sentence — *"before the consumer is bound by the contract (the bid)"* — points the same
way, and because art. 12(b) and art. 6:230q lid 1 settle the point without it.

### 1.6 Verdict on question 1

- **Against a business bidder: yes.** Art. 6:219 lid 1 does what the ADR says. The auction
  names a term for acceptance, and the offer may also declare its own irrevocability
  (6:219 lid 1, second limb, with 6:217 lid 2). Afdeling 6.5.2B does not apply to a bidder
  acting for business purposes (art. 6:230g lid 1 sub a). **This is the ADR's ground, confirmed
  and narrowed to business bidders.**
- **Against a consumer bidder: no.** Art. 6:230q lid 1 **expressly derogates from art. 219**,
  the memorie van toelichting says the derogation was added for exactly this case, art. 12(b)
  of the Directive requires it, and art. 6:230i lid 1 makes it mandatory. **A consumer bidder
  can take a bid back at any time before the close, for nothing, by an unequivocal statement.**
  This **contradicts** ADR 0003's sentence *"That ground binds a consumer as firmly as a
  business, because it concerns the offer stage and not the withdrawal right"*: the offer stage
  is precisely where 6:230q lives.

This is the ADR's own ⚠️ warning coming true — *"The 6:219 ground has not been checked against
a source"* — and the fallback it named is the right one. The dev's fear (*"vlak voor de teller
zijn bod intrekt als die aan het winnen is"*) is, for a consumer, protected by mandatory law.
No wording changes that. Ticket 31's third listed honest answer — *"irrevocable for businesses
and cancellable for consumers"* — is the one the law actually gives.

---

## 2. When is the contract concluded?

### 2.1 Dutch law does not decide it; the auction's terms do

Art. 6:217 lid 2 makes arts. 219-225 yield to *"het aanbod […] een andere rechtshandeling of
[…] een gewoonte."* Auction terms are exactly such a rechtshandeling. **I could find no
provision of Dutch law and no judgment that fixes the moment of conclusion for an online
auction as a matter of law.** It is a drafting question, and `/terms` currently does not answer
it: *"The banner goes to the highest bid that can be collected at 00:00 UTC"* describes an
outcome, not an acceptance.

The two candidate structures:

- **(A) Bid = offer, close = acceptance.** ADR 0003's structure. The site accepts the top
  collectable bid at 00:00 UTC. No contract exists during the bidding day.
- **(B) Listing = offer, bid = acceptance under a suspensive condition** of being top and
  collectable at the close. The contract exists from the bid, subject to a condition
  (art. 6:21-6:22 BW).

### 2.2 What Dutch courts do with internet-auction bids

The one decision I could reach that is squarely on an internet auction bid treats the bid as the **offer** and
the *gunning* as the acceptance — structure (A):

> Door de onvoorwaardelijke acceptatie van het onherroepelijke bod van [eiser] is een
> koopovereenkomst tot stand gekomen.

and, on why bidders are held to bids:

> Het hele systeem van (internet)veilingen vereist een groot vertrouwen dat biedingen gestand
> worden gedaan.

(Rb. Midden-Nederland (vzr.) 2026, ECLI:NL:RBMNE:2026:695, paras. 3.7 and 3.11;
<https://data.rechtspraak.nl/uitspraken/content?id=ECLI:NL:RBMNE:2026:695>, read 2026-08-26)

⚠️ **Read the limits before leaning on it.** It is a *voorzieningenrechter* in kort geding,
about a €23m hotel at an executieveiling of immovable property — outside the CRD twice over
(art. 6:230h lid 2 sub f and lid 4) — and the court **expressly rejected** the bidder's claim
to be a consumer, because he dealt professionally in real estate (para. 3.8). It is good
authority for what a bid *is*. It is no authority at all for what a consumer bidder may do.

### 2.3 What ACM did to an online auction, which is closer to home

ACM ordered the travel auction site Reizendeal to change its site under threat of a €8,000/week
penalty. Two of its findings map onto this build:

> Ook was het voor consumenten onduidelijk dat wanneer zij het **winnende bod** hadden
> uitgebracht, zij **vast zaten** aan de reis.

> Ook moet Reizendeal **de biedknop aanpassen**, zodat het voor de consument duidelijk is dat
> hij moet betalen als hij de veiling wint.

(<https://www.acm.nl/nl/publicaties/acm-dwingt-veilingwebsite-reizendeal-tot-duidelijkere-informatie>,
read 2026-08-26. Emphasis added.)

Two things follow.

- **ACM treats the bid button as the order button.** Art. 6:230v lid 3's *bestelknop* duty
  attaches at the bid, not at the close. `BID_BUTTON` — *"PLACE BID — OBLIGES YOU TO PAY IF YOU
  WIN"* — is the right shape, and this is a regulator confirming it. **This confirms** research
  03 §5.8 and extends it from the square flow to the bid flow.
- **ACM's own description of the bidder's position is "vast zaten aan de reis" on the winning
  bid** — the language of being bound at the bid, subject to winning. That is closer to (B) than
  to (A). It is a press release about information duties, not a ruling on contract formation, so
  it is evidence of how a regulator reads the transaction, no more.

### 2.4 What actually turns on it, and it is less than ticket 31 thought

| | (A) concluded at the close | (B) concluded at the bid |
|---|---|---|
| Business bidder, wants out before close | Bound: 6:219 lid 1 | Bound: contract exists |
| **Consumer bidder, wants out before close** | **Free: 6:230q lid 1** | **Free: 6:230o + 6:230q** |
| 14 days start (consumer) | day of the close | day of the bid |
| Free-of-charge window before performance | none | the bidding day |
| Pro-rata window after performance starts | the banner day | the banner day |

⚠️ **The row that decides the ticket is the same under both structures.** ADR 0003 chose (A)
to close the consumer's free exit during the bidding day. Art. 6:230q lid 1 reopens it whatever
structure is chosen, because it operates on the **offer**. So the choice between (A) and (B) is
no longer load-bearing for the dev's fear. What it still decides is the **length of the free
window** and the **start of the 14 days**.

**Recommendation: write (A) into `/terms`, in words.** It is the structure Dutch auction
practice uses (§2.2), it starts the 14 days at the close so the pro-rata window is exactly the
banner day, and it keeps the free window as short as the auction is. Under (B) the bidder gets
the bidding day free *and* the banner day pro rata. (A) is strictly better for the house and
is the honest description of what the code does — nothing is charged, promoted or delivered
until the close.

### 2.5 When the 14 days start, precisely

> 1. De consument kan een overeenkomst op afstand […] zonder opgave van redenen ontbinden tot
> een termijn van veertien dagen is verstreken, na: a. bij een overeenkomst tot het verrichten
> van diensten: **de dag waarop de overeenkomst wordt gesloten**;

(art. 6:230o lid 1 sub a BW, source and date above. The Directive's equivalent, art. 9(2)(a):
*"in the case of service contracts, the day of the conclusion of the contract"*.)

Art. 6:230i lid 2 makes **Regulation (EEG, Euratom) nr. 1182/71** apply to the periods in the
afdeling. Art. 3(1), second subparagraph:

> Where a period expressed in days […] is to be calculated from the moment at which an event
> occurs or an action takes place, the day during which that event occurs or that action takes
> place shall not be considered as falling within the period in question.

and art. 3(2)(b): *"a period expressed in days shall start at the beginning of the first hour
of the first day and shall end with the expiry of the last hour of the last day of the period"*
(<https://publications.europa.eu/resource/celex/31971R1182>, read 2026-08-26).

So under (A): the contract is concluded at 00:00 UTC on day D; day D is not counted; the
deadline expires at 24:00 on day D+14. Art. 3(4) can push it to the next working day if that
lands on a weekend or holiday. **None of this matters in practice**, because §3 shows the right
dies long before the deadline. It matters only for the copy: *"14 days, counted from the close"*
is close enough to true, and *"counted from the day you win"* — which is what the bid panel
says today — is right only under (A) and wrong under (B). Say which one it is.

---

## 3. Does the withdrawal right land differently than ticket 03 assumed?

### 3.1 Ticket 03's banner finding stands, unchanged

Research 03 §5.5 concluded that a banner day *can* be fully performed because it ends, and that
art. 16(1)(a) / art. 6:230p sub d therefore works for the banner where it fails for a square.
Nothing read today disturbs that. The text, current version:

> d. een overeenkomst tot het verrichten van diensten, **na nakoming van de overeenkomst**, en
> voor zover de overeenkomst voor de consument een betalingsverplichting inhoudt, indien:
> 1°. de nakoming is begonnen met uitdrukkelijke voorafgaande instemming van de consument; en
> 2°. de consument heeft verklaard afstand te doen van zijn recht van ontbinding zodra de
> handelaar de overeenkomst is nagekomen;

(art. 6:230p sub d BW, read 2026-08-26. Emphasis added.)

with the mirror duty in art. 6:230v lid 8 (express request + acknowledgement of loss on full
performance). `BANNER_WITHDRAWAL_TEXT` in `src/lib/checkout/consent.ts` supplies both, in a
single unticked box, which is what the Commission Notice section 5.6.1 requires — *"a positive
action by the consumer, such as ticking a box"*, and a pre-ticked box or a clause in the terms
"would not satisfy these requirements"
(<https://publications.europa.eu/resource/celex/52021XC1229%2804%29>, read 2026-08-26).
**This confirms research 03 §5.4 and §5.7.**

### 3.2 What the moment of conclusion changes: the shape of the window, not the amount

Under (A), the right is born at 00:00 UTC and killed by full performance at 00:00 UTC the next
day. **It lives exactly as long as the banner day, and it is pro rata throughout.** That is
ticket 31's "24 hours", and it survives.

Under (B), the right is born at the bid. During the bidding day nothing has been performed, so
the proportionate amount under art. 6:230s lid 4 — *"een bedrag dat evenredig is aan dat
gedeelte van de verbintenis dat door de handelaar is nagekomen"* — is **zero**. The window
becomes up to 48 hours, of which the first ~24 are free. But a consumer already has that free
exit under 6:230q lid 1 regardless (§1.4), so (B) adds no new exposure; it just relabels it.

**Either way the money at risk is one bid, once, on one day.** Ticket 31's sizing holds.

### 3.3 The pro-rata window `/terms` promises is correct, and its timing rule is right

> 4. Bij uitoefening van het recht van ontbinding na een verzoek overeenkomstig artikel 230t
> lid 3 of artikel 230v lid 8 is de consument de handelaar een bedrag verschuldigd dat evenredig
> is aan dat gedeelte van de verbintenis dat door de handelaar is nagekomen **op het moment van
> uitoefening** van het hiervoor bedoelde recht […]

(art. 6:230s lid 4 BW, read 2026-08-26; art. 14(3) CRD: *"until the time the consumer has
informed the trader of the exercise of the right of withdrawal"*.)

So `/terms`'s *"you pay for the hours that had run when you sent it"* is right, and ticket 31's
finding that a slow inbox costs the house rather than the bidder is **confirmed**. Two duties
ride along with it and neither is in the copy:

- **Refund within 14 days of receiving the statement** — art. 6:230r lid 1, by the same means of
  payment (lid 2).
- **Immediate acknowledgement on a durable medium** — art. 6:230o lid 4: *"Brengt de consument
  op elektronische wijze via de website van de handelaar een verklaring tot ontbinding uit, dan
  bevestigt de handelaar onverwijld op een duurzame gegevensdrager de ontvangst van deze
  verklaring."*

### 3.4 The exemption the site would want, and cannot have

Art. 6:230p sub e / art. 16(1)(l) removes the right entirely for services *"met betrekking tot
vrijetijdsbesteding, indien in de overeenkomst een bepaald tijdstip of een bepaalde periode van
nakoming is voorzien"* — a dated performance. A banner day is a dated performance. But the list
is closed: accommodation other than residential, goods transport, car rental, catering, leisure.
**Advertising space is none of them**, and research 03 §5.3 quotes *PE Digital* (C-641/19,
paras. 43-44) on reading these exceptions strictly. Not available. Worth recording so nobody
proposes it again.

### 3.5 ⚠️ The obligation that is in force and is not built: the withdrawal function

This is not what the ticket asked. It is the biggest thing the reading found.

> **Artikel 230oa**
>
> 1. De handelaar zorgt ervoor dat de consument het recht van ontbinding van een via een
> online-interface gesloten overeenkomst op afstand kan uitoefenen door een verklaring tot
> ontbinding in te dienen door middel van een **duidelijk zichtbaar op de online-interface
> weergegeven en gemakkelijk toegankelijke functie**. […]
>
> 4. Zodra de consument de functie […] activeert, bevestigt de handelaar de ontvangst van de
> ontbinding onverwijld op een duurzame gegevensdrager, onder vermelding van informatie over de
> inhoud van de verklaring en de datum en het tijdstip van indiening.
>
> 5. […] De handelaar zorgt ervoor dat de functie **gedurende deze termijn te allen tijde
> beschikbaar is**.

(art. 6:230oa BW, in force in the version read 2026-08-26. Emphasis added.)

Its EU source is art. 11a CRD, inserted by Directive (EU) 2023/2673, art. 1(3):

> 1. For distance contracts concluded by the means of an online interface, the trader shall
> ensure that the consumer can **also** withdraw from the contract by using a withdrawal
> function. The withdrawal function shall be labelled with the words "withdraw from contract
> here" or an unambiguous corresponding formulation in an easily legible way. […]
>
> 3. […] That confirmation function shall be labelled in an easily legible manner, and only
> with the words "confirm withdrawal" or with an unambiguous corresponding formulation.

Member States *"shall apply those measures from **19 June 2026**"* (art. 2(1), second
subparagraph); art. 11a is inserted by art. 1(3) of that directive.
(<https://publications.europa.eu/resource/celex/32023L2673>, read 2026-08-26. Emphasis added.)

**Three consequences for this build.**

1. **An inbox is no longer enough.** Ticket 31 settled that cancelling is an email to
   `hello@200squares.com` and called that "honest and legal". As of 19 June 2026 it is honest
   and **insufficient**: the site must *also* offer an on-site function. Note the word "also" —
   the email stays valid for the consumer (art. 6:230o lid 3 still accepts any unequivocal
   statement); the button is an extra duty on the trader.
2. **The information duty grew, and the 12-month tail attaches to it.** Art. 6:230m lid 1 sub h
   now requires, alongside the withdrawal information and the model form, *"en, in voorkomend
   geval, informatie over de beschikbaarheid en de plaats van de functie, bedoeld in artikel
   230oa lid 1"* — the Directive's own words, in art. 6(1)(h) CRD as replaced by art. 1(2) of
   Directive (EU) 2023/2673: *"and, where applicable, information about the existence and
   placement of the withdrawal function referred to in Article 11a"*. Art. 6:230o lid 2 extends
   the withdrawal period by up to **twelve months**
   where sub h is not satisfied. ACM says the same in its own words: *"Retailers die in gebreke
   blijven, lopen het risico dat de wettelijke bedenktijd voor consumenten automatisch wordt
   verlengd tot één jaar. Ook kan de ACM boetes uitdelen."*
   (<https://www.acm.nl/nl/publicaties/acm-roept-online-retailers-op-zich-voor-te-bereiden-op-herroepingsknop>,
   published 11-06-2026, read 2026-08-26.)
3. **It bites the square flow harder than the banner flow.** For the banner the right dies at
   00:00 UTC, so the function need only be available for one day per winner. For a **square**,
   research 03 §5.5 found the right may never die at all — which means the function must be
   *"te allen tijde beschikbaar"* for as long as that lasts. This is ticket 03's open question
   ("is a permanent service ever fully performed?") arriving with a build cost attached.

ACM's design conditions, same page: the label must make its purpose immediately clear, an
account may be offered but not required, and the consumer must receive an immediate
confirmation.

---

## 4. Is a daily online auction an *openbare veiling*?

### 4.1 The definition, and it is sub j, not sub f

⚠️ **The ticket cites art. 6:230g lid 1 sub f. That is the wrong letter** — sub f is
*"overeenkomst buiten de verkoopruimte"*. The definition is **sub j**:

> j. **openbare veiling**: een verkoopmethode waarbij zaken of diensten door middel van een
> transparante competitieve biedprocedure **onder leiding van een veilingmeester** door de
> handelaar worden aangeboden aan consumenten, die **persoonlijk aanwezig zijn op de veiling of
> daartoe de mogelijkheid hebben**, en waarbij de winnende bieder zich verbindt de zaken of
> diensten af te nemen;

(art. 6:230g lid 1 sub j BW, read 2026-08-26. Emphasis added.)

The Directive, art. 2(13), in the same words: *"a method of sale where goods or services are
offered by the trader to consumers, who attend or are given the possibility to attend the
auction in person, through a transparent, competitive bidding procedure run by an auctioneer
and where the successful bidder is bound to purchase the goods or services"*
(02011L0083-20220528, read 2026-08-26).

### 4.2 This auction is outside it, on two of the four limbs, three times over

| Limb | 200squares.com |
|---|---|
| transparent, competitive bidding procedure | **met** — published close, published increment, open to all |
| **onder leiding van een veilingmeester** | **fails** — there is no auctioneer; a cron job closes the auction |
| **persoonlijke aanwezigheid, of de mogelijkheid daartoe** | **fails** — online only, by design |
| winning bidder bound to take the goods/services | met, by the terms |

Three independent sources close the question:

**Recital 24 of the Directive:**

> A public auction implies that traders and consumers attend or are given the possibility to
> attend the auction in person. […] **The use of online platforms for auction purposes which
> are at the disposal of consumers and traders should not be considered as a public auction
> within the meaning of this Directive.**

(<https://publications.europa.eu/resource/celex/32011L0083>, read 2026-08-26. Emphasis added.)

**The Dutch memorie van toelichting, on sub j:**

> De kern van de notie van «openbare veiling» betreft de persoonlijke aanwezigheid van de
> consument (of de mogelijkheid hiertoe). Dit betekent dat **veilingen die uitsluitend online
> plaatsvinden niet onder dit begrip vallen** (vgl. ook overweging 24 van de richtlijn). De
> woorden «of de mogelijkheid hiertoe» maken duidelijk dat zogenaamde «hybride veilingen» […]
> wél onder het begrip «openbare veiling» vallen.

(Kamerstukken II 2012/13, 33 520, nr. 3, <https://zoek.officielebekendmakingen.nl/kst-33520-3.html>,
read 2026-08-26. Emphasis added.)

**The Commission Notice, section 1.9:**

> A public auction should give consumers the possibility to attend in person, even if it is also
> possible to make bids online or by telephone. In contrast, **online auctions without the
> possibility to attend in person should not be considered public auctions.**

(<https://publications.europa.eu/resource/celex/52021XC1229%2804%29>, read 2026-08-26. Emphasis
added.)

⚠️ **The "no auctioneer, sells its own inventory" facts do not help and do not hurt.** They are
consistent with being outside, but the *persoonlijke aanwezigheid* limb alone decides it, and
the hybrid carve-out in the memorie van toelichting shows why: a hybrid auction with an
auctioneer and a physical room **is** a public auction even though most bidding happens online.
The lever, if anyone ever wanted the exemption, is a physical room — which is absurd for this
product. **Selling its own inventory is separately useful**: it means the site is not an
*onlinemarktplaats* (art. 6:230g lid 1 sub u — a service enabling consumers to conclude
contracts with **other** traders or consumers), so the marketplace-specific information duties
do not apply.

**Verdict: outside the exemption. Certainly, and on the same ground research 03 §5.5 already
found. This confirms ticket 03 and ADR 0003 on this point.**

### 4.3 What turns on it — and both of the ticket's guesses are wrong

⚠️ The ticket asks whether it is art. 6:230h lid 2 sub b or art. 6:230g lid 3. **Neither.**

- **Art. 6:230h lid 2 sub b** excludes contracts *"betreffende financiële producten, financiële
  diensten en fondsvorming"*. Nothing to do with auctions. Nothing in the whole of art. 6:230h
  lid 2 (sub a-m) mentions auctions at all — a public auction is **not** carved out of the
  afdeling; the whole regime applies to it.
- **Art. 6:230g lid 3** is about a contract concluded through an intermediary acting for a
  trader, letting the consumer invoke the afdeling against that intermediary too. Not this.

**What actually turns on it is art. 6:230p sub c:**

> De consument heeft geen recht van ontbinding bij: […] c. een overeenkomst die is gesloten
> tijdens een openbare veiling;

and the memorie van toelichting on that letter: *"Zoals eerder vermeld, geldt deze uitzondering
niet voor overeenkomsten die via uitsluitend online veilingen worden gesloten."*
(Both read 2026-08-26, sources above.)

One thing more, of no practical use here: **art. 6:230m lid 2** lets a public auction give the
auctioneer's details instead of the trader's (art. 6(3) CRD). Irrelevant — there is no
auctioneer.

**So being outside the exemption means: the full regime applies.** The 14 days
(art. 6:230o), the pre-contractual information (art. 6:230m), the *bestelknop* on the bid
button (art. 6:230v lid 3), the durable-medium confirmation (art. 6:230v lid 7), and — since
19 June 2026 — the withdrawal function (art. 6:230oa). The only relief the site gets is
art. 6:230p sub d, and it gets that because the banner day **ends**, not because it is an
auction.

---

## 5. The bidder who cancels the card, and the "strike"

The build question: the site never charges a losing bidder, and a bidder can escape by
cancelling the card authorization. Does Dutch law give the site a claim, and is a strike
defensible?

### 5.1 Against a business bidder: yes, and a penalty clause would probably hold

The offer is irrevocable (§1.6). At 00:00 UTC the site accepts and a contract exists. A bidder
who then fails to pay is in *verzuim* and the site may claim performance or terminate and claim
damages (arts. 6:74, 6:265 BW). Damages are the real loss: the difference between the bid and
what the day actually earned once the ladder ran — which, since ticket 19 promotes the next bid,
is often the gap between the top bid and the second, and is zero when the house ad takes the day
at no cost.

**A penalty clause is the usual instrument and courts uphold them in internet-auction
conditions.** ECLI:NL:RBMNE:2026:695, para. 3.11:

> Een boetebeding is bij vastgoedtransacties een gebruikelijk beding. Het beding is een prikkel
> tot nakoming en moet daarom een afschrikkende werking hebben. Het hele systeem van
> (internet)veilingen vereist een groot vertrouwen dat biedingen gestand worden gedaan.

and on the bidder's claim not to have known the auction conditions, para. 3.9:

> Om een bod te kunnen uitbrengen op de veilingsite, moet je eerst bewust akkoord gaan met de
> veilingvoorwaarden. De veilingvoorwaarden zijn gepubliceerd. Dat [eiser] de toepasselijke
> voorwaarden niet leest, komt voor zijn eigen rekening en risico.

(Source and date above. Subject to *matiging* under art. 6:94 BW, which the court called a
restrained remedy for "een buitensporig en daarmee onaanvaardbaar resultaat".)

⚠️ **The site has no penalty clause today and this document does not recommend adding one.** A
$100-$300 banner day does not repay a debt-collection process, and against a consumer the clause
would be nearly useless anyway (§5.2). Recorded because it is the answer to "does the law give
the site a claim": against a business, yes, and a published, click-accepted auction condition is
the way it is normally secured.

### 5.2 Against a consumer bidder: effectively no, at every stage

- **Before the close**, art. 6:230q lid 1 lets them revoke for nothing. No claim.
- **After the close**, they have the 14-day right, cut short by full performance at 00:00 UTC
  the next day. If they exercise it they owe only the pro rata under art. 6:230s lid 4, and
  art. 6:230s lid 6 is explicit: *"De consument is niet aansprakelijk noch enige kosten
  verschuldigd door de uitoefening van zijn recht van ontbinding"* (subject to lid 3 and
  art. 6:230r lid 3, neither of which applies to a service).
- **If they neither revoke nor withdraw and simply let the authorization die**, they are in
  breach and the site has a claim in principle — but they can still convert the breach into a
  withdrawal by one email at any point in the same 24 hours, which reduces the claim to the
  hours already run.
- **A "bids are non-refundable" clause does not survive** art. 6:230i lid 1 and, if it were an
  algemene voorwaarde, would face art. 6:237 sub i — presumed unreasonably onerous where a
  clause obliges the counterparty to pay a sum on termination *"anders dan op grond van het feit
  dat de wederpartij in de nakoming van haar verbintenis is tekort geschoten, […] behoudens voor
  zover het betreft een redelijke vergoeding voor door de gebruiker geleden verlies of gederfde
  winst"* (art. 6:237 sub i BW, read 2026-08-26). This **confirms** ticket 31's rejection of
  outbid.lol's checkbox, on a source it did not cite.

⚠️ **And the site cannot tell the two apart.** A dead authorization looks identical whether the
bidder cancelled it deliberately, the issuer expired it, or the bank declined. Any consequence
attached to it is attached on a guess.

### 5.3 Is a strike defensible?

**As a bar on future bidding: yes, with conditions.** Declining to contract with someone in
future is not a penalty and not a forfeiture of any existing right; nothing in afdeling 6.5.2B
touches it. The conditions are ordinary ones:

- It must be **in the terms before the bid**, not applied after the fact — the transparency
  rule of art. 6:238 lid 2 (*"duidelijk en begrijpelijk"*, with ambiguity read against the
  user) and art. 6:233 sub b (arts. 6:233, 6:237 and 6:238 BW all read 2026-08-26 at the
  Boek 6 URL above).
- It must not be triggered by the **exercise of a statutory right**. A strike for withdrawing
  under art. 6:230o, or for revoking a bid under art. 6:230q, would be a penalty on a mandatory
  right and would run straight into art. 6:230i lid 1 and art. 6:237 sub h (*"dat als sanctie op
  bepaalde gedragingen van de wederpartij […] verval stelt van haar toekomende rechten"*).
  ⚠️ **This is the trap**: a consumer's dead hold may well be a lawful revocation, and the site
  cannot distinguish it from an abusive one (§5.2).
- It must not carry money. A strike that forfeits a bid is art. 6:237 sub i territory.

**As a mechanism it still has no target.** Ticket 31 already found this and it holds:
`convex/auction.ts:407` creates the `owners` row at the hold, so a strike would *land*, but
ticket 11's third strike freezes a **block** and a bidder has none. Nothing read today supplies
a consequence.

**A separate flag, not researched.** A strike counter against a named person is personal data
processed for a purpose `/privacy` does not describe. Research 03 §5.9 already lists `/privacy`
as untrue about what the site collects; a strike record makes it more so. **Flagged, not
researched.**

**Recommendation, unchanged from ticket 31:** wait. The attack costs the bidder a real hold on a
real card and wins them nothing, the ladder protects the day, and the law gives no usable
consequence against the only bidders who would plausibly try it.

---

## 6. What a lawyer must still confirm

Ranked by what it costs to be wrong. Everything above is sourced; everything below is where the
sources ran out or answered a different question. **This document is facts and a draft. It is
not legal cover.**

1. **The withdrawal function, art. 6:230oa BW / art. 11a CRD (§3.5).** In force since
   19 June 2026, not built, and its absence extends the withdrawal period to **twelve months and
   fourteen days** through art. 6:230m lid 1 sub h + art. 6:230o lid 2 — the same mechanism
   research 03 §8 item 1 called the largest number in that document, now with a second trigger.
   Confirm the scope (does it reach a banner day whose withdrawal right lives 24 hours? does it
   reach a square?) and what a compliant minimal implementation looks like. **This is the one
   item worth paying for on its own.**
2. **Art. 6:230q lid 1 applied to an auction bid (§1.4).** The statute, its memorie van
   toelichting and art. 12(b) CRD all point one way, and **I could reach no Dutch judgment
   applying art. 6:230q to anything**. Ask a lawyer to confirm there is no auction-specific
   gloss, and in particular whether *"op de in artikel 230o bepaalde wijze"* imports only the
   *manner* of art. 6:230o lid 3 (which is how the memorie van toelichting reads it) or also a
   period. Academic here — the auction closes within 24 hours — but it is the sentence the whole
   copy change rests on.
3. **Whether to write structure (A) or (B) into `/terms` (§2.4).** A drafting decision with a
   consequence: it sets the start of the 14 days and the length of the free-of-charge window.
   Dutch law leaves it to the terms (art. 6:217 lid 2). Get the sentence checked before it is
   published, because once published it is the offer.
4. **The bid button under art. 6:230v lid 3.** ACM required Reizendeal to change its *biedknop*
   (§2.3). `BID_BUTTON` reads *"PLACE BID — OBLIGES YOU TO PAY IF YOU WIN"*. The statute's safe
   harbour is the bare phrase *"bestelling met betalingsverplichting"*; anything else must be an
   *ondubbelzinnige formulering*, and under *Fuhrmann-2* (C-249/21) only the words on the button
   count. A conditional obligation on a button is not a case any source I read has decided.
   ⚠️ **The sanction is not a fine: art. 6:230v lid 3 makes the contract *vernietigbaar*.**
5. **The forfeiture clause for a removed banner.** `/terms`: *"A banner that breaks them is
   removed for the rest of its day and the bid is not returned."* Research 03 §8 item 5 flagged
   it and did not research it; today's reading adds the article to look at — art. 6:237 sub i,
   and art. 6:233 sub a. Still **flagged, not researched**.
6. **The strike, if it is ever built (§5.3).** Confirm that a bar on future bidding is not a
   *beding* caught by art. 6:237 sub h, and that the site's inability to distinguish a lawful
   revocation from an abandoned hold does not make every strike a penalty on a statutory right.
7. **Whether a business bidder can be held to a penalty clause without one being written.**
   Today there is none. If the dev ever wants one, ECLI:NL:RBMNE:2026:695 shows the shape;
   art. 6:94 shows the ceiling. Not urgent, and not recommended.
8. **Whether the site should say the offer is irrevocable, and against whom.** Art. 6:219 lid 1's
   second limb lets the offer declare it (§1.2). Against a business that is worth having. Against
   a consumer it is void and, worse, it is a **misleading statement about a statutory right** —
   which is the reason §7 exists.

---

## 7. What this means for the copy

Ticket 40 acts on this list. The verdict on each sentence, in the words the file uses today.

### `src/lib/checkout/consent.ts`

| Constant / line | Today | Verdict |
|---|---|---|
| `BID_TRUTHS[3]` | **"A bid cannot be withdrawn."** | ⚠️ **Must change.** True for a business bidder, **false for a consumer** (art. 6:230q lid 1). The panel already knows `buyerType`. Either split the sentence by buyer type, or replace it with one that is true for everyone — see below. |
| `BID_TRUTHS[0]` | "A bid places a hold on your card. No money is taken unless you win." | **Stays.** True. |
| `BID_TRUTHS[1]` | "If you win, the hold is collected at 00:00 UTC. If you do not, it is released at the close…" | **Stays.** True, and it is also the sentence that keeps outbid offers alive for the ladder (§1.2). |
| `BID_TRUTHS[2]` | "If the top bid cannot be collected, the banner goes to the next bid that can." | **Stays.** True. |
| `BID_BUTTON` | "PLACE BID — OBLIGES YOU TO PAY IF YOU WIN" | **Stays**, pending §6 item 4. ACM's Reizendeal order requires exactly this kind of label on a bid button. |
| `BANNER_WITHDRAWAL_TEXT` | "I ask 200 Squares to start my banner day at 00:00 UTC… I understand that I lose my right to cancel once the day has been fully delivered." | **Stays, unchanged.** It is the art. 6:230v lid 8 / art. 6:230p sub d wording and it works. |
| `BANNER_WITHDRAWAL_INFO`, first clause | "You have 14 days to cancel, **counted from the day you win**." | **Re-word.** Right only if `/terms` says the contract is concluded at the close. Make it *"counted from the close"* and make `/terms` say so. |
| `BANNER_WITHDRAWAL_INFO`, rest | "To cancel, email hello@200squares.com… you pay for the hours that had run when you sent it." | ⚠️ **Incomplete as of 19 June 2026.** Art. 6:230m lid 1 sub h now also requires *the availability and placement of the withdrawal function*. The email stays valid; the sentence must gain the function, and the function must exist (§3.5). |

**Proposed replacement for `BID_TRUTHS[3]`**, true for both buyer types and shorter than the
distinction it hides:

> "Once placed, a bid stands until the close. If you bid as a private person, you can take it
> back before the close by emailing us."

That is what the law leaves. It keeps the deterrent — a business bidder, which is most of them,
is bound — and it stops the site telling a consumer that a mandatory right does not exist.

### `src/app/terms/page.tsx`, "The daily banner"

| Sentence today | Verdict |
|---|---|
| "The banner is auctioned every day. Today you bid on tomorrow's banner. Bidding closes at 00:00 UTC and starts at $100; each bid is at least $10 over the top bid." | **Stays.** This is the *transparante competitieve biedprocedure* limb of §4.2, stated plainly. |
| ⚠️ **"A bid cannot be withdrawn. Bidding closes at 00:00 UTC and every bid stands until it does."** | **Must change.** Ticket 31 wrote this sentence and this document is why it was worth checking. Sentence two is fine. Sentence one is false against a consumer and, being about a mandatory right, is the worst kind of false. |
| — *missing* — | ⚠️ **Add: the moment of conclusion.** `/terms` never says when the contract comes into being, and Dutch law leaves that to the terms (art. 6:217 lid 2). One sentence: *"A bid is an offer. It is accepted at 00:00 UTC, and that is when the contract begins."* |
| — *missing* — | ⚠️ **Add: outbid offers stay open.** The ladder needs them to (§1.2, art. 6:221 lid 2). One clause: *"A bid that is overtaken stays open until the close, so it can take the day if the higher bid cannot be collected."* |
| "The banner goes to the highest bid that can be collected at 00:00 UTC. If the top bid cannot be collected, the next one takes the day. Every other bid is released." | **Stays.** True, and it is ticket 19's debt already paid. |
| "The winner holds the banner from 00:00 to 00:00 UTC, and the day stays in the public record with the winning bid on it." | **Stays**, and is **still untrue** on its second half — ticket 30's unbuilt public record. Not this ticket's debt; recorded so it is not lost. |
| "If you bid as a private person, you have 14 days to cancel, counted from the close. A banner day is fully delivered at 00:00 UTC, so the right ends there." | **Stays.** Correct under structure (A), and this document recommends (A). |
| "To cancel, email hello@200squares.com. Your banner comes down as soon as we have read your message, and you pay for the hours that had run when you sent it." | ⚠️ **Re-word.** The pro-rata rule is right (art. 6:230s lid 4). Missing: the **withdrawal function** (art. 6:230oa), the **14-day refund deadline** (art. 6:230r lid 1), and the **immediate acknowledgement** (art. 6:230o lid 4). |
| "A banner that breaks them is removed for the rest of its day and the bid is not returned." | **Flagged, not researched** — §6 item 5, art. 6:237 sub i. Unchanged from research 03 §5.9. |

### Elsewhere

- **`docs/adr/0003-a-bid-is-an-irrevocable-offer.md`** — the title is half wrong and the ADR
  knows which half it never checked. Its own ⚠️ said *"If it does not hold, the fallback is the
  same 24-hour pro-rata window moved earlier in the day."* That is the outcome. The ADR needs a
  superseding note, not a rewrite: the **conclusion at the close** stands and is now sourced; the
  **irrevocability against a consumer** does not.
- **The withdrawal function is a build ticket, not a copy ticket.** Ticket 40 cannot make
  `BANNER_WITHDRAWAL_INFO` true by writing a sentence about a function that does not exist.
  See §3.5 and §6 item 1.
