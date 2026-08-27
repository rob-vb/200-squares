// Take today's banner off from /admin because the bidder withdrew, on staging.
//
//   npx convex run seed:ageAuction && npx convex run auction:closeDue
//   npx convex run auth:devSignInLink '{"email":"<the ADMIN_EMAILS address>"}'
//   node scripts/signin.mjs '<the url that came back>'
//   node scripts/withdraw.mjs [prefix]
//
// ⚠️ There is no other way to press this button. The close fires once a day at
// 00:00 UTC, `withdrawBanner` is admin-only, and the VPS has no browser and no
// inbox — so `seed:ageAuction` makes the day and `.auth.json` makes the admin.
//
// It starts from the session `scripts/signin.mjs` leaves in `.auth.json`, opens
// `/admin`, presses **The bidder withdrew**, writes a note and takes the day
// off. What to check afterwards, and none of it is on this screen:
//
//   npx convex run board:state  → banner null, so the house ad is up
//   npx convex data owners      → the winner's strikeAt is still []
//   npx convex data removals    → a row with no `rule`
//
// ⚠️ Run it from the repo root. Playwright resolves from node_modules.
import { chromium } from "playwright";

const BASE =
  "https://200-squares-git-staging-robs-projects-52973834.vercel.app";
const out = process.argv[2] ?? "withdraw";

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  storageState: ".auth.json",
});
const page = await context.newPage();
page.on("console", (m) => {
  if (m.type() === "error") console.log("  console:", m.text());
});

await page.goto(`${BASE}/admin`, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(2500);
const banner = page.locator("h2", { hasText: "Today’s banner" });
if ((await banner.count()) === 0) {
  console.error(
    "No banner today. Run seed:ageAuction and auction:closeDue first.",
  );
  process.exit(1);
}
await page.screenshot({ path: `${out}-before.png` });

await page.getByRole("button", { name: "The bidder withdrew" }).click();
await page.waitForTimeout(300);
await page
  .locator("textarea")
  .last()
  .fill("Withdrew by email 26 Aug 09:40 UTC. Refunded 9/24 of $100 at Stripe.");
await page.screenshot({ path: `${out}-form.png` });

await page.getByRole("button", { name: /Take the day off/ }).click();
await page.waitForTimeout(2500);
await page.screenshot({ path: `${out}-after.png` });
console.log(
  "admin says:",
  (await page.locator("section").innerText()).slice(0, 400),
);

// The board is the other half of the proof: the house ad has to be standing in.
await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(2500);
await page.screenshot({ path: `${out}-board.png` });

await browser.close();
