# 42 — The withdrawal function, which the law now requires

Type: grilling
Status: resolved
Blocked by: —
Assignee: rob-vb (claimed 2026-08-26)
Parent: ../map.md

## Question

Graduated from [ticket 37](37-when-a-bid-binds.md) on 2026-08-26. It is not what that ticket
went looking for; it is the largest defect the reading found.

**Art. 6:230oa BW / art. 11a of Directive 2011/83 has applied since 19 June 2026.** A trader
who sells through an online interface must let a consumer withdraw **through a clearly visible
and easily accessible function on that interface**. The site has no such function. `/terms` and
the bid panel both say *email `hello@200squares.com`*, which
[ticket 31](31-a-bid-that-does-not-stand.md) called honest and legal, and which as of that date
is honest and **insufficient**.

The statute, quoted in full at
[`research/37-when-a-bid-binds.md` §3.5](../research/37-when-a-bid-binds.md):

- lid 1 — the function must be clearly visible and easily accessible, and labelled so its
  purpose is immediately clear (*"withdraw from contract here"*, or an unambiguous equivalent).
- lid 4 — on activation the trader confirms receipt **without delay** on a durable medium,
  stating the content of the declaration and the date and time it was made.
- lid 5 — the function must be available **at all times** during the withdrawal period.

⚠️ **The price of not having it is not a fine.** Art. 6:230m lid 1 sub h now also requires
information about the function's existence and placement, and art. 6:230o lid 2 extends the
withdrawal period by up to **twelve months** where sub h is not satisfied. That is the same
mechanism [research 03](../research/03-vat-invoices-withdrawal.md) §8 called the largest number
in that document, now with a second trigger. ACM says the same and names fines as well
(<https://www.acm.nl/nl/publicaties/acm-roept-online-retailers-op-zich-voor-te-bereiden-op-herroepingsknop>,
11-06-2026).

### What has to be decided before anything is built

1. **Does it reach a square, and for how long?** The banner is easy: the right is born at the
   close and dies 24 hours later, so the function need exist for one day per winner. The square
   is not. [Ticket 03](03-vat-invoices-withdrawal.md) §5.5 never settled whether a *permanent*
   service is ever "fully performed" — and if it is not, the right never dies and lid 5 asks for
   a button that is there for ever, on a purchase the whole site describes as final. This is the
   decision. It cannot be answered by building.
2. **Where does it live?** My squares is the obvious surface and it is behind an account. ACM
   says an account may be **offered but not required**. A buyer with no account still has the
   magic-link grant from [ticket 16](16-build-checkout.md); a bidder may have nothing at all.
3. **What does pressing it do?** [ADR 0003](../../../docs/adr/0003-a-bid-is-an-irrevocable-offer.md)
   settled that the refund stays **manual** — no pro-rata engine, no self-service cancel. Art.
   6:230oa does not require an automatic refund; it requires a declaration to be receivable and
   acknowledged. So the cheap shape is: the button records the declaration with its timestamp,
   mails the consumer the lid 4 confirmation, mails the dev, and the dev pays. Decide whether
   that is enough or whether the banner comes down by itself.
4. **Does it also serve the pre-close revocation?** Ticket 37 found that a consumer bidder may
   revoke the **offer** before the close (art. 6:230q lid 1), *"op de in artikel 230o bepaalde
   wijze"*. That is a different act from withdrawing from a concluded contract, and the site has
   no surface for it either. One button or two.
5. **What must the copy then say** — so [ticket 40](40-copy-true-again.md) can write it once.

⚠️ **This blocks the launch.** It is in force, the site sells to EU consumers, and the exposure
is a twelve-month withdrawal tail rather than a fee. It blocks [40](40-copy-true-again.md),
because ticket 40 cannot make `BANNER_WITHDRAWAL_INFO` true by writing a sentence about a
function that does not exist, and through 40 it blocks [25](25-launch.md).

⚠️ **Not legal cover.** [Research 37](../research/37-when-a-bid-binds.md) §6 item 1 says the
scope of this obligation is *"the one item worth paying for on its own"*. Decide the build here;
have the scope confirmed before launch.

Its build follows as its own ticket, the way this map has done throughout.

## Answer

Resolved 2026-08-26 by grilling. Five questions were asked and sixteen were answered; the
ticket's own list turned out to be the first round of four.

