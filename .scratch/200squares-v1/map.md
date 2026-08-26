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
- ⚠️ **The scripts write their screenshots to the repo root, and `git add -A` will take
  them.** It did, twice, on ticket 20. `/*.png` is in `.gitignore` from 2026-08-25 — check
  `git status` before committing all the same.
- **Seeing a board is a deployment command, not a URL.** `npx convex run seed:full`,
  `seed:early` or `seed:clear` against the dev deployment. ⚠️ `?data=` is gone: it was a
  search parameter, and reading one is what made every route build dynamic (ticket 08).
  Nothing may put one back on the board route. The seed refuses without `SEED_ENABLED`.
- ⚠️ **Do not poll the staging URL with `curl`.** It trips Vercel's bot challenge, which
  then blocks Playwright too and there is no other way to see the site. Use
  `node scripts/shot.mjs` from the repo root and leave time between runs.
- ⚠️ **Turnstile cannot be solved from the VPS.** Headless or headful, the widget renders,
  fetches its challenge and stalls — no callback, no error code. Cloudflare does not answer
  a datacenter address. So dev and preview run Cloudflare's **dummy always-passes keys**
  and production keeps the real pair; without that nobody working on this site could get
  through their own checkout. Found by [ticket 16](issues/16-build-checkout.md), written
  up under *Turnstile on dev* in `docs/environments.md`, and it puts one manual live-mode
  purchase on [ticket 25](issues/25-launch.md).
- **Driving a real purchase**: `node scripts/flow.mjs [prefix]` buys a square end to end on
  staging in Stripe test mode and screenshots every step. Run
  `node scripts/free-holds.mjs` first if a previous run stopped at Stripe — one visitor may
  hold one reservation and the VPS is one visitor.
- **Driving an upload**: `node scripts/artwork.mjs [prefix]` starts from the session
  `scripts/signin.mjs` leaves in `.auth.json`, makes a source image on the spot, and puts a
  picture on the first block in My squares — then asks `/art/<id>` for what it stored and
  prints the cache header. `node scripts/flow.mjs` now uploads on the thank-you page as
  part of the purchase, which is the one grant a buyer with no account holds. Built by
  [ticket 20](issues/20-build-artwork.md). ⚠️ **The panel is in the DOM twice** — the side
  panel and the bottom sheet, one hidden by CSS — so a script that reaches for the *last*
  file input reaches into the copy nobody can see.
- **Driving a real bid**: `node scripts/bid.mjs <email> [amount] [prefix]` places one bid end
  to end on staging in Stripe test mode. ⚠️ Give each run a **different address** — Stripe's
  email is what makes an owner, and a bidder who raises their own bid has their earlier hold
  released, so a one-address run can never build the ladder the close needs.
- **Driving a click**: `node scripts/clicks.mjs [prefix]` starts from the session
  `scripts/signin.mjs` leaves in `.auth.json`, reads the owner's own count out of My squares,
  clicks their block on the board three ways — mouse, mouse again on the same permit, and the
  keyboard — drags across it once to prove a drag counts nothing, and reads the count again.
  It sets a link on the block first if `seed:adopt` left it without one. The count is private
  to its owner (ticket 14), so the panel is the only place it can be checked at all. The
  public total on `/how-it-works` is an hour old by design: `npx convex run
  snapshots:buildSiteClicks` forces it rather than waiting. Built by
  [ticket 21](issues/21-build-clicks.md).
- ⚠️ **The close cannot be tested by waiting for it.** It fires at 00:00 UTC, once a day.
  `npx convex run seed:ageAuction` moves tomorrow's live bids back to today and clears the
  day row, so the next `npx convex run auction:closeDue` closes it for real against Stripe
  test mode. To force the case that matters — a **declined capture** — cancel the top
  PaymentIntent at Stripe first and watch the runner-up be promoted for its own amount.
  Built by [ticket 19](issues/19-build-auction.md); refuses without `SEED_ENABLED`.
- ⚠️ **Being signed in is also a deployment command.** There is no inbox here either, so a
  magic link cannot be read out of mail. `npx convex run auth:devSignInLink '{"email":"…"}'`
  hands the link back instead of posting it, and `node scripts/signin.mjs '<url>'` follows
  it and leaves the session in `.auth.json` for the next script. A link is single use.
  `npx convex run seed:adopt '{"email":"…"}'` gives that address a seeded owner's squares,
  so My squares has something in it. All three refuse without `SEED_ENABLED`. Built by
  [ticket 18](issues/18-build-accounts.md).
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

