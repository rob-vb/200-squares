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

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("console", (m) => {
  if (m.type() === "error") console.log("  console:", m.text());
});

const res = await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
console.log("board", res.status(), await page.title());
await page.waitForTimeout(2500);

await page.getByRole("button", { name: "BID", exact: true }).first().click();
await page.waitForTimeout(800);
await page.screenshot({ path: `${out}-1-panel.png` });

if (amount) {
  const field = page.locator('input[inputmode="numeric"]').first();
  await field.fill("");
  await field.fill(amount);
}
await page.getByRole("button", { name: "A private person" }).first().click();
await page.locator("select").first().selectOption("NL");
await page.getByPlaceholder("As it goes on the invoice").first().fill("Test Bieder");
await page.locator('input[type="checkbox"]').first().check();
await page.waitForTimeout(300);
await page.screenshot({ path: `${out}-2-filled.png`, fullPage: true });

const place = page.getByRole("button", { name: /PLACE BID/i }).first();
console.log("bid button enabled:", await place.isEnabled());
await place.click();

await page.waitForURL(/checkout\.stripe\.com/, { timeout: 45000 });
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
