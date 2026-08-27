# Setup checklist

The staging address is:

```
https://200-squares-git-staging-robs-projects-52973834.vercel.app
```

⚠️ **Not `staging.200squares.com`.** Assigning a custom domain to a git branch is a Vercel
Pro feature, and Pro is deferred until the site can take money
([ticket 02](../.scratch/200squares-v1/issues/02-ddos-and-the-bill.md)). Vercel's own
branch URL is stable for as long as the branch is called `staging`, which is all that
Stripe, Better Auth and Turnstile need.

| | dev | prod |
| --- | --- | --- |
| Convex | `proper-heron-683` | `energized-deer-345` |
| cloud | `https://proper-heron-683.eu-west-1.convex.cloud` | `https://energized-deer-345.eu-west-1.convex.cloud` |
| site | `https://proper-heron-683.eu-west-1.convex.site` | `https://energized-deer-345.eu-west-1.convex.site` |

---

# Part 1 — now

Eight things. Everything else waits for launch.

## 1. Convex: no card

Convex dashboard → Settings → Billing. Confirm the plan is **Free** and no payment method
is attached.

⚠️ **Free** stops the deployment at its caps. **Starter** bills the overage. A card
silently turns *the site breaks* into *the site bills*.

## 2. Three keys on Convex dev

On the VPS, with your own keys pasted in:

```sh
npx convex env set STRIPE_SECRET_KEY sk_test_...
npx convex env set RESEND_API_KEY re_...
npx convex env set TURNSTILE_SECRET_KEY ...
```

## 3. The Stripe webhook, test mode

Stripe → **Test mode ON** → Developers → Webhooks → Add endpoint.

URL:

```
https://proper-heron-683.eu-west-1.convex.site/stripe/webhook
```

Events: `checkout.session.completed`, `checkout.session.expired`, `charge.refunded`,
`payment_intent.payment_failed`

Then, on the VPS:

```sh
npx convex env set STRIPE_WEBHOOK_SECRET whsec_...
```

The endpoint exists — [ticket 16](../.scratch/200squares-v1/issues/16-build-checkout.md)
built it. It answers 400 to anything without a valid signature, and 200 to every event
type it does not handle, because a non-2xx makes Stripe retry.

## 4. Stripe: turn its own receipts off

Stripe → Settings → Customer emails. **Off**, in test mode and in live mode.

The site issues the invoice ([ticket 17](../.scratch/200squares-v1/issues/17-invoice-document.md)).
A Stripe receipt is not a VAT invoice.

## 5. Turnstile: add the staging hostname

Cloudflare → Turnstile → your widget → Hostnames. Add:

```
200-squares-git-staging-robs-projects-52973834.vercel.app
```

## 6. Two Vercel variables

Vercel → **200-squares** → Settings → Environment Variables. Both on **Preview** only.

| Name | Value | Note |
| --- | --- | --- |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | your Turnstile **site** key | ⚠️ mark **non-sensitive** |
| `STRIPE_SECRET_KEY` | `sk_test_…` | leave sensitive |

⚠️ Vercel refuses a `NEXT_PUBLIC_` variable with secret visibility. Pick the non-sensitive
option or the build fails.

## 7. Five more on Convex dev

The invoice and the admin page cannot run without these
([tickets 23](../.scratch/200squares-v1/issues/23-build-invoice.md) and
[24](../.scratch/200squares-v1/issues/24-build-removal.md)).

```sh
npx convex env set BUSINESS_NAME "..."
npx convex env set BUSINESS_ADDRESS "..."
npx convex env set BUSINESS_KVK ...
npx convex env set BUSINESS_VAT_ID NL...B..
npx convex env set ADMIN_EMAILS you@example.com
```

⚠️ **Your real values, and nobody else may put them in.** The four `BUSINESS_` ones are
printed on a legal document and frozen into it at the moment it is issued, so a wrong VAT
number is a real problem and not a typo. An invoice issued before they are set keeps its
number and its token, and `finish unwritten invoices` renders the document the night after
you set them.

