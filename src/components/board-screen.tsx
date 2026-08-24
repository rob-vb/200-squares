"use client";

// The board page: the canvas, the legend, the auction dock, and the panel that
// arrives over the canvas area when a flow opens.
//
// It is one screen and it does not scroll. Everything that used to sit under it
// moved to its own page, so the board is the whole of what this page is — which
// is also why the wheel belongs to the canvas here.
//
// The canvas box is not 100dvh on a phone. Fit is contain, and a phone is
// width-bound, so the grid is 8:7 whatever the viewport height — a full-height
// box would only add empty bands above and below it. A desktop is height-bound,
// so there the canvas takes the height it is given.

import { AuctionDock } from "./auction-dock";
import { Canvas } from "./canvas/canvas";
import { PanelSheet, PanelSide } from "./panel/panel";
import { TitleBlock } from "./title-block";
import { MAX_BLOCK, PRICE_PER_SQUARE } from "@/lib/board/geometry";

export function BoardScreen() {
  return (
    <>
      <main className="flex min-h-0 flex-1 flex-col gap-2 px-4 pb-4 lg:px-8 lg:pb-8">
        <div className="relative flex aspect-[8/7] w-full lg:aspect-auto lg:min-h-0 lg:flex-1">
          <Canvas />
          <PanelSide />
        </div>

        <div className="flex shrink-0 items-end justify-between gap-6">
          <p className="text-faint hidden text-[13px] lg:block">
            Drag to select up to {MAX_BLOCK} × {MAX_BLOCK} · ${PRICE_PER_SQUARE} per square
          </p>
          <TitleBlock />
        </div>
      </main>

      {/* Room for the docked auction strip on a phone. */}
      <div className="h-28 shrink-0 lg:hidden" />

      <AuctionDock />
      <PanelSheet />
    </>
  );
}
