// Loads routes with the demo admin session and prints console errors, page
// errors and failed requests, to find why a route never leaves its loading
// state. Usage: node docs/qa/admin-workspaces-hillclimb/probe-errors.mjs /route [/route…]
import { chromium } from "playwright-core";

import { installModuleFixtures } from "./fixtures/module-fixtures.mjs";

const base = process.env.CAPTURE_BASE_URL ?? "http://localhost:3030";
const routes = process.argv.slice(2);
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const auth = await context.request.post(base + "/api/auth/demo-account", {
    data: { role: "admin" },
  });
  console.log("auth", auth.status());
  for (const route of routes) {
    const page = await context.newPage();
    await installModuleFixtures(page);
    const errors = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(`console: ${message.text()}`);
    });
    page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
    page.on("requestfailed", (request) =>
      errors.push(`failed: ${request.url()} ${request.failure()?.errorText}`),
    );
    page.on("response", (response) => {
      if (response.status() >= 400)
        errors.push(`http ${response.status()}: ${response.url()}`);
    });
    await page.goto(base + route, { waitUntil: "load", timeout: 240_000 });
    await page.waitForTimeout(8000);
    const h1 = await page.locator("h1").allTextContents();
    console.log(`\n== ${route} -> ${page.url()} h1=${JSON.stringify(h1)}`);
    for (const line of errors.slice(0, 25))
      console.log("  " + line.slice(0, 400));
    await page.close();
  }
} finally {
  await browser.close();
}
