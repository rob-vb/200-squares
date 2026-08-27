// One way out to Resend, and the one message ticket 18 owes.
//
// ⚠️ [Ticket 22](../../.scratch/200squares-v1/issues/22-build-email.md) owns the
// mail — six messages, the artwork reminders, the tone. This file exists because
// ticket 18 cannot be built without the **magic link**, which ticket 13 called
// the one that may not fail: it is the only key to an account. So the transport
// is built here and ticket 22 takes it over and adds the rest to it.
//
// A plain `fetch` and not the Resend SDK. Convex runs on V8, the REST call is
// three fields, and a dependency that reaches for Node's http module is a thing
// that fails at run time rather than at build time.

/** The one address the site sends from. ⚠️ Never `no-reply@` — ticket 13. */
const FROM = "200 squares <hello@200squares.com>";

/**
 * Send one message. Throws where Resend refuses it.
 *
 * ⚠️ It throws rather than swallowing, and that is deliberate for the magic
 * link. A sign-in link that is silently not sent is an account that cannot be
 * reached, and the visitor is left watching a screen that says a mail is on its
 * way.
 */
export async function sendMail(mail: { to: string; subject: string; text: string }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set.");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: [mail.to], subject: mail.subject, text: mail.text }),
  });
  if (!res.ok) {
    throw new Error(`Resend refused the message: ${res.status} ${await res.text()}`);
  }
}

/**
 * The magic link, in words.
 *
 * The words are [ticket 13](../../.scratch/200squares-v1/issues/13-email.md)'s:
 * plain, short, and it stops when it is done. Two things are in it because the
 * decisions made them load-bearing — **the hour** (ticket 08 raised it from
 * Better Auth's five minutes, because this mail arrives after a payment and may
 * be opened that evening), and **the reply** (ticket 08 made emailing a person
 * the official way back into a locked-out account).
 */
export const magicLinkMail = (url: string) => ({
  subject: "Your sign-in link for 200 squares",
  text: [
    "Use this link to sign in to 200 squares:",
    "",
    url,
    "",
    "It works once and it expires in one hour.",
    "",
    "You never needed an account to buy a square. This is only how you come back",
    "to the ones you have.",
    "",
    "If something is wrong, reply to this message. A person reads it.",
  ].join("\n"),
});

/**
 * You have been outbid.
 *
 * ⚠️ Written to be true **whenever it is read**, which is
 * [ticket 13](../../.scratch/200squares-v1/issues/13-email.md)'s rule for every
 * auction mail: it names the close time and never a countdown. "Two minutes
 * left" is a lie by the time the message is opened, and it would be the site's
 * own copy telling it. Sent immediately, always, and a late one is never
 * suppressed — every cutoff is wrong for somebody.
 *
 * The second paragraph is the one ticket 07 made load-bearing: the hold stays.
 * Nothing is released until somebody has paid, so an outbid bidder's money is
 * still frozen and they are told so rather than finding out from their bank.
 */
export const outbidMail = (input: { yours: number; top: number; date: string }) => ({
  subject: "You have been outbid on the 200 squares banner",
  text: [
    `Somebody has bid more than you for the banner on ${input.date}.`,
    "",
    `Your bid: ${usd(input.yours)}. The top bid now: ${usd(input.top)}.`,
    "",
    "Your hold is still on your card. It stays there until the auction closes at",
    "00:00 UTC, because the banner goes to the highest bid that can actually be",
    "collected — and yours is next in line if the one above it cannot be. If you",
    "do not win, the hold is released at the close and your bank may take some",
    "days to show it.",
    "",
    "To take the lead back, bid again on 200squares.com.",
    "",
    "If something is wrong, reply to this message. A person reads it.",
  ].join("\n"),
});

/**
 * You won the banner.
 *
 * ⚠️ It says which of the two things happened, because ticket 07 left the winner
 * no preparation time: a prepared bidder's image is already up, and an
 * unprepared one is looking at the house ad until they upload.
 */
