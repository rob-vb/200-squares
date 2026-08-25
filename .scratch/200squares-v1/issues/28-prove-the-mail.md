# 28 — Prove the mail and the invoice on staging

Type: task
Status: open
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
