// The five messages ticket 18 did not need, and the reminders that go with them.
//
// ⚠️ [Ticket 13](../.scratch/200squares-v1/issues/13-email.md) fixed the list at
// six, and the transport is `convex/lib/mail.ts` — one `fetch` to Resend, built
// by ticket 18 for the magic link. Nothing here opens a second way out.
//
//   magic link              ticket 18, in `auth.ts`
//   outbid, won             ticket 19, in `auction.ts`
//   order confirmed         here
//   refunded in full        here
//   block removed           here, called by the admin's one press (ticket 24)
//   artwork reminders       here, at 1, 7 and 30 days
//
// ⚠️ **Everything here is an action, and every caller schedules it.** A mutation
// may not reach the network, and — more to the point — a Resend outage must never
// undo a payment that has already landed. So the mutation commits and the mail
// is a separate thing that either happens or is missing, which is the failure
// worth having.
//
// ⚠️ **The reminders are scheduled, not swept.** `checkout.fulfil` books all
// three the moment the block is written, 1, 7 and 30 days out, and each one
// looks at the block before it sends. That is why no `remindedAt` column exists:
// a cron would need one to avoid sending twice, and a scheduled job that checks
// the state it is about to talk about needs nothing at all.

import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction, internalQuery } from "./_generated/server";
import { cellCount, squareRange } from "./lib/board";
import {
  artworkReminderMail,
  bannerInvoiceMail,
  orderConfirmedMail,
  refundedMail,
  removedMail,
  sendMail,
  withdrawalConfirmedMail,
  withdrawalForDevMail,
} from "./lib/mail";
import { withdrawUrl } from "./lib/withdrawal";

/** Where the buyer's own grant lives: ticket 06's return page (no account). */
const artworkUrl = (stripeSessionId: string) =>
  `${process.env.SITE_URL ?? "https://200squares.com"}/thanks?session_id=${stripeSessionId}`;

/** Where the dev reads what is still owed. Ticket 43's list. */
const adminUrl = () => `${process.env.SITE_URL ?? "https://200squares.com"}/admin`;

/**
 * Where the dev's own copy goes.
 *
 * ⚠️ **The first of `ADMIN_EMAILS`, falling back to `hello@`.** That variable is
 * already the one thing that says who the admin is (ticket 08), so a second one
 * naming the same person is a second thing to get wrong. `hello@` is a real
 * inbox a person reads — ticket 13 refused a `no-reply@` — so the fallback loses
 * nothing on a deployment with no admin set.
 */
const devAddress = () =>
  (process.env.ADMIN_EMAILS ?? "").split(",")[0].trim() || "hello@200squares.com";

/** What a mail about an order has to say, gathered in one read. */
export const forOrder = internalQuery({
  args: { orderId: v.id("orders") },
  returns: v.union(
    v.null(),
    v.object({
      email: v.string(),
      kind: v.union(v.literal("squares"), v.literal("banner")),
      what: v.string(),
      squares: v.number(),
      totalCents: v.number(),
      stripeSessionId: v.string(),
      bannerDate: v.string(),
      refunded: v.boolean(),
      /**
       * The consumer's withdrawal address, or empty.
       *
       * ⚠️ Empty is the business case and it must stay empty: naming a function
       * that does not exist for this buyer is worse than naming none.
       */
      withdrawUrl: v.string(),
      /** Whether the block this order bought is still waiting for a picture. */
      pending: v.boolean(),
    }),
  ),
  handler: async (ctx, { orderId }) => {
    const order = await ctx.db.get(orderId);
    if (!order) return null;
    const owner = await ctx.db.get(order.ownerId);
    const block = order.rect
      ? (
          await ctx.db
            .query("blocks")
            .withIndex("by_owner", (q) => q.eq("ownerId", order.ownerId))
            .collect()
        ).find((b) => b.orderId === orderId)
      : undefined;

    return {
      email: owner?.email ?? "",
      kind: order.kind,
      what: order.rect ? `Square ${squareRange(order.rect)}` : `the banner on ${order.bannerDate ?? ""}`,
      squares: order.rect ? cellCount(order.rect) : 0,
      totalCents: order.totalCents,
      stripeSessionId: order.stripeSessionId,
      bannerDate: order.bannerDate ?? "",
      refunded: Boolean(order.refundedAt),
      withdrawUrl: order.withdrawalToken ? withdrawUrl(order.withdrawalToken) : "",
      pending: Boolean(block) && !block?.artwork && !block?.frozen,
    };
  },
});

/**
 * The mail a buyer keeps: what was bought, the invoice, and the way back to the
 * artwork.
 *
 * ⚠️ **The invoice is issued here, not before.** Issuing it is the first thing
 * this does, so the mail either carries a live link or is not sent at all —
 * a receipt that points at a document which does not exist yet is worse than a
 * receipt that arrives a minute later, and `invoices.sweepMissing` is what
 * catches the minute.
 */
