"use client";

// The legend under the canvas. It earns its place by carrying real counts:
// scarcity is the product, so the numbers that shrink stay on screen.
//
// Every field draws its own left rule and the box closes on the right, so the
// rules land between fields at both breakpoints — a phone shows the three
// counts that move, a desktop shows all six, beside the line that says how to
// buy.

import { useBoard } from "@/lib/board/state";
import { PRICE_PER_SQUARE, SQUARE_COUNT } from "@/lib/board/geometry";

function Field({
  label,
  value,
  desktopOnly = false,
}: {
  label: string;
  value: string;
  desktopOnly?: boolean;
}) {
  return (
    <div
      className={`border-hairline border-l px-2 py-1 ${desktopOnly ? "hidden lg:block" : ""}`}
    >
      <div className="text-faint text-[11px]">{label}</div>
      <div className="font-display text-[15px] leading-tight" data-numeric>
        {value}
      </div>
    </div>
  );
}

export function TitleBlock() {
  const { board } = useBoard();
  const { taken, pending, available } = board.stats;

  return (
    <div className="border-hairline bg-square grid w-full shrink-0 grid-cols-3 border-y border-r lg:w-auto lg:grid-cols-6">
      <Field label="Sheet" value="01 / 01" desktopOnly />
      <Field label="Squares" value={String(SQUARE_COUNT)} desktopOnly />
      <Field label="Taken" value={String(taken)} />
      <Field label="Pending" value={String(pending)} />
      <Field label="Available" value={String(available)} />
      <Field label="Rate" value={`$${PRICE_PER_SQUARE}`} desktopOnly />
    </div>
  );
}
