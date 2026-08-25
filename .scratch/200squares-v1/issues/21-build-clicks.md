# 21 — Build: counting clicks for real

Type: task
Status: claimed
Blocked by: 10, 14, 15 (15 done 2026-08-25)
Parent: ../map.md

## Question

Nothing to decide. [Ticket 10](10-clicks-for-real.md) settled it; this puts it in the
repo. Read its answer first. Prototype ticket 15 built this against a reducer — this
replaces that, and the copy from prototype ticket 16 stands.

- **The click.** A real anchor, `target="_blank" rel="noopener"`, with an `onClick` that
  fires the mutation and does **not** await it. ⚠️ Awaiting anything before the navigation
  breaks the user-gesture chain and the browser blocks the tab.
- **`clickCounts`** — one row per block, `{ blockId, count }`, patched in place. Not a row
  per click. No time field, ever: `/privacy` promises none.
- **Turnstile**, invisible, one token per board load, spent by the mutation, good for
  about 30 clicks before the widget issues another. The token is verified and thrown away.
  Nothing about the visitor is written down.
- ⚠️ **`siteClicks` is its own query against one cached row**, recomputed **hourly** by a
  Convex cron. It must **not** join the board query, and it must not be live — the
  `/how-it-works` page holds a websocket by design, and a live total would rerun it for
  every viewer on every click anywhere.
- **The reset** on a block changing hands, and the whole count landing on the largest
  remaining piece of a part sale. Tiebreak: largest by cell count, then the piece with the
  **lowest square number**.
- **My squares** shows the owner their own count and nobody else's. `Live · 0 clicks` on
  day one, bare, with no apology.

Not this ticket: sharding a hot counter row. Ticket 10 named it as the escape if one block
goes viral and deliberately left it unbuilt.
