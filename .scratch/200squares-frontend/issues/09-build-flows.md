# 09 — Build: flows and fake sign-in

Type: task
Status: resolved
Assignee: rob-vb (claimed by agent session)
Blocked by: 06, 08
Parent: ../map.md

## Question

Build the flows from ticket 06 on top of the canvas: the detail panel and bottom sheet, buy with fake checkout and client-side image preview, the auction panel with the live countdown to 00:00 UTC, fake sign-in, and My squares.

Done when a stranger can open the preview on a phone and understand the whole idea without being told.

## Added by ticket 06

Ticket 06 resolved the spec — read its Resolution section before starting. Two things it added to this ticket's scope:

- **The desktop layout changes.** The panel column is permanently reserved from **1280px** up, not at the current `lg` (1024px) breakpoint, and the legend (`TitleBlock`) moves into that column with the auction dock underneath. Below 1280px everything is the bottom sheet. This is what keeps the canvas from ever resizing.
- **The closed-column state is a real screen**, desktop only: "Drag to select up to 4 × 4 · $100 per square" plus the legend.

The reducer gains `buy`, `uploadArtwork`, `editLink` and `placeBid`, plus the single fake rival bid that fires ~20s after the visitor bids.

## Answer

**2026-08-24 — the flows are on `main`.**

Built on branch `ticket-09-flows`, merged to `main`.
Preview: https://200-squares-git-ticket-09-flows-robs-projects-52973834.vercel.app
Early board: same URL with `?data=early`.

### What landed

```
src/components/panel/
  flow.tsx        ScreenProvider: which flow is open, the selection, the preview,
                  the highlight. One flow at a time, no stack.
  panel.tsx       the one surface in two placements: PanelSide and PanelSheet
  buy-flow.tsx    the one-screen checkout and the confirmation after it
  bid-flow.tsx    no bids / you are top / outbid
  my-squares.tsx  the viewer's blocks, upload, edit link, bid history
  controls.tsx    the shared field, button and header parts
src/lib/board/state.tsx   buy, uploadArtwork, editLink, placeBid, signIn, signOut,
                          and the single fake rival on a timer
```

The reducer carries the flows, so the board really changes: buying turns squares
`pending` or `taken`, uploading artwork paints the block, and a bid moves the dock.
Buying and bidding both make the visitor the viewer-owner, because neither needs a
sign-in and the top bar has to know who is on screen. The rival is scheduled in the
provider and not in the panel, so being outbid lands whether the panel is open or not.

### One correction to ticket 06, found by building

**The reserved panel column is gone.** Ticket 06 asked for a column permanently
held open from 1280px up, with the legend inside it. Built, it is a permanent
second thing to look at beside the product. The panel now slides in over the right
of the canvas area when a flow opens and leaves when the flow closes.

The reason for the reserved column still holds, and is still honoured: **the board
never resizes**. The fit size is measured against the whole box, and only the
centring uses the width the panel leaves free — so the board slides sideways to
make room instead of shrinking. The legend and the how-to-buy line stay under the
canvas, where ticket 08 put them, and the auction dock keeps the corner ticket 01
gave it and steps aside while a flow is open.

1280px survives as the breakpoint (`PANEL_MEDIA`): side panel above it, bottom
sheet below.

### One correction to ticket 03

**The link belongs to the block, not to the owner.** Ticket 03 hung the URL on
`Owner`, so every block one party held opened the same page. An owner can hold a
campaign block and a jobs block. The link moved onto `Block`, and onto `BannerDay`
for the banner; `Owner` keeps only a name. My squares edits the link per block.

### Decisions taken while building

- **A blocked selection does not open the panel**, as ticket 06 said — and clearing
  the selection closes the buy flow. Opening another flow drops the selection, so
  the canvas never keeps a lit rectangle whose flow has gone.
- **The panel waits for the pointer to lift.** A panel arriving mid-drag would move
  the board under the hand still drawing on it.
- **`user-select: none` on the canvas box only.** Without it a drag ran a text
  selection over the printed square numbers and left the board smeared blue. The
  panel is a sibling of that box, so its inputs stay selectable.
- **The cursor answers the pointer's question**: crosshair on an available square,
  pointer on a block and on the banner, plain arrow on a `pending` block, which is
  paid for but has nowhere to send anybody.
- **The unsold banner opens the bid flow.** It was the one dead end on the board:
  it asks for a bid, so clicking it now asks for one.
- Upload limit is 2 MB with a real error state, in both the buy flow and My squares.
  Aspect ratio is left to `object-fit: cover`.

### Deliberately not built

- The `142 SQUARES LEFT` counter and everything under the canvas — that is ticket 10.
- Any change to `TitleBlock`'s `Available` field — also ticket 10.
