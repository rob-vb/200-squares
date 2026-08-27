"use client";

// Buy: one screen, and the screen the contract is concluded on.
//
// ⚠️ Company, link and artwork have **left this panel**. Ticket 06 moved all
// three behind the payment — the buyer supplies them on the thank-you page —
// and their place is taken by the fields ticket 03 requires before the money
// moves: buyer type with no default, name, an unticked withdrawal box with the
// Art. 6(1)(h) information under it, and the invoice line. Country and VAT
// number left with ADR 0006 — Stripe Managed Payments does the tax now.
//
// ⚠️ The button says *Order now — obliges you to pay*, and that is not a style
// choice. Under *Fuhrmann-2* only the words on the button that concludes the
// contract count, and Stripe's page says "Buy" — so the order is placed here,
// and Stripe is left executing a payment for an order that already exists.
//
// Underneath is ticket 15's claim: a reservation holds the rectangle for fifteen
// minutes, exactly one visitor can win a given square, and the loser is handed
// back the part of their drag that survived rather than an error.

import { useState } from "react";
import { api } from "@convex/api";
import { useMutation } from "convex/react";
import type { Id } from "@convex/dataModel";
import { Field, FieldBox, Money, PanelHeader, PrimaryButton, SecondaryButton, inputClass } from "./controls";
import { useScreen } from "./flow";
import { Countdown } from "../countdown";
import { Emphasis } from "@/components/emphasis";
import { INVOICE_TEXT, ORDER_BUTTON, WITHDRAWAL_INFO, WITHDRAWAL_TEXT } from "@/lib/checkout/consent";
import { clearHold, convexSite, useHold, writeHold } from "@/lib/checkout/hold";
import { useTurnstile } from "@/lib/checkout/turnstile";
import type { BuyerType } from "@/lib/checkout/buyer";
import { PRICE_PER_SQUARE, cellCount, priceCentsOf, priceOf, squareRange } from "@/lib/board/geometry";
import type { Rect } from "@/lib/board/types";

const money = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const squaresWord = (n: number) => `${n} ${n === 1 ? "square" : "squares"}`;

