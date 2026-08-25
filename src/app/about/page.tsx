import type { Metadata } from "next";
import { Contact } from "@/components/content/contact";
import { ContentPage } from "@/components/content/content-page";
import { Site } from "@/components/site";
import { P, Section } from "@/components/content/section";

export const metadata: Metadata = {
  title: "About · 200 SQUARES",
  description: "One grid, 199 squares and a banner that changes every day.",
};

export default function Page() {
  return (
    <Site>
      <ContentPage
        title="ABOUT"
        intro="One grid, 199 squares, and a banner that changes every day."
      >
        <Section title="What this is">
          <P>
            200 Squares is a single page with a fixed grid on it. 199 of the squares are for sale
            at $250 each. The site sells each one once, and after that it is the owner&rsquo;s to
            keep. The 5 × 5 area in the top-left corner is the banner, and it is not for sale: it
            is auctioned, one day at a time.
          </P>
          <P>
            Every square that sells stays sold. The picture on the grid is the sum of everyone who
            bought a place on it, and it only gets fuller.
          </P>
        </Section>

        <Section title="Why it exists">
          <P>
            The idea is twenty years old: sell a page one square at a time and let the buyers make
            the picture. What that idea never had is a reason to come back the next day.
          </P>
          <P>
            The banner is that reason. It is the best spot on the page, it belongs to one bidder for
            one day, and at 00:00 UTC it changes hands. The grid is permanent; the top of it is not.
          </P>
        </Section>

        <Section title="Who runs it">
          <P>
            One person, not a company. That is the whole of it, and it is on this page rather than
            in the small print.
          </P>
          <Contact />
        </Section>
      </ContentPage>
    </Site>
  );
}
