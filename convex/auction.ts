// The auction: reading it, placing a hold on it, and closing it.
//
// The auction day is a **UTC date string**, never an offset. Bidding right now
// is bidding for tomorrow: today's banner was won at the 00:00 UTC that started
// today, which is what makes it today's.
//
// ⚠️ No row in `bannerDays` for a day means **nobody won it**, which is the house
// ad. That is the same reading the prototype had and it survives unchanged.
//
// ⚠️ **Nothing is released until somebody has paid** (ticket 07). One rule
// answers the declined capture, the runner-up and the hostage attack together:
// at 00:00 the site captures the top bid **first**, and cancels every other hold
// only after that capture has succeeded. On failure it walks down to the next
// bid that can be collected, for that bidder's own amount.
//
// ⚠️ That is why an outbid hold **stays on the card until the close**. Ticket 07
// carried a second line saying an outbid hold is cancelled at once, inherited
// from charting; the two cannot both be true, because a runner-up with no hold
// cannot be promoted. The dev chose the rule over the courtesy (2026-08-25), and
// the outbid mail says the hold stays and why.
//
// A bid is opened in two steps, the same two a purchase has:
//
//   `openBid`  — internal, reached only through the Turnstile door in
//                `convex/http.ts`. Judges the amount and the caller, and writes a
//                `pending` row. It is the bid's reservation.
//   `land`     — the webhook. The Checkout Session came back paid-but-uncaptured,
//                so the row becomes `held`, an owner appears from the address
//                Stripe supplied, and the hold is real money.

import { v, ConvexError } from "convex/values";
import Stripe from "stripe";
import { internal } from "./_generated/api";
import {
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
  type ActionCtx,
  type QueryCtx,
} from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { artwork } from "./schema";
import { currentOwner, normalise } from "./auth";
import { midnightOf, nextDate, nextMidnightUtc, todayUtc, RESERVATION_MS } from "./lib/time";
import { vatInsideCents } from "./lib/vat";
import { mintToken } from "./lib/token";
import { withdrawUrl } from "./lib/withdrawal";
import { declinedMail, outbidMail, sendMail, wonMail } from "./lib/mail";

/** The floor bid, and the step over the top bid. Both in cents. */
export const BID_FLOOR_CENTS = 100_00;
export const BID_STEP_CENTS = 10_00;

/**
 * ⚠️ Bidding still opens at $100 with a $10 raise, and the square going to $250
 * moves neither number. A banner is one day; a square is forever.
 */
export const minNextCents = (topCents: number | null) =>
  topCents === null ? BID_FLOOR_CENTS : topCents + BID_STEP_CENTS;

const bidShape = v.object({
  id: v.string(),
  ownerId: v.string(),
  ownerName: v.string(),
  amountCents: v.number(),
  /** Absolute UTC ms. The client renders "how long ago" from its own clock. */
  placedAt: v.number(),
});

/** Every live hold on a day, `pending` rows excluded: they are not money yet. */
async function heldBids(ctx: QueryCtx, date: string): Promise<Doc<"bids">[]> {
  const rows = await ctx.db
    .query("bids")
    .withIndex("by_date", (q) => q.eq("date", date))
    .collect();
  return rows.filter((r) => r.status === "held");
}

/**
 * The bid that would take the banner if the close were now.
 *
 * ⚠️ Ties break on **who was first**. Two equal bids should be impossible under
 * a $10 minimum raise, and are not: two bidders can be on Stripe at the same
 * moment, and both land against the same top. The earlier hold wins, which is
 * the only tie-break that does not reward being slow.
 */
function ladder(bids: Doc<"bids">[]): Doc<"bids">[] {
  return [...bids].sort((a, b) =>
    b.amountCents !== a.amountCents ? b.amountCents - a.amountCents : a.placedAt - b.placedAt,
  );
}

// ---------------------------------------------------------------------------
// Reading.

/**
 * The auction running right now: every live hold on tomorrow's banner.
 *
 * ⚠️ An outbid bid **is** in it, and that is ticket 07's rule showing through.
 * The list is the ladder: if the top bid cannot be collected at 00:00 the banner
 * goes to the next one that can, so every row here is a bid that could still
 * win. A `pending` row is not, and never appears.
 */
