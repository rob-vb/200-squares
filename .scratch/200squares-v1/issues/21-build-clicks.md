# 21 — Build: counting clicks for real

Type: task
Status: resolved
Blocked by: 10, 14, 15 (15 done 2026-08-25)
Parent: ../map.md

## Question

Nothing to decide. [Ticket 10](10-clicks-for-real.md) settled it; this puts it in the
repo. Read its answer first. Prototype ticket 15 built this against a reducer — this
replaces that, and the copy from prototype ticket 16 stands.

- **The click.** A real anchor, `target="_blank" rel="noopener"`, with an `onClick` that
  fires the mutation and does **not** await it. ⚠️ Awaiting anything before the navigation
  breaks the user-gesture chain and the browser blocks the tab.
- **`clickCounts`** — one row per block, `{ blockId, count }`, patched in place. Not a row
  per click. No time field, ever: `/privacy` promises none.
- **Turnstile**, invisible, one token per board load, spent by the mutation, good for
  about 30 clicks before the widget issues another. The token is verified and thrown away.
  Nothing about the visitor is written down.
- ⚠️ **`siteClicks` is its own query against one cached row**, recomputed **hourly** by a
  Convex cron. It must **not** join the board query, and it must not be live — the
  `/how-it-works` page holds a websocket by design, and a live total would rerun it for
  every viewer on every click anywhere.
- **The reset** on a block changing hands, and the whole count landing on the largest
  remaining piece of a part sale. Tiebreak: largest by cell count, then the piece with the
  **lowest square number**.
- **My squares** shows the owner their own count and nobody else's. `Live · 0 clicks` on
  day one, bare, with no apology.

Not this ticket: sharding a hot counter row. Ticket 10 named it as the escape if one block
goes viral and deliberately left it unbuilt.

## Answer

**Built and driven end to end on staging.** A block is a real `<a>`, a `sendBeacon`
goes out beside it, and one counter row per block goes up by one. The read half —
My squares, the public total, the hourly cron — was already standing from tickets
15 and 18; what landed here is the write.

`node scripts/clicks.mjs` proves it through the product's own surfaces: it reads
the owner's count out of My squares, clicks their block on the board, and reads it
again. Three ways of clicking, one drag that must not count:

```
tabs open after the drag: 1 (1 is right)
plain click:                    https://example.com/
second click, same permit:      https://example.com/
keyboard, Enter on the link:    https://example.com/
example.com: 4 → 7 clicks
OK — three clicks, three counts, one drag counted for nothing.
```

### The click is an anchor, and the canvas still owns the drag

`board.tsx` renders a block or a banner day with an address as `<a href target
rel="noopener noreferrer">`. So a click on somebody's square behaves like a link
everywhere a link behaves: middle-click, ctrl-click, the status bar, *copy link
address*, and the keyboard — which reaches the board for the first time.
`window.open` from a handler had none of that.

The price is one real complication, and it is in `canvas.tsx`. The board owns the
primary drag at every input (prototype ticket 02), so a pan or a pinch that ends
over a block must not navigate. Two changes carry it:

- **A press that lands on a link does not capture the pointer.** A captured
  pointer sends the click that follows it to the canvas box instead of to the
  anchor under the finger, and the link never opens at all. `onPointerLeave`
  takes the one case capture was covering — a button held down all the way off
  the canvas.
- **`onFollow` cancels what was not a click.** `pointerup` leaves behind the cell
  a clean press ended on; the anchor's own handler reads it a moment later and
  calls `preventDefault()` if there is none. ⚠️ A click from the **keyboard** has
  no gesture behind it — `detail` is 0 — and that case is let through, or every
  keyboard activation would be refused as a stray drag.

`follow()` is now one line: an unsold banner opens the bid flow. Everything else
that leaves the board opens itself.

### Nothing is written down, and the bound is time rather than a countdown

