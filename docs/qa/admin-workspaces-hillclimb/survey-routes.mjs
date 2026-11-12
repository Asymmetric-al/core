// Whole-admin survey: visits every Mission Control route once per width and
// records a screenshot, the h1s, the /api/admin requests the fixtures do not
// answer, console errors and horizontal overflow. Read-only.
//
//   MSYS_NO_PATHCONV=1 node docs/qa/admin-workspaces-hillclimb/survey-routes.mjs <outDir> [route,...]
// CAPTURE_BASE_URL defaults to http://localhost:3030.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { chromium } from "playwright-core";

import {
  MODULE_FIXTURE_IDS,
  installModuleFixtures,
} from "./fixtures/module-fixtures.mjs";
import { installApiFixtures } from "./fixtures/route-fixtures.mjs";
import { installStudioFixtures } from "./studio-fixtures.mjs";

export const SURVEY_ROUTES = [
  "/",
  "/admin",
  "/admin/teams",
  "/admin/eve",
  "/automations",
  "/care",
  "/care/directory",
  `/care/directory/${MODULE_FIXTURE_IDS.carePersonnelId}`,
  "/care/settings",
  "/email",
  "/events",
  "/feed",
  "/feed/org-updates",
  "/help/about",
  "/mobilize",
  "/mobilize/locations",
  "/pdf",
  "/reports",
  "/settings/integrations/resend",
  "/sign",
  "/support",
  `/support?id=${MODULE_FIXTURE_IDS.supportConversationId}`,
  "/support/tickets",
  "/support/tickets/new",
  "/support/contacts",
  "/support/knowledge",
  "/support/macros",
  "/support/reports",
  "/support/reports/overview",
  "/support/reports/agents",
  "/support/reports/inbox",
  "/support/reports/labels",
  "/support/reports/teams",
  "/support/settings",
  "/support/settings/assignment",
  "/support/settings/automations",
  "/support/settings/business-hours",
  "/support/settings/canned-responses",
  "/support/settings/collaborators",
  "/support/settings/inbox",
  "/support/settings/labels",
  "/support/settings/macros",
  "/support/settings/notifications",
  "/support/settings/saved-views",
  "/support/settings/signatures",
  "/support/settings/sla",
  "/tasks",
  "/workflows",
  "/login",
  "/forgot-password",
  "/no-access",
  "/register",
];

const WIDTHS = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 390, height: 844 },
];

const outDir = process.argv[2];
if (!outDir) throw new Error("outDir required");
const only = process.argv[3]?.split(",");
const base = process.env.CAPTURE_BASE_URL ?? "http://localhost:3030";
mkdirSync(outDir, { recursive: true });

const slug = (route) =>
  route === "/"
    ? "home"
    : route.slice(1).replaceAll("/", "__").replace(/[?=]/g, "_");

const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = {};
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
    colorScheme: "light",
    reducedMotion: "reduce",
  });
  const auth = await context.request.post(base + "/api/auth/demo-account", {
    data: { role: "admin" },
  });
  if (!auth.ok()) throw new Error(`demo auth failed: ${auth.status()}`);

  for (const route of SURVEY_ROUTES) {
    if (only && !only.includes(route)) continue;
    const started = Date.now();
    results[route] = {};
    for (const viewport of WIDTHS) {
      const page = await context.newPage();
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      const consoleErrors = [];
      const failed = [];
      page.on("console", (message) => {
        if (message.type() === "error") {
          consoleErrors.push(message.text().slice(0, 240));
        }
      });
      page.on("response", (response) => {
        const url = response.url();
        if (response.status() >= 400 && url.startsWith(base)) {
          failed.push(`${response.status()} ${url.slice(base.length)}`);
        }
      });
      const fixtures = await installApiFixtures(page, {
        scenario: "populated",
      });
      await installStudioFixtures(page);
      await installModuleFixtures(page);
      await page
        .goto(base + route, { waitUntil: "commit", timeout: 240000 })
        .catch((error) => failed.push(`goto ${error.message}`));
      await page
        .waitForLoadState("networkidle", { timeout: 25000 })
        .catch(() => {});
      await page.waitForTimeout(1500);
      await page
        .addStyleTag({ content: "nextjs-portal{display:none!important}" })
        .catch(() => {});
      const file = `${slug(route)}--${viewport.name}`;
      await page.screenshot({ path: join(outDir, `${file}.png`) });
      await page.screenshot({
        path: join(outDir, `${file}-full.png`),
        fullPage: true,
      });
      results[route][viewport.name] = {
        finalPath: await page.evaluate(
          () => location.pathname + location.search,
        ),
        h1: await page.evaluate(() =>
          [...document.querySelectorAll("h1")].map((h) =>
            h.textContent?.trim(),
          ),
        ),
        overflow: await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth + 1,
        ),
        scrollHeight: await page.evaluate(
          () => document.documentElement.scrollHeight,
        ),
        missingFixtures: fixtures.missing.map((m) => `${m.method} ${m.url}`),
        failed: [...new Set(failed)],
        consoleErrors: [...new Set(consoleErrors)].slice(0, 8),
      };
      await page.close();
    }
    console.log(
      `surveyed ${route} in ${Math.round((Date.now() - started) / 1000)}s`,
    );
  }
} finally {
  await browser.close();
}
writeFileSync(join(outDir, "survey.json"), JSON.stringify(results, null, 2));
console.log("wrote", join(outDir, "survey.json"));
