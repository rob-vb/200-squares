"use client";

// Wordmark left, session right. Nothing else: ticket 01 took the auction out of
// the top bar on purpose and gave it a card of its own, so the top of the screen
// never competes with the canvas.
//
// Sign in stays a one-click toggle. A fake form would add nothing to the idea
// being sold, and buying needs no sign-in at all.

import { useScreen } from "./panel/flow";
import { useBoard } from "@/lib/board/state";
import { cellCount } from "@/lib/board/geometry";

export function TopBar() {
  const { state, dispatch, viewer, viewerBlocks } = useBoard();
  const { openMine } = useScreen();

  const owned = viewerBlocks.reduce((n, b) => n + cellCount(b.rect), 0);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between px-4 lg:px-8">
      {/* The wordmark is the page's heading. Nothing above the canvas outranks it. */}
      <h1 className="font-display text-[22px] leading-none tracking-[0.01em]">200 SQUARES</h1>

      {state.signedIn && viewer ? (
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={openMine}
            className="hover:text-accent text-[13px] transition-colors duration-150"
          >
            {viewer.name}
            <span className="text-faint"> · {owned} squares</span>
          </button>
          <button
            type="button"
            className="text-faint hover:text-ink text-[13px] transition-colors duration-150"
            onClick={() => dispatch({ type: "signOut" })}
          >
            Sign out
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="text-[14px] font-medium"
          onClick={() => dispatch({ type: "signIn" })}
        >
          Sign in
        </button>
      )}
    </header>
  );
}
