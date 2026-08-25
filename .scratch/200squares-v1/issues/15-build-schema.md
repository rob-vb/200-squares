# 15 — Build: the Convex schema and the live board

Type: task
Status: resolved
Blocked by: 05, 14
Parent: ../map.md

## Question

Nothing to decide. [Ticket 05](05-convex-model.md) settled the model; this puts it in
the repo. Read its answer first, and
[ADR 0001](../../../docs/adr/0001-live-board-clicks-outside-it.md) with it.

- **The schema**: `blocks`, `reservations`, `orders`, `clickCounts`, `bannerDays`,
  `bids`, `owners`, `removals`. Money as whole cents. Absolute UTC milliseconds everywhere
  except `clickCounts`, which keeps no time.
  ⚠️ **No `listings` and no credit ledger.** [Ticket 12](12-resale-for-real.md) put resale
  out of scope for V1.0, so both are tables nothing would write to. Ticket 05 fixed their
  shape for a feature that is now V1.1; its answer stands, this build skips them.
  ⚠️ **Run [ticket 26](26-strip-resale.md) first** — it deletes the resale surface from the
  same files, and doing it after means building a schema for a feature that is then
  removed.
- **The board query** — only what the canvas draws, and nothing else. It is subscribed to
  by every visitor, so every field in it is a cost. `reserved` joins the square states,
  derived from live reservations. ⚠️ **The asking price leaves it** with resale.
- **The kill switch** — one environment variable that falls the board back to a cached
  snapshot with no deploy.
- **The write path** — the overlap check that guarantees exactly one winner on a
  rectangle, and the remainder the loser is offered instead.
- **Replacing `src/lib/board/state.tsx`** — the reducer and the two mock datasets are
  what this displaces. Something must still let the dev see an empty board and a full
  one; that is fog on the map and this ticket may sharpen it, not settle it.

Nothing here touches Stripe, Better Auth or artwork storage. Those arrive with tickets
06, 08 and 09. This ticket may leave the tables they need empty.

The dev sees nothing locally. Every check happens on a Vercel preview URL.

## Answer — 2026-08-25

**The reducer is gone, the board is really live, and all five routes build static.**
`9254110` and `4e5aa2f`.

### The schema — `convex/schema.ts`

Ticket 05's tables, plus two it did not name. `owners`, `blocks`, `reservations`,
`orders`, `clickCounts`, `bannerDays`, `bids`, `removals` — and **`invoices`**, because
[ticket 17](17-invoice-document.md) needs a unique index on the order id and a token
index to allocate a number safely, and **`cached`**, which is the fan-out escape twice
over (below). ⚠️ **No `listings` and no credit ledger**, as instructed.

Money is whole cents everywhere. Time is absolute UTC ms, except `clickCounts`, which has
**no time field at all** — `/privacy` promises none and the schema is where that promise
is actually kept. `bannerDays` is keyed on `YYYY-MM-DD`, so the 00:00 UTC day cannot
drift. `owners.strikeAt` is an **array of timestamps, not a count**, because ticket 11's
strike expires after twelve months and a number cannot expire.

⚠️ **`artwork` is a union**, and the second arm was not in any ticket. `upload` is two
storage ids plus a crop, as ticket 09 fixed it. **`seed`** is a colour and a wordmark with
no file behind it, and it exists because the dev sees nothing locally: the only way to
look at a full board is to put one in a deployment, and 37 invented logos as real WebP
files is not a thing to build. Nothing in the product writes it; `convex/seed.ts` is the
only writer and it refuses without `SEED_ENABLED`.

### The board query — and an amendment to ADR 0001

⚠️ **The board query carries `url` and `ownerName`, and ticket 05 said it would carry
neither.** That answer predates two later ones that both need them on the client:
[ticket 10](10-clicks-for-real.md) made a click a **native anchor**, and an anchor needs
its `href` at render — a `/go/<id>` route would put it back on the server and undo the
whole answer — and the tooltip has always named the owner, which `/privacy` already calls
public. The cost is tens of kilobytes over 199 blocks.
[ADR 0001](../../../docs/adr/0001-live-board-clicks-outside-it.md) is **amended** to say
so rather than left contradicting the code. Money and identity stay out entirely.

