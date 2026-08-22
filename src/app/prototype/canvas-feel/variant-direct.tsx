"use client";

// PROTOTYPE — ticket 02, variant A: DIRECT.
// Bet: buying is the point, so selection owns the primary drag at every input.
//   mouse — drag selects, wheel zooms at the cursor, middle-drag or space-drag pans,
//           double-click steps the zoom, shift-click extends the selection.
//   touch — one finger selects, two fingers pan and pinch. A second finger cancels
//           the selection that the first one started.

import { useEffect, useRef, useState } from "react";
import { Board } from "./board";
import { Controls, Hud } from "./hud";
import { MAX_SCALE, rectFrom, selectionBlocked, type Rect } from "./grid";
import { Shell } from "./shell";
import { useCanvasTransform, useWheelZoom } from "./transform";

type Pt = { x: number; y: number };

export function VariantDirect() {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const cv = useCanvasTransform(boxRef);
  const [selection, setSelection] = useState<Rect | null>(null);
  const [pointer, setPointer] = useState("—");

  const pointers = useRef(new Map<number, Pt>());
  const mode = useRef<"idle" | "select" | "pan" | "pinch">("idle");
  const anchor = useRef<{ r: number; c: number } | null>(null);
  const lastPan = useRef<Pt>({ x: 0, y: 0 });
  const pinchStart = useRef({ dist: 0, mid: { x: 0, y: 0 }, scale: 1, t: { x: 0, y: 0 } });
  const spaceDown = useRef(false);

  useWheelZoom(boxRef, (factor, p) => cv.zoomBy(factor, p));

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === "Space") spaceDown.current = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space") spaceDown.current = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  const twoFinger = () => {
    const [a, b] = [...pointers.current.values()];
    return {
      dist: Math.hypot(a.x - b.x, a.y - b.y),
      mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
    };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    setPointer(e.pointerType);
    const p = cv.localPoint(e);
    pointers.current.set(e.pointerId, p);
    e.currentTarget.setPointerCapture(e.pointerId);

    if (pointers.current.size === 2) {
      // The second finger overrides whatever the first one was doing.
      mode.current = "pinch";
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
    const cell = cv.toCell(p);
    if (!cell) return;
    mode.current = "select";
    if (e.shiftKey && anchor.current) {
      setSelection(rectFrom(anchor.current, cell));
    } else {
      anchor.current = cell;
      setSelection(rectFrom(cell, cell));
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    const p = cv.localPoint(e);
    const prev = pointers.current.get(e.pointerId)!;
    pointers.current.set(e.pointerId, p);

    if (mode.current === "pinch" && pointers.current.size === 2) {
      const { dist, mid } = twoFinger();
      const start = pinchStart.current;
      if (start.dist === 0) return;
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
      const cell = cv.toCell(p);
      if (cell) setSelection(rectFrom(anchor.current, cell));
    }
  };

  const endPointer = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2 && mode.current === "pinch") mode.current = "idle";
    if (pointers.current.size === 0) mode.current = "idle";
  };

  const onDoubleClick = (e: React.MouseEvent) => {
    const p = cv.localPoint(e);
    cv.zoomAbs(cv.scale >= MAX_SCALE ? 1 : cv.scale < 2 ? 2 : MAX_SCALE, p);
  };

  const blocked = selection ? selectionBlocked(selection) : false;

  return (
    <Shell title="A — Direct: drag selects">
      <div
        ref={boxRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onDoubleClick={onDoubleClick}
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          touchAction: "none",
          overscrollBehavior: "none",
          cursor: "crosshair",
        }}
      >
        <div
          style={{
            position: "absolute",
            transformOrigin: "0 0",
            transform: `translate(${cv.t.x}px, ${cv.t.y}px) scale(${cv.scale})`,
          }}
        >
          <Board cell={cv.cell} scale={cv.scale} selection={selection} blocked={blocked} />
        </div>
      </div>
      <Controls
        onIn={() => cv.zoomBy(1.5)}
        onOut={() => cv.zoomBy(1 / 1.5)}
        onReset={() => cv.zoomAbs(1)}
      />
      <Hud
        contract="A — DIRECT · drag selects · 2 fingers pan+pinch"
        scale={cv.scale}
        cell={cv.cell}
        t={cv.t}
        viewport={cv.viewport}
        selection={selection}
        blocked={blocked}
        pointer={pointer}
        note="mouse: space or middle drag to pan"
      />
    </Shell>
  );
}
