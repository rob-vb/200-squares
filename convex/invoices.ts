// The invoice: allocating its number, writing its file, and handing back its
// address. [Ticket 17](../.scratch/200squares-v1/issues/17-invoice-document.md)
// decided all three.
//
// ⚠️ **The number is allocated inside the mutation that writes the invoice row**,
// never at order time. A number handed to something that then fails is a gap in
// the series, and a gap has to be explained to an inspector. `allocate` below is
// the only place a number is taken, it takes one only when it has already
// written the row that carries it, and Convex's serialisable transactions make
// two callers at the same number impossible.
//
// ⚠️ **A refunded order takes no invoice at all.** A payment that landed on
// squares somebody else had already bought is written to `orders` with
// `refundedAt` and no block behind it (ticket 16). Money moved and moved back;
// nothing was supplied, so there is nothing to invoice.
//
// The work is split the way Convex splits it and no further:
//
//   `allocate`  — mutation. Takes the number, mints the token, freezes the rate
//                 onto the order, and hands back everything the document says.
//   `issue`     — action. Renders that into HTML and stores the file.
//   `attach`    — mutation. Points the row at the file.
//
// A row without a file is an invoice still being written and never a gap:
// `sweepMissing` finishes it, and because every field it renders from is already
// frozen, the second render produces the same document as the first.

import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
  internalAction,
  internalMutation,
  internalQuery,
  type MutationCtx,
} from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { squareRange } from "./lib/board";
import { businessFromEnv, invoiceHtml, type InvoiceInput } from "./lib/invoice";

/** Where an invoice is read. ⚠️ The token, never the number (ticket 17). */
export const invoiceUrl = (token: string) =>
  `${process.env.SITE_URL ?? "https://200squares.com"}/invoice/${token}`;

/**
 * 16 random bytes as hex.
 *
 * ⚠️ This is the whole guard on the document. It carries a name and an address,
 * and there is no sign-in in front of it — the same shape as ticket 06's
 * Stripe-session-id grant: permanent, unguessable, and nothing to lose if the
 * owner forwards it to their own accountant.
 */
function mintToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * The next number in this year's series.
 *
 * One series per calendar year, `2026-0001`. ⚠️ Read from the invoices
 * themselves and not from a counter row: the row that would hold the counter is
 * the row this is about to write, and a counter that can disagree with the
 * series it counts is a second source of truth. Invoices are rare and the index
 * makes this one read.
 */
async function nextNumber(ctx: MutationCtx, year: number): Promise<string> {
  const last = await ctx.db
    .query("invoices")
    .withIndex("by_year", (q) => q.eq("year", year))
    .order("desc")
    .first();
  const n = last ? Number(last.number.split("-")[1]) + 1 : 1;
  return `${year}-${String(n).padStart(4, "0")}`;
}

/** What the document says, once the row that carries the number exists. */
const rendering = v.object({
  invoiceId: v.id("invoices"),
  token: v.string(),
  number: v.string(),
  issuedAt: v.number(),
  suppliedAt: v.number(),
  kind: v.union(v.literal("squares"), v.literal("banner")),
  what: v.string(),
  buyerName: v.string(),
  buyerAddress: v.string(),
  buyerVatNumber: v.string(),
  buyerCountry: v.string(),
  totalCents: v.number(),
  vatCents: v.number(),
  vatRateBps: v.number(),
  vatCase: v.union(v.literal("nl21"), v.literal("reverse"), v.literal("none")),
  pricing: v.union(v.literal("inclusive"), v.literal("onTop")),
  fxRate: v.union(v.number(), v.null()),
  fxRateDate: v.string(),
  fxSource: v.string(),
});

/**
 * Take the number, mint the token, freeze the rate — or say why there is no
 * invoice to write.
 *
 * ⚠️ **The rate is frozen here and never afterwards.** Ticket 17: an invoice is
 * never recomputed, so a rate published tomorrow must not touch a document
 * written today. The three fields go on the **order**, beside the VAT the
 * checkout already froze, and the document is rendered from them.
 */
