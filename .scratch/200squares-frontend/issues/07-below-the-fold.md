# 07 — Content and copy below the canvas

Type: grilling
Status: resolved
Assignee: rob-vb (claimed by agent session)
Blocked by: 05
Parent: ../map.md

## Question

Write the content under the viewport that makes a serious buyer trust this and reach for $100 a square.

Blocks agreed while charting: How it works (three steps), The daily banner (how the auction runs, the 00:00 UTC rollover), price and terms (what you get, for how long, what you may put there), FAQ plus contact, and the strip of past banner winners.

To settle: the actual copy, the order of the blocks, how the strip of past winners reads with mock data, and what the first line under the canvas says — that line does the selling. No visitor statistics: none exist yet.

## Resolution (2026-08-24)

The page under the canvas is **compact**: five short blocks, no second sales page.
The canvas is the product; everything below it is proof and manual.

### Voice

No person speaks. The product states facts: *"One square is $100."*, never
*"We believe..."*. One name appears, at contact, and nowhere else. Headings are
Anton, copy is Archivo. Order is fixed by what a $100 buyer wants first:

**counter → what you get → how it works → the daily banner → FAQ → contact**

There is no pitch line. The counter is the pitch.

### 1. The counter

The first thing under the fold, large in Anton, live from `board.stats`:

> ## 142 SQUARES LEFT
> $100 each. Buy once, keep it.

**This takes `Available` out of the legend.** `TitleBlock` keeps `Taken` and
`Pending` — the state of the board — and the counter carries the offer. Two
counters within one screen of each other is one too many, and 11px in a rule
box sells nothing.

Sold out (unreachable with either mock dataset, but the text has to exist):

> ## SOLD OUT · 199 / 199 SQUARES TAKEN
> The banner is still auctioned every day.

### 2. What you get

> ### What you get
>
> One square is $100. You pay once. There is no subscription and no renewal.
>
> Your square is permanent. It does not expire, and it is never resold, rented
> out or taken back.
>
> Buy up to 16 squares as one block, at most 4 wide and 4 high. A block shows
> one image: the grid lines inside it disappear.
>
> A click on your block opens your website in a new tab. You can replace your
> image and your link whenever you want.
>
> **What you may put there**
>
> No adult content. No malware, impersonation or deceptive redirects.
>
> No chat or invite links — Telegram, WhatsApp, Discord and the like. Link to a
> product, a company or a profile.
>
> No link shorteners: use your own domain. Tracking parameters on your own URL
> are fine — they are how you measure this yourself.
>
> This is a small independent project. Nobody can promise a website runs
> forever, and this page will not pretend otherwise.

### 3. How it works

> ### How it works
>
> **1 · Pick your squares** — Drag a rectangle on the grid, up to 4 wide and
> 4 high. The price follows your drag.
>
> **2 · Pay $100 per square** — One payment. Three by two squares is $600.
>
> **3 · Add your artwork and your link** — One image covers the whole block.
> You can add it later: your squares stay reserved until you do.

Step 3 is worded so `pending` is honest — the state the board renders is the
state the copy describes.

### 4. The daily banner

> ### The daily banner
>
> The 5 × 5 area in the top-left corner is not for sale. It is auctioned, one
> day at a time.
>
> **Today you bid on tomorrow's banner.** Bidding runs all day and closes at
> 00:00 UTC. It starts at $100.
>
> The winner holds the banner from 00:00 to 00:00 UTC: their image at the top
> of the grid, their link on the click. The next day it passes to the next
> winner, and the day stays in the record below.

The bold line is the only place visitors trip up, so it is stated flatly and
early.

**Past banner days** — the strip lives here, as evidence for the claim above,
not as a gallery of its own. Each item shows date, artwork, owner and the
winning bid:

> Aug 23 · HALCYON · $340

The bid is public on purpose: it is the whole proof the auction is real, and it
tells a new bidder where the price sits. With the `early` dataset the strip
reads:

> No banner day has run yet. The first one is decided tonight at 00:00 UTC.

### 5. FAQ

> **What happens if the site goes down?**
> Then the squares go with it. This is one project run by one person, not a
> company with a guarantee behind it. That is the honest answer, and it is
> priced in at $100.
>
> **Can I buy more squares later, next to mine?**
> Yes, as long as they are still free. Each purchase is its own block, so two
> blocks side by side stay two images.
>
> **Can I change my image or my link?**
> Yes, whenever you want, from My squares. The square stays yours.
>
> **Do I get traffic numbers?**
> Not yet. There are no visitor statistics here, and invented numbers are worse
> than none. Put your own tracking parameters on your link and measure it.
>
> **Why 4 × 4 at most?**
> So no single buyer can take over the grid. 199 squares held by many owners is
> what makes the picture worth looking at.
>
> **What if every square sells?**
> Then that is it — there are no more. The banner is still auctioned every day.

### 6. Contact

> ### Questions?
> Rob — hi@robvb.com

Plain text, not a `mailto:` and not a form. The prototype does not need it to
do anything, and a form that silently discards a message would be the one place
this prototype lies to a real visitor.

Footer: `200 SQUARES · 199 squares + 1 banner`.

### Consequences for other tickets

- **10** builds this, and also removes the `Available` field from `TitleBlock`.
- The strip needs no data-model change: `BannerDay` already carries the winning
  bid, and negative `dayOffset` values are the past winners.
