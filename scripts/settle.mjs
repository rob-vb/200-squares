// Press *Refunded* on a withdrawal, because the button is admin-only.
//
//   node scripts/settle.mjs [search] [out-prefix]
//
// It starts from the session `scripts/signin.mjs` leaves in `.auth.json`, opens
// `/admin`, finds the first row under **Withdrawals waiting for a refund** whose
// text contains `search` (or the first row at all), and presses it. On a square
// that deletes the block, so the rectangle goes back on the market and ticket
// 27's sold-out count reads true again.
//
// ⚠️ The press does not pay anybody. The dev works the amount out and pays it at
// Stripe (ADR 0003); this records that they did. Built by
// [ticket 43](../.scratch/200squares-v1/issues/43-build-withdrawal-function.md).
import { chromium } from "playwright";

const BASE = "https://200-squares-git-staging-robs-projects-52973834.vercel.app";
const search = process.argv[2] ?? "";
const out = process.argv[3] ?? "settle";

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  storageState: ".auth.json",
});
const page = await context.newPage();
const res = await page.goto(`${BASE}/admin`, { waitUntil: "networkidle", timeout: 45000 });
console.log("admin", res.status(), await page.title());
await page.waitForTimeout(1500);

const buttons = page.getByRole("button", { name: /Refunded — take it off the board/i });
const count = await buttons.count();
console.log("waiting for a refund:", count);
if (count === 0) throw new Error("Nothing is waiting for a refund.");

let chosen = buttons.first();
if (search) {
  let found = false;
  for (let i = 0; i < count; i++) {
    const row = buttons.nth(i).locator("xpath=ancestor::div[1]/..");
    if ((await row.innerText()).includes(search)) {
      chosen = buttons.nth(i);
      found = true;
      break;
    }
  }
  if (!found) throw new Error(`No withdrawal row matches ${search}.`);
}

await chosen.scrollIntoViewIfNeeded();
await page.screenshot({ path: `${out}-1-before.png` });
await chosen.click();
await page.waitForTimeout(2500);
await page.screenshot({ path: `${out}-2-after.png` });

const still = await page
  .getByRole("button", { name: /Refunded — take it off the board/i })
  .count();
console.log("still waiting:", still);

await browser.close();
