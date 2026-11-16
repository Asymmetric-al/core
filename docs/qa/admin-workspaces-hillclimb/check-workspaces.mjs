// Interaction + accessibility evidence for the workspaces hillclimb, run the
// same way against the original and every candidate.
//
// Iterates every state at its declared widths from the shared VIEWPORTS
// catalogue (1440x1000, 1024x900, 640x900, 390x844). The
// viewport is set before navigation, so each width renders its own layout.
// Per state and width it records:
// - axe WCAG 2A/AA/2.1AA violations;
// - horizontal page overflow;
// - rendered data rows (table body rows and grid panel cards);
// - for open dialogs: containment in the viewport, internal horizontal
//   overflow, whether 12 Tab presses keep focus inside the dialog (measured
//   two frames after each press, once Base UI's focus guards have moved
//   focus on; a guard itself counts as inside), and whether Escape closes it
//   (the top dialog, even when it was opened over another);
// - for row grids: whether Tab from the page start reaches a row control and
//   whether ArrowDown then moves focus to the next row.
//
// Usage (Git Bash: prefix MSYS_NO_PATHCONV=1; CAPTURE_BASE_URL picks the
// server, default http://localhost:3030):
//   node docs/qa/admin-workspaces-hillclimb/check-workspaces.mjs <outDir> [area,...] [state,...]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright-core";

import { selectStates } from "./catalogue-inventory.mjs";
import { prepareFixtureBundle } from "./fixture-preflight.mjs";
import { installModuleFixtures } from "./fixtures/module-fixtures.mjs";
import { installApiFixtures } from "./fixtures/route-fixtures.mjs";
import { writeEvidenceJson } from "./harness-results.mjs";
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
const STATES = selectStates(
  [...createStates(meta, fixtures), ...createModuleStates(), ...optionalStates],
  { areas, names: onlyStates },
);
mkdirSync(outDir, { recursive: true });
writeFileSync(
  join(outDir, "fixture-proof.json"),
  JSON.stringify(proof, null, 2) + "\n",
);

/** Grids whose rows the keyboard probe walks. */
const ROW_STATES = new Set([
  "crm-records",
  "crm-notes",
  "crm-relationships",
  "contributions",
  "studio-pages",
  "studio-ministry-updates",
  "studio-missionaries",
]);

const ROW_SELECTOR = 'tbody tr, [data-slot="data-grid-panel-row"]';

async function keyboardProbe(page) {
  // Tab from the top of the document until focus lands inside a data row;
  // cap at 80 stops.
  await page.evaluate(() => {
    document.activeElement?.blur?.();
    window.scrollTo(0, 0);
  });
  await page
    .locator("body")
    .focus()
    .catch(() => {});
  let stops = 0;
  let inRow = null;
  for (; stops < 80; stops++) {
    await page.keyboard.press("Tab");
    inRow = await page.evaluate((selector) => {
      const el = document.activeElement;
      const row = el?.closest?.(selector);
      return row
        ? (el.getAttribute("aria-label") ?? el.textContent ?? "")
            .trim()
            .slice(0, 60)
        : null;
    }, ROW_SELECTOR);
    if (inRow !== null) break;
  }
  if (inRow === null) return { reachedRow: false, tabStops: stops };
  const rowKey = () =>
    page.evaluate((selector) => {
      const row = document.activeElement?.closest(selector);
      return row?.getAttribute("data-row-id") ?? row?.textContent?.slice(0, 40);
    }, ROW_SELECTOR);
  const before = await rowKey();
  await page.keyboard.press("ArrowDown");
  const after = await rowKey();
  return {
    reachedRow: true,
    tabStops: stops + 1,
    firstRowControl: inRow,
    arrowDownMovesRow: Boolean(after && before && after !== before),
  };
}

/** The topmost open dialog: portals append later, so take the last one. */
function findOpenDialog() {
  return [...document.querySelectorAll('[role="dialog"], [role="alertdialog"]')]
    .filter((d) => d.getClientRects().length > 0)
    .at(-1);
}

