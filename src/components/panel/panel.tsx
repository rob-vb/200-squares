"use client";

// The one surface, in two placements.
//
// On a wide screen it slides in over the right of the canvas area when a flow
// opens, and leaves again when the flow closes. The canvas does not resize for
// it — the square keeps the size it had — it only re-centres into the width the
// panel leaves free, so the panel never lands on top of the board. Below the
// breakpoint it is the bottom sheet, which is the only thing in the product
// allowed to cover the board, and even then never the banner: the banner is
// top-left and the sheet comes from the bottom.
//
// It waits for the pointer to lift. A panel that arrived mid-drag would move the
// board under the hand that is still drawing on it.

import { useEffect } from "react";
import { BidFlow } from "./bid-flow";
import { BoughtFlow, BuyFlow } from "./buy-flow";
import { PANEL_WIDTH, useScreen } from "./flow";
import { MySquares } from "./my-squares";
import { ResaleFlow } from "./resale-flow";
import { SellFlow } from "./sell-flow";

function FlowBody() {
  const { flow, selection } = useScreen();

  switch (flow.kind) {
    case "buy":
      return selection ? <BuyFlow rect={selection} /> : null;
    case "bought":
      return <BoughtFlow rect={flow.rect} hasArtwork={flow.hasArtwork} />;
    case "bid":
      return <BidFlow />;
    case "mine":
      return <MySquares />;
    case "sell":
      return <SellFlow blockId={flow.blockId} />;
    case "resale":
      return <ResaleFlow blockId={flow.blockId} />;
    case "none":
      return null;
  }
}

/** Escape closes whatever is open. One key, every flow. */
function useEscapeToClose(close: () => void, open: boolean) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, open]);
}

/** The side panel. It sits inside the canvas area, over the right of it. */
export function PanelSide() {
  const { panelOpen, close } = useScreen();
  useEscapeToClose(close, panelOpen);

  if (!panelOpen) return null;

  return (
    <section
      className="border-hairline bg-square panel-slide absolute inset-y-0 right-0 z-30 hidden flex-col overflow-y-auto border xl:flex"
      style={{ width: PANEL_WIDTH, boxShadow: "var(--shadow-lift)" }}
    >
      <FlowBody />
    </section>
  );
}

/** The bottom sheet, below the breakpoint. */
export function PanelSheet() {
  const { panelOpen, close } = useScreen();
  useEscapeToClose(close, panelOpen);

  if (!panelOpen) return null;

  return (
    <section
      className="border-hairline bg-square sheet-rise fixed inset-x-0 bottom-0 z-50 flex max-h-[78dvh] flex-col overflow-y-auto border-t xl:hidden"
      style={{ boxShadow: "var(--shadow-dock)" }}
    >
      <FlowBody />
    </section>
  );
}
