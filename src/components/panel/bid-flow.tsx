"use client";

// Bid: the auction, in the panel. Three states — nobody has bid, you are top,
// you were outbid — and one field that always knows what the next bid has to be.
//
// The tension of an auction is being passed. A prototype has nobody to pass you,
// so a single fake rival goes over the visitor once, about twenty seconds after
// they bid (it is scheduled in `state.tsx`, so it lands even with the panel shut).

import { useState } from "react";
import { Countdown } from "../countdown";
import { Field, Money, PanelHeader, PrimaryButton, inputClass } from "./controls";
import { useScreen } from "./flow";
import { BID_FLOOR, useBoard } from "@/lib/board/state";
import { agoLabel } from "@/lib/board/time";

export function BidFlow() {
  const { state, dispatch, topBid, liveBids, minNextBid, viewerIsTopBidder, viewerOutbid, board } =
    useBoard();
  const { close } = useScreen();

  const [amount, setAmount] = useState(String(minNextBid));
  const [error, setError] = useState<string | null>(null);
  // Being outbid moves the floor, so the field refills itself with the new
  // minimum: the visitor should never have to work out what to type. This is the
  // adjust-during-render pattern, not an effect — the new floor is derived from
  // props, so React can re-run this component before it paints anything.
  const [floorShown, setFloorShown] = useState(minNextBid);
  if (floorShown !== minNextBid) {
    setFloorShown(minNextBid);
    setAmount(String(minNextBid));
    setError(null);
  }

  const place = () => {
    const value = Math.round(Number(amount));
    if (!Number.isFinite(value) || value < minNextBid) {
      setError(`The next bid is at least $${minNextBid.toLocaleString("en-US")}.`);
      return;
    }
    setError(null);
    dispatch({ type: "placeBid", amount: value });
  };

  return (
    <>
      <PanelHeader
        title="Tomorrow’s banner"
        note="The 5 × 5 spot, for a whole day"
        onClose={close}
      />

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-hairline flex items-end justify-between gap-4 border-b px-4 py-3">
          <div>
            <div className="text-faint text-[13px] leading-tight">Closes 00:00 UTC</div>
            <Countdown className="font-display text-[30px] leading-none" />
          </div>
          <div className="text-right">
            <div className="text-faint text-[13px] leading-tight">
              {topBid ? `Top bid · ${liveBids.length} bids` : "No bids yet"}
            </div>
            <Money
              amount={topBid ? topBid.amount : BID_FLOOR}
              className="text-[26px] leading-none"
            />
          </div>
        </div>

        {viewerIsTopBidder ? (
          <div className="bg-accent px-4 py-3 text-[14px] leading-snug text-white">
            You are the top bidder. Hold it until the countdown runs out and the banner is yours
            tomorrow.
          </div>
        ) : null}

        {viewerOutbid ? (
          <div className="bg-ink text-page px-4 py-3 text-[14px] leading-snug">
            You have been outbid. Go higher to take it back.
          </div>
        ) : null}

        <div className="flex flex-col gap-4 px-4 py-4">
          <Field
            label="Your bid"
            error={error}
            hint={`At least $${minNextBid.toLocaleString("en-US")}`}
          >
            <input
              className={inputClass}
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
              inputMode="numeric"
            />
          </Field>

          <PrimaryButton onClick={place}>
            {viewerOutbid ? "BID AGAIN" : "PLACE BID"}
          </PrimaryButton>
          <p className="text-faint text-[12px] leading-snug">
            Nothing is charged. The highest bid at 00:00 UTC holds the banner all of tomorrow.
          </p>
        </div>

        <div className="border-hairline min-h-0 flex-1 overflow-y-auto border-t">
          {liveBids.map((bid) => {
            const bidder = board.ownerById.get(bid.bidderId);
            const mine = bid.bidderId === state.viewerId;
            return (
              <div
                key={bid.id}
                className="border-hairline flex items-baseline justify-between gap-3 border-b px-4 py-2 text-[13px] last:border-b-0"
              >
                <span className={mine ? "font-semibold" : ""}>
                  {mine ? "You" : (bidder?.name ?? "Somebody")}
                </span>
                <span className="text-faint">{agoLabel(bid.minutesAgo)}</span>
                <Money amount={bid.amount} className="text-[15px]" />
              </div>
            );
          })}
          {liveBids.length === 0 ? (
            <p className="text-faint px-4 py-3 text-[13px]">
              Nobody has bid. The first bid takes the banner.
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
}
