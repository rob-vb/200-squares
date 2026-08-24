// Day one: ten squares gone, nobody has bid on the banner. This dataset exists
// to check that a nearly empty board still reads as a thing worth buying into,
// and that the house ad carries the banner on its own.

import type { Dataset } from "../types";
import { brandOwner, makeBlock, type Brand } from "./brands";

const brands: Record<string, Brand> = {
  vb: { id: "vb", name: "ROB VB", url: "robvb.com", bg: "#23261F", fg: "#DCDDD5" },
  northwind: { id: "northwind", name: "NORTHWIND", url: "northwind.co", bg: "#1B4D8F", fg: "#FFFFFF" },
  halcyon: { id: "halcyon", name: "HALCYON", url: "halcyon.health", bg: "#E8E3DA", fg: "#222222" },
  orbit: { id: "orbit", name: "ORBIT", url: "orbit.dev", bg: "#F2C230", fg: "#1A1A1A" },
};

export const early: Dataset = {
  name: "early",
  owners: Object.values(brands).map(brandOwner),
  blocks: [
    makeBlock("blk_01", { r: 0, c: 6, w: 2, h: 2 }, brands.northwind),
    makeBlock("blk_02", { r: 2, c: 9, w: 1, h: 1 }, brands.vb),
    makeBlock("blk_03", { r: 6, c: 3, w: 2, h: 1 }, brands.halcyon, { pending: true }),
    makeBlock("blk_04", { r: 8, c: 11, w: 1, h: 3 }, brands.orbit),
  ],
  // No entry for dayOffset 0, so nobody won yesterday and the banner is a house ad.
  bannerDays: [],
  bids: [],
  viewerId: "vb",
};