⚠️ **`ADMIN_EMAILS` unset admits nobody**, which is the safe way round: `/admin` renders
*that is not your page* for everybody, including you.

## 8. Two rows to look at, once

Nothing to set. After a test payment on staging, check that the mail arrived at a real
inbox and that the invoice link in it opens — [ticket 13](../.scratch/200squares-v1/issues/13-email.md)
cannot be verified any other way, and the invoice is the one document on this site that
the law reads.

---

# Part 2 — at launch

None of this is needed to build. Do it in one sitting, in this order, when the site is
ready to take money.

⚠️ **This list switches a site over, not on.** `https://200squares.com/` already answers,
publicly, and it serves `main` — the prototype from before ticket 08, with the resale
market V1.0 dropped still in it. Read step 9 before you start, because the merge that
replaces it is the last step and everything above it lands on a site nobody is looking at
yet.

1. **Vercel Pro.** ⚠️ Commercial use is forbidden on Hobby, and a live Stripe key is where
   commercial use begins. Pro comes first, not after.
2. **Spend Management**: $5, *Pause production deployment* ON.

2b. **The firewall rules**, Vercel → Firewall → Custom Rules. Seven, in this order — the
   list [ticket 39](../.scratch/200squares-v1/issues/39-what-an-invocation-costs.md)
   rewrote, minus two rules that cannot or need not exist and plus one it missed. ⚠️ Blocked traffic does not bill on Vercel, which is what makes the whole rule
   affordable ([ticket 02](../.scratch/200squares-v1/issues/02-ddos-and-the-bill.md)).

   | # | Match | Action |
   | --- | --- | --- |
   | 1 | `path` `eq` `/api/checkout` | rate limit 60 s / 5 / IP+JA4, deny 15 min |
   | 2 | `path` `eq` `/api/bid` | rate limit 60 s / 5 / IP+JA4, deny 15 min |
   | 3 | method not in `GET,HEAD,POST,OPTIONS` | deny |
   | 4 | junk paths (`.php`, `.env`, `wp-`, …) | deny |
   | 5 | `path` `pre` `/art/` | rate limit 60 s / 600 / IP, deny 1 min |
   | 6 | `path` `pre` `/api/auth/` | rate limit 60 s / 60 / IP, deny 1 min |
   | 7 | `path` `eq` `/api/purge` | rate limit 60 s / 10 / IP, deny 10 min |

   ⚠️ **Rate limiting is metered.** Vercel charges **$0.50 per 1M allowed requests** on a
   rate-limit rule; blocked requests are free, and so are the two deny rules. That keeps
   ticket 02's rule intact — an attack is blocked and blocked is free — but it does mean
   normal traffic on rules 5, 6 and 7 costs something. Rule 5 is the volume: a fresh visitor
   on a full board asks for about 200 files, so $5 is roughly 50,000 fresh visitors, and the
   Spend Management wall in step 2 stands in front of it either way. ⚠️ **Unverified**:
   whether an edge-cache `HIT` on `/art/` counts as an allowed request. That is a factor of
   a hundred on rule 5 — check the Vercel usage page after the first week.

   ⚠️ **Two rules on ticket 39's list are dead, for the same reason: the traffic never
   passes Vercel.**

   - ~~a Stripe-webhook bypass~~ — ticket 02 wrote it, ticket 14 then put the webhook on
     `…convex.site/stripe/webhook`.
   - ~~a click-redirect rate limit~~ — ticket 02 wrote it against a redirect that
     [ticket 10](../.scratch/200squares-v1/issues/10-clicks-for-real.md) then designed away.
     A click is a native anchor plus a mutation to `…convex.site/clicks`
     (`src/lib/board/clicks.ts`); there is no Vercel invocation and no `/r/` route to limit.
     Its rate limiting is the Turnstile permit, ~30 clicks per token, which is on Convex.

   ⚠️ **And a third cannot be built at all: `/art/` with a query string → deny.** Ticket 39
   wrote `path` `pre` `/art/` **AND** `query` `ex`, and said it could not live in
   `vercel.json` because `has` matches a query key by name — but assumed the dashboard was
   free of that limit. It is not. Working ticket 25 on 2026-08-27 opened the condition list:
   `Query` is *"query parameter key and value"* and **the key field is required**, and both
   path fields — `Request Path` and `Raw Path` — say *"excluding query"*. Vercel offers no
   condition that sees the query string as a whole. **The guard moved into
   `src/app/art/[id]/route.ts`**, which answers `400` with `no-store` to any query string.
   It costs one cheap invocation per attempt instead of zero, and rule 5 caps how many one
   address gets — but unlike a WAF rule it also holds on preview deployments, so the trap
   that "adding `?v=2` breaks production and nowhere else" is gone.

   ⚠️ **Rule 2 is new here.** `/api/bid` is `/api/checkout` with `capture_method: "manual"`
   — same VIES call, same Stripe call, same cost per request — and nobody had noticed it when
   ticket 39's list was written. It sits behind the same Turnstile door on Convex, so this is
   a second lock and not the only one.

   ⚠️ Rule 5 is a rate limit and not a deny, because a 404 is the right answer for a file
   that was just released. A full board asks for a few hundred files once and is `HIT` after,
   so a per-IP limit passes a visitor and stops an id-scanner.

   ⚠️ The rate-limit rules cannot live in `vercel.json` either: it has no rate-limit action.
   It is the dashboard or the REST API.
