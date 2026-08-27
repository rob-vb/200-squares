# 08 — Accounts, signing in and access

Type: grilling
Status: resolved
Blocked by: 05
Parent: ../map.md

## Question

Charting fixed the principle: **buying needs no account.** Stripe supplies the email,
and the site then creates the account and sends a magic link. Better Auth, no
password. The prototype's one-click fake sign-in goes away.

Decide how that actually works with Convex and Better Auth:

- **How Better Auth and Convex fit together.** Read the current documentation before
  choosing anything — this is not a stack to reason about from memory.
- **The moment of creation.** The webhook has an email and a paid block. Is an account
  made immediately, or only when the buyer follows the link? What if the email is one
  they cannot read, or they mistype it into Stripe.
- **A second purchase, same email.** The block joins the existing owner. What proves
  it is the same person — the address alone?
- **What a session may do.** Change artwork, change a link, list a square for sale,
  place a bid, see their own click counts. Each of those is a write worth protecting.
- **The admin.** The dev needs a role of their own for [ticket 11](11-admin-removal.md).
  One flag on a user, or something separate?
- **Losing access.** No password means the email is the only key. What happens when
  someone loses the address that owns four squares? Say what the site can and cannot
  do — permanent ownership tied to a dead inbox is a real case, and `/terms` will have
  to answer it.
- **Sessions and the board.** The board is public and mostly static. Signing in must
  not turn the first screen into a per-visitor render, or
  [ticket 02](02-ddos-and-the-bill.md)'s cheapest defence disappears.

`Owner` and `Viewer` are already defined in `CONTEXT.md`. A logged-in viewer is an
owner; keep the words and do not invent a `user` beside them without saying why.

## From resolved decisions

[Ticket 06](06-buying-for-real.md) fixed two things here. The **webhook** creates the
account, not the buyer. And the **thank-you page must work before the mail is ever
opened**: the Stripe session id in the return URL grants exactly one right — set artwork
and link on the blocks of that order — so nobody leaves the site with an empty square.
The magic link is the way back later, not the way in.

## Answer

**The webhook makes an owner, not a user. Better Auth makes the user when the magic
link is followed. The two are joined on the email, and the board never asks who is
looking.**

### How Better Auth and Convex fit

`@convex-dev/better-auth` is the official component, registered in
`convex/convex.config.ts` beside the app's own functions. The packages are installed
(ticket 14): `convex`, `@convex-dev/better-auth`, `better-auth@~1.6.15`.

Three facts settle most of the design:

1. **The handler lives on 200squares.com**, at `app/api/auth/[...all]/route.ts`. Next.js
   is a full-stack framework, so the **`crossDomain` plugin is not used** — that pair is
   for single-page apps served from another origin. The session cookie is first-party on
   the site's own domain.
2. **Signing in happens from the client**, through `authClient.signIn.*`. Convex
   functions talk over a websocket, not over HTTP, so a form post cannot reach them.
   `ConvexBetterAuthProvider` replaces `ConvexProvider` and carries the token.
3. **Inside a Convex function** the caller is read with
   `authComponent.getAuth(createAuth, ctx)`. That is the single door every protected
   write goes through.

**Magic Link is on the supported-plugin list.** The `admin` plugin is not — see below.

### The moment of creation

**The webhook writes the `owners` row. It does not write a Better Auth user.**

Ticket 05 already fixed the shape: two rows, and `owners.userId` stays empty until the
magic link is used. This ticket says why the order matters. A Better Auth user created
from a webhook is a user whose email nobody has proved. Following the link is the proof,
and Better Auth creates the user at that moment by itself. Writing one earlier means
writing half a user and then reconciling it — the exact thing ticket 05 refused.

So the webhook does three things: it writes the block, it writes or finds the `owners`
row keyed on the **normalised email** from Stripe, and it asks Resend to send a magic
link.

**A buyer who never follows the link keeps their square.** The owner row stands, the
block is theirs, and the artwork reminders at 1, 7 and 30 days (ticket 06) keep asking.
An account is how you come back later. It is not what makes you an owner.

⚠️ **The magic link expires in one hour, not in five minutes.** Better Auth's default is
short because it assumes someone who just asked for a link is still at the keyboard. Here
the link arrives after a payment, and the buyer may open the mail that evening. One hour,
single use, and the mail says so.

**Turnstile guards the sign-in form**, the same way it guards the reservation in ticket
16. "Send me a link" is an unauthenticated write that sends mail through Resend's free
3,000 a month. A loop on that form empties the quota in an afternoon.

