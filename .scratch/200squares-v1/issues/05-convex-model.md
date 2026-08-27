# 05 — The data model in Convex

Type: grilling
Status: resolved
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

## Answer

**Blocks stay the only record, the board goes live for everyone, and everything that is
written often or means money is kept out of the board query.** Written 2026-08-25 with
the dev.

### The read path — and where this contradicts ticket 02

⚠️ **The board is subscribed to by every visitor, signed in or not.** That is the
opposite of what [ticket 02](02-ddos-and-the-bill.md) recommended, and it is deliberate.
Two facts move it back: the Convex **Free plan cannot bill** (hard caps, no overage rate;
above them mutations fail), which is the dev's own rule enforced by the platform for $0;
and **the board is cold** — a few hundred writes over the whole life of the site, because
there are at most 199 sales. Fan-out over a few hundred writes is not a cost. Fan-out
over clicks is, and clicks are now out of the query.

The board query carries only what the canvas draws: rectangle, state, owner id, an
artwork reference, and the asking price when a listing stands. No links, no names, no
order data. Every byte is paid for on every rerun for every viewer, so adding a field
there is a cost decision.

**A kill switch**: one environment variable falls the board back to a cached snapshot
with no deploy. It is the only answer available at 03:00 on a viral day.

Recorded as [ADR 0001](../../../docs/adr/0001-live-board-clicks-outside-it.md).

### What is stored and what is derived

**Blocks remain the only record; the 199 squares have no rows.** 200 rows is nothing for
Convex to read, and two tables can never disagree. Square state is derived from blocks
and live reservations.

### The tables

- **`blocks`** — rect, ownerId, url, artwork reference, and nothing about money. The
  `listing` field moves out (see below), and `clicks` moves out.
- **`reservations`** — its own table, because there is no block yet to hang it on. Holds
  the rect, an absolute `expiresAt`, and the Stripe session id. **Nothing identifies the
  visitor** and no cookie is needed: the reservation id rides in the Stripe session
  metadata and the webhook brings it back. Expiry is lazy on read (an expired row does
  not count) plus a cron that sweeps.
- **`listings`** — its own table with its own id, no longer a field on the block. A resale
  must record which listing it bought out of, and a field cannot be referenced. A listing
  also survives its own partial sale, so it has a life apart from the block that splits.
- **`orders`** — what Stripe did, separate from what the board shows. Carries the ticket
  03 fields **frozen at the moment of sale**: buyer type, country, VAT number, the VAT
  rate and the VAT amount themselves, and that the withdrawal box was ticked. An invoice
  is never recomputed — a rate that changes next year must not change an old invoice.
- **`clickCounts`** — one row per clickable thing (block or banner day), **no dates**,
  because `/privacy` promises none. The board query never reads this table. The public
  site total is **summed in a cached query**, not kept in one hot row that every click on
  the site would contend on.
- **`bannerDays`** — keyed by the **UTC date string `YYYY-MM-DD`**, not an offset and not
  a timestamp, so the 00:00 UTC day can never drift. **No row means no winner**, which is
  the house ad — exactly as the prototype reads it.
- **`bids`** — its own table. Each bid carries the Stripe payment intent id of its hold
  and a status: `held`, `captured` or `released`. Without that status the site cannot see
  after 00:00 UTC which holds still need releasing.
- **`owners`** — the party in the domain, holding a nullable `userId`.
- **credit entries** — a ledger of entries that never change; the balance is their sum.
  Only the shape is fixed here. What credit may be spent on stays with
  [ticket 12](12-resale-for-real.md).

Money is **whole cents as an integer, USD**, never a float.

### Time

Every relative offset becomes an absolute millisecond timestamp in UTC. `dayOffset` and
`minutesAgo` are gone. **Clicks are the one exception and keep no time at all** — that
seam is deliberate and `/privacy` depends on it.

### Owners and accounts

**Two rows, not one.** Buying needs no account, so an owner exists before the account
does. `owners` is the domain party; Better Auth keeps its own user table; the owner
carries a `userId` that stays empty until the magic link is used. One table would force
the site to write half a user at the moment of payment.

### The fourth square state

A reserved square is neither `pending` (that means paid) nor `taken`. **`reserved` is now
a state in the model**, and the viewer is never told the difference — both read as
unavailable. It is the only state a square leaves without anybody acting.
`CONTEXT.md` gained `reserved`, **Reservation**, **Order**, **Site credit** and
**Bid hold**.

### Source of truth

**The Convex row, not the Stripe payment.** Only the signature-verified webhook writes it,
and the Stripe session id is the key against double processing.

### The expiry-versus-webhook race

Payment at 14:58, expiry at 15:00, webhook at 15:02. **The webhook wins whenever the
squares are still free.** If another buyer took them in between, the site refunds in full
automatically and sends an email. Holding the reservation open until Stripe closes the
session was rejected: an abandoned checkout page would freeze squares, which is the
ticket 02 attack by another road.

### Two buyers, one rectangle

**Exactly one wins.** The mutation reads every block and every live reservation and
refuses on any overlap. **The loser is not just shown an error**: their selection is
redrawn without the part that went, and the remainder is offered at its new price — a
2 x 2 that lost one square becomes a 1 x 2 in one tap. Only total overlap leaves nothing
to show.

### Splitting on resale

**The old block row goes; new rows replace it** — one for the buyer, up to four for what
the seller keeps, each with the same artwork under a new crop and the same link. The
click count goes **whole to the largest piece the seller keeps**, and the buyer starts at
zero, as [ticket 14 on the prototype map](../../200squares-frontend/issues/14-traffic-numbers.md)
ruled. Blocks never merge, so no rule needs to.

### What this changes elsewhere

- **[Ticket 06](06-buying-for-real.md)** — the reservation flood is now a quota attack as
  well as a board freeze: fake reservations rerun the live board for every viewer. The
  data model cannot solve it.
- **[Ticket 09](09-artwork-storage.md)** — the block holds an **opaque storage id plus a
  crop**, never a URL, so ticket 09's choice of where files live cannot reach the schema.
- **[Ticket 10](10-clicks-for-real.md)** — the click table and the summed public total are
  fixed here; how a click is counted safely is still ticket 10's.
- **[Ticket 12](12-resale-for-real.md)** — credit is a ledger, not a balance field.
