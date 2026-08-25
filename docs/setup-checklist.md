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

Six things. Everything else waits for launch.

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

---

# Part 2 — at launch

None of this is needed to build. Do it in one sitting, in this order, when the site is
ready to take money.

1. **Vercel Pro.** ⚠️ Commercial use is forbidden on Hobby, and a live Stripe key is where
   commercial use begins. Pro comes first, not after.
2. **Spend Management**: $5, *Pause production deployment* ON.
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
   | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile site key — **non-sensitive** |
   | `STRIPE_SECRET_KEY` | `sk_live_…` |

5. **Convex prod variables**:

   ```sh
   npx convex env set --prod BETTER_AUTH_SECRET "$(openssl rand -base64 32)"
   npx convex env set --prod SITE_URL https://200squares.com
   npx convex env set --prod BOARD_LIVE true
   npx convex env set --prod STRIPE_SECRET_KEY sk_live_...
   npx convex env set --prod RESEND_API_KEY re_...
   npx convex env set --prod TURNSTILE_SECRET_KEY ...
   ```

   ⚠️ `BETTER_AUTH_SECRET` must differ from dev.

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

---

## Already done

Convex dev and prod exist. Stripe, Resend, Turnstile and Cloudflare Email Routing are set
up. `send.200squares.com` is verified. The `staging` branch is pushed and building. The
build command is in `vercel.json`. On Convex dev: `BETTER_AUTH_SECRET`, `SITE_URL`,
`BOARD_LIVE`. On Vercel Preview: `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL`,
`NEXT_PUBLIC_SITE_URL`. On Vercel Production: `NEXT_PUBLIC_CONVEX_SITE_URL`,
`NEXT_PUBLIC_SITE_URL`.
