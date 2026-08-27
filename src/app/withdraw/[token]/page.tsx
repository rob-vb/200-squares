import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@convex/api";
import { ContentPage } from "@/components/content/content-page";
import { Site } from "@/components/site";
import { Withdraw } from "@/components/withdraw";

// The withdrawal function of art. 6:230oa BW / art. 11a CRD, on its own address.
//
// ⚠️ **A `params` read and never a `searchParams` one.** Ticket 08's lesson was
// about search parameters making *every* route dynamic; a dynamic **segment** is
// this route's own and reaches no other page. It could not be static in any
// case: the token is the whole address.
//
// ⚠️ **The lookup happens here, on the server, for one reason: the 404.** An
// unknown token, and a business order — which has no token at all — must be a
// real *not found*, and a client component cannot answer with a status. Ticket
// 42: a business order has no entry point and nothing to explain. An **expired**
// one is the opposite and is not a 404 — the page says the days have run and
// gives the address, because that is honest where a 404 is not.

export const metadata: Metadata = {
  title: "Withdraw from contract · 200 SQUARES",
  description: "Withdraw from a purchase on 200 squares.",
  robots: { index: false, follow: false },
};

export default async function Page({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const found = await fetchQuery(api.withdrawal.byToken, { token });
  if (!found) notFound();

  return (
    <Site>
      {/* ⚠️ The heading is the statute's own label, and only the statute's:
          art. 11a lid 1 asks the function to be labelled *withdraw from contract
          here* or an unambiguous equivalent, so nothing here is written to sound
          better than that. It stays the same in all three states, because it is
          the address the person was given and they have to recognise it.

          ⚠️ The line under it does **not** stay. *You can withdraw from this
          purchase* over a page that says the time has run out is the site
          contradicting itself in two consecutive sentences, so the states that
          cannot be withdrawn from carry no intro and let their own heading
          speak. */}
      <ContentPage
        title="WITHDRAW FROM CONTRACT HERE"
        intro={
          found.state === "live"
            ? "You can withdraw from this purchase. You do not have to give a reason."
            : undefined
        }
      >
        <Withdraw token={token} initial={found} />
      </ContentPage>
    </Site>
  );
}
