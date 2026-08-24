// The parts the page under the canvas is built from.
//
// The board is a register of 199 squares, so the page under it is the register's
// back matter: a heading in the left rail, the text in the column beside it, and
// a hairline between every entry. Nothing is boxed and nothing is carded — the
// sheet the canvas lies on runs all the way down.
//
// The accent belongs to the auction and to nothing else (ticket 05), so below
// the fold it appears exactly once: on the line about bidding.

export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-hairline border-t">
      <div className="mx-auto grid w-full max-w-[1180px] gap-x-12 gap-y-6 px-4 py-12 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:px-8 lg:py-16">
        <h2 className="font-display text-[clamp(26px,4.2vw,38px)] leading-[0.95]">{title}</h2>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}

/** Body copy. One measure, everywhere, so the column never changes rhythm. */
export function P({ children }: { children: React.ReactNode }) {
  return <p className="max-w-[62ch] pb-4 text-[15px] leading-[1.6] last:pb-0">{children}</p>;
}

/** A heading inside a column, for the one place a section has two parts. */
export function Subhead({ children }: { children: React.ReactNode }) {
  return <h3 className="pt-6 pb-2 text-[14px] font-semibold">{children}</h3>;
}
