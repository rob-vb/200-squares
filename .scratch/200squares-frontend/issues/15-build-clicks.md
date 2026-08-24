# 15 — Build: click counters

Type: task
Status: open
Blocked by: —
Parent: ../map.md

## Question

Build what [ticket 14's Answer](14-traffic-numbers.md) decided. Read it first —
it settles every rule below, and this ticket only says where the code goes.

### The model

- `clicks: number` on `Block` and on `BannerDay` in `src/lib/board/types.ts`.
  No dates. The model has none and gains none.
- Seed both datasets (`early`, `full`) with a wide spread, 0 to a few thousand.
  At least one held block must sit at 0, because a quiet block is a case the
  design has to hold.
- Reducer action that increments the block or the banner day a click opened, so
  a click made during the session shows in My squares straight away. The board
  outlives navigation, so the public total on `/how-it-works` moves too.
- The increment hangs off the one place a click leaves the board:
  `follow()` in `src/components/canvas/canvas.tsx:144`. A pending block returns
  early there and must keep doing so — it can never count.

### The two counters

- **Per block, owner only** — on the block's row in `my-squares.tsx`, beside the
  artwork and the link it belongs to. A pending row shows **nothing**, not `0`.
- **Per won banner day, owner only** — one line each in the bids section of My
  squares. Today the section holds bids alone; a banner day the viewer won and
  its count belong there too.
- **The public total** — every block plus every banner day, in
  `src/components/content/counter.tsx`, one small line under the pitch line
  (`$100 each, paid once…`). Small, quiet, and it moves later when the number
  grows. It stays off the board page: ticket 10 emptied that page and it does
  not scroll.

### Words

Keep the labels bare here — the counter is a number with a noun. Ticket 16 owns
the sentences that explain it, and it may come back and correct these.

### Not in this ticket

No graph, no time window, no per-day figure, no per-visitor trace of any kind.
A click adds one to a number and the visitor is forgotten.

### Verify

`tsc --noEmit`, `eslint`, `next build`, and a preview URL. Check both datasets
via `?data=early` and `?data=full`, and check a block sitting at 0.
