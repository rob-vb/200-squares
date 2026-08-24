"use client";

// What the panel is showing, and what the canvas has to know about it.
//
// One flow at a time, no stack and no back button: a new flow replaces the old
// one. Ticket 06 put the whole screen's mutable UI state here, because the
// canvas, the top bar, the auction dock and the panel all read from it.

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { selectionBlocked } from "@/lib/board/geometry";
import { useBoard } from "@/lib/board/state";
import type { Rect } from "@/lib/board/types";

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
  /** A selection drag is under way. The sheet waits for the finger to lift. */
  dragging: boolean;
  setDragging: (on: boolean) => void;
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
      setFlow(next);
    };
    return {
      flow,
      selection,
      highlight,
      preview,
      dragging,
      setDragging,
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
  }, [flow, selection, highlight, preview, dragging, selectRect]);

  return <ScreenContext.Provider value={value}>{children}</ScreenContext.Provider>;
}

export function useScreen(): ScreenValue {
  const value = useContext(ScreenContext);
  if (!value) throw new Error("useScreen must be used inside a ScreenProvider");
  return value;
}
