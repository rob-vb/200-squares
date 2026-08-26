# 39 — What a flood of invocations costs, and what stops it

Type: grilling
Status: open
Blocked by: —
Parent: ../map.md

## Question

Graduated from the map's *Not yet specified* on 2026-08-26. Three build tickets each found
their own half of it and each said the answer belongs in one place, not theirs. It is one
question now.

[Ticket 02](02-ddos-and-the-bill.md) bought the whole cost rule with a **static front**: the
board page comes off the edge cache and costs nothing. It is no longer true.

Four sources of Vercel function invocations on the visitor path:

1. **`/api/auth/get-session`** — [ticket 18](18-build-accounts.md) found that
   `ConvexBetterAuthProvider` calls `useSession()` for **everybody**, signed in or not. One
   invocation per board load. The HTML is still byte-identical and still cached; *static*
   survives, *free* does not.
2. **`/art/<storageId>`** — [ticket 20](20-build-artwork.md): a Vercel function on a cache
   miss, and an id that does not exist misses **every** time.
3. **`?anything` on `/art/…`** — [ticket 28](28-prove-the-mail.md): the query string is part
   of Vercel's cache key, so a good id with junk appended is a fresh invocation, for ever.
   The regex guard turns away rubbish *paths* and nothing else.
4. **`/api/purge`** — [ticket 36](36-build-purge-on-release.md): a wrong secret costs one
   hash comparison, which is cheap and is still an invocation.

- **Measure before deciding.** Nobody has counted. How many invocations is one real board
  visit today, and what does a plausible flood look like against Hobby's ceiling and against
  Pro plus a $5 spend cap? The rule is ticket 02's — *offline is acceptable, a bill is not* —
  and Hobby pausing is the enforcement, so the question is when the site goes dark, not what
  it costs.
- **The two escapes ticket 18 named for `/api/auth/*`**, both with a price: a **Vercel edge
  rewrite** straight to `.convex.site`, which moves the cost to Edge Requests but loses the
  header fix-up the Next handler exists to do; or a **signed-in marker** in `localStorage`
  gating the provider, which needs a landing route to set it on the device that opens the
  mail. Is there a third?
- **One answer or four?** Whatever protects `/api/auth/*` — WAF rate rules, a rewrite, a
  cache — probably protects the other three. Say so, or say why not.
- **What lands before launch and what waits.** [Ticket 25](25-launch.md) already turns on
  Vercel Pro, Spend Management and five WAF rules. Some of this may simply be a sixth rule
  written down there; some may be code. Split it.

⚠️ Nothing here is allowed to reopen the board being live for everyone
([ADR 0001](../../../docs/adr/0001-live-board-clicks-outside-it.md)). Convex Free cannot
bill. This is about Vercel, which can.
