"use client";

// The one Convex client, and the websocket every page opens.
//
// It sits in the root layout so the connection survives navigation: a visitor
// who reads /how-it-works and comes back does not open a second socket, and the
// board they left is the board they return to.
//
// ⚠️ It is a client component with no server half. Nothing about the connection
// is decided at render time, so the pages above it stay static and a signed-in
// owner is served the same HTML as a stranger — which is ticket 02's cheapest
// defence and the easiest thing on this map to lose by accident.
//
// ⚠️ Ticket 18 wrapped it in `ConvexBetterAuthProvider`, which carries the
// session token onto the socket. It still decides nothing at render time: the
// provider resolves the session **after** hydration, so the HTML is unchanged.
// What it does cost is one request to `/api/auth/get-session` per page load,
// for every visitor including a stranger — see the ticket, which records it.

import { ConvexReactClient } from "convex/react";
import { ConvexBetterAuthProvider, type AuthClient } from "@convex-dev/better-auth/react";
import { authClient } from "@/lib/auth-client";

const url = process.env.NEXT_PUBLIC_CONVEX_URL;

// A build with no URL is a misconfigured deployment, not a runtime condition.
// Failing here names the problem; failing inside a query does not.
if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not set.");

const client = new ConvexReactClient(url);

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  return (
    // ⚠️ The cast is the library's, not ours. `ConvexBetterAuthProvider` types
    // its `authClient` prop through a plugin union that collapses
    // `useSession().data` to `never`, so no real client made by
    // `createAuthClient` satisfies it — with our plugins or with none at all
    // (@convex-dev/better-auth 0.12.5, better-auth 1.6.15). The value is right;
    // only the declaration is wrong. Try removing it when either is upgraded.
    <ConvexBetterAuthProvider client={client} authClient={authClient as unknown as AuthClient}>
      {children}
    </ConvexBetterAuthProvider>
  );
}
