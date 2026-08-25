"use client";

// The canvas surface: the transform, the drag contract, the tooltip and the
// selection chip.
//
// Ticket 02's contract, in one line: selection owns the primary drag at every
// input, and panning has to be asked for. Buying is what the canvas is for, so
// the gesture the hand reaches for first is the gesture that buys.
//
//   mouse  — drag selects · wheel zooms at the cursor · space-drag or middle-drag
//            pans · double-click steps the zoom · shift-click extends
//   touch  — one finger selects · two fingers pan and pinch, and the second
//            finger cancels the selection the first one started
//
// The box takes `select-none`. A drag across the board is a selection of
// squares, never a selection of the numbers printed on them. The panel is a
// sibling of this box, not a child, so its fields stay selectable.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Board } from "./board";
import { useClickCount, type ClickTarget } from "@/lib/board/clicks";
import { useCanvasTransform, useWheelZoom, type Pt } from "./transform";
import { PANEL_MEDIA, PANEL_WIDTH, useScreen } from "../panel/flow";
import { useMediaQuery } from "../use-media-query";
import { useBoard } from "@/lib/board/board";
import type { BannerToday } from "@/lib/board/types";
import {
  MAX_SCALE,
  PRICE_PER_SQUARE,
  priceOf,
  rectFrom,
  selectionBlocked,
  type BoardModel,
} from "@/lib/board/geometry";

type CellRef = { r: number; c: number };

/** What the tooltip says about one cell. Mouse only — a tap selects instead. */
function tooltipFor(
  board: BoardModel,
  bannerName: string | null,
  at: CellRef,
): string | null {
  const cell = board.cells[at.r][at.c];
  if (cell.state === "banner") {
    return bannerName ? `${bannerName} · today's banner` : "Banner · nobody has bid";
  }
  if (cell.state === "available") return `${cell.n} · Available · $${PRICE_PER_SQUARE}`;
  // ⚠️ A reserved square says the same thing a sold one does. The visitor is not
  // told that somebody is at a payment page right now — that is an invitation to
  // wait fifteen minutes, and it is nobody's business but the buyer's.
  if (cell.state === "reserved") return "Taken";
  if (cell.state === "pending") return "Sold · artwork coming";
  return cell.block ? `${cell.block.ownerName} · Opens ${cell.block.url}` : null;
}

/**
 * What the pointer says this cell will do. An available square is something to
 * draw on, a block and the banner are links, and a pending block is neither: it
 * is paid for but has nowhere to send anybody yet.
 */
function cursorFor(board: BoardModel, at: CellRef | null): string {
  if (!at) return "default";
  const state = board.cells[at.r][at.c].state;
  if (state === "available") return "crosshair";
  // Neither is a link: a pending block has nowhere to send anybody yet, and a
  // reserved square is not a block at all.
  if (state === "pending" || state === "reserved") return "default";
  return "pointer";
}

/**
 * What a click on this cell counts as, or null where the cell is not a link.
 *
 * ⚠️ It has to agree with `board.tsx`, which decides the same thing when it
 * chooses between an `<a>` and a `<div>`. Where the two disagree the board grows
 * a link the canvas will not let through, or a count with nothing behind it.
 */
function linkAt(
  board: BoardModel,
  bannerToday: BannerToday | null,
  at: CellRef,
): ClickTarget | null {
  const cell = board.cells[at.r][at.c];
  if (cell.state === "banner") {
    return bannerToday?.url ? { kind: "banner", id: bannerToday.date } : null;
  }
  // `taken` is already artwork and not frozen, which is exactly what the board
  // draws as an anchor. `pending` and `reserved` are neither.
  if (cell.state !== "taken") return null;
  const block = cell.block;
  return block?.url && !block.frozen ? { kind: "block", id: block.id } : null;
}