export const allocate = internalMutation({
  args: { orderId: v.id("orders") },
  returns: v.object({
    status: v.union(
      /** The row is written and the file is not. Render it. */
      v.literal("write"),
      /** There is a finished invoice already. Nothing to do. */
      v.literal("done"),
      /** Refunded, or no such order. Nothing is owed and nothing is issued. */
      v.literal("none"),
    ),
    token: v.string(),
    render: v.union(rendering, v.null()),
  }),
  handler: async (ctx, { orderId }) => {
    const order = await ctx.db.get(orderId);
    if (!order || order.refundedAt) {
      return { status: "none" as const, token: "", render: null };
    }

    const existing = await ctx.db
      .query("invoices")
      .withIndex("by_order", (q) => q.eq("orderId", orderId))
      .unique();
    if (existing?.storageId) {
      return { status: "done" as const, token: existing.token, render: null };
    }

    // The rate the last cron pulled, and the day the ECB published it. Where
    // there is none — a deployment whose cron has never run — the invoice is
    // still issued and simply carries no euro line, because refusing to invoice
    // a paid order is the worse failure of the two.
    const fx = (
      await ctx.db
        .query("cached")
        .withIndex("by_key", (q) => q.eq("key", "fx"))
        .unique()
    )?.value as { rate?: number; date?: string; source?: string } | undefined;

    const now = Date.now();
    if (fx?.rate && !order.fxRate) {
      await ctx.db.patch(orderId, {
        fxRate: fx.rate,
        fxRateDate: fx.date,
        fxSource: fx.source ?? "ECB",
      });
    }

    const invoiceId =
      existing?._id ??
      (await (async () => {
        const year = new Date(now).getUTCFullYear();
        return await ctx.db.insert("invoices", {
          orderId,
          number: await nextNumber(ctx, year),
          year,
          token: mintToken(),
          issuedAt: now,
        });
      })());

    const invoice = (await ctx.db.get(invoiceId))!;
    const what =
      order.kind === "banner"
        ? `The banner on ${order.bannerDate ?? ""}`
        : order.rect
          ? `Square ${squareRange(order.rect)}`
          : "";

    return {
      status: "write" as const,
      token: invoice.token,
      render: {
        invoiceId,
        token: invoice.token,
        number: invoice.number,
        issuedAt: invoice.issuedAt,
        // The date of supply is the day the money moved, which is the day the
        // order was written — not the day this file happens to be rendered.
        suppliedAt: order.createdAt,
        kind: order.kind,
        what,
        buyerName: order.name,
        buyerAddress: order.address,
        buyerVatNumber: order.vatNumber ?? "",
        buyerCountry: order.country,
        totalCents: order.totalCents,
        vatCents: order.vatCents,
        vatRateBps: order.vatRateBps,
        vatCase: order.vatCase,
        pricing: order.pricing,
        fxRate: order.fxRate ?? fx?.rate ?? null,
        fxRateDate: order.fxRateDate ?? fx?.date ?? "",
        fxSource: order.fxSource ?? fx?.source ?? "ECB",
      },
    };
  },
});

/**
 * Point the row at its file.
 *
 * ⚠️ A file that lost the race is deleted rather than left behind. Two renders
 * of the same invoice produce the same bytes, so the loser is worth nothing —
 * and ticket 09 is protecting a one-gigabyte plan.
 */
export const attach = internalMutation({
  args: { invoiceId: v.id("invoices"), storageId: v.id("_storage") },
  returns: v.null(),
  handler: async (ctx, { invoiceId, storageId }) => {
    const invoice = await ctx.db.get(invoiceId);
    if (!invoice) {
      await ctx.storage.delete(storageId);
      return null;
    }
    if (invoice.storageId) {
      await ctx.storage.delete(storageId);
      return null;
    }
    await ctx.db.patch(invoiceId, { storageId });
    return null;
  },
});

/**
 * Issue the invoice for one order, and hand back where it can be read.
 *
 * Safe to call twice: the second call finds a finished invoice and returns its
 * address without writing anything. That is what lets the order-confirmed mail
 * and the sweep both ask for it.
 */
