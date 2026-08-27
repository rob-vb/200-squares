import type { Metadata } from "next";
import { HowItWorks } from "@/components/content/how-it-works";
import { Site } from "@/components/site";

export const metadata: Metadata = {
  title: "How it works · 200 SQUARES",
  description: "What a square costs, what you get, and how the daily banner is auctioned.",
};

export default function Page() {
  return (
    <Site>
      <HowItWorks />
    </Site>
  );
}
