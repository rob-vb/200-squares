import type { Metadata } from "next";
import { HowItWorks } from "@/components/content/how-it-works";
import { Site } from "@/components/site";
import { getDataset } from "@/lib/board/datasets";

export const metadata: Metadata = {
  title: "How it works · 200 SQUARES",
  description: "What a square costs, what you get, and how the daily banner is auctioned.",
};

export default async function Page(props: PageProps<"/how-it-works">) {
  const { data } = await props.searchParams;
  return (
    <Site dataset={getDataset(data)}>
      <HowItWorks />
    </Site>
  );
}
