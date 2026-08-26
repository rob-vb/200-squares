// The fixed shape of the board, and everything derived from it.
//
// The seam counts. A square is `CELL` px and the gap between two squares is 1px,
// so a cell advances by `cell + SEAM`. Ticket 02's spike ignored the seam and its
// hit-testing drifted by most of a square at the right edge of the grid.

import type { Artwork, Block, Crop, Rect, SquareState } from "./types";

export const COLS = 16;
export const ROWS = 14;
/** The 1px gap between squares — the whole grid. It scales with the transform. */
export const SEAM = 1;
export const BANNER: Rect = { r: 0, c: 0, w: 5, h: 5 };
export const MAX_BLOCK = 3;
export const PRICE_PER_SQUARE = 250;
/** The same number in whole cents. Money is an integer everywhere it is money. */
export const PRICE_PER_SQUARE_CENTS = PRICE_PER_SQUARE * 100;
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

/** What the card is actually charged. VAT-inclusive, always (ADR 0002). */
export const priceCentsOf = (rect: Rect) => cellCount(rect) * PRICE_PER_SQUARE_CENTS;

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
  /** Every square nobody holds, ready to render one by one. */
  available: { r: number; c: number; n: number }[];
  /**
   * Every square somebody is away paying for. It is drawn as a plain tile with
   * no number: ticket 05 says the viewer is never told the difference between a
   * held square and a sold one, and a number on it would invite a wait.
   */
  reserved: { r: number; c: number }[];
  stats: { total: number; taken: number; pending: number; available: number };
};

/**
 * The whole derived view of the board. Blocks and holds in, squares out.
 *
 * ⚠️ A reserved square is neither `pending` (that means paid) nor `taken`, and
 * the viewer is never told the difference: all three read as unavailable. It is
 * the only state a square leaves without anybody acting.
 */
export function buildBoard(blocks: Block[], reserved: Rect[]): BoardModel {
  const cells: Cell[][] = Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => ({
      state: (isBanner(r, c) ? "banner" : "available") as SquareState,
      n: squareNumber(r, c),
      block: null,
    })),
  );

  // Reservations first, so a block written over one wins: the reservation is
  // what the block came out of, and a late sweep must never hide a real sale.
  for (const rect of reserved) {
    for (let r = rect.r; r < rect.r + rect.h; r++) {
      for (let c = rect.c; c < rect.c + rect.w; c++) {
        if (cells[r][c].state === "available") cells[r][c].state = "reserved";
      }
    }
  }

  for (const block of blocks) {
    // A frozen block may hold no artwork, so it reads as one waiting for some.
    const state: SquareState = block.artwork && !block.frozen ? "taken" : "pending";
    for (let r = block.rect.r; r < block.rect.r + block.rect.h; r++) {
      for (let c = block.rect.c; c < block.rect.c + block.rect.w; c++) {
        cells[r][c].state = state;
        cells[r][c].block = block;
      }
    }
  }

  const available: BoardModel["available"] = [];
  const held: BoardModel["reserved"] = [];
  let taken = 0;
  let pending = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = cells[r][c];
      if (cell.state === "available") available.push({ r, c, n: cell.n! });
      if (cell.state === "reserved") held.push({ r, c });
      if (cell.state === "taken") taken++;
      if (cell.state === "pending") pending++;
    }
  }

  return {
    cells,
    blocks,
    available,
    reserved: held,
    // `taken` and `pending` count squares somebody paid for. A reserved square
    // is in none of the three: it is not available, and nobody owns it yet.
    stats: { total: SQUARE_COUNT, taken, pending, available: available.length },
  };
}

/**
 * A contiguous rectangle from anchor to head. The span is clamped to MAX_BLOCK
 * before it is clamped into the grid, so the anchor corner stays put and the block stops
 * growing at 3 x 3 instead of sliding along under the pointer.
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
// Artwork on the page.
//
// ⚠️ Cutting a block up used to live here. It moved to `convex/lib/board.ts`,
// because both places that need it are on the server: the reservation's overlap
// check offers the loser the remainder of what they drew, and a part sale splits
// a block inside a webhook where there is no browser to re-cut anything.

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

/**
 * Where an uploaded file is served from.
 *
 * ⚠️ **Never from Convex to a visitor.** Convex Free includes only 1 GB of
 * egress, and a board that served its own artwork would spend it on a good day.
 * `/art/<storageId>` streams the file through Vercel's edge with a year-long
 * immutable cache, so Convex is read once per file per region (ticket 09).
 *
 * A new file means a new storage id means a new URL, so nothing is ever busted.
 *
 * ⚠️ The route itself arrives with
 * [ticket 20](../../../.scratch/200squares-v1/issues/20-build-artwork.md). This
 * is only the address; until that lands the only artwork on any board is seeded,
 * which is a colour and a wordmark and needs no file.
 */
export const artUrl = (storageId: string) => `/art/${storageId}`;

/**
 * The square size the `1x` set is produced against, and the multiplier for the
 * `4x`. A block's image is exactly the box the board draws, internal seams
 * included — a bought rectangle is one grid item, so the seams inside it are
 * part of the picture.
 *
 * ⚠️ The board's real square size is the viewport's, not a constant: `cell` is
 * whatever a 16 x 14 grid fits into the screen. So these are the size artwork is
 * *made* at, chosen to cover the screens the board is actually opened on — a
 * phone draws a square at about 23px and the largest desktop at about 150px, and
 * 80px carries both at fit scale.
 */
export const ART_CELL = 80;
/** The zoom the `4x` set is made for. It is `MAX_SCALE`, and it is not a coincidence. */
export const ART_ZOOM = MAX_SCALE;

/** The pixel box a rect's artwork is drawn into, at a given square size. */
export const artPixels = (rect: Rect, cell: number) => {
  const step = cell + SEAM;
  return { w: rect.w * step - SEAM, h: rect.h * step - SEAM };
};

/**
 * The two sizes the browser produced before upload: the `1x` set below 2x zoom,
 * the `4x` only above it. A phone never downloads the large one at fit scale.
 *
 * ⚠️ `onScreen` is the other half of that rule and it is a bill, not a nicety.
 * At 4x zoom about a sixteenth of the board is in view; without this every one
 * of 199 blocks would swap to its 400 KB file the moment somebody zoomed in,
 * which is 80 MB of edge traffic for one gesture. Ticket 09 asked for the large
 * set "only above 2x, lazy-loaded off-screen", and on a background image this is
 * what lazy means: the small file stays until the block is actually in view.
 */
export const artSrc = (art: Artwork, scale: number, onScreen = true) =>
  art.kind === "upload" ? artUrl(scale > 2 && onScreen ? art.large : art.small) : null;
