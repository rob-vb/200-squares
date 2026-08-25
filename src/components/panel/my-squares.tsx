"use client";

// My squares: what the viewer holds, what is still waiting for artwork, and what
// they have bid.
//
// Artwork and link both sit on the row of the block they belong to. One owner
// can hold several blocks and send each one to a different page — a campaign
// block and a jobs block are not the same address — so the link is a property of
// the block, not of the party that bought it.
//
// The click count sits there too, for the same reason and beside the two things
// that earned it. This panel is the only place it appears: ticket 14 keeps every
// per-block number private to its owner, so nothing here has a public twin.

import { useRef, useState } from "react";
import { Money, PanelHeader, SecondaryButton, cleanUrl, inputClass } from "./controls";
import { useScreen } from "./flow";
import { useViewer } from "@/lib/board/viewer";
import { cellCount, priceOf, squareRange } from "@/lib/board/geometry";
import { agoLabel, dayLabel, usd } from "@/lib/board/time";
import { useClientDate } from "../use-client-date";
import type { Rect } from "@/lib/board/types";

/** One block as `owners.mine` sends it: the board's fields plus a click count. */
type MyBlock = {
  id: string;
  rect: Rect;
  url: string;
  artwork: unknown | null;
  frozen: boolean;
  clicks: number;
};

/** A bare count. A number and a noun, nothing around it. */
export const clicksLabel = (clicks: number) =>
  `${clicks.toLocaleString("en-US")} ${clicks === 1 ? "click" : "clicks"}`;

export function MySquares() {
  const { viewer, mine } = useViewer();
  // Null until the client has one: the day labels are the visitor's days.
  const now = useClientDate();
  const { close, setHighlight, highlight, openBid } = useScreen();

  // Pending first: an unfinished block is the only thing here that needs doing.
  const blocks = [...(mine?.blocks ?? [])].sort(
    (a, b) => Number(!!a.artwork) - Number(!!b.artwork),
  );
  const squares = blocks.reduce((n, b) => n + cellCount(b.rect), 0);
  const viewerBannerDays = mine?.bannerDays ?? [];
  const myBids = mine?.bids ?? [];

  return (
    <>
      <PanelHeader
        title={viewer?.name ?? "My squares"}
        note={`${squares} ${squares === 1 ? "square" : "squares"} · ${blocks.length} ${
          blocks.length === 1 ? "block" : "blocks"
        }`}
        onClose={close}
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        {blocks.map((block) => (
          <BlockRow
            key={block.id}
            block={block}
            lit={highlight === block.rect}
            onPoint={() => setHighlight(block.rect)}
          />
        ))}

        {blocks.length === 0 ? (
          <p className="text-faint px-4 py-4 text-[14px] leading-snug">
            You hold no squares yet. Drag a rectangle on the board to take some.
          </p>
        ) : null}

        {/*
          A banner day the viewer won, and what it earned. It belongs beside the
          bids because it is the other half of the same thing: a bid is a banner
          day not yet won, and this is one that was. A day is over and its count
          is final, which is why it needs no artwork row and no link row.
        */}
        {viewerBannerDays.length > 0 ? (
          <div className="border-hairline border-t px-4 py-3">
            <div className="text-faint pb-2 text-[13px]">Banner days you won</div>
            {viewerBannerDays.map((day) => (
              <div
                key={day.date}
                className="flex items-baseline justify-between gap-3 py-1 text-[13px]"
              >
                <span className="font-mono text-[12px]" data-numeric>
                  {now ? dayLabel(day.date, now) : " "}
                </span>
                <span className="text-faint">{clicksLabel(day.clicks)}</span>
                <span className="font-display text-[15px]" data-numeric>
                  {usd(day.wonWithCents)}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        <div className="border-hairline border-t px-4 py-3">
          <div className="text-faint pb-2 text-[13px]">Your bids on tomorrow&rsquo;s banner</div>
          {myBids.length === 0 ? (
            <div className="flex items-center justify-between gap-3">
              <span className="text-[14px]">You have not bid.</span>
              <SecondaryButton onClick={openBid}>Bid</SecondaryButton>
            </div>
          ) : (
            myBids.map((bid) => (
              <div
                key={bid.id}
                className="flex items-baseline justify-between gap-3 py-1 text-[13px]"
              >
                <Money amount={Math.round(bid.amountCents / 100)} className="text-[15px]" />
                <span className="text-faint">
                  {now ? agoLabel(bid.placedAt, now.getTime()) : " "}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

function BlockRow({
  block,
  lit,
  onPoint,
}: {
  block: MyBlock;
  lit: boolean;
  onPoint: () => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [link, setLink] = useState(block.url);

  // ⚠️ Neither write is built. Ticket 20 owns the upload — the browser crops and
  // resizes to two exact WebP files before anything leaves the machine — and the
  // guard both writes go through is ticket 18's `requireOwner(ctx, blockId)`.
  // A button that silently did nothing would be worse than one that says so.
  const soon = (what: string) => setError(`${what} is not built on this deployment yet.`);

  const upload = (chosen: File | null) => {
    if (!chosen) return;
    soon("Uploading artwork");
    if (fileRef.current) fileRef.current.value = "";
  };

  const saveLink = () => {
    const next = cleanUrl(link);
    soon("Changing the link");
    setLink(next || block.url);
    setEditing(false);
  };

  return (
    <div
      onMouseEnter={onPoint}
      onClick={onPoint}
      className={`border-hairline cursor-pointer border-b px-4 py-3 ${lit ? "bg-white" : ""}`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-display text-[17px] leading-none">
          {block.rect.w} × {block.rect.h}
        </span>
        <span className="text-faint text-[13px]">Square {squareRange(block.rect)}</span>
        <Money amount={priceOf(block.rect)} className="text-[15px]" />
      </div>

      <div className="pt-2">
        {editing ? (
          <div className="flex gap-2">
            <input
              className={inputClass}
              value={link}
              onChange={(e) => setLink(e.target.value)}
              inputMode="url"
              autoFocus
            />
            <SecondaryButton onClick={saveLink}>Save</SecondaryButton>
          </div>
        ) : (
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 truncate text-[13px]">{block.url}</span>
            <button
              type="button"
              className="text-accent shrink-0 text-[13px] font-medium"
              onClick={() => {
                setLink(block.url);
                setEditing(true);
              }}
            >
              Edit link
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        {/*
          A live block always states its count, nought included: a square that
          has sent nobody anywhere is the fact its owner most needs. A pending
          block says nothing rather than `0`, because it has never been able to
          be clicked and a zero would read as a verdict on it.
        */}
        <span
          className={`text-[13px] ${block.artwork ? "text-faint" : "text-accent font-semibold"}`}
        >
          {block.artwork ? `Live · ${clicksLabel(block.clicks)}` : "Waiting for artwork"}
        </span>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => upload(e.target.files?.[0] ?? null)}
        />
        {block.artwork ? (
          <SecondaryButton onClick={() => fileRef.current?.click()}>Replace image</SecondaryButton>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="bg-accent shrink-0 px-3 py-2 text-[13px] font-semibold text-white transition-colors duration-150 hover:bg-[#B81C4E]"
          >
            Upload image
          </button>
        )}
      </div>
      {error ? <div className="text-accent pt-1 text-[12px]">{error}</div> : null}
    </div>
  );
}