export const live = query({
  args: {},
  returns: v.object({
    date: v.string(),
    /** The 00:00 UTC this auction closes at. Absolute ms. */
    closesAt: v.number(),
    bids: v.array(bidShape),
    topCents: v.union(v.number(), v.null()),
    minNextCents: v.number(),
  }),
  handler: async (ctx) => {
    const now = Date.now();
    const date = nextDate(todayUtc(now));
    const held = await heldBids(ctx, date);

    const owners = new Map<string, string>();
    for (const bid of held) {
      if (!bid.ownerId || owners.has(bid.ownerId)) continue;
      owners.set(bid.ownerId, (await ctx.db.get(bid.ownerId))?.name ?? "");
    }

    const bids = held
      .map((r) => ({
        id: r._id as string,
        ownerId: (r.ownerId ?? "") as string,
        ownerName: r.ownerId ? (owners.get(r.ownerId) ?? "") : "",
        amountCents: r.amountCents,
        placedAt: r.placedAt,
      }))
      .sort((a, b) => b.placedAt - a.placedAt);

    const topCents = held.reduce<number | null>(
      (top, r) => (top === null || r.amountCents > top ? r.amountCents : top),
      null,
    );

    return {
      date,
      closesAt: nextMidnightUtc(now),
      bids,
      topCents,
      minNextCents: minNextCents(topCents),
    };
  },
});

/**
 * The banner days behind us, newest first. What `/how-it-works` prints as the
 * record, and the only place a past winning bid is public.
 */
export const record = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(
    v.object({
      date: v.string(),
      ownerName: v.string(),
      url: v.string(),
      artwork: v.union(artwork, v.null()),
      wonWithCents: v.union(v.number(), v.null()),
      clicks: v.number(),
    }),
  ),
  handler: async (ctx, { limit }) => {
    const today = todayUtc(Date.now());
    const rows = (await ctx.db.query("bannerDays").collect())
      .filter((d) => d.date <= today && d.ownerId)
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, limit ?? 14);

    const out = [];
    for (const day of rows) {
      const owner = day.ownerId ? await ctx.db.get(day.ownerId) : null;
      const counter = await ctx.db
        .query("clickCounts")
        .withIndex("by_target", (q) => q.eq("target", { kind: "banner", date: day.date }))
        .unique();
      out.push({
        date: day.date,
        ownerName: owner?.name ?? "",
        url: day.url ?? "",
        artwork: day.artwork,
        wonWithCents: day.wonWithCents ?? null,
        clicks: counter?.count ?? 0,
      });
    }
    return out;
  },
});

// ---------------------------------------------------------------------------
// Opening a bid. The first of the two steps, and the flood-prone one.

/**
 * Judge the amount and the caller, and write the row Stripe will be asked about.
 *
 * ⚠️ **Internal.** It is reached only through `convex/http.ts`, which is the one
 * place that can see the caller's address and spend a Turnstile token — exactly
 * the arrangement `reservations.reserve` has, and for exactly ticket 02's
 * reason: the door an attacker would flood belongs on Convex, where a flood
 * breaks the site instead of pausing the Vercel deployment.
 *
 * ⚠️ The minimum is checked **here**, inside the mutation, and not in the route
 * around it. Convex runs mutations serialisably against what they read, so two
 * bidders opening at the same number cannot both pass; a check in the HTTP
 * action would be a check two requests walk past together.
 *
 * A bid below top + $10 is **refused, not queued** (ticket 07).
 */
export const openBid = internalMutation({
  args: { amountCents: v.number(), ipHash: v.string() },
  returns: v.union(
    v.object({
      ok: v.literal(true),
      bidId: v.id("bids"),
      date: v.string(),
      expiresAt: v.number(),
    }),
    v.object({
      ok: v.literal(false),
      reason: v.union(v.literal("low"), v.literal("amount"), v.literal("pending")),
      minNextCents: v.number(),
    }),
  ),
  handler: async (ctx, { amountCents, ipHash }) => {
    const now = Date.now();
    const date = nextDate(todayUtc(now));
    const held = await heldBids(ctx, date);
    const topCents = held.reduce<number | null>(
      (top, r) => (top === null || r.amountCents > top ? r.amountCents : top),
      null,
    );
    const floor = minNextCents(topCents);

    // Whole dollars only. The panel's field takes digits and the auction is
    // spoken in dollars everywhere on the site; a bid of $150.37 would be a
    // number nobody could raise over by "ten".
    if (!Number.isSafeInteger(amountCents) || amountCents % 100 !== 0 || amountCents <= 0) {
      return { ok: false as const, reason: "amount" as const, minNextCents: floor };
    }
    if (amountCents < floor) {
      return { ok: false as const, reason: "low" as const, minNextCents: floor };
    }

    // One pending bid per caller. A `pending` row costs no money and holds
    // nothing, but it does buy a Stripe session, and opening them in a loop is
    // the cheapest thing an attacker could do with this endpoint.
    const pending = (
      await ctx.db
        .query("bids")
        .withIndex("by_date", (q) => q.eq("date", date))
        .collect()
    ).filter((r) => r.status === "pending" && (r.pendingUntil ?? 0) > now);
    if (pending.some((r) => r.ipHash === ipHash)) {
      return { ok: false as const, reason: "pending" as const, minNextCents: floor };
    }

    const expiresAt = now + RESERVATION_MS;
    const bidId = await ctx.db.insert("bids", {
      date,
      amountCents,
      status: "pending",
      pendingUntil: expiresAt,
      ipHash,
      placedAt: now,
    });
    return { ok: true as const, bidId, date, expiresAt };
  },
});

