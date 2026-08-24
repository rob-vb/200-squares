// The auction clock. Datasets hold no dates at all, so every time in the product
// is derived here from one fixed point: the next 00:00 UTC.
//
// dayOffset 1 is the banner being bid on now, 0 is the banner on the canvas
// today, -1 and down are past winners. The close turns 1 into 0.

const DAY_MS = 86_400_000;

/** The next 00:00 UTC, in ms. Bidding on tomorrow's banner closes then. */
export function nextCloseUTC(now: Date): number {
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
}

export function msUntilClose(now: Date): number {
  return Math.max(0, nextCloseUTC(now) - now.getTime());
}

/** Hours, minutes and seconds left, each already zero-padded. */
export function countdown(now: Date): { h: string; m: string; s: string; text: string } {
  const left = msUntilClose(now);
  const pad = (v: number) => String(v).padStart(2, "0");
  const h = pad(Math.floor(left / 3_600_000));
  const m = pad(Math.floor(left / 60_000) % 60);
  const s = pad(Math.floor(left / 1000) % 60);
  return { h, m, s, text: `${h}:${m}:${s}` };
}

/** The calendar day a dayOffset lands on. Offset 0 is today. */
export function dayOf(dayOffset: number, now: Date): Date {
  return new Date(nextCloseUTC(now) + (dayOffset - 1) * DAY_MS);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function dayLabel(dayOffset: number, now: Date): string {
  if (dayOffset === 0) return "Today";
  if (dayOffset === 1) return "Tomorrow";
  if (dayOffset === -1) return "Yesterday";
  const d = dayOf(dayOffset, now);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

/** "just now", "40 min ago", "6 hours ago". */
export function agoLabel(minutesAgo: number): string {
  if (minutesAgo < 2) return "just now";
  if (minutesAgo < 60) return `${Math.round(minutesAgo)} min ago`;
  const hours = Math.round(minutesAgo / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
