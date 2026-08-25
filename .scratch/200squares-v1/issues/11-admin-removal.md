# 11 — Managing the board: removing a block

Type: grilling
Status: resolved
Blocked by: 05, 08
Parent: ../map.md

## Question

Charting settled the policy and left the mechanism open. **The dev does not approve
artwork before it appears.** They do want to remove a block afterwards, with a
reason. **Nothing is refunded by default** and the dev decides per case — otherwise
breaking the rules becomes a free way to get a refund.

With real buyers there will be porn, malware, scams and dead links on this board.

- **What removal does to the squares.** Do they go back to `available` and get sold
  again, or does the block stay owned with the artwork stripped? The second keeps the
  promise that a square is permanent and pay-once. The first is what a seller wants.
  These pull against each other and `/terms` will state whichever wins.
- **What removal does to the money**, given no refund is the default.
- **What the owner is told**, and whether they can answer back.
- **Where the dev does it.** An admin page behind Better Auth, or a Convex dashboard,
  or a script. The cheapest thing that works on a phone at midnight is probably
  right.
- **Links.** Artwork is not the only risk: a block's link can point somewhere clean
  today and somewhere else tomorrow, and the owner may change it whenever they like.
  Does anything watch it?
- **The rules themselves.** Removal needs something to remove *against*. `/terms`
  today says almost nothing about what artwork is not allowed to be. That list has to
  exist before the first removal, not after.
- **A record.** What was removed, when, why. This is the one place where a dated log
  is obviously right, and it is worth checking it does not contradict `/privacy` —
  it should not, because it is about an owner, not a visitor.
- **The banner.** The same problem, on the biggest surface on the board, for one day.
  A removal there is more urgent and the auction already took the money.

## Answer

**Strip the artwork, keep the square, count the strike. Three strikes in twelve months
freezes the block, and nothing is ever refunded.**

### ⚠️ First: this ticket's premise was stale

The ticket says *"`/terms` today says almost nothing about what artwork is not allowed to
be. That list has to exist before the first removal, not after."*

**The list already exists**, and so do two other answers this ticket went looking for.
`/terms` says today:

- Not allowed: **adult content; malware; impersonation; deceptive redirects; chat or
  invite links such as Telegram, WhatsApp or Discord; and link shorteners.** Link to a
  product, a company or a profile on your own domain.
- *"Artwork or a link that breaks these rules is taken off the grid. **The square stays
  yours: put something else on it.**"*
- *"A square is only emptied for the rule it broke, and **you are told which one**."*
- The banner: *"removed for the rest of its day and **the bid is not returned**."*

So **what removal does to the squares was already decided**: the block stays owned and the
artwork is stripped. The permanent, pay-once promise wins over the resell-it argument, and
it wins in writing. This ticket does not reopen it.

### The repeat offender, which `/terms` did not answer

*"Put something else on it"* is a loop with no exit. Strip it, they upload it again, at
three in the morning, every night. The owner always wins that fight because stripping is
work and uploading is not.

**Three strikes in a rolling twelve months freezes the block.** Frozen means: still theirs,
still on the board, but they may no longer set artwork or a link on it. It reads to a
visitor exactly like any block waiting for artwork — no public shaming, and ticket 06
already ruled that `pending` has no deadline, so nothing else has to change.

Four things make that rule work:

- ⚠️ **Strikes count on the owner, not on the block.** Per-block counting hands somebody
  with four blocks twelve strikes. But the **third strike freezes only the block that
  caused it** — freezing all four punishes blocks that did nothing.
- ⚠️ **A strike expires after twelve months.** The rule exists for a pattern that runs over
  days, not years. Permanent strikes would eventually freeze somebody who makes one mistake
  a year, which is not what it is for, and a real repeater never gets near the expiry.
- **The dev can unfreeze.** It is not a right in `/terms` and it is not advertised. The
  button exists because *never, no exceptions* is a promise the dev will want to break
  once, and then `/terms` is in their way.
- **The owner can see it coming.** The removal mail says *this is strike 2 of 3*, and the
  count sits in My squares. Freezing somebody who never knew they were at two is the exact
  complaint worth designing out, and deterring is better than punishing.

### The money

**`/terms` says "nothing is refunded", flatly.**

Charting fixed the policy — no refund by default, the dev decides per case — and this
decides the wording. *"Nothing is refunded, but we may make an exception"* invites every
removed owner to ask for the exception. The dev keeps the freedom; they just do not
advertise it. Saying nothing at all leaves a gap for somebody to claim into later.

The banner's *"the bid is not returned"* already stands and is defensible against a
consumer, because this is the bidder breaking the contract, not withdrawing from it —
a different thing from the pro-rata case in [ticket 07](07-auction-holds.md).

### Answering back

**They reply to the mail.** It comes from `hello@200squares.com` and
[ticket 13](13-email.md) put a real inbox behind it.

No appeal process, no status in the account. One person cannot run an appeals procedure,
and building one is promising a service that gets broken in a busy week. A reply to a mail
is exactly enough.

### ⚠️ Nothing watches the links, and `/terms` says so

A link is clean today and malware tomorrow, and the owner may change it whenever they
like. Artwork sits on the board where the dev can see it; a destination does not.

**Nothing checks.** A cron over a safe-browsing list is its own project — an API key, a
quota, false positives, and 199 outbound checks on a schedule. Re-checking on change misses
the actual attack, where nothing changes on this side at all.

So the site acts on a report, and **`/terms` states the limit out loud**: *the site does
not check where a link goes.* This is the site's own voice — it does not pretend — and it
protects the dev: a visitor who lands somewhere unpleasant can read that the site never
promised otherwise. Silence would read as a promise nobody made.

**`hello@200squares.com` goes in `/terms` as the place to report a block.** After the
decision above, a report is the *only* signal about links the site will ever get, so it
must be easy to find. Not a report button in the panel: that is a new unauthenticated
write, so Turnstile, so abuse handling, so build — for a site with no visitors yet.

### The record

**A `removals` table**: block, owner, date, which rule, what was done, and the reason as
written. Kept ten years, like orders.

It does not touch `/privacy`, and the reason is worth stating in the same words the whole
map now uses: `/privacy` promises nothing is kept about a **visitor**, and this is about an
**owner**. Same distinction as the email address in ticket 13.

Without it the three-strike rule is unbuildable — there is nothing to count.

### Where the dev does it

**One admin page on the site, behind `requireAdmin(ctx)`** ([ticket 08](08-accounts.md)).
A list, a search, a **Strip** button, a required reason field, and an **Unfreeze** button.

One press must do all four things at once: strip the artwork and link, write the strike,
write the `removals` row, and send the mail. That is the whole argument against the Convex
dashboard, which costs nothing to build and asks the dev to edit rows in three tables by
hand at midnight — which is how the wrong row gets touched. A script fails the other test:
it does not work on a phone.

The page can be ugly. It is one list and one button.

### The banner

**A banner winner takes a strike like anybody else**, because the counter lives on the
`owners` row and [ticket 08](08-accounts.md) gives a bidder one whether or not they hold a
square.

Without it the banner is a free practice ground: bid, publish something vile, lose one day
and the bid, come back tomorrow. The daily punishment is real but it has no memory. The
strike is the only thing that looks across days, and it costs nothing extra.

### What `/terms` gains

Four things, riding with **making the copy true again** on the map:

1. *Nothing is refunded.*
2. The freeze rule — three strikes in twelve months, and what frozen means.
3. *The site does not check where a link goes.*
4. `hello@200squares.com` as the place to report a block.

The rules themselves need no change. They were already there.
