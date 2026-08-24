"use client";

// The page: the canvas owns the first screen, and the content starts under it.
//
// Top bar, canvas, legend, auction dock, and the panel that arrives over the
// canvas area when a flow opens.
//
// The board is the whole point, so nothing stands beside it while nothing is
// happening. The panel slides in from the right on a wide screen and rises from
// the bottom on a phone, and the board re-centres beside it instead of shrinking
// for it. The one permanent explanation of how to buy sits under the canvas,
// next to the legend, where it costs the board nothing.
//
// The canvas box is not 100dvh on a phone. Fit is contain, and a phone is
// width-bound, so the grid is 8:7 whatever the viewport height — a full-height
// box would only add empty bands above and below it. A desktop is height-bound,
// so there the canvas takes the height it is given.

import { AuctionDock } from "./auction-dock";
import { PageContent } from "./content/page-content";
import { Canvas } from "./canvas/canvas";
import { ScreenProvider } from "./panel/flow";
import { PanelSheet, PanelSide } from "./panel/panel";
import { TitleBlock } from "./title-block";
import { TopBar } from "./top-bar";
import { MAX_BLOCK, PRICE_PER_SQUARE } from "@/lib/board/geometry";
import { BoardProvider } from "@/lib/board/state";
import type { Dataset } from "@/lib/board/types";

export function BoardScreen({ dataset }: { dataset: Dataset }) {
  return (
    <BoardProvider dataset={dataset}>
      <ScreenProvider>
        <Screen />
      </ScreenProvider>
    </BoardProvider>
  );
}

function Screen() {
  return (
    <div>
      {/* The first screen. On a desktop it is exactly the viewport, so the board
          is as large as the screen allows and the content begins at the fold. */}
      <section className="flex flex-col lg:h-dvh">
        <TopBar />

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
      </section>

      <PageContent />

      <AuctionDock />
      <PanelSheet />
    </div>
  );
}
