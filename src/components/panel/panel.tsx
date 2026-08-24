"use client";

// The one surface. On a wide screen it is a column that is always there, open or
// closed, so opening a flow never resizes the canvas. Below 1280px it is the
// bottom sheet, which is the only thing in the product allowed to cover the
// board — and it still never covers the banner, because the banner is top-left.

import { useEffect } from "react";
import { BidFlow } from "./bid-flow";
import { BoughtFlow, BuyFlow } from "./buy-flow";
import { useScreen } from "./flow";
import { MySquares } from "./my-squares";
import { MAX_BLOCK, PRICE_PER_SQUARE } from "@/lib/board/geometry";

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

/**
 * The desktop column. Closed, it carries the only permanent explanation of how
 * to buy — which is why the reserved column is not dead space.
 */
export function PanelColumn() {
  const { flow, close } = useScreen();
  useEscapeToClose(close, flow.kind !== "none");

  return (
    <section
      className="border-hairline bg-square flex min-h-0 flex-1 flex-col overflow-hidden border"
      style={{ boxShadow: "var(--shadow-lift)" }}
    >
      {flow.kind === "none" ? (
        <div className="flex flex-1 flex-col justify-center gap-2 px-4 py-6">
          <p className="font-display text-[19px] leading-tight">
            Drag to select up to {MAX_BLOCK} × {MAX_BLOCK}
          </p>
          <p className="text-faint text-[14px] leading-snug">
            ${PRICE_PER_SQUARE} per square, once. Your artwork goes on it and a click opens your
            website.
          </p>
        </div>
      ) : (
        <FlowBody />
      )}
    </section>
  );
}

/** The bottom sheet, below 1280px. It only exists while a flow is open. */
export function PanelSheet() {
  const { flow, close, dragging } = useScreen();
  useEscapeToClose(close, flow.kind !== "none");

  // A sheet that slid up mid-drag would cover the board under the finger that is
  // still drawing on it. It waits for the finger to lift.
  if (flow.kind === "none" || dragging) return null;

  return (
    <section
      className="border-hairline bg-square fixed inset-x-0 bottom-0 z-50 flex max-h-[78dvh] flex-col overflow-y-auto border-t xl:hidden"
      style={{ boxShadow: "var(--shadow-dock)" }}
    >
      <FlowBody />
    </section>
  );
}
