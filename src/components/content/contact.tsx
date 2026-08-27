// The one place a person is named.
//
// Ticket 07 ruled out a form: a form that silently discarded a message would be
// the one place this site lies to a visitor. A handle is not one — it goes to a
// real profile and it answers there — so it is a link.
//
// ⚠️ **The address is here because the pages now depend on it** (ticket 40).
// `/terms` sends a person to `hello@200squares.com` to withdraw, to report a
// block and to recover a dead inbox, and `consent.ts` freezes it onto orders. A
// contact block that offered only a social handle left the statutory route off
// the one place a visitor looks for it. It is the same address the site sends
// from (ticket 13: never a `no-reply@`), so a reply to any message lands there
// too.

export const HANDLE = "@the_robvb";
const PROFILE = "https://x.com/the_robvb";
export const CONTACT_EMAIL = "hello@200squares.com";

export function Contact({ lead }: { lead?: string }) {
  return (
    <p className="max-w-[62ch] text-[15px] leading-[1.6]">
      {lead ? `${lead} ` : null}
      Rob —{" "}
      <a
        href={PROFILE}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-accent underline transition-colors duration-150"
      >
        {HANDLE}
      </a>{" "}
      on X, or{" "}
      <a
        href={`mailto:${CONTACT_EMAIL}`}
        className="hover:text-accent underline transition-colors duration-150"
      >
        {CONTACT_EMAIL}
      </a>
      .
    </p>
  );
}
