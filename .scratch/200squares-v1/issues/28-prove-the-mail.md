# 28 — Prove the mail and the invoice on staging

Type: task
Status: resolved
Blocked by: 22, 23, 24 (all done 2026-08-25 — this is on the frontier)
Parent: ../map.md

## Question

Nothing to decide. This is the half of [tickets 22](22-build-email.md),
[23](23-build-invoice.md) and [24](24-build-removal.md) that an agent cannot do: it needs
values only the dev holds, an inbox only the dev reads, and one dashboard switch.

⚠️ **Until this is done, three tickets are built and none of them is proved.** Ticket 13
said the magic link is the one mail that may not fail, and the only test it accepts is a
message that arrives.

### 1. Five variables on the Convex dev deployment

```sh
npx convex env set BUSINESS_NAME "..."
npx convex env set BUSINESS_ADDRESS "..."
npx convex env set BUSINESS_KVK ...
npx convex env set BUSINESS_VAT_ID NL...B..
npx convex env set ADMIN_EMAILS you@example.com
```

⚠️ **`BUSINESS_ADDRESS` is frozen into every document it issues** (ticket 17's write-once
rule), so changing it later does not rewrite an invoice already written. On staging that
costs nothing — a staging invoice is a test document. On **prod** it is a choice to make
before the first real sale. The dev holds it; [ticket 29](29-invoice-address.md) records
what the site does and does not show.

⚠️ **Your real values.** The four `BUSINESS_` ones are printed on a legal document and
frozen into it at issue time, so a wrong VAT number is a real problem and not a typo — which
is why ticket 23 refused to invent one. `ADMIN_EMAILS` unset admits **nobody**, so `/admin`
says *that is not your page* to the dev as well until it is set.

Then set the same five on prod, later, with the rest of
[ticket 25](25-launch.md)'s list.

### 2. Stripe's own receipts, off

Stripe → Settings → Customer emails. **Off, in test mode and in live mode.** There is no API
for it. Ticket 13 called two documents where the prettier one is not legally valid the worst
of the three options, and until this switch is pressed that is what a buyer gets.

### 3. One purchase, end to end, and read the mail

`node scripts/flow.mjs` buys a square on staging in Stripe test mode. Then look at a **real
inbox**, with an address the dev can read:

- the **magic link** arrives, and works;
- the **order confirmed** mail arrives, carries the invoice link and the artwork link, and
  the artwork link works with no account;
- the **invoice** opens, and every line on it is right — the number, the KVK and the
  BTW-identificatienummer, the date of supply, the customer, and the **VAT amount in euros**
  beside the USD total with the ECB rate and the date it was published.

⚠️ An order paid before the `BUSINESS_` variables were set already holds its number and its
token. The nightly `finish unwritten invoices` cron renders the document the first night
after they exist; `npx convex run invoices:sweepMissing` does it now.

### 4. One bid, and one close

`node scripts/bid.mjs` twice from two addresses, then `npx convex run seed:ageAuction` and
`npx convex run auction:closeDue`. Read the inbox again: the **outbid** mail, the **won**
mail, and then the **banner invoice** mail — in that order, because the won mail ends *your
invoice follows*.

### 5. One strip, on a seeded block

Sign in as the admin, open `/admin` on a phone, and strip one seeded block with a real
reason. Check three things: the picture is gone from the board **and** its `/art` URL is a
404, the removal mail arrives with the reason as written and *strike 1 of 3*, and the count
shows in My squares.

### What this ticket is not

It is not [ticket 25](25-launch.md). Nothing here touches production, Vercel Pro or a live
Stripe key. This proves the build on staging; ticket 25 is the switch on the day.


---

## Answer (2026-08-26)

**Everything on the list was driven on staging, and every message reached a real inbox.**
Three things it was not looking for came out of it, and each has somewhere to go.

The address is `hi@robvb.com`, and **`robvb.com` accepts plus addressing** —
`hi+bid1@`, `hi+bid2@`, `hi+strip@` all delivered. That is what makes the bid ladder
testable at all: [`scripts/bid.mjs`](../../../scripts/bid.mjs) needs two different
addresses and there is only one inbox here.

### What was proved

| Step | What was run | Result |
|---|---|---|
| 1 · variables | already set on the Convex **dev** deployment | `Everblaze`, `Zilverschoon 104 · 7577 CB Oldenzaal`, KVK `57288135`, BTW `NL001183466B61`, admin `hi@robvb.com` |
| 2 · Stripe receipts | dev looked | **there is no *Off*** — the switch is the individual toggles, and they are all off in test and live |
| 3 · purchase | `EMAIL=hi@robvb.com node scripts/flow.mjs` | square 199, $250.00 incl. $43.39 VAT; magic link **delivered**; *Your squares on 200 squares* **delivered**, carrying the invoice link and the no-account artwork link |
| 3 · invoice | `2026-0010`, then `2026-0011` | number, KVK, BTW, dates, customer and the VAT split all right — ⚠️ **the euro line was missing on the first one**, see below |
| 4 · bid ladder | `bid.mjs` $1,250 then $1,300, `seed:ageAuction`, `auction:closeDue` | **outbid** → **won** → **banner invoice**, all delivered, in that order; banner invoice `2026-0012` complete |
| 5 · strip | `scripts/strip.mjs` (new) at phone width | strike **1 of 3** on the owner and in My squares, `removals` row carries the rule and the reason, mail delivered with the reason word for word — ⚠️ **but the picture is still at its URL**, see below |

`node scripts/flow.mjs` now takes `EMAIL=`. [`scripts/strip.mjs`](../../../scripts/strip.mjs)
is new: it is the only way to press *Strip*, the way `withdraw.mjs` is the only way to press
*The bidder withdrew*. `scripts/shot.mjs` gained `TEXT=1` and `AUTH=1` — an invoice is read,
not looked at, and a screenshot cannot be checked line by line. `scripts/bid.mjs` now
photographs a refusal instead of dying on a bare timeout.

### The three things it found

1. ⚠️ **The first invoice on a deployment has no euro amount, for ever.** The ECB cron runs
   at 17:00 UTC, so a fresh deployment's `fx` cache is empty; the invoice is issued anyway
   (deliberately) and ticket 17's write-once rule means it is never repaired. `2026-0010`
   has no euro line and never will. On prod that invoice is **the first real sale**. It is
   one command, before opening — added to [ticket 25](25-launch.md) as step 8.

2. ⚠️ **A stripped picture keeps serving from its own URL.** The file really is deleted from
   Convex — `?bust=1` gives a 404 — but Vercel's edge holds it for a year under the
   `immutable` header ticket 09 put there. The board is clean and the reported picture is
   not gone. → [ticket 34](34-stripped-art-stays-cached.md).

3. ⚠️ **A refused bid says nothing where the bidder is looking.** The message goes to the
   amount field at the top of a panel that scrolls inside itself; the button is at the
   bottom, is not disabled, and promises *obliges you to pay if you win*.
   → [ticket 35](35-a-refused-bid-says-nothing.md).

### What is still only true on dev

`countryMismatch` is **true** on every order the scripts made — the panel says NL and
Stripe's billing country says FI, because the script fills no country at Stripe. Ticket 06's
rule works: the order is taken and flagged. Nothing reads the flags, which is the map's
*Who reads the flagged orders* fog and stays there.

⚠️ **None of this touched production.** The five variables, Stripe's live-mode toggles and
the ECB rate all have to be done again there, on [ticket 25](25-launch.md)'s list.
