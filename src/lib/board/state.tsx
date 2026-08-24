"use client";

// The live board. A dataset is only the seed: from there the reducer holds what
// the visitor has changed, so buying and bidding really move the board. A reload
// puts every visitor back on the same board, which is what a demo wants.

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { buildBoard, cropArtwork, intersect, remainderOf, type BoardModel } from "./geometry";
import type { Artwork, Bid, Block, Dataset, DatasetName, Owner, BannerDay, Rect } from "./types";

/** The floor bid, and the step above the top bid. Ticket 06 keeps both as placeholders. */
export const BID_FLOOR = 100;
export const BID_STEP = 10;
/** The single fake rival: how long it waits, and how far over the visitor it goes. */
const RIVAL_DELAY_MS = 20_000;
const RIVAL_OVERBID = 60;

export type BoardState = {
  name: DatasetName;
  owners: Owner[];
  blocks: Block[];
  bannerDays: BannerDay[];
  bids: Bid[];
  viewerId: string;
  signedIn: boolean;
  /** The fake rival outbids the visitor once, and never again. */
  rivalUsed: boolean;
};

export type BoardAction =
  | { type: "signIn" }
  | { type: "signOut" }
  | { type: "buy"; rect: Rect; company: string; url: string; artwork: Artwork | null }
  | { type: "uploadArtwork"; blockId: string; artwork: Artwork }
  | { type: "editLink"; blockId: string; url: string }
  | { type: "placeBid"; amount: number }
  | { type: "rivalBid"; amount: number; bidderId: string }
  /** Somebody followed a block, or a banner day, off the board. Ticket 14. */
  | { type: "clickThrough"; blockId: string }
  | { type: "clickBanner"; dayOffset: number }
  | { type: "list"; blockId: string; rect: Rect; pricePerSquare: number }
  | { type: "unlist"; blockId: string }
  | {
      type: "buyListing";
      blockId: string;
      /** The rectangle the buyer drew inside the listing. One square is allowed. */
      rect: Rect;
      company: string;
      url: string;
      artwork: Artwork | null;
    };

export const seed = (dataset: Dataset): BoardState => ({
  name: dataset.name,
  owners: dataset.owners,
  blocks: dataset.blocks,
  bannerDays: dataset.bannerDays,
  bids: dataset.bids,
  viewerId: dataset.viewerId,
  signedIn: false,
  rivalUsed: false,
});

const addBid = (state: BoardState, amount: number, bidderId: string): BoardState => ({
  ...state,
  bids: [
    ...state.bids,
    { id: `bid_u${state.bids.length + 1}`, dayOffset: 1, amount, bidderId, minutesAgo: 0 },
  ],
});

