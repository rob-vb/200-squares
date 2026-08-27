# Map: 200 squares — design & frontend prototype

Label: wayfinder:map

## Destination

A clickable frontend prototype of 200 squares, viewable on a Vercel preview URL: Next.js + TypeScript + Tailwind, all data mocked in the browser. The canvas (16 x 14 cells, 5 x 5 banner top-left), zoom/pan, block selection up to 4 x 4, fake buy + image upload, the daily banner auction with countdown, fake sign-in with "My squares", and the pages beside the board — How it works, About, Terms, Privacy. No backend and no real payment. Selling a square on is part of it: ticket 11 made the grid a market, and tickets 12-13 build and describe it. Click counters are part of it too: ticket 14 decided them, ticket 15 built them, and ticket 16 makes the copy true.

## Notes

- Domain: product design + frontend. Design-first: the look and the feel of the canvas decide everything else.
- **This map builds.** Execution is part of the effort: tickets 08-10 write the real prototype in this repo. Planning tickets still resolve as decisions.
- Keep it informal. Short tickets, short answers, no ceremony.
- Skills to consult per session: `frontend-design`, `mattpocock-skills:prototype`, `mattpocock-skills:grilling`, `mattpocock-skills:domain-modeling`.
- The dev works on a VPS, so nothing can be viewed locally. Every visual check happens on a Vercel preview URL.
- The user speaks Dutch; write to them in Dutch, ASD-STE100 style. The product UI is English, prices in USD.
- Vocabulary lives in `CONTEXT.md` at the repo root.

### Fixed by charting (2026-08-20)

- Grid 16 x 14. Banner is a fixed 5 x 5 block top-left. 199 squares + 1 banner = 200.
- DOM grid (divs + CSS grid), zoom 1x-4x via a single transform. Wheel, pinch, buttons, double-click. Pan only when zoomed, clamped to bounds.
- Selection: contiguous rectangle, max 4 wide and 4 high (1 x 4 allowed). Drag or shift-click. One block renders as one image.
- Square states: `available`, `pending`, `taken`. Price $100 per square, flat.
- Click on a taken square or on the banner opens the owner's website in a new tab. Tooltip (mouse only) shows number + status; on touch a tap selects and opens the sheet.
- Auction: bid today for tomorrow's banner, closes 00:00 UTC. Auction control lives in the top bar and never covers the banner image. With no winner, the banner shows a house ad ("You could have this spot").
- Top bar: wordmark "200 SQUARES", auction block (countdown + top bid + Bid), sign-in / My squares.
- Detail panel: right-hand panel on desktop, bottom sheet on mobile. Fake checkout with company name, website URL, real client-side image preview.
- Below the fold: How it works, The daily banner, price & terms, FAQ + contact, plus a strip of past banner winners. (Ticket 10 moved all of it off the board page and onto `/how-it-works`, linked from the top bar.)
- Three rough visual directions first, then pick one. Quiet canvas, loud auction.

## Decisions so far

<!-- one line per resolved ticket -->

