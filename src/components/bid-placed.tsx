"use client";

// Where the bidder lands, and the only place a hold is ever confirmed.
//
// ⚠️ It watches; it does not write the bid. Only the signature-verified webhook
// does that, the same rule ticket 05 set for a purchase. So this page subscribes
// to the bid by its Stripe session id and waits — and after ten seconds with
// nothing, it asks Stripe directly through `/stripe/reconcile`, which writes
// through the same keyed mutation the webhook uses.
//
// ⚠️ The session id in the URL is the grant, exactly as it is on `/thanks`: it is
// the one thing that says *you are the person who just placed this bid*, and it
// buys the right to be told where the auction stands. It never answers with an
// address.
//
// ⚠️ The refusal this page exists for is the **late hold**. Ticket 07 wanted a
// card whose authorization dies before 00:00 UTC refused *at the keyboard*, so
// the bidder can reach for another card while they are still looking at the
// screen. A hosted checkout page only produces `capture_before` afterwards — so
// the refusal happens here instead, one screen later, with the hold already given
// back and the board one link away.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@convex/api";
import { Section } from "./content/section";
import { convexSite } from "@/lib/checkout/hold";
import { useOnClient } from "./use-on-client";

const money = (cents: number) => `$${Math.round(cents / 100).toLocaleString("en-US")}`;

export function BidPlaced() {
  // ⚠️ Read on the client, never on the server. A page that reads a search
  // parameter at render is a page that builds dynamic, and ticket 08 already
  // paid for that lesson once — it cost ticket 02 its cheapest defence.
  const read = useOnClient();
  const sessionId = useMemo(() => {
    if (!read) return null;
    const id = new URLSearchParams(window.location.search).get("session_id");
    return id && id.startsWith("cs_") ? id : null;
  }, [read]);

  const bid = useQuery(
    api.auction.bidBySession,
    sessionId ? { stripeSessionId: sessionId } : "skip",
  );

  // The ten-second fallback. It runs once, and only while nothing has arrived.
  const [nudged, setNudged] = useState(false);
  useEffect(() => {
    if (!sessionId || nudged) return;
    if (bid && bid.status !== "pending") return;
    const id = window.setTimeout(() => {
      setNudged(true);
      void fetch(`${convexSite()}/stripe/reconcile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stripeSessionId: sessionId }),
      }).catch(() => {
        // The subscription is still open. A failed nudge changes nothing.
      });
    }, 10_000);
    return () => window.clearTimeout(id);
  }, [sessionId, bid, nudged]);

  if (!read) return null;

  if (!sessionId) {
    return (
      <Section title="We cannot tell which bid this was">
        <p className="max-w-[62ch] text-[17px] leading-snug">
          This page needs the address Stripe sent you back to.{" "}
          <Link href="/" className="underline">
            The board
          </Link>{" "}
          shows the auction as it stands, and your bid is in it if it went through.
        </p>
      </Section>
    );
  }

  if (bid === undefined || bid === null || bid.status === "pending") {
    return (
      <Section title="Your card has been seen">
        <p className="max-w-[62ch] text-[17px] leading-snug">
          We are putting the hold on your card. This takes a few seconds and it does not need you
          to wait here — the auction closes at 00:00 UTC and you are told by email if somebody goes
          over you.
        </p>
      </Section>
    );
  }

  if (bid.status === "failed" && bid.reason === "late") {
    return (
      <Section title="That card cannot hold long enough">
        <p className="max-w-[62ch] text-[17px] leading-snug">
          Your bank would release the hold before the auction closes at 00:00 UTC, so the bid could
          never be collected. Nothing is held and nothing is charged.{" "}
          <Link href="/" className="underline">
            Bid again with another card
          </Link>{" "}
          — the auction is still running.
        </p>
      </Section>
    );
  }

  if (bid.status === "failed" || bid.status === "released") {
    return (
      <Section title="That auction has closed">
        <p className="max-w-[62ch] text-[17px] leading-snug">
          The banner for {bid.date} was decided while you were paying. Nothing is held and nothing
          is charged.{" "}
          <Link href="/" className="underline">
            The board
          </Link>{" "}
          has tomorrow’s auction running already.
        </p>
      </Section>
    );
  }

  return (
    <>
      <Section title={bid.leading ? "You are the top bid" : "You have been outbid"}>
        <p className="max-w-[62ch] text-[17px] leading-snug">
          {money(bid.amountCents)} is held on your card for the banner on {bid.date}.
          {bid.leading
            ? " No money is taken unless the auction closes with you on top."
            : ` The top bid is ${money(bid.topCents ?? bid.amountCents)}. Your hold stays where it is until the close, because the banner goes to the highest bid that can actually be collected — and yours is next in line.`}
        </p>
        <p className="text-faint max-w-[62ch] pt-3 text-[15px] leading-snug">
          Bidding closes at 00:00 UTC. If you win, the hold is collected then and the day runs to
          the next 00:00 UTC. If you do not, it is released at the close, and your bank may take
          some days to show it.
        </p>
      </Section>

      <Section title="Get ready now">
        <p className="max-w-[62ch] text-[17px] leading-snug">
          The auction closes at the same moment your day begins, so there is no hour afterwards to
          get ready in. Point your bid somewhere while it stands and the banner is live from the
          first second.{" "}
          <Link href="/" className="underline">
            The bid panel
          </Link>{" "}
          has the field, and so does My squares once you have signed in.
        </p>
        <p className="text-faint max-w-[62ch] pt-3 text-[15px] leading-snug">
          {/* ⚠️ Both writes live behind a session, so this page points at them
              rather than holding them: the bidder may have no account yet, and
              the sign-in link is what turns a paid bid into one they can edit. */}
          The picture goes in the same two places. A bid with nothing on it still wins the day —
          it shows the house advertisement until you upload. Your sign-in link is in your email.
        </p>
      </Section>
    </>
  );
}
