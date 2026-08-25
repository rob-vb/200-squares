// Putting a board in a deployment, so the dev can look at one.
//
// The dev works on a VPS and sees nothing locally: every visual check happens on
// a Vercel preview URL against a real Convex deployment. The prototype answered
// this with `?data=early` and two datasets in the browser. That answer is dead —
// ⚠️ ticket 08 found that reading a search parameter is why **every route builds
// dynamic**, which cost ticket 02 its cheapest defence — so the switch moves off
// the URL and into the deployment. There is nothing to read at render, and the
// board route can be static again.
//
//   npx convex run seed:full     — about 70% sold, a banner winner, a live auction
//   npx convex run seed:early    — day one, ten squares gone, house ad
//   npx convex run seed:clear    — an empty board
//
// ⚠️ Every function here refuses unless `SEED_ENABLED` is set on the deployment.
// Set it on dev (`proper-heron-683`) and never on production: these mutations
// delete every block on the board, and a mistyped deployment name is all it
// would take.

import { v, ConvexError } from "convex/values";
import { normalise } from "./auth";
import { mutation, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { todayUtc } from "./lib/time";
import {
  brands,
  EARLY_BLOCKS,
  FULL_BANNER_DAYS,
  FULL_BIDS,
  FULL_BLOCKS,
  type SeedBlock,
} from "./seedData";

function guard() {
  if (!process.env.SEED_ENABLED) {
    throw new ConvexError(
      "Seeding is off on this deployment. Set SEED_ENABLED to turn it on, and " +
        "never set it on production.",
    );
  }
}

/** The date `n` days before today, UTC, as `YYYY-MM-DD`. */
const daysAgo = (n: number) => todayUtc(Date.now() - n * 24 * 60 * 60 * 1000);

/** Everything the seed writes, in the order that lets each step find the last. */
const TABLES = [
  "clickCounts",
  "bids",
  "bannerDays",
  "reservations",
  "blocks",
  "owners",
  "cached",
] as const;

async function wipe(ctx: MutationCtx) {
  for (const table of TABLES) {
    for (const row of await ctx.db.query(table).collect()) await ctx.db.delete(row._id);
  }
}

/** One owner per brand, so a seeded board has parties and not just rectangles. */
async function makeOwners(ctx: MutationCtx, ids: string[]) {
  const now = Date.now();
  const byBrand = new Map<string, Id<"owners">>();
  for (const id of new Set(ids)) {
    const brand = brands[id];
    // A seeded owner has no account and never gets one: `userId` stays empty,
    // which is the normal state ticket 08 describes and not a broken row.
    const ownerId = await ctx.db.insert("owners", {
      name: brand.name,
      email: `${id}@example.invalid`,
      emailNormalised: `${id}@example.invalid`,
      strikeAt: [],
      createdAt: now,
    });
    byBrand.set(id, ownerId);
  }
  return byBrand;
}

async function writeBlocks(
  ctx: MutationCtx,
  seeds: SeedBlock[],
  owners: Map<string, Id<"owners">>,
) {
  const now = Date.now();
  for (const seed of seeds) {
    const brand = brands[seed.brand];
    const blockId = await ctx.db.insert("blocks", {
      rect: seed.rect,
      ownerId: owners.get(seed.brand)!,
      url: brand.url,
      // A pending block is paid for and simply has no artwork yet.
      artwork: seed.pending
        ? null
        : { kind: "seed" as const, bg: brand.bg, fg: brand.fg, label: brand.name },
      frozen: false,
      createdAt: now,
    });
    // A pending block is forced to zero whatever the seed says: a click on it
    // opens nothing, so it can never have earned one.
    const count = seed.pending ? 0 : (seed.clicks ?? 0);
    if (count > 0) {
      await ctx.db.insert("clickCounts", {
        target: { kind: "block", blockId },
        count,
      });
    }
  }
}

/** About 70% sold, a banner winner, a week of past winners, a live auction. */
export const full = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    guard();
    await wipe(ctx);

    const brandIds = [
      ...FULL_BLOCKS.map((b) => b.brand),
      ...FULL_BANNER_DAYS.map((d) => d.brand),
      ...FULL_BIDS.map(([, brand]) => brand),
    ];
    const owners = await makeOwners(ctx, brandIds);
    await writeBlocks(ctx, FULL_BLOCKS, owners);

    for (const day of FULL_BANNER_DAYS) {
      const brand = brands[day.brand];
      const date = daysAgo(day.daysAgo);
      await ctx.db.insert("bannerDays", {
        date,
        ownerId: owners.get(day.brand)!,
        url: brand.url,
        artwork: { kind: "seed", bg: brand.bg, fg: brand.fg, label: brand.name },
        wonWithCents: day.wonWith * 100,
        // Every past day is closed. Today's is closed too: it was won at the
        // 00:00 UTC that started it, which is what makes it today's banner.
        closedAt: Date.now(),
      });
      if (day.clicks > 0) {
        await ctx.db.insert("clickCounts", {
          target: { kind: "banner", date },
          count: day.clicks,
        });
      }
    }

    // The auction running now is for **tomorrow's** banner, which is the day
    // that has not started yet. No `bannerDays` row exists for it until the
    // close writes one.
    const auctionDate = daysAgo(-1);
    const now = Date.now();
    for (const [amountUsd, brand, minutesAgo] of FULL_BIDS) {
      await ctx.db.insert("bids", {
        date: auctionDate,
        ownerId: owners.get(brand)!,
        amountCents: amountUsd * 100,
        // ⚠️ Seeded bids carry no real PaymentIntent. Ticket 19 builds the
        // holds; a seeded board can be looked at but not closed.
        paymentIntentId: `pi_seed_${brand}_${amountUsd}`,
        captureBefore: now + 7 * 24 * 60 * 60 * 1000,
        status: "held",
        placedAt: now - minutesAgo * 60 * 1000,
      });
    }

    return `Seeded: ${FULL_BLOCKS.length} blocks, ${FULL_BANNER_DAYS.length} banner days, ${FULL_BIDS.length} bids.`;
  },
});