/**
 * What the bid route needs before it asks Stripe for anything.
 *
 * Deliberately thin, like `reservations.forCheckout`: the amount to authorise,
 * whether the row is still open, and the session it may already have. Nothing
 * about the bidder, because a pending bid knows nothing about the bidder.
 */
export const forBid = query({
  args: { bidId: v.id("bids") },
  returns: v.union(
    v.null(),
    v.object({
      date: v.string(),
      amountCents: v.number(),
      live: v.boolean(),
      /** The 00:00 UTC this bid is for. The hold has to outlive it. */
      closesAt: v.number(),
      stripeSessionId: v.union(v.string(), v.null()),
    }),
  ),
  handler: async (ctx, { bidId }) => {
    const row = await ctx.db.get(bidId);
    if (!row) return null;
    return {
      date: row.date,
      amountCents: row.amountCents,
      live: row.status === "pending" && (row.pendingUntil ?? 0) > Date.now(),
      closesAt: midnightOf(row.date),
      stripeSessionId: row.stripeSessionId ?? null,
    };
  },
});

/**
 * Remember which Stripe session this bid became.
 *
 * Writes once and then refuses, so pressing the bid button twice is sent to the
 * same Stripe page rather than taking a second hold on the same card.
 */
export const attachSession = mutation({
  args: { bidId: v.id("bids"), stripeSessionId: v.string() },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, { bidId, stripeSessionId }) => {
    const row = await ctx.db.get(bidId);
    if (!row) return null;
    if (row.stripeSessionId) return row.stripeSessionId;
    await ctx.db.patch(bidId, { stripeSessionId });
    return stripeSessionId;
  },
});

/**
 * Give a pending row back when Stripe refuses the session. Without this the row
 * sits `pending` for the full reservation window with no session behind it, and
 * `openBid` refuses the same caller a second bid for a quarter of an hour over a
 * hold that was never placed. Only a session-less pending row can be abandoned;
 * one with a session belongs to Stripe's timeout.
 */
export const abandon = mutation({
  args: { bidId: v.id("bids") },
  returns: v.null(),
  handler: async (ctx, { bidId }) => {
    const row = await ctx.db.get(bidId);
    if (!row || row.status !== "pending" || row.stripeSessionId) return null;
    await ctx.db.patch(bidId, { pendingUntil: Date.now() });
    return null;
  },
});

// ---------------------------------------------------------------------------
// Landing a bid. The webhook's half.

/**
 * Turn a paid-but-uncaptured Checkout Session into a live hold.
 *
 * Four outcomes, and the caller acts on each:
 *
 *   `already` — this session has already landed. Both the webhook and the
 *               return page's nudge reach here, and the second one does nothing.
 *   `held`    — the money is frozen on a real card and the bid is in the ladder.
 *   `late`    — ⚠️ the hold would die before the coming 00:00 UTC. Ticket 07 asked
 *               for this to be refused *at the keyboard*; a hosted checkout page
 *               only produces the answer afterwards, so the bid is refused here,
 *               the hold is cancelled at once, and the return page tells the
 *               bidder to use another card while they are still looking at it.
 *   `closed`  — the day was decided while they were paying. Nothing to bid on.
 *
 * The caller cancels the PaymentIntent for `late` and for `closed`.
 */
