"use client";

// The first screen: top bar, canvas, panel, legend, auction dock.
//
// The panel column is reserved from 1280px up, open or closed. That is the whole
// reason for the breakpoint: at 1024px the canvas becomes width-bound and a
// column appearing beside it would visibly shrink the board. Below 1280px the
// panel is the bottom sheet, and the column's contents — legend and auction —
// go back under and below the canvas.
//
// The canvas box is not 100dvh on a phone. Fit is contain, and a phone is
// width-bound, so the grid is 8:7 whatever the viewport height — a full-height
// box would only add empty bands above and below it. A desktop is height-bound,
// so there the canvas takes the height it is given.

import { AuctionDock } from "./auction-dock";
import { Canvas } from "./canvas/canvas";
import { ScreenProvider, useScreen } from "./panel/flow";
import { PanelColumn, PanelSheet } from "./panel/panel";
import { TitleBlock } from "./title-block";
import { TopBar } from "./top-bar";
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
  const { flow, dragging } = useScreen();
  const sheetOpen = flow.kind !== "none" && !dragging;

  return (
    <div className="flex min-h-dvh flex-col xl:h-dvh xl:overflow-hidden">
      <TopBar />

      <main className="flex min-h-0 flex-1 flex-col gap-2 px-4 pb-4 xl:flex-row xl:items-stretch xl:gap-6 xl:px-8 xl:pb-8">
        <div className="flex min-w-0 flex-col gap-2 xl:min-h-0 xl:flex-1">
          <div className="flex aspect-[8/7] w-full xl:aspect-auto xl:min-h-0 xl:flex-1">
            <Canvas />
          </div>
          <TitleBlock variant="strip" />
        </div>

        <aside className="hidden w-[360px] shrink-0 flex-col gap-3 xl:flex">
          <PanelColumn />
          <TitleBlock variant="column" />
          <AuctionDock variant="static" />
        </aside>
      </main>

      {/* Room for the docked auction strip on a phone. */}
      <div className="h-28 shrink-0 xl:hidden" />

      {/* The sheet takes the bottom of the screen, so the dock steps aside. */}
      {sheetOpen ? null : <AuctionDock variant="fixed" />}
      <PanelSheet />
    </div>
  );
}
