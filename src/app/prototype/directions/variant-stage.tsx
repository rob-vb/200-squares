// PROTOTYPE — direction 3 of 3. Hoarding: the grid nearly disappears, the auction rides the banner frame.
import { Countdown } from "./countdown";
import { anton, archivo } from "./fonts";
import {
  AUCTION,
  BANNER,
  BANNER_OWNER,
  PENDING,
  PRICE_PER_SQUARE,
  SELECTION,
  TAKEN,
  area,
  buildModel,
  selectionPrice,
  selectionSquares,
} from "./mock";

const CONCRETE = "#C7C2B8";
const GROUND = "#CFCAC0";
const SQUARE = "#D8D4CB";
const SEAM = "#C0BBB1";
const INK = "#1A1815";
const FAINT = "#A49E93";
const ORANGE = "#F04E23";
const SHEET = "#EFECE6";

const display = { fontFamily: "var(--f-anton)" };
const ui = { fontFamily: "var(--f-archivo)" };

export function VariantStage() {
  const { available, stats } = buildModel();

  return (
    <div
      className={`${anton.variable} ${archivo.variable} flex min-h-dvh flex-col lg:h-dvh`}
      style={{ background: CONCRETE, color: INK, ...ui }}
    >
      {/* the top bar carries no auction at all — it is just identity */}
      <header className="flex h-14 shrink-0 items-center justify-between px-4">
        <span className="text-[22px] leading-none tracking-[0.01em]" style={display}>
          200 SQUARES
        </span>
        <button type="button" className="text-[12px] font-semibold tracking-[0.1em] uppercase">
          Sign in
        </button>
      </header>

      <main className="flex min-h-0 flex-1 items-start justify-center px-3 pb-44 lg:items-center lg:pb-40">
        <div
          className="relative mt-11 grid aspect-[8/7] w-full lg:h-[calc(100%-44px)] lg:w-auto"
          style={{
            background: SEAM,
            gap: 1,
            gridTemplateColumns: "repeat(16, 1fr)",
            gridTemplateRows: "repeat(14, 1fr)",
          }}
        >
          {/* auction tab, welded to the banner frame, above the canvas — covers no square */}
          <div
            className="absolute bottom-full left-0 flex h-11 w-[min(100%,460px)] items-center gap-3 px-3"
            style={{ background: ORANGE, color: INK }}
          >
            <span className="text-[9px] leading-tight font-bold tracking-[0.14em] uppercase opacity-80">
              This spot
              <br />
              tomorrow
            </span>
            <Countdown className="text-[22px] leading-none" style={display} />
            <span className="text-[11px] leading-tight font-semibold">
              ${AUCTION.topBid.toLocaleString("en-US")}
              <br />
              <span className="opacity-70">next ${AUCTION.minNextBid.toLocaleString("en-US")}</span>
            </span>
            <button
              type="button"
              className="ml-auto px-3 py-1.5 text-[11px] font-bold tracking-[0.12em] uppercase"
              style={{ background: INK, color: ORANGE }}
            >
              Bid
            </button>
          </div>

          <div
            className="relative z-10 flex flex-col items-center justify-center"
            style={{
              ...area(BANNER),
              background: BANNER_OWNER.bg,
              color: BANNER_OWNER.fg,
              outline: `4px solid ${ORANGE}`,
              outlineOffset: 0,
            }}
          >
            <span className="text-[8px] tracking-[0.2em] uppercase opacity-60">Today</span>
            <span className="text-[clamp(12px,2.4vw,26px)] leading-none" style={display}>
              {BANNER_OWNER.name}
            </span>
          </div>

          {TAKEN.map((b) => (
            <div
              key={`${b.r}-${b.c}`}
              className="flex items-center justify-center overflow-hidden px-0.5 text-center"
              style={{ ...area(b), background: b.bg, color: b.fg }}
            >
              <span className="text-[clamp(5px,0.75vw,10px)] leading-tight font-bold tracking-tight">
                {b.name}
              </span>
            </div>
          ))}

          {PENDING.map((b) => (
            <div
              key={`p-${b.r}-${b.c}`}
              className="grid place-items-center"
              style={{ ...area(b), background: SQUARE, border: `2px dashed ${ORANGE}` }}
            />
          ))}

          {available.map((cell) => (
            <div
              key={cell.n}
              className="grid place-items-center transition-colors hover:brightness-105"
              style={{ gridRow: cell.r + 1, gridColumn: cell.c + 1, background: SQUARE, color: FAINT }}
            >
              <span className="text-[clamp(4px,0.5vw,8px)] font-medium">{cell.n}</span>
            </div>
          ))}

          <div
            className="pointer-events-none relative z-10"
            style={{ ...area(SELECTION), outline: `3px solid ${ORANGE}`, outlineOffset: -1 }}
          />
        </div>
      </main>

      {/* the panel is a wide bottom sheet at every size, so the canvas is never squeezed sideways */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 px-4 pt-3 pb-14"
        style={{ background: SHEET, borderTop: `3px solid ${INK}` }}
      >
        <div className="mx-auto flex max-w-5xl flex-wrap items-end gap-x-6 gap-y-3">
          <div>
            <div className="text-[10px] font-bold tracking-[0.16em] uppercase" style={{ color: "#6E6A62" }}>
              Selected
            </div>
            <div className="text-[26px] leading-none" style={display}>
              {SELECTION.w} × {SELECTION.h}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-[0.16em] uppercase" style={{ color: "#6E6A62" }}>
              Price
            </div>
            <div className="text-[26px] leading-none" style={display}>
              ${selectionPrice}
            </div>
          </div>
          <div className="text-[11px] leading-tight" style={{ color: "#6E6A62" }}>
            {selectionSquares} squares · ${PRICE_PER_SQUARE} each
            <br />
            {stats.available} of {stats.total} still free
          </div>
          <div className="h-9 min-w-[160px] flex-1" style={{ background: "#FFFFFF", border: `1px solid ${SEAM}` }} />
          <div className="h-9 min-w-[160px] flex-1" style={{ background: "#FFFFFF", border: `1px solid ${SEAM}` }} />
          <button
            type="button"
            className="px-5 py-2.5 text-[12px] font-bold tracking-[0.12em] uppercase"
            style={{ background: ORANGE, color: INK }}
          >
            Buy · upload artwork
          </button>
        </div>
      </div>
    </div>
  );
}
