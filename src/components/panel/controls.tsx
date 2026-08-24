"use client";

// The panel's small parts. They exist once so the buy flow, the bid flow and My
// squares cannot drift apart — the panel is one surface, so it has to look like
// one surface whichever flow is in it.
//
// White means editable. The ground is muted paper and a square turns white under
// the pointer, so an input that is white belongs to the same language.

export function PanelHeader({
  title,
  note,
  onClose,
}: {
  title: string;
  note?: string;
  onClose: () => void;
}) {
  return (
    <div className="border-hairline flex items-start justify-between gap-4 border-b px-4 py-3">
      <div>
        <div className="font-display text-[19px] leading-tight">{title}</div>
        {note ? <div className="text-faint text-[13px] leading-tight">{note}</div> : null}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="text-faint hover:text-ink -mr-1 -mt-1 grid h-8 w-8 shrink-0 place-items-center text-[17px] leading-none transition-colors duration-150"
      >
        ×
      </button>
    </div>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-faint block pb-1 text-[13px]">{label}</span>
      {children}
      {error ? (
        <span className="text-accent block pt-1 text-[12px]">{error}</span>
      ) : hint ? (
        <span className="text-faint block pt-1 text-[12px]">{hint}</span>
      ) : null}
    </label>
  );
}

export const inputClass =
  "border-hairline w-full border bg-white px-3 py-2 text-[14px] placeholder:text-faint/70";

export function PrimaryButton({
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className="bg-accent font-display w-full px-4 py-3 text-[16px] text-white transition-colors duration-150 hover:bg-[#B81C4E] disabled:bg-[#C9A5B2]"
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className="border-hairline border bg-white px-3 py-2 text-[13px] font-medium transition-colors duration-150 hover:bg-[#F7F8F4]"
    >
      {children}
    </button>
  );
}

/** A money line in the display face, tabular so it does not jump as it changes. */
export function Money({ amount, className }: { amount: number; className?: string }) {
  return (
    <span className={`font-display ${className ?? ""}`} data-numeric>
      ${amount.toLocaleString("en-US")}
    </span>
  );
}
