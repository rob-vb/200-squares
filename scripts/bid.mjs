// Place one bid on the staging auction, because there is no browser here.
//
//   node scripts/bid.mjs <email> [amount] [out-prefix]
//
// It opens the bid panel from the auction dock, fills the ticket 03 fields,
// presses the bid button, holds a Stripe test card, and waits for `/bid` to say
// where the auction stands. Every step leaves a screenshot behind.
//
// ⚠️ Give each run a **different email**. Stripe's address is what makes an owner
// (ticket 08), and a bidder who raises their own bid has their earlier hold
// released — which is right, and which makes a one-address run unable to build a
// ladder to test the close with.
//
// ⚠️ One pending bid per caller, and the VPS is one caller. A run that stops at
// Stripe leaves a pending row for fifteen minutes; wait it out or bid again after.
//
// ⚠️ It only works because dev runs Cloudflare's dummy Turnstile keys. Turnstile
// will not complete a challenge from this machine — see *Turnstile on dev* in
// `docs/environments.md`.
import { chromium } from "playwright";

const BASE = "https://200-squares-git-staging-robs-projects-52973834.vercel.app";
const email = process.argv[2];
const amount = process.argv[3] ?? "";
const out = process.argv[4] ?? "bid";
const CARD = process.env.CARD ?? "4242424242424242";

if (!email) throw new Error("Usage: node scripts/bid.mjs <email> [amount] [out-prefix]");

// ⚠️ `PHONE=1` runs the same bid in the bottom sheet instead of the side panel.
// A panel that scrolls inside itself hides its own top most easily on a phone, so
// anything about what a bidder can see has to be checked at both widths (ticket 35).
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: process.env.PHONE ? { width: 390, height: 844 } : { width: 1440, height: 900 },
});
page.on("console", (m) => {
  if (m.type() === "error") console.log("  console:", m.text());
});

const res = await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
console.log("board", res.status(), await page.title());
await page.waitForTimeout(2500);

await page.getByRole("button", { name: "BID", exact: true }).first().click();
await page.waitForTimeout(800);
await page.screenshot({ path: `${out}-1-panel.png` });

// ⚠️ The panel is in the DOM twice — the side panel and the bottom sheet, one of
// them `display:none` — so every selector below is scoped to the visible one. A
// bare CSS selector reaches into the copy nobody can see, and at phone width that
// copy is the *first* one in the tree.
const panel = page.locator("section:visible").filter({ hasText: "Closes 00:00 UTC" }).first();

if (amount) {
  const field = panel.locator('input[inputmode="numeric"]').first();
  await field.fill("");
  await field.fill(amount);
}
await panel.getByRole("button", { name: "A private person" }).click();
await panel.locator("select").first().selectOption("NL");
await panel.getByPlaceholder("Your name").fill("Test Bieder");
await panel.locator('input[type="checkbox"]').first().check();
await page.waitForTimeout(300);
await page.screenshot({ path: `${out}-2-filled.png`, fullPage: true });

const place = panel.getByRole("button", { name: /PLACE BID/i });
console.log("bid button enabled:", await place.isEnabled());
await place.click();

// ⚠️ A refused bid never leaves the page, so the wait is where the reason is.
// Ticket 28 lost ten minutes to a timeout with no picture of what it said.
try {
  await page.waitForURL(/checkout\.stripe\.com/, { timeout: 45000 });
} catch (caught) {
  await page.screenshot({ path: `${out}-2b-refused.png`, fullPage: true });
  // ⚠️ And the panel on its own. `fullPage` scrolls the *page*, and the panel
  // scrolls inside itself, so the page shot cannot say what the bidder is looking
  // at — which is the whole of ticket 35. The element shot is that view.
  await panel.screenshot({ path: `${out}-2c-panel.png` }).catch(() => {});
  console.log("never reached Stripe — see", `${out}-2b-refused.png`, `${out}-2c-panel.png`);
  throw caught;
}
console.log("stripe", page.url().slice(0, 60));
await page.waitForTimeout(5000);
await page.screenshot({ path: `${out}-3-stripe.png` });

await page.locator('#email, input[name="email"]').first().fill(email);
await page.locator('#cardNumber, input[name="cardNumber"]').first().fill(CARD);
await page.locator('#cardExpiry, input[name="cardExpiry"]').first().fill("12/34");
await page.locator('#cardCvc, input[name="cardCvc"]').first().fill("123");
await page.locator('#billingName, input[name="billingName"]').first().fill("Test Bieder");
const line1 = page.locator('#billingAddressLine1, input[name="billingAddressLine1"]').first();
if (await line1.isVisible().catch(() => false)) await line1.fill("Teststraat 1");
const postal = page.locator('#billingPostalCode, input[name="billingPostalCode"]').first();
if (await postal.isVisible().catch(() => false)) await postal.fill("1011AA");
const city = page.locator('#billingLocality, input[name="billingLocality"]').first();
if (await city.isVisible().catch(() => false)) await city.fill("Amsterdam");
await page.screenshot({ path: `${out}-4-card.png` });

await page.locator('button[type="submit"]').first().click();
await page.waitForTimeout(4000);
await page.waitForURL(/\/bid/, { timeout: 90000 });
console.log("placed", page.url().slice(0, 80));
await page.waitForTimeout(8000);
await page.screenshot({ path: `${out}-5-placed.png`, fullPage: true });
console.log("body:", (await page.locator("main").innerText()).slice(0, 700));

await browser.close();
