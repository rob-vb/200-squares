# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Anyone who wants a durable, visible link to their own website on a board people are watching. Four segments, all in scope at the same time — the board is deliberately not aimed at one of them:

- **Indie makers and small SaaS** — smallest budgets, largest number of buyers.
- **Crypto and web3 projects** — largest budgets, loudest artwork.
- **Local and small businesses** — buy once, grasp the idea immediately.
- **Brands and agencies** — buy a large block as a stunt, and want the banner.

The buying situation is FOMO: the board fills, and what is taken is off the market. A buyer supplies artwork and a URL; their block sends a click to their site. The link is part of what they are paying for, not a side effect.

## Product Purpose

Sell 199 squares at $250 each on a fixed 16 × 14 canvas, plus one 5 × 5 banner that is never for sale and changes every day through an auction. Success is a full board — 199 squares sold — with a banner auction that has a winner most days.

## Positioning

**Scarcity is the claim.** The board is finite and countable: 199 numbered squares exist, and a taken square is off the market. A buyer is not renting an impression, they are taking one of a countable set of places.

The daily banner auction is the moving part on top of that fixed scarcity. The 199 squares are slow and finite; the banner is fast and contested. Two speeds on one board.

The ancestor is the Million Dollar Homepage, which froze and filled with dead links. The daily auction is what keeps this board alive after the squares run out.

## Operating Context

- The product today is a **frontend prototype only**. All data is mocked in the browser. There is no backend, no payment, no accounts, no image storage.
- Development happens on a VPS with no local browser. Every visual check happens on a Vercel preview URL. Vercel project `200-squares`, scope `robs-projects-52973834`; a branch push produces a public preview URL.
- Commits must be authored as `hi@robvb.com` or the Vercel deploy is blocked.
- The effort is planned as a wayfinder map at `.scratch/200squares-frontend/map.md`, with decision tickets in `.scratch/200squares-frontend/issues/`. Product and design decisions are recorded there, one per ticket.
- Domain vocabulary lives in `CONTEXT.md`.

## Capabilities and Constraints

Confirmed:

- The canvas is 16 × 14 cells. The banner is a fixed 5 × 5 block in the top-left and is never for sale. 199 squares + 1 banner = 200, which names the product.
- A square costs $250, flat. Prices are in USD.
- Squares are bought as a contiguous rectangle, at most 4 wide and 4 high. A block renders as one image; the grid lines inside it disappear.
- A square carries one of three states: `available`, `pending`, `taken`. A `pending` square is paid for but has no artwork yet, and must never read as empty.
- The banner auction runs through the day for **tomorrow's** banner and closes **hard** at 00:00 UTC: no extension window, and the minimum raise is $10 over the top bid. Bidding starts at $100. With no winner the banner shows a house ad.
- Clicking a taken block or the banner opens the owner's website in a new tab.
- The product UI is English.
- **Artwork**: the buyer may hand over PNG, JPEG, WebP or GIF, up to 10 MB. The site stores WebP only, at the size the board draws. **Nothing animates** — a GIF keeps its first frame. Any shape is accepted and the site crops to the block, centred, with a drag to reposition; refusing one of sixteen shapes would be hostile.
- **The stack**: Better Auth for accounts, Stripe for payment, Convex file storage for images, served through 200squares.com and never straight from Convex.

Undecided, and not to be invented:

- **How long a square is held** — forever, or a term. Ticket 07 settles the terms copy.
- **Whether owner links are followed or nofollowed.** Buyers say they want a link to their site, so this is a product promise, not a technical detail.
- What happens when squares get scarce, and what the last squares cost.

**A square cannot be sold on. That is V1.1.** V1.0 launches without resale: a square is bought once and stays with its owner, and the site offers no way to hand it back. The prototype had resale and it was taken out again on 2026-08-25 — a smaller build, and scarcity gets to work before a second-hand market softens it. The vocabulary is kept in `CONTEXT.md` under **Not in V1.0**, and the research that priced it is ticket 01 on the V1.0 map.

The one place the plan appears to a visitor is a small line in the top bar, which promises resale *when all 199 squares are sold* and nowhere else. `/terms` states today only: no resale, no way back.

Out of scope for V1.0: resale of any kind, a price that moves with scarcity, other currencies, other boards, an API and a mobile app.

## Brand Commitments

- Name and wordmark: **200 SQUARES**.
- The product UI is English and prices are in USD. Project conversation with the dev is in Dutch.
- Reference for *energy*, not for style: outbid.lol.
- This is small but real. There are meant to be actual buyers, but it is not being built into a company, and it is allowed to stop.

## Evidence on Hand

There is none, and that is a hard constraint.

- No visitors, no traffic numbers, no sold squares, no past banner winners, no customers, no press.
- The prototype's mock datasets are mock. They must never be presented as real sales or real winners.
- Future work must not fabricate visitor statistics, testimonials, case studies or logos. Ticket 07 states this explicitly: the copy has to sell without proof.
- What does exist: the design direction and its state sheet, on throwaway preview branches `proto-01` and `proto-05`.

## Product Principles

1. **Scarcity is the product.** Everything must make the countable, shrinking supply visible and felt.
2. **The owner's artwork is the surface.** The interface must never compete with what buyers paid for.
3. **Two speeds on one board.** The 199 squares are slow and finite; the banner is daily and contested. Both must be legible at once.
4. **A square is a place, not an impression.** No tracking claims, no per-click promises, no metrics language.
5. **Claim nothing that does not exist.** No numbers, customers or proof until there are some.
