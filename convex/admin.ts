// The admin: one list, one button, and the four things that button does.
//
// ⚠️ [Ticket 11](../.scratch/200squares-v1/issues/11-admin-removal.md) decided
// all of it, and the argument against the Convex dashboard is the whole reason
// this file exists: **one press must do four things at once** — strip the
// artwork and the link, write the strike, write the `removals` row, and send the
// mail. Four hand edits in three tables at midnight is how the wrong row gets
// touched. A script fails the other test: it does not work on a phone.
//
// ⚠️ **Stripping is not only setting the field to null.** The two WebP files stay
// in Convex storage until something deletes them, so `strip` calls `release`
// from `convex/art.ts` (ticket 20) and the picture is gone with the press,
// rather than a day later when the orphan sweep happens to look.
//
// ⚠️ **Strikes count on the owner, the third one freezes only the block that
// caused it, and a strike expires after twelve months.** All three are ticket
// 11's, and each of them is load-bearing: per-block counting hands a four-block
// owner twelve strikes; freezing all four punishes blocks that did nothing; and
// permanent strikes would eventually freeze somebody who makes one mistake a
// year, which is not what the rule is for.
//
// Nothing here checks where a link goes. Ticket 11 deliberately built nothing,
// and `/terms` says so out loud: the site acts on a report.
//
// The **rule** a removal names is whatever the page sent, and the list of them
// lives in `src/components/admin/admin-board.tsx` beside the field that picks
// one. It is not validated here on purpose: `/terms` is the source of the list,
// a rule reworded there must not make an old `removals` row unreadable, and the
// only caller is the dev.

import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./auth";
import { release } from "./art";
import { liveStrikes } from "./owners";
import { squareRange } from "./lib/board";
import { todayUtc } from "./lib/time";

/**
 * Whether the caller is the admin, as a plain yes or no.
 *
 * ⚠️ It exists because everything else here **throws**, and a thrown query is an
 * error boundary rather than a page. A visitor who finds `/admin` should meet a
 * flat *that is not your page*, and a signed-in admin should not have their
 * first paint decided by an exception. The guard is unchanged: this answers the
 * same question `requireAdmin` does and grants nothing.
 */
export const mayI = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    try {
      await requireAdmin(ctx);
      return true;
    } catch {
      return false;
    }
  },
});

const blockRow = v.object({
  id: v.id("blocks"),
  what: v.string(),
  ownerName: v.string(),
  ownerEmail: v.string(),
  url: v.string(),
  hasArtwork: v.boolean(),
  frozen: v.boolean(),
  /** Live strikes against the **owner**, which is where they are counted. */
  strikes: v.number(),
});

/**
 * Every block, and today's banner if somebody won it.
 *
 * The search is done here rather than in the browser because the answer is what
 * travels: an admin on a phone looking for one owner should not be sent 199
 * rows to filter. It matches the owner's name, their address and the link,
 * which are the three things a report ever names.
 */
export const board = query({
  args: { search: v.optional(v.string()) },
  returns: v.object({
    blocks: v.array(blockRow),
    banner: v.union(
      v.null(),
      v.object({
        date: v.string(),
        ownerName: v.string(),
        ownerEmail: v.string(),
        url: v.string(),
        hasArtwork: v.boolean(),
        removed: v.boolean(),
        strikes: v.number(),
      }),
    ),
  }),
  handler: async (ctx, { search }) => {
    await requireAdmin(ctx);
    const now = Date.now();
    const needle = (search ?? "").trim().toLowerCase();

    const owners = new Map<
      string,
      { name: string; email: string; strikes: number }
    >();
    for (const owner of await ctx.db.query("owners").collect()) {
      owners.set(owner._id, {
        name: owner.name,
        email: owner.email,
        strikes: liveStrikes(owner.strikeAt, now),
      });
    }

    const blocks = [];
    for (const block of await ctx.db.query("blocks").collect()) {
      const owner = owners.get(block.ownerId) ?? {
        name: "",
        email: "",
        strikes: 0,
      };
      const hay = `${owner.name} ${owner.email} ${block.url}`.toLowerCase();
      if (needle && !hay.includes(needle)) continue;
      blocks.push({
        id: block._id,
        what: `Square ${squareRange(block.rect)}`,
        ownerName: owner.name,
        ownerEmail: owner.email,
        url: block.url,
        hasArtwork: Boolean(block.artwork),
        frozen: block.frozen,
        strikes: owner.strikes,
      });
    }
    // The ones that can be acted on first: a frozen block is already dealt with,
    // and an empty one has nothing on it to remove.
    blocks.sort(
      (a, b) =>
        Number(a.frozen) - Number(b.frozen) ||
        Number(!a.hasArtwork) - Number(!b.hasArtwork),
    );

    const date = todayUtc(now);
    const day = await ctx.db
      .query("bannerDays")
      .withIndex("by_date", (q) => q.eq("date", date))
      .unique();
    const bannerOwner = day?.ownerId ? owners.get(day.ownerId) : undefined;

    return {
      blocks,
      banner:
        day && day.ownerId
          ? {
              date,
              ownerName: bannerOwner?.name ?? "",
              ownerEmail: bannerOwner?.email ?? "",
              url: day.url ?? "",
              hasArtwork: Boolean(day.artwork),
              removed: Boolean(day.removedAt),
              strikes: bannerOwner?.strikes ?? 0,
            }
          : null,
    };
  },
});

