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

### The questions

- **What is the unit of tension?** The countdown, the price climbing, the rival, or the
  moment of winning. They pull in different directions: a countdown is tense for everybody
  and costs nothing; a climbing price is only tense if you are in it; a rival cannot be shown
  without either naming somebody or inventing them.
- **Does anything survive the close?** Today the day closes and the board forgets. A visible
  history — *what yesterday went for* — is the cheapest real drama on the site, because it is
  true, it is already stored in `bannerDays`, and it needs no live connection. Decide whether
  that is a strip, a page, or nothing.
- **What does the loser see?** Right now: a mail, and a dock that has stopped saying *You
  were outbid* by tomorrow. This is the moment with the most feeling in it and the least
  design.
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
  screenshot. Rewritten the same day when the dev spotted that this site has no leaderboard.
- Nothing is claimed and nothing is built.
- The mechanism this sits on top of is [ticket 19](19-build-auction.md), resolved and live:
  bidding opens at $100, the minimum raise is $10, the top hold is captured first and every
  other hold is cancelled only after that capture succeeds, and with nothing standing the
  house ad takes the day.
