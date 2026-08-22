"use client";

// PROTOTYPE — ticket 02. Hand-rolled transform core, shared by the Direct and Modal
// variants. They disagree about the drag contract, not about the maths, so the maths
// is written once. The Library variant does not use this at all — that is the point.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { COLS, MAX_SCALE, MIN_SCALE, ROWS } from "./grid";

export type Pt = { x: number; y: number };
export type Viewport = { w: number; h: number };

const clampScale = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

/** The caller owns the viewport ref, so the returned state carries no ref at all. */
export function useCanvasTransform(boxRef: React.RefObject<HTMLDivElement | null>) {
  const [viewport, setViewport] = useState<Viewport>({ w: 0, h: 0 });
  // Scale and pan are one state, so a burst of wheel or move events inside a single
  // frame composes instead of each one reading a stale value from its render.
  const [view, setView] = useState({ s: 1, x: 0, y: 0 });

  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => setViewport({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [boxRef]);

  // Scale 1 is fit: the whole 16 x 14 grid inside the canvas viewport, no crop.
  const cell = Math.max(4, Math.floor(Math.min(viewport.w / COLS, viewport.h / ROWS)));
  const contentW = COLS * cell;
  const contentH = ROWS * cell;

  /** Pan is clamped so the grid never floats off screen, and centred while it fits. */
  const clamp = useCallback(
    (x: number, y: number, s: number): Pt => {
      const w = contentW * s;
      const h = contentH * s;
      return {
        x: w <= viewport.w ? (viewport.w - w) / 2 : Math.min(0, Math.max(viewport.w - w, x)),
        y: h <= viewport.h ? (viewport.h - h) / 2 : Math.min(0, Math.max(viewport.h - h, y)),
      };
    },
    [contentW, contentH, viewport.w, viewport.h],
  );

  // The live pan is the clamped one, derived at render, so a viewport change
  // re-centres without an effect writing state back.
  const t = clamp(view.x, view.y, view.s);
  const scale = view.s;

  /** Zoom, holding the content point under `p` (viewport coords) in place. */
  const zoomAbs = useCallback(
    (next: number, p?: Pt) => {
      setView((v) => {
        const s = clampScale(next);
        const a = p ?? { x: viewport.w / 2, y: viewport.h / 2 };
        const base = clamp(v.x, v.y, v.s);
        const cx = (a.x - base.x) / v.s;
        const cy = (a.y - base.y) / v.s;
        return { s, ...clamp(a.x - cx * s, a.y - cy * s, s) };
      });
    },
    [clamp, viewport.w, viewport.h],
  );

  const zoomBy = useCallback(
    (factor: number, p?: Pt) => {
      setView((v) => {
        const s = clampScale(v.s * factor);
        const a = p ?? { x: viewport.w / 2, y: viewport.h / 2 };
        const base = clamp(v.x, v.y, v.s);
        const cx = (a.x - base.x) / v.s;
        const cy = (a.y - base.y) / v.s;
        return { s, ...clamp(a.x - cx * s, a.y - cy * s, s) };
      });
    },
    [clamp, viewport.w, viewport.h],
  );

  const panBy = useCallback(
    (dx: number, dy: number) =>
      setView((v) => {
        const base = clamp(v.x, v.y, v.s);
        return { s: v.s, ...clamp(base.x + dx, base.y + dy, v.s) };
      }),
    [clamp],
  );

  /** Absolute set, for pinch: it is computed from a snapshot taken at gesture start. */
  const setTransform = useCallback(
    (s: number, x: number, y: number) => {
      const cs = clampScale(s);
      setView({ s: cs, ...clamp(x, y, cs) });
    },
    [clamp],
  );

  /** Viewport coords -> grid cell. Returns null outside the grid. */
  const toCell = useCallback(
    (p: Pt) => {
      const c = Math.floor((p.x - t.x) / scale / cell);
      const r = Math.floor((p.y - t.y) / scale / cell);
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return null;
      return { r, c };
    },
    [cell, scale, t.x, t.y],
  );

  /** Pointer event -> coords relative to the canvas viewport. */
  const localPoint = useCallback(
    (e: { clientX: number; clientY: number }) => {
      const box = boxRef.current?.getBoundingClientRect();
      return { x: e.clientX - (box?.left ?? 0), y: e.clientY - (box?.top ?? 0) };
    },
    [boxRef],
  );

  return { viewport, cell, scale, t, zoomAbs, zoomBy, setTransform, panBy, toCell, localPoint };
}

/** Wheel must zoom the canvas and must never scroll the page. React's onWheel is
 *  passive, so preventDefault only works from a listener registered by hand. */
export function useWheelZoom(
  boxRef: React.RefObject<HTMLDivElement | null>,
  onZoom: (factor: number, p: Pt) => void,
) {
  const cb = useRef(onZoom);
  useEffect(() => {
    cb.current = onZoom;
  });
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const box = el.getBoundingClientRect();
      // ctrlKey means a trackpad pinch, which arrives with much larger deltas.
      const step = e.ctrlKey ? 0.012 : 0.0022;
      cb.current(Math.exp(-e.deltaY * step), { x: e.clientX - box.left, y: e.clientY - box.top });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [boxRef]);
}
