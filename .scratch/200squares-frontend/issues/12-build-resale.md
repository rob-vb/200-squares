# 12 — Build: the resale market

Type: task
Status: open
Assignee: rob-vb (claimed by agent session)
Blocked by: —
Parent: ../map.md

## Question

Build what ticket 11 decided: a block its owner can put up for sale, and a
visitor can buy, without leaving the panel.

Read [ticket 11's Answer](11-resale.md) — it is the source, not a summary to
rewrite. What it asks for:

- **A listing on the block.** An asking price, floor $100, no ceiling. Not a
  fourth square state: `available`, `pending` and `taken` stay the only three,
  and stay derived from blocks (ticket 03).
- **The `For sale (n)` switch**, off by default, beside the `142 SQUARES LEFT`
  counter. On: everything else dims, listed blocks light up. Off: the canvas is
  exactly what it is today, with nothing painted over anyone's artwork.
- **Listing, in My squares.** Pick the whole block or a sub-rectangle of it, set
  a price, list it. Change the price or withdraw at any time.
- **Splitting on sale, not on listing.** A listed part-block stays whole and
  keeps its artwork until it sells. On sale it splits — both parts must be
  rectangles — the sold part goes `pending` to the buyer, the seller's part keeps
  its artwork cropped to the new rectangle.
- **Buying a listing.** No sign-in, the same fake checkout as a fresh buy
  (ticket 06). The 10% share is the site's; show it to the seller, not as a line
  in the buyer's total.
- **Three listings in the `full` dataset**, so the switch does something before
  anyone signs in. `early` gets none — nothing is sold there yet.
- **Blocks never merge.** A buyer who owns the neighbour ends up with two blocks.

The reducer really performs it, like every other flow: the board changes.

Copy is **not** this ticket — that is 13, and it is written after this is built.
Anything this ticket has to say in the interface, say plainly and expect 13 to
rewrite it.

Check it on a Vercel preview before it lands; nothing can be seen locally.

## Resolution (2026-08-24)

Built on branch `build-12`, preview
https://200-squares-git-build-12-robs-projects-52973834.vercel.app

### The model

`Block.listing` is `{ rect, price } | null` and that is the whole of it. No
fourth square state: `buildBoard` still derives `available` / `pending` /
`taken` from block coverage alone, and a listing changes nothing about whether a
block covers a square. The switch reads `board.listed`, which is just the blocks
whose `listing` is not null.

`rect` is what is for sale, and it can be a strip of a block that is still
whole. That is the shape ticket 11's split-on-sale rule needs: a window on a
block, not a block.

The straight-cut rule lives in four functions in `geometry.ts` and nowhere else —
`cutPart`, `maxCut`, `cutSides`, `remainderOf`, with `cutOf` reading a listing
back into the cut that made it. The picker can only express a side and a depth,
so an L cannot be built, typed or stored.

### Two corrections the build made

**The floor is $1, not $100.** Ticket 11 gave the $100 floor the job of stopping
second-hand blocks undercutting the site's $100 a square. It does not do that
job: a 4 × 4 at $100 is $6.25 a square. The only floor that would work is $100 a
square — the seller's own cost — and that is the site pricing somebody else's
block. The dev's call went the other way: the price is the seller's, all of it.
$1 only stops a price of nothing. Recorded on [ticket 11](11-resale.md).

**The switch stands beside the legend, not beside the counter.** Ticket 11 put
it beside `142 SQUARES LEFT`. Ticket 10 had already moved that counter off the
board and onto `/how-it-works`. A control that changes the canvas has to stand
where the canvas is, so it sits in the status row under the board, next to
`TitleBlock`. It is disabled at zero listings — a switch that dims the whole
board and lights nothing is a broken screen, not an empty one.

### The market view

One dim layer over the grid, then the listed parts redrawn above it. The lit
part is a window: the artwork is drawn at the block's full size inside a box the
size of the part, so a listed strip shows exactly the crop its buyer will get.
Price chips ride in screen space beside the selection chip, so they do not grow
with the zoom.

Two things the view decides that ticket 11 did not ask:

- **A dimmed board does not select.** Dragging on available squares is off while
  the view is on. A bright selection rectangle over a dimmed board contradicts
  what the dimming says the view is for, and the switch is one click away.
- **A dimmed block does not open its website.** In the market view the only
  thing the canvas answers is a listing. This is the one place a click on
  somebody's block does not go to their site — which is exactly why the view has
  to be asked for and is off by default.

### The split

`buyListing` is where a block becomes two. The sold part is a new block owned by
the viewer, carrying the buyer's URL and their artwork if they brought any —
`pending` until they do, like any fresh purchase. Nothing of the seller's
travels. The seller's remainder keeps the same artwork with `cropArtwork`
narrowing its window; windows compose, so a block cut twice narrows twice
instead of losing the first cut. Mock artwork has nothing to crop and simply
re-fits, which is what a wordmark does anyway. Blocks never merge: the buyer
gets a block, never an enlarged neighbour.

### Both sides, in the one panel

`sell` and `resale` are two more flows in the existing screen state, so the
panel is still one surface running one flow at a time. Selling is a row action
in My squares; buying a listing needs no sign-in and reuses the buy flow's
checkout whole. The 10% is shown to the seller as "you receive", never as a line
in the buyer's total.

### The dataset

Three listings in `full`: GRANDSTAND 3 × 2 whole at $850, the right-hand column
of ATLAS FOUNDRY as a 1 × 3 at $400, and TIDE 2 × 2 whole at $150 — under what
it cost, which the $1 floor now allows and which the switch should show. `early`
gets none: nothing is sold there yet.

### For ticket 13

Nothing in the interface was written to keep. Two places name numbers 13 has to
match: the sell flow says the price is the seller's with no floor worth the
name, and the resale flow says the block arrives empty because the artwork and
link stay with the seller.
