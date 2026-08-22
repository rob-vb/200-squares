# 01 — Three visual directions for the canvas

Type: prototype
Status: resolved
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

## Answer

**Register wins.** It is a graft, not one of the three: Plot's palette and auction placement, Stage's typography and near-invisible grid. Approved by the dev on 2026-08-22 on the Vercel preview.

Live: https://200-squares-git-proto-01-robs-projects-52973834.vercel.app/prototype/directions?variant=register
Code: `src/app/prototype/directions/variant-register.tsx` on branch `proto-01`. Throwaway; it never lands on `main`.

### The thesis

The ground is muted, so owner artwork is the only colour on the canvas. The grid nearly disappears; squares read as light tiles lying on a darker sheet, not as a drawn-in table. All the loudness is spent in one place: a magenta auction card that docks over the sheet margin. The top bar carries no auction at all.

### Colour

| Token | Value | Use |
| --- | --- | --- |
| page | `#DCDDD5` | the sheet the canvas lies on |
| square | `#EEEFE9` | an available square |
| seam | `#E4E5DE` | the 1px gap between squares — the whole grid |
| ink | `#23261F` | text, dark buttons, the card's hard shadow |
| faint | `#A8ACA0` | square numbers, small labels |
| hairline | `#C3C7BB` | panel borders, title block rules |
| accent | `#D6265E` | auction, selection, pending hatch. Nothing else. |

The ground had to drop from Plot's `#E9EBE4` to `#DCDDD5`. Plot's paper only worked because hairlines carved it up; with the hairlines gone it read as one blank sheet. Squares must sit *lighter* than the ground for the silent grid to work. Stage proved the same rule on concrete.

### Type

- **Anton 400** — wordmark, countdown, prices, big numbers, buttons. Uppercase.
- **Archivo** — labels and copy. Small labels are uppercase at `0.14`–`0.18em` tracking.
- **Roboto Mono** — square numbers only.

Known risk for ticket 05: Anton ships one weight and may have no tabular figures. A ticking countdown set in Anton can jitter as digits change width. Check this and pick a fallback for the countdown if it does.

### Structure

- **Top bar**: wordmark left, sign-in right. Nothing else. The auction is deliberately not here.
- **Auction**: a magenta card docked bottom-left over the sheet margin, with a hard `6px 6px 0` graphite offset shadow — print, not blur. Carries the countdown, the top bid and one Bid button. On mobile it becomes a full-width strip pinned to the bottom.
- **Canvas**: a plate with a 1px seam. Available squares carry their number in faint mono. Hover turns a square white.
- **Selection**: 2px accent outline, with the size and price on an accent chip pinned to the block's top-left corner.
- **Pending**: 45° accent hatch over the square colour. It never reads as empty.
- **Panel**: right-hand column on desktop, under the canvas on mobile.
- **Title block**: a bordered strip under the canvas, right-aligned at about 62% of the canvas width, holding sheet, squares, taken, pending, available, rate. It is the legend, and it earns its place by carrying real counts.

### What the losers gave up

- **Exchange** contributed nothing. The full-width amber rail carried the auction well, but it fought the canvas for the top of the screen, and a dark canvas made owner artwork sit *in* the surface instead of on it.
- **Stage** gave its type, its silent grid and its muted-ground rule. Its orange banner frame and the auction tab welded to it were dropped — the docked card does that job, and the tab pushed the canvas down the screen.
- **Plot** gave everything else. Its hairline grid was dropped.

### Found while building, for other tickets

- At 1x on a 390px-wide phone a square is about 24px, and the number inside it renders around 4px. It is unreadable. Numbers only become legible once zoomed. Ticket 02 has to decide whether a phone even shows numbers at 1x.
- Owner artwork colour is arbitrary. Light artwork (`HALCYON`, `ATLAS FOUNDRY`, the white 1x1 `S`) nearly vanishes into the paper ground. Ticket 05 must decide whether a taken block gets a hairline edge, or whether the upload rules constrain artwork.
- Zoom, pan and drag-select are not in this prototype. The selection shown is static. That is ticket 02.
