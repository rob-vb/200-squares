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

import { ConvexProvider, ConvexReactClient } from "convex/react";

const url = process.env.NEXT_PUBLIC_CONVEX_URL;

// A build with no URL is a misconfigured deployment, not a runtime condition.
// Failing here names the problem; failing inside a query does not.
if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not set.");

const client = new ConvexReactClient(url);

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
