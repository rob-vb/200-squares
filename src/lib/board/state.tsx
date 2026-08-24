"use client";

// The live board. A dataset is only the seed: from there the reducer holds what
// the visitor has changed, so buying and bidding really move the board. A reload
// puts every visitor back on the same board, which is what a demo wants.

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { buildBoard, type BoardModel } from "./geometry";
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
  | { type: "editLink"; url: string }
  | { type: "placeBid"; amount: number }
  | { type: "rivalBid"; amount: number; bidderId: string };

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
      // owner: the block goes to the viewer, and the company they typed becomes
      // the viewer's name and link. From here the top bar knows who they are.
      const block: Block = {
        id: `blk_u${state.blocks.length + 1}`,
        rect: action.rect,
        ownerId: state.viewerId,
        artwork: action.artwork,
      };
      return {
        ...state,
        signedIn: true,
        owners: state.owners.map((o) =>
          o.id === state.viewerId ? { ...o, name: action.company, url: action.url } : o,
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

    // A link belongs to the owner, not to the block: one party, one website.
    case "editLink":
      return {
        ...state,
        owners: state.owners.map((o) =>
          o.id === state.viewerId ? { ...o, url: action.url } : o,
        ),
      };

    // Bidding, like buying, makes the visitor the viewer-owner. Without it the
    // dock would have to say "you are top" to somebody it does not know yet.
    case "placeBid":
      return { ...addBid(state, action.amount, state.viewerId), signedIn: true };

    case "rivalBid":
      return { ...addBid(state, action.amount, action.bidderId), rivalUsed: true };
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
