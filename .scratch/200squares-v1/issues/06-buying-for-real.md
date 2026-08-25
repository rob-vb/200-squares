# 06 — Buying with real money

Type: grilling
Status: resolved
Blocked by: 03, 05
Parent: ../map.md

## Question

Charting fixed the shape: the visitor drags a rectangle in the panel, the site holds
it for **15 minutes**, and sends them to **Stripe's hosted checkout page**. Artwork
comes **after** payment; the block lands `pending`. No account is needed to buy —
Stripe supplies the email and
[ticket 08](08-accounts.md) turns it into an account afterwards.

What is not decided is everything that can go wrong. Work through it:

- **The order of events.** Reserve, then pay, then webhook, then `pending`. What
  creates the block — the browser coming back, or the webhook? They arrive in either
  order, and sometimes only one arrives.
- **Idempotency.** A webhook that fires twice must not sell the same squares twice.
- **The 15 minutes running out** while the buyer is still on Stripe's page. Someone
  else takes the squares, the payment succeeds. What then — refund, or a rule that
  makes it impossible?
- **Failure the buyer sees.** Card declined, browser closed, back button, paying
  twice in two tabs.
- **What the board shows** during a reservation. Charting said it reads as taken.
  Does it read as `pending`, or does it need a fourth appearance? Note that
  [ticket 11 on the prototype map](../../200squares-frontend/issues/11-resale.md)
  refused a fourth square state once already, for good reasons.
- **The thank-you page.** What it says when artwork is still missing, and how the
  buyer gets from there to uploading. This is the moment the account is created.
- **The tick box.** Charting decided the buyer waives the right of withdrawal with an
  explicit tick, the way outbid.lol does for bids.
  [Ticket 03](03-vat-invoices-withdrawal.md) says whether that holds up and what the
  words must be. Stripe's hosted page limits what can be put next to the button —
  find out whether the tick belongs on the board instead, before the redirect.
- **What Stripe's page must collect** — country, VAT number, business or consumer —
  and whether Stripe Tax is on. Ticket 03 decides; this places it in the flow.
- **The receipt and the invoice.** Stripe's, or the site's.

Selection, drag and the 4 x 4 limit are settled and are not reopened.

## From resolved research

[Ticket 03](03-vat-invoices-withdrawal.md) and [ticket 02](02-ddos-and-the-bill.md)
put three new things on this ticket's plate:

- ⚠️ **The order button.** Stripe's hosted page says "Buy", and under *Fuhrmann-2*
  only the words on the button count. The order must be **placed on 200squares.com**
  behind a compliant label, or every EU consumer contract is voidable. This cuts
  across the charting decision that checkout is Stripe's hosted page. Decide the
  shape: an order button on the panel that then redirects, or something else.
- ⚠️ **`tax_behavior`, inclusive or exclusive, and it is irreversible once set.**
  This is the difference between "$100" staying true and becoming $119-121 for an EU
  consumer. It is a product decision wearing a Stripe flag.
- **The fields before the redirect**: buyer type (radio, no default), country, name,
  EU VAT number for a business outside NL, an unticked withdrawal box with the
  Art. 6(1)(h) information, consent to a digital invoice — plus VIES validation
  **synchronously, before** the Checkout Session, because Stripe validates too late.
- ⚠️ **The 15-minute reservation is an attack surface with no cost to the attacker.**
  A distributed script can freeze the whole board with fake reservations while the
  site stays up and bills nothing. Offline is acceptable to the dev; a board nobody
  can buy from was never considered. Turnstile in front of starting a checkout is the
  free control that reaches it.

## Answer

**The order is placed on 200squares.com, $100 includes VAT, and only the webhook writes
the block.** Written 2026-08-25 with the dev.

### Where the contract is concluded

⚠️ **The charting decision that "checkout is Stripe's hosted page" is now half true.**
Under *Fuhrmann-2* only the words on the button that concludes the contract count, and
Stripe's says "Buy". So the **order button lives in the panel**, labelled *Order now —
obliges you to pay*. That button concludes the contract, creates the reservation and the
Stripe session, and only then redirects. Stripe's page is reduced to executing a payment
for an order that already exists.

Stripe Embedded Checkout and Elements were both rejected: Embedded reintroduces Stripe's
own label, and Elements is a payment form to build and to keep compliant for no gain.

**The panel stays one screen, not a wizard.** Three fields leave it — company, link and
artwork all move to after payment — and the ticket 03 fields take their place: buyer type
(radio, no default), country, name, an EU VAT number that appears only for a business
outside NL, the unticked withdrawal box, and the digital-invoice line. Net, the screen
does not grow.

Stripe still collects the **email** (it is what creates the account) and, with
`billing_address_collection: required`, the billing address. Phone off.

### The price

**$100 includes VAT.** `tax_behavior: inclusive`, set explicitly — Stripe's "Automatic"
resolves to *exclusive* for USD, which is the opposite. **Stripe Tax is off**; the site
computes VAT itself from buyer type, country and VIES, and freezes rate and amount into
the `orders` row. Recorded as
[ADR 0002](../../../docs/adr/0002-vat-inclusive-priced-and-computed-here.md).

The consequence the dev accepted knowingly: **revenue now depends on who buys.** An EU
consumer leaves $82.64, a non-EU buyer or a reverse-charged EU business leaves $100. A
full board is worth **$16,446 to $19,900**, not one number.

