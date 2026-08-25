# The board is live for everyone, and clicks are kept out of it

Convex is subscribed to directly by every visitor, signed in or not: the board updates
in real time for a stranger who never opens an account. This is why Convex was chosen,
and it is deliberately not what [ticket 02](../../.scratch/200squares-v1/issues/02-ddos-and-the-bill.md)
recommended.

## Context

Ticket 02 found that a Convex subscription rerun is a billed function call, so one write
costs `N clients × 1` call. It concluded that the board page should be cached,
cookie-free and open no websocket for an anonymous visitor.

Two facts move the decision back the other way:

- **The Free plan cannot bill.** It has hard caps (1,000,000 function calls and 1 GB of
  database bandwidth per month) and no overage rate. Above them, mutations fail. The
  dev's standing rule is *an attack may take the site offline, it may never produce a
  bill* — and on Free the platform enforces exactly that.
- **The board is cold.** Over the whole life of the site the board takes a few hundred
  writes: at most 199 sales, plus artwork, plus listings. Fan-out over a few hundred
  writes is not a cost problem. Fan-out over *clicks* is.

## Decision

The board query is live for everyone, and two things are kept out of it:

- **Clicks** live in their own table that the board query never reads. The public site
  total is summed in a cached query, not held in one hot row that every click would
  contend on.
- **Money and identity** — orders, VAT details, buyer names and addresses, the whole of
  `orders` — are never in the board query. The board carries only what the canvas draws.

An environment variable can fall the board back to a cached snapshot without a deploy:
`BOARD_MODE=snapshot` on the Convex deployment moves `board.state` off the tables and onto
one cached row a cron rewrites every two minutes. The websocket stays open; what stops is
the fan-out, because a block write no longer reruns anybody's query.

## Amended 2026-08-25, building ticket 15

**The board query does carry the block's `url` and its owner's name.** This decision as
first written said it would carry neither, and two later answers need both on the client:

- [Ticket 10](../../.scratch/200squares-v1/issues/10-clicks-for-real.md) made a click a
  **native anchor** with an un-awaited mutation beside it — no redirect in the visitor's
  path, no Vercel invocation, no blocked tab. An anchor needs its `href` at render, so the
  address has to be in this payload. A `/go/<id>` route would put it back on the server and
  undo that whole answer.
- The board's tooltip has always named the owner, and the company name is public the moment
  the block goes live — `/privacy` says so in those words.

The cost is real and small: about 199 blocks with a short name and a bare host is a payload
in the tens of kilobytes. Nothing else moved, and the rule the rest of this ADR states is
unchanged — a field in the board query is a cost decision, not a convenience.

## Consequences

- The board is the first thing that breaks on a viral day, and it breaks rather than
  bills. That is the failure the dev already accepted.
- The reservation flood from ticket 02 §"where it leaks" is now also a quota attack:
  fake reservations rerun the board for every viewer. It stays open for
  [ticket 06](../../.scratch/200squares-v1/issues/06-buying-for-real.md); the data model
  cannot solve it.
- Every byte added to a block row is paid for on every rerun for every viewer. Adding a
  field to the board query is a cost decision, not a convenience.
