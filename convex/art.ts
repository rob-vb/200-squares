// Artwork: who may upload, what is accepted, and what happens to the file it
// replaces.
//
// ⚠️ **Three doors, one rule.** An upload URL is handed out by a mutation that
// has already decided the caller owns the thing they are about to draw on:
//
//   the order      — the Stripe session id in the return page's address, which
//                    is ticket 06's grant and the only one a buyer has before
//                    any mail arrives;
//   the block      — `requireOwner`, ticket 18's guard, for every later change;
//   the bid        — a standing bid is its owner's until the close (ticket 07),
//                    and what it carries becomes tomorrow's banner.
//
// ⚠️ **The URL is a capability with a short life, and it is not the check.** A
// file that arrives is nothing until a setter below writes its id onto a row,
// and every setter checks the same thing over again. An upload nobody claims is
// an orphan, and `sweepOrphans` takes it.

import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation, mutation } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { currentOwner, requireOwner } from "./auth";
import { LARGE_MAX_BYTES, SMALL_MAX_BYTES, STORED_TYPE } from "./lib/art";
import { tagFor } from "./purge";

/** The pair of ids every setter takes: the `1x` and the `4x` the browser made. */
const pair = { small: v.id("_storage"), large: v.id("_storage") };

/** Two short-lived upload URLs, one per size. Both files or neither. */
const urls = v.object({ small: v.string(), large: v.string() });

const twoUrls = async (ctx: MutationCtx) => ({
  small: await ctx.storage.generateUploadUrl(),
  large: await ctx.storage.generateUploadUrl(),
});

/**
 * What arrived, judged on its metadata alone.
 *
 * ⚠️ It throws the files away before it throws. A refused pair is already in
 * storage — the browser posted it straight to Convex — and leaving it there
 * would make a rejected upload the cheapest way to fill the free plan's gigabyte.
 */
async function accept(
  ctx: MutationCtx,
  small: Id<"_storage">,
  large: Id<"_storage">,
): Promise<{ kind: "upload"; small: Id<"_storage">; large: Id<"_storage"> }> {
  const check = async (id: Id<"_storage">, cap: number, which: string) => {
    const meta = await ctx.db.system.get("_storage", id);
    if (!meta) return `The ${which} image did not arrive.`;
    if (meta.contentType !== STORED_TYPE) return `The ${which} image is not a WebP file.`;
    if (meta.size > cap) return `The ${which} image is too big.`;
    return null;
  };
  const wrong =
    (await check(small, SMALL_MAX_BYTES, "small")) ??
    (await check(large, LARGE_MAX_BYTES, "large"));
  if (wrong) {
    await ctx.storage.delete(small);
    await ctx.storage.delete(large);
    throw new ConvexError(wrong);
  }
  return { kind: "upload" as const, small, large };
}

/**
 * Delete what a row has stopped pointing at, unless something else still does.
 *
 * ⚠️ Exported for the admin
 * ([ticket 24](../.scratch/200squares-v1/issues/24-build-removal.md)), and that
 * is the point of it being one function: stripping a block is not only setting
 * the field to null. The two files would stay in Convex until the daily orphan
 * sweep noticed, so removal calls this and the picture is gone with the press.
 *
 * ⚠️ The guard is not decoration. Ticket 09 lets the pieces of a cut block share
 * one file and window it with a crop, so a piece whose owner replaces their
 * artwork must not take the other pieces' picture with it. Nothing cuts a block
 * in V1.0 — resale is out of scope — and the rule is written here because the
 * day it comes back is not the day to remember it.
 *
 * ⚠️ **Deleting the file is only half of it.** `/art/<id>` is cached at Vercel's
 * edge for a year, so a file that is gone from Convex still answers at its own
 * URL — which is a removal that did not remove
 * ([ADR 0004](../../docs/adr/0004-a-year-is-a-cache-not-a-promise.md)). So this
 * books the purge too, and it books it **for exactly the ids it deleted**, never
 * for the ids it was handed: the guard that spares a file a cut block still shares
 * has to spare its URL with it. Purging a file that is still on the board would
 * cost one fetch to bring it back, and every visitor would pay for it.
 *
 * `removalId` is the `removals` row the press wrote, where there is one. A
 * replacement has none, and `convex/purge.ts` says why it gets none.
 */
