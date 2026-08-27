// The deployment purging its own edge, on a shared secret.
//
// ⚠️ [ADR 0004](../../../../docs/adr/0004-a-year-is-a-cache-not-a-promise.md)
// chose this shape over the obvious one. Convex could hold a `VERCEL_TOKEN` and
// call the REST API — one call and no extra endpoint — but that token can do
// everything on the account. A leaked secret here buys an attacker the right to
// clear a cache, and nothing else.
//
// ⚠️ **Cache tags are scoped to the project *and* the environment**, and
// `dangerouslyDeleteByTag` reads the environment from the deployment it is
// running in. So it is the *caller* that picks which edge is purged, by which
// URL it posts to: the Convex dev deployment must call staging and prod must call
// `200squares.com`. `PURGE_URL` on the wrong deployment purges the wrong
// environment and reports success.
//
// ⚠️ **Delete, not invalidate.** Vercel recommends invalidate, and that advice is
// written for content that *changed*: it serves the stale copy instantly and
// revalidates behind it. For a picture that is gone — taken down for adult
// content, malware or impersonation — serving it once more in every region is the
// removal not working.

import { dangerouslyDeleteByTag } from "@vercel/functions";

/** Vercel's bulk limit. `release` sends two; the loop is for the day it does not. */
const MAX_TAGS = 16;

type Answer = { ok: true; tags: number } | { ok: false; error: string };

const fail = (error: string, status: number) =>
  Response.json({ ok: false, error } satisfies Answer, {
    status,
    headers: { "Cache-Control": "no-store" },
  });

/**
 * Same answer whatever the two strings are, and the same length whatever their
 * lengths are — that is what hashing first buys.
 */
async function sameSecret(given: string, wanted: string): Promise<boolean> {
  const digest = async (value: string) =>
    new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
  const [a, b] = [await digest(given), await digest(wanted)];
  let same = 0;
  for (let i = 0; i < a.length; i++) same |= a[i] ^ b[i];
  return same === 0;
}

/**
 * Whether this runtime can actually purge anything.
 *
 * ⚠️ **`dangerouslyDeleteByTag` resolves silently when it cannot.** It looks for a
 * purge API on Vercel's request context and returns a resolved promise when there
 * is none — off Vercel, or on a runtime that does not provide one. Called blind,
 * this route would answer *purged* to every request, Convex would write
 * `purgedAt`, and the picture would still be public with nothing anywhere saying
 * so. That is the one failure ADR 0004 says must never be quiet, so the context is
 * read directly and its absence is a 503 the caller retries.
 *
 * ⚠️ The symbol is `@vercel/functions`' own internal, and reading it is the price
 * of the check. If a future runtime supplies purging some other way this reports a
 * false alarm — a removal that stays listed as un-purged on `/admin` — which is the
 * safe way for this particular check to be wrong.
 */
const canPurge = () => {
  const holder = (globalThis as Record<symbol, { get?: () => { purge?: unknown } }>)[
    Symbol.for("@vercel/request-context")
  ];
  return Boolean(holder?.get?.()?.purge);
};

export async function POST(request: Request) {
  const secret = process.env.PURGE_SECRET;
  if (!secret) return fail("unconfigured", 503);

  const given = request.headers.get("x-purge-secret") ?? "";
  if (!(await sameSecret(given, secret))) return fail("forbidden", 403);

  let body: { tags?: unknown };
  try {
    body = await request.json();
  } catch {
    return fail("invalid", 400);
  }

  const tags = Array.isArray(body.tags)
    ? body.tags.filter((t): t is string => typeof t === "string" && t.length > 0 && t.length <= 256)
    : [];
  if (tags.length === 0) return fail("invalid", 400);

  if (!canPurge()) return fail("no-purge-api", 503);

  try {
    for (let i = 0; i < tags.length; i += MAX_TAGS) {
      await dangerouslyDeleteByTag(tags.slice(i, i + MAX_TAGS));
    }
  } catch {
    return fail("purge-failed", 502);
  }

  return Response.json({ ok: true, tags: tags.length } satisfies Answer, {
    headers: { "Cache-Control": "no-store" },
  });
}
