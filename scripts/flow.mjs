// Drive the whole checkout on the staging URL, because there is no browser here.
//
//   node scripts/flow.mjs [out-prefix]        EMAIL=you@example.com to reach a real inbox
//                                             BUYER=business to buy as one
//
// It selects a free square, fills the panel, presses the order button, pays with
// a Stripe test card, waits for the thank-you page to show the block, and then
// puts a picture on it from that same page — which is the one grant a buyer with
// no account holds (ticket 20). Every step leaves a screenshot behind.
//
// ⚠️ Run `node scripts/free-holds.mjs` first if a previous run stopped at Stripe.
// One visitor may hold one reservation, and the VPS is one visitor.
//
// ⚠️ It only works because dev runs Cloudflare's dummy Turnstile keys. Turnstile
// will not complete a challenge from this machine — see *Turnstile on dev* in
// `docs/environments.md`.
import { chromium } from "playwright";

const BASE = "https://200-squares-git-staging-robs-projects-52973834.vercel.app";
const out = process.argv[2] ?? "flow";
const CARD = process.env.CARD ?? "4242424242424242";
// ⚠️ Ticket 28 needs a real inbox, so the address is an argument now.
const EMAIL = process.env.EMAIL ?? "agent+16@example.invalid";
// ⚠️ Ticket 43 needs both: a consumer order carries a withdrawal token and a
// business order carries none, and the second is what makes `/withdraw/<token>`
// a 404 for a business rather than a page that explains itself.
const BUYER = process.env.BUYER === "business" ? "A business" : "A private person";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("console", (m) => {
  if (m.type() === "error") console.log("  console:", m.text());
});

const res = await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
console.log("board", res.status(), await page.title());
await page.waitForTimeout(2500);

// The board is the transformed div inside the canvas box. Its bounding box is
// the grid, so a cell centre is arithmetic from there.
const boardBox = async () =>
  page.evaluate(() => {
    const box = document.querySelector("div.relative.flex-1.overflow-hidden.select-none");
    const grid = box?.firstElementChild?.firstElementChild;
    const r = grid.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  });

const b = await boardBox();
const centre = (r, c) => ({ x: b.x + ((c + 0.5) * b.w) / 16, y: b.y + ((r + 0.5) * b.h) / 14 });

// Walk the grid from the bottom right until one of them opens the buy panel.
let opened = false;
outer: for (let r = 13; r >= 5 && !opened; r--) {
  for (let c = 15; c >= 0; c--) {
    const p = centre(r, c);
    await page.mouse.click(p.x, p.y);
    await page.waitForTimeout(400);
    if (await page.getByText("One payment, yours for good").first().isVisible().catch(() => false)) {
      console.log("selected square at row", r, "col", c);
      opened = true;
      break outer;
    }
  }
}
if (!opened) {
  await page.screenshot({ path: `${out}-noselect.png` });
  throw new Error("No available square opened the buy panel.");
}

await page.screenshot({ path: `${out}-1-panel.png` });

await page.getByRole("button", { name: BUYER, exact: true }).first().click();
await page.locator("select").first().selectOption("NL");
await page.getByPlaceholder("Your name").first().fill("Test Koper");
// ⚠️ A business sees no withdrawal tick box, and that is the point: the right is
// a consumer's. So the box is checked where there is one and skipped where there
// is not, rather than being waited for.
const box = page.locator('input[type="checkbox"]').first();
if (await box.isVisible().catch(() => false)) await box.check();
await page.waitForTimeout(300);
await page.screenshot({ path: `${out}-2-filled.png` });

const order = page.getByRole("button", { name: /ORDER NOW/i }).first();
console.log("order button enabled:", await order.isEnabled());
await order.click();

await page.waitForURL(/checkout\.stripe\.com/, { timeout: 45000 });
console.log("stripe", page.url().slice(0, 60));
await page.waitForTimeout(5000);
await page.screenshot({ path: `${out}-3-stripe.png` });

await page.locator('#email, input[name="email"]').first().fill(EMAIL);
await page.locator('#cardNumber, input[name="cardNumber"]').first().fill(CARD);
await page.locator('#cardExpiry, input[name="cardExpiry"]').first().fill("12/34");
await page.locator('#cardCvc, input[name="cardCvc"]').first().fill("123");
await page.locator('#billingName, input[name="billingName"]').first().fill("Test Koper");
const line1 = page.locator('#billingAddressLine1, input[name="billingAddressLine1"]').first();
if (await line1.isVisible().catch(() => false)) await line1.fill("Teststraat 1");
const postal = page.locator('#billingPostalCode, input[name="billingPostalCode"]').first();
if (await postal.isVisible().catch(() => false)) await postal.fill("1011AA");
const city = page.locator('#billingLocality, input[name="billingLocality"]').first();
if (await city.isVisible().catch(() => false)) await city.fill("Amsterdam");
await page.screenshot({ path: `${out}-4-card.png` });

await page.screenshot({ path: `${out}-4b-ready.png` });
await page.locator('button[type="submit"]').first().click();
await page.waitForTimeout(4000);
await page.screenshot({ path: `${out}-4c-paid.png` });
await page.waitForURL(/\/thanks/, { timeout: 90000 });
console.log("thanks", page.url().slice(0, 80));
await page.waitForTimeout(6000);
await page.screenshot({ path: `${out}-5-thanks.png`, fullPage: true });
console.log("body:", (await page.locator("main").innerText()).slice(0, 600));

// The picture, on the same page and on the same grant: the session id in this
// address is the only thing this buyer holds, and there is no account yet
// (tickets 06 and 20). A source image is made here so the run needs no fixture.
const source = await page.evaluate(() => {
  const c = document.createElement("canvas");
  c.width = 1000;
  c.height = 1000;
  const x = c.getContext("2d");
  const g = x.createLinearGradient(0, 0, 1000, 1000);
  g.addColorStop(0, "#0C4A6E");
  g.addColorStop(1, "#38BDF8");
  x.fillStyle = g;
  x.fillRect(0, 0, 1000, 1000);
  x.fillStyle = "#fff";
  x.font = "700 150px Arial";
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.fillText("NEW", 500, 500);
  return c.toDataURL("image/png").split(",")[1];
});

await page.locator('input[type="file"]').first().setInputFiles({
  name: "source.png",
  mimeType: "image/png",
  buffer: Buffer.from(source, "base64"),
});
await page.waitForTimeout(1500);
await page.screenshot({ path: `${out}-6-crop.png` });
await page.getByRole("button", { name: "USE THIS" }).first().click();
await page
  .getByRole("button", { name: "USE THIS" })
  .first()
  .waitFor({ state: "detached", timeout: 60000 })
  .catch(() => console.log("the crop box is still open — see the last screenshot"));
await page.waitForTimeout(2500);
await page.screenshot({ path: `${out}-7-uploaded.png`, fullPage: true });

await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(3000);
await page.screenshot({ path: `${out}-8-board.png` });

await browser.close();
