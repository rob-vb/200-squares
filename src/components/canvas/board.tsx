"use client";

// The board itself: one CSS grid inside the transform. Everything here is drawn
// at scale 1 and scaled by the wrapper, so the seam grows with the zoom.
//
// Three kinds of child: the banner, one element per block, and one element per
// available square. A block is a single grid item, which is why the seams inside
// a bought rectangle disappear on their own.

import type { Artwork, BannerDay, Block, Rect } from "@/lib/board/types";
import {
  BANNER,
  COLS,
  NUMBER_MIN_PX,
  ROWS,
  SEAM,
  boxOf,
  cropStyle,
  gridArea,
  type BoardModel,
} from "@/lib/board/geometry";

/** Fit a wordmark inside its block without measuring text. */
function labelSize(label: string, wpx: number, hpx: number) {
  const longestWord = Math.max(...label.split(" ").map((w) => w.length), 1);
  return Math.max(5, Math.min(hpx * 0.42, (wpx * 0.86) / (longestWord * 0.6)));
}

/**
 * How artwork paints its box. An uploaded image may carry a crop, because a
 * block that was split keeps the same picture windowed to the part it still is.
 */
function artStyle(art: Artwork, wpx: number, hpx: number): React.CSSProperties {
  return art.kind === "mock"
    ? { background: art.bg, color: art.fg, fontSize: labelSize(art.label, wpx, hpx) }
    : { backgroundImage: `url(${art.src})`, ...cropStyle(art.crop) };
}

function BannerCell({ day, cell }: { day: BannerDay | null; cell: number }) {
  const step = cell + SEAM;
  const wpx = BANNER.w * step - SEAM;

  if (!day) {
    // The banner is the biggest prize on the board, so an unsold banner is the
    // one moment the canvas is allowed to shout.
    return (
      <div
        className="bg-accent flex flex-col items-center justify-center gap-[0.4em] px-[4%] text-center text-white"
        style={gridArea(BANNER)}
      >
        <span className="font-medium" style={{ fontSize: wpx * 0.055 }}>
          Nobody has bid
        </span>
        <span className="font-display leading-[0.95]" style={{ fontSize: wpx * 0.12 }}>
          THIS SPOT
          <br />
          TOMORROW
        </span>
        <span className="font-semibold" style={{ fontSize: wpx * 0.05 }}>
          Bid from $100
        </span>
      </div>
    );
  }

  const art = day.artwork;
  return (
    <div
      className="flex flex-col items-center justify-center overflow-hidden text-center"
      style={{
        ...gridArea(BANNER),
        ...(art.kind === "mock"
          ? { background: art.bg, color: art.fg }
          : { backgroundImage: `url(${art.src})`, ...cropStyle(art.crop) }),
      }}
    >
      {art.kind === "mock" ? (
        <span className="font-display leading-none" style={{ fontSize: wpx * 0.13 }}>
          {art.label}
        </span>
      ) : null}
    </div>
  );
}

