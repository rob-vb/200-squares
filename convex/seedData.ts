// The seeded boards. The dev works on a VPS and sees nothing locally, so the
// only way to look at a board is to put one in a deployment.
//
// ⚠️ Everything here is invented. No real company, sale, bid or winner appears
// anywhere in this file — `PRODUCT.md` bans fabricated proof and real money does
// not lift that ban. These names exist so the ground can be checked against
// arbitrary owner colour, light and dark and loud, which is why HALCYON and
// ATLAS FOUNDRY are nearly white: they are the reason a block carries a hairline.
//
// The blocks and the bids came from the prototype's `full` and `early` datasets,
// which this file replaces. Those fed a reducer in the browser; this feeds real
// rows in Convex, so the shapes moved: no `dayOffset`, no `minutesAgo`, money in
// whole cents, and a banner day keyed on its UTC date.

export type SeedBrand = { id: string; name: string; url: string; bg: string; fg: string };

export const brands: Record<string, SeedBrand> = {
  vb: { id: "vb", name: "ROB VB", url: "robvb.com", bg: "#23261F", fg: "#DCDDD5" },

  northwind: { id: "northwind", name: "NORTHWIND", url: "northwind.co", bg: "#1B4D8F", fg: "#FFFFFF" },
  orbit: { id: "orbit", name: "ORBIT", url: "orbit.dev", bg: "#F2C230", fg: "#1A1A1A" },
  kilo: { id: "kilo", name: "K", url: "kilo.studio", bg: "#111111", fg: "#FFFFFF" },
  meridian: { id: "meridian", name: "MERIDIAN", url: "meridian.partners", bg: "#0E3B2E", fg: "#E9E4D0" },
  slate: { id: "slate", name: "SLATE", url: "slate.tools", bg: "#4B5563", fg: "#F4F5F2" },
  tallboy: { id: "tallboy", name: "TALLBOY", url: "tallboy.beer", bg: "#5B2C87", fg: "#FFFFFF" },
  grandstand: { id: "grandstand", name: "GRANDSTAND", url: "grandstand.io", bg: "#0F172A", fg: "#93C5FD" },
  dot: { id: "dot", name: "•", url: "dot.link", bg: "#D6265E", fg: "#FFFFFF" },
  ess: { id: "ess", name: "S", url: "s.company", bg: "#FFFFFF", fg: "#111111" },
  daybreak: { id: "daybreak", name: "DAYBREAK", url: "daybreak.app", bg: "#FF8A00", fg: "#241300" },
  pin: { id: "pin", name: "P", url: "pin.works", bg: "#2563EB", fg: "#FFFFFF" },

  ferro: { id: "ferro", name: "FERRO", url: "ferro.industries", bg: "#C0392B", fg: "#FFFFFF" },
  spur: { id: "spur", name: "SPUR", url: "spur.bike", bg: "#7C2D12", fg: "#FDE68A" },
  bluespruce: { id: "bluespruce", name: "BLUE SPRUCE", url: "bluespruce.farm", bg: "#2E7D6B", fg: "#FFFFFF" },
  halcyon: { id: "halcyon", name: "HALCYON", url: "halcyon.health", bg: "#E8E3DA", fg: "#222222" },
  tick: { id: "tick", name: "T", url: "tick.sh", bg: "#065F46", fg: "#D1FAE5" },
  atlas: { id: "atlas", name: "ATLAS FOUNDRY", url: "atlasfoundry.com", bg: "#D9D2C5", fg: "#2A2620" },
  verge: { id: "verge", name: "VERGE", url: "verge.supply", bg: "#1F2937", fg: "#F9FAFB" },
  redcap: { id: "redcap", name: "REDCAP", url: "redcap.games", bg: "#B91C1C", fg: "#FEF2F2" },
  pixeldrop: { id: "pixeldrop", name: "PIXELDROP", url: "pixeldrop.xyz", bg: "#FF3D71", fg: "#FFFFFF" },
  citadel: { id: "citadel", name: "CITADEL CAPITAL", url: "citadelcapital.fund", bg: "#111827", fg: "#E5C87A" },
  nib: { id: "nib", name: "N", url: "nib.ink", bg: "#3F3F46", fg: "#FAFAFA" },
  nomad: { id: "nomad", name: "NOMAD", url: "nomad.travel", bg: "#8A5A2B", fg: "#FDF1DC" },
  hollow: { id: "hollow", name: "HOLLOW", url: "hollow.audio", bg: "#18181B", fg: "#A1A1AA" },
  longshore: { id: "longshore", name: "LONGSHORE", url: "longshore.co", bg: "#0369A1", fg: "#F0F9FF" },
  tide: { id: "tide", name: "TIDE", url: "tide.money", bg: "#0891B2", fg: "#ECFEFF" },
  beacon: { id: "beacon", name: "BEACON", url: "beacon.school", bg: "#7C3AED", fg: "#FFFFFF" },
  quarry: { id: "quarry", name: "QUARRY", url: "quarry.build", bg: "#57534E", fg: "#FAFAF9" },
  sable: { id: "sable", name: "SABLE", url: "sable.design", bg: "#1C1917", fg: "#E7E5E4" },
  harbor: { id: "harbor", name: "HARBOR", url: "harbor.legal", bg: "#164E63", fg: "#CFFAFE" },
  spark: { id: "spark", name: "SPARK", url: "spark.energy", bg: "#FACC15", fg: "#1C1917" },
  baseline: { id: "baseline", name: "BASELINE", url: "baseline.fit", bg: "#15803D", fg: "#F0FDF4" },
  crest: { id: "crest", name: "CREST", url: "crest.coffee", bg: "#78350F", fg: "#FEF3C7" },
  linnet: { id: "linnet", name: "LINNET", url: "linnet.bird", bg: "#A21CAF", fg: "#FDF4FF" },
  reed: { id: "reed", name: "REED", url: "reed.paper", bg: "#374151", fg: "#F3F4F6" },

  heliograph: { id: "heliograph", name: "HELIOGRAPH", url: "heliograph.io", bg: "#111827", fg: "#F5C242" },
  lumen: { id: "lumen", name: "LUMEN", url: "lumen.works", bg: "#312E81", fg: "#C7D2FE" },
  vantage: { id: "vantage", name: "VANTAGE", url: "vantage.vc", bg: "#0C4A6E", fg: "#E0F2FE" },
  foxglove: { id: "foxglove", name: "FOXGLOVE", url: "foxglove.garden", bg: "#BE123C", fg: "#FFE4E6" },
  ironline: { id: "ironline", name: "IRONLINE", url: "ironline.rail", bg: "#292524", fg: "#FAFAF9" },
  cobalt: { id: "cobalt", name: "COBALT", url: "cobalt.mining", bg: "#1D4ED8", fg: "#EFF6FF" },
  marlow: { id: "marlow", name: "MARLOW & CO", url: "marlow.co", bg: "#F5F0E6", fg: "#3F3F46" },
};