⚠️ **The reframe that decided item 1.** The ticket asked how long a square's withdrawal right
lasts, as if the button set it. It does not. **The law fixes the right; the button only fixes
whether the site obeys art. 6:230oa.** Building it lengthens nothing. Not building it risks two
things and neither is the right's duration: the twelve-month tail through art. 6:230m lid 1
sub h, and an ACM fine. So the question became *what does the site assert*, and the function
follows from the assertion.

### 1. The right — 14 days from purchase, and no claim of full performance

**A consumer has 14 days on a square, counted from the day of purchase.** The site makes **no
claim** that a square is ever fully performed, and it does not need one: the ordinary period
runs and it ends. Because the art. 6:230m lid 1 sub h information is then given in full, the
twelve-month tail cannot open — and that tail, not the tick box, is
[research 03](../research/03-vat-invoices-withdrawal.md) §5.6's *"number worth caring about"*.

Two positions were rejected.

- **The right never dies**, which follows from research 03 §5.5's reading that a permanent
  service is never fully performed. It is the safest reading in law. It puts a permanent
  near-full-refund right on every consumer square and it contradicts every page of the site.
  It also buys nothing that the position above does not, because the exposure it removes —
  the tail — is already closed by the information duty.
- **The right dies when the square goes live**, asserting full performance at the moment the
  artwork and the link are on the board. It rests on exactly the inference research 03 §8
  flagged as unproven, and if the assertion is wrong the tail opens on every consumer square.

**The banner is unchanged.** Its right is born at the close and dies at 00:00 UTC the next day,
on art. 6:230p sub d, which research 37 §3.1 confirmed still works. So the function need only
be live for one day per winning order.

### 2. The function — one route, two entry points, consumers only

**`/withdraw/<token>`.** One page, one label, one code path.

- **The token is new.** A `withdrawalToken` on `orders`, 16 random bytes, minted when the order
  is written and **only for `buyerType: "consumer"`**. ⚠️ **Not the invoice token.** The schema
  says in as many words that the invoice token exists so an owner can hand it to their own
  bookkeeper; that string must never also be able to cancel the purchase.
- **The entry points are on the interface**, because art. 6:230oa lid 1 asks for a function
  *displayed on the online interface* and a link in an email is not that. Two places, both
  already carrying one order: **`/thanks?session_id=`** — ticket 06's grant, which is how a
  buyer with no account reaches anything — and **My squares**. ACM: an account may be offered,
  not required.
- **The label is the statute's**: *withdraw from contract here*, and the second step's button is
  *confirm withdrawal*. A plain text link under the order row. No prototype ticket: a prototype
  here would be redesigning a statute.
- **Three states.** Live: the confirm step. Expired: a sentence saying the 14 days have run,
  with the address. Unknown token: 404. A business order has no token, so it has no entry point
  and nothing to explain.
- **One optional line of text** on the confirmation step, stored with the declaration and
  echoed in the confirmation mail — because lid 4 speaks of *the content of the declaration*,
  and a consumer who writes a sentence should get it back in writing.

⚠️ **Art. 11a lid 2 has not been read.** [Research 37](../research/37-when-a-bid-binds.md) §3.5
quotes lid 1, 4 and 5, and art. 11a(1) and (3). Lid 2 is the paragraph that says what the
confirmation step must collect. The build reads it before the page is drawn.

### 3. Pressing it

A row in a **new `withdrawals` table** — `orderId`, `kind`, `declaredAt`, the words the consumer
was shown, their own line if they gave one, `refundedAt`. Not fields on `orders`, which is the
ten-year money record of a different act, and not `removals`, which is a list of rule breaks
that [`convex/admin.ts:336`](../../../convex/admin.ts) prints as such. A withdrawal is not one.

Then, by kind:

- **A banner comes down at that instant**, by calling the effect
  [ticket 32](32-build-withdrawn-banner-day.md) already built and proved: `withdrawBanner`
  patches the day, releases the artwork, counts **no strike**. Art. 6:230s lid 4 prices the
  refund from the moment the declaration is **sent**, so an instant take-down costs nothing and
  it makes `/terms` true — today it promises the banner comes down *"as soon as we have read
  your message"*, and now nobody has to read anything.
