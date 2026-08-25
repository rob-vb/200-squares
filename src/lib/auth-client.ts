"use client";

// The browser's half of Better Auth.
//
// No `baseURL`: the handler is at `/api/auth` on this same origin, which is what
// ticket 08 chose Next.js's full-stack shape for. The session cookie is
// first-party and the `crossDomain` plugin is not used.
//
// Two plugins and no more. `convexClient` is what turns a session into the token
// the websocket carries; `magicLinkClient` adds `signIn.magicLink`, which is the
// only way in.

import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";
import { convexClient } from "@convex-dev/better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [convexClient(), magicLinkClient()],
});
