# 22 — Build: the mail

Type: task
Status: resolved
Blocked by: 13, 14, 15, 18 (all done 2026-08-25 — this is now on the frontier)
Parent: ../map.md

## Question

Nothing to decide. [Ticket 13](13-email.md) settled which messages exist and what each
carries. Read its answer first.

- **Six messages**: magic link; order confirmed with the invoice; you have been outbid;
  you won today's banner; we refunded you in full; your block was removed. Plus the
  artwork reminders at 1, 7 and 30 days, the last one saying it is the last.
- ⚠️ **Stripe's own email receipts are OFF**, in test mode and in live mode. The site
  issues the invoice ([ticket 17](17-invoice-document.md)); a Stripe receipt is not a VAT
  invoice, and two documents where the prettier one is invalid is the worst option.
- **From `200 squares <hello@200squares.com>`**, through the verified
  `send.200squares.com` subdomain.
- ⚠️ **A reply must reach a person.** Cloudflare Email Routing forwards `hello@` to the
  dev's inbox — one more DNS record for [ticket 14](14-environments-and-keys.md). Ticket
  08 made "email the dev and prove the payment" the official account-recovery route, and a
  `no-reply@` would make that promise false.
- ⚠️ **Auction mail states the close time, never a countdown.** Every mail must be true
  whenever it is read. No suppression of a late outbid mail, and no "closes in an hour"
  reminder at all.
- **No bid confirmation.** The first bid's mail is the magic link, not a receipt.
- **Tone**: plain, short, stops when done. No exclamation marks, no link footer, no
  unsubscribe — every message is transactional.

`/privacy` gains two facts (Resend is a processor; the address is now a key) and one
sentence that keeps both promises true: an **email address belongs to an owner**, while
the clicks promise is about a **visitor**. Those words ride with making the copy true
again; the requirement is recorded here.

Test it by sending to a real inbox from the staging deployment. Ticket 13 cannot be
verified any other way, and [ticket 14](14-environments-and-keys.md) step 9 is what makes
it possible.

## From resolved decisions

[Ticket 18](18-build-accounts.md) built the **transport** and one of the six messages.
`convex/lib/mail.ts` is a plain `fetch` to Resend with `sendMail({ to, subject, text })` and
the magic link's words in it, sending from `200 squares <hello@200squares.com>`. Add the
other five to it; do not build a second way out.

⚠️ **Stripe's own receipts are still on.** Ticket 18 had no reason to touch them and did
not. Switching them off, in test mode and in live mode, is this ticket's.

## Answer

**Five messages added to ticket 18's transport, the reminders booked by the scheduler
rather than swept for by a cron, and one thing left that only the dev can press.**

### What was built

`convex/lib/mail.ts` keeps the words and `convex/mail.ts` keeps the sending. The split is
the one Convex forces: a mutation may not reach the network, so every send is an
`internalAction` and every caller **schedules** it. That is also the failure worth having —
a Resend outage leaves a payment landed and a mail missing, never the other way round.

The six are now complete:

| Mail | Where it is sent from |
| --- | --- |
| Magic link | `auth.ts`, ticket 18 |
| Outbid, won | `auction.ts`, ticket 19 |
| **Order confirmed, with the invoice** | `checkout.fulfil` schedules `mail.orderConfirmed`; `auction.closeDue` calls it for a banner |
| **We refunded you in full** | `http.ts`, inside the branch where Stripe took the refund |
| **Your block was removed** | `admin.strip` / `admin.removeBanner` ([ticket 24](24-build-removal.md)) |

Plus the artwork reminders at **1, 7 and 30 days**, the thirtieth saying it is the last.

### Three decisions the build had to make

⚠️ **The refund mail sits inside the success branch of `refunds.create`.** It says the money
is on its way back, which the site may not claim until Stripe has taken it — and a webhook
retry lands in the `catch` with `charge_already_refunded`, so nobody is told twice. There
is no `refundMailedAt` column and none is needed.

⚠️ **The reminders are scheduled, not swept.** `fulfil` books all three the moment the
block is written, and each one looks at the block before it sends: artwork present,
refunded, or frozen and it sends nothing. A cron would have needed a column to remember
what it had already sent; a scheduled job that checks the state it is about to talk about
needs no column at all.

⚠️ **The banner's invoice mail goes after `wonMail`, not scheduled from `recordWin`.**
`wonMail` ends *your invoice follows*, so an invoice that overtakes it makes the site's own
copy read backwards. `closeDue` sends one and then the other, and both are wrapped: a
banner day that is won, collected and on the board is not undone by a document that can be
written again.

### ⚠️ The one thing left, and it is not code

**Stripe's own receipts are still on.** There is no API for it — it is a dashboard switch
per mode — so it stays *Part 1, step 4* of
[`docs/setup-checklist.md`](../../../docs/setup-checklist.md): Stripe → Settings →
Customer emails → **Off**, in test mode **and** in live mode. Until that is pressed a buyer
gets two documents and the prettier one is not a VAT invoice, which ticket 13 called the
worst of the three options.

### What is not verified

Every message compiles, deploys and reads correctly, and the transport is the one ticket 18
already proved with the magic link. **No message on this list has been sent to a real
inbox**, because that needs a payment on the staging deployment and an inbox in the loop.
That is *Part 1, step 8* now, and ticket 13 cannot be closed out any other way.

`/privacy` still owes its two facts (Resend is a processor; the address is a key) and the
sentence that keeps the owner/visitor distinction true. Those ride with **making the copy
true again**, exactly as this ticket said.
