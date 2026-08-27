# 09 — Artwork: storage, limits and delivery

Type: grilling
Status: resolved
Blocked by: 02, 05
Parent: ../map.md

## Question

Today artwork is either a mock colour or a file the browser previews and forgets.
Real owners upload real images, and 199 of them have to arrive on one screen fast.

- **Where the files live.** Convex file storage, Vercel Blob, Cloudflare R2, or
  something else. [Ticket 02](02-ddos-and-the-bill.md) matters here: images are
  bandwidth, and bandwidth is the bill. Whatever is chosen must have a ceiling.
- **The limits.** Old fog from the prototype map, now unavoidable: maximum file size,
  formats, animation, and the aspect ratio per block size. A block is at most 4 x 4,
  so there are sixteen shapes an image must fit. What does the site do with an image
  of the wrong ratio — crop, letterbox, refuse?
- **How an upload happens.** The browser uploading straight to storage with a signed
  URL, or through a function. One of those is an unauthenticated write and the other
  costs more.
- **Serving the board.** 199 images on the first screen, zoomable to 4x. Are they
  resized on upload into fixed sizes? Is there one sprite? What does a phone load?
  This is the difference between a board that opens instantly and one that does not.
- **A block that is cut.** [Ticket 12 on the prototype map](../../200squares-frontend/issues/12-build-resale.md)
  leaves a seller holding up to four blocks with **the same image cropped to each**.
  Decide whether that crop is done once on sale and stored, or done on the fly.
- **What the owner sees while it processes**, and what the board shows if the image
  fails.
- **Replacing artwork.** Owners may change it as often as they like — that is already
  promised in the copy — so the old file has to go somewhere.

Not this ticket: whether the dev approves images before they appear. Charting ruled
that out. Removal afterwards is [ticket 11](11-admin-removal.md).

## From resolved research

[Ticket 02](02-ddos-and-the-bill.md): artwork must be **pre-sized** and served with a
fixed quality and no varying query string. Vercel Image Optimization cache writes are
**$4.00 per 1M**, and a varying query string is exactly how an attacker forces them.
Set `images.qualities: [75]`, trim `deviceSizes`, and put an explicit `search` in the
image patterns. The board page must stay cacheable and cookie-free.

## From resolved decisions

[Ticket 06](06-buying-for-real.md) moved the **first** upload to the thank-you page,
authorised by the Stripe session id rather than by a signed-in account. Whatever storage
this ticket picks must accept an upload from a visitor who has no session with the site
yet.

## Answer

**The browser does the work, Convex keeps the file, and Vercel's edge serves it. Nothing
is ever resized on a server, and a cut block is drawn with a crop rectangle, not a second
file.**

### Where the files live: Convex file storage

No new account, no new key, and `ctx.storage.generateUploadUrl()` hands a signed URL to a
browser that has no session with the site — which is exactly what
[ticket 06](06-buying-for-real.md) needs on the thank-you page. The mutation that hands
out the URL is authorised by the Stripe session id there, and by `requireOwner` everywhere
else ([ticket 08](08-accounts.md)).

Convex Free includes **1 GB of file storage**. A full board of 199 blocks costs about
**88 MB**. There is room to spare.

⚠️ **But Convex Free includes only 1 GB of data egress**, and that is the number that
decides the rest of this ticket. Serving artwork straight from Convex means a full board
view spends several megabytes of it. A few hundred visitors would empty the month.
**Artwork is therefore never served from Convex to a visitor.**

### Serving: through Vercel's edge, on an immutable URL

One route on 200squares.com — `/art/<storageId>` — streams the file out of Convex and
answers with `Cache-Control: public, max-age=31536000, immutable`.

The storage id is in the path, so the URL never changes for a given file and changes
completely for a new one. The edge caches it forever, Convex is read **once per file per
region**, and Convex egress stays near nothing. Replacing artwork produces a new id and
therefore a new URL, so there is no cache to bust.

