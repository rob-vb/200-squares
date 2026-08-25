# 20 — Build: artwork upload, storage and delivery

Type: task
Status: claimed (rob-vb, 2026-08-25)
Blocked by: 09, 14, 15, 18 (all done 2026-08-25 — this is now on the frontier)
Parent: ../map.md

## Question

Nothing to decide. [Ticket 09](09-artwork-storage.md) settled it; this puts it in the
repo. Read its answer first.

- **`images.unoptimized: true`** in `next.config.ts`. ⚠️ This replaces ticket 02's
  `images.qualities`, `deviceSizes` and `search` settings. Every board image is already
  the size it is drawn at, so the optimizer is never invoked and cannot be attacked.
- **The upload, in the browser.** Crop to the block's shape (centre by default, drag to
  reposition), then produce two WebP files at the exact `1x` and `4x` pixel sizes. The
  original never leaves the machine. Accept PNG, JPEG, WebP, GIF; take a GIF's first
  frame and drop the rest.
- **The upload URL** from `ctx.storage.generateUploadUrl()`. Authorised by the Stripe
  session id on the thank-you page ([ticket 06](06-buying-for-real.md)), and by
  `requireOwner` everywhere else ([ticket 08](08-accounts.md)).
- **Server-side checks**: content type is WebP, byte size under 400 KB (`4x`) and 40 KB
  (`1x`). No decode.
- ⚠️ **`/art/<storageId>`** — one Next.js route that streams the file out of Convex with
  `Cache-Control: public, max-age=31536000, immutable`. **Artwork is never served from
  Convex to a visitor**: Convex Free includes only 1 GB of egress, and the edge cache is
  what keeps it near zero. A new file means a new id means a new URL, so nothing is ever
  busted.
- **The crop rectangle.** A cut block's pieces share one storage id and each carries its
  own crop. `src/lib/board/geometry.ts` already draws exactly this. The split happens in
  a webhook where no browser exists, which is why nothing is re-cut on a server.
- **Failure and replacement.** A block with a missing file renders `pending`, never
  broken. Replacing writes the new file, repoints the block and deletes the old one in
  the same mutation. A cron sweeps orphans.
- **On a phone**: the `1x` set below 2x zoom, the `4x` only above it, lazy-loaded
  off-screen.

The copy must say **no animation** before the buyer picks a file. Those words belong with
making the copy true; the rule belongs here.
