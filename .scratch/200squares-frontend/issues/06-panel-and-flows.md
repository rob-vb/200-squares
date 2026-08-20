# 06 — Detail panel and the flows

Type: grilling
Status: open
Blocked by: 03, 05
Parent: ../map.md

## Question

What exactly happens in the panel (right side on desktop, bottom sheet on mobile) for each flow?

- **Buy**: from selecting a rectangle to "3 x 2 · $600", then the fake checkout (company name, website URL, image upload with live preview on the canvas), then confirmation. What does the user see on the canvas while the panel is open?
- **Bid**: opened from the top bar. Countdown to 00:00 UTC, current top bid, minimum next bid, bid field, confirmation. What does the panel show right after the user becomes top bidder, and what if they get outbid.
- **Sign in**: fake session. What changes on screen once signed in.
- **My squares**: own blocks with "Upload image" and "Edit link", plus bid history.
- Empty and error states: no selection, selection touching taken squares, upload too large or wrong shape.