export const issue = internalAction({
  args: { orderId: v.id("orders") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, { orderId }): Promise<string | null> => {
    const result = await ctx.runMutation(internal.invoices.allocate, { orderId });
    if (result.status === "none") return null;
    if (result.status === "done" || !result.render) return invoiceUrl(result.token);

    const r = result.render;
    const input: InvoiceInput = {
      number: r.number,
      issuedAt: r.issuedAt,
      suppliedAt: r.suppliedAt,
      kind: r.kind,
      what: r.what,
      buyer: {
        name: r.buyerName,
        address: r.buyerAddress,
        vatNumber: r.buyerVatNumber || undefined,
        country: r.buyerCountry,
      },
      totalCents: r.totalCents,
      vatCents: r.vatCents,
      vatRateBps: r.vatRateBps,
      vatCase: r.vatCase,
      pricing: r.pricing,
      fx: r.fxRate ? { rate: r.fxRate, date: r.fxRateDate, source: r.fxSource } : null,
      // ⚠️ Throws where the deployment has not been given its own identity, and
      // that is the right failure: the row and its number are already written,
      // so the sweep finishes the document as soon as the variables are set.
      business: businessFromEnv(),
    };

    const storageId = await ctx.storage.store(
      new Blob([invoiceHtml(input)], { type: "text/html; charset=utf-8" }),
    );
    await ctx.runMutation(internal.invoices.attach, { invoiceId: r.invoiceId, storageId });
    return invoiceUrl(r.token);
  },
});

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

// ---------------------------------------------------------------------------
// The sweep, and the rate it depends on.

/** Bounded: a paid order is rare and a run that walks all of them is not needed. */
const SWEEP_LIMIT = 25;

/**
 * Orders that should have an invoice and do not, and invoices whose file never
 * arrived.
 *
 * ⚠️ It is not a repair for a bug. It is the retry for the two ordinary ways the
 * action can die between the row and the file: a Resend or ECB hiccup, and a
 * deployment issuing its first invoice before `BUSINESS_VAT_ID` was set.
 */
export const needing = internalQuery({
  args: {},
  returns: v.array(v.id("orders")),
  handler: async (ctx) => {
    const out: Id<"orders">[] = [];
    for (const order of await ctx.db.query("orders").order("desc").take(200)) {
      if (order.refundedAt) continue;
      const invoice = await ctx.db
        .query("invoices")
        .withIndex("by_order", (q) => q.eq("orderId", order._id))
        .unique();
      if (invoice?.storageId) continue;
      out.push(order._id);
      if (out.length >= SWEEP_LIMIT) break;
    }
    return out;
  },
});

export const sweepMissing = internalAction({
  args: {},
  returns: v.number(),
  handler: async (ctx): Promise<number> => {
    const orders = await ctx.runQuery(internal.invoices.needing, {});
    let issued = 0;
    for (const orderId of orders) {
      try {
        await ctx.runAction(internal.invoices.issue, { orderId });
        issued++;
      } catch {
        // A deployment with no business identity throws every time, and saying
        // so once a day in the logs is the whole of what this can do about it.
      }
    }
    return issued;
  },
});

/** The one row the rate lives in. */
export const putFx = internalMutation({
  args: { rate: v.number(), date: v.string() },
  returns: v.null(),
  handler: async (ctx, { rate, date }) => {
    const value = { rate, date, source: "ECB" };
    const row = await ctx.db
      .query("cached")
      .withIndex("by_key", (q) => q.eq("key", "fx"))
      .unique();
    if (row) await ctx.db.patch(row._id, { value, builtAt: Date.now() });
    else await ctx.db.insert("cached", { key: "fx", value, builtAt: Date.now() });
    return null;
  },
});

/**
 * The ECB daily reference rate.
 *
 * ⚠️ **Published on working days only** — not at weekends, not on a TARGET
 * closing day. So this keeps whatever it last saw, together with the date the
 * ECB stamped it, and a Saturday invoice quotes Friday's rate and says which day
 * that was. Ticket 17: the date is what makes such an invoice defensible.
 *
 * The XML is read with a regular expression and not a parser. There is no
 * DOMParser in Convex's runtime, the file is three attributes deep, and a
 * dependency that parses XML would be a dependency in the path of the site's own
 * bookkeeping.
 */
export const pullFxRate = internalAction({
  args: {},
  returns: v.union(v.number(), v.null()),
  handler: async (ctx): Promise<number | null> => {
    const res = await fetch("https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml");
    if (!res.ok) return null;
    const xml = await res.text();

    const date = xml.match(/time=['"](\d{4}-\d{2}-\d{2})['"]/)?.[1];
    const rate = Number(xml.match(/currency=['"]USD['"]\s+rate=['"]([\d.]+)['"]/)?.[1]);
    if (!date || !Number.isFinite(rate) || rate <= 0) return null;

    await ctx.runMutation(internal.invoices.putFx, { rate, date });
    return rate;
  },
});
