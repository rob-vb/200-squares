"use client";

// ⚠️ PROTOTYPE — ticket 27. Throwaway.
//
// The floating bar that flips between variants. Deliberately ugly: it must not
// read as part of the design it is standing in front of. It has no NODE_ENV
// gate: a preview build *is* a production build, and the preview is the only
// place the dev can see any of this.

import { useCallback, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { NAMES, VARIANTS, type Variant } from "./sellout-variants";

export function PrototypeSwitcher({
  variant,
  sold,
  realSoldOut,
}: {
  variant: Variant;
  sold: boolean;
  realSoldOut: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const go = useCallback(
    (next: Variant, nextSold: boolean) => {
      const q = new URLSearchParams(params.toString());
      q.set("variant", next);
      if (nextSold) q.set("sold", "1");
      else q.delete("sold");
      router.replace(`${pathname}?${q.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  const step = useCallback(
    (by: number) => {
      const i = VARIANTS.indexOf(variant);
      go(VARIANTS[(i + by + VARIANTS.length) % VARIANTS.length], sold);
    },
    [go, sold, variant],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      const typing =
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable);
      if (typing) return;
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
      if (e.key.toLowerCase() === "s") go(variant, !sold);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, sold, step, variant]);

  // No production gate: the whole route is a prototype and never ships. A gate
  // on NODE_ENV would only hide the switcher on the preview build, which is the
  // one place the dev can see any of this.

  return (
    <div className="pointer-events-auto fixed bottom-3 left-1/2 z-[9999] -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-full bg-black/90 px-2 py-1.5 text-[12px] text-white shadow-lg">
        <button type="button" className="px-2 py-0.5 hover:opacity-60" onClick={() => step(-1)}>
          ←
        </button>
        <span className="px-1 whitespace-nowrap">
          {variant} — {NAMES[variant]}
        </span>
        <button type="button" className="px-2 py-0.5 hover:opacity-60" onClick={() => step(1)}>
          →
        </button>
        <button
          type="button"
          onClick={() => go(variant, !sold)}
          className={`ml-1 rounded-full px-2 py-0.5 ${sold ? "bg-white text-black" : "bg-white/20"}`}
        >
          {sold ? "sold out" : "on sale"}
          {sold && !realSoldOut ? " (forced)" : ""}
        </button>
      </div>
      <p className="pt-1 text-center text-[10px] text-black/50">← → variant · s sold out</p>
    </div>
  );
}
