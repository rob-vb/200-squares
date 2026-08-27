"use client";

// Stripe's back link lands here, and this page has one job: give the squares
// back at once.
//
// ⚠️ A visitor who changes their mind on the payment page should not freeze five
// squares for the rest of the quarter hour (ticket 06). Closing the window is
// different — that one waits the fifteen minutes out, because nothing is left to
// tell the site anything.
//
// It is a page of its own rather than a `?cancelled=` on the board, because the
// board route may not read a search parameter and this way it never has to.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@convex/api";
import type { Id } from "@convex/dataModel";
import { Section } from "./content/section";
import { clearHold, readHold } from "@/lib/checkout/hold";

export function CheckoutCancelled() {
  const router = useRouter();
  const release = useMutation(api.reservations.release);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    let done = false;
    const hold = readHold();
    clearHold();

    const go = async () => {
      if (hold) {
        try {
          await release({ reservationId: hold.reservationId as Id<"reservations"> });
        } catch {
          // The hold expires by itself in fifteen minutes. A failed release
          // costs the board a quarter hour, never a square.
        }
      }
      if (!done) router.replace("/");
    };
    void go();

    // If the board has not taken over after a few seconds, say something rather
    // than leaving an empty page.
    const id = window.setTimeout(() => setStuck(true), 4000);
    return () => {
      done = true;
      window.clearTimeout(id);
    };
  }, [release, router]);

  return (
    <Section title="Nothing was charged">
      <p className="max-w-[62ch] text-[17px] leading-snug">
        Those squares are free again.{" "}
        {stuck ? (
          <Link href="/" className="underline">
            Back to the board
          </Link>
        ) : (
          "Taking you back to the board."
        )}
      </p>
    </Section>
  );
}
