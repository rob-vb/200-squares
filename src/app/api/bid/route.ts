// Placing a bid. This is the moment the conditional obligation is concluded.
//
// It is `/api/checkout` with one difference that changes everything downstream:
// `capture_method: "manual"`. The money is **frozen, not taken** — a bid is a
// card authorization for exactly the bid amount, and it is collected at 00:00
// UTC only if that bid wins (ticket 07).
//
// The same three things happen here, in the same order and for the same reasons:
// the VAT number is checked against VIES **synchronously**, because Stripe checks
// validity too late; the VAT is worked out by the site, because Stripe Tax is off
// (ADR 0002); and the Checkout Session is created with the bid id as its
// idempotency key, so one bid has exactly one session for its whole life.
//
// ⚠️ **Cards only.** Ticket 03 found iDEAL cannot do manual capture, and a bid
// that cannot be held is not a bid. The panel offers nothing else.
//
// ⚠️ This route is reachable only with a bid id, and a bid id is only handed out
// by the Turnstile door on Convex (`/auction/bid`). That is the same gate the
// order route sits behind, and it is why the floodable half is not here.

import { ConvexHttpClient } from "convex/browser";
import Stripe from "stripe";
import { api } from "@convex/api";
import type { Id } from "@convex/dataModel";
import { BANNER_WITHDRAWAL_TEXT, INVOICE_TEXT } from "@/lib/checkout/consent";
import { vatFor, wantsVatNumber, type BuyerType } from "@/lib/checkout/vat";
import { checkVatNumber, normaliseVatNumber } from "@/lib/checkout/vies";

type Body = {
  bidId?: string;
  buyerType?: BuyerType;
  country?: string;
  name?: string;
  vatNumber?: string;
  withdrawalWaived?: boolean;
};

type Answer =
  | { ok: true; url: string; viesUnavailable?: boolean }
  | { ok: false; error: "expired" | "vies-invalid" | "invalid" | "conflict" | "unavailable" };

const fail = (error: Extract<Answer, { ok: false }>["error"], status = 400) =>
  Response.json({ ok: false, error } satisfies Answer, { status });

