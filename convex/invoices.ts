// ⚠️ **Legacy since ADR 0006 (2026-08-27).** The site issued its own invoices —
// one series a year, the ECB rate frozen on the day, a write-once HTML file —
// until Stripe Managed Payments made Stripe the merchant of record and the
// issuer of the invoice. What is left here reads the documents already written;
// nothing writes a new one. The history of the design is in the ticket-17 and
// ticket-23 notes.

import { v } from "convex/values";
import { internalQuery } from "./_generated/server";

/**
 * Where an invoice is read. ⚠️ The token, never the number (ticket 17).
 *
 * ⚠️ **It is not the withdrawal token.** `mintToken` is shared with
 * [ticket 43](../.scratch/200squares-v1/issues/43-build-withdrawal-function.md)
 * and the two strings are minted separately on purpose: this one carries a name
 * and an address to a bookkeeper, and it must never also cancel the purchase.
 */
export const invoiceUrl = (token: string) =>
  `${process.env.SITE_URL ?? "https://200squares.com"}/invoice/${token}`;

// ---------------------------------------------------------------------------
// Reading one.

/** The file behind a token, for the one route that streams it. */
export const fileByToken = internalQuery({
  args: { token: v.string() },
  returns: v.union(v.id("_storage"), v.null()),
  handler: async (ctx, { token }) => {
    const invoice = await ctx.db
      .query("invoices")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();
    return invoice?.storageId ?? null;
  },
});