export type Rect = { r: number; c: number; w: number; h: number };
export type SeedBlock = { brand: string; rect: Rect; pending?: boolean; clicks?: number };

const b = (
  brand: string,
  rect: Rect,
  opts: { pending?: boolean; clicks?: number } = {},
): SeedBlock => ({ brand, rect, ...opts });

/** About 70% of the 199 squares, a banner winner, and a week of past winners. */
export const FULL_BLOCKS: SeedBlock[] = [
  // Beside the banner. Busy, because this is the spot everyone wants.
  b("northwind", { r: 0, c: 5, w: 3, h: 2 }, { clicks: 1840 }),
  b("orbit", { r: 0, c: 9, w: 2, h: 2 }, { clicks: 962 }),
  b("kilo", { r: 0, c: 12, w: 1, h: 1 }, { clicks: 88 }),
  b("meridian", { r: 0, c: 14, w: 2, h: 2 }, { clicks: 431 }),
  b("vb", { r: 1, c: 12, w: 2, h: 1 }, { pending: true }),
  b("slate", { r: 2, c: 5, w: 2, h: 2 }, { clicks: 274 }),
  b("tallboy", { r: 2, c: 8, w: 1, h: 3 }, { clicks: 1205 }),
  b("grandstand", { r: 2, c: 10, w: 3, h: 2 }, { clicks: 617 }),
  b("dot", { r: 2, c: 14, w: 1, h: 1 }, { clicks: 2470 }),
  // The viewer's quiet block: live, linked, and nobody has ever clicked it.
  b("vb", { r: 3, c: 14, w: 2, h: 2 }, { clicks: 0 }),
  b("ess", { r: 4, c: 5, w: 1, h: 1 }, { clicks: 12 }),
  b("daybreak", { r: 4, c: 9, w: 2, h: 1 }, { clicks: 389 }),
  b("pin", { r: 4, c: 12, w: 1, h: 1 }, { clicks: 145 }),

  // The open field under the banner.
  b("ferro", { r: 5, c: 0, w: 2, h: 2 }, { clicks: 508 }),
  b("spur", { r: 5, c: 2, w: 1, h: 2 }, { clicks: 96 }),
  b("bluespruce", { r: 5, c: 4, w: 3, h: 2 }, { clicks: 733 }),
  b("halcyon", { r: 5, c: 8, w: 2, h: 2 }, { clicks: 1120 }),
  b("tick", { r: 5, c: 11, w: 1, h: 1 }, { clicks: 4 }),
  b("atlas", { r: 5, c: 12, w: 3, h: 3 }, { clicks: 2015 }),
  b("verge", { r: 6, c: 10, w: 2, h: 1 }, { clicks: 260 }),
  b("redcap", { r: 7, c: 0, w: 3, h: 2 }, { clicks: 1487 }),
  b("nib", { r: 7, c: 3, w: 1, h: 1 }, { clicks: 33 }),
  b("pixeldrop", { r: 7, c: 4, w: 2, h: 2 }, { clicks: 3260 }),
  b("citadel", { r: 7, c: 7, w: 3, h: 3 }, { clicks: 1042 }),
  b("nomad", { r: 8, c: 12, w: 2, h: 2 }, { clicks: 655 }),
  b("hollow", { r: 9, c: 0, w: 2, h: 1 }, { clicks: 71 }),
  b("longshore", { r: 9, c: 3, w: 3, h: 2 }, { clicks: 402 }),
  b("tide", { r: 10, c: 0, w: 2, h: 2 }, { clicks: 214 }),
  b("beacon", { r: 10, c: 7, w: 2, h: 2 }, { pending: true }),
  b("quarry", { r: 10, c: 14, w: 2, h: 2 }, { clicks: 187 }),
  // The viewer's big block, so My squares has more than a single square in it
  // before the visitor buys anything. It is 3 x 2, which is the largest thing
  // the board still has room for.
  b("vb", { r: 10, c: 9, w: 3, h: 2 }, { clicks: 2140 }),
  b("sable", { r: 11, c: 3, w: 3, h: 2 }, { clicks: 921 }),
  b("harbor", { r: 12, c: 0, w: 2, h: 2 }, { clicks: 58 }),
  b("reed", { r: 12, c: 6, w: 1, h: 2 }, { clicks: 129 }),
  b("spark", { r: 12, c: 10, w: 2, h: 2 }, { clicks: 476 }),
  b("baseline", { r: 12, c: 13, w: 3, h: 1 }, { clicks: 318 }),
  b("crest", { r: 13, c: 3, w: 2, h: 1 }, { clicks: 240 }),
  b("linnet", { r: 13, c: 13, w: 2, h: 1 }, { clicks: 19 }),
];

