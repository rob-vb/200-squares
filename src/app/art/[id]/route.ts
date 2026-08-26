// One file, streamed through Vercel's edge on a URL that never changes.
//
// ⚠️ **Artwork is never served from Convex to a visitor** (ticket 09). Convex
// Free includes 1 GB of egress and a board that served its own pictures would
// spend it in a few hundred visits. This route is the whole defence: the storage
// id is in the *path*, so the URL is stable for a given file and completely
// different for a new one, and the answer is cacheable for a year. Convex is
// read once per file per region and the edge answers everybody else.
//
// ⚠️ **The year is a cache, not a promise, and the route says so by tagging what
// it caches.** `Vercel-Cache-Tag: art-<id>` on every 200, and `convex/art.ts`'s
// `release` deletes that tag the moment the file stops being pointed at. Without
// it a picture taken off the board for adult content or impersonation keeps
// answering at the address somebody reported, for a year, in every region that
// already fetched it — measured on staging by
// [ticket 28](../../../../.scratch/200squares-v1/issues/28-prove-the-mail.md).
// Vercel's cache key is not configurable and there is no purge-by-URL on any
// plan, so a tag is not a lesser version of purging the path: it is the only
// version. [ADR 0004](../../../../docs/adr/0004-a-year-is-a-cache-not-a-promise.md).
//
// ⚠️ **`immutable` is deliberately absent.** No purge reaches the copy in a
// browser, and `immutable` means the browser does not even ask on a reload — so
// the person who reported the picture reloads, sees it, and concludes the report
// did nothing. Without it a reload asks the edge, the edge answers, and Convex is
// still never touched.
//
// ⚠️ `s-maxage` is what Vercel's edge reads; `max-age` is what the browser
// reads. Only the pair keeps the file out of the function on the second request.
// Do **not** split these into a separate `Vercel-CDN-Cache-Control` to give the
// browser a shorter life: every returning visitor would re-fetch every picture on
// the board from the edge, and that is transfer Hobby counts.

import type { NextRequest } from "next/server";

const A_YEAR = 31_536_000;

/** A Convex storage id, loosely. Anything else is a 404 without a fetch. */
const looksLikeId = (id: string) => /^[a-zA-Z0-9_-]{16,128}$/.test(id);

const missing = () =>
  new Response("No such file.", {
    status: 404,
    // ⚠️ Not a year. A file whose upload is still in flight is a 404 for a few
    // seconds, and a year-long negative cache would make that permanent.
    //
    // ⚠️ And no cache tag: a 404 that lives 30 seconds needs no purging, and
    // tagging it would put the tag on an answer the purge is trying to produce.
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
      "Cache-Control": `public, max-age=${A_YEAR}, s-maxage=${A_YEAR}`,
      // The whole of the purge. One file, one tag, and the name is derivable
      // from the id alone so nothing has to be stored to purge it later.
      "Vercel-Cache-Tag": `art-${id}`,
    },
  });
}
