"use client";

// Bid: the auction, in the panel, and the screen the obligation is concluded on.
//
// ⚠️ The prototype's fake rival is gone with the reducer. It went over the
// visitor about twenty seconds after they bid, to make being passed visible on a
// board nobody else was looking at. The bids are real rows now, and a real rival
// arrives when somebody else bids.
//
// ⚠️ The button carries the obligation. Under *Fuhrmann-2* only the words on the
// button that concludes the contract count, and Stripe's page says "Buy" — so
// the bid is placed here and Stripe is left executing a hold for a bid that
// already exists. It is ticket 06's move, on a conditional obligation: *Place bid
// — obliges you to pay if you win.*
//
// ⚠️ A bid is a **card authorization**, not a payment. The money is frozen and
// stays frozen until the auction closes at 00:00 UTC — including while you are
// outbid, because a runner-up with no hold cannot be promoted when the top bid
// cannot be collected (ticket 07). The three sentences beside the box say so, and
// they have to stay true when they are read at 23:59.

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/api";
import type { Id } from "@convex/dataModel";
import { useClientDate } from "../use-client-date";
import { Countdown } from "../countdown";
import {
  Field,
  FieldBox,
  Money,
  PanelHeader,
  PrimaryButton,
  SecondaryButton,
  cleanUrl,
  inputClass,
} from "./controls";
import { useScreen } from "./flow";
import { BID_FLOOR, useBoard } from "@/lib/board/board";
import { useViewer } from "@/lib/board/viewer";
import { agoLabel } from "@/lib/board/time";
import {
  BANNER_WITHDRAWAL_INFO,
  BANNER_WITHDRAWAL_TEXT,
  BID_BUTTON,
  BID_TRUTHS,
  INVOICE_TEXT,
} from "@/lib/checkout/consent";
import { countryOptions } from "@/lib/checkout/countries";
import { convexSite } from "@/lib/checkout/hold";
import { useTurnstile } from "@/lib/checkout/turnstile";
import { NL_VAT_BPS, vatFor, wantsVatNumber, type BuyerType } from "@/lib/checkout/vat";

