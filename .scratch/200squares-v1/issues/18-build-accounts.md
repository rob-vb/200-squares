# 18 — Build: accounts and signing in

Type: task
Status: resolved
Blocked by: 08, 14, 15 (15 done 2026-08-25)
Parent: ../map.md

## Question

Nothing to decide. [Ticket 08](08-accounts.md) settled it; this puts it in the repo.
Read its answer first.

Build, in this order:

- **The component.** `@convex-dev/better-auth` registered in `convex/convex.config.ts`.
  Magic Link only — no password, no OAuth. **No `crossDomain` plugin**: Next.js is
  full-stack and the cookie is first-party.
- **The handler** at `app/api/auth/[...all]/route.ts`, and `ConvexBetterAuthProvider`
  replacing `ConvexProvider` in the layout.
- **The magic link**: one hour, single use, sent through Resend. The mail says it
  expires. Its words belong to [ticket 13](13-email.md); the sending belongs here.
- **Turnstile on the sign-in form**, the same widget as the reservation in
  [ticket 16](16-build-checkout.md). "Send me a link" is an unauthenticated write that
  spends Resend quota.
- **`requireOwner(ctx, blockId)`** — session → Better Auth user → `owners` row on
  `userId` → compare with `block.ownerId`. One function, and the only place ownership is
  decided. Every protected write goes through it.
- **`requireAdmin(ctx)`** — the session email against the `ADMIN_EMAILS` environment
  variable on the Convex deployment. No plugin, no role column, no table.
- **The join.** When a magic link is followed, fill `owners.userId` by matching the
  normalised email. An owner with no `userId` is normal, not broken.
- **The prototype's fake sign-in goes away**, and My squares becomes a real client panel
  fed by the session.

⚠️ **Nothing on the board path may read `cookies()`, `headers()` or a preloaded auth
query.** Auth resolves client-side only, after hydration. This is
[ticket 02](02-ddos-and-the-bill.md)'s cheapest defence and it is easy to lose by
accident. A signed-in owner must get byte-identical HTML to a stranger.

Check it on the Vercel preview URL. Two things to verify by hand: `next build` still
reports the board route as static, and a signed-in visitor's board HTML is unchanged.

The webhook that creates the owner row and asks for the mail is
[ticket 16](16-build-checkout.md)'s. Build against it; do not build it here.

## Answer

**Better Auth runs on Convex, the browser reaches it through 200squares.com, and the board
still never asks who is looking.** The ticket said nothing was left to decide and that was
almost true. Three things turned up on the way, and two of them are findings the map has to
carry.

### What is in the repo

- **The component** in `convex/convex.config.ts`, its provider in `convex/auth.config.ts`,
  and `convex/auth.ts` as the single door: `createAuth`, `currentOwner`,
  `requireOwner(ctx, blockId)`, `requireAdmin(ctx)`.
- **The handler** at `src/app/api/auth/[...all]/route.ts`. ⚠️ It is a **forwarder, not an
  auth server** — `convexBetterAuthNextJs` proxies `/api/auth/*` to `.convex.site`, and
  Better Auth itself runs on Convex, registered in `convex/http.ts`. That is what keeps the
  cookie first-party and is exactly why ticket 08 refused the `crossDomain` plugin.
  `ConvexBetterAuthProvider` replaces `ConvexProvider` in `convex-provider.tsx`.
- **Magic link only.** `emailAndPassword` is off. The link lives **one hour** and the mail
  says so. `convex/lib/mail.ts` is one `fetch` to Resend — ticket 22 takes it over and adds
  the other five messages to it.
- **Turnstile on the sign-in form**, and ⚠️ **not by hand**: Better Auth's own `captcha`
  plugin, scoped to `endpoints: ["/sign-in/magic-link"]`, reading the token from
  `x-captcha-response`. It guards the HTTP endpoint only, so the webhook — which calls
  `auth.api.signInMagicLink` directly — is not caught by it. Proved on staging: a POST with
  no token comes back `400 MISSING_RESPONSE`.
- **The webhook asks for the link.** `checkout.fulfil` schedules
  `internal.auth.sendSignInLink` once a block is written, and not on a refunded order.
  Scheduled, not awaited: a mutation cannot reach the network and a Resend outage must not
  undo a payment that has already landed.
- **`owners.mine` takes no argument any more.** Ticket 15 keyed it on an id the client
  passed in; it now resolves through the session, and a stranger opens no subscription at
  all (`"skip"`). `owners.seedViewer` and `src/lib/board/viewer.tsx`'s fake sign-in are
  deleted. Sign in is a real panel flow, `src/components/panel/sign-in.tsx`.

