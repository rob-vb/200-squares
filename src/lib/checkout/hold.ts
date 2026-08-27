"use client";

// What the tab remembers between the panel and Stripe.
//
// ⚠️ `sessionStorage`, and deliberately not a cookie. A cookie would be sent to
// the server on every request for the board page, and the board page has to be
// byte-identical for everybody or it is not cacheable — which is ticket 02's
// cheapest defence and the easiest thing on this map to lose by accident. This
// never leaves the browser, and it is gone when the tab closes.
//
// It holds two things and no more: which reservation this tab owns, and where
// Stripe's page for it is. The reservation id is the only capability here that
// matters, and it lives in exactly one tab.
//
// It is a **store** and not a value read on mount, because four screens care
// about the same hold — the panel, the canvas, Stripe's back link and the
// thank-you page — and a hold taken a second ago has to reach all of them.

import { useSyncExternalStore } from "react";
import type { Rect } from "@/lib/board/types";

const KEY = "200squares.hold";

export type Hold = {
  reservationId: string;
  /** Absolute UTC ms. The same fifteen minutes the server is counting. */
  expiresAt: number;
  rect: Rect;
  /**
   * Stripe's page for this reservation, once it exists.
   *
   * ⚠️ It is also the difference between the two screens the panel can show. No
   * URL means the visitor is still filling the form in; a URL means they have
   * been sent to Stripe and what they need is the way back to it.
   */
  stripeUrl?: string;
};

function parse(raw: string | null): Hold | null {
  if (!raw) return null;
  try {
    const hold = JSON.parse(raw) as Hold;
    if (!hold?.reservationId || typeof hold.expiresAt !== "number" || !hold.rect) return null;
    // ⚠️ An expired hold is not a hold. The server stopped counting it the
    // moment it lapsed, so a tab that slept through the quarter hour must not
    // come back offering to continue paying for squares it no longer has.
    if (hold.expiresAt <= Date.now()) return null;
    return hold;
  } catch {
    return null;
  }
}

// The snapshot has to keep its identity between reads or `useSyncExternalStore`
// re-renders for ever, so the parsed value is cached against the raw string it
// came from.
let cachedRaw: string | null = null;
let cached: Hold | null = null;
let fresh = false;

function raw(): string | null {
  try {
    return window.sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

const listeners = new Set<() => void>();
const announce = () => {
  fresh = false;
  for (const listener of listeners) listener();
};

/** The hold this tab owns, or null. Safe to call on the server. */
export function readHold(): Hold | null {
  if (typeof window === "undefined") return null;
  const current = raw();
  if (!fresh || current !== cachedRaw) {
    cachedRaw = current;
    cached = parse(current);
    fresh = true;
  }
  return cached;
}

export function writeHold(hold: Hold) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(hold));
  } catch {
    // A browser that refuses storage costs the visitor the *continue paying*
    // button and nothing else: the reservation is the server's record, not this.
  }
  announce();
}

export function clearHold() {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // Nothing to do, and nothing depends on it.
  }
  announce();
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/**
 * The hold, as a component sees it.
 *
 * ⚠️ Null until hydration is past, whatever the tab remembers. The static HTML
 * was built without a browser, so a first render that already knew about a hold
 * would not match it.
 */
export function useHold(): Hold | null {
  return useSyncExternalStore(subscribe, readHold, () => null);
}

/** Where the backend's own endpoints live. Not the Convex websocket URL. */
export const convexSite = () => process.env.NEXT_PUBLIC_CONVEX_SITE_URL ?? "";
