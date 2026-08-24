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

A block carries its own link. A click anywhere on it opens that address.

A block can be **split**, but only with a straight cut: both parts have to stay rectangles. A 4 x 4 splits into 4 x 2 and 4 x 2, never into a corner of 2 x 2 and the L around it. Blocks never merge: two blocks side by side stay two blocks, however they were bought, because each holds its own artwork and its own link.

## Owner

The party that bought a block or won the banner. An owner supplies artwork and a link for each thing they hold.

One party is one owner, however many blocks they hold. Nothing limits how many blocks one owner may hold: the 4 x 4 limit is about one **image**, not about one owner's share of the canvas. A square owner and a past banner winner can be the same owner. An owner has no link of their own: the link belongs to the block or the banner day, so one owner can send each of their blocks somewhere else.

## Artwork

The image an owner supplies for a block or for the banner. One image covers the whole block. A block without artwork is `pending`; artwork is what turns it `taken`.

## Listing

A block its owner offers for sale, with an asking price. A listing is not a state of a square: the squares under it stay `taken`, because the block still covers them. It lasts until it sells or the owner withdraws it, and the price can be changed while it stands.

The word is for the model. What a viewer reads is **For sale**.

## Asking price

What the owner of a Listing wants for the block. It is theirs to set, whatever they set it to: the only floor is $1, which exists to stop a price of nothing and not to defend the site's own $100. What a block is worth second-hand is the seller's business. On a sale the site keeps 10% and the rest is the seller's.

## Resale

A block moving from one owner to another through this site. The buyer needs no account, the same as a first purchase. A resold block arrives **empty**: the artwork and the link were the seller's and do not travel. If only part of a block was sold, the block splits at that moment, and the part the seller keeps holds its artwork cropped to the smaller rectangle.

There is no way to hand a square back to the site. Selling it on is the only exit.

## Auction

The daily contest for the Banner. Bidding runs through the day for **tomorrow's** banner and closes at 00:00 UTC. Bidding starts at $100.

## Auction day

The window between two 00:00 UTC boundaries. The winner of yesterday's auction occupies the banner for the whole of today.

## Banner day

One day of banner occupancy: which owner held it, with which artwork and link, and the bid that won it. Today's banner day is on the canvas. Past banner days are the strip of past winners.

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

The single surface that shows detail and holds every flow: a right-hand column on desktop, a bottom sheet on mobile. Selecting squares, buying, bidding and My squares all use it, one flow at a time. Nothing else covers the canvas, and nothing ever covers the banner artwork: on desktop the column stands beside the canvas and is always present, so opening it never changes the size of the board.

## Dataset

One complete mock board the prototype runs on. There are two: **early**, a nearly empty board with an unsold banner, and **full**, a board about 70% sold with a banner winner and past winners. A dataset is never real: it holds no real sale, no real owner and no real winner.

## Viewer

The person looking at the board. Signed out, the viewer is a stranger. The fake sign-in makes the viewer one of the owners in the dataset, which is what fills My squares.
