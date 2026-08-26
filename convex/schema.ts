// The whole backend, in one file. Ticket 05 decided the shape; this is it.
//
// Three rules run through every table here:
//
//   Money is whole cents, USD, as an integer. Never a float, anywhere.
//   Time is absolute UTC milliseconds. No offsets, no relative anything —
//     `clickCounts` is the one exception and keeps no time at all, because
//     /privacy promises it does not.
//   Blocks are the only record of who owns what. The 199 squares have no rows:
//     a square's state is derived from the blocks and reservations over it, so
//     the two can never disagree.
//
// ⚠️ No `listings` table and no credit ledger. Ticket 12 put resale out of scope
// for V1.0, so both would be tables nothing writes to. Ticket 05's answer for
// them stands and V1.1 starts from it.

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/** A rectangle of cells on the board. Zero-based, row 0 at the top. */
export const rect = v.object({
  r: v.number(),
  c: v.number(),
  w: v.number(),
  h: v.number(),
});

/**
 * A window on an uploaded image, in fractions of it.
 *
 * A block that was cut keeps the file it had and narrows this window instead.
 * The split happens in a webhook where there is no browser to re-cut anything,
 * which is why the crop exists at all (ticket 09).
 */
export const crop = v.object({
  x: v.number(),
  y: v.number(),
  w: v.number(),
  h: v.number(),
});

/**
 * What an owner put on a block or a banner day.
 *
 * ⚠️ An opaque storage id and a crop, never a URL. Where the bytes actually live
 * is ticket 09's business and it must not be able to reach this schema. The two
 * sizes are the `1x` and `4x` WebP files the browser produced before upload.
 */
const uploaded = v.object({
  kind: v.literal("upload"),
  small: v.id("_storage"),
  large: v.id("_storage"),
  crop: v.optional(crop),
});

/**
 * ⚠️ Seeded artwork: a colour and a wordmark, and no file anywhere.
 *
 * It exists for one reason. The dev works on a VPS and sees nothing locally, so
 * the only way to look at a **full** board is to put one in a deployment — and a
 * full board of real uploads would mean inventing 37 companies' logos as files.
 * Ticket 15 was told to keep a way to see an empty board and a full one; this is
 * it, and it is why `convex/seed.ts` refuses to run without `SEED_ENABLED`.
 *
 * Nothing in the product ever writes this. If a production deployment holds one
 * of these rows, somebody ran the seed against production by mistake.
 */
const seeded = v.object({
  kind: v.literal("seed"),
  bg: v.string(),
  fg: v.string(),
  label: v.string(),
});

export const artwork = v.union(uploaded, seeded);

/** The three VAT cases from ticket 03, frozen onto an order at the moment of sale. */
const vatCase = v.union(
  /** Dutch 21%, which is every EU consumer under the €10,000 threshold. */
  v.literal("nl21"),
  /** Reverse charge: an EU business outside NL with a VIES-valid number. */
  v.literal("reverse"),
  /** Outside the EU: no VAT. */
  v.literal("none"),
);

