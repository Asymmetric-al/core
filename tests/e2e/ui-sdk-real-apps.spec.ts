import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import AxeBuilder from "@axe-core/playwright";
import {
  expect,
  test,
  type Locator,
  type Page,
  type PlaywrightWorkerArgs,
  type TestInfo,
} from "@playwright/test";

import { adminBaseURL, donorBaseURL } from "./base-urls";
import { getDemoRoleMap } from "./helpers/demo-auth";
import {
  installDemoSessionInBrowser,
  type DemoAccountRole,
} from "./helpers/install-demo-session";
import { hideNextDevOverlay } from "./helpers/next-dev-overlay";
import { skipUnlessRequired } from "./ui-sdk-real-apps-required";

// The UI SDK shell integration proven in the three real Next.js apps: App
// Router with Cache Components and the React Compiler, real server rendering
// and hydration, the real compiled CSS layer order and real key presses. The
// other `ui-sdk-*.spec.ts` files run isolated `bun build` fixtures instead.
//
// Shared owners under test: `packages/ui/components/primitives/shortcut.tsx`
// (UI SDK shortcut manager plus Core's guards), `navigation-command-palette.tsx`
// (and Mission Control's own palette in
// `apps/admin/features/mission-control/components/navigation-search.tsx`),
// `shortcut-help.tsx`, `packages/ui/components/shadcn/sidebar.tsx` and
// `agent-bridge.tsx`, mounted in `apps/admin/app/mc-shell.tsx` only.
//
// Playwright's Chromium is not an Apple platform here, so `mod` is Control:
// hints read Ctrl+K and `aria-keyshortcuts` reads Control+K.

const missionaryBaseURL =
  process.env.PLAYWRIGHT_MISSIONARY_BASE_URL ?? "http://localhost:4000";

const VIEWPORTS = [
  { label: "1280", width: 1280, height: 900, phone: false },
  { label: "375", width: 375, height: 812, phone: true },
] as const;
type Viewport = (typeof VIEWPORTS)[number];
const DESKTOP = VIEWPORTS[0];

type RealApp = {
  title: string;
  baseURL: string;
  role: DemoAccountRole;
  path: string;
  palette: {
    /** The search button's accessible name. */
    trigger: string;
    /** The palette dialog's title. */
    dialog: string;
    /** The search box's name, which is also its shortcut's description. */
    search: string;
  };
  /** Renders the shared `Sidebar` (Ctrl+B). */
  sidebar: boolean;
  /** Mounts the `AgentBridge`. */
  agentBridge: boolean;
  /** The account menu's trigger, which holds the Keyboard shortcuts item. */
  accountMenu: RegExp;
  /** Cascade layers in precedence order, lowest first, as the browser builds them. */
  layers: readonly string[];
};

const APPS: readonly RealApp[] = [
  {
    title: "donor portal",
    baseURL: donorBaseURL,
    role: "donor",
    path: "/donor-dashboard",
    palette: {
      trigger: "Search donor pages",
      dialog: "Donor navigation",
      search: "Search donor navigation",
    },
    // The portal navigates with a header and a phone tab bar.
    sidebar: false,
    agentBridge: false,
    accountMenu: /^Account menu for /,
    layers: [
      "properties",
      "ui-sdk",
      "theme",
      "base",
      "components",
      "utilities",
    ],
  },
  {
    title: "missionary workspace",
    baseURL: missionaryBaseURL,
    role: "missionary",
    path: "/",
    palette: {
      trigger: "Search missionary pages",
      dialog: "Missionary navigation",
      search: "Search missionary navigation",
    },
    sidebar: true,
    agentBridge: false,
    accountMenu: /^Account menu for /,
    layers: [
      "properties",
      "ui-sdk",
      "theme",
      "base",
      "components",
      "utilities",
    ],
  },
  {
    title: "Mission Control",
    baseURL: adminBaseURL,
    role: "admin",
    path: "/",
    palette: {
      trigger: "Open Mission Control search",
      dialog: "Mission Control navigation",
      search: "Search Mission Control pages",
    },
    sidebar: true,
    agentBridge: true,
    accountMenu: /^Open profile menu$/,
    // `apps/admin/app/css-layer-order.css` adds Payload's layers.
    layers: [
      "properties",
      "ui-sdk",
      "theme",
      "base",
      "payload-default",
      "payload",
      "components",
      "utilities",
    ],
  },
];

const TAILWIND_LAYERS = ["theme", "base", "components", "utilities"];

// UI SDK writes a key hint inside Unicode directional isolates, so it reads
// the same in a right-to-left sentence.
const hint = (text: string) => `⁦${text}⁩`;

