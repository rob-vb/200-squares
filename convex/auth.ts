// Accounts: who the caller is, and the two guards every protected write uses.
//
// ⚠️ [Ticket 08](../.scratch/200squares-v1/issues/08-accounts.md) decided the
// shape and it is worth stating once, here, because the order is the whole
// design: **the webhook makes an owner, Better Auth makes the user, and the
// board never asks who is looking.**
//
//   An `owners` row is written the moment a payment lands. It is what makes
//   somebody an owner, and it needs no account at all.
//
//   A Better Auth **user** appears later, when a magic link is followed — which
//   is the moment the address is proved. Writing one from the webhook would be
//   writing half a user whose email nobody has checked.
//
//   The two are joined on the **normalised email**, in whichever order they
//   happen: the trigger below joins them when the user is made, and
//   `currentOwner` joins them by address when the owner row came second.
//
// An owner who never follows their link is an owner all the same. The account is
// how you come back; it is not what makes the square yours.

import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth/minimal";
import { magicLink } from "better-auth/plugins/magic-link";
import { captcha } from "better-auth/plugins";
import { ConvexError, v } from "convex/values";
import { components } from "./_generated/api";
import type { DataModel, Doc, Id } from "./_generated/dataModel";
import { internalAction, type MutationCtx, type QueryCtx } from "./_generated/server";
import authConfig from "./auth.config";
import { magicLinkMail, sendMail } from "./lib/mail";

/** Lower-cased and trimmed. The only form the owner join ever matches on. */
export const normalise = (email: string) => email.trim().toLowerCase();

const siteUrl = process.env.SITE_URL;

/**
 * Origins Better Auth will accept a sign-in from.
 *
 * `baseURL` puts its own origin on the list already. The wildcard is added only
 * where the site itself is a Vercel preview: ticket 14 made the branch URL the
 * staging address, so a branch has to be able to sign in. ⚠️ On production
 * `SITE_URL` is `https://200squares.com` and the wildcard is **not** added —
 * trusted origins are the CSRF guard, and a rule that trusts every site on
 * `vercel.app` has no business on the real domain.
 */
const trustedOrigins = siteUrl?.endsWith(".vercel.app") ? ["https://*.vercel.app"] : [];

export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) =>
  betterAuth({
    baseURL: siteUrl,
    trustedOrigins,
    database: authComponent.adapter(ctx),
    // No password, no OAuth. The email is the only key (ticket 08), which is
    // also why /terms has to say what a dead inbox means.
    emailAndPassword: { enabled: false },
    plugins: [
      magicLink({
        // ⚠️ One hour, not Better Auth's five minutes. The default assumes
        // somebody who just asked for a link is still at the keyboard; this one
        // arrives after a payment and may be opened that evening.
        expiresIn: 60 * 60,
        sendMagicLink: async ({ email, url }) => {
          const mail = magicLinkMail(url);
          await sendMail({ to: email, subject: mail.subject, text: mail.text });
        },
      }),
      // ⚠️ Turnstile on the sign-in endpoint and nowhere else. "Send me a link"
      // is an unauthenticated write that spends Resend's free 3,000 a month, and
      // the first thing a loop on it breaks is the only key to every account
      // (tickets 08 and 13). The browser sends the token as `x-captcha-response`.
      //
      // It guards the HTTP endpoint, so it does **not** stand in the way of the
      // webhook: that path calls `auth.api.signInMagicLink` directly.
      captcha({
        provider: "cloudflare-turnstile",
        secretKey: process.env.TURNSTILE_SECRET_KEY ?? "",
        endpoints: ["/sign-in/magic-link"],
      }),
      convex({ authConfig }),
    ],
  });

/**
 * Ask Resend for a sign-in link, from somewhere that is not a browser.
 *
 * The webhook uses this: a payment has landed, an owner row exists, and the
 * buyer has never been asked to make an account. Ticket 08 put the send here
 * rather than in the buyer's hands.
 */
export const sendSignInLink = internalAction({
  args: { email: v.string() },
  returns: v.null(),
  handler: async (ctx, { email }) => {
    const auth = createAuth(ctx);
    // No caller and therefore no headers of its own. The endpoint wants a
    // `Headers` object; an empty one is the truthful answer here.
    await auth.api.signInMagicLink({ body: { email, callbackURL: "/" }, headers: new Headers() });
    return null;
  },
});

// ---------------------------------------------------------------------------
// The guards. Every protected write goes through one of these two and there are
// no others.

/**
 * The owner behind the caller's session, or null where there is none.
 *
 * ⚠️ **The address is the join, and `userId` is only a shortcut to it.** Ticket 08
 * asked for `owners.userId` to be filled when a magic link is followed. It is
 * filled — by `requireOwner` below, the first time the owner writes anything —
 * rather than by a trigger on the component's own user table, because the two
 * would be the same lookup at two moments and the trigger costs a cycle between
 * this module and its own generated API.
 *
 * So both lookups matter and neither is a repair. `by_user` answers once the
 * shortcut exists; `by_email` answers before it does, and answers the other
 * order too — an account made first and a square bought afterwards. Both are the
 * same rule: the normalised address is what makes them the same party.
 */
export async function currentOwner(ctx: QueryCtx): Promise<Doc<"owners"> | null> {
  const user = await authComponent.safeGetAuthUser(ctx);
  if (!user) return null;

  const byUser = await ctx.db
    .query("owners")
    .withIndex("by_user", (q) => q.eq("userId", user._id))
    .unique();
  if (byUser) return byUser;

  const email = normalise(String(user.email ?? ""));
  if (!email) return null;
  return await ctx.db
    .query("owners")
    .withIndex("by_email", (q) => q.eq("emailNormalised", email))
    .unique();
}

/**
 * ⚠️ The only place ownership is decided.
 *
 * Session → Better Auth user → `owners` row → the block's `ownerId`. Artwork,
 * links, bids and click counts all come through here, so a second way to decide
 * this question is a second way to get it wrong.
 *
 * It is also where `owners.userId` gets written: this is the first place with a
 * session, an owner row and permission to write, all at once.
 */
export async function requireOwner(ctx: MutationCtx, blockId: Id<"blocks">) {
  const owner = await currentOwner(ctx);
  if (!owner) throw new ConvexError("Sign in first.");
  if (!owner.userId) {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (user) await ctx.db.patch(owner._id, { userId: user._id });
  }
  const block = await ctx.db.get(blockId);
  if (!block) throw new ConvexError("There is no such block.");
  if (block.ownerId !== owner._id) throw new ConvexError("That block is not yours.");
  return { owner, block };
}

/**
 * The admin, which is one address in one environment variable.
 *
 * No Better Auth `admin` plugin — it is not on the supported list and it wants
 * its own columns. No role field and no `admins` table: there is one admin and
 * there will be one admin. `ADMIN_EMAILS` changes without a deploy, holds
 * nothing worth stealing, and is not in the repository (ticket 08).
 */
export async function requireAdmin(ctx: QueryCtx) {
  const user = await authComponent.safeGetAuthUser(ctx);
  if (!user) throw new ConvexError("Sign in first.");
  const email = normalise(String(user.email ?? ""));
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map(normalise)
    .filter(Boolean);
  // An unset variable admits nobody. A deployment with no admin is a deployment
  // with no admin page, which is the safe way round.
  if (!email || !admins.includes(email)) throw new ConvexError("That is not your page.");
  return user;
}
