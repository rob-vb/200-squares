"use client";

// PROTOTYPE — ticket 02. The plain 16 x 14 DOM grid. No styling worth the name:
// this spike judges feel, not looks. The direction is settled in tickets 01 and 05.

import { COLS, NUMBER_MIN_PX, ROWS, cellAt, numberAt, type Rect } from "./grid";

export function Board({
  cell,
  scale,
  selection,
  blocked,
}: {
  /** Square size in px at scale 1 — the fit size. */
  cell: number;
  scale: number;
  selection: Rect | null;
  blocked: boolean;
}) {
  const showNumbers = cell * scale >= NUMBER_MIN_PX;
  const cells = [];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const { state, bg } = cellAt(r, c);
      if (state === "banner") {
        if (r !== 0 || c !== 0) continue;
        cells.push(
          <div
            key="banner"
            style={{
              gridColumn: "1 / span 5",
              gridRow: "1 / span 5",
              background: "#111827",
              color: "#F5C242",
              display: "grid",
              placeItems: "center",
              fontFamily: "var(--font-display)",
              fontSize: cell * 0.6,
            }}
          >
            BANNER
          </div>,
        );
        continue;
      }
      cells.push(
        <div
          key={`${r}-${c}`}
          style={{
            gridColumn: c + 1,
            gridRow: r + 1,
            background:
              state === "taken"
                ? bg
                : state === "pending"
                  ? "repeating-linear-gradient(45deg, var(--color-accent) 0 2px, var(--color-square) 2px 6px)"
                  : "var(--color-square)",
            display: "grid",
            placeItems: "center",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--color-faint)",
          }}
        >
          {showNumbers && state === "available" ? numberAt(r, c) : null}
        </div>,
      );
    }
  }

  return (
    <div
      style={{
        position: "relative",
        width: COLS * cell,
        height: ROWS * cell,
        display: "grid",
        gridTemplateColumns: `repeat(${COLS}, ${cell}px)`,
        gridTemplateRows: `repeat(${ROWS}, ${cell}px)`,
        gap: 1,
        background: "var(--color-seam)",
        // The seam scales with the transform — locked by ticket 05.
      }}
    >
      {cells}
      {selection && (
        <div
          style={{
            position: "absolute",
            left: selection.c * cell,
            top: selection.r * cell,
            width: selection.w * cell,
            height: selection.h * cell,
            outline: `${2 / scale}px solid ${blocked ? "#8A1233" : "var(--color-accent)"}`,
            outlineOffset: -2 / scale,
            background: blocked ? "rgba(138,18,51,0.18)" : "rgba(214,38,94,0.10)",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}
