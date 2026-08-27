// The one thing the panel still asks before the money moves, and why.
//
// ⚠️ Ticket 03 once put four fields here: buyer type, country, name and an EU
// VAT number. Since ADR 0006 Stripe Managed Payments is the merchant of record
// and does the tax, so country and VAT number left with it. Buyer type stays
// for a reason that has nothing to do with tax: only a consumer has a right of
// withdrawal (art. 6:230o BW, ADR 0005), and the panel cannot know which one it
// is talking to without asking.

export type BuyerType = "business" | "consumer";
