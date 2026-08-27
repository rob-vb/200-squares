# 16 — Build: the checkout

Type: task
Status: resolved
Blocked by: 06, 14, 15 (15 done 2026-08-25)
Parent: ../map.md

## Question

Nothing to decide. [Ticket 06](06-buying-for-real.md) settled the whole flow; this puts
it in the repo. Read its answer first, and
[ADR 0002](../../../docs/adr/0002-vat-inclusive-priced-and-computed-here.md) with it.

Build, in this order:

- **The panel**, one screen. `src/components/panel/buy-flow.tsx` loses company, link and
  artwork, and gains buyer type (radio, no default), country, name, the conditional EU VAT
  number, the unticked withdrawal box with the Art. 6(1)(h) text, and the digital-invoice
  line. The button says *Order now — obliges you to pay*.
- **VIES synchronously** before the Checkout Session, with both failure paths from ticket
  06, and the `requestIdentifier` kept.
- **VAT computed here**, three cases, frozen into `orders`. `tax_behavior: inclusive`,
  set explicitly. Stripe Tax off.
- **Reservation, Turnstile and the three limits** — one per IP, 10% of free squares, token
  required by the mutation.
- **The Stripe session**, with the reservation id as idempotency key and in the metadata,
  `billing_address_collection: required`, email on, phone off.
- **The webhook**, signature-verified, session id as the key against double processing,
  and the ticket 05 race: webhook wins if the squares are free, automatic full refund if
  they are not.
- **The return page**: subscribe by session id, 10-second server-side fallback that
  retrieves the session, artwork upload granted by the session id.
- **`sessionStorage`** for the reservation id and Stripe URL. No cookie.
- **The countdown** in the panel and on the return, and release on Stripe's back link.

The artwork upload itself is [ticket 09](09-artwork-storage.md)'s, and the account behind
the magic link is [ticket 08](08-accounts.md)'s. Build the seams for both; do not build
them here.

Check it on the Vercel preview URL, in Stripe test mode, including a German B2C sale —
that one test also settles the `txcd_10701000` question ticket 03 left open, if Stripe Tax
is ever turned on.

## Answer — 2026-08-25

**The order is placed on 200squares.com, reserving moved to Convex, and one keyed
mutation is the only thing that writes a block.** `a79dd08`, `4035a1b`, `ab1ed86`.
Driven end to end on the staging URL in Stripe test mode, including the refund race.

### The panel

One screen, and it did not grow. Company, link and artwork left; buyer type (two
buttons, **no default**), country, name, the conditional EU VAT number, the unticked
withdrawal box with the Art. 6(1)(h) information under it and the digital-invoice line
took their place. The button says *Order now — obliges you to pay*.

The wording lives in `src/lib/checkout/consent.ts` as constants, is shown from there, and
is written into the order **as words** — ticket 06 asked for the text and not a version
number, so it stays readable in 2036 without the code of the day.

⚠️ **The withdrawal box is shown to a consumer only.** A business has no right of
withdrawal to say anything about, and a required tick it cannot fail is a form nobody
reads. The consumer cannot order without it. ⚠️ And the VAT line is drawn **only once
buyer type and country are both answered**: before that it was guessing, and a price that
changes while you look at it is worse than no line.

### Reserving moved to Convex, and the mutation went internal

⚠️ **`reservations.reserve` is no longer callable from a browser.** It is reached only
through `POST /checkout/reserve`, a Convex HTTP action, because ticket 06's three limits
need two things a Convex mutation cannot have: the caller's **IP**, which only an HTTP
action sees, and a **Turnstile** answer, which has to be checked over the network. A
public mutation with the limits wrapped around it in an action would be a public mutation
with the limits bypassable — the reserve endpoint is precisely the one an attacker floods.

It is on Convex rather than on Vercel for ticket 02's reason: Convex Free refuses work
instead of billing for it, so a flood breaks the dev board rather than the bank.

Both limits sit **inside** the mutation, not around it, because a limit checked outside
the transaction is a limit two requests walk past together.

⚠️ **The 10% ceiling needed a floor the ticket did not give it.** A tenth of the free
squares is 19 while the board is empty and **zero** by the time nine are left, which would
refuse the last real buyers on the site's best day. One full 4 × 4 is always allowed
through: `max(16, floor(free / 10))`.

