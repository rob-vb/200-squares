# 27 — The resale label, and the day the board sells out

Type: prototype
Status: resolved
Blocked by: 12, 26 (26 done 2026-08-25 — this is now on the frontier)
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

## Answer

Answered by the dev on 2026-08-26, at the prototype, in three parts.

### The label is dropped

**There is no resale label.** The dev looked at all three placements — beside the links, right
of the session, a strip of its own — and took none of them. *"Laten we de label maar niet
doen."*

The two ⚠️ risks recorded in the question above are therefore **retired, not carried**: the
site now makes no promise about resale anywhere. `/terms` says only the state of today
([ticket 26](26-strip-resale.md)) and the top bar says nothing. Whatever V1.1 does with
resale, it starts from silence and owes nobody a thing. That is the cheap position and it was
reached by looking, which is what a `prototype` ticket is for.

The prototype found the reason before the dev did: on a phone A and B are not there at all
(`hidden xl:inline` / `hidden lg:inline` — the top bar has no room beside the logo and
`Sign in`), so only a full-width strip reaches the one screen most visitors use, and a strip
costs canvas height on a board that is deliberately one screen that does not scroll. A
promise that cannot be placed is a promise not worth the risk of making.

### The drag legend is gone

The line under the canvas — *"Drag to select up to 4 × 4 · $250 per square"* — is removed
from `src/components/board-screen.tsx`. The dev's call, on sight: *"fuck de legenda, weg
ermee."*

It was already barely a legend. `hidden … lg:block` kept it off every phone and tablet, and
`AuctionDock` sits at `bottom-6 left-8` on a desktop — over the corner where it lived. So the
one reader it could reach rarely saw it. On the day the board sells out it would also have
been an instruction for a thing that can no longer be done, which is how it entered this
ticket.

`TitleBlock` stays. Its own comment calls itself the legend too, and it is the one that
carries live state (Taken, Pending, and on a desktop Sheet, Squares, Rate).

⚠️ **Two things the board no longer says**, accepted by the dev with the removal:
- Nothing tells a first visitor that the board is drag-to-select.
- On a phone the price is nowhere on the board screen — `Rate · $250` is `hidden lg:block`.

### The day it sells out: nothing happens

**Silence is the answer.** *"bord vol gebeurt niets ook prima."* No sold-out branch is added
to the board, the panel or the dock. A drag on a full board selects nothing, so no panel
opens, and nothing explains why.

The counter needed no change: `src/components/content/counter.tsx` already reads *"Every
square is taken. The banner is still auctioned every day."* — true on the day and true after
ticket 26, which is what the question asked for. The `SOLD OUT · 199 / 199 SQUARES TAKEN`
headline stands.

The banner keeps running. That remains the one thing a sold-out board still has.

## Context

- The three variants, the switcher and the sold-out screen live on the throwaway branch
  `prototype/27-label-and-sellout` (tip `076f539`). They are off `staging`; nothing of the
  prototype ships.
- `convex/seed.ts` keeps `seed:soldout`, which fills every free square so the sold-out board
  can be looked at. It is `guard()`-ed like the rest of that file, so it does not exist on
  production. `npx convex run seed:full` puts the board back.
- ⚠️ `seed:full` wipes the `owners` table. Any adopted address needs
  `npx convex run seed:adopt '{"email":"…"}'` again before *My squares* has anything in it.
