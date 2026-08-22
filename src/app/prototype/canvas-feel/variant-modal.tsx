"use client";

// PROTOTYPE — ticket 02, variant C: MODAL.
// No gesture cleverness. One visible switch decides what a drag does, at every input.
//   LOOK — drag pans, a tap selects one square. The canvas behaves like a map.
//   BUY  — drag selects a rectangle, clamped to 4 x 4.
// Pinch and wheel always zoom, in both modes.
// The question this variant answers: is an explicit mode less confusing on a phone
// than a gesture the user has to discover?

import { useRef, useState } from "react";
import { Board } from "./board";
import { Controls, Hud } from "./hud";
import { MAX_SCALE, rectFrom, selectionBlocked, type Rect } from "./grid";
import { Shell } from "./shell";
import { useCanvasTransform, useWheelZoom } from "./transform";

type Pt = { x: number; y: number };
type Mode = "look" | "buy";

export function VariantModal() {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const cv = useCanvasTransform(boxRef);
  const [mode, setMode] = useState<Mode>("look");
  const [selection, setSelection] = useState<Rect | null>(null);
  const [pointer, setPointer] = useState("—");

  const pointers = useRef(new Map<number, Pt>());
  const gesture = useRef<"idle" | "select" | "pan" | "pinch">("idle");
  const anchor = useRef<{ r: number; c: number } | null>(null);
  const moved = useRef(0);
  const pinchStart = useRef({ dist: 0, mid: { x: 0, y: 0 }, scale: 1, t: { x: 0, y: 0 } });

  useWheelZoom(boxRef, (factor, p) => cv.zoomBy(factor, p));

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
    moved.current = 0;

    if (pointers.current.size === 2) {
      gesture.current = "pinch";
      const { dist, mid } = twoFinger();
      pinchStart.current = { dist, mid, scale: cv.scale, t: { ...cv.t } };
      return;
    }
    if (pointers.current.size > 2) return;

    if (mode === "buy") {
      const cell = cv.toCell(p);
      if (!cell) return;
      gesture.current = "select";
      anchor.current = e.shiftKey && anchor.current ? anchor.current : cell;
      setSelection(rectFrom(anchor.current, cell));
    } else {
      gesture.current = "pan";
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    const p = cv.localPoint(e);
    const prev = pointers.current.get(e.pointerId)!;
    pointers.current.set(e.pointerId, p);
    moved.current += Math.hypot(p.x - prev.x, p.y - prev.y);

    if (gesture.current === "pinch" && pointers.current.size === 2) {
      const { dist, mid } = twoFinger();
      const start = pinchStart.current;
      if (start.dist === 0) return;
      const next = Math.min(MAX_SCALE, Math.max(1, (start.scale * dist) / start.dist));
      const cx = (start.mid.x - start.t.x) / start.scale;
      const cy = (start.mid.y - start.t.y) / start.scale;
      cv.setTransform(next, mid.x - cx * next, mid.y - cy * next);
      return;
    }
    if (gesture.current === "pan") {
      cv.panBy(p.x - prev.x, p.y - prev.y);
      return;
    }
    if (gesture.current === "select" && anchor.current) {
      const cell = cv.toCell(p);
      if (cell) setSelection(rectFrom(anchor.current, cell));
    }
  };

  const endPointer = (e: React.PointerEvent) => {
    // In LOOK mode a tap that did not travel selects the single square under it.
    if (gesture.current === "pan" && moved.current < 6 && pointers.current.size === 1) {
      const cell = cv.toCell(cv.localPoint(e));
      if (cell) {
        anchor.current = cell;
        setSelection(rectFrom(cell, cell));
      }
    }
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) gesture.current = "idle";
  };

  const onDoubleClick = (e: React.MouseEvent) => {
    const p = cv.localPoint(e);
    cv.zoomAbs(cv.scale >= MAX_SCALE ? 1 : cv.scale < 2 ? 2 : MAX_SCALE, p);
  };

  const blocked = selection ? selectionBlocked(selection) : false;

  return (
    <Shell title="C — Modal: a switch decides">
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
          cursor: mode === "buy" ? "crosshair" : "grab",
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
        extra={
          <div style={{ display: "flex", marginLeft: 8 }}>
            {(["look", "buy"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                style={{
                  height: 36,
                  padding: "0 14px",
                  border: 0,
                  font: "13px var(--font-ui)",
                  textTransform: "uppercase",
                  background: mode === m ? "var(--color-accent)" : "var(--color-square)",
                  color: mode === m ? "#FFFFFF" : "var(--color-ink)",
                }}
              >
                {m}
              </button>
            ))}
          </div>
        }
      />
      <Hud
        contract={`C — MODAL · mode: ${mode.toUpperCase()}`}
        scale={cv.scale}
        cell={cv.cell}
        t={cv.t}
        viewport={cv.viewport}
        selection={selection}
        blocked={blocked}
        pointer={pointer}
        note={mode === "look" ? "drag pans · tap selects one square" : "drag selects a block"}
      />
    </Shell>
  );
}
