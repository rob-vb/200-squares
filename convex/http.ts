// The public edge of the backend: the two things a browser posts to, and the two
// things Stripe does.
//
// ⚠️ **The Stripe webhook goes to Convex, not to Vercel** (ticket 14). The
// address is stable and public, Deployment Protection never sees it, it costs no
// Vercel invocation — which is ticket 02's bill rule — and it writes where the
// source of truth is, with no hop in between.
//
// ⚠️ **Reserving goes to Convex too, and for a different reason.** It is the one
// endpoint an attacker would flood, and Convex Free refuses work instead of
// billing for it. It also has to see two things a Convex mutation cannot: the
// caller's IP, and a Turnstile answer that has to be checked over the network.
// So the mutation stays internal and this is the only door to it.
//
// ⚠️ **Opening a bid goes to Convex for the reservation's reason** (ticket 19).
// A bid has no reserve step in front of it, so `/auction/bid` would otherwise be
// the site's most floodable Vercel route — and on Hobby a flood of invocations
// pauses production, which is ticket 02's own failure. It needs the same two
// things reserving does: the caller's address, and a Turnstile answer checked
// over the network. Everything after it — VIES, the VAT case, the Checkout
// Session — happens on `/api/bid`, behind a bid id, exactly as ticket 16 put the
// order behind a reservation id.
//
// ⚠️ **Better Auth serves from here as well** (ticket 18). Its routes sit under
// `/api/auth/`, and the browser never calls them at this address: it calls
// 200squares.com, and the Next.js handler forwards to here. That is what keeps
// the session cookie first-party and is why ticket 08 refused the `crossDomain`
// plugin.

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { authComponent, createAuth } from "./auth";
import { internal } from "./_generated/api";
import { rectIsSellable, type Rect } from "./lib/board";
import Stripe from "stripe";

const stripe = () =>
  new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
    // Convex runs on V8 and not on Node, so the SDK is given the platform's own
    // fetch instead of Node's http module.
    httpClient: Stripe.createFetchHttpClient(),
  });

// ---------------------------------------------------------------------------
// CORS. The board is served from Vercel and posts to `.convex.site`, so every
// browser call here is cross-origin. Stripe's own posts are not and need none.

const allowedOrigin = (request: Request): string | null => {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  if (origin === process.env.SITE_URL) return origin;
  // Every preview and the staging branch live on Vercel's own domain, and
  // ticket 14 chose the branch URL over a custom one. Nothing here is a
  // capability: the endpoints below are guarded by Turnstile and by ids.
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin)) return origin;
  return null;
};

const cors = (request: Request): Record<string, string> => {
  const origin = allowedOrigin(request);
  if (!origin) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
};

const json = (request: Request, body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...cors(request) },
  });

const preflight = httpAction(async (_ctx, request) => new Response(null, { status: 204, headers: cors(request) }));

// ---------------------------------------------------------------------------
// Who the visitor is, for fifteen minutes and no longer.

/**
 * The caller's address, as the proxy in front of Convex reports it.
 *
 * ⚠️ Where there is none, the Turnstile token stands in. That is honest about
 * what it buys: the per-IP limit becomes a per-token limit, which is weaker, but
 * the alternative — one shared bucket for everybody — would let a single visitor
 * lock the whole site out of buying.
 */
const callerKey = (request: Request, token: string) => {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip");
  return ip ? `ip:${ip}` : `token:${token}`;
};

/**
 * A salted hash, never the address itself, and only ever compared for equality.
 *
 * The salt is its own variable where one is set, and the deployment's Better
 * Auth secret where it is not — domain-separated either way, so the two uses
 * cannot produce the same digest. A deployment with neither is misconfigured and
 * says so rather than hashing against a constant that is in the repository.
 */