export function reduce(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case "signIn":
      return { ...state, signedIn: true };

    case "signOut":
      return { ...state, signedIn: false };

    case "buy": {
      // Buying needs no sign-in, so the purchase is what makes the visitor an
      // owner: the block goes to the viewer, the company they typed becomes the
      // viewer's name, and the website they typed goes on the block itself.
      const block: Block = {
        id: `blk_u${state.blocks.length + 1}`,
        rect: action.rect,
        ownerId: state.viewerId,
        url: action.url,
        artwork: action.artwork,
        listing: null,
        clicks: 0,
      };
      return {
        ...state,
        signedIn: true,
        owners: state.owners.map((o) =>
          o.id === state.viewerId ? { ...o, name: action.company } : o,
        ),
        blocks: [...state.blocks, block],
      };
    }

    case "uploadArtwork":
      return {
        ...state,
        blocks: state.blocks.map((b) =>
          b.id === action.blockId ? { ...b, artwork: action.artwork } : b,
        ),
      };

    // A link belongs to the block. One owner can hold several blocks and send
    // each one somewhere else.
    case "editLink":
      return {
        ...state,
        blocks: state.blocks.map((b) =>
          b.id === action.blockId ? { ...b, url: action.url } : b,
        ),
      };

    // Bidding, like buying, makes the visitor the viewer-owner. Without it the
    // dock would have to say "you are top" to somebody it does not know yet.
    case "placeBid":
      return { ...addBid(state, action.amount, state.viewerId), signedIn: true };

    case "rivalBid":
      return { ...addBid(state, action.amount, action.bidderId), rivalUsed: true };

    // A click adds one to a number and the visitor is forgotten in the same
    // instant. Nothing is stored about them — no identifier, no session, no time —
    // which is exactly why the site can say it counts clicks and not people.
    case "clickThrough":
      return {
        ...state,
        blocks: state.blocks.map((b) =>
          b.id === action.blockId ? { ...b, clicks: b.clicks + 1 } : b,
        ),
      };

    case "clickBanner":
      return {
        ...state,
        bannerDays: state.bannerDays.map((d) =>
          d.dayOffset === action.dayOffset ? { ...d, clicks: d.clicks + 1 } : d,
        ),
      };

    // Listing changes nothing on the board: the block is whole, the squares under
    // it are still `taken`, and the artwork is still the seller's. Setting a new
    // price is the same action, which is why there is no separate reprice.
    case "list":
      return {
        ...state,
        blocks: state.blocks.map((b) =>
          b.id === action.blockId
            ? { ...b, listing: { rect: action.rect, pricePerSquare: action.pricePerSquare } }
            : b,
        ),
      };

    case "unlist":
      return {
        ...state,
        blocks: state.blocks.map((b) => (b.id === action.blockId ? { ...b, listing: null } : b)),
      };

    // The sale is the moment the block splits. Until here a listing was only a
    // window on a whole block; now the buyer's rectangle becomes a block of its
    // own and the seller keeps everything else.
    //
    // "Everything else" is a rectangle with a bite out of it, so the seller ends
    // up holding up to four blocks instead of one, each with the artwork cropped
    // to it. That is the price of selling part of a block, and it is the owner's
    // to pay: a block renders one image, and an L cannot.
    //
    // Each remaining block stays on the market for whatever part of it was still
    // on offer, at the same price per square. So a listing survives its own
    // partial sale without the seller having to put it back up.
    //
    // Nothing of the seller's travels to the buyer. The buyer's own website goes
    // on, and their artwork if they brought any — `pending` until they do,
    // exactly like a fresh purchase. The click count is the third thing that
    // stays behind: it measures what the seller's image and link earned, and the
    // buyer is not buying either of those.
    //
    // The seller keeps their whole total, undivided. Splitting it over the pieces
    // a cut leaves behind would be invention — the site never knew which square
    // was clicked, only which block — so the count lands on the largest piece the
    // seller keeps and the others start at nothing. The board's total is
    // unchanged by a part sale, which is what makes the public number honest.
    case "buyListing": {
      const sold = state.blocks.find((b) => b.id === action.blockId);
      if (!sold?.listing) return state;
      const offered = sold.listing.rect;
      const part = action.rect;

      const bought: Block = {
        id: `blk_u${state.blocks.length + 1}`,
        rect: part,
        ownerId: state.viewerId,
        url: action.url,
        artwork: action.artwork,
        listing: null,
        clicks: 0,
      };
      const remainder = remainderOf(sold.rect, part);
      const biggest = remainder.reduce(
        (best, rect, i) => (rect.w * rect.h > remainder[best].w * remainder[best].h ? i : best),
        0,
      );
      const kept: Block[] = remainder.map((rect, i) => {
        const stillOffered = intersect(rect, offered);
        return {
          ...sold,
          id: `${sold.id}_${i + 1}`,
          rect,
          artwork: cropArtwork(sold.artwork, sold.rect, rect),
          listing: stillOffered
            ? { rect: stillOffered, pricePerSquare: sold.listing!.pricePerSquare }
            : null,
          clicks: i === biggest ? sold.clicks : 0,
        };
      });

      return {
        ...state,
        signedIn: true,
        owners: state.owners.map((o) =>
          o.id === state.viewerId ? { ...o, name: action.company } : o,
        ),
        blocks: [...state.blocks.filter((b) => b.id !== sold.id), ...kept, bought],
      };
    }
  }
}

