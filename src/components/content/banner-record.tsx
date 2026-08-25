"use client";

// The record of past banner days.
//
// It lives inside the daily-banner section as evidence for the claim above it,
// not as a gallery of its own. Ticket 07 made the winning bid public on purpose:
// it is the proof the auction is real, and it tells a new bidder where the price
// sits. So this is a ledger — date, holder, bid — and not a carousel.
//
// ⚠️ It is its own Convex query, not part of the board's. Nothing the board draws
// needs a day that is over, and the board query is paid for by every viewer on
// every write (ADR 0001). This page is read; the board is watched.

import { useQuery } from "convex/react";
import { api } from "@convex/api";
import { useClientDate } from "../use-client-date";
import { dayLabel, todayUtc, usd } from "@/lib/board/time";
import { artSrc } from "@/lib/board/geometry";
import type { Artwork } from "@/lib/board/types";

function Swatch({ art }: { art: Artwork | null }) {
  return (
    <div
      className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden text-[9px] leading-none"
      style={
        !art
          ? { background: "var(--color-square)" }
          : art.kind === "seed"
            ? { background: art.bg, color: art.fg }
            : { backgroundImage: `url(${artSrc(art, 1)})`, backgroundSize: "cover" }
      }
    >
      {art?.kind === "seed" ? (
        <span className="font-display">{art.label.slice(0, 2)}</span>
      ) : null}
    </div>
  );
}

export function BannerRecord() {
  const days = useQuery(api.auction.record, {});
  // Null until the client has one: the day labels are the visitor's days.
  const now = useClientDate();

  // Today's banner is on the canvas, so the record starts at yesterday. The
  // query returns today too, because My squares wants it.
  const past = (days ?? []).filter((d) => (now ? d.date < todayUtc(now.getTime()) : true));

  return (
    <div className="pt-8">
      <h3 className="pb-2 text-[14px] font-semibold">Past banner days</h3>

      {past.length === 0 ? (
        <p className="text-faint max-w-[62ch] text-[15px] leading-[1.6]">
          No banner day has run yet. The first one is decided tonight at 00:00 UTC.
        </p>
      ) : (
        <ul className="border-hairline max-w-[34rem] border-t">
          {past.map((day) => (
            <li key={day.date} className="border-hairline flex items-center gap-3 border-b py-2">
              <Swatch art={day.artwork} />
              <span className="text-faint w-24 shrink-0 font-mono text-[12px]" data-numeric>
                {now ? dayLabel(day.date, now) : " "}
              </span>
              <span className="min-w-0 flex-1 truncate text-[14px]">{day.ownerName}</span>
              <span className="font-display text-[15px]" data-numeric>
                {day.wonWithCents === null ? "—" : usd(day.wonWithCents)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
