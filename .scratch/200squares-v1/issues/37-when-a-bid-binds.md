# 37 — When a bid binds, read against a source

Type: research
Status: resolved
Blocked by: —
Parent: ../map.md

## Question

Graduated from the map's *Not yet specified* on 2026-08-26. It was fog because ticket 03
never had to ask it; it is a ticket now because the question is sharp and the site already
promises the answer out loud.

**A bid cannot be withdrawn.** [Ticket 31](31-a-bid-that-does-not-stand.md) rests that on
art. 6:219 BW — *an offer that names a term for acceptance cannot be revoked* — and on
[ADR 0003](../../../docs/adr/0003-a-bid-is-an-irrevocable-offer.md). Neither is a citation.
It is the load-bearing sentence under the whole auction: the ladder, the standing hold, the
copy on `/terms` and in the bid panel.

Read it against primary sources and answer:

1. **Does 6:219 lid 1 actually hold here?** A bid on 200squares.com names a term — the
   close at 00:00 UTC. Does naming that term make the offer irrevocable in Dutch law, and
   does a consumer bidder change it?
2. **When is the contract concluded?** At the bid (offer + suspensive condition of being
   top at the close), or at 00:00 (acceptance by the site)? The answer decides *when the
   14 days start* and therefore whether ticket 03's auction reasoning still stands.
3. **Does the withdrawal right land differently** than ticket 03 assumed for the banner?
   Ticket 03 said a banner day can be fully performed and the waiver works. Does the
   conclusion moment change that, or the pro-rata window in `/terms`?
4. **Is an online daily auction a *openbare veiling*** within art. 6:230g lid 1 sub f BW /
   art. 2(13) of Directive 2011/83? Ticket 03 touched the exemption; name whether this
   auction is inside it or outside it, and what turns on that.

Primary sources only: BW book 6, Directive 2011/83, Regulation 282/2011, Dutch case law or
ACM/Rijksoverheid guidance. No blog posts standing in for law.

⚠️ **Not a blocker for the site working.** If 6:219 does not hold, the fallback is the same
24-hour pro-rata window moved earlier in the day; the site still works and is simply more
generous than intended. What it blocks is the copy: `/terms` may not keep saying a bid is
irrevocable if it is not.

Feeds [40 — Making the copy true again](40-copy-true-again.md).

## Answer

Findings: [`research/37-when-a-bid-binds.md`](../research/37-when-a-bid-binds.md), seven
sections, every claim carrying its URL and the date it was read (2026-08-26).

**1. Art. 6:219 lid 1 BW holds against a business bidder and is undone against a consumer.**
The auction does name a term for acceptance, so the carve-out applies and a business bidder is
bound. But **art. 6:230q lid 1 BW** — *"In afwijking van artikel 219 kan een aanbod van de
consument tot het aangaan van een overeenkomst aan de handelaar op de in artikel 230o bepaalde
wijze worden herroepen"* — frees a consumer bidder at any moment before the close, for nothing,
by an unequivocal statement. The memorie van toelichting (kst-33520-3) records that the Raad van
State raised **exactly the named-term case** and that the bill was amended to defeat it.
Art. 12(b) of Directive 2011/83 is the EU basis and art. 6:230i lid 1 makes it mandatory, so no
wording restores it. The Commission Notice on the CRD (OJ C 525, §1.9) says the same for online
auctions in terms. ⚠️ **This contradicts [ADR 0003](../../../docs/adr/0003-a-bid-is-an-irrevocable-offer.md)'s
sentence *"That ground binds a consumer as firmly as a business"*** — the offer stage is
precisely where 6:230q lives. The ADR's own ⚠️ came true, and the fallback it named is the
outcome. [Ticket 31](31-a-bid-that-does-not-stand.md)'s third listed honest answer —
*irrevocable for businesses, cancellable for consumers* — is the one the law gives.