export const land = internalMutation({
  args: {
    bidId: v.string(),
    stripeSessionId: v.string(),
    paymentIntentId: v.string(),
    amountCents: v.number(),
    /** Absolute UTC ms, off the charge. The last moment Stripe will capture. */
    captureBefore: v.number(),
    email: v.string(),
  },
  returns: v.object({
    status: v.union(
      v.literal("already"),
      v.literal("held"),
      v.literal("late"),
      v.literal("closed"),
      v.literal("unknown"),
    ),
    /** PaymentIntents the caller must cancel. See the superseded-hold note. */
    cancel: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    const bidId = ctx.db.normalizeId("bids", args.bidId);
    const bid = bidId ? await ctx.db.get(bidId) : null;
    if (!bid || !bidId) return { status: "unknown" as const, cancel: [] };
    if (bid.status !== "pending") return { status: "already" as const, cancel: [] };

    const now = Date.now();
    const closesAt = midnightOf(bid.date);

    // The day was decided while they were on Stripe. It cannot be bid on any
    // more, whatever the money says.
    const day = await ctx.db
      .query("bannerDays")
      .withIndex("by_date", (q) => q.eq("date", bid.date))
      .unique();
    if (now >= closesAt || day?.closedAt) {
      await ctx.db.patch(bidId, {
        status: "failed",
        failure: "closed",
        paymentIntentId: args.paymentIntentId,
      });
      return { status: "closed" as const, cancel: [] };
    }

    // ⚠️ The hold has to outlive the close, or the promotion ladder is holding a
    // number it can never collect. Ticket 03 found 7 days for a card-not-present
    // authorization and a bid lives under 24 hours, so this is comfortable — and
    // comfortable is not guaranteed, which is why it is read every time.
    if (args.captureBefore <= closesAt) {
      await ctx.db.patch(bidId, {
        status: "failed",
        failure: "late",
        paymentIntentId: args.paymentIntentId,
        captureBefore: args.captureBefore,
      });
      return { status: "late" as const, cancel: [] };
    }

    // ⚠️ An owner exists the moment money is on the line, whether or not an
    // account ever follows (ticket 08). Bidding needs no account and **makes**
    // one: a bid is a relationship over a day — you are outbid, you come back,
    // you win, you upload — and that relationship wants a session.
    const emailNormalised = normalise(args.email);
    const existing = await ctx.db
      .query("owners")
      .withIndex("by_email", (q) => q.eq("emailNormalised", emailNormalised))
      .unique();
    const ownerId =
      existing?._id ??
      (await ctx.db.insert("owners", {
        // Empty on purpose, exactly as a purchase leaves it: this is the public
        // *company* name, and a private person's legal name has no business in a
        // tooltip. It arrives with the first block or the first won day.
        name: "",
        email: args.email,
        emailNormalised,
        strikeAt: [],
        createdAt: now,
      }));

    const others = (await heldBids(ctx, bid.date)).filter((r) => r._id !== bidId);
    const previousTop = ladder(others)[0] ?? null;

    await ctx.db.patch(bidId, {
      status: "held",
      ownerId,
      paymentIntentId: args.paymentIntentId,
      captureBefore: args.captureBefore,
      // ⚠️ Re-stamped. `placedAt` decided the tie-break above, and the moment
      // that matters is when the money was actually frozen, not when the row was
      // opened fifteen minutes earlier.
      placedAt: now,
      pendingUntil: undefined,
      ipHash: undefined,
    });

    // ⚠️ The first bid carries the magic link and nothing else does (ticket 13):
    // there is no bid receipt, because the panel already showed it and a bidder
    // may bid ten times in a day.
    if (!existing) {
      await ctx.scheduler.runAfter(0, internal.auth.sendSignInLink, { email: args.email });
    }

    // ⚠️ **A bidder's own earlier hold is released, and only their own.** Ticket
    // 07 never had to say this, because under the rule it inherited every outbid
    // hold went at once. Under the rule the dev kept, raising your own bid would
    // otherwise freeze the same card twice — and it would buy nothing: a second
    // hold on the same card can never be *the next bid that can be collected*
    // after the first one has failed. Other bidders' holds stay, which is the
    // ladder; yours does not, which is only fair.
    const cancel: string[] = [];
    for (const old of others) {
      if (old.ownerId !== ownerId || !old.paymentIntentId) continue;
      await ctx.db.patch(old._id, { status: "released" });
      cancel.push(old.paymentIntentId);
    }

    // ⚠️ Somebody is outbid by this, and it is not always the other bidder. A bid
    // that lands **under** the standing top was passed while its own bidder was
    // on Stripe, so the mail goes to them — which is the honest answer to the
    // race the two-step opening creates. Nobody is ever mailed about themselves.
    if (previousTop && previousTop.ownerId !== ownerId) {
      if (previousTop.amountCents < args.amountCents) {
        if (previousTop.ownerId) {
          await ctx.scheduler.runAfter(0, internal.auction.mailOutbid, {
            ownerId: previousTop.ownerId,
            yours: previousTop.amountCents,
            top: args.amountCents,
            date: bid.date,
          });
        }
      } else {
        await ctx.scheduler.runAfter(0, internal.auction.mailOutbid, {
          ownerId,
          yours: args.amountCents,
          top: previousTop.amountCents,
          date: bid.date,
        });
      }
    }

    return { status: "held" as const, cancel };
  },
});

/**
 * The outbid mail. Scheduled, never awaited inside a mutation: a mutation cannot
 * reach the network, and a Resend outage must not undo a hold that is already on
 * a card.
 */
export const mailOutbid = internalAction({
  args: { ownerId: v.id("owners"), yours: v.number(), top: v.number(), date: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const owner = await ctx.runQuery(internal.auction.ownerEmail, { ownerId: args.ownerId });
    if (!owner) return null;
    const mail = outbidMail({ yours: args.yours, top: args.top, date: args.date });
    await sendMail({ to: owner, subject: mail.subject, text: mail.text });
    return null;
  },
});

export const ownerEmail = internalQuery({
  args: { ownerId: v.id("owners") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, { ownerId }) => (await ctx.db.get(ownerId))?.email ?? null,
});

/**
 * What the bidder's return page watches.
 *
 * ⚠️ Keyed on the Stripe session id and nothing else, which is the same grant
 * ticket 06 gave the thank-you page: whoever holds it is the person who just
 * placed this bid, because the only place it exists is their own return URL. So
 * it answers with the bid and the ladder around it, and never with an address.
 */
export const bidBySession = query({
  args: { stripeSessionId: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      status: v.union(
        v.literal("pending"),
        v.literal("held"),
        v.literal("captured"),
        v.literal("released"),
        v.literal("failed"),
      ),
      /** Why a `failed` bid failed, in the one word the page branches on. */
      reason: v.union(
        v.literal("late"),
        v.literal("closed"),
        v.literal("declined"),
        v.null(),
      ),
      amountCents: v.number(),
      date: v.string(),
      closesAt: v.number(),
      topCents: v.union(v.number(), v.null()),
      leading: v.boolean(),
      url: v.string(),
    }),
  ),
  handler: async (ctx, { stripeSessionId }) => {
    const bid = await ctx.db
      .query("bids")
      .withIndex("by_session", (q) => q.eq("stripeSessionId", stripeSessionId))
      .unique();
    if (!bid) return null;

    const held = await heldBids(ctx, bid.date);
    const top = ladder(held)[0] ?? null;
    const closesAt = midnightOf(bid.date);
    // A failed bid is one of exactly three things, and the page says different
    // words for each: a card whose hold dies too early, a day already gone, and
    // a hold the bank refused at the close.
    //
    // ⚠️ The row says which, since ticket 41. The derivation below is only for
    // rows written before that field existed, where the third case is not
    // recoverable and reads as `closed` — the wrong words, but only for the
    // handful of closes run while ticket 19's build was being proved.
    const reason =
      bid.status !== "failed"
        ? null
        : (bid.failure ??
          ((bid.captureBefore ?? 0) > 0 && (bid.captureBefore ?? 0) <= closesAt
            ? ("late" as const)
            : ("closed" as const)));

    return {
      status: bid.status,
      reason,
      amountCents: bid.amountCents,
      date: bid.date,
      closesAt,
      topCents: top?.amountCents ?? null,
      leading: Boolean(top && top._id === bid._id),
      url: bid.url ?? "",
    };
  },
});