export default defineSchema({
  /**
   * The party that bought a block or won a banner day. One row per party,
   * however many things they hold.
   *
   * ⚠️ Two rows, not one: this is the domain party and Better Auth keeps its own
   * user table. `userId` stays empty until the magic link is followed, and an
   * owner who never follows theirs is an owner all the same (ticket 08). The
   * join is on `emailNormalised`, which is why that has an index and `email`
   * does not — the address as typed is kept for the invoice, and matched on the
   * normalised form.
   */
  owners: defineTable({
    /** The company name. Public: it is what the board's tooltip says. */
    name: v.string(),
    /** As Stripe gave it. Kept for the invoice, never matched on. */
    email: v.string(),
    /** Lower-cased and trimmed. The only thing the account join looks at. */
    emailNormalised: v.string(),
    /** The Better Auth user, once they have signed in at least once. */
    userId: v.optional(v.string()),
    /**
     * Live strikes against this owner (ticket 11). Strikes count on the owner
     * and not on the block, because per-block counting hands a four-block owner
     * twelve of them. A strike expires after twelve months, so this is a list of
     * timestamps and not a number: the count is whatever is still inside the
     * window when it is read.
     */
    strikeAt: v.array(v.number()),
    createdAt: v.number(),
  })
    .index("by_email", ["emailNormalised"])
    .index("by_user", ["userId"]),

  /**
   * A rectangle somebody owns. The only record of ownership on the board.
   *
   * Every field here is paid for on every rerun of the board query for every
   * viewer (ADR 0001), so adding one is a cost decision. Nothing about money,
   * and nothing about the order that produced it, is allowed in.
   */
  blocks: defineTable({
    rect,
    ownerId: v.id("owners"),
    /**
     * Where a click on this block goes, bare — no scheme. A block always has
     * its own: one owner can hold several and point each somewhere else.
     */
    url: v.string(),
    /** null until the owner supplies it. A block without it reads `pending`. */
    artwork: v.union(artwork, v.null()),
    /**
     * Frozen by the third live strike (ticket 11). Still owned, still on the
     * board, but no artwork and no link may be set. It renders exactly like a
     * block waiting for artwork.
     */
    frozen: v.boolean(),
    /** The order this block came out of. Nothing on the board path reads it. */
    orderId: v.optional(v.id("orders")),
    createdAt: v.number(),
  }).index("by_owner", ["ownerId"]),

  /**
   * The claim a visitor holds on a rectangle while they are away paying.
   *
   * ⚠️ It identifies nobody. No cookie, no session, no address — the id rides in
   * the Stripe session metadata and the webhook brings it back, which is what
   * keeps the board page cookie-free (ticket 02).
   *
   * Expiry is lazy on read plus a cron that sweeps: a row past `expiresAt` does
   * not count against anybody, whether or not the sweep has run.
   */
  reservations: defineTable({
    rect,
    /** Absolute UTC ms. 15 minutes from creation (fixed by charting). */
    expiresAt: v.number(),
    /**
     * ⚠️ The one thing here that is about the visitor, and it is the price of
     * ticket 06's flood control: *one live reservation per IP*. It is a salted
     * hash and never the address itself, it is only ever compared for equality,
     * and it dies with the row an hour after the hold expires. Optional, because
     * a row written before ticket 16 has none and the sweep will take it.
     */
    ipHash: v.optional(v.string()),
    /** Set once the Checkout Session exists. Ticket 16 fills it in. */
    stripeSessionId: v.optional(v.string()),
    /**
     * Ended early — the visitor came back through Stripe's back link, or the
     * webhook turned this into a block. Kept rather than deleted so a late
     * webhook can tell "expired" from "never existed".
     */
    releasedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_expiry", ["expiresAt"])
    .index("by_session", ["stripeSessionId"]),

  /**
   * What Stripe did, and what the buyer told the site about themselves. It is
   * written once and never changes: an invoice is rendered from this row and a
   * rate that changes next year must not change last year's invoice.
   *
   * Kept ten years (ticket 06). Not read by anything on the board path.
   */
  orders: defineTable({
    /** The key against double processing. Unique — one session, one order. */
    stripeSessionId: v.string(),
    /** What to refund against, and what a chargeback will name. */
    paymentIntentId: v.optional(v.string()),
    /** A square purchase, or one day of the banner. */
    kind: v.union(v.literal("squares"), v.literal("banner")),
    ownerId: v.id("owners"),
    /** Set for `kind: "squares"`. The banner has a `bannerDays` row instead. */
    rect: v.optional(rect),
    /** `YYYY-MM-DD` for `kind: "banner"`. */
    bannerDate: v.optional(v.string()),

    // The ticket 03 fields, frozen at the moment of sale.
    buyerType: v.union(v.literal("business"), v.literal("consumer")),
    /** ISO 3166-1 alpha-2, as the buyer chose it in the panel. */
    country: v.string(),
    /** The country Stripe's billing address actually said, where they differ. */
    stripeCountry: v.optional(v.string()),
    /** Set when the two disagree. Accepted, never refused (ticket 06). */
    countryMismatch: v.boolean(),
    name: v.string(),
    address: v.string(),
    vatNumber: v.optional(v.string()),
    /** VIES gave this back. Stored, and never printed on the invoice. */
    viesRequestIdentifier: v.optional(v.string()),
    withdrawalWaived: v.boolean(),
    /**
     * ⚠️ The exact words the buyer was shown, as words. Ticket 03 asked for the
     * wording and not a version number, so that it stays readable in 2036
     * without the code of the day it was shown.
     */
    withdrawalText: v.string(),
    invoiceText: v.string(),
    /** The client IP when the order was placed. Evidence, and nothing else. */
    ip: v.string(),

    // Money. Whole cents, USD.
    /** What the buyer paid, VAT included. This is the number on the card. */
    totalCents: v.number(),
    /** The VAT inside `totalCents`, or 0. */
    vatCents: v.number(),
    /** 2100 means 21.00%. An integer of basis points, so no float rounds. */
    vatRateBps: v.number(),
    vatCase,
    /**
     * ⚠️ How the price was built. A first sale is VAT-inclusive; a V1.1 resale
     * is VAT-on-top. The invoice template reads this rather than assuming, or
     * every resale invoice is wrong by 21% (ticket 17).
     */
    pricing: v.union(v.literal("inclusive"), v.literal("onTop")),

    // The euro leg of the invoice, frozen with the rest.
    /** USD per EUR, the ECB daily reference rate. */
    fxRate: v.optional(v.number()),
    /** ⚠️ The date the rate was published. Without it a weekend invoice is unprovable. */
    fxRateDate: v.optional(v.string()),
    fxSource: v.optional(v.string()),

    /**
     * ⚠️ Set where the squares had gone by the time the webhook arrived. Ticket
     * 05: the webhook wins whenever the squares are still free, and refunds in
     * full automatically when they are not. The order is still written, because
     * money moved and then moved back and both belong in the ten-year record —
     * but there are no blocks behind it and
     * [ticket 23](../.scratch/200squares-v1/issues/23-build-invoice.md) must not
     * give it an invoice number.
     */
    refundedAt: v.optional(v.number()),
    refundReason: v.optional(v.string()),

    createdAt: v.number(),
  })
    .index("by_session", ["stripeSessionId"])
    /**
     * ⚠️ Ticket 07 asked for the ticket 03 fields as **remembered defaults** on
     * `owners`, and they are not there: an order already freezes every one of
     * them, and `owners` is read whole by the board query (ADR 0001), so four
     * more columns on it would be paid for by every viewer on every write. The
     * bidder's last order is the same answer for free — and it is honest about
     * what it is, because ticket 07 called these a form filler, not the record.
     */
    .index("by_owner", ["ownerId"]),

  /**
   * The invoice as a document. One per order, one series per calendar year.
   *
   * The number is allocated inside the mutation that writes the row, so no
   * number is ever taken by something that then fails.
   */
  invoices: defineTable({
    orderId: v.id("orders"),
    /** `2026-0001`. Unique inside its year. */
    number: v.string(),
    year: v.number(),
    /** ⚠️ Keyed on a random token, never on the number: an invoice carries a name. */
    token: v.string(),
    /**
     * The rendered HTML, written once and never recomputed.
     *
     * ⚠️ Optional, and the reason is the number. Ticket 17 puts the allocation
     * **inside the mutation that writes the invoice**, so no number is ever
     * spent on something that then fails — but the number is printed *in* the
     * document, so the row has to exist before the file can be rendered. A
     * mutation cannot write a file (that is an action's), so the row lands
     * first and the file is patched on a moment later.
     *
     * A row with no file is therefore an invoice that is still being written,
     * and never a gap in the series. `sweepMissing` finishes one whose action
     * died: the number, the token and every frozen field are already fixed, so
     * a re-render produces the same document byte for byte.
     */
    storageId: v.optional(v.id("_storage")),
    issuedAt: v.number(),
  })
    .index("by_order", ["orderId"])
    .index("by_token", ["token"])
    .index("by_year", ["year"]),

  /**
   * One row per clickable thing, patched in place. Not a row per click.
   *
   * ⚠️ No time field, ever. /privacy promises that nothing about when a click
   * happened is written down, and that promise is what makes the count safe to
   * keep without consent. The board query never reads this table (ADR 0001).
   */
  clickCounts: defineTable({
    /** A block, or a banner day's `YYYY-MM-DD`. One namespace, one index. */
    target: v.union(
      v.object({ kind: v.literal("block"), blockId: v.id("blocks") }),
      v.object({ kind: v.literal("banner"), date: v.string() }),
    ),
    count: v.number(),
  }).index("by_target", ["target"]),

  /**
   * One day of banner occupancy, keyed on the UTC date string `YYYY-MM-DD`.
   *
   * ⚠️ A date string and not an offset or a timestamp, so the 00:00 UTC day can
   * never drift. **No row means no winner**, which is the house ad.
   */
  bannerDays: defineTable({
    /** `YYYY-MM-DD`, UTC. Unique. */
    date: v.string(),
    ownerId: v.optional(v.id("owners")),
    url: v.optional(v.string()),
    artwork: v.union(artwork, v.null()),
    /** The winning bid in cents, once it has been captured. */
    wonWithCents: v.optional(v.number()),
    /**
     * Set by whichever of the cron and the lazy close gets there first. A second
     * run is then a no-op, which is the whole point of keeping it (ticket 07).
     */
    closedAt: v.optional(v.number()),
    /** Removed for the rest of its day by the admin. The house ad stands in. */
    removedAt: v.optional(v.number()),
  }).index("by_date", ["date"]),

  /**
   * One bid, and the card hold behind it.
   *
   * ⚠️ The status is not decoration. After 00:00 UTC the site has to know which
   * holds still need releasing, and without a status it cannot see that.
   */
  bids: defineTable({
    /** The banner day bid for, `YYYY-MM-DD` UTC. */
    date: v.string(),
    /**
     * ⚠️ Empty until Stripe has said who paid. A bid is opened before the card
     * is seen, the same way a reservation is taken before the buyer is known,
     * and the address that makes an owner arrives with the webhook (ticket 08).
     */
    ownerId: v.optional(v.id("owners")),
    amountCents: v.number(),
    /** The manual-capture PaymentIntent holding the money. Set when it exists. */
    paymentIntentId: v.optional(v.string()),
    /**
     * ⚠️ Read on every bid: a hold that would die before the coming 00:00 UTC is
     * refused, so the bidder can reach for another card while they are still
     * looking at the screen (ticket 07).
     */
    captureBefore: v.optional(v.number()),
    /**
     * ⚠️ `pending` is ticket 19's, and it is the bid's half of a reservation: a
     * row that exists so the amount and the caller can be judged **before**
     * Stripe is asked for anything. Nothing outside the bid's own two screens
     * ever sees one — `auction.live` shows `held` and nothing else.
     *
     * `held` is a live card authorization. ⚠️ It stays held while the bidder is
     * outbid: ticket 07's rule is that **nothing is released until somebody has
     * paid**, and a runner-up with no hold cannot be promoted at the close.
     */
    status: v.union(
      v.literal("pending"),
      v.literal("held"),
      v.literal("captured"),
      v.literal("released"),
      v.literal("failed"),
    ),
    /** The Checkout Session the hold was taken through. One session, one bid. */
    stripeSessionId: v.optional(v.string()),
    /** A pending bid dies fifteen minutes after it was opened, like a hold. */
    pendingUntil: v.optional(v.number()),
    /**
     * The same salted hash a reservation keeps, and for the same reason: one
     * pending bid per caller, so opening rows is not a free way to spend the
     * site's Stripe quota. It never travels with a bid that became a hold.
     */
    ipHash: v.optional(v.string()),
    /**
     * What the winner's banner will show, attached to the bid while it stands
     * (ticket 07). Optional and replaceable — the winner gets no preparation
     * time, so a prepared bidder gets the whole day and an unprepared one gets
     * the house ad until they upload. Copied onto `bannerDays` at the close.
     *
     * ⚠️ `artwork` is written by [ticket 20](../.scratch/200squares-v1/issues/20-build-artwork.md),
     * which owns the upload. Ticket 19 built the field, the link beside it and
     * the copy onto the banner day.
     */
    url: v.optional(v.string()),
    artwork: v.optional(artwork),
    /** The order this bid became, once it was captured. */
    orderId: v.optional(v.id("orders")),
    placedAt: v.number(),
  })
    .index("by_date", ["date"])
    .index("by_owner", ["ownerId"])
    .index("by_session", ["stripeSessionId"])
    .index("by_payment_intent", ["paymentIntentId"]),

  /**
   * What the admin did to a block, and why. Kept ten years.
   *
   * About an **owner**, not a visitor, so /privacy is untouched by it. Without
   * this table the strike rule is unbuildable (ticket 11).
   */
  removals: defineTable({
    blockId: v.optional(v.id("blocks")),
    /** `YYYY-MM-DD` where a banner day was the thing removed. */
    bannerDate: v.optional(v.string()),
    ownerId: v.id("owners"),
    /**
     * Which rule of /terms was broken.
     *
     * ⚠️ **Absent means nobody broke anything** — the row is a banner day the
     * bidder withdrew from ([ticket 32](../.scratch/200squares-v1/issues/32-build-withdrawn-banner-day.md)),
     * which takes no strike and sends no mail. It is one field rather than a
     * rule plus a `withdrawn` flag, because two fields can disagree about the
     * same row and this one cannot.
     */
    rule: v.optional(v.string()),
    /**
     * The reason as the admin wrote it. It goes to the owner verbatim — except
     * on a withdrawal, where nothing is sent and this is the dev's own note for
     * the ten-year record.
     */
    reason: v.string(),
    /** Whether this removal was the one that froze the block. */
    froze: v.boolean(),
    removedAt: v.number(),
    /**
     * When the picture stopped being served from Vercel's edge.
     *
     * ⚠️ **Absent means the removal only half happened.** Deleting the file from
     * Convex does not touch the copy `/art/<id>` caches for a year, so until the
     * tag is purged the reported picture is still public at the address that was
     * reported ([ADR 0004](../docs/adr/0004-a-year-is-a-cache-not-a-promise.md)).
     * `/admin` lists any row that has no date here, because a removal that half
     * happened must not look like one that happened.
     *
     * It is set on a removal that had nothing to purge as well — an empty block,
     * or a file another block still shares — since in both cases nothing is left
     * serving and there is nothing to chase.
     */
    purgedAt: v.optional(v.number()),
  })
    .index("by_owner", ["ownerId"])
    .index("by_block", ["blockId"]),

  /**
   * Rows that exist only to be read cheaply, each rewritten by a cron.
   *
   * ⚠️ This is the fan-out escape, and it is the same idea twice. A live query
   * reruns for every subscriber on every write it depends on. A query that reads
   * one of these rows instead reruns only when the cron rewrites it — so the
   * cost stops following the writes.
   *
   *   `board`      — the kill switch's snapshot. Ticket 05 asked for one
   *                  environment variable that falls the board back with no
   *                  deploy; `BOARD_LIVE=false` makes the board query read this
   *                  row instead of the tables.
   *   `siteClicks` — the public total on /how-it-works, an hour old on purpose.
   *                  That page holds a websocket by design, so a live total
   *                  would rerun it for every viewer on every click anywhere
   *                  (ticket 10).
   *   `fx`         — the last ECB daily reference rate, with the date the ECB
   *                  published it. ⚠️ Not a cache in the fan-out sense: it is
   *                  here because an invoice is written in a mutation and the
   *                  ECB is on the network. The **date** is the load-bearing
   *                  half — the ECB publishes on working days only, so a
   *                  Saturday invoice quotes Friday's rate and has to be able
   *                  to say so (ticket 17).
   */
  cached: defineTable({
    key: v.union(v.literal("board"), v.literal("siteClicks"), v.literal("fx")),
    /** Whatever the reader expects. Shape is the reader's business. */
    value: v.any(),
    builtAt: v.number(),
  }).index("by_key", ["key"]),
});
