"use client";

// The shell every page shares: one board, one top bar.
//
// ⚠️ It takes no props any more. The prototype handed a dataset down from the
// server, which is why every page read `props.searchParams` — and that is why
// ticket 08 found all five routes building **dynamic**. The board now comes from
// Convex over a websocket the client opens after hydration, so there is nothing
// to read at render and the routes are static again.
//
// The board outlives navigation because the Convex client does (see
// `convex-provider.tsx`). A block bought on the board is already gone from the
// counter by the time /how-it-works opens.

import { ScreenProvider } from "./panel/flow";
import { TopBar } from "./top-bar";
import { BoardProvider } from "@/lib/board/board";
import { ViewerProvider } from "@/lib/board/viewer";

export function Site({ children }: { children: React.ReactNode }) {
  return (
    <BoardProvider>
      <ViewerProvider>
        <ScreenProvider>
          <TopBar />
          {children}
        </ScreenProvider>
      </ViewerProvider>
    </BoardProvider>
  );
}
