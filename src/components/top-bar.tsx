"use client";

// Wordmark left, session right. Nothing else: ticket 01 took the auction out of
// the top bar on purpose and gave it a card of its own, so the top of the screen
// never competes with the canvas.

import { useBoard } from "@/lib/board/state";
import { cellCount } from "@/lib/board/geometry";

export function TopBar() {
  const { state, dispatch, viewer, board } = useBoard();

  const owned = viewer
    ? board.blocks.filter((b) => b.ownerId === viewer.id).reduce((n, b) => n + cellCount(b.rect), 0)
    : 0;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between px-4 lg:px-8">
      <span className="font-display text-[22px] leading-none tracking-[0.01em]">200 SQUARES</span>

      {state.signedIn && viewer ? (
        <div className="flex items-center gap-4">
          <span className="text-[13px]">
            {viewer.name}
            <span className="text-faint"> · {owned} squares</span>
          </span>
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