- [01 — Three visual directions for the canvas](issues/01-visual-directions.md) — **Register** wins: muted paper ground, near-invisible grid so owner artwork is the only colour, Anton + Archivo, and the auction docked as a magenta card instead of living in the top bar.
- [05 — Design tokens and the square states](issues/05-design-tokens.md) — the seven colour tokens, Anton/Archivo/Roboto Mono, a soft two-layer depth scale, themed browser surfaces and every square state, live in `src/app/globals.css`. Secondary text is mixed from the ink and passes contrast; there is no hard offset shadow, no eyebrow and no tracked uppercase micro-label anywhere.
- [04 — Vercel project with working preview deploys](issues/04-vercel-preview.md) — `rob-vb/200-squares` is live on Vercel; a push to a branch gives a public URL at `200-squares-git-<branch>-robs-projects-52973834.vercel.app`. Commit as `hi@robvb.com` or the deploy is blocked.
- [02 — Canvas feel: zoom, pan, selection](issues/02-canvas-feel.md) — **Direct** wins: selection owns the primary drag at every input, panning is asked for (space or middle drag, two fingers). Hand-rolled single transform, not a library; scale and pan in one state; wheel listener registered by hand. Fit is contain, so a phone is width-bound at a 24px square and a desktop is height-bound at 60px.
- [03 — Data shapes and the two mock datasets](issues/03-data-shapes.md) — blocks are the only record and every square state is derived from them; the banner is its own type, owners exist once and are referenced by id, artwork is one union of mock-colour and uploaded image. No absolute dates: a `dayOffset` and `minutesBeforeClose` resolve against the next 00:00 UTC. The dataset is only a seed for a reducer, so buying and bidding really change the board. `early` and `full` switch on `?data=`, default `full`, and the model lives in `src/lib/board/`.
- [08 — Build: app skeleton and canvas](issues/08-build-canvas.md) — the real prototype is on `main`: `src/lib/board/` holds the model and the two datasets, `src/components/` the first screen. Direct wins on the real board and needs no inertia. Three earlier decisions were corrected by building: the seam belongs in the hit-testing maths (a phone square is 23px, not 24), a bid stores `minutesAgo`, and the block edge is removed entirely — the seam is the whole grid.
- [06 — Detail panel and the flows](issues/06-panel-and-flows.md) — one surface, one flow at a time, and the canvas never resizes. (The reserved desktop column was corrected by ticket 09: the panel slides in and the board re-centres. 1280px survives as the side-panel / bottom-sheet breakpoint.) Buying needs no sign-in, is one screen, and artwork is optional so the flow can really produce `pending`; choosing a file previews it on the canvas before confirming. Bidding keeps top bid + $10 and a single fake rival outbids the visitor once, ~20s later. Sign-in stays a one-click toggle.
- [07 — Content and copy below the canvas](issues/07-below-the-fold.md) — compact, no pitch line: a live `142 SQUARES LEFT` counter opens the page and takes `Available` out of the legend, then what-you-get, how-it-works, the daily banner with the past-winners strip (winning bids public), a six-question FAQ and one name. Squares are permanent and pay-once; artwork and link stay editable; link shorteners are out but tracking parameters are in, because there are no visitor statistics and the copy says so.
- [09 — Build: flows and fake sign-in](issues/09-build-flows.md) — the flows are on `main`: buy, bid, sign in and My squares all run in one panel, and the reducer really changes the board. Two earlier decisions were corrected by building: the reserved panel column is gone (the panel slides in, the board re-centres instead of shrinking), and the link belongs to the block, not to the owner.
- [10 — Build: the pages beside the board](issues/10-build-content.md) — ticket 07's page is `/how-it-works`, and `/about`, `/terms` and `/privacy` are built beside it; the links live in the top bar and in every page's footer. The board page carries nothing under it and does not scroll, so ticket 02's wheel zoom is restored whole. The dataset is a server-side read per page, and every link carries `?data=` on. Contact is @the_robvb on X, not an address.
- [11 — Selling a square on](issues/11-resale.md) — the grid becomes a market: the owner sets the price, the site moves the money and keeps 10%, and listing is free. (Ticket 12 reversed two answers by building: the price is per square with a $1 floor, not one price per block with a $100 floor, and the buyer drags out any rectangle instead of the owner choosing one straight cut.) For sale is a property of the **block**, not a fourth square state, and it is shown by a `For sale (n)` switch that is off by default, never by a mark over paid-for artwork. A sold block arrives `pending` — no artwork, no link. Splitting is a straight cut and happens on sale, not on listing; blocks never merge. No handing a square back. "Permanent" stands untouched: it was always a promise about what the site does.

- [12 — Build: the resale market](issues/12-build-resale.md) — the market is on `main`: a listing is a rectangle of a block plus a price **per square**, the buyer drags any rectangle out of it down to one square, and the switch lives in the top bar. Selling part of a block leaves the seller up to four blocks with the artwork cropped to each, and whatever the buyer left stays on the market at the same rate. Three decisions were corrected by building — the straight cut, the $100 floor, and where the switch stands.

- [13 — The copy for resale](issues/13-resale-copy.md) — the pages beside the board describe the market. The FAQ grows to nine: the sell question is now yes and carries the seam a part sale leaves through the seller's own image, and a new buy question gives the `For sale` switch the words it never had. `Why 4 × 4 at most?` stops claiming it stops a takeover — the limit is on one image. `/terms` gets a **Selling your square on** section written from the sale rather than from one party, and it is where "no handing a square back" is stated. Three more untrue lines were found by reading the rest: the counter's pitch line, `/about`'s "once, at $100 each", and `/privacy`'s silence about a seller. The market view is deliberately undescribed — the switch is off by default and one click undoes it. Then the dev amended it: `What happens if the site goes down?` is gone from the FAQ along with the same doubt in `What you get` and `/about`'s warning frame — the risk keeps `/terms`, where saying what is not promised is the page's job, and leaves the two pages that sell. And sell-out stopped being a dead end: both the FAQ answer and the `SOLD OUT` counter line now point at the market, which is the one moment it is the only way in.