Ticket 10 asked for one token per board load, spent by the mutation, good for
about 30 clicks — and it asked for that **with nothing written down**, because
`/privacy` promises no name, no identifier, no address and no time is kept when
somebody clicks. Those two cannot both be literal: counting to 30 needs a row per
visitor with a counter on it, and that row is an identifier and a time.

⚠️ **The promise wins.** `/clicks/permit` spends the Turnstile token, verifies it
against Cloudflare, and hands back a **signed expiry** — an HMAC over a number,
with no nonce **on purpose**, because a nonce would be the identifier the promise
rules out. Two visitors who load the board in the same millisecond hold the same
string. The site keeps no record that it issued anything.

So the honest statement of the bound: **the board spends one permit on 30 clicks;
the server enforces two minutes.** A count the server does not keep is a count the
server cannot enforce. That stops a script, which is all ticket 10 ever claimed
for Turnstile — it already said out loud that somebody willing to solve a
challenge and spend the tokens gets through.

### Turnstile arrives on the first click, not on the board load

The widget's box is always in the DOM, because Cloudflare refuses to run inside a
container that is not there. The **script** is not fetched until somebody actually
clicks a link. A plain board load, checked on staging, reaches two hosts and
neither is Cloudflare:

```
200-squares-git-staging-robs-projects-52973834.vercel.app
vercel.live                       (the preview toolbar — staging only)
cloudflare challenge fetched: false
```

Most visitors never click a block, and the board page is served from cache to all
of them. Mounting a third-party script for everybody would be a cost — and a
script on the page — bought for nothing. "One token per board load" is still true
of every load that clicks.

### ⚠️ The reset was not built, because nothing in V1.0 can trigger it

The ticket asked for the count to reset when a block changes hands, and for the
whole count to land on the largest remaining piece of a part sale, with a tiebreak
of largest by cell count and then lowest square number.

**In V1.0 a block never changes hands and never splits.** `blocks` is inserted by
`checkout.fulfil` and by nothing else — never deleted, never re-owned, never cut.
`largestFreePart` cuts a **selection** before a purchase, which is the race
loser's smaller rectangle and not an owned block. Removal freezes a block and
leaves it with its owner (ticket 11). The one thing that would move a block
between owners is resale, and [ticket 12](12-resale-for-real.md) is out of scope.

So the rule has nothing to fire it, and building it would be code no path reaches.
It goes to V1.1 with resale, and it is recorded on the map's **Out of scope** note
rather than left as a silent gap. The tiebreak stands as written and needs no
rediscovering.

Banner days need no reset either: each day is its own key, so yesterday's count
cannot leak into today's.

### The fan-out, and where it would have come back

Ticket 05 had already put `clickCounts` in a table the board query never reads, so
a click reruns nobody's board subscription. Nothing here changed that.

`siteClicks` was already its own query against one cached row, rebuilt hourly by
`snapshots.buildSiteClicks`. It is now rebuilt over real rows.
`npx convex run snapshots:buildSiteClicks` forces it, which is the only way to see
the total move without waiting an hour.

### What the door refuses, and what it never says

`/clicks` **always answers 204**. There is nobody left to read a reason — the
visitor is on their way to somebody else's site — and a door that explained itself
would be a way to tell a real block id from a made-up one. The mutation checks the
target against the tables before it writes: a block with no link or a frozen one,
a banner day with no row or a removed one, all get silence. The per-block count is
private, but the **sum** of every row is printed on `/how-it-works`, so a row for
something that does not exist would be a way to write on a public page.

`sendBeacon` posts `text/plain`, which keeps it a *simple* cross-origin request
with no preflight standing between the click and the count.

### For "making the copy true again"

Two debts, both recorded on the map:

- **What a click count is.** Counted in the visitor's browser, not audited, a
  **floor** and not a census. `/privacy` and the FAQ describe a count today
  without saying it. Ticket 10 named this one and said it belongs with the copy.
- **Cloudflare.** `/privacy`'s *Who else sees it* names the payment provider and
  Vercel. A visitor who only clicks a block now loads a Cloudflare script, which
  is a new category of person for that sentence — buying and bidding were always
  deliberate acts.
