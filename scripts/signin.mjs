// Sign in on staging, because there is no browser and no inbox on the VPS.
//
//   npx convex run auth:devSignInLink '{"email":"you@example.com"}'
//   node scripts/signin.mjs '<the url that came back>' [out-prefix]
//
// It follows the magic link, screenshots the signed-in board and My squares, and
// leaves the session in `.auth.json` so another script can start signed in:
//
//   const ctx = await browser.newContext({ storageState: ".auth.json" });
//
// ⚠️ Run it from the repo root. Playwright resolves from node_modules.
//
// ⚠️ A magic link is single use. Ask for a new one for every run.
import { chromium } from "playwright";

const link = process.argv[2];
const out = process.argv[3] ?? "signin";
if (!link) {
  console.error("Give it a magic link. See the header of this file.");
  process.exit(1);
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
page.on("console", (m) => {
  if (m.type() === "error") console.log("  console:", m.text());
});

await page.goto(link, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(3500);
console.log("landed on", page.url());
await page.screenshot({ path: `${out}-board.png` });
console.log("top bar:", (await page.locator("header").innerText()).replace(/\n/g, " · "));

// My squares is the first button in the top bar once there is a session.
await page.locator("header button").first().click();
await page.waitForTimeout(2000);
await page.screenshot({ path: `${out}-mine.png` });

await context.storageState({ path: ".auth.json" });
console.log("session saved to .auth.json");
await browser.close();
