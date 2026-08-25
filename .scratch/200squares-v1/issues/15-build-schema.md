# 15 — Build: the Convex schema and the live board

Type: task
Status: open
Blocked by: 05, 14
Parent: ../map.md

## Question

Nothing to decide. [Ticket 05](05-convex-model.md) settled the model; this puts it in
the repo. Read its answer first, and
[ADR 0001](../../../docs/adr/0001-live-board-clicks-outside-it.md) with it.

- **The schema**: `blocks`, `reservations`, `listings`, `orders`, `clickCounts`,
  `bannerDays`, `bids`, `owners`, and the credit ledger in shape only. Money as whole
  cents. Absolute UTC milliseconds everywhere except `clickCounts`, which keeps no time.
- **The board query** — only what the canvas draws, and nothing else. It is subscribed to
  by every visitor, so every field in it is a cost. `reserved` joins the square states,
  derived from live reservations.
- **The kill switch** — one environment variable that falls the board back to a cached
  snapshot with no deploy.
- **The write path** — the overlap check that guarantees exactly one winner on a
  rectangle, and the remainder the loser is offered instead.
- **Replacing `src/lib/board/state.tsx`** — the reducer and the two mock datasets are
  what this displaces. Something must still let the dev see an empty board and a full
  one; that is fog on the map and this ticket may sharpen it, not settle it.

Nothing here touches Stripe, Better Auth or artwork storage. Those arrive with tickets
06, 08 and 09. This ticket may leave the tables they need empty.

The dev sees nothing locally. Every check happens on a Vercel preview URL.
