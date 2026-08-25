# Map: 200 squares — V1.0, the real site

Label: wayfinder:map

## Destination

**200squares.com is live and takes real money.** Next.js on Vercel, Convex as the
backend, Better Auth for accounts, Stripe for payments.

A visitor drags a rectangle, pays by card, and afterwards supplies artwork and a
link through an account they never had to create. The daily banner auction runs on
real card holds and closes hard at 00:00 UTC. Clicks are really counted. A DDoS
attack may take the site offline, but it must never produce a bill.

⚠️ **Resale is not in V1.0** (2026-08-25). Charting put it in; the dev took it out to keep
the build smaller and to let scarcity work before a second-hand market softens it. The site
launches without it. See **Out of scope**.

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
  happens on a Vercel preview URL. The long-lived one is the `staging` branch:
  `https://200-squares-git-staging-robs-projects-52973834.vercel.app`.
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
- ⚠️ **The Convex project stays on Free, with no card on the account.** Convex has two
  plans priced at zero: **Free has hard caps** and disables the deployment; **Starter is
  pay-as-you-go** and bills the overage. Attaching a payment method silently converts the
  site's failure mode from *breaks* to *bills* — the one thing the dev said must never
  happen. Tickets 02, 05, 09 and 10 all rest on this. It is not a preference; it is the
  enforcement. Found by [ticket 09](issues/09-artwork-storage.md).

### Fixed by charting (2026-08-24)

Answers given by the dev while charting. Not tickets — they are the frame.

- **Stack**: Next.js on Vercel, Convex, Better Auth, Stripe, Resend for email.
- **The prototype stays.** The components are kept. `src/lib/board/state.tsx` — the
  reducer and the two mock datasets — is what gets replaced by Convex.
- ~~**Resale is in V1.0.**~~ ⚠️ **Reversed 2026-08-25.** The dev took it out again once
  ticket 01 had priced it. It moves to V1.1 and the site launches without it. Ticket 01's
  answer stands as research V1.1 begins with. See **Out of scope** and
  [ticket 12](issues/12-resale-for-real.md).
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
- **A square costs $250, flat**, however full the board is. ⚠️ Charting fixed this at
  $100; the dev raised it to **$250** on 2026-08-25, after tickets 03 and 06 were
  resolved. The decisions in those tickets are untouched — only the amounts rescale, and
  both tickets carry a dated note saying by how much.
  [ADR 0002](../../docs/adr/0002-vat-inclusive-priced-and-computed-here.md), `PRODUCT.md`,
  `CONTEXT.md`, the copy and `PRICE_PER_SQUARE` were all changed with it. The **banner
  auction still opens at $100** — a banner is one day, a square is forever, and the two
  numbers were never the same thing.
- **The withdrawal right is waived at checkout** by an explicit tick box, the way
  outbid.lol does it for bids. Ticket 03 checks that this is actually allowed.
- **A DDoS attack may take the site down. It may not run up a bill.** Offline is an
  acceptable failure; an unexpected invoice is not.
- **The ceiling is about $20 a month**, and it is nearly all fixed cost. Ticket 02
  found that Vercel Pro is compulsory for a commercial site at $20, so the dev chose
  (2026-08-24) to stop there: **Vercel Pro plus Convex Free**. ⚠️ **Pro is deferred**
  (2026-08-25): the site stays on **Hobby** until a live Stripe key enters Production,
  because Hobby **pauses instead of billing** — a wall where Pro's Spend Management is only
  a brake — and nothing commercial exists yet. Until then the bill is **$0**. See the dated
  note on [ticket 02](issues/02-ddos-and-the-bill.md). The Convex websocket
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
  days become 12 months and 14 days, worth **$49,750** on a full board. The banner is
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
  [ADR 0002](../../docs/adr/0002-vat-inclusive-priced-and-computed-here.md). $250 stays
  $250, and **revenue now depends on who buys**: a full board is worth $41,116 to $49,750,
  not one number. The first sale is therefore priced inclusive while ticket 01's resale is
  priced on top — deliberate, and ticket 12 must explain it. The late-webhook gap closes
  with a subscribing return page plus a 10-second server-side session retrieve, keyed on
  the session id so writing twice is impossible. The **reservation flood** that tickets 02
  and 05 both left open is answered by Turnstile plus one reservation per IP plus a 10%
  ceiling on the free squares. VIES failures never block an order; a country mismatch is
  accepted and costs at most $43.39, which only inclusive pricing makes survivable. The
  buyer uploads artwork on the **thank-you page**, before any mail arrives. Orders are kept
  **10 years**, and `pending` has no deadline.