type BoardContextValue = {
  state: BoardState;
  dispatch: React.Dispatch<BoardAction>;
  board: BoardModel;
  viewer: Owner | null;
  /** The banner on the canvas today. null means nobody won it: house ad. */
  bannerToday: BannerDay | null;
  /** The highest bid on the auction running now. It is derived, never stored. */
  topBid: Bid | null;
  /** Every bid on the running auction, newest first. */
  liveBids: Bid[];
  minNextBid: number;
  viewerIsTopBidder: boolean;
  /** The viewer bid and somebody went over them. */
  viewerOutbid: boolean;
  viewerBlocks: Block[];
  /** Past banner days the viewer won, newest first. Each carries its own count. */
  viewerBannerDays: BannerDay[];
  /**
   * Every click on every block and every banner day, added up. The one public
   * number: it names no owner and no block, so it answers "does this board get
   * any traffic?" without turning the canvas into a leaderboard.
   */
  siteClicks: number;
};

const BoardContext = createContext<BoardContextValue | null>(null);

export function BoardProvider({
  dataset,
  children,
}: {
  dataset: Dataset;
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(reduce, dataset, seed);

  const value = useMemo<BoardContextValue>(() => {
    const board = buildBoard(state.blocks, state.owners);
    const live = state.bids.filter((b) => b.dayOffset === 1);
    const topBid = live.reduce<Bid | null>(
      (top, b) => (!top || b.amount > top.amount ? b : top),
      null,
    );
    // The seeded viewer already has a bid in the `full` dataset, which is what
    // makes being outbid visible. It is only *theirs* once they are signed in:
    // a stranger must not be told they were outbid.
    const viewerIsTopBidder = state.signedIn && topBid?.bidderId === state.viewerId;
    return {
      state,
      dispatch,
      board,
      viewer: state.owners.find((o) => o.id === state.viewerId) ?? null,
      bannerToday: state.bannerDays.find((d) => d.dayOffset === 0) ?? null,
      topBid,
      liveBids: [...live].reverse(),
      minNextBid: topBid ? topBid.amount + BID_STEP : BID_FLOOR,
      viewerIsTopBidder,
      viewerOutbid:
        state.signedIn &&
        !viewerIsTopBidder &&
        live.some((b) => b.bidderId === state.viewerId),
      viewerBlocks: state.blocks.filter((b) => b.ownerId === state.viewerId),
      viewerBannerDays: state.bannerDays
        .filter((d) => d.ownerId === state.viewerId)
        .sort((a, b) => b.dayOffset - a.dayOffset),
      siteClicks:
        state.blocks.reduce((n, b) => n + b.clicks, 0) +
        state.bannerDays.reduce((n, d) => n + d.clicks, 0),
    };
  }, [state]);

  // The one fake rival. It lives here and not in the panel, because the visitor
  // must be outbid whether or not they left the bid flow open — that is the
  // whole point of an auction that runs while you look away.
  const { topBid } = value;
  const topBidId = topBid?.id ?? null;
  const topBidAmount = topBid?.amount ?? 0;
  useEffect(() => {
    if (state.rivalUsed || !topBidId) return;
    if (!state.signedIn || topBid?.bidderId !== state.viewerId) return;
    // The rival is whoever the visitor just went over, so a familiar name comes
    // back at them. On an empty auction it is any other owner.
    const runnerUp = state.bids
      .filter((b) => b.dayOffset === 1 && b.bidderId !== state.viewerId)
      .reduce<Bid | null>((top, b) => (!top || b.amount > top.amount ? b : top), null);
    const rivalId = runnerUp?.bidderId ?? state.owners.find((o) => o.id !== state.viewerId)?.id;
    if (!rivalId) return;
    const id = setTimeout(
      () => dispatch({ type: "rivalBid", amount: topBidAmount + RIVAL_OVERBID, bidderId: rivalId }),
      RIVAL_DELAY_MS,
    );
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topBidId, topBidAmount, state.rivalUsed, state.viewerId, state.signedIn]);

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
}

export function useBoard(): BoardContextValue {
  const value = useContext(BoardContext);
  if (!value) throw new Error("useBoard must be used inside a BoardProvider");
  return value;
}