⚠️ **The first sale and the resale are priced by opposite rules.** [Ticket
01](01-resale-platform-cost.md) put VAT on top for resale because inclusive loses $19
there. That is a real inconsistency, entered on purpose, and
[ticket 12](12-resale-for-real.md) owns explaining it.

**Stripe Tax is revisited at €10,000** of cross-border B2C, when OSS brings 27
destination rates and 0.5% starts paying for itself. Below it, every EU consumer pays
Dutch 21% and the arithmetic is one line.

**No KOR.** The site sells across the border from day one, which is exactly where the
KOR stops, and art. 25a lid 4's ban on mentioning VAT collides with the «btw verlegd» an
EU B2B invoice needs. Still worth one question to the dev's accountant.

### The order of events

Reserve → order (on the site) → pay (on Stripe) → webhook → `pending`. Ticket 05 already
ruled that **only the signature-verified webhook writes**, keyed on the Stripe session
id. This ticket closes the gap where the webhook is late or lost:

- The **return page subscribes** to the order by session id and says *payment received,
  we are putting your square on the board*.
- After **10 seconds with no order**, the server retrieves the session from Stripe and
  writes the same row. The session id is the key, so writing twice is impossible.

Nobody hangs, and there is no path where a paid buyer sees an error.

### The 15 minutes

The countdown is **shown**, in the panel before the redirect and on the return, with one
line of copy: *We hold these squares for 15 minutes.* Coming back through Stripe's own
back link **releases the reservation immediately**; closing the window waits it out.

The tab remembers its reservation in **`sessionStorage`** — id and Stripe URL, nothing
else. Not a cookie, never sent to the server, gone when the tab closes, so the board
stays cacheable and cookie-free as ticket 02 and ticket 05 require.

**Pressing order twice returns the same Stripe session**: the reservation id is the
idempotency key, so one reservation has exactly one session for its whole life.

### The reservation flood

Ticket 02 and ticket 05 both left this open, and the data model could not solve it.
Three free controls, together:

- **Turnstile**, invisible, run when the buy screen opens; the mutation refuses without a
  valid token.
- **One live reservation per IP.** A second attempt reads *You already have a reservation
  open.*
- **At most 10% of the free squares in reservation at once.** With at most 199 sales in
  the site's whole life, this ceiling never touches real demand.

### VIES, when it fails

Two different failures, two different answers. **Invalid number**: show the error at the
field and offer one button, *Continue as a private person* — 21% and the order proceeds.
**VIES unreachable**: charge VAT, say so in one line, and proceed. Never block an order on
a service the site does not run. Keep the `requestIdentifier` in the `orders` row whenever
one comes back.

### The country mismatch

The card country only arrives after payment, so refusing would mean refunding.
**Accept, record both countries with a flag, and take the difference on the chin.**
Because the price is inclusive, a mismatch changes only what the site owes, never what
the buyer paid — worst case $17.36. This case is unsolvable under exclusive pricing, and
is the second reason ADR 0002 goes the way it does.

### The invoice

**The site issues it, not Stripe.** A Stripe receipt is not a VAT invoice, and Stripe
Invoicing cannot put the VAT amount in euros beside a USD total, which art. 35a lid 4 Wet
OB requires. The `orders` row already carries everything frozen; the site renders the PDF
from it. Numbering, storage and delivery go to the new
[ticket 17](17-invoice-document.md).

### The thank-you page

**The buyer uploads artwork there, without waiting for email.** The session id in the
return URL grants exactly one right: set artwork and link on the blocks of that order.
The magic-link mail goes out at the same time and is the way back later. Nobody leaves
the site with an empty square. What the account itself is stays with
[ticket 08](08-accounts.md).

### Evidence and retention

The order records, silently, the IP, the **exact wording** of the tick boxes as text (not
a version number, so it stays readable without the code of that day), and the timestamp.
**Orders are kept 10 years**, not 7 — the ten-year duty starts at the €10,000 crossing,
and by then it is too late to keep what was already deleted. `/privacy` must say this.

### `pending` has no deadline

A paid square is permanent, so a slow owner never loses it. Ticket 13 sends reminders at
1, 7 and 30 days; after that the square stays `pending`. This keeps
[ticket 11](11-admin-removal.md) free of a problem that is not its own.

### What this changes elsewhere

- **[Ticket 03](03-vat-invoices-withdrawal.md)** — its withdrawal-waiver finding stands
  untouched; the box is kept for the Art. 6(1)(h) information, not for the waiver.
- **[Ticket 07](07-auction-holds.md)** — `tax_behavior` is per price, so the banner may
  still choose its own. Ticket 03 also found the banner *can* be fully performed, so the
  waiver works there and not here.
- **[Ticket 08](08-accounts.md)** — the account is created by the webhook, and the
  thank-you page must work before the buyer ever opens the mail.
- **[Ticket 09](09-artwork-storage.md)** — the first upload happens on the thank-you page
  with a session-id grant, not from a signed-in account.
- **[Ticket 12](12-resale-for-real.md)** — inherits the inclusive-versus-on-top split and
  has to explain it.
- **[Ticket 13](13-email.md)** — gains the reminder series, the automatic-refund mail from
  ticket 05, and the invoice as an attachment.
- New: **[16 — Build: the checkout](16-build-checkout.md)** and
  **[17 — The invoice as a document](17-invoice-document.md)**.
