"use client";

// Picking a picture, cropping it to the block, and putting it on the board.
//
// One component for all three places artwork is set, because all three are the
// same three steps and only the grant differs (ticket 09):
//
//   the thank-you page — authorised by the Stripe session id in its address;
//   My squares         — authorised by the session, through `requireOwner`;
//   a standing bid     — the same, and what it carries becomes the banner.
//
// The caller hands in `urls` and `save`; this knows nothing about which door it
// came through.
//
// ⚠️ **Everything happens here, in the browser.** The file is cropped, resized
// and written out as two WebP files before a byte leaves the machine, and only
// those two are posted. The original never travels.

import { useCallback, useRef, useState } from "react";
import {
  ACCEPT,
  centredWindow,
  clampWindow,
  post,
  prepare,
  readSource,
  release,
  type Source,
  type Window as CropWindow,
} from "@/lib/art/prepare";
import { SecondaryButton } from "@/components/panel/controls";
import type { Rect } from "@/lib/board/types";

type Ids = { small: string; large: string };

/** What the button is doing, in the order it does it. */
type Stage = "idle" | "cropping" | "preparing" | "uploading";

export function ArtworkUpload({
  rect,
  hasArtwork,
  disabled,
  urls,
  save,
  onPreview,
}: {
  /** The shape the picture is cropped to: a block, or the 5 x 5 banner. */
  rect: Rect;
  hasArtwork: boolean;
  disabled?: boolean;
  /** Two short-lived upload URLs, from a mutation that has checked the caller. */
  urls: () => Promise<Ids>;
  /** Write the two ids onto the row. The same mutation checks the caller again. */
  save: (ids: Ids) => Promise<unknown>;
  /**
   * The cropped result, painted on the board before the write lands. Only My
   * squares passes this: the thank-you page has no board behind it.
   */
  onPreview?: (url: string | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<Source | null>(null);
  const [win, setWin] = useState<CropWindow | null>(null);

  const reset = useCallback(() => {
    release(source);
    setSource(null);
    setWin(null);
    setStage("idle");
    if (fileRef.current) fileRef.current.value = "";
  }, [source]);

  const choose = async (file: File | null) => {
    if (!file) return;
    setError(null);
    try {
      const next = await readSource(file);
      release(source);
      setSource(next);
      setWin(centredWindow(next, rect));
      setStage("cropping");
    } catch (problem) {
      setError((problem as Error).message);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // The drag: pointer pixels are source pixels divided by how much the crop box
  // shrank the window to fit the panel.
  const drag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!source || !win) return;
    const box = boxRef.current?.getBoundingClientRect();
    if (!box) return;
    const factor = win.w / box.width;
    const startX = event.clientX;
    const startY = event.clientY;
    const start = win;
    event.currentTarget.setPointerCapture(event.pointerId);

    const move = (e: PointerEvent) => {
      setWin(
        clampWindow(source, {
          ...start,
          x: start.x - (e.clientX - startX) * factor,
          y: start.y - (e.clientY - startY) * factor,
        }),
      );
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const commit = async () => {
    if (!source || !win) return;
    setError(null);
    let preview: string | null = null;
    try {
      setStage("preparing");
      const files = await prepare(source, rect, win);
      // The cropped `1x` itself, painted on the board while the write travels.
      // It is the picture, not an approximation of it.
      if (onPreview) {
        preview = URL.createObjectURL(files.small);
        onPreview(preview);
      }

      setStage("uploading");
      const where = await urls();
      const [small, large] = await Promise.all([
        post(where.small, files.small),
        post(where.large, files.large),
      ]);
      await save({ small, large });
      reset();
    } catch (problem) {
      setError((problem as Error).message || "That did not work. Try again.");
      setStage(source ? "cropping" : "idle");
    } finally {
      if (preview) {
        onPreview?.(null);
        URL.revokeObjectURL(preview);
      }
    }
  };

  const busy = stage === "preparing" || stage === "uploading";

  return (
    <div className="min-w-0">
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => void choose(e.target.files?.[0] ?? null)}
      />

      {stage === "idle" ? (
        hasArtwork ? (
          <SecondaryButton onClick={() => fileRef.current?.click()} disabled={disabled}>
            Replace image
          </SecondaryButton>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={() => fileRef.current?.click()}
            className="bg-accent shrink-0 px-3 py-2 text-[13px] font-semibold text-white transition-colors duration-150 hover:bg-[#B81C4E] disabled:opacity-50"
          >
            Upload image
          </button>
        )
      ) : null}

      {source && win ? (
        <div className="flex flex-col gap-2 pt-2">
          {/*
            The crop box has the block's own shape, so what the buyer drags is
            what the board will draw. The picture is painted through the same
            window arithmetic the board uses for a cropped block.
          */}
          <div
            ref={boxRef}
            onPointerDown={busy ? undefined : drag}
            className="bg-square w-full touch-none select-none"
            style={{
              aspectRatio: `${rect.w} / ${rect.h}`,
              cursor: busy ? "default" : "grab",
              backgroundImage: `url(${source.url})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: `${(source.width / win.w) * 100}% ${(source.height / win.h) * 100}%`,
              backgroundPosition: `${
                source.width <= win.w ? 50 : (win.x / (source.width - win.w)) * 100
              }% ${source.height <= win.h ? 50 : (win.y / (source.height - win.h)) * 100}%`,
            }}
          />
          <p className="text-faint text-[12px] leading-snug">
            Drag the picture to choose what the square shows.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void commit()}
              className="bg-accent px-3 py-2 text-[13px] font-semibold text-white transition-colors duration-150 hover:bg-[#B81C4E] disabled:opacity-50"
            >
              {stage === "preparing" ? "PREPARING…" : stage === "uploading" ? "UPLOADING…" : "USE THIS"}
            </button>
            <SecondaryButton onClick={reset} disabled={busy}>
              Cancel
            </SecondaryButton>
          </div>
        </div>
      ) : null}

      {error ? <div className="text-accent pt-1 text-[12px] leading-snug">{error}</div> : null}
    </div>
  );
}

/**
 * The rules, in the place the buyer reads them **before** they pick a file.
 *
 * ⚠️ Ticket 09 was explicit about where this belongs: no animation is a rule the
 * buyer has to meet, and telling them after they have chosen a GIF is telling
 * them too late.
 */
export function ArtworkRules({ className = "" }: { className?: string }) {
  return (
    <p className={`text-faint text-[12px] leading-snug ${className}`}>
      PNG, JPEG, WebP or GIF, up to 10 MB. The picture is cropped to your block and does not
      animate — a GIF keeps its first frame. You can change it whenever you like.
    </p>
  );
}