### ⚠️ The join is the address; `userId` is only a shortcut to it

Ticket 08 asked for a trigger on the component's user table to fill `owners.userId` when a
magic link is followed. **It is not a trigger.** Wiring `authFunctions` makes `authComponent`
reference `internal.auth`, whose type is derived from the module that defines
`authComponent` — TypeScript reports `TS7022`, a circular initializer, and there is no
annotation that breaks it without hand-writing the generated types.

So the join happens twice, by address, and neither half is a repair for the other:
`currentOwner` reads `by_user` and falls back to `by_email`, and `requireOwner` writes the
shortcut the first time an owner writes anything. The rule is unchanged — the normalised
address is what makes them the same party — and it now also answers the **other order** for
free: an account made before the first purchase, which a trigger on user-create could never
have seen.

### ⚠️ The finding: signing in costs a Vercel invocation on every board view

Ticket 08 wrote that the handler "is hit on sign-in and never on a board view". **That is
not true of the real library.** `ConvexBetterAuthProvider` calls `authClient.useSession()`
unconditionally, and Better Auth's session atom fetches `/api/auth/get-session` on mount —
for a stranger as much as for an owner. Observed on staging: `auth 200 /api/auth/get-session`
on a first load with no cookie.

Nothing about ticket 02's **static** rule is lost: the HTML is unchanged, byte for byte,
and the page still comes off the edge cache. What is lost is the *free* part. Every board
view is now one Vercel function invocation, where before it was none, and that is the
cheapest defence the map has been protecting since ticket 02.

It is not fixed here, because fixing it is a decision and this ticket had none. Two escapes
exist and both have a price: a **Vercel edge rewrite** of `/api/auth/*` straight to
`.convex.site`, which moves the cost to Edge Requests but takes away the header fix-up the
Next handler exists to do; or a **signed-in marker** in `localStorage` that gates the
provider, which needs a landing route to set it on the device that opens the mail. Recorded
on the map under *Not yet specified*.

### ⚠️ The VPS could not sign in at all, so now it can

There is no browser here and no inbox either, so a magic link could be sent and never read —
which would leave My squares, ticket 20's upload and ticket 19's bid panel unlookable-at
for the rest of the map. Two dev affordances, both refusing without `SEED_ENABLED` and both
internal:

- `npx convex run auth:devSignInLink '{"email":"…"}'` hands the link back instead of posting
  it. It catches the URL in a `WeakMap` keyed on the ctx, so two calls can never cross.
- `npx convex run seed:adopt '{"email":"…"}'` points the busiest seeded owner at a real
  address, which is what the deleted fake sign-in used to buy.
- `node scripts/signin.mjs '<url>'` follows the link, screenshots, and leaves the session in
  `.auth.json` for the next script. **Tickets 19, 20, 21 and 24 should start from it.**

### Checked, on the real thing

`tsc` and `eslint` clean. `next build` green with **all five pages `○ (Static)`** and only
`/api/auth/[...all]` and `/api/checkout` dynamic.

On the staging URL, against the dev deployment:

- The sign-in panel opens from the top bar, sends, and says *Check your inbox*.
  `POST /api/auth/sign-in/magic-link` → 200 with a token, **400 `MISSING_RESPONSE` without
  one**.
- A real magic link signs in. The top bar reads *ROB VB · 14 squares · Sign out*, and My
  squares shows three blocks, a banner day and a standing bid — all through the session,
  with no owner id anywhere.
- ⚠️ **The board HTML is byte-identical**: same SHA-256, 42,631 bytes, `x-vercel-cache: HIT`
  and **no `Set-Cookie`**, fetched with the session and without it. That is the check the
  ticket asked for, and it passes.
- Resend accepted the live send to a real address. The mail itself was not read from here.

### What this leaves for other tickets

- **[19](19-build-auction.md), [20](20-build-artwork.md), [21](21-build-clicks.md),
  [24](24-build-removal.md)** — `requireOwner` and `requireAdmin` exist and **nothing calls
  them yet**. They are unexercised code until one of those tickets lands.
- **[22](22-build-email.md)** — `convex/lib/mail.ts` is the transport, with one message in
  it. ⚠️ Stripe's own receipts are **still on**; switching them off is ticket 22's.
- **[24](24-build-removal.md)** — `ADMIN_EMAILS` is **unset on dev**, so `requireAdmin`
  currently admits nobody. That is the safe way round, and setting it is that ticket's
  first step.
- **Making the copy true** — `/terms` still owes ticket 08's three sentences: the email is
  the key, losing it is not the end, and getting back in means proving the payment to a
  person.
