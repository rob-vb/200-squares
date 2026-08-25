import type { Metadata } from "next";
import { ContentPage } from "@/components/content/content-page";
import { Site } from "@/components/site";
import { BidPlaced } from "@/components/bid-placed";

// ⚠️ No `searchParams`, and nothing may put one back. Stripe returns the bidder
// here with `?session_id=`, and that id is read **on the client** in `BidPlaced`
// — reading it at render is what made every route on this site build dynamic
// once already (ticket 08).

export const metadata: Metadata = {
  title: "Your bid · 200 SQUARES",
  description: "Your bid on tomorrow’s banner.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Site>
      {/* ⚠️ No promise in the intro. The same page carries a hold still being
          written, a bid in the lead, a bid already passed, and a card whose hold
          would die before the close — and "your bid is in" is a lie in the last
          of those. What is true of all four is that the card has been seen. */}
      <ContentPage title="YOUR BID" intro="Stripe has your card. Here is where the auction stands.">
        <BidPlaced />
      </ContentPage>
    </Site>
  );
}
