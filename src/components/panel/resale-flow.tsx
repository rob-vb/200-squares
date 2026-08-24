"use client";

// Buying a listing. It is a purchase, so it is the buy flow: company, website,
// optional artwork, one screen. No sign-in, exactly like a fresh square.
//
// The only differences are the price, which the seller set instead of the site,
// and what arrives — the seller's artwork and the seller's link stay with the
// seller, so the block lands empty and waits for the buyer's own.
//
// The site's 10% is not here. Ticket 11 put it on the seller's side: the buyer
// pays the asking price and nothing else.

import { useEffect, useRef, useState } from "react";
import {
  Field,
  Money,
  PanelHeader,
  PrimaryButton,
  SecondaryButton,
  cleanUrl,
  inputClass,
} from "./controls";
import { useScreen } from "./flow";
import { useBoard } from "@/lib/board/state";
import { squareRange } from "@/lib/board/geometry";

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

export function ResaleFlow({ blockId }: { blockId: string }) {
  const { state, board, dispatch } = useBoard();
  const { close, setPreview, setHighlight, showBought } = useScreen();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [company, setCompany] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<{ name: string; src: string } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const block = state.blocks.find((b) => b.id === blockId);
  const listing = block?.listing ?? null;

  // What is being bought is drawn on the canvas, the same way a selection is.
  useEffect(() => {
    if (listing) setHighlight(listing.rect);
  }, [listing?.rect.r, listing?.rect.c, listing?.rect.w, listing?.rect.h]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!block || !listing) return null;

  const seller = board.ownerById.get(block.ownerId);
  const rect = listing.rect;
  const urlOk = /^[^\s.]+\.[^\s.]{2,}/.test(cleanUrl(url));
  const ready = company.trim().length > 0 && urlOk;

  const chooseFile = (chosen: File | null) => {
    if (!chosen) return;
    if (!chosen.type.startsWith("image/")) return setFileError("That is not an image.");
    if (chosen.size > MAX_UPLOAD_BYTES) {
      return setFileError(`Too large — ${(chosen.size / 1024 / 1024).toFixed(1)} MB. The limit is 2 MB.`);
    }
    const src = URL.createObjectURL(chosen);
    setFileError(null);
    setFile({ name: chosen.name, src });
    setPreview(src);
  };

  const confirm = () => {
    setTouched(true);
    if (!ready) return;
    dispatch({
      type: "buyListing",
      blockId,
      company: company.trim(),
      url: cleanUrl(url),
      artwork: file ? { kind: "image", src: file.src } : null,
    });
    showBought(rect, file !== null);
  };

  return (
    <>
      <PanelHeader
        title={`${rect.w} × ${rect.h} · for sale`}
        note={`Square ${squareRange(rect)} · from ${seller?.name ?? "the owner"}`}
        onClose={close}
      />

      <div className="flex flex-col gap-4 px-4 py-4">
        <div className="border-hairline flex items-baseline justify-between border-b pb-3">
          <span className="text-[14px]">The owner&rsquo;s price</span>
          <Money amount={listing.price} className="text-[26px] leading-none" />
        </div>

        <p className="text-faint text-[13px] leading-snug">
          It arrives empty. The artwork on it now and the address it opens belong to{" "}
          {seller?.name ?? "the owner"} and stay with them.
        </p>

        <Field
          label="Company name"
          error={touched && company.trim() === "" ? "Your name goes on the block." : null}
        >
          <input
            className={inputClass}
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Northwind"
            autoComplete="organization"
          />
        </Field>

        <Field
          label="Website"
          error={touched && !urlOk ? "A website is needed — this is what a click opens." : null}
          hint="Clicking your block opens this address."
        >
          <input
            className={inputClass}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="northwind.co"
            inputMode="url"
            autoComplete="url"
          />
        </Field>

        <Field
          label="Artwork"
          error={fileError}
          hint={file ? undefined : "Optional. You can add it later — the block waits for it."}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => chooseFile(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <div className="border-hairline flex items-center gap-3 border bg-white px-3 py-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={file.src} alt="" className="h-8 w-8 shrink-0 object-cover" />
              <span className="min-w-0 flex-1 truncate text-[13px]">{file.name}</span>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setFileError(null);
                  setPreview(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                className="text-faint hover:text-ink shrink-0 text-[13px] transition-colors duration-150"
              >
                Remove
              </button>
            </div>
          ) : (
            <SecondaryButton onClick={() => fileRef.current?.click()}>Choose image</SecondaryButton>
          )}
        </Field>

        <PrimaryButton onClick={confirm}>
          BUY FOR ${listing.price.toLocaleString("en-US")}
        </PrimaryButton>
        <p className="text-faint text-[12px] leading-snug">
          Nothing is charged. This is a prototype: no payment, no account.
        </p>
      </div>
    </>
  );
}