- [08 — Accounts, signing in and access](issues/08-accounts.md) — **the webhook makes an
  owner, not a user; Better Auth makes the user when the magic link is followed; and the
  board never asks who is looking.** The two rows ticket 05 fixed are joined on the
  normalised email, and an owner who never follows their link is an owner all the same —
  the account is how you come back, not what makes you an owner. Next.js is full-stack, so
  the handler sits at `app/api/auth/[...all]/route.ts` on 200squares.com and the
  **`crossDomain` plugin is not used**. Magic Link is supported; the **`admin` plugin is
  not**, so the admin is one `ADMIN_EMAILS` environment variable on the Convex deployment
  and `requireAdmin(ctx)` beside the single `requireOwner(ctx, blockId)` guard. The link
  lives **one hour**, not five minutes, because it arrives after a payment. ⚠️ The
  mistyped address cannot be closed by machinery — it is a support case, repaired by hand
  against the Stripe order, and the same route recovers a **dead inbox**, which `/terms`
  must now answer out loud. ⚠️ **A finding nobody went looking for: the board is already
  not cacheable.** Every page reads `props.searchParams` for `?data=`, so all five routes
  build as dynamic today — ticket 02's cheapest defence was never switched on, and killing
  `?data=` is now a cost requirement on ticket 15 rather than tidiness.
  [18 — Build: accounts and signing in](issues/18-build-accounts.md) follows.

- [07 — The auction on real card holds](issues/07-auction-holds.md) — **nothing is
  released until somebody has paid.** One rule answers the declined capture, the runner-up
  and the hostage attack at once: at 00:00 the site captures the top bid **first**, and
  cancels the other holds only after that capture succeeds; on failure it walks down to
  the next bid that can be collected, for that bidder's own amount. ⚠️ Charting said the
  losing holds go at 00:00 — **they do not**, and the promotion is impossible if they do.
  Being outbid during the day still releases at once. `capture_before` is read on every
  bid and a hold that would die before the close is refused at the keyboard. The rollover
  is a Convex cron **plus lazy closing on read**, ticket 05's own idiom, keyed on the date
  with `closedAt` making a second run a no-op; a missed run shows the house ad and closes
  late. Bidding needs no account and **makes** one, like buying — a bid is a relationship
  over a day, so it wants a session but not a signup wall. ⚠️ The banner is priced
  **VAT-inclusive**, which closes ticket 03's authorize-≠-capture warning for good: that
  was a Stripe Tax problem, Stripe Tax is off, and a bid is captured for exactly the bid
  amount. The sharp consequence is that **the highest bid is not always the most valuable
  bid**, and the site takes it anyway. The winner gets **no preparation time**, so artwork
  may ride along on a standing bid and the house ad covers a winner who brought none. The
  withdrawal box here **actually works**, unlike a square's, because a banner day can be
  fully performed — and a mid-day withdrawal is a pro-rata refund that `/terms` states and
  nobody builds. Bidding still opens at $100 with a $10 raise.
  [19 — Build: the auction on real card holds](issues/19-build-auction.md) follows.

- [09 — Artwork: storage, limits and delivery](issues/09-artwork-storage.md) — **the
  browser does the work, Convex keeps the file, and Vercel's edge serves it.** Files live
  in Convex file storage (1 GB included, a full board costs ~88 MB) and
  `generateUploadUrl()` answers ticket 06's visitor-with-no-session. ⚠️ But **Convex Free
  includes only 1 GB of egress**, so artwork is **never served from Convex to a visitor**:
  one route, `/art/<storageId>`, streams it through Vercel with an immutable
  year-long cache, and Convex is read once per file per region. ⚠️ **Vercel Image
  Optimization is switched off entirely** (`images.unoptimized: true`), which
  **supersedes ticket 02's three image settings** — an optimizer that is never invoked
  cannot be attacked through a varying query string. The browser crops and resizes to two
  exact WebP sizes before upload, so no server ever decodes a hostile file and no 20 MB
  camera JPEG lands. No animation. The site crops rather than refusing an odd ratio.
  ⚠️ **A cut block's pieces share one file and carry a crop rectangle** — which
  `geometry.ts` already draws — because the split happens in a webhook where there is no
  browser to re-cut anything.
  [20 — Build: artwork upload, storage and delivery](issues/20-build-artwork.md) follows.

