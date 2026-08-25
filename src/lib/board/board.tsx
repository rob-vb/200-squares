"use client";

// The live board, from Convex.
//
// This replaces the prototype's reducer. There is no local copy of the board any
// more and nothing is dispatched at it: every visitor subscribes to the same
// Convex query, and a block bought in Rotterdam appears in Osaka without a
// reload. That is why Convex was chosen (ADR 0001).
//
// ⚠️ The subscription is opened for **everybody**, signed in or not. Ticket 02
// recommended the opposite. Two facts move it back: Convex Free cannot bill —
// hard caps and no overage rate, so an overrun breaks the site instead of
// invoicing it, which is the dev's own rule enforced by the platform — and the
// board is cold, at most 199 sales in its whole life.
//
// ⚠️ Nothing here reads a cookie, a header or the query string. The board page
// has to be byte-identical for a stranger and for a signed-in owner, or it is
// not cacheable and ticket 02's cheapest defence is gone.

import { createContext, useContext, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/api";
import { buildBoard, type BoardModel } from "./geometry";
import type { Auction, BannerToday, BoardData } from "./types";

/** The floor bid and the step over the top bid, in whole dollars. */
export const BID_FLOOR = 100;
export const BID_STEP = 10;

/** An empty board, for the moment before the first payload lands. */
const EMPTY: BoardData = {
  blocks: [],
  reserved: [],
  banner: null,
  mode: "live",
  builtAt: null,
};

type BoardContextValue = {
  board: BoardModel;
  /** The banner on the canvas today. null means nobody won it: house ad. */
  bannerToday: BannerToday | null;
  /** The auction running now, for tomorrow's banner. null until it has loaded. */
  auction: Auction | null;
  /** Every click on every block and every banner day. An hour old on purpose. */
  siteClicks: number;
  /**
   * ⚠️ True while the kill switch is thrown: the board is a cached snapshot and
   * a purchase somewhere else will not appear until the cron catches up.
   */
  snapshot: boolean;
  /** False until the first payload arrives. The canvas draws an empty board. */
  loaded: boolean;
};

const BoardContext = createContext<BoardContextValue | null>(null);

export function BoardProvider({ children }: { children: React.ReactNode }) {
  const data = useQuery(api.board.state);
  const auction = useQuery(api.auction.live);
  const siteClicks = useQuery(api.snapshots.siteClicks);

  const value = useMemo<BoardContextValue>(() => {
    const board = data ?? EMPTY;
    return {
      board: buildBoard(board.blocks, board.reserved),
      bannerToday: board.banner,
      auction: auction ?? null,
      siteClicks: siteClicks ?? 0,
      snapshot: board.mode === "snapshot",
      loaded: data !== undefined,
    };
  }, [data, auction, siteClicks]);

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
}

export function useBoard(): BoardContextValue {
  const value = useContext(BoardContext);
  if (!value) throw new Error("useBoard must be used inside a BoardProvider");
  return value;
}