const money = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function BidFlow() {
  const { auction } = useBoard();
  const { viewer, mine } = useViewer();
  const { close } = useScreen();
  const now = useClientDate();

  // The remembered answers, and nothing more: every order freezes its own copy,
  // so this fills the form in and never decides anything (ticket 07).
  const remembered = useQuery(api.owners.lastDeclared, viewer ? {} : "skip");
  const setBannerContent = useMutation(api.auction.setBannerContent);

  const liveBids = auction?.bids ?? [];
  const topBid = liveBids.reduce<(typeof liveBids)[number] | null>(
    (best, b) => (!best || b.amountCents > best.amountCents ? b : best),
    null,
  );
  const minNextBid = Math.round((auction?.minNextCents ?? BID_FLOOR * 100) / 100);
  // Only *theirs* once they are signed in: a stranger must not be told they were
  // outbid, because the site does not know who a stranger is.
  const viewerIsTopBidder = !!viewer && topBid?.ownerId === viewer.id;
  const viewerOutbid =
    !!viewer && !viewerIsTopBidder && liveBids.some((b) => b.ownerId === viewer.id);
  const standing = mine?.bids?.[0] ?? null;

  const [amount, setAmount] = useState(String(minNextBid));
  const [error, setError] = useState<string | null>(null);
  // Being outbid moves the floor, so the field refills itself with the new
  // minimum: the visitor should never have to work out what to type. This is the
  // adjust-during-render pattern, not an effect — the new floor is derived from
  // props, so React can re-run this component before it paints anything.
  const [floorShown, setFloorShown] = useState(minNextBid);
  if (floorShown !== minNextBid) {
    setFloorShown(minNextBid);
    setAmount(String(minNextBid));
    setError(null);
  }

  const [buyerType, setBuyerType] = useState<BuyerType | null>(null);
  const [country, setCountry] = useState("");
  const [name, setName] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [waived, setWaived] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [vatError, setVatError] = useState<string | null>(null);

  // Same shape as the floor above: the remembered answers arrive after the first
  // paint, so they are folded in during render rather than in an effect. Only
  // once, and never over something the bidder has already typed.
  const [filledFrom, setFilledFrom] = useState<string | null>(null);
  const rememberedKey = remembered ? JSON.stringify(remembered) : null;
  if (rememberedKey && filledFrom !== rememberedKey && !buyerType && !country && !name) {
    setFilledFrom(rememberedKey);
    setBuyerType(remembered!.buyerType);
    setCountry(remembered!.country);
    setName(remembered!.name);
    setVatNumber(remembered!.vatNumber);
  }

  const { box, getToken } = useTurnstile(true);
  const countries = useMemo(() => countryOptions(), []);

  const value = Math.round(Number(amount));
  const totalCents = Number.isFinite(value) ? value * 100 : 0;
  const askVat = wantsVatNumber(buyerType, country);
  const vat = vatFor({
    buyerType: buyerType ?? "consumer",
    country: country || "NL",
    // The panel can only guess. The real answer comes from VIES on the server,
    // and it is the server's answer that is frozen into the order.
    viesValid: askVat && vatNumber.trim() ? true : null,
    totalCents,
  });

  const place = async () => {
    setError(null);
    setNotice(null);
    setVatError(null);
    if (!Number.isFinite(value) || value < minNextBid) {
      setError(`The next bid is at least $${minNextBid.toLocaleString("en-US")}.`);
      return;
    }
    setBusy(true);
    try {
      // ⚠️ Two steps, and the first one is on Convex. Opening the bid is the
      // floodable half — no card, no money, just a row — so it sits behind
      // Turnstile where a flood breaks the site instead of pausing the Vercel
      // deployment. The card comes after, behind the id this hands back.
      const token = await getToken();
      if (!token) {
        setNotice("The check in front of the bid did not finish. Reload the page and try again.");
        return;
      }
      const opened = await fetch(`${convexSite()}/auction/bid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountCents: value * 100, token }),
      }).then((r) => r.json());

      if (!opened?.ok) {
        if (opened?.reason === "low") {
          setError(
            `Somebody bid while you were typing. The next bid is at least $${Math.round(
              opened.minNextCents / 100,
            ).toLocaleString("en-US")}.`,
          );
        } else if (opened?.reason === "pending") {
          setNotice("You already have a bid waiting to be paid. Finish that one first.");
        } else if (opened?.reason === "amount") {
          setError("Bids are in whole dollars.");
        } else {
          setNotice("The check in front of the bid did not pass. Reload the page and try again.");
        }
        return;
      }

      const answer = await fetch("/api/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bidId: opened.bidId,
          buyerType,
          country,
          name,
          vatNumber,
          withdrawalWaived: waived,
        }),
      }).then((r) => r.json());

      if (!answer?.ok) {
        if (answer?.error === "vies-invalid") {
          setVatError("VIES does not know that number.");
        } else if (answer?.error === "expired") {
          setNotice("That bid is no longer open. Try again.");
        } else {
          setNotice("The bid could not be started. Nothing is held on your card.");
        }
        return;
      }
      window.location.assign(answer.url);
    } catch {
      setNotice("The bid did not go through. Nothing is held on your card.");
    } finally {
      setBusy(false);
    }
  };

  const ready = Boolean(buyerType && country && name.trim() && (buyerType === "business" || waived));

  return (
    <>
      <PanelHeader
        title="Tomorrow’s banner"
        note="The 5 × 5 spot, for a whole day"
        onClose={close}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="border-hairline flex items-end justify-between gap-4 border-b px-4 py-3">
          <div>
            <div className="text-faint text-[13px] leading-tight">Closes 00:00 UTC</div>
            <Countdown className="font-display text-[30px] leading-none" until={auction?.closesAt} />
          </div>
          <div className="text-right">
            <div className="text-faint text-[13px] leading-tight">
              {topBid ? `Top bid · ${liveBids.length} bids` : "No bids yet"}
            </div>
            <Money
              amount={topBid ? Math.round(topBid.amountCents / 100) : BID_FLOOR}
              className="text-[26px] leading-none"
            />
          </div>
        </div>

        {viewerIsTopBidder ? (
          <div className="bg-accent px-4 py-3 text-[14px] leading-snug text-white">
            You are the top bidder. Hold it until the countdown runs out and the banner is yours
            tomorrow.
          </div>
        ) : null}

        {viewerOutbid ? (
          <div className="bg-ink text-page px-4 py-3 text-[14px] leading-snug">
            You have been outbid. Your hold stays on your card until the close, so you are still
            next in line. Go higher to take the lead back.
          </div>
        ) : null}

        {/* ⚠️ The empty hour, and the only thing that answers it. The auction
            closes at 00:00 UTC and the day it decides begins at 00:00 UTC, so the
            winner gets no preparation time at all. A bidder who points their
            standing bid somewhere now gets the whole day; one who does not gets
            the house ad until they upload (ticket 07). */}
        {standing ? <StandingBid bid={standing} onSave={setBannerContent} /> : null}

        <div className="flex flex-col gap-4 px-4 py-4">
          <Field
            label="Your bid"
            error={error}
            hint={`At least $${minNextBid.toLocaleString("en-US")}, in whole dollars`}
          >
            <input
              className={inputClass}
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
              inputMode="numeric"
            />
          </Field>

          <FieldBox label="You are">
            <div className="flex gap-2">
              {(["business", "consumer"] as const).map((kind) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => setBuyerType(kind)}
                  aria-pressed={buyerType === kind}
                  className={`border-hairline flex-1 border px-3 py-2 text-[13px] transition-colors duration-150 ${
                    buyerType === kind ? "bg-ink text-white" : "bg-white hover:bg-[#F7F8F4]"
                  }`}
                >
                  {kind === "business" ? "A business" : "A private person"}
                </button>
              ))}
            </div>
          </FieldBox>

          <Field label="Country">
            <select
              className={inputClass}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              <option value="">Choose your country</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label={buyerType === "business" ? "Legal name" : "Full name"}>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="As it goes on the invoice"
              autoComplete="name"
            />
          </Field>

          {askVat ? (
            <Field
              label="EU VAT number"
              error={vatError}
              hint="Leave it empty if you have none. We then charge Dutch VAT."
            >
              <input
                className={inputClass}
                value={vatNumber}
                onChange={(e) => {
                  setVatNumber(e.target.value);
                  setVatError(null);
                }}
                placeholder="IE6388047V"
                autoComplete="off"
              />
            </Field>
          ) : null}

          {vatError ? (
            <SecondaryButton
              onClick={() => {
                setBuyerType("consumer");
                setVatNumber("");
                setVatError(null);
              }}
            >
              Continue as a private person
            </SecondaryButton>
          ) : null}

          {/* Not before both fields are answered: the VAT case is decided by
              buyer type and country, and a line that guesses at it is a price
              that changes while you look at it. */}
          {buyerType && country && totalCents > 0 ? (
            <p className="text-faint text-[12px] leading-snug">
              {vat.vatCase === "nl21"
                ? `${money(totalCents)} includes ${NL_VAT_BPS / 100}% Dutch VAT (${money(vat.vatCents)}).`
                : vat.vatCase === "reverse"
                  ? `${money(totalCents)}, VAT reverse-charged. We check the number before you bid.`
                  : `${money(totalCents)}. No VAT is charged outside the EU.`}
            </p>
          ) : null}

          {/* The three sentences, and every one of them is literally true when
              it is read — which on this box means at 23:59 as much as at 09:00. */}
          <ul className="text-faint border-hairline flex flex-col gap-1 border-t pt-3 text-[12px] leading-snug">
            {BID_TRUTHS.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>

          {buyerType === "consumer" ? (
            <div className="border-hairline border-t pt-3">
              <label className="flex cursor-pointer items-start gap-2 text-[13px] leading-snug">
                <input
                  type="checkbox"
                  checked={waived}
                  onChange={(e) => setWaived(e.target.checked)}
                  className="mt-[3px] shrink-0"
                />
                <span>{BANNER_WITHDRAWAL_TEXT}</span>
              </label>
              <p className="text-faint pt-2 text-[12px] leading-snug">{BANNER_WITHDRAWAL_INFO}</p>
            </div>
          ) : null}

          <p className="text-faint text-[12px] leading-snug">{INVOICE_TEXT}</p>

          {/* ⚠️ Turnstile, and it may not be hidden. An `empty:hidden` here made
              the container `display:none` before the widget was rendered into it,
              and Cloudflare refuses to run a widget it cannot see. An empty div
              takes no room; that is enough. */}
          <div ref={box} />

          {notice ? <p className="text-accent text-[13px] leading-snug">{notice}</p> : null}

          <PrimaryButton onClick={place} disabled={busy || !ready}>
            {busy ? "PLACING…" : BID_BUTTON}
          </PrimaryButton>
          <p className="text-faint text-[12px] leading-snug">
            The next screen is Stripe, where your card is held. Cards only — a hold cannot be
            placed any other way.
          </p>
        </div>

        <div className="border-hairline min-h-0 border-t">
          {liveBids.map((bid) => {
            const mineBid = !!viewer && bid.ownerId === viewer.id;
            return (
              <div
                key={bid.id}
                className="border-hairline flex items-baseline justify-between gap-3 border-b px-4 py-2 text-[13px] last:border-b-0"
              >
                <span className={mineBid ? "font-semibold" : ""}>
                  {mineBid ? "You" : (bid.ownerName || "Somebody")}
                </span>
                {/* Null until the client has a clock: "how long ago" is the
                    visitor's own, and the server has no idea what second it is. */}
                <span className="text-faint">
                  {now ? agoLabel(bid.placedAt, now.getTime()) : " "}
                </span>
                <Money amount={Math.round(bid.amountCents / 100)} className="text-[15px]" />
              </div>
            );
          })}
          {liveBids.length === 0 ? (
            <p className="text-faint px-4 py-3 text-[13px]">
              Nobody has bid. The first bid takes the banner.
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
}

/**
 * Where a standing bid is pointed.
 *
 * ⚠️ The **image** half is [ticket 20](../../../.scratch/200squares-v1/issues/20-build-artwork.md)'s:
 * it owns `generateUploadUrl`, the two WebP sizes and the crop. The field it
 * lands in, the link beside it and the copy onto the banner day at the close are
 * ticket 19's, and a bid that carries a link and no image still beats one that
 * carries neither.
 */
function StandingBid({
  bid,
  onSave,
}: {
  bid: { id: string; amountCents: number; url: string };
  onSave: (args: { bidId: Id<"bids">; url: string }) => Promise<null>;
}) {
  const [url, setUrl] = useState(bid.url);
  const [saved, setSaved] = useState(false);

  return (
    <div className="border-hairline flex flex-col gap-2 border-b bg-[#F7F8F4] px-4 py-3">
      <div className="text-[13px] leading-snug">
        Your bid of <Money amount={Math.round(bid.amountCents / 100)} className="text-[14px]" /> is
        standing. Point it somewhere now — the day starts the moment the auction closes, so there
        is no hour afterwards to get ready in.
      </div>
      <div className="flex gap-2">
        <input
          className={inputClass}
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setSaved(false);
          }}
          placeholder="yourcompany.com"
          autoComplete="url"
        />
        <SecondaryButton
          onClick={() => {
            void onSave({ bidId: bid.id as Id<"bids">, url: cleanUrl(url) }).then(() =>
              setSaved(true),
            );
          }}
        >
          {saved ? "Saved" : "Save"}
        </SecondaryButton>
      </div>
    </div>
  );
}