- [26 — Strip the resale surface](issues/26-strip-resale.md) — **resale is out of the
  repo, and `/terms` now says there is no exit at all.** Pure deletion: two panel flows,
  the For sale switch, the market view and its dim layer on the canvas, `Listing`, the
  asking price and the fee, the listings in the mock data, and every mention of selling on
  in the copy. ⚠️ `/terms` lost *"Selling your square on"* and gained **"There is no way
  out"**, and it does **not** promise V1.1 — that promise lives only in the top bar
  ([ticket 27](issues/27-label-and-sellout.md)), which is not written yet, so today the
  site says no resale and nothing else. `intersect`, `remainderOf` and the crop stayed on
  purpose: a part sale is not only resale, and ticket 15's write path owes the loser of a
  race exactly that remainder. `CONTEXT.md` keeps the vocabulary under **Not in V1.0** —
  plus **Site credit**, which the ticket did not name but which describes nothing in V1.0
  either. ⚠️ A stale price was found on the way: `/about` still said **$100 a square**.

- [15 — Build: the Convex schema and the live board](issues/15-build-schema.md) — **the
  reducer is gone, the board is really live, and all five routes build static.** The
  schema is ticket 05's plus `invoices` and `cached`; money in whole cents, absolute UTC ms
  everywhere, and `clickCounts` with no time field at all, which is where `/privacy`'s
  promise is actually kept. ⚠️ **ADR 0001 is amended**: the board query carries the block's
  `url` and its owner's name, because ticket 10 made a click a **native anchor** and an
  anchor needs its `href` at render — a `/go/<id>` route would undo that whole answer. The
  write path is the point: `reserve` reads and writes in one serialisable mutation, and the
  loser gets `largestFreePart` of their drag rather than an error, verified against the
  deployment. The kill switch is `BOARD_LIVE=false`, a cached row a cron rewrites
  **every two minutes whether or not the switch is thrown**, because a snapshot built under
  the load is no escape from it. ⚠️ **`?data=` is dead and every route is now
  `○ (Static)`** — ticket 08's finding closed, and ticket 02's cheapest defence switched on
  for the first time. Seeing a board is now `npx convex run seed:full`, guarded by
  `SEED_ENABLED`. ⚠️ An `artwork` union arm nobody asked for — **seeded artwork**, colour
  and a wordmark with no file — exists because 37 invented logos as real WebP files is not
  a thing to build. Every unbuilt seam says out loud which ticket owns it, and
  `owners.seedViewer` is the fake sign-in on borrowed time until ticket 18.

- [16 — Build: the checkout](issues/16-build-checkout.md) — **the order is placed on
  200squares.com, reserving moved to Convex, and one keyed mutation is the only thing that
  writes a block.** The panel holds the ticket 03 fields and did not grow; the wording of
  the tick box is stored **as words**, and `orders` gained the IP, that wording and a
  `refundedAt` to carry it. ⚠️ **`reservations.reserve` is now internal** — reached only
  through a Convex HTTP action, because the two limits need the caller's IP and a Turnstile
  answer, and a public mutation with the controls wrapped *around* it is a bypass. The 10%
  ceiling needed a floor of one 4 × 4 or the last nine squares could never be sold, and the
  hold now keeps a **salted hash of the address**, which `/privacy` owes a sentence.
  ⚠️ **A free square is one no *block* covers**: another visitor's live hold does not beat
  a completed payment, whoever pays first wins, and the loser is refunded in full — a path
  staged by hand, which is how the refund was found to be **unretryable** and fixed.
  ⚠️ **Turnstile cannot be solved from the dev's VPS at all**, so dev runs Cloudflare's
  dummy keys and **production is the first place the real widget ever runs** — one manual
  live-mode purchase is now on [ticket 25](issues/25-launch.md). ⚠️ `owners.name` starts
  **empty** and is set on the return page, so a private person's legal name never becomes
  the public tooltip. All five pages still build `○ (Static)`: the session id is read on
  the client and Stripe's back link has its own route.
  [Ticket 23](issues/23-build-invoice.md) gains one rule — a refunded order takes no
  invoice number.

