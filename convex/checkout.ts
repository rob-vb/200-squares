// What happens to a payment once Stripe says it happened.
//
// ⚠️ Only the signature-verified webhook writes a block (ticket 05), and the
// Stripe **session id** is the key against writing one twice. Everything in this
// file is either that write or the one right the session id grants afterwards.
//
// The order of events is: reserve → order, on 200squares.com → pay, on Stripe →
// webhook → `pending`. The buyer's return page is not part of it. It only
// watches, and after ten seconds it asks Stripe directly (`convex/http.ts`), so
// a late or lost webhook is never something the buyer has to see.

import { v, ConvexError } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { rect as rectValidator } from "./schema";
import { cellCount, overlaps } from "./lib/board";
import { vatInsideCents } from "./lib/vat";

const buyerType = v.union(v.literal("business"), v.literal("consumer"));
const vatCase = v.union(v.literal("nl21"), v.literal("reverse"), v.literal("none"));

/**
 * What the buyer told the site about themselves, on the site, before they were
 * sent to Stripe. It travels in the Checkout Session's metadata and comes back
 * with the webhook, which is why the reservation needs no cookie to be somebody.
 */
const declared = v.object({
  reservationId: v.string(),
  rect: rectValidator,
  buyerType,
  country: v.string(),
  name: v.string(),
  vatNumber: v.optional(v.string()),
  viesRequestIdentifier: v.optional(v.string()),
  withdrawalWaived: v.boolean(),
  withdrawalText: v.string(),
  invoiceText: v.string(),
  vatCase,
  vatRateBps: v.number(),
  ip: v.string(),
});

/** Lower-cased and trimmed. The only form the owner join ever matches on. */
const normalise = (email: string) => email.trim().toLowerCase();

/**
 * Turn a paid Stripe session into a block, or into a refund.
 *
 * Three outcomes, and the caller acts on each:
 *
 *   `already`  — this session has an order. Nothing is written and nothing is
 *                owed. Both the webhook and the ten-second fallback land here
 *                the second time, which is the whole reason the key exists.
 *   `written`  — the squares were free and now they are a block.
 *   `refunded` — somebody else's payment landed on them first. ⚠️ Ticket 05: the
 *                webhook wins whenever the squares are **still free**, and a
 *                free square is one no *block* covers. Another visitor's live
 *                hold does not beat a completed payment; whoever pays first
 *                wins, and the one who paid second gets every cent back.
 *
 * ⚠️ The money is recomputed here against `amountTotalCents` — what Stripe
 * actually took — rather than trusted from metadata. The VAT *case* was decided
 * before the session existed and travels with it; the arithmetic is redone, so
 * the invoice can never disagree with the card statement.
 */
export const fulfil = internalMutation({
  args: {
    stripeSessionId: v.string(),
    paymentIntentId: v.string(),
    amountTotalCents: v.number(),
    email: v.string(),
    address: v.string(),
    stripeCountry: v.string(),
    declared,
  },
  returns: v.object({
    status: v.union(v.literal("already"), v.literal("written"), v.literal("refunded")),
    paymentIntentId: v.string(),
  }),
  handler: async (ctx, args) => {
    const { declared: d } = args;

    const existing = await ctx.db
      .query("orders")
      .withIndex("by_session", (q) => q.eq("stripeSessionId", args.stripeSessionId))
      .unique();
    if (existing) return { status: "already" as const, paymentIntentId: args.paymentIntentId };

    // The reservation is the better source for the rectangle: it is what the
    // overlap check actually passed. The metadata copy is the fallback for a
    // webhook so late that the sweep has already taken the row.
    const reservation = ctx.db.normalizeId("reservations", d.reservationId);
    const row = reservation ? await ctx.db.get(reservation) : null;
    const rect = row?.rect ?? d.rect;

    const blocks = await ctx.db.query("blocks").collect();
    const clash = blocks.some((b) => overlaps(b.rect, rect));

    // An owner exists the moment a payment lands, whether or not an account ever
    // follows it (ticket 08). The name is left empty on purpose: it is the
    // *company* name, the buyer supplies it on the return page, and a private
    // person's legal name has no business appearing in a public tooltip.
    const emailNormalised = normalise(args.email);
    let ownerId = (
      await ctx.db
        .query("owners")
        .withIndex("by_email", (q) => q.eq("emailNormalised", emailNormalised))
        .unique()
    )?._id;
    if (!ownerId) {
      ownerId = await ctx.db.insert("owners", {
        name: "",
        email: args.email,
        emailNormalised,
        strikeAt: [],
        createdAt: Date.now(),
      });
    }

    const now = Date.now();
    const vatCents = vatInsideCents(args.amountTotalCents, d.vatRateBps);
    const orderId = await ctx.db.insert("orders", {
      stripeSessionId: args.stripeSessionId,
      paymentIntentId: args.paymentIntentId,
      kind: "squares",
      ownerId,
      rect,
      buyerType: d.buyerType,
      country: d.country,
      stripeCountry: args.stripeCountry || undefined,
      countryMismatch: Boolean(args.stripeCountry) && args.stripeCountry !== d.country,
      name: d.name,
      address: args.address,
      vatNumber: d.vatNumber,
      viesRequestIdentifier: d.viesRequestIdentifier,
      withdrawalWaived: d.withdrawalWaived,
      withdrawalText: d.withdrawalText,
      invoiceText: d.invoiceText,
      ip: d.ip,
      totalCents: args.amountTotalCents,
      vatCents,
      vatRateBps: d.vatRateBps,
      vatCase: d.vatCase,
      pricing: "inclusive",
      refundedAt: clash ? now : undefined,
      refundReason: clash ? "The squares were sold to somebody else first." : undefined,
      createdAt: now,
    });

    if (row && !row.releasedAt) await ctx.db.patch(row._id, { releasedAt: now });

    if (clash) {
      return { status: "refunded" as const, paymentIntentId: args.paymentIntentId };
    }

    await ctx.db.insert("blocks", {
      rect,
      ownerId,
      url: "",
      artwork: null,
      frozen: false,
      orderId,
      createdAt: now,
    });

    return { status: "written" as const, paymentIntentId: args.paymentIntentId };
  },
});