export const wonMail = (input: {
  amount: number;
  date: string;
  hasArtwork: boolean;
  promoted: boolean;
  /** Set for a consumer only. ⚠️ Art. 6:230m lid 1 sub h, as above. */
  withdrawUrl?: string;
}) => ({
  subject: `You have the 200 squares banner on ${input.date}`,
  text: [
    `Your bid of ${usd(input.amount)} won the banner for ${input.date}.`,
    `We collected the hold on your card at 00:00 UTC. The day runs to the next 00:00 UTC.`,
    // ⚠️ Ticket 38's mirror case. This reader was not the top bid and is not
    // expecting this message at all, so the mail says why it reached him — and
    // says the amount is his own in the same breath, because that is the first
    // thing he will look for.
    ...(input.promoted
      ? [
          "",
          "You were not the highest bid. The bid above yours could not be collected,",
          "so the banner is yours, for your own amount and nothing more.",
        ]
      : []),
    "",
    input.hasArtwork
      ? "Your image is on the board now."
      : "You attached no image, so the house advertisement is standing in your place. Sign in on 200squares.com and upload one; it goes up the moment you do.",
    // ⚠️ The banner's period is one day, so this is the only mail that can carry
    // the sub h information in time. It says **when** it runs out, because a
    // right that dies at 00:00 UTC and a mail read at 22:00 are close enough
    // together that "14 days" would be the wrong sentence here.
    ...(input.withdrawUrl
      ? [
          "",
          "You can withdraw from this day until it ends at 00:00 UTC. The button is",
          "in My squares under your order on 200squares.com, and it is called",
          "*withdraw from contract here*:",
          input.withdrawUrl,
        ]
      : []),
    "",
    "Your invoice follows.",
    "",
    "If something is wrong, reply to this message. A person reads it.",
  ].join("\n"),
});

/**
 * Your card was declined at the close.
 *
 * ⚠️ **The seventh message**, and it grows
 * [ticket 13](../../.scratch/200squares-v1/issues/13-email.md)'s deliberately
 * closed list of six. [Ticket 38](../../.scratch/200squares-v1/issues/38-declined-bidder-hears-nothing.md)
 * decided that rare is the reason to send it, not the reason to skip it: this is
 * the only path on the site where a person loses something and hears nothing.
 *
 * ⚠️ **It never says why the card was refused.** Stripe hands back a decline
 * code and that code is between the bidder and his bank. Stay vague and he looks
 * for the fault in the auction; repeat the code and the site explains a bank it
 * does not speak for. So: the charge was refused, and for the reason, ask the
 * bank.
 *
 * ⚠️ **It is not the outbid mail.** *You have been outbid* is false here —
 * nobody outbid him — and this is the one message that has to be honest.
 *
 * The last line is factual and nothing more. Ticket 38 refused a mail that
 * sells, which is the tone `/terms` refuses.
 */
export const declinedMail = (input: { amount: number; date: string }) => ({
  subject: `Your card was declined for the 200 squares banner on ${input.date}`,
  text: [
    `Your bid of ${usd(input.amount)} was the highest for the banner on ${input.date}.`,
    "At 00:00 UTC we asked your bank for the money and your bank refused the charge.",
    "",
    "We do not know why, and we will not guess. Your bank can tell you.",
    "",
    "The banner went to the next bid that could be collected. The hold on your card",
    "is released and nothing was taken from you. Your bank may take some days to",
    "show it.",
    "",
    "The auction for the next day is running on 200squares.com.",
    "",
    "If something is wrong, reply to this message. A person reads it.",
  ].join("\n"),
});

/** Whole cents to `$1,250`. Money is never a float, not even in a sentence. */
const usd = (cents: number) => `$${Math.round(cents / 100).toLocaleString("en-US")}`;

/** Whole cents to `$1,250.00`. What a receipt says, beside a card statement. */
const usdExact = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Order confirmed, with the invoice.
 *
 * ⚠️ [Ticket 13](../../.scratch/200squares-v1/issues/13-email.md) merged the
 * receipt and the confirmation into **one** mail, and switched Stripe's own
 * receipts off to keep it one: a Stripe receipt is not a VAT invoice, and two
 * documents where the prettier one is invalid is the worst of the three
 * options. So this is the mail a buyer keeps.
 *
 * Three things and no more: what was bought, where the invoice is, and the way
 * back to the artwork. That last link is ticket 06's grant — the Stripe session
 * id — and it works with no account, because the buyer was never asked to make
 * one.
 */