⚠️ **The reservation now keeps something about the visitor** — a salted hash of the IP,
never the address, compared only for equality, swept an hour after the hold dies. That is
the price of *one live reservation per visitor* and there is no version of that control
without it. `/privacy` has a new sentence to write; it rides with *making the copy true
again*.

### Turnstile, and a finding that outlives this ticket

⚠️ **Turnstile does not complete a challenge from this VPS.** Headless or headful, real
user agent or not: the widget renders, fetches its challenge, and then stalls — no
callback, no error code, nothing. Cloudflare does not answer a datacenter address. There
is no browser on the VPS and none anywhere else in the loop, so with the real site key on
preview **nobody working on this site can get through their own checkout** — not this
ticket's flow, not ticket 20's upload, not ticket 23's invoice, because all three need a
real order behind them.

Dev and preview therefore run Cloudflare's documented dummy keys
(`1x00000000000000000000BB` / `1x0000000000000000000000000000000AA`); production keeps the
real pair. What it costs is written down in `docs/environments.md`: `/checkout/reserve` on
the **dev** deployment is unprotected, on a public `.convex.site` address that Deployment
Protection does not cover. Seed data, unpublished URL, a plan that breaks rather than
bills. Accepted.

⚠️ **The consequence for launch**: production is the first place the real widget ever
runs, so [ticket 25](25-launch.md) must buy one square by hand in a real browser before
anybody is told the site is open. If the widget stalls there, nothing can be bought at all
and no other check on that list would say so. `docs/setup-checklist.md` step 7 carries it.

⚠️ **A widget may not be rendered into a hidden box.** An `empty:hidden` on the container
made it `display:none` before the widget went in, and Cloudflare refuses to run a widget
it cannot see — quietly: no callback, no error, and every order press waited out its ten
seconds. It cost an hour and it is the sort of thing that would have cost a launch day.

### Placing the order

`POST /api/checkout` on Vercel, because ticket 14 put `STRIPE_SECRET_KEY` there for it.
In order: VIES **synchronously**; VAT computed here; the Checkout Session with the
reservation id as its **idempotency key**; the session id written back to the reservation
before the buyer is sent anywhere, so a second press finds it and is returned to the same
page.

`tax_behavior: "inclusive"` set explicitly, `automatic_tax: { enabled: false }`,
`billing_address_collection: "required"`, phone off, `submit_type: "pay"` — Stripe's own
label is the whole reason the order button moved onto the site, and *Pay* is at least the
truth about what that page does.

The declarations travel in the session **metadata** and come back with the webhook. ⚠️ The
**money does not**: the webhook recomputes the VAT against `amount_total`, what Stripe
actually took, so the invoice can never disagree with the card statement.

`attachSession`, `release` and `completeBySession` are public mutations and that is safe on
purpose: each takes an id — a reservation id or a Stripe session id — that exists in
exactly one browser tab and is not guessable. Holding one *is* the proof, which is the same
reasoning ticket 06 already used for the artwork grant.

### VIES

The Commission's REST endpoint, five-second timeout, `requestIdentifier` kept when one
comes back. Invalid → the error at the field and one button, *Continue as a private
person*. Unreachable → charge VAT, say so in a line, proceed. Both exercised on staging:
`IE6388047V` reverse-charges, `IE9999999XX` shows the error and the button.

⚠️ **`BUSINESS_VAT_ID` is needed on Vercel**, not only on Convex, and for a different
reason than the invoice: VIES returns a `requestIdentifier` only to a caller that
identifies itself. Without it the check still works and the **proof is not kept**. It is
unset today; `docs/environments.md` says so.

### The webhook, and what the race actually means

⚠️ **A free square is one no *block* covers.** Ticket 05 said the webhook wins whenever the
squares are still free; another visitor's live *reservation* does not beat a completed
payment. Whoever pays first wins, and the one who paid second gets every cent back.

Any overlap at all refunds the whole order — a partial refund is not decided anywhere and
half a rectangle is not what anybody bought. The refunded order **is still written**,
because money moved and moved back and both belong in the ten-year record. ⚠️
[Ticket 23](23-build-invoice.md) must not give it an invoice number.

