# 34 — A stripped picture stays at its /art URL

Type: grilling
Status: open
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