export const orderConfirmedMail = (input: {
  what: string;
  squares: number;
  totalCents: number;
  invoiceUrl: string;
  artworkUrl: string;
  /** Set for a consumer only. ⚠️ Art. 6:230m lid 1 sub h — see below. */
  withdrawUrl?: string;
}) => ({
  subject: "Your squares on 200 squares",
  text: [
    `You bought ${input.what} — ${input.squares} ${input.squares === 1 ? "square" : "squares"} on 200squares.com.`,
    `You paid ${usdExact(input.totalCents)}.`,
    "",
    `Your invoice: ${input.invoiceUrl}`,
    "",
    "Put your picture and your link on the square here:",
    input.artworkUrl,
    "",
    "That address needs no account and it keeps working. Until you use it the",
    "square stays empty, and there is no deadline on it.",
    // ⚠️ **The information duty, not the function.** Art. 6:230oa lid 1 asks for
    // a function on the *interface* and a link in a mail is not one — that is why
    // the button also sits on /thanks and in My squares. What this satisfies is
    // art. 6:230m lid 1 sub h: the existence and the **placement** of the
    // function. Leave the placement out and art. 6:230o lid 2 opens a
    // twelve-month withdrawal tail, which is the number ticket 42 was about.
    ...(input.withdrawUrl
      ? [
          "",
          "You have 14 days to withdraw from this purchase, counted from today. The",
          "button is called *withdraw from contract here*. It is on the page above,",
          "under your order, and it is in My squares once you have signed in:",
          input.withdrawUrl,
        ]
      : []),
    "",
    "If something is wrong, reply to this message. A person reads it.",
  ].join("\n"),
});

/**
 * The banner's half of the same mail.
 *
 * The winner has already had `wonMail`, which said the day was theirs and
 * whether their image was up. That one ends *your invoice follows*; this is it,
 * and it says nothing the other one already said.
 */
export const bannerInvoiceMail = (input: {
  date: string;
  totalCents: number;
  invoiceUrl: string;
}) => ({
  subject: `Your invoice for the 200 squares banner on ${input.date}`,
  text: [
    `The banner on ${input.date} cost ${usdExact(input.totalCents)}.`,
    "",
    `Your invoice: ${input.invoiceUrl}`,
    "",
    "If something is wrong, reply to this message. A person reads it.",
  ].join("\n"),
});

/**
 * We refunded you in full.
 *
 * ⚠️ Ticket 05's race, and the mail that makes it survivable: two payments
 * landed on the same squares and the second one gets every cent back,
 * automatically, without being asked. The money is already on its way when this
 * is sent — the refund is made first — so it states what happened rather than
 * what will happen.
 */
export const refundedMail = (input: { totalCents: number }) => ({
  subject: "We have refunded your payment for 200 squares",
  text: [
    "Somebody else paid for the same squares a moment before you did, so we could",
    "not give you the ones you chose.",
    "",
    `We have refunded ${usdExact(input.totalCents)} in full to the card you paid with. Your bank`,
    "may take some days to show it. Nothing is needed from you.",
    "",
    "The board has other squares, and they are on 200squares.com.",
    "",
    "If something is wrong, reply to this message. A person reads it.",
  ].join("\n"),
});

/**
 * Your block was removed.
 *
 * ⚠️ It carries the strike count, and that is
 * [ticket 11](../../.scratch/200squares-v1/issues/11-admin-removal.md)'s
 * decision rather than a courtesy: freezing somebody who never knew they were
 * at two is the exact complaint worth designing out. Deterring is better than
 * punishing.
 *
 * The reason goes out **as the admin wrote it**. It is one person writing to
 * another about their own square, and softening it in transit would make the
 * record and the message two different things.
 *
 * There is no appeal address and no status page: a reply to this mail is the
 * whole of it. `hello@` reaches a person, which is why ticket 13 refused a
 * `no-reply@`.
 */
export const removedMail = (input: {
  what: string;
  rule: string;
  reason: string;
  strikes: number;
  frozen: boolean;
}) => ({
  subject: `Your ${input.what} on 200 squares was emptied`,
  text: [
    `We took the artwork and the link off your ${input.what}.`,
    "",
    `The rule: ${input.rule}`,
    `What we saw: ${input.reason}`,
    "",
    input.frozen
      ? [
          "That is strike 3 of 3 in twelve months, so this block is now frozen. It is",
          "still yours and it stays on the board, but no artwork and no link can be set",
          "on it. Reply to this message if you want to talk about it.",
        ].join("\n")
      : [
          `That is strike ${input.strikes} of 3. The square stays yours: put something else on it.`,
          "Three strikes in twelve months freeze a block — it stays yours and stays on",
          "the board, but nothing new can be put on it.",
        ].join("\n"),
    "",
    "Nothing is refunded.",
    "",
    "If something is wrong, reply to this message. A person reads it.",
  ].join("\n"),
});

