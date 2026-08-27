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

export function BoardScreen() {
  return (
    <>
      <main className="flex min-h-0 flex-1 flex-col gap-2 px-4 pb-4 lg:px-8 lg:pb-8">
        <div className="relative flex aspect-[8/7] w-full lg:aspect-auto lg:min-h-0 lg:flex-1">
          <Canvas />
          <PanelSide />
        </div>

        {/*
          The drag instruction that used to sit beside this box is gone. It was
          desktop-only and the auction dock lay over its corner, so the one
          reader it could reach rarely saw it — and on the day the board sells
          out it is an instruction for a thing that can no longer be done.
        */}
        <div className="flex shrink-0 items-end justify-end gap-6">
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
