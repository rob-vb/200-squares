"use client";

// The auction, docked instead of living in the top bar. This is where all the
// loudness is spent: one magenta card on a muted board.
//
// Two placements, one card. On a phone it is the full-width strip pinned to the
// bottom; inside the reserved panel column it simply sits under the legend.

import { Countdown } from "./countdown";
import { useScreen } from "./panel/flow";
import { useBoard } from "@/lib/board/state";

function AuctionCard() {
  const { topBid, liveBids, viewerIsTopBidder, viewerOutbid } = useBoard();
  const { openBid } = useScreen();

  return (
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
            {viewerIsTopBidder ? "You are top" : viewerOutbid ? "You were outbid" : "Top bid"} ·{" "}
            {liveBids.length} bids
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
        onClick={openBid}
        className="text-accent font-display ml-auto bg-white px-4 py-2 text-[15px] transition-colors duration-150 hover:bg-[#FFE7EE]"
      >
        BID
      </button>
    </div>
  );
}

export function AuctionDock({ variant }: { variant: "fixed" | "static" }) {
  if (variant === "static") return <AuctionCard />;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 xl:hidden">
      <AuctionCard />
    </div>
  );
}
