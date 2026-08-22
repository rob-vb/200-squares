"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { VARIANTS, type VariantKey } from "./variants";


function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d={direction === "left" ? "M10 3 L5 8 L10 13" : "M6 3 L11 8 L6 13"}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  );
}

/**
 * Floating switcher for the prototype. Not gated on NODE_ENV: the whole point is to
 * flip directions on the Vercel preview, which is a production build. The route lives
 * on a throwaway branch and never reaches main.
 */
export function Switcher({ current }: { current: VariantKey }) {
  const router = useRouter();
  const index = VARIANTS.findIndex((v) => v.key === current);

  const go = (step: number) => {
    const next = VARIANTS[(index + step + VARIANTS.length) % VARIANTS.length];
    router.replace(`/prototype/canvas-feel?variant=${next.key}`, { scroll: false });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      if (el instanceof HTMLElement) {
        const tag = el.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable) return;
      }
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-50 flex justify-center">
      <div
        className="pointer-events-auto flex items-center gap-1 bg-[#23261F] p-1 text-[#EEEFE9]"
        style={{ boxShadow: "var(--shadow-dock)" }}
      >
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous variant"
          className="grid h-8 w-8 place-items-center transition-colors duration-150 hover:bg-[#3A3E34]"
        >
          <Chevron direction="left" />
        </button>
        <span className="px-2 text-[13px] whitespace-nowrap" data-numeric>
          {index + 1} of {VARIANTS.length} · {VARIANTS[index].name}
        </span>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next variant"
          className="grid h-8 w-8 place-items-center transition-colors duration-150 hover:bg-[#3A3E34]"
        >
          <Chevron direction="right" />
        </button>
      </div>
    </div>
  );
}
