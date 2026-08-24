// When does a block need a line around it?
//
// Ticket 05 gave every block a 1px hairline edge, because light artwork melted
// into the paper ground and two light blocks side by side read as one. On dark
// or saturated artwork that edge lands right next to the seam, and the two read
// as one doubled rule.
//
// The edge exists for artwork that is close to the ground. Only that artwork
// gets it.

import type { Artwork } from "./types";

/** --color-page, the sheet the canvas lies on. */
const PAGE = [220, 221, 213];

/**
 * How close artwork may sit to the ground before it needs a line of its own.
 * HALCYON is 14 away and ATLAS FOUNDRY 20; a plain white block is 64. Saturated
 * artwork is far past this even when it is just as light — ORBIT's yellow is 169
 * away — because hue separates it from the paper on its own.
 */
const MELT_DISTANCE = 70;

const rgb = (hex: string) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

export function meltsIntoPage(artwork: Artwork | null): boolean {
  // Pending is hatched over the square colour, which is paper. It always needs the edge.
  if (!artwork) return true;
  // An uploaded image could be anything, so assume it needs the help.
  if (artwork.kind === "image") return true;
  const [r, g, b] = rgb(artwork.bg);
  return Math.hypot(r - PAGE[0], g - PAGE[1], b - PAGE[2]) < MELT_DISTANCE;
}
