# 40 — Making the copy true again

Type: task
Status: resolved
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

## Answer

**Written and read back on staging on 2026-08-27. Commits `6444c6a`, `622e771`, `3c4f028`,
`719d4f4`.** Every debt on the list above is paid. Three of them turned out not to be debts,
and reading the pages whole — which this ticket demanded and was right to — found four more
that the map never recorded.

### ⚠️ The public record of banner days already exists

The list above, and [research 37](../research/37-when-a-bid-binds.md) §7 under it, both say
`/terms`'s *"the day stays in the public record with the winning bid on it"* is **false**
because [ticket 30](30-auction-tension.md) committed to a record nobody built. It was built.
`src/components/content/banner-record.tsx` has been in the tree since
[ticket 15](15-build-schema.md) (`9254110`), it is wired into the *daily banner* section of
`/how-it-works`, and it reads its own `api.auction.record` query — deliberately not the
board's, because a day that is over is not something the board draws.

So the sentence stays and **gains its other half**: it now says where the record is, and
links to it. The choice the ticket offered — *either build the record of past winners or take
the sentence out* — was never live. Read back on staging: six past days, each with its date,
its holder and the bid that won it.

⚠️ Whoever reads research 37 §7 again should read this beside it. That table marks the
sentence *"**Stays**, and is **still untrue** on its second half"*, and it is not untrue.

### The two other stale entries

- **"The mail count is eight. `CONTEXT.md` and `PRODUCT.md` still say six."** Neither file
  states a count, so there was nothing to correct. For the record, `convex/lib/mail.ts` now
  builds **eleven** messages, one of which is the dev's own copy and one of which has three
  variants. A count in a document is a thing that goes stale; neither file gained one.
- **"`PRODUCT.md` and `CONTEXT.md` have no word for a withdrawal."** `CONTEXT.md` has had
  **Withdrawal**, **Declaration** and **Withdrawal function** since
  [ticket 43](43-build-withdrawal-function.md). Only `PRODUCT.md` was missing it.

### What `/terms` says now

- **"There is no way out" is now "No resale, and no take-back".** Ticket 42 §5 asked for the
  section to be rewritten rather than deleted, and it was — but the **heading** had to go too.
  A heading that says *there is no way out* directly above a section headed *Cancelling, if
  you buy as a private person* is the sub h failure wearing a different hat: a consumer who
  skims headings stops at the first one. What the section promises about the **site** is
  unchanged and now stands on its own — no resale, and the site does not buy a square back —
  followed by one sentence handing the reader to the next section.
- **The consumer's fourteen days have their own section.** The right, the button, **where the
  button is** (art. 6:230m lid 1 sub h — the thank-you page and under the order in My
  squares), the immediate acknowledgement (art. 6:230o lid 4), the 14-day refund deadline
  (art. 6:230r lid 1), the pro-rata charge priced from *when you sent it*, and that a business
  buyer has none of it.
- **A cancelled square goes back on the market.** Ticket 43 deletes the block once the refund
  is paid, and no page had ever allowed for a rectangle returning to sale.
- **The daily banner** gains the moment of conclusion (*a bid is an offer, accepted at 00:00
  UTC*), that an overtaken bid **stays open** until the close, and that the promoted
  runner-up is charged **its own amount** — which is money and had never been on the page.
  *"A bid cannot be withdrawn."* is gone, replaced by `BID_TRUTHS[3]`'s shipped split, minus
  its trailing clause about the banner's own button, which `/terms` states at length two
  paragraphs later.
- **The declined top bid** (ticket 38's debt): the highest bid does not always win, a refused
  charge loses the day without being outbid, we say so by mail, and we are never told why.
- *"As soon as we have read your message"* is gone. Nobody reads anything.
- **Removal** (ticket 24's four lines): nothing is refunded, three removals in twelve months
  freeze **the block that caused the third one** — counted across everything the owner holds,
  which the first draft got wrong — the site does not check where a link goes, and where to
  report one.
- **The email address is the key** (ticket 08's three sentences), and orders are kept ten
  years, so the proof outlives almost any inbox.

### What `/privacy` says now

The fifteen-minute salted hash behind *one hold per visitor*, and the same one for a pending
bid. The ten years an order keeps, and the three things in it. **Resend** as a processor.
**Cloudflare**, named because a visitor who only clicks now loads a script from it and did not
set out to. The click count as a **floor and not a census**, with a bare zero. And the sentence
that keeps both promises at once: an address belongs to an **owner**, the clicks promise is
about a **visitor**.

### `consent.ts`

One re-word, the last one research 37 §7 asked for: `BANNER_WITHDRAWAL_INFO` counts from **the
close**, not from *the day you win*. §7 made that conditional on `/terms` saying the contract
is concluded at the close, and `/terms` now does. ⚠️ The docblock says so, because one may not
be changed back without the other.

### Found by reading the pages whole

The ticket's own warning — *this list is not a promise that nothing else drifted* — earned its
place four times.

1. ⚠️ **The contact block offered only an X handle.** `/terms` sends a person to
   `hello@200squares.com` three times — to withdraw, to report a block, and to recover a dead
   inbox — and `consent.ts` freezes that address onto every order. The one place a visitor
   looks for a way to reach somebody named neither it. It does now, beside the handle. It is
   the same address the site sends from ([ticket 13](13-email.md): never a `no-reply@`).
2. **`/privacy` appeared to contradict itself.** *No third-party tracking scripts* sat three
   paragraphs above the new Cloudflare paragraph. Both true, and a reader cannot see why, so
   the first now says what the second is.
3. **`PRODUCT.md`'s Operating Context described a prototype** with no backend, no payment and
   no accounts, and pointed at the closed frontend map. It also listed **three** square states
   where [ticket 05](05-convex-model.md) made four, and carried two *undecided* items that the
   code had long since decided — how long a square is held, and whether owner links are
   followed (they are: `noopener noreferrer`, no `nofollow`). Its claim that the top bar
   promises resale *when all 199 squares are sold* has been false since
   [ticket 26](26-strip-resale.md).
4. **`CONTEXT.md` called a bid flatly irrevocable** and repeated *A bid cannot be withdrawn* —
   the same sentence this ticket removed from `/terms`, in the file the copy is supposed to
   take its words from. It now splits by buyer type and says an overtaken bid stays open.

### Proved

`TEXT=1 node scripts/shot.mjs` on staging, the way [ticket 28](28-prove-the-mail.md) proved
the mail — read, not looked at: `/terms` (`t40-terms.png`), `/privacy` (`t40-privacy.png`),
`/how-it-works` with the FAQ and the six past banner days (`t40-hiw.png`). `tsc --noEmit` and
`eslint` clean; `next build` keeps `/terms`, `/privacy` and `/how-it-works` **static**, which
is [ticket 02](02-ddos-and-the-bill.md)'s cheapest defence and the thing
[ticket 08](08-accounts.md) found switched off.

### What this does not do

- ⚠️ **Not legal review.** These are the words the map's own research asked for, written by
  the same effort that did the research. [Ticket 25](25-launch.md) already carries having the
  art. 6:230oa scope confirmed before launch; the pages are now what a reviewer would read.
- **`/about` and the board copy were read and left alone.** Nothing on them had drifted.
- ⚠️ **One flagged sentence stays flagged**: *"A banner that breaks the rules is removed for
  the rest of its day and the bid is not returned."* Research 37 §6 item 5 marked it
  *flagged, not researched* against art. 6:237 sub i, and this ticket is not the place to
  decide it. It is now in the map's **Not yet specified**.

[25 — The launch switches](25-launch.md) is the last ticket on this map, and it is unblocked.
