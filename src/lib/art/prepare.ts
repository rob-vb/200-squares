// The upload, in the browser. Nothing here ever runs on a server.
//
// ⚠️ Ticket 09's rule: **the browser resizes and the server never does.** The
// chosen file is cropped to the block's shape and written out as two WebP files
// at exactly the sizes the board draws — a `1x` and a `4x`. The original is never
// uploaded and never stored.
//
// That is not a convenience. Resizing in a Convex action would spend action
// compute out of the same free plan the egress comes from, and it would put a
// decode of a hostile file inside the backend. The browser already holds the
// file and already has a canvas, and it costs the site nothing.
//
// ⚠️ **No animation.** A GIF is decoded to its first frame and the rest is
// discarded. A hundred animated blocks is a board that stutters and a bandwidth
// bill that multiplies, so the copy beside the picker says so before the buyer
// picks a file.

import { ART_CELL, ART_ZOOM, artPixels } from "@/lib/board/geometry";
import type { Rect } from "@/lib/board/types";

/** What a buyer may pick. Only WebP is ever stored. */
export const ACCEPT = "image/png,image/jpeg,image/webp,image/gif";

/** The source file. The browser reads it and throws it away. */
export const MAX_SOURCE_BYTES = 10 * 1024 * 1024;

// ⚠️ The same two caps the server checks in `convex/lib/art.ts`. They are stated
// twice on purpose — a Convex function may not import from the Next.js app — so
// if one moves, both move. The browser aims under them; the server refuses over.
const SMALL_MAX_BYTES = 40 * 1024;
const LARGE_MAX_BYTES = 400 * 1024;

/** A window on the source image, in source pixels. */
export type Window = { x: number; y: number; w: number; h: number };

export type Source = {
  bitmap: ImageBitmap;
  /** For the crop box to paint. Revoked by `release`. */
  url: string;
  width: number;
  height: number;
};

export type Prepared = { small: Blob; large: Blob };

/**
 * Decode the chosen file.
 *
 * `createImageBitmap` takes the first frame of an animated GIF and nothing else,
 * which is exactly the rule and costs no extra code.
 */
export async function readSource(file: File): Promise<Source> {
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error("That file is over 10 MB. Pick a smaller one.");
  }
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("That file is not an image this browser can read.");
  }
  return {
    bitmap,
    url: URL.createObjectURL(file),
    width: bitmap.width,
    height: bitmap.height,
  };
}

export function release(source: Source | null) {
  if (!source) return;
  URL.revokeObjectURL(source.url);
  source.bitmap.close();
}

/**
 * The largest window of the source that has the block's shape, centred.
 *
 * ⚠️ **The site crops; it does not refuse.** Nine block shapes exist between
 * 1x1 and 3x3 and demanding one of them from a buyer's picture would be hostile
 * (ticket 09). Centre is the default and the buyer drags it from there.
 */
export function centredWindow(source: Source, rect: Rect): Window {
  const box = artPixels(rect, ART_CELL);
  const aspect = box.w / box.h;
  const w = Math.min(source.width, source.height * aspect);
  const h = w / aspect;
  return { x: (source.width - w) / 2, y: (source.height - h) / 2, w, h };
}

/** Keep a dragged window inside the picture. */
export const clampWindow = (source: Source, win: Window): Window => ({
  ...win,
  x: Math.max(0, Math.min(source.width - win.w, win.x)),
  y: Math.max(0, Math.min(source.height - win.h, win.y)),
});

/**
 * Draw the window into a WebP of exactly `w` x `h`, under `cap` bytes.
 *
 * The quality ladder is the honest way to a byte cap: encode, look, and step
 * down until it fits. A photograph reaching the bottom of the ladder is a
 * photograph that will look poor at a quarter of a square, and saying so is
 * better than storing something the board then has to serve.
 */
async function encode(
  source: Source,
  win: Window,
  w: number,
  h: number,
  cap: number,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser cannot prepare the image.");
  ctx.drawImage(source.bitmap, win.x, win.y, win.w, win.h, 0, 0, w, h);

  for (const quality of [0.9, 0.82, 0.72, 0.62, 0.5, 0.4]) {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", quality),
    );
    // ⚠️ A browser that cannot write WebP hands back a PNG under the same call,
    // and the server would refuse it with nothing to explain. Catch it here.
    if (!blob || blob.type !== "image/webp") {
      throw new Error("This browser cannot write WebP images.");
    }
    if (blob.size <= cap) return blob;
  }
  throw new Error("That picture will not compress small enough. Try a simpler image.");
}

/**
 * The two files, ready to post.
 *
 * The `4x` is the `1x` at four times the square size, which is `MAX_SCALE`: the
 * board never draws anything larger, so nothing bigger would ever be seen.
 */
export async function prepare(source: Source, rect: Rect, win: Window): Promise<Prepared> {
  const small = artPixels(rect, ART_CELL);
  const large = artPixels(rect, ART_CELL * ART_ZOOM);
  return {
    small: await encode(source, win, small.w, small.h, SMALL_MAX_BYTES),
    large: await encode(source, win, large.w, large.h, LARGE_MAX_BYTES),
  };
}

/**
 * Post one file straight to Convex storage and give back its id.
 *
 * The URL is short-lived and came from a mutation that had already decided the
 * caller owns the thing they are drawing on. Nothing here is authorised by
 * anything the browser holds.
 */
export async function post(url: string, blob: Blob): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": blob.type },
    body: blob,
  });
  if (!res.ok) throw new Error("The upload did not finish. Try again.");
  const body = (await res.json()) as { storageId?: string };
  if (!body.storageId) throw new Error("The upload did not finish. Try again.");
  return body.storageId;
}
