# 10 — Build: content below the canvas

Type: task
Status: open
Assignee: rob-vb (claimed by agent session)
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

## Comments

**2026-08-24 — built, waiting on the phone**

Branch `ticket-10-content`.
Preview: https://200-squares-git-ticket-10-content-robs-projects-52973834.vercel.app
Early board (empty record, no past days):
https://200-squares-git-ticket-10-content-robs-projects-52973834.vercel.app/?data=early

### What landed

```
src/components/content/
  page-content.tsx   the whole page under the canvas, in ticket 07's order
  counter.tsx        the live SQUARES LEFT figure, and the sold-out text
  banner-record.tsx  the record of past banner days, with the winning bids
  section.tsx        the left-rail heading, the measure, the subhead
src/components/use-client-date.ts   the visitor's date, null until there is one
```

Copy is ticket 07's, word for word. The counts, the block limit and the banner
size are read from `geometry.ts`, so the copy cannot drift from the board.

### The scroll relationship

The first screen is now a `<section>` and not the whole document. On a desktop it
is exactly `100dvh`, so the board is as large as the screen allows and the counter
begins at the fold; on a phone the canvas keeps its 8:7 box and the content
follows under the legend.

The auction dock keeps its `fixed` position, so the countdown stays visible the
whole way down — the corner card on a desktop, the bottom strip on a phone. The
footer carries the padding that keeps the last line clear of it.

### One correction to ticket 02, found by building

**A plain wheel scrolls the page again.** Ticket 02 gave the wheel to zoom, and
that was right while the canvas was the whole document. Now there is a page under
it, and the canvas fills the first screen — a canvas that swallowed the wheel
would lock every mouse user out of everything below.

Zoom is now asked for, exactly the way ticket 02 made panning asked for: a
trackpad pinch (which arrives as ctrl+wheel), ctrl or ⌘ held, the zoom buttons, or
a double-click. Touch is untouched: one finger selects, two fingers pan and pinch.

### Two judgement calls

- **The past days are a record, not a strip.** Ticket 07 called it a strip but
  described the reason as evidence — "the day stays in the record below", and the
  winning bid is public so a new bidder can see where the price sits. A ledger of
  rows (swatch · date · holder · bid) reads as evidence; a horizontal carousel
  reads as a gallery, and on a phone it hides most of itself.
- **The accent appears once below the fold**, on "Today you bid on tomorrow's
  banner". Ticket 05 keeps magenta for the auction and nothing else, and that line
  is the one thing on the page visitors trip up on.

### Also changed

- `TitleBlock` lost `Available`, as ticket 07 required. The legend is now two
  fields on a phone and five on a desktop.
- The wordmark is the page's `h1`. With a real page under the canvas, the document
  needed a heading above the section headings.

### What to check on the preview

1. Phone: swipe up from the board — does the page move, and does the dock still
   read as the auction rather than as a thing in the way?
2. Desktop: does the wheel scroll, and does ⌘/ctrl + wheel still zoom at the
   cursor?
3. Does the counter fall to 136 after buying a 3 × 2 block on the canvas above?
4. `?data=early`: the record shows its empty line.

## Scope change (2026-08-24) — the content leaves the board page

Checked on the preview. Two things came back:

1. **The plain wheel did not scroll.** The canvas box carries
   `overscroll-behavior: none`, which stops the wheel reaching the document even
   when the canvas hands it on. ⌘/ctrl + wheel worked.
2. **The content does not belong under the board.** The dev does not want a
   document under the canvas at all. It becomes its own page, linked from the top
   bar, and **About, Terms and Privacy** are built beside it.

So this ticket now builds four pages, not a scroll:

- `/how-it-works` — the whole of ticket 07's page, in ticket 07's order. The
  counter is its `h1`.
- `/about`, `/terms`, `/privacy` — new, and not decided by any earlier ticket.
- The board page goes back to being exactly one screen.

**Ticket 02's wheel is restored, not corrected.** The plain wheel zooms again,
because the board page has nothing under it to scroll to. The earlier correction
in this ticket's comment is withdrawn — it only ever existed to serve a page that
no longer exists.

The dev asked for the texts of the three new pages to follow
**https://outbid.lol** — adapted, not copied. That site sits behind Vercel's bot
check and answers 403 to anything without a browser, so the drafts on the branch
are written from ticket 07's decided facts instead. **They are drafts.** The
outbid.lol pass still has to happen.
