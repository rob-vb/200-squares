# 36 — Build: a released picture stops being served

Type: task
Status: resolved
Blocked by: 34
Assignee: rob-vb (claimed 2026-08-26)
Parent: ../map.md

## Question

Nothing to decide. [Ticket 34](34-stripped-art-stays-cached.md) settled all four questions;
this is the code.

⚠️ **This one lands before launch.** It is not a launch switch, so it is not on
[ticket 25](25-launch.md), but a removal that does not remove is the one hole on this map
with an outside party standing in it — somebody who reported a picture and was told it was
gone. Do not open the doors with this open.

### The route

`src/app/art/[id]/route.ts`:

- Add `Vercel-Cache-Tag: art-<id>` to the 200. Nothing on the 404 — it lives 30 seconds.
- Take `immutable` out of `Cache-Control`. The year stays. ⚠️ Do **not** add a separate
  `Vercel-CDN-Cache-Control`; ticket 34 says why.
- The comment that says *"there is no cache to bust and nothing here ever has to be
  revalidated"* is the sentence that caused this. Replace it, do not soften it.

### The purge endpoint

A POST route on the site. It compares a shared secret in constant time, then calls
`dangerouslyDeleteByTag` from `@vercel/functions` — a new dependency — for the tags it is
given. Up to 16 tags per call. It must never be cached.

### Convex

- `release` schedules an action for **exactly the ids it deleted**, not the ids it was
  handed. The guard that spares a still-shared file must spare its URL too.
- The action POSTs to `PURGE_URL` — staging from the dev deployment, `200squares.com` from
  prod. ⚠️ Cache tags are scoped per project **and** environment; the wrong URL purges the
  wrong environment and says nothing.
- On failure it reschedules itself with backoff.
- `purgedAt` on the `removals` row, and `/admin` lists any removal that has not been purged.
  ⚠️ A replacement has no `removals` row and cannot carry the field — decide whether a
  failed purge on a replacement is worth its own record, or whether the retry is enough.

### Proving it

`node scripts/shot.mjs`, and the same two requests ticket 28 made:

```
/art/<id>          → 200 before the strip, 404 after
/art/<id>?bust=1   → 404 (unchanged; this is the fog item, not this ticket)
```

⚠️ Prove the **replacement** path as well as the strip path. That is the half nobody had
noticed, and ticket 32 already shows how easily an unexercised `release` slips through.


## Answer

**Built and proved on staging, 2026-08-26.** A released picture stops being served, on
both paths, and a purge that did not happen is on the screen.

### What is in the repo

`src/app/art/[id]/route.ts` puts `Vercel-Cache-Tag: art-<id>` on every 200 and `immutable`
is gone from `Cache-Control`. The year and the `s-maxage`/`max-age` pair are untouched, and
the comment that said *"there is no cache to bust and nothing here ever has to be
revalidated"* is replaced rather than softened — it now says the year is a cache, points at
[ADR 0004](../../../docs/adr/0004-a-year-is-a-cache-not-a-promise.md), and says in as many
words that `Cache-Control` must not be split from `Vercel-CDN-Cache-Control`. The 404 takes
no tag: it lives 30 seconds, and tagging it would put the tag on the answer the purge is
trying to produce.

`src/app/api/purge/route.ts` is the endpoint. Constant-time secret check by hashing both
strings and comparing the digests, then `dangerouslyDeleteByTag` in chunks of 16. Never
cached — a POST is not cached by Next and every answer carries `no-store` anyway.

`convex/purge.ts` is the action, and `convex/art.ts`'s `release` books it for exactly the
ids it deleted. `convex/schema.ts` gains `purgedAt` on `removals`; `convex/admin.ts` hands
`release` the row it just wrote and the `removals` query returns `purged`; the admin page
draws the warning.

### The four ⚠️ the ticket left open

1. **`release` has six callers, not four.** Ticket 34 named `strip`, `setBlockArtwork`,
   `setBidArtwork` and a `stripBanner` that does not exist. The real list is `strip`,
   `removeBanner`, `withdrawBanner`, `setBlockArtwork`, `setOrderArtwork` and
   `setBidArtwork`. Nothing changes in the design — that is the argument for putting the
   purge in `release` rather than at the press, made twice over — but three of the six were
   not on anybody's list, `withdrawBanner` among them, and a withdrawal is the one release
   where nobody did anything wrong and the picture still has to stop being served.

2. **A failed purge on a replacement gets no record.** The retries are the whole answer
   there. A `removals` row is the ten-year record of things taken off after a report, and
   writing one every time an owner changed their own picture would make `/admin` list an
   owner tidying up as a removal. What is at stake differs too: a stale replacement is the
   owner's own former picture with nobody outside waiting to see it gone. The failure is a
   `console.error` in the Convex log and nothing more.

