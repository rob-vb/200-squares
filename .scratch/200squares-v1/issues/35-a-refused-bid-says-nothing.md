# 35 — A refused bid says nothing where the bidder is looking

Type: task
Status: open
Blocked by: —
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
