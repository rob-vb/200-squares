# 33 — The largest block becomes 3 x 3

Type: task
Status: resolved
Blocked by: —
Parent: ../map.md

## Question

The dev's decision, 2026-08-26: *"laten we wel het maximum blok dat gekocht kan worden 3x3
maken ipv 4x4."* Nothing to decide. This is the edit.

⚠️ It arrived during [ticket 31](31-a-bid-that-does-not-stand.md), which is about a withdrawn
bid and has nothing to do with it. It gets its own ticket for that reason and for no other.

### What it touches

Checked on 2026-08-26, before the decision was written down.

- **Two constants.** `MAX_BLOCK = 4` in `src/lib/board/geometry.ts:14` and
  `convex/lib/board.ts:13`. Everything reads them: the drag clamp, `rectIsSellable`, the
  price, and the copy on `/how-it-works` — which interpolates `MAX_BLOCK` rather than writing
  a number, so three sentences there correct themselves.
- **The reservation ceiling follows.** `convex/reservations.ts:38` keeps
  `Math.max(MAX_BLOCK * MAX_BLOCK, …)` so one full maximum block always gets through the
  endgame. The floor moves from 16 to 9 on its own, and the comment above it says *"One full
  4 × 4"* — that needs the new number.
- **Prose that spells the number out.** `CONTEXT.md:31` writes *"the 4 x 4 limit"*.
  `src/lib/art/prepare.ts:80` says *"Sixteen block shapes exist between 1x1 and 4x4"* — nine
  now. `convex/lib/board.ts:59` and `:83` name 4 x 4 in comments.
- **No migration.** The site is not live, and `convex/seed.ts` makes nothing 4 wide. There is
  no block to cut down.

### ⚠️ One product consequence, and it wants saying out loud

The largest block goes from 16 × $250 = **$4,000** to 9 × $250 = **$2,250**. `PRODUCT.md:16`
names *"brands and agencies — buy a large block as a stunt, and want the banner"* as a buyer.
The stunt is now a bit more than half the size. The dev was told and went ahead.

`PRODUCT.md` itself does not name the limit, so it needs no edit — only this line remembered
if the persona is ever revisited.

## Context

- Opened 2026-08-26, out of a remark made while resolving
  [ticket 31](31-a-bid-that-does-not-stand.md).

## Resolution (2026-08-26)

`MAX_BLOCK` is **3** in both copies of the board rules, and every sentence that spelled the
old number out follows it. Shipped to staging as `545dcfc`.

### What changed

- **The two constants.** `src/lib/board/geometry.ts:14` and `convex/lib/board.ts:13`. The drag
  clamp, `rectIsSellable`, the price and the reservation ceiling all read them, so they moved
  on their own. `reservationCeiling`'s floor is now 9.
- **Four code comments** that wrote the number out: the clamp comment in `geometry.ts` (now
  says *clamped to MAX_BLOCK*, so it cannot go stale again), `convex/lib/board.ts:59` and
  `:83`, and `convex/reservations.ts:34`.
- **The copy.** `src/components/content/how-it-works.tsx:45` was the one FAQ **question** with
  a hard-coded *"Why 4 × 4 at most?"* while its answer interpolated `MAX_BLOCK`; it now
  interpolates too. `src/app/terms/page.tsx:27`, `CONTEXT.md:19` and `:31`, `PRODUCT.md:46`.
- **`src/lib/art/prepare.ts:79`** — *Sixteen block shapes* is now *Nine*.

### ⚠️ Two things the ticket had wrong

- **The seed did make blocks 4 wide.** The ticket checked `convex/seed.ts`, but the shapes
  live in `convex/seedData.ts`: **atlas** (4 × 3), **citadel** (4 × 3) and the viewer's own
  big block (4 × 2) were all unsellable under the new rule. Each lost its last column. The
  full board keeps 140 of 199 squares — *about 70%*, which is what the file promises. Nothing
  in the database had to be migrated: nothing is bought.
- **`PRODUCT.md` did name the limit**, twice: *"at most 4 wide and 4 high"* on line 46 and
  *"refusing one of sixteen shapes"* on line 51. Both are corrected. The stunt-buyer persona
  on line 16 still needs no edit — the price it implies is simply smaller now.

### Proved on staging

- `/how-it-works` reads *"Buy up to 9 squares as one block, at most 3 wide and 3 high."*
- A drag across **5 × 5** free cells stops at **3 × 3 · 9 squares**, and the panel asks
  **$2,250**. Checked against `seed:early`, because the full board no longer has three free
  cells in a row anywhere; the full board is seeded again.

### One number left generous on purpose

`SMALL_MAX_BYTES` (40 KB) and `LARGE_MAX_BYTES` (400 KB) in `convex/lib/art.ts` were sized
for a 4 × 4 picture and are untouched. They are ceilings, not targets, so the largest block
now uses about half of what it may. Tightening them would be a new decision about artwork
quality, not this edit.
