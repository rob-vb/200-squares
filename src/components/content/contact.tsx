// The one place a person is named.
//
// Ticket 07 ruled out a form and a mailto: a form that silently discarded a
// message would be the one place this prototype lies to a visitor. A handle is
// neither — it goes to a real profile and it answers there — so it is a link,
// and the only outward link on these pages.

export const HANDLE = "@the_robvb";
const PROFILE = "https://x.com/the_robvb";

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
      on X
    </p>
  );
}
