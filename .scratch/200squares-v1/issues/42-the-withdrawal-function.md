# 42 — The withdrawal function, which the law now requires

Type: grilling
Status: open
Blocked by: —
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
