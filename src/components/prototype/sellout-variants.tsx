"use client";

// ⚠️ PROTOTYPE — ticket 27. Throwaway. Do not build on this.
//
// Three variants of one sentence at two moments, switchable on
// `/prototype/sellout?variant=A&sold=1`:
//
//   the promise — while squares are still for sale, the top bar says that a
//   full board means owners may sell theirs on;
//   the day     — what that same line says once `available` reaches zero.
//
// The variants disagree about **placement**, about **how short the sentence
// gets**, and — the one that matters — about **what the line does on the day**.
// Resale is V1.1, so on the day the board fills, resale does not exist yet: a
// line that reads present tense on that day is false on that day. A keeps it
// future, B turns it into a status, C removes it and lets the board carry the
// fact by itself.

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PAGES } from "../nav";
import { useScreen } from "../panel/flow";
import { useViewer } from "@/lib/board/viewer";
import { useBoard } from "@/lib/board/board";
import { cellCount, MAX_BLOCK, PRICE_PER_SQUARE, SQUARE_COUNT } from "@/lib/board/geometry";

export const VARIANTS = ["A", "B", "C"] as const;
export type Variant = (typeof VARIANTS)[number];

export const NAMES: Record<Variant, string> = {
  A: "Beside the links · stays a promise",
  B: "Right of the session · becomes a status",
  C: "A strip of its own · goes quiet on the day",
};

/** The promise, before the board is full. Three shortest-true forms. */
const PROMISE: Record<Variant, string> = {
  A: "When all 199 are sold, owners can sell theirs on.",
  B: "Owners can sell theirs on once the board is full.",
  C: "Resale opens when the board is full.",
};

/**
 * The same sentence on the day. ⚠️ Resale is not built on that day, so present
 * tense is a lie and future tense is the promise coming due.
 */
const ON_THE_DAY: Record<Variant, string | null> = {
  A: "All 199 sold. Owners will be able to sell theirs on.",
  B: "Sold out. Resale is not open yet.",
  C: null, // the line goes; the board says it instead
};

/** The line under the canvas. "Drag to select" stops being true on the day. */
const LEGEND: Record<Variant, string> = {
  A: "Every square is taken.",
  B: `Sold out · ${SQUARE_COUNT} / ${SQUARE_COUNT} squares`,
  C: "Sold out. The banner is auctioned every day.",
};

export function line(variant: Variant, soldOut: boolean) {
  return soldOut ? ON_THE_DAY[variant] : PROMISE[variant];
}

/**
 * A copy of the real top bar with the label in it. Copied rather than wrapped:
 * variant A sits *inside* the row, between the links and the session, and there
 * is no way to reach that from outside the component.
 */
export function ProtoTopBar({ variant, soldOut }: { variant: Variant; soldOut: boolean }) {
  const { viewer, signedIn, signOut, mine } = useViewer();
  const { openMine, openSignIn } = useScreen();
  const pathname = usePathname();
  const onBoard = pathname === "/";
  const text = line(variant, soldOut);

  const owned = (mine?.blocks ?? []).reduce((n, b) => n + cellCount(b.rect), 0);
  const label = viewer?.name ?? "My squares";
  const wordmark = "200 SQUARES";
  const wordmarkClass = "font-display text-[22px] leading-none tracking-[0.01em]";

  return (
    <>
      <header className="flex h-14 shrink-0 items-center justify-between gap-4 px-4 lg:px-8">
        <div className="flex min-w-0 items-baseline gap-4 lg:gap-7">
          {onBoard ? (
            <h1 className={wordmarkClass}>{wordmark}</h1>
          ) : (
            <Link href="/" className={`${wordmarkClass} shrink-0`}>
              {wordmark}
            </Link>
          )}

          <nav className="flex min-w-0 items-baseline gap-4 text-[13px] lg:gap-5">
            {PAGES.map((page, i) => (
              <Link
                key={page.href}
                href={page.href}
                className={`truncate transition-colors duration-150 ${
                  pathname === page.href ? "text-ink font-medium" : "text-faint hover:text-ink"
                } ${i > 0 ? "hidden lg:inline" : ""}`}
              >
                {page.label}
              </Link>
            ))}
          </nav>

          {/* A — in the row, after the links, faint. A phone has no room for it,
              so a phone visitor never reads the promise at all. */}
          {variant === "A" && text && (
            <span className="text-faint hidden truncate text-[13px] xl:inline">{text}</span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3 lg:gap-4">
          {/* B — right of the row, before the session. Competes with the one
              thing on this side that is a control. */}
          {variant === "B" && text && (
            <span className="text-faint hidden truncate text-[13px] lg:inline">{text}</span>
          )}
          {signedIn ? (
            <div className="flex items-center gap-3 lg:gap-4">
              {onBoard ? (
                <button
                  type="button"
                  onClick={openMine}
                  className="hover:text-accent text-[13px] transition-colors duration-150"
                >
                  {label}
                  <span className="text-faint"> · {owned} squares</span>
                </button>
              ) : (
                <Link href="/" className="hover:text-accent text-[13px] transition-colors duration-150">
                  {label}
                  <span className="text-faint"> · {owned} squares</span>
                </Link>
              )}
              <button
                type="button"
                className="text-faint hover:text-ink hidden text-[13px] transition-colors duration-150 sm:inline"
                onClick={signOut}
              >
                Sign out
              </button>
            </div>
          ) : (
            <button type="button" className="shrink-0 text-[14px] font-medium" onClick={openSignIn}>
              Sign in
            </button>
          )}
        </div>
      </header>

      {/* C — a strip of its own under the bar. It is the only placement a phone
          also gets, and the only one that costs the canvas height. */}
      {variant === "C" && text && (
        <div className="border-hairline shrink-0 border-t px-4 py-1.5 text-center lg:px-8">
          <span className="text-faint text-[12px]">{text}</span>
        </div>
      )}
    </>
  );
}

/** The legend line under the canvas: the drag instruction, or the day's truth. */
export function ProtoDragLine({ variant, soldOut }: { variant: Variant; soldOut: boolean }) {
  return (
    <p className="text-faint hidden text-[13px] lg:block">
      {soldOut
        ? LEGEND[variant]
        : `Drag to select up to ${MAX_BLOCK} × ${MAX_BLOCK} · $${PRICE_PER_SQUARE} per square`}
    </p>
  );
}

/** True when the real board says so. The switcher can force it on top of that. */
export function useRealSoldOut() {
  const { board } = useBoard();
  return board.stats.available === 0;
}

/** Kept out of the switcher so the two states are one keypress apart. */
export function useForced(initial: boolean) {
  return useState(initial);
}