// The one deviation `ui-sdk-pattern-conformance.spec.ts` accepts for Core's
// modal dialogs, word for word: Base UI makes the page behind inert instead of
// setting `aria-modal`, because `aria-modal` also hides popups a dialog opens
// outside itself.
const MODAL_DIALOG_DEVIATION = [
  'div[role=dialog]: is modal but has no aria-modal="true", which tells screen readers the page behind it is inert (APG dialog (modal)).',
];

const OPEN_DIALOG = '[role="dialog"][data-open]';
const HYDRATION = /hydrat|did not match|server rendered html/i;

type KeyRecord = {
  key: string;
  ctrlKey: boolean;
  shiftKey: boolean;
  defaultPrevented: boolean;
};
type AgentTool = { name: string; execute: (input: unknown) => unknown };
type SpecWindow = Window & {
  __keyLog?: KeyRecord[];
  __tools?: Map<string, AgentTool>;
  __checkPattern?: (selector: string, pattern: string) => Promise<string[]>;
};

// ---------------------------------------------------------------------------
// Console and hydration

type Collected = { hydration: string[]; errors: string[] };
const consoleOf = new WeakMap<Page, Collected>();

/** Collects console output and page errors from navigation on. */
function collectConsole(page: Page) {
  const collected: Collected = { hydration: [], errors: [] };
  consoleOf.set(page, collected);
  page.on("console", (message) => {
    const text = `${message.type()}: ${message.text()}`;
    if (HYDRATION.test(message.text())) collected.hydration.push(text);
    else if (message.type() === "error") collected.errors.push(text);
  });
  page.on("pageerror", (error) => {
    const text = `pageerror: ${error.message}`;
    if (HYDRATION.test(error.message)) collected.hydration.push(text);
    else collected.errors.push(text);
  });
}

// ---------------------------------------------------------------------------
// Sign-in, navigation and readiness

/**
 * Skips the app's block, with the reason, when its server or demo role is
 * missing; in CI it fails instead (`ui-sdk-real-apps-required.ts`).
 */
async function requireApp(
  playwright: PlaywrightWorkerArgs["playwright"],
  app: RealApp,
) {
  const request = await playwright.request.newContext();
  try {
    const availability = new URL("/api/auth/demo-account", app.baseURL);
    const response = await request
      .get(availability.toString(), { timeout: 120_000 })
      .catch((error: unknown) =>
        error instanceof Error ? error : new Error(String(error)),
      );
    if (response instanceof Error) {
      skipUnlessRequired(
        true,
        `The ${app.title} server at ${app.baseURL} did not answer: ${response.message}`,
      );
      return;
    }
    skipUnlessRequired(
      !response.ok(),
      `The ${app.title} demo availability endpoint answered ${response.status()}.`,
    );
    const roles = getDemoRoleMap(await response.json()) ?? {};
    skipUnlessRequired(
      !roles[app.role],
      `The ${app.role} demo account is not configured at ${app.baseURL}.`,
    );
  } finally {
    await request.dispose();
  }
}

const paletteTrigger = (page: Page, app: RealApp) =>
  page.getByRole("button", { name: app.palette.trigger, exact: true });

// Shortcuts register in passive effects, and a key's state change paints on
// the next frame, so two animation frames are the event to wait for.
const nextFrames = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );

/** Records every keydown that reaches `window`, after the app's own handlers. */
async function recordKeys(page: Page) {
  await page.evaluate(() => {
    const log: KeyRecord[] = [];
    (window as SpecWindow).__keyLog = log;
    window.addEventListener("keydown", (event) =>
      log.push({
        key: event.key,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        defaultPrevented: event.defaultPrevented,
      }),
    );
  });
}

const lastKey = (page: Page) =>
  page.evaluate(() => (window as SpecWindow).__keyLog?.at(-1) ?? null);

// The keydown that reaches `window` when no shortcut took Ctrl+<letter>, so
// the browser's default still applies. Playwright sends `K` for "Control+K"
// where a keyboard sends `k`; UI SDK matches either, so case is not asserted.
const leftToBrowser = (letter: string) => ({
  key: expect.stringMatching(new RegExp(`^${letter}$`, "i")),
  ctrlKey: true,
  shiftKey: false,
  defaultPrevented: false,
});
/** The same keydown when a shortcut ran and took the key from the browser. */
const takenFromBrowser = (letter: string) => ({
  ...leftToBrowser(letter),
  defaultPrevented: true,
});

/**
 * Signs in as the app's demo role, opens its home and waits until the shell
 * has hydrated. Returns the palette's search button.
 */
