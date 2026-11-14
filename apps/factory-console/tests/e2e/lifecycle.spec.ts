// Lifecycle and readiness facts the pack records on a work item, and the
// reconcile control, against the TEST-ONLY loopback fixtures.
import { expect, test, type Page } from "@playwright/test";

import {
  FIXTURE,
  noHorizontalOverflow,
  noSeriousAxe,
  open,
  panel,
  ready,
} from "./helpers";

test.beforeEach(async ({ request }) => {
  await request.post(`${FIXTURE}/fixture/reset`);
});

async function controlCalls(page: Page) {
  const response = await page.request.get(`${FIXTURE}/fixture/calls`);
  return ((await response.json()) as { calls: string[][] }).calls;
}

async function openIssue(page: Page, issue: number) {
  await open(page, "Phases & issues");
  await panel(page)
    .getByRole("button", { name: `#${issue}`, exact: true })
    .first()
    .click();
  const sheet = page.getByRole("dialog");
  await expect(
    sheet.getByRole("heading", { name: `Issue #${issue}` }),
  ).toBeVisible();
  return sheet;
}

async function closeSheet(page: Page) {
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
}

test("the issue sheet shows the lifecycle and readiness facts an operator acts on", async ({
  page,
}) => {
  await ready(page);
  let sheet = await openIssue(page, 107);
  await expect(
    sheet.getByText("Last refused claim", { exact: true }),
  ).toBeVisible();
  await expect(sheet.getByText("The issue is held.").first()).toBeVisible();
  await expect(
    sheet.getByText("Pending base integration", { exact: true }),
  ).toBeVisible();
  await expect(
    sheet.getByText("reviews carry forward", { exact: false }),
  ).toBeVisible();
  await expect(sheet.getByText("Fix pending").first()).toBeVisible();
  await expect(sheet.getByText("PRRC_fixture")).toHaveCount(0);
  await expect(
    sheet.getByRole("button", { name: "Reconcile issue #107" }),
  ).toBeEnabled();
  await noHorizontalOverflow(page);
  await noSeriousAxe(page);
  await closeSheet(page);

  sheet = await openIssue(page, 105);
  await expect(
    sheet.getByText("Outside the factory", { exact: true }),
  ).toBeVisible();
  await expect(
    sheet.getByText("merged outside the factory", { exact: true }).first(),
  ).toBeVisible();
  await expect(sheet.getByText("Issue closed", { exact: true })).toBeVisible();
  await closeSheet(page);

  sheet = await openIssue(page, 104);
  await expect(sheet.getByText("Retry resumes", { exact: true })).toBeVisible();
  await expect(sheet.getByText("Work rounds", { exact: true })).toBeVisible();
  await expect(
    sheet.getByRole("button", { name: "Reconcile issue #104" }),
  ).toBeDisabled();
  await closeSheet(page);

  sheet = await openIssue(page, 103);
  await expect(
    sheet.getByText("Re-bound to the installed release", { exact: false }),
  ).toBeVisible();
  // Profile digests never reach the browser.
  await expect(sheet.getByText("2".repeat(12), { exact: false })).toHaveCount(
    0,
  );
  await noSeriousAxe(page);
  await closeSheet(page);

  // The same facts in dark mode with reduced motion.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("switch", { name: "Toggle dark mode" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  sheet = await openIssue(page, 107);
  await expect(
    sheet.getByText("Pending base integration", { exact: true }),
  ).toBeVisible();
  await noHorizontalOverflow(page);
  await noSeriousAxe(page);
});

test("reconcile waits for a live lease and records the request on an idle issue", async ({
  page,
}) => {
  await ready(page);
  let sheet = await openIssue(page, 101);
  await expect(
    sheet.getByRole("button", { name: "Reconcile issue #101" }),
  ).toBeDisabled();
  await expect(
    sheet.getByText("its lease is live", { exact: false }).first(),
  ).toBeVisible();
  await closeSheet(page);

  sheet = await openIssue(page, 107);
  await sheet.getByRole("button", { name: "Reconcile issue #107" }).click();
  await expect(
    sheet.getByText("Applied", { exact: true }).first(),
  ).toBeVisible();
  expect((await controlCalls(page)).at(-1)?.slice(0, 3)).toEqual([
    "issue",
    "107",
    "reconcile",
  ]);
  await expect(
    sheet.getByText("reconcile · by fixture", { exact: false }),
  ).toBeVisible();
});
