import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright-core";
import AxeBuilder from "@axe-core/playwright";

const owned = dirname(fileURLToPath(import.meta.url));
const root = resolve(owned, "../../../../../../..");
const qa = join(root, "docs/qa/admin-workspaces-hillclimb");
const [output, mode] = process.argv.slice(2);
const [kind, widthText] = mode.split("-");
const width = Number(widthText);
const heights = { 1440: 1000, 1024: 900, 640: 900, 390: 844 };
if (
  !output ||
  !["receipt", "correction", "note"].includes(kind) ||
  !heights[width]
)
  throw new Error("Invalid bounded focused case");
mkdirSync(output, { recursive: true });
const saveFile = (name, value) =>
  writeFileSync(join(output, name), JSON.stringify(value, null, 2) + "\n");
const hash = (path) =>
  createHash("sha256").update(readFileSync(path)).digest("hex");
function freeze(label) {
  const startedAt = new Date().toISOString();
  const result = spawnSync(
    process.execPath,
    [join(qa, "freeze-checkpoint.mjs"), "--verify", "round13r2"],
    { cwd: root, encoding: "utf8", windowsHide: true, timeout: 60000 },
  );
  let parsed = null;
  try {
    parsed = JSON.parse(result.stdout);
  } catch {}
  const proof = {
    startedAt,
    endedAt: new Date().toISOString(),
    exitCode: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    manifestSha256: hash(join(qa, "snapshots/round13r2-manifest.json")),
    diffSha256: hash(join(qa, "snapshots/round13r2.diff")),
  };
  saveFile(`${label}-internal-freeze.json`, proof);
  if (
    result.status !== 0 ||
    parsed?.files !== 1038 ||
    parsed.mismatches.length ||
    parsed.extra.length ||
    proof.manifestSha256 !==
      "27f02a8d3a628389a0dfd71be0c31d2fd0884f1044925c725df786e5a72abec0" ||
    proof.diffSha256 !==
      "8061b8fde771136891d4baf152062c613d1c7a7352040d4b66f14feea5239b6b"
  )
    throw new Error("Frozen source mismatch; browser batch stopped");
}
freeze("before");
const { prepareFixtureBundle } = await import(
  pathToFileURL(join(qa, "fixture-preflight.mjs"))
);
const prepared = prepareFixtureBundle();
saveFile("fixture-proof.json", prepared.proof);
const bundle = prepared.bundle;
const { installApiFixtures } = await import(
  pathToFileURL(join(qa, "fixtures/route-fixtures.mjs"))
);
const { installModuleFixtures } = await import(
  pathToFileURL(join(qa, "fixtures/module-fixtures.mjs"))
);
const { installStudioFixtures } = await import(
  pathToFileURL(join(qa, "studio-fixtures.mjs"))
);
const { createStates, setCurrentState, missingSetups, bounded } = await import(
  pathToFileURL(join(qa, "workspace-states.mjs"))
);
const base = process.env.CAPTURE_BASE_URL;
if (base !== "http://localhost:3031") throw new Error("Unexpected runtime URL");
const viewport = { width, height: heights[width] };
const giftId = "e0a15e46-a328-4b24-a921-681c12884ef6";
const donorId = bundle.captureMeta.crmDrawerId;
const detail =
  bundle.details["GET /api/admin/contribution-operations/:contributionId"][
    giftId
  ];
const donor = bundle.details["GET /api/admin/crm/records/:recordId"][donorId];
if (
  !detail?.actionAvailability.some(
    (entry) => entry.actionType === "fund_correction" && entry.available,
  ) ||
  !donor.giftHistory.some(
    (gift) => (gift.id ?? gift.shared?.donationId) === giftId,
  )
)
  throw new Error("Verified eligible fixture anchor absent");
const results = {
  mode,
  viewport,
  startedAt: new Date().toISOString(),
  base,
  scriptSha256: hash(fileURLToPath(import.meta.url)),
  fixtureProof: prepared.proof,
  boundary:
    "Local intercepted fixtures only; no provider sends or financial actions; viewport resize is not a real phone keyboard",
  cases: {},
};
const save = () =>
  saveFile("results.json", {
    ...results,
    updatedAt: new Date().toISOString(),
    missingSetups,
  });
