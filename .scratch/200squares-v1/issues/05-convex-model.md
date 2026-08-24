# 05 — The data model in Convex

Type: grilling
Status: open
Parent: ../map.md

## Question

The spine of this map. Almost everything is blocked on it.

Today the whole board is a reducer over a mock dataset in `src/lib/board/state.tsx`,
seeded from `src/lib/board/datasets/`.
[Ticket 03 on the prototype map](../../200squares-frontend/issues/03-data-shapes.md)
decided its shape: **blocks are the only record and every square state is derived
from them**, the banner is its own type, owners exist once and are referenced by id,
and there are no absolute dates — a `dayOffset` and `minutesBeforeClose` resolve
against the next 00:00 UTC.

That last decision was right for a prototype and is fatal for a real site. Real time
exists now. Work out what the Convex schema is.

Settle at least:

- **What is stored and what is derived.** Does the 199-square grid exist as rows, or
  is it still derived from blocks? Derivation was cheap in a browser reducer; it is a
  query cost now, and it is what an attacker hits.
- **Dates.** Everything relative becomes absolute. But `/privacy` promises that **no
  time is written down** for a click — so the model gains dates everywhere except
  there, and that seam must be deliberate.
- **Reservations.** Charting fixed a 15-minute hold while checkout runs. Where does
  it live — a state on the squares, a row of its own, a field on the order? What
  reads as taken on the board while it stands? What expires it, and what happens if
  the expiry runs while Stripe's webhook is in flight?
- **Orders and money.** A record of what Stripe did, separate from what the board
  shows. What is the source of truth for "this block is mine" — the Stripe payment or
  the Convex row?
- **Owners and accounts.** An owner exists in the model today with no login.
  [Ticket 08](08-accounts.md) decides the auth; this decides how an owner row and a
  Better Auth user relate, and whether they are the same row.
- **The banner.** `BannerDay`, bids, and the hold on each bid. The winner of the
  auction that closed at 00:00 UTC occupies today.
- **Clicks.** `clicks` sits on `Block` and `BannerDay` today. Ticket 10 decides how
  they are counted; this decides where the number lives and how it survives a resale,
  which [ticket 14 on the prototype map](../../200squares-frontend/issues/14-traffic-numbers.md)
  already ruled: it resets on the block changing hands, and a part sale lands the
  whole count on the largest piece the seller keeps.
- **Two buyers, one rectangle.** The concurrency case. Convex transactions make this
  solvable; decide what is actually guaranteed and what the loser sees.

Read `CONTEXT.md` before starting and update it as terms sharpen. The vocabulary is
settled — Block, Square, Listing, Banner day, Clicks — and the schema should not
invent a second language for the same things. New words are likely for the money and
the reservation, and those belong in `CONTEXT.md` too.

Consider whether an ADR is worth writing for the storage decision. It is hard to
reverse, and a future reader will ask why.
