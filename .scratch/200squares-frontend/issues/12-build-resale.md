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