export const orderConfirmed = internalAction({
  args: { orderId: v.id("orders") },
  returns: v.null(),
  handler: async (ctx, { orderId }) => {
    const order = await ctx.runQuery(internal.mail.forOrder, { orderId });
    if (!order || !order.email || order.refunded) return null;

    const url = await ctx.runAction(internal.invoices.issue, { orderId });
    if (!url) return null;

    const mail =
      order.kind === "banner"
        ? bannerInvoiceMail({
            date: order.bannerDate,
            totalCents: order.totalCents,
            invoiceUrl: url,
          })
        : orderConfirmedMail({
            what: order.what,
            squares: order.squares,
            totalCents: order.totalCents,
            invoiceUrl: url,
            artworkUrl: artworkUrl(order.stripeSessionId),
            // ⚠️ Art. 6:230m lid 1 sub h. The banner's half is on `wonMail`
            // instead — that day is over before this invoice mail matters.
            withdrawUrl: order.withdrawUrl || undefined,
          });
    await sendMail({ to: order.email, subject: mail.subject, text: mail.text });
    return null;
  },
});

/**
 * We refunded you in full.
 *
 * ⚠️ Sent **after** Stripe has taken the refund, never before: the message says
 * the money is on its way back, and the site does not get to say that until it
 * is. `convex/http.ts` calls this from the branch where the refund succeeded, so
 * a webhook retry that finds the charge already refunded sends nothing — the
 * buyer has had this once.
 */
export const refunded = internalAction({
  args: { orderId: v.id("orders") },
  returns: v.null(),
  handler: async (ctx, { orderId }) => {
    const order = await ctx.runQuery(internal.mail.forOrder, { orderId });
    if (!order || !order.email) return null;
    const mail = refundedMail({ totalCents: order.totalCents });
    await sendMail({ to: order.email, subject: mail.subject, text: mail.text });
    return null;
  },
});

/**
 * One artwork reminder, at 1, 7 or 30 days.
 *
 * ⚠️ It checks the block before it sends, and that check is the whole design: a
 * square that has its picture, was refunded, or was frozen gets nothing. A
 * reminder about something already done is the kind of mail that teaches people
 * to ignore the sender.
 */
export const artworkReminder = internalAction({
  args: {
    orderId: v.id("orders"),
    day: v.union(v.literal(1), v.literal(7), v.literal(30)),
  },
  returns: v.null(),
  handler: async (ctx, { orderId, day }) => {
    const order = await ctx.runQuery(internal.mail.forOrder, { orderId });
    if (!order || !order.email || order.refunded || !order.pending) return null;
    const mail = artworkReminderMail({ day, artworkUrl: artworkUrl(order.stripeSessionId) });
    await sendMail({ to: order.email, subject: mail.subject, text: mail.text });
    return null;
  },
});

/**
 * Your block was removed, with the reason as the admin wrote it.
 *
 * ⚠️ Scheduled by the one press that does the other three things
 * ([ticket 24](../.scratch/200squares-v1/issues/24-build-removal.md)), so the
 * strike, the record, the stripping and this message are one act. The count
 * travels with it because ticket 11 made the warning part of the rule.
 */
export const removed = internalAction({
  args: {
    to: v.string(),
    what: v.string(),
    rule: v.string(),
    reason: v.string(),
    strikes: v.number(),
    frozen: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (!args.to) return null;
    const mail = removedMail({
      what: args.what,
      rule: args.rule,
      reason: args.reason,
      strikes: args.strikes,
      frozen: args.frozen,
    });
    await sendMail({ to: args.to, subject: mail.subject, text: mail.text });
    return null;
  },
});

/**
 * The two messages one press owes: art. 11a lid 4 to the consumer, and the
 * clock to the dev.
 *
 * ⚠️ **Without undue delay**, which is why it is scheduled at zero from inside
 * the declaring transaction rather than swept for later. If the write rolls
 * back, no message was ever booked; if it commits, both are on the list whatever
 * Resend is doing.
 *
 * ⚠️ **The consumer's copy goes to the address they confirmed**, which is
 * art. 11a lid 2 sub c: *the electronic means by which the confirmation of the
 * withdrawal will be sent*. Where that differs from the address on the order,
 * the dev's copy names both — they are the person who has to notice.
 */
export const withdrawalDeclared = internalAction({
  args: { withdrawalId: v.id("withdrawals") },
  returns: v.null(),
  handler: async (ctx, { withdrawalId }) => {
    const row = await ctx.runQuery(internal.withdrawal.forMail, { withdrawalId });
    if (!row) return null;

    if (row.email) {
      const mail = withdrawalConfirmedMail({
        what: row.what,
        shownText: row.shownText,
        note: row.note,
        declaredAt: row.declaredAt,
        kind: row.kind,
      });
      await sendMail({ to: row.email, subject: mail.subject, text: mail.text });
    }

    const dev = withdrawalForDevMail({
      what: row.what,
      name: row.name,
      email: row.email,
      note: row.note,
      declaredAt: row.declaredAt,
      totalCents: row.totalCents,
      kind: row.kind,
      adminUrl: adminUrl(),
    });
    await sendMail({ to: devAddress(), subject: dev.subject, text: dev.text });
    return null;
  },
});
