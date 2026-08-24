// The shell every page beside the board shares.
//
// One measure, one rhythm, and the same hairlines as the board: these pages are
// the back matter of the same register, not a different site. The board page
// keeps its own shell — it is one screen and it has no footer.

import { Footer } from "./footer";

export function ContentPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="flex-1">
        <header className="border-hairline border-t">
          <div className="mx-auto w-full max-w-[1180px] px-4 py-12 lg:px-8 lg:py-16">
            <h1 className="font-display text-[clamp(34px,7vw,64px)] leading-[0.92]">{title}</h1>
            {intro ? <p className="max-w-[62ch] pt-4 text-[17px] leading-snug">{intro}</p> : null}
          </div>
        </header>
        {children}
      </main>
      <Footer />
    </>
  );
}
