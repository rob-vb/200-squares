# 34 — A stripped picture stays at its /art URL

Type: grilling
Status: resolved
Blocked by: —
Parent: ../map.md

## Question

[Ticket 24](24-build-removal.md) says one press takes a reported picture off the board.
[Ticket 28](28-prove-the-mail.md) pressed it and found that **the picture is still there**
— not on the board, but at the URL somebody would have reported.

Measured on staging, 2026-08-26:

```
/art/kg29wqxwj7hgxxtwfe1fpfpzf98d7r2d         → 200, the picture, after the strip
/art/kg29wqxwj7hgxxtwfe1fpfpzf98d7r2d?bust=1  → 404 No such file.
```

So `strip` really did call `release` and the file really is gone from Convex. What answers
the plain URL is **Vercel's edge**, holding a copy under
`public, max-age=31536000, s-maxage=31536000, immutable` — for a year, in every region that
had already fetched it, and in the browser of everybody who ever loaded the board.

⚠️ **The route's own reasoning is why.** `src/app/art/[id]/route.ts` says *"Replacing
artwork produces a new id and therefore a new URL, so there is no cache to bust."* That is
true of **replacing** and it is the whole point of [ticket 09](09-artwork-storage.md)'s
defence — the year is what keeps the pictures off Convex's 1 GB of egress. It is not true
of **removing**, which is the one case where the old URL must stop working, and it is the
case the sentence did not think about.

### What has to be decided

Not *whether* — a picture taken down for adult content, malware or impersonation that keeps
serving from its own URL is the removal not working. What to do instead, and every answer
costs something [ticket 02](02-ddos-and-the-bill.md) is protecting:

- **Purge the path on strip.** Exactly right and nothing else changes. Needs Vercel's purge
  API — check whether Hobby has it at all, because the site is on Hobby until
  [ticket 25](25-launch.md).
- **Shorten the year.** Turns every artwork request back into a function invocation on a
  cache miss, which is the cost ticket 09 built this route to avoid and the thing Hobby
  pauses on. Almost certainly wrong.
- **Serve through an id that changes.** A second, mutable segment in the path so a strip
  can invalidate it. Costs a board-query field and a redesign of a URL ticket 09 settled.
- **Accept it and say so.** `/terms` and the removal mail would have to admit that a
  removed picture may stay reachable for some time at its old address. Cheap, honest, and
  it is a promise about somebody else's reported content, which is the worst kind to break.

⚠️ **Whoever picks this up: `?bust=1` returning 404 is itself worth a second look.** A query
string is part of Vercel's cache key, so **any** id — including a good one — can be forced
into a function invocation by appending one. That is the same invocation-flood concern the
map's *board view is no longer free* fog item already carries for `/api/auth/*` and `/art`,
and the regex guard does not touch it. It belongs in that one answer, not in this ticket.

## Answer

**A released file is purged from Vercel's edge by cache tag, and `immutable` comes off the
year.** Four decisions, taken 2026-08-26.

### ⚠️ The first option in the question does not exist

*Purge the path* cannot be built. Vercel's
[cache key](https://vercel.com/docs/caching/cdn-cache/purge) is the method, the URL, the
host, the deployment and the scheme, and **it is not configurable**. The docs say it in one
line: *"Cache keys are not configurable. To purge the cache you must configure cache tags."*

So the route has to **tag its own answers** on the way out — a `Vercel-Cache-Tag` response
header — and the purge names the tag, never the path. That is not a worse version of option
one; it is the only version of it. The rest is cheap: **256 characters per tag, 128 tags per
response, 16 tags per bulk call**, no plan gate anywhere in the documentation, and Vercel
does not bill the purge event. It works on Hobby, so it does not wait for
[ticket 25](25-launch.md).

The three other options in the question fall away with it. *Shorten the year* was already
almost certainly wrong. *An id that changes* buys nothing a tag does not. *Accept it and say
so* was the fallback if no mechanism existed, and one does.

### 1. It fires on `release`, not on `strip`

The question framed this as a removal problem. It is not. `release` in `convex/art.ts:82` is
the place where a file **stops being pointed at**, and `strip` is one of its four callers.
The other three are replacements — `setBlockArtwork`, `setBidArtwork`, `stripBanner` — and
each of them leaves the same year-long copy of the **old** picture on the edge. An owner who
replaces a picture *because* it was the wrong one has the identical hole, and nobody would
have called that a removal.

So `release` schedules the purge itself, for **exactly the ids it deleted** — not for the
ids it was handed. ⚠️ The guard that keeps a shared file alive when a cut block still points
at it is the same guard that must keep its URL alive: purging a file that is still on the
board only costs an invocation to fetch it back. One place, four callers, and the day resale
cuts blocks again it is already right.

### 2. Delete, not invalidate

Vercel offers both and recommends **invalidate**. That recommendation is written for content
that has *changed*, not content that is *gone*: invalidate marks the tag stale, and *"the
next request serves the stale content instantly while revalidation happens in the
background"*. For a picture taken down for adult content or impersonation, serving it
instantly one more time — in every region that holds it — is the removal not working.

`dangerouslyDeleteByTag` revalidates in the **foreground**: the next request goes to the
origin, Convex has no such file, and the visitor gets the 404. The stampede the docs warn
about is a tag spread over many paths; this tag is one file that is now gone and has no
traffic.

### 3. The deployment purges itself, and a failed purge is visible

A Convex mutation may not reach the network, so this is a scheduled action, the same shape
as the removal mail. Two ways to make the call, and they differ in what a leaked secret
costs:

- Convex holds a **`VERCEL_TOKEN`** and calls the REST API. That token can do everything on
  the account.
- Convex calls **a route on the site itself** with a shared secret, and the route calls
  `dangerouslyDeleteByTag` from `@vercel/functions`. No account token exists anywhere, and
  a leaked secret buys an attacker the right to clear a cache.

Take the second. ⚠️ **Cache tags are scoped to the project *and* the environment**, and
`@vercel/functions` reads the environment from the deployment URL that invoked it — so the
Convex dev deployment must call the staging URL and prod must call `200squares.com`. One
variable, and getting it wrong purges the wrong environment silently.

A failed purge is the whole risk of this design: the picture is still public and nobody
knows. So the action **records** it — `purgedAt` on the `removals` row — reschedules itself
with backoff, and `/admin` shows any removal that has not been purged. A removal that half
happened must look different from one that happened.

### 4. `immutable` comes off; the year stays

No purge can reach the copy in a browser. `max-age=31536000, immutable` means the browser
**does not even ask on a reload** — so the person who reported the picture presses reload,
sees it, and concludes the report did nothing.

Drop `immutable` alone. Normal visits are unchanged, a reload asks the edge, the edge
answers, and Convex is never touched — [ticket 09](09-artwork-storage.md)'s defence is about
Convex egress and survives whole. ⚠️ **Do not split `Cache-Control` from
`Vercel-CDN-Cache-Control` to give the browser a short life.** Every returning visitor would
re-fetch every picture on the board from the edge, and that is Fast Data Transfer, which
Hobby counts.

### What this costs elsewhere

⚠️ The purge route is **one more function endpoint**, and a flood of POSTs to it is
invocations — the same class of thing as `/api/auth/*` and `/art`. It belongs in the map's
*board view is no longer free* answer, with the other two, and is not decided here.

Written up as [ADR 0004 — *A year on /art is a cache, not a promise*](../../../docs/adr/0004-a-year-is-a-cache-not-a-promise.md),
because a future reader will look at a route that calls itself `immutable`, see a cache tag on
it, and wonder. The build is [ticket 36](36-build-purge-on-release.md).
