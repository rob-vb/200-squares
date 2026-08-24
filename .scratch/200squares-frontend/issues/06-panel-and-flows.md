# 06 — Detail panel and the flows

Type: grilling
Status: closed
Assignee: rob-vb (claimed by agent session)
Blocked by: 03, 05
Parent: ../map.md

## Question

What exactly happens in the panel (right side on desktop, bottom sheet on mobile) for each flow?

- **Buy**: from selecting a rectangle to "3 x 2 · $600", then the fake checkout (company name, website URL, image upload with live preview on the canvas), then confirmation. What does the user see on the canvas while the panel is open?
- **Bid**: opened from the top bar. Countdown to 00:00 UTC, current top bid, minimum next bid, bid field, confirmation. What does the panel show right after the user becomes top bidder, and what if they get outbid.
- **Sign in**: fake session. What changes on screen once signed in.
- **My squares**: own blocks with "Upload image" and "Edit link", plus bid history.
- Empty and error states: no selection, selection touching taken squares, upload too large or wrong shape.

---

## Resolution (2026-08-24)

The panel is **one surface, one flow at a time**, and the canvas never changes size because of it.

### Geometry

- Desktop (**≥ 1280px**): the panel column is **permanently reserved**, open or closed. Opening it moves nothing. Below 1280px it is the bottom sheet, same as the phone — the `lg` breakpoint the build uses today is too low, because at 1024px the canvas becomes width-bound and visibly shrinks.
- The column is not dead space when closed: the legend (`TitleBlock`) moves into it and the auction dock sits underneath. This changes the desktop layout ticket 08 shipped.
- Nothing overlays the canvas, and nothing ever covers the banner.

### Panel occupancy

- One flow at a time; a new flow replaces the old one. No stack, no back button.
- Escape or the X closes it. Clearing the selection closes the buy flow.
- A **blocked selection does not open the panel**. The red chip on the canvas already says it, at the place where the problem is.

### Closed state (desktop only)

Short instruction plus the legend: *"Drag to select up to 4 × 4 · $100 per square"*. It is the only permanent explanation of how to buy. The phone has no closed state — the chip on the canvas carries it.

### Buy

- **No sign-in required.** A stranger on a phone completes the whole flow. The purchase makes them the viewer-owner.
- **One screen**, not a wizard: size + price + company name + website URL + upload + one button. The selection was already confirmed by the chip.
- **Artwork is optional.** "Add artwork later" completes the purchase and the block becomes `pending`. If the flow could never produce `pending`, the board would not be honest about a state it renders.
- **Live preview on the canvas**: choosing a file fills the selected rectangle on the canvas immediately, before confirming. This is the moment the idea lands. `Artwork` already has the `image` variant.
- **While the panel is open the canvas does nothing special** — the selection stays lit, the rest stays normal. No dimming (that turns the canvas into a modal backdrop) and no auto-zoom (that takes back the control ticket 02 gave the user).
- **Upload rule**: max 2 MB, with a real error state. That is the only rule enforced. Aspect ratio is handled by `object-fit: cover`, not by a warning — artwork requirements are still unspecified on the map.
- **After confirming**: selection clears, the block appears on the canvas, and the panel shows a short confirmation naming the squares ("Your block is live. Square 84–89."). Without artwork it reads "Add your artwork" and links to My squares. The panel stays open until the visitor clicks elsewhere.

### Bid

- Opened from the BID button on the auction dock.
- Minimum next bid stays **top bid + $10**, floor $100 — the prototype placeholder from ticket 03, kept deliberately, because the real auction rules are still unspecified.
- Three states: **no bids yet** ("From $100"); **you are the top bidder** (confirmation plus the countdown to 00:00 UTC); **outbid**.
- A **single fake rival** outbids the visitor roughly 20 seconds after their bid, once. It is the only way a prototype can show the tension of an auction. The dock reacts and the panel asks for a higher bid, with the field pre-filled to the new minimum.

### Sign in

Stays a one-click toggle in the top bar. No fake form: it adds nothing to the idea being sold. The bar already swaps to the owner's name and square count.

### My squares

- Entered by clicking the "name · N squares" text already in the top bar.
- Contents: the viewer's blocks (size, price, state) with any `pending` block first and carrying "Upload image"; "Edit link" on each; the viewer's bid history underneath.
- Clicking a block in the list highlights it on the canvas.

### Consequences for other tickets

- **09** builds all of this, and also carries the desktop layout change (1280px breakpoint, legend into the column).
- The reducer gains `buy`, `uploadArtwork`, `editLink` and `placeBid`, as `state.tsx` already anticipates.
