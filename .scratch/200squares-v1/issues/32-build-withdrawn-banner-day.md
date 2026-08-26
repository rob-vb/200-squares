# 32 — Build: a withdrawn banner day

Type: task
Status: resolved
Blocked by: —
Parent: ../map.md

## Question

Build [ticket 31](31-a-bid-that-does-not-stand.md)'s answer. Nothing here is a decision: the
decisions are made and the words are written. This is the smallest build on the map.

### The mutation

⚠️ **`removeBanner` cannot be reused.** `convex/admin.ts:226` takes a banner day off for the
rest of its day — the right effect — but it also counts a **strike**, sends the **removal
mail** (*you broke rule X*) and writes a `removals` row with a `rule`. A withdrawal is not a
rule break, and the file says so itself:

> The bid is not returned. `/terms` says so, and ticket 11 held it: this is the bidder
> breaking the contract rather than withdrawing from it.

So: a second, smaller mutation beside it. `withdrawBanner({ date })`, admin only.

- Patches the `bannerDays` row the way `removeBanner` does — `removedAt`, `artwork: null`,
  `url: ""` — so the board and the click counter see it at once and the house ad takes over.
- Releases the artwork file, same as `removeBanner`.
- **No strike.** `owner.strikeAt` is untouched.
- **No removal mail.** ⚠️ Whether a *confirmation* mail goes out is ticket 13's list of six,
  and this build may not extend it on its own. Default: no mail. The dev is already in the
  thread — they are answering the withdrawal message by hand.
- Records what happened. A `removals` row wants a `rule`, and there is none. Either give the
  row an honest marker or write it somewhere else — whichever keeps `convex/admin.ts:336`'s
  admin list readable, since it prints `Banner <date>` off exactly these rows.

The refund is **not built**. The dev computes hours-run ÷ 24 × bid and refunds in the Stripe
dashboard. ⚠️ Art. 13(1): within 14 days of the message.

### The copy

Ticket 31 wrote the words. Copy them across.

- **`/terms`**, `src/app/terms/page.tsx:71-73`, the daily banner paragraph → ticket 31 §6.
  ⚠️ It carries **ticket 19's debt** as well: *"the highest bid at 00:00 UTC wins and is
  charged"* is false in the case the ladder exists for. Same paragraph, so it goes in the same
  edit, and it comes off the map's *making the copy true again* list.
- **`src/lib/checkout/consent.ts`**: a fourth `BID_TRUTHS` line — *"A bid cannot be
  withdrawn."* — and a sharpened `BANNER_WITHDRAWAL_INFO`. ⚠️ `BANNER_WITHDRAWAL_TEXT` does
  not change: the tick is already right, and the file header warns that changing one of these
  changes what new orders record.
- **`CONTEXT.md`**, the **Bid** entry. Done on 2026-08-26 with ticket 31, so only check it
  still matches what shipped.

### Proving it

⚠️ There is no script for this and the close cannot be waited for. `npx convex run
seed:ageAuction` then `npx convex run auction:closeDue` puts a real winner on a real day
(map Notes), and `withdrawBanner` runs against that. What to see: the banner gone, the house
ad up, `owner.strikeAt` unchanged, no mail sent.

## Context

- Opened 2026-08-26 out of [ticket 31](31-a-bid-that-does-not-stand.md).

## Answer

**Built: `withdrawBanner` is `removeBanner` with the blame taken out, and the
`removals` row records the withdrawal by *absence*.** Resolved 2026-08-26.

### The mutation

`convex/admin.ts`, beside `removeBanner` and deliberately not inside it. It patches
the same three fields on the `bannerDays` row — `removedAt`, `artwork: null`,
`url: ""` — and calls the same `release(ctx, old)`, so the board, the click
counter and the file storage all behave exactly as they do for a removal. Then it
stops. No `owner.strikeAt` push, no `internal.mail.removed`, and it returns
nothing, because there is no strike count worth telling the caller.

⚠️ **The `removals` row has no `rule`, and that absence *is* the record.**
`removals.rule` is now `v.optional(v.string())`. The alternative — a sentinel rule
string, or a `rule` plus a `withdrawn: true` flag — was rejected for one reason:
two fields about the same row can disagree, and one field cannot. The query
derives `withdrawn: row.rule === undefined` on read, so the page gets an explicit
flag and the table stores no duplicate truth. The admin list prints
**Withdrawn by the bidder · no strike** where a removal prints its rule.