const browser = await chromium.launch({ channel: "chrome", headless: true });
results.browserVersion = browser.version();
const frames = async (page) =>
  page.evaluate(
    () =>
      new Promise((done) =>
        requestAnimationFrame(() => requestAnimationFrame(done)),
      ),
  );
async function screenshot(page, name) {
  const file = `${name}.png`;
  await page.screenshot({
    path: join(output, file),
    animations: "disabled",
    timeout: 12000,
  });
  return file;
}
async function measure(popup, note = false) {
  return popup.evaluate((dialog, isNote) => {
    const rect = (element) => {
      if (!element) return null;
      const box = element.getBoundingClientRect();
      return {
        top: box.top,
        bottom: box.bottom,
        left: box.left,
        right: box.right,
        width: box.width,
        height: box.height,
      };
    };
    const header = dialog.querySelector(
      `[data-slot="${isNote ? "crm-note-dialog-header" : "operation-dialog-header"}"]`,
    );
    const footer = dialog.querySelector(
      `[data-slot="${isNote ? "crm-note-dialog-footer" : "operation-form-actions"}"]`,
    );
    const summary = dialog.querySelector("fieldset dl");
    const active = document.activeElement;
    const dialogBox = rect(dialog);
    const headerBox = rect(header);
    const summaryBox = rect(summary);
    const footerBox = rect(footer);
    const borderTop = parseFloat(getComputedStyle(dialog).borderTopWidth);
    const innerTop = dialogBox.top + borderTop;
    const fields = [
      ...dialog.querySelectorAll(
        'input, textarea, [role="combobox"], [role="checkbox"], [role="radio"]',
      ),
    ]
      .filter(
        (element) =>
          element.getClientRects().length &&
          element.getAttribute("type") !== "hidden",
      )
      .map((element) => ({
        tag: element.tagName,
        role: element.getAttribute("role"),
        name: element.getAttribute("aria-label") ?? element.id,
        ...rect(element),
      }));
    const samples = [0.15, 0.5, 0.85].map((ratio) => {
      const x = dialogBox.left + dialogBox.width * ratio;
      const y = innerTop + 2;
      const topmost = document
        .elementsFromPoint(x, y)
        .find(
          (element) =>
            element === header ||
            header?.contains(element) ||
            element.matches?.(
              "p.whitespace-pre-wrap, fieldset dl, fieldset dt, fieldset dd",
            ),
        );
      return {
        x,
        y,
        topmostTag: topmost?.tagName ?? null,
        insideHeader:
          !!topmost && (topmost === header || header?.contains(topmost)),
        bodyAboveHeader:
          !!topmost && !(topmost === header || header?.contains(topmost)),
      };
    });
    const activeBox = rect(active);
    const activeInHeader = !!header?.contains(active);
    const activeInFooter = !!footer?.contains(active);
    return {
      scrollTop: dialog.scrollTop,
      maxScrollTop: dialog.scrollHeight - dialog.clientHeight,
      clientHeight: dialog.clientHeight,
      dialog: dialogBox,
      header: headerBox,
      footer: footerBox,
      summary: summaryBox,
      padding: getComputedStyle(dialog).padding,
      headerGapPx: headerBox ? headerBox.top - innerTop : null,
      summaryClearancePx:
        summaryBox && headerBox ? summaryBox.top - headerBox.bottom : null,
      summaryOverlapPx:
        summaryBox && headerBox
          ? Math.max(0, headerBox.bottom - summaryBox.top)
          : null,
      summaryText: summary
        ? [...summary.querySelectorAll("dt,dd")].map((element) => ({
            text: element.textContent,
            ...rect(element),
          }))
        : [],
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1,
      dialogOverflowX: dialog.scrollWidth > dialog.clientWidth + 1,
      popupInsideViewport:
        dialogBox.left >= -1 &&
        dialogBox.top >= -1 &&
        dialogBox.right <= innerWidth + 1 &&
        dialogBox.bottom <= innerHeight + 1,
      footerInsidePopup:
        !footerBox ||
        (footerBox.top >= dialogBox.top - 1 &&
          footerBox.bottom <= dialogBox.bottom + 1),
      active: {
        tag: active?.tagName,
        name:
          active?.getAttribute("aria-label") ??
          active?.getAttribute("name") ??
          active?.id,
        role: active?.getAttribute("role"),
        text: active?.textContent?.slice(0, 90),
        isPopup: active === dialog,
        contained: active === dialog || dialog.contains(active),
        inHeader: activeInHeader,
        inFooter: activeInFooter,
        rect: activeBox,
        clearOfStickyEdges:
          active === dialog ||
          activeInHeader ||
          activeInFooter ||
          (!!activeBox &&
            activeBox.top >= headerBox.bottom - 1 &&
            activeBox.bottom <= (footerBox?.top ?? dialogBox.bottom) + 1),
      },
      upperStripSamples: samples,
      fields,
      headerText: header?.innerText,
      noteLength:
        dialog.querySelector("p.whitespace-pre-wrap")?.textContent.length ??
        null,
      focusEvents: window.__coreFocusEvents ?? [],
      viewport: { width: innerWidth, height: innerHeight },
    };
  }, note);
}
async function runCase(cache) {
  const name = kind === "note" ? `note-${width}` : `${kind}-${cache}-${width}`;
  const result = (results.cases[name] = {
    startedAt: new Date().toISOString(),
    fixtureGiftId: giftId,
  });
  let context;
  let page;
  let release = () => {};
  const traffic = [];
  const blocked = [];
  const errors = [];
  const detailRequests = [];
  console.log(`START ${name}`);
  try {
    context = await browser.newContext({
      viewport,
      deviceScaleFactor: 1,
      colorScheme: "light",
      reducedMotion: "reduce",
    });
    const auth = await context.request.post(base + "/api/auth/demo-account", {
      data: { role: "admin" },
      timeout: 25000,
    });
    if (!auth.ok())
      throw new Error(`Sanctioned demo auth failed: ${auth.status()}`);
    await context.route("**/api/**", async (route) => {
      blocked.push({
        method: route.request().method(),
        path: new URL(route.request().url()).pathname,
      });
      await route.fulfill({
        status: 503,
        json: { error: "Unmocked API denied by round13r2-core fixture guard" },
      });
    });
    page = await context.newPage();
    page.setDefaultTimeout(20000);
    await page.addInitScript(() => {
      window.__coreFocusEvents = [];
      document.addEventListener("focusin", (event) =>
        window.__coreFocusEvents.push({
          at: performance.now(),
          tag: event.target.tagName,
          name: event.target.getAttribute("aria-label") ?? event.target.id,
          testid: event.target.getAttribute("data-testid"),
          role: event.target.getAttribute("role"),
        }),
      );
    });
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (url.pathname.startsWith("/api/"))
        traffic.push({
          at: new Date().toISOString(),
          method: request.method(),
          path: url.pathname + url.search,
        });
    });
    page.on("pageerror", (error) => errors.push(error.message));
    const fixture = await installApiFixtures(page, { bundle });
    await installModuleFixtures(page, { scenario: "populated" });
    if (kind === "correction") await installStudioFixtures(page);
    const gate = new Promise((done) => {
      release = done;
    });
    await page.route(
      new RegExp(`/api/admin/contribution-operations/${giftId}(?:\\?|$)`),
      async (route) => {
        detailRequests.push({
          at: new Date().toISOString(),
          method: route.request().method(),
        });
        if (cache === "delayed") await gate;
        await route.fallback();
      },
    );
    await page.goto(
      base + (kind === "note" ? "/crm/notes" : `/crm?donor=${donorId}`),
      { waitUntil: "commit", timeout: 60000 },
    );
    await page.addStyleTag({
      content: "nextjs-portal{display:none!important}",
    });
    let popup;
    let trigger;
    let openCount = 0;
    const openOperation = async () => {
      openCount += 1;
      const receiptTrigger = page
        .getByRole("button", { name: /^Resend receipt/ })
        .first();
      await receiptTrigger.waitFor({ state: "visible", timeout: 70000 });
      if (kind === "receipt") {
        trigger = receiptTrigger;
        await trigger.click();
      } else {
        const menus = page.getByRole("button", {
          name: /^(More actions for|More gift actions)/,
        });
        const index = donor.giftHistory.findIndex(
          (gift) => (gift.id ?? gift.shared?.donationId) === giftId,
        );
        trigger = menus.nth(index);
        result.menuTriggerName = await trigger.getAttribute("aria-label");
        await trigger.click();
        result.menuText = await page.getByRole("menu").last().innerText();
        result.menuScreenshot = await screenshot(
          page,
          `${name}-menu-${openCount}`,
        );
        (result.menuScreenshots ??= []).push(result.menuScreenshot);
        const correction = page.getByRole("menuitem", {
          name: "Correct fund designation",
          exact: true,
        });
        if (!(await correction.isEnabled()))
          throw new Error(
            "Actual eligible correction trigger unavailable; not detail-form evidence",
          );
        await correction.click();
      }
      popup = page.getByTestId("contribution-operation-shell");
      await popup.waitFor({ state: "visible" });
    };
    if (kind === "note") {
      await page
        .getByText(bundle.captureMeta.crmFirstNoteTitle, { exact: true })
        .first()
        .waitFor({ state: "visible", timeout: 70000 });
      const state = createStates(bundle.captureMeta).find(
        (entry) => entry.name === "crm-note-long",
      );
      setCurrentState(state.name);
      await state.setup(page);
      popup = page.getByRole("dialog", {
        name: "Year-end call notes",
        exact: true,
      });
      await popup.waitFor({ state: "visible" });
      await frames(page);
      result.initial = await measure(popup, true);
      result.initialScreenshot = await screenshot(page, `${name}-initial`);
      result.createdFixtureNotes = fixture.state.createdCount;
    } else {
      await openOperation();
      await frames(page);
      if (cache === "delayed") {
        result.loading = await measure(popup);
        result.loadingScreenshot = await screenshot(page, `${name}-loading`);
        release();
      }
      await popup
        .getByText("Current amount", { exact: true })
        .waitFor({ state: "visible" });
      await frames(page);
      result.firstOpen = await measure(popup);
      if (cache === "cached") {
        result.requestsBeforeReopen = detailRequests.length;
        await popup.getByRole("button", { name: "Close", exact: true }).click();
        await popup.waitFor({ state: "hidden" });
        await openOperation();
        await popup
          .getByText("Current amount", { exact: true })
          .waitFor({ state: "visible" });
        await frames(page);
        result.requestsAfterReopen = detailRequests.length;
      }
      result.initial = await measure(popup);
      result.initialScreenshot = await screenshot(page, `${name}-initial`);
      result.dialogText = await popup.innerText();
      if (kind === "correction") {
        await popup
          .getByRole("heading", {
            name: "Correct fund designation",
            exact: true,
          })
          .waitFor();
        await popup
          .getByRole("combobox", { name: "Destination fund", exact: true })
          .waitFor();
        await popup.getByLabel("Reason", { exact: true }).waitFor();
        result.actualCorrectionForm = true;
      }
    }
    result.scrollPositions = [];
    for (const position of ["middle", "bottom"]) {
      await popup.evaluate((dialog, value) => {
        dialog.scrollTop =
          (dialog.scrollHeight - dialog.clientHeight) *
          (value === "middle" ? 0.5 : 1);
      }, position);
      await frames(page);
      result.scrollPositions.push({
        position,
        geometry: await measure(popup, kind === "note"),
        screenshot: await screenshot(page, `${name}-${position}`),
      });
    }
    result.keyboard = [];
    for (const key of [
      ...Array(16).fill("Tab"),
      ...Array(5).fill("Shift+Tab"),
    ]) {
      await page.keyboard.press(key);
      await frames(page);
      result.keyboard.push({
        key,
        geometry: await measure(popup, kind === "note"),
      });
    }
    if (kind === "correction") {
      let reachedReason = false;
      for (let index = 0; index < 16; index += 1) {
        if (
          await popup
            .getByLabel("Reason", { exact: true })
            .evaluate((element) => element === document.activeElement)
        ) {
          reachedReason = true;
          break;
        }
        await page.keyboard.press("Tab");
        await frames(page);
      }
      result.reasonReachedByKeyboard = reachedReason;
      if (reachedReason) {
        const keyboardHeight = width <= 640 ? 460 : 600;
        await page.setViewportSize({ width, height: keyboardHeight });
        await frames(page);
        await page.waitForTimeout(150);
        result.keyboardResize = await measure(popup);
        result.keyboardScreenshot = await screenshot(
          page,
          `${name}-keyboard-resize`,
        );
        await popup.hover();
        await page.mouse.wheel(0, -900);
        await frames(page);
        result.userScrollBeforeRestore = await measure(popup);
        await page.setViewportSize(viewport);
        await frames(page);
        await page.waitForTimeout(150);
        result.userScrollAfterRestore = await measure(popup);
      }
    }
    const scope =
      kind === "note"
        ? `[role="dialog"][aria-labelledby="${await popup.getAttribute("aria-labelledby")}"]`
        : '[data-testid="contribution-operation-shell"]';
    const axe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .include(scope)
      .exclude("nextjs-portal")
      .analyze();
    result.axe = {
      scope,
      violations: axe.violations.map((entry) => ({
        id: entry.id,
        impact: entry.impact,
        nodes: entry.nodes.map((node) => node.target),
      })),
      incomplete: axe.incomplete.map((entry) => ({
        id: entry.id,
        nodes: entry.nodes.length,
      })),
    };
    await page.keyboard.press("Escape");
    await frames(page);
    result.escapeDismissed = !(await popup.isVisible());
    result.focusAfterEscape = await page.evaluate(() => ({
      tag: document.activeElement?.tagName,
      name:
        document.activeElement?.getAttribute("aria-label") ??
        document.activeElement?.textContent?.slice(0, 100),
    }));
    if (trigger)
      result.focusRestoredToTrigger = await trigger
        .evaluate((element) => element === document.activeElement)
        .catch(() => false);
    result.fixtureMissing = fixture.missing;
    result.fixtureHandled = fixture.handled;
    result.status = "observed";
  } catch (error) {
    result.status = "failed-or-partial";
    result.error = error.stack;
    console.error(`${name}: ${error.message}`);
    if (page) {
      result.failureScreenshot = await screenshot(
        page,
        `${name}-failure`,
      ).catch(() => null);
      result.failureSnapshot = `${name}-failure.txt`;
      writeFileSync(
        join(output, result.failureSnapshot),
        await page
          .locator("body")
          .ariaSnapshot({ timeout: 5000 })
          .catch(() => "unavailable"),
      );
    }
  } finally {
    release();
    result.traffic = traffic;
    result.unmockedBlocked = blocked;
    result.consoleErrors = errors;
    result.moneyWrites = traffic.filter(
      (entry) =>
        entry.method !== "GET" &&
        /contribution-operations|receipt|refund|payment|correction/.test(
          entry.path,
        ),
    );
    result.finishedAt = new Date().toISOString();
    save();
    if (context) {
      let timer;
      try {
        result.contextClosed = await Promise.race([
          context.close().then(() => true),
          new Promise((done) => {
            timer = setTimeout(() => done(false), 12000);
          }),
        ]);
      } finally {
        clearTimeout(timer);
      }
      save();
      if (!result.contextClosed)
        throw new Error(
          "Owned context did not close; no next context may start",
        );
    }
    console.log(
      `END ${name}: ${result.status}; moneyWrites=${result.moneyWrites.length}`,
    );
  }
}
try {
  for (const cache of kind === "note" ? ["note"] : ["delayed", "cached"])
    await runCase(cache);
} finally {
  await bounded(browser.close(), 15000, "owned focused browser close");
  freeze("after");
  results.finishedAt = new Date().toISOString();
  save();
}
process.exit(
  Object.values(results.cases).some(
    (entry) => entry.status !== "observed" || entry.moneyWrites.length,
  )
    ? 1
    : 0,
);
