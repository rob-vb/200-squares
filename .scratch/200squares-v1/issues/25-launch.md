# 25 — The launch switches

Type: task
Status: open
Blocked by: 14
Parent: ../map.md

## Question

Nothing to decide. The half of [ticket 14](14-environments-and-keys.md) that is not
environment work but **launch** work. None of it is needed to build or test.

The full list, in order, is Part 2 of
[`docs/setup-checklist.md`](../../../docs/setup-checklist.md). In short:

1. ⚠️ **Vercel Pro first.** Commercial use is forbidden on Hobby, and a live Stripe key is
   where commercial use begins. Pro comes **before** step 4, not after.
2. **Spend Management**: $5, *Pause production deployment* ON.
3. **Three CNAME records** at Cloudflare, all **DNS only (grey cloud)**.
4. **Vercel Production variables** — `CONVEX_DEPLOY_KEY`, the Turnstile site key,
   `STRIPE_SECRET_KEY` live, and ⚠️ `BUSINESS_VAT_ID`, which
   [ticket 16](16-build-checkout.md) needs **on Vercel** and not only on Convex: VIES hands
   back the `requestIdentifier` — the consultation reference the art. 18(1)(a) evidence
   rests on — only to a caller that identifies itself. Without it the check still works and
   the proof is not kept.
5. **Convex prod variables** — ⚠️ `BETTER_AUTH_SECRET` must differ from dev.
6. **The live Stripe webhook** at `energized-deer-345`. ⚠️ Its signing secret is **not**
   the test one; mixing them makes the signature check reject every real payment, silently.
7. **Turnstile hostnames** for the real domain.

   ⚠️ **Added by [ticket 16](16-build-checkout.md) (2026-08-25): then buy one square by
   hand.** Turnstile will not complete a challenge from the dev's VPS at all — the widget
   renders and then stalls with no callback and no error — so dev and preview run
   Cloudflare's dummy always-passes keys and **production is the first place the real
   widget ever runs**. Click through one live-mode order in a real browser before telling
   anybody the site is open. If the widget stalls there, no square can be bought and
   nothing else on this list would say so.

8. ⚠️ **Added by [ticket 28](28-prove-the-mail.md) (2026-08-26): pull the ECB rate before
   the first sale.** `npx convex run invoices:pullFxRate` against prod, once, by hand.

   The cron that fills the rate runs at **17:00 UTC daily**, so on a deployment whose cron
   has never fired the `fx` cache is empty. `invoices.ts` then issues the invoice anyway and
   simply leaves the euro line off — deliberately, because refusing to invoice a paid order
   is the worse failure. But [ticket 17](17-invoice-document.md)'s **write-once** rule means
   that invoice is never repaired. Ticket 28 watched it happen on staging: invoice
   `2026-0010` has no euro amount and now never will; `2026-0011`, minutes later with the
   rate pulled, carries *VAT in euros: €37.21 — converted at the ECB reference rate of
   1.1662 USD per EUR, published 2026-08-25*.

   On prod the invoice with no euro line is **the first real sale**, and the euro amount is
   what art. 35a lid 4 Wet OB asks for. One command before opening the doors, and it cannot
   be done afterwards.

This ticket is deliberately last. The map's destination says it ends when the dev **can
decide** to launch, not when the launch happens — so this is the switch, not the journey.

⚠️ Do not do any of this early. Vercel Pro before there is anything to sell is $20 a month
for nothing, and Hobby **pauses instead of billing**, which enforces
[ticket 02](02-ddos-and-the-bill.md)'s rule better than Pro plus a spend cap does.