// ---------------------------------------------------------------------------
// What a standing bid carries.

/**
 * Point a standing bid somewhere, before it has won anything.
 *
 * ⚠️ Ticket 07's answer to the empty hour: the auction closes at 00:00 UTC and
 * the day it decides begins at 00:00 UTC, so the winner gets **no preparation
 * time at all**. A bidder may attach a link and an image at any time while their
 * bid stands, and a prepared bidder gets the whole day. A winner with none gets
 * the house ad in their place until they upload.
 *
 * The image half is [ticket 20](../.scratch/200squares-v1/issues/20-build-artwork.md)'s
 * — it owns `generateUploadUrl` and the two WebP sizes. The field, the link and
 * the copy onto the banner day at the close are here.
 */
export const setBannerContent = mutation({
  args: { bidId: v.id("bids"), url: v.string() },
  returns: v.null(),
  handler: async (ctx, { bidId, url }) => {
    const owner = await currentOwner(ctx);
    if (!owner) throw new ConvexError("Sign in first.");
    const bid = await ctx.db.get(bidId);
    if (!bid || bid.ownerId !== owner._id) throw new ConvexError("That is not your bid.");
    if (bid.status !== "held") throw new ConvexError("That bid is no longer standing.");
    // Bare, no scheme: a stored address is an address and the anchor adds the
    // https, exactly as a block's does.
    const bare = url.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "").slice(0, 200);
    await ctx.db.patch(bidId, { url: bare });
    return null;
  },
});

// ---------------------------------------------------------------------------
// The close.

/**
 * Days whose 00:00 UTC has passed and that nobody has closed yet.
 *
 * ⚠️ Ticket 07 asked for a cron **and** lazy closing on read. Half of that is
 * unbuildable as written: a Convex query may not capture money, and the only
 * other reader is a browser — an unauthenticated endpoint that moves money is a
 * road a flood could walk down, which is the one thing ticket 02 forbids. What
 * the reads *do* do is the honest half of lazy closing, and it needs no code:
 * a day with no `ownerId` shows the house ad, so a late close is visible rather
 * than broken. The catch-up is the cron itself, which runs **hourly** on the
 * hour — so it is both the 00:00 close and its own retry, and a missed run costs
 * an hour of house ad and nothing else.
 */
