# 14 — Environments, keys and the first real deploy

Type: task
Status: resolved
Blocked by: 02, 04
Parent: ../map.md

## Question

Nothing to decide. Work that must exist before anything real can be tested, and it
blocks more than it looks like it does.

- **Convex** — a dev deployment and a production deployment, and how a Vercel preview
  branch picks one. Preview branches are the only way the dev sees anything, so this
  matters more here than on a normal project.
- **Stripe** — test keys and live keys, webhook endpoints for both, and the webhook
  signing secrets. Note that a webhook cannot reach a preview URL that changes every
  branch; find out what does work.
- **Better Auth** — its secret, and the URLs it will accept a callback on.
- **Resend** — the API key, and the domain verification from
  [ticket 04](04-domain.md).
- **Vercel** — which variables are set per environment, and which must never reach
  the browser. `.env.local` holds only a Vercel OIDC token today.
- **The spend limits** from [ticket 02](02-ddos-and-the-bill.md), actually set, on
  every service that can bill.

Record in the answer where each key lives, what is set where, and what a new session
has to know. Do not put a secret in the answer.

## Progress — 2026-08-25

The half an agent can do is done. The half that needs a browser and a card is not.

### Done

- **The packages are installed**: `convex`, `@convex-dev/better-auth`, `better-auth`,
  `stripe`, `resend`. Nothing is wired up yet — that is tickets 15, 16 and 08.
- **[`docs/environments.md`](../../../docs/environments.md)** — the whole layout, with
  every variable, where it is set, and what a new session must know. No secrets, ever.
- **[`docs/setup-checklist.md`](../../../docs/setup-checklist.md)** — the eleven steps
  left, with the real deployment URLs filled in.

⚠️ There was a wizard, `scripts/setup-environments.sh`. It is **deleted**. It exited at
step 11 twice, because `"Pro is $20 a month"` in a double-quoted line made bash read `$2`
as a positional parameter under `set -u`. The dev asked for a plain list instead, and a
plain list is the right shape for work that is entirely dashboards. It is in the git
history if anyone wants it back.

### Three decisions this ticket had to make

1. **Convex preview deployments are not used.** One `dev` deployment serves every
   preview branch. A backend per branch would give every branch a new `.convex.site`
   address, and Stripe, Better Auth, Resend and Turnstile each need one that does not
   move. The cost is that branches share a database, which for a one-person project
   is no cost at all.

2. **`staging.200squares.com` is a custom domain on the git branch `staging`.** A
   Vercel preview URL changes with the branch name; a Stripe redirect URL, a Better
   Auth callback and a Turnstile hostname cannot. Deployment Protection stays **on** —
   the dev is signed in to Vercel, so the site opens for them and for nobody else.

