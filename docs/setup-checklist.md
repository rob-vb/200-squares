# Setup checklist — ticket 14

Replaces the wizard, which is gone. Work top to bottom. Nothing here can be done by an
agent: every line is a dashboard, a login or a key.

Both Convex deployments live in **`eu-west-1`** — owner data and email addresses stay in
the EU, which `/privacy` may want to say.

| | dev | prod |
| --- | --- | --- |
| name | `proper-heron-683` | `energized-deer-345` |
| cloud | `https://proper-heron-683.eu-west-1.convex.cloud` | `https://energized-deer-345.eu-west-1.convex.cloud` |
| site | `https://proper-heron-683.eu-west-1.convex.site` | `https://energized-deer-345.eu-west-1.convex.site` |

⚠️ **There are two Vercel projects**: `200-squares` (this repo is linked to it) and
`200squares` (made 15 days ago, already carrying a Convex build command). One of them is
a leftover. Decide which before you attach the domain — moving a live domain between
projects is a DNS problem you do not need.

---

## Already done

- git commit address is `hi@robvb.com`
- Convex dev and prod deployments exist
- Stripe account, test keys, live keys
- Resend account, two API keys, `send.200squares.com` verified
- Cloudflare Turnstile widget
- Cloudflare Email Routing for `hello@200squares.com`
- On Convex **dev**: `BETTER_AUTH_SECRET`, `SITE_URL`, `BOARD_LIVE`
- **The build command**, in `vercel.json` at the repo root — versioned, not a dashboard
  setting. Ignore step 5 below; it is done.
- **Five Vercel variables**, the ones that need no key from you:

  | Environment | Name |
  | --- | --- |
  | Preview | `NEXT_PUBLIC_CONVEX_URL` |
  | Preview | `NEXT_PUBLIC_CONVEX_SITE_URL` |
  | Preview | `NEXT_PUBLIC_SITE_URL` |
  | Production | `NEXT_PUBLIC_CONVEX_SITE_URL` |
  | Production | `NEXT_PUBLIC_SITE_URL` |

  ⚠️ Vercel now refuses a `NEXT_PUBLIC_` variable with secret visibility. They are set as
  `--visibility config --no-sensitive`. If you add one by hand in the dashboard, pick the
  non-sensitive option or the build fails.

---

## 1. Vercel Pro

Settings → Billing. $20 a month. Ticket 02 found it is compulsory for a commercial site —
the free plan forbids commercial use, and Pro carries the firewall this project needs.

## 2. The spend cap

Settings → Billing → **Spend Management**.

- Turn it on
- Amount: **5**
- **Pause production deployment: ON**
- Confirm by typing the team name

⚠️ Vercel checks every few minutes. This is a brake, not a wall — which is why the amount
is far below what you would tolerate.

## 3. Check Convex has no card

Convex dashboard → Settings → Billing.

⚠️ **Free** has hard caps and stops the deployment. **Starter** is pay-as-you-go and bills
the overage. A card on the account silently turns *the site breaks* into *the site bills*.
That is the rule the whole map rests on. No card.

## 4. Domains

Vercel → project **200-squares** → Settings → Domains.

| Domain | Assign to |
| --- | --- |
| `200squares.com` | Production |
| `www.200squares.com` | Production |
| `staging.200squares.com` | git branch **`staging`** |

Vercel gives you DNS records. Add them at Cloudflare → 200squares.com → DNS.
⚠️ **DNS only (grey cloud), never Proxied.** Ticket 02 keeps the whole zone unproxied
because Vercel's firewall on Pro beats Cloudflare Free.

## 5. The build command — **done**

It lives in `vercel.json` at the repo root, so it is reviewed and versioned like the rest.

⚠️ If a Build Command override is also set in the dashboard, clear it. `vercel.json` and a
dashboard override disagreeing is a bad afternoon.

## 6. Vercel environment variables

Settings → Environment Variables.

Five are already set. **Four are left**, and all four need a key only you have.

**Production**

| Name | Value |
| --- | --- |
| `CONVEX_DEPLOY_KEY` | Convex dashboard → **energized-deer-345** → Settings → Deploy keys |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile site key — mark it **non-sensitive** |
| `STRIPE_SECRET_KEY` | `sk_live_…` |

**Preview**

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile site key — mark it **non-sensitive** |
| `STRIPE_SECRET_KEY` | `sk_test_…` |

⚠️ **Do not set `CONVEX_DEPLOY_KEY` on Preview.** A preview must never push functions.
⚠️ `NEXT_PUBLIC_` means the value is compiled into the browser bundle. A secret with that
prefix is a leaked secret.

`NEXT_PUBLIC_CONVEX_URL` is **not** set on Production — `npx convex deploy` sets it during
the build.

## 7. Three keys on Convex dev

Run these on the VPS, with your own keys pasted in.

```sh
npx convex env set STRIPE_SECRET_KEY sk_test_...
npx convex env set RESEND_API_KEY re_...
npx convex env set TURNSTILE_SECRET_KEY ...
```

## 8. The Stripe webhook, test mode

Stripe → **Test mode ON** → Developers → Webhooks → Add endpoint.

```
https://proper-heron-683.eu-west-1.convex.site/stripe/webhook
```

Events: `checkout.session.completed`, `checkout.session.expired`, `charge.refunded`,
`payment_intent.payment_failed`

Then take the signing secret:

```sh
npx convex env set STRIPE_WEBHOOK_SECRET whsec_...
```

⚠️ The endpoint does not exist in the code yet — ticket 16 builds it. Stripe will get
errors until then, which is fine.

The webhook goes to **Convex, not Vercel**: the address never changes with a branch,
Vercel's deployment protection never sees it, and it burns no Vercel invocations.

## 9. Turn Stripe's own receipts OFF

Stripe → Settings → Customer emails. Off in **both** test and live mode.

Ticket 13: the site issues the invoice. A Stripe receipt is not a VAT invoice, and two
documents where the prettier one is invalid is worse than either alone.

## 10. The same on Convex prod

```sh
npx convex env set --prod BETTER_AUTH_SECRET "$(openssl rand -base64 32)"
npx convex env set --prod SITE_URL https://200squares.com
npx convex env set --prod BOARD_LIVE true
npx convex env set --prod STRIPE_SECRET_KEY sk_live_...
npx convex env set --prod RESEND_API_KEY re_...
npx convex env set --prod TURNSTILE_SECRET_KEY ...
```

Then add the **live** webhook endpoint in Stripe with Test mode OFF, pointing at

```
https://energized-deer-345.eu-west-1.convex.site/stripe/webhook
```

and set its own secret:

```sh
npx convex env set --prod STRIPE_WEBHOOK_SECRET whsec_...
```

⚠️ `BETTER_AUTH_SECRET` must be a **different** value from dev.
⚠️ Test and live have **separate** signing secrets. Mixing them fails in the worst way:
the signature check rejects every real payment, silently.

## 11. The first real deploy

```sh
git checkout -b staging
git push -u origin staging
```

Open `https://staging.200squares.com` and check the board draws.

Nothing is connected to Convex yet — ticket 15 does that. This deploy proves the domain,
the build command and the variables are right, while the site is still simple enough to
see what broke.

---

When this is done, say **"ticket 14 is klaar"**. Nine build tickets are waiting on it.
