// The auction clock, on the client.
//
// ⚠️ `dayOffset` and `minutesAgo` are gone. The model now holds absolute UTC
// milliseconds and a banner day is a `YYYY-MM-DD` date string, so nothing here
// invents a date any more — it renders one the server already fixed. What is
// left is the countdown, which is genuinely the visitor's own clock, and two
// labels that turn a stored instant into words.

/** The next 00:00 UTC, in ms. Bidding on tomorrow's banner closes then. */
export function nextCloseUTC(now: Date): number {
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
}

export function msUntilClose(now: Date): number {
  return Math.max(0, nextCloseUTC(now) - now.getTime());
}

/** Hours, minutes and seconds until `until`, each already zero-padded. */
export function countdown(
  now: Date,
  until: number,
): { h: string; m: string; s: string; text: string } {
  const left = Math.max(0, until - now.getTime());
  const pad = (v: number) => String(v).padStart(2, "0");
  const h = pad(Math.floor(left / 3_600_000));
  const m = pad(Math.floor(left / 60_000) % 60);
  const s = pad(Math.floor(left / 1000) % 60);
  return { h, m, s, text: `${h}:${m}:${s}` };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** The UTC calendar day a millisecond falls in, as `YYYY-MM-DD`. */
export const todayUtc = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/**
 * "Today", "Yesterday", "18 Aug" — for a banner day's own `YYYY-MM-DD`.
 *
 * ⚠️ It compares date strings and never subtracts milliseconds. A banner day is
 * a UTC calendar day, and "22 hours ago" is yesterday or today depending on when
 * you ask.
 */
export function dayLabel(date: string, now: Date): string {
  const today = todayUtc(now.getTime());
  if (date === today) return "Today";
  const ms = now.getTime();
  if (date === todayUtc(ms + 86_400_000)) return "Tomorrow";
  if (date === todayUtc(ms - 86_400_000)) return "Yesterday";
  const [, m, d] = date.split("-");
  return `${Number(d)} ${MONTHS[Number(m) - 1]}`;
}

/** "just now", "40 min ago", "6 hours ago" — from an absolute UTC instant. */
export function agoLabel(at: number, now: number): string {
  const minutesAgo = Math.max(0, (now - at) / 60_000);
  if (minutesAgo < 2) return "just now";
  if (minutesAgo < 60) return `${Math.round(minutesAgo)} min ago`;
  const hours = Math.round(minutesAgo / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

/** Whole cents to "$1,240". Money is cents everywhere below the UI. */
export const usd = (cents: number) =>
  `$${Math.round(cents / 100).toLocaleString("en-US")}`;