export function Board({
  board,
  bannerToday,
  cell,
  scale,
  selection,
  blocked,
  hovered,
  preview,
  highlight,
  forSale,
}: {
  board: BoardModel;
  bannerToday: BannerDay | null;
  /** Square size in px at scale 1 — the fit size. */
  cell: number;
  scale: number;
  selection: Rect | null;
  blocked: boolean;
  hovered: { r: number; c: number } | null;
  /** Artwork chosen in the buy flow, painted before the purchase is confirmed. */
  preview: string | null;
  /** A block My squares is pointing at. */
  highlight: Rect | null;
  /** The market view. Everything not for sale dims; the listings stay lit. */
  forSale: boolean;
}) {
  const step = cell + SEAM;
  // A number below 34px rendered is unreadable, so below that a square is a tile.
  const showNumbers = cell * scale >= NUMBER_MIN_PX;
  // Buying a listing has no selection — what is being bought is the highlight —
  // so the artwork preview follows whichever of the two the flow put there.
  const previewRect = selection ?? highlight;

  return (
    <div
      className="bg-seam relative grid"
      style={{
        width: COLS * step - SEAM,
        height: ROWS * step - SEAM,
        gridTemplateColumns: `repeat(${COLS}, ${cell}px)`,
        gridTemplateRows: `repeat(${ROWS}, ${cell}px)`,
        gap: SEAM,
      }}
    >
      <BannerCell day={bannerToday} cell={cell} />

      {board.blocks.map((block) => {
        const wpx = block.rect.w * step - SEAM;
        const hpx = block.rect.h * step - SEAM;
        const art = block.artwork;

        // Pending never shows a number and never reads as empty: the hatch says
        // "sold, artwork coming" at every size.
        if (!art) {
          return (
            <div
              key={block.id}
              style={{
                ...gridArea(block.rect),
                background:
                  "repeating-linear-gradient(-45deg, var(--color-square) 0 3px, color-mix(in srgb, var(--color-accent) 35%, transparent) 3px 5px)",
              }}
            />
          );
        }

        return (
          <div
            key={block.id}
            className="flex items-center justify-center overflow-hidden px-[3%] text-center leading-tight font-bold tracking-tight"
            style={{ ...gridArea(block.rect), ...artStyle(art, wpx, hpx) }}
          >
            {art.kind === "mock" ? art.label : null}
          </div>
        );
      })}

      {board.available.map((sq) => {
        const isHovered = hovered?.r === sq.r && hovered?.c === sq.c;
        const inSelection =
          selection !== null &&
          sq.r >= selection.r &&
          sq.r < selection.r + selection.h &&
          sq.c >= selection.c &&
          sq.c < selection.c + selection.w;
        return (
          <div
            key={sq.n}
            className="text-faint grid place-items-center font-mono"
            style={{
              gridRow: sq.r + 1,
              gridColumn: sq.c + 1,
              // Hover turns a square white. Selection reads as hover, locked.
              background: isHovered || inSelection ? "#FFFFFF" : "var(--color-square)",
              fontSize: cell * 0.3,
            }}
          >
            {showNumbers ? sq.n : null}
          </div>
        );
      })}

      {forSale && (
        // The market view is a layer, never a mark on the block. Ticket 11: a
        // permanent for-sale badge paints over artwork the owner paid for, and
        // owner artwork is the only colour this canvas has.
        <>
          <div
            className="pointer-events-none absolute inset-0 z-[1]"
            style={{ background: "color-mix(in srgb, var(--color-page) 82%, transparent)" }}
          />
          {board.listed.map((block) => (
            <ListedPart key={block.id} block={block} cell={cell} scale={scale} />
          ))}
        </>
      )}

      {previewRect && preview && (
        // The image lands on the board before anything is confirmed. This is the
        // moment the idea lands, so it happens on the canvas, not in the panel.
        <div
          className="pointer-events-none absolute z-[3]"
          style={{
            ...boxOf(previewRect, cell),
            backgroundImage: `url(${preview})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}

      {highlight && (
        <div
          className="pointer-events-none absolute z-[3]"
          style={{
            ...boxOf(highlight, cell),
            outline: `${2 / scale}px dashed var(--color-ink)`,
            outlineOffset: 1 / scale,
          }}
        />
      )}

      {selection && (
        <div
          className="pointer-events-none absolute"
          style={{
            left: selection.c * step,
            top: selection.r * step,
            width: selection.w * step - SEAM,
            height: selection.h * step - SEAM,
            // The outline is a control, not part of the grid, so it keeps its
            // 2px on screen instead of growing with the zoom.
            outline: `${2 / scale}px solid ${blocked ? "#8A1233" : "var(--color-accent)"}`,
            outlineOffset: -1 / scale,
            background: blocked ? "rgba(138,18,51,0.16)" : "transparent",
          }}
        />
      )}
    </div>
  );
}

/**
 * One listing, lit through the market view's dim layer.
 *
 * The part offered can be a strip of a block that is still whole, so the artwork
 * is drawn at the block's full size inside a window the size of the part. That is
 * the same picture the buyer will get, cropped the same way the split will crop it.
 */
function ListedPart({ block, cell, scale }: { block: Block; cell: number; scale: number }) {
  const part = block.listing!.rect;
  const outer = boxOf(block.rect, cell);
  const inner = boxOf(part, cell);
  const art = block.artwork;

  return (
    <div
      className="pointer-events-none absolute z-[2] overflow-hidden"
      style={{
        ...inner,
        outline: `${2 / scale}px solid var(--color-accent)`,
        outlineOffset: -1 / scale,
        background: "var(--color-square)",
      }}
    >
      {art ? (
        <div
          className="absolute flex items-center justify-center overflow-hidden px-[3%] text-center leading-tight font-bold tracking-tight"
          style={{
            left: outer.left - inner.left,
            top: outer.top - inner.top,
            width: outer.width,
            height: outer.height,
            ...artStyle(art, outer.width, outer.height),
          }}
        >
          {art.kind === "mock" ? art.label : null}
        </div>
      ) : null}
    </div>
  );
}
