# 24 — Build: the admin page and removal

Type: task
Status: resolved
Blocked by: 11, 14, 15, 18 (all done 2026-08-25 — this is now on the frontier)
Parent: ../map.md

## Question

Nothing to decide. [Ticket 11](11-admin-removal.md) settled it. Read its answer first.

- **One page behind `requireAdmin(ctx)`.** A list of blocks, a search, a **Strip** button
  with a required reason field, and an **Unfreeze** button. It may be ugly. It must work
  on a phone.
- ⚠️ **One press does four things atomically**: strip artwork and link, write the strike,
  write the `removals` row, send the mail. Four separate hand edits at midnight is how the
  wrong row gets touched.
  ⚠️ *Stripping artwork is not only setting the field to null.* The two files stay in Convex
  until something deletes them, and [ticket 20](20-build-artwork.md) left the deleter:
  `release(ctx, old)` in `convex/art.ts` takes what a row stopped pointing at, unless
  something else still points at it. Use it, or the daily orphan sweep is the only thing
  that ever collects a removed block's picture.
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

## Answer

**One page, one press, four writes in one transaction — and the banner and the block go
through the same door.**

### The page

`/admin`, `src/components/admin/admin-board.tsx`. A search, today's banner if somebody
holds it, every block, and the last fifty removals. One column, big targets, no layout that
needs a mouse. It is ugly and it works on a phone, which is the bar ticket 11 set.

The search runs on the server over the owner's name, their address and the link — the three
things a report ever names — because an admin on a phone should not be sent 199 rows to
filter.

⚠️ **`admin.mayI` exists so the page is not an exception.** Every query and mutation here is
behind `requireAdmin(ctx)` and every one of them **throws**, which in React is an error
boundary rather than a page. `mayI` answers the same question as a plain yes or no, grants
nothing, and lets a stranger meet a flat *that is not your page*.

### The press

`admin.strip` does four things in one mutation: strips the artwork **and** the link, pushes
the strike onto `owners.strikeAt`, writes the `removals` row, and books the mail. The mail
is scheduled from inside the transaction, so if the write rolls back nothing was ever
booked, and if it commits the mail is on the list whatever Resend is doing. That is the
whole argument against the Convex dashboard, built.

⚠️ **`release(ctx, old)` is called**, exported from `convex/art.ts` for this. Stripping is
not only setting the field to null — the two WebP files would sit in storage until the
daily orphan sweep noticed, and what was reported would stay reachable at its `/art` URL
in the meantime.

### The strike rule

- Counted on the **owner**, as a list of timestamps; `liveStrikes` reads whatever is inside
  the twelve-month window. Nothing expires by being deleted.
- The **third live strike freezes only the block that caused it**. `frozen: block.frozen ||
  frozen`, never a sweep over the owner's other squares.
- **Visible to the owner**: `Strike n of 3` in the removal mail, and a line at the top of My
  squares — which says nothing at all at nought, because a counter at zero on a page about
  your own squares reads as an accusation.
- **Unfreeze** is one button, it does not clear the strikes, and it is not in `/terms`.
  Clearing them would make the next removal read as the first.

### The banner

`admin.removeBanner` sets `removedAt` — which `convex/board.ts` and `convex/clicks.ts`
already read, so the house ad stands in the moment it commits — and takes the artwork with
it, for the same reason `strip` does. The winner takes a strike like anybody else, because
the counter lives on the `owners` row. The bid is not returned.

A banner removal writes `froze: false` always: a banner day is not a block and there is
nothing there to freeze. The strike still counts, and it is what a later third one will
freeze a *block* on.

### ⚠️ Before the page admits anybody

`ADMIN_EMAILS` on the Convex deployment. Unset admits **nobody**, including the dev, which
is the safe way round and is why `/admin` currently renders *that is not your page* on the
dev deployment. Added as *Part 1, step 7* of
[`docs/setup-checklist.md`](../../../docs/setup-checklist.md).

**Nothing has been stripped on a deployment**, because nothing may be until that variable
is set and the page can be signed into.

### Not built, on purpose

Any checking of where a link goes. Ticket 11 refused it and `/terms` says so out loud.

The rule list beside the reason field is a **copy** of `/terms`, and the server does not
validate it: `/terms` is the source, a rule reworded there must not make an old `removals`
row unreadable, and the only caller is the dev.

`/terms` still owes its four lines — nothing refunded, the freeze rule, the site does not
check links, and `hello@200squares.com` as the place to report a block. Those ride with
**making the copy true again**, exactly as this ticket said.
