import type { Metadata } from "next";
import { Contact } from "@/components/content/contact";
import { ContentPage } from "@/components/content/content-page";
import { Site } from "@/components/site";
import { getDataset } from "@/lib/board/datasets";
import { P, Section } from "@/components/content/section";

export const metadata: Metadata = {
  title: "Privacy · 200 SQUARES",
  description: "What this site stores, what it shows, and what it does not measure.",
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
            To sell a square on: an address to pay you at. It is not public, and it is used for that
            payment only.
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

        <Section title="What it does not do">
          <P>
            No analytics, no advertising network, no third-party tracking scripts, no profile of you
            across other sites.
          </P>
          <P>
            There are no visitor statistics here at all. That is also why the FAQ tells owners to put
            their own tracking parameters on their link: this site cannot count clicks for you,
            because it does not count them for itself.
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