### A second purchase, same email

**The email alone. That is the whole test, and it is deliberate.**

The email is verified twice over: Stripe took a payment against it, and following the
link proves the inbox is reachable. A second purchase from the same address joins the
same owner, and both blocks appear in My squares.

⚠️ **The hole is a mistyped address**, and it cannot be closed by machinery. The buyer
types an email into Stripe Checkout. If they type a stranger's, the stranger can claim
the block. Three things keep it small:

- The buyer never needs the mail to finish. The thank-you page grants artwork rights by
  the Stripe session id (ticket 06), so nobody leaves the site with an empty square.
- The confirmation mail goes to the typed address, so a mistype is visible within
  minutes, not months.
- The dev can move a block between owner rows by hand.

That last one is a **support case, not a feature**. Do not build a self-service repair
for it.

### What a session may do

Every protected write goes through one guard, `requireOwner(ctx, blockId)`: session →
Better Auth user → `owners` row on `userId` → compare with `block.ownerId`. It is one
function and it is the only place ownership is decided.

Behind it: set or replace artwork, set or replace the link, list a block for sale, cancel
a listing, read their own click counts, spend credit, and set artwork and link on a
banner day they won.

**Bidding is left to [ticket 07](07-auction-holds.md).** That ticket asks whether a bid
needs an account. Both roads are open from here — the guard exists, and a signed-out bid
is possible too — and 07 owns the choice.

### The admin

**One environment variable on the Convex deployment: `ADMIN_EMAILS`.** A
`requireAdmin(ctx)` helper compares the session's email against it.

No Better Auth `admin` plugin, because it is not on the supported list and it wants its
own columns on the user table. No role field, no `admins` table. There is one admin and
there will be one admin. A Convex environment variable changes without a deploy, holds
no secret worth stealing, and is not in the repo. It is the cheapest thing that works,
which is what [ticket 11](11-admin-removal.md) asked for.

### Losing access

**Say it plainly, because `/terms` has to.**

There is no password, so the email is the only key. **The site cannot recover an account
by itself and there is no self-service reset.** A dead inbox that owns four squares is a
real case and the honest answer is a human one.

What makes it recoverable at all is that **the payment is the proof of purchase**. The
person knows the date, the amount, and the last four digits of the card. The dev finds
the order in Stripe, and moves the blocks to a new owner row with a new address. Ticket
06 keeps orders **ten years**, so that proof outlives almost any inbox.

`/terms` must say three things: the email is the key; losing it is not the end; and
getting back in means proving the payment to a person.

### Sessions and the board

**The board never asks who is looking.** The rule from
[ticket 02](02-ddos-and-the-bill.md) survives whole, and it survives by one discipline:

> No server component on the board path may read `cookies()`, `headers()` or a
> preloaded auth query. Auth resolves **client-side only**, after hydration.

An anonymous visitor carries no cookie at all, so there is nothing to break. A signed-in
owner gets exactly the same HTML as a stranger, and their own state arrives over the
websocket that ticket 05 already gave every visitor. **My squares is a client panel**,
which is how the prototype already works.

The sign-in handler at `app/api/auth/[...all]/route.ts` is a server function, but it is
hit on sign-in and never on a board view.

⚠️ **A finding this ticket did not go looking for: the board is already not cacheable.**
Every page reads `props.searchParams` for `?data=`, so `next build` marks all five routes
`ƒ (Dynamic)` today — before auth exists. Ticket 02's cheapest defence is not weakened by
this ticket; it was never switched on.

`?data=` is the mock-dataset switch, which the map already carries as fog ("Removing the
mock datasets"). This makes it a **cost requirement rather than tidiness**, and it lands
on [ticket 15](15-build-schema.md), which displaces the datasets. Whatever replaces
`?data=` must not be a search parameter on the board route.

### Vocabulary

`Owner` and `Viewer` in `CONTEXT.md` stand and no `user` is invented beside them. What
changes is one line: a Better Auth **user** is a row in the auth component's own table,
and an `Owner` may point at one. A signed-in Viewer is an Owner; a signed-out Viewer is a
stranger; and an Owner who never followed their link is an Owner all the same.
`CONTEXT.md` gets that sentence when ticket 15 or the account build lands.

### For ticket 13

The magic link is **the one mail that may not fail**, because it is the only key. And an
email address is now stored and passed to Resend, which `/privacy` does not yet admit.
Both are already on [ticket 13](13-email.md)'s plate; this is the confirmation that they
are not optional.
