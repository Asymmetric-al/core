// Reproducible capture of the CRM, Contributions and Web Studio workspaces
// under the fixed hillclimb conditions (same as the Mission Control home run):
// CSS 1440x1000, 1024x900, 640x900, 390x844; DPR 1; forced light; reduced
// motion; only the Next.js dev portal hidden.
//
// Usage (Git Bash: prefix MSYS_NO_PATHCONV=1):
//   node docs/qa/admin-workspaces-hillclimb/capture-workspaces.mjs <outDir> [area,...] [state,...]
// Areas: crm, contributions, studio, shell, people, support, tools. Requires
// the admin server and local CMS database for Web Studio. Candidate fixture
// type proof, regeneration and verification are mandatory before the browser.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { chromium } from "playwright-core";

import { selectStates } from "./catalogue-inventory.mjs";
import { prepareFixtureBundle } from "./fixture-preflight.mjs";
import { installModuleFixtures } from "./fixtures/module-fixtures.mjs";
import { installApiFixtures } from "./fixtures/route-fixtures.mjs";
import { savePageMetrics } from "./harness-results.mjs";
import { createModuleStates } from "./module-states.mjs";
import { readRouteErrorHeadings } from "./route-errors.mjs";
import { installStudioFixtures, resetStudioState } from "./studio-fixtures.mjs";
import { createOptionalCrmStates } from "./workspace-catalogue-setups.mjs";
import {
  bounded,
  createStates,
  missingSetups,
  setCurrentState,
  VIEWPORTS,
  waitForStateReady,
  waitForSettled,
} from "./workspace-states.mjs";

const outDir = process.argv[2];
const areas = process.argv[3] ?? "crm,contributions,studio";
const onlyStates = process.argv[4];
const base = process.env.CAPTURE_BASE_URL ?? "http://localhost:3030";
if (!outDir) throw new Error("outDir required");
const { bundle: fixtures, proof } = prepareFixtureBundle();
const meta = fixtures.captureMeta;
const optionalStates = onlyStates
  ?.split(",")
  .some((name) => name.trim() === "crm-fund-correction")
  ? createOptionalCrmStates(fixtures)
  : [];

