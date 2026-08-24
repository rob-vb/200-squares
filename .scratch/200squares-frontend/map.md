# Map: 200 squares — design & frontend prototype

Label: wayfinder:map

## Destination

A clickable frontend prototype of 200 squares, viewable on a Vercel preview URL: Next.js + TypeScript + Tailwind, all data mocked in the browser. The canvas (16 x 14 cells, 5 x 5 banner top-left), zoom/pan, block selection up to 4 x 4, fake buy + image upload, the daily banner auction with countdown, fake sign-in with "My squares", and the pages beside the board — How it works, About, Terms, Privacy. No backend, no real payment, no resale market.

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

## Not yet specified

- Auth provider once a backend exists (Clerk, Supabase, something else) — the prototype fakes the session.
- Anti-snipe rules for the auction (last-second bids, extension window, minimum increment beyond the $100 floor). Ticket 03 uses top bid + $10 as a prototype placeholder only.
- Requirements for supplied artwork: file size, aspect ratio per block size, formats, animation.
- Archive page for past banner winners — the prototype only shows a strip.
- SEO and share images. (Visible traffic proof is answered for now: ticket 07 says there are none and points owners at their own tracking parameters.)
- Pricing model if squares get scarce, and what happens to the last squares.

## Out of scope

- Resale market for squares — its own effort (listing, transfer, pricing).
- Real payment (Stripe or otherwise) and invoicing.
- Real authentication and accounts.
- Backend, database, image storage, cron for the 00:00 UTC rollover.
- Moderation of uploaded artwork and links.
