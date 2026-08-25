import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * ⚠️ **Image Optimization is off, entirely** (ticket 09).
   *
   * Every image on this board is already the exact size it is drawn at — the
   * browser produced the two WebP files before the upload — so there is nothing
   * to optimise. This *supersedes* ticket 02's three settings (`qualities`,
   * `deviceSizes`, an explicit `search` in the image patterns), which were
   * defences against a $4.00-per-1M cache-write attack through a varying query
   * string. An optimizer that is never invoked cannot be attacked at all, so the
   * surface is gone rather than narrowed.
   */
  images: { unoptimized: true },
};

export default nextConfig;
