// Checks & reviews, History & decisions, Performance and durable issue timers
// against the TEST-ONLY loopback fixtures.
import { expect, test } from "@playwright/test";

import {
  FIXTURE,
  noHorizontalOverflow,
  noSeriousAxe,
  panel,
  ready,
} from "./helpers";

test.beforeEach(async ({ request }) => {
  await request.post(`${FIXTURE}/fixture/reset`);
});

test("every view says the data is a synthetic fixture", async ({ page }) => {
  await ready(page);
  const note = page.getByRole("region", { name: "Synthetic data" });
  await expect(note).toBeVisible();
  await expect(note).toContainText("Nothing on this page is live factory data");
});

test("checks and reviews separate internal, external, local and GitHub evidence and search on the server", async ({
  page,
}) => {
  await ready(page, "/#checks");
  const view = panel(page);
  await expect(
    view.getByRole("heading", { name: "Checks & reviews" }),
  ).toBeVisible();
  const list = view.getByRole("list", { name: "Checks and reviews" });
  await expect(list.getByText("Micaiah", { exact: true })).toBeVisible();
  await expect(
    list.getByText("Hooked pre-push (ci:preflight)", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    list.getByText("Review thread thread-1", { exact: true }),
  ).toBeVisible();
  await expect(
    view.getByText("Not recorded by the factory", { exact: true }),
  ).toBeVisible();
  await view
    .getByRole("searchbox", { name: "Search checks and reviews" })
    .fill("#104");
  await view.getByRole("button", { name: "Search", exact: true }).click();
  await expect(
    view.getByText("1 matching record.", { exact: true }),
  ).toBeVisible();
  await expect(list.getByText("Round 1", { exact: true })).toBeVisible();
  await noHorizontalOverflow(page);
  await noSeriousAxe(page);
  await list.getByRole("button", { name: "#104", exact: true }).click();
  await expect(
    page.getByRole("dialog").getByRole("heading", { name: "Issue #104" }),
  ).toBeVisible();
});

test("history and decisions are searchable, filterable and paged", async ({
  page,
}) => {
  await ready(page, "/#history");
  const view = panel(page);
  const list = view.getByRole("list", { name: "History records" });
  await expect(list.getByText("Samson selected #102")).toBeVisible();
  await expect(list.getByText("Hold #107")).toBeVisible();
  await expect(
    list.getByText("Reviews repeatedly find missing labels"),
  ).toBeVisible();
  await view.getByRole("searchbox", { name: "Search history" }).fill("roadmap");
  await view.getByRole("button", { name: "Search", exact: true }).click();
  await expect(
    view.getByText("2 matching records.", { exact: true }),
  ).toBeVisible();
  await view.getByRole("searchbox", { name: "Search history" }).fill("");
  await expect(
    view.getByText("2 matching records.", { exact: true }),
  ).not.toBeVisible();
  await expect(
    view.getByRole("navigation", { name: "History pages" }),
  ).toBeVisible();
  await noHorizontalOverflow(page);
  await noSeriousAxe(page);
});

test("performance counts verified deliveries and says when history is insufficient", async ({
  page,
}) => {
  await ready(page, "/#performance");
  const view = panel(page);
  await expect(
    view.getByRole("heading", { name: "Verified deliveries" }),
  ).toBeVisible();
  await expect(
    view.getByText(
      "Not enough history: 1 of 5 comparable verified deliveries",
      {
        exact: false,
      },
    ),
  ).toBeVisible();
  await expect(
    view.getByText("Rounds do not record when they started", { exact: false }),
  ).toBeVisible();
  await expect(
    view.getByText("No final acceptance is recorded").first(),
  ).toBeVisible();
  await expect(
    view.getByText("never ranked by lines changed, tokens", { exact: false }),
  ).toBeVisible();
  await noHorizontalOverflow(page);
  await noSeriousAxe(page);
});

test("a paused performance read says when it is stale and refreshes on request", async ({
  page,
}) => {
  await page.clock.install();
  await ready(page, "/#performance");
  const view = panel(page);
  await expect(
    view.getByRole("heading", { name: "Verified deliveries" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Pause live updates", exact: true })
    .click();
  await page.clock.fastForward(125_000);
  const stale = view.getByText("This observation is stale", { exact: false });
  await expect(stale).toBeVisible();
  await view.getByRole("button", { name: "Refresh performance" }).click();
  await expect(stale).toHaveCount(0);
});

test("an issue's elapsed time comes from durable records and survives a reload", async ({
  page,
}) => {
  await ready(page);
  await page
    .getByRole("button", { name: "Issue #101", exact: true })
    .first()
    .click();
  const sheet = page.getByRole("dialog");
  await expect(
    sheet.getByRole("heading", { name: "Elapsed time" }),
  ).toBeVisible();
  await expect(sheet.getByText("Issue wall time")).toBeVisible();
  await expect(
    sheet.getByText("running", { exact: true }).first(),
  ).toBeVisible();
  const role = sheet.getByRole("row", { name: /Bezalel/ });
  await expect(role).toBeVisible();
  const wall = async () => {
    const text = await sheet
      .getByText(/since admission/)
      .first()
      .evaluate((node) => node.parentElement?.textContent ?? "");
    const match = /(\d+)h (\d+)m/.exec(text);
    return match ? Number(match[1]) * 60 + Number(match[2]) : -1;
  };
  const before = await wall();
  expect(before).toBeGreaterThanOrEqual(120);
  await page.reload();
  await page
    .getByRole("button", { name: "Issue #101", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("dialog").getByText("Issue wall time"),
  ).toBeVisible();
  expect(await wall()).toBeGreaterThanOrEqual(before);
  await noSeriousAxe(page);
});
