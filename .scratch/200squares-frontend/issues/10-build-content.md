# 10 — Build: the pages beside the board

<!-- Charted as "Build: content below the canvas". The content left the board
     page on 2026-08-24 — see Scope change. -->

Type: task
Status: resolved
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

### Contact is a handle, not an address (2026-08-24)

The dev does not want the email address on the site. Contact is
**@the_robvb on X**, on all four pages.

It is a link, and the only outward link on these pages. Ticket 07 ruled out a
form and a `mailto:` because a form that silently discarded a message would be
the one place this prototype lies to a visitor. A handle is neither: it goes to a
real profile and it is answered there. Ticket 07's other rule holds — one name,
at contact, and nowhere else.

## Answer

**2026-08-24 — the pages beside the board are on `main`.**

Checked on the preview and signed off. Four pages, not a scroll: the board page is
one screen and carries nothing under it.

Preview: https://200-squares-git-ticket-10-content-robs-projects-52973834.vercel.app
`/how-it-works` · `/about` · `/terms` · `/privacy`, and `?data=early` on any of them.

### What landed

```
src/app/
  page.tsx            the board, seeded from ?data= on the server
  how-it-works/       ticket 07's page, whole and in its order
  about/  terms/  privacy/
src/components/
  site.tsx            the shell: one board, one top bar, per page
  nav.ts              the four pages, and the rule that links carry ?data= on
  content/
    how-it-works.tsx  counter → what you get → how it works → banner → FAQ → contact
    counter.tsx       the live SQUARES LEFT figure, the page's h1
    banner-record.tsx the record of past banner days, winning bids public
    content-page.tsx  the shell the three prose pages share
    section.tsx  footer.tsx  contact.tsx
  use-client-date.ts  the visitor's date, null until there is one
```

### The board page keeps the board

Ticket 07's page was built under the canvas first, and it was wrong there. The
board is the product; a board with a document under it is two products. The whole
page moved out and took the fold with it — the board page is exactly one screen
again, and it does not scroll.

**So ticket 02's wheel is restored, not corrected.** Building the scrolling
version needed the plain wheel back for the page, because a canvas that swallowed
the wheel locked every mouse user out of what was under it. With nothing under it,
that reason is gone: the wheel zooms at the cursor, exactly as ticket 02 decided.
The `overscroll-behavior: none` on the canvas box — which is what actually ate the
wheel — stays, and is now correct.

### Where the links live

The top bar carries them. A phone has room for the wordmark, one link and the
session, so it shows **How it works** — the page that sells. A desktop shows all
four. Every page beside the board ends in a footer with all four, which is where a
phone visitor looks for Terms anyway. The wordmark is the way back to the board.

### Two calls about rendering

- **The dataset is read on the server, per page.** A client-side read of the query
  string would opt every page out of server rendering, and these pages are mostly
  text. Every link carries `?data=` on, and `nav.ts` takes the name from the board
  itself rather than the URL.
- **The board is seeded per page, so navigating resets it.** Ticket 03 already
  settled this for a reload — a demo wants every visitor on the same board — and
  navigation is the same event.

### Copy

`/how-it-works` is ticket 07's text, word for word, with the counts and limits read
from `geometry.ts` so the copy cannot drift from the board. `/about`, `/terms` and
`/privacy` are new and were written from ticket 07's decided facts: price,
permanence, what you may put there, no guarantee, no visitor statistics, plus the
auction rules.

The dev asked for them to follow **outbid.lol**. That site sits behind Vercel's bot
check and answers 403 without a browser, so the pass never happened, and the dev
took the drafts as they are. They speak as if the sale is real: no
"this is a prototype" line, by decision.

Two corrections came out of reading them:

- **The copy no longer forbids resale.** The draft turned ticket 07's promise —
  your square is never taken back or resold by us — into a rule about what the
  owner may do. That closed a door, and resale is now ticket 11.
- **Contact is a handle, not an address**: @the_robvb on X, and it is a link.

### Deliberately not built

- Any resale flow. That is ticket 11, and it decides before it builds.
- An archive page for past banner days — the record shows what the dataset holds.
  Still on the map under Not yet specified.
