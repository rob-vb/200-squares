# 25 — The launch switches

Type: task
Status: open
Assignee: rob-vb (claimed 2026-08-27)
Blocked by: 14, 39, 40 (all resolved — 40 on 2026-08-27, so this is now on the frontier and is the last ticket on the map)
See also: [36](36-build-purge-on-release.md) — not a switch, but it lands before launch.
Parent: ../map.md

## Question

Nothing to decide. The half of [ticket 14](14-environments-and-keys.md) that is not
environment work but **launch** work. None of it is needed to build or test.

The full list, in order, is Part 2 of
[`docs/setup-checklist.md`](../../../docs/setup-checklist.md). In short:

1. ⚠️ **Vercel Pro first.** Commercial use is forbidden on Hobby, and a live Stripe key is
   where commercial use begins. Pro comes **before** step 4, not after.
2. **Spend Management**: $5, *Pause production deployment* ON.

2b. ⚠️ **The firewall rules, rewritten by [ticket 39](39-what-an-invocation-costs.md)
   (2026-08-26).** Ticket 02 named five. One of them is dead and three are new, so the list
   is **seven** and this is it, in order:

   - ~~a Stripe-webhook bypass, first~~ — **dropped.** Ticket 02 wrote it because "webhooks
     die" without it. [Ticket 14](14-environments-and-keys.md) then put the webhook on
     `…convex.site/stripe/webhook`, which never passes Vercel. It guards nothing and costs a
     place in the ordering.
   - a checkout rate limit — 60 s / 5 / IP+JA4 / deny 15 min (ticket 02)
   - ~~a click-redirect rate limit~~ — **dropped** (2026-08-27). Ticket 02 wrote it against
     a redirect [ticket 10](10-clicks-for-real.md) then designed away. A click is a native
     anchor plus a mutation to `…convex.site/clicks` (`src/lib/board/clicks.ts`): no Vercel
     invocation, no `/r/` route, nothing to limit. Its rate limiting is the Turnstile permit
     — about 30 clicks per token — and that is on Convex. Same reason the webhook bypass
     died: the traffic never passes Vercel.
   - **`/api/bid` → rate limit**, 60 s / 5 / IP+JA4 / deny 15 min. **Added 2026-08-27**, and
     nobody had noticed it: `/api/bid` is `/api/checkout` with `capture_method: "manual"` —
     the same VIES call, the same Stripe call, the same cost per request.
   - a method allowlist (ticket 02)
   - a junk-path deny (ticket 02)
   - ~~**`/art/` with a query string → deny.**~~ ⚠️ **Cannot be built** (2026-08-27, working
     this ticket). Ticket 39 wrote `path` `pre` `/art/` **AND** `query` `ex`, and knew it
     could not live in `vercel.json` because `has` matches a query key **by name** — but
     assumed the dashboard was free of that limit. It is not. The condition list holds no
     field that sees the query string as a whole: `Query` is *"query parameter key and
     value"* and **its key field is required**, and both path fields — `Request Path` and
     `Raw Path` — say *"excluding query"* in their own descriptions.

     The guard moved into **`src/app/art/[id]/route.ts`**, which answers `400` with
     `no-store` to any query string at all. It costs one cheap invocation per attempt
     instead of zero — no Convex read, no stream — and the `/art/` per-IP rate limit caps
     how many one address gets. In exchange it holds on **preview** deployments too, so the
     trap the old note described ("adding `?v=2` breaks production and nowhere else") no
     longer exists.
   - **`/art/` → rate limit per IP.** Not deny: a 404 is the right answer for a file that
     was just released. A full board asks for a few hundred files once and is `HIT` after,
     so a per-IP limit passes a visitor and stops an id-scanner.
   - **`/api/auth/*` → rate limit per IP**, wide enough for real navigation.
     `/api/auth/get-session` is the one function on the normal path (one invocation per
     board load, measured), so it is also the easiest thing to point a script at.
   - **`/api/purge` → a tight rate limit.** Its only honest caller is Convex, a few times a
     day.

   ⚠️ None of this can live in `vercel.json`: it has no rate-limit action. It is dashboard
   or REST API.

   ⚠️ **Rate limiting is metered**, which ticket 02 and ticket 39 both recorded only half of.
   Vercel charges **$0.50 per 1M allowed requests** on a rate-limit rule; blocked requests
   are free, and so are the deny rules. Ticket 02's rule survives whole — an attack is
   blocked and blocked is free — but normal traffic on the three path limits costs something.
   `/art/` is the volume: about 200 files to a fresh visitor on a full board, so $5 is
   roughly 50,000 fresh visitors, and step 2's Spend Management wall stands in front of it.
   ⚠️ **Unverified**: whether an edge-cache `HIT` on `/art/` counts as an allowed request.
   That is a factor of a hundred on that one rule. Read the Vercel usage page after the
   first week.

   **Done 2026-08-27**: the seven rules are in place on the project, and measured from
   staging afterwards — `/`, `/how-it-works`, `/terms` and `/privacy` all 200,
   `/art/<id>` a 404 at `max-age=30`, `/art/<id>?x=1` a **400** at `no-store`.

   ⚠️ **Read a generated rule's conditions before switching it on.** Vercel's *Generate
   Rule* writes the description and the conditions separately and they can disagree. It
   produced *"Block requests that are not GET, HEAD, POST, or OPTIONS"* over five identical
   conditions reading `Method` **Is any of** `GET, HEAD, POST, OPTIONS` — the exact inverse.
   Staging answered **403 on every path, including `/`**, and the description gave no sign
   of it. The right shape is one condition, `Method` **Is not any of**. Found by measuring.

   ⚠️ Bot Protection and Attack Mode are **off**, and staying off: they were the first
   suspect for the 403 and they were innocent. Turning either on would challenge headless
   Chromium, and headless Chromium is the whole toolkit here — `shot.mjs`, `flow.mjs`,
   `bid.mjs`, `artwork.mjs`, `withdraw.mjs`, `strip.mjs`, `clicks.mjs`. Nobody working on
   this site could see it.
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

9. ⚠️ **Added by [ticket 39](39-what-an-invocation-costs.md) (2026-08-26): the old
   prototype is already live on the real domain.** `https://200squares.com/` answers **200**
   right now, publicly. It serves `main`, which is **73 commits behind** `staging` — the
   build from before [ticket 08](08-accounts.md), which read `searchParams`, so **every
   route there is `x-vercel-cache: MISS` and `no-store`**. Nothing is cached; the resale
   market V1.0 dropped is still in it.

   No bill is possible — Hobby pauses — so ticket 39 left it alone. But this list assumes it
   is switching a site **on**, and it is really switching one **over**. Whoever works this
   ticket checks what production is serving before touching anything.

This ticket is deliberately last. The map's destination says it ends when the dev **can
decide** to launch, not when the launch happens — so this is the switch, not the journey.

⚠️ Do not do any of this early. Vercel Pro before there is anything to sell is $20 a month
for nothing, and Hobby **pauses instead of billing**, which enforces
[ticket 02](02-ddos-and-the-bill.md)'s rule better than Pro plus a spend cap does.
