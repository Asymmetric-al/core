// Live smoke of the DEPLOYED Console through the operator's SSH tunnel.
// Not part of CI. Reads the owner credentials from a private file so they never
// appear in argv, logs or screenshots:
//   CONSOLE_CREDENTIALS_FILE=<file with "user\npassword"> \
//   CONSOLE_LIVE_OUT=<evidence dir> node tests/live/live-smoke.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import AxeBuilder from "@axe-core/playwright";
import { chromium } from "@playwright/test";

const origin = process.env.CONSOLE_LIVE_ORIGIN ?? "http://127.0.0.1:39342";
const out = process.env.CONSOLE_LIVE_OUT;
const credentialsFile = process.env.CONSOLE_CREDENTIALS_FILE;
if (!out || !credentialsFile)
  throw new Error("CONSOLE_LIVE_OUT and CONSOLE_CREDENTIALS_FILE are required");
const [username, password] = readFileSync(credentialsFile, "utf8").split(
  /\r?\n/,
);
mkdirSync(out, { recursive: true });

const report = { origin, startedAt: new Date().toISOString(), viewports: [] };
const browser = await chromium.launch();
for (const viewport of [
  { name: "desktop", width: 1440, height: 900, colorScheme: "light" },
  { name: "desktop-dark", width: 1440, height: 900, colorScheme: "dark" },
  { name: "mobile", width: 390, height: 844, colorScheme: "light" },
]) {
  const context = await browser.newContext({
    httpCredentials: { username, password },
    viewport: { width: viewport.width, height: viewport.height },
    colorScheme: viewport.colorScheme,
  });
  const page = await context.newPage();
  const problems = [];
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type()))
      problems.push({
        kind: `console.${message.type()}`,
        text: message.text().slice(0, 300),
      });
  });
  page.on("pageerror", (error) =>
    problems.push({ kind: "pageerror", text: String(error).slice(0, 300) }),
  );
  page.on("response", (response) => {
    if (response.status() >= 400)
      problems.push({
        kind: "http",
        text: `${response.status()} ${new URL(response.url()).pathname}`,
      });
  });
  const started = Date.now();
  // The Console keeps a live poll open, so "networkidle" is not a stable signal.
  await page.goto(origin + "/", { waitUntil: "load", timeout: 180_000 });
  await page
    .getByRole("tab")
    .first()
    .waitFor({ state: "visible", timeout: 120_000 });
  const loadMs = Date.now() - started;
  const tabs = await page.getByRole("tab").allTextContents();
  const sections = [];
  for (const [index, label] of tabs.entries()) {
    await page.getByRole("tab").nth(index).click();
    await page.waitForTimeout(600);
    const file = `${viewport.name}-${String(index).padStart(2, "0")}-${label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}.png`;
    await page.screenshot({ path: path.join(out, file), fullPage: true });
    const axe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    const serious = axe.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact ?? ""),
    );
    const panelText = (
      await page
        .getByRole("tabpanel")
        .first()
        .innerText()
        .catch(() => "")
    )
      .replace(/\s+/g, " ")
      .slice(0, 400);
    sections.push({
      label: label.trim(),
      screenshot: file,
      axeSerious: serious.map((violation) => ({
        id: violation.id,
        nodes: violation.nodes.length,
      })),
      panelText,
    });
  }
  report.viewports.push({
    ...viewport,
    loadMs,
    tabs: tabs.map((tab) => tab.trim()),
    sections,
    problems,
  });
  await context.close();
}
// The unauthenticated boundary must refuse.
const bounded = (promise, ms) =>
  Promise.race([promise, new Promise((resolve) => setTimeout(resolve, ms))]);
const anonymous = await browser.newContext();
const denied = await anonymous.request.get(origin + "/api/console/snapshot", {
  timeout: 10_000,
  failOnStatusCode: false,
});
report.anonymousSnapshotStatus = denied.status();
await bounded(anonymous.close(), 10_000);
await bounded(browser.close(), 10_000);
report.finishedAt = new Date().toISOString();
writeFileSync(path.join(out, "report.json"), JSON.stringify(report, null, 2));
for (const viewport of report.viewports) {
  console.log(
    `${viewport.name}: load ${viewport.loadMs} ms, tabs ${viewport.tabs.join(" | ")}, problems ${viewport.problems.length}`,
  );
  for (const section of viewport.sections)
    console.log(
      `  ${section.label}: axe serious ${section.axeSerious.length}; ${section.panelText.slice(0, 160)}`,
    );
  for (const problem of viewport.problems.slice(0, 8))
    console.log(`  ! ${problem.kind}: ${problem.text}`);
}
console.log(`anonymous snapshot: ${report.anonymousSnapshotStatus}`);
