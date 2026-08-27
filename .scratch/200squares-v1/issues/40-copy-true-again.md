# 40 — Making the copy true again

Type: task
Status: claimed
Blocked by: 38, 43 (both resolved — 43 on 2026-08-27, so this is now on the frontier)
Parent: ../map.md

## Question

Graduated from the map's *Not yet specified* on 2026-08-26. The last debt on the map, and
the same shape the prototype map ended on: build it, then make the copy true.

`/how-it-works`, `/terms`, `/privacy` and the FAQ still describe a site that fakes
everything. Every decision on this map that changed what the site does left a line behind.
The debts, collected:

### `/terms`

- ⚠️ Ticket 08's three sentences about a **lost inbox**: the email is the key, losing it is
  not the end, and getting back in means proving the payment to a person.
- Ticket 24's four lines: **nothing is refunded** on a removal, the **freeze rule** and what
  frozen means, **the site does not check where a link goes**, and `hello@200squares.com` as
  the place to report a block.
- ⚠️ The one line that is false because of something the site does **not** have: the daily
  banner paragraph still promises *"the day stays in the public record with the winning bid
  on it"*. [Ticket 30](30-auction-tension.md) committed to it and nobody built it. Either
  build the record of past winners or take the sentence out.
- Whatever [ticket 38](38-declined-bidder-hears-nothing.md) answers about the declined
  capture.
- ⚠️ **What [ticket 37](37-when-a-bid-binds.md) answered, 2026-08-26.** It read the
  irrevocability against the law and half of it did not survive. §7 of
  [`research/37-when-a-bid-binds.md`](../research/37-when-a-bid-binds.md) is a
  sentence-by-sentence verdict — every line of `src/lib/checkout/consent.ts` and of the
  *daily banner* section of `/terms`, marked **stays**, **re-word** or **must change**. Work
  from that table, not from this summary:
  - **Must change**: *"A bid cannot be withdrawn."* in `BID_TRUTHS[3]` and the identical
    sentence on `/terms`. It is **false against a consumer** (art. 6:230q lid 1 BW) and it is
    about a **mandatory right**, which is the worst kind of false. §7 proposes a replacement
    true for both buyer types. The second sentence — *"every bid stands until it does"* — is
    fine.
  - **Re-word**: *"counted from the day you win"* → *"counted from the close"*, in
    `BANNER_WITHDRAWAL_INFO`.
  - **Add to `/terms`**: when the contract is concluded — *a bid is an offer, accepted at
    00:00 UTC* — because Dutch law leaves that to the terms and the terms are silent. And
    that an **outbid offer stays open** until the close, which is what lets the ladder
    promote it (art. 6:221 lid 2).
  - **Stays**: both tick boxes, `BID_BUTTON`, the ladder sentences, and the pro-rata rule
    including its *when you sent it* timing.
  - ⚠️ ~~**Waits for [ticket 42](42-the-withdrawal-function.md)**~~ — **the button exists**
    since [ticket 43](43-build-withdrawal-function.md), 2026-08-27. The cancel paragraph can
    now be written: the **withdrawal function** at `/withdraw/<token>`, the 14-day refund
    deadline (art. 6:230r lid 1) and the immediate acknowledgement (art. 6:230o lid 4).
    ⚠️ **Say where the button is, not only that it exists** — art. 6:230m lid 1 sub h asks
    for *de beschikbaarheid **en de plaats***, and the whole twelve-month tail of art. 6:230o
    lid 2 hangs on that half of the sentence. It is on `/thanks` after payment and under the
    order row in My squares, and it shows only while the period runs.
  - ⚠️ **`BID_TRUTHS[3]` is already done** — ticket 43 shipped it with `consent.ts`, because
    those words freeze onto an order at the moment of sale. `/terms`'s identical sentence is
    **not**, and it is still the flat *A bid cannot be withdrawn.* Copy the shipped wording
    rather than writing a second one.
  - **Already done, 2026-08-26**: ADR 0003 carries its superseding note. Nothing left there.

### `/privacy`

- A **reservation keeps a salted hash of the visitor's address for fifteen minutes** — the
  price of *one hold per visitor*, and the first thing on the board path that is about a
  visitor at all.
- A **pending bid keeps the same salted hash**, for the same fifteen minutes.
- An **order keeps the IP, the tick-box wording and the address for ten years**.
- **Resend is a processor**, and the **address is now a key** and not only a contact — with
  the sentence that keeps both promises true at once: an email address belongs to an
  **owner**, while the clicks promise is about a **visitor**.
- *Who else sees it* names the payment provider and Vercel but not **Cloudflare**, which a
  visitor who only clicks a block now loads a script from. Buying and bidding are deliberate
  acts; clicking is not.
- What a click count **is**: counted in the visitor's browser, not audited, a **floor** and
  not a census. Ticket 10 named it and left it to the copy.

### `/how-it-works` and the FAQ

- The click count, in the same words as above. A zero stays a **zero, bare**.
- **Artwork rules for somebody who has not bought anything yet**: WebP, 10 MB, the crop, no
  animation. Ticket 20 already put the rules beside the picker in all three places a picture
  is chosen; this is the public half.
- Everything the pages still say about fake data, fake sales and a fake board.

### What [ticket 43](43-build-withdrawal-function.md) added to this list, 2026-08-27

- ⚠️ **`/terms` still says the banner comes down *"as soon as we have read your message"*.**
  Nobody has to read anything now: the function takes the day off at the instant of the
  declaration. `BANNER_WITHDRAWAL_INFO` was fixed with the build; `/terms` was not.
- ⚠️ **`/terms`'s *"There is no way out"* is rewritten, not deleted** (ticket 42 §5). It keeps
  what it promises about the **site** — no resale, no take-back — and stops saying *"There is
  no refund and no exit"* with no condition on it. That sentence is true of a business buyer
  and false of a consumer, and it is the sub h failure in its purest form.
- **The mail count is eight.** `CONTEXT.md` and `PRODUCT.md` still say six; ticket 41 added the
  declined-bidder mail and ticket 43 added the art. 11a lid 4 acknowledgement.
- **A withdrawn square's block is deleted once the refund is paid**, so a rectangle can come
  back onto the market after being sold. Nothing in the copy has ever allowed for that.
- `PRODUCT.md` and `CONTEXT.md` have no word for a **withdrawal** at all, and it is now a
  table, a route and a state a square can be in.

⚠️ Read every page whole before editing. This list is what the map recorded; it is not a
promise that nothing else drifted.

Proved the way ticket 28 proved the mail: `TEXT=1 node scripts/shot.mjs <path> out.png`
reads the words rather than looking at them.
