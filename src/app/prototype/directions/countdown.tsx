"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

/** Ticks down to the next 00:00 UTC. Client-only, so the server never renders a stale time. */
export function Countdown({ className, style }: { className?: string; style?: CSSProperties }) {
  const [value, setValue] = useState("--:--:--");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
      const left = Math.max(0, next - now.getTime());
      const h = Math.floor(left / 3_600_000);
      const m = Math.floor(left / 60_000) % 60;
      const s = Math.floor(left / 1000) % 60;
      setValue([h, m, s].map((v) => String(v).padStart(2, "0")).join(":"));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className={className} style={{ fontVariantNumeric: "tabular-nums", ...style }}>
      {value}
    </span>
  );
}
