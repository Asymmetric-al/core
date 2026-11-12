import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright-core";
import {
  fixtureBundle,
  harnessRoot,
  outputRoot,
  prepared,
  sha256,
} from "./preflight-inspect.mjs";

const { installApiFixtures } = await import(
  pathToFileURL(join(harnessRoot, "fixtures/route-fixtures.mjs"))
);
const { installModuleFixtures } = await import(
  pathToFileURL(join(harnessRoot, "fixtures/module-fixtures.mjs"))
);
const { installStudioFixtures } = await import(
  pathToFileURL(join(harnessRoot, "studio-fixtures.mjs"))
);
const { createStates, setCurrentState, missingSetups, bounded } = await import(
  pathToFileURL(join(harnessRoot, "workspace-states.mjs"))
);
const mode = process.argv[2] ?? "inspect";
const destination = join(outputRoot, process.argv[3] ?? mode);
const scriptSha256 = sha256(readFileSync(new URL(import.meta.url)));
mkdirSync(destination, { recursive: true });
writeFileSync(
  join(destination, "fixture-proof.json"),
  JSON.stringify(prepared.proof, null, 2),
);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];
const contexts = new Set();
let activeEvidence;
const startedAt = new Date().toISOString();
const base = "http://localhost:3031";
const watchdog = setTimeout(async () => {
  save({ timeout: true });
  await bounded(browser.close(), 10000, "owned browser close");
  process.exit(2);
}, 540000);
const dimensions = [
  { width: 1440, height: 1000 },
  { width: 1024, height: 900 },
  { width: 640, height: 900 },
  { width: 390, height: 844 },
];
const meta = fixtureBundle.captureMeta;
const details =
  fixtureBundle.details[
    "GET /api/admin/contribution-operations/:contributionId"
  ];
const recordDetails =
  fixtureBundle.details["GET /api/admin/crm/records/:recordId"];
