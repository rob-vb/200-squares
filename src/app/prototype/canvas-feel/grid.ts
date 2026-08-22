// PROTOTYPE — ticket 02. Throwaway grid data for the canvas-feel spike.
// Not the real data layer; ticket 03 decides that.

export const COLS = 16;
export const ROWS = 14;
export const BANNER = { r: 0, c: 0, w: 5, h: 5 };
export const MAX_BLOCK = 4;
export const PRICE_PER_SQUARE = 100;
export const MIN_SCALE = 1;
export const MAX_SCALE = 4;
/** Below this rendered size a square number is unreadable. Locked by ticket 05. */
export const NUMBER_MIN_PX = 34;

export type Rect = { r: number; c: number; w: number; h: number };

const inRect = (rect: Rect, r: number, c: number) =>
  r >= rect.r && r < rect.r + rect.h && c >= rect.c && c < rect.c + rect.w;

export const isBanner = (r: number, c: number) => inRect(BANNER, r, c);

// Enough occupied squares that a drag runs into them for real.
export const TAKEN: (Rect & { bg: string })[] = [
  { r: 0, c: 5, w: 3, h: 2, bg: "#1B4D8F" },
  { r: 0, c: 10, w: 2, h: 2, bg: "#F2C230" },
  { r: 3, c: 12, w: 4, h: 3, bg: "#0E3B2E" },
  { r: 5, c: 0, w: 2, h: 2, bg: "#C0392B" },
  { r: 5, c: 3, w: 1, h: 4, bg: "#5B2C87" },
  { r: 6, c: 7, w: 3, h: 2, bg: "#2E7D6B" },
  { r: 8, c: 1, w: 2, h: 2, bg: "#E8E3DA" },
  { r: 9, c: 10, w: 2, h: 2, bg: "#FF3D71" },
  { r: 11, c: 4, w: 4, h: 2, bg: "#0F172A" },
  { r: 12, c: 12, w: 2, h: 2, bg: "#8A5A2B" },
];

export const PENDING: Rect[] = [
  { r: 2, c: 9, w: 1, h: 1 },
  { r: 8, c: 5, w: 2, h: 1 },
  { r: 12, c: 8, w: 1, h: 2 },
  { r: 13, c: 0, w: 3, h: 1 },
];

export type CellState = "banner" | "taken" | "pending" | "available";

const stateGrid: { state: CellState; bg?: string }[][] = Array.from({ length: ROWS }, (_, r) =>
  Array.from({ length: COLS }, (_, c) => {
    if (isBanner(r, c)) return { state: "banner" as const };
    const taken = TAKEN.find((b) => inRect(b, r, c));
    if (taken) return { state: "taken" as const, bg: taken.bg };
    if (PENDING.some((b) => inRect(b, r, c))) return { state: "pending" as const };
    return { state: "available" as const };
  }),
);

export const cellAt = (r: number, c: number) => stateGrid[r][c];

// 199 squares, numbered left to right and top to bottom around the banner.
const numberGrid: (number | null)[][] = (() => {
  let n = 0;
  return Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => (isBanner(r, c) ? null : ++n)),
  );
})();

export const numberAt = (r: number, c: number) => numberGrid[r][c];

/** Contiguous rectangle from anchor to head, clamped to the grid and to 4 x 4. */
export function rectFrom(anchor: { r: number; c: number }, head: { r: number; c: number }): Rect {
  const clampSpan = (a: number, b: number, limit: number) => {
    const dir = b >= a ? 1 : -1;
    const span = Math.min(Math.abs(b - a) + 1, MAX_BLOCK);
    const start = dir === 1 ? a : a - span + 1;
    return { start: Math.max(0, Math.min(start, limit - span)), span };
  };
  const rows = clampSpan(anchor.r, head.r, ROWS);
  const cols = clampSpan(anchor.c, head.c, COLS);
  return { r: rows.start, c: cols.start, w: cols.span, h: rows.span };
}

/** A selection is only buyable if every square in it is available. */
export function selectionBlocked(rect: Rect): boolean {
  for (let r = rect.r; r < rect.r + rect.h; r++) {
    for (let c = rect.c; c < rect.c + rect.w; c++) {
      if (cellAt(r, c).state !== "available") return true;
    }
  }
  return false;
}
