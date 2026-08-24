"use client";

// The live board. A dataset is only the seed: from there the reducer holds what
// the visitor has changed, so buying and bidding really move the board. A reload
// puts every visitor back on the same board, which is what a demo wants.

import { createContext, useContext, useMemo, useReducer } from "react";
import { buildBoard, type BoardModel } from "./geometry";
import type { Bid, Block, Dataset, DatasetName, Owner, BannerDay } from "./types";

export type BoardState = {
  name: DatasetName;
  owners: Owner[];
  blocks: Block[];
  bannerDays: BannerDay[];
  bids: Bid[];
  viewerId: string;
  signedIn: boolean;
};

/**
 * Ticket 09 adds `buy`, `uploadArtwork`, `editLink` and `placeBid` here, in the
 * same commit as the flows that call them. Writing them before there is a screen
 * to press would ship code nothing has ever run.
 */
export type BoardAction = { type: "signIn" } | { type: "signOut" };

export const seed = (dataset: Dataset): BoardState => ({
  name: dataset.name,
  owners: dataset.owners,
  blocks: dataset.blocks,
  bannerDays: dataset.bannerDays,
  bids: dataset.bids,
  viewerId: dataset.viewerId,
  signedIn: false,
});

export function reduce(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case "signIn":
      return { ...state, signedIn: true };
    case "signOut":
      return { ...state, signedIn: false };
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
    return {
      state,
      dispatch,
      board,
      viewer: state.owners.find((o) => o.id === state.viewerId) ?? null,
      bannerToday: state.bannerDays.find((d) => d.dayOffset === 0) ?? null,
      topBid: live.reduce<Bid | null>((top, b) => (!top || b.amount > top.amount ? b : top), null),
    };
  }, [state]);

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
}

export function useBoard(): BoardContextValue {
  const value = useContext(BoardContext);
  if (!value) throw new Error("useBoard must be used inside a BoardProvider");
  return value;
}