3. **Three DNS records** at Cloudflare → 200squares.com → DNS. All three CNAME, all three
   **DNS only (grey cloud)**:

   | Type | Name | Target |
   | --- | --- | --- |
   | CNAME | `@` | `3d5247d07ec60ade.vercel-dns-017.com.` |
   | CNAME | `www` | `3d5247d07ec60ade.vercel-dns-017.com.` |
   | CNAME | `staging` | `3d5247d07ec60ade.vercel-dns-017.com.` |

   The apex and `www` are already attached to the project. `staging` only works once Pro
   allows a branch-assigned domain; until then it is unused.
4. **Vercel Production variables**:

   | Name | Value |
   | --- | --- |
   | `CONVEX_DEPLOY_KEY` | Convex → **energized-deer-345** → Settings → Deploy keys |
   | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | the **real** Turnstile site key — non-sensitive |
   | `STRIPE_SECRET_KEY` | `sk_live_…` |
   | `BUSINESS_VAT_ID` | ⚠️ the eenmanszaak's own BTW-id, e.g. `NL…B01` — needed **here**, not only on Convex: VIES returns the `requestIdentifier` only to a caller that identifies itself, and that reference is the art. 18(1)(a) proof. Without it the check works and nothing is kept. |
   | `PURGE_SECRET` | ⚠️ a **new** value, `openssl rand -base64 32` — not the preview one. It is the whole guard on `/api/purge`, and the same string goes on Convex prod in step 5. Sensitive. |

5. **Convex prod variables**:

   ```sh
   npx convex env set --prod BETTER_AUTH_SECRET "$(openssl rand -base64 32)"
   npx convex env set --prod SITE_URL https://200squares.com
   npx convex env set --prod BOARD_LIVE true
   npx convex env set --prod STRIPE_SECRET_KEY sk_live_...
   npx convex env set --prod RESEND_API_KEY re_...
   npx convex env set --prod TURNSTILE_SECRET_KEY ...
   npx convex env set --prod PURGE_URL https://200squares.com/api/purge
   npx convex env set --prod PURGE_SECRET ...
   ```

   ⚠️ `BETTER_AUTH_SECRET` must differ from dev.

   ⚠️ `PURGE_SECRET` must be **the same string** as the one on Vercel Production in step 4,
   and different from the preview pair. `PURGE_URL` must be the **production** address:
   cache tags are scoped per project *and* environment, so prod pointing at the staging URL
   purges staging, reports success, and leaves the reported picture live on the real site
   ([ADR 0004](adr/0004-a-year-is-a-cache-not-a-promise.md)). A removal that did not purge
   shows on `/admin`; a removal that purged the wrong environment does not.

