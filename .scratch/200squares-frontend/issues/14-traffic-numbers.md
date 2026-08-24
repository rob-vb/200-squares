# 14 — Traffic numbers for owners

Type: grilling
Status: open
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
