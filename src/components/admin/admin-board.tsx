"use client";

// The admin page, and it is allowed to be ugly.
//
// ⚠️ [Ticket 11](../../../.scratch/200squares-v1/issues/11-admin-removal.md) set
// the whole bar for this screen: *a list, a search, a **Strip** button with a
// required reason field, and an **Unfreeze** button. It may be ugly. It must
// work on a phone.* So it is one column of rows with big targets, and no layout
// that needs a mouse or a wide window.
//
// ⚠️ **One press does four things.** The mutation behind the button strips the
// artwork and the link, writes the strike, writes the `removals` row and books
// the mail, in one transaction. Nothing on this page does any of those four on
// its own, because four separate presses at midnight is how the wrong row gets
// touched — which is the entire argument against doing this in the Convex
// dashboard.
//
// ⚠️ **The fifth thing it books is the one that can fail after the press.** The
// picture also has to stop being served from Vercel's edge, and that is a
// network call the transaction cannot make (ADR 0004). So the list at the bottom
// of this page carries the only warning on the screen: a removal with no
// `purgedAt` is one the reporter can still open.
//
// The reason is required here **and** on the server. It goes to the owner as it
// was written, so an empty one would be a removal nobody can explain.

import { useState } from "react";
import { ConvexError } from "convex/values";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/api";
import type { Id } from "@convex/dataModel";
import { SecondaryButton, inputClass } from "../panel/controls";
import { useClientDate } from "../use-client-date";

/** The rules of `/terms`, in the words the owner can go and read. */
const RULES = [
  "Adult content",
  "Malware",
  "Impersonation",
  "A deceptive redirect",
  "A chat or invite link",
  "A link shortener",
  "Something else",
];

const sayWhy = (error: unknown) =>
  error instanceof ConvexError
    ? String(error.data)
    : "That did not save. Try again.";