/**
 * The order behind a Stripe session, for the page the buyer lands on.
 *
 * ⚠️ Keyed on the session id and nothing else, which is exactly ticket 06's
 * grant: whoever holds the session id is the person who just paid, because the
 * only place it exists is their own return URL. So it answers with what they
 * bought and never with the email, the IP or the address they gave Stripe.
 */
export const orderBySession = query({
  args: { stripeSessionId: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      rect: rectValidator,
      squares: v.number(),
      totalCents: v.number(),
      vatCents: v.number(),
      vatCase,
      refunded: v.boolean(),
      refundReason: v.union(v.string(), v.null()),
      /** The public company name, once the buyer has supplied it. */
      companyName: v.string(),
      url: v.string(),
    }),
  ),
  handler: async (ctx, { stripeSessionId }) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_session", (q) => q.eq("stripeSessionId", stripeSessionId))
      .unique();
    if (!order || !order.rect) return null;

    const owner = await ctx.db.get(order.ownerId);
    const block = (
      await ctx.db
        .query("blocks")
        .withIndex("by_owner", (q) => q.eq("ownerId", order.ownerId))
        .collect()
    ).find((b) => b.orderId === order._id);

    return {
      rect: order.rect,
      squares: cellCount(order.rect),
      totalCents: order.totalCents,
      vatCents: order.vatCents,
      vatCase: order.vatCase,
      refunded: Boolean(order.refundedAt),
      refundReason: order.refundReason ?? null,
      companyName: owner?.name ?? "",
      url: block?.url ?? "",
    };
  },
});

/**
 * The one right the session id grants: name the block and point it somewhere.
 *
 * Ticket 06 moved company, link and artwork off the panel and behind the
 * payment, and this is where the first two land — before any email arrives, so
 * nobody leaves the site with a square that says nothing.
 *
 * ⚠️ The artwork half is [ticket 20](../.scratch/200squares-v1/issues/20-build-artwork.md)'s
 * and it hangs on this same grant: the upload URL is authorised by the session
 * id in exactly the way this mutation is, and nothing else here has to change.
 */
export const completeBySession = mutation({
  args: { stripeSessionId: v.string(), companyName: v.string(), url: v.string() },
  returns: v.null(),
  handler: async (ctx, { stripeSessionId, companyName, url }) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_session", (q) => q.eq("stripeSessionId", stripeSessionId))
      .unique();
    if (!order) throw new ConvexError("There is no order for that payment.");
    if (order.refundedAt) throw new ConvexError("That order was refunded.");

    const name = companyName.trim().slice(0, 80);
    // Bare, no scheme: `blocks.url` is an address and the anchor adds the https.
    const bare = url.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "").slice(0, 200);
    if (!name) throw new ConvexError("A name is needed.");

    await ctx.db.patch(order.ownerId, { name });
    const blocks = await ctx.db
      .query("blocks")
      .withIndex("by_owner", (q) => q.eq("ownerId", order.ownerId))
      .collect();
    for (const block of blocks) {
      if (block.orderId !== order._id) continue;
      if (block.frozen) continue;
      await ctx.db.patch(block._id, { url: bare });
    }
    return null;
  },
});