- [10 — Counting clicks for real](issues/10-clicks-for-real.md) — **a real link, a
  fire-and-forget mutation beside it, one counter row per block, and a public total an
  hour old.** A native anchor with an un-awaited `onClick` mutation: no Vercel invocation,
  no redirect in the visitor's path, and no blocked tab — ⚠️ awaiting anything first
  breaks the user-gesture chain. `clickCounts` is one row per block, not a row per click,
  because `/privacy` forbids the one field that would make those rows worth keeping.
  ⚠️ **The fan-out bomb comes back on `/how-it-works`**, which holds a websocket by
  design, so `siteClicks` is its own query against a cached row recomputed **hourly** and
  never joins the board query. The privacy trap — every obvious rate limit is *something
  kept about the visitor* — is answered by **invisible Turnstile**, one token per board
  load spent over ~30 clicks, verified and thrown away. It stops a script and not a
  determined person, so the rest is honest framing: **the count is a floor, not a
  census**, an inflated number flatters exactly one owner, and the cost lands as function
  calls against a plan that breaks rather than bills. A zero stays a **zero, bare** — the
  most honest thing on the page. The part-sale tiebreak is the lowest square number.
  [21 — Build: counting clicks for real](issues/21-build-clicks.md) follows.

- [13 — Email](issues/13-email.md) — **six messages, one merged out of two, and Stripe
  sends nothing at all.** Magic link, order-confirmed-with-invoice, outbid, banner won,
  automatic refund, block removed — plus ticket 06's artwork reminders at 1, 7 and 30 days.
  ⚠️ **Stripe's own receipts are switched off**: the site issues the invoice, and two
  documents where the prettier one is not a valid VAT invoice is worse than either alone.
  The magic link is the one that may not fail, which is what the `send.` subdomain
  verification in ticket 14 is for. ⚠️ **The auction timing problem is fixed in the words,
  not the timing** — every mail states the close time and never a countdown, so it stays
  true whenever it is read; late outbid mail is sent anyway, and there is no "closes in an
  hour" reminder. No bid confirmation; a first bid's mail *is* the magic link. ⚠️ **A reply
  reaches a person**, not a `no-reply@`, because ticket 08 made emailing the dev the
  official way back into a locked-out account — one more DNS record for ticket 14. And the
  sentence that stops `/privacy` reading as self-contradictory: an **email address belongs
  to an owner**, while the clicks promise is about a **visitor**.
  [22 — Build: the mail](issues/22-build-email.md) follows.

- [17 — The invoice as a document](issues/17-invoice-document.md) — **one series a year,
  the ECB rate frozen on the invoice date, and an HTML document written once and never
  recomputed.** `2026-0001`, allocated inside the mutation that writes the invoice, so no
  number is taken by something that then fails; ⚠️ the double-write ticket 06 worried about
  **cannot happen**, because the order is keyed on the Stripe session id and one order has
  one invoice. The euro amount is the **ECB daily reference rate** — published, dated,
  auditable in 2036 — and ⚠️ it is **not published on weekends or TARGET closing days**, so
  the order freezes `fxRate`, `fxRateDate` **and** `fxSource`; without the date a weekend
  invoice is unprovable. Stored as HTML in Convex file storage at a **permanent,
  unguessable URL keyed on a random token**, never on the invoice number, because an
  invoice carries a name and an address. No PDF at V1.0. A consumer gets one too — deciding
  who needs an invoice costs more than sending everybody one. ⚠️ **The resale invoice is
  the same document with a different VAT rule**, so the template must not hard-code
  inclusive arithmetic or every resale invoice is wrong by 21%. The seller-side self-billed
  document is different law and sits with ticket 12.
  [23 — Build: the invoice document](issues/23-build-invoice.md) follows.

