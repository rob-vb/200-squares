# 27 — The resale label, and the day the board sells out

Type: prototype
Status: open
Blocked by: 12, 26
Parent: ../map.md

## Question

Two things that are one sentence at two moments, so they are one ticket. This graduates
the map's fog *"What the board does the day it sells out"*, which
[ticket 12](12-resale-for-real.md) collided with.

### The label

A small line in the **top bar**. The dev chose the placement: the board is deliberately one
screen that does not scroll, and `board-screen.tsx` records that things were moved out of
it on purpose — *"two counters within one screen of each other is one too many"*. So it
does not eat canvas height and it does not join the legend.

**Few words. Small.** The wording is the hard one, chosen over a softer one:

> When all 199 squares are sold, owners will be able to sell theirs on.

Find the shortest true form of that for a top bar. This is a `prototype` ticket because
the right answer is a thing to look at, not a thing to argue about.

⚠️ **The risk, recorded with the decision.** This is a promise, and its trigger is an event
the dev does not control. Ticket 01 called resale *"in risk, law and work the heaviest
thing on the map"*. If the board fills and resale is not ready, every owner has a claim.
The dev was told twice — once about the promise, once about the fact that keeping it out of
`/terms` does **not** insulate it, because a material statement made before a purchase
binds wherever it appears — and chose the hard wording both times. It is their call and it
is theirs on the record.

⚠️ It also reframes the product. *Buy now, sell later* turns $250 of advertising space into
something that reads as a tradable asset, which is a different thing from what the site
sells. `PRODUCT.md` bans overselling. Keep the words as flat as the rest of the site's
voice: a fact about a plan, not a pitch.

**`/terms` does not carry it.** It says only the state of today
([ticket 26](26-strip-resale.md)).

### The day it sells out

The same sentence, arrived at. Prototype ticket 13 made sell-out point at the market;
there is no market. Decide what the board, the counter and the panel do when `available`
reaches zero and the label's condition is met.

`content/counter.tsx` already has a sold-out branch — *"Owners sell theirs on, and the
banner is auctioned every day"* — which becomes false with ticket 26 and then true again
in V1.1. Whatever it says on the day must be true on the day.

The banner keeps running either way. That is the one thing a sold-out board still has.
