# 41 — Build: the declined bidder hears it

Type: task
Status: resolved
Blocked by: 38
Parent: ../map.md

## Question

Nothing to decide. [Ticket 38](38-declined-bidder-hears-nothing.md) decided it; this builds
it. Four changes, all on the close path, and two of them are repairs to
[ticket 19](19-build-auction.md)'s build rather than new work.

1. **Release the failed hold.** `closeOne` cancels only the holds below the winner
   ([`convex/auction.ts:955`](../../../convex/auction.ts)). Cancel a `failed` bid's
   PaymentIntent too, after the winning capture, in the same pass. A cancel that throws is
   let go — an authorization dies by itself and the close may not wait for it.
2. **The seventh mail**, `declinedMail` in `convex/lib/mail.ts`. It says the charge was
   refused and never why; it is not the outbid mail; its last line says the next day's
   auction is running. Sent to every bidder whose capture failed, in ladder order, after
   the winning capture, inside the same `try`/`catch` `wonMail` has.
3. **A `reason` for the refused capture**, beside the `late` one the schema already
   carries, so [`src/components/bid-placed.tsx:110`](../../../src/components/bid-placed.tsx)
   stops telling this bidder the day was decided while he was paying and that nothing was
   held. New words: *Your card was declined at the close*, then the same facts the mail
   carries.
4. **One row for yesterday in My squares.** [`convex/owners.ts:165`](../../../convex/owners.ts)
   returns only tomorrow's `held` bids. Add yesterday's `failed` and `released` bids for
   this owner: date, amount, and one word — **Declined** or **Not won**. In the bid
   section, not under *Banner days you won*. One row, nothing more.
5. **The promoted runner-up's extra sentence** in `wonMail`, only when the winner was not
   the top bid: the bid above his could not be collected, so the banner is his for his own
   amount.

⚠️ **Proving it needs a forced decline.** The close cannot be waited for. Age the day with
`npx convex run seed:ageAuction`, cancel the top PaymentIntent at Stripe by hand, then
`npx convex run auction:closeDue` — the recipe [ticket 19](19-build-auction.md) left. Build
the ladder with `node scripts/bid.mjs` and ⚠️ **a different address per run**, or there is
no runner-up to promote. `hi+bid1@robvb.com` and `hi+bid2@` both deliver, and Resend's log
(`GET https://api.resend.com/emails`) is the fastest way to read what left.

Check all four mails of one close: the declined bidder's, the promoted winner's, the
invoice, and the releases below. The one that matters is the first, because it is the one
nobody has ever seen.

## Answer

**Built, and proved on staging through three shapes of the close.** All five changes
are in. The one that matters — the mail nobody had ever seen — was delivered and read
back out of Resend's log.

### What changed

1. **`bids.failure`, stored** (`convex/schema.ts`). The ticket asked for a `reason`
   "beside the `late` one the schema already carries"; the schema carried none. `late`
   and `closed` were *derived* in `bidBySession` from `captureBefore`, and a refused
   capture cannot be told from a decided day that way — both leave a `failed` bid whose
   hold outlived the close. So the word is written at all three failure sites and
   `bidBySession` reads it, falling back to the old derivation for rows written before
   the field existed.
2. **The refused hold is cancelled** (`convex/auction.ts`, `closeOne`). Every rung the
   bank refused goes into a `refused` list; after the day is decided — winner or house
   ad — each one's PaymentIntent is cancelled, and a cancel that throws is let go. The
   `if (!won) return` early exit became an `if/else`, because ticket 38's third shape is
   the whole ladder failing and those bidders are owed the same thing.
3. **`declinedMail`, the seventh message** (`convex/lib/mail.ts`). Sent after every hold
   is gone, never before — a Resend outage may not leave a hold frozen — inside the same
   `try`/`catch` `wonMail` has, one per bidder, ladder order.
4. **The status page has its own screen** (`src/components/bid-placed.tsx`). *Your card
   was declined at the close*, placed **above** the two branches that used to swallow it.
5. **One settled row in My squares** (`convex/owners.ts`, `src/components/panel/my-squares.tsx`).
   `owners.mine` gained `settled`: the bids for **today** — the day the close just
   decided — that ended `released` or `failed`+`declined`, as **Not won** or **Declined**.
   Only those two: a `late` or `closed` failure never held money and the bidder was told
   at the keyboard, so calling it *Declined* would invent a refusal.
6. **`wonMail` gains a sentence when `index > 0`**: the bid above his could not be
   collected, so the banner is his for his own amount.

⚠️ **The empty-state line changed too.** *You have not bid.* under a row saying he bid
$140 today is the same kind of untruth this ticket came to remove. With a settled row it
reads **You have no bid standing.**

### The proof

Three closes on staging, Stripe test mode, `seed:ageAuction` → cancel the top
PaymentIntent by hand → `auction:closeDue`.

**One decline with a promotion under it.** Ladder $140 / $120 / $100, top hold cancelled.
All four mails of the close delivered (Resend log):

| To | Mail |
| --- | --- |
| `hi+bid8@` $140 | *Your card was declined for the 200 squares banner on 2026-08-26* |
| `hi+bid7@` $120 | *You have the 200 squares banner…* — **with** the promoted sentence |
| `hi+bid7@` | the invoice |
| `hi+bid6@` $100 | nothing, and released, which is right |

The declined mail, verbatim from Resend: *"Your bid of $140 was the highest… your bank
refused the charge… We do not know why, and we will not guess. Your bank can tell you…
The hold on your card is released and nothing was taken from you… The auction for the
next day is running."* No decline code, no selling.

The promoted winner's mail carries *"You were not the highest bid. The bid above yours
could not be collected, so the banner is yours, for your own amount and nothing more."*

**The status page** (`t41-declined-page.png`): *Your card was declined at the close* —
where it used to say the day was decided while he was paying and that nothing was held.

**My squares**, both endings, one row each:

- `hi+bid8@` (`t41-mine-declined.png`): *You have no bid standing.* · **Today · Declined · $140**
- `hi+bid6@` (`t41-mine-notwon.png`): *You have no bid standing.* · **Today · Not won · $100**

**The whole ladder failing.** One bid, cancelled, closed: the day row was written with no
owner — the house ad takes it — and `hi+bid9@` still got his declined mail. The `!won`
branch pays its bidders.

### ⚠️ What could not be proved here

**The cancel of a refused hold is unobservable in Stripe test mode.** The only way to
force a capture decline is to cancel the PaymentIntent first, and then the close's own
cancel hits an already-cancelled intent and is swallowed by the same `catch` that exists
for retries. Stripe publishes no test card whose authorization succeeds and whose capture
is refused. The code runs on every close and the money ends released either way; what
staging cannot show is the close being the thing that released it. Live mode will not
show it either, and nobody should go looking — it is the branch that only a real bank
refusal reaches.

### What this hands on

- [40 — Making the copy true again](40-copy-true-again.md) still owes `/terms` ticket
  38's line: the highest bid does not always win. Nothing here wrote it, and the copy is
  now behind a site that behaves correctly rather than ahead of one that does not.
- `CONTEXT.md` and `PRODUCT.md` describe six mails. There are **seven**. Ticket 40's list
  to fix.
