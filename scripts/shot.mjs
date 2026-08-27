// Screenshot the staging board. There is no browser on the VPS, so this is how
// an agent checks its own work.
//
//   node scripts/shot.mjs [path] [out.png]        TEXT=1 to print the words too
//                                                 AUTH=1 to go in signed in
//
// ⚠️ `TEXT=1` is what ticket 28 needed and did not have: an invoice is read, not
// looked at, and a picture of one cannot be checked line by line.
//
// ⚠️ Run it from the repo root. Playwright resolves from node_modules, so
// running it from a scratch directory fails with ERR_MODULE_NOT_FOUND.
import { chromium } from "playwright";

const BASE = "https://200-squares-git-staging-robs-projects-52973834.vercel.app";
const path = process.argv[2] ?? "/";
const out = process.argv[3] ?? "shot.png";
const width = Number(process.env.W ?? 1440);
const height = Number(process.env.H ?? 900);

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width, height },
  // The session `scripts/signin.mjs` leaves behind, for a page that needs one.
  ...(process.env.AUTH === "1" ? { storageState: ".auth.json" } : {}),
});
const page = await context.newPage();
const res = await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 45000 });
console.log(res.status(), await page.title());
if (process.env.TEXT === "1") console.log(await page.locator("body").innerText());
await page.screenshot({ path: out, fullPage: process.env.FULL === "1" });
await browser.close();
