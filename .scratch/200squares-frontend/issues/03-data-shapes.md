# 03 — Data shapes and the two mock datasets

Type: grilling
Status: resolved
Blocked by: —
Parent: ../map.md

## Question

What are the types the prototype runs on, and what mock data fills them?

To settle:
- The shape of a Square, a Block (a bought rectangle of squares), the Banner, a Bid, and a mock User. What identifies a block, and how does a block map onto its squares?
- Where the `available` / `pending` / `taken` state lives — on the square or on the block.
- How the auction day is modelled: today's bidding window, tomorrow's slot, the 00:00 UTC boundary, and how a countdown is derived from it.
- Two switchable datasets: "early day" (~10 squares taken, banner unsold) and "full" (~70% taken, banner won, several past winners).
- How the switch works (query param, dev toggle) so it survives into the real prototype.

Update `CONTEXT.md` with the settled vocabulary.
## Comments

**2026-08-23 — grilled in three rounds, all agreed**

Seventeen questions over three rounds: the model, the time model, mutability, file layout, dataset
content, owner identity, and the sign-in start state. The dev agreed with every recommendation.
One correction was made mid-session, on bid timestamps — see the answer.

Nothing was prototyped. The two prototypes already written (`proto-01`, `proto-02`) each carry a
throwaway mock file that says "ticket 03 decides the real one". This ticket decides it, and the
proven parts of `proto-02`'s `grid.ts` are carried over rather than rewritten.

## Answer

The prototype runs on **blocks, not squares**. Everything a square knows is derived from the
blocks that cover it. The dataset holds **no absolute dates**, and it is only a starting value: a
reducer holds the live state from there.

### The types

Live at `src/lib/board/types.ts`. Ticket 08 writes them; this is the shape they take.

```ts
type Rect = { r: number; c: number; w: number; h: number }; // zero-based, row 0 at the top

type Artwork =
  | { kind: "mock"; bg: string; fg: string; label: string }
  | { kind: "image"; src: string };

type Owner = { id: string; name: string; url: string };

type Block = {
  id: string;            // opaque, e.g. "blk_07". Position is not the identity.
  rect: Rect;            // at most 4 wide and 4 high
  ownerId: string;
  artwork: Artwork | null;   // null means pending — paid for, artwork not supplied
};

type BannerDay = {
  dayOffset: number;     // 0 or less: the banner that ran that day
  ownerId: string;
  artwork: Artwork;
  wonWith: number;       // the winning bid, USD
};

type Bid = {
  id: string;
  dayOffset: number;     // the banner day bid for — always 1 in a dataset
  amount: number;
  bidderId: string;
  minutesBeforeClose: number;
};

type Dataset = {
  name: "early" | "full";
  owners: Owner[];
  blocks: Block[];
  bannerDays: BannerDay[];   // dayOffset <= 0
  bids: Bid[];               // dayOffset === 1
  viewerId: string;          // which owner the mock sign-in becomes
};
```

### Why it is shaped this way

**A block is the only record. A square is a lookup.** There is no list of 199 squares and no
`state` field anywhere. The state grid is derived once from banner + blocks:

- a cell inside the banner rect is `banner`
- a cell inside a block is `taken` if that block has artwork, `pending` if it does not
- everything else is `available`

Written the other way — a state on each square *and* a list of blocks — the two can disagree, and
the first bug is a half-pending block. Here that cannot be expressed. `pending` is not a separate
list either: it is `artwork === null` on a block that otherwise looks exactly like a taken one,
which is exactly what it is in the world.

**The banner is not a block.** It is a fixed slot with a daily occupant, so it gets its own type.
A block is bought once and never moves; a banner changes owner every day. Putting both in one type
would mean a flag that changes what half the fields mean. The banner rect is a constant, not data.
A square never belongs to the banner: the 199 numbers skip those 25 cells.

**Owners exist once.** A block and a `BannerDay` carry only an `ownerId`. The name and the URL come
from the owners list. An owner with two blocks is one owner, so "My squares" is a filter on
`ownerId` and nothing else. It also means a past banner winner and a square owner can be the same
party, which is the case worth showing off.

**Artwork is one union with two shapes.** Mock artwork is colour plus a label, which is what
`proto-01` used and what proved the whole direction: it survives every block size from 1 x 1 to
4 x 4, and it makes owner colour the only colour on the canvas. An upload produces
`{ kind: "image", src }` with an object URL. The renderer handles one type, so an uploaded block and
a dataset block are the same thing on screen.

### Time: no absolute dates, ever

