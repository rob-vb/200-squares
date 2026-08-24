"use client";

// The legend under the canvas. It carries the state of the board — what is held
// and what is waiting for artwork — and nothing else.
//
// `Available` used to sit here too. Ticket 07 moved it out: the live counter
// directly under the canvas carries the offer, and two counters within one
// screen of each other is one too many.
//
// Every field draws its own left rule and the box closes on the right, so the
// rules land between fields at both breakpoints — a phone shows the two counts
// that move, a desktop shows all five, beside the line that says how to buy.
//
// It shares its row with the For sale switch, so it takes the width that is left
// rather than all of it.

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
  const { taken, pending } = board.stats;

  return (
    <div className="border-hairline bg-square grid min-w-0 flex-1 grid-cols-2 border-y border-r lg:w-auto lg:flex-none lg:grid-cols-5">
      <Field label="Sheet" value="01 / 01" desktopOnly />
      <Field label="Squares" value={String(SQUARE_COUNT)} desktopOnly />
      <Field label="Taken" value={String(taken)} />
      <Field label="Pending" value={String(pending)} />
      <Field label="Rate" value={`$${PRICE_PER_SQUARE}`} desktopOnly />
    </div>
  );
}
