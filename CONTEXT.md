# Context: 200 squares

Glossary only. No implementation detail.

## Canvas

The field of 16 x 14 cells that fills the first screen. It is one visual surface, not a page section: it scales from phone to desktop and can be zoomed and panned on its own.

## Square

One cell of the canvas, sold for $250. There are 199 squares, numbered 1 to 199, reading left to right and top to bottom around the Banner. A square carries a state: `available`, `pending` or `taken`.

## Banner

The fixed 5 x 5 area in the top-left of the canvas. It is not for sale. Its occupant changes every day and is decided by the Auction. Banner + squares = 200, which names the product.

## Block

A contiguous rectangle of squares bought together, at most 3 wide and 3 high. A block renders as **one** image: the grid lines inside it disappear. A single square is a 1 x 1 block.

A block is the thing that is bought and owned. A square is never owned on its own: it is `taken` or `pending` because a block covers it.

A block carries its own link. A click anywhere on it opens that address.

A block can be **split**, and a split always produces blocks: rectangles, never an L. Taking one square out of a 2 x 2 leaves a 1 x 2 and a 1 x 1 — two blocks, because one image cannot fill an L. Any rectangle taken out of a block leaves at most four blocks behind. Blocks never merge: two blocks side by side stay two blocks, however they were bought, because each holds its own artwork and its own link.

## Owner

The party that bought a block or won the banner. An owner supplies artwork and a link for each thing they hold.

One party is one owner, however many blocks they hold. Nothing limits how many blocks one owner may hold: the 3 x 3 limit is about one **image**, not about one owner's share of the canvas. A square owner and a past banner winner can be the same owner. An owner has no link of their own: the link belongs to the block or the banner day, so one owner can send each of their blocks somewhere else.

An owner is not an account. A Better Auth **user** is a row in the auth component's own table, made the first time somebody follows a magic link, and an owner may point at one. The payment is what makes somebody an owner; the account is only how they come back. An owner who never followed their link is an owner all the same.

## Artwork

The image an owner supplies for a block or for the banner. One image covers the whole block. A block without artwork is `pending`; artwork is what turns it `taken`.

Artwork is **two files, not one**: a `1x` set and a `4x` set, both WebP, both produced by the browser at exactly the pixel size the board draws before anything is uploaded. The board reads the small one at fit scale and the large one only above a 2x zoom, and only for blocks in view. The original file is never uploaded and never stored, and no server ever decodes an image.

A **crop** is a window on the file, in fractions of it. A fresh upload has none — the browser already cropped to the block's shape — and one appears when a block is split: the pieces keep the file they had and narrow the window instead, because the split happens where there is no browser to re-cut anything.

Artwork is served from `/art/<storageId>` on 200squares.com and **never from Convex to a visitor**. A new file is a new id is a new URL, so the answer is cacheable for a year. Replacing artwork therefore busts nothing; **releasing** it must, because the file is gone and the old URL is the one somebody reported.

## Order

The record of one purchase: what was bought, what was paid, and what the buyer told the
site about themselves. It exists once and never changes.

An order is not the same thing as ownership. The Block is what says a block is somebody's;
the order says how it became theirs and what the invoice has to show. A refund or a removal
changes the board and leaves the order alone.

An order is **placed on 200squares.com**, under a button that says *Order now — obliges you
to pay*, and it is the site's own screen that concludes the contract. Stripe's page executes
the payment for an order that already exists; it does not make one. Only the
signature-verified webhook writes the order row, keyed on the Stripe session id, so a
payment can never produce two.

## Invoice

The document that says what VAT was owed on an Order and to whom. It is not the receipt
Stripe mails: a receipt says money moved, an invoice is a tax document, and only one of
them satisfies the law.

A consumer is owed no invoice; a business always is. The site issues its own, because the
VAT amount must appear in euros even when the sale is in dollars. An invoice is rendered
from the Order and never recomputed — a rate that changes next year must not change last
year's invoice.

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

An **irrevocable** offer on the Banner for tomorrow. Placing the bid is the offer and the close at 00:00 UTC is the acceptance, so no contract exists until the auction closes. A bid cannot be withdrawn. The Banner goes to the highest bid that **can be collected** at the close, which is not always simply the highest.

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

A reservation is what makes a square `reserved`. It ends in one of three ways: a payment arrives and a Block replaces it, the visitor gives it back through Stripe's own back link, or the time runs out and the squares are `available` again.

At most one reservation stands per visitor, and at most a tenth of the free squares are in reservation at any moment. Both limits exist because a reservation is free to take and would otherwise be a way to freeze the board for nothing.

