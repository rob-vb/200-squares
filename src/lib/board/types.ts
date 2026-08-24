// The data the prototype runs on. Decided in ticket 03.
//
// Blocks are the only record. A square has no row of its own: its state is
// derived from the blocks that cover it, so the two can never disagree.

/** A rectangle of cells. Zero-based, row 0 at the top. */
export type Rect = { r: number; c: number; w: number; h: number };

/**
 * What an owner put on their block. Mock artwork is colour plus a label, which
 * survives every block size from 1 x 1 to 4 x 4 and keeps owner colour the only
 * colour on the canvas. An upload produces an image with an object URL.
 */
export type Artwork =
  | { kind: "mock"; bg: string; fg: string; label: string }
  | { kind: "image"; src: string };

/**
 * One party. It exists once, however many blocks it holds.
 *
 * It carries no link. A link belongs to whatever was clicked — a block or a
 * banner day — because one party can hold several blocks and point each one at
 * a different page.
 */
export type Owner = { id: string; name: string };

export type Block = {
  /** Opaque. Position is not the identity. */
  id: string;
  rect: Rect;
  ownerId: string;
  /** Where a click on this block goes. Every block has its own. */
  url: string;
  /** null means pending — paid for, artwork not supplied yet. */
  artwork: Artwork | null;
};

/**
 * One day of banner occupancy.
 *
 * `dayOffset` 0 is the banner on the canvas today, 1 is the banner being bid on
 * right now, and -1 and down are the past winners. No absolute dates: the
 * offsets resolve against the next 00:00 UTC at render.
 */
export type BannerDay = {
  dayOffset: number;
  ownerId: string;
  /** Where a click on the banner goes on this day. */
  url: string;
  artwork: Artwork;
  /** The winning bid, USD. */
  wonWith: number;
};

export type Bid = {
  id: string;
  /** The banner day bid for. Always 1 in a dataset. */
  dayOffset: number;
  amount: number;
  bidderId: string;
  /**
   * How long ago the bid was placed, in minutes.
   *
   * Ticket 03 first wrote this as `minutesBeforeClose`. That put bids in the
   * future whenever the real clock sat earlier in the day than the stored
   * offset. Measured from now, a bid is always in the past.
   */
  minutesAgo: number;
};

export type DatasetName = "early" | "full";

export type Dataset = {
  name: DatasetName;
  owners: Owner[];
  blocks: Block[];
  /** dayOffset <= 0. No entry for 0 means nobody won: the banner is a house ad. */
  bannerDays: BannerDay[];
  /** dayOffset === 1 — the auction running right now. */
  bids: Bid[];
  /** Which owner the fake sign-in becomes. */
  viewerId: string;
};

export type SquareState = "banner" | "taken" | "pending" | "available";
