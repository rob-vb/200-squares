"use client";

// One wrapper, one transform: translate then scale, origin 0 0. The seam is
// inside the transform, so the grid is a plate at 1x and a market at 4x.
//
// Two rules from ticket 02, both learned the hard way in the spike:
//  - scale and pan live in ONE state object. Written as two, a burst of wheel or
//    pointermove events inside a single frame each read a stale value and the
//    movement is lost.
//  - the clamped pan is derived at render, never written back to state, so a
//    viewport change re-centres on its own and "pan only when zoomed" falls out:
//    while the content fits, the clamp always returns the centred position.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { COLS, MAX_SCALE, MIN_SCALE, ROWS, SEAM } from "@/lib/board/geometry";

export type Pt = { x: number; y: number };

const clampScale = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

export function useCanvasTransform(boxRef: React.RefObject<HTMLDivElement | null>) {
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
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

  // Scale 1 is fit: the whole 16 x 14 grid, seams included, with no crop. A phone
  // is width-bound and a desktop is height-bound — which is convenient, because
  // the desktop slack is horizontal, where the detail panel goes.
  const cell = Math.max(
    4,
    Math.floor(
      Math.min(
        (viewport.w - (COLS - 1) * SEAM) / COLS,
        (viewport.h - (ROWS - 1) * SEAM) / ROWS,
      ),
    ),
  );
  /** How far one column advances: the square plus its seam. */
  const step = cell + SEAM;
  const contentW = COLS * step - SEAM;
  const contentH = ROWS * step - SEAM;

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

  const t = clamp(view.x, view.y, view.s);
  const scale = view.s;

  /** Zoom so the content point under `p` (viewport coords) stays under `p`. */
  const zoomTo = useCallback(
    (next: (current: number) => number, p?: Pt) =>
      setView((v) => {
        const s = clampScale(next(v.s));
        const a = p ?? { x: viewport.w / 2, y: viewport.h / 2 };
        const base = clamp(v.x, v.y, v.s);
        const cx = (a.x - base.x) / v.s;
        const cy = (a.y - base.y) / v.s;
        return { s, ...clamp(a.x - cx * s, a.y - cy * s, s) };
      }),
    [clamp, viewport.w, viewport.h],
  );

  const zoomAbs = useCallback((s: number, p?: Pt) => zoomTo(() => s, p), [zoomTo]);
  const zoomBy = useCallback(
    (factor: number, p?: Pt) => zoomTo((s) => s * factor, p),
    [zoomTo],
  );

  const panBy = useCallback(
    (dx: number, dy: number) =>
      setView((v) => {
        const base = clamp(v.x, v.y, v.s);
        return { s: v.s, ...clamp(base.x + dx, base.y + dy, v.s) };
      }),
    [clamp],
  );

  /** Absolute set, for pinch: recomputed every move from the gesture-start snapshot. */
  const setTransform = useCallback(
    (s: number, x: number, y: number) => {
      const cs = clampScale(s);
      setView({ s: cs, ...clamp(x, y, cs) });
    },
    [clamp],
  );

  /** Viewport coords to a grid cell. null outside the grid. */
  const toCell = useCallback(
    (p: Pt) => {
      const c = Math.floor((p.x - t.x) / scale / step);
      const r = Math.floor((p.y - t.y) / scale / step);
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return null;
      return { r, c };
    },
    [step, scale, t.x, t.y],
  );

  /** A pointer event in coordinates relative to the canvas viewport. */
  const localPoint = useCallback(
    (e: { clientX: number; clientY: number }) => {
      const box = boxRef.current?.getBoundingClientRect();
      return { x: e.clientX - (box?.left ?? 0), y: e.clientY - (box?.top ?? 0) };
    },
    [boxRef],
  );

  return { viewport, cell, step, scale, t, zoomAbs, zoomBy, setTransform, panBy, toCell, localPoint };
}

/**
 * The wheel zooms the canvas and must never scroll the page. React's onWheel is
 * registered passive, so preventDefault inside it does nothing — the listener has
 * to be attached by hand.
 */
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
      const stepSize = e.ctrlKey ? 0.012 : 0.0022;
      cb.current(Math.exp(-e.deltaY * stepSize), { x: e.clientX - box.left, y: e.clientY - box.top });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [boxRef]);
}
