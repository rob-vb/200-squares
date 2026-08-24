"use client";

// My squares: what the viewer holds, what is still waiting for artwork, and what
// they have bid.
//
// The link sits above the list, not on each row. Ticket 06 asked for "Edit link"
// per block, but ticket 03 gave the link to the owner, not to the block: one
// party, one website. Repeating the same field on every row would promise a
// per-block link the model cannot keep.

import { useRef, useState } from "react";
import { Money, PanelHeader, SecondaryButton, inputClass } from "./controls";
import { useScreen } from "./flow";
import { useBoard } from "@/lib/board/state";
import { cellCount, priceOf, squareRange } from "@/lib/board/geometry";
import { agoLabel } from "@/lib/board/time";
import type { Block } from "@/lib/board/types";

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

export function MySquares() {
  const { state, dispatch, viewer, viewerBlocks, liveBids } = useBoard();
  const { close, setHighlight, highlight, openBid } = useScreen();

  const [editingLink, setEditingLink] = useState(false);
  const [link, setLink] = useState(viewer?.url ?? "");

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
        <div className="border-hairline border-b px-4 py-3">
          <div className="text-faint pb-1 text-[13px]">
            Your link. Every block you own opens it.
          </div>
          {editingLink ? (
            <div className="flex gap-2">
              <input
                className={inputClass}
                value={link}
                onChange={(e) => setLink(e.target.value)}
                inputMode="url"
              />
              <SecondaryButton
                onClick={() => {
                  const next = link.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
                  if (next) dispatch({ type: "editLink", url: next });
                  setLink(next);
                  setEditingLink(false);
                }}
              >
                Save
              </SecondaryButton>
            </div>
          ) : (
            <div className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 truncate text-[14px]">{viewer?.url}</span>
              <button
                type="button"
                className="text-accent shrink-0 text-[13px] font-medium"
                onClick={() => {
                  setLink(viewer?.url ?? "");
                  setEditingLink(true);
                }}
              >
                Edit link
              </button>
            </div>
          )}
        </div>

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

        <div className="border-hairline border-t px-4 py-3">
          <div className="text-faint pb-2 text-[13px]">Your bids on tomorrow&rsquo;s banner</div>
          {myBids.length === 0 ? (
            <div className="flex items-center justify-between gap-3">
              <span className="text-[14px]">You have not bid.</span>
              <SecondaryButton onClick={openBid}>Bid</SecondaryButton>
            </div>
          ) : (
            myBids.map((bid) => (
              <div key={bid.id} className="flex items-baseline justify-between gap-3 py-1 text-[13px]">
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
}: {
  block: Block;
  lit: boolean;
  onPoint: () => void;
}) {
  const { dispatch } = useBoard();
  const { setPreview } = useScreen();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = (chosen: File | null) => {
    if (!chosen) return;
    if (!chosen.type.startsWith("image/")) return setError("That is not an image.");
    if (chosen.size > MAX_UPLOAD_BYTES) return setError("Too large. The limit is 2 MB.");
    setError(null);
    setPreview(null);
    dispatch({
      type: "uploadArtwork",
      blockId: block.id,
      artwork: { kind: "image", src: URL.createObjectURL(chosen) },
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

      <div className="flex items-center justify-between gap-3 pt-2">
        <span className={`text-[13px] ${block.artwork ? "text-faint" : "text-accent font-semibold"}`}>
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
          <PrimaryButtonSmall onClick={() => fileRef.current?.click()}>
            Upload image
          </PrimaryButtonSmall>
        )}
      </div>
      {error ? <div className="text-accent pt-1 text-[12px]">{error}</div> : null}
    </div>
  );
}

function PrimaryButtonSmall({
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className="bg-accent shrink-0 px-3 py-2 text-[13px] font-semibold text-white transition-colors duration-150 hover:bg-[#B81C4E]"
    >
      {children}
    </button>
  );
}
