// The invoice, as a document.
//
// ⚠️ **It is rendered once and never again** (tickets 05 and 17). Everything the
// document says arrives here as an argument, frozen onto the order at the moment
// of sale — the money, the VAT case, the rate, the buyer's own words. Nothing in
// this file reads the clock, the tables or the price list, so a template changed
// in 2029 cannot rewrite an invoice from 2026: the file is already written.
//
// ⚠️ **The arithmetic is not hard-coded inclusive.** A first sale is priced
// VAT-inclusive and a V1.1 resale is priced VAT-on-top (ADR 0002, ticket 01), and
// the order row says which. So the net is taken as `total − vat` from two stored
// numbers rather than recomputed from a rate, and `pricing` chooses the sentence
// that says which way round it was. Recomputing here would make every resale
// invoice quietly wrong by 21%.
//
// The business identity comes from Convex environment variables and is copied
// into the document at issue time. That is deliberate: the address may change
// without a deploy, and changing it must not rewrite what is already issued.

/** The one description of the supply, in ticket 03's words. */
export const SUPPLY = "Advertising space on a web page";

export type InvoiceInput = {
  number: string;
  /** Absolute UTC ms. The date of issue. */
  issuedAt: number;
  /** Absolute UTC ms. When the order was paid — the date of supply. */
  suppliedAt: number;
  kind: "squares" | "banner";
  /** `Square 12–14`, or the banner's `YYYY-MM-DD`. What was bought. */
  what: string;
  buyer: { name: string; address: string; vatNumber?: string; country: string };
  totalCents: number;
  vatCents: number;
  vatRateBps: number;
  vatCase: "nl21" | "reverse" | "none";
  pricing: "inclusive" | "onTop";
  /** USD per EUR, and the day the ECB published it. Absent only where no rate is known. */
  fx: { rate: number; date: string; source: string } | null;
  business: Business;
};

export type Business = {
  name: string;
  address: string;
  kvk: string;
  vatId: string;
};

/**
 * The four variables that carry the site's own identity.
 *
 * ⚠️ **Never a default and never an invented value.** A wrong VAT number on an
 * invoice is a real problem and not a typo, so a deployment that has not been
 * given these cannot issue one — it says so and stops, which is recoverable. A
 * placeholder printed on a legal document is not.
 */
export function businessFromEnv(): Business {
  const read = (name: string) => {
    const value = process.env[name];
    if (!value) throw new Error(`${name} is not set, so no invoice can be issued.`);
    return value;
  };
  return {
    name: read("BUSINESS_NAME"),
    address: read("BUSINESS_ADDRESS"),
    kvk: read("BUSINESS_KVK"),
    vatId: read("BUSINESS_VAT_ID"),
  };
}

