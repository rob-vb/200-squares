import type { Metadata } from "next";
import Link from "next/link";
import { Contact } from "@/components/content/contact";
import { ContentPage } from "@/components/content/content-page";
import { Site } from "@/components/site";
import { P, Section } from "@/components/content/section";

export const metadata: Metadata = {
  title: "Terms · 200 SQUARES",
  description:
    "What you buy, what you may put on it, and what is not promised.",
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
            A square costs $250. You pay once, and the square is yours for as
            long as this site runs. There is no subscription, no renewal and no
            invoice after the first one.
          </P>
          <P>
            A purchase of several squares at once is one block, at most 3 wide
            and 3 high. A block carries one image and one link.
          </P>
          <P>
            Your square is not taken back, rented out or sold again while it is
            yours. That is a promise about what this site does, not a rule about
            what you may do with what you bought.
          </P>
        </Section>

        <Section title="There is no way out">
          <P>
            A square cannot be sold on through this site, and this site will not
            buy one back. Once it is bought it is yours, and it stays yours.
          </P>
          <P>
            That is a promise about what the site does, not a statement of the
            law. If you buy as a private person, the next section is your way
            out, and it is the only one.
          </P>
        </Section>

        <Section title="Cancelling, if you buy as a private person">
          <P>
            If you buy a square as a private person and not for a business, you
            have 14 days to cancel, counted from the day you buy it. You do not
            have to give a reason.
          </P>
          <P>
            To cancel, press <em>withdraw from contract here</em>. It is on your
            thank-you page after payment, and under your order in My squares. It
            stays there for the whole 14 days and goes when they are up. An
            email to hello@200squares.com does the same thing.
          </P>
          <P>
            We confirm your cancellation by email straight away, in the words
            you sent it in. Your money is back within 14 days of that message,
            by the way you paid. You pay for what had already been delivered at
            the moment you sent it, and no more.
          </P>
          <P>
            A cancelled square goes back on the market. Once the refund is paid
            the block comes off the grid, and the rectangle is for sale again.
          </P>
          <P>
            A business buyer has no right to cancel, and this site does not
            offer one. That is the whole of the difference between the two.
          </P>
        </Section>

        <Section title="Your artwork and your link">
          <P>
            You supply the image and the address. You keep every right you had
            in them, and you give permission to show them on this page for as
            long as the square is yours. You can replace either whenever you
            want.
          </P>
          <P>
            You confirm you may use what you upload. If somebody else owns the
            image, that is between you and them.
          </P>
          <P>
            Not allowed: adult content; malware; impersonation; deceptive
            redirects; chat or invite links such as Telegram, WhatsApp or
            Discord; and link shorteners. Link to a product, a company or a
            profile on your own domain. Tracking parameters on your own address
            are fine.
          </P>
          <P>
            Artwork or a link that breaks these rules is taken off the grid. The
            square stays yours: put something else on it. A square is only
            emptied for the rule it broke, and you are told which one.
          </P>
          <P>
            Nothing is refunded when a square is emptied. Breaking a rule is not
            a way to get the money back.
          </P>
          <P>
            Three removals in twelve months freeze the block. Frozen means it is
            still yours and still on the board, but you can no longer set
            artwork or a link on it. Every removal message says where you stand,
            so a freeze never arrives without warning.
          </P>
          <P>
            The site does not check where a link goes. Nobody follows it before
            it goes live, and a live link is not an approved one. If a block
            points somewhere it should not, write to hello@200squares.com.
          </P>
        </Section>

        <Section title="The daily banner">
          <P>
            The banner is auctioned every day. Today you bid on tomorrow&rsquo;s
            banner. Bidding closes at 00:00 UTC and starts at $100; each bid is
            at least $10 over the top bid.
          </P>
          <P>
            A bid is an offer. It is accepted at 00:00 UTC, and that is when the
            contract begins. Every bid stands until the close. A business bid
            cannot be withdrawn; if you are bidding as a private person, you can
            take a bid back before the close by emailing hello@200squares.com.
          </P>
          <P>
            A bid that is overtaken stays open until the close. That is what
            lets it take the day after all, if the bid above it cannot be
            collected.
          </P>
          <P>
            The banner goes to the highest bid that can be collected at 00:00
            UTC. If the top bid cannot be collected, the next one takes the day.
            Every other bid is released.
          </P>
          <P>
            So the highest bid does not always win. A bid the bank refuses at
            the close loses the day without ever having been outbid, and we
            email that bidder to say the charge was refused. We are not told
            why, and neither guess is ours to make: your bank knows.
          </P>
          <P>
            The winner holds the banner from 00:00 to 00:00 UTC, and the day
            stays in the public record with the winning bid on it. That record
            is the list of past banner days on{" "}
            <Link href="/how-it-works" className="underline">
              how it works
            </Link>
            .
          </P>
          <P>
            If you bid as a private person, you have 14 days to cancel, counted
            from the close. A banner day is fully delivered at 00:00 UTC, so the
            right ends there.
          </P>
          <P>
            To cancel, press <em>withdraw from contract here</em> under your
            order in My squares; an email to hello@200squares.com does the same
            thing. Your banner comes off the board at once — nobody has to read
            anything first — and you pay for the hours that had run at the
            moment you sent it. We confirm your cancellation by email straight
            away, and your money is back within 14 days of that message.
          </P>
          <P>
            The banner follows the same content rules as a square. A banner that
            breaks them is removed for the rest of its day and the bid is not
            returned.
          </P>
        </Section>

        <Section title="Your email address is the key">
          <P>
            There is no password. The email address on your payment is how you
            sign in, and it is the only key to your squares.
          </P>
          <P>
            Losing that address is not the end of your squares. The site cannot
            repair it by itself and there is no self-service reset, so getting
            back in means proving the purchase to a person: write to
            hello@200squares.com with the date, the amount and the last four
            digits of the card. Orders are kept ten years, so that proof
            outlives almost any inbox.
          </P>
        </Section>

        <Section title="What is not promised">
          <P>
            Nobody can promise a website runs forever, and this page will not
            pretend otherwise. This is one project run by one person. If it
            stops, the squares stop with it, and that is priced into the $250.
          </P>
          <P>
            The site counts clicks and shows you your own count. That is a
            record of what happened, not a promise of what will. No amount of
            traffic is promised or implied.
          </P>
        </Section>

        <Section title="Changes">
          <P>
            These terms can change — for the rules about content, most likely. A
            change never takes a square away from somebody who already bought
            one.
          </P>
          <Contact lead="Questions about any of this:" />
        </Section>
      </ContentPage>
    </Site>
  );
}
