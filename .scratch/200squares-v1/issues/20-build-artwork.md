# 20 — Build: artwork upload, storage and delivery

Type: task
Status: resolved
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

## Answer

**Built and proved on staging on 2026-08-25.** The browser makes the picture, Convex
keeps the file, and Vercel's edge hands it out. No server decodes an image anywhere on
this site.

### The upload

`src/lib/art/prepare.ts` is the whole of it. `createImageBitmap` decodes the chosen file —
and takes a GIF's first frame for free, which is the no-animation rule with no code behind
it — a canvas draws the chosen window into the block's exact pixel box, and
`canvas.toBlob("image/webp", q)` walks a quality ladder until the bytes are under the cap.
⚠️ A browser that cannot write WebP hands back a PNG from that same call, so the type is
checked in the browser as well: without it the server would refuse the pair with nothing
to explain.

**The sizes are made up, and they had to be.** Ticket 09 says "exactly the pixel sizes the
board draws", but the board has no such size: `cell` is whatever a 16 x 14 grid fits into
the viewport, which is about 23px on a phone and about 150px on a large desktop. So
`ART_CELL = 80` in `geometry.ts` is the size artwork is *made* at, chosen to carry both
ends at fit scale, and the `4x` is `MAX_SCALE` times it — the board never draws anything
larger, so nothing bigger would ever be seen.

`src/components/art/artwork-upload.tsx` is one component for all three doors. The crop box
takes the block's own aspect ratio and paints the source through the same window
arithmetic `cropStyle` uses, so what the owner drags is what the board will draw. The
cropped `1x` itself is painted on the canvas while the write travels — not an
approximation of it — through the `preview` machinery ticket 06 already left in `flow.tsx`.

### The three doors, and a fourth that was already there

`convex/art.ts`. Each hands out **two** short-lived upload URLs in one mutation, and each
setter checks the same thing over again when the ids come back:

- **the order** — `blocksOfSession`, keyed on the Stripe session id, which is ticket 06's
  grant and the only thing a buyer holds before any mail arrives;
- **the block** — `requireOwner`, ticket 18's guard, and it refuses a frozen block;
- **the bid** — signed in, the bid is theirs, and its status is `held`.

`accept()` is the server's whole check: content type is `image/webp`, size under 400 KB
and 40 KB. ⚠️ **It deletes the pair before it throws.** A refused upload is already in
storage — the browser posted it straight to Convex — so a setter that only threw would
make rejection the cheapest way to fill the free plan's gigabyte.

The bid's upload landed in **two** places, not one: My squares and the bid panel's
`StandingBid`, which is the screen a bidder is already looking at. Ticket 07's empty hour
had its link half there and its picture half nowhere.

### Delivery

`convex/http.ts` gains `GET /art?id=`, which is **not for a visitor**: it is for
`src/app/art/[id]/route.ts`, the one route on 200squares.com that streams the bytes and
answers `public, max-age=31536000, s-maxage=31536000, immutable`.

⚠️ **`s-maxage` is the half that matters and it is not in ticket 09's wording.** Vercel's
edge reads `s-maxage`; `max-age` alone is a browser instruction and would have left every
request on the function. Proved: `x-vercel-cache: HIT`, and the header Vercel passes on
has the `s-maxage` stripped, which is what a consumed directive looks like.

A 404 is cached for **30 seconds and not a year**: a file whose upload is still in flight
is a 404 for a moment, and a year-long negative cache would make that permanent.

### One thing ticket 09 did not price

⚠️ **`artSrc` now takes `onScreen`.** Above 2x zoom every block swaps to its `4x` file, and
at 4x about a sixteenth of the board is in view — so one zoom gesture would have fetched
199 large files, about 80 MB of edge traffic, for a look at one corner. A background image
has no `loading="lazy"`, so "lazy-loaded off-screen" has to be built: `canvas.tsx` computes
the visible cell window and `board.tsx` gives the large file only to blocks that touch it.
Proved on staging — the same block reads `small`, then `large` when zoomed onto it, then
`small` again when panned away at the same zoom.

### Replacement, and the file that is left behind

`release()` deletes what a row stopped pointing at **unless something else still points at
it**. Nothing cuts a block in V1.0, so today that guard never fires — it is written now
because the day resale comes back is not the day to remember that pieces share a file.

`crons.daily("sweep orphan files")` takes what nothing claims, an hour old or more, 200 at
a time. ⚠️ `invoices.storageId` is on the referenced list: an invoice is the one file here
that is not a picture, it is kept ten years, and a sweep that forgot it would delete the
site's own bookkeeping.

### Proved on staging, against the real deployment

- **The buyer with no account.** `node scripts/flow.mjs` now finishes the job it names: it
  buys a square, lands on `/thanks`, and uploads there on the strength of the session id.
  Square 196 is on the board with a picture on it and no account was ever made.
- **The owner.** `scripts/artwork.mjs` signs in, crops, drags, uploads, and the 2 x 1 block
  goes from *Waiting for artwork* to *Live · 0 clicks*. Taken went 142 → 144.
- **Replacement.** The same block, a second picture: a new id on the board, and both old
  files answer **404** at Convex afterwards.
- **The bidder.** A $1,000 bid, dressed from the bid panel, then `seed:ageAuction` and
  `auction:closeDue`: the day row carries `kind: "upload"` and the banner draws it.
- **The edge.** `x-vercel-cache: HIT` on the file the board is pointing at.

### Also here, and said out loud

- **`images.unoptimized: true`**, which supersedes ticket 02's three settings.
- **`setBlockUrl`** — the *link* half of the same My squares row. Not artwork, and it is
  here because ticket 18 left both writes for whichever ticket arrived at that row. A
  button that apologises is worse than one that does the small thing it promises.
- **`/bid` stopped apologising.** It said uploading was not built; it now says where.
- `CONTEXT.md` gains the two sets, the crop and `/art/<storageId>`. `PRODUCT.md` moves
  artwork and the stack out of *Undecided* — and the auction's hard close with them, which
  charting settled and nobody had written down.
- ⚠️ **The repo root's PNGs are ignored now.** Two `git add -A` commits swept the working
  screenshots into the history. Deleted, and `/*.png` is in `.gitignore`.

### Not built, and on purpose

**No `<img>` and no `loading="lazy"` anywhere.** Artwork is a background image because a
crop is `background-size` and `background-position` against the block's box, and that is
what makes a split block cost nothing. The zoom rule above is the price of that choice and
it is paid.
