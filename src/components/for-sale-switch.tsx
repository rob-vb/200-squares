"use client";

// The market view, in one control.
//
// Ticket 11 chose a switch over a permanent mark on the block, because a mark
// paints over artwork the owner paid for and Register's one rule is that owner
// artwork is the only colour on this canvas. Off is the default, and off is the
// board exactly as it is without resale.
//
// It is disabled when nothing is for sale. A switch that dims the whole board
// and lights nothing is a broken screen, not an empty one.

import { useScreen } from "./panel/flow";
import { useBoard } from "@/lib/board/state";

export function ForSaleSwitch() {
  const { board } = useBoard();
  const { forSale, setForSale } = useScreen();
  const count = board.listed.length;
  const off = count === 0;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={forSale}
      disabled={off}
      onClick={() => setForSale(!forSale)}
      className={`border-hairline flex shrink-0 items-center gap-2 border px-2 py-1 text-[13px] font-medium transition-colors duration-150 ${
        off ? "text-faint/50" : forSale ? "bg-white" : "hover:bg-white"
      }`}
    >
      <span
        className="border-hairline relative block h-[15px] w-[27px] shrink-0 border transition-colors duration-150"
        style={{ background: forSale ? "var(--color-accent)" : "var(--color-square)" }}
      >
        <span
          className="absolute top-[2px] block h-[9px] w-[9px] transition-[left] duration-150"
          style={{
            left: forSale ? 15 : 2,
            background: forSale ? "#FFFFFF" : "var(--color-hairline)",
          }}
        />
      </span>
      For sale ({count})
    </button>
  );
}