⚠️ **`reason` changed meaning without changing type.** On a removal it is words the
owner reads; on a withdrawal nothing is sent, so it is the dev's own note. It is
still required, by `noteOf` beside `reasonOf` and in the same shape: this row is
the *only* thing the act leaves behind, and in 2036 *a day went off and nobody was
struck* has to be explainable.

### The page

`/admin`'s banner row now has two doors. **Take the banner off** is unchanged.
**The bidder withdrew** is a collapsed button that opens a second, smaller form —
no rule picker, a note that goes to nobody, and a button that says
*Take the day off — no strike*.

⚠️ **One thing the screenshots caught that the ticket did not foresee**: opened,
the two forms are two textareas stacked under one another, and pressing the wrong
one costs a strike and a *you broke rule X* mail. So the second names itself in a
bold line above its box. That is this page's own founding argument — *four hand
edits in three tables at midnight is how the wrong row gets touched* — turned on
the page itself.

A smaller thing, accepted: after the press the row falls into the shared
*Taken off for the rest of today. The house advertisement is standing in.* branch,
so the withdrawal's own confirmation is never seen. The sentence is true either
way and the removed branch cannot tell the two apart without carrying more state.

### The copy

- **`/terms`**, the daily banner paragraph, rewritten whole in ticket 31 §6's
  words: three paragraphs became five. Sentence two settles **ticket 19's debt** —
  *"The highest bid at 00:00 UTC wins and is charged"* was false in exactly the
  case the ladder exists for, and it is gone. ⚠️ *"the day stays in the public
  record with the winning bid on it"* **stays and is still untrue**: ticket 30 left
  that promise unbuilt, and it is not this ticket's.
  ⚠️ **The close time is now stated twice** in consecutive paragraphs — once to set
  the auction up, once to explain why a bid cannot be withdrawn. Ticket 31's
  sentence was kept whole on purpose: it has to be true read alone.
- **`src/lib/checkout/consent.ts`**: a fourth `BID_TRUTHS` line, *"A bid cannot be
  withdrawn."*, and `BANNER_WITHDRAWAL_INFO` sharpened — *"If your banner day has
  already started"* was a condition that is never false. `BANNER_WITHDRAWAL_TEXT`
  untouched, as the ticket required.
- **`CONTEXT.md`** checked: the **Bid** entry ticket 31 wrote already matches what
  shipped. No edit.

### Proved on staging

`scripts/withdraw.mjs` is new, because there was no other way to press the button:
the close fires once a day, `withdrawBanner` is admin-only, and the VPS has no
browser and no inbox. It starts from `.auth.json`, opens `/admin` and drives the
form.

Run twice end to end — `scripts/bid.mjs` → `seed:ageAuction` → `auction:closeDue`
→ `withdraw.mjs` — against a real Stripe test-mode capture. What was seen:

- `board:state.banner` is `null` and the board shows the **house ad**
  (*THIS SPOT TOMORROW · Bid from $100*).
- the `bannerDays` row carries `removedAt`.
- the winner's `owners.strikeAt` is still `[]` — **no strike**.
- the `removals` row has `bannerDate`, the note, `froze: false` and **no `rule`**,
  and the list renders it as *Withdrawn by the bidder · no strike*.
- **no mail**: the mutation schedules nothing.

⚠️ **The artwork release was not re-exercised** — neither winning bid carried a
picture, so `release(ctx, old)` returned at its first guard. It is the identical
call `removeBanner` makes, proved under ticket 20.

⚠️ Found on the way, and it belongs to [ticket 28](28-prove-the-mail.md): the
Convex **dev** deployment already has `ADMIN_EMAILS`, `SEED_ENABLED` and all four
`BUSINESS_` variables set. Ticket 24's *"`ADMIN_EMAILS` is unset, so `/admin`
admits nobody"* is out of date on dev. Nothing is known about prod.

### What this does not do

The **refund is still by hand**, in the Stripe dashboard, at hours-run ÷ 24 × bid,
and Art. 14(3) dates it from the bidder's message rather than from the press. No
mail was added: ticket 13's list stays at six.