export function Canvas() {
  const { board, bannerToday } = useBoard();
  // The selection is the panel's business as much as the canvas's: it is what
  // opens the buy flow, so it lives in the screen state, not in here.
  const {
    selection,
    selectRect: onSelectionChange,
    preview,
    highlight,
    setDragging,
    panelOpen,
    openBid,
    holding,
  } = useScreen();
  const boxRef = useRef<HTMLDivElement | null>(null);
  // The side panel lies over the right of this box. The board re-centres into
  // what is left, so the panel arrives beside the board and not on top of it.
  const sidePanel = useMediaQuery(PANEL_MEDIA);
  const cv = useCanvasTransform(boxRef, sidePanel && panelOpen ? PANEL_WIDTH : 0);

  const [hovered, setHovered] = useState<CellRef | null>(null);
  const [cursor, setCursor] = useState("default");
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null);

  // ⚠️ Which cells are actually on screen, for the artwork the board draws.
  //
  // Above 2x zoom a block swaps to its `4x` file, and at 4x about a sixteenth of
  // the board is in view. Without this, one zoom gesture would fetch 199 large
  // files — 80 MB of edge traffic for a look at one corner. Ticket 09 asked for
  // the large set "only above 2x, lazy-loaded off-screen"; a background image
  // has no `loading="lazy"`, so this is what lazy means here.
  //
  // It is deliberately coarse and one cell generous on every side: the point is
  // to keep the other fifteen sixteenths on the small file, not to be exact.
  const inView = useMemo(() => {
    const span = cv.step * cv.scale;
    if (span <= 0) return null;
    const c = Math.floor((-cv.t.x) / span) - 1;
    const r = Math.floor((-cv.t.y) / span) - 1;
    const w = Math.ceil(cv.viewport.w / span) + 3;
    const h = Math.ceil(cv.viewport.h / span) + 3;
    return { r, c, w, h };
  }, [cv.step, cv.scale, cv.t.x, cv.t.y, cv.viewport.w, cv.viewport.h]);

  const pointers = useRef(new Map<number, Pt>());
  const mode = useRef<"idle" | "select" | "pan" | "pinch" | "press">("idle");
  const anchor = useRef<CellRef | null>(null);
  const pressed = useRef<CellRef | null>(null);
  // ⚠️ The bridge between the gesture and the click that follows it. `pointerup`
  // leaves the cell a clean press ended on here, and the anchor's own handler
  // reads it a moment later to decide whether to let the navigation happen.
  const lastPress = useRef<CellRef | null>(null);
  const lastPan = useRef<Pt>({ x: 0, y: 0 });
  const pinchStart = useRef({ dist: 0, mid: { x: 0, y: 0 }, scale: 1, t: { x: 0, y: 0 } });
  const spaceDown = useRef(false);

  useWheelZoom(boxRef, (factor, p) => cv.zoomBy(factor, p));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") spaceDown.current = e.type === "keydown";
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
    };
  }, []);

  // The counter, and the widget that pays for it. Both are idle until somebody
  // actually clicks a link on the board (`clicks.ts`).
  const { box: turnstileBox, count } = useClickCount();

  // The one thing a press on the board still does by hand. Everything that
  // leaves the board is an `<a>` now and opens itself (ticket 21) — but an
  // unsold banner is the house ad, and it has nowhere to go. It asks for a bid
  // rather than sitting there as the one dead end on the canvas.
  const follow = useCallback(
    (at: CellRef) => {
      const cell = board.cells[at.r][at.c];
      if (cell.state === "banner" && !bannerToday) openBid();
    },
    [board, bannerToday, openBid],
  );

  /**
   * A click on one of the board's links, from the anchor itself.
   *
   * Two jobs, in this order. **Cancel what was not a click**: a pan that ended
   * over a block, a pinch, a middle-drag, a finger that wandered off what it
   * started on. The board owns the primary drag at every input (ticket 02), so
   * a gesture the canvas did not read as a press must not navigate.
   *
   * ⚠️ And then **count it without waiting**. Ticket 10: the anchor navigates
   * natively and the count is thrown after it. Nothing here is awaited, and
   * nothing between here and the browser's own default action can be.
   */
  const onFollow = useCallback(
    (target: ClickTarget, e: React.MouseEvent<HTMLAnchorElement>) => {
      // ⚠️ The keyboard reaches these links as well, and it produces a click
      // with no pointer gesture behind it — `detail` is 0 for exactly that. A
      // press check would refuse every one of them.
      if (e.detail !== 0 && !lastPress.current) {
        e.preventDefault();
        return;
      }
      lastPress.current = null;
      void count(target);
    },
    [count],
  );

  const twoFinger = () => {
    const [a, b] = [...pointers.current.values()];
    return {
      dist: Math.hypot(a.x - b.x, a.y - b.y),
      mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
    };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    // The zoom controls sit inside the canvas box. Without this, the box captures
    // the pointer on the way down and the button never sees a click at all.
    if ((e.target as HTMLElement).closest("button")) return;

    lastPress.current = null;
    const p = cv.localPoint(e);
    const first = pointers.current.size === 0;
    const panning = e.pointerType === "mouse" && (e.button === 1 || spaceDown.current);
    // ⚠️ **The one press that does not capture the pointer.** A captured pointer
    // sends the click that follows it to this box, and the anchor under the
    // finger never opens — which would undo the whole of ticket 21. Nothing is
    // lost by letting it go: the moves that track a wandering finger arrive here
    // anyway while the pointer is over the board, and `onPointerLeave` takes the
    // one case that does not, a button held down all the way off the canvas.
    const onLink =
      first && !panning && (() => {
        const at = cv.toCell(p);
        return at !== null && linkAt(board, bannerToday, at) !== null;
      })();

    pointers.current.set(e.pointerId, p);
    if (!onLink) e.currentTarget.setPointerCapture(e.pointerId);

    if (pointers.current.size === 2) {
      // The second finger overrides whatever the first one was doing, so a pinch
      // never leaves a stray block selected.
      mode.current = "pinch";
      onSelectionChange(null);
      const { dist, mid } = twoFinger();
      pinchStart.current = { dist, mid, scale: cv.scale, t: { ...cv.t } };
      return;
    }
    if (pointers.current.size > 2) return;

    if (panning) {
      mode.current = "pan";
      lastPan.current = p;
      return;
    }

    const at = cv.toCell(p);
    if (!at) return;

    // Pressing on something already sold is not the start of a selection: it is a
    // click on somebody's block, which is what they paid for.
    if (board.cells[at.r][at.c].state !== "available") {
      mode.current = "press";
      pressed.current = at;
      return;
    }

    mode.current = "select";
    setDragging(true);
    if (e.shiftKey && anchor.current) {
      onSelectionChange(rectFrom(anchor.current, at));
    } else {
      anchor.current = at;
      onSelectionChange(rectFrom(at, at));
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const p = cv.localPoint(e);

    if (e.pointerType === "mouse" && mode.current === "idle") {
      const at = cv.toCell(p);
      setHovered(at && board.cells[at.r][at.c].state === "available" ? at : null);
      setCursor(cursorFor(board, at));
      const text = at ? tooltipFor(board, bannerToday?.ownerName ?? null, at) : null;
      setTip(text ? { x: p.x, y: p.y, text } : null);
    }

    if (!pointers.current.has(e.pointerId)) return;
    const prev = pointers.current.get(e.pointerId)!;
    pointers.current.set(e.pointerId, p);

    if (mode.current === "pinch" && pointers.current.size === 2) {
      const { dist, mid } = twoFinger();
      const start = pinchStart.current;
      if (start.dist === 0) return;
      // Pinch is absolute, recomputed from the gesture-start snapshot every move.
      // Incremental pinch drifts.
      const next = Math.min(MAX_SCALE, Math.max(1, (start.scale * dist) / start.dist));
      const cx = (start.mid.x - start.t.x) / start.scale;
      const cy = (start.mid.y - start.t.y) / start.scale;
      cv.setTransform(next, mid.x - cx * next, mid.y - cy * next);
      return;
    }
    if (mode.current === "pan") {
      cv.panBy(p.x - prev.x, p.y - prev.y);
      return;
    }
    if (mode.current === "select" && anchor.current) {
      const at = cv.toCell(p);
      if (!at) return;
      onSelectionChange(rectFrom(anchor.current, at));
      return;
    }
    if (mode.current === "press" && pressed.current) {
      const at = cv.toCell(p);
      // The finger wandered off the block, so it is no longer a click on it.
      if (!at || at.r !== pressed.current.r || at.c !== pressed.current.c) pressed.current = null;
    }
  };

  const endPointer = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    setDragging(false);
    // ⚠️ Read by the click that is about to follow this `pointerup`, and by
    // nothing else. The anchor navigates on its own; what this says is whether
    // the gesture that ended here was a click on it at all.
    lastPress.current = mode.current === "press" ? pressed.current : null;
    if (mode.current === "press" && pressed.current) follow(pressed.current);
    pressed.current = null;
    if (pointers.current.size < 2 && mode.current === "pinch") mode.current = "idle";
    if (pointers.current.size === 0) mode.current = "idle";
  };

  const onDoubleClick = (e: React.MouseEvent) => {
    const p = cv.localPoint(e);
    cv.zoomAbs(cv.scale >= MAX_SCALE ? 1 : cv.scale < 2 ? 2 : MAX_SCALE, p);
  };

  // ⚠️ A hold makes the visitor's own squares unavailable on the live board, so
  // without this their selection turns red over the rectangle they are paying
  // for. While they hold one, the selection is theirs by definition.
  const blocked = !holding && selection ? selectionBlocked(board, selection) : false;
  const chip = selection
    ? {
        x: cv.t.x + selection.c * cv.step * cv.scale,
        y: cv.t.y + selection.r * cv.step * cv.scale,
      }
    : null;

  return (
    <div
      ref={boxRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onPointerLeave={() => {
        setHovered(null);
        setTip(null);
        setCursor("default");
        // A press on a link does not capture the pointer, so a button held down
        // all the way off the canvas never comes back as a `pointerup`. It is
        // not a click on anything either way.
        if (mode.current === "press") {
          mode.current = "idle";
          pressed.current = null;
          pointers.current.clear();
        }
      }}
      onDoubleClick={onDoubleClick}
      className="relative flex-1 overflow-hidden select-none"
      style={{ touchAction: "none", overscrollBehavior: "none", cursor }}
    >
      <div
        className="absolute"
        style={{
          transformOrigin: "0 0",
          transform: `translate(${cv.t.x}px, ${cv.t.y}px) scale(${cv.scale})`,
        }}
      >
        <Board
          board={board}
          bannerToday={bannerToday}
          cell={cv.cell}
          scale={cv.scale}
          inView={inView}
          selection={selection}
          blocked={blocked}
          hovered={hovered}
          preview={preview}
          highlight={highlight}
          onFollow={onFollow}
        />
      </div>

      {selection && chip && (
        <span
          className="font-display pointer-events-none absolute px-1.5 text-[13px] leading-[1.35] whitespace-nowrap text-white"
          style={{
            left: chip.x,
            // Above the block, unless the block is at the very top of the view.
            top: chip.y < 22 ? chip.y + selection.h * cv.step * cv.scale : chip.y,
            transform: chip.y < 22 ? undefined : "translateY(-100%)",
            background: blocked ? "#8A1233" : "var(--color-accent)",
          }}
        >
          {blocked
            ? "Not available"
            : holding
              ? "Held for you"
              : `${selection.w}×${selection.h} $${priceOf(selection).toLocaleString("en-US")}`}
        </span>
      )}

      {tip && (
        <span
          className="bg-ink text-page pointer-events-none absolute z-10 px-2 py-1 text-[11px] font-semibold whitespace-nowrap"
          style={{
            left: Math.min(tip.x + 14, cv.viewport.w - 8),
            top: tip.y + 16,
            transform: tip.x > cv.viewport.w - 220 ? "translateX(-100%)" : undefined,
          }}
        >
          {tip.text}
        </span>
      )}

      {/*
        ⚠️ Turnstile's box, and it may not be hidden: Cloudflare refuses to run a
        widget inside a `display:none` container and refuses quietly (see
        `checkout/turnstile.ts`). The site key is invisible, so nothing is drawn
        here unless Cloudflare actually wants an interaction — and the script is
        not even fetched until the first click on a link (`board/clicks.ts`).
      */}
      <div ref={turnstileBox} className="absolute bottom-4 left-4" />

      <ZoomControls
        inset={sidePanel && panelOpen ? PANEL_WIDTH : 0}
        scale={cv.scale}
        onIn={() => cv.zoomBy(1.6)}
        onOut={() => cv.zoomBy(1 / 1.6)}
        onFit={() => cv.zoomAbs(1)}
      />
    </div>
  );
}

