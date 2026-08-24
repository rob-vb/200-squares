# 14 — Environments, keys and the first real deploy

Type: task
Status: open
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