async function dialogFocusProbe(page) {
  const hasDialog = await page.evaluate(
    `(${findOpenDialog.toString()})() != null`,
  );
  if (!hasDialog) return null;
  let escapes = 0;
  const escapedTo = [];
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    // Base UI wraps focus through a guard element and moves it on the next
    // frame; measure where focus settles, not the frame in between (which
    // reads as document.body on some presses in both versions).
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );
    const where = await page.evaluate(`(() => {
      const dialog = (${findOpenDialog.toString()})();
      const el = document.activeElement;
      if (!dialog || !el) return "none";
      if (dialog.contains(el)) return "inside";
      if (el.matches?.("[data-base-ui-focus-guard], [data-floating-ui-focus-guard]")) return "inside";
      if (el === document.body) return "body (focus lost)";
      return (el.getAttribute("aria-label") || el.textContent || el.tagName).trim().slice(0, 40);
    })()`);
    if (where !== "inside") {
      escapes++;
      if (escapedTo.length < 3) escapedTo.push(where);
    }
  }
  // Escape closes the dialog that was on top. A dialog opened over another
  // (a refund over the gift's detail sheet) leaves that one open, so check
  // the top dialog is gone rather than that no dialog remains.
  await page.evaluate(`(() => {
    const dialog = (${findOpenDialog.toString()})();
    if (dialog) dialog.setAttribute("data-escape-probe", "");
  })()`);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(600);
  const closedByEscape = await page.evaluate(`(() => {
    const probed = document.querySelector("[data-escape-probe]");
    return !probed || probed.getClientRects().length === 0;
  })()`);
  return { tabEscapes: escapes, escapedTo, closedByEscape };
}

function inspect() {
  const tables = [...document.querySelectorAll("table")].filter(
    (t) => t.getClientRects().length > 0,
  );
  const mobileRows = document.querySelectorAll(
    '[data-slot="data-grid-panel-row"]',
  ).length;
  const dialog = [
    ...document.querySelectorAll('[role="dialog"], [role="alertdialog"]'),
  ]
    .filter((d) => d.getClientRects().length > 0)
    .at(-1);
  const r = dialog?.getBoundingClientRect();
  return {
    path: location.pathname + location.search,
    horizontalOverflow:
      document.documentElement.scrollWidth > window.innerWidth + 1,
    h1Count: document.querySelectorAll("h1").length,
    renderedTableRows: tables.reduce(
      (n, t) =>
        n +
        [...t.querySelectorAll("tbody tr")].filter(
          (tr) => tr.querySelector("td") && !tr.querySelector("td[colspan]"),
        ).length,
      0,
    ),
    renderedMobileRows: mobileRows,
    dialog: dialog
      ? {
          name:
            dialog.getAttribute("aria-label") ??
            document.getElementById(
              dialog.getAttribute("aria-labelledby") ?? "",
            )?.textContent ??
            null,
          contained:
            r.left >= -1 && r.right <= window.innerWidth + 1 && r.top >= -1,
          width: Math.round(r.width),
          internalOverflowX: dialog.scrollWidth > dialog.clientWidth + 1,
        }
      : null,
  };
}

