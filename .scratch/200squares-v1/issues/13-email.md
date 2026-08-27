# 13 — Email

Type: grilling
Status: resolved
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

## From resolved decisions

[Ticket 06](06-buying-for-real.md) adds three messages to this ticket's plate: the
**artwork reminders** at 1, 7 and 30 days for a `pending` square that never got its image;
the **automatic full refund** mail from [ticket 05](05-convex-model.md) when a payment
lands on squares somebody else already took; and the **invoice**, whose document is
[ticket 17](17-invoice-document.md)'s but whose delivery is this ticket's.

## Answer

**Six messages, one of them merged out of two, and Stripe sends nothing at all.**

### The list

| Mail | Why it exists |
| --- | --- |
| **Magic link** | The only key to an account. One hour, single use. |
| **Order confirmed, with the invoice** | The receipt, the invoice, the way back to the artwork upload. |
| **You have been outbid** | The auction is dead without it. |
| **You won today's banner** | Says whether the image is up or the house ad is standing in. |
| **We refunded you in full** | Ticket 05's race: a payment landed on squares somebody else already took. |
| **Your block was removed** | With the reason. [Ticket 11](11-admin-removal.md) owns the policy and the words. |

Plus the **artwork reminders** at 1, 7 and 30 days that [ticket 06](06-buying-for-real.md)
fixed, for a `pending` square that never got its image. The 30-day one says it is the last.

Resale adds "your square sold" and the credit that follows it.
[Ticket 12](12-resale-for-real.md) decides what the money does; the mail exists either way.

### ⚠️ The receipt and the confirmation are one mail, not two

Ticket 06 decided the **site** issues the invoice, because a Stripe receipt is not a VAT
invoice and Stripe Invoicing cannot print the euro amount beside the USD total that art.
35a lid 4 Wet OB demands.

So **Stripe's own email receipts are switched off**, in test mode and in live mode. The
ticket asked whether two receipts is worse than one; it is worse than that. Two documents
where the prettier one is not legally valid is the worst of the three options.

One mail after payment: what was bought, the invoice ([ticket 17](17-invoice-document.md)
owns the document), the link back to the artwork upload, and nothing else. It is the mail
a buyer keeps.

### The one that must not fail

**The magic link**, and it is not close. [Ticket 08](08-accounts.md) made the email the
only key — no password, no reset, and a lost inbox is a human support case. A magic link
that lands in spam is an account that does not exist.

That is what the whole `send.200squares.com` verification in
[ticket 14](14-environments-and-keys.md) is for: SPF, DKIM and DMARC on a subdomain, so
the root domain's reputation is separate and one bad day does not take sign-in down.

⚠️ It also means **Turnstile guards the sign-in form** (ticket 08). A loop on "send me a
link" empties Resend's free 3,000 a month, and the first thing that breaks is the only key
to every account.

### Timing on the auction

**Send the outbid mail immediately, always, and never suppress a late one.**

The ticket names the case: outbid at 23:58, close at 00:00, a mail they cannot act on.
Suppressing it means choosing a cutoff, and every cutoff is wrong for somebody. A bidder
who finds out at 23:59 that they lost still wants to know they lost.

⚠️ **The fix is in the words, not in the timing.** Every auction mail is written to be true
*whenever* it is read. It states the close time — *bidding closes at 00:00 UTC* — and
never a countdown. "Hurry, two minutes left" is a lie by the time it is opened, and it is
the site's own copy telling it.

**No reminder before the close.** No "the auction closes in an hour". The site cannot
promise when mail arrives, and a late warning is worse than none.

**No bid confirmation either.** The panel already showed it, and a bidder may bid ten
times in a day. The one exception is the **first** bid, which carries the magic link
because ticket 07 makes a first bid create an account — and that mail is the magic link
mail, not a bid receipt.

### The address, and what a reply does

From **`200 squares <hello@200squares.com>`**, sent through the verified
`send.200squares.com` subdomain.

⚠️ **A reply reaches a person.** Not `no-reply@`. Ticket 08 just made "email the dev and
prove the payment" the *official* route back into a locked-out account — a black hole on
the other end of that would make the recovery promise false. Cloudflare Email Routing
forwards `hello@` to the dev's own inbox for nothing, which is one more DNS record for
ticket 14.

This does **not** reopen prototype ticket 07, which ruled out a contact form and a mailto
on the site. The site's public contact is still the handle in
`src/components/content/contact.tsx`. This is about where a reply to a mail the site sent
already goes, which is a different question and has only one decent answer.

### What email means for the promises

`/privacy` already says the address is not public and is used for the receipt and for
messages about your own square. Two things it does not say and now must:

- **Resend is a processor.** The address is passed to a third party to deliver the mail.
- **The address is now a key**, not only a contact. It is kept as long as the account is.

⚠️ **And the sentence that keeps both promises true at once:** an email address belongs to
an **owner**; the clicks page is about a **visitor**. `/privacy` promises nothing is kept
when somebody clicks — no name, no identifier, no address, no time — and that promise is
untouched, because a person who clicks a block is not a person who bought one. Say it in
those words, or the page reads as if it contradicts itself.

### Tone

Plain, short, and it stops when it is done. What happened, what to do, the end.

No exclamation marks. No footer of links. No "we're excited". No unsubscribe, because
there is nothing to unsubscribe from — every mail on this list is transactional, and the
map bans marketing mail by banning marketing.

The site's copy refuses to oversell on the page. Mail is where that discipline is easiest
to lose, and the tell is always an adjective.

### Not this ticket

The words themselves. This decided which messages exist and what each must carry. If the
copy needs its own pass it rides with **making the copy true again** on the map.
