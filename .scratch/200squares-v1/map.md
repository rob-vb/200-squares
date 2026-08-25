# Map: 200 squares — V1.0, the real site

Label: wayfinder:map

## Destination

**200squares.com is live and takes real money.** Next.js on Vercel, Convex as the
backend, Better Auth for accounts, Stripe for payments.

A visitor drags a rectangle, pays by card, and afterwards supplies artwork and a
link through an account they never had to create. The daily banner auction runs on
real card holds and closes hard at 00:00 UTC. Owners sell their squares on through
the site. Clicks are really counted. A DDoS attack may take the site offline, but
it must never produce a bill.

Marketing and the launch itself are out of scope. The map is finished when the dev
can decide to launch — not when the launch happens.

The design does not change. [The prototype map](../200squares-frontend/map.md) is
closed and its answers stand; this map replaces the fake data underneath it with a
real backend, and then makes the copy true again.

## Notes

- Domain: full-stack product build. Money, accounts and abuse are the new subjects.
  The design is settled and is not reopened.
- **This map builds.** Same shape as the prototype map: decide, build, then make the
  copy true. Planning tickets still resolve as decisions.
- Keep it informal. Short tickets, short answers, no ceremony.
- Skills to consult per session: `mattpocock-skills:grilling`,
  `mattpocock-skills:domain-modeling`, `mattpocock-skills:research`,
  `mattpocock-skills:codebase-design`, `frontend-design` only where UI changes.
- The dev works on a VPS, so nothing can be viewed locally. Every visual check
  happens on a Vercel preview URL: `200-squares-git-<branch>-robs-projects-52973834.vercel.app`.
- **Commit as `hi@robvb.com` or the Vercel deploy is blocked.**
- The dev speaks Dutch; write to them in Dutch, ASD-STE100 style. The product UI is
  English, prices in USD.
- Vocabulary lives in `CONTEXT.md` at the repo root. Product truth lives in
  `PRODUCT.md`. Both describe a prototype today and both need updating as this map
  resolves.
- This is a one-person business (eenmanszaak, KVK + BTW). Every legal answer is a
  cost to that person, not to a company.
- **Nothing may be invented.** `PRODUCT.md` bans fabricated statistics, customers and
  proof. Real money does not lift that ban.

### Fixed by charting (2026-08-24)

Answers given by the dev while charting. Not tickets — they are the frame.

- **Stack**: Next.js on Vercel, Convex, Better Auth, Stripe, Resend for email.
- **The prototype stays.** The components are kept. `src/lib/board/state.tsx` — the
  reducer and the two mock datasets — is what gets replaced by Convex.
- **Resale is in V1.0.** The dev chose it knowing the cost. Ticket 01 finds out what
  that cost really is.
- **Buying needs no account.** Stripe supplies the email. The site then creates the
  account and sends a magic link. Better Auth, no password.
- **Artwork comes after payment.** The block lands `pending` and the owner uploads
  through their account. `pending` already exists in the model and in the copy.
- **Checkout is Stripe's hosted page**, not Elements in the panel. Selection happens
  on the board; payment happens on Stripe; the visitor returns to a thank-you page.
- **A rectangle is held for 15 minutes** while checkout runs, and reads as taken on
  the board for that time.
- **The auction charges by card hold.** A bid is an authorization. At 00:00 UTC the
  site captures the winner and releases the rest.
- **The auction closes hard at 00:00 UTC.** No extension window. The minimum raise
  stays $10 over the top bid.
- **No moderation before publishing.** The dev does not approve artwork up front.
  They do want to remove a block afterwards, with a reason.
- **Removal refunds nothing by default**, and the dev decides per case. Otherwise
  breaking the rules becomes a way to get a refund.
- **A square stays $100, flat**, however full the board is.
- **The withdrawal right is waived at checkout** by an explicit tick box, the way
  outbid.lol does it for bids. Ticket 03 checks that this is actually allowed.
- **A DDoS attack may take the site down. It may not run up a bill.** Offline is an
  acceptable failure; an unexpected invoice is not.
- **The ceiling is about $20 a month**, and it is nearly all fixed cost. Ticket 02
  found that Vercel Pro is compulsory for a commercial site at $20, so the dev chose
  (2026-08-24) to stop there: **Vercel Pro plus Convex Free**. The Convex websocket
  stays unprotected, which is accepted on purpose — Convex Free refuses work instead of
  billing for it, so an attack breaks the site rather than the bank, and that is the
  failure the dev already called acceptable. The $25 step to Convex Pro waits until
  there is real traffic.
- **The domain is `200squares.com`.** Bought at Cloudflare while this map was
  being worked — see [04 — Buy 200squares.com](issues/04-domain.md).

## Decisions so far

<!-- one line per resolved ticket -->

- [04 — Buy 200squares.com](issues/04-domain.md) — bought, and the zone sits at
  Cloudflare (`jacqueline`/`jakub.ns.cloudflare.com`), empty. None of the three
  connections are live, and all three move to ticket 14, which already owns the keys
  and the domain verification. Resend's SPF, DKIM and DMARC want doing earliest,
  because ticket 13 cannot be tested without mail that arrives. Cloudflare in front
  of Vercel is now a proxy switch rather than a registrar move, so ticket 02 judges
  that arrangement on merit.