export const dueDays = internalQuery({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const now = Date.now();
    const bids = await ctx.db.query("bids").collect();
    const dates = new Set<string>();
    for (const bid of bids) {
      if (bid.status !== "held") continue;
      if (midnightOf(bid.date) > now) continue;
      dates.add(bid.date);
    }
    const due: string[] = [];
    for (const date of [...dates].sort()) {
      const day = await ctx.db
        .query("bannerDays")
        .withIndex("by_date", (q) => q.eq("date", date))
        .unique();
      if (!day?.closedAt) due.push(date);
    }
    return due;
  },
});

const candidate = v.object({
  bidId: v.id("bids"),
  paymentIntentId: v.string(),
  amountCents: v.number(),
  stripeSessionId: v.string(),
  /**
   * Who to write to if this bid's capture is refused (ticket 41). Empty where
   * the bid has no owner row behind it, which the seed can produce.
   */
  email: v.string(),
});

/**
 * The ladder for one day, top first, or null if somebody has already closed it.
 *
 * ⚠️ A bid with no Checkout Session behind it is dropped rather than tried.
 * `convex/seed.ts` writes exactly that — seeded bids carry a made-up PaymentIntent
 * id so a full board can be looked at — and a seeded day has to close to the
 * house ad instead of throwing at Stripe.
 */
export const planClose = internalQuery({
  args: { date: v.string() },
  returns: v.union(v.null(), v.array(candidate)),
  handler: async (ctx, { date }) => {
    const day = await ctx.db
      .query("bannerDays")
      .withIndex("by_date", (q) => q.eq("date", date))
      .unique();
    if (day?.closedAt) return null;
    const rungs = ladder(await heldBids(ctx, date)).filter(
      (b) => Boolean(b.paymentIntentId) && Boolean(b.stripeSessionId),
    );
    const out = [];
    for (const b of rungs) {
      const owner = b.ownerId ? await ctx.db.get(b.ownerId) : null;
      out.push({
        bidId: b._id,
        paymentIntentId: b.paymentIntentId!,
        amountCents: b.amountCents,
        stripeSessionId: b.stripeSessionId!,
        email: owner?.email ?? "",
      });
    }
    return out;
  },
});

const declaredBanner = v.object({
  buyerType: v.union(v.literal("business"), v.literal("consumer")),
  country: v.string(),
  name: v.string(),
  vatNumber: v.optional(v.string()),
  viesRequestIdentifier: v.optional(v.string()),
  withdrawalWaived: v.boolean(),
  withdrawalText: v.string(),
  invoiceText: v.string(),
  vatCase: v.union(v.literal("nl21"), v.literal("reverse"), v.literal("none")),
  vatRateBps: v.number(),
  ip: v.string(),
});

/**
 * The winner is collected: the day, the order and the invoice fields, in one
 * transaction, and `closedAt` written with them.
 *
 * ⚠️ The money is recomputed here against what Stripe actually captured, never
 * trusted from metadata — the same rule `checkout.fulfil` follows, so an invoice
 * can never disagree with a card statement. The VAT *case* was decided before
 * the hold existed and travels with it; only the arithmetic is redone.
 */
export const recordWin = internalMutation({
  args: {
    date: v.string(),
    bidId: v.id("bids"),
    stripeSessionId: v.string(),
    paymentIntentId: v.string(),
    amountCents: v.number(),
    address: v.string(),
    stripeCountry: v.string(),
    declared: declaredBanner,
  },
  returns: v.object({
    email: v.string(),
    hasArtwork: v.boolean(),
    orderId: v.id("orders"),
    /**
     * The consumer's withdrawal address, or empty for a business.
     *
     * ⚠️ It is handed back rather than looked up again because `wonMail` is sent
     * from the close, which is an action: the token is minted inside this
     * mutation and this is the only moment it is in hand (ticket 43).
     */
    withdrawUrl: v.string(),
  }),
  handler: async (ctx, args) => {
    const bid = await ctx.db.get(args.bidId);
    if (!bid || !bid.ownerId) throw new Error("The winning bid has no owner.");
    const owner = await ctx.db.get(bid.ownerId);
    const now = Date.now();
    const d = args.declared;

    const withdrawalToken = d.buyerType === "consumer" ? mintToken() : undefined;
    const orderId = await ctx.db.insert("orders", {
      stripeSessionId: args.stripeSessionId,
      paymentIntentId: args.paymentIntentId,
      kind: "banner",
      ownerId: bid.ownerId,
      bannerDate: args.date,
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
      // ⚠️ Ticket 43, and the banner's period is the short one: the right is
      // born at this close and dies at 00:00 UTC the next day (art. 6:230p sub
      // d). Consumers only, for the reason `convex/checkout.ts` gives.
      withdrawalToken,
      invoiceText: d.invoiceText,
      ip: d.ip,
      totalCents: args.amountCents,
      vatCents: vatInsideCents(args.amountCents, d.vatRateBps),
      vatRateBps: d.vatRateBps,
      vatCase: d.vatCase,
      // ⚠️ Inclusive, and ticket 07 is explicit about why: a bid is a number the
      // bidder types themselves, and two bids of $250 must mean the same thing
      // whoever placed them. Exclusive pricing would make the top bid depend on
      // the bidder's tax status, which is not an auction.
      pricing: "inclusive",
      createdAt: now,
    });

    await ctx.db.patch(args.bidId, { status: "captured", orderId });

    const existing = await ctx.db
      .query("bannerDays")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .unique();
    const fields = {
      date: args.date,
      ownerId: bid.ownerId,
      url: bid.url ?? "",
      artwork: bid.artwork ?? null,
      wonWithCents: args.amountCents,
      closedAt: now,
    };
    if (existing) await ctx.db.patch(existing._id, fields);
    else await ctx.db.insert("bannerDays", fields);

    return {
      email: owner?.email ?? "",
      hasArtwork: Boolean(bid.artwork),
      orderId,
      withdrawUrl: withdrawalToken ? withdrawUrl(withdrawalToken) : "",
    };
  },
});