3. ⚠️ **The Stripe webhook goes to Convex, not to Vercel** —
   `https://<deployment>.convex.site/stripe/webhook`, a Convex HTTP action. The ticket
   asked what works, given a webhook cannot follow a preview URL. This is the answer,
   and it is better than a bypass secret: the address is stable and public, Convex is
   the source of truth so the webhook writes where it must, it burns no Vercel
   invocations (ticket 02's bill rule), and Better Auth already serves from the same
   host. **[Ticket 16](16-build-checkout.md) must build the webhook there, not in a
   Next.js route.**

### Waiting on the dev

Work through [`docs/setup-checklist.md`](../../../docs/setup-checklist.md). Vercel Pro,
the spend cap, the domains, the build command, the variables, the Stripe webhook and the
first deploy. Nothing after this ticket can be tested until it is done.

Done so far: the Convex dev deployment is **`proper-heron-683`** in **`eu-west-1`** (owner
data and email addresses stay in the EU, which `/privacy` may want to say); both Convex
deployments exist; Stripe, Resend, Turnstile and Cloudflare Email Routing are set up; and
`BETTER_AUTH_SECRET`, `SITE_URL` and `BOARD_LIVE` are set on dev.

This ticket stays **claimed**, not resolved, because the work is genuinely half
finished. Say "ticket 14 is finished" when the wizard is through.

## Answer

**Two Convex deployments, one Vercel project, and the branch URL as the staging address.
The launch half is [ticket 25](25-launch.md).**

### The shape

| | |
| --- | --- |
| Convex dev | `proper-heron-683`, `eu-west-1` |
| Convex prod | `energized-deer-345`, `eu-west-1` |
| Vercel project | `200-squares` |
| Staging | `https://200-squares-git-staging-robs-projects-52973834.vercel.app` |
| Production | `200squares.com`, attached and verified, no DNS yet |

⚠️ **Both Convex deployments are in `eu-west-1`.** Owner rows and email addresses stay in
the EU. `/privacy` may want to say so, and it is a fact this map never chose — it fell out
of where the dev created the project.

### Three decisions

1. **No Convex preview deployments.** One `dev` deployment serves every preview branch. A
   backend per branch gives each branch a new `.convex.site` address, and Stripe, Better
   Auth, Resend and Turnstile each need one that does not move. The price is that branches
   share a database, which for one person is no price at all.

2. ⚠️ **The Stripe webhook goes to Convex, not to Vercel** —
   `https://proper-heron-683.eu-west-1.convex.site/stripe/webhook`, a Convex HTTP action.
   The ticket asked what works when a webhook cannot follow a preview URL. This is better
   than the bypass secret it was fishing for: the address is stable and public, Vercel's
   Deployment Protection never sees it, Convex is the source of truth so the webhook writes
   where it must, it burns no Vercel invocations, and Better Auth already serves from the
   same host. **[Ticket 16](16-build-checkout.md) must build it there, not in a Next.js
   route.**

3. ⚠️ **The staging address is Vercel's branch URL, not `staging.200squares.com`.**
   Charting assumed a custom domain; assigning one to a git branch is a **Pro feature**, and
   Pro is deferred (see the dated note on [ticket 02](02-ddos-and-the-bill.md)). The branch
   URL is stable for as long as the branch is called `staging`, which is all any of these
   services need. The custom domain returns at launch, or never — it buys nothing but
   prettiness.

**The build command lives in `vercel.json`**, not in a dashboard override, so it is
versioned and reviewable:

```sh
if [ "$VERCEL_ENV" = "production" ]; then npx convex deploy --cmd 'npm run build'; else npm run build; fi
```

Production pushes the Convex functions as part of the build; a preview does not, because
previews run against `dev`, which the VPS pushes to with `npx convex dev`.

### What is set, and where

Full tables in [`docs/environments.md`](../../../docs/environments.md) and
[`docs/setup-checklist.md`](../../../docs/setup-checklist.md). Neither holds a secret and
neither ever may.

The rule worth repeating here: **`NEXT_PUBLIC_` is a promise that the value is compiled
into the browser bundle.** ⚠️ Vercel now refuses such a variable with secret visibility —
they must be set `--visibility config --no-sensitive`, or the build fails.

### ⚠️ Why this ticket resolves with work outstanding

The remaining items — Vercel Pro, the spend cap, DNS, the production variables, the live
Stripe webhook — are **launch work, not environment work**. None of them is needed to build
or test anything. Keeping ticket 14 open would block
[15](15-build-schema.md), [18](18-build-accounts.md), [20](20-build-artwork.md),
[21](21-build-clicks.md), [22](22-build-email.md) and [24](24-build-removal.md) on a card
the dev should not add yet.

They move to **[ticket 25 — The launch switches](25-launch.md)**, which sits at the end of
the map where the destination puts it: *the map is finished when the dev can decide to
launch, not when the launch happens.*

**Ticket 15 needs nothing from this list.** It can start now.

### Two things found on the way

- **A duplicate Vercel project**, `200squares`, fifteen days old and already carrying a
  Convex build command. Deleted with the dev's agreement; it held no custom domain, so only
  `*.vercel.app` URLs went with it.
- **The wizard was a mistake.** `scripts/setup-environments.sh` exited at step 11 twice,
  because `"Pro is $20 a month"` in a double-quoted line made bash read `$2` as a positional
  parameter under `set -u`. It is deleted. Work that is entirely dashboards wants a list,
  not a program — the dev said so and they were right.
