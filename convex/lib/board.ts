// The board's fixed shape, on the server.
//
// It is a copy of the numbers in `src/lib/board/geometry.ts` on purpose: a
// Convex function may not import from the Next.js app, and a mutation that
// trusts the client's idea of where the banner is has no overlap check at all.
// If one of these numbers changes, both files change.

export type Rect = { r: number; c: number; w: number; h: number };

export const COLS = 16;
export const ROWS = 14;
export const BANNER: Rect = { r: 0, c: 0, w: 5, h: 5 };
export const MAX_BLOCK = 4;
/** 199 squares plus one banner = 200, which names the product. */
export const SQUARE_COUNT = COLS * ROWS - BANNER.w * BANNER.h;

export const covers = (rect: Rect, r: number, c: number) =>
  r >= rect.r && r < rect.r + rect.h && c >= rect.c && c < rect.c + rect.w;

export const cellCount = (rect: Rect) => rect.w * rect.h;

/** Two rectangles share at least one cell. */
export const overlaps = (a: Rect, b: Rect) =>
  a.c < b.c + b.w && b.c < a.c + a.w && a.r < b.r + b.h && b.r < a.r + a.h;

/** The overlap of two rectangles, or null where they do not touch. */
export function intersect(a: Rect, b: Rect): Rect | null {
  const r = Math.max(a.r, b.r);
  const c = Math.max(a.c, b.c);
  const r2 = Math.min(a.r + a.h, b.r + b.h);
  const c2 = Math.min(a.c + a.w, b.c + b.w);
  return r2 > r && c2 > c ? { r, c, w: c2 - c, h: r2 - r } : null;
}

/**
 * What is left of `rect` once `part` is taken out of it.
 *
 * The leftover is a rectangle with a bite out of it, which is not a block: a
 * block renders one image and an L cannot. So it falls apart into at most four
 * rectangles — a strip above, a strip below, and whatever is left either side.
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
 * Whether a rectangle is one the site could ever sell.
 *
 * Checked on the server, because the client's copy of the rules is a courtesy
 * to the visitor and not a control. A rectangle off the grid, bigger than 4 x 4
 * or lying over the banner is refused before anything is read.
 */
export function rectIsSellable(rect: Rect): boolean {
  if (!Number.isInteger(rect.r) || !Number.isInteger(rect.c)) return false;
  if (!Number.isInteger(rect.w) || !Number.isInteger(rect.h)) return false;
  if (rect.w < 1 || rect.h < 1 || rect.w > MAX_BLOCK || rect.h > MAX_BLOCK) return false;
  if (rect.r < 0 || rect.c < 0) return false;
  if (rect.r + rect.h > ROWS || rect.c + rect.w > COLS) return false;
  if (overlaps(rect, BANNER)) return false;
  return true;
}

/**
 * The largest rectangle of `rect` that survives `taken`, or null.
 *
 * This is what the loser of a race is offered instead. Ticket 05: the loser is
 * not shown an error and sent away — their selection is redrawn without the part
 * that went, and a 2 x 2 that lost one square becomes a 1 x 2 in one tap. Only a
 * total overlap leaves nothing to show.
 *
 * The remainder of a rectangle with one bite out of it is up to four rectangles,
 * and biting repeatedly splits those again. So this walks every piece against
 * every taken rectangle and keeps the biggest thing still whole. The board is
 * 16 x 14 and a selection is at most 4 x 4, so the walk is tiny.
 */
export function largestFreePart(rect: Rect, taken: Rect[]): Rect | null {
  let pieces: Rect[] = [rect];
  for (const t of taken) {
    const next: Rect[] = [];
    for (const piece of pieces) {
      const hit = intersect(piece, t);
      if (!hit) {
        next.push(piece);
        continue;
      }
      next.push(...remainderOf(piece, hit));
    }
    pieces = next;
    if (pieces.length === 0) return null;
  }
  return pieces.reduce<Rect | null>(
    (best, p) => (!best || cellCount(p) > cellCount(best) ? p : best),
    null,
  );
}
