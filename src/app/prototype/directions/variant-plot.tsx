// PROTOTYPE — direction 2 of 3. Survey sheet: the canvas is a plate, the auction docks as a card.
import { Countdown } from "./countdown";
import { robotoMono, saira } from "./fonts";
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

const PAPER = "#E9EBE4";
const PLATE = "#F2F3EE";
const GRAPHITE = "#23261F";
const HAIRLINE = "#C3C7BB";
const FAINT = "#9AA093";
const MAGENTA = "#D6265E";

const mono = { fontFamily: "var(--f-roboto-mono)" };
const ui = { fontFamily: "var(--f-saira)" };

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2 py-1" style={{ borderRight: `1px solid ${HAIRLINE}` }}>
      <div className="text-[8px] tracking-[0.16em] uppercase" style={{ color: FAINT }}>
        {label}
      </div>
      <div className="text-[12px] font-medium" style={mono}>
        {value}
      </div>
    </div>
  );
}

export function VariantPlot() {
  const { available, stats } = buildModel();

  return (
    <div
      className={`${saira.variable} ${robotoMono.variable} flex min-h-dvh flex-col lg:h-dvh`}
      style={{ background: PAPER, color: GRAPHITE, ...ui }}
    >
      <header
        className="flex h-12 shrink-0 items-center justify-between px-5"
        style={{ borderBottom: `1px solid ${HAIRLINE}` }}
      >
        <span className="text-[17px] font-bold tracking-[0.06em] uppercase">200 Squares</span>
        <button type="button" className="text-[13px] tracking-[0.08em] uppercase">
          Sign in
        </button>
      </header>

      <main className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="flex min-h-0 flex-1 items-center justify-center p-4 lg:p-8">
        <div className="flex w-full flex-col gap-2 lg:h-full lg:w-auto">
          <div
            className="grid aspect-[8/7] w-full lg:h-[calc(100%-58px)] lg:w-auto"
            style={{
              background: HAIRLINE,
              gap: 1,
              padding: 1,
              gridTemplateColumns: "repeat(16, 1fr)",
              gridTemplateRows: "repeat(14, 1fr)",
            }}
          >
            <div
              className="flex flex-col items-center justify-center"
              style={{ ...area(BANNER), background: BANNER_OWNER.bg, color: BANNER_OWNER.fg }}
            >
              <span className="text-[8px] tracking-[0.2em] uppercase opacity-60" style={mono}>
                Lot 00 · today
              </span>
              <span className="text-[clamp(11px,2.2vw,22px)] font-bold tracking-[0.04em]">
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
                  background: `repeating-linear-gradient(-45deg, ${PLATE} 0 3px, ${MAGENTA}55 3px 5px)`,
                }}
              />
            ))}

            {available.map((cell) => (
              <div
                key={cell.n}
                className="grid place-items-center transition-colors hover:bg-white"
                style={{ gridRow: cell.r + 1, gridColumn: cell.c + 1, background: PLATE, color: FAINT }}
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
                className="absolute -top-2.5 left-0 px-1 text-[9px] font-bold whitespace-nowrap"
                style={{ ...mono, background: MAGENTA, color: "#FFFFFF" }}
              >
                {SELECTION.w}×{SELECTION.h} ${selectionPrice}
              </span>
            </div>
          </div>

          {/* title block — the sheet's legend, in the margin, as on a real survey drawing */}
          <div
            className="hidden self-end lg:grid lg:w-[62%]"
            style={{
              border: `1px solid ${HAIRLINE}`,
              background: PLATE,
              gridTemplateColumns: "repeat(6, 1fr)",
            }}
          >
            <Field label="Sheet" value="01 / 01" />
            <Field label="Parcels" value={String(stats.total)} />
            <Field label="Taken" value={String(stats.taken)} />
            <Field label="Pending" value={String(stats.pending)} />
            <Field label="Available" value={String(stats.available)} />
            <Field label="Rate" value={`$${PRICE_PER_SQUARE}`} />
          </div>
          </div>
        </div>

        <aside className="shrink-0 p-5 pb-40 lg:w-[300px] lg:pb-5" style={{ borderLeft: `1px solid ${HAIRLINE}` }}>
          <div className="text-[10px] tracking-[0.18em] uppercase" style={{ color: FAINT }}>
            Parcel selection
          </div>
          <div className="mt-1 text-[30px] leading-none font-bold">${selectionPrice}</div>
          <div className="mt-1 text-[12px]" style={{ ...mono, color: FAINT }}>
            {SELECTION.w} × {SELECTION.h} · {selectionSquares} parcels
          </div>

          <div className="mt-6 space-y-3">
            {["Company name", "Website URL"].map((label) => (
              <label key={label} className="block">
                <span className="text-[10px] tracking-[0.14em] uppercase" style={{ color: FAINT }}>
                  {label}
                </span>
                <div className="mt-1 h-9 w-full" style={{ background: PLATE, border: `1px solid ${HAIRLINE}` }} />
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
            className="mt-6 w-full py-3 text-[12px] font-bold tracking-[0.14em] uppercase"
            style={{ background: GRAPHITE, color: PAPER }}
          >
            Buy {selectionSquares} parcels
          </button>
        </aside>
      </main>

      {/* the auction does not live in the top bar here — it docks over the sheet margin */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 lg:inset-x-auto lg:bottom-6 lg:left-4">
        <div
          className="pointer-events-auto flex items-center gap-4 px-4 pt-3 pb-14 lg:pb-3"
          style={{ background: MAGENTA, color: "#FFFFFF", boxShadow: `6px 6px 0 ${GRAPHITE}` }}
        >
          <div>
            <div className="text-[9px] tracking-[0.18em] uppercase opacity-80">Lot 00 closes</div>
            <Countdown className="text-[24px] leading-none font-bold" style={mono} />
          </div>
          <div className="text-[11px] leading-tight" style={mono}>
            Top bid
            <br />
            <span className="text-[15px] font-bold">${AUCTION.topBid.toLocaleString("en-US")}</span>
          </div>
          <button
            type="button"
            className="px-3 py-2 text-[11px] font-bold tracking-[0.12em] uppercase"
            style={{ background: "#FFFFFF", color: MAGENTA }}
          >
            Bid
          </button>
        </div>
      </div>
    </div>
  );
}