6. **The live Stripe webhook**, Test mode OFF, pointing at

   ```
   https://energized-deer-345.eu-west-1.convex.site/stripe/webhook
   ```

   ```sh
   npx convex env set --prod STRIPE_WEBHOOK_SECRET whsec_...
   ```

   ⚠️ Test and live have **separate** signing secrets. Mixing them makes the signature
   check reject every real payment, silently.

7. **Turnstile**: add `200squares.com` and `www.200squares.com` to the hostnames.

   ⚠️ Production is the **first** place the real widget ever runs. Dev and preview use
   Cloudflare's dummy always-passes keys, because Turnstile will not complete a challenge
   from the VPS — see *Turnstile on dev* in [`environments.md`](environments.md). So buy
   one square by hand, in a real browser, on the live site, before telling anybody it is
   open. If the widget stalls there, no square can be bought at all and nothing else on
   this list will tell you.

8. **Pull the ECB rate, once, by hand**, before the first sale can happen:

   ```sh
   npx convex run --prod invoices:pullFxRate
   ```

   The cron that fills the rate runs at **17:00 UTC daily**, so on a deployment whose cron
   has never fired the `fx` cache is empty. `invoices.ts` then issues the invoice anyway and
   leaves the euro line off — deliberately, because refusing to invoice a paid order is the
   worse failure. But [ticket 17](../.scratch/200squares-v1/issues/17-invoice-document.md)'s
   **write-once** rule means that invoice is never repaired.

   ⚠️ On prod the invoice with no euro line would be **the first real sale**, and the euro
   amount is what art. 35a lid 4 Wet OB asks for. One command before the doors open, and it
   cannot be done afterwards.
   ([Ticket 28](../.scratch/200squares-v1/issues/28-prove-the-mail.md) watched it happen on
   staging: invoice `2026-0010` has no euro amount and now never will.)

9. **The switch-over: merge `staging` into `main`.** Production serves `main`, and `main` is
   the prototype from before ticket 08 — the one that reads `searchParams`, so every route
   on it is `x-vercel-cache: MISS` and `no-store`, and the resale market V1.0 dropped is
   still in it. Checked 2026-08-27: `main` is **86 commits** behind `staging` and
   `https://200squares.com/` answers 200 on `/`, `/how-it-works`, `/terms` and `/privacy`,
   all `MISS`.

   ⚠️ **This is the step that opens the doors**, so it is last. Everything above it lands on
   a deployment nobody is looking at yet; this one is visible the moment it builds.

   ⚠️ **Commit and merge as `hi@robvb.com`** or the Vercel deploy is blocked.

   Afterwards, confirm the real thing is serving:

   - `/` returns `x-vercel-cache: HIT` on a second request — the whole point of killing
     `?data=` ([ticket 08](../.scratch/200squares-v1/issues/08-accounts.md)).
   - the top bar carries the V1.0 promise, and no resale surface is left
     ([ticket 26](../.scratch/200squares-v1/issues/26-strip-resale.md),
     [27](../.scratch/200squares-v1/issues/27-label-and-sellout.md)).
   - then do the live-mode purchase from step 7, in a real browser.

---

## Already done

Convex dev and prod exist. Stripe, Resend, Turnstile and Cloudflare Email Routing are set
up. `send.200squares.com` is verified. The `staging` branch is pushed and building. The
build command is in `vercel.json`. On Convex dev: `BETTER_AUTH_SECRET`, `SITE_URL`,
`BOARD_LIVE`. On Vercel Preview: `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL`,
`NEXT_PUBLIC_SITE_URL`. On Vercel Production: `NEXT_PUBLIC_CONVEX_SITE_URL`,
`NEXT_PUBLIC_SITE_URL`.
