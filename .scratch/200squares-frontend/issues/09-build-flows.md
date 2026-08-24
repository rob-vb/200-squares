# 09 — Build: flows and fake sign-in

Type: task
Status: open
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
