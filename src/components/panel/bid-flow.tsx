"use client";

// Bid: the auction, in the panel. Three states — nobody has bid, you are top,
// you were outbid — and one field that always knows what the next bid has to be.
//
// ⚠️ The prototype's fake rival is gone with the reducer. It went over the
// visitor about twenty seconds after they bid, to make being passed visible on a
// board nobody else was looking at. The bids are real rows now, and a real rival
// arrives when somebody else bids.
//
// ⚠️ Placing a bid is **not built here**. A bid is a card authorization, refused
// at the keyboard if the hold would die before the coming 00:00 UTC, and that is
// [ticket 19](../../../.scratch/200squares-v1/issues/19-build-auction.md)'s
// whole job. This panel reads the auction and stops at the button.

import { useState } from "react";
import { useClientDate } from "../use-client-date";
import { Countdown } from "../countdown";
import { Field, Money, PanelHeader, PrimaryButton, inputClass } from "./controls";
import { useScreen } from "./flow";
import { BID_FLOOR, useBoard } from "@/lib/board/board";
import { useViewer } from "@/lib/board/viewer";
import { agoLabel } from "@/lib/board/time";

export function BidFlow() {
  const { auction } = useBoard();
  const { viewer } = useViewer();
  const { close } = useScreen();
  const now = useClientDate();

  const liveBids = auction?.bids ?? [];
  const topBid = liveBids.reduce<(typeof liveBids)[number] | null>(
    (best, b) => (!best || b.amountCents > best.amountCents ? b : best),
    null,
  );
  const minNextBid = Math.round((auction?.minNextCents ?? BID_FLOOR * 100) / 100);
  // Only *theirs* once they are signed in: a stranger must not be told they were
  // outbid, because the site does not know who a stranger is.
  const viewerIsTopBidder = !!viewer && topBid?.ownerId === viewer.id;
  const viewerOutbid =
    !!viewer && !viewerIsTopBidder && liveBids.some((b) => b.ownerId === viewer.id);

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
    setError("Bidding is not open on this deployment yet. The card hold arrives with ticket 19.");
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
            <Countdown className="font-display text-[30px] leading-none" until={auction?.closesAt} />
          </div>
          <div className="text-right">
            <div className="text-faint text-[13px] leading-tight">
              {topBid ? `Top bid · ${liveBids.length} bids` : "No bids yet"}
            </div>
            <Money
              amount={topBid ? Math.round(topBid.amountCents / 100) : BID_FLOOR}
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
            const mine = !!viewer && bid.ownerId === viewer.id;
            return (
              <div
                key={bid.id}
                className="border-hairline flex items-baseline justify-between gap-3 border-b px-4 py-2 text-[13px] last:border-b-0"
              >
                <span className={mine ? "font-semibold" : ""}>
                  {mine ? "You" : (bid.ownerName || "Somebody")}
                </span>
                {/* Null until the client has a clock: "how long ago" is the
                    visitor's own, and the server has no idea what second it is. */}
                <span className="text-faint">
                  {now ? agoLabel(bid.placedAt, now.getTime()) : " "}
                </span>
                <Money amount={Math.round(bid.amountCents / 100)} className="text-[15px]" />
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
