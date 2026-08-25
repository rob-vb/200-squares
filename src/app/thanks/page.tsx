import type { Metadata } from "next";
import { ContentPage } from "@/components/content/content-page";
import { Site } from "@/components/site";
import { Thanks } from "@/components/thanks";

// ⚠️ No `searchParams`, and nothing may put one back. Stripe returns the buyer
// here with `?session_id=`, and that id is read **on the client** in
// `Thanks` — reading it at render is what made every route on this site build
// dynamic once already (ticket 08).

export const metadata: Metadata = {
  title: "Thank you · 200 SQUARES",
  description: "Your square on the board.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Site>
      <ContentPage title="THANK YOU" intro="Your square is on the board.">
        <Thanks />
      </ContentPage>
    </Site>
  );
}
