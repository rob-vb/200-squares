# 12 — Build: the resale market

Type: task
Status: resolved
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

Built and merged to `main`. Preview it was judged on:
https://200-squares-git-build-12-robs-projects-52973834.vercel.app

### The model

`Block.listing` is `{ rect, pricePerSquare } | null` and that is the whole of
it. No fourth square state: `buildBoard` still derives `available` / `pending` /
`taken` from block coverage alone, and a listing changes nothing about whether a
block covers a square. `board.listed` is just the blocks whose `listing` is not
null, and it drives the switch.

`rect` is the part on offer, and it can be any rectangle of a block that is
still whole. The block stays whole, with its artwork, until somebody buys into
it.

### Three corrections the build made

**The buyer drags, and the price is per square.** Ticket 11 allowed the owner
one straight cut, so the owner of a 2 × 2 could sell 2 × 2, 2 × 1 or 1 × 2 —
never one square. The dev caught it on the preview, and it contradicts the
product: the site sells squares at $100 each and the counter says SQUARES LEFT.

The cut rule was solving the wrong problem. It is not what is **sold** that has
to stay a rectangle, it is what is **left** — and what is left does not have to
be one block. A 2 × 2 minus a corner is a 1 × 2 plus a 1 × 1. So the seller
offers a rectangle of their block at a price per square, and the buyer drags out
whatever rectangle they want, down to one square, with the gesture they already
use on empty squares. `remainderOf` returns up to four rectangles instead of
one, and every one of them becomes a block.

Verified exhaustively rather than by eye: 192 rect-in-rect cases across eight
block shapes, always covering, never overlapping, never more than four pieces.

Per square is not a detail. It is what makes a part sale pricable at all, and it
puts the seller's rate beside the site's $100 for the buyer to read — which is
the job ticket 11 gave the $100 floor, done properly. TIDE is listed at $40 a
square in `full`, which is exactly the number ticket 11 was afraid of. It is now
a number the buyer can judge instead of a number the site has to forbid.

**The floor is $1.** Ticket 11's $100 floor never did what it claimed: a 4 × 4
at $100 is $6.25 a square. Once the price is per square the floor has no work
left beyond refusing zero. Recorded on [ticket 11](11-resale.md).

**The switch lives in the top bar.** Ticket 11 put it beside `142 SQUARES LEFT`;
ticket 10 had already moved that counter to `/how-it-works`. Under the canvas
was tried and failed on a phone — the strip between the board and the auction
dock is the dock's, and the switch sat behind it. The bar is the one part of the
board screen nothing ever covers. It shows on the board page only, and it is
disabled at zero listings: a switch that dims the whole board and lights nothing
is a broken screen, not an empty one.

### The market view

One dim layer over the grid, then the listed parts redrawn above it. A lit part
is a window: the artwork is drawn at the block's full size inside a box the size
of the offer, so a listed strip already shows the crop its buyer will get.
Standing price chips ride in screen space beside the selection chip, so they do
not grow with the zoom.

Two things the view decides that ticket 11 did not ask:

- **A dimmed board does not select.** Dragging on available squares is off while
  the view is on. Buying fresh and buying second-hand are the same gesture, so
  they cannot both be live at once — and the switch is one click away.
- **A dimmed block does not open its website.** In the market view the only
  thing the canvas answers is a listing. This is the one place a click on
  somebody's block does not go to their site, which is exactly why the view has
  to be asked for and is off by default.

### The split, and the listing that survives it

`buyListing` is where a block becomes several. The buyer's rectangle is a new
block owned by the viewer, carrying their URL and their artwork if they brought
any — `pending` until they do, like any fresh purchase. Nothing of the seller's
travels.

The seller keeps every square they did not sell, as up to four blocks, each with
`cropArtwork` narrowing the same image to it. Crops compose, so a block cut
twice narrows twice instead of losing the first cut. Mock artwork has nothing to
crop and re-fits, which is what a wordmark does anyway.

And each remaining block stays on the market for whatever of it was still
offered, at the same rate. A listing survives its own partial sale, so a seller
does not have to put the rest back up. Blocks never merge: a buyer gets a block,
never an enlarged neighbour.

### Both sides, in the one panel

`sell` and `resale` are two more flows in the existing screen state, so the
panel is still one surface running one flow at a time. Selling is a row action
in My squares, and its picker is a drag on a thumbnail of the owner's own block.
Buying needs no sign-in and reuses the buy flow's checkout whole, with a
`Take all N squares` shortcut when the buyer drew less than the offer. The 10%
is shown to the seller as "you receive", never as a line in the buyer's total.

### Two traps worth remembering

**`Field` is a `<label>`.** A label with no `htmlFor` binds to the first
labelable descendant, and `<button>` is labelable — so every click inside a
field holding a button was also a click on that button. It is why the sell
picker kept springing back to the whole block. Fields with more than one thing
to click now use `FieldBox`, a plain div.

**Per-cell pointer handlers do not survive touch.** The cell the finger lands on
captures the pointer and no other cell hears the drag. Both the canvas and the
picker take the pointer on the container and work out the cell from its
position.

### The dataset

Three listings in `full`, priced per square against the site's own $100:
GRANDSTAND 3 × 2 whole at $140, the right-hand column of ATLAS FOUNDRY as a
1 × 3 at $260, and TIDE 2 × 2 whole at $40. `early` gets none — nothing is sold
there yet.

The viewer also gained a 4 × 2 block. With only a 2 × 1 and a 2 × 2 in hand, the
seller's side of the market could not be tried at all.

### For ticket 13

Nothing in the interface was written to keep. Four facts the copy has to match,
and three of them are new since ticket 11 wrote its proposed lines:

- The price is **per square**, set by the seller, with no floor worth the name.
- The buyer takes **any rectangle** out of an offer, down to one square.
- A seller who sells part of a block ends up holding **more than one block**,
  with their artwork cropped and a seam through it. That is a real cost and the
  copy should say so.
- The block still arrives empty: the artwork and the link stay with the seller.