- **A square does not move.** The dev judges the refund and pays it by hand, per
  [ADR 0003](../../../docs/adr/0003-a-bid-is-an-irrevocable-offer.md). **Then a new mutation
  deletes the block** and the rectangle goes back on the market, so ticket 27's sold-out count
  reads true again. A block that stays owned and empty after a full refund is the one shape
  nobody could defend.
- **The lid 4 confirmation mail**, without delay, on a durable medium, stating the content of
  the declaration and the date and time it was made. ⚠️ **This is a seventh mail** on
  [ticket 13](13-email.md)'s list of six, and it is obligatory rather than chosen: ticket 32
  decided *no mail* on the ground that *"the dev is already in the thread"*, and a button has
  no thread. ([Ticket 41](41-build-declined-bidder.md) adds the other seventh; they are
  different mails and both are needed.)
- **A mail to the dev, and a short list on `/admin`** of declarations that are not yet
  refunded. Art. 6:230r lid 1 starts a **14-day refund clock** on each declaration. A mail can
  be lost, and a list of what is still owed is the only thing that stops one being missed.
  `/admin` exists ([ticket 24](24-build-removal.md)) and already carries the un-purged alarm
  from [ticket 36](36-build-purge-on-release.md), so the shape is known.

### 4. One button, not two

[Ticket 37](37-when-a-bid-binds.md) found that a consumer bidder may revoke the **offer** before
the close (art. 6:230q lid 1). That is a different act from withdrawing from a concluded
contract, and **art. 6:230oa does not reach it** — lid 1 speaks of *een via een online-interface
gesloten overeenkomst*. So the statutory function is built once, for concluded contracts, and
**the pre-close revocation stays an email**.

That is a choice as well as a reading. A one-press revoke on a live bid lets a consumer unwind
the ladder at 23:59, which is the dev's original fear in
[ADR 0003](../../../docs/adr/0003-a-bid-is-an-irrevocable-offer.md) — *"het moet niet zo zijn
dat iemand biedt en vervolgens vlak voor de teller zijn bod intrekt"*. Email friction is
lawful and it protects what tickets 30 and 31 built. **The copy still has to change either
way**, because the site currently says the thing is impossible.

### 5. What the copy must now assert

Not the prose — [ticket 40](40-copy-true-again.md) writes that once. What it must say:

- **`WITHDRAWAL_TEXT`** (`src/lib/checkout/consent.ts`) loses its second sentence, *"I
  understand that I lose my right to cancel once the square has been fully delivered."* Under
  §1 the site makes no such claim, so the sentence would assert something it has dropped. The
  first sentence **stays**: art. 6:230s lid 4 needs the express request to charge *pro rata* at
  all.
- **`WITHDRAWAL_INFO`** stops sending the buyer to an inbox as the only way out. It names the
  14 days, it names the button, and it says where the button is — that last part is
  art. 6:230m lid 1 sub h, which is the clause the whole tail hangs on.
- **`BANNER_WITHDRAWAL_INFO`** does the same, and it can finally drop *"as soon as we have read
  your message"*.
- **`BID_TRUTHS`'s fourth line and `/terms` "The daily banner"** split by buyer type: a
  business bid cannot be withdrawn; a private bidder can take a bid back before the close, by
  email.
- **`/terms` "There is no way out"** is rewritten, not deleted. It keeps the promise it makes
  about the **site** — no resale, no take-back by the site — and it stops saying *"There is no
  refund and no exit"* with no condition on it. That sentence is true for a business buyer and
  false for a consumer, and it is the sub h failure in its purest form.

### What this ticket does not settle

⚠️ **Not legal cover.** [Research 37](../research/37-when-a-bid-binds.md) §6 item 1 calls the
scope of this obligation *"the one item worth paying for on its own"*. Item 1 above chooses a
position on research 03 §5.5's open question rather than resolving it, and the position is the
cheaper of two defensible ones. Have it confirmed before launch —
[ticket 25](25-launch.md) carries that.

Recorded as [ADR 0005](../../../docs/adr/0005-fourteen-days-and-a-button.md), because the
assertion in §1 is frozen into every consumer order at the moment of sale and cannot be
revisited for the orders already written.

Its build is [ticket 43](43-build-withdrawal-function.md). ⚠️ **Ticket 40 is re-pointed at 43,
not at this ticket**: ticket 40 cannot write a true sentence about a function that is decided
and not built.
