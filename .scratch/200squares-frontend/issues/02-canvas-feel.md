# 02 — Canvas feel: zoom, pan, selection

Type: prototype
Status: resolved
Blocked by: —
Parent: ../map.md

## Question

Does the canvas feel right on mouse and on touch? Build a throwaway spike with a plain 16 x 14 DOM grid and no styling worth the name.

Must be answered by the spike:
- Zoom 1x (fit) to 4x via wheel, pinch, +/- buttons and double-click. Wheel over the canvas must not scroll the page.
- Pan only when zoomed in, clamped so the grid never floats off screen.
- Drag-select a contiguous rectangle that clamps at 4 x 4, plus shift-click as the second path.
- How the fit-zoom is computed as the viewport changes from phone to desktop, and how big a square is at 1x on a phone.
- Hand-rolled transform versus a library (e.g. react-zoom-pan-pinch): decide and record why.

Deliverable: the spike on a Vercel preview, tested on a real phone.

## Comments

**2026-08-22 — spike built, waiting on the pick**

Three interaction contracts on one route, switchable with `?variant=`, plus the floating
switcher (arrow keys work too). Deliberately unstyled: this spike judges feel, not looks.

Preview: https://200-squares-git-proto-02-robs-projects-52973834.vercel.app/prototype/canvas-feel

The variants disagree about one thing only — **who owns the primary drag on the canvas**.

- `?variant=direct` — **A, Direct.** Drag selects, at every input. Mouse: wheel zooms at the
  cursor, space-drag or middle-drag pans, double-click steps the zoom, shift-click extends.
  Touch: one finger selects, two fingers pan and pinch, and a second finger cancels the
  selection the first one started. Bet: buying is the point, so selection gets the drag.
- `?variant=library` — **B, Library.** `react-zoom-pan-pinch` owns the surface, so drag pans
  like a map. Selection can no longer be a drag, so it becomes tap-tap: tap a square, tap the
  opposite corner. Bet: the library's inertia and bounds are worth losing drag-select.
- `?variant=modal` — **C, Modal.** A visible LOOK / BUY switch decides what a drag does, at
  every input. In LOOK a tap selects one square. Pinch and wheel always zoom. Bet: an explicit
  mode beats a gesture the user has to discover.

Every variant carries a HUD (top right) with zoom, square size at 1x, square size now,
whether numbers show, pan, viewport, input type and the selection. So the numbers in the
answer come off the real phone, not off a guess.

All three share the grid, the board renderer and the 4 x 4 clamp. A and C share the
transform maths (`transform.ts`); they differ only in the drag contract. B touches none of it.

Code: throwaway route `src/app/prototype/canvas-feel/` on branch `proto-02`.

**What to check on the phone**

1. Which contract you reach for without thinking, on touch first.
2. Whether zoom holds the point under your finger, and whether the pan ever feels dead.
3. Whether the 4 x 4 clamp reads as a rule or as a bug when the drag stops growing.
4. A selection that runs into taken squares shows BLOCKED in the HUD. Does the canvas need
   to say that too?

**One thing the spike exposes, for the pick**

Fit is `min(viewport width / 16, viewport height / 14)`, so the whole grid always fits with no
crop. On a 390px phone that is a ~24px square — and the grid then stands about 336px tall in a
much taller viewport, so there are wide empty bands above and below. The alternative is to fit
by width in portrait and let the canvas run past the fold. Read the real numbers off the HUD
and decide which one the canvas wants.

Open: which contract wins, hand-rolled versus library, and the fit rule in portrait.

## Answer

**A — Direct wins.** Picked by the dev on 2026-08-22 on the Vercel preview. Nothing was
grafted on from B or C.

Live: https://200-squares-git-proto-02-robs-projects-52973834.vercel.app/prototype/canvas-feel?variant=direct
Code: `src/app/prototype/canvas-feel/` on branch `proto-02`. Throwaway; it never lands on `main`.

### The contract

**Selection owns the primary drag, at every input.** Buying is what the canvas is for, so the
gesture the hand reaches for first is the gesture that buys. Panning is the secondary action
and has to be asked for.

| Input | Select | Pan | Zoom |
| --- | --- | --- | --- |
| Mouse | drag; shift-click extends | space-drag or middle-drag | wheel at the cursor, double-click, +/- buttons |
| Touch | one finger drag | two fingers | pinch, +/- buttons |
| Trackpad | drag | space-drag | pinch (arrives as a `ctrlKey` wheel) |