/**
 * The art. 11a lid 4 acknowledgement — the one mail on this site the law itself
 * writes the specification for.
 *
 * > Once the consumer activates the confirmation function, the trader shall send
 * > to the consumer an acknowledgement of receipt of the withdrawal on a durable
 * > medium, **including its content and the date and time of its submission**,
 * > without undue delay.
 *
 * ⚠️ **The eighth message**, and like ticket 38's it grows
 * [ticket 13](../../.scratch/200squares-v1/issues/13-email.md)'s closed list of
 * six — but this one is not a choice. Ticket 32 decided *no mail* on a
 * withdrawal because *"the dev is already in the thread"*; a button has no
 * thread, and lid 4 owes this whether or not anybody is minded to send it.
 *
 * ⚠️ **Three things are load-bearing and none of them may be prettified.** The
 * content of the declaration, in the words the consumer was shown; their own
 * line, given back to them because it is part of that content; and the date and
 * time, in UTC to the minute, because "yesterday evening" is not a submission
 * time.
 *
 * ⚠️ **It does not promise a date for the money.** Art. 6:230r lid 1 gives the
 * dev 14 days and ADR 0003 keeps the amount a judgement made by hand, so the
 * mail says the clock and not a day. A refund promised for Tuesday is a second
 * thing that can be broken.
 */
export const withdrawalConfirmedMail = (input: {
  what: string;
  shownText: string;
  note: string;
  declaredAt: number;
  kind: "squares" | "banner";
}) => ({
  subject: "We have your withdrawal",
  text: [
    "You withdrew from a contract with 200 squares. This message is the",
    "confirmation the law asks us to send you, and it is worth keeping.",
    "",
    `What you withdrew from: ${input.what}`,
    `What you declared: ${input.shownText}`,
    ...(input.note ? [`What you wrote: ${input.note}`] : []),
    `When you sent it: ${stamp(input.declaredAt)}`,
    "",
    input.kind === "banner"
      ? [
          "Your banner is already off the board. You pay for the hours that had run",
          "when you sent this, and nothing more.",
        ].join("\n")
      : [
          "Your square is still on the board while we settle up. A person works out",
          "what you are owed and pays it to the card you paid with.",
        ].join("\n"),
    "",
    "We have 14 days from the moment above to refund you. Your bank may take some",
    "days after that to show it.",
    "",
    "If something is wrong, reply to this message. A person reads it.",
  ].join("\n"),
});

/**
 * The dev's copy. ⚠️ Not a courtesy — a clock started.
 *
 * Art. 6:230r lid 1 gives 14 days from the declaration to refund, and the amount
 * is worked out by hand (ADR 0003). So this says what is owed, to whom, and by
 * when, and it points at the list on `/admin` that outlives it: a mail can be
 * lost and a list cannot.
 */
export const withdrawalForDevMail = (input: {
  what: string;
  name: string;
  email: string;
  note: string;
  declaredAt: number;
  totalCents: number;
  kind: "squares" | "banner";
  adminUrl: string;
}) => ({
  subject: `Withdrawal: ${input.what}`,
  text: [
    `${input.name} <${input.email}> withdrew from ${input.what}.`,
    `Sent: ${stamp(input.declaredAt)}. Paid: ${usdExact(input.totalCents)}.`,
    ...(input.note ? ["", `They wrote: ${input.note}`] : []),
    "",
    input.kind === "banner"
      ? "The banner is already off. Work out the hours that had run when they sent it, and refund the rest at Stripe."
      : "The square is still on the board. Judge the refund, pay it at Stripe, then press Refunded on /admin — that is what takes the block off and puts the rectangle back on the market.",
    "",
    "Refund inside 14 days of the time above (art. 6:230r lid 1).",
    "",
    input.adminUrl,
  ].join("\n"),
});

/** `2026-08-27 14:05 UTC`. ⚠️ To the minute, in UTC, and never a phrase. */
const stamp = (ms: number) =>
  `${new Date(ms).toISOString().slice(0, 16).replace("T", " ")} UTC`;

/**
 * The artwork reminders, at 1, 7 and 30 days.
 *
 * ⚠️ **The thirtieth says it is the last one**, which is
 * [ticket 06](../../.scratch/200squares-v1/issues/06-buying-for-real.md)'s rule:
 * `pending` has no deadline, the square is paid for and stays paid for, so a
 * fourth reminder would be the site nagging somebody about their own property.
 */
export const artworkReminderMail = (input: { day: 1 | 7 | 30; artworkUrl: string }) => ({
  subject: "Your square on 200 squares has no picture yet",
  text: [
    input.day === 1
      ? "You bought a square yesterday and it is still empty."
      : `You bought a square ${input.day} days ago and it is still empty.`,
    "",
    "Put your picture and your link on it here:",
    input.artworkUrl,
    "",
    "The square is yours whether you do or not, and there is no deadline.",
    input.day === 30 ? "This is the last reminder we send." : "",
    "",
    "If something is wrong, reply to this message. A person reads it.",
  ]
    .filter((line, i, all) => !(line === "" && all[i - 1] === ""))
    .join("\n"),
});