- [01 — Reselling: what a platform is allowed to do, and what it costs](issues/01-resale-platform-cost.md)
  — **run resale on site credit, not cash, and put VAT on top of the listed price.** The
  model from tickets 11-12 survives whole; the money leg under it does not. The finding
  nobody expected is VAT: art. 9a of Reg. 282/2011 presumes the platform supplies in its
  own name and bars rebuttal by anyone who sets the general terms, so **VAT is owed on
  $150, not $15**, with no margin scheme and no input VAT from a private seller. Priced
  VAT-inclusive an EU resale **loses $19**; priced VAT-on-top about **$6** survives, and
  the €10,000 threshold is crossed at 67 resales, not 670. ⚠️ **PSD2 is why cash is the
  expensive road**: DNB says a platform that takes the buyer's money and pays the seller
  provides a payment service, and an eenmanszaak is **forbidden to operate and unable to
  be licensed**. Connect is the named escape, but only if payout is immediate — which is
  also the only cheap chargeback defence. **DAC7 does not apply** (a square is
  intangible, and an eenmanszaak is not an Entity), though the second ground dies on
  becoming a BV. Resale is a Stripe restricted business twice over. In hosting money
  resale is cheap; in risk, law and work it is the heaviest thing on the map.

- [02 — DDoS, cost and hard limits](issues/02-ddos-and-the-bill.md) — **"Static front,
  capped back"**, and the dev's own direction was aimed at the wrong half of the stack:
  the Cloudflare zone stays **DNS-only**, because Vercel's firewall on Pro beats
  Cloudflare Free and proxying subtracts from it. Blocked traffic does not bill on
  Vercel, on any plan — that one fact makes the rule affordable. Vercel Pro is
  **compulsory** for a commercial site, Spend Management goes to $5 with *Pause
  production deployment* on, five WAF rules with the Stripe-webhook bypass first, and
  Convex stays on **Free**, where an attack breaks the site instead of billing it.
  Turnstile is the only free control that reaches the websocket. ⚠️ **$25 does not buy
  websocket protection** — firewalling `*.convex.cloud` needs a Convex custom domain at
  Convex Pro, so $20 + $25 = $45 — and even then Cloudflare inspects only the 101
  upgrade. The board page must be cached, cookie-free and open **no websocket for an
  anonymous visitor**, because a subscription rerun is a billed function call.
  ⚠️ **[Ticket 05](issues/05-convex-model.md) overturned that last recommendation**: the
  board is live for everyone, because Free cannot bill and the board is cold. Cookie-free
  stands; the no-websocket rule does not. The failure the rule never covered: a script can
  freeze the board with fake 15-minute reservations, for free.

- [03 — VAT, invoices and the right of withdrawal](issues/03-vat-invoices-withdrawal.md)
  — a square is **advertising space on a web page**, named in those words by Annex I(3)(h)
  of Regulation 282/2011 as an electronically supplied service, and the link is part of
  the same supply. The panel collects buyer type (no default), country, name, an EU VAT
  number for a business outside NL, an unticked withdrawal box with the Art. 6(1)(h)
  information, and consent to a digital invoice; only the **VAT number** (VIES,
  synchronously, before the Checkout Session — Stripe checks validity too late) and the
  **country** must be verified. Under €10,000 cross-border B2C every EU consumer pays
  Dutch 21%. ⚠️ **The waiver as charted does not work**: a square is a service, so only
  Art. 16(1)(a) applies and it needs **full performance** — a `pending`, permanent square
  never has it. Keep the box anyway, because without the Art. 6(1)(h) information the 14
  days become 12 months and 14 days, worth **$19,900** on a full board. The banner is
  different and can be fully performed. ⚠️ And Stripe's button says "Buy": under
  *Fuhrmann-2* the order must be placed on 200squares.com, which cuts across "checkout is
  Stripe's hosted page".

- [05 — The data model in Convex](issues/05-convex-model.md) — **blocks stay the only
  record, the board goes live for everyone, and everything written often or worth money
  is kept out of the board query.** ⚠️ The live board **contradicts ticket 02 on purpose**:
  Convex Free cannot bill (hard caps, no overage rate), so an overrun breaks the site
  instead of invoicing it — the dev's own rule, enforced by the platform — and the board
  is cold, at most 199 sales in its whole life. Clicks are the real fan-out bomb, so they
  get their own table the board never reads, and the public total is summed in a cached
  query rather than held in one hot row. Recorded as
  [ADR 0001](../../docs/adr/0001-live-board-clicks-outside-it.md), with an
  environment-variable kill switch back to a cached snapshot. `reserved` becomes a fourth
  square state; a reservation is its own table and **identifies nobody** — the Stripe
  session metadata carries it back, so the board stays cookie-free. Convex is the source
  of truth, not Stripe. Owner and Better Auth user stay two rows. The webhook beats a
  late expiry whenever the squares are still free, and refunds automatically when they
  are not. ⚠️ The reservation flood from ticket 02 is now a **quota** attack as well as a
  board freeze, and it stays open for ticket 06.

