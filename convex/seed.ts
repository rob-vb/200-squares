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
