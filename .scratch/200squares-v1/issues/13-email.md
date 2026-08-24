# 13 — Email

Type: grilling
Status: open
Blocked by: 04, 06, 07, 08
Parent: ../map.md

## Question

Resend is chosen. What it sends is not.

The site has no email at all today. Now it has messages it cannot work without — the
auction is dead without "you have been outbid" — and messages that are only noise.

- **The list.** The obvious candidates: the sign-in link, the receipt, "your square
  is waiting for artwork", "you have been outbid", "you won tomorrow's banner", "your
  block was removed", and on resale: "your square sold" and "you have been paid".
  Decide which exist. Every one is a thing to write, to test and to keep true.
- **The one that must not fail.** The magic link is the only key to an account, since
  there is no password. Deliverability is not a nice-to-have there.
- **What the site sends and what Stripe sends.** Stripe can send its own receipts.
  Two receipts is worse than one.
- **Timing on the auction.** "You have been outbid" is urgent by nature and the close
  is hard at 00:00 UTC. A bidder outbid at 23:58 gets a mail they cannot act on.
- **The address it comes from**, on the domain from [ticket 04](04-domain.md), and
  what a reply to it does.
- **What email means for the promises.** `/privacy` is a short page with three
  promises about visitors. An email address is now stored, and mail is sent through a
  third party. That is a new fact the page has to hold.
- **Tone.** The site's copy is plain and refuses to oversell. Transactional mail
  drifts into marketing very easily.

Not this ticket: the words themselves, if they turn out to need their own pass. This
decides which messages exist and what each must carry.
