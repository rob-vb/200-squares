# 15 — Build: click counters

Type: task
Status: resolved
Assignee: rob-vb (claimed by agent session)
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

## Answer (2026-08-24)

The site counts clicks, and it is on the branch `build-15-clicks`. Preview:
`https://200-squares-git-build-15-clicks-robs-projects-52973834.vercel.app`
(`?data=early` for the day-one board). `tsc --noEmit`, `eslint` and `next build`
are all clean, and both datasets render their total on `/how-it-works`: 43,724
on `full`, 38 on `early`.

### What was built

- **`clicks: number` on `Block` and on `BannerDay`.** No dates anywhere near it.
  `makeBlock` takes a `clicks` option and forces a `pending` block to zero
  whatever the dataset asks for, because a click on it opens nothing.
- **Both datasets seeded.** `full` runs 0 to 3,260 per block and 1,108 to 5,120
  per banner day, and the spread is deliberately unrelated to block size — a
  1 × 1 (`dot`, 2,470) outruns a 4 × 3 (`citadel`, 1,042). The viewer holds one
  block at the top (`blk_38`, 2,140) and one at zero (`blk_10`), so My squares
  has to render a quiet block and a busy one in the same list. `early` is
  day-one small — 31, 7, and the viewer's own square at 0.
- **`clickThrough` and `clickBanner` on the reducer**, dispatched from `follow()`
  in `canvas.tsx` — the one place a click leaves the board. A pending block still
  returns before the dispatch. A click made during the session shows in My
  squares at once, and the public total on `/how-it-works` moves with it, because
  the board outlives navigation.
- **Per block, owner only:** on the block's row in My squares, on the artwork
  line, as `Live · 1,840 clicks`. A live block always states its count, nought
  included. A pending row says `Waiting for artwork` and nothing else.
- **Per won banner day, owner only:** a `Banner days you won` group above the
  bids, one line each — day, count, winning bid.
- **The public total:** `43,724 clicks to owners' websites`, small and faint
  under the pitch line in `counter.tsx`. It stays off the board page.

### Two things the ticket left open, settled by building

**The viewer now owns a past banner day in `full`** (offset -3, formerly
`foxglove`, 2,260 clicks). Without one the banner half of My squares is
unreachable in the demo: the visitor cannot win an auction that closes at 00:00
UTC while they watch, so the feature would have shipped invisible. The cost is
that the viewer's wordmark appears in the public past-winners strip, which is
true of any owner who wins a day and costs nothing.

**A part sale does not divide the seller's count.** Ticket 14 said the seller
keeps their whole total and the site does not divide it, and building found the
gap between those two: a cut can leave the seller holding up to four blocks, and
`{...sold}` would have copied the count onto every one of them and multiplied
the public total by four. The site never knew which *square* was clicked, only
which block, so any split is invention. So the count lands whole on the largest
piece the seller keeps and the others start at nothing. The board's total is
unchanged by a cut, which is what keeps the public number honest. When a buyer
takes the whole block the count goes with the block that no longer exists — the
same rule, since nothing was kept.

### Untouched, on purpose

`/how-it-works`'s FAQ still says *"Not yet. There are no visitor statistics
here"*, `/terms` still says no traffic is *reported*, and `/privacy` still says
*"There are no visitor statistics here at all"*. All three are false as of this
branch. That is [ticket 16](16-clicks-copy.md)'s whole job, and it is blocked by
this one so the words describe what was actually built.
