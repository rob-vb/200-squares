# Context: 200 squares

Glossary only. No implementation detail.

## Canvas

The field of 16 x 14 cells that fills the first screen. It is one visual surface, not a page section: it scales from phone to desktop and can be zoomed and panned on its own.

## Square

One cell of the canvas, sold for $100. There are 199 squares, numbered 1 to 199, reading left to right and top to bottom around the Banner. A square carries a state: `available`, `pending` or `taken`.

## Banner

The fixed 5 x 5 area in the top-left of the canvas. It is not for sale. Its occupant changes every day and is decided by the Auction. Banner + squares = 200, which names the product.

## Block

A contiguous rectangle of squares bought together, at most 4 wide and 4 high. A block renders as **one** image: the grid lines inside it disappear. A single square is a 1 x 1 block.

## Owner

The party that bought a block or won the banner. An owner supplies artwork and a link. A click on their block or banner opens their website.

## Auction

The daily contest for the Banner. Bidding runs through the day for **tomorrow's** banner and closes at 00:00 UTC. Bidding starts at $100.

## Auction day

The window between two 00:00 UTC boundaries. The winner of yesterday's auction occupies the banner for the whole of today.

## Bid

An offer on the Banner for tomorrow. The highest bid at 00:00 UTC wins.

## House ad

What the Banner shows when nobody has won it: a message inviting the first bid, not an empty area.

## Square states

- `available` — for sale. Shows its number.
- `pending` — paid for, artwork not supplied yet. Not the same as empty: an unmarked pending square reads as a bug.
- `taken` — artwork and link in place.

## Detail panel

The single surface that shows detail and holds every flow: a right-hand panel on desktop, a bottom sheet on mobile. Selecting squares, buying, bidding and My squares all use it. Nothing else covers the canvas, and nothing ever covers the banner artwork.
