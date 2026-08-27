import type { Metadata } from "next";
import { CheckoutCancelled } from "@/components/checkout-cancelled";
import { ContentPage } from "@/components/content/content-page";
import { Site } from "@/components/site";

export const metadata: Metadata = {
  title: "Cancelled · 200 SQUARES",
  description: "Nothing was charged.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Site>
      <ContentPage title="CANCELLED">
        <CheckoutCancelled />
      </ContentPage>
    </Site>
  );
}
