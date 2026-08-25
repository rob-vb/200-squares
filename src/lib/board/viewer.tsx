"use client";

// ⚠️ The prototype's fake sign-in, on borrowed time.
//
// [Ticket 18](../../../.scratch/200squares-v1/issues/18-build-accounts.md) builds
// real accounts and deletes this whole file. It survives ticket 15 for one
// reason: the dev sees nothing locally, so the only way to look at My squares
// before ticket 18 lands is to have somebody to be.
//
// It is safe because the owner it becomes comes from `owners.seedViewer`, which
// returns null unless `SEED_ENABLED` is set on the Convex deployment. On
// production there is nobody to sign in as, so the button does nothing.
//
// It grants nothing. Every write that matters is still unbuilt, and when they
// are built they go through `requireOwner(ctx, blockId)` on the server — not
// through this.

import { createContext, useContext, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/api";
import type { Id } from "@convex/dataModel";

type Viewer = { id: string; name: string };

type ViewerValue = {
  /** null when nobody is signed in, which is every visitor on production. */
  viewer: Viewer | null;
  /** What the fake sign-in can become, or null where there is nobody. */
  available: Viewer | null;
  signIn: () => void;
  signOut: () => void;
  /** Everything the signed-in owner holds. null when nobody is signed in. */
  mine: ReturnType<typeof useMine>;
};

function useMine(ownerId: string | null) {
  return useQuery(api.owners.mine, ownerId ? { ownerId: ownerId as Id<"owners"> } : "skip");
}

const ViewerContext = createContext<ViewerValue | null>(null);

export function ViewerProvider({ children }: { children: React.ReactNode }) {
  const available = useQuery(api.owners.seedViewer) ?? null;
  const [signedIn, setSignedIn] = useState(false);
  const viewer = signedIn ? available : null;
  const mine = useMine(viewer?.id ?? null);

  const value = useMemo<ViewerValue>(
    () => ({
      viewer,
      available,
      signIn: () => setSignedIn(true),
      signOut: () => setSignedIn(false),
      mine,
    }),
    [viewer, available, mine],
  );

  return <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>;
}

export function useViewer(): ViewerValue {
  const value = useContext(ViewerContext);
  if (!value) throw new Error("useViewer must be used inside a ViewerProvider");
  return value;
}
