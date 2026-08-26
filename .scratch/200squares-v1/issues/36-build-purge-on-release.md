# 36 — Build: a released picture stops being served

Type: task
Status: open
Blocked by: 34
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
