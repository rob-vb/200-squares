import type { Metadata } from "next";
import { Contact } from "@/components/content/contact";
import { ContentPage } from "@/components/content/content-page";
import { Site } from "@/components/site";
import { getDataset } from "@/lib/board/datasets";
import { P, Section } from "@/components/content/section";

export const metadata: Metadata = {
  title: "Privacy · 200 SQUARES",
  description: "What this site stores, what it counts, and what it keeps about you.",
};

export default async function Page(props: PageProps<"/privacy">) {
  const { data } = await props.searchParams;
  return (
    <Site dataset={getDataset(data)}>
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
        </Section>

        <Section title="What it does not do">
          <P>
            No analytics, no advertising network, no third-party tracking scripts, no profile of you
            across other sites.
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
            server logs.
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