## Detail panel

The single surface that shows detail and holds every flow: a right-hand column on desktop, a bottom sheet on mobile. Selecting squares, buying, bidding and My squares all use it, one flow at a time. Nothing else covers the canvas, and nothing ever covers the banner artwork. Opening the panel never resizes a square: on desktop the board keeps its scale and re-centres into the width beside the panel.

## Seed

A whole board written into a Convex deployment so it can be looked at. There are three: **full**, about 70% sold with a banner winner and a live auction; **early**, day one with ten squares gone and no banner; and **clear**, an empty board. A seed is never real — it holds no real sale, no real owner and no real winner — and it refuses to run unless `SEED_ENABLED` is set, so it can never reach production.

It replaces the prototype's **Dataset**, which was two mock boards in the browser selected with `?data=`. That search parameter is what made every route render dynamically, so the switch moved off the URL and into the deployment.

## Seeded artwork

Colour plus a wordmark, with no file behind it. The only artwork a Seed can write, because a full board of real uploads would mean inventing 37 companies' logos as image files. Real artwork is two WebP files in Convex file storage and a crop.

## Cached row

A row that exists only to be read cheaply, rewritten by a cron. It is the escape from fan-out: a live query reruns for every subscriber on every write it depends on, while a query that reads a cached row reruns only when the cron rewrites it, so cost stops following writes. Two exist — the board snapshot behind the kill switch, and the public click total.

## Frozen

What a Block becomes on its owner's third live strike. Still owned and still on the board, but no artwork and no link may be set on it. It renders exactly like a Block waiting for artwork.

## Viewer

The person looking at the board. Signed out, the viewer is a stranger, which is every visitor until they follow a magic link. Nothing on the board path asks who is looking: a signed-in owner is served the same HTML as a stranger.

## Clicks

How often visitors followed a Block, or a Banner day, to where it points. It
counts departures from the board, not arrivals at it: a square nobody clicks
stays at zero however long it is on screen. A `pending` block has no count,
because a click on it opens nothing.

The count belongs to a block under one Owner. Artwork and link may change as
often as the owner likes and the count runs on through every change. It returns
to zero on one event only: the block changing hands. A block that changes hands
arrives empty of artwork, of link, and of clicks alike — the count measures what
the last owner put there, not the place.

⚠️ **Nothing in V1.0 makes a block change hands**, so the reset is a rule with
nothing to fire it and it is not built. A block is created by a purchase and is
never deleted, re-owned or cut; removal freezes it and leaves it with its owner.
The rule is written down here because it is what resale starts from in V1.1.

An owner sees the count of each thing they hold, and nobody else does. Not the
public, and not another owner.

The **site total** is one public number: every click on every block and every
banner day, added up. It names no owner and no block, so it says the board
works without saying which square does.

The site counts clicks, not people. Nothing about a visitor is kept, so the same
person can raise a count more than once. It is a rough number and the site says
so.

---

# Not in V1.0

Resale is V1.1. These words describe nothing in the code today, and they are kept
because they are the vocabulary V1.1 starts from — not because anything uses them.
See ticket 12 on the V1.0 map, and ticket 01 for the money and the law under them.

## Listing

Part of a block, or all of it, offered for sale by its owner at a price per square. A listing is not a state of a square: the squares under it stay `taken`, because the block still covers them. It lasts until the owner withdraws it, and the offer and the price can both be changed while it stands.

A buyer takes any rectangle out of a listing, so a listing can survive its own sale: whatever the buyer left is still offered, at the same price.

The word is for the model. What a viewer reads is **For sale**.

## Asking price

What the owner of a Listing wants for one square of it. Per square, the way the site's own $250 is, so a buyer reads the two numbers side by side and judges. It is the seller's to set, whatever they set it to: the only floor is $1, which stops a price of nothing and nothing more. On a sale the site keeps 10% and the rest is the seller's.

## Resale

Squares moving from one owner to another through this site. The buyer drags the rectangle they want out of a Listing, exactly as they would drag on empty squares, and needs no account. What they buy arrives **empty**: the artwork and the link were the seller's and do not travel.

The block splits at the moment of sale, never at the moment of listing. What the seller keeps becomes as many blocks as the shape needs, each holding the same artwork cropped to it.

In V1.0 there is no exit at all: a square cannot be sold on and cannot be handed back.

## Site credit

What a Resale pays a seller in. It is not cash and it does not leave the site.

Credit is a run of entries that never change, and a balance is their sum. Nothing is ever
written over: money in, money out, and the history stays readable.
