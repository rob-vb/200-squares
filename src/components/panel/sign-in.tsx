"use client";

// Sign in: an address, and a link sent to it.
//
// ⚠️ There is no password and there is no reset. Ticket 08 made the email the
// only key, so this form is the whole of signing in — and the mail it sends is
// the one ticket 13 called the one that may not fail.
//
// Buying needs none of this. The panel says so out loud, because a visitor who
// meets a sign-in form on a shop assumes they need an account to buy, and here
// they do not: the account is made for them by the payment, and this is only how
// they come back to it.

import { useState } from "react";
import { Field, PanelHeader, PrimaryButton, inputClass } from "./controls";
import { useScreen } from "./flow";
import { authClient } from "@/lib/auth-client";
import { useTurnstile } from "@/lib/checkout/turnstile";

export function SignInFlow() {
  const { close } = useScreen();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The same widget as the reservation. "Send me a link" is an unauthenticated
  // write that spends Resend's free 3,000 a month, and a loop on it takes out
  // the only key to every account (tickets 08 and 13). The token rides as
  // `x-captcha-response`, which Better Auth's captcha plugin reads.
  const { box, getToken } = useTurnstile(!sent);

  const send = async () => {
    const address = email.trim();
    if (!address.includes("@")) {
      setError("That does not look like an email address.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        setError("The check did not finish. Try again.");
        return;
      }
      const result = await authClient.signIn.magicLink(
        { email: address, callbackURL: "/" },
        { headers: { "x-captcha-response": token } },
      );
      if (result.error) {
        setError("The link could not be sent. Try again in a minute.");
        return;
      }
      setSent(true);
    } catch {
      setError("The link could not be sent. Try again in a minute.");
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <>
        <PanelHeader title="Check your inbox" onClose={close} />
        <div className="space-y-3 px-4 py-4 text-[14px] leading-snug">
          <p>
            A link is on its way to <span className="font-medium">{email.trim()}</span>. It
            works once and it expires in an hour.
          </p>
          <p className="text-faint">
            Nothing arrives if that address has never bought a square and has never signed
            in here before.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <PanelHeader title="Sign in" note="No password. A link, by email." onClose={close} />

      <div className="space-y-4 px-4 py-4">
        <Field label="Your email address" error={error}>
          <input
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@company.com"
            autoFocus
          />
        </Field>

        {/* ⚠️ A real, visible box. Cloudflare refuses to run a widget inside a
            hidden container and refuses quietly — see `checkout/turnstile.ts`. */}
        <div ref={box} />

        <PrimaryButton onClick={send} disabled={busy}>
          {busy ? "Sending…" : "Send me a link"}
        </PrimaryButton>

        <p className="text-faint text-[13px] leading-snug">
          You do not need an account to buy a square. Buying makes one for you, and this is
          how you come back to it.
        </p>
      </div>
    </>
  );
}
