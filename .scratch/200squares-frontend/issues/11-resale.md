# 11 — Selling a square on

Type: grilling
Status: resolved
Assignee: rob-vb (claimed by agent session)
Blocked by: —
Parent: ../map.md

## Question

A square is permanent and paid once, so the owner holds something that can only
become worth more or less than the $100 they paid. What happens when they want
out?

Resale sat in **Out of scope** while charting — a separate effort with its own
listing, transfer and pricing. It comes back in because the prototype already
sells permanence, and permanence without an exit is a promise with a hole in it.

To settle:

- **Who moves the square.** Owner to owner through this site, or the site buys it
  back? Or only the transfer, with the price agreed elsewhere?
- **Price.** Free asking price, a floor at the $100 paid, or fixed at $100 so the
  grid never becomes a market? What the price does to the pitch under the canvas,
  where scarcity is the whole sell.
- **What travels with the square.** The artwork and the link are the seller's.
  Does a sold block arrive empty (`pending`) at the buyer, or with what was on it?
- **What the board shows.** Is a square for sale a state on the canvas — a fourth
  state beside `available`, `pending` and `taken` — or is it invisible until you
  click? A visible for-sale state changes the picture the grid makes, which is the
  product.
- **What the copy has to say.** `/terms` and `/how-it-works` now say resale is not
  supported yet, in as many words. Ticket 07's "permanent" line has to survive
  whatever is decided here.
- **What is prototype-only.** A real market needs money to move between two
  strangers, which is backend and payment — both out of scope. What can this
  prototype honestly show?

Not this ticket: building it. That is a later task ticket, if the answers ask for
one.

## Answer

**2026-08-24 — the grid becomes a market, and the market has a floor.**

Squares can be sold on, **through this site**, at a price the owner sets. The
site moves the money and keeps 10%. Resale leaves **Out of scope** for good.

### Who moves the square

**The site does.** The owner puts an asking price on a block; a visitor buys it
here, with the same fake checkout a fresh square uses. Not a private transfer
with the price agreed elsewhere, and not a buy-back by the site.

Two things were rejected and are worth keeping rejected. **A transfer-only
model** — the site moves the block, the two parties settle the price
themselves — keeps the grid out of the money, but it makes the exit useless: a
seller with nobody to sell to has no market to find one in. **A buy-back at
$100** gives the site a standing debt against every square it ever sold, and
contradicts the one payment the whole pitch rests on.

### Price: free, with a floor of $100

The asking price is the owner's, and it may never go below $100.

The floor is not there to protect sellers. It protects the **primary** price:
the site sells a fresh square for $100 flat, and a board showing second-hand
blocks at $40 kills that sale outright. A seller who cannot find a buyer at $100
stays stuck — which is exactly where every owner stands today, so the floor is
still strictly better than the nothing it replaces.

### For sale is a property of the block, not a fourth square state

`available`, `pending` and `taken` remain the only three square states. Ticket
03's model holds: a square's state is derived from the block that covers it, and
a block being for sale changes nothing about whether it is covered.

**On the canvas: a switch, off by default.** Labelled `For sale (3)`, beside the
`142 SQUARES LEFT` counter. Switched on, everything else dims and the listed
blocks light up.

Both alternatives were wrong. A permanent mark on the block paints over artwork
the owner paid for, and breaks Register's one rule — owner artwork is the only
colour on the canvas (ticket 01). Invisible-until-clicked hides the market from
everyone who is not already looking for it, and an undiscoverable market is not
one.

### The block arrives empty

A sold block goes to the buyer as `pending`: **no artwork, no link.** The image
is the seller's logo and the link points at the seller's site — leaving either
in place means the seller advertises for free on a square they no longer own,
and every click sends a visitor to the wrong company. `pending` already exists
and already looks deliberate, so the board tells the truth from the moment the
sale lands.

### The site keeps 10%, and listing is free

10% of the sale price, from the seller, on a completed sale only. Listing costs
nothing, because a listing fee suppresses supply and a market with no supply is
not a market. The money runs through the site in this model anyway, so a share
of it is ordinary and one sentence to explain.

