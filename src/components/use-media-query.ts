"use client";

// A media query as a value. The server has no viewport, so the first snapshot is
// always false and the real answer arrives on the client — which is safe here,
// because the only thing that reads it is the canvas transform, and that is
// measured on the client anyway.

import { useCallback, useSyncExternalStore } from "react";

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