export async function POST(request: Request) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!convexUrl || !stripeKey) return fail("unavailable", 500);

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return fail("invalid");
  }

  const buyerType = body.buyerType === "business" || body.buyerType === "consumer" ? body.buyerType : null;
  const country = typeof body.country === "string" ? body.country.toUpperCase() : "";
  const name = (body.name ?? "").trim().slice(0, 120);
  const vatNumberRaw = (body.vatNumber ?? "").trim();
  const bidId = body.bidId;

  if (!bidId || !buyerType || country.length !== 2 || !name) return fail("invalid");

  // A consumer who has not ticked the box has not asked for the day to start at
  // 00:00. Unlike a square's box this one is a real waiver, because a banner day
  // can be fully performed (tickets 03 and 07). A business has no right of
  // withdrawal to say anything about.
  const withdrawalWaived = buyerType === "consumer" ? body.withdrawalWaived === true : false;
  if (buyerType === "consumer" && !withdrawalWaived) return fail("invalid");

  const convex = new ConvexHttpClient(convexUrl);
  const bid = await convex.query(api.auction.forBid, { bidId: bidId as Id<"bids"> });
  if (!bid || !bid.live) return fail("expired");

  const stripe = new Stripe(stripeKey);

  // Pressing bid twice must not take a second hold on the same card. The row
  // already remembers the first session, so the second press is sent back to it.
  if (bid.stripeSessionId) {
    const existing = await stripe.checkout.sessions.retrieve(bid.stripeSessionId);
    if (existing.status === "open" && existing.url) {
      return Response.json({ ok: true, url: existing.url } satisfies Answer);
    }
    return fail("expired");
  }

  // Synchronously, and before anything is created. A number that fails here
  // never reaches Stripe, and a number that passes carries its consultation
  // reference into the order the close will write.
  let viesRequestIdentifier: string | undefined;
  let viesValid: boolean | null = null;
  let viesUnavailable = false;
  if (wantsVatNumber(buyerType, country) && vatNumberRaw) {
    const result = await checkVatNumber(country, vatNumberRaw);
    if (result.state === "invalid") return fail("vies-invalid");
    if (result.state === "valid") {
      viesValid = true;
      viesRequestIdentifier = result.requestIdentifier;
    } else {
      viesUnavailable = true;
    }
  }

  const totalCents = bid.amountCents;
  const vat = vatFor({ buyerType, country, viesValid, totalCents });
  const dollars = Math.round(totalCents / 100).toLocaleString("en-US");

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "";

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        submit_type: "pay",
        // ⚠️ No `payment_method_types`. The account runs Managed Payments, and
        // under it Stripe chooses the methods and refuses the parameter. A
        // manual-capture session only ever shows methods that can hold, so iDEAL
        // stays out without being named (ticket 07 still holds).
        payment_intent_data: {
          // The whole of ticket 07 in one field.
          capture_method: "manual",
          description: `Bid on the 200squares.com banner for ${bid.date}`,
        },
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: totalCents,
              // ⚠️ Inclusive, and irreversible. A bid is a number the bidder
              // types themselves, and two bids of $250 must mean the same thing
              // whoever placed them (ticket 07, ADR 0002).
              tax_behavior: "inclusive",
              product_data: {
                // Managed Payments calculates tax from this. Electronically
                // supplied services, general.
                tax_code: "txcd_10000000",
                name: `The 200squares.com banner on ${bid.date}`,
                description: `A bid of $${dollars}. Held, not charged, until the auction closes at 00:00 UTC.`,
              },
            },
          },
        ],
        billing_address_collection: "required",
        phone_number_collection: { enabled: false },
        success_url: `${origin}/bid?session_id={CHECKOUT_SESSION_ID}`,
        // Nothing was reserved, so backing out leaves nothing behind. The board
        // is where they came from and the auction is still running on it.
        cancel_url: `${origin}/`,
        metadata: {
          // ⚠️ The webhook branches on this. A bid's session comes back
          // `payment_status: unpaid` and would otherwise be thrown away by the
          // test the squares path uses.
          kind: "bid",
          bidId,
          date: bid.date,
          buyerType,
          country,
          name,
          vatNumber: vatNumberRaw ? normaliseVatNumber(country, vatNumberRaw) : "",
          viesRequestIdentifier: viesRequestIdentifier ?? "",
          withdrawalWaived: String(withdrawalWaived),
          // The words themselves, not a version of them (ticket 06).
          withdrawalText: withdrawalWaived ? BANNER_WITHDRAWAL_TEXT : "",
          invoiceText: INVOICE_TEXT,
          vatCase: vat.vatCase,
          vatRateBps: String(vat.vatRateBps),
          ip,
        },
      },
      // One bid, one session, for the bid's whole life.
      { idempotencyKey: bidId },
    );
  } catch (error) {
    console.error("stripe.checkout.sessions.create failed (%s)", "bid", error);
    // The row must not outlive the failure, or the same caller is refused a
    // retry for the whole reservation window (openBid's one-pending-per-caller).
    await convex.mutation(api.auction.abandon, { bidId: bidId as Id<"bids"> }).catch(() => undefined);
    return fail("conflict", 409);
  }

  // Written before the bidder is sent anywhere, so a second press finds it.
  const attached = await convex.mutation(api.auction.attachSession, {
    bidId: bidId as Id<"bids">,
    stripeSessionId: session.id,
  });
  if (attached && attached !== session.id) {
    const winner = await stripe.checkout.sessions.retrieve(attached);
    if (winner.status === "open" && winner.url) {
      return Response.json({ ok: true, url: winner.url } satisfies Answer);
    }
    return fail("expired");
  }

  if (!session.url) return fail("unavailable", 502);
  return Response.json({ ok: true, url: session.url, viesUnavailable } satisfies Answer);
}