/** Day one: ten squares gone, and nobody has bid on the banner. */
export const EARLY_BLOCKS: SeedBlock[] = [
  b("northwind", { r: 0, c: 6, w: 2, h: 2 }, { clicks: 31 }),
  b("vb", { r: 2, c: 9, w: 1, h: 1 }, { clicks: 0 }),
  b("halcyon", { r: 6, c: 3, w: 2, h: 1 }, { pending: true }),
  b("orbit", { r: 8, c: 11, w: 1, h: 3 }, { clicks: 7 }),
];

/**
 * Today's banner, then six days back. `daysAgo: 0` is the banner on the canvas
 * right now, and its count is the low one because today is not over.
 */
export const FULL_BANNER_DAYS: { daysAgo: number; brand: string; wonWith: number; clicks: number }[] = [
  { daysAgo: 0, brand: "heliograph", wonWith: 1180, clicks: 1290 },
  { daysAgo: 1, brand: "lumen", wonWith: 940, clicks: 3480 },
  { daysAgo: 2, brand: "vantage", wonWith: 1620, clicks: 5120 },
  { daysAgo: 3, brand: "vb", wonWith: 700, clicks: 2260 },
  { daysAgo: 4, brand: "ironline", wonWith: 1050, clicks: 3905 },
  { daysAgo: 5, brand: "cobalt", wonWith: 480, clicks: 1740 },
  { daysAgo: 6, brand: "marlow", wonWith: 330, clicks: 1108 },
];

/**
 * The auction running now: fourteen bids climbing from the $100 floor.
 *
 * `minutesAgo` is resolved against the clock when the seed runs, so a board
 * seeded on Tuesday does not hold bids placed in the future on Wednesday.
 */
export const FULL_BIDS: [amountUsd: number, brand: string, minutesAgo: number][] = [
  [100, "ferro", 1310],
  [150, "orbit", 1180],
  [220, "redcap", 1040],
  [300, "tide", 900],
  [380, "spur", 790],
  [450, "pixeldrop", 700],
  [540, "longshore", 615],
  [620, "verge", 520],
  [700, "quarry", 430],
  [800, "nomad", 340],
  [900, "vb", 255],
  [1000, "harbor", 170],
  [1120, "spark", 95],
  [1240, "citadel", 38],
];
