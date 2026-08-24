// The fixed shape of the board, and everything derived from it.
//
// The seam counts. A square is `CELL` px and the gap between two squares is 1px,
// so a cell advances by `cell + SEAM`. Ticket 02's spike ignored the seam and its
// hit-testing drifted by most of a square at the right edge of the grid.

import type { Block, Owner, Rect, SquareState } from "./types";

export const COLS = 16;
export const ROWS = 14;
/** The 1px gap between squares — the whole grid. It scales with the transform. */
export const SEAM = 1;
export const BANNER: Rect = { r: 0, c: 0, w: 5, h: 5 };
export const MAX_BLOCK = 4;
export const PRICE_PER_SQUARE = 100;
export const MIN_SCALE = 1;
export const MAX_SCALE = 4;
/** Below this rendered square size a number is unreadable. Locked by ticket 05. */
export const NUMBER_MIN_PX = 34;
/** 199 squares plus one banner = 200, which names the product. */
export const SQUARE_COUNT = COLS * ROWS - BANNER.w * BANNER.h;

export const covers = (rect: Rect, r: number, c: number) =>
  r >= rect.r && r < rect.r + rect.h && c >= rect.c && c < rect.c + rect.w;

export const isBanner = (r: number, c: number) => covers(BANNER, r, c);

export const cellCount = (rect: Rect) => rect.w * rect.h;

export const priceOf = (rect: Rect) => cellCount(rect) * PRICE_PER_SQUARE;

/** Squares are numbered 1..199, left to right and top to bottom, around the banner. */
const NUMBERS: (number | null)[][] = (() => {
  let n = 0;
  return Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => (isBanner(r, c) ? null : ++n)),
  );
})();

export const squareNumber = (r: number, c: number) => NUMBERS[r][c];

/** CSS grid placement for a rect. */
export const gridArea = (rect: Rect) => ({
  gridRow: `${rect.r + 1} / span ${rect.h}`,
  gridColumn: `${rect.c + 1} / span ${rect.w}`,
});

/** Pixel box of a rect inside the board, at scale 1. */
export const boxOf = (rect: Rect, cell: number) => {
  const step = cell + SEAM;
  return {
    left: rect.c * step,
    top: rect.r * step,
    width: rect.w * step - SEAM,
    height: rect.h * step - SEAM,
  };
};

export type Cell = {
  state: SquareState;
  n: number | null;
  block: Block | null;
};

export type BoardModel = {
  cells: Cell[][];
  blocks: Block[];
  ownerById: Map<string, Owner>;
  /** Every square nobody has bought, ready to render one by one. */
  available: { r: number; c: number; n: number }[];
  stats: { total: number; taken: number; pending: number; available: number };
};

/** The whole derived view of the board. Blocks in, squares out. */
export function buildBoard(blocks: Block[], owners: Owner[]): BoardModel {
  const cells: Cell[][] = Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => ({
      state: (isBanner(r, c) ? "banner" : "available") as SquareState,
      n: squareNumber(r, c),
      block: null,
    })),
  );

  for (const block of blocks) {
    const state: SquareState = block.artwork ? "taken" : "pending";
    for (let r = block.rect.r; r < block.rect.r + block.rect.h; r++) {
      for (let c = block.rect.c; c < block.rect.c + block.rect.w; c++) {
        cells[r][c].state = state;
        cells[r][c].block = block;
      }
    }
  }

  const available: BoardModel["available"] = [];
  let taken = 0;
  let pending = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = cells[r][c];
      if (cell.state === "available") available.push({ r, c, n: cell.n! });
      if (cell.state === "taken") taken++;
      if (cell.state === "pending") pending++;
    }
  }

  return {
    cells,
    blocks,
    ownerById: new Map(owners.map((o) => [o.id, o])),
    available,
    stats: { total: SQUARE_COUNT, taken, pending, available: available.length },
  };
}

/**
 * A contiguous rectangle from anchor to head. The span is clamped to 4 before it
 * is clamped into the grid, so the anchor corner stays put and the block stops
 * growing at 4 x 4 instead of sliding along under the pointer.
 */
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

/** A selection is only buyable when every square in it is still available. */
export function selectionBlocked(board: BoardModel, rect: Rect): boolean {
  for (let r = rect.r; r < rect.r + rect.h; r++) {
    for (let c = rect.c; c < rect.c + rect.w; c++) {
      if (board.cells[r][c].state !== "available") return true;
    }
  }
  return false;
}
