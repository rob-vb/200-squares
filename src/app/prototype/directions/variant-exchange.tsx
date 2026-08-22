// PROTOTYPE — direction 1 of 3. Market terminal: the auction is a full-width rail.
import { Countdown } from "./countdown";
import { archivo, jetbrains } from "./fonts";
import {
  AUCTION,
  BANNER,
  BANNER_OWNER,
  PRICE_PER_SQUARE,
  SELECTION,
  TAKEN,
  PENDING,
  area,
  buildModel,
  selectionPrice,
  selectionSquares,
} from "./mock";

const INK = "#0A0F1C";
const PANEL = "#131A2B";
const CELL = "#1A2438";
const RULE = "#212B42";
const TEXT = "#EAEDF5";
const MUTED = "#6E7A96";
const AMBER = "#FFB61E";

const mono = { fontFamily: "var(--f-jet)" };
const ui = { fontFamily: "var(--f-archivo)" };

export function VariantExchange() {
  const { available, stats } = buildModel();

  return (
    <div
      className={`${archivo.variable} ${jetbrains.variable} flex min-h-dvh flex-col lg:h-dvh`}
      style={{ background: INK, color: TEXT, ...ui }}
    >
      {/* top bar — deliberately quiet: identity and account only */}
      <header
        className="flex h-12 shrink-0 items-center justify-between gap-4 px-4"
        style={{ borderBottom: `1px solid ${RULE}` }}
      >
        <span className="text-[15px] font-extrabold tracking-[-0.02em] uppercase">200 Squares</span>
        <span className="hidden text-[11px] sm:block" style={{ ...mono, color: MUTED }}>
          {stats.available} available · {stats.taken} taken · {stats.pending} pending
        </span>
        <button type="button" className="text-[12px] font-semibold" style={{ color: MUTED }}>
          Sign in
        </button>
      </header>

      {/* the loud part: a saturated rail carrying the auction across the full width */}
      <div
        className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2.5"
        style={{ background: AMBER, color: INK }}
      >
        <span className="text-[10px] font-bold tracking-[0.18em] uppercase opacity-70">
          Banner · tomorrow
        </span>
        <Countdown className="text-[26px] leading-none font-bold" style={mono} />
        <span className="text-[13px] font-medium" style={mono}>
          Top bid ${AUCTION.topBid.toLocaleString("en-US")} · {AUCTION.bids} bids
        </span>
        <button
          type="button"
          className="ml-auto px-4 py-2 text-[11px] font-bold tracking-[0.14em] uppercase"
          style={{ background: INK, color: AMBER }}
        >
          Place bid
        </button>
      </div>

      <main className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="flex min-h-0 flex-1 items-center justify-center p-3 lg:p-6">
          <div
            className="grid aspect-[8/7] w-full lg:h-full lg:w-auto"
            style={{
              background: RULE,
              gap: 1,
              gridTemplateColumns: "repeat(16, 1fr)",
              gridTemplateRows: "repeat(14, 1fr)",
            }}
          >
            <div
              className="flex flex-col items-center justify-center"
              style={{ ...area(BANNER), background: BANNER_OWNER.bg, color: BANNER_OWNER.fg }}
            >
              <span className="text-[8px] tracking-[0.2em] uppercase opacity-60" style={mono}>
                Today
              </span>
              <span className="text-[clamp(11px,2.2vw,22px)] font-extrabold tracking-tight">
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
                style={{
                  ...area(b),
                  background: `repeating-linear-gradient(45deg, ${CELL} 0 3px, ${RULE} 3px 6px)`,
                }}
              />
            ))}

            {available.map((cell) => (
              <div
                key={cell.n}
                className="grid place-items-center transition-colors hover:brightness-150"
                style={{
                  gridRow: cell.r + 1,
                  gridColumn: cell.c + 1,
                  background: CELL,
                  color: "#3E4A66",
                }}
              >
                <span className="text-[clamp(4px,0.55vw,8px)]" style={mono}>
                  {cell.n}
                </span>
              </div>
            ))}

            {/* live selection */}
            <div
              className="pointer-events-none relative"
              style={{ ...area(SELECTION), outline: `2px solid ${TEXT}`, outlineOffset: -1 }}
            >
              <span
                className="absolute -top-2 left-0 px-1 py-0.5 text-[9px] font-bold whitespace-nowrap"
                style={{ ...mono, background: TEXT, color: INK }}
              >
                {SELECTION.w}×{SELECTION.h} ${selectionPrice}
              </span>
            </div>
          </div>
        </div>

        <aside
          className="shrink-0 p-5 lg:w-[320px]"
          style={{ background: PANEL, borderLeft: `1px solid ${RULE}` }}
        >
          <div className="text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color: MUTED }}>
            Selection
          </div>
          <div className="mt-2 text-[28px] leading-none font-extrabold tracking-tight">
            ${selectionPrice}
          </div>
          <div className="mt-1 text-[12px]" style={{ ...mono, color: MUTED }}>
            {SELECTION.w} × {SELECTION.h} · {selectionSquares} squares · ${PRICE_PER_SQUARE} each
          </div>

          <div className="mt-6 space-y-3">
            {["Company name", "Website URL"].map((label) => (
              <label key={label} className="block">
                <span className="text-[10px] tracking-[0.14em] uppercase" style={{ color: MUTED }}>
                  {label}
                </span>
                <div
                  className="mt-1 h-9 w-full"
                  style={{ background: INK, border: `1px solid ${RULE}` }}
                />
              </label>
            ))}
            <div
              className="grid h-24 place-items-center text-[11px]"
              style={{ border: `1px dashed ${RULE}`, color: MUTED }}
            >
              Drop artwork · 3:2
            </div>
          </div>

          <button
            type="button"
            className="mt-6 w-full py-3 text-[12px] font-bold tracking-[0.14em] uppercase"
            style={{ background: AMBER, color: INK }}
          >
            Buy {selectionSquares} squares
          </button>
        </aside>
      </main>
    </div>
  );
}
