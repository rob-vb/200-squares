// Housekeeping, and the two cached rows that keep fan-out off the hot paths.
//
// Nothing here is correctness. Every reader already ignores an expired
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

export default crons;
