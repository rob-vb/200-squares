// Count a click, end to end on staging. There is no browser here.
//
//   npx convex run seed:full
//   npx convex run seed:adopt '{"email":"you@example.com"}'
//   npx convex run auth:devSignInLink '{"email":"you@example.com"}'
//   node scripts/signin.mjs '<the url that came back>'
//   node scripts/clicks.mjs [out-prefix]
//
// It reads the owner's own counts out of My squares, clicks one of their blocks
// on the board, and reads them again. The count is private to its owner
// (ticket 14), so the panel is the only place the number can be checked at all —
// which makes this the whole of ticket 21 through the product's own surfaces.
//
// It proves three things, and the third is the one that is easy to lose:
//
//   1. the block is a real `<a>` and opens a real tab (tickets 10, 21);
//   2. the count went up by one;
//   3. a **drag** across the same block opens nothing and counts nothing — the
//      board still owns the primary drag at every input (ticket 02).
//
// ⚠️ Run it from the repo root. Playwright resolves from node_modules.
import { chromium } from "playwright";

const BASE = "https://200-squares-git-staging-robs-projects-52973834.vercel.app";
const out = process.argv[2] ?? "clicks";

/** Every block row in My squares, as `{ url, clicks }`. */
async function myBlocks(page) {
  await page.locator("header button").first().click();
  await page.waitForTimeout(2000);
  const rows = await page.locator("div.border-hairline.border-b").allInnerTexts();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(600);
  return rows
    .map((text) => {
      const url = text.split("\n").find((line) => /^[a-z0-9.-]+\.[a-z]{2,}/i.test(line.trim()));
      const clicks = text.match(/Live · ([\d,]+) click/);
      return url && clicks ? { url: url.trim(), clicks: Number(clicks[1].replace(/,/g, "")) } : null;
    })
    .filter(Boolean);
}

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  storageState: ".auth.json",
});
const page = await context.newPage();
page.on("console", (m) => {
  if (m.type() === "error") console.log("  console:", m.text());
});

await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(2500);

const before = await myBlocks(page);
if (before.length === 0) {
  console.error("No live block on this account. Run seed:adopt for this address first.");
  await browser.close();
  process.exit(1);
}
const target = before[0];
console.log(`target: ${target.url} · ${target.clicks} clicks before`);

const link = page.locator(`a[href="https://${target.url}"]`).first();
if ((await link.count()) === 0) {
  console.error(`No anchor on the board for ${target.url}. The block is not a link.`);
  await browser.close();
  process.exit(1);
}
console.log("anchor found:", await link.getAttribute("aria-label"));
await page.screenshot({ path: `${out}-board.png` });

// 3 — the drag first, while the count is still known. Press on the block, walk
// off it, and let go: the canvas must read that as a gesture and not a click.
const box = await link.boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
await page.mouse.move(box.x + box.width / 2 + 220, box.y + box.height / 2 + 160, { steps: 12 });
await page.mouse.up();
await page.waitForTimeout(1500);
console.log(`tabs open after the drag: ${context.pages().length} (1 is right)`);

// 1 — the click, and the tab it opens.
const [opened] = await Promise.all([
  context.waitForEvent("page", { timeout: 15000 }).catch(() => null),
  link.click(),
]);
console.log("new tab:", opened ? opened.url() : "none — the link did not open");
if (opened) await opened.close();

// The beacon is thrown after the navigation and nothing waits for it, so this
// wait is the script's, not the site's.
await page.waitForTimeout(4000);

// 2 — the count.
const after = await myBlocks(page);
const now = after.find((b) => b.url === target.url);
console.log(`${target.url}: ${target.clicks} → ${now ? now.clicks : "?"} clicks`);
await page.screenshot({ path: `${out}-mine.png` });

const ok = opened && now && now.clicks === target.clicks + 1;
console.log(ok ? "OK — one click, one count." : "NOT OK — see above.");
await browser.close();
process.exit(ok ? 0 : 1);
