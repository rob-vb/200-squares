# 02 — Canvas feel: zoom, pan, selection

Type: prototype
Status: open
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
