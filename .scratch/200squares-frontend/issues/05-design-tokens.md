# 05 — Design tokens and the square states

Type: grilling
Status: claimed
Blocked by: 01
Parent: ../map.md

## Question

Lock the visual system that the whole build reads from, based on the direction chosen in ticket 01.

To settle: colour tokens (background, grid lines, text, accent, auction accent), typography (wordmark, numbers in empty squares, panel, below-the-fold copy), spacing and the grid gap, radius and shadows if any.

Then the states, which is where the design earns its money: how `available`, `pending` and `taken` read at 1x and at 4x, how a hovered square differs from a selected one, how a selected rectangle is outlined, how the tooltip looks, and how the banner house ad looks when nobody has bid.

Deliverable: tokens written down in a form the build can consume (CSS variables / Tailwind theme), plus a state sheet on a Vercel preview.
