// What VAT is due, and it is the site that works it out.
//
// Stripe Tax is **off** and `tax_behavior` is **inclusive**
// ([ADR 0002](../../../docs/adr/0002-vat-inclusive-priced-and-computed-here.md)).
// $250 is $250 on the board, in the panel and on the card statement; whatever
// VAT is owed comes out of it. That makes this file the only place the number is
// decided, and the panel and the checkout route both read it.
//
// Ticket 03 settled what is being sold — advertising space on a web page, an
// electronically supplied service under Annex I(3)(h) of Regulation 282/2011 —
// and therefore that there are exactly three cases, decided by two fields the
// panel collects and one VIES call.

/** The 27 member states, by their own ISO 3166-1 alpha-2 codes. */
export const EU: ReadonlySet<string> = new Set([
  "AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GR", "HR",
  "HU", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO", "SE", "SI",
  "SK",
]);

/**
 * ⚠️ Member-state *territories* are deliberately not in that set.
 *
 * Åland (`AX`), the French overseas departments (`GF`, `GP`, `MQ`, `RE`, `YT`)
 * and the Dutch Caribbean (`AW`, `CW`, `SX`, `BQ`) each have their own code and
 * each sits **outside** the EU VAT territory, so falling to `none` is the right
 * answer and not an oversight. Monaco is the one that goes the other way — it
 * counts as France for VAT and its `MC` is not handled here. It is a rounding
 * error on a site that sells 199 squares; if one ever arrives it is a support
 * case, not a code change.
 */

/** The home rate, in basis points. 2100 is 21.00%, and no float rounds. */
export const NL_VAT_BPS = 2100;

export type BuyerType = "business" | "consumer";

/** The three cases from ticket 03. The schema stores this word. */
export type VatCase = "nl21" | "reverse" | "none";

export type VatDecision = {
  vatCase: VatCase;
  vatRateBps: number;
  /** The VAT inside the total. Inclusive pricing, so it never adds to it. */
  vatCents: number;
  /** What is left for the site. `totalCents - vatCents`. */
  netCents: number;
  totalCents: number;
};

/**
 * The VAT inside a VAT-inclusive total.
 *
 * ⚠️ `convex/lib/vat.ts` holds this same line, because the webhook recomputes it
 * against the amount Stripe actually took rather than trusting a number that
 * travelled in metadata. If this changes, that changes.
 */
export const vatInsideCents = (totalCents: number, bps: number) =>
  Math.round((totalCents * bps) / (10000 + bps));

/**
 * Which of the three cases this buyer is in.
 *
 * `viesValid` is what the VIES call came back with: `true` for a confirmed
 * number, `false` for one VIES rejected, and `null` for no number given or a
 * service that did not answer. Only a confirmed number reverse-charges — ticket
 * 06 is explicit that an order is never blocked on a service the site does not
 * run, so an unreachable VIES charges VAT and says so in one line.
 */
export function vatFor(input: {
  buyerType: BuyerType;
  country: string;
  viesValid: boolean | null;
  totalCents: number;
}): VatDecision {
  const { buyerType, country, viesValid, totalCents } = input;
  const settle = (vatCase: VatCase, bps: number): VatDecision => {
    const vatCents = bps === 0 ? 0 : vatInsideCents(totalCents, bps);
    return { vatCase, vatRateBps: bps, vatCents, netCents: totalCents - vatCents, totalCents };
  };

  // Outside the EU is outside the scope of Dutch VAT, business or not.
  if (!EU.has(country)) return settle("none", 0);

  // A Dutch buyer pays Dutch VAT whoever they are: reverse charge is for
  // cross-border supplies, and this one does not cross a border.
  if (country === "NL") return settle("nl21", NL_VAT_BPS);

  // An EU business outside NL with a number VIES confirmed. Everything else in
  // the EU — every consumer, and every business whose number did not confirm —
  // pays Dutch 21% while cross-border B2C stays under €10,000.
  if (buyerType === "business" && viesValid === true) return settle("reverse", 0);

  return settle("nl21", NL_VAT_BPS);
}

/** Whether the panel should be asking this buyer for a VAT number at all. */
export const wantsVatNumber = (buyerType: BuyerType | null, country: string) =>
  buyerType === "business" && country !== "NL" && EU.has(country);

/**
 * The country code VIES knows this country by.
 *
 * ⚠️ Greece files VAT numbers under **EL**, not GR, and VIES rejects `GR`
 * outright. Northern Ireland is `XI`, which this site has no field for.
 */
export const viesCountry = (country: string) => (country === "GR" ? "EL" : country);
