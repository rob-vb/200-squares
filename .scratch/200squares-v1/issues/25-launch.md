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
   `STRIPE_SECRET_KEY` live.
5. **Convex prod variables** — ⚠️ `BETTER_AUTH_SECRET` must differ from dev.
6. **The live Stripe webhook** at `energized-deer-345`. ⚠️ Its signing secret is **not**
   the test one; mixing them makes the signature check reject every real payment, silently.
7. **Turnstile hostnames** for the real domain.

This ticket is deliberately last. The map's destination says it ends when the dev **can
decide** to launch, not when the launch happens — so this is the switch, not the journey.

⚠️ Do not do any of this early. Vercel Pro before there is anything to sell is $20 a month
for nothing, and Hobby **pauses instead of billing**, which enforces
[ticket 02](02-ddos-and-the-bill.md)'s rule better than Pro plus a spend cap does.
