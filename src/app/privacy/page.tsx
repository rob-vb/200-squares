import type { Metadata } from "next";
import { Contact } from "@/components/content/contact";
import { ContentPage } from "@/components/content/content-page";
import { Site } from "@/components/site";
import { P, Section } from "@/components/content/section";

export const metadata: Metadata = {
  title: "Privacy · 200 SQUARES",
  description: "What this site stores, what it counts, and what it keeps about you.",
};

export default function Page() {
  return (
    <Site>
      <ContentPage
        title="PRIVACY"
        intro="This site sells squares on a page. It does not need to know much about you, so it does not ask."
      >
        <Section title="What you give it">
          <P>
            To buy a square: a company name, a web address, an email address for the receipt, and an
            image if you have one ready. To bid on the banner: the same, minus the image.
          </P>
          <P>
            The company name, the address and the image are what the grid shows. They are public the
            moment your block goes live — that is what you are buying.
          </P>
          <P>
            Your email address is not public. It is used for the receipt, for a message about your own
            square or your own bid, and for nothing else. There is no newsletter.
          </P>
          <P>
            It is also your key. There is no password here, so the address you paid with is what
            signs you in and what proves a square is yours. That is why it is kept for as long as
            the square is.
          </P>
          <P>
            An order keeps more than that, because a sale has to be provable years later: the
            invoice name and address, the exact words of the boxes you ticked, and the internet
            address your browser came from. Tax law asks for ten years, so ten years is what it
            gets.
          </P>
          <P>
            While you are paying, and while a bid is being placed, the site keeps a scrambled
            one-way copy of your internet address for fifteen minutes. It is never read back, only
            compared with another one, and it is how a single visitor is stopped from holding the
            whole board at once. After fifteen minutes it is gone.
          </P>
        </Section>

        <Section title="What it counts">
          <P>
            One number for each block, and one for each banner day: how often somebody clicked it
            and left for the address it points at. Nothing else is counted.
          </P>
          <P>
            Nothing about you is kept when you click. No name, no identifier, no address, no time.
            The number goes up by one and you are forgotten in the same instant. That is why the
            site counts clicks and not people, and why one person clicking twice counts twice.
          </P>
          <P>
            An owner sees the count of what they hold, and nobody else does. There is no history
            and no graph, because no time is written down to build one from. One public number adds
            every click on the site together; it names no owner and no square.
          </P>
          <P>
            A count is a floor and not a census. It is counted in the visitor&rsquo;s own browser,
            and nothing audits it: a browser that blocks scripts leaves for the same website
            without being counted. Read the number as the least that happened. A zero stays a
            zero, bare.
          </P>
          <P>
            None of this contradicts what the section above says about your email address. An
            address belongs to an <strong className="font-semibold">owner</strong>, who bought
            something.
            The promise about clicks is about a <strong className="font-semibold">visitor</strong>,
            who did not.
          </P>
        </Section>

        <Section title="What it does not do">
          <P>
            No analytics, no advertising network, no third-party tracking scripts, no profile of you
            across other sites.
          </P>
          <P>
            The Cloudflare check named below is not one of those. It asks whether you are a script,
            it is thrown away once it has an answer, and it is not told which block you clicked.
          </P>
          <P>
            Cookies are used to keep you signed in, and for nothing else. There is no tracking cookie
            to accept or refuse.
          </P>
        </Section>

        <Section title="Who else sees it">
          <P>
            The payment is handled by a payment provider, which receives what a payment needs and
            keeps your card details away from this site. Hosting runs on Vercel, which keeps ordinary
            server logs. Email is sent by Resend, which is given the address it goes to and the
            message itself.
          </P>
          <P>
            Clicking a block loads a small check from Cloudflare. It is what stops a script from
            inflating an owner&rsquo;s count, and it is named here because clicking is the one
            thing on this list you did not set out to do: buying and bidding are deliberate, a
            click is not.
          </P>
          <P>Nothing is sold, rented or handed on to anybody else.</P>
        </Section>

        <Section title="Your side of it">
          <P>
            Ask for a copy of what is stored about you, ask for a correction, or ask for your email
            address to be deleted. A square that is live stays live: what is on the grid is public by
            purchase, not by consent.
          </P>
          <Contact />
        </Section>
      </ContentPage>
    </Site>
  );
}
