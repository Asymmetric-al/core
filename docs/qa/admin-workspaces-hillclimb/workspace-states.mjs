// Shared state catalogue for the workspaces hillclimb. capture-workspaces.mjs
// (screenshots + page metrics) and check-workspaces.mjs (axe, overflow,
// keyboard, dialog focus) both iterate these expected states. Same names and
// widths alone do not establish semantic or baseline comparability.
//
// Each state: area, name, route (string or () => string), widths, optional
// ready text/RegExp or readyHeading, scenario ("populated" | "empty" | "error"), dialog flag,
// full-page flag, studioLookups (serve funds/missionaries lookups on CRM and
// Contributions pages) and an optional setup(page) that opens the flyout.

import {
  giftMenuSetup,
  unavailableHubCorrection,
} from "./workspace-catalogue-setups.mjs";

export {
  createOptionalCrmStates,
  UNAVAILABLE_WORKSPACE_WORKFLOWS,
} from "./workspace-catalogue-setups.mjs";

export const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "intermediate", width: 1024, height: 900 },
  { name: "small-tablet", width: 640, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];
export const ALL = VIEWPORTS.map((v) => v.name);
export const DESKTOP_MOBILE = ["desktop", "mobile"];

export const missingSetups = [];
let currentState = "";
export function logMissing(what) {
  missingSetups.push(`${currentState}: ${what}`);
  console.warn(`  setup missing: ${what}`);
}

/**
 * Waits until nothing on screen is still loading: no visible skeleton
 * (Core's `data-slot="skeleton"`, Payload's shimmer), no busy region and no
 * "Loading…" / "Loading Map" label. Up to 30s; a placeholder that never
 * resolves is then captured as it stands, with a warning.
 */
/**
 * Resolves when `promise` settles or after `ms`, whichever comes first, and
 * logs when the limit was hit. Used for page and browser shutdown: a page
 * whose popup or editor is still open can make Playwright's close() wait
 * forever on Windows, which stalled whole check runs after their last
 * measurement (round 12).
 */
export async function bounded(promise, ms, label) {
  let timer;
  const limit = new Promise((resolve) => {
    timer = setTimeout(() => {
      console.warn(`  ${label} did not finish in ${ms / 1000}s; continuing`);
      resolve();
    }, ms);
  });
  try {
    await Promise.race([promise.catch(() => {}), limit]);
  } finally {
    clearTimeout(timer);
  }
}

export async function waitForSettled(page, timeout = 30000) {
  await page
    .waitForFunction(
      () => {
        const visible = (element) => element.getClientRects().length > 0;
        const placeholders = document.querySelectorAll(
          '[data-slot="skeleton"], .shimmer-effect, [aria-busy="true"]',
        );
        if ([...placeholders].some(visible)) return false;
        return ![...document.querySelectorAll("body *")].some(
          (element) =>
            element.childElementCount === 0 &&
            /^Loading(…|\.\.\.|\s+\w+)?$/i.test(
              element.textContent?.trim() ?? "",
            ) &&
            visible(element),
        );
      },
      undefined,
      { timeout, polling: 250 },
    )
    .catch(() => console.warn("  still loading after wait"));
}

/** Waits for text to appear anywhere in the rendered page (up to 60s). */
export function waitForBodyText(page, text, timeout = 60000) {
  return page.waitForFunction(
    (needle) => document.body.innerText.includes(needle),
    text,
    { timeout, polling: 500 },
  );
}

/** Waits until a button whose name matches is present and enabled. */
export function waitForEnabledButton(page, name, timeout = 120000) {
  return page
    .getByRole("button", { name })
    .first()
    .and(page.locator(":enabled"))
    .waitFor({ state: "visible", timeout });
}

/** Clicks the first visible candidate locator; logs when none is present. */
export async function clickFirst(page, locators, settleMs = 900) {
  for (const locator of locators) {
    const first = locator.first();
    if (await first.isVisible().catch(() => false)) {
      // A disabled trigger means the state cannot be reached in this
      // version; capture the page as it stands and log it.
      if (!(await first.isEnabled().catch(() => true))) {
        logMissing(`${String(locator)} (disabled)`);
        return false;
      }
      await first.click();
      await page.waitForTimeout(settleMs);
      return true;
    }
  }
  logMissing(String(locators[0]));
  return false;
}

