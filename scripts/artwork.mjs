// Put a picture on a block, end to end on staging. There is no browser here.
//
//   npx convex run auth:devSignInLink '{"email":"you@example.com"}'
//   node scripts/signin.mjs '<the url that came back>'
//   node scripts/artwork.mjs [out-prefix]
//
// It starts from the session `scripts/signin.mjs` left in `.auth.json`, makes a
// source image on the spot, opens My squares, uploads to the first block that
// takes one, and screenshots the board afterwards. It also asks `/art/<id>` for
// the file it just stored and prints the cache header, which is the whole of
// ticket 09's delivery rule.
//
// ⚠️ Run it from the repo root. Playwright resolves from node_modules.
import { chromium } from "playwright";

const BASE = "https://200-squares-git-staging-robs-projects-52973834.vercel.app";
const out = process.argv[2] ?? "art";

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  storageState: ".auth.json",
});
const page = await context.newPage();
page.on("console", (m) => {
  if (m.type() === "error") console.log("  console:", m.text());
});

// A source image with the wrong shape on purpose: 3:2, so the crop has work to
// do whatever the block turns out to be.
const maker = await context.newPage();
await maker.setContent(`<body style="margin:0">
  <div style="width:1200px;height:800px;background:linear-gradient(135deg,#d6265e,#23261f);
              color:#fff;font:700 130px/1 Arial;display:grid;place-items:center">UPLOAD</div>
</body>`);
await maker.locator("div").screenshot({ path: `${out}-source.png` });
await maker.close();
console.log(`source image written to ${out}-source.png`);

await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(2500);

// My squares is the first button in the top bar once there is a session.
await page.locator("header button").first().click();
await page.waitForTimeout(2000);
await page.screenshot({ path: `${out}-mine-before.png` });

const inputs = page.locator('input[type="file"]');
const count = await inputs.count();
console.log("file inputs on the panel:", count);
if (count === 0) {
  console.error("No block to upload to. Run seed:adopt for this address first.");
  await browser.close();
  process.exit(1);
}

await inputs.first().setInputFiles(`${out}-source.png`);
await page.waitForTimeout(1500);
await page.screenshot({ path: `${out}-crop.png` });

// Drag the crop window, so what is stored is not simply the centred default.
const box = await page.locator('div[style*="aspect-ratio"]').first().boundingBox();
if (box) {
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - 60, box.y + box.height / 2, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${out}-crop-dragged.png` });
}

await page.getByRole("button", { name: "USE THIS" }).first().click();

// The write lands over the websocket. Wait for the button to go back.
await page
  .getByRole("button", { name: "USE THIS" })
  .first()
  .waitFor({ state: "detached", timeout: 60000 })
  .catch(() => console.log("the crop box is still open — see the last screenshot"));
await page.waitForTimeout(3000);
await page.screenshot({ path: `${out}-mine-after.png` });

// Close the panel and look at the board itself.
await page.keyboard.press("Escape");
await page.locator("header button").first().click();
await page.waitForTimeout(2500);
await page.screenshot({ path: `${out}-board.png` });

// What the board is actually pointing at, and what the edge says about it.
const src = await page.evaluate(() => {
  const hit = Array.from(document.querySelectorAll("div")).find((d) =>
    (d.style.backgroundImage || "").includes("/art/"),
  );
  return hit ? hit.style.backgroundImage : null;
});
console.log("board is drawing:", src);

const url = src?.match(/\/art\/[A-Za-z0-9_-]+/)?.[0];
if (url) {
  const res = await context.request.get(BASE + url);
  console.log(url, res.status(), res.headers()["content-type"], "\n  cache-control:", res.headers()["cache-control"]);
  console.log("  bytes:", (await res.body()).length);
}

await browser.close();
