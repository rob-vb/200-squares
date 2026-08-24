// Mock owners. Colour plus a wordmark stands in for artwork, because artwork is
// arbitrary colour and the ground has to survive all of it — light, dark and
// loud. HALCYON and ATLAS FOUNDRY are the light ones: they are the reason every
// block carries a hairline edge.
//
// These are invented. No real company, sale or winner appears anywhere here.

import type { Artwork, Block, Owner, Rect } from "../types";

export type Brand = { id: string; name: string; url: string; bg: string; fg: string };

export const brandOwner = ({ id, name }: Brand): Owner => ({ id, name });

export const brandArtwork = (brand: Brand): Artwork => ({
  kind: "mock",
  bg: brand.bg,
  fg: brand.fg,
  label: brand.name,
});

/**
 * Build a block. `pending` blocks are paid for and simply have no artwork yet.
 *
 * `sell` puts the block up for sale. Without a `part` the whole block is
 * offered; with one, only that straight cut off it — the block stays whole on
 * the board either way, because a listing does not split anything until it sells.
 */
export function makeBlock(
  id: string,
  rect: Rect,
  brand: Brand,
  opts: { pending?: boolean; sell?: { price: number; part?: Rect } } = {},
): Block {
  return {
    id,
    rect,
    ownerId: brand.id,
    url: brand.url,
    artwork: opts.pending ? null : brandArtwork(brand),
    listing: opts.sell ? { rect: opts.sell.part ?? rect, price: opts.sell.price } : null,
  };
}