export async function release(
  ctx: MutationCtx,
  old: Doc<"blocks">["artwork"] | undefined,
  removalId?: Id<"removals">,
) {
  const done = async () => {
    // Nothing is left serving, so the row is not waiting on anything.
    if (removalId) await ctx.db.patch(removalId, { purgedAt: Date.now() });
  };
  if (!old || old.kind !== "upload") return await done();

  const stillUsed = new Set<string>();
  const note = (art: { kind: string; small?: unknown; large?: unknown } | null | undefined) => {
    if (art && art.kind === "upload") {
      stillUsed.add(String(art.small));
      stillUsed.add(String(art.large));
    }
  };
  for (const block of await ctx.db.query("blocks").collect()) note(block.artwork);
  for (const day of await ctx.db.query("bannerDays").collect()) note(day.artwork);
  for (const bid of await ctx.db.query("bids").collect()) note(bid.artwork);

  const deleted: string[] = [];
  for (const id of [old.small, old.large]) {
    if (stillUsed.has(String(id))) continue;
    await ctx.storage.delete(id);
    deleted.push(String(id));
  }
  if (deleted.length === 0) return await done();

  await ctx.scheduler.runAfter(0, internal.purge.purgeArt, {
    tags: deleted.map(tagFor),
    removalId,
    attempt: 0,
  });
}

// ---------------------------------------------------------------------------
// The block: the square somebody bought.

/**
 * ⚠️ A frozen block takes no artwork. Ticket 11's third strike freezes the block
 * that caused it, and *frozen* means exactly this: still owned, still on the
 * board, and no picture and no link may be set on it.
 */
export const blockUploadUrls = mutation({
  args: { blockId: v.id("blocks") },
  returns: urls,
  handler: async (ctx, { blockId }) => {
    const { block } = await requireOwner(ctx, blockId);
    if (block.frozen) throw new ConvexError("That block is frozen.");
    return await twoUrls(ctx);
  },
});

export const setBlockArtwork = mutation({
  args: { blockId: v.id("blocks"), ...pair },
  returns: v.null(),
  handler: async (ctx, { blockId, small, large }) => {
    const { block } = await requireOwner(ctx, blockId);
    if (block.frozen) {
      await ctx.storage.delete(small);
      await ctx.storage.delete(large);
      throw new ConvexError("That block is frozen.");
    }
    const artwork = await accept(ctx, small, large);
    const old = block.artwork;
    await ctx.db.patch(blockId, { artwork });
    // After the patch: `release` reads the tables to see what is still pointed
    // at, and the row it is asking about has to have moved on first.
    await release(ctx, old);
    return null;
  },
});

/**
 * The link on a block, changed by its owner.
 *
 * Not artwork, and it is here because it is the other half of the same row in My
 * squares: ticket 18 built the guard and left both writes for the ticket that
 * arrived at that row. A button that says it does nothing is worse than one that
 * does the small thing it promises.
 */
export const setBlockUrl = mutation({
  args: { blockId: v.id("blocks"), url: v.string() },
  returns: v.null(),
  handler: async (ctx, { blockId, url }) => {
    const { block } = await requireOwner(ctx, blockId);
    if (block.frozen) throw new ConvexError("That block is frozen.");
    // Bare, no scheme: a stored address is an address and the anchor adds the
    // https, exactly as the thank-you page and a bid's do.
    const bare = url.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "").slice(0, 200);
    await ctx.db.patch(blockId, { url: bare });
    return null;
  },
});

// ---------------------------------------------------------------------------
// The order: the buyer on the return page, who has no account yet.

/**
 * The blocks one paid session bought.
 *
 * ⚠️ Keyed on the Stripe session id and nothing else, which is ticket 06's whole
 * grant: the only place that id exists is the return URL of the person who just
 * paid. It buys naming the block, pointing it somewhere, and this.
 */
async function blocksOfSession(ctx: MutationCtx, stripeSessionId: string) {
  const order = await ctx.db
    .query("orders")
    .withIndex("by_session", (q) => q.eq("stripeSessionId", stripeSessionId))
    .unique();
  if (!order) throw new ConvexError("There is no order for that payment.");
  if (order.refundedAt) throw new ConvexError("That order was refunded.");
  const blocks = (
    await ctx.db
      .query("blocks")
      .withIndex("by_owner", (q) => q.eq("ownerId", order.ownerId))
      .collect()
  ).filter((b) => b.orderId === order._id && !b.frozen);
  if (blocks.length === 0) throw new ConvexError("That payment has no block on the board.");
  return blocks;
}

