// What the edge says about an /art URL, and whether it is still answering.
//
//   node scripts/art-check.mjs /art/<id> [/art/<id> …]
//
// Two requests per URL, because one proves nothing: the first may be a MISS that
// fills the cache, and it is the second that says whether the edge is holding a
// copy. `x-vercel-cache` is the whole answer — HIT means the file is being served
// without Convex being asked, which is ticket 09 working, and it is also exactly
// what a purge has to be able to reach ([ADR 0004](../docs/adr/0004-a-year-is-a-cache-not-a-promise.md)).
//
// ⚠️ **Not `curl`.** Polling the staging URL with it trips Vercel's bot challenge,
// which then blocks Playwright too and there is no other way to see the site. This
// goes through a real browser context, like every other script here.
//
// ⚠️ Run it from the repo root. Playwright resolves from node_modules.
import { chromium } from "playwright";

const BASE = "https://200-squares-git-staging-robs-projects-52973834.vercel.app";
const paths = process.argv.slice(2);
if (paths.length === 0) {
  console.error("Give it one or more /art/<id> paths.");
  process.exit(1);
}

const browser = await chromium.launch();
const context = await browser.newContext();

for (const path of paths) {
  console.log(path);
  for (const pass of [1, 2]) {
    const res = await context.request.get(BASE + path);
    const h = res.headers();
    const bytes = (await res.body()).length;
    console.log(
      `  ${pass}: ${res.status()} ${h["content-type"] ?? ""} ${bytes} bytes` +
        `\n     cache-control: ${h["cache-control"] ?? "—"}` +
        `\n     x-vercel-cache: ${h["x-vercel-cache"] ?? "—"}`,
    );
  }
}

await browser.close();
