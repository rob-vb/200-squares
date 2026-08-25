# 08 — Accounts, signing in and access

Type: grilling
Status: open
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
