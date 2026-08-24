"use client";

// The record of past banner days.
//
// It lives inside the daily-banner section as evidence for the claim above it,
// not as a gallery of its own. Ticket 07 made the winning bid public on purpose:
// it is the proof the auction is real, and it tells a new bidder where the price
// sits. So this is a ledger — date, holder, bid — and not a carousel.
//
// Past days are the negative `dayOffset` entries. The `early` dataset has none.

import { useClientDate } from "../use-client-date";
import { useBoard } from "@/lib/board/state";
import { dayLabel } from "@/lib/board/time";
import type { Artwork } from "@/lib/board/types";

function Swatch({ art }: { art: Artwork }) {
  return (
    <div
      className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden text-[9px] leading-none"
      style={
        art.kind === "mock"
          ? { background: art.bg, color: art.fg }
          : { backgroundImage: `url(${art.src})`, backgroundSize: "cover" }
      }
    >
      {art.kind === "mock" ? <span className="font-display">{art.label.slice(0, 2)}</span> : null}
    </div>
  );
}

export function BannerRecord() {
  const { state, board } = useBoard();
  // Null until the client has one: the day labels are the visitor's days.
  const now = useClientDate();

  const past = state.bannerDays
    .filter((d) => d.dayOffset < 0)
    .sort((a, b) => b.dayOffset - a.dayOffset);

  return (
    <div className="pt-8">
      <h3 className="pb-2 text-[14px] font-semibold">Past banner days</h3>

      {past.length === 0 ? (
        <p className="text-faint max-w-[62ch] text-[15px] leading-[1.6]">
          No banner day has run yet. The first one is decided tonight at 00:00 UTC.
        </p>
      ) : (
        <ul className="border-hairline max-w-[34rem] border-t">
          {past.map((day) => {
            const owner = board.ownerById.get(day.ownerId);
            return (
              <li
                key={day.dayOffset}
                className="border-hairline flex items-center gap-3 border-b py-2"
              >
                <Swatch art={day.artwork} />
                <span className="text-faint w-24 shrink-0 font-mono text-[12px]" data-numeric>
                  {now ? dayLabel(day.dayOffset, now) : " "}
                </span>
                <span className="min-w-0 flex-1 truncate text-[14px]">
                  {owner?.name ?? "Unknown"}
                </span>
                <span className="font-display text-[15px]" data-numeric>
                  ${day.wonWith.toLocaleString("en-US")}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
