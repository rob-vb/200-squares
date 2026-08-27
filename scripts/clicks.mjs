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

// ⚠️ The panel is in the DOM **twice** — the side panel and the bottom sheet,
// one hidden by CSS — so every locator here is filtered to what is on screen.
// A script that reaches for the last of anything reaches into the copy nobody
// can see.
const visibleRows = (page) => page.locator("div.border-hairline.border-b").locator("visible=true");

const openMine = async (page) => {
  await page.locator("header button").first().click();
  await page.waitForTimeout(2000);
};

const closeMine = async (page) => {
  await page.keyboard.press("Escape");
  await page.waitForTimeout(800);
};

/** Every live block row in My squares, as `{ url, clicks }`. A row with no
 *  artwork has never been clickable and says nothing about clicks at all. */
async function myBlocks(page) {
  await openMine(page);
  const rows = await visibleRows(page).allInnerTexts();
  await closeMine(page);
  return rows
    .map((text) => {
      const clicks = text.match(/Live · ([\d,]+) click/);
      if (!clicks) return null;
      const url = text.split("\n").find((line) => /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(line.trim()));
      return { url: url?.trim() ?? "", clicks: Number(clicks[1].replace(/,/g, "")) };
    })
    .filter(Boolean);
}

/** A block with no address is not a link and cannot be clicked. Give it one. */
async function setLink(page, url) {
  await openMine(page);
  const row = visibleRows(page).filter({ hasText: "Live ·" }).first();
  await row.getByRole("button", { name: "Edit link" }).click();
  await row.getByRole("textbox").fill(url);
  await row.getByRole("button", { name: "Save" }).click();
  await page.waitForTimeout(2000);
  await closeMine(page);
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

let before = await myBlocks(page);
if (before.length === 0) {
  console.error("No live block on this account. Run seed:adopt for this address first.");
  await browser.close();
  process.exit(1);
}
if (!before[0].url) {
  console.log("the first live block has no address yet — setting one through the panel");
  await setLink(page, "example.com");
  before = await myBlocks(page);
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

/** Open the link the way `how` says, and report the tab it produced. */
async function follow(how) {
  const [opened] = await Promise.all([
    context.waitForEvent("page", { timeout: 15000 }).catch(() => null),
    how(),
  ]);
  console.log(`  ${opened ? opened.url() : "no tab — the link did not open"}`);
  if (opened) await opened.close();
  // The beacon is thrown after the navigation and nothing waits for it, so this
  // wait is the script's and not the site's.
  await page.waitForTimeout(2500);
  return Boolean(opened);
}

// 1 — the click, and the tab it opens. Three times, three ways.
//
// The second is the permit doing its job: one Turnstile token is spent on the
// first click and every click after it rides on the same permit. The third is
// the keyboard, which reaches these links now that they are anchors — and which
// produces a click with no gesture behind it, the one case the canvas must not
// mistake for a stray drag.
console.log("plain click:");
const first = await follow(() => link.click());
console.log("second click, same permit:");
const second = await follow(() => link.click());
console.log("keyboard, Enter on the focused link:");
await link.focus();
const third = await follow(() => page.keyboard.press("Enter"));

// 2 — the count.
const after = await myBlocks(page);
const now = after.find((b) => b.url === target.url);
console.log(`${target.url}: ${target.clicks} → ${now ? now.clicks : "?"} clicks`);
await page.screenshot({ path: `${out}-mine.png` });

const ok = first && second && third && now && now.clicks === target.clicks + 3;
console.log(ok ? "OK — three clicks, three counts, one drag counted for nothing." : "NOT OK — see above.");
await browser.close();
process.exit(ok ? 0 : 1);
