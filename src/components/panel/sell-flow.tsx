"use client";

// Sell: what the owner offers, and for how much.
//
// The whole block, or a straight cut off one of its edges — ticket 11 allows no
// other shape, because both halves have to stay rectangles for ticket 03's model
// to hold them. So the picker offers a side and a depth, and it cannot express
// an L.
//
// Nothing is split here. A listing is a window on a block that is still whole,
// and it stays whole, with its artwork, until somebody buys the part.

import { useEffect, useState } from "react";
import { Field, Money, PanelHeader, PrimaryButton, SecondaryButton, inputClass } from "./controls";
import { useScreen } from "./flow";
import { useBoard } from "@/lib/board/state";
import {
  MIN_ASKING,
  cutOf,
  cutPart,
  cutSides,
  feeOn,
  maxCut,
  priceOf,
  sellerGets,
  squareRange,
  type CutSide,
} from "@/lib/board/geometry";
import type { Rect } from "@/lib/board/types";

const SIDE_LABEL: Record<CutSide, string> = {
  whole: "All of it",
  top: "Top",
  bottom: "Bottom",
  left: "Left",
  right: "Right",
};

export function SellFlow({ blockId }: { blockId: string }) {
  const { state, dispatch } = useBoard();
  const { close, openMine, setHighlight } = useScreen();
  const block = state.blocks.find((b) => b.id === blockId);

  const listed = block?.listing ?? null;
  const start = block && listed ? cutOf(block.rect, listed.rect) : { side: "whole" as CutSide, size: 0 };
  const [side, setSide] = useState<CutSide>(start.side);
  const [size, setSize] = useState(start.size || 1);
  const [price, setPrice] = useState(listed ? String(listed.price) : "");
  const [touched, setTouched] = useState(false);

  const part: Rect | null = block ? cutPart(block.rect, side, size) : null;

  // The canvas says what is being sold while the price is being typed.
  useEffect(() => {
    if (part) setHighlight(part);
  }, [part?.r, part?.c, part?.w, part?.h]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!block || !part) return null;

  const asking = Number.parseInt(price, 10);
  const valid = Number.isFinite(asking) && asking >= MIN_ASKING;
  const sides = cutSides(block.rect);

  const chooseSide = (next: CutSide) => {
    setSide(next);
    setSize(Math.min(size, Math.max(1, maxCut(block.rect, next))));
  };

  const list = () => {
    setTouched(true);
    if (!valid) return;
    dispatch({ type: "list", blockId, rect: part, price: asking });
    openMine();
  };

  return (
    <>
      <PanelHeader
        title={listed ? "Change your price" : `Sell ${block.rect.w} × ${block.rect.h}`}
        note={`Square ${squareRange(block.rect)}`}
        onClose={close}
      />

      <div className="flex flex-col gap-4 px-4 py-4">
        {sides.length > 0 ? (
          <Field label="What you sell" hint="A straight cut only. Both parts stay rectangles.">
            <div className="flex items-start gap-3">
              <BlockDiagram rect={block.rect} part={part} />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex flex-wrap gap-1">
                  {(["whole", ...sides] as CutSide[]).map((s) => (
                    <Chip key={s} on={side === s} onClick={() => chooseSide(s)}>
                      {SIDE_LABEL[s]}
                    </Chip>
                  ))}
                </div>
                {side === "whole" ? null : (
                  <Stepper
                    value={size}
                    max={maxCut(block.rect, side)}
                    unit={side === "top" || side === "bottom" ? "rows" : "columns"}
                    onChange={setSize}
                  />
                )}
              </div>
            </div>
          </Field>
        ) : null}

        <div className="border-hairline flex items-baseline justify-between border-y py-3">
          <span className="text-[14px]">
            {part.w} × {part.h} · square {squareRange(part)}
          </span>
          <span className="text-faint text-[13px]">
            paid <Money amount={priceOf(part)} className="text-[13px]" />
          </span>
        </div>

        <Field
          label="Asking price"
          error={touched && !valid ? `The floor is $${MIN_ASKING} — what the site charges.` : null}
          hint={valid ? undefined : `From $${MIN_ASKING}. No ceiling.`}
        >
          <div className="flex items-center gap-2">
            <span className="font-display text-[19px] leading-none">$</span>
            <input
              className={inputClass}
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder={String(priceOf(part))}
              inputMode="numeric"
              autoFocus
            />
          </div>
        </Field>

        {valid ? (
          <div className="border-hairline flex items-baseline justify-between border bg-white px-3 py-2">
            <span className="text-[14px]">You receive</span>
            <span className="text-right">
              <Money amount={sellerGets(asking)} className="text-[22px] leading-none" />
              <span className="text-faint block text-[12px]">
                the site keeps 10% · ${feeOn(asking).toLocaleString("en-US")}
              </span>
            </span>
          </div>
        ) : null}

        <PrimaryButton onClick={list}>{listed ? "SAVE THE PRICE" : "PUT IT UP FOR SALE"}</PrimaryButton>

        {listed ? (
          <SecondaryButton
            onClick={() => {
              dispatch({ type: "unlist", blockId });
              openMine();
            }}
          >
            Take it off the market
          </SecondaryButton>
        ) : null}

        <p className="text-faint text-[12px] leading-snug">
          Listing is free. Nothing splits until it sells, and you can change the price or withdraw
          at any time. Your artwork and your link do not go with it.
        </p>
      </div>
    </>
  );
}

function Chip({
  on,
  children,
  ...rest
}: { on: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      type="button"
      className={`border-hairline border px-2 py-1 text-[12px] font-medium transition-colors duration-150 ${
        on ? "bg-accent border-accent text-white" : "hover:bg-white bg-transparent"
      }`}
    >
      {children}
    </button>
  );
}

function Stepper({
  value,
  max,
  unit,
  onChange,
}: {
  value: number;
  max: number;
  unit: string;
  onChange: (n: number) => void;
}) {
  const btn =
    "border-hairline grid h-7 w-7 place-items-center border bg-white text-[15px] leading-none disabled:text-ink/25";
  return (
    <div className="flex items-center gap-2">
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= 1}>
        −
      </button>
      <span className="text-[13px]" data-numeric>
        {value} {unit}
      </span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max}>
        +
      </button>
    </div>
  );
}

/** The block at thumbnail size, with the part being sold filled in. */
function BlockDiagram({ rect, part }: { rect: Rect; part: Rect }) {
  const px = 13;
  return (
    <div
      className="bg-hairline grid shrink-0 gap-px p-px"
      style={{
        gridTemplateColumns: `repeat(${rect.w}, ${px}px)`,
        gridTemplateRows: `repeat(${rect.h}, ${px}px)`,
      }}
    >
      {Array.from({ length: rect.w * rect.h }, (_, i) => {
        const r = rect.r + Math.floor(i / rect.w);
        const c = rect.c + (i % rect.w);
        const inPart =
          r >= part.r && r < part.r + part.h && c >= part.c && c < part.c + part.w;
        return (
          <div key={i} style={{ background: inPart ? "var(--color-accent)" : "var(--color-square)" }} />
        );
      })}
    </div>
  );
}
