"use client";

// Wordmark left, the other pages beside it, session right.
//
// Ticket 01 took the auction out of the top bar on purpose and gave it a card of
// its own, so the top of the screen never competes with the canvas. The links
// are the one thing that came back into it, and they stay quiet: faint until the
// page is the one you are on.
//
// A phone has room for the wordmark, one link and the session. How it works is
// that link — it is the page that sells. About, Terms and Privacy sit in the
// footer of every page, which is where a phone visitor looks for them anyway.
//
// ⚠️ Sign in is a real form now (ticket 18) and it opens in the panel, like
// every other flow. It stays one word in the bar: buying needs no account at
// all, so a sign-in that took more room than that would be selling the wrong
// thing.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PAGES } from "./nav";
import { useScreen } from "./panel/flow";
import { useViewer } from "@/lib/board/viewer";
import { cellCount } from "@/lib/board/geometry";

export function TopBar() {
  const { viewer, signedIn, signOut, mine } = useViewer();
  const { openMine, openSignIn } = useScreen();
  const pathname = usePathname();
  const onBoard = pathname === "/";

  const owned = (mine?.blocks ?? []).reduce((n, b) => n + cellCount(b.rect), 0);
  // Signed in with no owner row behind the address is a normal state, not a
  // broken one: somebody may make an account before they ever buy anything.
  const label = viewer?.name ?? "My squares";
  const wordmark = "200 SQUARES";
  const wordmarkClass = "font-display text-[22px] leading-none tracking-[0.01em]";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 px-4 lg:px-8">
      <div className="flex min-w-0 items-baseline gap-4 lg:gap-7">
        {/* On the board the wordmark is the page's heading. Everywhere else the
            page has its own, and the wordmark is the way back to the board. */}
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
      </div>

      <div className="flex shrink-0 items-center gap-3 lg:gap-4">
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
              <Link
                href="/"
                className="hover:text-accent text-[13px] transition-colors duration-150"
              >
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
  );
}
