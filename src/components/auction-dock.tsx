"use client";

// The auction, docked over the sheet margin instead of living in the top bar.
// This is where all the loudness is spent: one magenta card on a muted board.
// On a phone it becomes the full-width strip pinned to the bottom.
//
// The BID button opens the bid flow in the panel, and the dock steps aside while
// any flow is open: one thing at a time. On a phone the sheet takes the bottom of
// the screen anyway, and on a wide screen the board slides left into the corner
// the dock was standing in. Nothing is lost — the bid flow carries the countdown
// itself, and the other flows are not about the auction.

import { Countdown } from "./countdown";
import { useScreen } from "./panel/flow";
import { useBoard } from "@/lib/board/board";
import { useViewer } from "@/lib/board/viewer";
import { usd } from "@/lib/board/time";

export function AuctionDock() {
  const { auction } = useBoard();
  const { viewer } = useViewer();
  const { openBid, panelOpen } = useScreen();
  const bids = auction?.bids ?? [];
  const topCents = auction?.topCents ?? null;
  // ⚠️ Only *theirs* once they are signed in. A stranger must never be told they
  // were outbid, because the site does not know who a stranger is.
  const top = bids.reduce<(typeof bids)[number] | null>(
    (best, b) => (!best || b.amountCents > best.amountCents ? b : best),
    null,
  );
  const viewerIsTopBidder = !!viewer && top?.ownerId === viewer.id;
  const viewerOutbid =
    !!viewer && !viewerIsTopBidder && bids.some((b) => b.ownerId === viewer.id);

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-40 lg:inset-x-auto lg:bottom-6 lg:left-8 ${
        panelOpen ? "hidden" : ""
      }`}
    >
      <div
        className="bg-accent pointer-events-auto flex items-center gap-5 px-4 py-3 text-white"
        style={{ boxShadow: "var(--shadow-dock)" }}
      >
        <div>
          <div className="text-[13px] font-medium">Tomorrow&rsquo;s banner closes</div>
          <Countdown className="font-display text-[30px] leading-none" />
        </div>

        <div className="text-[13px] leading-tight font-medium">
          {topCents !== null ? (
            <>
              {viewerIsTopBidder ? "You are top" : viewerOutbid ? "You were outbid" : "Top bid"} ·{" "}
              {bids.length} bids
              <br />
              <span className="font-display text-[22px] leading-none" data-numeric>
                {usd(topCents)}
              </span>
            </>
          ) : (
            <>
              No bids yet
              <br />
              <span className="font-display text-[22px] leading-none" data-numeric>
                From $100
              </span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={openBid}
          className="text-accent font-display ml-auto bg-white px-4 py-2 text-[15px] transition-colors duration-150 hover:bg-[#FFE7EE] lg:ml-0"
        >
          BID
        </button>
      </div>
    </div>
  );
}
