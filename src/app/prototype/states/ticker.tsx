"use client";

import { useEffect, useState } from "react";

function useCountdown() {
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
  return value;
}

/** Straight Anton. Its "1" is 33% narrower, so the whole line shifts as digits change. */
export function TickerRaw({ className }: { className?: string }) {
  return <span className={className}>{useCountdown()}</span>;
}

/** Every digit in a fixed box. The colons keep their natural width. */
export function TickerFixed({ className }: { className?: string }) {
  const value = useCountdown();
  return (
    <span className={className}>
      {value.split("").map((ch, i) =>
        ch === ":" ? (
          <span key={i}>:</span>
        ) : (
          <span key={i} className="tick-digit">
            {ch}
          </span>
        ),
      )}
    </span>
  );
}

/** A live seconds counter, so the jitter is visible without waiting a minute. */
export function SecondsPair() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setN((v) => (v + 1) % 100), 120);
    return () => clearInterval(id);
  }, []);
  const text = String(n).padStart(2, "0");
  return (
    <div className="flex items-end gap-8">
      <div>
        <div className="text-faint text-[13px]">Raw Anton — jitters</div>
        <div className="font-display text-[52px] leading-none" data-numeric>
          {text}
        </div>
      </div>
      <div>
        <div className="text-faint text-[13px]">Boxed digits — steady</div>
        <div className="font-display text-[52px] leading-none">
          {text.split("").map((ch, i) => (
            <span key={i} className="tick-digit">
              {ch}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
