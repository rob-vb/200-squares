# 32 — Build: a withdrawn banner day

Type: task
Status: open
Assignee: claude (session 2026-08-26)
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