/** The reason goes to the owner as it was written, so it may not be empty. */
function reasonOf(raw: string): string {
  const reason = raw.trim().slice(0, 500);
  if (!reason)
    throw new ConvexError(
      "A reason is needed. The owner is told what it says.",
    );
  return reason;
}

/**
 * A withdrawal's note. Nobody is sent it, so it may say anything — but it may
 * not be nothing, because it is the only account of why a day went off.
 */
function noteOf(raw: string): string {
  const note = raw.trim().slice(0, 500);
  if (!note)
    throw new ConvexError(
      "A note is needed. Nothing else records why the day went off.",
    );
  return note;
}

/**
 * Empty a block: artwork, link, strike, record, mail. One press, one transaction.
 *
 * ⚠️ The mail is **scheduled** rather than sent, because a mutation may not reach
 * the network — and scheduling inside the transaction is what keeps the four
 * things one act: if the write rolls back, no mail was ever booked, and if it
 * commits the mail is already on the list whatever Resend is doing.
 *
 * The square stays theirs. `/terms` promised that in writing and ticket 11
 * refused to reopen it: *the square stays yours: put something else on it.*
 */
export const strip = mutation({
  args: { blockId: v.id("blocks"), rule: v.string(), reason: v.string() },
  returns: v.object({ strikes: v.number(), frozen: v.boolean() }),
  handler: async (ctx, { blockId, rule, reason: rawReason }) => {
    await requireAdmin(ctx);
    const reason = reasonOf(rawReason);

    const block = await ctx.db.get(blockId);
    if (!block) throw new ConvexError("There is no such block.");
    const owner = await ctx.db.get(block.ownerId);
    if (!owner) throw new ConvexError("That block has no owner.");

    const now = Date.now();
    const strikeAt = [...owner.strikeAt, now];
    const strikes = liveStrikes(strikeAt, now);
    // ⚠️ The third live strike freezes **this** block and no other. An owner's
    // other squares did nothing.
    const frozen = strikes >= 3;

    const old = block.artwork;
    await ctx.db.patch(blockId, {
      artwork: null,
      url: "",
      frozen: block.frozen || frozen,
    });
    await ctx.db.patch(owner._id, { strikeAt });
    await ctx.db.insert("removals", {
      blockId,
      ownerId: owner._id,
      rule,
      reason,
      froze: frozen,
      removedAt: now,
    });
    // After the patch: `release` asks what is still pointed at, and the row it is
    // asking about has to have moved on first.
    await release(ctx, old);

    await ctx.scheduler.runAfter(0, internal.mail.removed, {
      to: owner.email,
      what: `square ${squareRange(block.rect)}`,
      rule,
      reason,
      strikes,
      frozen,
    });

    return { strikes, frozen };
  },
});

/**
 * Take today's banner off for the rest of its day. The house ad stands in.
 *
 * ⚠️ A winner takes a strike like anybody else, and that is ticket 11's answer
 * to the free practice ground: bid, publish something vile, lose one day and the
 * bid, come back tomorrow. The daily punishment is real and has no memory; the
 * strike is the only thing that looks across days, and it costs nothing extra
 * because the counter already lives on the `owners` row.
 *
 * The bid is not returned. `/terms` says so, and ticket 11 held it: this is the
 * bidder breaking the contract rather than withdrawing from it.
 */
export const removeBanner = mutation({
  args: { date: v.string(), rule: v.string(), reason: v.string() },
  returns: v.object({ strikes: v.number() }),
  handler: async (ctx, { date, rule, reason: rawReason }) => {
    await requireAdmin(ctx);
    const reason = reasonOf(rawReason);

    const day = await ctx.db
      .query("bannerDays")
      .withIndex("by_date", (q) => q.eq("date", date))
      .unique();
    if (!day || !day.ownerId)
      throw new ConvexError("Nobody holds the banner that day.");
    const owner = await ctx.db.get(day.ownerId);
    if (!owner) throw new ConvexError("That banner day has no owner.");

    const now = Date.now();
    const strikeAt = [...owner.strikeAt, now];
    const strikes = liveStrikes(strikeAt, now);

    const old = day.artwork;
    // ⚠️ `removedAt` is what the board and the click counter already read, so the
    // banner is off the moment this commits. The artwork goes with it: the file
    // is what was reported, and leaving it in storage leaves it reachable.
    await ctx.db.patch(day._id, { removedAt: now, artwork: null, url: "" });
    await ctx.db.patch(owner._id, { strikeAt });
    await ctx.db.insert("removals", {
      bannerDate: date,
      ownerId: owner._id,
      rule,
      reason,
      // A banner day is not a block, so nothing here can be frozen. The strike
      // still counts, and it is what a third one will freeze a *block* on.
      froze: false,
      removedAt: now,
    });
    await release(ctx, old);

    await ctx.scheduler.runAfter(0, internal.mail.removed, {
      to: owner.email,
      what: `banner on ${date}`,
      rule,
      reason,
      strikes,
      frozen: false,
    });

    return { strikes };
  },
});