export function AdminBoard() {
  const allowed = useQuery(api.admin.mayI, {});
  const [search, setSearch] = useState("");
  const board = useQuery(api.admin.board, allowed ? { search } : "skip");
  const removals = useQuery(api.admin.removals, allowed ? {} : "skip");
  const owed = useQuery(api.withdrawal.owed, allowed ? {} : "skip");
  const now = useClientDate();
  const unpurged = removals?.filter((row) => !row.purged).length ?? 0;

  if (allowed === undefined) return null;
  if (!allowed) {
    return (
      <section className="mx-auto w-full max-w-[1180px] px-4 py-10 lg:px-8">
        <p className="text-[17px]">That is not your page.</p>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-[1180px] px-4 py-10 lg:px-8">
      <input
        className={inputClass}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search a name, an address or a link"
        autoComplete="off"
      />

      {board?.banner ? (
        <div className="pt-8">
          <h2 className="font-display text-[20px]">Today&rsquo;s banner</h2>
          <BannerRow banner={board.banner} />
        </div>
      ) : null}

      <div className="pt-8">
        <h2 className="font-display text-[20px]">
          Blocks{board ? ` (${board.blocks.length})` : ""}
        </h2>
        {board?.blocks.map((block) => (
          <BlockRow key={block.id} block={block} />
        ))}
        {board && board.blocks.length === 0 ? (
          <p className="text-faint py-4 text-[14px]">Nothing matches that.</p>
        ) : null}
      </div>

      {/*
        ⚠️ The second alarm on this page, and it is money rather than a picture.
        Art. 6:230r lid 1 starts a 14-day refund clock on every declaration and
        [ADR 0003](../../../docs/adr/0003-a-bid-is-an-irrevocable-offer.md) keeps
        the amount a judgement made by hand, so nothing pays these but the dev
        remembering to. A mail can be lost; this list cannot (ticket 43).

        It is above the removals for the same reason removals are above nothing:
        it is the only thing on the screen with a deadline attached.
      */}
      {owed && owed.length > 0 ? (
        <div className="pt-8">
          <h2 className="font-display text-[20px]">Withdrawals waiting for a refund</h2>
          {owed.map((row) => (
            <OwedRow key={row.id} row={row} now={now} />
          ))}
        </div>
      ) : null}

      <div className="pt-8">
        <h2 className="font-display text-[20px]">What has been taken off</h2>
        {/* ⚠️ The one thing on this page that is not a record but an alarm.
            Deleting the file does not reach the copy Vercel's edge keeps for a
            year, so until the purge goes through the picture somebody reported
            is still public at the address they reported (ADR 0004). The retries
            stop after about eight hours; this does not. */}
        {unpurged > 0 ? (
          <p className="text-accent py-2 text-[14px] font-semibold">
            {unpurged === 1
              ? "1 removal is still being served from the edge."
              : `${unpurged} removals are still being served from the edge.`}{" "}
            The picture is still public at its /art URL.
          </p>
        ) : null}
        {removals?.length === 0 ? (
          <p className="text-faint py-4 text-[14px]">Nothing yet.</p>
        ) : null}
        {removals?.map((row, i) => (
          <div key={i} className="border-hairline border-b py-3 text-[13px]">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-display text-[15px]">{row.what}</span>
              <span className="text-faint">{row.ownerName}</span>
              <span className="font-mono text-[12px]" data-numeric>
                {now ? new Date(row.removedAt).toISOString().slice(0, 10) : " "}
              </span>
            </div>
            <div className="pt-1">
              {/* ⚠️ A withdrawal has no rule, and the absence is the record.
                  Ticket 32: nobody broke anything, so nothing may read as if
                  they had. */}
              {row.withdrawn ? "Withdrawn by the bidder · no strike" : row.rule}
              {row.froze ? " · froze the block" : ""}
            </div>
            <div className="text-faint pt-1">{row.reason}</div>
            {row.purged ? null : (
              <div className="text-accent pt-1 font-semibold">
                Still on the edge · the picture has not been purged
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * The form that empties something, and it is the same form for both.
 *
 * A rule and a reason. The reason is what the owner reads, so the placeholder
 * says so: it is not a note to self.
 */
function StripForm({
  label,
  onStrip,
}: {
  label: string;
  onStrip: (rule: string, reason: string) => Promise<unknown>;
}) {
  const [rule, setRule] = useState(RULES[0]);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const press = async () => {
    // The same check the server makes, said in the same words. A reason is what
    // the owner reads, so an empty one is not a removal anybody can explain.
    if (!reason.trim()) {
      setError("A reason is needed. The owner is told what it says.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onStrip(rule, reason);
      setReason("");
      setDone("Emptied. The owner has been told.");
    } catch (caught) {
      setError(sayWhy(caught));
    } finally {
      setBusy(false);
    }
  };

  if (done) return <div className="text-faint pt-2 text-[13px]">{done}</div>;

  return (
    <div className="flex flex-col gap-2 pt-2">
      <select
        className={inputClass}
        value={rule}
        onChange={(e) => setRule(e.target.value)}
        aria-label="Which rule was broken"
      >
        {RULES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <textarea
        className={`${inputClass} min-h-[72px]`}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="What you saw. The owner is sent these words."
      />
      <SecondaryButton onClick={() => void press()} disabled={busy}>
        {busy ? "…" : label}
      </SecondaryButton>
      {error ? <div className="text-accent text-[12px]">{error}</div> : null}
    </div>
  );
}

/**
 * The form that takes a day off without blaming anybody.
 *
 * ⚠️ It is deliberately **not** `StripForm`. No rule picker, because there is no
 * rule; and the note is a note to self rather than words the owner reads, which
 * is the one thing `StripForm`'s placeholder promises. The refund is not here
 * either: the dev works it out and pays it in the Stripe dashboard, and Art.
 * 14(3) dates it from the bidder's message, not from this press.
 */
function WithdrawForm({
  onWithdraw,
}: {
  onWithdraw: (note: string) => Promise<unknown>;
}) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const press = async () => {
    // The same check the server makes, in the same words.
    if (!note.trim()) {
      setError("A note is needed. Nothing else records why the day went off.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onWithdraw(note);
      setNote("");
      setDone(
        "The day is off. No strike, and nothing was sent — reply by hand and refund at Stripe.",
      );
    } catch (caught) {
      setError(sayWhy(caught));
    } finally {
      setBusy(false);
    }
  };

  if (done) return <div className="text-faint pt-2 text-[13px]">{done}</div>;

  return (
    <div className="border-hairline mt-3 flex flex-col gap-2 border-t pt-3">
      {/* ⚠️ Two textareas under one another, and pressing the wrong one costs a
          strike and a *you broke rule X* mail. So the second one says which it
          is, above the box, before it is typed in. */}
      <div className="text-[13px] font-semibold">
        The bidder withdrew — no strike, no mail
      </div>
      <textarea
        className={`${inputClass} min-h-[72px]`}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="When they wrote, and what you refunded. Nobody is sent this."
        aria-label="What happened. Nobody is sent this."
      />
      <SecondaryButton onClick={() => void press()} disabled={busy}>
        {busy ? "…" : "Take the day off — no strike"}
      </SecondaryButton>
      {error ? <div className="text-accent text-[12px]">{error}</div> : null}
    </div>
  );
}

function BannerRow({
  banner,
}: {
  banner: {
    date: string;
    ownerName: string;
    ownerEmail: string;
    url: string;
    hasArtwork: boolean;
    removed: boolean;
    strikes: number;
  };
}) {
  const removeBanner = useMutation(api.admin.removeBanner);
  const withdrawBanner = useMutation(api.admin.withdrawBanner);
  const [withdrawing, setWithdrawing] = useState(false);

  return (
    <div className="border-hairline border-b py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2 text-[13px]">
        <span className="font-display text-[15px]">{banner.date}</span>
        <span>{banner.ownerName || banner.ownerEmail}</span>
        <span className="text-faint">
          {banner.strikes} {banner.strikes === 1 ? "strike" : "strikes"}
        </span>
      </div>
      <div className="truncate pt-1 text-[13px]">{banner.url || "No link"}</div>
      {banner.removed ? (
        <div className="text-accent pt-2 text-[13px] font-semibold">
          Taken off for the rest of today. The house advertisement is standing
          in.
        </div>
      ) : (
        <>
          <StripForm
            label="Take the banner off"
            onStrip={(rule, reason) =>
              removeBanner({ date: banner.date, rule, reason })
            }
          />
          {/* ⚠️ The second door, and it is not the same door. Ticket 32: a
              withdrawal is not a rule break, so it takes no strike, names no
              rule and sends no mail. It is kept shut by default because the
              rule break is the case that happens at midnight in a hurry. */}
          {withdrawing ? (
            <WithdrawForm
              onWithdraw={(note) => withdrawBanner({ date: banner.date, note })}
            />
          ) : (
            <div className="pt-2">
              <SecondaryButton onClick={() => setWithdrawing(true)}>
                The bidder withdrew
              </SecondaryButton>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function BlockRow({
  block,
}: {
  block: {
    id: Id<"blocks">;
    what: string;
    ownerName: string;
    ownerEmail: string;
    url: string;
    hasArtwork: boolean;
    frozen: boolean;
    strikes: number;
  };
}) {
  const strip = useMutation(api.admin.strip);
  const unfreeze = useMutation(api.admin.unfreeze);
  const [open, setOpen] = useState(false);

  return (
    <div className="border-hairline border-b py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2 text-[13px]">
        <span className="font-display text-[15px]">{block.what}</span>
        <span>{block.ownerName || block.ownerEmail}</span>
        <span
          className={
            block.strikes > 0 ? "text-accent font-semibold" : "text-faint"
          }
        >
          {block.strikes} of 3
        </span>
      </div>
      <div className="truncate pt-1 text-[13px]">{block.url || "No link"}</div>
      <div className="text-faint pt-1 text-[13px]">
        {block.frozen
          ? "Frozen"
          : block.hasArtwork
            ? "Live"
            : "Waiting for artwork"}
      </div>

      {block.frozen ? (
        <div className="pt-2">
          {/* ⚠️ Not a right and not in `/terms`. The button exists because
              *never, no exceptions* is a promise the dev will want to break
              once, and at that moment `/terms` should not be in the way. */}
          <SecondaryButton onClick={() => void unfreeze({ blockId: block.id })}>
            Unfreeze
          </SecondaryButton>
        </div>
      ) : open ? (
        <StripForm
          label="Strip"
          onStrip={(rule, reason) => strip({ blockId: block.id, rule, reason })}
        />
      ) : (
        <div className="pt-2">
          <SecondaryButton onClick={() => setOpen(true)}>Strip</SecondaryButton>
        </div>
      )}
    </div>
  );
}

/**
 * One consumer who is owed money, and the press that says they have had it.
 *
 * ⚠️ **Oldest first and the clock can go negative.** A counter that stops at
 * nought hides the one case that matters — the refund that is already late — so
 * this counts down through zero and says *overdue* on the other side of it.
 *
 * ⚠️ **The press does not pay anybody.** The dev works the amount out and pays
 * it at Stripe (ADR 0003); this records that they did, and on a square it also
 * deletes the block so the rectangle goes back on the market and ticket 27's
 * sold-out count reads true. That is why the label says *Refunded* and not
 * *Refund*.
 */
function OwedRow({
  row,
  now,
}: {
  row: {
    id: Id<"withdrawals">;
    kind: "squares" | "banner";
    what: string;
    name: string;
    email: string;
    note: string;
    declaredAt: number;
    totalCents: number;
    daysLeft: number;
    hasBlock: boolean;
  };
  now: Date | null;
}) {
  const settle = useMutation(api.withdrawal.settle);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const late = row.daysLeft <= 0;

  return (
    <div className="border-hairline border-b py-3 text-[13px]">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-display text-[15px]">{row.what}</span>
        <span>{row.name || row.email}</span>
        <span className={late ? "text-accent font-semibold" : "text-faint"}>
          {late
            ? `${-row.daysLeft} ${-row.daysLeft === 1 ? "day" : "days"} overdue`
            : `${row.daysLeft} ${row.daysLeft === 1 ? "day" : "days"} left`}
        </span>
      </div>
      <div className="text-faint pt-1">
        {/* ⚠️ The declaration's own time, to the minute and in UTC. Art. 6:230s
            lid 4 prices a banner refund from it and art. 6:230r lid 1 counts
            the 14 days from it, so a date alone is not enough. */}
        Sent{" "}
        {now ? `${new Date(row.declaredAt).toISOString().slice(0, 16).replace("T", " ")} UTC` : " "}
        {" · "}
        {row.email}
      </div>
      {row.note ? <div className="pt-1">They wrote: {row.note}</div> : null}
      <div className="pt-1">
        {row.kind === "banner"
          ? "The banner is already off. Refund all but the hours that had run when they sent it."
          : row.hasBlock
            ? "The square is still on the board. Pay the refund at Stripe, then press below."
            : "The block is already gone."}
      </div>
      <div className="pt-2">
        <SecondaryButton
          onClick={() => {
            setBusy(true);
            setError(null);
            void settle({ withdrawalId: row.id })
              .catch((caught) => setError(sayWhy(caught)))
              .finally(() => setBusy(false));
          }}
          disabled={busy}
        >
          {busy ? "…" : "Refunded — take it off the board"}
        </SecondaryButton>
      </div>
      {error ? <div className="text-accent pt-1 text-[12px]">{error}</div> : null}
    </div>
  );
}
