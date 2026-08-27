"use client";

// Who is looking, and what they hold.
//
// ⚠️ The prototype's fake sign-in is gone (ticket 18). This is a real session:
// Better Auth says whether there is one, and `owners.mine` says what the party
// behind it owns. Neither question is asked on the server — the board's HTML is
// the same for a stranger and for an owner, which is ticket 02's cheapest
// defence and ticket 08's one discipline.
//
// Three states, and they are not two:
//
//   signed out          — `signedIn` false, `viewer` null.
//   signed in, no row   — `signedIn` true, `viewer` null. Somebody made an
//                         account before they ever bought anything. Normal.
//   signed in, an owner — both set.

import { createContext, useContext, useMemo } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@convex/api";
import { authClient } from "@/lib/auth-client";

type Viewer = { id: string; name: string };

type ViewerValue = {
  /** The owner behind the session. Null when signed out, and when there is no row. */
  viewer: Viewer | null;
  /** There is a session. Not the same as holding squares. */
  signedIn: boolean;
  /** The session is still being worked out. Neither state is settled yet. */
  loading: boolean;
  signOut: () => void;
  /** Everything the signed-in owner holds. null when there is nobody. */
  mine: ReturnType<typeof useMine>;
};

function useMine(enabled: boolean) {
  // ⚠️ `"skip"` and not a query that returns null. A stranger opens no
  // subscription at all, so the board costs what it cost before accounts
  // existed.
  return useQuery(api.owners.mine, enabled ? {} : "skip");
}

const ViewerContext = createContext<ViewerValue | null>(null);

export function ViewerProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const mine = useMine(isAuthenticated);

  const value = useMemo<ViewerValue>(
    () => ({
      // An owner's name starts empty: it is the *company* name and the buyer
      // supplies it on the thank-you page (ticket 16). Until then the panel
      // needs something to be called.
      viewer: mine ? { id: mine.id, name: mine.name || "My squares" } : null,
      signedIn: isAuthenticated,
      loading: isLoading,
      signOut: () => {
        void authClient.signOut();
      },
      mine,
    }),
    [mine, isAuthenticated, isLoading],
  );

  return <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>;
}

export function useViewer(): ViewerValue {
  const value = useContext(ViewerContext);
  if (!value) throw new Error("useViewer must be used inside a ViewerProvider");
  return value;
}
