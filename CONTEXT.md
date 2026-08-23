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

A block is the thing that is bought and owned. A square is never owned on its own: it is `taken` or `pending` because a block covers it.

## Owner

The party that bought a block or won the banner. An owner supplies artwork and a link. A click on their block or banner opens their website.

One party is one owner, however many blocks they hold. A square owner and a past banner winner can be the same owner.

## Artwork

The image an owner supplies for a block or for the banner. One image covers the whole block. A block without artwork is `pending`; artwork is what turns it `taken`.

## Auction

The daily contest for the Banner. Bidding runs through the day for **tomorrow's** banner and closes at 00:00 UTC. Bidding starts at $100.

## Auction day

The window between two 00:00 UTC boundaries. The winner of yesterday's auction occupies the banner for the whole of today.

## Banner day

One day of banner occupancy: which owner held it, with which artwork, and the bid that won it. Today's banner day is on the canvas. Past banner days are the strip of past winners.

## Bid

An offer on the Banner for tomorrow. The highest bid at 00:00 UTC wins.

## Top bid

The highest bid so far on the running auction. It is not a separate thing that gets set: it is simply the largest bid placed. Being outbid means a higher bid arrived.

## House ad

What the Banner shows when nobody has won it: a message inviting the first bid, not an empty area.

## Square states

- `available` — for sale. Shows its number.
- `pending` — paid for, artwork not supplied yet. Not the same as empty: an unmarked pending square reads as a bug.
- `taken` — artwork and link in place.

## Detail panel

The single surface that shows detail and holds every flow: a right-hand panel on desktop, a bottom sheet on mobile. Selecting squares, buying, bidding and My squares all use it. Nothing else covers the canvas, and nothing ever covers the banner artwork.

## Dataset

One complete mock board the prototype runs on. There are two: **early**, a nearly empty board with an unsold banner, and **full**, a board about 70% sold with a banner winner and past winners. A dataset is never real: it holds no real sale, no real owner and no real winner.

## Viewer

The person looking at the board. Signed out, the viewer is a stranger. The fake sign-in makes the viewer one of the owners in the dataset, which is what fills My squares.
