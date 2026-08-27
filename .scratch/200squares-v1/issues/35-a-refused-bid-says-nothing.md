# 35 — A refused bid says nothing where the bidder is looking

Type: task
Status: resolved
Blocked by: —
Assignee: rob-vb (claimed 2026-08-26)
Parent: ../map.md

## Question

[Ticket 28](28-prove-the-mail.md) bid $150 against a $200 top bid on staging. The bid was
refused, correctly. The panel showed **nothing at all**: `t28-low-2b-refused.png` is the
screenshot, and the only thing on it is the button, pressed, and the same form.

The message exists. `src/components/panel/bid-flow.tsx:257` hands it to the **amount
field**, at the top of the panel; the *PLACE BID — OBLIGES YOU TO PAY IF YOU WIN* button is
at the bottom of a panel that scrolls inside itself. A bidder who fills the form, scrolls
down and presses is looking at the button. The message is above the fold, and nothing
scrolls them to it.

Two things make it worse than a misplaced label:

- The button is **not disabled** below the minimum, so pressing it is the expected act.
- The button's own words promise a commitment. Pressing something that says *obliges you to
  pay if you win* and getting silence reads as *it worked*, not as *it was refused*.

⚠️ Compare `/admin`: `StripForm` puts its error directly under its own button
([ticket 24](24-build-removal.md)). The bid panel is the money path and does the opposite.

### The fix

Nothing to decide about *whether*. The choice is which, and it is one line of judgement:

1. **Scroll the field into view** when `setError` fires. Smallest, keeps one error site.
2. **Repeat the error under the button.** Two sites for one message.
3. **Disable the button** below the minimum. Refuses the press instead of explaining it —
   and the same refusal path also carries *whole dollars*, *the auction closed* and *you
   are already the top bid*, which a disabled button cannot say.

(1) is the one to take unless the dev says otherwise: (3) does not cover the other refusals
and (2) says the same thing twice.

⚠️ Check the **bottom sheet** as well as the side panel. The map's note on
[ticket 20](20-build-artwork.md) says the panel is in the DOM twice, and the phone is where
a scrolling panel hides its own top most easily.


---

## Resolved — 2026-08-26

**The dev took (1): scroll the field into view.** (2) says the same thing twice and (3)
does not cover the other refusals.

### One helper, so no refusal can be silent again

`src/components/panel/bid-flow.tsx` gains `fail(message)` beside `place()`. It sets the
error and then, **after paint**, scrolls the amount field into view:

```ts
const fail = (message: string) => {
  setError(message);
  requestAnimationFrame(() => {
    amountRef.current?.scrollIntoView({
      block: "center",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  });
};
```

`requestAnimationFrame` is not decoration: the error line is rendered *below* the input and
is part of what has to come into view, so measuring before the commit scrolls to the wrong
box. Reduced motion gets an instant jump — the repo already honours it for `.panel-slide`
and `.sheet-rise` in `globals.css:124`.

All three amount refusals now go through it, and this is the point of a helper rather than
three call sites: **below the minimum** (`:159`), **somebody bid while you were typing**
(`:181`, the server's `reason === "low"`) and **bids are in whole dollars** (`:189`).

The ref hangs on a `<div>` wrapping the whole `Field`, not on the `<input>`, so the label,
the box and the error all arrive together.

### What was already right, and was left alone

`notice` — the Turnstile failures, *you already have a bid waiting*, *nothing is held on
your card* — **already renders directly above the button** (`:385`). Only the amount error
was stranded. Nothing about the `notice` path changed.

### The button stays live below the minimum

Deliberate, and it is option (3) refused rather than forgotten. A disabled button cannot
say *somebody bid while you were typing*, cannot say *whole dollars*, and cannot say *the
auction closed* — and those arrive only after a press. A press that explains itself beats a
press that is not allowed.

### scripts/bid.mjs, three fixes it needed to prove any of this

- **`PHONE=1`** runs the same bid at 390 x 844, in the bottom sheet.
- **Every selector is scoped to the visible panel.** ⚠️ This was a real bug, not tidying.
  The panel is in the DOM twice and `PanelSide` comes **first** in the tree
  (`board-screen.tsx:26` before `:44`), so at phone width `page.locator('input[inputmode=
  "numeric"]').first()` reaches into the copy that is `display:none`. The script could
  never have tested the sheet before this.
- **`${out}-2c-panel.png`**, an element screenshot of the panel on a refusal. `fullPage`
  scrolls the *page*; the panel scrolls **inside itself**, so a page shot cannot say what
  the bidder is looking at — which is the whole of this ticket. That is why ticket 28's
  `t28-low-2b-refused.png` showed a form and no reason.

### Proved on staging, 2026-08-26

Against a standing **$200** top bid, so the floor was **$210**.

- `node scripts/bid.mjs t35-desk@example.com 1 t35-desk` — refused, and
  `t35-desk-2c-panel.png` is the panel afterwards: *The next bid is at least $210.* under
  the field, in view. Playwright had scrolled to the bottom to tick the box and press.
- `PHONE=1 node scripts/bid.mjs t35-phone@example.com 1 t35-phone` — same, in the bottom
  sheet: `t35-phone-2c-panel.png`.
- `node scripts/bid.mjs t35-real@example.com 210 t35-real` — a **real** bid still goes
  through with the scoped selectors: Stripe held $210 and `/bid` says *You are the top bid*
  for 2026-08-27. This run is the check on the selector change, not on the fix.

### Two honest limits

- **The server `low` path was not driven end to end.** Reaching it needs the floor to move
  *between* the page load and the press, which is a race and not a script. It is the same
  `fail()` call as the two that were driven, one line apart.
- **A $210 test-mode hold now stands on staging** for the 2026-08-27 banner, from
  `t35-real@example.com`. It releases at the close like any other.

### Nothing was added to the map

No fog cleared and no fog gathered. The fix is inside one component and touches no copy,
no schema and no route. `/terms` and `/privacy` owe nothing new.
