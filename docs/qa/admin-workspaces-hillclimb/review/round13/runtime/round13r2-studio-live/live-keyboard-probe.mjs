import { createRequire } from "node:module";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { evidenceRoot, gate, repoRoot, save, sha256 } from "./gate.mjs";

const require = createRequire(join(repoRoot, "package.json"));
const { chromium } = require("playwright-core");
const [probe, surface, device, action] = process.argv.slice(2);
if (
  !/^[a-z0-9-]+$/.test(probe ?? "") ||
  !["picker", "bulk", "final-records"].includes(surface) ||
  !["desktop", "mobile"].includes(device) ||
  !["tab", "escape", "inspect", "read"].includes(action)
)
  throw new Error("Invalid bounded probe");
const directory = join(evidenceRoot, probe);
mkdirSync(directory, { recursive: true });
const base = "http://localhost:3031";
const viewport =
  device === "mobile"
    ? { width: 390, height: 844 }
    : { width: 1440, height: 1000 };
const startedAtUtc = new Date().toISOString();
const started = performance.now();
writeFileSync(
  join(directory, "invocation-source.mjs"),
  readFileSync(fileURLToPath(import.meta.url)),
  { flag: "wx" },
);
const result = {
  probe,
  surface,
  device,
  action,
  base,
  viewport,
  startedAtUtc,
  sourceSha256: sha256(readFileSync(fileURLToPath(import.meta.url))),
  playwrightVersion: require("playwright-core/package.json").version,
  observations: [],
  steps: [],
  console: [],
  network: [],
  failures: [],
  safety: {
    routeMocks: false,
    bulkConfirmationActivated: false,
    blanketReset: false,
    authStateSaved: false,
    originalFixtureRecordsMutated: false,
  },
};
let browser;
let context;
let page;
let alarm;

