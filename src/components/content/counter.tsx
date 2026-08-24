"use client";

// The head of How it works, and the only pitch the site makes.
//
// Ticket 07: scarcity sells this, so the number that shrinks is the headline —
// which is why it is the page's h1 and not a figure under a title. It is live
// from the same board the canvas draws, and the board outlives navigation, so a
// block bought on the board has already changed this number by the time the
// page opens.

import { useBoard } from "@/lib/board/state";
import { SQUARE_COUNT } from "@/lib/board/geometry";

export function Counter() {
  const { board } = useBoard();
  const { available } = board.stats;
  const soldOut = available === 0;

  return (
    <section className="border-hairline border-t">
      <div className="mx-auto w-full max-w-[1180px] px-4 py-12 lg:px-8 lg:py-16">
        <h1
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
        </h1>
        <p className="pt-4 text-[17px] leading-snug">
          {soldOut
            ? "The banner is still auctioned every day."
            : "$100 each. Buy once, keep it."}
        </p>
      </div>
    </section>
  );
}
