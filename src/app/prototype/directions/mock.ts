// PROTOTYPE — throwaway mock data for ticket 01 (three visual directions).
// Not the real data layer; ticket 03 decides that.

export const COLS = 16;
export const ROWS = 14;
export const BANNER = { r: 0, c: 0, w: 5, h: 5 };
export const PRICE_PER_SQUARE = 100;

export type Block = {
  r: number;
  c: number;
  w: number;
  h: number;
  name: string;
  bg: string;
  fg: string;
};

// Owner-supplied artwork is arbitrary colour. Every direction has to survive it.
export const TAKEN: Block[] = [
  { r: 0, c: 5, w: 3, h: 2, name: "NORTHWIND", bg: "#1B4D8F", fg: "#FFFFFF" },
  { r: 0, c: 10, w: 2, h: 2, name: "ORBIT", bg: "#F2C230", fg: "#1A1A1A" },
  { r: 2, c: 6, w: 1, h: 1, name: "K", bg: "#111111", fg: "#FFFFFF" },
  { r: 3, c: 12, w: 4, h: 3, name: "MERIDIAN CAPITAL", bg: "#0E3B2E", fg: "#E9E4D0" },
  { r: 5, c: 0, w: 2, h: 2, name: "FERRO", bg: "#C0392B", fg: "#FFFFFF" },
  { r: 5, c: 3, w: 1, h: 4, name: "TALLBOY", bg: "#5B2C87", fg: "#FFFFFF" },
  { r: 6, c: 7, w: 3, h: 2, name: "BLUE SPRUCE", bg: "#2E7D6B", fg: "#FFFFFF" },
  { r: 6, c: 12, w: 4, h: 4, name: "ATLAS FOUNDRY", bg: "#D9D2C5", fg: "#2A2620" },
  { r: 8, c: 1, w: 2, h: 2, name: "HALCYON", bg: "#E8E3DA", fg: "#222222" },
  { r: 9, c: 10, w: 2, h: 2, name: "PIXELDROP", bg: "#FF3D71", fg: "#FFFFFF" },
  { r: 10, c: 0, w: 1, h: 1, name: "S", bg: "#FFFFFF", fg: "#111111" },
  { r: 11, c: 4, w: 4, h: 2, name: "GRANDSTAND", bg: "#0F172A", fg: "#93C5FD" },
  { r: 11, c: 9, w: 2, h: 2, name: "DAYBREAK", bg: "#FF8A00", fg: "#241300" },
  { r: 12, c: 12, w: 2, h: 2, name: "NOMAD", bg: "#8A5A2B", fg: "#FDF1DC" },
];

// Paid for, artwork not supplied yet.
export const PENDING = [
  { r: 2, c: 9, w: 1, h: 1 },
  { r: 8, c: 5, w: 2, h: 1 },
  { r: 12, c: 8, w: 1, h: 2 },
  { r: 13, c: 0, w: 3, h: 1 },
];

// A live selection, so every direction has to show what a selected block looks like.
export const SELECTION = { r: 9, c: 5, w: 3, h: 2 };

export const BANNER_OWNER = {
  name: "HELIOGRAPH",
  bg: "#111827",
  fg: "#F5C242",
};

export const AUCTION = {
  topBid: 1240,
  bids: 14,
  minNextBid: 1290,
};

const covers = (b: { r: number; c: number; w: number; h: number }, r: number, c: number) =>
  r >= b.r && r < b.r + b.h && c >= b.c && c < b.c + b.w;

export function buildModel() {
  const occupied = [BANNER, ...TAKEN, ...PENDING];
  const available: { r: number; c: number; n: number }[] = [];
  let n = 0;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (covers(BANNER, r, c)) continue;
      n++;
      if (occupied.some((b) => covers(b, r, c))) continue;
      available.push({ r, c, n });
    }
  }

  const cells = (b: { w: number; h: number }) => b.w * b.h;
  const takenCount = TAKEN.reduce((sum, b) => sum + cells(b), 0);
  const pendingCount = PENDING.reduce((sum, b) => sum + cells(b), 0);

  return {
    available,
    stats: {
      total: n,
      taken: takenCount,
      pending: pendingCount,
      available: available.length,
    },
  };
}

export const selectionPrice = SELECTION.w * SELECTION.h * PRICE_PER_SQUARE;
export const selectionSquares = SELECTION.w * SELECTION.h;

export const area = (b: { r: number; c: number; w: number; h: number }) => ({
  gridRow: `${b.r + 1} / span ${b.h}`,
  gridColumn: `${b.c + 1} / span ${b.w}`,
});
