"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { VARIANTS, type VariantKey } from "./variants";


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
    router.replace(`/prototype/directions?variant=${next.key}`, { scroll: false });
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
      <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-black/90 p-1 text-white shadow-[0_8px_30px_rgba(0,0,0,0.45)] ring-1 ring-white/25 backdrop-blur">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous direction"
          className="grid h-8 w-8 place-items-center rounded-full text-lg leading-none hover:bg-white/15"
        >
          ‹
        </button>
        <span className="px-2 font-mono text-[11px] tracking-wide whitespace-nowrap uppercase">
          {index + 1}/{VARIANTS.length} · {VARIANTS[index].name}
        </span>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next direction"
          className="grid h-8 w-8 place-items-center rounded-full text-lg leading-none hover:bg-white/15"
        >
          ›
        </button>
      </div>
    </div>
  );
}
