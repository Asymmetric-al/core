import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const FIXTURE = "http://127.0.0.1:39994";

test.beforeEach(async ({ request }) => {
  await request.post(`${FIXTURE}/fixture/reset`);
});

async function controlCalls(page: Page) {
  const response = await page.request.get(`${FIXTURE}/fixture/calls`);
  return ((await response.json()) as { calls: string[][] }).calls;
}

async function noSeriousAxe(page: Page) {
  const report = await new AxeBuilder({ page }).analyze();
  expect(
    report.violations
      .filter((item) => ["critical", "serious"].includes(item.impact ?? ""))
      .map(
        (item) =>
          `${item.id}: ${item.nodes.map((node) => node.target.join(" ")).join(", ")}`,
      ),
  ).toEqual([]);
}

async function noHorizontalOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
}

async function open(page: Page, tab: string) {
  await page.getByRole("tab", { name: tab, exact: true }).click();
}

/** The visible tab panel (inactive panels stay mounted but hidden). */
function panel(page: Page) {
  return page.locator('[role="tabpanel"]:not([hidden])');
}

async function ready(page: Page) {
  await page.goto("/");
  await expect(
    page.getByText("instance fixture-store", { exact: false }),
  ).toBeVisible();
  await expect(page.getByText("Live", { exact: true }).first()).toBeVisible();
}

test("requires owner authentication on every read and same-origin writes", async ({
  playwright,
}) => {
  const anonymous = await playwright.request.newContext({
    httpCredentials: {
      username: "intruder",
      password: "not-the-owner-password-at-all",
    },
  });
  expect(
    (
      await anonymous.get("http://127.0.0.1:3093/api/console/snapshot")
    ).status(),
  ).toBe(401);
  await anonymous.dispose();
  const crossOrigin = await playwright.request.newContext({
    httpCredentials: {
      username: "fixture",
      password: "fixture-password-not-a-real-secret",
    },
    extraHTTPHeaders: { origin: "https://attacker.invalid" },
  });
  expect(
    (
      await crossOrigin.post("http://127.0.0.1:3093/api/console/request-ids", {
        data: {},
      })
    ).status(),
  ).toBe(403);
  await crossOrigin.dispose();
});

