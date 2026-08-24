"use client";

// The auction, docked over the sheet margin instead of living in the top bar.
// This is where all the loudness is spent: one magenta card on a muted board.
// On a phone it becomes the full-width strip pinned to the bottom.
//
// The BID button opens the auction panel, which is ticket 09. Today it is the
// only control on this screen that leads nowhere.

import { Countdown } from "./countdown";
import { useBoard } from "@/lib/board/state";

export function AuctionDock() {
  const { topBid, state } = useBoard();
  const bids = state.bids.filter((b) => b.dayOffset === 1).length;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 lg:inset-x-auto lg:bottom-6 lg:left-8">
      <div
        className="bg-accent pointer-events-auto flex items-center gap-5 px-4 py-3 text-white"
        style={{ boxShadow: "var(--shadow-dock)" }}
      >
        <div>
          <div className="text-[13px] font-medium">Tomorrow&rsquo;s banner closes</div>
          <Countdown className="font-display text-[30px] leading-none" />
        </div>

        <div className="text-[13px] leading-tight font-medium">
          {topBid ? (
            <>
              Top bid · {bids} bids
              <br />
              <span className="font-display text-[22px] leading-none" data-numeric>
                ${topBid.amount.toLocaleString("en-US")}
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
          className="text-accent font-display ml-auto bg-white px-4 py-2 text-[15px] transition-colors duration-150 hover:bg-[#FFE7EE] lg:ml-0"
        >
          BID
        </button>
      </div>
    </div>
  );
}
