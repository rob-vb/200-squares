// The board as the client receives it.
//
// These are the shapes `convex/board.ts` sends, restated here because the canvas
// draws from them and a component should not import a generated backend type to
// know what a rectangle is. If the query's payload changes, this changes.
//
// Blocks are the only record. A square has no row of its own: its state is
// derived from the blocks and the reservations over it, so the two can never
// disagree.

/** A rectangle of cells. Zero-based, row 0 at the top. */
export type Rect = { r: number; c: number; w: number; h: number };

/**
 * A window on an image, in fractions of the image. It exists because a block can
 * be split: the part its owner keeps holds the same file, cropped to the smaller
 * rectangle, so the picture does not stretch back out to fill it. Ticket 09 uses
 * the same window for artwork that does not match a block's shape.
 */
export type Crop = { x: number; y: number; w: number; h: number };

/**
 * What an owner put on a block or a banner day.
 *
 * `upload` is the real thing: two WebP files the browser produced, served
 * through `/art/<id>` and never from Convex to a visitor (ticket 09).
 *
 * ⚠️ `seed` is colour plus a wordmark and has no file at all. It exists so the
 * dev can look at a full board on a preview URL without inventing 37 logos, and
 * `convex/seed.ts` is the only thing that ever writes one.
 */
export type Artwork =
  | { kind: "upload"; small: string; large: string; crop?: Crop }
  | { kind: "seed"; bg: string; fg: string; label: string };

/**
 * A rectangle somebody owns, as the board query sends it.
 *
 * ⚠️ Every field here is paid for on every rerun of the board query for every
 * viewer (ADR 0001). `url` and `ownerName` are in it because ticket 10 made a
 * click a native anchor — an anchor needs its address at render — and because
 * the tooltip has always named the owner. Nothing else is.
 */
export type Block = {
  /** The Convex document id. Position is not the identity. */
  id: string;
  rect: Rect;
  ownerId: string;
  ownerName: string;
  /** Where a click on this block goes, bare — no scheme. */
  url: string;
  /** null means pending — paid for, artwork not supplied yet. */
  artwork: Artwork | null;
  /** Frozen by a third strike. It renders exactly like a pending block. */
  frozen: boolean;
};

/** The banner on the canvas today. null means nobody won it: the house ad. */
export type BannerToday = {
  /** `YYYY-MM-DD`, UTC. */
  date: string;
  ownerName: string;
  url: string;
  artwork: Artwork | null;
};

/** The whole payload of `board.state`. */
export type BoardData = {
  blocks: Block[];
  /** Rectangles somebody is away paying for. They read as unavailable. */
  reserved: Rect[];
  banner: BannerToday | null;
  /** `snapshot` means the kill switch is thrown and this is a cached board. */
  mode: "live" | "snapshot";
  builtAt: number | null;
};

/**
 * One live bid on the auction running now.
 *
 * No `minutesAgo`: the model holds absolute UTC milliseconds and the client
 * renders "how long ago" against its own clock. A stored offset resolves against
 * whatever reads it, and two clocks disagree.
 */
export type Bid = {
  id: string;
  ownerId: string;
  ownerName: string;
  amountCents: number;
  placedAt: number;
};

/** The auction running right now, for tomorrow's banner. */
export type Auction = {
  date: string;
  /** The 00:00 UTC it closes at. Absolute ms. */
  closesAt: number;
  bids: Bid[];
  topCents: number | null;
  minNextCents: number;
};

/**
 * ⚠️ `reserved` is the fourth state and the only one a square leaves without
 * anybody acting. The viewer is never told the difference between it and the
 * other two unavailable states — all three simply read as taken.
 */
export type SquareState = "banner" | "taken" | "pending" | "reserved" | "available";
