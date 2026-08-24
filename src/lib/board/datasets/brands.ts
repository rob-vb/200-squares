// Mock owners. Colour plus a wordmark stands in for artwork, because artwork is
// arbitrary colour and the ground has to survive all of it — light, dark and
// loud. HALCYON and ATLAS FOUNDRY are the light ones: they are the reason every
// block carries a hairline edge.
//
// These are invented. No real company, sale or winner appears anywhere here.

import type { Artwork, Block, Owner, Rect } from "../types";

export type Brand = { id: string; name: string; url: string; bg: string; fg: string };

export const brandOwner = ({ id, name, url }: Brand): Owner => ({ id, name, url });

export const brandArtwork = (brand: Brand): Artwork => ({
  kind: "mock",
  bg: brand.bg,
  fg: brand.fg,
  label: brand.name,
});

/** Build a block. `pending` blocks are paid for and simply have no artwork yet. */
export function makeBlock(
  id: string,
  rect: Rect,
  brand: Brand,
  opts: { pending?: boolean } = {},
): Block {
  return {
    id,
    rect,
    ownerId: brand.id,
    artwork: opts.pending ? null : brandArtwork(brand),
  };
}