const redact = (text) =>
  String(text)
    .replace(/(bearer\s+)[^\s"']+/gi, "$1[redacted]")
    .replace(
      /((?:token|password|authorization|cookie)["']?\s*[:=]\s*)[^\s,;}]+/gi,
      "$1[redacted]",
    );
const safeUrl = (url) => {
  try {
    const parsed = new URL(url);
    return { origin: parsed.origin, pathname: parsed.pathname };
  } catch {
    return { url: "unparseable" };
  }
};

async function step(name, operation) {
  const at = new Date().toISOString();
  const start = performance.now();
  try {
    const value = await operation();
    result.steps.push({
      name,
      startedAtUtc: at,
      endedAtUtc: new Date().toISOString(),
      elapsedMs: performance.now() - start,
      outcome: "completed",
    });
    return value;
  } catch (error) {
    result.steps.push({
      name,
      startedAtUtc: at,
      endedAtUtc: new Date().toISOString(),
      elapsedMs: performance.now() - start,
      outcome: "failed",
      error: redact(error.stack ?? error.message),
    });
    throw error;
  }
}

async function readRecord(path) {
  const start = performance.now();
  const response = await context.request.get(base + path, { timeout: 30000 });
  const text = await response.text();
  const body = JSON.parse(text);
  return {
    path,
    observedAtUtc: new Date().toISOString(),
    elapsedMs: performance.now() - start,
    status: response.status(),
    responseSha256: sha256(text),
    body,
  };
}

async function pageRecords() {
  const records = [];
  for (const id of [14, 15]) {
    for (const suffix of [
      `/${id}?depth=0`,
      `/${id}?depth=0&draft=true`,
      `/versions?where[parent][equals]=${id}&sort=-updatedAt&limit=100&depth=0`,
    ])
      records.push(await readRecord("/api/pages" + suffix));
  }
  return records;
}

async function observe(label, screenshot = false) {
  const observedAtUtc = new Date().toISOString();
  const state = await page.evaluate(() => {
    const visible = (element) =>
      Boolean(
        element &&
        element.getClientRects().length &&
        getComputedStyle(element).visibility !== "hidden" &&
        getComputedStyle(element).display !== "none",
      );
    const describe = (element) => {
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return {
        tag: element.tagName,
        id: element.id,
        role: element.getAttribute("role"),
        label: element.getAttribute("aria-label"),
        labelledBy: element.getAttribute("aria-labelledby"),
        text: (element.innerText ?? element.textContent ?? "")
          .trim()
          .slice(0, 240),
        type: element.getAttribute("type"),
        tabIndex: element.tabIndex,
        ariaModal: element.getAttribute("aria-modal"),
        expanded: element.getAttribute("aria-expanded"),
        controls: element.getAttribute("aria-controls"),
        value: element instanceof HTMLInputElement ? element.value : null,
        className:
          typeof element.className === "string" ? element.className : null,
        visible: visible(element),
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      };
    };
    let active = document.activeElement;
    while (active?.shadowRoot?.activeElement)
      active = active.shadowRoot.activeElement;
    const roleCandidates = [
      ...document.querySelectorAll(
        '[role="dialog"],[role="alertdialog"],dialog,[aria-modal],.modal-container,.modal,.popup',
      ),
    ].filter(visible);
    const heading = [...document.querySelectorAll("h1,h2,h3,h4")].find(
      (element) =>
        visible(element) && /confirm publish/i.test(element.textContent ?? ""),
    );
    const headingAncestors = [];
    for (
      let element = heading, depth = 0;
      element && depth < 7;
      element = element.parentElement, depth += 1
    )
      headingAncestors.push(describe(element));
    const bulkContainer =
      heading?.closest(
        '[role="dialog"],[role="alertdialog"],dialog,.modal-container,.modal',
      ) ?? null;
    const ancestorRoles = [];
    for (
      let element = active, depth = 0;
      element && depth < 7;
      element = element.parentElement, depth += 1
    )
      ancestorRoles.push(describe(element));
    return {
      url: location.href,
      title: document.title,
      viewport: { width: innerWidth, height: innerHeight, devicePixelRatio },
      documentHasFocus: document.hasFocus(),
      active: describe(active),
      activeAncestors: ancestorRoles,
      roles: roleCandidates.map((element) => ({
        ...describe(element),
        containsActive: element.contains(active),
        html: element.outerHTML.slice(0, 24000),
      })),
      picker: describe(document.getElementById("page-template")),
      bulkHeading: describe(heading),
      bulkHeadingAncestors: headingAncestors,
      bulkContainer: bulkContainer
        ? {
            ...describe(bulkContainer),
            containsActive: bulkContainer.contains(active),
            html: bulkContainer.outerHTML.slice(0, 30000),
          }
        : null,
      visibleButtons: [...document.querySelectorAll("button")]
        .filter(visible)
        .map(describe),
      checkedBoxes: [
        ...document.querySelectorAll(
          '[role="checkbox"][aria-checked="true"],input[type="checkbox"]:checked',
        ),
      ].map(describe),
    };
  });
  const snapshot = await page.locator("body").ariaSnapshot({ timeout: 15000 });
  writeFileSync(join(directory, `${label}.a11y.yaml`), snapshot, {
    flag: "wx",
  });
  const observation = {
    label,
    observedAtUtc,
    state,
    a11yPath: `${label}.a11y.yaml`,
    a11ySha256: sha256(snapshot),
  };
  if (screenshot) {
    const path = join(directory, `${label}.png`);
    await page.screenshot({
      path,
      fullPage: false,
      animations: "allow",
      caret: "initial",
      timeout: 15000,
    });
    observation.screenshotPath = `${label}.png`;
    observation.screenshotSha256 = sha256(readFileSync(path));
  }
  result.observations.push(observation);
  save(join(directory, `${label}.json`), observation);
  console.log(
    JSON.stringify({
      probe,
      label,
      active: state.active,
      pickerExpanded: state.picker?.expanded ?? null,
      visibleRoles: state.roles.map((entry) => ({
        role: entry.role,
        id: entry.id,
        containsActive: entry.containsActive,
      })),
      bulkHeadingVisible: state.bulkHeading?.visible ?? false,
      bulkContainsActive: state.bulkContainer?.containsActive ?? null,
    }),
  );
  return observation;
}

try {
  await gate(probe, "before");
  browser = await chromium.launch({ channel: "chrome", headless: true });
  result.browserVersion = browser.version();
  context = await browser.newContext({ viewport });
  await step("supported-local-demo-login", async () => {
    const response = await context.request.post(
      base + "/api/auth/demo-account",
      { data: { role: "admin" }, timeout: 30000 },
    );
    if (!response.ok())
      throw new Error(`Demo login returned ${response.status()}`);
    result.demoLoginStatus = response.status();
  });
  page = await context.newPage();
  page.setDefaultTimeout(20000);
  page.setDefaultNavigationTimeout(60000);
  page.on("console", (message) => {
    if (["error", "warning", "warn"].includes(message.type()))
      result.console.push({
        atUtc: new Date().toISOString(),
        type: message.type(),
        text: redact(message.text()),
      });
  });
  page.on("pageerror", (error) =>
    result.console.push({
      atUtc: new Date().toISOString(),
      type: "pageerror",
      text: redact(error.stack ?? error.message),
    }),
  );
  page.on("response", (response) =>
    result.network.push({
      atUtc: new Date().toISOString(),
      ...safeUrl(response.url()),
      method: response.request().method(),
      resourceType: response.request().resourceType(),
      status: response.status(),
    }),
  );
  page.on("requestfailed", (request) =>
    result.network.push({
      atUtc: new Date().toISOString(),
      ...safeUrl(request.url()),
      method: request.method(),
      resourceType: request.resourceType(),
      failure: redact(request.failure()?.errorText),
    }),
  );
  alarm = setTimeout(() => {
    result.failures.push({
      atUtc: new Date().toISOString(),
      error: "180000ms browser probe bound reached",
    });
    void browser.close();
  }, 180000);
  if (surface === "final-records") {
    result.records = [
      await readRecord("/api/pages?limit=100&depth=0&sort=-id"),
      await readRecord("/api/pages?limit=100&depth=0&draft=true&sort=-id"),
      await readRecord("/api/pages/108?depth=0"),
      await readRecord(
        "/api/pages/versions?where[parent][equals]=108&sort=-updatedAt&limit=100&depth=0",
      ),
    ];
    save(join(directory, "actual-records.json"), result.records);
    if (action === "inspect") {
      await step("navigate-owned-published-record-read-only", () =>
        page.goto(base + "/web-studio/collections/pages/108", {
          waitUntil: "domcontentloaded",
        }),
      );
      await page
        .getByRole("link", { name: "View live page", exact: true })
        .first()
        .waitFor({ state: "visible" });
      await observe("00-owned-final-published", true);
    }
  } else {
    if (surface === "bulk") {
      result.beforeRecords = await pageRecords();
      save(join(directory, "before-records.json"), result.beforeRecords);
    }
    await step("navigate-fresh-installed-route", () =>
      page.goto(
        base +
          (surface === "picker"
            ? "/web-studio/pages/new-from-template"
            : "/web-studio/collections/pages"),
        { waitUntil: "domcontentloaded" },
      ),
    );
    if (surface === "picker") {
      await step("wait-template-trigger", () =>
        page
          .getByRole("combobox", { name: "Template", exact: true })
          .waitFor({ state: "visible" }),
      );
    } else {
      await step("wait-bulk-targets", () =>
        page
          .getByRole("checkbox", {
            name: "Select Year-End Giving",
            exact: true,
          })
          .waitFor({ state: "visible" }),
      );
    }
    await observe("00-fresh-closed", true);
    if (surface === "picker") {
      await step("open-template-picker", () =>
        page.getByRole("combobox", { name: "Template", exact: true }).click(),
      );
      await page
        .getByRole("combobox", { name: "Search template", exact: true })
        .waitFor({ state: "visible", timeout: 10000 });
    } else {
      for (const title of ["Year-End Giving", "Kenya School Build"])
        await step(`select-${title}`, () =>
          page
            .getByRole("checkbox", { name: `Select ${title}`, exact: true })
            .click(),
        );
      await step("open-bulk-publish-confirmation-only", () =>
        page
          .getByRole("toolbar", { name: "Selected record actions" })
          .getByRole("button", { name: /^Publish/ })
          .click(),
      );
      await page
        .getByRole("heading", { name: "Confirm publish", exact: true })
        .waitFor({ state: "visible", timeout: 10000 });
    }
    await observe("01-open", true);
    if (action === "tab") {
      for (let index = 1; index <= 12; index += 1) {
        await step(`native-Tab-${index}`, () => page.keyboard.press("Tab"));
        await observe(
          `02-tab-${String(index).padStart(2, "0")}`,
          [1, 2, 3, 6, 12].includes(index),
        );
      }
      for (let index = 1; index <= 4; index += 1) {
        await step(`native-Shift-Tab-${index}`, () =>
          page.keyboard.press("Shift+Tab"),
        );
        await observe(
          `03-shift-tab-${String(index).padStart(2, "0")}`,
          [1, 4].includes(index),
        );
      }
    } else if (action === "escape") {
      await step("native-Escape-fresh-open-state", () =>
        page.keyboard.press("Escape"),
      );
      await observe("02-escape-immediate", true);
      await page.waitForTimeout(350);
      await observe("03-escape-settled", true);
    }
    if (surface === "bulk") {
      result.afterRecords = await pageRecords();
      save(join(directory, "after-records.json"), result.afterRecords);
      result.recordPreservation = result.beforeRecords.map((entry, index) => ({
        path: entry.path,
        beforeStatus: entry.status,
        afterStatus: result.afterRecords[index].status,
        beforeBodySha256: sha256(JSON.stringify(entry.body)),
        afterBodySha256: sha256(
          JSON.stringify(result.afterRecords[index].body),
        ),
        unchanged:
          JSON.stringify(entry.body) ===
          JSON.stringify(result.afterRecords[index].body),
      }));
      if (result.recordPreservation.some((entry) => !entry.unchanged))
        throw new Error(
          "Bulk confirmation-only probe detected original-record drift",
        );
    }
  }
  result.outcome = "completed";
} catch (error) {
  result.outcome = "failed";
  result.failures.push({
    atUtc: new Date().toISOString(),
    error: redact(error.stack ?? error.message),
  });
  if (page && !page.isClosed())
    await observe("failure-state", true).catch((captureError) =>
      result.failures.push({ error: redact(captureError.message) }),
    );
  process.exitCode = 1;
} finally {
  clearTimeout(alarm);
  await browser
    ?.close()
    .catch((error) => result.failures.push({ error: redact(error.message) }));
  result.endedAtUtc = new Date().toISOString();
  result.elapsedMs = performance.now() - started;
  save(join(directory, "probe-result.json"), result);
  try {
    await gate(probe, "after");
  } catch (error) {
    save(join(directory, "after-gate-failure.json"), {
      atUtc: new Date().toISOString(),
      error: redact(error.stack ?? error.message),
    });
    process.exitCode = 1;
  }
  console.log(
    JSON.stringify({
      probe,
      outcome: result.outcome,
      observations: result.observations.length,
      failures: result.failures,
      elapsedMs: result.elapsedMs,
    }),
  );
}