export function setCurrentState(name) {
  currentState = name;
}

/** Role matching excludes hidden navigation duplicates of a page title. */
export async function waitForStateReady(page, state, timeout = 120000) {
  const heading = state.readyHeading?.();
  const text = state.ready?.();
  const locator = heading
    ? page.getByRole("heading", { name: heading, exact: true })
    : text
      ? page
          .getByText(
            text,
            text instanceof RegExp ? undefined : { exact: false },
          )
          .first()
      : page.locator("h1").first();
  await locator
    .waitFor({ state: heading || text ? "visible" : "attached", timeout })
    .catch(() =>
      console.warn(
        `  ready ${heading ? "heading" : "text"} not seen: ${heading ?? text ?? "h1"}`,
      ),
    );
}

/** All states; `meta` is fixtures.json `captureMeta`. */
export function createStates(meta, fixtureBundle) {
  return [
    // CRM
    {
      area: "crm",
      name: "crm-records",
      route: "/crm",
      widths: ALL,
      full: true,
      ready: () => meta.crmFirstName,
    },
    {
      area: "crm",
      name: "crm-kanban",
      route: "/crm",
      widths: DESKTOP_MOBILE,
      ready: () => meta.crmFirstName,
      setup: async (page) => {
        await page
          .getByRole("button", { name: /kanban/i })
          .first()
          .click();
        await page.waitForTimeout(800);
      },
    },
    {
      area: "crm",
      name: "crm-drawer",
      route: () => `/crm?donor=${meta.crmDrawerId}`,
      widths: DESKTOP_MOBILE,
      ready: () => meta.crmDrawerName,
      dialog: true,
    },
    {
      area: "crm",
      name: "crm-drawer-properties",
      route: () => `/crm?donor=${meta.crmDrawerId}`,
      widths: ["desktop"],
      ready: () => meta.crmDrawerName,
      dialog: true,
      setup: async (page) => {
        await page.getByRole("tab", { name: /properties/i }).click();
        await page.waitForTimeout(500);
      },
    },
    {
      area: "crm",
      name: "crm-notes",
      route: "/crm/notes",
      widths: ALL,
      full: true,
      ready: () => meta.crmFirstNoteTitle,
    },
    {
      area: "crm",
      name: "crm-relationships",
      route: "/crm/relationships",
      widths: ALL,
      full: true,
      ready: () => meta.crmFirstRelationshipName,
    },
    {
      area: "crm",
      name: "crm-empty",
      route: "/crm",
      widths: DESKTOP_MOBILE,
      scenario: "empty",
      ready: () => /no (crm )?records|no contacts|nothing/i,
    },
    {
      area: "crm",
      name: "crm-error",
      route: "/crm",
      widths: DESKTOP_MOBILE,
      scenario: "error",
      ready: () => /retry|try again/i,
    },
    {
      area: "crm",
      name: "crm-notes-empty",
      route: "/crm/notes",
      widths: DESKTOP_MOBILE,
      scenario: "empty",
      ready: () => /no (crm )?notes|no notes/i,
    },
    // Contributions
    {
      area: "contributions",
      name: "contributions",
      route: "/contributions",
      widths: ALL,
      full: true,
      ready: () => meta.contributionFirstDonor,
    },
    {
      area: "contributions",
      name: "contribution-sheet",
      route: () => `/contributions?gift=${meta.contributionSheetId}`,
      widths: DESKTOP_MOBILE,
      dialog: true,
      ready: () => meta.contributionSheetDonor,
    },
    {
      area: "contributions",
      name: "contribution-refund",
      route: () => `/contributions?gift=${meta.contributionSheetId}`,
      widths: DESKTOP_MOBILE,
      dialog: true,
      ready: () => meta.contributionSheetDonor,
      setup: async (page) => {
        await page
          .getByRole("button", { name: /refund gift/i })
          .first()
          .click();
        await page.waitForTimeout(1200);
      },
    },
    {
      area: "contributions",
      name: "contribution-correction",
      route: () => `/contributions?gift=${meta.contributionCorrectionId}`,
      widths: DESKTOP_MOBILE,
      dialog: true,
      ready: () => meta.contributionCorrectionDonor,
      setup: async (page) => {
        const panel = page
          .locator('[data-testid^="correction-request-"]')
          .first();
        await panel.scrollIntoViewIfNeeded().catch(() => {});
        await page.waitForTimeout(500);
      },
    },
    {
      area: "contributions",
      name: "contributions-empty",
      route: "/contributions",
      widths: DESKTOP_MOBILE,
      scenario: "empty",
      ready: () => /no contributions/i,
    },
    {
      area: "contributions",
      name: "contributions-error",
      route: "/contributions",
      widths: DESKTOP_MOBILE,
      scenario: "error",
      ready: () => /retry|try again/i,
    },
    // Web Studio (local CMS database)
    {
      area: "studio",
      name: "studio-dashboard",
      route: "/web-studio",
      widths: ALL,
      full: true,
    },
    {
      area: "studio",
      name: "studio-pages",
      route: "/web-studio/collections/pages",
      widths: ALL,
      full: true,
      ready: () => "Year-End Giving",
    },
    {
      area: "studio",
      name: "studio-media",
      route: "/web-studio/collections/media",
      widths: ["desktop"],
    },
    {
      area: "studio",
      name: "studio-navigation",
      route: "/web-studio/collections/navigation",
      widths: ["desktop"],
      ready: () => "Main Navigation",
    },
    {
      area: "studio",
      name: "studio-ministry-updates",
      route: "/web-studio/collections/ministry-updates",
      widths: DESKTOP_MOBILE,
      ready: () => "Clinic Opening Day",
    },
    {
      area: "studio",
      name: "studio-page-templates",
      route: "/web-studio/collections/page-templates",
      widths: ["desktop"],
    },
    {
      area: "studio",
      name: "studio-missionary-profiles",
      route: "/web-studio/collections/missionary-profiles",
      widths: ["desktop"],
    },
    {
      area: "studio",
      name: "studio-giving-pages",
      route: "/web-studio/collections/missionary-giving-pages",
      widths: ["desktop"],
    },
    {
      area: "studio",
      name: "studio-project-pages",
      route: "/web-studio/collections/project-pages",
      widths: ["desktop"],
    },
    {
      area: "studio",
      name: "studio-page-edit",
      route: () => `/web-studio/collections/pages/${meta.studioPageId ?? 1}`,
      widths: ALL,
      ready: () => "Document state",
    },
    {
      area: "studio",
      name: "studio-templates",
      route: "/web-studio/templates",
      widths: DESKTOP_MOBILE,
      full: true,
    },
    {
      area: "studio",
      name: "studio-missionaries",
      route: "/web-studio/missionaries",
      widths: DESKTOP_MOBILE,
      ready: () => "Grace Okafor",
    },
    {
      area: "studio",
      name: "studio-new-page",
      route: "/web-studio/pages/new-from-template",
      widths: DESKTOP_MOBILE,
      readyHeading: () => "New page",
    },
    {
      area: "studio",
      name: "studio-new-giving",
      route: "/web-studio/pages/give",
      widths: DESKTOP_MOBILE,
    },
    {
      area: "studio",
      name: "studio-new-project",
      route: "/web-studio/projects/new",
      widths: DESKTOP_MOBILE,
    },
    {
      area: "studio",
      name: "studio-new-update",
      route: "/web-studio/ministry-updates/new",
      widths: DESKTOP_MOBILE,
    },
    // Flyouts, menus and sub-views. Selectors match both the original and the
    // candidate (role + accessible-name regexes), so A and B are captured by
    // the same steps. A state whose trigger does not exist in a version is
    // captured as-is and reported at the end ("setup triggers not found").
    {
      area: "crm",
      name: "crm-row-menu",
      route: "/crm",
      widths: ["desktop"],
      ready: () => meta.crmFirstName,
      setup: async (page) =>
        clickFirst(page, [
          page.getByRole("button", { name: /^CRM actions for/i }),
        ]),
    },
    {
      area: "crm",
      name: "crm-view-options",
      route: "/crm",
      widths: ["desktop"],
      ready: () => meta.crmFirstName,
      setup: async (page) =>
        clickFirst(page, [page.getByRole("button", { name: /^view$/i })]),
    },
    {
      area: "crm",
      name: "crm-search",
      route: "/crm",
      widths: DESKTOP_MOBILE,
      ready: () => meta.crmFirstName,
      setup: async (page) => {
        const box = page
          .getByRole("searchbox")
          .or(page.getByPlaceholder(/search/i))
          .first();
        await box
          .fill(meta.crmDrawerName.split(" ")[0])
          .catch(() => logMissing("search box"));
        await page.waitForTimeout(1500);
      },
    },
    {
      area: "crm",
      name: "crm-drawer-gifts",
      route: () => `/crm?donor=${meta.crmDrawerId}`,
      widths: DESKTOP_MOBILE,
      ready: () => meta.crmDrawerName,
      dialog: true,
      freshPerWidth: true,
      keepScroll: true,
      setup: async (page) => {
        // Bring the gift list to the top of the drawer (it is already in
        // view, so "if needed" would not move it).
        const heading = page.getByText(/^gift history$/i).first();
        if (!(await heading.count())) logMissing("gift history heading");
        await heading
          .evaluate((element) => element.scrollIntoView({ block: "start" }))
          .catch(() => logMissing("gift history heading"));
        await page.waitForTimeout(800);
      },
    },
    {
      area: "crm",
      name: "crm-gift-views-menu",
      route: () => `/crm?donor=${meta.crmDrawerId}`,
      widths: ["desktop"],
      ready: () => meta.crmDrawerName,
      dialog: true,
      setup: async (page) => {
        await page
          .getByText(/^gift history$/i)
          .first()
          .scrollIntoViewIfNeeded()
          .catch(() => {});
        await clickFirst(page, [
          page.getByRole("button", { name: /^gift history views/i }),
          page.getByRole("button", { name: /saved views|views/i }),
        ]);
      },
    },
    {
      area: "crm",
      name: "crm-note-detail",
      route: "/crm/notes",
      widths: DESKTOP_MOBILE,
      ready: () => meta.crmFirstNoteTitle,
      dialog: true,
      setup: async (page) =>
        clickFirst(page, [
          page.getByRole("button", {
            name: meta.crmFirstNoteTitle,
            exact: true,
          }),
          page.getByText(meta.crmFirstNoteTitle, { exact: true }),
        ]),
    },
    {
      area: "contributions",
      name: "contributions-row-menu",
      route: "/contributions",
      widths: ["desktop"],
      ready: () => meta.contributionFirstDonor,
      setup: async (page) =>
        clickFirst(page, [
          page.getByRole("button", { name: /^contribution actions for/i }),
          page.getByRole("button", { name: /open menu/i }),
        ]),
    },
    {
      area: "contributions",
      name: "contributions-selection",
      route: "/contributions",
      widths: DESKTOP_MOBILE,
      freshPerWidth: true,
      keepScroll: true,
      ready: () => meta.contributionFirstDonor,
      setup: async (page) => {
        const rows = page.getByRole("checkbox", { name: /^select (?!all)/i });
        for (let i = 0; i < 3; i++) {
          await rows
            .nth(i)
            .click()
            .catch(() => logMissing(`row checkbox ${i}`));
        }
        await page.waitForTimeout(600);
        // Phones: the selected cards and the sticky bar sit below the
        // summary; show them rather than the top of the page.
        await rows
          .first()
          .evaluate((element) => element.scrollIntoView({ block: "center" }))
          .catch(() => {});
        await page.waitForTimeout(600);
      },
    },
    {
      area: "contributions",
      name: "contributions-send-receipts",
      route: "/contributions",
      widths: ["desktop"],
      ready: () => meta.contributionFirstDonor,
      dialog: true,
      setup: async (page) => {
        const rows = page.getByRole("checkbox", { name: /^select (?!all)/i });
        for (let i = 0; i < 2; i++) {
          await rows
            .nth(i)
            .click()
            .catch(() => logMissing(`row checkbox ${i}`));
        }
        await page.waitForTimeout(500);
        await clickFirst(page, [
          page.getByRole("button", { name: /send receipts?/i }),
        ]);
      },
    },
    {
      area: "contributions",
      name: "contributions-cards",
      route: "/contributions",
      widths: ["desktop", "intermediate"],
      // The cards sit below the summary; the full capture shows them.
      full: true,
      ready: () => meta.contributionFirstDonor,
      setup: async (page) =>
        clickFirst(page, [page.getByRole("button", { name: /^card view$/i })]),
    },
    {
      area: "contributions",
      name: "contributions-filter",
      route: "/contributions",
      widths: ["desktop"],
      ready: () => meta.contributionFirstDonor,
      setup: async (page) =>
        clickFirst(page, [
          page.getByRole("button", { name: /^status/i }),
          page.getByRole("combobox", { name: /status/i }),
        ]),
    },
    {
      area: "contributions",
      name: "contribution-fund-correction",
      route: () => `/contributions?gift=${meta.contributionSheetId}`,
      widths: DESKTOP_MOBILE,
      dialog: true,
      studioLookups: true,
      ready: () => meta.contributionSheetDonor,
      qualification: "NOT_EXERCISED_UNAVAILABLE_HUB_ENTRYPOINT",
      setup: unavailableHubCorrection,
    },
    {
      area: "contributions",
      name: "contribution-send-receipt",
      route: () => `/contributions?gift=${meta.contributionSheetId}`,
      widths: ["desktop"],
      dialog: true,
      ready: () => meta.contributionSheetDonor,
      setup: async (page) =>
        clickFirst(page, [
          page.getByRole("button", { name: /^send receipt$/i }),
          page.getByRole("button", { name: /resend receipt|send receipt/i }),
        ]),
    },
    {
      area: "studio",
      name: "studio-page-settings",
      route: () => `/web-studio/collections/pages/${meta.studioPageId ?? 1}`,
      widths: DESKTOP_MOBILE,
      dialog: true,
      ready: () => /document state|workspace/i,
      setup: async (page) =>
        clickFirst(page, [
          page.getByRole("button", { name: /^workspace( settings)?$/i }),
        ]),
    },
    {
      area: "studio",
      name: "studio-page-versions",
      route: () =>
        `/web-studio/collections/pages/${meta.studioPageId ?? 1}/versions`,
      widths: DESKTOP_MOBILE,
    },
    {
      area: "studio",
      name: "studio-page-api",
      route: () =>
        `/web-studio/collections/pages/${meta.studioPageId ?? 1}/api`,
      widths: ["desktop"],
      // Payload's API view fetches the document after the page renders.
      settled: (page) => waitForBodyText(page, '"createdAt"'),
    },
    {
      area: "studio",
      name: "studio-page-create",
      route: "/web-studio/collections/pages/create",
      widths: DESKTOP_MOBILE,
    },
    {
      area: "studio",
      name: "studio-pages-trash",
      route: "/web-studio/collections/pages/trash",
      widths: ["desktop"],
    },
    {
      area: "studio",
      name: "studio-update-edit",
      route: "/web-studio/collections/ministry-updates/2",
      widths: DESKTOP_MOBILE,
    },
    {
      area: "studio",
      name: "studio-navigation-edit",
      route: "/web-studio/collections/navigation/1",
      widths: ["desktop"],
    },
    {
      area: "studio",
      name: "studio-media-edit",
      route: "/web-studio/collections/media/1",
      widths: ["desktop"],
    },
    {
      area: "studio",
      name: "studio-users",
      route: "/web-studio/collections/cms-users",
      widths: DESKTOP_MOBILE,
    },
    {
      area: "studio",
      name: "studio-tenants",
      route: "/web-studio/collections/tenants",
      widths: ["desktop"],
    },
    {
      area: "studio",
      name: "studio-account",
      route: "/web-studio/account",
      widths: ALL,
      full: true,
    },
    // Interactive and edge states added for QA round 3 coverage.
    {
      area: "studio",
      name: "studio-pages-filters",
      route: "/web-studio/collections/pages",
      widths: DESKTOP_MOBILE,
      freshPerWidth: true,
      ready: () => "Year-End Giving",
      setup: async (page) => {
        await clickFirst(page, [
          page.getByRole("button", { name: /^Filters/ }),
        ]);
        await clickFirst(page, [
          page.getByRole("button", { name: /add filter/i }),
        ]);
      },
    },
    {
      area: "studio",
      name: "studio-pages-view-menu",
      route: "/web-studio/collections/pages",
      widths: ["desktop"],
      freshPerWidth: true,
      ready: () => "Year-End Giving",
      setup: async (page) =>
        clickFirst(page, [page.getByRole("button", { name: /^View$/ })]),
    },
    {
      area: "studio",
      name: "studio-pages-sort-menu",
      route: "/web-studio/collections/pages",
      widths: ["mobile"],
      freshPerWidth: true,
      ready: () => "Year-End Giving",
      setup: async (page) =>
        clickFirst(page, [page.getByRole("button", { name: /^Sort/ })]),
    },
    // Round 11: the phone Sort menu on a list with a named reference
    // column (Giving Pages' Missionary orders by stored ID).
    {
      area: "studio",
      name: "studio-giving-pages-sort-menu",
      route: "/web-studio/collections/missionary-giving-pages",
      widths: ["mobile"],
      freshPerWidth: true,
      setup: async (page) =>
        clickFirst(page, [page.getByRole("button", { name: /^Sort/ })]),
    },
    // Round 11: the Core create form for page templates (no empty draft).
    {
      area: "studio",
      name: "studio-new-template",
      route: "/web-studio/collections/page-templates/create",
      widths: DESKTOP_MOBILE,
      ready: () => "New template",
    },
    {
      area: "studio",
      name: "studio-pages-filtered-empty",
      route: "/web-studio/collections/pages?search=no-such-page-zz",
      widths: DESKTOP_MOBILE,
      ready: () => /no matching pages|no results/i,
    },
    {
      area: "studio",
      name: "studio-giving-edit",
      route: "/web-studio/collections/missionary-giving-pages",
      widths: DESKTOP_MOBILE,
      freshPerWidth: true,
      ready: () => "Grace Okafor",
      setup: async (page) => {
        await clickFirst(
          page,
          [page.getByRole("link", { name: /Grace Okafor/ })],
          400,
        );
        await page
          .getByText(/document state|workspace/i)
          .first()
          .waitFor({ timeout: 60000 })
          .catch(() => {});
        await page.waitForTimeout(1200);
      },
    },
    {
      area: "studio",
      name: "studio-page-edit-details",
      route: () => `/web-studio/collections/pages/${meta.studioPageId ?? 1}`,
      widths: ["mobile"],
      freshPerWidth: true,
      ready: () => /document state|workspace/i,
      setup: async (page) =>
        clickFirst(page, [page.getByRole("button", { name: /^Details/ })]),
    },
    {
      area: "studio",
      name: "studio-page-edit-preview-menu",
      route: () => `/web-studio/collections/pages/${meta.studioPageId ?? 1}`,
      widths: ["mobile"],
      freshPerWidth: true,
      ready: () => /document state|workspace/i,
      setup: async (page) =>
        clickFirst(page, [page.getByRole("button", { name: /^Preview$/ })]),
    },
    {
      area: "studio",
      name: "studio-new-page-errors",
      route: "/web-studio/pages/new-from-template",
      widths: DESKTOP_MOBILE,
      freshPerWidth: true,
      readyHeading: () => "New page",
      setup: async (page) =>
        clickFirst(page, [
          page.getByRole("button", { name: /^Create draft$/ }),
        ]),
    },
    {
      area: "studio",
      name: "studio-new-page-template-picker",
      route: "/web-studio/pages/new-from-template",
      widths: DESKTOP_MOBILE,
      freshPerWidth: true,
      readyHeading: () => "New page",
      setup: async (page) =>
        clickFirst(page, [page.getByRole("combobox", { name: /^Template/ })]),
    },
    {
      area: "studio",
      name: "studio-new-giving-errors",
      route: "/web-studio/pages/give",
      widths: ["desktop"],
      freshPerWidth: true,
      ready: () => "New giving page",
      setup: async (page) =>
        clickFirst(page, [
          page.getByRole("button", { name: /^Create draft$/ }),
        ]),
    },
    {
      area: "studio",
      name: "studio-missionaries-status-error",
      route: "/web-studio/missionaries",
      widths: DESKTOP_MOBILE,
      // Wait for the failed status lookup, not the rows (which load first
      // and show "Checking…" until the lookup settles).
      ready: () => "Unavailable",
      routes: async (page) => {
        await page.route(/\/missionary-giving-pages\?limit=500/, (route) =>
          route.fulfill({ status: 500, body: "unavailable" }),
        );
      },
    },
    {
      area: "studio",
      name: "studio-templates-error",
      route: "/web-studio/templates",
      widths: DESKTOP_MOBILE,
      // The page heading also says "templates"; wait for the error itself.
      ready: () => /couldn.t load templates/i,
      routes: async (page) => {
        await page.route(/\/page-templates(\?|$)/, (route) =>
          route.request().resourceType() === "fetch"
            ? route.fulfill({ status: 500, body: "unavailable" })
            : route.continue(),
        );
      },
    },
    {
      area: "studio",
      name: "studio-nav-mobile",
      route: "/web-studio",
      widths: ["mobile"],
      dialog: true,
      setup: async (page) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.waitForTimeout(800);
        await clickFirst(page, [
          page.getByRole("button", { name: /open studio navigation/i }),
        ]);
      },
    },
    // Round 2: Group by and relationships past the first 50.
    {
      area: "studio",
      name: "studio-pages-grouped",
      route: "/web-studio/collections/pages?groupBy=_status",
      widths: DESKTOP_MOBILE,
      ready: () => "Year-End Giving",
    },
    {
      area: "studio",
      name: "studio-pages-group-menu",
      route: "/web-studio/collections/pages",
      widths: ["desktop"],
      freshPerWidth: true,
      ready: () => "Year-End Giving",
      setup: async (page) => {
        // A keeps Group by inside "Columns & filters"; B has a toolbar menu.
        await clickFirst(page, [
          page.getByRole("button", { name: /^Group by/ }),
          page.getByRole("button", { name: /columns (&|and) filters/i }),
        ]);
      },
    },
    {
      area: "crm",
      name: "crm-relationships-more",
      route: "/crm/relationships",
      widths: DESKTOP_MOBILE,
      freshPerWidth: true,
      ready: () => meta.crmFirstRelationshipName,
      setup: async (page) => {
        // Desktop pages on scroll inside the grid body; phones use the
        // Load more button under the cards.
        const loadMore = page.getByRole("button", { name: /^Load more$/ });
        if (
          await loadMore
            .first()
            .isVisible()
            .catch(() => false)
        ) {
          await loadMore.first().click();
          await page.waitForTimeout(1200);
          return;
        }
        await page.evaluate(() => {
          const region =
            document.querySelector('[data-slot="data-grid-panel"]') ??
            document.body;
          const scrollers = [...region.querySelectorAll("*")].filter(
            (el) =>
              el.scrollHeight > el.clientHeight + 20 &&
              getComputedStyle(el).overflowY !== "visible",
          );
          for (const el of scrollers) el.scrollTop = el.scrollHeight;
          window.scrollTo(0, document.body.scrollHeight);
        });
        await page.waitForTimeout(1500);
      },
    },
    // Round 3: flows reviewers could not see, and bulk work in Studio.
    {
      area: "crm",
      name: "crm-gift-row-menu",
      route: () => `/crm?donor=${meta.crmDrawerId}`,
      widths: ["desktop"],
      ready: () => meta.crmDrawerName,
      dialog: true,
      fixtureInputRequired: true,
      setup: giftMenuSetup(meta, fixtureBundle),
    },
    {
      area: "crm",
      name: "crm-resend-receipt",
      route: () => `/crm?donor=${meta.crmDrawerId}`,
      widths: DESKTOP_MOBILE,
      freshPerWidth: true,
      ready: () => meta.crmDrawerName,
      dialog: true,
      setup: async (page) => {
        await clickFirst(page, [
          // "Resend receipt, pinned" when the viewer pinned it.
          page.getByRole("button", { name: /^Resend receipt/ }),
          page.getByRole("button", { name: /^Send receipt/ }),
        ]);
      },
    },
    {
      area: "crm",
      name: "crm-relationship-detail",
      route: "/crm/relationships",
      widths: DESKTOP_MOBILE,
      freshPerWidth: true,
      ready: () => meta.crmFirstRelationshipName,
      dialog: true,
      setup: async (page) => {
        // Rows without a CRM record open their details in place.
        await clickFirst(page, [page.locator("button[data-grid-row-primary]")]);
      },
    },
    {
      area: "crm",
      name: "crm-note-long",
      route: "/crm/notes",
      widths: DESKTOP_MOBILE,
      freshPerWidth: true,
      ready: () => meta.crmFirstNoteTitle,
      dialog: true,
      setup: async (page) => {
        // A real long note: saved through the composer, then opened.
        const paragraph =
          "Margaret asked for a follow-up call before the year-end appeal. She wants the vision dinner recap, the clinic budget and the next quarter's prayer letter first, and prefers mornings. ";
        const body = paragraph.repeat(16);
        const newNote = page.getByRole("button", { name: /^New note$/ });
        if (await newNote.isVisible().catch(() => false)) {
          await newNote.click();
        }
        await page
          .getByLabel("Title")
          .fill("Year-end call notes")
          .catch(() => logMissing("note title field"));
        await page
          .getByLabel("Body")
          .fill(body)
          .catch(() => logMissing("note body field"));
        await clickFirst(page, [
          page.getByRole("button", { name: /^Save note$/ }),
        ]);
        await page.waitForTimeout(1200);
        await clickFirst(page, [
          page.getByRole("button", { name: /^Year-end call notes/ }),
        ]);
      },
    },
    {
      area: "studio",
      name: "studio-pages-selected",
      route: "/web-studio/collections/pages",
      widths: DESKTOP_MOBILE,
      freshPerWidth: true,
      ready: () => "Year-End Giving",
      setup: async (page) => {
        for (const title of ["Year-End Giving", "Kenya School Build"]) {
          await clickFirst(page, [
            page.getByRole("checkbox", { name: `Select ${title}` }),
            page.getByRole("checkbox", { name: /select/i }),
          ]);
        }
      },
    },
    {
      area: "studio",
      name: "studio-pages-bulk-publish",
      route: "/web-studio/collections/pages",
      widths: ["desktop"],
      freshPerWidth: true,
      ready: () => "Year-End Giving",
      dialog: true,
      setup: async (page) => {
        for (const title of ["Year-End Giving", "Kenya School Build"]) {
          await clickFirst(page, [
            page.getByRole("checkbox", { name: `Select ${title}` }),
          ]);
        }
        // Opens Payload's confirmation; the capture never confirms.
        await clickFirst(page, [
          page
            .getByRole("toolbar", { name: "Selected record actions" })
            .getByRole("button", { name: /^Publish/ }),
        ]);
      },
    },
    {
      area: "studio",
      name: "studio-pages-tenant-filter",
      route:
        "/web-studio/collections/pages?where[or][0][and][0][tenant][equals]=1",
      widths: DESKTOP_MOBILE,
      freshPerWidth: true,
      ready: () => "Year-End Giving",
      setup: async (page) => {
        // A filter on a relationship (Tenant), as a link may carry it.
        const panel = page.getByRole("group", { name: /^Filter / });
        if (!(await panel.isVisible().catch(() => false))) {
          await clickFirst(page, [
            page.getByRole("button", { name: /^Filters/ }),
            page.getByRole("button", { name: /columns (&|and) filters/i }),
          ]);
        }
      },
    },
  ];
}
