"use client";

// Sell: which part of the block is on offer, and what a square of it costs.
//
// The owner draws the offer on a thumbnail of their own block, with the same
// gesture the board uses. Any rectangle inside it, down to one square. There is
// no cut to choose, because what the owner offers no longer has to leave a
// rectangle behind — the split handles that (see `remainderOf`).
//
// The price is per square, like the site's own $250. That is what makes a part
// sale pricable at all, and it puts the two numbers side by side for the buyer.
//
// Nothing is split here. A listing is a window on a block that is still whole,
// and it stays whole, with its artwork, until somebody buys part of it.

import { useEffect, useRef, useState } from "react";
import {
  Field,
  FieldBox,
  Money,
  PanelHeader,
  PrimaryButton,
  SecondaryButton,
  inputClass,
} from "./controls";
import { useScreen } from "./flow";
import { useBoard } from "@/lib/board/state";
import {
  MIN_ASKING,
  PRICE_PER_SQUARE,
  askingFor,
  cellCount,
  feeOn,
  rectWithin,
  sellerGets,
  squareRange,
} from "@/lib/board/geometry";
import type { Rect } from "@/lib/board/types";

export function SellFlow({ blockId }: { blockId: string }) {
  const { state, dispatch } = useBoard();
  const { close, openMine, setHighlight } = useScreen();
  const block = state.blocks.find((b) => b.id === blockId);
  const listed = block?.listing ?? null;

  const [part, setPart] = useState<Rect | null>(listed?.rect ?? block?.rect ?? null);
  const [price, setPrice] = useState(listed ? String(listed.pricePerSquare) : "");
  const [touched, setTouched] = useState(false);

  // The canvas says what is on offer while the price is being typed.
  useEffect(() => {
    if (part) setHighlight(part);
  }, [part?.r, part?.c, part?.w, part?.h]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!block || !part) return null;

  const asking = Number.parseInt(price, 10);
  const valid = Number.isFinite(asking) && asking >= MIN_ASKING;
  const squares = cellCount(part);
  const total = valid ? askingFor(asking, part) : 0;
  const whole = squares === cellCount(block.rect);

  const list = () => {
    setTouched(true);
    if (!valid) return;
    dispatch({ type: "list", blockId, rect: part, pricePerSquare: asking });
    openMine();
  };

  return (
    <>
      <PanelHeader
        title={listed ? "Change your offer" : `Sell ${block.rect.w} × ${block.rect.h}`}
        note={`Square ${squareRange(block.rect)}`}
        onClose={close}
      />

      <div className="flex flex-col gap-4 px-4 py-4">
        <FieldBox
          label="What you offer"
          hint="Drag inside your block. One square, or all of it."
        >
          <div className="flex items-start gap-3">
            <BlockPicker rect={block.rect} part={part} onPick={setPart} />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="font-display text-[19px] leading-none">
                {part.w} × {part.h}
              </div>
              <div className="text-faint text-[13px] leading-tight">
                {squares} of your {cellCount(block.rect)} squares · {squareRange(part)}
              </div>
              {whole ? null : (
                <SecondaryButton onClick={() => setPart(block.rect)}>
                  Offer all of it
                </SecondaryButton>
              )}
            </div>
          </div>
        </FieldBox>

        <Field
          label="Your price, per square"
          error={touched && !valid ? `A price is needed. The floor is $${MIN_ASKING}.` : null}
          hint={valid ? undefined : `The site charges $${PRICE_PER_SQUARE} for a fresh square.`}
        >
          <div className="flex items-center gap-2">
            <span className="font-display text-[19px] leading-none">$</span>
            <input
              className={inputClass}
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder={String(PRICE_PER_SQUARE)}
              inputMode="numeric"
              autoFocus
            />
            <span className="text-faint shrink-0 text-[13px]">a square</span>
          </div>
        </Field>

        {valid ? (
          <div className="border-hairline border bg-white px-3 py-2">
            <div className="flex items-baseline justify-between">
              <span className="text-[14px]">If all {squares} go</span>
              <Money amount={sellerGets(total)} className="text-[22px] leading-none" />
            </div>
            <div className="text-faint pt-1 text-[12px] leading-snug">
              ${total.toLocaleString("en-US")} less the site&rsquo;s 10% · $
              {feeOn(total).toLocaleString("en-US")}. A buyer may take fewer.
            </div>
          </div>
        ) : null}

        <PrimaryButton onClick={list}>{listed ? "SAVE THE OFFER" : "PUT IT UP FOR SALE"}</PrimaryButton>

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
          Listing is free, and you can change it or withdraw at any time. A buyer takes any
          rectangle out of your offer, so you may end up holding what is left as more than one
          block. Your artwork and your link never go with it.
        </p>
      </div>
    </>
  );
}

/**
 * The block at thumbnail size. Drag on it the way you drag on the board.
 *
 * The whole grid takes the pointer and works out the cell from where it is, the
 * way the canvas does. Per-cell handlers cannot: touch captures the pointer to
 * the cell it went down on, so no other cell ever hears about the drag.
 */
function BlockPicker({
  rect,
  part,
  onPick,
}: {
  rect: Rect;
  part: Rect;
  onPick: (next: Rect) => void;
}) {
  const px = 20;
  const gap = 1;
  const boxRef = useRef<HTMLDivElement | null>(null);
  const anchor = useRef<{ r: number; c: number } | null>(null);

  const cellAt = (e: React.PointerEvent) => {
    const box = boxRef.current?.getBoundingClientRect();
    if (!box) return null;
    const clamp = (v: number, hi: number) => Math.max(0, Math.min(v, hi - 1));
    return {
      r: rect.r + clamp(Math.floor((e.clientY - box.top - gap) / (px + gap)), rect.h),
      c: rect.c + clamp(Math.floor((e.clientX - box.left - gap) / (px + gap)), rect.w),
    };
  };

  return (
    <div
      ref={boxRef}
      className="bg-hairline grid shrink-0 cursor-crosshair touch-none gap-px p-px select-none"
      style={{
        gridTemplateColumns: `repeat(${rect.w}, ${px}px)`,
        gridTemplateRows: `repeat(${rect.h}, ${px}px)`,
      }}
      onPointerDown={(e) => {
        const at = cellAt(e);
        if (!at) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        anchor.current = at;
        onPick(rectWithin(at, at, rect));
      }}
      onPointerMove={(e) => {
        const at = anchor.current && cellAt(e);
        if (at) onPick(rectWithin(anchor.current!, at, rect));
      }}
      onPointerUp={() => (anchor.current = null)}
      onPointerCancel={() => (anchor.current = null)}
    >
      {Array.from({ length: rect.w * rect.h }, (_, i) => {
        const r = rect.r + Math.floor(i / rect.w);
        const c = rect.c + (i % rect.w);
        const on = r >= part.r && r < part.r + part.h && c >= part.c && c < part.c + part.w;
        return (
          <div
            key={i}
            style={{ background: on ? "var(--color-accent)" : "var(--color-square)" }}
          />
        );
      })}
    </div>
  );
}
