"use client";

// Turnstile: the free control that reaches the one endpoint an attacker would
// flood.
//
// Ticket 06 gave the reservation three limits. Two of them live in the mutation
// — one live hold per visitor, and at most a tenth of the free squares held at
// once — and this is the third, the one that costs a script something. It runs
// when the buy screen opens, so the token is usually waiting by the time the
// visitor has finished typing.
//
// ⚠️ The widget is rendered into a real, **visible** box rather than a hidden
// one. Cloudflare refuses to run a widget inside a `display:none` container, and
// it refuses quietly: the callback simply never fires, the order press waits its
// ten seconds and the visitor is told the check did not finish. An invisible
// site key puts nothing in the box, so leaving it visible costs nothing — and a
// key that does want a click can then show one.

import { useCallback, useEffect, useRef, useState } from "react";

type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const el = document.createElement("script");
    el.src = SCRIPT;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error("Turnstile did not load."));
    document.head.appendChild(el);
  });
  return scriptPromise;
}

/**
 * A widget, and one token at a time.
 *
 * `getToken` hands over whatever the widget last produced and then resets it, so
 * the next order press gets a fresh one — a Turnstile token may be spent exactly
 * once. If none has arrived yet it waits, because the alternative is telling a
 * visitor who did nothing wrong that they failed a check.
 */
export function useTurnstile(active: boolean) {
  const box = useRef<HTMLDivElement | null>(null);
  const widget = useRef<string | null>(null);
  const token = useRef<string | null>(null);
  const waiters = useRef<((value: string | null) => void)[]>([]);
  const [ready, setReady] = useState(false);

  const settle = useCallback((value: string | null) => {
    token.current = value;
    if (value) {
      for (const resolve of waiters.current.splice(0)) resolve(value);
    }
  }, []);

  useEffect(() => {
    if (!active) return;
    const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!sitekey || !box.current) return;

    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !box.current || !window.turnstile) return;
        widget.current = window.turnstile.render(box.current, {
          sitekey,
          // Nothing is shown unless Cloudflare actually wants an interaction.
          appearance: "interaction-only",
          callback: (value: string) => settle(value),
          "error-callback": () => settle(null),
          "expired-callback": () => settle(null),
        });
        setReady(true);
      })
      .catch(() => setReady(false));

    const queue = waiters.current;
    return () => {
      cancelled = true;
      if (widget.current && window.turnstile) window.turnstile.remove(widget.current);
      widget.current = null;
      token.current = null;
      queue.splice(0);
    };
  }, [active, settle]);

  const getToken = useCallback(async (): Promise<string | null> => {
    const spend = (value: string) => {
      token.current = null;
      if (widget.current && window.turnstile) window.turnstile.reset(widget.current);
      return value;
    };
    if (token.current) return spend(token.current);

    const value = await new Promise<string | null>((resolve) => {
      waiters.current.push(resolve);
      // Ten seconds is long past the point where something is wrong, and the
      // server refuses without a token anyway — so the visitor is told plainly
      // rather than left watching a button that never does anything.
      window.setTimeout(() => resolve(token.current), 10_000);
    });
    return value ? spend(value) : null;
  }, []);

  return { box, ready, getToken };
}