async function openApp(page: Page, app: RealApp, viewport: Viewport) {
  await page.setViewportSize({
    width: viewport.width,
    height: viewport.height,
  });
  const session = await installDemoSessionInBrowser(
    page,
    app.role,
    app.baseURL,
  );
  expect(
    session.ok,
    `The ${app.role} demo sign-in answered ${session.status}`,
  ).toBe(true);
  await page.goto(new URL(app.path, app.baseURL).toString(), {
    waitUntil: "domcontentloaded",
    timeout: 180_000,
  });
  const trigger = paletteTrigger(page, app);
  // The first hit of a route compiles it.
  await expect(trigger).toBeVisible({ timeout: 180_000 });
  // React marks a node it has hydrated; the shell's effects run right after.
  await expect
    .poll(
      () =>
        trigger.evaluate((element) =>
          Object.keys(element).some((key) => key.startsWith("__reactFiber$")),
        ),
      { timeout: 120_000 },
    )
    .toBe(true);
  await nextFrames(page);
  await recordKeys(page);
  return trigger;
}

const bodyHasFocus = (page: Page) =>
  page.evaluate(() => document.activeElement === document.body);

async function focusBody(page: Page) {
  await page.evaluate(() =>
    (document.activeElement as HTMLElement | null)?.blur(),
  );
  await expect.poll(() => bodyHasFocus(page)).toBe(true);
}

/**
 * A plain text field outside every overlay, clicked into. The apps' home
 * pages show none while live data is unavailable, and the shortcut guard
 * treats every text field alike.
 */
async function addProbeField(page: Page) {
  await page.evaluate(() => {
    const field = document.createElement("input");
    field.type = "text";
    field.setAttribute("aria-label", "Probe note");
    field.style.cssText =
      "position:fixed;bottom:96px;right:16px;z-index:2147483647;width:160px";
    document.body.append(field);
  });
  const field = page.getByRole("textbox", { name: "Probe note" });
  await field.click();
  await expect(field).toBeFocused();
  return field;
}

async function snap(page: Page, testInfo: TestInfo, name: string) {
  await testInfo.attach(name, {
    body: await page.screenshot(),
    contentType: "image/png",
  });
}

async function attachJson(testInfo: TestInfo, name: string, value: unknown) {
  await testInfo.attach(name, {
    body: JSON.stringify(value, null, 2),
    contentType: "application/json",
  });
}

// ---------------------------------------------------------------------------
// Pattern and accessibility checks

let bundleDirectory: string | undefined;
let checkPatternBundle: Promise<string> | undefined;

/** UI SDK's `checkPattern`, bundled once per worker for injection. */
function checkPatternScript() {
  checkPatternBundle ??= (async () => {
    bundleDirectory = await mkdtemp(
      path.join(os.tmpdir(), "core-ui-sdk-real-apps-"),
    );
    const bundle = path.join(bundleDirectory, "check-pattern.js");
    execFileSync(
      "bun",
      [
        "--no-env-file",
        "build",
        "tests/e2e/fixtures/ui-sdk-check-pattern.ts",
        "--target=browser",
        "--format=iife",
        "--define",
        'process.env.NODE_ENV="development"',
        "--outfile",
        bundle,
      ],
      { cwd: process.cwd(), stdio: "pipe", timeout: 120_000 },
    );
    return readFile(bundle, "utf8");
  })();
  return checkPatternBundle;
}

test.afterAll(async () => {
  if (bundleDirectory) {
    await rm(bundleDirectory, { recursive: true, force: true });
  }
});

async function checkPattern(page: Page, selector: string, pattern: string) {
  const installed = await page.evaluate(
    () => typeof (window as SpecWindow).__checkPattern === "function",
  );
  if (!installed) {
    await page.addScriptTag({ content: await checkPatternScript() });
  }
  return page.evaluate(
    ([root, name]) => (window as SpecWindow).__checkPattern!(root, name),
    [selector, pattern] as const,
  );
}

async function expectNoAxeViolations(page: Page, selector: string) {
  const results = await new AxeBuilder({ page })
    .include(selector)
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    results.violations.map((violation) => ({
      id: violation.id,
      nodes: violation.nodes.map((node) => node.target.join(" ")),
    })),
  ).toEqual([]);
}

// ---------------------------------------------------------------------------
// Cascade layers

/**
 * The cascade layers in the order the browser fixes their precedence, lowest
 * first: the order each name first appears across the document's style
 * sheets. Also returns the first `@layer` statement and every standard (not
 * custom) property that a layer below `ui-sdk` declares.
 */
