// PROTOTYPE — ticket 05 state sheet. Every token and every square state, at the
// three sizes that matter. Throwaway: branch proto-05, never on main.
import { SecondsPair, TickerFixed } from "./ticker";

export const metadata = { title: "State sheet — ticket 05" };

const PHONE_1X = 24; // a square on a 390px phone at 1x
const DESKTOP_1X = 55; // a square on a 1440px desktop at 1x
const ZOOM_4X = 96; // a square at 4x
const NUMBER_MIN = 34; // show the number from here up

const TOKENS = [
  ["page", "#DCDDD5", "the sheet the canvas lies on"],
  ["square", "#EEEFE9", "an available square"],
  ["seam", "#E4E5DE", "the 1px gap — the whole grid"],
  ["ink", "#23261F", "text, dark buttons, tooltip, hard shadow"],
  ["faint", "#A8ACA0", "square numbers, small labels"],
  ["hairline", "#C3C7BB", "panel borders, rules, block edges"],
  ["accent", "#D6265E", "auction, selection, pending. Nothing else."],
];

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="border-hairline border-t pt-6">
      <h2 className="font-display text-[22px] leading-none">{title}</h2>
      {note ? <p className="text-faint mt-1 max-w-[62ch] text-[13px]">{note}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-faint mt-2 text-[10px] font-semibold tracking-[0.16em] uppercase">
      {children}
    </div>
  );
}

const hairlineEdge = { boxShadow: "inset 0 0 0 1px var(--color-hairline)" };

function Square({
  size,
  n,
  variant = "available",
}: {
  size: number;
  n: number;
  variant?: "available" | "hover" | "pending";
}) {
  const showNumber = size >= NUMBER_MIN;
  const base =
    variant === "pending"
      ? {
          background:
            "repeating-linear-gradient(-45deg, var(--color-square) 0 3px, color-mix(in srgb, var(--color-accent) 35%, transparent) 3px 5px)",
          ...hairlineEdge,
        }
      : { background: variant === "hover" ? "#FFFFFF" : "var(--color-square)" };

  return (
    <div
      className="text-faint grid place-items-center font-mono"
      style={{ width: size, height: size, fontSize: Math.max(7, Math.round(size * 0.15)), ...base }}
    >
      {showNumber && variant !== "pending" ? n : null}
    </div>
  );
}

function SizeRow({
  label,
  variant,
}: {
  label: string;
  variant?: "available" | "hover" | "pending";
}) {
  return (
    <div className="flex items-end gap-6">
      <div className="w-[190px] text-[13px] font-semibold">{label}</div>
      {[
        [PHONE_1X, "phone 1x · 24px"],
        [DESKTOP_1X, "desktop 1x · 55px"],
        [ZOOM_4X, "4x · 96px"],
      ].map(([size, cap]) => (
        <div key={cap as string}>
          <div className="bg-seam inline-block p-px">
            <Square size={size as number} n={142} variant={variant} />
          </div>
          <Caption>{cap}</Caption>
        </div>
      ))}
    </div>
  );
}

function Block({
  w,
  h,
  cell,
  name,
  bg,
  fg,
  edge,
}: {
  w: number;
  h: number;
  cell: number;
  name: string;
  bg: string;
  fg: string;
  edge: boolean;
}) {
  return (
    <div
      className="flex items-center justify-center text-center text-[11px] font-bold tracking-tight"
      style={{
        width: w * cell + (w - 1),
        height: h * cell + (h - 1),
        background: bg,
        color: fg,
        ...(edge ? hairlineEdge : {}),
      }}
    >
      {name}
    </div>
  );
}

