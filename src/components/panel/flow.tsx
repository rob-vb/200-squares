"use client";

// What the panel is showing, and what the canvas has to know about it.
//
// One flow at a time, no stack and no back button: a new flow replaces the old
// one. Ticket 06 put the whole screen's mutable UI state here, because the
// canvas, the top bar, the auction dock and the panel all read from it.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { selectionBlocked } from "@/lib/board/geometry";
import { useBoard } from "@/lib/board/board";
import { clearHold, useHold } from "@/lib/checkout/hold";
import type { Rect } from "@/lib/board/types";

/** How wide the sliding panel is. The canvas needs the number too. */
export const PANEL_WIDTH = 380;
/** The breakpoint where the panel is a side panel instead of a bottom sheet. */
export const PANEL_MEDIA = "(min-width: 1280px)";

export type Flow =
  | { kind: "none" }
  | { kind: "buy" }
  | { kind: "bid" }
  | { kind: "mine" };

// ⚠️ There is no `bought` flow any more. The prototype confirmed a purchase in
// the panel; ticket 06 moved that moment off the board entirely — the buyer is
// on Stripe when the payment lands, and `/thanks` is where they come back to.

const same = (a: Rect, b: Rect) => a.r === b.r && a.c === b.c && a.w === b.w && a.h === b.h;

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
   *
   * It comes straight off the `sessionStorage` store, so a reload, a back button
   * or a second look at the tab all find the same hold still standing.
   */
  holding: Rect | null;
  selectRect: (rect: Rect | null) => void;
  setPreview: (src: string | null) => void;
  setHighlight: (rect: Rect | null) => void;
  openBid: () => void;
  openMine: () => void;
  close: () => void;
};

const ScreenContext = createContext<ScreenValue | null>(null);

export function ScreenProvider({ children }: { children: React.ReactNode }) {
  const { board } = useBoard();
  const hold = useHold();
  const [flow, setFlow] = useState<Flow>({ kind: "none" });
  const [selection, setSelection] = useState<Rect | null>(null);
  const [highlight, setHighlight] = useState<Rect | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  // Which hold the visitor has already waved away. Keyed on the reservation so
  // that taking a new one brings the panel back.
  const [dismissed, setDismissed] = useState<string | null>(null);

  // Fifteen minutes, and then the tab's memory of it goes the way the server's
  // has. The timer is what turns the hold off; nothing polls.
  useEffect(() => {
    if (!hold) return;
    const id = window.setTimeout(() => clearHold(), Math.max(0, hold.expiresAt - Date.now()));
    return () => window.clearTimeout(id);
  }, [hold]);

  const selectRect = useCallback(
    (rect: Rect | null) => {
      setSelection(rect);
      setPreview(null);
      setHighlight(null);
      // A blocked selection never opens the panel: the red chip on the canvas
      // already says it, at the place where the problem is. The one exception is
      // the visitor's own hold, which is only "blocked" because they took it.
      const mine = Boolean(rect && hold && same(hold.rect, rect));
      if (rect && (mine || !selectionBlocked(board, rect))) {
        if (mine) setDismissed(null);
        setFlow({ kind: "buy" });
        return;
      }
      setFlow((f) => (f.kind === "buy" ? { kind: "none" } : f));
    },
    [board, hold],
  );

  const value = useMemo<ScreenValue>(() => {
    // ⚠️ A hold outlives the page. The panel a visitor left when they went to
    // Stripe is put back in front of them when they come back to the tab,
    // because otherwise the only way to reach their own fifteen minutes would be
    // to drag the same rectangle again — and the board reads it as taken by then.
    const resume = hold && hold.reservationId !== dismissed ? hold : null;
    const shownFlow: Flow = flow.kind === "none" && resume ? { kind: "buy" } : flow;
    const shownSelection = flow.kind === "none" && resume ? resume.rect : selection;

    // Opening another flow drops the selection, so the canvas never keeps a lit
    // rectangle whose flow has gone.
    const replace = (next: Flow) => () => {
      setSelection(null);
      setPreview(null);
      setHighlight(null);
      if (hold) setDismissed(hold.reservationId);
      setFlow(next);
    };
    return {
      flow: shownFlow,
      selection: shownSelection,
      highlight,
      preview,
      dragging,
      setDragging,
      panelOpen: shownFlow.kind !== "none" && !dragging,
      holding: hold?.rect ?? null,
      selectRect,
      setPreview,
      setHighlight,
      openBid: replace({ kind: "bid" }),
      openMine: replace({ kind: "mine" }),
      close: replace({ kind: "none" }),
    };
  }, [flow, selection, dismissed, highlight, preview, dragging, hold, selectRect]);

  return <ScreenContext.Provider value={value}>{children}</ScreenContext.Provider>;
}

export function useScreen(): ScreenValue {
  const value = useContext(ScreenContext);
  if (!value) throw new Error("useScreen must be used inside a ScreenProvider");
  return value;
}