export function BuyFlow({ rect }: { rect: Rect }) {
  const { close, selectRect } = useScreen();
  const release = useMutation(api.reservations.release);

  // ⚠️ The hold is not this component's state. It lives in `sessionStorage`, so
  // it survives the trip to Stripe, the back button and a reload — and the two
  // screens below are told apart by one field on it: a hold with a Stripe URL
  // has been sent to pay, a hold without one is still being filled in.
  const held = useHold();
  const sentToStripe = Boolean(held?.stripeUrl);

  const [buyerType, setBuyerType] = useState<BuyerType | null>(null);
  const [name, setName] = useState("");
  const [waived, setWaived] = useState(false);

  const [busy, setBusy] = useState(false);
  const [lost, setLost] = useState<{ offer: Rect | null } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const { box, getToken } = useTurnstile(!sentToStripe);

  const totalCents = priceCentsOf(rect);
  const squares = cellCount(rect);

  const giveBack = async () => {
    // Closing first, so the panel does not sit there while the round trip runs.
    // A release that fails costs the board fifteen minutes, never a square.
    const hold = held;
    clearHold();
    close();
    if (hold) await release({ reservationId: hold.reservationId as Id<"reservations"> });
  };

  const order = async () => {
    setBusy(true);
    setNotice(null);
    setLost(null);
    try {
      let hold = held;

      // Reserve first. A Checkout Session for squares the site does not hold is
      // a payment it would have to give straight back.
      if (!hold) {
        const token = await getToken();
        if (!token) {
          setNotice("The check in front of the order did not finish. Reload the page and try again.");
          return;
        }
        const res = await fetch(`${convexSite()}/checkout/reserve`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rect, token }),
        });
        const answer = await res.json();
        if (!answer?.ok) {
          if (answer?.reason === "taken") {
            // ⚠️ Ticket 05: the loser is not shown an error and sent away. Their
            // selection is redrawn without the part that went, so a 2 × 2 that
            // lost one square becomes a 1 × 2 in one tap.
            setLost({ offer: answer.offer ?? null });
            if (answer.offer) selectRect(answer.offer);
          } else if (answer?.reason === "ip") {
            setNotice("You already have a reservation open. Finish that one, or give it back first.");
          } else if (answer?.reason === "ceiling") {
            setNotice("Too many squares are being paid for at this moment. Try again in a few minutes.");
          } else {
            setNotice("The check in front of the order did not pass. Reload the page and try again.");
          }
          return;
        }
        hold = { reservationId: answer.reservationId, expiresAt: answer.expiresAt, rect };
        writeHold(hold);
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationId: hold.reservationId,
          buyerType,
          name,
          withdrawalWaived: waived,
        }),
      });
      const answer = await res.json();

      if (!answer?.ok) {
        if (answer?.error === "expired") {
          clearHold();
          setNotice("The fifteen minutes ran out. Draw the rectangle again.");
        } else if (answer?.error === "conflict") {
          setNotice("The payment could not be started. Give the squares back and draw them again.");
        } else {
          setNotice("Something in the form is missing, or payment is not reachable. Try again.");
        }
        return;
      }

      writeHold({ ...hold, stripeUrl: answer.url });
      window.location.assign(answer.url);
    } catch {
      setNotice("The order did not go through. Nothing has been charged.");
    } finally {
      setBusy(false);
    }
  };

  if (held && sentToStripe) {
    return (
      <>
        <PanelHeader
          title="Held for you"
          note={`Square ${squareRange(held.rect)} · ${squaresWord(cellCount(held.rect))}`}
          onClose={giveBack}
        />
        <div className="flex flex-col gap-4 px-4 py-4">
          <div className="border-hairline flex items-baseline justify-between border-b pb-3">
            <span className="text-[14px]">Nobody else can take these</span>
            <Countdown className="font-display text-[26px] leading-none" until={held.expiresAt} />
          </div>
          <p className="text-[14px] leading-snug">
            We hold these squares for fifteen minutes. Your order is placed, and the payment for it
            is waiting on Stripe.
          </p>
          <PrimaryButton onClick={() => window.location.assign(held.stripeUrl!)}>
            CONTINUE PAYING
          </PrimaryButton>
          <SecondaryButton onClick={giveBack}>Give them back</SecondaryButton>
        </div>
      </>
    );
  }

  const ready = Boolean(buyerType && name.trim() && (buyerType === "business" || waived));

  return (
    <>
      <PanelHeader
        title={`${rect.w} × ${rect.h} · ${squaresWord(squares)}`}
        note={`Square ${squareRange(rect)} · $${PRICE_PER_SQUARE} each`}
        onClose={giveBack}
      />

      <div className="flex flex-col gap-4 px-4 py-4">
        <div className="border-hairline flex items-baseline justify-between border-b pb-3">
          <span className="text-[14px]">One payment, yours for good</span>
          <Money amount={priceOf(rect)} className="text-[26px] leading-none" />
        </div>

        {held ? (
          <div className="border-hairline flex items-baseline justify-between border-b pb-3">
            <span className="text-[14px]">Held for you</span>
            <Countdown className="font-display text-[20px] leading-none" until={held.expiresAt} />
          </div>
        ) : null}

        {lost ? (
          <p className="text-accent text-[14px] leading-snug">
            {lost.offer
              ? "Somebody took part of that while you were drawing. What is left is selected — take it, or draw somewhere else."
              : "Somebody took those while you were drawing. Draw somewhere else."}
          </p>
        ) : null}

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

        <Field label={buyerType === "business" ? "Legal name" : "Full name"}>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={buyerType === "business" ? "Company name" : "Your name"}
            autoComplete="name"
          />
        </Field>

        {/* Tax is Stripe's: it is inside the price, and the exact amount for
            the buyer's country appears on Stripe's page (ADR 0006). */}
        <p className="text-faint text-[12px] leading-snug">
          {money(totalCents)}, tax included. Stripe shows the tax for your country before you pay.
        </p>

        {/* One block, not two. The tick, its information and the invoice line
            are the same kind of thing to a buyer — small print at the moment of
            paying — and three floating grey paragraphs read as three subjects.
            ⚠️ All of it stays *above* the button: art. 6:230m wants the
            information before the buyer is bound, not beside the receipt. */}
        <div className="border-hairline flex flex-col gap-2 border-t pt-3">
          {buyerType === "consumer" ? (
            <>
              <label className="-mx-2 flex cursor-pointer items-start gap-2 rounded-[2px] px-2 py-1 text-[13px] leading-snug transition-colors duration-150 hover:bg-[#F7F8F4]">
                <input
                  type="checkbox"
                  checked={waived}
                  onChange={(e) => setWaived(e.target.checked)}
                  className="mt-[3px] shrink-0"
                />
                <span>{WITHDRAWAL_TEXT}</span>
              </label>
              <p className="text-faint text-[12px] leading-snug">
                <Emphasis text={WITHDRAWAL_INFO} />
              </p>
            </>
          ) : null}

          <p className="text-faint text-[12px] leading-snug">{INVOICE_TEXT}</p>
        </div>

        {/* ⚠️ Turnstile, and it may not be hidden. An `empty:hidden` here made
            the container `display:none` before the widget was rendered into it,
            and Cloudflare refuses to run a widget it cannot see — so every order
            press waited ten seconds for a token that was never coming. An empty
            div takes no room; that is enough. */}
        <div ref={box} />

        {notice ? <p className="text-accent text-[13px] leading-snug">{notice}</p> : null}

        <PrimaryButton onClick={order} disabled={busy || !ready}>
          {busy ? "ORDERING…" : ORDER_BUTTON}
        </PrimaryButton>
        <p className="text-faint text-[12px] leading-snug">
          The next screen is Stripe, where you pay. We hold these squares for fifteen minutes while
          you are there.
        </p>
      </div>
    </>
  );
}
