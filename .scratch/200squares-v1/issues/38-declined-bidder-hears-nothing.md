# 38 — Nobody tells a bidder their card was declined

Type: grilling
Status: resolved
Blocked by: —
Parent: ../map.md

## Question

Graduated from the map's *Not yet specified* on 2026-08-26.
[Ticket 19](19-build-auction.md) built the ladder and named the hole; it refused to fill it
there, because [ticket 13](13-email.md) fixed the list at **six** messages and a seventh
does not get decided inside a build ticket.

The case: a bidder holds the top spot all day. At 00:00 UTC the capture fails. The site
walks down the ladder, the runner-up gets *You won today's banner*, and the person who
actually won the bidding **hears nothing at all**. It is the one path on the site where
somebody loses something and is told nothing.

- **Does a seventh mail exist?** Ticket 13's list is closed on purpose — every mail is a
  thing to write, to test and to keep true. This one is rare by construction. Is rare a
  reason not to send it, or the reason it must be sent?
- **The outbid mail is the wrong words.** *You have been outbid* is false: nobody outbid
  them. Their bank refused. Reusing it is a lie in the one mail that has to be honest.
- **What may it say?** Stripe gives a decline reason and most of them are not the site's
  business to repeat. Between *your card was declined* and *the banner went to somebody
  else*, decide what the site knows, what it may pass on, and what it must not guess.
- **Does it invite them back?** Tomorrow's auction is open. A mail that says *you lost* and
  nothing else is honest and useless; a mail that sells is the tone `/terms` refuses.
- **The mirror case.** The same close also promotes a runner-up who is charged **their own
  amount** and did not expect to win at all. Does *You won today's banner* still read true
  for them, or does the ladder need a second set of words there too?
- **Where else is it said?** The bid panel and *My squares* both show a standing bid. A
  bidder who comes back to the site sees what, the day after?

Feeds [40 — Making the copy true again](40-copy-true-again.md), and a build if the answer
adds a message.

## Answer

**A seventh mail exists, and it is not the only thing missing: the hold is never
released and two surfaces say something untrue.** The ticket asked whether ticket 13's
list of six should grow. The answer is yes — and reading the code to answer it found
three defects behind the missing mail, all in the same path.

### The case, exactly

`closeOne` walks the ladder ([`convex/auction.ts:864`](../../../convex/auction.ts)). A
capture that cannot be collected is marked `failed`
([`auction.ts:893`](../../../convex/auction.ts)) and the loop moves to the next bid. The
bidder who held the top spot all day loses the banner. Ticket 19 named the silence; three
more things follow from the same two lines.

### ⚠️ 1. The money stays frozen

Only the holds **below** the winner are cancelled
([`auction.ts:955`](../../../convex/auction.ts)). A `failed` bid's PaymentIntent is never
touched, so the authorization sits on the card until it expires by itself.

**The close cancels it too**, after the winning capture, in the same pass that releases the
rest. A cancel that throws is let go — an authorization dies on its own, and the close may
not be held up by it. This is a defect in [ticket 19](19-build-auction.md)'s build, not a
new decision: ticket 07's rule is *nothing is released until somebody has paid*, and by the
time the ladder has a winner somebody has paid.

### ⚠️ 2. The status page tells him something false

`bid.status === "failed"` renders *"That auction has closed — the banner for X was decided
while you were paying. Nothing is held and nothing is charged."*
([`src/components/bid-placed.tsx:110`](../../../src/components/bid-placed.tsx)). For this
bidder it is untrue twice over: the day was not decided while he was paying, and something
**was** held.

The cause is that `failed` covers three different endings — a card that cannot hold long
enough (`reason: "late"`), a day already decided, and a capture the bank refused. **The
refused capture gets its own `reason`**, the way `late` already has one.

Its words: *Your card was declined at the close*. Then the facts — the bid was the highest,
the bank refused the charge at 00:00 UTC, the banner went to the next bid that could be
collected, the hold is released and nothing was taken. Last line: the next day's auction is
running.

### ⚠️ 3. My squares forgets him

The panel lists only tomorrow's `held` bids
([`convex/owners.ts:165`](../../../convex/owners.ts)), so the day after the close it says
*"You have not bid."* to somebody who bid all day.

**One row for yesterday**, in the bid section and not under *Banner days you won*: the
date, the amount, and one word for the ending — **Declined** for a refused capture,
**Not won** for an ordinary release. One row and no more. A full bidding history is
somebody else's question.

### The mail itself

It is the **seventh** message, and it grows ticket 13's closed list on purpose. Rare is the
reason to send it, not the reason to skip it: this is the only path on the site where a
person loses something and hears nothing at all.

- **It says the card was declined. It never says why.** Stripe hands back a decline code
  and that code is between the bidder and his bank. If the site stays vague he looks for
  the fault in the auction; if the site repeats the code it explains a bank it does not
  speak for. So: the charge was refused, and for the reason, ask your bank.
- **It is not the outbid mail.** *You have been outbid* is false here — nobody outbid him.
  Reusing it would be a lie in the one message that has to be honest.
- **One factual last line**, like the outbid mail has: the auction for the next day is
  running. No amount, no urging, no *try again*.
- **Everybody whose capture failed gets one**, in all three shapes of the close: one
  failure with a promotion under it, several failures, and the whole ladder failing so the
  house ad takes the day. The mail is about his own card, not about who won.
- **Sent after the winning capture**, in ladder order, inside the same `try`/`catch`
  `wonMail` has ([`auction.ts:927`](../../../convex/auction.ts)). A Resend outage may never
  hold the close open or leave other holds frozen.

### The mirror case: the promoted runner-up

`wonMail` says *"Your bid of $X won the banner"*
([`convex/lib/mail.ts:104`](../../../convex/lib/mail.ts)). True for a promoted bidder, and
written for somebody who expected to win.

**One extra sentence, only when he was promoted**: the bid above his could not be
collected, so the banner is his, for his own amount. The rest of the mail is unchanged —
he is charged his own bid, which is ticket 07's rule and is the part he will look for.

### What this hands on

- [40 — Making the copy true again](40-copy-true-again.md) owes `/terms` a line: the
  highest bid does not always win, and a bid that cannot be collected loses without being
  outbid. The panel and `/terms` both already promise the ladder; neither says what it
  costs the bidder at the top of it.
- The build is [41 — Build: the declined bidder hears it](41-build-declined-bidder.md).