test("overview shows real factory state and Samson's last selection as timestamped facts", async ({
  page,
}) => {
  await ready(page);
  const factory = page.getByRole("region", { name: "Factory" });
  await expect(
    factory.getByText("open", { exact: false }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Running now" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "#101" }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Samson's last selection" }),
  ).toBeVisible();
  await expect(
    panel(page).getByText("Highest roadmap priority in the frontier"),
  ).toBeVisible();
  await expect(
    panel(page).getByText("Samson blocked the issue", { exact: false }).first(),
  ).toBeVisible();
  await noHorizontalOverflow(page);
  await noSeriousAxe(page);
  await page.getByRole("switch", { name: "Toggle dark mode" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await noSeriousAxe(page);
});

test("a factory control runs exactly once and reports requested → observed", async ({
  page,
}) => {
  await ready(page);
  await page.getByRole("button", { name: "Pause intake", exact: true }).click();
  await expect(
    panel(page).getByText("the document records this request").first(),
  ).toBeVisible();
  await expect(
    panel(page).getByText("Intake paused · mode run", { exact: false }).first(),
  ).toBeVisible();
  const calls = await controlCalls(page);
  expect(calls).toHaveLength(1);
  expect(calls[0].slice(0, 2)).toEqual(["factory", "pause-intake"]);
  expect(calls[0]).toContain("--request");
  await expect(
    page.getByRole("button", { name: "Resume intake", exact: true }),
  ).toBeVisible();
});

test("destructive controls need confirmation and can be declined", async ({
  page,
}) => {
  await ready(page);
  await page
    .getByRole("button", { name: "Stop the factory", exact: true })
    .click();
  const dialog = page.getByRole("alertdialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Keep things as they are" }).click();
  await expect(dialog).not.toBeVisible();
  expect(await controlCalls(page)).toHaveLength(0);
  await page
    .getByRole("button", { name: "Stop the factory", exact: true })
    .click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Stop the factory" })
    .click();
  await expect(
    panel(page).getByText("mode stop", { exact: false }).first(),
  ).toBeVisible();
  // Focus returns to the control (now disabled but focusable), never to <body>.
  await expect(
    page.getByRole("button", { name: "Stop the factory", exact: true }),
  ).toBeFocused();
  await expect(
    page.getByRole("button", { name: "Stop the factory", exact: true }),
  ).toBeDisabled();
  expect((await controlCalls(page)).map((call) => call[1])).toEqual(["stop"]);
});

test("a lost response is retried with the same request id and applied once", async ({
  page,
}) => {
  await ready(page);
  const ids: string[] = [];
  let aborted = false;
  await page.route("**/api/console/controls", async (route) => {
    ids.push(
      (route.request().postDataJSON() as { requestId: string }).requestId,
    );
    if (!aborted) {
      aborted = true;
      await route.abort("connectionreset");
      return;
    }
    await route.continue();
  });
  await page.getByRole("button", { name: "Hold merges", exact: true }).click();
  await page
    .getByRole("button", { name: "Retry with the same request id" })
    .click();
  await expect(
    panel(page).getByText("merges held", { exact: false }).first(),
  ).toBeVisible();
  expect(ids).toHaveLength(2);
  expect(ids[0]).toBe(ids[1]);
  expect(await controlCalls(page)).toHaveLength(1);
});

test("the live work map shows lanes from real node states and an equivalent list", async ({
  page,
}) => {
  await ready(page);
  await open(page, "Live work map");
  const lane = page.getByRole("region", {
    name: "#101 · round 2 · repair route",
  });
  await expect(lane).toBeVisible();
  await expect(
    lane.getByText("Returned from round 1", { exact: false }),
  ).toBeVisible();
  await expect(lane.getByText("claude-opus-fixture").first()).toBeVisible();
  const reviews = page.getByRole("region", {
    name: "#102 · round 1 · initial route",
  });
  await expect(
    reviews.getByText("in parallel", { exact: false }),
  ).toBeVisible();
  await expect(reviews.getByText("Micaiah").first()).toBeVisible();
  await expect(reviews.getByText("Luke").first()).toBeVisible();
  await noHorizontalOverflow(page);
  await noSeriousAxe(page);
  await page
    .getByRole("radio", { name: "List" })
    .or(page.getByRole("button", { name: "List" }))
    .first()
    .click();
  await expect(
    panel(page).getByText("Build: running", { exact: false }).first(),
  ).toBeVisible();
  await noSeriousAxe(page);
});

test("issues table, issue detail and an issue control", async ({ page }) => {
  await ready(page);
  await open(page, "Phases & issues");
  await expect(
    page.getByRole("heading", { name: "Authorized scope" }),
  ).toBeVisible();
  await noSeriousAxe(page);
  const trigger = page
    .getByRole("button", { name: "#103", exact: true })
    .first();
  await trigger.click();
  const sheet = page.getByRole("dialog");
  await expect(
    sheet.getByRole("heading", { name: "Issue #103" }),
  ).toBeVisible();
  await expect(sheet.getByText("Pull request #9103")).toBeVisible();
  await expect(sheet.getByText("thread-1")).toBeVisible();
  await expect(sheet.getByText("Fixture evidence one")).toBeVisible();
  await expect(sheet.getByText("SECRET")).toHaveCount(0);
  await noSeriousAxe(page);
  await page.keyboard.press("Escape");
  await expect(sheet).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await page.getByRole("button", { name: "#102", exact: true }).first().click();
  const detail = page.getByRole("dialog");
  await detail
    .getByRole("button", { name: "Hold issue #102", exact: true })
    .click();
  // The re-read state turns the slot into Release; the receipt of the hold stays.
  await expect(
    detail.getByRole("button", { name: "Release issue #102", exact: true }),
  ).toBeVisible();
  await expect(
    detail.getByText("#102 control hold", { exact: false }),
  ).toBeVisible();
  await expect(
    detail.getByText("the document records this request").first(),
  ).toBeVisible();
  expect((await controlCalls(page)).map((call) => call.slice(0, 3))).toEqual([
    ["issue", "102", "hold"],
  ]);
});

test("assign scope through the control seam", async ({ page }) => {
  await ready(page);
  await open(page, "Phases & issues");
  await page.getByLabel("Issue numbers").fill("101, 102, 108");
  await page.getByRole("button", { name: "Assign scope", exact: true }).click();
  await expect(
    panel(page).getByText("3 issue(s) → PR_READY for conrad").first(),
  ).toBeVisible();
  const calls = await controlCalls(page);
  expect(calls.at(-1)?.slice(0, 7)).toEqual([
    "scope",
    "--issues",
    "101,102,108",
    "--end-state",
    "PR_READY",
    "--owner",
    "conrad",
  ]);
});

test("agents and runs show the reporting model, and a run can be cancelled with confirmation", async ({
  page,
}) => {
  await ready(page);
  await open(page, "Agents & runs");
  await expect(
    page.getByRole("heading", { name: "Active agents" }),
  ).toBeVisible();
  await expect(panel(page).getByText("Bezalel").first()).toBeVisible();
  await expect(
    panel(page).getByText("claude-opus-fixture").first(),
  ).toBeVisible();
  await noHorizontalOverflow(page);
  await noSeriousAxe(page);
  await page
    .getByRole("button", { name: /a1a1a1a1-0000-4000-8000-000000000101/ })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Engine node states")).toBeVisible();
  await dialog
    .getByRole("button", { name: "Cancel this run", exact: true })
    .click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Cancel this run" })
    .click();
  await expect(
    page.getByText("The engine reports the run as cancelled.").first(),
  ).toBeVisible();
  // control.mjs holds the run's issue first and removes its containers.
  await expect(
    dialog.getByText("Issue #101 is held", { exact: false }),
  ).toBeVisible();
  await expect(
    dialog.getByText("Removed 1 executor container", { exact: false }),
  ).toBeVisible();
  expect((await controlCalls(page)).at(-1)?.slice(0, 2)).toEqual([
    "cancel-run",
    "a1a1a1a1-0000-4000-8000-000000000101",
  ]);
});

test("Samson chat: send, wait for the recorded reply, apply the proposal explicitly", async ({
  page,
}) => {
  await ready(page);
  await open(page, "Samson");
  await page
    .getByLabel("Message to Samson")
    .fill("Please hold #104 while I look at it");
  await page.getByRole("button", { name: "Send to Samson" }).click();
  await expect(
    panel(page)
      .getByText("Waiting for Samson's recorded reply…", { exact: true })
      .first(),
  ).toBeVisible();
  await expect(
    panel(page).getByText("Synthetic Samson reply", { exact: false }),
  ).toBeVisible({ timeout: 20_000 });
  const calls = await controlCalls(page);
  expect(calls.filter((call) => call[0] === "ask")).toHaveLength(1);
  expect(calls.some((call) => call[0] === "issue")).toBe(false);
  await page.getByRole("button", { name: /Apply: Hold issue #104/ }).click();
  await expect(
    panel(page).getByText("Applied (recorded in factory state)").first(),
  ).toBeVisible({ timeout: 20_000 });
  expect(
    (await controlCalls(page)).filter((call) => call[0] === "issue"),
  ).toHaveLength(1);
  await expect(page.getByRole("button", { name: /stop reply/i })).toHaveCount(
    0,
  );
  await noSeriousAxe(page);
});

test("health: capacity, analysis reports, Analyze now and unavailable usage", async ({
  page,
}) => {
  await ready(page);
  await open(page, "Health & capacity");
  await expect(
    panel(page).getByText("Admitted", { exact: false }).first(),
  ).toBeVisible();
  await expect(panel(page).getByText("Subscription allowance")).toBeVisible();
  await page.getByRole("button", { name: "Open report" }).first().click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByText("Reviews repeatedly find missing labels").first(),
  ).toBeVisible();
  await expect(
    dialog.getByText("Worker transcripts are excluded"),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Analyze now", exact: true }).click();
  await expect(
    panel(page).getByText("Started", { exact: true }).first(),
  ).toBeVisible();
  expect((await controlCalls(page)).at(-1)?.[0]).toBe("analyze");
  await noSeriousAxe(page);
});

test("disconnection and unavailable factory state disable controls without inventing data", async ({
  page,
  request,
}) => {
  await ready(page);
  await request.post(`${FIXTURE}/fixture/state-failure`, {
    data: { reason: "fixture outage" },
  });
  await page.getByRole("button", { name: "Refresh now" }).click();
  await expect(
    panel(page)
      .getByText("Factory state read failed", { exact: false })
      .first(),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Pause intake", exact: true }),
  ).toHaveCount(0);
  await request.post(`${FIXTURE}/fixture/state-failure`, {
    data: { reason: null },
  });
  await page.route("**/api/console/snapshot*", (route) =>
    route.fulfill({ status: 503, json: { error: "Synthetic disconnect" } }),
  );
  await page.getByRole("button", { name: "Refresh now" }).click();
  await expect(page.getByText("No current authority to act")).toBeVisible();
  await expect(
    page.getByText("Disconnected", { exact: true }).first(),
  ).toBeVisible();
});

test("paused observations go stale and stop authorizing controls", async ({
  page,
}) => {
  await page.clock.install();
  await ready(page);
  await page
    .getByRole("button", { name: "Pause live updates", exact: true })
    .click();
  await page.clock.fastForward(46_000);
  await expect(page.getByText("Stale", { exact: true }).first()).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Pause intake", exact: true }),
  ).toBeDisabled();
});

test("a stale read is announced inside the issue sheet and the run dialog", async ({
  page,
}) => {
  await page.clock.install();
  await ready(page);
  // Paused: nothing is re-read, so each view's own read ages on the clock.
  await page
    .getByRole("button", { name: "Pause live updates", exact: true })
    .click();
  await open(page, "Phases & issues");
  await page.getByRole("button", { name: "#102", exact: true }).first().click();
  const sheet = page.getByRole("dialog");
  const hold = sheet.getByRole("button", {
    name: "Hold issue #102",
    exact: true,
  });
  await expect(hold).toBeEnabled();
  // The sheet is modal, so the page's connection status is out of reach: its
  // own polite region is mounted and empty until the read goes stale.
  const sheetStatus = sheet.getByRole("status");
  await expect(sheetStatus).toHaveCount(1);
  await expect(sheetStatus).toHaveText(/^$/);
  await expect(sheetStatus).toHaveAttribute("aria-live", "polite");
  await page.clock.fastForward(46_000);
  await expect(sheetStatus).toHaveText(
    "This observation is stale; refresh before relying on it.",
  );
  await expect(hold).toBeDisabled();
  await noSeriousAxe(page);
  // A refresh makes the read current again and the notice empties.
  await sheet
    .getByRole("button", { name: "Refresh issue #102", exact: true })
    .click();
  await expect(sheetStatus).toHaveText(/^$/);
  await page.keyboard.press("Escape");
  await expect(sheet).not.toBeVisible();

  await open(page, "Agents & runs");
  await page
    .getByRole("button", { name: /a1a1a1a1-0000-4000-8000-000000000101/ })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Engine node states")).toBeVisible();
  const runStatus = dialog.getByRole("status");
  await expect(runStatus).toHaveCount(1);
  await expect(runStatus).toHaveText(/^$/);
  await page.clock.fastForward(46_000);
  await expect(runStatus).toHaveText(
    "This observation of the run is stale; refresh before relying on it.",
  );
  await expect(runStatus).toHaveAttribute("aria-live", "polite");
  await expect(
    dialog.getByRole("button", { name: "Cancel this run", exact: true }),
  ).toBeDisabled();
  await noHorizontalOverflow(page);
  await noSeriousAxe(page);
});

test("a changed backend identity is refused instead of reusing cached authority", async ({
  page,
}) => {
  await page.route("**/api/console/snapshot*", async (route) => {
    const result = await route.fetch();
    const packet = await result.json();
    await route.fulfill({
      json: {
        ...packet,
        identity: { ...packet.identity, instance: "other-store" },
      },
    });
  });
  await page.goto("/");
  await expect(
    page.getByText("Console identity changed.", { exact: false }),
  ).toBeVisible();
});

test("every section passes axe serious/critical checks in dark mode and keeps keyboard focus visible", async ({
  page,
}) => {
  await ready(page);
  await page.getByRole("switch", { name: "Toggle dark mode" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  for (const tab of [
    "Overview",
    "Live work map",
    "Phases & issues",
    "Agents & runs",
    "Checks & reviews",
    "History & decisions",
    "Samson",
    "Health & capacity",
    "Performance",
  ]) {
    await open(page, tab);
    await expect(
      page.getByRole("tab", { name: tab, exact: true }),
    ).toHaveAttribute("aria-selected", "true");
    await noHorizontalOverflow(page);
    await noSeriousAxe(page);
  }
  await open(page, "Phases & issues");
  await page.getByRole("button", { name: "#103", exact: true }).first().click();
  await expect(
    page.getByRole("dialog").getByRole("heading", { name: "Issue #103" }),
  ).toBeVisible();
  await noSeriousAxe(page);
  await page.keyboard.press("Escape");
  await page.getByRole("tab", { name: "Overview", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Live work map", exact: true }),
  ).toBeFocused();
});

test("dark mode is switched from the keyboard with the labeled switch; no key shortcut or command menu exists", async ({
  page,
}) => {
  await ready(page);
  const toggle = page.getByRole("switch", { name: "Toggle dark mode" });
  await toggle.focus();
  await page.keyboard.press("Space");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(toggle).toHaveAttribute("aria-checked", "true");
  // Deliberate omissions (README): outside a field, D does not flip the theme
  // and Ctrl+K opens nothing.
  await page.getByRole("tab", { name: "Overview", exact: true }).focus();
  await page.keyboard.press("d");
  await page.keyboard.press("Control+k");
  await expect(
    page.getByRole("tab", { name: "Overview", exact: true }),
  ).toBeFocused();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(toggle).toHaveAttribute("aria-checked", "true");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await toggle.focus();
  await page.keyboard.press("Space");
  await expect(page.locator("html")).not.toHaveClass(/dark/);
});

test("an unknown address shows the not-found page and leads back to the Console", async ({
  page,
}) => {
  const response = await page.goto("/no-such-section");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { level: 1, name: "Console page not found" }),
  ).toBeVisible();
  await expect(
    page.getByText("Nothing was read from the factory", { exact: false }),
  ).toBeVisible();
  await noHorizontalOverflow(page);
  await noSeriousAxe(page);
  // It runs no control and reads no factory state on its own.
  expect((await controlCalls(page)).length).toBe(0);
  await page.getByRole("link", { name: "Open the Factory Console" }).click();
  await expect(page).toHaveURL(/127\.0\.0\.1:3093\/$/);
  await expect(
    page.getByText("instance fixture-store", { exact: false }),
  ).toBeVisible();
});

test("the app icon is linked from the document and served only to the owner", async ({
  page,
  playwright,
}) => {
  await ready(page);
  const href = await page
    .locator('link[rel="icon"]')
    .first()
    .getAttribute("href");
  expect(href).toMatch(/^\/icon\.svg/);
  const icon = await page.request.get(href ?? "");
  expect(icon.status()).toBe(200);
  expect(icon.headers()["content-type"]).toContain("image/svg+xml");
  expect(await icon.text()).toContain("Core Factory Console");
  // A new request context inherits the owner's credentials from the config,
  // so the other party is named explicitly (as in the first test).
  const intruder = await playwright.request.newContext({
    httpCredentials: {
      username: "intruder",
      password: "not-the-owner-password-at-all",
    },
  });
  expect(
    (await intruder.get(`http://127.0.0.1:3093${href ?? ""}`)).status(),
  ).toBe(401);
  await intruder.dispose();
});