/**
 * A hold the bank refused at the close. It is out of the ladder, not retried.
 *
 * ⚠️ `failure: "declined"` is the whole point of ticket 41. Without it this row
 * is indistinguishable from a bid that arrived after the day was decided, and
 * the bidder's own status page tells him the day was settled while he was
 * paying — which is untrue twice over. The word is written here because here is
 * the only place that knows it.
 */
export const recordFailure = internalMutation({
  args: { bidId: v.id("bids") },
  returns: v.null(),
  handler: async (ctx, { bidId }) => {
    await ctx.db.patch(bidId, { status: "failed", failure: "declined" });
    return null;
  },
});

/** A hold that was cancelled because somebody else's capture succeeded. */
export const recordRelease = internalMutation({
  args: { bidId: v.id("bids") },
  returns: v.null(),
  handler: async (ctx, { bidId }) => {
    await ctx.db.patch(bidId, { status: "released" });
    return null;
  },
});

/**
 * Nobody could be collected. The house ad takes the day.
 *
 * The row is written all the same, with `closedAt` and no owner: it is what
 * stops the ladder being walked again every hour, and every reader already
 * treats a day with no `ownerId` as the house ad.
 */
export const closeEmpty = internalMutation({
  args: { date: v.string() },
  returns: v.null(),
  handler: async (ctx, { date }) => {
    const existing = await ctx.db
      .query("bannerDays")
      .withIndex("by_date", (q) => q.eq("date", date))
      .unique();
    if (existing?.closedAt) return null;
    if (existing) await ctx.db.patch(existing._id, { closedAt: Date.now() });
    else await ctx.db.insert("bannerDays", { date, artwork: null, closedAt: Date.now() });
    return null;
  },
});

const stripe = () =>
  new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
    // Convex runs on V8 and not on Node, so the SDK is given the platform's own
    // fetch instead of Node's http module.
    httpClient: Stripe.createFetchHttpClient(),
  });

/** Pull the bidder's own declarations back out of the session they travelled in. */
function declaredFrom(metadata: Record<string, string> | null) {
  const m = metadata ?? {};
  return {
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

/**
 * Close every day that is due. The cron's whole job.
 *
 * ⚠️ **Capture the top bid first. Cancel every other hold only after that
 * capture has succeeded.** That order is the answer to three separate problems
 * at once, and reversing it breaks all three: the declined card, the runner-up,
 * and the bidder who holds the top spot all day with no intention of paying. The
 * attack costs them a real hold on a real card and wins them nothing, because
 * the banner simply falls to the next bid that can be collected.
 */
export const closeDue = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    for (const date of await ctx.runQuery(internal.auction.dueDays, {})) {
      await closeOne(ctx, date);
    }
    return null;
  },
});