function save(extra = {}) {
  writeFileSync(
    join(destination, "results.json"),
    JSON.stringify(
      {
        mode,
        startedAt,
        finishedAt: new Date().toISOString(),
        base,
        fixtureSha256: prepared.proof.bundleSha256,
        scriptSha256,
        results,
        missingSetups,
        boundary:
          "Isolated local fixture evidence; no provider/auth/tenant success or visual score",
        ...extra,
      },
      null,
      2,
    ),
  );
}
async function scenario(name, work) {
  if (
    process.env.PROBE_FILTER &&
    !new RegExp(process.env.PROBE_FILTER).test(name)
  )
    return;
  const record = { name, started: new Date().toISOString() };
  results.push(record);
  console.log(`START ${name}`);
  try {
    await work(record);
    record.status = "observed";
  } catch (error) {
    record.status = "failed-or-partial";
    record.error = error.stack;
    console.error(`${name}: ${error.message}`);
    if (activeEvidence) {
      const { page, traffic, guard, consoleErrors } = activeEvidence;
      record.failureEvidence = {
        url: page.url(),
        traffic,
        guard,
        consoleErrors,
      };
      record.failureEvidence.body = await page
        .locator("body")
        .innerText({ timeout: 5000 })
        .catch(() => "unavailable");
      await page
        .screenshot({
          path: join(destination, `${name}-failure.png`),
          animations: "disabled",
          timeout: 5000,
        })
        .catch(() => {});
    }
  } finally {
    record.finished = new Date().toISOString();
    save();
    for (const context of contexts)
      await bounded(context.close(), 8000, "owned context close");
    contexts.clear();
    activeEvidence = undefined;
  }
}
async function open(viewport, route, options = {}) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    colorScheme: "light",
    reducedMotion: "reduce",
  });
  contexts.add(context);
  const auth = await context.request.post(`${base}/api/auth/demo-account`, {
    data: { role: "admin" },
    timeout: 25000,
  });
  if (!auth.ok())
    throw new Error(`Explicit admin fixture auth failed: ${auth.status()}`);
  const guard = [];
  await context.route("**/api/**", async (intercept) => {
    const request = intercept.request();
    const address = new URL(request.url());
    guard.push({
      method: request.method(),
      path: address.pathname,
      blocked: true,
    });
    await intercept.fulfill({
      status: 503,
      json: { error: "Unmocked API blocked by money-browser evidence guard" },
    });
  });
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  const traffic = [];
  const consoleErrors = [];
  activeEvidence = { page, traffic, guard, consoleErrors };
  page.on("request", (request) => {
    const address = new URL(request.url());
    if (address.pathname.startsWith("/api/"))
      traffic.push({
        method: request.method(),
        path: address.pathname + address.search,
      });
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  const fixture = await installApiFixtures(page, {
    bundle: fixtureBundle,
    contributionsDefaultLimit: options.limit ?? 50,
  });
  if (options.subset) fixture.state.contributions = options.subset;
  await installModuleFixtures(page, { scenario: "populated" });
  if (options.lookups) await installStudioFixtures(page);
  if (options.routes) await options.routes(page);
  await page.goto(base + route, { waitUntil: "commit", timeout: 45000 });
  await page.locator("body").waitFor({ state: "attached", timeout: 25000 });
  await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  return { page, context, fixture, traffic, guard, consoleErrors };
}
async function frames(page) {
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}
async function screenshot(page, name, locator) {
  const file = `${name}.png`;
  if (locator)
    await locator.screenshot({
      path: join(destination, file),
      animations: "disabled",
      timeout: 18000,
    });
  else
    await page.screenshot({
      path: join(destination, file),
      animations: "disabled",
      timeout: 18000,
    });
  return file;
}
async function snapshot(page, name) {
  writeFileSync(
    join(destination, `${name}.txt`),
    await page.locator("body").ariaSnapshot(),
  );
}
async function pageMetrics(page) {
  return page.evaluate(() => ({
    viewport: { width: innerWidth, height: innerHeight },
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    horizontalOverflow:
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
    headings: [...document.querySelectorAll("h1,h2,h3")]
      .filter((element) => element.getClientRects().length)
      .map((element) => element.innerText),
    routeErrors: [...document.querySelectorAll("h1,h2")]
      .filter((element) =>
        /Something went wrong|Application error/i.test(element.textContent),
      )
      .map((element) => element.textContent),
  }));
}
async function operationMetrics(shell) {
  return shell.evaluate((dialog) => {
    const rect = (element) => {
      if (!element) return null;
      const box = element.getBoundingClientRect();
      return {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        top: box.top,
        bottom: box.bottom,
        right: box.right,
      };
    };
    const heading = dialog.querySelector(
      '[data-slot="operation-dialog-header"]',
    );
    const summary = dialog.querySelector("fieldset dl");
    const footer = dialog.querySelector('[data-slot="operation-form-actions"]');
    const headerBox = rect(heading);
    const summaryBox = rect(summary);
    const summaryText = summary
      ? [...summary.querySelectorAll("dt,dd")].map((element) => ({
          text: element.textContent,
          ...rect(element),
        }))
      : [];
    return {
      scrollTop: dialog.scrollTop,
      scrollHeight: dialog.scrollHeight,
      clientHeight: dialog.clientHeight,
      dialog: rect(dialog),
      heading: headerBox,
      summary: summaryBox,
      footer: rect(footer),
      summaryFullyBelowHeading: Boolean(
        summaryBox && headerBox && summaryBox.top >= headerBox.bottom - 1,
      ),
      summaryFullyInsideDialog: Boolean(
        summaryBox &&
        summaryBox.bottom <= dialog.getBoundingClientRect().bottom,
      ),
      summaryText,
      summaryTextFullyBelowHeading: Boolean(
        headerBox &&
        summaryText.length &&
        summaryText.every((element) => element.top >= headerBox.bottom),
      ),
      activeElement: {
        tag: document.activeElement?.tagName,
        name: document.activeElement?.getAttribute("aria-label"),
        isDialog: document.activeElement === dialog,
        text: document.activeElement?.textContent?.slice(0, 100),
      },
      text: dialog.innerText,
    };
  });
}
async function runMoney() {
  const record = recordDetails[meta.crmDrawerId];
  writeFileSync(
    join(destination, "crm-fixture-record.json"),
    JSON.stringify(
      {
        id: meta.crmDrawerId,
        keys: Object.keys(record),
        giftHistory: record.giftHistory,
      },
      null,
      2,
    ),
  );
  const eligibleGift = record.giftHistory.find((gift) =>
    details[gift.id ?? gift.shared.donationId]?.actionAvailability.some(
      (entry) => entry.actionType === "fund_correction" && entry.available,
    ),
  );
  for (const viewport of [dimensions[0], dimensions[3]]) {
    for (const cache of ["async", "cached"])
      await scenario(`receipt-${cache}-${viewport.width}`, async (result) => {
        let release;
        let detailRequests = 0;
        const gate = new Promise((resolve) => {
          release = resolve;
        });
        const opened = await open(viewport, `/crm?donor=${meta.crmDrawerId}`, {
          routes: async (page) =>
            page.route(
              /\/api\/admin\/contribution-operations\/(?!actions)/,
              async (intercept) => {
                detailRequests += 1;
                if (cache === "async") await gate;
                await intercept.fallback();
              },
            ),
        });
        const { page } = opened;
        const trigger = page
          .getByRole("button", { name: /^Resend receipt/ })
          .first();
        await trigger.waitFor({ state: "visible" });
        await trigger.click();
        const shell = page.getByTestId("contribution-operation-shell");
        await shell.waitFor({ state: "visible" });
        if (cache === "async") {
          result.loading = await operationMetrics(shell);
          result.loadingScreenshot = await screenshot(
            page,
            `receipt-${cache}-${viewport.width}-loading`,
          );
          release();
        }
        await shell
          .getByText("Current amount", { exact: true })
          .waitFor({ state: "visible" });
        await frames(page);
        result.firstOpen = await operationMetrics(shell);
        if (cache === "cached") {
          const before = detailRequests;
          await shell
            .getByRole("button", { name: "Close", exact: true })
            .click();
          await shell.waitFor({ state: "hidden" });
          await trigger.click();
          await shell
            .getByText("Current amount", { exact: true })
            .waitFor({ state: "visible" });
          await frames(page);
          result.cachedReopen = await operationMetrics(shell);
          result.requestsBeforeReopen = before;
          result.requestsAfterReopen = detailRequests;
        }
        result.screenshot = await screenshot(
          page,
          `receipt-${cache}-${viewport.width}`,
        );
        result.page = await pageMetrics(page);
        result.traffic = opened.traffic;
        result.guard = opened.guard;
        result.missing = opened.fixture.missing;
        result.moneyWrites = opened.traffic.filter(
          (request) =>
            request.method !== "GET" &&
            /contribution|receipt|refund/.test(request.path),
        );
        result.consoleErrors = opened.consoleErrors;
        await snapshot(page, `receipt-${cache}-${viewport.width}`);
      });
    await scenario(`eligible-fund-${viewport.width}`, async (result) => {
      if (!eligibleGift)
        throw new Error("No verified eligible CRM fixture gift");
      const giftId = eligibleGift.id ?? eligibleGift.shared.donationId;
      const detail = details[giftId];
      result.anchor = {
        id: giftId,
        donor: detail.donor,
        shared: detail.shared,
        payment: detail.payment,
        stagedGift: detail.stagedGift,
        serviceAvailability: detail.actionAvailability.find(
          (entry) => entry.actionType === "fund_correction",
        ),
        crmInlineActions: eligibleGift.inlineActions ?? eligibleGift.actions,
      };
      const opened = await open(viewport, `/crm?donor=${meta.crmDrawerId}`, {
        lookups: true,
      });
      const { page } = opened;
      await page
        .getByRole("button", { name: /^Resend receipt/ })
        .first()
        .waitFor({ state: "visible" });
      const history = page
        .getByRole("heading", { name: "Gift history", exact: true })
        .locator("..")
        .locator("..")
        .locator("..");
      const rows = history.locator("li").filter({
        has: page.getByRole("button", {
          name: /^(More actions for|More gift actions)/,
        }),
      });
      const anchorIndex = record.giftHistory.findIndex(
        (gift) => (gift.id ?? gift.shared.donationId) === giftId,
      );
      result.fixtureGiftIndex = anchorIndex;
      result.visibleMenuCount = await page
        .getByRole("button", { name: /^(More actions for|More gift actions)/ })
        .count();
      const menuTrigger = page
        .getByRole("button", { name: /^(More actions for|More gift actions)/ })
        .nth(anchorIndex);
      result.menuTriggerLabel = await menuTrigger.getAttribute("aria-label");
      result.giftRows = await page
        .locator("li")
        .filter({
          has: page.getByRole("button", {
            name: /^(More actions for|More gift actions)/,
          }),
        })
        .evaluateAll((elements) =>
          elements.map((element) => {
            const box = (node) => {
              const value = node.getBoundingClientRect();
              return {
                x: value.x,
                y: value.y,
                width: value.width,
                height: value.height,
                right: value.right,
                bottom: value.bottom,
              };
            };
            return {
              ...box(element),
              text: element.innerText,
              controls: [...element.querySelectorAll("button")].map(
                (button) => ({
                  ...box(button),
                  name: button.getAttribute("aria-label") ?? button.textContent,
                }),
              ),
            };
          }),
        );
      await menuTrigger.click();
      result.menuScreenshot = await screenshot(
        page,
        `gift-menu-${viewport.width}`,
      );
      result.menu = await page.getByRole("menu").last().innerText();
      result.menuBounds = await page.getByRole("menu").last().boundingBox();
      const action = page.getByRole("menuitem", {
        name: "Correct fund designation",
        exact: true,
      });
      if (
        !(await action.isVisible().catch(() => false)) ||
        !(await action.isEnabled())
      ) {
        result.triggerMissing = true;
        await snapshot(page, `fund-trigger-missing-${viewport.width}`);
        throw new Error(
          "Correct fund designation trigger absent or disabled; no form captured",
        );
      }
      await action.click();
      const shell = page.getByTestId("contribution-operation-shell");
      await shell
        .getByRole("heading", { name: "Correct fund designation", exact: true })
        .waitFor({ state: "visible" });
      await shell
        .getByText("Current amount", { exact: true })
        .waitFor({ state: "visible" });
      await frames(page);
      result.form = await operationMetrics(shell);
      result.screenshot = await screenshot(
        page,
        `eligible-fund-${viewport.width}`,
      );
      result.fields = await shell
        .locator("input,textarea,[role=combobox],[role=checkbox]")
        .evaluateAll((elements) =>
          elements.map((element) => ({
            tag: element.tagName,
            label: element.getAttribute("aria-label"),
            id: element.id,
            role: element.getAttribute("role"),
            disabled: element.disabled,
          })),
        );
      await page.keyboard.press("Tab");
      result.afterTab = await operationMetrics(shell);
      result.page = await pageMetrics(page);
      result.traffic = opened.traffic;
      result.guard = opened.guard;
      result.missing = opened.fixture.missing;
      result.moneyWrites = opened.traffic.filter(
        (request) =>
          request.method !== "GET" &&
          /contribution|receipt|refund/.test(request.path),
      );
      await snapshot(page, `eligible-fund-${viewport.width}`);
    });
    await scenario(`long-note-${viewport.width}`, async (result) => {
      const opened = await open(viewport, "/crm/notes");
      const { page } = opened;
      await page
        .getByText(meta.crmFirstNoteTitle, { exact: true })
        .first()
        .waitFor({ state: "visible" });
      const state = createStates(meta).find(
        (entry) => entry.name === "crm-note-long",
      );
      setCurrentState(state.name);
      await state.setup(page);
      const dialog = page.getByRole("dialog", {
        name: "Year-end call notes",
        exact: true,
      });
      await dialog.waitFor({ state: "visible" });
      await frames(page);
      result.top = await dialog.evaluate((element) => ({
        scrollTop: element.scrollTop,
        scrollHeight: element.scrollHeight,
        clientHeight: element.clientHeight,
        header: element.querySelector('[data-slot="crm-note-dialog-header"]')
          ?.innerText,
        bodyLength: element.querySelector("p.whitespace-pre-wrap")?.textContent
          .length,
        headerTop: element
          .querySelector('[data-slot="crm-note-dialog-header"]')
          ?.getBoundingClientRect().top,
      }));
      result.topScreenshot = await screenshot(
        page,
        `long-note-${viewport.width}-top`,
      );
      await dialog.evaluate((element) => {
        element.scrollTop = element.scrollHeight;
      });
      await frames(page);
      result.bottom = await dialog.evaluate((element) => ({
        scrollTop: element.scrollTop,
        headerTop: element
          .querySelector('[data-slot="crm-note-dialog-header"]')
          ?.getBoundingClientRect().top,
        footer: element.querySelector('[data-slot="crm-note-dialog-footer"]')
          ?.innerText,
        header: element.querySelector('[data-slot="crm-note-dialog-header"]')
          ?.innerText,
      }));
      result.bottomScreenshot = await screenshot(
        page,
        `long-note-${viewport.width}-bottom`,
      );
      result.page = await pageMetrics(page);
      result.traffic = opened.traffic;
      result.guard = opened.guard;
      result.missing = opened.fixture.missing;
      result.createdNotes = opened.fixture.state.createdCount;
    });
  }
}
async function reportState(page, traffic) {
  await frames(page);
  return {
    url: page.url(),
    history: await page.evaluate(() => history.length),
    metrics: await pageMetrics(page),
    params: Object.fromEntries(new URL(page.url()).searchParams),
    group: await page
      .getByRole("group", { name: "Group by" })
      .ariaSnapshot()
      .catch(() => null),
    period: await page.getByRole("combobox", { name: "Period" }).innerText(),
    controls: await page
      .getByRole("button")
      .filter({ hasText: /^(Fund|Donor|Missionary)$/ })
      .evaluateAll((elements) =>
        elements.map((element) => {
          const box = element.getBoundingClientRect();
          return {
            text: element.textContent,
            pressed: element.getAttribute("aria-pressed"),
            x: box.x,
            y: box.y,
            width: box.width,
            height: box.height,
            right: box.right,
          };
        }),
      ),
    requests: traffic.filter((request) => /crm\/reports/.test(request.path)),
    headings: await page.getByRole("heading").allTextContents(),
  };
}
async function runReports() {
  for (const viewport of [dimensions[0], dimensions[3]])
    await scenario(`reports-${viewport.width}`, async (result) => {
      const opened = await open(
        viewport,
        "/reports?group=donors&period=90d&probe=round13&keep=two",
      );
      const { page } = opened;
      await page
        .getByRole("combobox", { name: "Period" })
        .waitFor({ state: "visible" });
      await page
        .getByText("Last 90 days", { exact: true })
        .first()
        .waitFor({ state: "visible" });
      await page
        .getByRole("heading", { name: /Funds|Donors|Top donors/ })
        .first()
        .waitFor({ state: "visible" })
        .catch(() => {});
      result.initial = await reportState(page, opened.traffic);
      result.initialScreenshot = await screenshot(
        page,
        `reports-${viewport.width}-donors-90d`,
      );
      await page.reload({ waitUntil: "commit", timeout: 35000 });
      await page
        .getByRole("combobox", { name: "Period" })
        .waitFor({ state: "visible" });
      result.reload = await reportState(page, opened.traffic);
      await page
        .getByRole("button", { name: "Missionary", exact: true })
        .click();
      await page.waitForURL(
        (url) => url.searchParams.get("group") === "missionaries",
        { timeout: 10000 },
      );
      await page.getByRole("combobox", { name: "Period" }).click();
      await page
        .getByRole("option", { name: "Last 30 days", exact: true })
        .click();
      await page.waitForURL((url) => url.searchParams.get("period") === "30d", {
        timeout: 10000,
      });
      result.selected = await reportState(page, opened.traffic);
      await page.reload({ waitUntil: "commit", timeout: 35000 });
      await page
        .getByRole("combobox", { name: "Period" })
        .waitFor({ state: "visible" });
      result.selectedReload = await reportState(page, opened.traffic);
      result.selectedScreenshot = await screenshot(
        page,
        `reports-${viewport.width}-missionaries-30d`,
      );
      await page.screenshot({
        path: join(
          destination,
          `reports-${viewport.width}-missionaries-30d-full.png`,
        ),
        fullPage: true,
        animations: "disabled",
      });
      await page.getByRole("button", { name: "Fund", exact: true }).click();
      await page.waitForURL(
        (url) =>
          !url.searchParams.has("group") ||
          url.searchParams.get("group") === "funds",
        { timeout: 10000 },
      );
      await page
        .getByRole("heading", { name: "Funds", exact: true })
        .waitFor({ state: "visible" });
      result.fundsSelected = await reportState(page, opened.traffic);
      result.fundsScreenshot = await screenshot(
        page,
        `reports-${viewport.width}-funds-30d`,
      );
      await page.screenshot({
        path: join(destination, `reports-${viewport.width}-funds-30d-full.png`),
        fullPage: true,
        animations: "disabled",
      });
      result.fundsTrendOrder = await page.locator("body").evaluate((body) => {
        const fundHeading = body.querySelector("#report-funds");
        const headings = [...body.querySelectorAll("h1,h2,h3")];
        const trendHeading = headings.find((heading) =>
          /giving trend/i.test(heading.textContent),
        );
        const box = (element) =>
          element
            ? {
                top: element.getBoundingClientRect().top + scrollY,
                height: element.getBoundingClientRect().height,
                text: element.textContent,
              }
            : null;
        return {
          fund: box(fundHeading),
          trend: box(trendHeading),
          fundsBeforeTrend: Boolean(
            fundHeading &&
            trendHeading &&
            fundHeading.compareDocumentPosition(trendHeading) &
              Node.DOCUMENT_POSITION_FOLLOWING,
          ),
          text: body.innerText.slice(-5000),
        };
      });
      const storedUrl = page.url();
      await page.goto(base + "/contributions?probe=history-neighbor", {
        waitUntil: "commit",
        timeout: 35000,
      });
      await page.goBack({ waitUntil: "commit", timeout: 35000 });
      result.backToReports = { expected: storedUrl, actual: page.url() };
      await page.goForward({ waitUntil: "commit", timeout: 35000 });
      result.forward = page.url();
      result.guard = opened.guard;
      result.missing = opened.fixture.missing;
      result.traffic = opened.traffic;
      result.consoleErrors = opened.consoleErrors;
    });
}
async function runCards() {
  for (const count of [6, 10, 1, 2, 4, 5, 7])
    for (const viewport of dimensions)
      await scenario(`cards-${count}-${viewport.width}`, async (result) => {
        const subset = [6, 10].includes(count)
          ? undefined
          : fixtureBundle.datasets.contributions.slice(0, count);
        const opened = await open(viewport, "/contributions", {
          limit: count,
          subset,
        });
        const { page } = opened;
        await page
          .getByRole("button", { name: "Card view", exact: true })
          .waitFor({ state: "visible" });
        await page
          .getByRole("button", { name: "Card view", exact: true })
          .click();
        const rows = page.locator('[data-slot="data-grid-panel-row"]:visible');
        await rows.first().waitFor({ state: "visible" });
        await page.waitForFunction(
          (expected) =>
            document.querySelectorAll('[data-slot="data-grid-panel-row"]')
              .length === expected,
          count,
          { timeout: 10000 },
        );
        result.subsetMode = subset
          ? "Current typed rows filtered in memory before existing route fixture; no schema/data fabrication"
          : `Existing route fixture default limit ${count}`;
        result.actualInput = (
          subset ?? fixtureBundle.datasets.contributions.slice(0, count)
        ).map((row) => ({
          id: row.id,
          donorName: row.donorName,
          amount: row.shared.amountCents,
          receipt: row.shared.receiptStatus,
          status: row.shared.paymentStatus,
        }));
        const list = rows.first().locator("..");
        await rows.first().scrollIntoViewIfNeeded();
        await frames(page);
        result.layout = await list.evaluate((element) => {
          const cards = [
            ...element.querySelectorAll('[data-slot="data-grid-panel-row"]'),
          ];
          const box = (node) => {
            const rect = node.getBoundingClientRect();
            return {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
              right: rect.right,
              bottom: rect.bottom,
            };
          };
          return {
            list: box(element),
            columns: getComputedStyle(element).gridTemplateColumns,
            gap: getComputedStyle(element).gap,
            cards: cards.map((card) => ({
              ...box(card),
              span: getComputedStyle(card).gridColumn,
              text: card.innerText,
              controls: [...card.querySelectorAll("button,input")].map(
                (control) => ({
                  name:
                    control.getAttribute("aria-label") ?? control.textContent,
                  ...box(control),
                }),
              ),
            })),
          };
        });
        result.metrics = await pageMetrics(page);
        result.screenshot = await screenshot(
          page,
          `cards-${count}-${viewport.width}`,
        );
        result.gridScreenshot = await screenshot(
          page,
          `cards-${count}-${viewport.width}-grid`,
          list,
        );
        if ([6, 10].includes(count) && [1440, 390].includes(viewport.width)) {
          const tableToggle = page.getByRole("button", {
            name: "Table view",
            exact: true,
          });
          await tableToggle.focus();
          await page.keyboard.press("Space");
          await frames(page);
          result.tableAfterSpace =
            await tableToggle.getAttribute("aria-pressed");
          const cardToggle = page.getByRole("button", {
            name: "Card view",
            exact: true,
          });
          await cardToggle.focus();
          await page.keyboard.press("Space");
          await rows.first().waitFor({ state: "visible" });
          const checkbox = rows.first().getByRole("checkbox").first();
          await checkbox.focus();
          await page.keyboard.press("Space");
          await frames(page);
          result.selection = {
            checked: await checkbox.getAttribute("aria-checked"),
            text: await page.getByText(/selected/i).allTextContents(),
          };
          const receipts = page
            .getByRole("button", { name: /Send receipts|Resend receipts/i })
            .first();
          if (await receipts.isVisible().catch(() => false)) {
            await receipts.focus();
            await page.keyboard.press("Enter");
            const dialog = page.getByRole("dialog").last();
            await dialog.waitFor({ state: "visible" });
            result.receiptConfirmation = await dialog.innerText();
            result.receiptScreenshot = await screenshot(
              page,
              `cards-${count}-${viewport.width}-receipt-confirmation`,
            );
            await page.keyboard.press("Escape");
          }
          result.keyboardScreenshot = await screenshot(
            page,
            `cards-${count}-${viewport.width}-selection`,
          );
        }
        if (count === 10 && viewport.width === 1440) {
          const search = page.getByRole("searchbox", {
            name: "Search contributions",
          });
          await search.fill("Theodore");
          await page.waitForFunction(
            () =>
              document.querySelectorAll('[data-slot="data-grid-panel-row"]')
                .length === 1,
            undefined,
            { timeout: 10000 },
          );
          result.actualSearchResult = await rows.allTextContents();
          result.actualSearchScreenshot = await screenshot(
            page,
            "cards-10-1440-actual-search",
          );
        }
        result.moneyWrites = opened.traffic.filter(
          (request) =>
            request.method !== "GET" &&
            /contribution|receipt|refund/.test(request.path),
        );
        result.guard = opened.guard;
        result.missing = opened.fixture.missing;
        result.traffic = opened.traffic;
        result.consoleErrors = opened.consoleErrors;
      });
}
try {
  if (mode === "money") await runMoney();
  else if (mode === "reports") await runReports();
  else if (mode === "cards") await runCards();
  else
    await scenario("inspect-crm", async (result) => {
      const opened = await open(
        dimensions[0],
        `/crm?donor=${meta.crmDrawerId}`,
      );
      await opened.page
        .getByRole("button", { name: /^Resend receipt/ })
        .first()
        .waitFor({ state: "visible" });
      await snapshot(opened.page, "crm");
      result.gifts = recordDetails[meta.crmDrawerId].giftHistory;
      result.screenshot = await screenshot(opened.page, "crm");
    });
} finally {
  clearTimeout(watchdog);
  save();
  await bounded(browser.close(), 12000, "owned browser close");
}
process.exit(results.some((result) => result.status !== "observed") ? 1 : 0);
