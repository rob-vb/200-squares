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
- **Money and identity** — orders, VAT details, links, owner names — are never in the
  board query. The board carries only what the canvas draws.

An environment variable can fall the board back to a cached snapshot without a deploy.

## Consequences

- The board is the first thing that breaks on a viral day, and it breaks rather than
  bills. That is the failure the dev already accepted.
- The reservation flood from ticket 02 §"where it leaks" is now also a quota attack:
  fake reservations rerun the board for every viewer. It stays open for
  [ticket 06](../../.scratch/200squares-v1/issues/06-buying-for-real.md); the data model
  cannot solve it.
- Every byte added to a block row is paid for on every rerun for every viewer. Adding a
  field to the board query is a cost decision, not a convenience.
