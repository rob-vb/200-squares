// A board that is filling up: ~70% of the 199 squares sold, a banner won, six
// past winners and a live auction. This is the default, because a stranger who
// opens the preview has to feel a board with things already taken.
//
// Written by hand. A generator gives an even scatter, and an even scatter is the
// one thing a real board never looks like: buyers cluster, and the holes they
// leave are the shape of the thing.
//
// Click counts (ticket 14) are seeded the same way and for the same reason. They
// run from 0 to a few thousand and do not track block size: a 1 x 1 can be the
// busiest thing on the board and a 2 x 2 can sit at nothing. The viewer holds one
// of each — blk_38 near the top, blk_10 at zero — so My squares has to render a
// quiet block and a busy one side by side.

import type { Bid, BannerDay, Dataset } from "../types";
import { brandArtwork, brandOwner, makeBlock, type Brand } from "./brands";

const B = <const T extends Record<string, Brand>>(t: T) => t;

const brands = B({
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
});

const blocks = [
  // Beside the banner. Busy, because this is the spot everyone wants.
  makeBlock("blk_01", { r: 0, c: 5, w: 3, h: 2 }, brands.northwind, { clicks: 1840 }),
  makeBlock("blk_02", { r: 0, c: 9, w: 2, h: 2 }, brands.orbit, { clicks: 962 }),
  makeBlock("blk_03", { r: 0, c: 12, w: 1, h: 1 }, brands.kilo, { clicks: 88 }),
  makeBlock("blk_04", { r: 0, c: 14, w: 2, h: 2 }, brands.meridian, { clicks: 431 }),
  makeBlock("blk_05", { r: 1, c: 12, w: 2, h: 1 }, brands.vb, { pending: true }),
  makeBlock("blk_06", { r: 2, c: 5, w: 2, h: 2 }, brands.slate, { clicks: 274 }),
  makeBlock("blk_07", { r: 2, c: 8, w: 1, h: 3 }, brands.tallboy, { clicks: 1205 }),
  // Three listings, so the For sale switch does something before anyone signs
  // in. Every price is per square, against the site's own $250: one whole block
  // over it, one part of a big block well over it, and one whole block under it.
  makeBlock("blk_08", { r: 2, c: 10, w: 3, h: 2 }, brands.grandstand, {
    sell: { pricePerSquare: 140 },
    clicks: 617,
  }),
  makeBlock("blk_09", { r: 2, c: 14, w: 1, h: 1 }, brands.dot, { clicks: 2470 }),
  // The viewer's quiet block: live, linked, and nobody has ever clicked it.
  makeBlock("blk_10", { r: 3, c: 14, w: 2, h: 2 }, brands.vb, { clicks: 0 }),
  makeBlock("blk_11", { r: 4, c: 5, w: 1, h: 1 }, brands.ess, { clicks: 12 }),
  makeBlock("blk_12", { r: 4, c: 9, w: 2, h: 1 }, brands.daybreak, { clicks: 389 }),
  makeBlock("blk_13", { r: 4, c: 12, w: 1, h: 1 }, brands.pin, { clicks: 145 }),

  // The open field under the banner.
  makeBlock("blk_14", { r: 5, c: 0, w: 2, h: 2 }, brands.ferro, { clicks: 508 }),
  makeBlock("blk_15", { r: 5, c: 2, w: 1, h: 2 }, brands.spur, { clicks: 96 }),
  makeBlock("blk_16", { r: 5, c: 4, w: 3, h: 2 }, brands.bluespruce, { clicks: 733 }),
  makeBlock("blk_17", { r: 5, c: 8, w: 2, h: 2 }, brands.halcyon, { clicks: 1120 }),
  makeBlock("blk_18", { r: 5, c: 11, w: 1, h: 1 }, brands.tick, { clicks: 4 }),
  makeBlock("blk_19", { r: 5, c: 12, w: 4, h: 3 }, brands.atlas, {
    // The right-hand column only. The block stays whole and keeps its artwork
    // until somebody buys into the strip.
    sell: { pricePerSquare: 260, part: { r: 5, c: 15, w: 1, h: 3 } },
    clicks: 2015,
  }),
  makeBlock("blk_20", { r: 6, c: 10, w: 2, h: 1 }, brands.verge, { clicks: 260 }),
  makeBlock("blk_21", { r: 7, c: 0, w: 3, h: 2 }, brands.redcap, { clicks: 1487 }),
  makeBlock("blk_22", { r: 7, c: 3, w: 1, h: 1 }, brands.nib, { clicks: 33 }),
  makeBlock("blk_23", { r: 7, c: 4, w: 2, h: 2 }, brands.pixeldrop, { clicks: 3260 }),
  makeBlock("blk_24", { r: 7, c: 7, w: 4, h: 3 }, brands.citadel, { clicks: 1042 }),
  makeBlock("blk_25", { r: 8, c: 12, w: 2, h: 2 }, brands.nomad, { clicks: 655 }),
  makeBlock("blk_26", { r: 9, c: 0, w: 2, h: 1 }, brands.hollow, { clicks: 71 }),
  makeBlock("blk_27", { r: 9, c: 3, w: 3, h: 2 }, brands.longshore, { clicks: 402 }),
  makeBlock("blk_28", { r: 10, c: 0, w: 2, h: 2 }, brands.tide, {
    sell: { pricePerSquare: 40 },
    clicks: 214,
  }),
  makeBlock("blk_29", { r: 10, c: 7, w: 2, h: 2 }, brands.beacon, { pending: true }),
  makeBlock("blk_30", { r: 10, c: 14, w: 2, h: 2 }, brands.quarry, { clicks: 187 }),
  // The viewer's big block. Without one, My squares can only ever offer a cut of
  // depth 1: the seller side of the market is unreachable in the demo unless the
  // visitor first buys something 4 wide. It is 4 x 2, which is the largest thing
  // the board still has room for.
  makeBlock("blk_38", { r: 10, c: 9, w: 4, h: 2 }, brands.vb, { clicks: 2140 }),
  makeBlock("blk_31", { r: 11, c: 3, w: 3, h: 2 }, brands.sable, { clicks: 921 }),
  makeBlock("blk_32", { r: 12, c: 0, w: 2, h: 2 }, brands.harbor, { clicks: 58 }),
  makeBlock("blk_33", { r: 12, c: 6, w: 1, h: 2 }, brands.reed, { clicks: 129 }),
  makeBlock("blk_34", { r: 12, c: 10, w: 2, h: 2 }, brands.spark, { clicks: 476 }),
  makeBlock("blk_35", { r: 12, c: 13, w: 3, h: 1 }, brands.baseline, { clicks: 318 }),
  makeBlock("blk_36", { r: 13, c: 3, w: 2, h: 1 }, brands.crest, { clicks: 240 }),
  makeBlock("blk_37", { r: 13, c: 13, w: 2, h: 1 }, brands.linnet, { clicks: 19 }),
];

