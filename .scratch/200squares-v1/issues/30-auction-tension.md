# 30 — Making the auction feel like a contest

Type: grilling
Status: open
Blocked by: —
Parent: ../map.md

## Question

The dev wants the bidding **gamified**, so there is tension about who takes the banner.
*"ik wil dat het bieden toch meer gamified wordt, zodat er spanning is wie het blok wint."*

Read [ticket 07](07-auction-holds.md) and [ticket 19](19-build-auction.md) first. The
mechanism is built and it is not in question here. This ticket is about what the visitor
**feels and sees**, not about how money moves.

### Where this came from, and what did not survive it

It started as *make it work like [outbid.lol](https://outbid.lol)* — pick any amount, pay it
now, never get it back, and let money be your rank. The dev dropped that themselves on the
next look: *"oh ja shit, wij hebben geen ranglijst he…"*

That is the whole reason it does not transfer. outbid.lol is a **leaderboard with no clock**:
every bid buys a visible place, nothing is ever refunded, and the top price only ratchets up.
200 squares has **one banner, one day, one winner, and a hard close at 00:00 UTC**. A bid
that loses buys nothing here, so a permanent non-refundable bid would be money for nothing —
which `PRODUCT.md` will not carry.

⚠️ Two findings from that pass are worth keeping, because they will come back:

- **A paid bid would not remove the invoice.** The dev's original reason was *"dan hoeven we
  ook geen factuur of shit te sturen."* The card hold never made the paperwork; the payment
  does. A paid board owes one document **per bid** instead of one per winner. Whatever
  gamification is chosen, it must not quietly turn a losing bid into a sale.
- **Paying instead of holding would delete real weight** — the 24-hour authorization, the
  declined capture at the close, the outbid release. If tension is ever traded against those,
  that is the trade being made, and it should be made on purpose.

### What already exists, and is nearly invisible

This is the surprise: most of the contest is **already built and already live**. `AuctionDock`
renders, right now, on every board load:

- a live **countdown** to the close,
- the **top bid** in dollars,
- the **number of bids**,
- and the viewer's own standing — *You are top* / *You were outbid* / *Top bid*.

So the raw material is there. What is missing is not data. It is **loudness, motion and
memory**: the dock is one small magenta card at `bottom-6 left-8` on a desktop, it never
moves when the number changes, it hides completely while any panel is open, and it forgets
everything the moment a day closes.

⚠️ It is also the same card that [ticket 27](27-label-and-sellout.md) found lying over the
board's bottom-left corner. Anything that makes it bigger takes more of the board.

### The hard constraints, so nothing is designed around a wall

- ⚠️ **Nothing may be invented.** `PRODUCT.md` bans fabricated statistics, customers and
  proof. The prototype had a fake rival that outbid the visitor about 20 seconds in; ticket
  19 recorded that it *"goes away with the mock data"*. A fake rival, a fake bid count, a
  fake *someone is looking at this* — all of it is out. On a quiet day the tension has to be
  allowed to be zero.
- ⚠️ **A bidder may not be named.** The dock's own comment: *"A stranger must never be told
  they were outbid, because the site does not know who a stranger is."* Outbid state is shown
  only to a signed-in viewer, about themselves. A visible bid history with names or logos is
  a new privacy decision, not a styling change.
- ⚠️ **Live means reads, and reads are the bill.** [Ticket 02](02-ddos-and-the-bill.md) and
  the map's standing rule: the Convex project stays on **Free with no card**. A ticker that
  polls, or a per-visitor subscription that fires on every bid, converts the failure mode
  from *breaks* to *bills* — or to *stops*.
- ⚠️ **The board is one screen and it does not scroll.** Every pixel gamification takes is a
  pixel of canvas. Ticket 27 just deleted a line for being in the way.
- ⚠️ **The counter is the only public number on the site.** `content/counter.tsx` says so on
  purpose — it names no owner and exposes no square. A public bid feed would be the second.

### The dev's proposal: the last five bids are the prize

Added on 2026-08-26, and it is the first idea on this ticket that answers *what does a losing
bid buy*:

> **Show the last five bidders in the banner block — name, website and amount.** Then bidding
> itself is worth something. And ⚠️ **a bid cannot be withdrawn: once placed, it must be
> paid.**

This is good, and it is good for a reason worth naming: it does not invent tension, it
**sells** it. A loser stops being a loser. They bought a listed spot with a live link on the
one block everybody looks at, which is the same thing the 199 squares sell — attention and a
click. `PRODUCT.md` has nothing to object to, because nothing is fabricated.

It also quietly resolves what the outbid.lol pass could not: money for nothing becomes money
for something.

⚠️ **But it changes what a bid is, and that is not a styling change.** Read the two halves
together — *bidding has value* plus *once placed it must be paid* — and a bid stops being a
card hold that gets cancelled when you are outbid. It becomes a **purchase**, made at the
moment it is placed, by everybody who places one.

### What has to be settled before any of this is drawn

**1. Only the winner pays.** Settled by the dev on 2026-08-26: *"Nee alleen winnaar
betaalt."* So ticket 19's money path stands — a bid is a card hold, the top hold is captured
at the close, every other hold is cancelled. Nothing about the invoice, the VAT cases or the
consumer right of withdrawal changes. The outbid.lol economics are dead for good.

⚠️ **The listing is therefore a free gift to people who did not pay.** That is not an
objection — it is what makes bidding worth doing, and it costs the site nothing but pixels.
But it means the list must not be describable as a thing that was *bought*, anywhere in the
copy, or a losing bidder has a claim to it.

**2. ⚠️ The dev's real worry: a bid pulled just before the close.** *"het moet niet zo zijn
dat iemand biedt en vervolgens vlak voor de teller zijn bod intrekt als die aan het winnen
is."* Two things to check before designing anything against it:

- **There is no withdraw path in the build.** Nothing in `src/` or `convex/` cancels a
  bidder's own bid. `withdrawalWaived` is the Art. 6(1)(h) consumer field, not a button. So
  the exact move the dev fears may already be impossible **through the site**.
- ⚠️ **It is not impossible through the card.** A bid is a `capture_method: manual`
  PaymentIntent. A bidder who wants out can kill the hold outside the site — cancel the card,
  have the issuer drop the authorization — and the site finds out at 00:00 UTC when the
  capture is declined. Ticket 19 already built the answer to that: promote the next bid and
  capture it for its own amount, and if all fail the house ad takes the day. So the failure
  is handled; what is missing is a **consequence** for the bidder who caused it.
  [Ticket 11](11-house-rules.md)'s strike counter on the `owners` row is the existing shape
  for that, and `convex/admin.ts` already reasons in exactly these terms: *"this is the bidder
  breaking the contract rather than withdrawing from it."*
- **What the copy promises must match.** The button says *Place bid — obliges you to pay if
  you win*. If a standing bid is genuinely binding, nothing needs adding. If a strike is the
  answer, the bid panel has to say so before the bid, not after.

**4. ⚠️ A bidder gets named, and today nobody is.** The dock's own comment: *"A stranger must
never be told they were outbid, because the site does not know who a stranger is."* Publishing
name + website + amount reverses that for bidders. It is defensible — they are buying
publication, it is the point — but it needs the consent at the bid moment, a `/privacy`
change, and an answer for **what happens when a bidder wants off the list** after paying to be
on it. [Ticket 24](24-build-removal.md)'s removal path covers squares and banner days, not
bids.

**5. Five rows do not fit in the banner block.** `BANNER` is `5 × 5` of a `16 × 14` grid, so
it is under a third of the board's width. On a phone that is roughly 110 px across — name,
website and amount, five times over, is not readable at any size the board renders at 1x. The
board zooms to 4x, which is where it would be legible, and ticket 05 already fixed a
readability floor (`NUMBER_MIN_PX`) for exactly this kind of problem.

**6. ⚠️ The banner block is out. The dev killed it themselves**, on the same reasoning this
ticket raised: *"het blok moet juist niet gebruikt worden voor dit want daar staat een dag
lang iemand's afbeelding."* The winner paid for that space for a day and the artwork is what
they bought. So **the list needs a home that costs the winner nothing**, and that is now the
open design question on this ticket.

What exists to put it in, and what each one costs:

- **The auction dock.** Already the auction's home, already live on every board load, already
  showing the countdown, the top bid and the bid count. It is the only surface **everybody**
  sees. But it is one small card at `bottom-6 left-8`, it already lies over the board's
  bottom-left corner ([ticket 27](27-label-and-sellout.md)), and five rows of name + website +
  amount turns it into a panel.
- **The bid panel.** Free space, no board cost, and it already carries the countdown and the
  bidder's own state. But it opens only for someone who pressed BID — which is the wrong
  audience. ⚠️ **A bidder is buying attention from visitors, not from rivals.** A list only
  other bidders see is worth much less than the idea sounds.
- **A click on the banner.** `src/components/canvas/canvas.tsx:176` already opens the bid flow
  when a visitor clicks the banner — but only `if (!bannerToday)`, so the door is shut exactly
  when somebody holds it. That shut door is free canvas and it is where curiosity already
  goes. ⚠️ But an occupied banner's click belongs to the winner's website; one click cannot do
  both.
- **A page of its own**, or a strip on `/how-it-works`. Costs the board nothing and is the
  only option with room for real history. But nobody is on it, so it advertises least.

⚠️ The trade to name out loud: **the more the list is seen, the more board it takes.** There
is no placement that is both loud and free.

**7. The list is a second click surface.** The site counts clicks to owners' websites
([ticket 21](21-build-clicks.md)) and prints one public total. Five live links on the banner
are clicks that belong to somebody who does not own a square. They either enter that number
or they need their own.

**8. What stops a cheap bid buying the spot forever?** The floor is $100 and the raise is $10.
Under B, five bidders at $100 fill the list and nothing forces them off until someone else
bids. *Last five* is a moving window, so it self-clears under traffic and sticks on a quiet
day — which may be fine, or may be the whole list on a quiet week.

### The questions

- **What is the unit of tension?** The countdown, the price climbing, the rival, or the
  moment of winning. They pull in different directions: a countdown is tense for everybody
  and costs nothing; a climbing price is only tense if you are in it; a rival cannot be shown
  without either naming somebody or inventing them.
- **Does anything survive the close?** Today the day closes and the board forgets. A visible
  history — *what yesterday went for* — is the cheapest real drama on the site, because it is
  true, it is already stored in `bannerDays`, and it needs no live connection. Decide whether
  that is a strip, a page, or nothing.
- **What does the loser see?** The dev's answer is *their name on the board*. Right now it is
  a mail, and a dock that has stopped saying *You were outbid* by tomorrow.
- **What happens in the last minutes?** A hard close at 00:00 UTC with a $10 minimum raise
  invites a snipe. That is either the best part of the game or the thing that makes it
  unfair, and the answer changes whether the close stays hard. ⚠️ Ticket 07 chose **hard, no
  extension window**, because the whole site says 00:00 UTC. Reopening that reopens the cron,
  the capture order and the copy.
- **Does the banner square itself do anything?** It is the one block on the board that changes
  daily and it currently just shows artwork. It could carry the state of its own auction.
- **How far is too far?** The site's voice is flat and the board is deliberately muted — one
  magenta card on a grey sheet. Confetti, streaks, badges and *3 people are bidding* belong
  to a different product. Say where the line is **before** building, because this is the one
  ticket on the map where the failure mode is not a bug, it is the site becoming tacky.
- **V1.0 or V1.1?** [Ticket 25](25-launch.md) is waiting and ticket 19 is shipped. A tension
  pass that only restyles what is already rendered is small. One that adds history, a feed or
  a soft close is not.

## Context

- Raised by the dev on 2026-08-26, straight after ticket 27 was resolved, from an outbid.lol
  screenshot. Rewritten the same day when the dev spotted that this site has no leaderboard,
  and again when they proposed the last-five list.
- Nothing is claimed and nothing is built.
- The mechanism this sits on top of is [ticket 19](19-build-auction.md), resolved and live:
  bidding opens at $100, the minimum raise is $10, the top hold is captured first and every
  other hold is cancelled only after that capture succeeds, and with nothing standing the
  house ad takes the day.