function readCascadeLayers(page: Page) {
  return page.evaluate(() => {
    const order: string[] = [];
    const firstStatements: string[][] = [];
    const unreadable: string[] = [];
    const declared = new Map<string, Set<string>>();
    const name = (layer: string) => {
      if (layer && !order.includes(layer)) order.push(layer);
    };
    const declarations = (rules: CSSRuleList, into: Set<string>) => {
      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSStyleRule) {
          for (let index = 0; index < rule.style.length; index += 1) {
            into.add(rule.style.item(index));
          }
        }
        if ("cssRules" in rule) {
          declarations((rule as CSSGroupingRule).cssRules, into);
        }
      }
    };
    const visit = (rules: CSSRuleList) => {
      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSLayerStatementRule) {
          if (firstStatements.length === 0) {
            firstStatements.push([...rule.nameList]);
          }
          rule.nameList.forEach(name);
        } else if (rule instanceof CSSLayerBlockRule) {
          name(rule.name);
          const into = declared.get(rule.name) ?? new Set<string>();
          declared.set(rule.name, into);
          declarations(rule.cssRules, into);
        } else if (rule instanceof CSSImportRule) {
          if (rule.layerName) name(rule.layerName);
          if (rule.styleSheet) visit(rule.styleSheet.cssRules);
        } else if (
          rule instanceof CSSMediaRule ||
          rule instanceof CSSSupportsRule
        ) {
          visit(rule.cssRules);
        }
      }
    };
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        visit(sheet.cssRules);
      } catch {
        unreadable.push(sheet.href ?? "inline");
      }
    }
    const belowUiSdk = order.slice(0, Math.max(order.indexOf("ui-sdk"), 0));
    const declaredBelowUiSdk = belowUiSdk.flatMap((layer) =>
      [...(declared.get(layer) ?? [])].map((property) => ({ layer, property })),
    );
    return {
      order,
      firstStatement: firstStatements[0] ?? [],
      belowUiSdk,
      customPropertiesBelowUiSdk: declaredBelowUiSdk.filter(({ property }) =>
        property.startsWith("--"),
      ).length,
      standardPropertiesBelowUiSdk: declaredBelowUiSdk
        .filter(({ property }) => !property.startsWith("--"))
        .map(({ layer, property }) => `${layer}: ${property}`),
      unreadable,
    };
  });
}

// ---------------------------------------------------------------------------
// Shortcut help rows

async function readHelpRows(help: Locator) {
  return help.locator("li").evaluateAll((items) =>
    items.map((item) => {
      const spoken = item.querySelector(".sr-only");
      const kbd = item.querySelector("kbd");
      const spokenBox = spoken?.getBoundingClientRect();
      return {
        description: item.firstElementChild?.textContent?.trim() ?? "",
        spoken: spoken?.textContent ?? "",
        hint: kbd?.textContent ?? "",
        hintHiddenFromAssistiveTechnology:
          kbd?.getAttribute("aria-hidden") === "true",
        hintVisible: Boolean(kbd && kbd.getBoundingClientRect().width > 0),
        spokenVisuallyHidden: Boolean(
          spokenBox && spokenBox.width <= 1 && spokenBox.height <= 1,
        ),
      };
    }),
  );
}

// ---------------------------------------------------------------------------
// WebMCP stand-in

/** A browser `document.modelContext` that keeps registered tools on `window`. */
function installWebMcpStandIn() {
  const tools = new Map<string, AgentTool>();
  (window as SpecWindow).__tools = tools;
  Object.defineProperty(document, "modelContext", {
    configurable: true,
    value: {
      registerTool(tool: AgentTool, options?: { signal?: AbortSignal }) {
        tools.set(tool.name, tool);
        options?.signal?.addEventListener("abort", () =>
          tools.delete(tool.name),
        );
        return Promise.resolve();
      },
    },
  });
}

const toolNames = (page: Page) =>
  page.evaluate(() =>
    [...((window as SpecWindow).__tools?.keys() ?? [])].sort(),
  );

/**
 * The allowlists of every mounted `AgentBridge`, which the bridge keeps on
 * the document under a global symbol, or null when no bridge ever mounted.
 */
const bridgeGrants = (page: Page) =>
  page.evaluate(() => {
    const state = (
      document as unknown as Record<
        symbol,
        { grants: Set<{ allow: unknown }> } | undefined
      >
    )[Symbol.for("asym.ui.agent-bridge")];
    return state ? [...state.grants].map((grant) => grant.allow) : null;
  });

function callTool(page: Page, name: string, input: unknown) {
  return page.evaluate(
    async ([toolName, toolInput]) => {
      const tool = (window as SpecWindow).__tools?.get(toolName);
      if (!tool) return { missing: toolName };
      try {
        return { result: await tool.execute(toolInput) };
      } catch (error) {
        return {
          thrown: error instanceof Error ? error.message : String(error),
        };
      }
    },
    [name, input] as const,
  );
}

// ---------------------------------------------------------------------------
// The suites

test.use({ reducedMotion: "reduce" });
// The dev-only Next.js overlay covers bottom-left controls; see the helper.
test.beforeEach(async ({ context }) => {
  await hideNextDevOverlay(context);
});