async function openState(context, state, viewport) {
  const page = await context.newPage();
  await page.setViewportSize({
    width: viewport.width,
    height: viewport.height,
  });
  if (state.area === "studio") await installStudioFixtures(page);
  else {
    await installApiFixtures(page, {
      scenario: state.scenario ?? "populated",
      bundle: fixtures,
    });
    // Registered later, so module routes answer first; others fall through.
    await installModuleFixtures(page, {
      scenario: state.scenario ?? "populated",
    });
    if (state.studioLookups) await installStudioFixtures(page);
  }
  if (state.routes) await state.routes(page);
  const route = typeof state.route === "function" ? state.route() : state.route;
  await page.goto(base + route, { waitUntil: "commit", timeout: 240000 });
  await waitForStateReady(page, state);
  await page
    .waitForLoadState("networkidle", { timeout: 20000 })
    .catch(() => {});
  await page.waitForTimeout(1200);
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
  // A setup may resize for mobile-only states; restore the probe width.
  await page.setViewportSize({
    width: viewport.width,
    height: viewport.height,
  });
  await page.waitForTimeout(500);
  await page.addStyleTag({
    content: "nextjs-portal{display:none!important}",
  });
  return page;
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
const report = [];
const file = join(outDir, "workspace-checks.json");
/**
 * Merges this run's results over the saved ones (a state and width measured
 * now replaces its earlier entry). Called after every measurement, so a run
 * stopped part-way keeps what it measured and areas can run separately.
 */
function save() {
  const previous = existsSync(file)
    ? JSON.parse(readFileSync(file, "utf8"))
    : [];
  const merged = [
    ...previous.filter(
      (p) =>
        !report.some((r) => r.state === p.state && r.viewport === p.viewport),
    ),
    ...report,
  ];
  writeEvidenceJson(file, merged);
}
try {
  const context = await browser.newContext({
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
    for (const vp of VIEWPORTS) {
      if (!state.widths.includes(vp.name)) continue;
      setCurrentState(`${state.name}@${vp.name}`);
      const page = await openState(context, state, vp);
      const measured = {
        ...(await page.evaluate(inspect)),
        unexpectedRouteErrorHeadings: await readRouteErrorHeadings(page),
      };
      if (measured.unexpectedRouteErrorHeadings.length > 0) {
        console.error(
          `unexpected route error: ${state.name}@${vp.name}: ${measured.unexpectedRouteErrorHeadings.join("; ")}`,
        );
      }
      const keyboard =
        ROW_STATES.has(state.name) &&
        !measured.dialog &&
        measured.unexpectedRouteErrorHeadings.length === 0
          ? await keyboardProbe(page)
          : null;
      // A late client redirect or refresh can destroy the page mid-scan; wait
      // for the page to settle and scan once more instead of aborting the run.
      const axeScan = () =>
        new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .exclude("nextjs-portal")
          .analyze();
      const scan = await axeScan().catch(async (error) => {
        if (!/Execution context was destroyed/.test(String(error))) throw error;
        await page.waitForLoadState("networkidle").catch(() => {});
        return axeScan();
      });
      const dialogFocus = measured.dialog ? await dialogFocusProbe(page) : null;
      report.push({
        state: state.name,
        viewport: vp.name,
        ...measured,
        keyboard,
        dialogFocus,
        axe: {
          violations: scan.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            nodes: v.nodes.length,
            targets: v.nodes.slice(0, 4).map((n) => n.target.join(" ")),
          })),
          incompleteIds: scan.incomplete.map(
            (v) => `${v.id}:${v.nodes.length}`,
          ),
        },
      });
      console.log(
        `${state.name} @${vp.name}: axe ${scan.violations.length}${scan.violations.length ? ` (${scan.violations.map((v) => v.id).join(",")})` : ""}, overflow ${measured.horizontalOverflow}, rows ${measured.renderedTableRows}/${measured.renderedMobileRows}${keyboard ? `, kbd ${JSON.stringify(keyboard)}` : ""}${dialogFocus ? `, dialog ${JSON.stringify(dialogFocus)}` : ""}`,
      );
      save();
      await bounded(page.close(), 15000, "page close");
      if (state.area === "studio") {
        await resetStudioState(context, base);
      }
    }
  }
} finally {
  await bounded(browser.close(), 20000, "browser close");
}
save();
if (missingSetups.length > 0) {
  console.warn(`setup triggers not found:\n  ${missingSetups.join("\n  ")}`);
}
console.log("wrote", file);
// A browser left running after a bounded close would keep Node alive.
process.exit(
  report.some((result) => result.unexpectedRouteErrorHeadings.length > 0)
    ? 1
    : 0,
);
