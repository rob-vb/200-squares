# 10 — Counting clicks for real

Type: grilling
Status: resolved
Blocked by: 02, 05
Parent: ../map.md

## Question

[Ticket 14](../../200squares-frontend/issues/14-traffic-numbers.md) decided what a
click count is, [ticket 15](../../200squares-frontend/issues/15-build-clicks.md)
built it against a reducer, and
[ticket 16](../../200squares-frontend/issues/16-clicks-copy.md) made the copy true.
All three still stand. What changes is that the count is now a **write by a stranger
into a real database**, and that makes it the cheapest attack on this site.

The promises that must survive, from `/privacy` and the FAQ:

- Nothing about the visitor is kept — **no name, no identifier, no address, no time**.
- The site counts clicks, not people. The same person clicking twice counts twice.
- Only the owner sees their own count. A buyer never sees a for-sale block's count.
- One public site total, naming no owner and no block.
- The count resets on the block changing hands, and lands whole on the largest piece
  a part sale leaves.

Decide:

- **What a click physically is.** The visitor's browser calling a Convex mutation
  before the tab opens? A redirect through a route that counts and then forwards?
  The second is more reliable and slower; the first can be blocked by the browser.
- **The abuse case.** An unauthenticated counter that can be called in a loop. It
  costs the dev money and it makes the public total a lie. But note the trap: the
  obvious defences — an IP, a cookie, a rate limit key — are all *something kept about
  the visitor*, and `/privacy` promises there is none. Find the defence that does not
  break the promise, or bring the cost of breaking it back to the dev.
- **Write volume.** One row write per click, or a counter, or batched. This is a
  Convex bill.
- **The public total** on `/how-it-works`. It is on a page that should stay cheap to
  serve. How fresh does it need to be?
- **Whether the number stays bare.** Ticket 16 deliberately left both live numbers
  without a caveat beside them. Real numbers are smaller than mock ones — `43,724`
  becomes `0` on day one, and `Live · 1,840 clicks` becomes `Live · 0 clicks`. Decide
  whether a real zero needs different words, and be honest: a zero is the truth.

## From resolved research

[Ticket 02](02-ddos-and-the-bill.md) makes the shape of the click a cost question:

- ⚠️ **A subscription rerun is a billed function call.** One click-write reruns every
  subscriber's board query, so the cost of a write is N clients × M writes. The click
  must not fan out.
- **An anonymous visitor must hold no websocket at all.** The board page is served
  from cache; the socket belongs to a signed-in owner, if to anyone.
- **Turnstile** in front of placing a click is free, unlimited, and the only control
  that reaches Convex without a paid plan.

## Answer

**A real link, a fire-and-forget mutation beside it, one counter row per block, and a
public total that is an hour old. The count is a floor, not a census, and the copy says
so.**

### What a click physically is

A **real anchor** — `target="_blank"`, `rel="noopener"` — with an `onClick` that fires a
Convex mutation and does not wait for it.

Not a redirect through `/go/<blockId>`. That road is more reliable and it costs three
things: a Vercel function invocation on every click, the site standing in the middle of
somebody else's outbound link, and a changed referrer for the owner who is paying for the
traffic.

Not "call the mutation, then open the tab" either. Awaiting anything before opening breaks
the user-gesture chain and the browser blocks the tab. The anchor navigates natively; the
mutation is thrown after it.

⚠️ **A blocker or a script-less browser means an undercount, and that is accepted.** The
count is a **floor**. The site promises to count clicks, and an honest floor is still
counting clicks. It is not a census and the copy must stop short of implying one.

### Write volume: one row per block, not one row per click

`clickCounts` holds `{ blockId, count }` and a click is one patch.

A row per click would be pure waste. There is nothing you could ever do with those rows
except count them, because `/privacy` forbids the one field — the time — that would make
them worth keeping. 199 rows, not 199,000.