- [14 — Traffic numbers for owners](issues/14-traffic-numbers.md) — the site counts **clicks**, and nothing else: no impressions, no visitors, nothing kept about anybody. Two numbers with two jobs — a per-block count only its owner sees, on the row in My squares, and one public site total under the counter on `/how-it-works`, which names no owner. The count belongs to the block under one owner: artwork and link may change and it runs on, and it returns to zero on one event only, the block changing hands — so a resale buyer starts at zero and never sees the seller's number. Total since purchase, no window and no graph, because the model has no dates and gains none. `clicks` on `Block` and `BannerDay`, seeded wide and really incremented by the reducer. `/privacy` keeps all three of its promises and loses one line: *"There are no visitor statistics here at all"*. Tickets 15-16 build it and make the copy true.

- [15 — Build: click counters](issues/15-build-clicks.md) — the counters are on `build-15-clicks`: `clicks` on `Block` and `BannerDay`, seeded wide in both datasets and really incremented by `follow()`, with the owner's number on the block's row in My squares and one public total under the pitch on `/how-it-works`. Two things ticket 14 left open were settled by building: the viewer had to be given a past banner day, or the banner half of My squares is unreachable in a demo where the auction closes at 00:00 UTC; and a part sale does not divide the seller's count — it lands whole on the largest piece they keep, because the site never knew which square was clicked and any split would be invention that also multiplies the public total.

- [16 — The copy for click counters](issues/16-clicks-copy.md) — the copy is true. The FAQ turns `Do I get traffic numbers?` from no to yes in four sentences and **gains no question**: the dev's rule is that it answers only what a buyer really asks, so the two facts that no longer fit — only the owner sees it, and there is no graph — moved to `/privacy` and turned out to belong there, as promises to the visitor rather than product detail. `/privacy` loses *"There are no visitor statistics here at all"* and the sentence leaning on it, and gains a **What it counts** section placed *before* **What it does not do**, because admitting a count under a "does not" heading is the softening this ticket forbids; the three real promises are untouched. `/terms` keeps the promise half and drops "reported": a count is a record of what happened, not a promise of what will. `What you get` names the counter as part of what $100 buys, and the tracking-parameters advice survives reworded — the site owns the click, the owner owns what happens after it. Five more untrue or silent lines were found by reading the rest, including `/terms`' part-sale paragraph, which said nothing about the count landing whole on the largest piece the seller keeps. The two live numbers stay bare on purpose; `/about` never lied and was left alone.

## Not yet specified

- Auth provider once a backend exists (Clerk, Supabase, something else) — the prototype fakes the session.
- Anti-snipe rules for the auction (last-second bids, extension window, minimum increment beyond the $100 floor). Ticket 03 uses top bid + $10 as a prototype placeholder only.
- Requirements for supplied artwork: file size, aspect ratio per block size, formats, animation.
- Archive page for past banner winners — `/how-it-works` shows the record the dataset holds, and nothing older.
- SEO and share images.
- Pricing model if squares get scarce, and what happens to the last squares.
- What a real resale needs once money is real: escrow between two strangers, payouts to sellers, refunds, tax on the site's 10%. Ticket 11 ruled all of it prototype-only; it belongs with **Real payment** below.
- Whether an owner whose block was cut apart can put the pieces back together, or replace the artwork across them at once. Ticket 12 leaves them holding up to four blocks with one image sliced between them, and blocks never merge — so today the answer is: replace each block's artwork one at a time.
- Whether a block shows what it last sold for, and whether the market has a price record the way the banner has one.
- Whether an owner's count should survive a cut they made themselves. Ticket 15 puts it whole on the largest piece a part sale leaves, which is right for a sale; an owner who splits their own block for their own reasons has no such event to hang it on, and today there is no way for them to do that at all.
- Filtering a click count once a backend exists: the same visitor clicking ten times, and bots. Ticket 14 accepted a rough number on purpose — no trace per visitor — so this is a question for the day the site keeps anything at all, and it lands next to **Real payment** below.
- A click count over time — per day, a window, a graph. It needs dates in the model, and
  ticket 14 refused to add them for a prototype counter. Ticket 16 raised the cost of
  changing that: `/privacy` now states the absence of a timestamp as a promise to the
  visitor — *no time is written down* — so a graph is no longer only a modelling change,
  it is a promise withdrawn.

## Out of scope

<!-- Resale left this list on 2026-08-24 and did not come back: ticket 11 made it part of the product. -->

- Real payment (Stripe or otherwise) and invoicing.
- Real authentication and accounts.
- Backend, database, image storage, cron for the 00:00 UTC rollover.
- Moderation of uploaded artwork and links.
