// Release every live reservation on the dev deployment.
//
//   node scripts/free-holds.mjs
//
// ⚠️ It exists because of ticket 06's *one live reservation per visitor*. The VPS
// has one address, so a checkout run that stops at Stripe locks the next run out
// with *You already have a reservation open*. Run this between runs of
// `scripts/flow.mjs`, or wait the fifteen minutes.
import { execSync } from "node:child_process";

const table = execSync("npx convex data reservations", { encoding: "utf8" });
let freed = 0;
for (const line of table.split("\n")) {
  const id = line.match(/^"([a-z0-9]{32})"/)?.[1];
  if (!id) continue;
  const cells = line.split("|").map((c) => c.trim());
  const expiresAt = Number(cells[3]);
  const releasedAt = cells.find((c, i) => i > 4 && /^17\d{11}$/.test(c) && c !== cells[3]);
  if (!(expiresAt > Date.now()) || releasedAt) continue;
  execSync(`npx convex run reservations:release '{"reservationId":"${id}"}'`, { stdio: "ignore" });
  console.log("released", id);
  freed++;
}
console.log(freed ? `${freed} released` : "nothing was being held");