function Tooltip({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-ink text-page inline-block px-2 py-1 text-[11px] font-semibold">
      {children}
    </span>
  );
}

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-10">
      <header>
        <div className="text-faint text-[10px] font-semibold tracking-[0.18em] uppercase">
          Ticket 05 · state sheet
        </div>
        <h1 className="font-display mt-1 text-[40px] leading-none">200 SQUARES — REGISTER</h1>
        <p className="text-faint mt-2 max-w-[62ch] text-[13px]">
          The tokens the build reads, and every square state at the three sizes that decide whether
          it works: a phone at 1x, a desktop at 1x, and anything zoomed to 4x.
        </p>
      </header>

      <Section
        title="Colour"
        note="Seven tokens. The ground is muted so owner artwork is the only colour on the canvas. Accent is spent on the auction, the selection and pending — nowhere else."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TOKENS.map(([name, hex, use]) => (
            <div key={name} className="border-hairline flex items-center gap-3 border p-2">
              <div
                className="h-12 w-12 shrink-0"
                style={{ background: hex, ...hairlineEdge }}
              />
              <div className="min-w-0">
                <div className="text-[13px] font-semibold">
                  --color-{name}{" "}
                  <span className="text-faint font-mono text-[11px] font-normal">{hex}</span>
                </div>
                <div className="text-faint text-[11px] leading-tight">{use}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Type"
        note="Anton for anything you should read from across the room. Archivo for labels and copy. Roboto Mono only for square numbers."
      >
        <div className="flex flex-col gap-5">
          <div>
            <div className="font-display text-[22px] leading-none tracking-[0.01em]">200 SQUARES</div>
            <Caption>Anton 22 · wordmark</Caption>
          </div>
          <div>
            <TickerFixed className="font-display text-[30px] leading-none" />
            <Caption>Anton 30 · countdown, boxed digits</Caption>
          </div>
          <div>
            <div className="font-display text-[38px] leading-none">$600</div>
            <Caption>Anton 38 · price in the panel</Caption>
          </div>
          <div>
            <div className="text-[10px] font-semibold tracking-[0.16em] uppercase">Company name</div>
            <Caption>Archivo 10 / 600 · field label, 0.16em tracking</Caption>
          </div>
          <div>
            <div className="text-[12px]">6 squares · $100 each · 113 of 199 still free</div>
            <Caption>Archivo 12 · meta copy</Caption>
          </div>
          <div>
            <div className="font-mono text-[8px]">142</div>
            <Caption>Roboto Mono 8 · square number at desktop 1x</Caption>
          </div>
        </div>
      </Section>

      <Section
        title="The square states"
        note="A square carries its number only from 34px up. Below that the glyph is unreadable, so an empty square is just a tile. On a 390px phone that means no numbers until roughly 1.5x."
      >
        <div className="flex flex-col gap-7">
          <SizeRow label="available" />
          <SizeRow label="available · hover" variant="hover" />
          <SizeRow label="pending" variant="pending" />
        </div>
        <p className="text-faint mt-6 max-w-[62ch] text-[13px]">
          Pending never shows a number: a paid square with no artwork yet must not read as empty. The
          45° accent hatch says &ldquo;sold, artwork coming&rdquo; at every size.
        </p>
      </Section>

      <Section
        title="Selection"
        note="Hover turns a square white. Selection turns it white and puts a 2px accent outline round the whole rectangle, with the size and price on a chip at its top-left corner. Selection reads as hover, locked."
      >
        <div className="flex flex-wrap items-end gap-10">
          <div>
            <div className="bg-seam inline-block p-px">
              <div className="relative" style={{ outline: "2px solid var(--color-accent)", outlineOffset: -1 }}>
                <Square size={DESKTOP_1X} n={142} variant="hover" />
              </div>
            </div>
            <Caption>1 × 1 · $100</Caption>
          </div>
          <div>
            <div className="bg-seam inline-block p-px">
              <div
                className="relative grid"
                style={{
                  gap: 1,
                  gridTemplateColumns: `repeat(3, ${DESKTOP_1X}px)`,
                  gridTemplateRows: `repeat(2, ${DESKTOP_1X}px)`,
                  outline: "2px solid var(--color-accent)",
                  outlineOffset: -1,
                }}
              >
                {[125, 126, 127, 141, 142, 143].map((n) => (
                  <Square key={n} size={DESKTOP_1X} n={n} variant="hover" />
                ))}
                <span className="bg-accent font-display absolute -top-3.5 left-0 px-1.5 text-[13px] leading-[1.3] whitespace-nowrap text-white">
                  3×2 $600
                </span>
              </div>
            </div>
            <Caption>3 × 2 · the chip sits on the corner</Caption>
          </div>
        </div>
      </Section>

      <Section
        title="Blocks and the light artwork problem"
        note="Owner artwork is arbitrary colour. Light artwork used to melt into the ground, and two light blocks side by side read as one. Every block now carries a 1px hairline edge — taken, pending and the banner alike."
      >
        <div className="flex flex-wrap items-end gap-10">
          <div>
            <div className="flex gap-px">
              <Block w={2} h={2} cell={DESKTOP_1X} name="HALCYON" bg="#E8E3DA" fg="#222222" edge={false} />
              <Block w={2} h={2} cell={DESKTOP_1X} name="ATLAS" bg="#D9D2C5" fg="#2A2620" edge={false} />
            </div>
            <Caption>Before · no edge</Caption>
          </div>
          <div>
            <div className="flex gap-px">
              <Block w={2} h={2} cell={DESKTOP_1X} name="HALCYON" bg="#E8E3DA" fg="#222222" edge />
              <Block w={2} h={2} cell={DESKTOP_1X} name="ATLAS" bg="#D9D2C5" fg="#2A2620" edge />
            </div>
            <Caption>After · 1px hairline edge</Caption>
          </div>
          <div>
            <Block w={2} h={2} cell={DESKTOP_1X} name="NORTHWIND" bg="#1B4D8F" fg="#FFFFFF" edge />
            <Caption>Dark artwork · the edge costs it nothing</Caption>
          </div>
        </div>
      </Section>

      <Section
        title="The banner"
        note="The banner is the only 5 × 5 block and it is never for sale. When nobody has bid it becomes a house ad — the one moment the canvas is allowed to shout."
      >
        <div className="flex flex-wrap items-end gap-10">
          <div>
            <div
              className="flex flex-col items-center justify-center"
              style={{
                width: 5 * DESKTOP_1X + 4,
                height: 5 * DESKTOP_1X + 4,
                background: "#111827",
                color: "#F5C242",
                ...hairlineEdge,
              }}
            >
              <span className="text-[8px] font-semibold tracking-[0.2em] uppercase opacity-60">
                Lot 00 · today
              </span>
              <span className="font-display text-[26px] leading-none">HELIOGRAPH</span>
            </div>
            <Caption>Won · owner artwork</Caption>
          </div>
          <div>
            <div
              className="bg-accent flex flex-col items-center justify-center gap-2 px-4 text-center text-white"
              style={{ width: 5 * DESKTOP_1X + 4, height: 5 * DESKTOP_1X + 4, ...hairlineEdge }}
            >
              <span className="text-[9px] font-semibold tracking-[0.18em] uppercase opacity-80">
                Nobody has bid
              </span>
              <span className="font-display text-[26px] leading-[0.95]">
                THIS SPOT
                <br />
                TOMORROW
              </span>
              <span className="text-[11px] font-semibold">Bid from $100</span>
              <span className="text-accent font-display bg-white px-3 py-1 text-[15px] tracking-[0.06em]">
                BID
              </span>
            </div>
            <Caption>House ad · no winner</Caption>
          </div>
        </div>
      </Section>

      <Section
        title="Tooltip"
        note="Mouse only. On touch a tap selects the square and opens the sheet instead. Ink is the only element on the canvas that is neither ground nor artwork, so the tooltip reads as controls, not as part of the picture."
      >
        <div className="flex flex-wrap items-end gap-10">
          <div>
            <Tooltip>142 · Available · $100</Tooltip>
            <Caption>Available square</Caption>
          </div>
          <div>
            <Tooltip>NORTHWIND · Opens northwind.com</Tooltip>
            <Caption>Taken block</Caption>
          </div>
          <div>
            <Tooltip>Sold · artwork coming</Tooltip>
            <Caption>Pending block</Caption>
          </div>
        </div>
      </Section>

      <Section
        title="The countdown, and why it needed fixing"
        note="Anton ships no tabular figures. Its 1 measures 33.06 against 49.42 for every other digit at 100px, and font-variant-numeric does nothing. Each digit therefore sits in a 0.52em box. Watch both counters: the left one shifts, the right one does not."
      >
        <SecondsPair />
        <div className="mt-8">
          <div
            className="bg-accent inline-flex items-center gap-4 px-4 py-3 text-white"
            style={{ boxShadow: "var(--shadow-dock)" }}
          >
            <div>
              <div className="text-[9px] font-semibold tracking-[0.18em] uppercase opacity-80">
                Lot 00 closes
              </div>
              <TickerFixed className="font-display text-[30px] leading-none" />
            </div>
            <div className="text-[10px] leading-tight font-semibold tracking-[0.1em] uppercase opacity-80">
              Top bid
              <br />
              <span className="font-display text-[22px] leading-none tracking-normal opacity-100">
                $1,240
              </span>
            </div>
            <span className="text-accent font-display bg-white px-4 py-2 text-[15px] tracking-[0.06em]">
              BID
            </span>
          </div>
          <Caption>The auction dock · 6px 6px 0 hard shadow, no blur, no radius</Caption>
        </div>
      </Section>

      <Section title="Spacing and edges" note="There is no border radius anywhere in this design.">
        <ul className="text-[13px] leading-relaxed">
          <li>
            <span className="font-semibold">Seam</span> — 1px, scales with the canvas transform, so
            it is 4px at 4x. The grid is a plate at 1x and a market when you zoom in.
          </li>
          <li>
            <span className="font-semibold">Block edge</span> — 1px hairline, inset, on every block.
          </li>
          <li>
            <span className="font-semibold">Selection outline</span> — 2px accent, inset by 1px.
          </li>
          <li>
            <span className="font-semibold">Panel padding</span> — 20px. Page gutter 16px on mobile,
            32px from lg up.
          </li>
          <li>
            <span className="font-semibold">Dock shadow</span> — 6px 6px 0 ink. Hard, never blurred.
          </li>
          <li>
            <span className="font-semibold">Radius</span> — 0 everywhere.
          </li>
        </ul>
      </Section>
    </main>
  );
}
