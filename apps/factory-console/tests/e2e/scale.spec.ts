// The TEST-ONLY synthetic scale fixture: about 2,000 labeled issues with long
// histories. The Console must page (never render every row), stay within the
// viewport, render in bounded time and keep browser memory bounded across
// repeated refreshes.
import { expect, test } from "@playwright/test";

import { FIXTURE, noHorizontalOverflow, open, panel, ready } from "./helpers";

const ISSUES = 2000;

test.describe.configure({ timeout: 240_000 });

test.beforeEach(async ({ request }) => {
  await request.post(`${FIXTURE}/fixture/reset`);
  const scaled = await request.post(`${FIXTURE}/fixture/scale`, {
    data: { issues: ISSUES, history: 40 },
  });
  expect(await scaled.json()).toEqual({ issues: ISSUES, history: 40 });
});

test.afterAll(async ({ request }) => {
  await request.post(`${FIXTURE}/fixture/reset`);
});

test("about 2,000 labeled issues page instead of rendering every row, within the viewport and a render budget", async ({
  page,
}) => {
  const started = Date.now();
  await ready(page);
  // Labeled twice: the Console's fixture banner and the generated data.
  await expect(
    page.getByRole("region", { name: "Synthetic data" }),
  ).toContainText("Nothing on this page is live factory data");
  await expect(
    page.getByText("SYNTHETIC SCALE FIXTURE", { exact: false }).first(),
  ).toBeVisible();
  await open(page, "Phases & issues");
  const view = panel(page);
  await expect(view.getByText(/Page 1 of \d+/)).toBeVisible();
  const rendered = Date.now() - started;
  // One page of rows is in the DOM, not two thousand.
  const issueButtons = await view
    .getByRole("button", { name: /^#\d+$/ })
    .count();
  expect(issueButtons).toBeGreaterThan(0);
  expect(issueButtons).toBeLessThanOrEqual(100);
  expect(rendered).toBeLessThan(60_000);
  test.info().annotations.push({
    type: "render",
    description: `First issues page of ${ISSUES} synthetic issues in ${rendered} ms`,
  });
  await noHorizontalOverflow(page);
  for (const tab of [
    "Overview",
    "Live work map",
    "Checks & reviews",
    "History & decisions",
    "Performance",
  ]) {
    await open(page, tab);
    await noHorizontalOverflow(page);
  }
  const history = panel(page);
  await open(page, "History & decisions");
  await expect(history.getByText(/\d+ matching records\./)).toBeVisible();
  const total = Number(
    /(\d+) matching/.exec(
      (await history.getByText(/\d+ matching records\./).textContent()) ?? "",
    )?.[1],
  );
  expect(total).toBeGreaterThan(ISSUES * 12);
  expect(
    await history
      .getByRole("list", { name: "History records" })
      .getByRole("listitem")
      .count(),
  ).toBeLessThanOrEqual(25);
  await history.getByRole("button", { name: "Older", exact: true }).click();
  await expect(history.getByText(/^26–50 of \d+/)).toBeVisible();
});

test("browser memory stays bounded across repeated refreshes", async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== "chromium", "Heap sampling needs Chromium CDP");
  await ready(page);
  const session = await page.context().newCDPSession(page);
  const heap = async () => {
    await session.send("HeapProfiler.collectGarbage");
    const usage = (await session.send("Runtime.getHeapUsage")) as {
      usedSize: number;
    };
    return usage.usedSize;
  };
  const refresh = page.getByRole("button", { name: "Refresh now" });
  const settle = async () => {
    await expect(refresh).toBeEnabled({ timeout: 60_000 });
    await expect(page.getByText("Live", { exact: true }).first()).toBeVisible();
  };
  await settle();
  // Warm up once so caches and code paths exist before the baseline.
  await refresh.click();
  await settle();
  const baseline = await heap();
  const samples: number[] = [];
  for (let round = 0; round < 8; round += 1) {
    await refresh.click();
    await settle();
    samples.push(await heap());
  }
  test.info().annotations.push({
    type: "memory",
    description: `baseline ${Math.round(baseline / 1e6)} MB; samples ${samples
      .map((value) => Math.round(value / 1e6))
      .join(", ")} MB`,
  });
  // Bounded: repeated refreshes replace the observation instead of
  // accumulating it.
  expect(Math.max(...samples)).toBeLessThan(baseline * 1.5 + 30_000_000);
  expect(samples.at(-1)!).toBeLessThan(samples[1] * 1.3 + 20_000_000);
});
