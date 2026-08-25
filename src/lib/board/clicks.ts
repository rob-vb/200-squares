"use client";

// Counting a click, from the side that does the clicking.
//
// ⚠️ **Nothing here may hold the navigation up.** Ticket 10: the anchor opens
// the tab natively and the count is thrown after it. Every function below is
// called with `void`, none of them is awaited by anything that navigates, and
// the post itself is a `sendBeacon` — a request the browser owns, which cannot
// block, cannot be cancelled by the page and reads no answer back.
//
// ⚠️ **The count is a floor, not a census** (ticket 10). A blocker, a browser
// with no script, a Turnstile that will not clear, a network that drops the
// beacon — every one of those is a click that happened and was not counted, and
// that is accepted. What must never happen is the reverse: a visitor who does
// not reach the site they clicked on.
//
// ⚠️ **Turnstile is loaded on the first click and not before.** The board page
// is served from cache to everybody and most visitors never click a block, so
// mounting a third-party script for all of them would be a cost — and a script
// on the page — bought for nothing. The widget's box is always in the DOM,
// because Cloudflare refuses to run inside a container that is not there; what
// waits for the first click is the script.

import { useCallback, useRef, useState } from "react";
import { convexSite } from "@/lib/checkout/hold";
import { useTurnstile } from "@/lib/checkout/turnstile";

/** A block by its document id, or a banner day by its `YYYY-MM-DD`. */
export type ClickTarget = { kind: "block" | "banner"; id: string };

type Permit = { permit: string; expiresAt: number; spent: number; clicks: number };

/** Ask again slightly before it lapses, so a click never lands on a dead one. */
const EARLY_MS = 5_000;

export function useClickCount() {
  // The widget is mounted by the first click and stays for the rest of the
  // visit, re-issuing a token whenever a permit runs out.
  const [armed, setArmed] = useState(false);
  const { box, getToken } = useTurnstile(armed);
  const held = useRef<Permit | null>(null);
  // One request at a time. A visitor who clicks twice before the first permit
  // has landed must not spend two Turnstile tokens on it.
  const asking = useRef<Promise<Permit | null> | null>(null);

  const ask = useCallback(async (): Promise<Permit | null> => {
    setArmed(true);
    const token = await getToken();
    if (!token) return null;
    try {
      const res = await fetch(`${convexSite()}/clicks/permit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) return null;
      const body = (await res.json()) as {
        ok?: boolean;
        permit?: string;
        expiresAt?: number;
        clicks?: number;
      };
      if (!body.ok || !body.permit || !body.expiresAt) return null;
      return {
        permit: body.permit,
        expiresAt: body.expiresAt,
        clicks: body.clicks ?? 30,
        spent: 0,
      };
    } catch {
      // The count is a floor. A click that could not be posted is a click that
      // is not counted, and the visitor has already left for somewhere else.
      return null;
    }
  }, [getToken]);

  const permitFor = useCallback(async (): Promise<string | null> => {
    const now = Date.now();
    const current = held.current;
    if (current && current.spent < current.clicks && now < current.expiresAt - EARLY_MS) {
      current.spent += 1;
      return current.permit;
    }
    if (!asking.current) {
      asking.current = ask().finally(() => {
        asking.current = null;
      });
    }
    const next = await asking.current;
    if (!next) return null;
    // Two clicks may have waited on the same request. They share the permit and
    // both count against it, which is exactly what one permit is for.
    held.current = next;
    next.spent += 1;
    return next.permit;
  }, [ask]);

  /**
   * Add one to a block or a banner day. Fire and forget: it returns a promise so
   * that it can be `void`ed, and nothing waits on it anywhere.
   */
  const count = useCallback(
    async (target: ClickTarget) => {
      const permit = await permitFor();
      if (!permit) return;
      const body = JSON.stringify({ permit, kind: target.kind, id: target.id });
      try {
        // ⚠️ `text/plain` keeps this a *simple* cross-origin request, so no
        // preflight stands between the click and the count. Nothing reads the
        // answer, so nothing needs the response to be readable.
        navigator.sendBeacon(
          `${convexSite()}/clicks`,
          new Blob([body], { type: "text/plain;charset=UTF-8" }),
        );
      } catch {
        // A browser without `sendBeacon` simply does not count. See the floor.
      }
    },
    [permitFor],
  );

  return { box, count };
}