- [11 — Managing the board: removing a block](issues/11-admin-removal.md) — **strip the
  artwork, keep the square, count the strike; three strikes in twelve months freezes the
  block, and nothing is ever refunded.** ⚠️ **The ticket's premise was stale**: `/terms`
  already carries the content rules, already says the square stays yours, already says the
  owner is told which rule, and already says the banner's bid is not returned — so *what
  removal does to the squares* was decided in writing and this ticket did not reopen it.
  What `/terms` never answered is the **loop**: strip it, they upload again, nightly. Hence
  the freeze — ⚠️ **strikes count on the owner** (per-block counting hands a four-block
  owner twelve of them) but the third **freezes only the block that caused it**; a strike
  **expires after twelve months**, because the rule is for a pattern that runs over days;
  the dev can unfreeze, unadvertised; and the owner sees *strike 2 of 3* in the mail and in
  My squares, because freezing a surprise is the complaint worth designing out. The money
  line is flat — *nothing is refunded* — since "we may make an exception" invites every
  removed owner to ask for it. Appeals are a reply to the mail and nothing more. ⚠️
  **Nothing watches the links, and `/terms` says so out loud**; a report to
  `hello@200squares.com` is then the only signal the site will ever get about a
  destination. A `removals` table keeps ten years — about an **owner**, not a visitor, so
  `/privacy` is untouched — and without it the strike rule is unbuildable. One small admin
  page does all four writes in one press, because the Convex dashboard would ask the dev to
  edit three tables by hand at midnight. A banner winner takes a strike like anybody else,
  or the banner is a free practice ground with no memory.
  [24 — Build: the admin page and removal](issues/24-build-removal.md) follows.

- [14 — Environments, keys and the first real deploy](issues/14-environments-and-keys.md)
  — **two Convex deployments, one Vercel project, and the branch URL as the staging
  address.** Convex dev is `proper-heron-683` and prod `energized-deer-345`, ⚠️ **both in
  `eu-west-1`** — owner rows and email addresses stay in the EU, which `/privacy` may want
  to say. No Convex preview deployments: one `dev` serves every branch, because a backend
  per branch moves the `.convex.site` address that Stripe, Better Auth, Resend and
  Turnstile all need fixed. ⚠️ **The Stripe webhook goes to Convex, not Vercel** — stable,
  public, invisible to Deployment Protection, no Vercel invocations, same host as Better
  Auth; **ticket 16 must build it there**. ⚠️ **Charting's `staging.200squares.com` is
  dropped**: a branch-assigned domain is a **Pro feature**, and Vercel's own branch URL is
  already stable, so the custom domain buys only prettiness. The build command lives in
  `vercel.json`, not a dashboard override. ⚠️ Vercel now **refuses a `NEXT_PUBLIC_`
  variable with secret visibility**. A duplicate Vercel project was found and deleted, and
  the setup wizard was deleted too — it exited on a `$20` read as `$2` under `set -u`, and
  dashboard work wants a list, not a program. ⚠️ **This ticket resolves with work
  outstanding on purpose**: Pro, the spend cap, DNS and every production key are **launch**
  work, not environment work, and holding them here would block six build tickets behind a
  card the dev should not add yet. They move to
  [25 — The launch switches](issues/25-launch.md). **Ticket 15 can start now.**

## Not yet specified

- **A PDF invoice.** Ticket 17 stored the invoice as HTML and said no PDF at V1.0, on the
  grounds that it is legally sufficient and costs nothing. The moment a real business
  buyer's accountant asks for an attachment is the moment to revisit it. It needs a real
  complaint first.