/** Whole cents to `1,250.00`. Money is an integer everywhere else; this is print. */
const amount = (cents: number) =>
  (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const usd = (cents: number) => `$${amount(cents)}`;
const eur = (cents: number) => `€${amount(cents)}`;

/** `2100` to `21%`, and `2150` to `21.5%`. Basis points never become a float. */
const percent = (bps: number) =>
  bps % 100 === 0 ? `${bps / 100}%` : `${(bps / 100).toFixed(2).replace(/0$/, "")}%`;

/** The UTC calendar day, as `YYYY-MM-DD`. The document knows no other clock. */
const day = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/**
 * ⚠️ Everything the buyer typed goes through here.
 *
 * A company name is a free-text field on a Stripe form and this document is
 * served as HTML from the site's own domain.
 */
const esc = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * The euro amount of the VAT, which is what art. 35a lid 4 Wet OB actually
 * demands — not the total, and not the net.
 *
 * ⚠️ It is quoted with the rate **and the date the rate was published**. The ECB
 * publishes on working days only, so a Saturday invoice carries Friday's rate,
 * and the date is the whole of what makes that defensible years later.
 */
const euroLine = (vatCents: number, fx: InvoiceInput["fx"]) => {
  if (!fx || !fx.rate) return "";
  const cents = Math.round(vatCents / fx.rate);
  return `<p class="note">VAT in euros: <strong>${eur(cents)}</strong> — converted at the ${esc(
    fx.source,
  )} reference rate of ${fx.rate} USD per EUR, published ${esc(fx.date)}.</p>`;
};

/** The one sentence that says which way round the price was built. */
const pricingLine = (pricing: InvoiceInput["pricing"]) =>
  pricing === "inclusive"
    ? "The price shown on the site included VAT."
    : "VAT was added to the price shown on the site.";

/**
 * The money block, which is the one part of the document with three shapes.
 *
 * Ticket 17's table, in the same order:
 *
 *   `nl21`    — taxable amount, the rate, the VAT, the total, and the VAT in
 *               euros beside it.
 *   `reverse` — no VAT amount and the words *btw verlegd*. Both VAT numbers are
 *               already on the document: the site's in the From block, the
 *               customer's in the To block.
 *   `none`    — no VAT line at all, and one sentence saying why.
 */
function money(input: InvoiceInput): string {
  const net = input.totalCents - input.vatCents;
  const row = (label: string, value: string, strong = false) =>
    `<tr${strong ? ' class="total"' : ""}><th>${label}</th><td>${value}</td></tr>`;

  if (input.vatCase === "nl21") {
    return `
      <table class="money">
        ${row("Taxable amount", usd(net))}
        ${row(`VAT ${percent(input.vatRateBps)}`, usd(input.vatCents))}
        ${row("Total", usd(input.totalCents), true)}
      </table>
      ${euroLine(input.vatCents, input.fx)}
      <p class="note">${pricingLine(input.pricing)}</p>`;
  }

  if (input.vatCase === "reverse") {
    return `
      <table class="money">
        ${row("Taxable amount", usd(net))}
        ${row("VAT", "—")}
        ${row("Total", usd(input.totalCents), true)}
      </table>
      <p class="note"><strong>Btw verlegd</strong> — VAT reverse-charged.</p>`;
  }

  return `
    <table class="money">
      ${row("Amount", usd(net))}
      ${row("Total", usd(input.totalCents), true)}
    </table>
    <p class="note">Outside the scope of Dutch VAT.</p>`;
}

/**
 * The whole document, as one self-contained HTML file.
 *
 * No stylesheet, no font and no image from anywhere: it is stored for ten years
 * and has to render in 2036 out of a file, off any network. A browser prints it
 * to PDF in one keystroke, which is why ticket 17 buys no PDF library.
 */
export function invoiceHtml(input: InvoiceInput): string {
  const b = input.business;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Invoice ${esc(input.number)} — ${esc(b.name)}</title>
<style>
  body { font: 15px/1.5 ui-sans-serif, system-ui, sans-serif; color: #111; margin: 0; padding: 40px 24px; }
  main { max-width: 46rem; margin: 0 auto; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .meta { color: #555; margin: 0 0 32px; }
  .parties { display: flex; flex-wrap: wrap; gap: 32px; margin-bottom: 32px; }
  .parties section { min-width: 16rem; }
  h2 { font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: #555; margin: 0 0 6px; }
  table { border-collapse: collapse; width: 100%; }
  table th { text-align: left; font-weight: 400; color: #555; }
  table td { text-align: right; font-variant-numeric: tabular-nums; }
  .lines th, .lines td, .money th, .money td { padding: 8px 0; border-bottom: 1px solid #e5e5e5; }
  .money { margin-top: 24px; }
  .money .total th, .money .total td { font-weight: 600; color: #111; border-bottom: none; }
  .note { color: #555; margin: 8px 0 0; }
  footer { margin-top: 40px; color: #555; font-size: 13px; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
<main>
  <h1>Invoice ${esc(input.number)}</h1>
  <p class="meta">Date of issue ${day(input.issuedAt)} · Date of supply ${day(input.suppliedAt)}</p>

  <div class="parties">
    <section>
      <h2>From</h2>
      <div>${esc(b.name)}</div>
      <div>${esc(b.address)}</div>
      <div>KVK ${esc(b.kvk)}</div>
      <div>BTW-identificatienummer ${esc(b.vatId)}</div>
    </section>
    <section>
      <h2>To</h2>
      <div>${esc(input.buyer.name)}</div>
      <div>${esc(input.buyer.address)}</div>
      ${input.buyer.vatNumber ? `<div>VAT ${esc(input.buyer.vatNumber)}</div>` : ""}
    </section>
  </div>

  <table class="lines">
    <tr>
      <th>${SUPPLY}<br><span class="note">${esc(input.what)}</span></th>
      <td>${usd(input.totalCents - input.vatCents)}</td>
    </tr>
  </table>

  ${money(input)}

  <footer>
    <p>Paid in full. 200squares.com</p>
  </footer>
</main>
</body>
</html>
`;
}
