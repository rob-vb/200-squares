# 39 — What a flood of invocations costs, and what stops it

Type: grilling
Status: resolved
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

## Answer

**One real board visit costs exactly one Vercel function invocation, and that is not the
problem. The flood is, and the flood is stopped for free.** Nothing here is code.

### What was measured (staging, one deployment, 2026-08-26)

Nobody had counted, so this is the count. A Playwright run reading `x-vercel-cache` off
every response of one board load:

| What the visitor asks for | `x-vercel-cache` | Invocation? |
| --- | --- | --- |
| `/` (the board) | `PRERENDER` → `HIT` | no |
| 8 RSC prefetches (`/about`, `/how-it-works`, `/terms`, `/privacy`) | `PRERENDER` | no |
| static chunks, fonts, CSS | `HIT` | no |
| `/api/auth/get-session` | **`MISS`, every time** | **yes — 1 per page load** |
| `/art/<id>` | `MISS`, then `HIT` | yes — 1 per file per region, then a year |

**One visit, one invocation.** The static front ticket 02 bought is still standing; only
`get-session` walks through it, exactly as [ticket 18](18-build-accounts.md) said.

Three things the question did not know:

1. ⚠️ **Item 3 of the question is smaller than it was written.** `/?junk=zzz999` and
   `/about?junk=qq1` both answered **`HIT`**. A query string does **not** vary the cache key
   of a *static* route. Only `/art/` is a function route, and there it does:
   `?a=1` `MISS`, `?a=2` `MISS`, `?a=3` `MISS` — each new string one invocation and then a
   year in the cache. [Ticket 28](28-prove-the-mail.md)'s finding is right about `/art/` and
   does not generalise to the pages.
2. **An unknown id costs an invocation too.** `/art/doesnotexist…` → `MISS` (404), then
   `HIT` — but that 404 lives 30 seconds by design, so each fresh id is one more.
3. ⚠️ **The regex guard saves the Convex fetch, not the Vercel invocation.**
   `/art/short` fails `looksLikeId` and is still `MISS` = one invocation. It is worth
   keeping — it defends Convex Free's function-call cap — but it defends nothing here.

### The ceilings (Vercel's own numbers, read 2026-08-26)

- **Hobby**: 1,000,000 invocations, 4 CPU-hours, 360 GB-hrs provisioned memory, 100 GB Fast
  Data Transfer per month. Over it, the deployment pauses.
- **Pro**: $0.60 per 1M invocations; Active CPU from $0.128/hour; provisioned memory from
  $0.0106/GB-hr; first 10M Edge Requests and first 1 TB transfer included.
- ⚠️ **Blocked traffic bills nothing** — ticket 02's strongest fact, and the whole answer
  rests on it.

So the arithmetic: 1M invocations is **1M real visits a month**, ~33,000 a day. This site
does not have that problem. A flood does not need the board at all — it aims straight at
`/api/auth/get-session` or `/art/<id>?a=N`, and 1M requests at 100/s is under three hours.

**Which is why removing `get-session` is the wrong move.** Both escapes
[ticket 18](18-build-accounts.md) named — the edge rewrite to `.convex.site`, and the
`localStorage` marker — buy $0.60 per million visits and pay for it with a real failure
mode (a lost header fix-up, or a signed-in owner who looks signed out on a second device).
Neither closes `/art/`. The attacker simply moves. **There is a third option and it is to
do nothing**: leave `get-session` alone and make the flood free instead.

### One answer, not four

All four leaks are one answer, and it is the firewall. Read out of Vercel's own OpenAPI
spec, a custom rule condition is a closed list — `host, path, method, header, query,
cookie, target_path, route, raw_path, ip_address, region, protocol, scheme, environment,
domain_environment, user_agent, geo_*, ja3_digest, ja4_digest, …` — with operators
`re, eq, neq, ex, nex, inc, ninc, pre, suf, sub, gt, gte, lt, lte, list`.

`query` with `ex` means *"a query string is present, whatever it is"*. That is the rule the
`/art/` hole needs, and it is expressible.

⚠️ **It cannot go in `vercel.json`.** `mitigate: {action: deny}` exists there, but `has`
matches a query key **by name** and an attacker invents a new name each time; and
`vercel.json` supports no rate limit at all, only `deny` and `challenge`. So all three new
rules are dashboard/API config. **Zero code lands from this ticket** — see the one
exception below.

Three rules, appended to [ticket 25](25-launch.md):

- **`/art/` with a query string → deny.** `path` `pre` `/art/` AND `query` `ex`. No honest
  request to `/art/<id>` carries one. Infinite hole, zero cost, exact condition.
- **`/art/` → rate limit per IP.** Deny is wrong here: a 404 is a valid answer for a file
  that was just released. A full board asks for a few hundred files once and then everything
  is `HIT`, so a per-IP limit passes a real visitor and stops an id-scanner.
- **`/api/auth/*` and `/api/purge` → rate limits, different sizes.** `get-session` is the
  only function on the normal path, so it is also the easiest target: a per-IP limit wide
  enough for real navigation. `/api/purge` has one honest caller that rings a few times a
  day: a tight one.

⚠️ **And one rule comes off.** [Ticket 02](02-ddos-and-the-bill.md) put a Stripe-webhook
bypass **first**, "or webhooks die". [Ticket 14](14-environments-and-keys.md) then moved the
webhook to `…convex.site/stripe/webhook`, which never passes Vercel. The rule protects
nothing and costs a slot in the ordering. Five become four, plus three, is seven.

### The one code change

A comment, not logic. The `/art/` deny rule breaks the board on the day somebody appends
`?v=2` to bust a cache — a tempting reflex, and nothing in the code stops it. So
`src/app/art/[id]/route.ts` gets a ⚠️ next to the others saying a query string on an
`/art/` URL is refused by the firewall.

### ⚠️ Found on the way: production is already open, running the old prototype

`https://200squares.com/` answers **200**, publicly, today. And it answers:

```
cache-control: private, no-cache, no-store, max-age=0, must-revalidate
x-vercel-cache: MISS        (every time; /about, /how-it-works and /terms the same)
```

Production is serving `main`, and `main` is **73 commits behind** `staging`. That is the
prototype from before [ticket 08](08-accounts.md) — the build that read `searchParams`,
which is why every route there is dynamic. On staging `/` is `PRERENDER`; on production
nothing is cached at all.

So the live site is the most expensive shape this project has ever had, it is public, it is
on Hobby with no firewall in front of it, and it still contains the resale market that V1.0
dropped. **No bill is possible** — Hobby pauses — so this ticket's answer to it is $0 and
nothing to do. It is recorded on [ticket 25](25-launch.md) as a fact the launch has to know.
Taking the old build down early would be its own ticket, not a line in this one.

### Not answered here, on purpose

**How the dev finds out a flood happened.** Vercel has firewall observability and Spend
Management sends notice. The map already keeps *monitoring* in the fog, next to the
€10,000 threshold, and this belongs in that patch rather than in a cost decision.
