"use client";

// My squares: what the viewer holds, what is still waiting for artwork, and what
// they have bid.
//
// Selling sits on the row too, for the same reason: a listing is a property of
// one block, and an owner can hold five and want out of one.
//
// Artwork and link both sit on the row of the block they belong to. One owner
// can hold several blocks and send each one to a different page — a campaign
// block and a jobs block are not the same address — so the link is a property of
// the block, not of the party that bought it.

import { useRef, useState } from "react";
import { Money, PanelHeader, SecondaryButton, cleanUrl, inputClass } from "./controls";
import { useScreen } from "./flow";
import { useBoard } from "@/lib/board/state";
import { cellCount, priceOf, sellerGets, squareRange } from "@/lib/board/geometry";
import { agoLabel } from "@/lib/board/time";
import type { Block } from "@/lib/board/types";

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

export function MySquares() {
  const { state, viewer, viewerBlocks, liveBids } = useBoard();
  const { close, setHighlight, highlight, openBid, openSell } = useScreen();

  // Pending first: an unfinished block is the only thing here that needs doing.
  const blocks = [...viewerBlocks].sort((a, b) => Number(!!a.artwork) - Number(!!b.artwork));
  const squares = blocks.reduce((n, b) => n + cellCount(b.rect), 0);
  const myBids = liveBids.filter((b) => b.bidderId === state.viewerId);

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
            onSell={() => openSell(block.id)}
          />
        ))}

        {blocks.length === 0 ? (
          <p className="text-faint px-4 py-4 text-[14px] leading-snug">
            You hold no squares yet. Drag a rectangle on the board to take some.
          </p>
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
                <Money amount={bid.amount} className="text-[15px]" />
                <span className="text-faint">{agoLabel(bid.minutesAgo)}</span>
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
  onSell,
}: {
  block: Block;
  lit: boolean;
  onPoint: () => void;
  onSell: () => void;
}) {
  const { dispatch } = useBoard();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [link, setLink] = useState(block.url);

  const upload = (chosen: File | null) => {
    if (!chosen) return;
    if (!chosen.type.startsWith("image/")) return setError("That is not an image.");
    if (chosen.size > MAX_UPLOAD_BYTES) return setError("Too large. The limit is 2 MB.");
    setError(null);
    dispatch({
      type: "uploadArtwork",
      blockId: block.id,
      artwork: { kind: "image", src: URL.createObjectURL(chosen) },
    });
  };

  const saveLink = () => {
    const next = cleanUrl(link);
    if (next) dispatch({ type: "editLink", blockId: block.id, url: next });
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
        <span
          className={`text-[13px] ${block.artwork ? "text-faint" : "text-accent font-semibold"}`}
        >
          {block.artwork ? "Live" : "Waiting for artwork"}
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

      <div className="flex items-center justify-between gap-3 pt-2">
        {block.listing ? (
          <span className="text-[13px]">
            <span className="text-accent font-semibold">For sale</span>
            <span className="text-faint">
              {" · "}
              {block.listing.rect.w} × {block.listing.rect.h} at $
              {block.listing.price.toLocaleString("en-US")} · you get $
              {sellerGets(block.listing.price).toLocaleString("en-US")}
            </span>
          </span>
        ) : (
          <span className="text-faint text-[13px]">Not for sale</span>
        )}
        <SecondaryButton onClick={onSell}>
          {block.listing ? "Change price" : "Sell"}
        </SecondaryButton>
      </div>
    </div>
  );
}
