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

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/api";
import type { Id } from "@convex/dataModel";
import { Money, PanelHeader, SecondaryButton, cleanUrl, inputClass } from "./controls";
import { ArtworkRules, ArtworkUpload } from "../art/artwork-upload";
import { useScreen } from "./flow";
import { useViewer } from "@/lib/board/viewer";
import { BANNER, cellCount, priceOf, squareRange } from "@/lib/board/geometry";
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
  const invoices = mine?.invoices ?? [];
  const strikes = mine?.strikes ?? 0;

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
        {/*
          ⚠️ The strike count, and it is here because ticket 11 made the warning
          part of the rule: three in twelve months freeze a block, and freezing
          somebody who never knew they were at two is the exact complaint worth
          designing out. It says nothing at all at nought — a counter at zero on
          a page about your own squares reads as an accusation.
        */}
        {strikes > 0 ? (
          <div className="border-hairline text-accent border-b px-4 py-3 text-[13px] font-semibold">
            Strike {strikes} of 3. Three strikes in twelve months freeze a block.
          </div>
        ) : null}

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

        {/*
          ⚠️ The second place an invoice is delivered (ticket 17). The first is
          the order-confirmed mail, and a mail is lost more easily than an
          account. The link is the permanent token URL, so it can be handed to a
          bookkeeper without handing over the account with it.
        */}
        {invoices.length > 0 ? (
          <div className="border-hairline border-t px-4 py-3">
            <div className="text-faint pb-2 text-[13px]">Your invoices</div>
            {invoices.map((invoice) => (
              <div
                key={invoice.number}
                className="flex items-baseline justify-between gap-3 py-1 text-[13px]"
              >
                <a
                  href={invoice.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent font-mono text-[12px] underline"
                  data-numeric
                >
                  {invoice.number}
                </a>
                <span className="text-faint min-w-0 truncate">{invoice.what}</span>
                <span className="font-display text-[15px]" data-numeric>
                  {usd(invoice.totalCents)}
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
            myBids.map((bid) => <BidRow key={bid.id} bid={bid} now={now} />)
          )}
        </div>
      </div>
    </>
  );
}

/**
 * One standing bid, and where it will point if it wins.
 *
 * ⚠️ Ticket 07's empty hour: the auction closes at 00:00 UTC and the day it
 * decides begins at 00:00 UTC, so the winner gets no preparation time at all. A
 * bidder may attach a link and an image at any time while the bid stands, and a
 * winner with neither gets the house ad until they upload. The image half is
 * [ticket 20](../../../.scratch/200squares-v1/issues/20-build-artwork.md)'s.
 */
function BidRow({
  bid,
  now,
}: {
  bid: { id: string; amountCents: number; placedAt: number; url: string; artwork: boolean };
  now: Date | null;
}) {
  const setBannerContent = useMutation(api.auction.setBannerContent);
  const bidUploadUrls = useMutation(api.art.bidUploadUrls);
  const setBidArtwork = useMutation(api.art.setBidArtwork);
  const [url, setUrl] = useState(bid.url);
  const [saved, setSaved] = useState(false);
  const bidId = bid.id as Id<"bids">;

  return (
    <div className="flex flex-col gap-2 py-1">
      <div className="flex items-baseline justify-between gap-3 text-[13px]">
        <Money amount={Math.round(bid.amountCents / 100)} className="text-[15px]" />
        <span className="text-faint">{now ? agoLabel(bid.placedAt, now.getTime()) : " "}</span>
      </div>
      <div className="flex gap-2">
        <input
          className={inputClass}
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setSaved(false);
          }}
          placeholder="Where the banner will point"
          autoComplete="url"
        />
        <SecondaryButton
          onClick={() => {
            void setBannerContent({ bidId, url: cleanUrl(url) }).then(() => setSaved(true));
          }}
        >
          {saved ? "Saved" : "Save"}
        </SecondaryButton>
      </div>
      {/*
        ⚠️ The banner is 5 x 5, so the crop is against that shape and not a
        block's. A bidder who prepares gets the whole day; one who does not gets
        the house ad until they upload, which is ticket 07's empty hour.
      */}
      <ArtworkUpload
        rect={BANNER}
        hasArtwork={bid.artwork}
        urls={() => bidUploadUrls({ bidId })}
        save={(ids) =>
          setBidArtwork({
            bidId,
            small: ids.small as Id<"_storage">,
            large: ids.large as Id<"_storage">,
          })
        }
      />
      <ArtworkRules />
    </div>
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
  const setBlockUrl = useMutation(api.art.setBlockUrl);
  const blockUploadUrls = useMutation(api.art.blockUploadUrls);
  const setBlockArtwork = useMutation(api.art.setBlockArtwork);
  const { setPreview } = useScreen();
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [link, setLink] = useState(block.url);
  const blockId = block.id as Id<"blocks">;

  const saveLink = () => {
    const next = cleanUrl(link);
    setError(null);
    setLink(next);
    setEditing(false);
    void setBlockUrl({ blockId, url: next }).catch(() => {
      setLink(block.url);
      setError("That did not save. Try again.");
    });
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
            <span className="min-w-0 truncate text-[13px]">{block.url || "No link yet"}</span>
            {/*
              ⚠️ A frozen block takes neither (ticket 11). It is still owned and
              still on the board; what the third strike takes away is the right
              to put anything new on it.
            */}
            {block.frozen ? (
              <span className="text-accent shrink-0 text-[13px] font-semibold">Frozen</span>
            ) : (
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
            )}
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
      </div>

      {block.frozen ? null : (
        <div className="pt-2">
          {/*
            The cropped picture lands on the board before the write does, over
            the same highlight this row already points at. It is the `1x` file
            itself, so what the owner sees is what the board will draw.
          */}
          <ArtworkUpload
            rect={block.rect}
            hasArtwork={Boolean(block.artwork)}
            urls={() => blockUploadUrls({ blockId })}
            save={(ids) =>
              setBlockArtwork({
                blockId,
                small: ids.small as Id<"_storage">,
                large: ids.large as Id<"_storage">,
              })
            }
            onPreview={(url) => {
              onPoint();
              setPreview(url);
            }}
          />
          {block.artwork ? null : <ArtworkRules className="pt-2" />}
        </div>
      )}

      {error ? <div className="text-accent pt-1 text-[12px]">{error}</div> : null}
    </div>
  );
}
