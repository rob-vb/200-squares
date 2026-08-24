"use client";

// The countdown to 00:00 UTC.
//
// Anton ships no tabular figures — its "1" measures 33.06 against 49.42 for every
// other digit at 100px, and font-variant-numeric does nothing — so every digit
// sits in a fixed box. Without it the whole line shifts once a second.

import { useEffect, useState } from "react";
import { countdown } from "@/lib/board/time";

export function Countdown({ className }: { className?: string }) {
  // The server has no idea what time it is in the visitor's second, so the first
  // paint is a placeholder and the clock starts on the client.
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setText(countdown(new Date()).text);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className={className}>
      {(text ?? "--:--:--").split("").map((ch, i) =>
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
