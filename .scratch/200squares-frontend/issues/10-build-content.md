# 10 — Build: content below the canvas

Type: task
Status: open
Blocked by: 07, 08
Parent: ../map.md

## Question

Build the below-the-fold content from ticket 07, plus the strip of past banner winners, and wire the scroll relationship with the canvas: the canvas owns the first screen, the content starts under it, and the top-bar countdown stays visible while scrolling.

## Added by ticket 07

Ticket 07 resolved the copy — read its Resolution section; it is the source text,
not a summary to rewrite. Two things it added to this ticket's scope:

- **`TitleBlock` loses its `Available` field.** The live `142 SQUARES LEFT`
  counter directly under the canvas carries the offer; the legend keeps only
  `Taken` and `Pending` (plus the desktop-only `Sheet`, `Squares`, `Rate`).
- **The past-winners strip shows the winning bid**, and lives inside the daily
  banner section, not on its own. `BannerDay` already carries `bid` and the past
  days are the negative `dayOffset` entries, so no model change is needed. The
  `early` dataset has no past days: build the empty state too.

Contact is plain text, not a `mailto:` and not a form.