### The kill switch

`BOARD_MODE=snapshot` on the Convex deployment. The board query stops reading the tables
and reads one `cached` row instead, so a block write no longer reruns anybody's
subscription — the websocket stays, the **fan-out** stops. ⚠️ The snapshot is rebuilt by a
cron **every two minutes whether or not the switch is thrown**, because a snapshot built
at the moment the switch is thrown would be built under exactly the load it was thrown to
escape. Tested both ways on `proper-heron-683`; no deploy either time.

### The write path

`reservations.reserve` reads every block and every live reservation and writes inside one
Convex mutation, which is serialisable against what it read — so two visitors on the same
square cannot both pass. ⚠️ **The loser is not sent away.** `largestFreePart` walks the
drag against everything taken and hands back the biggest piece still whole; the panel
selects it, so a 3 × 1 that lost a square becomes the 2 × 1 beside it in one tap. Only a
total overlap returns nothing. Verified on the deployment: a 3 × 1 over a held square came
back with the exact 2 × 1 remainder, the same rectangle twice came back empty, and a
rectangle over the banner is refused before anything is read.

Expiry is **lazy on read plus a sweep**: every reader filters on `expiresAt` itself, so an
unswept row is already harmless and the cron is housekeeping.

⚠️ **Not built here, on purpose**: Turnstile, one reservation per IP, and the 10% ceiling
on free squares. Those are [ticket 16](16-build-checkout.md)'s three limits and they sit
*on top of* this mutation — until they land, `reserve` is open to the flood ticket 02 and
ticket 05 both left standing.

### `?data=` is dead, and the routes are static

⚠️ **This is the ticket's quietest result and possibly its most valuable.** Ticket 08 found
that every route read `props.searchParams`, so all five built **dynamic** and ticket 02's
cheapest defence had never been switched on. The dataset switch moved off the URL and into
the deployment — `npx convex run seed:full | seed:early | seed:clear` — and `next build`
now reports **all five routes `○ (Static)`**. Nothing on the board path reads a cookie, a
header or a search parameter, which is also the constraint [ticket 18](18-build-accounts.md)
must not break.

### The fog it sharpens

*"Removing the mock datasets"* is **resolved, not sharpened**. `early`, `full`,
`brands.ts` and `?data=` are gone from the client; what replaces them is the seed, and the
requirement that it not be a search parameter is met.

### The seams left open, each saying so out loud

The panel that reserves says payment is ticket 16's. The bid button says the card hold is
ticket 19's. My squares says the upload is ticket 20's and the link edit needs ticket 18's
`requireOwner`. The click count sits at **zero** because ticket 21 has not been built —
which is the truth, not a placeholder. ⚠️ And `owners.seedViewer` is the prototype's fake
sign-in on borrowed time: it returns null without `SEED_ENABLED`, so on production there
is nobody to sign in as, and **ticket 18 deletes it with `src/lib/board/viewer.tsx`**.

### Two things the live board made visible immediately

A reserved square had **nothing to render** — not in `available`, no block — so the seam
showed through as a dark gap. It is now a plain tile with no number: deliberately not the
pending hatch, which would say *sold, artwork coming* and be a lie for fifteen minutes.
And the visitor's own hold turned their own selection red, because the write had landed on
a board that is live. `screen.holding` now tells the canvas which rectangle is theirs.

### Checked

`tsc` and `eslint` clean, `next build` green with five static routes, the schema pushed to
`proper-heron-683`, the seed run, and the whole reserve → hold → release path driven on the
staging URL with Playwright. ⚠️ The last cosmetic commit was **not** re-photographed:
polling the staging URL with `curl` tripped Vercel's bot challenge, which then blocked
Playwright too. It typechecks and builds; the screenshot is worth taking when the challenge
clears.