3. **The retries stop.** Six attempts over about eight hours — 30s, 2m, 10m, 1h, 6h. A
   wrong `PURGE_URL` does not come right on its own, and a job that reschedules for ever is
   a bill on a plan that has none. Stopping is not quiet: the `removals` row keeps no
   `purgedAt` and `/admin` goes on saying so.

4. **A removal with nothing to purge is stamped `purgedAt` on the spot** — an empty block,
   or a file another block still shares. Without that, `/admin` would raise the alarm for a
   removal that never had anything to chase, and an alarm that cries wolf is not an alarm.

### One thing the ticket did not ask about, and it matters

⚠️ **`dangerouslyDeleteByTag` resolves silently when it cannot purge.** It looks for a purge
API on Vercel's request context and returns a resolved promise when there is none — off
Vercel, or on a runtime that does not supply one. Called blind, the route would answer
*purged* to everything, Convex would write `purgedAt`, and the picture would still be public
with the one alarm on the site saying it was fine. So the route reads the context itself and
a missing purge API is a 503 the action retries. The symbol it reads is `@vercel/functions`'
own internal, which is the price; if a future runtime supplies purging some other way the
result is a removal wrongly listed as un-purged, which is the safe way for this particular
check to be wrong.

### Proved on staging

The deployment is `d3e7f3c`. ⚠️ **Vercel's cache key includes the deployment**, so a fresh
deploy starts with an empty edge cache — ticket 28's reported id answered 404 before any of
this was exercised. Every measurement below caches and purges inside the same deployment,
which is the only way the proof means anything.

**The replacement path**, which is the half nobody had noticed:

```
upload            /art/kg2btnpk…  200 image/webp, x-vercel-cache: HIT   (cached at the edge)
replace it        /art/kg2btnpk…  404, x-vercel-cache: REVALIDATED      (the purge, in the foreground)
                  /art/kg2ed90j…  200, HIT                              (the new picture)
```

`REVALIDATED` is `dangerouslyDeleteByTag` doing what ADR 0004 chose it for: the next request
goes to the origin rather than serving the stale copy once more in every region.

**The strip path**, `node scripts/strip.mjs hi@robvb.com`:

```
/art/kg2ed90j…  404, REVALIDATED, then HIT on the 30-second negative cache
```

`removals` carries `purgedAt` 393 ms after `removedAt`, first attempt, no retry.

**The endpoint's guard**, four requests:

```
no secret              → 403 forbidden
wrong secret           → 403 forbidden
right secret, no tags  → 400 invalid
right secret, one tag  → 200 {"ok":true,"tags":1}
```

The 200 also proves the purge API is present on this runtime: the `no-purge-api` 503 never
fired.

**The alarm, with real data.** `t36-removals.png`: the four removals that predate this build
carry *Still on the edge · the picture has not been purged*, because they really were never
purged, and the section heading counts them. The removal this ticket made carries nothing.
That is the screen a dev has to be able to read at midnight, and the first thing it ever
said was true.

### Left behind

- `scripts/art-check.mjs` — two requests per `/art` URL with `x-vercel-cache` printed,
  because one request cannot tell a cached 200 from a fresh one. ⚠️ Not `curl`: polling
  staging with it trips the bot challenge and blocks Playwright too.
- `scripts/strip.mjs` stopped ending in a stack trace on success. It read the row again
  after the press through a locator that matches on *Live*, and a stripped block is not
  Live, so a 30-second timeout was the reward for the button working. It now re-finds the
  row by name and reports how many removals are still un-purged.
- `PURGE_URL` and `PURGE_SECRET` are set on the Convex dev deployment and `PURGE_SECRET` on
  Vercel Preview. ⚠️ **Production's pair is on [ticket 25](25-launch.md)**, steps 4 and 5,
  and `PURGE_URL` there must be `https://200squares.com/api/purge`: tags are scoped per
  project *and* environment, so prod pointing at staging purges staging, reports success,
  and leaves the reported picture live on the real site. A removal that did not purge shows
  on `/admin`; a removal that purged the wrong environment does not.
- `@vercel/functions` is a new dependency.
- `docs/environments.md` and `docs/setup-checklist.md` carry both variables.

⚠️ **The copy is untouched, on purpose.** Ticket 34 chose the mechanism over *accept it and
say so*, so `/terms` and the removal mail have nothing new to admit. What `/terms` already
promises is now true.

### What it leaves for the fog

The browser keeps its copy for a year and no purge reaches it. ADR 0004 accepted that: the
harm is a public address anybody can open, not a file in the machine of somebody who already
saw the picture. Dropping `immutable` means a reload asks the edge, which is as far as this
goes.
