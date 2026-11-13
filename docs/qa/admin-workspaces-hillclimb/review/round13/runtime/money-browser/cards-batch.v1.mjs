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
const { bounded } = await import(
  pathToFileURL(join(harnessRoot, "workspace-states.mjs"))
);
const destination = join(outputRoot, process.argv[2] ?? "cards-batch");
mkdirSync(destination, { recursive: true });
writeFileSync(
  join(destination, "fixture-proof.json"),
  JSON.stringify(prepared.proof, null, 2),
);
const scriptSha256 = sha256(readFileSync(new URL(import.meta.url)));
const base = "http://localhost:3031";
const counts = (process.env.CARD_COUNTS ?? "6,10,1,2,4,5,7")
  .split(",")
  .map(Number);
const viewports = [
  { width: 1440, height: 1000 },
  { width: 1024, height: 900 },
  { width: 640, height: 900 },
  { width: 390, height: 844 },
];
const results = [];
const startedAt = new Date().toISOString();
const browser = await chromium.launch({ channel: "chrome", headless: true });
function save(extra = {}) {
  writeFileSync(
    join(destination, "results.json"),
    JSON.stringify(
      {
        startedAt,
        updatedAt: new Date().toISOString(),
        base,
        scriptSha256,
        fixtureSha256: prepared.proof.bundleSha256,
        counts,
        viewports,
        results,
        ...extra,
      },
      null,
      2,
    ),
  );
}
const watchdog = setTimeout(async () => {
  save({ timeout: true });
  await bounded(browser.close(), 8000, "owned card browser");
  process.exit(2);
}, 600000);
async function frames(page) {
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}
async function image(page, name, locator) {
  const file = `${name}.png`;
  await (locator ?? page).screenshot({
    path: join(destination, file),
    animations: "disabled",
    timeout: 15000,
  });
  return file;
}
async function measure(page, list) {
  return list.evaluate((element) => {
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
      viewport: { width: innerWidth, height: innerHeight },
      pageWidth: document.documentElement.scrollWidth,
      horizontalOverflow:
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
      list: box(element),
      columns: getComputedStyle(element).gridTemplateColumns,
      gap: getComputedStyle(element).gap,
      rows: [
        ...element.querySelectorAll('[data-slot="data-grid-panel-row"]'),
      ].map((row) => ({
        ...box(row),
        span: getComputedStyle(row).gridColumn,
        child: row.firstElementChild ? box(row.firstElementChild) : null,
        text: row.innerText,
        controls: [...row.querySelectorAll("button,input")].map((control) => ({
          ...box(control),
          role: control.getAttribute("role"),
          name: control.getAttribute("aria-label") ?? control.textContent,
        })),
      })),
    };
  });
}
async function keyboard(page, rows, name, viewport) {
  const result = {
    viewport,
    viewSwitchAvailable: await page
      .getByRole("button", { name: "Card view", exact: true })
      .isVisible(),
  };
  if (result.viewSwitchAvailable) {
    const table = page.getByRole("button", { name: "Table view", exact: true });
    await table.focus();
    await page.keyboard.press("Space");
    await frames(page);
    result.tablePressed = await table.getAttribute("aria-pressed");
    result.tableVisible = await page.getByRole("table").first().isVisible();
    const cards = page.getByRole("button", { name: "Card view", exact: true });
    await cards.focus();
    await page.keyboard.press("Space");
    await rows.first().waitFor({ state: "visible" });
    result.cardsPressed = await cards.getAttribute("aria-pressed");
  } else
    result.viewSwitchNote =
      "Existing shared toggle is hidden below md; responsive gift list remains available.";
  const checkbox = rows.first().getByRole("checkbox").first();
  await checkbox.focus();
  await page.keyboard.press("Space");
  await frames(page);
  result.checked = await checkbox.getAttribute("aria-checked");
  result.selectedState = await rows.first().getAttribute("data-state");
  result.selectionScreenshot = await image(page, `${name}-selection`);
  const receiptButton = page
    .getByRole("button", { name: /Send receipts|Resend receipts/i })
    .first();
  result.receiptTriggerAvailable = await receiptButton.isVisible();
  if (result.receiptTriggerAvailable) {
    await receiptButton.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog").last();
    await dialog.waitFor({ state: "visible" });
    result.receiptConfirmation = await dialog.innerText();
    result.confirmationScreenshot = await image(
      page,
      `${name}-receipt-confirmation`,
    );
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
    result.closedByEscape = true;
  }
  await checkbox.focus();
  await page.keyboard.press("Space");
  result.checkedAfterClear = await checkbox.getAttribute("aria-checked");
  return result;
}
try {
  for (const count of counts) {
    const record = { count, startedAt: new Date().toISOString(), widths: [] };
    results.push(record);
    console.log(`START cards ${count}`);
    const context = await browser.newContext({
      viewport: viewports[0],
      deviceScaleFactor: 1,
      colorScheme: "light",
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    const traffic = [];
    const guard = [];
    const consoleErrors = [];
    page.on("request", (request) => {
      const address = new URL(request.url());
      if (address.pathname.startsWith("/api/"))
        traffic.push({
          method: request.method(),
          path: address.pathname + address.search,
        });
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));
    try {
      const auth = await context.request.post(`${base}/api/auth/demo-account`, {
        data: { role: "admin" },
        timeout: 25000,
      });
      if (!auth.ok())
        throw new Error(`Local fixture session failed: ${auth.status()}`);
      await context.route("**/api/**", async (route) => {
        guard.push({
          method: route.request().method(),
          path: new URL(route.request().url()).pathname,
        });
        await route.fulfill({
          status: 503,
          json: { error: "Unmocked API blocked by local evidence guard" },
        });
      });
      const fixture = await installApiFixtures(page, { bundle: fixtureBundle });
      const subset = fixtureBundle.datasets.contributions.slice(0, count);
      fixture.state.contributions = subset;
      const inputText = JSON.stringify(subset, null, 2);
      writeFileSync(join(destination, `input-rows-${count}.json`), inputText);
      record.inputSha256 = sha256(inputText);
      record.inputMode =
        "Unmodified current typed fixture rows filtered in memory; existing route fixture computes pagination. Endpoint aggregate template stays unchanged.";
      await installModuleFixtures(page, { scenario: "populated" });
      await page.goto(`${base}/contributions`, {
        waitUntil: "commit",
        timeout: 45000,
      });
      await page
        .getByRole("button", { name: "Card view", exact: true })
        .waitFor({ state: "visible", timeout: 60000 });
      await page
        .getByRole("button", { name: "Card view", exact: true })
        .click();
      const rows = page.locator('[data-slot="data-grid-panel-row"]:visible');
      await page.waitForFunction(
        (expected) =>
          document.querySelectorAll('[data-slot="data-grid-panel-row"]')
            .length === expected,
        count,
        { timeout: 10000 },
      );
      await page.addStyleTag({
        content: "nextjs-portal{display:none!important}",
      });
      for (const viewport of viewports) {
        const width = { viewport };
        record.widths.push(width);
        const name = `cards-${count}-${viewport.width}`;
        console.log(`MEASURE ${name}`);
        try {
          await page.setViewportSize(viewport);
          await frames(page);
          await rows.first().scrollIntoViewIfNeeded();
          await frames(page);
          const list = rows.first().locator("..");
          width.layout = await measure(page, list);
          width.viewSwitchVisible = await page
            .getByRole("button", { name: "Card view", exact: true })
            .isVisible();
          width.screenshot = await image(page, name);
          width.gridScreenshot = await image(page, `${name}-grid`, list);
          const renderedText = width.layout.rows
            .map((row) => row.text)
            .join("\n");
          width.content = subset.map((row) => {
            const shared = row.shared;
            const money = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: shared.currencyCode,
            }).format(shared.amountCents / 100);
            return {
              id: row.id,
              name: shared.donorName,
              money,
              receipt: shared.receiptStatus,
              namePresent: renderedText.includes(shared.donorName),
              moneyPresent: renderedText.includes(money),
            };
          });
          if (
            [6, 10].includes(count) &&
            [1440, 1024, 390].includes(viewport.width)
          ) {
            try {
              width.keyboard = await keyboard(page, rows, name, viewport);
            } catch (error) {
              width.keyboard = { error: error.stack };
              width.keyboardFailureScreenshot = await image(
                page,
                `${name}-keyboard-failure`,
              ).catch(() => null);
            }
          }
          width.status = "observed";
        } catch (error) {
          width.status = "failed-or-partial";
          width.error = error.stack;
          await image(page, `${name}-failure`).catch(() => {});
        }
        save();
      }
      if (count === 10) {
        await page.setViewportSize(viewports[0]);
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
        await rows.first().scrollIntoViewIfNeeded();
        record.actualSearch = {
          query: "Theodore",
          rows: await rows.allTextContents(),
          screenshot: await image(page, "cards-10-actual-search"),
        };
      }
      record.status = "observed";
      record.fixtureMissing = fixture.missing;
    } catch (error) {
      record.status = "failed-or-partial";
      record.error = error.stack;
      record.failureBody = await page
        .locator("body")
        .innerText({ timeout: 5000 })
        .catch(() => "unavailable");
      await image(page, `cards-${count}-failure`).catch(() => {});
      console.error(`${count}: ${error.message}`);
    } finally {
      record.traffic = traffic;
      record.guard = guard;
      record.consoleErrors = consoleErrors;
      record.moneyWrites = traffic.filter(
        (request) =>
          request.method !== "GET" &&
          /contribution|receipt|refund/.test(request.path),
      );
      record.finishedAt = new Date().toISOString();
      save();
      await bounded(context.close(), 8000, "owned card context");
    }
  }
} finally {
  clearTimeout(watchdog);
  save({ finishedAt: new Date().toISOString() });
  await bounded(browser.close(), 8000, "owned card browser");
}
process.exit(
  results.some(
    (record) =>
      record.status !== "observed" ||
      record.widths.some(
        (width) => width.status !== "observed" || width.keyboard?.error,
      ),
  )
    ? 1
    : 0,
);