function ZoomControls({
  inset,
  scale,
  onIn,
  onOut,
  onFit,
}: {
  /** The panel's width, so the controls stay beside the board and not under it. */
  inset: number;
  scale: number;
  onIn: () => void;
  onOut: () => void;
  onFit: () => void;
}) {
  const btn =
    "bg-square text-ink hover:bg-white disabled:text-ink/30 grid h-9 w-9 place-items-center text-[17px] leading-none transition-colors duration-150";
  return (
    // Touch has pinch and double-tap, so on a phone these would only cover squares.
    <div
      className="border-hairline absolute bottom-4 hidden border lg:flex"
      style={{ right: inset + 16, boxShadow: "var(--shadow-lift)" }}
    >
      <button type="button" className={btn} onClick={onOut} disabled={scale <= 1} aria-label="Zoom out">
        −
      </button>
      <button
        type="button"
        className="bg-square text-faint hover:bg-white border-hairline border-x px-3 text-[12px] transition-colors duration-150"
        onClick={onFit}
        disabled={scale <= 1}
        aria-label="Fit the whole board"
      >
        Fit
      </button>
      <button type="button" className={btn} onClick={onIn} disabled={scale >= MAX_SCALE} aria-label="Zoom in">
        +
      </button>
    </div>
  );
}