async function hashCaller(key: string): Promise<string> {
  const salt = process.env.RESERVATION_IP_SALT ?? process.env.BETTER_AUTH_SECRET;
  if (!salt) throw new Error("Neither RESERVATION_IP_SALT nor BETTER_AUTH_SECRET is set.");
  const bytes = new TextEncoder().encode(`200squares/reservation-ip/${salt}/${key}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .slice(0, 16)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Turnstile, invisible, one token spent per reservation (ticket 06). */
async function turnstileOk(token: string, request: Request): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  // A deployment with no secret cannot check anybody, and quietly letting every
  // reservation through is the failure ticket 06 built this control against.
  if (!secret) throw new Error("TURNSTILE_SECRET_KEY is not set.");
  if (!token) return false;

  const form = new URLSearchParams({ secret, response: token });
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) form.set("remoteip", forwarded);

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
  });
  if (!res.ok) return false;
  const body = (await res.json()) as { success?: boolean };
  return body.success === true;
}

// ---------------------------------------------------------------------------
// Reserve.

const reserve = httpAction(async (ctx, request) => {
  let body: { rect?: Rect; token?: string };
  try {
    body = await request.json();
  } catch {
    return json(request, { ok: false, reason: "bad-request" }, 400);
  }

  const rect = body.rect;
  if (!rect || !rectIsSellable(rect)) {
    return json(request, { ok: false, reason: "bad-request" }, 400);
  }

  const token = typeof body.token === "string" ? body.token : "";
  if (!(await turnstileOk(token, request))) {
    return json(request, { ok: false, reason: "turnstile" }, 403);
  }

  const ipHash = await hashCaller(callerKey(request, token));
  const result = await ctx.runMutation(internal.reservations.reserve, { rect, ipHash });
  return json(request, result);
});

// ---------------------------------------------------------------------------
// Open a bid.

/**
 * The bid's reservation: judge the amount and the caller, write a `pending` row,
 * and hand back its id. No money, no card, no Stripe.
 *
 * ⚠️ The minimum is **not** checked here. It is checked inside the mutation,
 * where Convex's serialisable reads make two bidders at the same number
 * impossible; a check in this action would be a check two requests walk past
 * together. This action only carries the two things the mutation cannot see.
 */
const openBid = httpAction(async (ctx, request) => {
  let body: { amountCents?: number; token?: string };
  try {
    body = await request.json();
  } catch {
    return json(request, { ok: false, reason: "bad-request" }, 400);
  }

  const amountCents = Number(body.amountCents);
  if (!Number.isSafeInteger(amountCents) || amountCents <= 0) {
    return json(request, { ok: false, reason: "bad-request" }, 400);
  }

  const token = typeof body.token === "string" ? body.token : "";
  if (!(await turnstileOk(token, request))) {
    return json(request, { ok: false, reason: "turnstile" }, 403);
  }

  const ipHash = await hashCaller(callerKey(request, token));
  const result = await ctx.runMutation(internal.auction.openBid, { amountCents, ipHash });
  return json(request, result);
});

// ---------------------------------------------------------------------------
// Stripe.

/** Pull the buyer's own declarations back out of the session they travelled in. */
function declaredFrom(metadata: Record<string, string> | null) {
  const m = metadata ?? {};
  const [r, c, w, h] = (m.rect ?? "").split(",").map(Number);
  return {
    reservationId: m.reservationId ?? "",
    rect: { r, c, w, h },
    buyerType: m.buyerType === "business" ? ("business" as const) : ("consumer" as const),
    country: m.country ?? "",
    name: m.name ?? "",
    vatNumber: m.vatNumber || undefined,
    viesRequestIdentifier: m.viesRequestIdentifier || undefined,
    withdrawalWaived: m.withdrawalWaived === "true",
    withdrawalText: m.withdrawalText ?? "",
    invoiceText: m.invoiceText ?? "",
    vatCase:
      m.vatCase === "reverse"
        ? ("reverse" as const)
        : m.vatCase === "none"
          ? ("none" as const)
          : ("nl21" as const),
    vatRateBps: Number(m.vatRateBps ?? 0),
    ip: m.ip ?? "",
  };
}

const idOf = (value: unknown): string =>
  typeof value === "string" ? value : ((value as { id?: string } | null)?.id ?? "");

/**
 * Everything a paid session has to cause, in one place.
 *
 * Both roads lead here: the webhook, and the return page's ten-second question
 * to Stripe. They write through the same keyed mutation, so whichever arrives
 * second finds the work done and does nothing.
 */
/**
 * A bid's session, which is the one that comes back **paid-but-uncaptured**.
 *
 * ⚠️ `payment_status` is `unpaid` here and stays that way until the close. A bid
 * is a card authorization with `capture_method: manual`, so the money is frozen
 * and not taken, and the test the squares path uses would throw every bid away.
 * What is read instead is the PaymentIntent's own state.
 */
async function settleBid(
  ctx: Parameters<Parameters<typeof httpAction>[0]>[0],
  session: Stripe.Checkout.Session,
) {
  if (session.status !== "complete") return { status: "open" as const };
  const paymentIntentId = idOf(session.payment_intent);
  if (!paymentIntentId) return { status: "open" as const };

  const api = stripe();
  const intent = await api.paymentIntents.retrieve(paymentIntentId, {
    // ⚠️ `capture_before` lives on the **charge**, not on the PaymentIntent, and
    // it is the authoritative per-payment value ticket 03 named. Expanding it
    // here is what makes the check possible at all.
    expand: ["latest_charge"],
  });
  if (intent.status !== "requires_capture" && intent.status !== "succeeded") {
    return { status: "open" as const };
  }

  const charge = intent.latest_charge as Stripe.Charge | null;
  const seconds = charge?.payment_method_details?.card?.capture_before;
  // ⚠️ Where the card tells us nothing, ticket 03's seven days stands in. A bid
  // lives under 24 hours, so the fallback is the same answer in practice — and
  // refusing every card that does not publish the field would refuse the bid for
  // a fact nobody has.
  const captureBefore = seconds ? seconds * 1000 : Date.now() + 7 * 24 * 60 * 60 * 1000;

  const result = await ctx.runMutation(internal.auction.land, {
    bidId: session.metadata?.bidId ?? "",
    stripeSessionId: session.id,
    paymentIntentId,
    amountCents: session.amount_total ?? 0,
    captureBefore,
    email: session.customer_details?.email ?? "",
  });

  // ⚠️ A refused bid gives the hold straight back. There is nothing to keep: the
  // bidder is on the return page reading why, and a frozen amount on a card that
  // can win nothing is the worst of both.
  //
  // `cancel` carries the same idea one step further: a bidder who raised their
  // own bid has an older hold on the same card, and it can never be collected
  // ahead of the new one. Other bidders' holds are untouched — that is the
  // ladder, and it is the whole of ticket 07.
  const dead =
    result.status === "late" || result.status === "closed"
      ? [paymentIntentId, ...result.cancel]
      : result.cancel;
  for (const id of dead) {
    try {
      await api.paymentIntents.cancel(id);
    } catch {
      // Already cancelled is the expected answer on a retry, and it is the
      // outcome we wanted. The row is marked either way.
    }
  }
  return result;
}

async function settle(ctx: Parameters<Parameters<typeof httpAction>[0]>[0], session: Stripe.Checkout.Session) {
  if (session.metadata?.kind === "bid") return await settleBid(ctx, session);
  if (session.payment_status !== "paid") return { status: "unpaid" as const };

  const address = session.customer_details?.address;
  const line = [
    address?.line1,
    address?.line2,
    address?.postal_code,
    address?.city,
    address?.state,
    address?.country,
  ]
    .filter(Boolean)
    .join(", ");

  const result = await ctx.runMutation(internal.checkout.fulfil, {
    stripeSessionId: session.id,
    paymentIntentId: idOf(session.payment_intent),
    amountTotalCents: session.amount_total ?? 0,
    email: session.customer_details?.email ?? "",
    address: line,
    stripeCountry: address?.country ?? "",
    declared: declaredFrom(session.metadata),
  });

  // ⚠️ The squares had gone. Ticket 05: refund in full, automatically, and never
  // make the buyer ask. The mail that says so is
  // [ticket 22](../.scratch/200squares-v1/issues/22-build-email.md)'s.
  if (result.status === "refunded" && result.paymentIntentId) {
    try {
      await stripe().refunds.create({
        payment_intent: result.paymentIntentId,
        reason: "requested_by_customer",
      });
    } catch (error) {
      // Already refunded is the expected answer on a retry, and it is a success:
      // the money is back. Anything else is thrown on, so the endpoint answers
      // non-2xx and Stripe tries again.
      const code = (error as { code?: string })?.code;
      if (code !== "charge_already_refunded") throw error;
    }
  }
  return result;
}

const webhook = httpAction(async (ctx, request) => {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) return new Response("Not signed.", { status: 400 });

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    // ⚠️ The async form with Web Crypto. The synchronous one reaches for Node's
    // crypto module, which does not exist here.
    event = await stripe().webhooks.constructEventAsync(
      payload,
      signature,
      secret,
      undefined,
      Stripe.createSubtleCryptoProvider(),
    );
  } catch {
    return new Response("Bad signature.", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    await settle(ctx, event.data.object as Stripe.Checkout.Session);
  }
  // Every other event is acknowledged and ignored. Stripe retries a non-2xx, so
  // an unhandled type must not look like a failure.
  return new Response(null, { status: 200 });
});

/**
 * The ten-second fallback, and the reason nobody ever waits on a lost webhook.
 *
 * The return page asks this when its subscription has shown nothing for ten
 * seconds. It is safe to call from anywhere: the session id is the only key it
 * takes, the answer comes from Stripe rather than from the caller, and an unpaid
 * session does nothing at all.
 */
const reconcile = httpAction(async (ctx, request) => {
  let body: { stripeSessionId?: string };
  try {
    body = await request.json();
  } catch {
    return json(request, { ok: false }, 400);
  }
  const id = body.stripeSessionId;
  if (!id || !id.startsWith("cs_")) return json(request, { ok: false }, 400);

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe().checkout.sessions.retrieve(id);
  } catch {
    return json(request, { ok: false }, 404);
  }
  const result = await settle(ctx, session);
  return json(request, { ok: true, status: result.status });
});

// ---------------------------------------------------------------------------

const http = httpRouter();

// `/api/auth/*`, GET and POST. Registered first so nothing below can shadow it.
authComponent.registerRoutes(http, createAuth);

http.route({ path: "/checkout/reserve", method: "POST", handler: reserve });
http.route({ path: "/checkout/reserve", method: "OPTIONS", handler: preflight });
http.route({ path: "/auction/bid", method: "POST", handler: openBid });
http.route({ path: "/auction/bid", method: "OPTIONS", handler: preflight });
http.route({ path: "/stripe/webhook", method: "POST", handler: webhook });
http.route({ path: "/stripe/reconcile", method: "POST", handler: reconcile });
http.route({ path: "/stripe/reconcile", method: "OPTIONS", handler: preflight });

export default http;
