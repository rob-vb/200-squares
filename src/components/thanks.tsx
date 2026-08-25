"use client";

// Where the buyer lands, and the only place the payment is ever confirmed.
//
// ⚠️ It watches; it does not write the sale. Only the signature-verified webhook
// does that (ticket 05). So this page subscribes to the order by its Stripe
// session id and waits — and after ten seconds with nothing, it asks Stripe
// directly through `/stripe/reconcile`, which writes through the same keyed
// mutation the webhook uses. Writing twice is impossible, and there is no path
// where somebody who has paid is shown an error.
//
// ⚠️ The session id in the URL is the grant. It is the one thing that says *you
// are the person who just paid*, and it buys three things and no others: naming
// this block, pointing it somewhere, and putting a picture on it. Ticket 06
// moved all three behind the payment and they all land here — before any email
// arrives, so nobody leaves the site with a square that says nothing.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@convex/api";
import type { Id } from "@convex/dataModel";
import { PrimaryButton, cleanUrl, inputClass } from "./panel/controls";
import { ArtworkRules, ArtworkUpload } from "./art/artwork-upload";
import { Section } from "./content/section";
import { clearHold, convexSite } from "@/lib/checkout/hold";
import { useOnClient } from "./use-on-client";
import { squareRange } from "@/lib/board/geometry";

const money = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function Thanks() {
  // ⚠️ Read on the client, never on the server. A page that reads a search
  // parameter at render is a page that builds dynamic, and ticket 08 already
  // paid for that lesson once — it cost ticket 02 its cheapest defence.
  const read = useOnClient();
  const sessionId = useMemo(() => {
    if (!read) return null;
    const id = new URLSearchParams(window.location.search).get("session_id");
    return id && id.startsWith("cs_") ? id : null;
  }, [read]);

  // The hold did its work the moment Stripe took the money. Whatever happens
  // now happens to the order, and the tab has nothing left to remember.
  useEffect(() => {
    if (read) clearHold();
  }, [read]);

  const order = useQuery(
    api.checkout.orderBySession,
    sessionId ? { stripeSessionId: sessionId } : "skip",
  );

  // The ten-second fallback. It runs once, and only while nothing has arrived.
  useEffect(() => {
    if (!sessionId || order !== null) return;
    const id = window.setTimeout(() => {
      void fetch(`${convexSite()}/stripe/reconcile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stripeSessionId: sessionId }),
      }).catch(() => {
        // The subscription is still open. A failed nudge changes nothing.
      });
    }, 10_000);
    return () => window.clearTimeout(id);
  }, [sessionId, order]);

  if (!read) return null;

  if (!sessionId) {
    return (
      <Section title="We cannot tell which payment this was">
        <p className="max-w-[62ch] text-[17px] leading-snug">
          This page needs the address Stripe sent you back to. If you have paid, the confirmation
          is on its way by email and your square is safe. Otherwise{" "}
          <Link href="/" className="underline">
            go back to the board
          </Link>
          .
        </p>
      </Section>
    );
  }

  if (order === undefined || order === null) {
    return (
      <Section title="Payment received">
        <p className="max-w-[62ch] text-[17px] leading-snug">
          We are putting your square on the board. This takes a few seconds and it does not need
          you to wait here — the confirmation and your invoice come by email either way.
        </p>
      </Section>
    );
  }

  if (order.refunded) {
    return (
      <Section title="We have given your money back">
        <p className="max-w-[62ch] text-[17px] leading-snug">
          {order.refundReason ?? "Those squares were already sold."} Your card has been refunded in
          full, automatically — {money(order.totalCents)}, back the way it came. It takes a few days
          to appear.{" "}
          <Link href="/" className="underline">
            The board
          </Link>{" "}
          has what is still free.
        </p>
      </Section>
    );
  }

  return <Complete sessionId={sessionId} order={order} />;
}

type Order = NonNullable<FunctionReturnType<typeof api.checkout.orderBySession>>;

function Complete({ sessionId, order }: { sessionId: string; order: Order }) {
  const complete = useMutation(api.checkout.completeBySession);
  const uploadUrls = useMutation(api.art.orderUploadUrls);
  const setArtwork = useMutation(api.art.setOrderArtwork);
  const [companyName, setCompanyName] = useState(order.companyName);
  const [url, setUrl] = useState(order.url);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const done = Boolean(order.companyName);

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await complete({ stripeSessionId: sessionId, companyName, url: cleanUrl(url) });
    } catch {
      setError("That did not save. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Section title={`Square ${squareRange(order.rect)} is yours`}>
        <p className="max-w-[62ch] text-[17px] leading-snug">
          {order.squares === 1 ? "One square" : `${order.squares} squares`}, paid in full at{" "}
          {money(order.totalCents)}
          {order.vatCase === "nl21" ? `, including ${money(order.vatCents)} Dutch VAT` : ""}
          {order.vatCase === "reverse" ? ", VAT reverse-charged" : ""}. It is on the board now and
          it stays there. Your invoice comes by email.
        </p>
        <p className="text-faint max-w-[62ch] pt-3 text-[15px] leading-snug">
          Until you put a picture on it, the square is marked as waiting for artwork. There is no
          deadline: a paid square is permanent whether or not anything is on it yet.
        </p>
      </Section>

      <Section title={done ? "Your block" : "Name it, and point it somewhere"}>
        <div className="flex max-w-[420px] flex-col gap-3">
          <label className="block">
            <span className="text-faint block pb-1 text-[13px]">Name on the board</span>
            <input
              className={inputClass}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Your company"
            />
          </label>
          <label className="block">
            <span className="text-faint block pb-1 text-[13px]">Where a click goes</span>
            <input
              className={inputClass}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="yourcompany.com"
              inputMode="url"
            />
          </label>
          {error ? <p className="text-accent text-[13px]">{error}</p> : null}
          <PrimaryButton onClick={save} disabled={busy || !companyName.trim()}>
            {busy ? "SAVING…" : done ? "SAVE CHANGES" : "SAVE"}
          </PrimaryButton>
        </div>
      </Section>

      {/*
        ⚠️ The upload hangs on the same grant the two fields above do: the Stripe
        session id in this page's address is what says *you are the person who
        just paid*, and it is the only thing this buyer holds before any mail
        arrives (ticket 06). The magic link in their email is the way back later.
      */}
      <Section title={order.hasArtwork ? "Your picture" : "Put a picture on it"}>
        <div className="flex max-w-[420px] flex-col gap-3">
          <ArtworkUpload
            rect={order.rect}
            hasArtwork={order.hasArtwork}
            urls={() => uploadUrls({ stripeSessionId: sessionId })}
            save={(ids) =>
              setArtwork({
                stripeSessionId: sessionId,
                small: ids.small as Id<"_storage">,
                large: ids.large as Id<"_storage">,
              })
            }
          />
          <ArtworkRules />
          <p className="text-faint text-[12px] leading-snug">
            You can do this later instead. The square stays yours either way, and the magic link
            in your email brings you back to it.
          </p>
        </div>
      </Section>
    </>
  );
}
