# 05 — Design tokens and the square states

Type: grilling
Status: resolved
Blocked by: 01
Parent: ../map.md

## Question

Lock the visual system that the whole build reads from, based on the direction chosen in ticket 01.

To settle: colour tokens (background, grid lines, text, accent, auction accent), typography (wordmark, numbers in empty squares, panel, below-the-fold copy), spacing and the grid gap, radius and shadows if any.

Then the states, which is where the design earns its money: how `available`, `pending` and `taken` read at 1x and at 4x, how a hovered square differs from a selected one, how a selected rectangle is outlined, how the tooltip looks, and how the banner house ad looks when nobody has bid.

Deliverable: tokens written down in a form the build can consume (CSS variables / Tailwind theme), plus a state sheet on a Vercel preview.

## Answer

The tokens are live in `src/app/globals.css` on `main`, as a Tailwind v4 `@theme` block the build reads directly. The root layout loads Anton, Archivo and Roboto Mono. State sheet: https://200-squares-git-proto-05-robs-projects-52973834.vercel.app/prototype/states (branch `proto-05`, throwaway).

The direction is Register, from ticket 01. Nothing about the world changed here. What did change is every element-level detail, after the dev called the first pass AI slop — correctly.

### Colour

| Token | Value | Use |
| --- | --- | --- |
| `--color-page` | `#DCDDD5` | the sheet the canvas lies on |
| `--color-square` | `#EEEFE9` | an available square |
| `--color-seam` | `#E4E5DE` | the 1px gap between squares — the whole grid |
| `--color-ink` | `#23261F` | text, dark buttons, tooltip |
| `--color-faint` | `#5B5D56` | square numbers, secondary text |
| `--color-hairline` | `#B6B9AD` | panel borders, rules, block edges |
| `--color-accent` | `#D6265E` | auction, selection, pending. Nothing else. |

Two corrections worth keeping in mind for every future surface:

- **Secondary text is mixed from the ink, never from neutral grey.** The first pass used `#A8ACA0`, which is **1.69:1** on the page ground — every small label was formally unreadable. `#5B5D56` is 4.88:1 on the page and 5.77:1 on a square. Quietness now comes from size and weight, not from low contrast. Low-contrast-as-quiet is itself the tell.
- **On the accent ground, white is already 4.89:1.** A faded secondary label cannot pass there at all, so text on accent is always full white and hierarchy comes from size. No `opacity-80` anywhere.

### Type

- **Anton 400** — wordmark, countdown, prices, big numbers, buttons.
- **Archivo** — labels and copy.
- **Roboto Mono** — square numbers only.

Anton ships no tabular figures: its `1` measures 33.06 against 49.42 for every other digit at 100px, and `font-variant-numeric` does nothing. Every digit of a ticking number therefore sits in a `0.52em` box via `.tick-digit`. Everything else countable carries `[data-numeric]`, which applies `tabular-nums`.

**Label style — one device, not five.** The first pass set every label at 9px, semibold, uppercase, `0.18em` tracking and `opacity-80`. Labels are now sentence case at 13px in `--color-faint`, at full opacity. There is no eyebrow above any heading anywhere in this product.

### Depth

There is no hard offset shadow. The first pass used `6px 6px 0`, which is a neobrutalist costume and Register is not that world. Two layers, each with an offset and a soft blur, tinted from the ink so nothing drops neutral black onto paper:

- `--shadow-lift` — a raised control or a tooltip.
- `--shadow-dock` — the auction dock, floating over the sheet.

### Browser surfaces

These ship with defaults belonging to no design system, and the first pass left every one of them alone. All now come from the palette: `::selection`, `caret-color`, `accent-color`, `color-scheme`, `:focus-visible` (2px accent, 2px offset), the scrollbar track and thumb, `text-underline-offset`, and tabular figures.

### The square states

- A square shows its number only from **34px rendered size** up. Below that the glyph is unreadable — a square is about 24px at 1x on a 390px phone, so no numbers there until roughly 1.5x. On desktop at 1x a square is about 55px, so nothing changes.
- At 4x a square is about 96px and still shows only its number, larger. No `$100` in the cell: the price is flat, so 199 copies of it would be wallpaper.
- **`pending`** never shows a number. A 45° accent hatch at every size says "sold, artwork coming". It must never read as empty.
- **Hover** turns an available square white. **Selection** turns it white *and* outlines the whole rectangle in 2px accent, with size and price on an accent chip pinned to its top-left corner. Selection reads as hover, locked.
- **Every block carries a 1px inset hairline edge** — taken, pending and the banner alike. Without it, light artwork melts into the ground and two light blocks side by side read as one.
- **Tooltip** is mouse only; on touch a tap selects and opens the sheet. Ink ground, page-coloured text. Ink appears nowhere else on the canvas, so the tooltip reads as controls rather than as part of the picture. Content: `142 · Available · $100`, or the owner's name plus `Opens northwind.com`, or `Sold · artwork coming`.
- **House ad**, when nobody has bid: an accent field filling the banner, "THIS SPOT TOMORROW", bid from $100, and the Bid button. The banner is the biggest prize, so an unsold banner is the one moment the canvas shouts.

### Controls

The dark button is the commit action and appears once per surface. The accent button belongs to the auction only — **the accent colour is only ever a control**, never decoration. Every control ships rest, hover, focus and disabled.

### Spacing and edges

- Seam 1px, and it **scales with the canvas transform**, so it is 4px at 4x. The board is a plate at 1x and a market when you zoom in. This constrains ticket 02: the single-transform model stays.
- Block edge 1px hairline, inset. Selection outline 2px accent, inset by 1px.
- Panel padding 20px. Page gutter 16px on mobile, 32px from `lg` up.
- More space above a heading than below it.
- Radius is 0 everywhere.

### Verified

The impeccable mechanical detector returns zero findings on `globals.css`, the state sheet and the canvas prototype.

## Correction — 2026-08-24, from building ticket 08

"Every block carries a 1px inset hairline edge — taken, pending and the banner
alike" is too broad. On the real board the dev read it as a doubled rule: the
seam already draws a light line around every block, and the hairline lands right
beside it.

The edge exists for **artwork that melts into the paper**, which is the case it
was invented for. So only that artwork gets it. The test is distance from the page
ground in RGB: under 70, the artwork needs a line of its own.

- Gets an edge: HALCYON (14 away), ATLAS FOUNDRY (20), MARLOW & CO (36), a plain
  white block (64), and every pending block, whose hatch sits on paper.
- Gets none: everything dark or saturated. ORBIT's yellow is 169 away and is just
  as light as the ground — hue separates it on its own.

The gap between the two groups is wide, so the threshold is not delicate.

Rule in `src/lib/board/artwork.ts`.
