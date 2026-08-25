"use client";

// What the panel is showing, and what the canvas has to know about it.
//
// One flow at a time, no stack and no back button: a new flow replaces the old
// one. Ticket 06 put the whole screen's mutable UI state here, because the
// canvas, the top bar, the auction dock and the panel all read from it.

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { selectionBlocked } from "@/lib/board/geometry";
import { useBoard } from "@/lib/board/board";
import type { Rect } from "@/lib/board/types";

/** How wide the sliding panel is. The canvas needs the number too. */
export const PANEL_WIDTH = 380;
/** The breakpoint where the panel is a side panel instead of a bottom sheet. */
export const PANEL_MEDIA = "(min-width: 1280px)";

export type Flow =
  | { kind: "none" }
  | { kind: "buy" }
  | { kind: "bought"; rect: Rect; hasArtwork: boolean }
  | { kind: "bid" }
  | { kind: "mine" };

type ScreenValue = {
  flow: Flow;
  selection: Rect | null;
  /** The block My squares is pointing at, drawn on the canvas. */
  highlight: Rect | null;
  /** An object URL, painted over the selection before the purchase is confirmed. */
  preview: string | null;
  /** A selection drag is under way. The panel waits for the pointer to lift. */
  dragging: boolean;
  setDragging: (on: boolean) => void;
  /** A flow is on screen. Not the same as "a flow is chosen": see `dragging`. */
  panelOpen: boolean;
  /**
   * The rectangle the visitor is holding a reservation on, if any.
   *
   * ⚠️ It exists so the canvas can tell *their own hold* from *somebody else's*.
   * The board is live, so the moment a reservation is written the squares under
   * it read as unavailable — including to the visitor who just took them, whose
   * selection would otherwise turn red and say "Not available" about squares
   * they are at that second paying for.
   */
  holding: Rect | null;
  setHolding: (rect: Rect | null) => void;
  selectRect: (rect: Rect | null) => void;
  setPreview: (src: string | null) => void;
  setHighlight: (rect: Rect | null) => void;
  openBid: () => void;
  openMine: () => void;
  showBought: (rect: Rect, hasArtwork: boolean) => void;
  close: () => void;
};

const ScreenContext = createContext<ScreenValue | null>(null);

export function ScreenProvider({ children }: { children: React.ReactNode }) {
  const { board } = useBoard();
  const [flow, setFlow] = useState<Flow>({ kind: "none" });
  const [selection, setSelection] = useState<Rect | null>(null);
  const [highlight, setHighlight] = useState<Rect | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [holding, setHolding] = useState<Rect | null>(null);

  const selectRect = useCallback(
    (rect: Rect | null) => {
      setSelection(rect);
      setPreview(null);
      setHighlight(null);
      // A blocked selection never opens the panel: the red chip on the canvas
      // already says it, at the place where the problem is.
      if (rect && !selectionBlocked(board, rect)) {
        setFlow({ kind: "buy" });
        return;
      }
      setFlow((f) => (f.kind === "buy" ? { kind: "none" } : f));
    },
    [board],
  );

  const value = useMemo<ScreenValue>(() => {
    // Opening another flow drops the selection, so the canvas never keeps a lit
    // rectangle whose flow has gone.
    const replace = (next: Flow) => () => {
      setSelection(null);
      setPreview(null);
      setHighlight(null);
      setHolding(null);
      setFlow(next);
    };
    return {
      flow,
      selection,
      highlight,
      preview,
      dragging,
      setDragging,
      panelOpen: flow.kind !== "none" && !dragging,
      holding,
      setHolding,
      selectRect,
      setPreview,
      setHighlight,
      openBid: replace({ kind: "bid" }),
      openMine: replace({ kind: "mine" }),
      showBought: (rect: Rect, hasArtwork: boolean) => {
        setSelection(null);
        setPreview(null);
        setFlow({ kind: "bought", rect, hasArtwork });
      },
      close: replace({ kind: "none" }),
    };
  }, [flow, selection, highlight, preview, dragging, holding, selectRect]);

  return <ScreenContext.Provider value={value}>{children}</ScreenContext.Provider>;
}

export function useScreen(): ScreenValue {
  const value = useContext(ScreenContext);
  if (!value) throw new Error("useScreen must be used inside a ScreenProvider");
  return value;
}
