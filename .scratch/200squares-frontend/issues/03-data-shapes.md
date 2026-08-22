# 03 — Data shapes and the two mock datasets

Type: grilling
Status: claimed
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
