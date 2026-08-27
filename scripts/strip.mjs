// Empty one block from /admin, because the button is admin-only and there is no
// browser here.
//
//   npx convex run auth:devSignInLink '{"email":"<the ADMIN_EMAILS address>"}'
//   node scripts/signin.mjs '<the url that came back>'
//   node scripts/strip.mjs <search> [reason] [prefix]
//
// It starts from the session `scripts/signin.mjs` leaves in `.auth.json`, opens
// `/admin` **at a phone width** — which is where ticket 11 said this screen is
// read — searches for an owner, picks the first row that is *Live*, and empties
// it with a rule and a reason. Every step leaves a screenshot behind.
//
// ⚠️ One press does four things (ticket 24): the picture goes, a strike lands,
// the owner is mailed the reason as written, and a `removals` row is kept. None
// of that is undone by pressing again.
//
// What to check afterwards, and none of it is on this screen:
//
//   node scripts/art-check.mjs /art/<id>   → 404, and it was a cached 200 before
//   npx convex data owners      → the owner's strikeAt has one more entry
//   npx convex data removals    → a row carrying the rule, the reason, and
//                                 `purgedAt` — without which the picture is
//                                 still being served from the edge
//
// ⚠️ Run it from the repo root. Playwright resolves from node_modules.
import { chromium } from "playwright";

const BASE = "https://200-squares-git-staging-robs-projects-52973834.vercel.app";
const search = process.argv[2];
const reason = process.argv[3] ?? "The picture showed an adult scene. It is off the board.";
const out = process.argv[4] ?? "strip";

if (!search) throw new Error("Usage: node scripts/strip.mjs <search> [reason] [prefix]");

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  storageState: ".auth.json",
});
const page = await context.newPage();
page.on("console", (m) => {
  if (m.type() === "error") console.log("  console:", m.text());
});

await page.goto(`${BASE}/admin`, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(2500);
if ((await page.getByText("that is not your page").count()) > 0) {
  throw new Error("not admin — check ADMIN_EMAILS and who .auth.json is");
}
await page.screenshot({ path: `${out}-1-admin.png`, fullPage: true });

await page.getByPlaceholder("Search a name, an address or a link").fill(search);
await page.waitForTimeout(1200);
await page.screenshot({ path: `${out}-2-found.png`, fullPage: true });

// The rows are siblings under one list. A row that is *Live* has a picture on
// it, which is the only kind worth emptying to prove /art goes with it.
const row = page.locator("div.border-hairline").filter({ hasText: "Live" }).first();
const before = (await row.innerText()).replace(/\n/g, " · ");
console.log("row:", before);
// ⚠️ Hold on to *which* row by its name. After the press the block reads
// "Waiting for artwork", so the locator above stops matching it — and reading it
// again through that locator is a 30-second timeout and a stack trace that looks
// like the strip failed when it worked.
const named = before.split(" · ")[0];

await row.getByRole("button", { name: "Strip", exact: true }).click();
await page.waitForTimeout(400);
await row.locator("select").selectOption("Adult content");
await row.locator("textarea").fill(reason);
await page.screenshot({ path: `${out}-3-filled.png`, fullPage: true });

await row.getByRole("button", { name: "Strip", exact: true }).click();
await page.waitForTimeout(3000);
await page.screenshot({ path: `${out}-4-done.png`, fullPage: true });
const after = page.locator("div.border-hairline").filter({ hasText: named }).first();
console.log("after:", (await after.innerText()).replace(/\n/g, " · "));

// ⚠️ The press is not finished when the board goes clean. `/art/<id>` is cached
// at Vercel's edge for a year and the purge is a scheduled action that can fail
// after the transaction has committed, so the list at the bottom of `/admin` is
// where a removal that half happened shows up. `node scripts/art-check.mjs
// /art/<id>` is the other half of the proof ([ADR 0004](../docs/adr/0004-a-year-is-a-cache-not-a-promise.md)).
const unpurged = await page.getByText("Still on the edge").count();
console.log("removals still on the edge:", unpurged);

await browser.close();
