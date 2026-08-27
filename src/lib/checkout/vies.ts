// The VAT number, checked against VIES before the money moves.
//
// ⚠️ This exists because Stripe checks the wrong thing at the wrong time: it
// validates a tax id's **format** before payment and its **validity** only
// afterwards, so a fake number that looks right would get a zero-VAT sale
// through. Ticket 03 found the Commission's own REST endpoint, which is free,
// needs no key, and answers synchronously — so the site asks it itself, before
// it creates the Checkout Session.
//
// Art. 18(1)(a) of Regulation 282/2011 asks for confirmation of the number *and*
// the associated name and address, and several member states return `---` for
// both. The Belastingdienst answers that directly: a valid number is enough
// proof that you are dealing with a business. So only `valid` is read here, and
// the `requestIdentifier` is kept as the consultation reference.

import { viesCountry } from "./vat";

const ENDPOINT = "https://ec.europa.eu/taxation_customs/vies/rest-api/check-vat-number";

export type ViesResult = {
  /**
   * `valid` — VIES confirmed it. `invalid` — VIES rejected it. `unavailable` —
   * VIES or the member state did not answer.
   *
   * ⚠️ The third is not a failure of the order. Ticket 06: never block an order
   * on a service the site does not run. VAT is charged, the panel says so in one
   * line, and the sale goes through.
   */
  state: "valid" | "invalid" | "unavailable";
  /** The consultation reference, kept as proof. Only ever comes with a requester. */
  requestIdentifier?: string;
};

/** `NL 1234.56.789 B01` and `nl123456789b01` are the same number. */
export function normaliseVatNumber(country: string, raw: string): string {
  const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const prefix = viesCountry(country);
  return clean.startsWith(prefix) ? clean.slice(prefix.length) : clean;
}

/**
 * ⚠️ Without requester details VIES answers, but hands back no
 * `requestIdentifier` — and the reference is half the point of asking. The
 * number belongs to the eenmanszaak and is public; it is read from the
 * environment so that it can be set without a deploy, the way every other piece
 * of the business's identity on an invoice is.
 */
function requester(): { requesterMemberStateCode: string; requesterNumber: string } | null {
  const own = (process.env.BUSINESS_VAT_ID ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const match = own.match(/^([A-Z]{2})(.+)$/);
  if (!match) return null;
  return { requesterMemberStateCode: match[1], requesterNumber: match[2] };
}

export async function checkVatNumber(country: string, raw: string): Promise<ViesResult> {
  const vatNumber = normaliseVatNumber(country, raw);
  if (!vatNumber) return { state: "invalid" };

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        countryCode: viesCountry(country),
        vatNumber,
        ...(requester() ?? {}),
      }),
      // A buyer is waiting on this with a filled-in form. Five seconds, then it
      // counts as unreachable and the sale carries VAT.
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { state: "unavailable" };
    const body = (await res.json()) as { valid?: boolean; requestIdentifier?: string };
    if (body.valid !== true) return { state: "invalid" };
    return { state: "valid", requestIdentifier: body.requestIdentifier };
  } catch {
    return { state: "unavailable" };
  }
}