export const orderUploadUrls = mutation({
  args: { stripeSessionId: v.string() },
  returns: urls,
  handler: async (ctx, { stripeSessionId }) => {
    await blocksOfSession(ctx, stripeSessionId);
    return await twoUrls(ctx);
  },
});

export const setOrderArtwork = mutation({
  args: { stripeSessionId: v.string(), ...pair },
  returns: v.null(),
  handler: async (ctx, { stripeSessionId, small, large }) => {
    const blocks = await blocksOfSession(ctx, stripeSessionId);
    const artwork = await accept(ctx, small, large);
    const olds = blocks.map((b) => b.artwork);
    // ⚠️ One purchase is one rectangle, so this is one block. The loop is here
    // because `orderId` is what says which, and a second block on the same order
    // would otherwise be left with the picture the buyer just replaced.
    for (const block of blocks) await ctx.db.patch(block._id, { artwork });
    for (const old of olds) await release(ctx, old);
    return null;
  },
});

// ---------------------------------------------------------------------------
// The bid: what tomorrow's banner will show, attached while the bid stands.

/**
 * ⚠️ Ticket 07's empty hour. The auction closes at 00:00 UTC and the day it
 * decides begins at 00:00 UTC, so the winner gets no preparation time at all: a
 * bidder who prepared gets the whole day, and one who did not gets the house ad
 * until they upload. `recordWin` copies this onto the banner day at the close.
 */
async function standingBid(ctx: MutationCtx, bidId: Id<"bids">) {
  const owner = await currentOwner(ctx);
  if (!owner) throw new ConvexError("Sign in first.");
  const bid = await ctx.db.get(bidId);
  if (!bid || bid.ownerId !== owner._id) throw new ConvexError("That is not your bid.");
  if (bid.status !== "held") throw new ConvexError("That bid is no longer standing.");
  return bid;
}

export const bidUploadUrls = mutation({
  args: { bidId: v.id("bids") },
  returns: urls,
  handler: async (ctx, { bidId }) => {
    await standingBid(ctx, bidId);
    return await twoUrls(ctx);
  },
});

export const setBidArtwork = mutation({
  args: { bidId: v.id("bids"), ...pair },
  returns: v.null(),
  handler: async (ctx, { bidId, small, large }) => {
    const bid = await standingBid(ctx, bidId);
    const artwork = await accept(ctx, small, large);
    const old = bid.artwork;
    await ctx.db.patch(bidId, { artwork });
    await release(ctx, old ?? null);
    return null;
  },
});

// ---------------------------------------------------------------------------
// The sweep.

/** An hour. A file younger than this may still be on its way to a setter. */
const ORPHAN_GRACE_MS = 60 * 60 * 1000;
/** Bounded, because a mutation is not the place to walk a whole bucket. */
const SWEEP_PAGE = 200;

/**
 * Files nothing points at any more.
 *
 * ⚠️ It exists for the half-written case ticket 09 named: the browser posts two
 * files and the mutation that would claim them never runs, because the tab was
 * closed or the pair was refused between the two deletes. Replacement already
 * deletes what it replaces, so on a healthy deployment this finds nothing.
 *
 * ⚠️ **`invoices.storageId` is on the list**, and it is the one file here that
 * is not a picture. An invoice is kept ten years (ticket 17); a sweep that
 * forgot it would delete the site's own bookkeeping.
 */
export const sweepOrphans = internalMutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const used = new Set<string>();
    const note = (art: { kind: string; small?: unknown; large?: unknown } | null | undefined) => {
      if (art && art.kind === "upload") {
        used.add(String(art.small));
        used.add(String(art.large));
      }
    };
    for (const block of await ctx.db.query("blocks").collect()) note(block.artwork);
    for (const day of await ctx.db.query("bannerDays").collect()) note(day.artwork);
    for (const bid of await ctx.db.query("bids").collect()) note(bid.artwork);
    for (const invoice of await ctx.db.query("invoices").collect()) used.add(String(invoice.storageId));

    const cutoff = Date.now() - ORPHAN_GRACE_MS;
    const files = await ctx.db.system.query("_storage").take(SWEEP_PAGE);
    let deleted = 0;
    for (const file of files) {
      if (file._creationTime > cutoff) continue;
      if (used.has(String(file._id))) continue;
      await ctx.storage.delete(file._id);
      deleted++;
    }
    return deleted;
  },
});
