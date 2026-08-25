// Absolute UTC milliseconds everywhere, and one date string for the auction day.
//
// Ticket 05 removed every relative offset from the model. `dayOffset` and
// `minutesAgo` are gone: a stored offset resolves against whatever clock reads
// it, and two clocks disagree.

/** The UTC calendar day a millisecond falls in, as `YYYY-MM-DD`. */
export const todayUtc = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/** The 00:00 UTC that ends the day `ms` falls in — the auction close. */
export function nextMidnightUtc(ms: number): number {
  const d = new Date(ms);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1);
}

/** The day after `date`, as `YYYY-MM-DD`. The banner being bid on right now. */
export function nextDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return todayUtc(Date.UTC(y, m - 1, d + 1));
}

/** A reservation lives 15 minutes. Fixed by charting, not by a ticket. */
export const RESERVATION_MS = 15 * 60 * 1000;

/** A strike expires after twelve months (ticket 11). */
export const STRIKE_MS = 365 * 24 * 60 * 60 * 1000;

/**
 * The 00:00 UTC that **starts** the day `date` — which is the moment the
 * auction for that banner closes and the day it decides begins.
 *
 * ⚠️ The two are the same instant on purpose. Ticket 07: the winner gets no
 * preparation time at all, which is why a bid may carry artwork while it stands.
 */
export const midnightOf = (date: string) => Date.parse(`${date}T00:00:00.000Z`);