/** Day one: ten squares gone, and the banner is a house ad because nobody won. */
export const early = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    guard();
    await wipe(ctx);
    const owners = await makeOwners(ctx, EARLY_BLOCKS.map((b) => b.brand));
    await writeBlocks(ctx, EARLY_BLOCKS, owners);
    // No `bannerDays` row for today, so nobody won it: the house ad stands.
    return `Seeded: ${EARLY_BLOCKS.length} blocks, no banner, no bids.`;
  },
});

/** An empty board. 199 squares, all available, and a house ad on the banner. */
export const clear = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    guard();
    await wipe(ctx);
    return "Cleared.";
  },
});

/**
 * Hand a seeded owner's squares to a real address, so My squares can be looked at.
 *
 * ⚠️ Ticket 18 deleted the prototype's fake sign-in, and with it the only way the
 * dev had to be somebody. Signing in for real now works — but a real address has
 * no owner row behind it, so My squares is correctly empty and there is nothing
 * to look at. This re-points the busiest seeded owner at an address the dev can
 * actually receive mail on. Sign in with it and their blocks, banner days and
 * bids are all there.
 *
 *   npx convex run seed:adopt '{"email":"you@example.com"}'
 *
 * `SEED_ENABLED` guards it like everything else here, so it does not exist on
 * production. It is still a mutation that gives one address somebody else's
 * squares, which is exactly why it may never leave the dev deployment.
 */
export const adopt = mutation({
  args: { email: v.string() },
  returns: v.string(),
  handler: async (ctx, { email }) => {
    guard();
    const address = normalise(email);
    if (!address.includes("@")) throw new ConvexError("That is not an email address.");

    const seeded = (await ctx.db.query("owners").collect()).filter((o) =>
      o.emailNormalised.endsWith("@example.invalid"),
    );
    if (seeded.length === 0) throw new ConvexError("There are no seeded owners. Seed first.");

    let best = seeded[0];
    let most = -1;
    for (const owner of seeded) {
      const n = (
        await ctx.db
          .query("blocks")
          .withIndex("by_owner", (q) => q.eq("ownerId", owner._id))
          .collect()
      ).length;
      if (n > most) {
        most = n;
        best = owner;
      }
    }

    // `userId` is cleared with the address. The join is on the email, so a row
    // still pointing at yesterday's account would answer for the wrong person.
    await ctx.db.patch(best._id, { email, emailNormalised: address, userId: undefined });
    return `${best.name} (${most} blocks) now answers to ${address}.`;
  },
});

/**
 * Bring tomorrow's auction forward, so the close can be watched happening.
 *
 * ⚠️ The close is the one path on this site that cannot be tested by waiting for
 * it: it fires at 00:00 UTC, once a day, and the ticket that built it asks for a
 * **declined capture** to be forced by hand — a case that has never run and that
 * the copy now promises. So this moves every live bid on tomorrow's banner back
 * to today, whose 00:00 UTC has already passed, and clears today's day row. The
 * next run of the hourly cron then closes it for real, with real holds and real
 * captures against Stripe test mode.
 *
 *   npx convex run seed:ageAuction
 *   npx convex run auction:closeDue     # or wait for the hour
 *
 * It writes no outcome of its own. Everything after it is the production path.
 *
 * `SEED_ENABLED` guards it like everything else here. On production it would
 * collect a day of card holds hours before the day it was collecting them for.
 */
export const ageAuction = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    guard();
    const today = todayUtc(Date.now());
    const tomorrow = daysAgo(-1);

    const day = await ctx.db
      .query("bannerDays")
      .withIndex("by_date", (q) => q.eq("date", today))
      .unique();
    if (day) await ctx.db.delete(day._id);

    const bids = await ctx.db
      .query("bids")
      .withIndex("by_date", (q) => q.eq("date", tomorrow))
      .collect();
    let moved = 0;
    for (const bid of bids) {
      if (bid.status !== "held" && bid.status !== "pending") continue;
      await ctx.db.patch(bid._id, { date: today });
      moved += 1;
    }
    return `Moved ${moved} bids from ${tomorrow} to ${today}. Run auction:closeDue.`;
  },
});