A second finger cancels the selection the first one started, so a pinch never leaves a stray
block selected. Double-click steps 1x → 2x → 4x → 1x, anchored at the pointer.

### Hand-rolled, not a library

`react-zoom-pan-pinch` was built as variant B and loses on three counts:

1. **It owns the drag.** The library treats drag as pan and offers no clean way to hand it
   back. Selection then has to become tap-tap — tap a corner, tap the opposite corner — which
   is a worse buy gesture than a drag, and drag-select was already fixed while charting.
2. **Ticket 05 requires one transform.** The seam has to scale with the canvas, so the whole
   board must be a single `transform`. Hand-rolled gives that directly; the library gives it
   only as long as nothing else needs to reach into the transform.
3. **The core is small.** `transform.ts` is about 140 lines and every line is about this
   canvas. The library is a dependency plus the work of fighting its defaults.

What the library had for free, and we now do not: **inertia after a flick, and eased zoom
animation.** If the canvas feels dead in ticket 08, that is the first thing to add by hand.

### The transform model

One wrapper, `transform: translate(x, y) scale(s)`, `transform-origin: 0 0`. Content natural
size is `16 * cell` by `14 * cell`.

- **Scale 1 is fit**, so `cell = floor(min(viewportW / 16, viewportH / 14))`. Range 1x to 4x.
- **Zoom holds the point under the pointer.** The content point under the anchor is computed
  before the scale change and put back under the anchor after it.
- **Pan is clamped, and centred while the content fits.** The clamp is derived at render
  rather than written back into state, so a viewport change re-centres on its own. This is
  also what makes "pan only when zoomed in" fall out for free: at 1x the content fits, so the
  clamp always returns the centred position and a drag cannot move it.
- **Scale and pan live in one state object.** Written as two, a burst of wheel or pointermove
  events inside a single frame each read a stale value and the movement is lost. This was a
  real bug in the spike, and it is the whole difference between a canvas that tracks the hand
  and one that lags it.
- **Pinch is absolute, not incremental.** Start distance, start midpoint, start scale and
  start pan are snapshotted on the second pointerdown, and every move recomputes from that
  snapshot. Incremental pinch drifts.

### Wheel must not scroll the page

React's `onWheel` is registered passive, so `preventDefault` inside it does nothing. The
listener is registered by hand with `{ passive: false }`. A trackpad pinch arrives as a wheel
event with `ctrlKey` set and much larger deltas, so it gets its own smaller step.

The canvas viewport carries `touch-action: none` and `overscroll-behavior: none`, and uses
pointer events rather than touch events.

### Selection

A rectangle from the anchor cell to the cell under the pointer. The span is clamped to 4
before it is clamped into the grid, so the anchor corner stays put and the block stops growing
at 4 x 4 instead of sliding. Shift-click extends from the stored anchor. A selection that
covers a taken or pending square is marked blocked — how that reads on the canvas is
ticket 06.

### Fit across viewports, and the square at 1x

Fit is `contain`, so the whole grid is always visible and never cropped. Which side binds
flips with the viewport:

| Viewport | Canvas box | Square at 1x | Grid at 1x | Slack |
| --- | --- | --- | --- | --- |
| Phone 390 x 730 | 390 x 682 | 24px (width binds) | 384 x 336 | ~346px vertical |
| Desktop 1440 x 900 | 1440 x 852 | 60px (height binds) | 960 x 840 | ~480px horizontal |

**A phone is width-bound, a desktop is height-bound.** That is convenient: the desktop slack
is horizontal, which is where the right-hand detail panel goes, and the phone slack is
vertical, which is where the auction dock and the bottom sheet go.

Correction to the note in the comment above: fitting by width in portrait is **not** a
different rule. On a phone the width already binds, so contain and fit-by-width give the same
24px square. The leftover vertical space on a phone is not a zoom question at all — it is the
question of how tall the canvas box is, and that belongs to **ticket 08**. The canvas does not
have to be `100dvh` on a phone.

At 24px a square shows no number: ticket 05 sets the floor at 34px, so numbers appear from
about **1.5x** on a phone and are there at every zoom on desktop.

### Constraints this puts on ticket 08

- Single transform on one wrapper. The seam scales with it.
- Scale and pan in one piece of state.
- Wheel listener registered by hand, non-passive.
- Fit is contain; do not special-case portrait in the zoom maths. Decide the canvas box
  height instead.
- Inertia and eased zoom are missing. Judge whether the canvas needs them.