⚠️ **A viral block contends on its own row** through Convex's optimistic concurrency, and
the escape is to shard the counter across N rows and sum them. **Not built now.** One row
per block is right for a board that has no traffic yet, and sharding is a known move
rather than a surprise.

### The fan-out is already solved, and the public total is where it would come back

[Ticket 05](05-convex-model.md) put `clickCounts` in its own table that the board query
never reads. A click therefore reruns nobody's board subscription. That half is done.

⚠️ **The trap is the public total.** `Counter` on `/how-it-works` reads `siteClicks`, and
that page holds a live websocket **by design** — prototype ticket 07 made the shrinking
"squares left" number live, and ticket 05 gave every visitor a socket anyway. If the total
rode on that subscription, every click anywhere would rerun it for every viewer. Ticket
02's fan-out bomb, moved one page over.

So: **`siteClicks` is its own query against one cached row**, recomputed **hourly** by a
Convex cron. It is not in the board query and it is not live. Subscribers rerun once an
hour, which is a cost of nothing.

An hour-old number is fine here. The total answers *does this board send anybody
anywhere*, and that question does not change by the minute.

### The abuse case, and the promise it must not break

The mutation is an unauthenticated write, callable in a loop. Every obvious defence — an
IP, a cookie, a rate-limit key — is **something kept about the visitor**, and `/privacy`
promises there is none. The ticket asked for a defence that does not break the promise, or
the cost brought back to the dev. Both, in that order.

**Turnstile, invisibly, once per page load.** The board issues a token; the click mutation
spends it. A token is good for a bounded run of clicks — start at 30 — after which the
widget quietly issues another. The token proves a browser, not a person, it is verified
against Cloudflare and thrown away, and **nothing is written down**. The promise holds
literally, not by interpretation.

⚠️ **Be honest about what that buys.** It stops a script. It does not stop somebody
willing to solve a challenge and spend the tokens. So the second half, as the ticket asked
— the cost, brought back:

- **Function calls.** Convex Free includes 1M. Past the cap the deployment stops and the
  site breaks, which is the failure the dev already called acceptable. It cannot become a
  bill — see the rule below.
- **The lie.** An inflated count is shown to exactly one person: the owner of the block
  that was clicked. It is their own number, in their own panel. The only public figure it
  touches is the site total, which names no owner and no block.

So the exposure is a number that flatters one owner, and a site total that is a floor with
some noise in it. That is a proportionate answer to a promise worth keeping.

### The reset, and the largest piece

Prototype ticket 14 already ruled it: the count resets when a block changes hands, and a
part sale lands the whole count on the largest remaining piece. With one row per block
that is a mutation at sale time, and it needs one thing the rule never said: **a
tiebreak.** Largest by cell count; on a tie, the piece holding the **lowest square
number**. Deterministic, and it never needs explaining to anybody.

### The number stays bare, and a zero stays a zero

`43,724` becomes `0`. `Live · 1,840 clicks` becomes `Live · 0 clicks`, in My squares,
where only the owner sees it.

**Leave both bare.** Prototype ticket 16 deliberately put no caveat beside them and that
was right. The site's voice refuses to oversell, and `PRODUCT.md` bans invented proof — a
zero on day one is the most honest thing on the page. "Just launched" or "be the first" is
precisely the overselling the copy exists to avoid.

⚠️ **One sentence does have to be added, and it is not about the zero.** It is what a click
count *is*: counted in the visitor's browser, not audited, a floor rather than a census.
`/privacy` and the FAQ describe a count today without saying that, and after this ticket
they must. It belongs with **making the copy true again** on the map, not here.

### The rule this ticket leans on

The whole "an attack breaks the site instead of billing it" answer above depends on the
Convex project staying on **Free with no card attached** — see
[ticket 09](09-artwork-storage.md), which found that Convex's Starter plan bills the
overage while Free has hard caps. That rule is now in the map's Notes.