- [18 — Build: accounts and signing in](issues/18-build-accounts.md) — **Better Auth runs on
  Convex, the browser reaches it through 200squares.com, and the board HTML is byte-identical
  signed in or out.** Magic link only, one hour, and ⚠️ the Next.js route is a **forwarder,
  not an auth server** — which is what keeps the cookie first-party and why ticket 08 refused
  `crossDomain`. Turnstile on sign-in is Better Auth's own `captcha` plugin scoped to that one
  endpoint, and a POST without a token really does come back `400 MISSING_RESPONSE`.
  ⚠️ **The join is not the trigger ticket 08 asked for**: wiring `authFunctions` makes the
  component reference its own generated API and TypeScript refuses it, so `currentOwner`
  joins on the address and `requireOwner` writes `owners.userId` as a shortcut — which
  answers the other order, an account made before the first purchase, for free.
  ⚠️ **And the finding that costs money: ticket 08's "hit on sign-in and never on a board
  view" is false.** The provider calls `useSession()` unconditionally, so every board view is
  now one Vercel invocation where it was none. Static survives; free does not. Recorded below.
  ⚠️ The VPS could not sign in at all — no browser, no inbox — so `auth:devSignInLink`,
  `seed:adopt` and `scripts/signin.mjs` exist, all refusing without `SEED_ENABLED`.
  `requireOwner` and `requireAdmin` are built and **nothing calls them yet**.

- [19 — Build: the auction on real card holds](issues/19-build-auction.md) — **the ladder
  is real, and it cost the courtesy.** ⚠️ **Ticket 07 carried two rules that cannot both
  hold**: *an outbid hold is cancelled at once* (inherited from charting) and *at the
  close, promote the next bid that can be collected*. A runner-up with no hold cannot be
  promoted. The dev chose the ladder, so **an outbid hold stays on the card until 00:00
  UTC** and the mail and the panel say so — and a **bidder's own** earlier hold is still
  released when they raise, because a second hold on the same card can never be the next
  bid that can be collected. A bid is a Checkout Session with `capture_method: manual`,
  cards only, priced inclusive; ⚠️ its session comes back **`payment_status: unpaid`** and
  stays that way until the close, so the webhook reads the PaymentIntent instead. Opening
  a bid is **two steps like a purchase** — Turnstile on Convex, then VIES and Stripe on
  Vercel behind a bid id — because a bid has no reserve step and a single Vercel route
  would be the most floodable thing on the site. ⚠️ Three things the platform refuses:
  **`capture_before` cannot be read at the keyboard** on a hosted page, so the late-hold
  refusal moved one screen to `/bid`; **lazy closing on read is unbuildable** — a query
  cannot capture money and an unauthenticated close endpoint is a road a flood walks down
  — so one **hourly** cron is both the 00:00 close and its own retry; and the remembered
  ticket 03 fields stay **off `owners`**, which the board query reads whole, and come from
  the bidder's last order instead. Proved on staging by cancelling the top hold at Stripe
  by hand: `$150` failed, `$100` was captured **for its own amount**, and the day, the
  order and the house ad all landed. `scripts/bid.mjs` and `seed:ageAuction` exist so the
  close can be watched rather than waited for.

- [20 — Build: artwork upload, storage and delivery](issues/20-build-artwork.md) — **the
  browser makes the picture, Convex keeps it, and Vercel's edge hands it out.** Three doors
  on one rule — the Stripe session id on `/thanks`, `requireOwner` in My squares, a standing
  bid in the bid panel — each handing out two short-lived upload URLs and checking the caller
  again when the ids come back. The server's whole check is content type and byte size, and
  it **deletes a refused pair before it throws**, or rejection would be the cheapest way to
  fill the free plan's gigabyte. ⚠️ Three things ticket 09 did not price: **`s-maxage`**,
  without which Vercel's edge caches nothing and every request stays on the function;
  **`ART_CELL = 80`**, because "exactly the size the board draws" does not exist — `cell` is
  whatever the viewport allows, from 23px to 150px; and **the `4x` set costs 80 MB** unless
  it is given only to blocks in view, since a background image has no `loading="lazy"` and
  one zoom gesture would otherwise fetch all 199. Replacement deletes what it replaced unless
  something else still points at it, and a daily cron sweeps the rest — ⚠️ with
  `invoices.storageId` on the referenced list, because that file is bookkeeping and is kept
  ten years. Proved on staging four ways: a buyer with no account uploaded from `/thanks`, an
  owner replaced a picture and both old files went to 404, a $1,000 bid was dressed and won
  the banner through a real close, and the file came back `x-vercel-cache: HIT`.