The countdown must run for real, and the datasets must still be true in a month. So the dataset
never writes a date. Everything is an offset from the next 00:00 UTC boundary, resolved at render.

| `dayOffset` | What it is |
| --- | --- |
| `1` | the banner being bid on right now. Bidding closes at the next 00:00 UTC |
| `0` | the banner on the canvas today |
| `-1`, `-2`, … | yesterday and back — the strip of past winners |

The close is the next 00:00 UTC. That moment turns `1` into `0` and pushes everything down one.
A bid stores `minutesBeforeClose`, not a timestamp, so "2 hours ago" stays true forever.

*Correction made during the session:* the first pass gave `Bid` an absolute `at` field. That
contradicts the no-absolute-dates rule and would have rotted the bid history within a day.

If a dataset has no `BannerDay` with `dayOffset: 0`, nobody won yesterday and the banner shows the
house ad. That is how `early` gets its house ad — by omission, not by a flag.

### The dataset is a seed, not the state

The canvas has to change while you use it: a fake checkout must put the block on the board, a bid
must move the top bid. So one React context with a reducer holds the live state, seeded from the
dataset. No state library — the state is one object and the actions are few.

Actions, roughly: `signIn`, `signOut`, `buy`, `uploadArtwork`, `editLink`, `placeBid`.

A refresh resets everything to the dataset. That is deliberate: the preview is a demo, and every
visitor should get the same board.

**The upload is optional in the checkout.** With an image, the new block is `taken` at once.
Without one, it is `pending`, and "My squares" then offers "Upload image". Both paths therefore
exist for real, and `pending` is not just scenery in the dataset. Whether buying requires sign-in
is ticket 06's call.

### Auction numbers

- Floor: **$100**.
- Minimum next bid: **top bid + $10**.
- The top bid is derived — `max(amount)` over the bids for `dayOffset: 1` — never stored. Being
  outbid is just a higher bid arriving, not a state.

**The $10 increment is a prototype value, not a product decision.** `PRODUCT.md` lists the real
increment and the anti-snipe rules as undecided and not to be invented. This is a number the
screen needs in order to exist, and it stays in "Not yet specified" on the map.

### Where it lives

```
src/lib/board/
  types.ts        the types above
  geometry.ts     rect helpers, the 1..199 numbering, the 4 x 4 clamp, blocked-selection test
  state.ts        the reducer and its context
  datasets/
    early.ts
    full.ts
```

Not under `src/app/` — it is not a route. `geometry.ts` takes over the proven functions from
`proto-02`'s `grid.ts` (`rectFrom`, `selectionBlocked`, the number grid, `isBanner`) rather than
rewriting them; only the data source changes.

### The two datasets

Both are written by hand, with colours from one fixed list. The spread of blocks over the canvas is
a design choice — a generator would give an even scatter, and an even scatter is the one thing a
real board never looks like.

| | `early` | `full` |
| --- | --- | --- |
| Squares taken | 10, in 4 blocks | ~139 (70%), in ~45 blocks |
| Pending blocks | 1 | 2 |
| Block sizes | small, clustered near the banner | every size, 1 x 1 to 4 x 4 |
| Banner today | unsold — house ad | won |
| Past winners | 0 | 6, at `dayOffset` -1 to -6 |
| Bids on tomorrow | 0 | 14 |
| The viewer owns | 1 block | 2 blocks, one of them pending, plus a bid that is not the top one |

The viewer's bid in `full` sits below the top bid on purpose, so the outbid state is visible without
having to do anything.

### The switch

`?data=early` on any route. Anything else, including nothing, gives `full`. A URL is then shareable
and opens the right board on the phone. There is no switch in the product UI: the datasets are a
development tool and the visitor must never see two versions of the truth.

Default is `full`, because a stranger opening the preview has to feel a board that is filling up.
`early` exists to check that the canvas is not ugly when it is nearly empty.

### Vocabulary

`CONTEXT.md` gains Artwork, Banner day, Dataset and Viewer, and Owner and Bid are sharpened.

## Correction — 2026-08-24, from building ticket 08

`Bid.minutesBeforeClose` is wrong and is now `minutesAgo`.

A bid stored as minutes before the 00:00 UTC close sits in the **future** whenever
the real clock is earlier in the day than the stored offset. A dataset written with
a bid at "95 minutes before close" has not happened yet at 04:00 UTC.

Measured from now, a bid is always in the past, whatever the clock says. The
no-absolute-dates rule is unchanged — `minutesAgo` is still a pure offset.
