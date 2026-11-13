// Counts how often a route navigates on its own (a dev reload loop) and
// prints the first errors with their stacks. Usage (Git Bash:
// MSYS_NO_PATHCONV=1): node docs/qa/admin-workspaces-hillclimb/probe-reloads.mjs /route [/route…]
import { chromium } from "playwright-core";

import { installModuleFixtures } from "./fixtures/module-fixtures.mjs";

const base = process.env.CAPTURE_BASE_URL ?? "http://localhost:3030";
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const auth = await context.request.post(base + "/api/auth/demo-account", {
    data: { role: "admin" },
    timeout: 240_000,
  });
  console.log("auth", auth.status());
  for (const route of process.argv.slice(2)) {
    const page = await context.newPage();
    await installModuleFixtures(page);
    let navigations = 0;
    const errors = [];
    const frames = [];
    page.on("websocket", (socket) =>
      socket.on("framereceived", ({ payload }) => {
        const text = String(payload);
        if (!text.includes('"ping"') && frames.length < 6)
          frames.push(text.slice(0, 400));
      }),
    );
    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame()) navigations += 1;
    });
    page.on("pageerror", (error) =>
      errors.push(`pageerror: ${error.message}\n${error.stack ?? ""}`),
    );
    page.on("console", (message) => {
      if (message.type() === "error" || message.type() === "warning")
        errors.push(`${message.type()}: ${message.text()}`);
    });
    await page.goto(base + route, { waitUntil: "commit", timeout: 240_000 });
    await page.waitForTimeout(20_000);
    const h1 = await page
      .locator("h1")
      .allTextContents()
      .catch(() => []);
    console.log(
      `\n== ${route}: ${navigations} navigations in 20s, h1=${JSON.stringify(h1)}`,
    );
    for (const line of [...new Set(errors)].slice(0, 8))
      console.log("  " + line.slice(0, 1500));
    for (const frame of frames) console.log("  hmr: " + frame);
    await page.close();
  }
} finally {
  await browser.close();
}