### Splitting: a straight cut, and only when it sells

A block may be split for sale, **as long as both parts stay rectangles**. A
4 × 4 can become 4 × 2 + 4 × 2, or 4 × 1 + 4 × 3. It can never become a 2 × 2
corner plus an L — that is not a block, and ticket 03's model cannot hold it.

**The split happens on sale, not on listing.** While a part-block is listed, the
block stays whole and keeps showing its artwork; if it never sells, nothing
changed. When it sells, the block splits: the sold part goes `pending` to the
buyer, and the part the seller keeps holds its artwork **cropped to the new
rectangle**, which the seller may then replace.

### Blocks never merge

A buyer who already owns the neighbouring block ends up with two blocks, not
one. `CONTEXT.md` already says a block carries its own link and its own image;
merging would destroy one of the two artworks to satisfy the rule that a block
renders as one image.

**Which exposes an untrue line in the FAQ.** `Why 4 × 4 at most?` currently
answers *"So no single buyer can take over the grid."* That was never true —
nothing stops one owner buying ten blocks today. The limit is on one **image**,
not on one owner's share. Ticket 13 rewrites it.

### No release

There is no way to hand a square back. A returned square that the site resells
for $100 is a gift to the site, and breaks permanence from the other side. An
owner who walks away leaves the block standing. Dead artwork and dead links are
moderation, which is out of scope.

### What the prototype shows

**Both sides**, and the `full` dataset ships with three blocks already listed so
the switch does something before anyone signs in.

- **Listing** lives in My squares, in the same panel, one flow at a time. The
  price can be changed and the listing can be withdrawn at any time — a listing
  is not a promise to a buyer until money moves.
- **Buying a listing** needs no sign-in, exactly like a fresh buy (ticket 06),
  through the same fake checkout.

This is honest because nothing about it is more fake than the $100 purchase the
prototype already performs. What stays out is everything that needs real money
between two strangers: escrow, payouts to sellers, refunds, tax.

### Vocabulary

A **listing** is the thing: a block its owner offers, with an asking price. The
visitor never reads that word — the switch and the mark both say **For sale**.
"Resale" appears only in `/terms`, where the subject is the rule and not the
thing. Added to `CONTEXT.md`.

### The copy, and what "permanent" survives as

Permanent was always a promise about what **this site** does — it does not
expire your square, take it back, rent it out or resell it. Selling it on is the
owner's act, so the promise stands untouched. `/terms` already drew that line
("a promise about what this site does, not a rule about what you may do with
what you bought"), and that sentence now opens the resale paragraph instead of
being contradicted by it.

Ticket 13 writes it. Four places change: the resale FAQ (now yes), the 4 × 4 FAQ
(now true), one added line in *What you get*, and the `/terms` paragraph that
says resale is not supported. `/about`'s "The grid is permanent; the top of it is
not" is about the grid, and stands.

**No new section on `/how-it-works`.** Ticket 07 fixed that page's order as the
order a $100 buyer asks in, and the market is not what they came for. It belongs
in the FAQ.

### Follows

- **12 — Build: the resale market.** The model, the split, the switch, both flows,
  three listings in `full`.
- **13 — The copy for resale**, blocked by 12, so the words describe what was
  actually built. Same shape as 07 → 10.

## Corrected by ticket 12 (2026-08-24)

**The floor is $1, not $100.** Building the market showed the $100 floor does
not do the job this answer gave it. It was there to stop second-hand blocks
undercutting the $100 the site charges for a square — but a 4 × 4 at $100 is
$6.25 a square, which undercuts the primary price exactly as hard as the $40
this answer refused. A floor that actually worked would have to be $100 *a
square*, the seller's own cost, and that is the site deciding what somebody
else's block is worth.

The dev's call on the preview, and it goes the other way: the price is the
seller's, all of it. $1 is the floor, and it is only there to stop a price of
nothing. Everything else in this answer stands — the 10% share, listing free,
the split on sale, the switch, the empty arrival.

See [ticket 12's Resolution](12-build-resale.md).
