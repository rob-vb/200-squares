"use client";

// The legend. It earns its place by carrying real counts: scarcity is the
// product, so the numbers that shrink stay on screen.
//
// Two shapes for one thing. Under the canvas it is a strip of the three counts
// that move; inside the reserved panel column it is a plate of all six, because
// there the width is fixed and the height is free.

import { useBoard } from "@/lib/board/state";
import { PRICE_PER_SQUARE, SQUARE_COUNT } from "@/lib/board/geometry";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-square px-2 py-1">
      <div className="text-faint text-[11px]">{label}</div>
      <div className="font-display text-[15px] leading-tight" data-numeric>
        {value}
      </div>
    </div>
  );
}

export function TitleBlock({ variant }: { variant: "strip" | "column" }) {
  const { board } = useBoard();
  const { taken, pending, available } = board.stats;

  const moving = (
    <>
      <Field label="Taken" value={String(taken)} />
      <Field label="Pending" value={String(pending)} />
      <Field label="Available" value={String(available)} />
    </>
  );

  // The hairlines are the gaps: a 1px grid gap over the hairline colour draws
  // every rule between the fields at once, whatever the column count.
  if (variant === "strip") {
    return (
      <div className="bg-hairline grid shrink-0 grid-cols-3 gap-px border-y border-hairline xl:hidden">
        {moving}
      </div>
    );
  }

  return (
    <div className="bg-hairline border-hairline grid shrink-0 grid-cols-3 gap-px border">
      <Field label="Sheet" value="01 / 01" />
      <Field label="Squares" value={String(SQUARE_COUNT)} />
      <Field label="Rate" value={`$${PRICE_PER_SQUARE}`} />
      {moving}
    </div>
  );
}
