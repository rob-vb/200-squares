"use client";

// The two steps art. 11a asks for, and nothing else on the page.
//
//   lid 2 — the online withdrawal statement. It lets the consumer *provide or
//           confirm* their name, details identifying the contract, and the
//           address the confirmation goes to. All three are shown filled in,
//           because the token already names the order; two of them stay
//           editable, because *provide or confirm* is not *read*.
//   lid 3 — the confirmation function, labelled **only** with the words
//           *confirm withdrawal* or an unambiguous equivalent.
//
// ⚠️ **Nothing on this page argues.** No offer to keep the square, no *are you
// sure*, no reason picker. Art. 6:230o lid 1 gives the right *zonder opgaaf van
// redenen*, ACM's whole point is that withdrawing must not be harder than
// buying, and a page that pushes back is the thing the statute exists to stop.
// The optional line is optional and says so.
//
// ⚠️ **The state comes from the server once and then lives.** The page is
// rendered from a server read so an unknown token can be a real 404
// (`src/app/withdraw/[token]/page.tsx`); the subscription below is what makes
// the confirmation appear the moment the mutation lands, on the same screen.

import { useState } from "react";
import Link from "next/link";
import { ConvexError } from "convex/values";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@convex/api";
import { PrimaryButton, inputClass } from "./panel/controls";
import { Section } from "./content/section";

type Found = NonNullable<FunctionReturnType<typeof api.withdrawal.byToken>>;

/** `27 August 2026, 14:05 UTC`. ⚠️ UTC to the minute — lid 4 wants a time. */
const stamp = (ms: number) =>
  `${new Date(ms).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })}, ${new Date(ms).toISOString().slice(11, 16)} UTC`;

/** The last day, without a time. What a deadline reads like in a sentence. */
const dayOf = (ms: number) =>
  new Date(ms).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

export function Withdraw({ token, initial }: { token: string; initial: Found }) {
  // The server's answer stands until the websocket has its own, so the page
  // never blinks through an empty state it has already been given.
  const live = useQuery(api.withdrawal.byToken, { token });
  const found = live ?? initial;

  if (found.state === "done" && found.declaredAt !== null) {
    return <Done found={found} declaredAt={found.declaredAt} />;
  }
  if (found.state === "expired") return <Expired found={found} />;
  return <Live token={token} found={found} />;
}

/**
 * Inside the period: the statement, then the button.
 *
 * ⚠️ The button says **`CONFIRM WITHDRAWAL`** and may say nothing else. Art. 11a
 * lid 3: *labelled in an easily legible manner, and only with the words "confirm
 * withdrawal" or with an unambiguous corresponding formulation*. The site's
 * other primary buttons carry a condition after a dash (*ORDER NOW — OBLIGES YOU
 * TO PAY*); this one may not, and the difference is the statute's.
 */
