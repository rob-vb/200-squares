// PROTOTYPE — the graft. Plot's paper palette and docked auction card, Stage's type
// and near-invisible grid. The ground drops a step so squares still read as tiles.
import { Countdown } from "./countdown";
import { anton, archivo, robotoMono } from "./fonts";
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

const PAGE = "#DCDDD5";
const SQUARE = "#EEEFE9";
const SEAM = "#E4E5DE";
const GRAPHITE = "#23261F";
const HAIRLINE = "#C3C7BB";
const FAINT = "#A8ACA0";
const MAGENTA = "#D6265E";

const display = { fontFamily: "var(--f-anton)" };
const ui = { fontFamily: "var(--f-archivo)" };
const mono = { fontFamily: "var(--f-roboto-mono)" };

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2 py-1" style={{ borderRight: `1px solid ${HAIRLINE}` }}>
      <div className="text-[8px] font-semibold tracking-[0.16em] uppercase" style={{ color: FAINT }}>
        {label}
      </div>
      <div className="text-[15px] leading-tight" style={display}>
        {value}
      </div>
    </div>
  );
}

export function VariantRegister() {
  const { available, stats } = buildModel();

  return (
    <div
      className={`${anton.variable} ${archivo.variable} ${robotoMono.variable} flex min-h-dvh flex-col lg:h-dvh`}
      style={{ background: PAGE, color: GRAPHITE, ...ui }}
    >
      <header className="flex h-14 shrink-0 items-center justify-between px-5">
        <span className="text-[22px] leading-none tracking-[0.01em]" style={display}>
          200 SQUARES
        </span>
        <button type="button" className="text-[12px] font-semibold tracking-[0.1em] uppercase">
          Sign in
        </button>
      </header>

      <main className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="flex min-h-0 flex-1 items-center justify-center p-4 lg:p-8">
          <div className="flex w-full flex-col gap-2 lg:h-full lg:w-auto">
            <div
              className="grid aspect-[8/7] w-full lg:h-[calc(100%-58px)] lg:w-auto"
              style={{
                background: SEAM,
                gap: 1,
                gridTemplateColumns: "repeat(16, 1fr)",
                gridTemplateRows: "repeat(14, 1fr)",
              }}
            >
              <div
                className="flex flex-col items-center justify-center"
                style={{ ...area(BANNER), background: BANNER_OWNER.bg, color: BANNER_OWNER.fg }}
              >
                <span className="text-[8px] font-semibold tracking-[0.2em] uppercase opacity-60">
                  Lot 00 · today
                </span>
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
                  style={{
                    ...area(b),
                    background: `repeating-linear-gradient(-45deg, ${SQUARE} 0 3px, ${MAGENTA}55 3px 5px)`,
                  }}
                />
              ))}

              {available.map((cell) => (
                <div
                  key={cell.n}
                  className="grid place-items-center transition-colors hover:bg-white"
                  style={{
                    gridRow: cell.r + 1,
                    gridColumn: cell.c + 1,
                    background: SQUARE,
                    color: FAINT,
                  }}
                >
                  <span className="text-[clamp(4px,0.55vw,8px)]" style={mono}>
                    {cell.n}
                  </span>
                </div>
              ))}

              <div
                className="pointer-events-none relative"
                style={{ ...area(SELECTION), outline: `2px solid ${MAGENTA}`, outlineOffset: -1 }}
              >
                <span
                  className="absolute -top-3.5 left-0 px-1.5 text-[13px] leading-[1.3] whitespace-nowrap"
                  style={{ ...display, background: MAGENTA, color: "#FFFFFF" }}
                >
                  {SELECTION.w}×{SELECTION.h} ${selectionPrice}
                </span>
              </div>
            </div>

            <div
              className="hidden self-end lg:grid lg:w-[62%]"
              style={{
                border: `1px solid ${HAIRLINE}`,
                background: SQUARE,
                gridTemplateColumns: "repeat(6, 1fr)",
              }}
            >
              <Field label="Sheet" value="01 / 01" />
              <Field label="Squares" value={String(stats.total)} />
              <Field label="Taken" value={String(stats.taken)} />
              <Field label="Pending" value={String(stats.pending)} />
              <Field label="Available" value={String(stats.available)} />
              <Field label="Rate" value={`$${PRICE_PER_SQUARE}`} />
            </div>
          </div>
        </div>

        <aside
          className="shrink-0 p-5 pb-40 lg:w-[300px] lg:pb-5"
          style={{ borderLeft: `1px solid ${HAIRLINE}` }}
        >
          <div className="text-[10px] font-semibold tracking-[0.18em] uppercase" style={{ color: FAINT }}>
            Selection
          </div>
          <div className="mt-1 text-[38px] leading-none" style={display}>
            ${selectionPrice}
          </div>
          <div className="mt-1 text-[12px]" style={{ ...mono, color: FAINT }}>
            {SELECTION.w} × {SELECTION.h} · {selectionSquares} squares
          </div>

          <div className="mt-6 space-y-3">
            {["Company name", "Website URL"].map((label) => (
              <label key={label} className="block">
                <span
                  className="text-[10px] font-semibold tracking-[0.14em] uppercase"
                  style={{ color: FAINT }}
                >
                  {label}
                </span>
                <div
                  className="mt-1 h-9 w-full"
                  style={{ background: SQUARE, border: `1px solid ${HAIRLINE}` }}
                />
              </label>
            ))}
            <div
              className="grid h-24 place-items-center text-[11px]"
              style={{ border: `1px dashed ${HAIRLINE}`, color: FAINT }}
            >
              Attach artwork · 3:2
            </div>
          </div>

          <button
            type="button"
            className="mt-6 w-full py-3 text-[15px] tracking-[0.06em]"
            style={{ ...display, background: GRAPHITE, color: PAGE }}
          >
            BUY {selectionSquares} SQUARES
          </button>
        </aside>
      </main>

      {/* auction stays out of the top bar and docks over the sheet margin */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 lg:inset-x-auto lg:bottom-6 lg:left-4">
        <div
          className="pointer-events-auto flex items-center gap-4 px-4 pt-3 pb-14 lg:pb-3"
          style={{ background: MAGENTA, color: "#FFFFFF", boxShadow: `6px 6px 0 ${GRAPHITE}` }}
        >
          <div>
            <div className="text-[9px] font-semibold tracking-[0.18em] uppercase opacity-80">
              Lot 00 closes
            </div>
            <Countdown className="text-[30px] leading-none" style={display} />
          </div>
          <div className="text-[10px] leading-tight font-semibold tracking-[0.1em] uppercase opacity-80">
            Top bid
            <br />
            <span className="text-[22px] leading-none tracking-normal opacity-100" style={display}>
              ${AUCTION.topBid.toLocaleString("en-US")}
            </span>
          </div>
          <button
            type="button"
            className="px-4 py-2 text-[15px] tracking-[0.06em]"
            style={{ ...display, background: "#FFFFFF", color: MAGENTA }}
          >
            BID
          </button>
        </div>
      </div>
    </div>
  );
}
