"use client";

// How it works: the page beside the board. Five short blocks and a footer.
//
// It began as the page under the canvas. It moved out because the board is the
// product and a board with a document under it is two products — but the order
// ticket 07 fixed is unchanged, because it is the order a $250 buyer asks in:
// counter → what you get → how it works → the daily banner → FAQ → contact.
//
// Nobody speaks here. The product states facts, and one name appears at the end.

import { BannerRecord } from "./banner-record";
import { Contact } from "./contact";
import { Counter } from "./counter";
import { Footer } from "./footer";
import { P, Section, Subhead } from "./section";
import { BANNER, MAX_BLOCK, PRICE_PER_SQUARE } from "@/lib/board/geometry";

const STEPS: [string, string][] = [
  [
    "Pick your squares",
    `Drag a rectangle on the grid, up to ${MAX_BLOCK} wide and ${MAX_BLOCK} high. The price follows your drag.`,
  ],
  ["Pay $250 per square", "One payment. Three by two squares is $1,500."],
  [
    "Add your artwork and your link",
    "One image covers the whole block. You can add it later: your squares stay reserved until you do.",
  ],
];

const FAQ: [string, string][] = [
  [
    "Can I buy more squares later, next to mine?",
    "Yes, as long as they are still free. Each purchase is its own block, so two blocks side by side stay two images.",
  ],
  [
    "Can I change my image or my link?",
    "Yes, whenever you want, from My squares. The square stays yours.",
  ],
  [
    "Do I get traffic numbers?",
    "Yes. Every click on your block is counted, and the number sits on your row in My squares. It counts clicks, not people, so read it as rough. Your own tracking parameters tell you what happens after the click.",
  ],
  [
    "Why 4 × 4 at most?",
    `The limit is on one image, not on one owner. A block shows a single image, and past ${MAX_BLOCK} × ${MAX_BLOCK} that image starts to be the grid rather than a place on it. Buy as many blocks as you like: each one stays its own image and its own link.`,
  ],
  [
    "Can I sell my square to somebody else?",
    "Not through this site. A square cannot be sold on here, and it cannot be handed back. What you buy is yours to keep.",
  ],
  [
    "Can I buy a square somebody already owns?",
    "No. Every square the site still has is on the board, marked with its number. What is taken is taken.",
  ],
  [
    "What if every square sells?",
    "Then the site has nothing left to sell. The banner is still auctioned every day.",
  ],
];

export function HowItWorks() {
  return (
    <>
      <main className="flex-1">
        <Counter />

        <Section title="What you get">
          <P>
            One square is ${PRICE_PER_SQUARE}. You pay once. There is no subscription and no
            renewal.
          </P>
          <P>
            Your square is permanent. It does not expire, and nobody takes it back, rents it out
            or sells it out from under you.
          </P>
          <P>
            Buy up to {MAX_BLOCK * MAX_BLOCK} squares as one block, at most {MAX_BLOCK} wide and{" "}
            {MAX_BLOCK} high. A block shows one image: the grid lines inside it disappear.
          </P>
          <P>
            A click on your block opens your website in a new tab, and every one of those clicks
            is counted for you. You can replace your image and your link whenever you want.
          </P>

          <Subhead>What you may put there</Subhead>
          <P>No adult content. No malware, impersonation or deceptive redirects.</P>
          <P>
            No chat or invite links — Telegram, WhatsApp, Discord and the like. Link to a product, a
            company or a profile.
          </P>
          <P>
            No link shorteners: use your own domain. Tracking parameters on your own URL are fine —
            they are how you measure what happens after the click.
          </P>
        </Section>

        <Section title="How it works">
          {/* Numbered because it is a sequence: you cannot pay for squares you have
              not drawn, and you cannot fill a block you have not paid for. */}
          <ol className="grid gap-6 md:grid-cols-3 md:gap-8">
            {STEPS.map(([title, body], i) => (
              <li key={title} className="border-hairline max-w-[36ch] border-t pt-3">
                <div className="text-faint pb-1 font-mono text-[12px]" data-numeric>
                  {i + 1}
                </div>
                <div className="pb-1 text-[15px] font-semibold">{title}</div>
                <p className="text-[14px] leading-[1.55]">{body}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="The daily banner">
          <P>
            The {BANNER.w} × {BANNER.h} area in the top-left corner is not for sale. It is auctioned, one day at a
            time.
          </P>
          <P>
            <strong className="text-accent font-semibold">
              Today you bid on tomorrow&rsquo;s banner.
            </strong>{" "}
            Bidding runs all day and closes at 00:00 UTC. It starts at $100.
          </P>
          <P>
            The winner holds the banner from 00:00 to 00:00 UTC: their image at the top of the grid,
            their link on the click. The next day it passes to the next winner, and the day stays in
            the record below.
          </P>
          <BannerRecord />
        </Section>

        <Section title="FAQ">
          <dl className="border-hairline max-w-[62ch] border-t">
            {FAQ.map(([q, a]) => (
              <div key={q} className="border-hairline border-b py-4">
                <dt className="pb-1 text-[15px] font-semibold">{q}</dt>
                <dd className="text-[14px] leading-[1.6]">{a}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section title="Questions?">
          {/* Plain text on purpose. A form that silently discarded a message would
              be the one place this prototype lies to a real visitor. */}
          <Contact />
        </Section>
      </main>
      <Footer />
    </>
  );
}
