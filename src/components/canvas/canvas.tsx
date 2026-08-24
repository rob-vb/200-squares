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

import { useCallback, useEffect, useRef, useState } from "react";
import { Board } from "./board";
import { useCanvasTransform, useWheelZoom, type Pt } from "./transform";
import { useBoard } from "@/lib/board/state";
import {
  MAX_SCALE,
  PRICE_PER_SQUARE,
  priceOf,
  rectFrom,
  selectionBlocked,
  type BoardModel,
} from "@/lib/board/geometry";
import type { Rect } from "@/lib/board/types";

type CellRef = { r: number; c: number };

/** What the tooltip says about one cell. Mouse only — a tap selects instead. */
function tooltipFor(board: BoardModel, bannerName: string | null, at: CellRef): string | null {
  const cell = board.cells[at.r][at.c];
  if (cell.state === "banner") {
    return bannerName ? `${bannerName} · today's banner` : "Banner · nobody has bid";
  }
  if (cell.state === "available") return `${cell.n} · Available · $${PRICE_PER_SQUARE}`;
  if (cell.state === "pending") return "Sold · artwork coming";
  const owner = cell.block ? board.ownerById.get(cell.block.ownerId) : null;
  return owner ? `${owner.name} · Opens ${owner.url}` : null;
}

export function Canvas({
  selection,
  onSelectionChange,
}: {
  selection: Rect | null;
  onSelectionChange: (rect: Rect | null) => void;
}) {
  const { board, bannerToday, ownerOfBannerToday } = useBoardCanvasData();
  const boxRef = useRef<HTMLDivElement | null>(null);
  const cv = useCanvasTransform(boxRef);

  const [hovered, setHovered] = useState<CellRef | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null);

  const pointers = useRef(new Map<number, Pt>());
  const mode = useRef<"idle" | "select" | "pan" | "pinch" | "press">("idle");
  const anchor = useRef<CellRef | null>(null);
  const pressed = useRef<CellRef | null>(null);
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

  const openOwnerSite = useCallback(
    (at: CellRef) => {
      const cell = board.cells[at.r][at.c];
      const owner =
        cell.state === "banner"
          ? ownerOfBannerToday
          : cell.block
            ? board.ownerById.get(cell.block.ownerId)
            : null;
      // A pending block is paid for but has nothing to show yet, so it leads nowhere.
      if (!owner || cell.state === "pending") return;
      window.open(`https://${owner.url}`, "_blank", "noopener,noreferrer");
    },
    [board, ownerOfBannerToday],
  );

  const twoFinger = () => {
    const [a, b] = [...pointers.current.values()];
    return {
      dist: Math.hypot(a.x - b.x, a.y - b.y),
      mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
    };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const p = cv.localPoint(e);
    pointers.current.set(e.pointerId, p);
    e.currentTarget.setPointerCapture(e.pointerId);

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

    if (e.pointerType === "mouse" && (e.button === 1 || spaceDown.current)) {
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
      const text = at ? tooltipFor(board, ownerOfBannerToday?.name ?? null, at) : null;
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
      if (at) onSelectionChange(rectFrom(anchor.current, at));
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
    if (mode.current === "press" && pressed.current) openOwnerSite(pressed.current);
    pressed.current = null;
    if (pointers.current.size < 2 && mode.current === "pinch") mode.current = "idle";
    if (pointers.current.size === 0) mode.current = "idle";
  };

  const onDoubleClick = (e: React.MouseEvent) => {
    const p = cv.localPoint(e);
    cv.zoomAbs(cv.scale >= MAX_SCALE ? 1 : cv.scale < 2 ? 2 : MAX_SCALE, p);
  };

  const blocked = selection ? selectionBlocked(board, selection) : false;
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
      }}
      onDoubleClick={onDoubleClick}
      className="relative flex-1 cursor-crosshair overflow-hidden"
      style={{ touchAction: "none", overscrollBehavior: "none" }}
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
          selection={selection}
          blocked={blocked}
          hovered={hovered}
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

      <ZoomControls
        scale={cv.scale}
        onIn={() => cv.zoomBy(1.6)}
        onOut={() => cv.zoomBy(1 / 1.6)}
        onFit={() => cv.zoomAbs(1)}
      />
    </div>
  );
}

function ZoomControls({
  scale,
  onIn,
  onOut,
  onFit,
}: {
  scale: number;
  onIn: () => void;
  onOut: () => void;
  onFit: () => void;
}) {
  const btn =
    "bg-square text-ink hover:bg-white disabled:text-ink/30 grid h-9 w-9 place-items-center text-[17px] leading-none transition-colors duration-150";
  return (
    <div
      className="border-hairline absolute right-4 bottom-4 flex border"
      style={{ boxShadow: "var(--shadow-lift)" }}
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

/** Everything the canvas needs out of the board state, in one place. */
function useBoardCanvasData() {
  const { board, bannerToday } = useBoard();
  return {
    board,
    bannerToday,
    ownerOfBannerToday: bannerToday ? board.ownerById.get(bannerToday.ownerId) ?? null : null,
  };
}
