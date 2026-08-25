# 26 — Strip the resale surface

Type: task
Status: open
Blocked by: 12
Parent: ../map.md

## Question

Nothing to decide. [Ticket 12](12-resale-for-real.md) put resale out of scope for V1.0.
This takes it out of the repo.

⚠️ **Do this before [ticket 15](15-build-schema.md).** It is pure deletion, it touches the
same files ticket 15 rewrites, and doing it first makes ticket 15 smaller. Doing it after
means building a schema for a feature that is then removed.

Resale reaches twenty files today. Remove, do not hide behind a flag: dead code in the
board query is paid for on every rerun for every viewer (ticket 05), and a flag nobody
tests is worse than no code.

- **Components**: `panel/sell-flow.tsx`, `panel/resale-flow.tsx`, `for-sale-switch.tsx`,
  and their wiring in `panel/panel.tsx`, `panel/controls.tsx`, `panel/flow.tsx`,
  `panel/my-squares.tsx`, `top-bar.tsx`.
- **The board**: the for-sale state in `canvas/board.tsx` and `canvas/canvas.tsx`.
- **The model**: `Listing` and the asking price in `lib/board/types.ts` and
  `lib/board/geometry.ts` — `listPrice`, `feeOn`, `sellerGets`, `RESALE_FEE`. ⚠️ The
  **crop rectangle stays**: ticket 09 uses the same mechanism for artwork that does not
  match a block's shape, and it is not resale's.
- **Mock data**: the listings in `lib/board/datasets/full.ts` and `brands.ts`.
- **Copy**: every mention of selling on, the market and second-hand across
  `app/terms/page.tsx`, `app/about/page.tsx`, `app/privacy/page.tsx`,
  `content/how-it-works.tsx` and `content/counter.tsx`.
- ⚠️ **`/terms`** today says *"There is no way to hand a square back to the site. Selling
  it on is the only exit."* Without resale there is **no exit at all**, and the page must
  say so plainly: a square cannot be sold and cannot be handed back. It must **not**
  promise future resale — that promise lives only in the top-bar label
  ([ticket 27](27-label-and-sellout.md)).
- **`CONTEXT.md`**: move **Listing**, **Asking price** and **Resale** into a clearly marked
  *Not in V1.0* section rather than deleting them. They are the vocabulary V1.1 starts
  from, and they describe nothing in the code meanwhile.
- **`PRODUCT.md`**: the resale paragraph goes; note V1.1 instead.

Git keeps all of it. V1.1 restores from history rather than from memory.

Check on the staging branch URL: the panel opens, a rectangle can still be selected, and
nothing anywhere offers to sell.