- [21 — Build: counting clicks for real](issues/21-build-clicks.md) — **a block becomes a
  real link, and the count is thrown after it.** Blocks and the banner render as `<a>`, so a
  square behaves like a link everywhere a link behaves — middle-click, ctrl-click, the status
  bar, copy address, and the keyboard, which reaches the board for the first time. The price
  is in the canvas: ⚠️ **a press on a link is the one press that does not capture the
  pointer**, or the click goes to the box and the link never opens; and a pan or a wandering
  finger that ends over a block has its navigation cancelled, while a **keyboard** click
  (`detail === 0`) is let through or every one of them would be refused as a stray drag.
  ⚠️ Ticket 10 asked for a token good for 30 clicks **and** for nothing to be written down,
  and those cannot both be literal — a countdown is a row per visitor, which is an identifier
  and a time. The promise wins: a permit is a **signed expiry with no nonce**, so the board
  spends one on 30 clicks and the server enforces **two minutes**. Turnstile's script is not
  fetched until somebody clicks, so a plain board load still reaches nothing at Cloudflare.
  ⚠️ **The reset was not built**: nothing in V1.0 changes hands or splits, so it goes to V1.1
  with resale — see **Out of scope**. Driven on staging by `scripts/clicks.mjs`, which reads
  the count out of My squares, clicks three ways, drags once, and reads it again.

- [22 — Build: the mail](issues/22-build-email.md) — **the six messages are complete.**
  Five added to ticket 18's transport: order confirmed with the invoice, refunded in full,
  block removed, and the artwork reminders at 1, 7 and 30 days. Every send is an action and
  every caller schedules it, because a mutation cannot reach the network and a Resend outage
  must not undo a landed payment. Three decisions the build had to make: the **refund mail
  sits inside the success branch of `refunds.create`**, so the site never says the money is
  on its way before Stripe has taken it and a retry's `charge_already_refunded` sends
  nothing twice; the **reminders are scheduled, not swept**, each one checking the block
  before it sends, which is why no `remindedAt` column exists; and the **banner's invoice
  mail goes after `wonMail`**, which ends *your invoice follows*. ⚠️ **Stripe's own receipts
  are still on** — there is no API for it, it is a dashboard switch per mode, and it stays
  step 4 of the checklist. ⚠️ **Nothing has been sent to a real inbox yet**; that is
  [ticket 28](issues/28-prove-the-mail.md).

- [23 — Build: the invoice document](issues/23-build-invoice.md) — **built: the number is
  taken in the mutation, the file is written by the action a moment later.** Ticket 17 asked
  for the number to be allocated where the invoice row is written *and* printed inside the
  document, and a Convex mutation cannot write a file — so `allocate` → `issue` → `attach`,
  and ⚠️ **`invoices.storageId` is optional**, which is the one departure from the ticket as
  written. A row without a file is an invoice still being written and never a gap in the
  series: the number and the token are fixed and every field is frozen, so the nightly
  re-render is the same document. `2026-0001` off the `by_year` index rather than a counter
  row; refunded orders take no number; the **ECB rate** is pulled daily into the `fx` cached
  row and frozen onto the order with its publication date (verified live: 1.1662, dated
  2026-08-25). All four money cases were rendered and read, including ⚠️ the **VAT-on-top**
  one, which is the ticket's own warning answered: the net is `total − vat` from two stored
  numbers, never recomputed from a rate. Served at `/invoice/<32 hex>`, `private, no-store`
  at both ends — the opposite of `/art`, because this carries a name and an address.
  ⚠️ **The four `BUSINESS_` variables were not invented and not asked for**, so no document
  has been rendered on a deployment yet.

- [24 — Build: the admin page and removal](issues/24-build-removal.md) — **one page, one
  press, four writes in one transaction.** `/admin` behind `requireAdmin`: a search, today's
  banner, every block, the last fifty removals. Ugly, one column, works on a phone.
  `admin.strip` strips artwork **and** link, pushes the strike, writes the `removals` row
  and books the mail together — and calls ⚠️ **`release(ctx, old)`**, now exported from
  `art.ts`, because stripping is not only setting the field to null and what was reported
  would otherwise stay reachable at its `/art` URL. The strike rule as ticket 11 wrote it:
  counted on the owner, twelve-month window, the third freezes **only** the block that
  caused it, visible to the owner in the removal mail and in My squares — and silent at
  nought. The banner goes through the same door and sets `removedAt`, which the board and
  the click counter already read. ⚠️ **`ADMIN_EMAILS` is unset**, so `/admin` admits nobody
  today, including the dev.