**2. Dutch law does not decide when the contract is concluded; the auction's terms do**
(art. 6:217 lid 2 BW), and `/terms` is silent. The research recommends writing **the ADR's
structure (A)** — bid is the offer, the close is the acceptance — into `/terms` in words: it is
what a Dutch court did with an internet-auction bid (ECLI:NL:RBMNE:2026:695 §3.7), it starts the
14 days at the close (art. 6:230o lid 1 sub a, counted under Reg. 1182/71), and it keeps the
free window as short as the auction. But **the choice is no longer load-bearing**: 6:230q frees
a consumer under either structure. It now decides only the length of the free window and the
start of the 14 days.

**3. [Ticket 03](03-vat-invoices-withdrawal.md)'s banner finding stands, unchanged.** A banner
day is fully performed at 00:00 UTC, art. 6:230p sub d works, and the pro-rata window is right —
including its timing rule, which prices from when the consumer *sent* the message
(art. 6:230s lid 4). Two additions: the dated-performance exemption of art. 16(1)(l) does **not**
cover advertising, and the *square* keeps ticket 03 §5.5's open question about a permanent
service.

**4. This auction is outside the *openbare veiling* exemption, certainly.** The definition is
art. 6:230g lid 1 **sub j**, not sub f as the ticket guessed, and the auction fails it on
*veilingmeester* and on personal attendance. Recital 24, the memorie van toelichting and the
Commission Notice all put online-only auctions out. What turns on it is **art. 6:230p sub c** —
not art. 6:230h lid 2 sub b (financial products) and not art. 6:230g lid 3 (intermediaries);
both of the ticket's guesses are wrong. Being outside means the **whole regime** applies: the
14 days, art. 6:230m information, the *bestelknop*, the durable-medium confirmation, and the
withdrawal function.

**The bidder who kills their own hold.** Against a business: yes — art. 6:74 / 6:265, and
auction penalty clauses hold (RBMNE §3.11) subject to art. 6:94, though none is written here.
Against a consumer: effectively **none**, at any stage; a *non-refundable* clause dies on
art. 6:230i lid 1 and art. 6:237 sub i. A strike barring future bidding is defensible only if
published in advance and never triggered by the exercise of a statutory right (art. 6:237 sub
h) — and the site cannot tell a lawful revocation from an abandoned hold. The map's fog on this
is unchanged.

### ⚠️ The largest find is not what the ticket asked

**Art. 6:230oa BW / art. 11a CRD — the withdrawal function — is in force since 19 June 2026 and
is not built.** A trader must offer an on-site, clearly visible *herroepingsknop*; an inbox is
no longer enough. Art. 6:230m lid 1 sub h now also requires information about its existence and
placement, and art. 6:230o lid 2 extends the withdrawal period by up to **twelve months** where
sub h is not satisfied. ACM confirms it in the same words and names fines as well
(acm.nl, 11-06-2026). It bites the square harder than the banner, because the banner right dies
in a day and ticket 03 never settled whether a permanent service dies at all. **It is a build,
not a sentence** — ticket 40 cannot make `BANNER_WITHDRAWAL_INFO` true by writing about a button
that does not exist. Graduated as [ticket 42](42-the-withdrawal-function.md), which now blocks
both [40](40-copy-true-again.md) and [25](25-launch.md).

### What it costs the copy

§7 of the research is the sentence-by-sentence list [ticket 40](40-copy-true-again.md) acts on.
In short: **`BID_TRUTHS[3]` — "A bid cannot be withdrawn." — and the identical `/terms` sentence
must change**, being false against a consumer and about a mandatory right. *"counted from the
day you win"* becomes *"counted from the close"*, and `/terms` must say when the contract is
concluded and that outbid offers stay open for the ladder (art. 6:221 lid 2). Both tick boxes,
`BID_BUTTON` and the ladder sentences stay. ADR 0003 gets a superseding note, added
2026-08-26: conclusion-at-the-close survives and is now sourced; irrevocability against a
consumer does not.

**Still for a lawyer** (§6, ranked): the withdrawal function's scope — the one item worth paying
for on its own; art. 6:230q applied to an auction bid, where no Dutch judgment could be reached;
which structure to publish; `BID_BUTTON` under art. 6:230v lid 3, whose sanction is a
*vernietigbare* contract rather than a fine; and the forfeiture clause for a removed banner,
still flagged and still not researched.
