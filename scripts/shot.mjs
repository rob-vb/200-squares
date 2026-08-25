// Screenshot the staging board. There is no browser on the VPS, so this is how
// an agent checks its own work.
//
//   node scripts/shot.mjs [path] [out.png]
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
const page = await browser.newPage({ viewport: { width, height } });
const res = await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 45000 });
console.log(res.status(), await page.title());
await page.screenshot({ path: out, fullPage: process.env.FULL === "1" });
await browser.close();
