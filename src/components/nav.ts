"use client";

// The pages beside the board, and the one rule every link obeys: carry the
// dataset on. A visitor who asked for the early board keeps it across the site.
//
// The name comes from the board itself, not from the query string. Reading the
// query string on the client would cost every page its server rendering, and the
// board already knows which dataset seeded it.

import { useBoard } from "@/lib/board/state";

export const PAGES: { href: string; label: string }[] = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

export function useHref(): (href: string) => string {
  const { state } = useBoard();
  return (href: string) => (state.name === "full" ? href : `${href}?data=${state.name}`);
}
