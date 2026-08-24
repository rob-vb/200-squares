"use client";

// The first thing under the fold, and the only pitch the page makes.
//
// Ticket 07: scarcity sells this, so the number that shrinks is the headline. It
// is live from the same board the canvas draws, so buying a block above changes
// the figure here — which is also why `Available` left the legend: two counters
// within one screen of each other is one too many.

import { useBoard } from "@/lib/board/state";
import { SQUARE_COUNT } from "@/lib/board/geometry";

export function Counter() {
  const { board } = useBoard();
  const { available } = board.stats;
  const soldOut = available === 0;

  return (
    <section className="border-hairline border-t">
      <div className="mx-auto w-full max-w-[1180px] px-4 py-12 lg:px-8 lg:py-16">
        <h2
          className="font-display text-[clamp(44px,11vw,132px)] leading-[0.86]"
          data-numeric
        >
          {soldOut ? (
            <>
              SOLD OUT<span className="text-faint"> · </span>
              {SQUARE_COUNT} / {SQUARE_COUNT} SQUARES TAKEN
            </>
          ) : (
            <>
              {available} SQUARES LEFT
            </>
          )}
        </h2>
        <p className="pt-4 text-[17px] leading-snug">
          {soldOut
            ? "The banner is still auctioned every day."
            : "$100 each. Buy once, keep it."}
        </p>
      </div>
    </section>
  );
}
