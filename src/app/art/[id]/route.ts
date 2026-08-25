// One file, streamed through Vercel's edge on a URL that never changes.
//
// ⚠️ **Artwork is never served from Convex to a visitor** (ticket 09). Convex
// Free includes 1 GB of egress and a board that served its own pictures would
// spend it in a few hundred visits. This route is the whole defence: the storage
// id is in the *path*, so the URL is stable for a given file and completely
// different for a new one, and the answer is cacheable for a year. Convex is
// read once per file per region and the edge answers everybody else.
//
// Replacing artwork produces a new id and therefore a new URL, so there is no
// cache to bust and nothing here ever has to be revalidated.
//
// ⚠️ `s-maxage` is what Vercel's edge reads; `max-age` is what the browser
// reads. Only the pair keeps the file out of the function on the second request.

import type { NextRequest } from "next/server";

const A_YEAR = 31_536_000;

/** A Convex storage id, loosely. Anything else is a 404 without a fetch. */
const looksLikeId = (id: string) => /^[a-zA-Z0-9_-]{16,128}$/.test(id);

const missing = () =>
  new Response("No such file.", {
    status: 404,
    // ⚠️ Not a year. A file whose upload is still in flight is a 404 for a few
    // seconds, and a year-long negative cache would make that permanent.
    headers: { "Cache-Control": "public, max-age=30" },
  });

export async function GET(_request: NextRequest, ctx: RouteContext<"/art/[id]">) {
  const { id } = await ctx.params;
  if (!looksLikeId(id)) return missing();

  const site = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
  if (!site) return missing();

  let upstream: Response;
  try {
    upstream = await fetch(`${site}/art?id=${encodeURIComponent(id)}`, { cache: "no-store" });
  } catch {
    return missing();
  }
  if (!upstream.ok || !upstream.body) return missing();

  return new Response(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "image/webp",
      "Cache-Control": `public, max-age=${A_YEAR}, s-maxage=${A_YEAR}, immutable`,
    },
  });
}
