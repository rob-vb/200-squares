"use client";

// The visitor's date, once there is one.
//
// The server has no idea what day it is where the visitor stands, and a day
// label rendered from the server clock would be wrong for anyone far enough
// east or west of it. So the first snapshot is null and the real date arrives
// with the client — the same rule the countdown follows.

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

export function useClientDate(): Date | null {
  const onClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return onClient ? new Date() : null;
}
