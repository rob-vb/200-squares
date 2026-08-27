// Press the withdrawal button, because there is no other way to press it here.
//
//   node scripts/declare.mjs <token> [out-prefix]      NOTE=... to write a line
//
// It opens `/withdraw/<token>` on staging, shoots the live page, fills the one
// optional field, presses **CONFIRM WITHDRAWAL**, and shoots the confirmation.
// Built by [ticket 43](../.scratch/200squares-v1/issues/43-build-withdrawal-function.md).
//
// ⚠️ The token is in the address and nowhere else. Read it off the order:
// `npx convex data orders --order desc --limit 1` prints `withdrawalToken`, and
// a business order has none at all — that address is a 404 on purpose.
//
// ⚠️ It prints the words as well as taking pictures. The date and time on the
// confirmation are what art. 11a lid 4 is about, and a screenshot cannot be read
// line by line.
import { chromium } from "playwright";

const BASE = "https://200-squares-git-staging-robs-projects-52973834.vercel.app";
const token = process.argv[2];
const out = process.argv[3] ?? "declare";
const note = process.env.NOTE ?? "";
if (!token) throw new Error("Give it a withdrawal token.");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const res = await page.goto(`${BASE}/withdraw/${token}`, {
  waitUntil: "networkidle",
  timeout: 45000,
});
console.log("page", res.status(), await page.title());
await page.screenshot({ path: `${out}-1-live.png`, fullPage: true });

const button = page.getByRole("button", { name: /CONFIRM WITHDRAWAL/i }).first();
if (!(await button.isVisible().catch(() => false))) {
  console.log(await page.locator("body").innerText());
  throw new Error("There is no confirm button on that page.");
}
if (note) await page.locator("textarea").first().fill(note);

await button.click();
// The subscription swaps the whole page for the confirmation, so wait for the
// words rather than for a navigation that never happens.
await page.getByText("We have your withdrawal").first().waitFor({ timeout: 30000 });
await page.waitForTimeout(500);
await page.screenshot({ path: `${out}-2-done.png`, fullPage: true });
console.log(await page.locator("body").innerText());

await browser.close();