- [27 — The resale label, and the day the board sells out](issues/27-label-and-sellout.md)
  — **the label is dropped and the sold-out day is silence.** The dev looked at three
  placements for *"When all 199 squares are sold, owners will be able to sell theirs on."*
  and took none: on a phone the top bar has no room for it, and the only placement that
  reaches a phone is a strip that costs canvas height on a board that must not scroll. So
  ⚠️ **the site now promises resale nowhere** — not the top bar, not `/terms`
  ([ticket 26](issues/26-strip-resale.md)) — and V1.1 starts from silence owing nobody a
  thing. The two recorded risks of the hard wording are retired, not carried. On the day
  `available` reaches zero, **nothing happens**: no sold-out branch on the board, the panel
  or the dock; a drag selects nothing and no panel opens. The counter needed no change — it
  already reads *"Every square is taken. The banner is still auctioned every day."* The
  banner is still the one thing a sold-out board has. One thing did change on every day:
  ⚠️ **the drag legend under the canvas is deleted** — *"Drag to select up to 4 × 4 · $250
  per square"* — so nothing now tells a first visitor the board is drag-to-select, and on a
  phone the price appears nowhere on the board screen. `TitleBlock` stays. The variants and
  the switcher are off `staging`, on the throwaway branch `prototype/27-label-and-sellout`;
  `convex/seed.ts` keeps `seed:soldout` so the full board can still be looked at.

- [29 — Which address the invoice may carry](issues/29-invoice-address.md) — **closed on
  the dev's own answer, and it was asking the wrong question.** It was raised while setting
  the `BUSINESS_` variables: the eenmanszaak is registered on the dev's home address. The
  dev's question was not *which address may I use* — they know — but **where does my address
  appear at all**, and that has one answer: ⚠️ **on the invoice, and nowhere else on the
  site.** `BUSINESS_ADDRESS` is read in one file, the document sits behind a random token
  with `private, no-store`, and no page prints an address — the site's public contact is
  `hello@200squares.com`. The exposure is *every buyer, forever*, not *the web*. The three
  research questions were dropped unasked. ⚠️ One line survives it: ticket 17's write-once
  rule freezes the address into each document at issue time, so which address goes on prod
  is a choice to make **before** the first real sale, and it is recorded on
  [ticket 28](issues/28-prove-the-mail.md).

## Not yet specified

- **A PDF invoice.** Ticket 17 stored the invoice as HTML and said no PDF at V1.0, on the
  grounds that it is legally sufficient and costs nothing. The moment a real business
  buyer's accountant asks for an attachment is the moment to revisit it. It needs a real
  complaint first.

- **The build tickets.** Every decision here is followed by building it, the way
  08-10, 12 and 15 followed their decisions on the prototype map. They are created
  as each decision lands, not before. **Done** (2026-08-25):
  [26 — Strip the resale surface](issues/26-strip-resale.md),
  [15 — Build: the Convex schema and the live board](issues/15-build-schema.md),
  [16 — Build: the checkout](issues/16-build-checkout.md),
  [18 — Build: accounts and signing in](issues/18-build-accounts.md),
  [19 — Build: the auction on real card holds](issues/19-build-auction.md) and
  [20 — Build: artwork upload, storage and delivery](issues/20-build-artwork.md) and
  [21 — Build: counting clicks for real](issues/21-build-clicks.md),
  [22 — Build: the mail](issues/22-build-email.md),
  [23 — Build: the invoice document](issues/23-build-invoice.md) and
  [24 — Build: the admin page and removal](issues/24-build-removal.md).
  **Still open**:
  [25 — The launch switches](issues/25-launch.md) holds the switches that only matter on
  the day, and [28 — Prove the mail and the invoice on staging](issues/28-prove-the-mail.md)
  is the one thing tickets 22 and 23 could not do for themselves: no message has reached a
  real inbox and no document has been rendered on a deployment.
