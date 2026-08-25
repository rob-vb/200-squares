// The server half: one forwarder, and nothing that decides anything.
//
// ⚠️ It is a proxy, not an auth server. Better Auth itself runs on Convex — the
// routes are registered in `convex/http.ts` — and this passes `/api/auth/*`
// through to `.convex.site`, keeping the cookie on 200squares.com. That is the
// whole reason ticket 08 put the handler here instead of reaching for the
// `crossDomain` plugin.

import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";

export const { handler } = convexBetterAuthNextJs({
  convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL!,
  convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
});