// Today's banner, then six days back. Offset 0 is on the canvas right now.
//
// Today's count is the low one because today is not over. A banner day is one
// day of clicks and this one is still being spent.
const bannerDays: BannerDay[] = [
  { dayOffset: 0, ownerId: "heliograph", url: brands.heliograph.url, artwork: brandArtwork(brands.heliograph), wonWith: 1180, clicks: 1290 },
  { dayOffset: -1, ownerId: "lumen", url: brands.lumen.url, artwork: brandArtwork(brands.lumen), wonWith: 940, clicks: 3480 },
  { dayOffset: -2, ownerId: "vantage", url: brands.vantage.url, artwork: brandArtwork(brands.vantage), wonWith: 1620, clicks: 5120 },
  // The viewer won this one. Without it the banner half of My squares — a won
  // day and what it earned — is unreachable in the demo, because the visitor
  // cannot win an auction that closes at 00:00 UTC while they watch.
  { dayOffset: -3, ownerId: "vb", url: brands.vb.url, artwork: brandArtwork(brands.vb), wonWith: 700, clicks: 2260 },
  { dayOffset: -4, ownerId: "ironline", url: brands.ironline.url, artwork: brandArtwork(brands.ironline), wonWith: 1050, clicks: 3905 },
  { dayOffset: -5, ownerId: "cobalt", url: brands.cobalt.url, artwork: brandArtwork(brands.cobalt), wonWith: 480, clicks: 1740 },
  { dayOffset: -6, ownerId: "marlow", url: brands.marlow.url, artwork: brandArtwork(brands.marlow), wonWith: 330, clicks: 1108 },
];

// The auction running now: fourteen bids climbing from the $100 floor. The
// viewer's bid sits below the top one on purpose, so being outbid is visible
// without having to do anything.
const bidLog: [amount: number, bidderId: string, minutesAgo: number][] = [
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

const bids: Bid[] = bidLog.map(([amount, bidderId, minutesAgo], i) => ({
  id: `bid_${String(i + 1).padStart(2, "0")}`,
  dayOffset: 1,
  amount,
  bidderId,
  minutesAgo,
}));

export const full: Dataset = {
  name: "full",
  owners: Object.values(brands).map(brandOwner),
  blocks,
  bannerDays,
  bids,
  viewerId: "vb",
};