⚠️ **A refund that fails must be retryable, and the first build's could not be.** The
refund is made after the mutation returns, so a failed `refunds.create` — or a webhook
that died between the two — left the order marked refunded with the money still taken, and
Stripe's retry answered *already* and did nothing. A refunded order now answers `refunded`
again, and Stripe's `charge_already_refunded` is the error that counts as success. Found
by staging the race, not by reading the code.

### The return page

`/thanks`, static, reading `session_id` **on the client** — a page that reads a search
parameter at render is a page that builds dynamic, and ticket 08 paid for that lesson once
already. It subscribes by session id and, after ten seconds with nothing, asks
`POST /stripe/reconcile`, which retrieves the session from Stripe itself and writes through
the same keyed mutation. That endpoint is on **Convex**, not Vercel: no new shared secret,
no trust boundary, and the answer comes from Stripe rather than from the caller.

⚠️ **The intro may not promise.** One page carries a payment still being written, a square
now on the board, and a full refund; *your square is on the board* is a lie in two of the
three.

⚠️ **`owners.name` starts empty**, and the buyer supplies it on the return page beside the
link. That is ticket 06's *company moves after payment* read strictly, and it has a second
effect nobody named: a private person's **legal name never becomes the public tooltip**.
The order keeps the legal name for the invoice; the board gets the name they chose.

### Stripe's back link

⚠️ **A route, `/checkout/cancelled`, and not a search parameter.** The board route may not
read one, and this way it never has to. The page releases the hold from `sessionStorage`
and sends them back to the board; closing the window instead waits the fifteen minutes out,
as ticket 06 says.

### The hold, and the countdown

`sessionStorage`, no cookie, so the board stays cacheable. ⚠️ It is a **store**, not a
value read on mount, because four screens care about the same hold. One field decides which
of two panels is shown: a hold **with** a Stripe URL has been sent to pay and gets
*Continue paying*; a hold without one is still being filled in and gets the form with the
countdown above it. A hold outlives the page, so `ScreenProvider` puts that panel back in
front of a visitor who returns to the tab — otherwise the only way back to their own
fifteen minutes would be to drag a rectangle the board now reads as taken.

⚠️ **The `bought` flow is deleted.** The prototype confirmed a purchase in the panel; ticket
06 moved that moment off the board, and nothing had called it since ticket 15.

### Checked, on the real thing

`tsc` and `eslint` clean, `next build` green with **all five pages still `○ (Static)`** and
only `/api/checkout` dynamic. On the staging URL, in Stripe test mode:

- A Dutch consumer bought square 199. Order: `totalCents 25000`, `vatCents 4339`,
  `vatRateBps 2100`, `vatCase nl21`, `pricing inclusive`, the tick-box wording verbatim,
  the IP and the payment intent. The block landed `pending` and the board's counter moved.
- ⚠️ **The country mismatch happened by itself**: the panel said NL, Stripe's billing
  address said FI, and the order carries both with `countryMismatch: true` — accepted,
  never refused, exactly as ADR 0002 says.
- An Irish business with `IE6388047V` reverse-charged; `IE9999999XX` drew the field error
  and *Continue as a private person*.
- A second visitor from the same address was told *You already have a reservation open*.
- Stripe's back link released the hold eight seconds later.
- **The race, staged by hand**: A parked at Stripe, A's hold released, B bought the same
  square and got it, then A paid — and A's page says the money is back, in full,
  automatically.
- A returning buyer's second order joined the **same owner row** on the normalised email,
  which is ticket 08's join working before ticket 08 is built.

### What this leaves for other tickets

- **[18](18-build-accounts.md)** — the webhook makes the owner; the magic link is still
  ticket 18's, and `owners.seedViewer` is untouched.
- **[20](20-build-artwork.md)** — the session-id grant exists and already carries the name
  and the link. The upload authorises against the same grant; nothing else has to change.
- **[22](22-build-email.md)** — the automatic-refund mail has a place to be sent from and
  is not sent.
- **[23](23-build-invoice.md)** — ⚠️ **skip refunded orders.** They have no block and must
  take no invoice number.
- **[25](25-launch.md)** — ⚠️ one square bought by hand, in a real browser, on the real
  Turnstile key, before launch.