- **The build tickets.** Every decision here is followed by building it, the way
  08-10, 12 and 15 followed their decisions on the prototype map. They are created
  as each decision lands, not before. So far:
  [15 — Build: the Convex schema and the live board](issues/15-build-schema.md),
  [16 — Build: the checkout](issues/16-build-checkout.md),
  [18 — Build: accounts and signing in](issues/18-build-accounts.md),
  [19 — Build: the auction on real card holds](issues/19-build-auction.md),
  [20 — Build: artwork upload, storage and delivery](issues/20-build-artwork.md),
  [21 — Build: counting clicks for real](issues/21-build-clicks.md),
  [22 — Build: the mail](issues/22-build-email.md),
  [23 — Build: the invoice document](issues/23-build-invoice.md) and
  [24 — Build: the admin page and removal](issues/24-build-removal.md). Beside them,
  [25 — The launch switches](issues/25-launch.md) holds the switches that only matter on
  the day. ⚠️ Resale leaving added two more:
  [26 — Strip the resale surface](issues/26-strip-resale.md), which must run **before**
  ticket 15 because it is pure deletion in the same files, and
  [27 — The resale label, and the day the board sells out](issues/27-label-and-sellout.md),
  which graduated the sold-out fog.
- **Watching the €10,000 threshold.** Ticket 06 turned Stripe Tax off and computed VAT by
  hand, which is right below the cross-border B2C threshold and wrong above it: the
  Unieregeling brings 27 destination rates, a ten-year retention and a quarter-end ECB
  rate. Something has to tell the dev the crossing is coming *before* it happens. It
  belongs with monitoring, and it needs real sales first.
- **Who reads the flagged orders.** Ticket 06 accepts a country mismatch and flags the
  order rather than refusing it. Nothing yet looks at those flags. Ticket 11 has now given
  the site **an admin page** ([ticket 24](issues/24-build-removal.md)), so the surface
  exists — what is left is whether the flags get a list on it, and what the dev does when
  they read one.
- **Making the copy true again.** `/how-it-works`, `/terms`, `/privacy` and the FAQ
  describe a site that fakes everything. Real accounts, real payment, real refunds
  and a real removal policy all break lines that are true today. This is the same
  shape as 07 → 10, 11 → 13 and 14 → 16, and it comes last.
- **Removing the mock datasets.** `early`, `full`, `brands.ts` and `?data=` are
  scaffolding. Something must still let the dev see an empty board and a full one.
  Ticket 15 displaces the reducer they feed, so it may sharpen this question — it does
  not settle it. ⚠️ Ticket 08 raised the stakes: `?data=` is a search parameter, which is
  why every route builds dynamic, so whatever replaces it **may not be a search parameter
  on the board route**. That part is no longer fog; it is a requirement on ticket 15.
- **Monitoring and alarms.** What tells the dev that the 00:00 UTC rollover failed,
  that a capture was declined, or that a webhook never arrived. It needs the cron and
  the captures to exist first.
- **Backups and loss.** What happens if Convex data is lost, and what the site owes
  people if it is.
- **Bot clicks.** Ticket 10 covers counting clicks safely; whether a rough number
  must later be filtered is a separate question with its own privacy cost.
- **Click counts over time.** Old fog, and more expensive since `/privacy` now
  promises that no time is written down.
- **An archive of past banner winners** older than the site shows today.
- **SEO and share images.**
- **Artwork rules the buyer must read.** Ticket 09 settled the technical half — WebP,
  400 KB, no animation, the site crops rather than refusing an odd ratio. What is left is
  a copy question: where the buyer is told, and how much of it belongs before they pick a
  file rather than after. It rides with **making the copy true again**.

## Out of scope

- ⚠️ **Reselling a square — moved to V1.1** (2026-08-25).
  [12 — Reselling with real money](issues/12-resale-for-real.md) is **closed, not
  resolved**: nothing was decided, it was ruled beyond the destination. The dev's reasons
  are a smaller build and letting scarcity work before a second-hand market softens it, and
  ticket 01 had already called resale the heaviest thing on the map. Nothing is lost —
  [ticket 01](issues/01-resale-platform-cost.md) stays resolved and is the research V1.1
  starts from. V1.0 gains **one pricing rule instead of two**, no credit ledger, no
  `listings` in the board query, and no second VAT treatment on the invoice. What replaces
  it is a **promise** in the top bar, which is [ticket 27](issues/27-label-and-sellout.md)
  and carries its own risk.
- **A price that moves with scarcity.** Fixed at $250. It is a product
  decision, not a build decision, and it may wait until scarcity is real.
- **Marketing, launch and traffic.** The map ends at a site that can be launched.
- **Other currencies, other boards, an API, a mobile app.**
