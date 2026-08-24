"use client";

// The shell every page shares: one board, one top bar.
//
// The dataset is read on the server, by the page, and handed down — so every
// page renders its markup on the server. Nothing here reads the query string on
// the client: a hook that did would opt the whole page out of server rendering,
// and these pages are mostly text.
//
// The board is seeded per page, so navigating resets it. That is the rule ticket
// 03 already set for a reload: a demo wants every visitor on the same board.

import { ScreenProvider } from "./panel/flow";
import { TopBar } from "./top-bar";
import { BoardProvider } from "@/lib/board/state";
import type { Dataset } from "@/lib/board/types";

export function Site({ dataset, children }: { dataset: Dataset; children: React.ReactNode }) {
  return (
    <BoardProvider dataset={dataset}>
      <ScreenProvider>
        <TopBar />
        {children}
      </ScreenProvider>
    </BoardProvider>
  );
}
