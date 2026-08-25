import type { Metadata } from "next";
import { Contact } from "@/components/content/contact";
import { ContentPage } from "@/components/content/content-page";
import { Site } from "@/components/site";
import { P, Section } from "@/components/content/section";

export const metadata: Metadata = {
  title: "Terms · 200 SQUARES",
  description: "What you buy, what you may put on it, and what is not promised.",
};

export default function Page() {
  return (
    <Site>
      <ContentPage
        title="TERMS"
        intro="Short, and in the same words the rest of the site uses. Buying a square or placing a bid means these apply to you."
      >
        <Section title="What you buy">
          <P>
            A square costs $250. You pay once, and the square is yours for as long as this site runs.
            There is no subscription, no renewal and no invoice after the first one.
          </P>
          <P>
            A purchase of several squares at once is one block, at most 4 wide and 4 high. A block
            carries one image and one link.
          </P>
          <P>
            Your square is not taken back, rented out or sold again while it is yours. That is a
            promise about what this site does, not a rule about what you may do with what you
            bought.
          </P>
        </Section>

        <Section title="There is no way out">
          <P>
            A square cannot be sold on through this site, and it cannot be handed back. Once it is
            bought it is yours, and it stays yours. There is no refund and no exit.
          </P>
        </Section>

        <Section title="Your artwork and your link">
          <P>
            You supply the image and the address. You keep every right you had in them, and you give
            permission to show them on this page for as long as the square is yours. You can replace
            either whenever you want.
          </P>
          <P>
            You confirm you may use what you upload. If somebody else owns the image, that is between
            you and them.
          </P>
          <P>
            Not allowed: adult content; malware; impersonation; deceptive redirects; chat or invite
            links such as Telegram, WhatsApp or Discord; and link shorteners. Link to a product, a
            company or a profile on your own domain. Tracking parameters on your own address are
            fine.
          </P>
          <P>
            Artwork or a link that breaks these rules is taken off the grid. The square stays yours:
            put something else on it. A square is only emptied for the rule it broke, and you are
            told which one.
          </P>
        </Section>

        <Section title="The daily banner">
          <P>
            The banner is auctioned every day. Today you bid on tomorrow&rsquo;s banner. Bidding
            closes at 00:00 UTC and starts at $100; each bid is at least $10 over the top bid.
          </P>
          <P>
            A bid is binding while it stands. The highest bid at 00:00 UTC wins and is charged; every
            other bid is not. The winner holds the banner from 00:00 to 00:00 UTC, and the day stays
            in the public record with the winning bid on it.
          </P>
          <P>
            The banner follows the same content rules as a square. A banner that breaks them is
            removed for the rest of its day and the bid is not returned.
          </P>
        </Section>

        <Section title="What is not promised">
          <P>
            Nobody can promise a website runs forever, and this page will not pretend otherwise. This
            is one project run by one person. If it stops, the squares stop with it, and that is
            priced into the $250.
          </P>
          <P>
            The site counts clicks and shows you your own count. That is a record of what happened,
            not a promise of what will. No amount of traffic is promised or implied.
          </P>
        </Section>

        <Section title="Changes">
          <P>
            These terms can change — for the rules about content, most likely. A change never takes a
            square away from somebody who already bought one.
          </P>
          <Contact lead="Questions about any of this:" />
        </Section>
      </ContentPage>
    </Site>
  );
}
