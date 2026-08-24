# 08 — Build: app skeleton and canvas

Type: task
Status: claimed
Blocked by: 02, 03, 04, 05
Parent: ../map.md

## Question

Build the real prototype up to and including the canvas: Next.js + TypeScript + Tailwind in this repo, the tokens from ticket 05, the interaction model from ticket 02, the data layer from ticket 03.

Includes: the 16 x 14 grid with the 5 x 5 banner, square states, tooltip, zoom/pan/selection, the top bar (wordmark, auction block, sign-in), responsive fit from phone to desktop, and the dataset switch.

Done when it runs on a Vercel preview and the canvas feels the way ticket 02 decided it should.

## Comments

**2026-08-24 — built, waiting on the phone**

The real prototype is on branch `build-08`. It is not a throwaway: this is the
code that stays.

Preview: https://200-squares-git-build-08-robs-projects-52973834.vercel.app
Early board: https://200-squares-git-build-08-robs-projects-52973834.vercel.app/?data=early

### What landed

```
src/lib/board/
  types.ts        the shapes from ticket 03
  geometry.ts     the fixed board, the 1..199 numbering, the 4 x 4 clamp, buildBoard
  time.ts         the auction clock — every date derived from the next 00:00 UTC
  state.tsx       the reducer and its context, seeded from a dataset
  datasets/       brands.ts, early.ts, full.ts, index.ts
src/components/
  board-screen.tsx   the first screen
  canvas/            transform.ts, canvas.tsx, board.tsx
  top-bar.tsx  title-block.tsx  auction-dock.tsx  countdown.tsx
```

`full` is 37 blocks, 134 taken + 6 pending = 70.4% of 199, 6 past winners and 14
bids. `early` is 4 blocks, 10 squares, no banner winner. Both render the counts
the server computed: 134 / 6 / 59 and 8 / 2 / 189.

### Three corrections to earlier tickets, all found by building

1. **The seam was missing from ticket 02's maths.** The spike computed the board
   as `COLS * cell` while the grid actually measures `COLS * (cell + 1) - 1`. Over
   16 columns that is 15px of drift, so a click near the right edge landed most of
   a square off. Hit-testing now advances by `cell + SEAM`. The fit numbers move
   with it: a 390px phone gives a **23px** square, not 24, and a 1440 x 900 desktop
   gives **59px**, not 60.
2. **`minutesBeforeClose` put bids in the future.** Ticket 03 stored a bid as
   minutes before the 00:00 UTC close. Whenever the real clock sits earlier in the
   day than the stored offset, that bid has not happened yet. The field is now
   `minutesAgo`, measured from now, which can never be in the future. Ticket 03's
   answer carries the correction.
3. **Ticket 08's own brief said the top bar carries the auction block.** Ticket 01
   moved the auction out of the top bar and into a docked card, on purpose. The
   card wins; the top bar carries the wordmark and the session only.

### Judgement calls

- **The selection outline and the chip do not scale.** The seam and the block edge
  do, because they are the grid. The outline and the chip are controls, so they
  keep their size on screen. The chip is drawn outside the transform.
- **Pressing a sold block does not start a selection.** A drag that *runs into*
  taken squares still shows blocked, as ticket 02 decided. But a press that
  *starts* on a block is a click on what that owner paid for, and it opens their
  site.
- **The canvas box is 8:7 on a phone, not full height.** Ticket 02 left this open.
  Fit is contain and a phone is width-bound, so a taller box adds empty bands and
  nothing else. Everything below it belongs to ticket 10.
- **The title block shows three counts on a phone and six on a desktop.** Ticket 01
  had it desktop-only. Scarcity is the product, so the numbers that shrink stay on
  screen at every size.

### What is deliberately missing

- **The BID button leads nowhere.** The auction panel is ticket 09. It is the only
  control on the screen that does nothing.
- The detail panel, buying, upload and My squares are ticket 09. Sign in works and
  is real: it names the viewer and counts their squares.
- The reducer has `signIn` and `signOut` only. `buy`, `uploadArtwork`, `editLink`
  and `placeBid` land in ticket 09, in the same commit as the screens that call
  them.
- Inertia after a flick and eased zoom, which the library variant had for free.
  Ticket 02 said to judge whether the canvas needs them. That is a question for
  this preview.

### What to check on the phone

1. Does the drag still buy without thinking, now that it is the real board?
2. Does zoom hold the point under your finger, and does the pan ever feel dead?
3. Numbers appear from about 1.5x. Is that early enough?
4. Does the canvas want inertia and eased zoom, or is the direct feel better?
5. Light artwork — HALCYON, ATLAS FOUNDRY, MARLOW — does the hairline edge hold it?
