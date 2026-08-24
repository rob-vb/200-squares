"use client";

// Buy: one screen, not a wizard. The selection was already confirmed by the chip
// on the canvas, so the panel only has to collect who you are and put the
// artwork on the board.
//
// Artwork is optional on purpose. A flow that could never finish without an
// image could never produce a `pending` block, and the board would be rendering
// a state the product cannot reach.

import { useRef, useState } from "react";
import { Field, Money, PanelHeader, PrimaryButton, SecondaryButton, inputClass } from "./controls";
import { useScreen } from "./flow";
import { useBoard } from "@/lib/board/state";
import { PRICE_PER_SQUARE, cellCount, priceOf, squareRange } from "@/lib/board/geometry";
import type { Rect } from "@/lib/board/types";

/** The one rule the upload enforces. Aspect ratio is handled by object-fit. */
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

const cleanUrl = (raw: string) => raw.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");

export function BuyFlow({ rect }: { rect: Rect }) {
  const { dispatch } = useBoard();
  const { close, setPreview, showBought } = useScreen();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [company, setCompany] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<{ name: string; src: string } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const price = priceOf(rect);
  const squares = cellCount(rect);
  const urlOk = /^[^\s.]+\.[^\s.]{2,}/.test(cleanUrl(url));
  const ready = company.trim().length > 0 && urlOk;

  const chooseFile = (chosen: File | null) => {
    if (!chosen) return;
    if (!chosen.type.startsWith("image/")) {
      setFileError("That is not an image.");
      return;
    }
    if (chosen.size > MAX_UPLOAD_BYTES) {
      setFileError(`Too large — ${(chosen.size / 1024 / 1024).toFixed(1)} MB. The limit is 2 MB.`);
      return;
    }
    const src = URL.createObjectURL(chosen);
    setFileError(null);
    setFile({ name: chosen.name, src });
    // This is the moment the idea lands: the image fills the rectangle on the
    // canvas before a single thing is confirmed.
    setPreview(src);
  };

  const clearFile = () => {
    setFile(null);
    setFileError(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const confirm = () => {
    setTouched(true);
    if (!ready) return;
    dispatch({
      type: "buy",
      rect,
      company: company.trim(),
      url: cleanUrl(url),
      artwork: file ? { kind: "image", src: file.src } : null,
    });
    showBought(rect, file !== null);
  };

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
                onClick={clearFile}
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
          BUY FOR ${price.toLocaleString("en-US")}
        </PrimaryButton>
        <p className="text-faint text-[12px] leading-snug">
          Nothing is charged. This is a prototype: no payment, no account.
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
        {hasArtwork ? null : (
          <PrimaryButton onClick={openMine}>ADD YOUR ARTWORK</PrimaryButton>
        )}
        <SecondaryButton onClick={openMine}>My squares</SecondaryButton>
      </div>
    </>
  );
}
