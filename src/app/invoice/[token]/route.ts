// One invoice, on an address that never changes.
//
// ⚠️ **The token is in the path and it is the whole guard** (ticket 17). An
// invoice carries a name and an address, so the URL is keyed on 16 random bytes
// and never on the invoice number — a number is a series, and a guessable URL
// would hand the series out in order.
//
// ⚠️ **It is never cached at the edge.** `/art` streams a public picture and
// wants a year of shared caching; this is one person's document and gets the
// opposite: `private, no-store`, so nothing in front of the function keeps a
// copy. The document is rare and small, and the whole of ticket 09's egress
// argument is about pictures on a board 199 squares wide.
//
// The file itself is written once and never re-rendered (ticket 05), so what is
// served here is the document as it was issued, not the document as today's code
// would draw it.

import type { NextRequest } from "next/server";

/** 16 bytes as hex, and nothing else is even asked about. */
const looksLikeToken = (token: string) => /^[0-9a-f]{32}$/.test(token);

const missing = () =>
  new Response("No such invoice.", {
    status: 404,
    headers: { "Cache-Control": "private, no-store" },
  });

export async function GET(_request: NextRequest, ctx: RouteContext<"/invoice/[token]">) {
  const { token } = await ctx.params;
  if (!looksLikeToken(token)) return missing();

  const site = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
  if (!site) return missing();

  let upstream: Response;
  try {
    upstream = await fetch(`${site}/invoice?token=${encodeURIComponent(token)}`, {
      cache: "no-store",
    });
  } catch {
    return missing();
  }
  if (!upstream.ok || !upstream.body) return missing();

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
    },
  });
}
