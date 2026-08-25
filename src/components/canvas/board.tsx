"use client";

// The board itself: one CSS grid inside the transform. Everything here is drawn
// at scale 1 and scaled by the wrapper, so the seam grows with the zoom.
//
// Three kinds of child: the banner, one element per block, and one element per
// available square. A block is a single grid item, which is why the seams inside
// a bought rectangle disappear on their own.
//
// ⚠️ **A block that can be clicked is a real `<a>`** (tickets 10 and 21), and not
// a div the canvas opens a window from. It is what the owner paid for, so it
// behaves like a link everywhere a link behaves: middle-click and ctrl-click open
// it in a tab, the status bar shows where it goes, the context menu can copy the
// address, and the keyboard can reach it. `window.open` from a handler has none
// of that, and a pop-up blocker can refuse it.
//
// The gesture contract still decides **whether** a click counts as one — that is
// `canvas.tsx`'s business, through `onFollow`, which may cancel the navigation.
// Nothing here knows about drags, and nothing here counts anything.

import type { Artwork, BannerToday, Rect } from "@/lib/board/types";
import type { ClickTarget } from "@/lib/board/clicks";
import {
  BANNER,
  COLS,
  NUMBER_MIN_PX,
  ROWS,
  SEAM,
  artSrc,
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
 * *Sold, artwork coming.* It says that at every size, and it never shows a number.
 */
const HATCH =
  "repeating-linear-gradient(-45deg, var(--color-square) 0 3px, color-mix(in srgb, var(--color-accent) 35%, transparent) 3px 5px)";

/**
 * What the canvas is told when somebody clicks a link on the board.
 *
 * It is handed the event as well as the target, because the canvas is the only
 * thing that knows whether the gesture that produced it was a click at all — a
 * pan that ended over a block is not one, and it cancels the navigation.
 */
export type Follow = (target: ClickTarget, e: React.MouseEvent<HTMLAnchorElement>) => void;

/** Blocks and banner days keep their address bare. The scheme is added here. */
const hrefOf = (url: string) => `https://${url}`;

/**
 * How artwork paints its box.
 *
 * An upload may carry a crop, because a block that was split keeps the same file
 * windowed to the part it still is. Seeded artwork has nothing to crop: a
 * wordmark simply re-fits, which is what a wordmark does anyway.
 *
 * ⚠️ The hatch is painted **under** the picture, not instead of it. Ticket 09: a
 * block whose file is missing renders `pending`, never broken. A background
 * image that 404s paints nothing at all, so without a layer beneath it a lost
 * file would read as an empty square — which on this board means *for sale*.
 */
function artStyle(
  art: Artwork,
  wpx: number,
  hpx: number,
  scale: number,
  onScreen: boolean,
): React.CSSProperties {
  if (art.kind === "seed") {
    return { background: art.bg, color: art.fg, fontSize: labelSize(art.label, wpx, hpx) };
  }
  const crop = cropStyle(art.crop);
  return {
    backgroundImage: `url(${artSrc(art, scale, onScreen)}), ${HATCH}`,
    backgroundSize: `${crop.backgroundSize}, auto`,
    backgroundPosition: `${crop.backgroundPosition}, 0 0`,
    backgroundRepeat: "no-repeat, repeat",
  };
}

/** Two rectangles share at least one cell. `null` means "everything counts". */
const touches = (window: Rect | null, rect: Rect) =>
  window === null ||
  (window.c < rect.c + rect.w &&
    rect.c < window.c + window.w &&
    window.r < rect.r + rect.h &&
    rect.r < window.r + window.h);

function BannerCell({
  day,
  cell,
  scale,
  inView,
  onFollow,
}: {
  day: BannerToday | null;
  cell: number;
  scale: number;
  inView: Rect | null;
  onFollow?: Follow;
}) {
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
  // A winner who brought no artwork gets the house ad in their place (ticket 07),
  // so a banner day with nothing on it reads exactly like an unwon one.
  if (!art) return <BannerCell day={null} cell={cell} scale={scale} inView={inView} />;

  const inside =
    art.kind === "seed" ? (
      <span className="font-display leading-none" style={{ fontSize: wpx * 0.13 }}>
        {art.label}
      </span>
    ) : null;
  const className = "flex flex-col items-center justify-center overflow-hidden text-center";
  const style = {
    ...gridArea(BANNER),
    ...(art.kind === "seed"
      ? { background: art.bg, color: art.fg }
      : artStyle(art, wpx, BANNER.h * step - SEAM, scale, touches(inView, BANNER))),
  };

  // A won day with no address is the winner's own empty hour (ticket 07). It is
  // still their banner, so it is drawn — but there is nowhere to go, so it is
  // not a link and no click on it is ever counted.
  if (!day.url) return <div className={className} style={style}>{inside}</div>;

  const follow = (e: React.MouseEvent<HTMLAnchorElement>) =>
    onFollow?.({ kind: "banner", id: day.date }, e);

  return (
    <a
      href={hrefOf(day.url)}
      target="_blank"
      rel="noopener noreferrer"
      draggable={false}
      aria-label={`Today's banner: ${day.ownerName}. Opens ${day.url}`}
      onClick={follow}
      onAuxClick={follow}
      className={className}
      style={style}
    >
      {inside}
    </a>
  );
}

export function Board({
  board,
  bannerToday,
  cell,
  scale,
  inView,
  selection,
  blocked,
  hovered,
  preview,
  highlight,
  onFollow,
}: {
  board: BoardModel;
  bannerToday: BannerToday | null;
  /** Square size in px at scale 1 — the fit size. */
  cell: number;
  scale: number;
  /**
   * The cells on screen, or null while the viewport is unknown. Artwork above 2x
   * zoom is only fetched at full size for blocks inside it (ticket 09).
   */
  inView: Rect | null;
  selection: Rect | null;
  blocked: boolean;
  hovered: { r: number; c: number } | null;
  /** Artwork chosen in the buy flow, painted before the purchase is confirmed. */
  preview: string | null;
  /** A block My squares is pointing at. */
  highlight: Rect | null;
  /** What the canvas does about a click on one of the board's links. */
  onFollow?: Follow;
}) {
  const step = cell + SEAM;
  // A number below 34px rendered is unreadable, so below that a square is a tile.
  const showNumbers = cell * scale >= NUMBER_MIN_PX;
  // My squares points at a block with the highlight and has no selection, so the
  // artwork preview follows whichever of the two the flow put there.
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
      <BannerCell
        day={bannerToday}
        cell={cell}
        scale={scale}
        inView={inView}
        onFollow={onFollow}
      />

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
              style={{ ...gridArea(block.rect), background: HATCH }}
            />
          );
        }

        const className =
          "flex items-center justify-center overflow-hidden px-[3%] text-center leading-tight font-bold tracking-tight";
        const style = {
          ...gridArea(block.rect),
          ...artStyle(art, wpx, hpx, scale, touches(inView, block.rect)),
        };
        const inside = art.kind === "seed" ? art.label : null;

        // ⚠️ A frozen block is not a link. The third strike takes away the right
        // to point anywhere (ticket 11), and `buildBoard` already reads one as
        // pending — so it draws what it has and sends nobody anywhere.
        if (block.frozen || !block.url) {
          return (
            <div key={block.id} className={className} style={style}>
              {inside}
            </div>
          );
        }

        const follow = (e: React.MouseEvent<HTMLAnchorElement>) =>
          onFollow?.({ kind: "block", id: block.id }, e);

        return (
          <a
            key={block.id}
            href={hrefOf(block.url)}
            target="_blank"
            rel="noopener noreferrer"
            draggable={false}
            aria-label={`${block.ownerName}. Opens ${block.url}`}
            onClick={follow}
            onAuxClick={follow}
            className={className}
            style={style}
          >
            {inside}
          </a>
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

      {/*
        A square somebody is away paying for. A plain tile, and deliberately not
        the pending hatch: a hatched square says *sold, artwork coming*, which
        would be a lie for the fifteen minutes a hold lasts. It carries no
        number, so it cannot be read as an invitation to wait for it.
      */}
      {board.reserved.map((sq) => (
        <div
          key={`held-${sq.r}-${sq.c}`}
          style={{
            gridRow: sq.r + 1,
            gridColumn: sq.c + 1,
            background: "var(--color-square)",
          }}
        />
      ))}

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
          className="pointer-events-none absolute z-[4]"
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