async function closeOne(ctx: ActionCtx, date: string) {
  const candidates = await ctx.runQuery(internal.auction.planClose, { date });
  if (candidates === null) return;

  const api = stripe();
  let won: { bidId: Id<"bids">; index: number } | null = null;
  // Every rung the bank refused, in ladder order. Ticket 41: each one owes its
  // bidder a cancelled hold and a message, and neither may happen before
  // somebody has paid.
  const refused: typeof candidates = [];

  for (const [index, bid] of candidates.entries()) {
    let collected = false;
    try {
      // For exactly the bid amount. There is no "authorize high, capture the
      // winning bid" here, which is what closes ticket 03's authorize-≠-capture
      // warning for good.
      await api.paymentIntents.capture(bid.paymentIntentId);
      collected = true;
    } catch {
      // ⚠️ A capture that throws is not the same as a card that declined. If the
      // previous run of this cron captured and then died before writing the day,
      // Stripe answers `payment_intent_unexpected_state` — and the money is
      // ours. Asking Stripe what it thinks is the only way to tell the two
      // apart, and getting it wrong would charge the runner-up as well.
      try {
        const pi = await api.paymentIntents.retrieve(bid.paymentIntentId);
        collected = pi.status === "succeeded";
      } catch {
        collected = false;
      }
    }
    if (!collected) {
      await ctx.runMutation(internal.auction.recordFailure, { bidId: bid.bidId });
      refused.push(bid);
      continue;
    }

    const session = await api.checkout.sessions.retrieve(bid.stripeSessionId);
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

    const winner = await ctx.runMutation(internal.auction.recordWin, {
      date,
      bidId: bid.bidId,
      stripeSessionId: bid.stripeSessionId,
      paymentIntentId: bid.paymentIntentId,
      amountCents: bid.amountCents,
      address: line,
      stripeCountry: address?.country ?? "",
      declared: declaredFrom(session.metadata),
    });
    won = { bidId: bid.bidId, index };

    if (winner.email) {
      const mail = wonMail({
        amount: bid.amountCents,
        date,
        hasArtwork: winner.hasArtwork,
        // Anything but the top rung means the ladder was walked to reach him,
        // and ticket 38 owes him a sentence saying so.
        promoted: index > 0,
        // ⚠️ Art. 6:230m lid 1 sub h, and this is the only mail that can carry
        // it: the banner's withdrawal period is one day and the invoice mail
        // that follows would reach him with the day half gone (ticket 43).
        withdrawUrl: winner.withdrawUrl || undefined,
      });
      // The one mail that may not take the close down with it. The money is
      // collected and the banner is up; a Resend outage is not a reason to leave
      // every other hold frozen.
      try {
        await sendMail({ to: winner.email, subject: mail.subject, text: mail.text });
      } catch {
        // Nothing to do here. The day is written and the board already shows it.
      }
    }

    // ⚠️ After the won mail, never before it, and for the same reason it is here
    // rather than scheduled from `recordWin`: `wonMail` ends *your invoice
    // follows*, so an invoice that overtakes it makes the site's own copy read
    // backwards. It issues the document and sends the second message
    // ([tickets 22](../.scratch/200squares-v1/issues/22-build-email.md) and
    // [23](../.scratch/200squares-v1/issues/23-build-invoice.md)).
    try {
      await ctx.runAction(internal.mail.orderConfirmed, { orderId: winner.orderId });
    } catch {
      // The same rule as the mail above: a banner day that is won, collected and
      // on the board is not undone by a document that can be written again.
      // `invoices.sweepMissing` picks it up within the day.
    }
    break;
  }

  if (!won) {
    // Nobody could be collected, so the house ad takes the day — and the whole
    // ladder is in `refused`, which is the third shape of the close ticket 38
    // named. The pass below still runs.
    await ctx.runMutation(internal.auction.closeEmpty, { date });
  } else {
    // Only now. Everything above the winner already failed and was recorded; every
    // hold below it is released, in full, the moment somebody has paid.
    for (const bid of candidates.slice(won.index + 1)) {
      try {
        await api.paymentIntents.cancel(bid.paymentIntentId);
      } catch {
        // An already-cancelled hold is the expected answer on a retry, and it is
        // the outcome we wanted. The row is marked either way.
      }
      await ctx.runMutation(internal.auction.recordRelease, { bidId: bid.bidId });
    }
  }

  // ⚠️ The refused rungs, last of all, and money before words. Ticket 19 left
  // their authorizations frozen on the card until they expired by themselves:
  // only the holds *below* the winner were ever cancelled. Ticket 07's rule is
  // that nothing is released until somebody has paid, and by here either
  // somebody has or nobody can, so both are the moment to let go.
  for (const bid of refused) {
    try {
      await api.paymentIntents.cancel(bid.paymentIntentId);
    } catch {
      // Let it go. An authorization dies by itself, and the close may not be
      // held open waiting for one — the same rule the releases above follow.
    }
  }

  // ⚠️ Words after every hold is gone, never before, and for the reason ticket
  // 38 gave: a Resend outage may not hold the close open or leave other holds
  // frozen. Same `try`/`catch` as the won mail, one per bidder, ladder order.
  for (const bid of refused) {
    if (!bid.email) continue;
    const mail = declinedMail({ amount: bid.amountCents, date });
    try {
      await sendMail({ to: bid.email, subject: mail.subject, text: mail.text });
    } catch {
      // Nothing to do. The hold is already released and the board already shows
      // whose day it is.
    }
  }
}