/** Each state: route, optional setup, widths, scenario and full-page flag. */
const STATES = selectStates(
  [...createStates(meta, fixtures), ...createModuleStates(), ...optionalStates],
  { areas, names: onlyStates },
);
mkdirSync(outDir, { recursive: true });
writeFileSync(
  join(outDir, "fixture-proof.json"),
  JSON.stringify(proof, null, 2) + "\n",
);
function measurePage() {
  const root = document.querySelector("main") ?? document.body;
  const focusable = [
    ...root.querySelectorAll(
      'a[href], button:not([disabled]), input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ].filter((el) => el.getClientRects().length > 0);
  const dialog = document.querySelector('[role="dialog"]');
  const tables = [...document.querySelectorAll("table")].filter(
    (t) => t.getClientRects().length > 0,
  );
  return {
    path: location.pathname + location.search,
    scrollHeight: document.documentElement.scrollHeight,
    horizontalOverflow:
      document.documentElement.scrollWidth > window.innerWidth + 1,
    focusableInMain: focusable.length,
    h1: [...document.querySelectorAll("h1")].map((h) => h.textContent?.trim()),
    tables: tables.length,
    reuiGrids: document.querySelectorAll('[data-slot="data-grid"]').length,
    tableRows: tables.reduce(
      (n, t) => n + t.querySelectorAll("tbody tr").length,
      0,
    ),
    dialog: dialog
      ? {
          name:
            dialog.getAttribute("aria-label") ??
            document.getElementById(
              dialog.getAttribute("aria-labelledby") ?? "",
            )?.textContent ??
            null,
          width: Math.round(dialog.getBoundingClientRect().width),
          overflowX: dialog.scrollWidth > dialog.clientWidth + 1,
        }
      : null,
  };
}

async function settle(page, ms = 1200) {
  await page
    .waitForLoadState("networkidle", { timeout: 20000 })
    .catch(() => {});
  await page.waitForTimeout(ms);
}

/**
 * Payload's relationship cells and document status meta render "Loading…"
 * until their lookups return, and a resize remounts them (phone cards). Wait
 * for those placeholders to clear before a screenshot, up to 15s; a label
 * that never resolves is then captured as it stands.
 */
async function waitForLoadingLabels(page) {
  await page
    .waitForFunction(
      () => {
        // "Loading…", or "Loading templates…" and the like, as visible text
        // or as an input/select placeholder (round 10 captured Web Studio's
        // template field mid-load because only bare "Loading…" was matched).
        const pending = /^Loading(\s[\w ]+)?(…|\.\.\.)$/;
        const visible = (element) => element.getClientRects().length > 0;
        const textPending = [...document.querySelectorAll("body *")].some(
          (element) =>
            element.childElementCount === 0 &&
            pending.test(element.textContent?.trim() ?? "") &&
            visible(element),
        );
        const fieldPending = [
          ...document.querySelectorAll(
            "input[placeholder], textarea[placeholder]",
          ),
        ].some(
          (field) =>
            pending.test(field.getAttribute("placeholder")?.trim() ?? "") &&
            visible(field),
        );
        return !textPending && !fieldPending;
      },
      undefined,
      { timeout: 15000, polling: 250 },
    )
    .catch(() => console.warn("  loading labels still visible"));
  await waitForRelationshipLabels(page);
}

/**
 * Payload's relationship fields read "Select a value" until their own label
 * lookup returns (about 16s after load on the dev server), even when the
 * saved document has a value: round 10 captured the Navigation editor's
 * Tenant that way. On a saved document's edit view, wait for those
 * placeholders to resolve, up to 30s; a field that is really empty is then
 * captured as it stands.
 */
async function waitForRelationshipLabels(page) {
  if (!/\/web-studio\/collections\/[^/]+\/(?!create)[^/?#]+/.test(page.url())) {
    return;
  }
  await page
    .waitForFunction(
      () =>
        ![...document.querySelectorAll(".field-type.relationship")].some(
          (field) =>
            /Select a value/.test(field.textContent ?? "") &&
            field.getClientRects().length > 0,
        ),
      undefined,
      { timeout: 30000, polling: 250 },
    )
    .catch(() => console.warn("  relationship labels still unresolved"));
}

async function openState(context, state, viewport) {
  const page = await context.newPage();
  // freshPerWidth states open at their own width: menus close on resize and
  // some triggers exist only in one layout.
  if (viewport) {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
  }
  if (state.area === "studio") await installStudioFixtures(page);
  if (state.routes) await state.routes(page);
  if (state.area !== "studio") {
    await installApiFixtures(page, {
      scenario: state.scenario ?? "populated",
      bundle: fixtures,
    });
    // Registered later, so module routes answer first; others fall through.
    await installModuleFixtures(page, {
      scenario: state.scenario ?? "populated",
    });
    // Registered later, so Playwright consults it first for funds and
    // missionaries lookups (the CRM/Contributions fixtures do not serve them).
    if (state.studioLookups) await installStudioFixtures(page);
  }
  const route = typeof state.route === "function" ? state.route() : state.route;
  await page.goto(base + route, { waitUntil: "commit", timeout: 240000 });
  await waitForStateReady(page, state);
  await settle(page);
  const routeFailed = (await readRouteErrorHeadings(page)).length > 0;
  if (!routeFailed && state.setup) await state.setup(page);
  if (!routeFailed && state.settled) {
    await state
      .settled(page)
      .catch((error) =>
        console.warn(`  not settled: ${error.message.split("\n")[0]}`),
      );
  }
  await waitForSettled(page);
  // Payload's create view autosaves and then navigates to the new document;
  // wait for that navigation instead of failing on the destroyed context.
  for (let attempt = 0; ; attempt += 1) {
    try {
      await page.addStyleTag({
        content: "nextjs-portal{display:none!important}",
      });
      break;
    } catch (error) {
      if (attempt >= 3) throw error;
      await page.waitForLoadState("load").catch(() => {});
      await settle(page);
    }
  }
  return page;
}

const metricsPath = join(outDir, "page-metrics.json");
const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = {};
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
    colorScheme: "light",
    reducedMotion: "reduce",
  });
  // The demo session expires; a long run signs in again every 15 minutes so
  // later states never capture the sign-in page instead.
  const signIn = async () => {
    const auth = await context.request.post(base + "/api/auth/demo-account", {
      data: { role: "admin" },
    });
    if (!auth.ok()) throw new Error(`demo auth failed: ${auth.status()}`);
    return Date.now();
  };
  let signedInAt = await signIn();
  if (STATES.some((state) => state.area === "studio"))
    await resetStudioState(context, base);

  for (const state of STATES) {
    if (Date.now() - signedInAt > 15 * 60_000) signedInAt = await signIn();
    const started = Date.now();
    setCurrentState(state.name);
    let page = state.freshPerWidth ? null : await openState(context, state);
    results[state.name] = {};
    for (const viewport of VIEWPORTS) {
      if (!state.widths.includes(viewport.name)) continue;
      if (state.freshPerWidth) {
        if (page) await bounded(page.close(), 15000, "page close");
        page = await openState(context, state, viewport);
      }
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      // keepScroll states show something their setup scrolled to.
      if (!state.keepScroll) {
        await page.evaluate(() => window.scrollTo(0, 0));
      }
      await page.waitForTimeout(700);
      await waitForLoadingLabels(page);
      await waitForSettled(page, 15000);
      const file = `${state.name}--${viewport.name}`;
      await page.screenshot({ path: join(outDir, `${file}.png`) });
      if (state.full) {
        await page.screenshot({
          path: join(outDir, `${file}-full.png`),
          fullPage: true,
        });
      }
      const unexpectedRouteErrorHeadings = await readRouteErrorHeadings(page);
      results[state.name][viewport.name] = {
        ...(await page.evaluate(measurePage)),
        unexpectedRouteErrorHeadings,
      };
      savePageMetrics(metricsPath, results);
      if (unexpectedRouteErrorHeadings.length > 0) {
        console.error(
          `unexpected route error: ${state.name}@${viewport.name}: ${unexpectedRouteErrorHeadings.join("; ")}`,
        );
      }
    }
    if (page) await bounded(page.close(), 15000, "page close");
    if (state.area === "studio") {
      await resetStudioState(context, base);
    }
    console.log(
      `captured ${state.name} in ${Math.round((Date.now() - started) / 1000)}s`,
    );
  }
} finally {
  await bounded(browser.close(), 20000, "browser close");
}
savePageMetrics(metricsPath, results);
if (missingSetups.length > 0) {
  console.warn(
    `setup triggers not found (captured as-is):\n  ${missingSetups.join("\n  ")}`,
  );
}
console.log("wrote", metricsPath);
// A browser left running after a bounded close would keep Node alive.
process.exit(
  Object.values(results).some((widths) =>
    Object.values(widths).some(
      (result) => result.unexpectedRouteErrorHeadings.length > 0,
    ),
  )
    ? 1
    : 0,
);
