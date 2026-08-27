"use client";

// The footer of every page beside the board.
//
// A phone's top bar has room for one link, so this is where About, Terms and
// Privacy live for a phone visitor. The wordmark line states what the whole
// product is, in figures.

import Link from "next/link";
import { PAGES } from "../nav";
import { SQUARE_COUNT } from "@/lib/board/geometry";

export function Footer() {
  return (
    <footer className="border-hairline border-t">
      <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-baseline gap-x-6 gap-y-3 px-4 py-8 lg:px-8">
        <Link href="/" className="font-display text-[14px]">
          200 SQUARES
        </Link>
        <span className="text-faint text-[12px]" data-numeric>
          {SQUARE_COUNT} squares + 1 banner
        </span>
        <nav className="flex flex-1 flex-wrap items-baseline justify-end gap-x-5 gap-y-2 text-[13px]">
          {PAGES.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="text-faint hover:text-ink transition-colors duration-150"
            >
              {page.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