function Live({ token, found }: { token: string; found: Found }) {
  const declare = useMutation(api.withdrawal.declare);
  const [name, setName] = useState(found.name);
  const [email, setEmail] = useState(found.email);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const press = async () => {
    setBusy(true);
    setError(null);
    try {
      await declare({ token, name, email, note });
    } catch (caught) {
      setError(
        caught instanceof ConvexError
          ? String(caught.data)
          : "That did not send. Try again, or write to hello@200squares.com.",
      );
      setBusy(false);
    }
    // ⚠️ No `setBusy(false)` on success. The subscription swaps this whole
    // component for the confirmation, and re-enabling a button that is about to
    // vanish is an invitation to press it twice.
  };

  return (
    <>
      <Section title="What you are withdrawing from">
        <p className="max-w-[62ch] text-[17px] leading-snug">{found.what}</p>
        <p className="text-faint max-w-[62ch] pt-3 text-[15px] leading-snug">
          {found.kind === "banner"
            ? `You can withdraw from this banner day until it ends, at 00:00 UTC on ${dayOf(
                found.endsAt,
              )}. Your banner comes off the board the moment you press the button, and you pay for the hours that had run.`
            : `You have until ${dayOf(
                found.endsAt,
              )} to withdraw from this purchase. A person then works out what you are owed and refunds it to the card you paid with, inside 14 days.`}
        </p>
      </Section>

      {/*
        ⚠️ Art. 11a lid 2, the paragraph that says what the statement collects:
        the name, the contract, and the address the confirmation is sent to. The
        contract is the section above; these are the other two. They are
        prefilled from the order because the token already names it — *provide or
        confirm* — and editable because a consumer may not be reachable at the
        address they paid with any more.
      */}
      <Section title="Your details">
        <div className="flex max-w-[420px] flex-col gap-3">
          <label className="block">
            <span className="text-faint block pb-1 text-[13px]">Your name</span>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </label>
          <label className="block">
            <span className="text-faint block pb-1 text-[13px]">
              Where we send your confirmation
            </span>
            <input
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              inputMode="email"
              autoComplete="email"
            />
          </label>
          <label className="block">
            <span className="text-faint block pb-1 text-[13px]">
              Anything you want to add (you do not have to)
            </span>
            <textarea
              className={`${inputClass} min-h-[72px]`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
        </div>
      </Section>

      <Section title="Confirm">
        <div className="flex max-w-[420px] flex-col gap-3">
          {/* The words that travel onto the declaration, shown above the button
              that sends them. What is stored is this sentence, as text. */}
          <p className="max-w-[62ch] text-[17px] leading-snug">{found.text}</p>
          {error ? <p className="text-accent text-[13px]">{error}</p> : null}
          <PrimaryButton onClick={() => void press()} disabled={busy || !email.trim()}>
            {busy ? "SENDING…" : "CONFIRM WITHDRAWAL"}
          </PrimaryButton>
          <p className="text-faint text-[12px] leading-snug">
            We send you a confirmation by email straight away. It states what you declared
            and the date and time you sent it.
          </p>
        </div>
      </Section>
    </>
  );
}

/**
 * The second visit, and the acknowledgement on the screen.
 *
 * ⚠️ Art. 11a lid 4 owes the acknowledgement **on a durable medium**, which the
 * mail is and a web page is not — so this does not replace it. It exists because
 * the alternative is a consumer who pressed the button seeing the button again
 * and pressing it twice.
 */
function Done({ found, declaredAt }: { found: Found; declaredAt: number }) {
  return (
    <Section title="We have your withdrawal">
      <p className="max-w-[62ch] text-[17px] leading-snug">
        You withdrew from {found.what.charAt(0).toLowerCase() + found.what.slice(1)} on{" "}
        {stamp(declaredAt)}. We have sent the confirmation to {found.email} — keep it.
      </p>
      <p className="text-faint max-w-[62ch] pt-3 text-[15px] leading-snug">
        {found.kind === "banner"
          ? "Your banner is off the board. You pay for the hours that had run when you sent this, and a person refunds the rest to the card you paid with."
          : "A person works out what you are owed and refunds it to the card you paid with."}{" "}
        We have 14 days from the time above. Your bank may take some days after that to show
        it.
      </p>
      <p className="text-faint max-w-[62ch] pt-3 text-[15px] leading-snug">
        If something is wrong, write to{" "}
        <a href="mailto:hello@200squares.com" className="underline">
          hello@200squares.com
        </a>
        . A person reads it.
      </p>
    </Section>
  );
}

/**
 * The period has run.
 *
 * ⚠️ **Not a 404.** Ticket 42: a page that explains is honest where a *not
 * found* is not — this address was real and the person holding it was told to
 * keep it. It names the address of a person, because a right that has expired
 * under one article may still be arguable under another and that is not a thing
 * a web page should decide.
 */
function Expired({ found }: { found: Found }) {
  return (
    <Section title="This has run out">
      <p className="max-w-[62ch] text-[17px] leading-snug">
        The time to withdraw from {found.what.charAt(0).toLowerCase() + found.what.slice(1)}{" "}
        ended on {dayOf(found.endsAt)}, so this button no longer does anything.
      </p>
      <p className="text-faint max-w-[62ch] pt-3 text-[15px] leading-snug">
        If you think that is wrong, or you sent us something before that date, write to{" "}
        <a href="mailto:hello@200squares.com" className="underline">
          hello@200squares.com
        </a>{" "}
        and say so. A person reads it.{" "}
        <Link href="/" className="underline">
          The board
        </Link>{" "}
        is where the rest of the site is.
      </p>
    </Section>
  );
}
