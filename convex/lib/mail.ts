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
