# 02 — Canvas feel: zoom, pan, selection

Type: prototype
Status: claimed
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
