# 04 — Buy 200squares.com

Type: task
Status: resolved
Parent: ../map.md

## Question

Nothing here is decided. This is work only the dev can do, and several later tickets
wait on it.

Buy **200squares.com**. Then the domain is needed in three places, and each takes
time to settle:

- **Vercel** — the production domain of `200-squares`, with its DNS.
- **Resend** — sending email needs a verified domain, with SPF, DKIM and DMARC
  records. Mail from an unverified domain lands in spam, so this wants doing early.
- **Stripe** — the business profile and the receipts show the domain.

The dev said the domain gets connected last. That is right for pointing production
at it. It is wrong for buying it: buy it now, because
[ticket 13](13-email.md) cannot be tested without mail that arrives, and
[ticket 02](02-ddos-and-the-bill.md) may want Cloudflare as the nameserver, which is
a choice made when the domain is bought, not after.

Record in the answer: where the domain is registered, who holds the nameservers, and
which of the three connections are live.

## Answer

**Bought, and it sits at Cloudflare.** `200squares.com` is registered through
Cloudflare and its nameservers are Cloudflare's own: `jacqueline.ns.cloudflare.com`
and `jakub.ns.cloudflare.com` (checked 2026-08-24). The zone answers, and there is
no `A` record yet — nothing points anywhere.

**None of the three connections are live.** Vercel does not serve the domain, Resend
has no verified sending domain, and the Stripe business profile does not name it.
That is deliberate: each connection now belongs to the ticket that needs it, so this
task does not hold them open.

- **Vercel** — the production domain and its DNS move to
  [ticket 14](14-environments-and-keys.md), with the rest of the environments.
- **Resend** — SPF, DKIM and DMARC in the Cloudflare zone belong to
  [ticket 14](14-environments-and-keys.md), which already names the domain
  verification. It stays the connection that wants doing earliest, because
  [ticket 13](13-email.md) cannot be tested without mail that arrives, and
  propagation and warm-up cost calendar time, not work.
- **Stripe** — the business profile and the receipts follow the account itself, in
  ticket 14 as well.

**What this unlocks for [ticket 02](02-ddos-and-the-bill.md):** Cloudflare in front
of Vercel no longer costs a registrar move or a nameserver change. The zone is
already there, so it is a proxy switch on a record that does not exist yet. Ticket
02 can judge that arrangement on merit alone.

**Which records exist:** none that matter. The zone is empty of `A`, `AAAA`, `CNAME`
and `MX` for the apex. Every record this project needs is still to be written, and
each one is written by the ticket that needs it.