⚠️ **Vercel Image Optimization is switched off entirely: `images.unoptimized: true`.**
Every image on this board is already the exact size it is drawn at, so there is nothing to
optimise. This **supersedes ticket 02's three settings** — `images.qualities: [75]`,
trimmed `deviceSizes`, an explicit `search` in the image patterns. Those were defences
against a $4.00-per-1M cache-write attack through a varying query string. An optimizer
that is never invoked cannot be attacked, and the attack surface is gone rather than
narrowed.

### The browser resizes, and the server never does

At upload the browser takes the chosen file, crops it to the block's shape, and produces
**two WebP files at exactly the pixel sizes the board draws**: a `1x` and a `4x`. The
original is never uploaded and never stored.

This is not a convenience. Resizing in a Convex action would spend action compute out of
the same free plan the egress comes from, and it would put a decode of a hostile file
inside the backend. The browser already holds the file, already has a canvas, and costs
the site nothing.

The server still checks what arrives, because a browser is not a friend: content type
must be WebP, and the byte size must be under the cap. It does not decode to verify the
dimensions. A determined uploader can store a WebP of the wrong size, and the only thing
they break is the drawing of their own block.

### The limits

- **Accepted from the owner**: PNG, JPEG, WebP, GIF. **Stored**: WebP only.
- **Source file**: 10 MB. The browser reads it and throws it away.
- **Stored**: 400 KB for the `4x`, 40 KB for the `1x`.
- ⚠️ **No animation.** A GIF's first frame is taken and the rest is discarded. A hundred
  animated blocks is a board that stutters and a bandwidth bill that multiplies. The copy
  must say this before the buyer picks a file, not after.
- **Aspect ratio**: the block's own. Sixteen shapes exist between 1×1 and 4×4, and
  refusing an image that does not match one of them would be hostile. **The site crops.**
  Centre by default, with a drag to reposition, done in the browser before upload — so
  what is stored already fits and nothing is cropped twice.

### A block that is cut, and the crop that costs nothing

⚠️ **The pieces share one file and carry a crop rectangle.** No image is ever cut on a
server.

`src/lib/board/geometry.ts` already draws a crop this way, with `backgroundSize` and
`backgroundPosition` against the block's rectangle. The prototype's answer turns out to
be the real one: a sale splits a block into at most four pieces, each piece points at the
**same** storage id with its own crop rectangle, and the browser draws it.

That matters because the split happens in a **webhook**, where there is no browser to do
the resizing. Any answer that cut the image would have needed server-side image work, on
the one path that cannot have it.

When the new owner replaces the artwork, their piece gets its own file and its crop
rectangle goes away. The seller's remaining pieces keep the original.

### Processing, failure and replacement

- **There is no processing step.** The browser resizes, uploads, and the board updates
  over the websocket. The only wait is the upload itself, so the panel shows progress and
  the block stays `pending` until the file is stored.
- **A block whose file is missing renders as `pending`**, never as a broken image. The
  `pending` treatment already exists in the design and already means *paid, no artwork
  yet*, which is exactly what a failed upload is.
- **Replacing artwork** writes the new file, repoints the block, and deletes the old file
  in the same mutation. A cron sweeps files that no block points at, for the case where a
  write failed halfway.

### On a phone

The `1x` set is served below a 2x zoom and the `4x` only above it. Anything off-screen is
lazy-loaded. A phone opening the board fetches the small set and nothing else.

### ⚠️ A rule the whole map depends on, now stated out loud

Tickets 02 and 05 both rest on "Convex Free cannot bill, so an attack breaks the site
instead of invoicing it". That is **true, and it is conditional**. Convex has two plans
under one price of zero: **Free has hard caps** and disables the deployment when they are
passed; **Starter is pay-as-you-go** and bills the overage.

**Attaching a payment method to the Convex account silently converts the site's failure
mode from "breaks" to "bills"** — the one thing the dev said must never happen. The
project stays on **Free**, with **no card on the account**, and that is not a preference.
It is the enforcement mechanism for the rule the whole map is built on. Added to the map's
Notes.