/**
 * Take a banner day off because the bidder withdrew from it.
 *
 * ⚠️ **`removeBanner` cannot be reused, and that is the whole reason this exists.**
 * It has the right effect — the day goes off, the house ad stands in — but it
 * also counts a strike, writes a `rule` and sends the *you broke rule X* mail.
 * A withdrawal breaks nothing. [Ticket 31](../.scratch/200squares-v1/issues/31-a-bid-that-does-not-stand.md)
 * settled what it is: a bid is an irrevocable offer, the close is the
 * acceptance, and a consumer's 14 days are born at the close and die at full
 * performance — so they live 24 hours, and this is the door they walk through.
 *
 * ⚠️ **The refund is not built.** The dev works out hours-run ÷ 24 × bid and
 * refunds in the Stripe dashboard. Art. 14(3) fixes the amount at the moment the
 * consumer *sent* the message, not the moment the dev reads it, so a late reply
 * costs the house free banner hours and shortens nobody's refund. Pressing this
 * button is therefore not the clock — the message was.
 *
 * ⚠️ **No mail.** Ticket 13 fixed the list at six messages and a build ticket
 * may not add a seventh. The dev is already in the thread: they are answering
 * the withdrawal by hand, which is where the refund is arranged anyway.
 *
 * The note is required for the same reason a removal's reason is: this row is
 * the only thing the act leaves behind, and in 2036 *a day went off and nobody
 * was struck* has to be explainable.
 */
export const withdrawBanner = mutation({
  args: { date: v.string(), note: v.string() },
  returns: v.null(),
  handler: async (ctx, { date, note: rawNote }) => {
    await requireAdmin(ctx);
    const note = noteOf(rawNote);

    const day = await ctx.db
      .query("bannerDays")
      .withIndex("by_date", (q) => q.eq("date", date))
      .unique();
    if (!day || !day.ownerId)
      throw new ConvexError("Nobody holds the banner that day.");
    const owner = await ctx.db.get(day.ownerId);
    if (!owner) throw new ConvexError("That banner day has no owner.");

    const now = Date.now();
    const old = day.artwork;
    // The same three fields `removeBanner` patches, for the same reason: the
    // board and the click counter already read `removedAt`, so the banner is off
    // the moment this commits and the house ad takes the rest of the day.
    await ctx.db.patch(day._id, { removedAt: now, artwork: null, url: "" });
    // ⚠️ `owner.strikeAt` is **not** touched. Nothing was broken.
    await ctx.db.insert("removals", {
      bannerDate: date,
      ownerId: owner._id,
      // ⚠️ No `rule`, and its absence is the record: see `convex/schema.ts`.
      reason: note,
      froze: false,
      removedAt: now,
    });
    await release(ctx, old);

    return null;
  },
});

/**
 * Unfreeze a block.
 *
 * ⚠️ It is not a right, it is not in `/terms`, and it is not advertised. Ticket
 * 11 built the button because *never, no exceptions* is a promise the dev will
 * want to break exactly once — and at that moment `/terms` should not be in
 * their way.
 *
 * It does not remove the strikes. They expire on their own after twelve months,
 * and clearing them would make the next removal read as the first.
 */
export const unfreeze = mutation({
  args: { blockId: v.id("blocks") },
  returns: v.null(),
  handler: async (ctx, { blockId }) => {
    await requireAdmin(ctx);
    const block = await ctx.db.get(blockId);
    if (!block) throw new ConvexError("There is no such block.");
    await ctx.db.patch(blockId, { frozen: false });
    return null;
  },
});

/**
 * What has been done, newest first. The ten-year record, read back.
 *
 * It is about an **owner** and not a visitor, which is why `/privacy` is
 * untouched by it — the same distinction ticket 13 drew for the email address.
 */
export const removals = query({
  args: {},
  returns: v.array(
    v.object({
      what: v.string(),
      ownerName: v.string(),
      /** ⚠️ Empty where the bidder withdrew: `withdrawn` says so instead. */
      rule: v.string(),
      withdrawn: v.boolean(),
      reason: v.string(),
      froze: v.boolean(),
      removedAt: v.number(),
    }),
  ),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const rows = await ctx.db.query("removals").order("desc").take(50);
    const out = [];
    for (const row of rows) {
      const owner = await ctx.db.get(row.ownerId);
      const block = row.blockId ? await ctx.db.get(row.blockId) : null;
      out.push({
        what: row.bannerDate
          ? `Banner ${row.bannerDate}`
          : block
            ? `Square ${squareRange(block.rect)}`
            : "A block",
        ownerName: owner?.name || owner?.email || "",
        rule: row.rule ?? "",
        // Derived, never stored. One field on the row cannot disagree with
        // itself; two of them could.
        withdrawn: row.rule === undefined,
        reason: row.reason,
        froze: row.froze,
        removedAt: row.removedAt,
      });
    }
    return out;
  },
});
