# 01 — Three visual directions for the canvas

Type: prototype
Status: claimed
Blocked by: —
Parent: ../map.md

## Question

Which visual direction does 200 squares take? Build three rough, side-by-side directions of the same screen — canvas + top bar + detail panel — and pick one.

Each direction must answer: how loud is the grid (line weight, contrast, background), how do empty squares read against taken ones, how does the top bar carry the auction without shouting over the canvas, and what does the panel look like.

Constraint from charting: quiet canvas, loud auction. The buyers are serious parties paying $100 a square, and their artwork must carry the picture. Reference for *energy*, not for style: outbid.lol.

Deliverable: one page holding three directions, viewable on a Vercel preview. Pick one, note why, and note the best bits of the losers worth grafting on.

## Comments

**2026-08-22 — prototype built, waiting on the pick**

Three directions live on one route, switchable with `?variant=`, plus a floating switcher (arrow keys work too).

Preview: https://200-squares-git-proto-01-robs-projects-52973834.vercel.app/prototype/directions

- `?variant=exchange` — **Exchange.** Market terminal. Ink ground, amber auction rail across the full width, visible grid, right-hand panel. Archivo + JetBrains Mono.
- `?variant=plot` — **Plot.** Survey sheet. Cool paper, canvas as a plate with hairline rules, title block in the sheet margin, auction docked as a magenta card instead of living in the top bar. Saira Condensed + Roboto Mono.
- `?variant=stage` — **Stage.** Hoarding. Muted concrete ground and a near-invisible grid so owner artwork is the only colour, auction welded to the banner frame as a tab above the canvas, wide bottom sheet at every size. Anton + Archivo.

Code: throwaway route `src/app/prototype/directions/` on branch `proto-01`. Same mock data and the same owner artwork colours in all three, so the ground is judged against arbitrary brand colour.

Not covered here (belongs to ticket 02): zoom, pan, drag-select. The selection shown is static.

Open: which direction wins, why, and which parts of the losers to graft on.

**2026-08-22 — the graft, on the user's pick**

The dev picked: colours of Plot, auction placement of Plot (docked card, not the top bar), typography of Stage, grid of Stage (near-invisible).

Built as a fourth variant, `?variant=register`, now the default.

One thing had to move. Plot's paper works because hairlines carve it up; take the hairlines away and the plate reads as one blank sheet. So the page ground drops a step, from `#E9EBE4` to `#DCDDD5`, and the squares stay light at `#EEEFE9` with a `#E4E5DE` seam. The squares now read as tiles lying on a darker ground, which is how Stage's grid earned its silence — Stage did the same thing with concrete.

Kept from Plot: paper palette, magenta accent, hairline panel and title block, docked auction card with the hard graphite offset shadow, right-hand panel.
Kept from Stage: Anton for the wordmark, countdown, prices and buttons; Archivo for labels; near-invisible grid; faint parcel numbers.
Dropped from Stage: the orange banner frame and its auction tab — the docked card replaces it.
Dropped from Exchange: everything. Nothing was grafted on.