- [06 — Buying with real money](issues/06-buying-for-real.md) — **the order is placed on
  200squares.com, $100 includes VAT, and only the webhook writes the block.** ⚠️ Charting
  said "checkout is Stripe's hosted page"; under *Fuhrmann-2* only the words on the button
  count, so the **order button moves into the panel** (*Order now — obliges you to pay*)
  and Stripe is demoted to executing an order that already exists. The panel stays one
  screen: company, link and artwork leave it, the ticket 03 fields take their place.
  ⚠️ **`tax_behavior: inclusive`, irreversible, and Stripe Tax off** — the site computes
  VAT itself and freezes it into the order, recorded as
  [ADR 0002](../../docs/adr/0002-vat-inclusive-priced-and-computed-here.md). $100 stays
  $100, and **revenue now depends on who buys**: a full board is worth $16,446 to $19,900,
  not one number. The first sale is therefore priced inclusive while ticket 01's resale is
  priced on top — deliberate, and ticket 12 must explain it. The late-webhook gap closes
  with a subscribing return page plus a 10-second server-side session retrieve, keyed on
  the session id so writing twice is impossible. The **reservation flood** that tickets 02
  and 05 both left open is answered by Turnstile plus one reservation per IP plus a 10%
  ceiling on the free squares. VIES failures never block an order; a country mismatch is
  accepted and costs at most $17.36, which only inclusive pricing makes survivable. The
  buyer uploads artwork on the **thank-you page**, before any mail arrives. Orders are kept
  **10 years**, and `pending` has no deadline.

## Not yet specified

- **Site credit as a product.** Ticket 01 moved resale onto credit instead of cash, and
  that creates a thing the site never had: a balance a person holds. Ticket 05 fixed its
  **shape** — a ledger of entries that never change, never a balance field — and nothing
  else. What it can be spent on, whether it expires, what happens to it if the site
  closes, and whether it is a single- or multi-purpose voucher — which decides when VAT
  falls — are all still open. Ticket 12 builds the ledger; this is the product question
  beside it.
- **The build tickets.** Every decision here is followed by building it, the way
  08-10, 12 and 15 followed their decisions on the prototype map. They are created
  as each decision lands, not before. So far:
  [15 — Build: the Convex schema and the live board](issues/15-build-schema.md) and
  [16 — Build: the checkout](issues/16-build-checkout.md).
- **Watching the €10,000 threshold.** Ticket 06 turned Stripe Tax off and computed VAT by
  hand, which is right below the cross-border B2C threshold and wrong above it: the
  Unieregeling brings 27 destination rates, a ten-year retention and a quarter-end ECB
  rate. Something has to tell the dev the crossing is coming *before* it happens. It
  belongs with monitoring, and it needs real sales first.
- **Who reads the flagged orders.** Ticket 06 accepts a country mismatch and flags the
  order rather than refusing it. Nothing yet looks at those flags, and there is no admin
  surface to look at them from. Ticket 11 builds one for removal; whether it grows this
  too is open.
- **Making the copy true again.** `/how-it-works`, `/terms`, `/privacy` and the FAQ
  describe a site that fakes everything. Real accounts, real payment, real refunds
  and a real removal policy all break lines that are true today. This is the same
  shape as 07 → 10, 11 → 13 and 14 → 16, and it comes last.
- **Removing the mock datasets.** `early`, `full`, `brands.ts` and `?data=` are
  scaffolding. Something must still let the dev see an empty board and a full one.
  Ticket 15 displaces the reducer they feed, so it may sharpen this question — it does
  not settle it.
- **Monitoring and alarms.** What tells the dev that the 00:00 UTC rollover failed,
  that a capture was declined, or that a webhook never arrived. It needs the cron and
  the captures to exist first.
- **Backups and loss.** What happens if Convex data is lost, and what the site owes
  people if it is.
- **What the board does the day it sells out.** Ticket 13 on the prototype map made
  sell-out point at the market. With real money that becomes a real moment.
- **Bot clicks.** Ticket 10 covers counting clicks safely; whether a rough number
  must later be filtered is a separate question with its own privacy cost.
- **Click counts over time.** Old fog, and more expensive since `/privacy` now
  promises that no time is written down.
- **Blocks an owner cut themselves** — merging them back, or replacing artwork across
  them at once. Old fog from ticket 12, untouched.
- **Whether a block shows what it last sold for**, and whether the market gets a
  price record the way the banner has one.
- **An archive of past banner winners** older than the site shows today.
- **SEO and share images.**
- **Artwork rules per block size** — file size, aspect ratio, formats, animation.
  Ticket 09 settles the technical half; whether there are rules the buyer must read
  is a copy question that follows it.

## Out of scope

- **A price that moves with scarcity.** Fixed at $100 by charting. It is a product
  decision, not a build decision, and it may wait until scarcity is real.
- **Marketing, launch and traffic.** The map ends at a site that can be launched.
- **Other currencies, other boards, an API, a mobile app.**
