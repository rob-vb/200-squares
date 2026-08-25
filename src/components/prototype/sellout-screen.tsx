"use client";

// ⚠️ PROTOTYPE — ticket 27. Throwaway.
//
// The board screen, with the variant top bar over it and the variant legend line
// under the canvas. A copy of `site.tsx` and `board-screen.tsx`, because both
// hard-wire the two pieces this ticket is asking about.

import { useSearchParams } from "next/navigation";
import { AuctionDock } from "../auction-dock";
import { Canvas } from "../canvas/canvas";
import { PanelSheet, PanelSide } from "../panel/panel";
import { ScreenProvider } from "../panel/flow";
import { TitleBlock } from "../title-block";
import { PrototypeSwitcher } from "./prototype-switcher";
import { ProtoDragLine, ProtoTopBar, VARIANTS, type Variant } from "./sellout-variants";
import { BoardProvider, useBoard } from "@/lib/board/board";
import { ViewerProvider } from "@/lib/board/viewer";

export function SelloutPrototype() {
  const params = useSearchParams();
  const asked = (params.get("variant") ?? "A").toUpperCase() as Variant;
  const variant = VARIANTS.includes(asked) ? asked : "A";
  const forced = params.get("sold") === "1";

  return (
    <BoardProvider>
      <ViewerProvider>
        <ScreenProvider>
          <Screen variant={variant} forced={forced} />
        </ScreenProvider>
      </ViewerProvider>
    </BoardProvider>
  );
}

function Screen({ variant, forced }: { variant: Variant; forced: boolean }) {
  const { board } = useBoard();
  const realSoldOut = board.stats.available === 0;
  const soldOut = realSoldOut || forced;

  return (
    <>
      <ProtoTopBar variant={variant} soldOut={soldOut} />

      <main className="flex min-h-0 flex-1 flex-col gap-2 px-4 pb-4 lg:px-8 lg:pb-8">
        <div className="relative flex aspect-[8/7] w-full lg:aspect-auto lg:min-h-0 lg:flex-1">
          <Canvas />
          <PanelSide />
        </div>

        <div className="flex shrink-0 items-end justify-between gap-6">
          <ProtoDragLine variant={variant} soldOut={soldOut} />
          <TitleBlock />
        </div>
      </main>

      <div className="h-28 shrink-0 lg:hidden" />

      <AuctionDock />
      <PanelSheet />
      <PrototypeSwitcher variant={variant} sold={soldOut} realSoldOut={realSoldOut} />
    </>
  );
}
