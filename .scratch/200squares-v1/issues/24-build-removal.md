# 24 — Build: the admin page and removal

Type: task
Status: open
Blocked by: 11, 14, 15, 18 (15 done 2026-08-25)
Parent: ../map.md

## Question

Nothing to decide. [Ticket 11](11-admin-removal.md) settled it. Read its answer first.

- **One page behind `requireAdmin(ctx)`.** A list of blocks, a search, a **Strip** button
  with a required reason field, and an **Unfreeze** button. It may be ugly. It must work
  on a phone.
- ⚠️ **One press does four things atomically**: strip artwork and link, write the strike,
  write the `removals` row, send the mail. Four separate hand edits at midnight is how the
  wrong row gets touched.
- **`removals`** — block, owner, date, rule, action, reason as written. Kept ten years.
- **The strike counter on `owners`**, not on blocks. ⚠️ A strike **expires after twelve
  months**. The third live strike freezes **only the block that caused it**.
- **Frozen** — a fourth thing a block can be, beside the square states. Still owned, still
  on the board, but no artwork or link may be set. It renders exactly like a block waiting
  for artwork; ticket 06 already gave `pending` no deadline, so nothing else changes.
- **The strike count is visible to the owner**: *strike 2 of 3* in the removal mail
  ([ticket 22](22-build-email.md)) and in My squares.
- **The banner** — a winner takes a strike like anybody else, because the counter lives on
  the `owners` row whether or not they hold a square. Removing a banner takes it off for
  the rest of its day; the house ad stands in.

Not this ticket: any checking of where a link goes. Ticket 11 deliberately built nothing,
and `/terms` says so out loud.

`/terms` gains four lines — nothing refunded, the freeze rule, the site does not check
links, and `hello@200squares.com` for reports. Those words ride with making the copy true
again; the requirement is recorded here.
