# Environments, keys and deploys

Written by [ticket 14](../.scratch/200squares-v1/issues/14-environments-and-keys.md).
It says where everything lives. **It contains no secrets and never may.**

## The shape

Three environments, two Convex deployments, one Vercel project.

| Environment | URL | Convex deployment | Stripe mode |
| --- | --- | --- | --- |
| Production | `200squares.com`, `www.200squares.com` | `prod` | live |
| Staging | `https://200-squares-git-staging-robs-projects-52973834.vercel.app` (git branch `staging`) | `proper-heron-683` | test |
| A working branch | `200-squares-git-<branch>-robs-projects-52973834.vercel.app` | `proper-heron-683` | test |

The dev deployment is **`proper-heron-683`**, in the **`eu-west-1`** region. The region
is worth knowing for `/privacy`: owner data and email addresses stay in the EU.

**There is no local environment.** The dev works on a VPS and sees nothing in a
browser there. Every visual check happens on a Vercel URL.

### Why Convex previews are not used

Convex can make a fresh backend for every git branch. This project does not use that.
One `dev` deployment serves every preview branch instead. The reasons:

- Stripe, Better Auth, Resend and Turnstile each need a **fixed** URL. A backend per
  branch gives each branch a new `.convex.cloud` and `.convex.site` address, so each
  branch would need its own webhook endpoint and its own trusted origin.
- The dev is the only person who uses staging. Shared preview data costs nothing here.
- Convex Free counts deployments. Two is cheaper than many.

The price is that two branches share one database. Accept it.

### Why the staging address is a branch URL

Stripe redirect URLs, Better Auth callbacks, Resend links and Turnstile hostnames all need
an address that does not move. ⚠️ Charting assumed that meant a custom domain on the
branch — but **assigning a domain to a git branch is a Vercel Pro feature**, and Pro is
deferred until the site can take money.

Vercel's own branch URL is already stable: it changes only if the branch is renamed. That
is enough. The custom domain buys prettiness and nothing else, so it waits for
[ticket 25](../.scratch/200squares-v1/issues/25-launch.md).

Vercel Deployment Protection stays **on** for staging. The dev is signed in to Vercel,
so the site opens for them and for nobody else. The Stripe webhook is not blocked by
this, because it does not go to Vercel — see below.

## The Stripe webhook goes to Convex, not to Vercel

`https://proper-heron-683.eu-west-1.convex.site/stripe/webhook`

A Convex HTTP action, not a Next.js route. Four reasons:

1. The address is **stable and public**. Vercel Deployment Protection never sees it, so
   no bypass secret is needed.
2. Convex is the source of truth ([ticket 05](../.scratch/200squares-v1/issues/05-convex-model.md)).
   The webhook writes where it must write, with no hop between.
3. It uses no Vercel function invocations, which is
   [ticket 02](../.scratch/200squares-v1/issues/02-ddos-and-the-bill.md)'s bill rule.
4. Better Auth already serves from `.convex.site`. One host for both.

Two endpoints exist in the Stripe dashboard: one in test mode pointing at the `dev`
deployment, one in live mode pointing at `prod`. Each has its **own** signing secret.

## Variables

### On the Convex deployment

Set with `npx convex env set NAME value`, once per deployment (`dev` and `prod`).
These never reach the browser.

| Name | dev | prod | What it is |
| --- | --- | --- | --- |
| `BETTER_AUTH_SECRET` | own value | own value | `openssl rand -base64 32`. Different per deployment. |
| `SITE_URL` | the staging branch URL | `https://200squares.com` | Better Auth callbacks and mail links. |
| `STRIPE_SECRET_KEY` | `sk_test_…` | `sk_live_…` | |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` (test endpoint) | `whsec_…` (live endpoint) | One per endpoint. Never share them. |
| `RESEND_API_KEY` | `re_…` | `re_…` | Two keys, so one can be revoked alone. |
| `TURNSTILE_SECRET_KEY` | ⚠️ Cloudflare's **dummy** always-passes key | the real secret | See *Turnstile on dev* below. |
| `BUSINESS_NAME`, `BUSINESS_ADDRESS`, `BUSINESS_KVK`, `BUSINESS_VAT_ID` | set | set | The eenmanszaak's identity on an invoice ([ticket 23](../.scratch/200squares-v1/issues/23-build-invoice.md)). Not secret, but not in git either — they change without a deploy, and an invoice freezes its own copy. |
| `BOARD_LIVE` | `true` | `true` | The [ADR 0001](adr/0001-live-board-clicks-outside-it.md) kill switch. Set to `false` and the board falls back to a cached snapshot, with no deploy. |
| `RESERVATION_IP_SALT` | optional | optional | Salts the hash a reservation keeps instead of an IP ([ticket 16](../.scratch/200squares-v1/issues/16-build-checkout.md)'s *one hold per visitor*). Unset, `BETTER_AUTH_SECRET` is used instead, which is fine — it is a salt, not a key. |

### In the Vercel project

Set per environment in **Settings → Environment Variables**.

| Name | Production | Preview | Public? |
| --- | --- | --- | --- |
| `CONVEX_DEPLOY_KEY` | prod deploy key | *not set* | no |
| `NEXT_PUBLIC_CONVEX_URL` | *set by the build* | `https://proper-heron-683.eu-west-1.convex.cloud` | yes |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | `https://<prod>.convex.site` | `https://proper-heron-683.eu-west-1.convex.site` | yes |
| `NEXT_PUBLIC_SITE_URL` | `https://200squares.com` | the staging branch URL | yes |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | the real site key | ⚠️ Cloudflare's **dummy** always-passes site key | yes |
| `STRIPE_SECRET_KEY` | `sk_live_…` | `sk_test_…` | **no** |
| `BUSINESS_VAT_ID` | set | set | no |

