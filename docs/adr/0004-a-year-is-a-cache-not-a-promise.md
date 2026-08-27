# A year on /art is a cache, not a promise: a released file is purged by tag

Artwork is served from `/art/<storageId>` for a year, so that Convex never pays the egress.
That year was written down as *immutable*, on the reasoning that a new file is a new id is a
new URL and there is therefore no cache to bust. The reasoning is true of **replacing** a
picture and false of **releasing** one, and releasing is the case where the old URL must stop
working. The route now tags every answer it caches, and `release` deletes that tag.

Decided in
[ticket 34](../../.scratch/200squares-v1/issues/34-stripped-art-stays-cached.md), built in
[ticket 36](../../.scratch/200squares-v1/issues/36-build-purge-on-release.md).

## Context

[Ticket 09](../../.scratch/200squares-v1/issues/09-artwork-storage.md) put the whole defence
of the artwork budget in one place: the storage id sits in the **path**, so the URL is stable
for a given file and completely different for a new one, and the answer is cacheable for a
year. Convex is read once per file per region and Vercel's edge answers everybody else. That
is what keeps a board of pictures inside Convex Free's 1 GB of egress, and it works.

[Ticket 24](../../.scratch/200squares-v1/issues/24-build-removal.md) then gave the admin one
press that takes a reported picture off the board, and
[ticket 28](../../.scratch/200squares-v1/issues/28-prove-the-mail.md) pressed it on staging.
The board was clean. The URL was not:

```
/art/kg29wqxwj7hgxxtwfe1fpfpzf98d7r2d         → 200, the picture, after the strip
/art/kg29wqxwj7hgxxtwfe1fpfpzf98d7r2d?bust=1  → 404 No such file.
```

The file really was gone from Convex. What answered the plain URL was the edge, holding a
copy under `public, max-age=31536000, s-maxage=31536000, immutable` — for a year, in every
region that had already fetched it. A picture taken down for adult content, malware or
impersonation that keeps serving from the address somebody reported is the removal not
working, and it is the one hole on this map with an outside party standing in it.

## Considered options

**Purge the path** was the obvious answer and **it cannot be built**. Vercel's cache key is
the method, the URL, the host, the deployment and the scheme, and the documentation states
that *cache keys are not configurable* and that *to purge the cache you must configure cache
tags*. There is no purge-by-URL endpoint on any plan. This is worth recording precisely
because it is the thing a future reader will assume exists.

**Shorten the year** turns every artwork request into a function invocation on a cache miss —
the exact cost ticket 09 built this route to avoid, and the thing Hobby pauses on under
[ticket 02](../../.scratch/200squares-v1/issues/02-ddos-and-the-bill.md)'s rule.

**Put a mutable segment in the path** so a strip can invalidate it. It costs a board-query
field and redesigns a URL ticket 09 settled, and a tag buys the same thing for nothing.

**Accept it and say so** in `/terms` and the removal mail — cheap, honest, and a promise
about somebody else's reported content is the worst kind to break. It was the fallback if no
mechanism existed. One does.

## Decision

**The route tags what it caches.** A `Vercel-Cache-Tag: art-<id>` header on the 200. The
budget is generous — 256 characters per tag, 128 tags per response, 16 tags per bulk call —
there is no plan gate in the documentation, and Vercel does not bill the purge event, so this
works on Hobby and does not wait for
[ticket 25](../../.scratch/200squares-v1/issues/25-launch.md).

**The purge fires on `release`, not on `strip`.** `release` is the function where a file stops
being pointed at, and `strip` is one of its four callers. The other three are replacements,
and each of them leaves the identical year-long copy of the **old** picture on the edge — an
owner who replaces a picture *because* it was the wrong one has the same hole, and nobody
would have called that a removal. `release` purges exactly the ids it deleted, so the guard
that spares a file a cut block still shares also spares its URL.

**It deletes rather than invalidates.** Vercel recommends invalidate, and that recommendation
is written for content that has *changed*: invalidate marks the tag stale and serves the stale
copy instantly while revalidating behind it. For a picture that is *gone*, serving it once
more in every region that holds it is the removal not working. Delete revalidates in the
foreground and the visitor gets the 404.

**The deployment purges itself.** Convex calls a route on the site with a shared secret, and
that route calls `dangerouslyDeleteByTag` from `@vercel/functions`. The rejected alternative
was Convex holding a `VERCEL_TOKEN` and calling the REST API — one call, no extra endpoint,
and a leaked token that can do everything on the account. A leaked purge secret buys an
attacker the right to clear a cache.

**`immutable` comes off and the year stays.** No purge can reach the copy in a browser, and
`immutable` means the browser does not even ask on a reload — so the person who reported the
picture reloads, sees it, and concludes the report did nothing. Without it, normal visits are
unchanged and a reload asks the edge. `Cache-Control` is deliberately **not** split from
`Vercel-CDN-Cache-Control` to give the browser a shorter life: every returning visitor would
re-fetch every picture on the board, and that is Fast Origin Transfer, which Hobby counts.

## Consequences

⚠️ **A failed purge is the whole risk.** The picture is still public and the board says it is
gone. So the action records `purgedAt` on the `removals` row, reschedules itself with backoff,
and `/admin` lists any removal that has not been purged. A removal that half happened must look
different from one that happened.

⚠️ **Cache tags are scoped per project *and* environment**, and `@vercel/functions` reads the
environment from the deployment URL that invoked it. The Convex dev deployment must call
staging and prod must call `200squares.com`. The wrong URL purges the wrong environment and
says nothing.

**One more function endpoint.** A flood of POSTs to the purge route is invocations, the same
class of thing as `/api/auth/*` and `/art` itself. It belongs with those two in the map's
*board view is no longer free* answer, and is not solved here.

**The browser keeps its copy for a year.** That is accepted. The harm this ADR addresses is a
public address anybody can open, not a cached file in the machine of somebody who already saw
the picture.
