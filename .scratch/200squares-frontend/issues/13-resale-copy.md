# 13 — The copy for resale

Type: grilling
Status: resolved
Assignee: rob-vb (claimed by agent session)
Blocked by: 12
Parent: ../map.md

## Question

Rewrite the pages beside the board so they describe the market that now exists.
Blocked by 12 on purpose: building corrects the plan every time, and the words
get the last say. Same shape as 07 → 10.

[Ticket 11's Answer](11-resale.md) fixes the facts and proposes the lines. Four
places change:

- **`/how-it-works` FAQ, "Can I sell my square to somebody else?"** — currently
  "Not through this site, not yet." Now yes: asking price from $100, listed from
  My squares, the buyer pays here, the site keeps 10%, and the block arrives
  without the seller's image or link.
- **`/how-it-works` FAQ, "Why 4 × 4 at most?"** — the answer says *"So no single
  buyer can take over the grid,"* which is not true and never was. The limit is
  on one image, not on one owner's share.
- **`/how-it-works`, "What you get"** — the permanence paragraph stands whole and
  gains a line: you may also sell it on.
- **`/terms`** — the paragraph saying resale is not supported becomes the rule:
  floor, share, straight-cut splits, and a sold block arriving empty.

Settled already, and not to be reopened without a reason:

- **`/about`'s "The grid is permanent; the top of it is not" stays.** It is about
  the grid.
- **No new section on `/how-it-works`.** Ticket 07 fixed the order as the order a
  $100 buyer asks in. The market goes in the FAQ.
- **The visitor never reads "listing".** The switch and the mark say *For sale*.
  "Resale" appears in `/terms` only.

Then check the rest of the copy against what 12 actually built, the way reading
the drafts in ticket 10 found the resale hole in the first place.


## Changed by ticket 12 (2026-08-24)

Read [ticket 12's Resolution](12-build-resale.md) before this ticket's own
sources: it corrected two of the facts ticket 11 proposed lines for, and added
one nobody had to describe yet.

- **The price is per square**, set by the seller, floor $1. Not one price for
  the block, and no $100 floor. The FAQ line ticket 11 drafted says "asking
  price from $100" — that is now wrong twice over.
- **The buyer takes any rectangle**, down to a single square. An owner can sell
  one square out of a block.
- **A part sale leaves the seller more than one block**, with their artwork
  cropped and a grid seam through it. Nobody has written a line about this and
  it is a real cost to an owner. It belongs in the answer.
- Unchanged: the site keeps 10%, listing is free, and the block arrives without
  the seller's image or link.


## Resolution (2026-08-24)

The pages beside the board now describe the market. Branch `copy-13`, preview:
https://200-squares-git-copy-13-robs-projects-52973834.vercel.app/how-it-works

The ticket named four places. Reading the rest against what ticket 12 built
found four more — the same way reading the drafts in ticket 10 found the resale
hole in the first place.

### The FAQ grows to nine, and the buyer gets a question

**`Can I sell my square to somebody else?`** — now yes, and it carries four
facts: the price is per square, listing happens in My squares, the site keeps
10%, and the image and the link do not travel. It ends on the cost nobody had
written down:

> Sell part of a block and you keep the rest as up to four blocks, with your
> image cropped to each and a grid line back through it.

That sentence exists because ticket 12 asked for it. The sell flow already says
it in the panel, but the owner reads that only after deciding to sell.

**`Can I buy a square somebody already owns?`** — new, and the real hole. The
`For sale (n)` switch stands in the top bar and had no words anywhere on the
site. A visitor who clicked it got a dimmed board and no explanation. The answer
names the switch, says the price is per square so it can be read against the
site's own $100, says the buyer drags out any rectangle down to one square, and
says it arrives empty. Ticket 11 wrote its lines for a seller; the buyer is the
larger group and had nothing.

One question was rejected: **no FAQ entry about handing a square back.** It went
to `/terms` instead. A refund question on a selling page raises a doubt the
answer does not settle, and the honesty is already carried by *"If it stops, the
squares stop with it."*

**`Why 4 × 4 at most?`** — the old answer was *"So no single buyer can take over
the grid,"* which was never true and which ticket 11 caught. The new one says
what is actually limited:

> The limit is on one image, not on one owner. A block shows a single image, and
> past 4 × 4 that image starts to be the grid rather than a place on it. Buy as
> many blocks as you like: each one stays its own image and its own link.

**Order is unchanged.** Ticket 07 fixed it as the order a $100 buyer asks in, so
every existing question keeps its place and the two market questions sit
together where the old sell question stood — late, because the market is not
what the visitor came for.

### Three untrue lines the ticket had not listed

- **The counter's pitch line** said *"$100 each. Buy once, keep it."* The counter
  itself counts `available` only, and there are now `taken` squares on sale that
  it does not count. The line is now *"$100 each, paid once. Some owners sell
  theirs on."* — pay-once survives, and this is the market's only mention above
  the FAQ. The headline number stays exactly what it was: squares the **site**
  still has.
- **`/about`** said the squares are for sale *"once, at $100 each"*, which now
  reads two ways. It says the site sells each one once, and after that it is the
  owner's to keep or to sell on. *"The grid is permanent; the top of it is not"*
  is about the grid and was not touched, as the ticket instructed.
- **`/privacy`** described what a buyer and a bidder give and had nothing for a
  seller, who now gives an address to be paid at. One line, marked not public.

### `/terms` gets a section, not a paragraph

The paragraph saying resale is not supported is gone. In its place, a section
**Selling your square on**, straight after *What you buy*, so the sentence that
already drew the line — *"That is a promise about what this site does, not a
rule about what you may do with what you bought"* — now leads into it instead of
being contradicted by it.

Five short paragraphs, written from the **sale** and not from one party, so the
buyer's side and the seller's side share the same four facts instead of stating
them twice: the offer and the price (any rectangle, per square, floor $1, free
to list, free to withdraw), the sale (buyer drags any rectangle, site keeps 10%,
the remainder stays on the market), what arrives empty, the split (up to four
blocks, cropped image, never merged), and no handing a square back.

### What was deliberately not written

**The market view.** With the switch on, the board dims, it does not select, and
a click on a block does not open its owner's website — the only place on the
site where that is true. None of it is described anywhere, and `What you get`
still says flatly *"A click on your block opens your website in a new tab."*

The switch is off by default, the visitor asks for the view, and one click undoes
it. A paragraph explaining a dimmed screen to somebody who is not looking at one
costs more than it gives.

**Step 2 of How it works** still says *"Pay $100 per square."* The three steps
are the ordinary purchase. The first thing a visitor reads should not gain a
branch for a route they do not know yet.

**`/terms`, "What you buy"** still opens *"A square costs $100."* It is about
buying from the site, and the section immediately under it covers the other
price.

### Checked and correct as they stand

`Can I buy more squares later, next to mine?` ("two blocks side by side stay two
images") is exactly what ticket 12 built. `Can I change my image or my link?`
still holds — a cropped block is still the owner's to replace. The banner copy
and the content rules are untouched by the market.

### Verified

`tsc --noEmit` and `eslint` clean, `next build` green, all 8 routes generated.

### Follows

- **14 — Traffic numbers for owners.** Raised by the dev while this ticket was
  being written, against the `Do I get traffic numbers?` FAQ. It is a product
  decision, not copy, and it invalidates copy on three pages if it goes the
  other way — see the ticket.
