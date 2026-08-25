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

A block can be **split**, and a split always produces blocks: rectangles, never an L. Selling one square out of a 2 x 2 leaves the seller a 1 x 2 and a 1 x 1 — two blocks, because one image cannot fill an L. Any rectangle taken out of a block leaves at most four blocks behind. Blocks never merge: two blocks side by side stay two blocks, however they were bought, because each holds its own artwork and its own link.

## Owner

The party that bought a block or won the banner. An owner supplies artwork and a link for each thing they hold.

One party is one owner, however many blocks they hold. Nothing limits how many blocks one owner may hold: the 4 x 4 limit is about one **image**, not about one owner's share of the canvas. A square owner and a past banner winner can be the same owner. An owner has no link of their own: the link belongs to the block or the banner day, so one owner can send each of their blocks somewhere else.

## Artwork

The image an owner supplies for a block or for the banner. One image covers the whole block. A block without artwork is `pending`; artwork is what turns it `taken`.

## Listing

Part of a block, or all of it, offered for sale by its owner at a price per square. A listing is not a state of a square: the squares under it stay `taken`, because the block still covers them. It lasts until the owner withdraws it, and the offer and the price can both be changed while it stands.

A buyer takes any rectangle out of a listing, so a listing can survive its own sale: whatever the buyer left is still offered, at the same price.

The word is for the model. What a viewer reads is **For sale**.

## Asking price

What the owner of a Listing wants for one square of it. Per square, the way the site's own $100 is, so a buyer reads the two numbers side by side and judges. It is the seller's to set, whatever they set it to: the only floor is $1, which stops a price of nothing and nothing more. On a sale the site keeps 10% and the rest is the seller's.

## Resale

Squares moving from one owner to another through this site. The buyer drags the rectangle they want out of a Listing, exactly as they would drag on empty squares, and needs no account. What they buy arrives **empty**: the artwork and the link were the seller's and do not travel.

The block splits at the moment of sale, never at the moment of listing. What the seller keeps becomes as many blocks as the shape needs, each holding the same artwork cropped to it.

There is no way to hand a square back to the site. Selling it on is the only exit.

## Order

The record of one purchase: what was bought, what was paid, and what the buyer told the
site about themselves. It exists once and never changes.

An order is not the same thing as ownership. The Block is what says a block is somebody's;
the order says how it became theirs and what the invoice has to show. A refund, a removal
or a resale changes the board and leaves the order alone.

## Site credit

What a Resale pays a seller in. It is not cash and it does not leave the site.

Credit is a run of entries that never change, and a balance is their sum. Nothing is ever
written over: money in, money out, and the history stays readable.

## Bid hold

The card authorization behind a Bid. Placing a bid holds the money without taking it.
At 00:00 UTC the winner's hold is captured and every other hold is released.

A hold is not a payment. A released hold leaves no trace on the board and costs the bidder
nothing.

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
- `reserved` — held while a checkout runs. Nobody owns it yet and it may go back to `available` on its own. The viewer is not told the difference between this and `taken`: both read as unavailable.
- `pending` — paid for, artwork not supplied yet. Not the same as empty: an unmarked pending square reads as a bug.
- `taken` — artwork and link in place.

`reserved` is the only state a square leaves without anybody acting.

## Reservation

The claim a visitor holds on a rectangle while they are away paying. It lasts 15 minutes and then expires by itself. It is not a Block: nothing is owned, no artwork exists, and no owner is attached — a stranger with no account can hold one.

A reservation is what makes a square `reserved`. It ends in one of two ways: a payment arrives and a Block replaces it, or the time runs out and the squares are `available` again.

## Detail panel

The single surface that shows detail and holds every flow: a right-hand column on desktop, a bottom sheet on mobile. Selecting squares, buying, bidding, selling, buying second-hand and My squares all use it, one flow at a time. Nothing else covers the canvas, and nothing ever covers the banner artwork. Opening the panel never resizes a square: on desktop the board keeps its scale and re-centres into the width beside the panel.

## Dataset

One complete mock board the prototype runs on. There are two: **early**, a nearly empty board with an unsold banner, and **full**, a board about 70% sold with a banner winner and past winners. A dataset is never real: it holds no real sale, no real owner and no real winner.

## Viewer

The person looking at the board. Signed out, the viewer is a stranger. The fake sign-in makes the viewer one of the owners in the dataset, which is what fills My squares.

## Clicks

How often visitors followed a Block, or a Banner day, to where it points. It
counts departures from the board, not arrivals at it: a square nobody clicks
stays at zero however long it is on screen. A `pending` block has no count,
because a click on it opens nothing.

The count belongs to a block under one Owner. Artwork and link may change as
often as the owner likes and the count runs on through every change. It returns
to zero on one event only: the block changing hands. What a Resale buyer
receives is empty of artwork, of link, and of clicks alike — the count measures
what the seller put there, not the place.

An owner sees the count of each thing they hold, and nobody else does. Not the
public, and not a buyer looking at a block that is For sale.

The **site total** is one public number: every click on every block and every
banner day, added up. It names no owner and no block, so it says the board
works without saying which square does.

The site counts clicks, not people. Nothing about a visitor is kept, so the same
person can raise a count more than once. It is a rough number and the site says
so.
