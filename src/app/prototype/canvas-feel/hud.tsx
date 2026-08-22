"use client";

// PROTOTYPE — ticket 02. The readout. Every variant surfaces its full transform state
// so the numbers in the ticket's answer come from a real device, not from a guess.

import { NUMBER_MIN_PX, PRICE_PER_SQUARE, type Rect } from "./grid";

export type HudState = {
  contract: string;
  scale: number;
  cell: number;
  t: { x: number; y: number };
  viewport: { w: number; h: number };
  selection: Rect | null;
  blocked: boolean;
  pointer: string;
  note?: string;
};

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <span style={{ opacity: 0.65 }}>{k}</span>
      <span>{v}</span>
    </div>
  );
}

export function Hud(s: HudState) {
  const rendered = s.cell * s.scale;
  return (
    <div
      style={{
        position: "fixed",
        top: 8,
        right: 8,
        zIndex: 40,
        width: 232,
        padding: "8px 10px",
        background: "rgba(35,38,31,0.92)",
        color: "#EEEFE9",
        font: "11px/1.6 var(--font-mono)",
      }}
    >
      <div style={{ marginBottom: 6, opacity: 0.8 }}>{s.contract}</div>
      <Row k="zoom" v={`${s.scale.toFixed(2)}x`} />
      <Row k="square @1x" v={`${s.cell}px`} />
      <Row
        k="square now"
        v={`${Math.round(rendered)}px ${rendered >= NUMBER_MIN_PX ? "· numbers" : "· no numbers"}`}
      />
      <Row k="pan" v={`${Math.round(s.t.x)}, ${Math.round(s.t.y)}`} />
      <Row k="viewport" v={`${s.viewport.w} x ${s.viewport.h}`} />
      <Row k="input" v={s.pointer} />
      <Row
        k="selection"
        v={
          s.selection
            ? `${s.selection.w} x ${s.selection.h} · $${s.selection.w * s.selection.h * PRICE_PER_SQUARE}${s.blocked ? " · BLOCKED" : ""}`
            : "none"
        }
      />
      {s.note && <div style={{ marginTop: 6, opacity: 0.7 }}>{s.note}</div>}
    </div>
  );
}

export function Controls({
  onIn,
  onOut,
  onReset,
  extra,
}: {
  onIn: () => void;
  onOut: () => void;
  onReset: () => void;
  extra?: React.ReactNode;
}) {
  const btn: React.CSSProperties = {
    minWidth: 36,
    height: 36,
    padding: "0 10px",
    background: "var(--color-ink)",
    color: "#EEEFE9",
    font: "13px var(--font-ui)",
    border: 0,
  };
  return (
    <div style={{ position: "fixed", left: 8, bottom: 56, zIndex: 40, display: "flex", gap: 4 }}>
      <button type="button" style={btn} onClick={onOut} aria-label="Zoom out">
        &minus;
      </button>
      <button type="button" style={btn} onClick={onIn} aria-label="Zoom in">
        +
      </button>
      <button type="button" style={btn} onClick={onReset}>
        Fit
      </button>
      {extra}
    </div>
  );
}