- ⚠️ **The board view is no longer free.** [Ticket 18](issues/18-build-accounts.md) found
  that `ConvexBetterAuthProvider` calls `useSession()` for everybody, so every board load
  fetches `/api/auth/get-session` — one Vercel function invocation per visitor, where ticket
  02's static front had none. The HTML is still byte-identical and still comes off the edge
  cache, so *static* survives; *free* does not, and under a flood the invocations are what
  Hobby pauses on. Two escapes, both with a price: a **Vercel edge rewrite** of `/api/auth/*`
  straight to `.convex.site`, which moves the cost to Edge Requests but loses the header
  fix-up the Next handler exists to do; or a **signed-in marker** in `localStorage` gating
  the provider, which needs a landing route to set it on the device that opens the mail.
  It is a cost decision under ticket 02's rule, and it wants measuring before it is made.
  ⚠️ [Ticket 20](issues/20-build-artwork.md) adds a **second** invocation source to the same
  decision: `/art/<storageId>` is a Vercel function on a cache miss, and an id that does not
  exist misses every time. The regex turns obvious rubbish away without a fetch, and the
  cache absorbs every real file after the first request per region — but a flood of
  plausible-looking ids is invocations, which is what Hobby pauses on. The two belong in one
  answer: whatever protects `/api/auth/*` protects this.

- ⚠️ **Nobody tells a bidder their card was declined.** [Ticket 19](issues/19-build-auction.md)
  built the ladder: a bidder who held the top spot all day and whose capture failed at
  00:00 loses the banner and is told nothing. Ticket 13 fixed the list at **six** messages
  and this is not one of them, so adding a seventh inside a build ticket would have been
  deciding ticket 13's question somewhere it does not belong. It is a small question with a
  real answer — the outbid mail is the wrong words for it — and it wants naming before
  launch, because it is the one path where somebody loses something and hears nothing.

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
  shape as 07 → 10, 11 → 13 and 14 → 16, and it comes last. ⚠️ Ticket 16 added two
  specific debts, and ticket 18 a third — ⚠️ `/terms` still owes ticket 08's three
  sentences about a lost inbox: the email is the key, losing it is not the end, and getting
  back in means proving the payment to a person. `/privacy` must say that a **reservation
  keeps a salted hash of the visitor's address for fifteen minutes** — the price of *one hold per visitor*, and the
  first thing on the board path that is about a visitor at all — and that an **order keeps
  the IP, the tick-box wording and the address for ten years**. ⚠️ Ticket 19 adds three
  more: `/terms` says *"The highest bid at 00:00 UTC wins and is charged"*, which is now
  **false in the case the whole mechanism exists for** — it must say the banner goes to the
  highest bid that **can be collected**, and that a hold stays on the card until the close;
  `/terms` also still owes ticket 07's **mid-day pro-rata refund**, stated and never built;
  and `/privacy` must say a **pending bid keeps the same salted address hash** a reservation
  does, for the same fifteen minutes. ⚠️ Ticket 21 adds two more: `/privacy` and the FAQ
  describe a click count without saying **what it is** — counted in the visitor's browser,
  not audited, a **floor** and not a census, which ticket 10 named and left to the copy; and
  `/privacy`'s *Who else sees it* names the payment provider and Vercel but not **Cloudflare**,
  which a visitor who only clicks a block now loads a script from. Buying and bidding were
  always deliberate acts; clicking is not. ⚠️ Tickets 22 and 24 add the last of them:
  `/privacy` must say that **Resend is a processor** and that the **address is now a key**
  and not only a contact — plus the one sentence that keeps both promises true at once, that
  an email address belongs to an **owner** while the clicks promise is about a **visitor**;
  and `/terms` owes four lines — *nothing is refunded*, the freeze rule and what frozen
  means, *the site does not check where a link goes*, and `hello@200squares.com` as the
  place to report a block.
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
- **Artwork rules on the public pages.** ⚠️ Half of this is **done**: ticket 20 put the
  rules beside the picker, in all three places a picture is chosen and *before* a file is
  picked — which is where ticket 09 said no-animation had to be said. What is left is the
  public half: `/how-it-works` and the FAQ describe artwork to somebody who has not bought
  anything yet, and they say nothing about WebP, 10 MB or the crop. It rides with
  **making the copy true again**.

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
  and carries its own risk. ⚠️ **One rule left with it, quietly**: the click count resetting
  when a block changes hands, and landing whole on the largest remaining piece of a part
  sale. [Ticket 21](issues/21-build-clicks.md) found that nothing in V1.0 can fire it —
  `blocks` is inserted by the webhook and never deleted, re-owned or cut, and removal freezes
  a block with its owner — so it was not built. The rule and its tiebreak stand as ticket 10
  wrote them and V1.1 starts from them.
- **A price that moves with scarcity.** Fixed at $250. It is a product
  decision, not a build decision, and it may wait until scarcity is real.
- **Marketing, launch and traffic.** The map ends at a site that can be launched.
- **Other currencies, other boards, an API, a mobile app.**
