// Placing the order. This is the moment the contract is concluded.
//
// ⚠️ Charting said "checkout is Stripe's hosted page". Ticket 03 and ticket 06
// took half of that back: under *Fuhrmann-2* only the words on the button that
// concludes the contract count, and Stripe's says "Buy". So the order button
// lives in the panel, on 200squares.com, and says *Order now — obliges you to
// pay*. It presses this route, and Stripe is demoted to executing a payment for
// an order that already exists.
//
// Three things have to happen here and in this order: the VAT number is checked
// against VIES **synchronously**, because Stripe checks validity too late; the
// VAT is worked out by the site, because Stripe Tax is off (ADR 0002); and the
// Checkout Session is created with the reservation id as its idempotency key, so
// one reservation has exactly one session for its whole life.

import { ConvexHttpClient } from "convex/browser";
import Stripe from "stripe";
import { api } from "@convex/api";
import type { Id } from "@convex/dataModel";
import { INVOICE_TEXT, WITHDRAWAL_TEXT } from "@/lib/checkout/consent";
import { vatFor, wantsVatNumber, type BuyerType } from "@/lib/checkout/vat";
import { checkVatNumber, normaliseVatNumber } from "@/lib/checkout/vies";
import { PRICE_PER_SQUARE_CENTS, cellCount, priceCentsOf, squareRange } from "@/lib/board/geometry";

type Body = {
  reservationId?: string;
  buyerType?: BuyerType;
  country?: string;
  name?: string;
  vatNumber?: string;
  withdrawalWaived?: boolean;
};

/**
 * What the panel is told back.
 *
 * `vies-invalid` is the one the panel draws at the field, beside ticket 06's one
 * button: *Continue as a private person*. Everything else is a sentence.
 */
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
  const reservationId = body.reservationId;

  if (!reservationId || !buyerType || country.length !== 2 || !name) return fail("invalid");

  // A consumer who has not ticked the box has not asked for an immediate start,
  // and ticket 03 is clear that the information beside it is the load-bearing
  // part. A business has no right of withdrawal to say anything about.
  const withdrawalWaived = buyerType === "consumer" ? body.withdrawalWaived === true : false;
  if (buyerType === "consumer" && !withdrawalWaived) return fail("invalid");

  const convex = new ConvexHttpClient(convexUrl);
  const reservation = await convex.query(api.reservations.forCheckout, {
    reservationId: reservationId as Id<"reservations">,
  });
  if (!reservation || !reservation.live) return fail("expired");

  const stripe = new Stripe(stripeKey);

  // Pressing order twice must not make a second session. The reservation already
  // remembers the first one, so the second press is sent back to the same page.
  if (reservation.stripeSessionId) {
    const existing = await stripe.checkout.sessions.retrieve(reservation.stripeSessionId);
    if (existing.status === "open" && existing.url) {
      return Response.json({ ok: true, url: existing.url } satisfies Answer);
    }
    return fail("expired");
  }

  // ⚠️ Synchronously, and before anything is created. A number that fails here
  // never reaches Stripe, and a number that passes carries its consultation
  // reference into the order.
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
      // Never block an order on a service the site does not run. VAT is charged
      // and the panel says so in one line (ticket 06).
      viesUnavailable = true;
    }
  }

  const rect = reservation.rect;
  const squares = cellCount(rect);
  const totalCents = priceCentsOf(rect);
  const vat = vatFor({ buyerType, country, viesValid, totalCents });

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
        // Stripe's own label is the whole reason the order button moved onto the
        // site. *Pay* is at least the truth about what this page does.
        submit_type: "pay",
        line_items: [
          {
            quantity: squares,
            price_data: {
              currency: "usd",
              unit_amount: PRICE_PER_SQUARE_CENTS,
              // ⚠️ Irreversible, and the whole of ADR 0002. Stripe's "Automatic"
              // resolves to *exclusive* for USD, which would turn $250 into
              // $302.50 at the last screen.
              tax_behavior: "inclusive",
              product_data: {
                name: squares === 1 ? "One square on 200squares.com" : `${squares} squares on 200squares.com`,
                description: `Square ${squareRange(rect)}`,
              },
            },
          },
        ],
        // The site computes VAT itself and freezes it into the order.
        automatic_tax: { enabled: false },
        billing_address_collection: "required",
        phone_number_collection: { enabled: false },
        success_url: `${origin}/thanks?session_id={CHECKOUT_SESSION_ID}`,
        // ⚠️ Stripe's back link. The page it lands on gives the squares back at
        // once, rather than leaving them frozen for the rest of the quarter hour.
        cancel_url: `${origin}/checkout/cancelled`,
        metadata: {
          reservationId,
          rect: `${rect.r},${rect.c},${rect.w},${rect.h}`,
          buyerType,
          country,
          name,
          vatNumber: vatNumberRaw ? normaliseVatNumber(country, vatNumberRaw) : "",
          viesRequestIdentifier: viesRequestIdentifier ?? "",
          withdrawalWaived: String(withdrawalWaived),
          // The words themselves, not a version of them (ticket 06).
          withdrawalText: withdrawalWaived ? WITHDRAWAL_TEXT : "",
          invoiceText: INVOICE_TEXT,
          vatCase: vat.vatCase,
          vatRateBps: String(vat.vatRateBps),
          ip,
        },
      },
      // One reservation, one session, for the reservation's whole life.
      { idempotencyKey: reservationId },
    );
  } catch {
    return fail("conflict", 409);
  }

  // Written before the buyer is sent anywhere, so a second press finds it.
  const attached = await convex.mutation(api.reservations.attachSession, {
    reservationId: reservationId as Id<"reservations">,
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
