// The fixed shape of the board, and everything derived from it.
//
// The seam counts. A square is `CELL` px and the gap between two squares is 1px,
// so a cell advances by `cell + SEAM`. Ticket 02's spike ignored the seam and its
// hit-testing drifted by most of a square at the right edge of the grid.

import type { Artwork, Block, Crop, Owner, Rect, SquareState } from "./types";

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
  /** The blocks whose owner has put them up for sale. Drives the For sale switch. */
  listed: Block[];
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
    listed: blocks.filter((b) => b.listing !== null),
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

/**
 * "84" for one square, "84–89" for a block. Numbering runs along a row, so a
 * block two rows tall covers a span with other people's squares inside it. This
 * is the span, not a list: the confirmation needs a name, not an inventory.
 */
export function squareRange(rect: Rect): string {
  let lo = Infinity;
  let hi = -Infinity;
  for (let r = rect.r; r < rect.r + rect.h; r++) {
    for (let c = rect.c; c < rect.c + rect.w; c++) {
      const n = squareNumber(r, c);
      if (n === null) continue;
      lo = Math.min(lo, n);
      hi = Math.max(hi, n);
    }
  }
  if (lo === Infinity) return "";
  return lo === hi ? String(lo) : `${lo}–${hi}`;
}

// ---------------------------------------------------------------------------
// Resale. Ticket 11: an owner may sell a block on, at a price they set, and the
// site keeps a share of the sale.

/** The asking price may never go under this — it is what the site charges. */
export const MIN_ASKING = PRICE_PER_SQUARE;
/** The site's share of a completed sale, from the seller. Listing is free. */
export const RESALE_FEE = 0.1;

export const feeOn = (price: number) => Math.round(price * RESALE_FEE);
export const sellerGets = (price: number) => price - feeOn(price);

export const sameRect = (a: Rect, b: Rect) =>
  a.r === b.r && a.c === b.c && a.w === b.w && a.h === b.h;

/** Which edge a cut is taken off. A whole block is sold with no cut at all. */
export type CutSide = "whole" | "top" | "bottom" | "left" | "right";

/**
 * The part of `rect` a cut of `size` off `side` covers.
 *
 * A block may only be split with a straight cut: both halves have to stay
 * rectangles, because ticket 03's model cannot hold anything else. So the part
 * offered is always the whole block or a full-width / full-height strip off one
 * of its four edges.
 */
export function cutPart(rect: Rect, side: CutSide, size: number): Rect {
  switch (side) {
    case "whole":
      return { ...rect };
    case "top":
      return { ...rect, h: size };
    case "bottom":
      return { ...rect, r: rect.r + rect.h - size, h: size };
    case "left":
      return { ...rect, w: size };
    case "right":
      return { ...rect, c: rect.c + rect.w - size, w: size };
  }
}

/** How far a cut off this side can go. 0 means the side cannot be cut at all. */
export const maxCut = (rect: Rect, side: CutSide) =>
  side === "top" || side === "bottom" ? rect.h - 1 : side === "whole" ? 0 : rect.w - 1;

/** Every side this block is wide or tall enough to cut. */
export const cutSides = (rect: Rect): CutSide[] =>
  (["top", "bottom", "left", "right"] as CutSide[]).filter((s) => maxCut(rect, s) > 0);

/**
 * What the seller is left holding once `part` is sold out of `rect`.
 *
 * null means the whole block went. Anything that is not a straight cut is a
 * programming error, not a case: the picker cannot produce one.
 */
export function remainderOf(rect: Rect, part: Rect): Rect | null {
  if (sameRect(rect, part)) return null;
  if (part.w === rect.w) {
    return part.r === rect.r
      ? { ...rect, r: rect.r + part.h, h: rect.h - part.h }
      : { ...rect, h: rect.h - part.h };
  }
  return part.c === rect.c
    ? { ...rect, c: rect.c + part.w, w: rect.w - part.w }
    : { ...rect, w: rect.w - part.w };
}

/** Read a listing's part back as the cut that produced it, for the picker. */
export function cutOf(rect: Rect, part: Rect): { side: CutSide; size: number } {
  if (sameRect(rect, part)) return { side: "whole", size: 0 };
  if (part.w === rect.w) {
    return { side: part.r === rect.r ? "top" : "bottom", size: part.h };
  }
  return { side: part.c === rect.c ? "left" : "right", size: part.w };
}

/**
 * The same artwork, cropped to a sub-rectangle of the block it was on.
 *
 * Mock artwork is a colour and a wordmark, so it has nothing to crop: it simply
 * re-fits to the smaller rectangle, which is what a wordmark does anyway. An
 * uploaded image carries a window, and windows compose — a block cut twice
 * narrows the window twice rather than losing the first cut.
 */
export function cropArtwork(art: Artwork | null, from: Rect, to: Rect): Artwork | null {
  if (!art || art.kind !== "image") return art;
  const outer = art.crop ?? { x: 0, y: 0, w: 1, h: 1 };
  return {
    ...art,
    crop: {
      x: outer.x + ((to.c - from.c) / from.w) * outer.w,
      y: outer.y + ((to.r - from.r) / from.h) * outer.h,
      w: (to.w / from.w) * outer.w,
      h: (to.h / from.h) * outer.h,
    },
  };
}

/**
 * `background-size` and `background-position` for a cropped image.
 *
 * A window narrower than the image means the image is drawn larger than its box
 * and slid across it. Percentage positioning is a ratio of the overflow, which
 * is zero when the window is full width — hence the guards.
 */
export function cropStyle(crop: Crop | undefined): React.CSSProperties {
  if (!crop) return { backgroundSize: "cover", backgroundPosition: "center" };
  return {
    backgroundSize: `${100 / crop.w}% ${100 / crop.h}%`,
    backgroundPosition: `${crop.w >= 1 ? 50 : (crop.x / (1 - crop.w)) * 100}% ${
      crop.h >= 1 ? 50 : (crop.y / (1 - crop.h)) * 100
    }%`,
  };
}
