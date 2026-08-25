"use client";

// Buy: one screen, not a wizard. The selection was already confirmed by the chip
// on the canvas, so the panel only has to hold the rectangle while the visitor
// pays for it.
//
// ⚠️ Company, link and artwork have **left this panel**. They were the
// prototype's, and ticket 06 moved them: the link and the image are supplied
// after payment, from the thank-you page, and their place here is taken by the
// ticket 03 fields — buyer type, country, name, the conditional EU VAT number,
// the withdrawal box and the invoice line. Those, the order button that says
// *Order now — obliges you to pay*, and Stripe itself all arrive with
// [ticket 16](../../../.scratch/200squares-v1/issues/16-build-checkout.md).
//
// What ticket 15 does build is the thing underneath all of it: **the claim**. A
// reservation holds the rectangle for fifteen minutes, exactly one visitor can
// win a given square, and the loser is handed back the part of their drag that
// survived rather than an error.

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/api";
import type { Id } from "@convex/dataModel";
import { Money, PanelHeader, PrimaryButton, SecondaryButton } from "./controls";
import { useScreen } from "./flow";
import { Countdown } from "../countdown";
import { PRICE_PER_SQUARE, cellCount, priceOf, squareRange } from "@/lib/board/geometry";
import type { Rect } from "@/lib/board/types";

/** How the reservation attempt ended. `null` means it has not been made. */
type Held = { id: Id<"reservations">; expiresAt: number };

export function BuyFlow({ rect }: { rect: Rect }) {
  const { close, selectRect } = useScreen();
  const reserve = useMutation(api.reservations.reserve);
  const release = useMutation(api.reservations.release);

  const [held, setHeld] = useState<Held | null>(null);
  const [lost, setLost] = useState<{ offer: Rect | null } | null>(null);
  const [busy, setBusy] = useState(false);

  const price = priceOf(rect);
  const squares = cellCount(rect);

  const claim = async () => {
    setBusy(true);
    setLost(null);
    try {
      const result = await reserve({ rect });
      if (result.ok) {
        setHeld({ id: result.reservationId, expiresAt: result.expiresAt });
        return;
      }
      // ⚠️ Somebody got there first. Ticket 05: the loser is not shown an error
      // and sent away — their selection is redrawn without the part that went,
      // so a 2 × 2 that lost one square becomes a 1 × 2 in one tap. Only a total
      // overlap leaves nothing to show.
      setLost({ offer: result.offer });
      if (result.offer) selectRect(result.offer);
    } finally {
      setBusy(false);
    }
  };

  const giveBack = async () => {
    if (held) await release({ reservationId: held.id });
    setHeld(null);
    close();
  };

  if (held) {
    return (
      <>
        <PanelHeader
          title="Held for you"
          note={`Square ${squareRange(rect)} · ${squares} ${squares === 1 ? "square" : "squares"}`}
          onClose={giveBack}
        />
        <div className="flex flex-col gap-4 px-4 py-4">
          <div className="border-hairline flex items-baseline justify-between border-b pb-3">
            <span className="text-[14px]">Nobody else can take these</span>
            <Countdown className="font-display text-[26px] leading-none" until={held.expiresAt} />
          </div>
          <p className="text-[14px] leading-snug">
            The squares are yours for fifteen minutes. On the board they read as taken, and if you
            do not pay in that time they go back to being for sale.
          </p>
          <p className="text-faint text-[13px] leading-snug">
            Payment is not built yet. This deployment holds the rectangle and stops there — the
            checkout, the VAT and the invoice arrive with ticket 16.
          </p>
          <SecondaryButton onClick={giveBack}>Give them back</SecondaryButton>
        </div>
      </>
    );
  }

  return (
    <>
      <PanelHeader
        title={`${rect.w} × ${rect.h} · ${squares} ${squares === 1 ? "square" : "squares"}`}
        note={`Square ${squareRange(rect)} · $${PRICE_PER_SQUARE} each`}
        onClose={close}
      />

      <div className="flex flex-col gap-4 px-4 py-4">
        <div className="border-hairline flex items-baseline justify-between border-b pb-3">
          <span className="text-[14px]">One payment, yours for good</span>
          <Money amount={price} className="text-[26px] leading-none" />
        </div>

        {lost ? (
          <p className="text-accent text-[14px] leading-snug">
            {lost.offer
              ? "Somebody took part of that while you were drawing. What is left is selected — take it, or draw somewhere else."
              : "Somebody took those while you were drawing. Draw somewhere else."}
          </p>
        ) : null}

        <PrimaryButton onClick={claim} disabled={busy}>
          {busy ? "HOLDING…" : `HOLD FOR $${price.toLocaleString("en-US")}`}
        </PrimaryButton>
        <p className="text-faint text-[12px] leading-snug">
          Nothing is charged yet. The squares are held for fifteen minutes while you pay.
        </p>
      </div>
    </>
  );
}

export function BoughtFlow({ rect, hasArtwork }: { rect: Rect; hasArtwork: boolean }) {
  const { close, openMine } = useScreen();

  return (
    <>
      <PanelHeader
        title={hasArtwork ? "Your block is live" : "Your block is reserved"}
        note={`Square ${squareRange(rect)}`}
        onClose={close}
      />
      <div className="flex flex-col gap-4 px-4 py-4">
        <p className="text-[14px] leading-snug">
          {hasArtwork
            ? "It is on the board now, and a click on it opens your website."
            : "It is paid for and marked on the board. It stays marked until your artwork arrives."}
        </p>
        {hasArtwork ? null : <PrimaryButton onClick={openMine}>ADD YOUR ARTWORK</PrimaryButton>}
        <SecondaryButton onClick={openMine}>My squares</SecondaryButton>
      </div>
    </>
  );
}
