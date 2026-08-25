"use client";

// Whether we are past hydration yet.
//
// Anything read from the browser — the clock, `sessionStorage`, the address bar
// — has no answer on the server, and a first client render that disagrees with
// the static HTML is a hydration error. So the first snapshot is `false` for
// everybody and the truth arrives one render later.

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

export function useOnClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
