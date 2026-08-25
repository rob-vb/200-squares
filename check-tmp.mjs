// Put a picture on the standing bid, which is what tomorrow's banner will show.
import { chromium } from "playwright";
const BASE = "https://200-squares-git-staging-robs-projects-52973834.vercel.app";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, storageState: ".auth.json" });
const page = await ctx.newPage();
page.on("console", (m) => m.type() === "error" && console.log("  console:", m.text()));

const maker = await ctx.newPage();
await maker.setContent(`<body style="margin:0"><div style="width:1600px;height:600px;background:linear-gradient(90deg,#23261f,#d6265e);color:#fff;font:700 150px/1 Arial;display:grid;place-items:center">BANNER</div></body>`);
await maker.locator("div").screenshot({ path: "art-banner-source.png" });
await maker.close();

await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(2500);
await page.locator("header button").first().click();
await page.waitForTimeout(2000);

const inputs = page.locator('input[type="file"]');
// ⚠️ The panel is in the DOM twice — the side panel and the bottom sheet, one
// hidden by CSS. The visible copy at this width is the first half.
const half = (await inputs.count()) / 2;
console.log("inputs:", await inputs.count(), "— the bid's is", half - 1);
await inputs.nth(half - 1).setInputFiles("art-banner-source.png");
await page.waitForTimeout(1500);
await page.screenshot({ path: "art-bid-crop.png" });
await page.getByRole("button", { name: "USE THIS" }).first().click();
await page.getByRole("button", { name: "USE THIS" }).first().waitFor({ state: "detached", timeout: 60000 }).catch(() => console.log("still open"));
await page.waitForTimeout(3000);
await page.screenshot({ path: "art-bid-after.png" });
console.log("bid row now:", await page.locator("text=Your bids").locator("..").innerText());
await browser.close();
