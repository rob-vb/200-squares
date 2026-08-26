# 33 — The largest block becomes 3 x 3

Type: task
Status: open
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