for (const app of APPS) {
  test.describe(`UI SDK in the real ${app.title}`, () => {
    // First hits compile routes, and Mission Control's home streams slowly
    // with placeholder data.
    test.describe.configure({ timeout: 300_000 });

    test.beforeAll(async ({ playwright }) => {
      await requireApp(playwright, app);
    });

    test.beforeEach(async ({ page }) => {
      collectConsole(page);
    });

    // Console errors from placeholder data are reported; a hydration error
    // fails the test.
    test.afterEach(async ({ page }, testInfo) => {
      const collected = consoleOf.get(page);
      if (!collected) return;
      await attachJson(testInfo, "console-errors", collected.errors);
      expect(collected.hydration, "hydration errors").toEqual([]);
    });

    for (const viewport of VIEWPORTS) {
      test(`hydrates without errors and keeps ui-sdk the lowest cascade layer at ${viewport.label}`, async ({
        page,
      }, testInfo) => {
        await openApp(page, app, viewport);
        // Every streamed boundary has arrived and hydrated by `load`.
        await page.waitForLoadState("load", { timeout: 180_000 });
        await nextFrames(page);

        const cascade = await readCascadeLayers(page);
        await attachJson(testInfo, "cascade-layers", cascade);
        expect(cascade.unreadable).toEqual([]);
        // The first `@layer` statement names ui-sdk ahead of every Tailwind
        // layer it names.
        const first = cascade.firstStatement;
        expect(first).toContain("ui-sdk");
        for (const layer of TAILWIND_LAYERS.filter((name) =>
          first.includes(name),
        )) {
          expect(first.indexOf("ui-sdk")).toBeLessThan(first.indexOf(layer));
        }
        expect(cascade.order).toEqual(app.layers);
        // Tailwind hoists its `properties` layer above everything. It only
        // gives `--tw-*` custom properties their initial values, so ui-sdk is
        // the lowest layer that sets any real property.
        expect(cascade.belowUiSdk).toEqual(["properties"]);
        expect(cascade.customPropertiesBelowUiSdk).toBeGreaterThan(0);
        expect(cascade.standardPropertiesBelowUiSdk).toEqual([]);
        await snap(page, testInfo, `${app.role}-hydrated-${viewport.label}`);
      });

      test(`Ctrl+K opens and closes the navigation palette at ${viewport.label}`, async ({
        page,
      }, testInfo) => {
        const trigger = await openApp(page, app, viewport);
        const dialog = page.getByRole("dialog", { name: app.palette.dialog });
        const search = page.getByRole("combobox", {
          name: app.palette.search,
        });

        await expect(trigger).toHaveAttribute("aria-keyshortcuts", "Control+K");
        const triggerHint = trigger.locator("kbd");
        if (viewport.phone) {
          // Phones have no room for the hint, by design.
          await expect(triggerHint).toBeHidden();
        } else {
          await expect(triggerHint).toBeVisible();
          await expect(triggerHint).toHaveText(hint("Ctrl+K"));
        }

        // From the page body, Ctrl+K opens it with its search box focused,
        // and Ctrl+K in that box closes it again.
        await focusBody(page);
        await page.keyboard.press("Control+K");
        await expect(dialog).toBeVisible();
        await expect(search).toBeFocused();
        expect(await lastKey(page)).toEqual(takenFromBrowser("k"));
        await snap(page, testInfo, `${app.role}-palette-${viewport.label}`);
        await page.keyboard.press("Control+K");
        await expect(dialog).toBeHidden();
        await expect.poll(() => bodyHasFocus(page)).toBe(true);

        // Opened from its trigger, Escape closes it back to the trigger.
        await trigger.click();
        await expect(dialog).toBeVisible();
        await expect(search).toBeFocused();
        await page.keyboard.press("Escape");
        await expect(dialog).toBeHidden();
        await expect(trigger).toBeFocused();

        // From the trigger, Ctrl+K opens it and Ctrl+K closes it back there.
        await page.keyboard.press("Control+K");
        await expect(search).toBeFocused();
        await page.keyboard.press("Control+K");
        await expect(dialog).toBeHidden();
        await expect(trigger).toBeFocused();

        // The open palette passes axe, and UI SDK's dialog check finds only
        // the accepted aria-modal deviation. The check's Escape closes it.
        await page.keyboard.press("Control+K");
        await expect(search).toBeFocused();
        await expectNoAxeViolations(page, OPEN_DIALOG);
        expect(await checkPattern(page, OPEN_DIALOG, "dialog")).toEqual(
          MODAL_DIALOG_DEVIATION,
        );
        await expect(dialog).toBeHidden();

        // Typing wins: in another text field Ctrl+K opens nothing and the
        // key is left to the browser.
        const field = await addProbeField(page);
        await page.keyboard.type("Note");
        await page.keyboard.press("Control+K");
        await nextFrames(page);
        await expect(dialog).toBeHidden();
        await expect(field).toBeFocused();
        await expect(field).toHaveValue("Note");
        expect(await lastKey(page)).toEqual(leftToBrowser("k"));
      });

      if (app.sidebar) {
        test(`Ctrl+B toggles the shared sidebar at ${viewport.label}`, async ({
          page,
        }, testInfo) => {
          await openApp(page, app, viewport);
          const trigger = page.locator('[data-sidebar="trigger"]');
          await expect(trigger).toHaveAccessibleName("Toggle Sidebar");
          await expect(trigger).toHaveAttribute(
            "aria-keyshortcuts",
            "Control+B",
          );
          const palette = page.getByRole("dialog", {
            name: app.palette.dialog,
          });
          const help = page.getByRole("dialog", { name: "Keyboard shortcuts" });
          const sidebar = page.locator('[data-slot="sidebar"][data-state]');
          const sheet = page.getByRole("dialog", { name: "Sidebar" });
          // What "Ctrl+B did nothing" looks like at this width.
          const sidebarUnchanged = () =>
            viewport.phone
              ? expect(sheet).toBeHidden()
              : expect(sidebar).toHaveAttribute("data-state", "expanded");

          if (!viewport.phone) {
            await expect(sidebar).toHaveAttribute("data-state", "expanded");
            await focusBody(page);
            await page.keyboard.press("Control+B");
            await expect(sidebar).toHaveAttribute("data-state", "collapsed");
            expect(await lastKey(page)).toEqual(takenFromBrowser("b"));
            await snap(
              page,
              testInfo,
              `${app.role}-sidebar-collapsed-${viewport.label}`,
            );
            await page.keyboard.press("Control+B");
            await expect(sidebar).toHaveAttribute("data-state", "expanded");
          } else {
            await expect(sheet).toBeHidden();
            await focusBody(page);
            await page.keyboard.press("Control+B");
            await expect(sheet).toBeVisible();
            expect(await lastKey(page)).toEqual(takenFromBrowser("b"));
            await expect
              .poll(() =>
                page.evaluate(() =>
                  Boolean(
                    document.activeElement?.closest('[data-mobile="true"]'),
                  ),
                ),
              )
              .toBe(true);
            await snap(
              page,
              testInfo,
              `${app.role}-sidebar-sheet-${viewport.label}`,
            );
            // From inside the sheet the same keys close it.
            await page.keyboard.press("Control+B");
            await expect(sheet).toBeHidden();
          }

          // With the palette open, Ctrl+B leaves the sidebar behind it alone.
          // Focus is in the palette's search box here.
          await page.keyboard.press("Control+K");
          await expect(palette).toBeVisible();
          await page.keyboard.press("Control+B");
          await nextFrames(page);
          await sidebarUnchanged();
          expect(await lastKey(page)).toEqual(leftToBrowser("b"));
          await page.keyboard.press("Escape");
          await expect(palette).toBeHidden();

          // The open shortcut list holds Ctrl+B too. Its focus is on its
          // Close button, not in a text field, so only the rule that an open
          // dialog pauses page shortcuts can stop the key.
          await page.keyboard.press("Shift+?");
          await expect(help).toBeVisible();
          await expect(
            help.getByRole("button", { name: "Close" }),
          ).toBeFocused();
          await page.keyboard.press("Control+B");
          await nextFrames(page);
          await sidebarUnchanged();
          await expect(help).toBeVisible();
          expect(await lastKey(page)).toEqual(leftToBrowser("b"));
          await page.keyboard.press("Escape");
          await expect(help).toBeHidden();

          // In a text field Ctrl+B is the field's, not the sidebar's.
          await addProbeField(page);
          await page.keyboard.press("Control+B");
          await nextFrames(page);
          await sidebarUnchanged();
          expect(await lastKey(page)).toEqual(leftToBrowser("b"));
        });
      } else {
        test(`Ctrl+B leaves the browser default alone without a sidebar at ${viewport.label}`, async ({
          page,
        }, testInfo) => {
          await openApp(page, app, viewport);
          await expect(page.locator('[data-slot="sidebar"]')).toHaveCount(0);
          await expect(
            page.locator('[aria-keyshortcuts="Control+B"]'),
          ).toHaveCount(0);
          const url = page.url();

          for (const where of ["page", "text field"] as const) {
            if (where === "page") await focusBody(page);
            else await addProbeField(page);
            await page.keyboard.press("Control+B");
            await nextFrames(page);
            expect(await lastKey(page), where).toEqual(leftToBrowser("b"));
            await expect(page.getByRole("dialog")).toHaveCount(0);
            expect(page.url()).toBe(url);
          }
          await snap(page, testInfo, `${app.role}-ctrl-b-${viewport.label}`);
        });
      }

      test(`Shift+? lists the shortcuts that work here at ${viewport.label}`, async ({
        page,
      }, testInfo) => {
        const trigger = await openApp(page, app, viewport);
        const help = page.getByRole("dialog", { name: "Keyboard shortcuts" });
        const palette = page.getByRole("dialog", { name: app.palette.dialog });

        // From the page, Shift+? opens the list; Shift+? again closes it.
        await focusBody(page);
        await page.keyboard.press("Shift+?");
        await expect(help).toBeVisible();
        const rows = await readHelpRows(help);
        await attachJson(testInfo, "shortcut-help-rows", rows);
        for (const row of rows) {
          expect(row.description, JSON.stringify(row)).not.toBe("");
          expect(row.spoken, JSON.stringify(row)).not.toBe("");
          expect(row.hint, JSON.stringify(row)).not.toBe("");
          expect(row).toMatchObject({
            hintHiddenFromAssistiveTechnology: true,
            hintVisible: true,
            spokenVisuallyHidden: true,
          });
        }
        // Exactly the shortcuts that work here: the palette, the sidebar
        // where the app has one, and the list itself.
        expect(rows.map((row) => row.description).sort()).toEqual(
          [
            app.palette.search,
            ...(app.sidebar ? ["Toggle sidebar"] : []),
            "Show keyboard shortcuts",
          ].sort(),
        );
        expect(rows).toEqual(
          expect.arrayContaining(
            [
              {
                description: app.palette.search,
                spoken: "Control+K",
                hint: hint("Ctrl+K"),
              },
              ...(app.sidebar
                ? [
                    {
                      description: "Toggle sidebar",
                      spoken: "Control+B",
                      hint: hint("Ctrl+B"),
                    },
                  ]
                : []),
              {
                description: "Show keyboard shortcuts",
                spoken: "Shift+?",
                hint: hint("Shift+?"),
              },
            ].map((row) => expect.objectContaining(row)),
          ),
        );
        await snap(
          page,
          testInfo,
          `${app.role}-shortcut-help-${viewport.label}`,
        );

        // The open list pauses page shortcuts. Focus is on its Close button,
        // not in a text field, and Ctrl+K opens no palette behind it.
        await expect(help.getByRole("button", { name: "Close" })).toBeFocused();
        await page.keyboard.press("Control+K");
        await nextFrames(page);
        await expect(palette).toBeHidden();
        await expect(help).toBeVisible();
        expect(await lastKey(page)).toEqual(leftToBrowser("k"));

        // Shift+? is the list's own key, so it still closes it.
        await page.keyboard.press("Shift+?");
        await expect(help).toBeHidden();
        await expect.poll(() => bodyHasFocus(page)).toBe(true);

        // Opened from the search button, Escape closes it back there.
        await trigger.focus();
        await page.keyboard.press("Shift+?");
        await expect(help).toBeVisible();
        await expectNoAxeViolations(page, OPEN_DIALOG);
        await page.keyboard.press("Escape");
        await expect(help).toBeHidden();
        await expect(trigger).toBeFocused();

        // UI SDK's dialog check finds only the accepted aria-modal deviation.
        // The check's Escape closes it.
        await page.keyboard.press("Shift+?");
        await expect(help).toBeVisible();
        expect(await checkPattern(page, OPEN_DIALOG, "dialog")).toEqual(
          MODAL_DIALOG_DEVIATION,
        );
        await expect(help).toBeHidden();

        // In a text field, ? is typed.
        const field = await addProbeField(page);
        await page.keyboard.press("Shift+?");
        await nextFrames(page);
        await expect(field).toHaveValue("?");
        await expect(help).toBeHidden();
      });
    }

    for (const reducedMotion of ["reduce", "no-preference"] as const) {
      test(`the account menu's Keyboard shortcuts item opens the list Shift+? shows from its trigger at ${DESKTOP.label} (motion: ${reducedMotion})`, async ({
        page,
      }, testInfo) => {
        await page.emulateMedia({ reducedMotion });
        await openApp(page, app, DESKTOP);
        const help = page.getByRole("dialog", { name: "Keyboard shortcuts" });
        const account = page.getByRole("button", { name: app.accountMenu });
        const descriptions = async () =>
          (await readHelpRows(help)).map((row) => row.description).sort();

        // What Shift+? lists from the menu's trigger.
        await account.focus();
        await page.keyboard.press("Shift+?");
        await expect(help).toBeVisible();
        const fromTrigger = await descriptions();
        expect(fromTrigger).toContain("Show keyboard shortcuts");
        await page.keyboard.press("Escape");
        await expect(help).toBeHidden();
        await expect(account).toBeFocused();

        // The menu item closes the menu and opens that same list.
        await account.click();
        const item = page.getByRole("menuitem", { name: /Keyboard shortcuts/ });
        await expect(item).toHaveAttribute("aria-keyshortcuts", "Shift+?");
        await item.click();
        await expect(page.getByRole("menu")).toHaveCount(0);
        await expect(help).toBeVisible();
        expect(await descriptions()).toEqual(fromTrigger);
        await snap(
          page,
          testInfo,
          `${app.role}-help-from-account-menu-${reducedMotion}`,
        );
        await page.keyboard.press("Escape");
        await expect(help).toBeHidden();
        await expect(account).toBeFocused();
      });
    }

    if (app.agentBridge) {
      test("WebMCP stand-in: the agent bridge offers snapshot, query and act under its allowlist, sees no Base UI control and cannot act on one", async ({
        page,
        context,
      }, testInfo) => {
        await context.addInitScript(installWebMcpStandIn);
        const trigger = await openApp(page, app, DESKTOP);
        await expect
          .poll(() => toolNames(page), { timeout: 120_000 })
          .toEqual(["act", "query", "snapshot"]);
        // The real shell mounted one deny-by-default allowlist: an agent may
        // only move items in Support's macro actions list.
        expect(await bridgeGrants(page)).toEqual([
          [
            {
              component: "sortable-list",
              label: "Macro actions",
              actions: ["move"],
            },
          ],
        ]);

        // The home renders no UI SDK-backed control, and the bridge mirrors
        // no Base UI or native one, like the search button or a sidebar link.
        await expect(trigger).toBeVisible();
        await expect(
          page.getByRole("link", { name: "CRM", exact: true }),
        ).toBeVisible();
        const snapshot = await callTool(page, "snapshot", {});
        await attachJson(testInfo, "snapshot", snapshot);
        expect(snapshot).toEqual({ result: [] });
        for (const text of [app.palette.trigger, "CRM"]) {
          expect(await callTool(page, "query", { text }), text).toEqual({
            result: [],
          });
        }

        // An agent cannot press the search button: the bridge reaches only
        // UI SDK components, so UI SDK's lookup refuses the step before any
        // allowlist is asked. The home renders no UI SDK control, so an
        // allowlist refusal cannot be shown here; the bridge's and the
        // shell's unit tests cover it.
        const url = page.url();
        const refused = await callTool(page, "act", {
          steps: [{ ref: app.palette.trigger, action: "press" }],
        });
        await attachJson(testInfo, "act", refused);
        expect(refused).toMatchObject({
          result: {
            ok: false,
            error: {
              step: 0,
              message: `No component "${app.palette.trigger}" on the page. Its labels: none.`,
            },
          },
        });
        await expect(
          page.getByRole("dialog", { name: app.palette.dialog }),
        ).toHaveCount(0);
        expect(page.url()).toBe(url);
        await snap(page, testInfo, `${app.role}-agent-bridge`);
      });

      test("WebMCP stand-in: Web Studio, served outside Mission Control's shell, mounts its own bridge granting only the column order", async ({
        page,
        context,
      }, testInfo) => {
        await context.addInitScript(installWebMcpStandIn);
        await openApp(page, app, DESKTOP);
        // Web Studio's routes render under the Payload layout, not the shell.
        await page.goto(new URL("/web-studio", app.baseURL).toString(), {
          waitUntil: "load",
          timeout: 180_000,
        });
        await expect
          .poll(() => toolNames(page), { timeout: 120_000 })
          .toEqual(["act", "query", "snapshot"]);
        expect(await bridgeGrants(page)).toEqual([
          [
            {
              component: "sortable-list",
              label: "Column order",
              actions: ["move"],
            },
          ],
        ]);
        // Nothing but a View menu's column order is UI SDK-backed here, and
        // the bridge mirrors no Base UI or native control.
        const snapshot = await callTool(page, "snapshot", {});
        await attachJson(testInfo, "web-studio-snapshot", snapshot);
        expect(snapshot).toEqual({ result: [] });
        await snap(page, testInfo, "web-studio-agent-bridge");
      });
    } else {
      test("WebMCP stand-in: no agent bridge registers tools", async ({
        page,
        context,
      }, testInfo) => {
        await context.addInitScript(installWebMcpStandIn);
        await openApp(page, app, DESKTOP);
        // The stand-in is in place, so a mounted bridge would register.
        expect(
          await page.evaluate(
            () =>
              typeof (
                document as Document & {
                  modelContext?: { registerTool?: unknown };
                }
              ).modelContext?.registerTool,
          ),
        ).toBe("function");
        // The shell's effects have run: its palette answers Ctrl+K.
        const dialog = page.getByRole("dialog", { name: app.palette.dialog });
        await focusBody(page);
        await page.keyboard.press("Control+K");
        await expect(dialog).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(dialog).toBeHidden();
        // A mounted bridge writes its allowlist to the document in its
        // effect, before it loads UI SDK's agent code. The shell's effects
        // have run (its palette answers), so no allowlist means no bridge;
        // tests/unit/packages/ui/ui-sdk-integration.test.ts pins that only
        // the Mission Control shell mounts one.
        expect(await bridgeGrants(page)).toBeNull();
        expect(await toolNames(page)).toEqual([]);
        await snap(page, testInfo, `${app.role}-no-agent-bridge`);
      });
    }
  });
}
