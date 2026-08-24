# 10 — Counting clicks for real

Type: grilling
Status: open
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
