// Housekeeping, the two cached rows that keep fan-out off the hot paths — and,
// since ticket 19, the one job here that **is** correctness.
//
// Nothing else here is correctness. Every reader already ignores an expired
// reservation, and the board is live off the tables unless the kill switch says
// otherwise. These crons keep the tables small and the cached rows fresh.

import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// The reservation sweep. Lazy expiry already makes an unswept row harmless, so
// this runs on the hour and not on the minute.
crons.hourly("sweep reservations", { minuteUTC: 5 }, internal.reservations.sweep);

// ⚠️ The board snapshot. Written on every run whether or not the kill switch is
// thrown, because a snapshot built the moment the switch is thrown is a
// snapshot built under the load the switch was thrown to escape. Building it
// costs one function call every two minutes, always, which is the cheap half of
// the trade.
crons.interval("build board snapshot", { minutes: 2 }, internal.snapshots.buildBoard);

// The public click total on /how-it-works, an hour old on purpose (ticket 10).
crons.hourly("sum site clicks", { minuteUTC: 15 }, internal.snapshots.buildSiteClicks);

// ⚠️ The auction close, and the only thing on this list that moves money.
//
// **Hourly on the hour, which includes 00:00 UTC.** Ticket 07 asked for a cron at
// midnight *and* lazy closing on read; half of that is unbuildable as written,
// because a Convex query may not capture money and an unauthenticated endpoint
// that does is a road a flood could walk down. One hourly job is both halves: it
// is the 00:00 close and its own retry, so a missed or failed run costs an hour
// of house ad and nothing else. `bannerDays.closedAt` makes every run after the
// first a no-op, which is the only defence worth having against a cron that
// fires twice.
crons.hourly("close the banner auction", { minuteUTC: 0 }, internal.auction.closeDue);

export default crons;
