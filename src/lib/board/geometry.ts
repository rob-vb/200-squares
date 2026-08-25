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
export const PRICE_PER_SQUARE = 250;
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

/** What a rectangle costs at a listing's price. The site's own price works the same. */
export const askingFor = (pricePerSquare: number, rect: Rect) =>
  cellCount(rect) * pricePerSquare;

/**
 * The floor on an asking price per square, only there to stop a price of nothing.
 *
 * Ticket 11 put a floor on the whole block, to keep second-hand blocks from
 * undercutting the $250 the site charges for a square. A price per square does
 * that job on its own: the buyer reads "$140 a square" against the site's "$250
 * a square" and judges. So the floor has no work left beyond refusing zero.
 */
export const MIN_ASKING = 1;
/** The site's share of a completed sale, from the seller. Listing is free. */
export const RESALE_FEE = 0.1;

export const feeOn = (price: number) => Math.round(price * RESALE_FEE);
export const sellerGets = (price: number) => price - feeOn(price);

export const sameRect = (a: Rect, b: Rect) =>
  a.r === b.r && a.c === b.c && a.w === b.w && a.h === b.h;

/**
 * A rectangle drawn from anchor to head, kept inside `bound`.
 *
 * This is `rectFrom` for a drag that lives inside something smaller than the
 * grid — a buyer drawing inside a listing, an owner drawing inside their own
 * block. It needs no 4 x 4 clamp of its own: a block is already at most 4 x 4,
 * so anything inside one is too.
 */
export function rectWithin(
  anchor: { r: number; c: number },
  head: { r: number; c: number },
  bound: Rect,
): Rect {
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(v, hi));
  const r1 = clamp(anchor.r, bound.r, bound.r + bound.h - 1);
  const r2 = clamp(head.r, bound.r, bound.r + bound.h - 1);
  const c1 = clamp(anchor.c, bound.c, bound.c + bound.w - 1);
  const c2 = clamp(head.c, bound.c, bound.c + bound.w - 1);
  return {
    r: Math.min(r1, r2),
    c: Math.min(c1, c2),
    w: Math.abs(c2 - c1) + 1,
    h: Math.abs(r2 - r1) + 1,
  };
}

/** The overlap of two rectangles, or null where they do not touch. */
export function intersect(a: Rect, b: Rect): Rect | null {
  const r = Math.max(a.r, b.r);
  const c = Math.max(a.c, b.c);
  const r2 = Math.min(a.r + a.h, b.r + b.h);
  const c2 = Math.min(a.c + a.w, b.c + b.w);
  return r2 > r && c2 > c ? { r, c, w: c2 - c, h: r2 - r } : null;
}

/**
 * What the seller is left holding once `part` is sold out of `rect`.
 *
 * A buyer takes any rectangle they like, so what is left is a rectangle with a
 * bite out of it — which is not a block, because a block renders one image and
 * an L cannot. It falls apart into at most four blocks instead: a strip above,
 * a strip below, and whatever is left to the left and right of the bite.
 *
 * The seller keeps every square they did not sell. They simply hold them as
 * more than one block, each with its own crop of the artwork they had.
 */
export function remainderOf(rect: Rect, part: Rect): Rect[] {
  const above = part.r - rect.r;
  const below = rect.r + rect.h - (part.r + part.h);
  const left = part.c - rect.c;
  const right = rect.c + rect.w - (part.c + part.w);
  const out: Rect[] = [];
  if (above > 0) out.push({ r: rect.r, c: rect.c, w: rect.w, h: above });
  if (below > 0) out.push({ r: part.r + part.h, c: rect.c, w: rect.w, h: below });
  if (left > 0) out.push({ r: part.r, c: rect.c, w: left, h: part.h });
  if (right > 0) out.push({ r: part.r, c: part.c + part.w, w: right, h: part.h });
  return out;
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
