# 26 — Strip the resale surface

Type: task
Status: resolved
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

## Answer — 2026-08-25

**Resale is out of the repo, and `/terms` now says there is no exit at all.** Pure
deletion, as the ticket asked. `4e59a41`.

**What went.** `panel/sell-flow.tsx`, `panel/resale-flow.tsx`, `for-sale-switch.tsx`,
the `sell` and `resale` flows in `panel/flow.tsx` and `panel/panel.tsx`, the For sale
row in `panel/my-squares.tsx`, the switch in `top-bar.tsx`, the market view and its dim
layer in `canvas/canvas.tsx` and `canvas/board.tsx` (`listingAt`, `ListedPart`, the
`forSale` prop and the whole market drag), `Listing` and `Block.listing` in
`lib/board/types.ts`, `askingFor`, `MIN_ASKING`, `RESALE_FEE`, `feeOn`, `sellerGets`,
`rectWithin` and `BoardModel.listed` in `lib/board/geometry.ts`, the `list`, `unlist`
and `buyListing` actions in `lib/board/state.tsx`, and the three listings in
`datasets/full.ts` with the `sell` option in `datasets/brands.ts`.

**What stayed, on purpose.** `intersect`, `remainderOf`, `cropArtwork` and `cropStyle`.
⚠️ A part sale is **not only resale**: [ticket 15](15-build-schema.md)'s write path owes
the loser of a race for the same squares *the remainder*, which is exactly
`remainderOf`, and [ticket 09](09-artwork-storage.md) gives a cut block's pieces one
file and a crop rectangle each. The `// Resale` banner over them is retitled to say what
they are actually for.

**The copy.** ⚠️ `/terms` lost *"Selling your square on"* and gained **"There is no way
out"** — *a square cannot be sold on through this site, and it cannot be handed back.
There is no refund and no exit.* Three FAQ answers on `/how-it-works` flipped from yes
to no, and the sold-out line in `content/counter.tsx` became *"Every square is taken. The
banner is still auctioned every day."* ⚠️ None of it promises V1.1: that promise exists
only in the top bar, which is [ticket 27](27-label-and-sellout.md)'s, and it is not
written yet — so **today the site says no resale and nothing else**, which is the safe
order to do these two in.

**A stale price found on the way.** `/about` still said **$100 a square**. The map's
2026-08-25 note says the copy was changed with `PRICE_PER_SQUARE`; that page was missed.
Corrected to $250, and it also carried *"to keep or to sell on"*.

**`CONTEXT.md`** keeps **Listing**, **Asking price**, **Resale** and — ⚠️ not named by
the ticket — **Site credit** under a `# Not in V1.0` heading. Site credit is what a
resale pays a seller in ([ticket 01](01-resale-platform-cost.md)), so it describes
nothing in V1.0 either and belongs with the other three. **Block**, **Order**, **Detail
panel** and **Clicks** each had one clause that named resale; those are reworded in
place, not moved. `PRODUCT.md` says V1.1 and points at the top-bar promise.

**Checked**: `tsc --noEmit` clean, `eslint` clean, `next build` green. ⚠️ The build still
reports **all five routes as dynamic** — ticket 08's `?data=` finding is untouched by
this, and it stays a cost requirement on ticket 15.
