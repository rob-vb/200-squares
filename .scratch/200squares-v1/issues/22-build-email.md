# 22 — Build: the mail

Type: task
Status: open
Blocked by: 13, 14, 15, 18
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
