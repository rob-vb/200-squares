// A board that is filling up: ~70% of the 199 squares sold, a banner won, six
// past winners and a live auction. This is the default, because a stranger who
// opens the preview has to feel a board with things already taken.
//
// Written by hand. A generator gives an even scatter, and an even scatter is the
// one thing a real board never looks like: buyers cluster, and the holes they
// leave are the shape of the thing.

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
  makeBlock("blk_01", { r: 0, c: 5, w: 3, h: 2 }, brands.northwind),
  makeBlock("blk_02", { r: 0, c: 9, w: 2, h: 2 }, brands.orbit),
  makeBlock("blk_03", { r: 0, c: 12, w: 1, h: 1 }, brands.kilo),
  makeBlock("blk_04", { r: 0, c: 14, w: 2, h: 2 }, brands.meridian),
  makeBlock("blk_05", { r: 1, c: 12, w: 2, h: 1 }, brands.vb, { pending: true }),
  makeBlock("blk_06", { r: 2, c: 5, w: 2, h: 2 }, brands.slate),
  makeBlock("blk_07", { r: 2, c: 8, w: 1, h: 3 }, brands.tallboy),
  // Three listings, so the For sale switch does something before anyone signs
  // in: one whole block over what it cost, one strip cut off a big block, and
  // one whole block barely over the floor.
  makeBlock("blk_08", { r: 2, c: 10, w: 3, h: 2 }, brands.grandstand, { sell: { price: 850 } }),
  makeBlock("blk_09", { r: 2, c: 14, w: 1, h: 1 }, brands.dot),
  makeBlock("blk_10", { r: 3, c: 14, w: 2, h: 2 }, brands.vb),
  makeBlock("blk_11", { r: 4, c: 5, w: 1, h: 1 }, brands.ess),
  makeBlock("blk_12", { r: 4, c: 9, w: 2, h: 1 }, brands.daybreak),
  makeBlock("blk_13", { r: 4, c: 12, w: 1, h: 1 }, brands.pin),

  // The open field under the banner.
  makeBlock("blk_14", { r: 5, c: 0, w: 2, h: 2 }, brands.ferro),
  makeBlock("blk_15", { r: 5, c: 2, w: 1, h: 2 }, brands.spur),
  makeBlock("blk_16", { r: 5, c: 4, w: 3, h: 2 }, brands.bluespruce),
  makeBlock("blk_17", { r: 5, c: 8, w: 2, h: 2 }, brands.halcyon),
  makeBlock("blk_18", { r: 5, c: 11, w: 1, h: 1 }, brands.tick),
  makeBlock("blk_19", { r: 5, c: 12, w: 4, h: 3 }, brands.atlas, {
    // The right-hand column only. The block stays whole and keeps its artwork
    // until somebody buys the strip.
    sell: { price: 400, part: { r: 5, c: 15, w: 1, h: 3 } },
  }),
  makeBlock("blk_20", { r: 6, c: 10, w: 2, h: 1 }, brands.verge),
  makeBlock("blk_21", { r: 7, c: 0, w: 3, h: 2 }, brands.redcap),
  makeBlock("blk_22", { r: 7, c: 3, w: 1, h: 1 }, brands.nib),
  makeBlock("blk_23", { r: 7, c: 4, w: 2, h: 2 }, brands.pixeldrop),
  makeBlock("blk_24", { r: 7, c: 7, w: 4, h: 3 }, brands.citadel),
  makeBlock("blk_25", { r: 8, c: 12, w: 2, h: 2 }, brands.nomad),
  makeBlock("blk_26", { r: 9, c: 0, w: 2, h: 1 }, brands.hollow),
  makeBlock("blk_27", { r: 9, c: 3, w: 3, h: 2 }, brands.longshore),
  makeBlock("blk_28", { r: 10, c: 0, w: 2, h: 2 }, brands.tide, { sell: { price: 150 } }),
  makeBlock("blk_29", { r: 10, c: 7, w: 2, h: 2 }, brands.beacon, { pending: true }),
  makeBlock("blk_30", { r: 10, c: 14, w: 2, h: 2 }, brands.quarry),
  makeBlock("blk_31", { r: 11, c: 3, w: 3, h: 2 }, brands.sable),
  makeBlock("blk_32", { r: 12, c: 0, w: 2, h: 2 }, brands.harbor),
  makeBlock("blk_33", { r: 12, c: 6, w: 1, h: 2 }, brands.reed),
  makeBlock("blk_34", { r: 12, c: 10, w: 2, h: 2 }, brands.spark),
  makeBlock("blk_35", { r: 12, c: 13, w: 3, h: 1 }, brands.baseline),
  makeBlock("blk_36", { r: 13, c: 3, w: 2, h: 1 }, brands.crest),
  makeBlock("blk_37", { r: 13, c: 13, w: 2, h: 1 }, brands.linnet),
];

// Today's banner, then six days back. Offset 0 is on the canvas right now.
const bannerDays: BannerDay[] = [
  { dayOffset: 0, ownerId: "heliograph", url: brands.heliograph.url, artwork: brandArtwork(brands.heliograph), wonWith: 1180 },
  { dayOffset: -1, ownerId: "lumen", url: brands.lumen.url, artwork: brandArtwork(brands.lumen), wonWith: 940 },
  { dayOffset: -2, ownerId: "vantage", url: brands.vantage.url, artwork: brandArtwork(brands.vantage), wonWith: 1620 },
  { dayOffset: -3, ownerId: "foxglove", url: brands.foxglove.url, artwork: brandArtwork(brands.foxglove), wonWith: 700 },
  { dayOffset: -4, ownerId: "ironline", url: brands.ironline.url, artwork: brandArtwork(brands.ironline), wonWith: 1050 },
  { dayOffset: -5, ownerId: "cobalt", url: brands.cobalt.url, artwork: brandArtwork(brands.cobalt), wonWith: 480 },
  { dayOffset: -6, ownerId: "marlow", url: brands.marlow.url, artwork: brandArtwork(brands.marlow), wonWith: 330 },
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
