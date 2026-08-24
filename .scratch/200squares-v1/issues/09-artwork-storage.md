# 09 — Artwork: storage, limits and delivery

Type: grilling
Status: open
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
