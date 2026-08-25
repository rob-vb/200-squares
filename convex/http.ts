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

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
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
async function settle(ctx: Parameters<Parameters<typeof httpAction>[0]>[0], session: Stripe.Checkout.Session) {
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
    await stripe().refunds.create({
      payment_intent: result.paymentIntentId,
      reason: "requested_by_customer",
    });
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

http.route({ path: "/checkout/reserve", method: "POST", handler: reserve });
http.route({ path: "/checkout/reserve", method: "OPTIONS", handler: preflight });
http.route({ path: "/stripe/webhook", method: "POST", handler: webhook });
http.route({ path: "/stripe/reconcile", method: "POST", handler: reconcile });
http.route({ path: "/stripe/reconcile", method: "OPTIONS", handler: preflight });

export default http;