`NEXT_PUBLIC_` is a promise: the value is compiled into the browser bundle. A secret
with that prefix is a leaked secret.

⚠️ Vercel **refuses** a `NEXT_PUBLIC_` variable with secret visibility on Preview or
Production. Add one with `--no-sensitive --visibility config`, or the API answers
`invalid_visibility`.

### Turnstile on dev: the dummy keys, and why

Preview and the dev deployment run Cloudflare's documented **testing** keys —
`1x00000000000000000000BB` (invisible, always passes) and
`1x0000000000000000000000000000000AA` (always verifies). Production runs the real pair.

The reason is not convenience. **Turnstile does not complete a challenge from this VPS**:
headless or headful, with or without a real user agent, the widget renders, fetches its
challenge and then stalls with no callback and no error code — Cloudflare simply does not
answer a datacenter address. There is no browser on the VPS and no browser anywhere else in
the loop, so with the real key on preview *nobody who works on this site can get through
their own checkout* — not ticket 16's flow, not ticket 20's artwork upload, not ticket 23's
invoice, because all three need a real order behind them.

What it costs: `POST /checkout/reserve` on the **dev** deployment is unprotected. It is a
public `.convex.site` URL that Vercel's Deployment Protection does not cover, so anybody
who knows it can fill the dev board with holds. Convex Free breaks rather than bills, the
data is seed data, and the address is not published. Accepted.

⚠️ **The real widget is therefore never exercised before launch.** Ticket 25 owns clicking
through one live-mode order by hand, from a real browser, on the real key.

`STRIPE_SECRET_KEY` is needed on Vercel as well as on Convex, because
[ticket 16](../.scratch/200squares-v1/issues/16-build-checkout.md) creates the Checkout
Session from the site (the order is placed on 200squares.com) while the webhook that
finishes it runs on Convex.

⚠️ `BUSINESS_VAT_ID` is needed on **Vercel** too, and for a different reason than the
invoice: the VIES check runs beside the Checkout Session, and VIES only returns a
`requestIdentifier` — the consultation reference art. 18(1)(a) evidence rests on — when
the caller identifies itself. Without it the check still works and the proof is not kept.

### On the VPS, in `.env.local`

`npx convex dev` writes `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL` and
`NEXT_PUBLIC_CONVEX_SITE_URL` here by itself. `.env.local` is in `.gitignore` and
stays there. It holds no live key, ever.

## The build command

One Vercel project, two behaviours. Production pushes Convex functions; a preview does
not, because previews run against `dev`, which the VPS pushes to.

Vercel → Settings → Build & Development Settings → Build Command, override with:

```sh
if [ "$VERCEL_ENV" = "production" ]; then npx convex deploy --cmd 'npm run build'; else npm run build; fi
```

`npx convex deploy` reads `CONVEX_DEPLOY_KEY`, sets `NEXT_PUBLIC_CONVEX_URL` itself,
builds the site, and then pushes the functions. That order matters: the functions go
live only if the build succeeds.

Functions reach `dev` from the VPS, with `npx convex dev` running in a terminal.

## Spend limits

[Ticket 02](../.scratch/200squares-v1/issues/02-ddos-and-the-bill.md) sets the rule: an
attack may take the site offline, but it may never make a bill.

- **Vercel** — Settings → Billing → Spend Management: **$5**, with *Pause production
  deployment* **on**. Vercel checks every few minutes, so it is a brake, not a wall.
  Set it below what you are willing to pay.
- **Convex** — stays on **Free**. Free has hard caps and no overage rate, so it refuses
  work instead of billing. That is the whole defence and it is why it is not upgraded.
- **Resend** — Free, 3,000 mails a month. No card on the account.
- ⚠️ **Convex Free is not Convex Starter.** Free has hard caps and stops the deployment;
  Starter is pay-as-you-go and bills the overage. **Attaching a card converts the failure
  mode from *breaks* to *bills*.** Found by
  [ticket 09](../.scratch/200squares-v1/issues/09-artwork-storage.md).
- **Cloudflare** — Free. DNS only, not proxied
  ([ticket 02](../.scratch/200squares-v1/issues/02-ddos-and-the-bill.md)).
- **Stripe** — no ceiling to set; it only takes money in.

## Commits

**Commit as `hi@robvb.com`**, or Vercel refuses the deploy.

```sh
git config user.email hi@robvb.com
```

## What a new session must know

1. There is no localhost. Push a branch and read the Vercel URL.
2. `staging` is the long-lived test branch. Its address is the Vercel branch URL, and
   renaming the branch changes that address.
3. Preview and staging both talk to the Convex `dev` deployment. They share data.
4. Stripe test mode and Stripe live mode have separate webhook signing secrets.
5. Secrets live in the Convex dashboard and the Vercel dashboard. Not in this repo, not
   in a ticket, not in a commit message.
6. There is **no browser on the VPS**. `node scripts/shot.mjs [path] [out.png]` screenshots
   the staging board with Playwright. Run it from the repo root.
7. Mail comes from `hello@200squares.com` through the `send.` subdomain, and a **reply
   reaches the dev's own inbox** through Cloudflare Email Routing. Never `no-reply@`.
