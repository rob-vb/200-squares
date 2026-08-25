import { chromium } from "playwright";
const BASE = "https://200-squares-git-staging-robs-projects-52973834.vercel.app";
const OUT = "/tmp/claude-0/-home-henk-200squares/4decb837-23e2-43e4-ba29-2741f97be6da/scratchpad";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("console", (m) => { if (m.type() === "error" && !m.text().includes("font-size:0")) console.log("console:", m.text().slice(0,200)); });
page.on("requestfailed", (r) => console.log("FAILED", r.method(), r.url().slice(0,110), r.failure()?.errorText));
page.on("response", async (r) => {
  const u = r.url();
  if (u.includes("/checkout/") || u.includes("/api/checkout") || u.includes("turnstile")) {
    let body = ""; try { body = (await r.text()).slice(0, 260); } catch {}
    console.log("RES", r.status(), u.slice(0, 120), body);
  }
});
await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(3000);
const b = await page.evaluate(() => {
  const box = document.querySelector("div.relative.flex-1.overflow-hidden.select-none");
  const r = box.firstElementChild.firstElementChild.getBoundingClientRect();
  return { x: r.x, y: r.y, w: r.width, h: r.height };
});
const centre = (r, c) => ({ x: b.x + ((c + 0.5) * b.w) / 16, y: b.y + ((r + 0.5) * b.h) / 14 });
let ok = false;
outer: for (let r = 13; r >= 5; r--) for (let c = 15; c >= 0; c--) {
  const p = centre(r, c);
  await page.mouse.click(p.x, p.y);
  await page.waitForTimeout(300);
  if (await page.getByText("One payment, yours for good").first().isVisible().catch(() => false)) { ok = true; console.log("cell", r, c); break outer; }
}
if (!ok) throw new Error("no cell");
console.log("turnstile widget present:", await page.locator("iframe[src*='challenges.cloudflare.com']").count());
await page.getByRole("button", { name: "A private person" }).first().click();
await page.locator("select").first().selectOption("NL");
await page.getByPlaceholder("As it goes on the invoice").first().fill("Test Koper");
await page.locator('input[type="checkbox"]').first().check();
await page.getByRole("button", { name: /ORDER NOW/i }).first().click();
await page.waitForTimeout(15000);
console.log("url", page.url());
console.log("iframes:", await page.locator("iframe").count());
for (const f of await page.locator("iframe").all()) console.log("  iframe", (await f.getAttribute("src") ?? "").slice(0,90));
console.log("notice:", await page.locator("p.text-accent").allInnerTexts());
await page.screenshot({ path: `${OUT}/probe.png` });
console.log("panel:", (await page.locator("section").first().innerText()).slice(0, 800));
await browser.close();
