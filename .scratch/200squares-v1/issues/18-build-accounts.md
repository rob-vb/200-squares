# 18 — Build: accounts and signing in

Type: task
Status: open
Blocked by: 08, 14, 15
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
