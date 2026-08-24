# 14 — Traffic numbers for owners

Type: grilling
Status: resolved
Assignee: rob-vb (claimed by agent session)
Blocked by: —
Parent: ../map.md

## Question

Raised by the dev on 2026-08-24, mid-ticket-13, pointing at the FAQ answer
`Do I get traffic numbers?` — *"We should build this."*

An owner pays $100 for a square whose only job is to send people somewhere, and
today the site tells them to measure it themselves. Ticket 07 chose that
deliberately: there are no visitors yet, and invented numbers are worse than
none. The dev now wants the numbers built.

To settle:

- **What is counted.** Clicks on a block only, or impressions too? Every square
  is on screen the whole time the board is open, so an impression is nearly
  meaningless here — is a click the only honest unit?
- **Who sees it.** The owner in My squares, or everybody, on the block? A public
  count turns the grid into a leaderboard and tells a buyer which squares are
  dead. That may be the point, or it may kill the sale of the quiet ones.
- **What it does to resale.** This is the sharpest question. Ticket 12 leaves a
  sold block arriving empty. Does the click history travel with the square, stay
  with the seller, or reset to zero? A buyer paying above $100 for a second-hand
  block wants the numbers; a seller with bad numbers wants them gone.
- **The honesty problem.** Ticket 07 chose "no numbers" as an honesty position,
  and three pages now say so plainly. Counting clicks makes those lines false.
  `/privacy` promises no analytics, no third-party scripts and no profile across
  sites — a first-party click count can keep all three, but the page must stop
  claiming the site counts nothing at all.
- **What the prototype shows.** Mock counts on mock blocks, or nothing until a
  backend exists? Ticket 03's rule is that a dataset holds no real sale and no
  real owner, so mock counts fit the pattern — but a number persuades harder
  than a logo, and a fake one may be the first thing on this site that lies.

## Blocks copy on three pages

This decision invalidates copy if it goes the other way, the same way ticket 11
invalidated the resale FAQ. Whoever resolves this owns the rewrite, or hands it
to a follow-on ticket the way 11 handed 13:

- **`/how-it-works` FAQ, `Do I get traffic numbers?`** — currently *"Not yet.
  There are no visitor statistics here, and invented numbers are worse than
  none."*
- **`/terms`, "What is not promised"** — *"There are no visitor statistics here,
  and no traffic is promised, implied or reported."*
- **`/privacy`, "What it does not do"** — *"There are no visitor statistics here
  at all,"* and the sentence explaining that this is why owners are told to use
  their own tracking parameters.

The tracking-parameters advice stays true either way and should survive: an
owner's own analytics tell them things this site never will.


## Answer (2026-08-24)

The site counts clicks. Not impressions, not visitors — clicks, and nothing
else. Every one of the ticket's five questions resolved toward the smallest
honest thing that still answers the owner's real question: *did my square send
anybody anywhere?*

### The unit: a click, and only a click

Every square is on screen for as long as the board is open, so an impression
here means "the page loaded" and nothing more. It would be the largest number on
the site and the emptiest. A click is a visitor deciding to leave the board for
somebody's website — the exact thing an owner paid $100 for.

The banner counts the same way, per **banner day**, because a banner day is what
was won and what carries the link.

A **pending** block never counts. `canvas.tsx:150` already makes a click on it
open nothing, and that is right: there is nothing to send anybody to yet.

### Who sees what: two numbers with two jobs

**Per block, owner only.** The count sits on the block's row in My squares,
beside the artwork and the link it belongs to. Nobody else sees it. A public
per-block number would turn the canvas into a leaderboard and mark the quiet
squares as dead — and ticket 01 chose a canvas where owner artwork is the only
colour, not a canvas of figures.

**One public total.** Every click on every block and every banner day, added up,
sits small under the counter on `/how-it-works` — one line below
`$100 SQUARES LEFT`'s pitch line, in the small size. It names no owner and
exposes no block, so it costs an owner nothing. It also does a job nothing else
on the site does: it is the only honest answer to *"does this board get any
traffic?"* asked by somebody who has not bought yet. The dev's note: this is its
place while the number is small, and it moves when the number grows.

The dev asked for the total; splitting it from the per-block number is what
makes both safe to show.

### Resale: the count stays with the seller

A sold block arrives empty — ticket 12 — and the count is part of what does not
travel. The buyer starts at zero.

The reason is not squeamishness about the number. The artwork and the link that
earned those clicks are the seller's and stay with them, so the clicks measure
something the buyer is not buying. On a part sale, the seller keeps their whole
total; the site does not divide old clicks over the blocks a split leaves behind.

**A buyer is not shown a for-sale block's count.** Showing a number the buyer
will not receive is a sales trick, not a fact. The public total does that work
instead, and does it honestly.

### The count belongs to the block under one owner

This corrects the reasoning in the grilling, not its outcome. The first argument
ran "clicks belong to the link", which would mean an owner fixing a typo in
their URL loses everything. That is wrong.

The rule is: **the count runs as long as the owner does not change.** Artwork and
link are the owner's to change as often as they like, and the count runs on
through every change. It resets to zero on one event only — the block changing
hands.

`CONTEXT.md` gained a **Clicks** entry saying exactly this.

### Period: total since purchase, and nothing else

No 7-day window, no per-day figure, no graph. A window needs days in the model,
and the model has no dates at all — no purchase date, no click date. Adding time
to the data model to decorate a prototype counter is the wrong trade. One number
per block: everything since it was bought.

### The prototype counts for real, on top of a seed

Same pattern ticket 03 set and ticket 08 proved: the dataset is a seed and the
reducer really changes the board.

- `clicks: number` on `Block` and on `BannerDay`.
- The reducer increments on the click that opens the owner's site, so a click
  during the session shows up in My squares immediately.
- Seed values spread wide — 0 to a few thousand — so the UI has to render a
  quiet block, not only a busy one. A block at 0 is a case the design must hold.

Mock counts are the same kind of fiction as mock artwork and mock owners, and
they are labelled by the dataset the whole prototype runs on.

### The honesty problem, settled: the site counts clicks, not people

**Nothing about a visitor is stored.** No identifier, no session, no address, no
timestamp. A click adds one to a number on a block and the visitor is forgotten
in the same instant.

The cost is real and is accepted: with no trace per visitor, the site cannot tell
one person clicking ten times from ten people clicking once. The count is a rough
number, and the copy must say so rather than imply precision.

What this buys is that `/privacy`'s three promises all survive intact — no
analytics package, no third-party script, no profile across sites. The single
line that dies is *"There are no visitor statistics here at all"*, which stops
being true the moment anything is counted.

The tracking-parameters advice survives whole, as the ticket asked: an owner's
own analytics still tell them things this site never will — who, from where, and
what they did after arriving. This counter tells them one thing only.

### The copy goes to its own ticket

Three pages carry lines this decision makes false, and reading the rest will
find more — that is what happened in ticket 13, twice. So the same shape as
07 → 10 and 11 → 12 → 13: build first, then let the words have the last say.

The dev's closing instruction is the copy ticket's spine: **the site's copy about
analytics must be true.** Not "softened" — true.

### Follows

- **15 — Build: click counters** (`task`) — the model, the reducer, both
  counters.
- **16 — The copy for click counters** (`grilling`) — blocked by 15.
