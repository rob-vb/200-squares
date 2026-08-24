"use client";

// The first screen: top bar, canvas, legend, auction dock. The detail panel and
// every flow it holds are ticket 09; the content under the canvas is ticket 10.
//
// The canvas box is not 100dvh on a phone. Fit is contain, and a phone is
// width-bound, so the grid is 8:7 whatever the viewport height — a full-height
// box would only add empty bands above and below it. A desktop is height-bound,
// so there the canvas takes the height it is given.

import { useState } from "react";
import { AuctionDock } from "./auction-dock";
import { Canvas } from "./canvas/canvas";
import { TitleBlock } from "./title-block";
import { TopBar } from "./top-bar";
import { BoardProvider } from "@/lib/board/state";
import type { Dataset, Rect } from "@/lib/board/types";

export function BoardScreen({ dataset }: { dataset: Dataset }) {
  return (
    <BoardProvider dataset={dataset}>
      <Screen />
    </BoardProvider>
  );
}

function Screen() {
  const [selection, setSelection] = useState<Rect | null>(null);

  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh lg:overflow-hidden">
      <TopBar />

      <main className="flex min-h-0 flex-1 flex-col gap-2 px-4 pb-4 lg:px-8 lg:pb-8">
        <div className="flex aspect-[8/7] w-full lg:aspect-auto lg:min-h-0 lg:flex-1">
          <Canvas selection={selection} onSelectionChange={setSelection} />
        </div>
        <TitleBlock />
      </main>

      {/* Room for the docked auction strip on a phone. */}
      <div className="h-28 shrink-0 lg:hidden" />

      <AuctionDock />
    </div>
  );
}
