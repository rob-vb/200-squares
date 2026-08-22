"use client";

// PROTOTYPE — ticket 02, variant B: LIBRARY.
// react-zoom-pan-pinch owns the surface, so pan owns the primary drag, the way a map
// behaves. Selection can no longer be a drag, so it becomes tap-tap: tap the first
// square, tap the opposite corner. Shift-click does the same on a mouse.
// The question this variant answers: is the library's feel worth losing drag-select?

import { useLayoutEffect, useRef, useState } from "react";
import {
  TransformComponent,
  TransformWrapper,
  type ReactZoomPanPinchContentRef,
} from "react-zoom-pan-pinch";
import { Board } from "./board";
import { Controls, Hud } from "./hud";
import { COLS, MAX_SCALE, ROWS, rectFrom, selectionBlocked, type Rect } from "./grid";
import { Shell } from "./shell";

export function VariantLibrary() {
  const box = useRef<HTMLDivElement | null>(null);
  const api = useRef<ReactZoomPanPinchContentRef | null>(null);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [scale, setScale] = useState(1);
  const [t, setT] = useState({ x: 0, y: 0 });
  const [selection, setSelection] = useState<Rect | null>(null);
  const [pointer, setPointer] = useState("—");

  const anchor = useRef<{ r: number; c: number } | null>(null);
  const started = useRef<{ x: number; y: number } | null>(null);
  const closed = useRef(true);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setViewport({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cell = Math.max(4, Math.floor(Math.min(viewport.w / COLS, viewport.h / ROWS)));

  // The board is already transformed by the library, so its own rect gives the cell.
  const cellFromEvent = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const c = Math.floor(((e.clientX - rect.left) / rect.width) * COLS);
    const r = Math.floor(((e.clientY - rect.top) / rect.height) * ROWS);
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return null;
    return { r, c };
  };

  const onDown = (e: React.PointerEvent) => {
    setPointer(e.pointerType);
    started.current = { x: e.clientX, y: e.clientY };
  };

  const onUp = (e: React.PointerEvent) => {
    const s = started.current;
    started.current = null;
    // Anything that moved is a pan, not a tap. The library already handled it.
    if (!s || Math.hypot(e.clientX - s.x, e.clientY - s.y) > 6) return;
    const cell = cellFromEvent(e);
    if (!cell) return;
    if ((e.shiftKey || !closed.current) && anchor.current) {
      setSelection(rectFrom(anchor.current, cell));
      closed.current = true;
    } else {
      anchor.current = cell;
      setSelection(rectFrom(cell, cell));
      closed.current = false;
    }
  };

  const blocked = selection ? selectionBlocked(selection) : false;

  return (
    <Shell title="B — Library: drag pans">
      <div ref={box} style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {viewport.w > 0 && (
          <TransformWrapper
            ref={api}
            initialScale={1}
            minScale={1}
            maxScale={MAX_SCALE}
            limitToBounds
            centerOnInit
            centerZoomedOut
            smooth
            wheel={{ step: 0.2 }}
            pinch={{ step: 5 }}
            doubleClick={{ mode: "zoomIn", step: 0.7 }}
            panning={{ allowLeftClickPan: true, velocityDisabled: false }}
            onTransform={(_ref, state) => {
              setScale(state.scale);
              setT({ x: state.positionX, y: state.positionY });
            }}
          >
            <TransformComponent
              wrapperStyle={{ width: "100%", height: "100%" }}
              contentStyle={{ width: COLS * cell, height: ROWS * cell }}
            >
              <div onPointerDown={onDown} onPointerUp={onUp}>
                <Board cell={cell} scale={scale} selection={selection} blocked={blocked} />
              </div>
            </TransformComponent>
          </TransformWrapper>
        )}
      </div>
      <Controls
        onIn={() => api.current?.zoomIn(0.4)}
        onOut={() => api.current?.zoomOut(0.4)}
        onReset={() => api.current?.resetTransform()}
      />
      <Hud
        contract="B — LIBRARY · drag pans · tap-tap selects"
        scale={scale}
        cell={cell}
        t={t}
        viewport={viewport}
        selection={selection}
        blocked={blocked}
        pointer={pointer}
        note="tap a square, then tap the opposite corner"
      />
    </Shell>
  );
}
