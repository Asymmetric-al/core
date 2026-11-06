import { expect, test } from "@playwright/test";

import type { Route } from "@playwright/test";

test("support intake validation/reset and server GET FormData", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop-light",
    "One focused Chromium check for native form contracts.",
  );
  const errors: string[] = [];
  const requests: unknown[] = [];
  let pendingRoute: Route | undefined;
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (
      url.origin === "http://127.0.0.1:5198" &&
      url.pathname === "/api/admin/support/tickets"
    ) {
      requests.push(route.request().postDataJSON());
      pendingRoute = route;
      return;
    }
    if (
      url.origin === "http://127.0.0.1:5198" &&
      !url.pathname.startsWith("/api/")
    ) {
      await route.continue();
      return;
    }
    errors.push(`Unexpected request: ${url.origin}${url.pathname}`);
    await route.abort();
  });
  await page.goto("/support.html");
  const intake = page.locator("#intake");
  const form = intake.locator("form");
  await intake.getByLabel("Subject", { exact: true }).fill("Receipt help");
  await intake
    .getByLabel("Summary", { exact: true })
    .fill("Please resend the receipt.");
  await intake.getByRole("button", { name: "Create ticket" }).click();
  expect(
    await form.evaluate((node: HTMLFormElement) => node.checkValidity()),
  ).toBe(false);
  expect(requests).toHaveLength(0);
  await expect(
    intake.getByRole("combobox", { name: "Contact", exact: true }),
  ).toBeFocused();
  await intake.getByRole("combobox", { name: "Contact", exact: true }).click();
  await page.getByRole("option", { name: "Ada Lovelace" }).click();
  await intake
    .getByRole("combobox", { name: "Support track", exact: true })
    .click();
  await page.getByRole("option", { name: "Donor Care", exact: true }).click();
  expect(
    await form.evaluate((node: HTMLFormElement) => node.checkValidity()),
  ).toBe(true);
  await intake.getByRole("button", { name: "Create ticket" }).click();
  await expect.poll(() => requests.length).toBe(1);
  await form.evaluate((node: HTMLFormElement) => {
    node.requestSubmit();
    node.requestSubmit();
  });
  expect(requests).toHaveLength(1);
  expect(requests[0]).toEqual({
    contactId: "contact-1",
    contactName: "Ada Lovelace",
    contactEmail: "ada@example.test",
    queueId: "donor_care",
    priority: "normal",
    subject: "Receipt help",
    summary: "Please resend the receipt.",
  });
  if (!pendingRoute) throw new Error("Expected a held local ticket request");
  await pendingRoute.fulfill({ json: { id: "fixture-ticket" } });
  await expect(intake.getByText("Created ticket fixture-ticket")).toBeVisible();
  expect(
    await form.evaluate((node: HTMLFormElement) =>
      Object.fromEntries(new FormData(node)),
    ),
  ).toEqual({
    contact: "",
    queueId: "",
    priority: "normal",
    subject: "",
    summary: "",
  });
  await expect(
    intake.getByRole("combobox", { name: "Contact", exact: true }),
  ).toContainText("Select contact");
  const filters = page.locator("#filters");
  const getForm = filters.locator("form");
  expect(await getForm.evaluate((node: HTMLFormElement) => node.method)).toBe(
    "get",
  );
  expect(
    await getForm.evaluate((node: HTMLFormElement) =>
      Object.fromEntries(new FormData(node)),
    ),
  ).toEqual({ queueId: "donor_care", status: "waiting", search: "receipt" });
  await filters
    .getByRole("combobox", { name: "Support track", exact: true })
    .click();
  await page.getByRole("option", { name: "All tracks", exact: true }).click();
  await filters.getByRole("combobox", { name: "Status", exact: true }).click();
  await page.getByRole("option", { name: "All statuses", exact: true }).click();
  expect(
    await getForm.evaluate((node: HTMLFormElement) =>
      Object.fromEntries(new FormData(node)),
    ),
  ).toEqual({ queueId: "", status: "", search: "receipt" });
  expect(errors).toEqual([]);
});

test.describe("Support controls at narrow widths", () => {
  test.use({ isMobile: true, viewport: { width: 320, height: 844 } });

  test("long assignee menu stays inside the viewport and still assigns", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-light");
    await page.goto("/support.html?layout=assignee");
    await page.getByRole("button", { name: "Unassigned" }).click();
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    const bounds = await menu.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
    await menu.getByRole("menuitem", { name: /Lastname/ }).click();
    await expect(page.locator("#support-layout-result")).toHaveText(
      "Assigned agent-a",
    );
  });

  test("report scope controls fit inside the card", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-light");
    await page.goto("/support.html?layout=report");
    const agent = page.getByRole("combobox", { name: "Agent", exact: true });
    await expect(agent).toBeVisible();
    const fits = await agent.evaluate((control) => {
      const card = document.querySelector("#report-layout > div")!;
      const style = getComputedStyle(card);
      const contentRight =
        card.getBoundingClientRect().right -
        parseFloat(style.paddingRight) -
        parseFloat(style.borderRightWidth);
      return control.getBoundingClientRect().right <= contentRight + 1;
    });
    expect(fits).toBe(true);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(320);
    await agent.click();
    await expect(
      page.getByRole("option", { name: "Camille Support" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(agent).toBeFocused();
  });

  test("saved view actions own the lower edge of a 44px touch target", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-light");
    await page.goto("/support.html?layout=saved");
    const trigger = page.getByRole("button", {
      name: "Saved view actions for Priority escalations",
    });
    await expect(trigger).toBeVisible();
    const bounds = await trigger.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.width).toBeGreaterThanOrEqual(44);
    expect(bounds!.height).toBeGreaterThanOrEqual(44);
    await page.touchscreen.tap(
      bounds!.x + bounds!.width / 2,
      bounds!.y + bounds!.height - 2,
    );
    await page.getByRole("menuitem", { name: "Rename / scope" }).click();
    await expect(page.locator("#support-layout-result")).toHaveText(
      "Renamed priority",
    );
  });

  test("long label names and selection boxes fit without horizontal scrolling", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-light");
    await page.goto("/support.html?layout=labels");
    await page.getByRole("combobox", { name: "Labels", exact: true }).click();
    const list = page.getByRole("listbox");
    await expect(list.getByRole("option")).toHaveCount(3);
    for (const name of [/TierAlpha$/, /TierBeta$/, /Zeta$/]) {
      const label = list.getByText(name);
      const dimensions = await label.evaluate((node) => {
        const listbox = node.closest("[role=listbox]")!;
        const bounds = listbox.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(node);
        return {
          textFits: Array.from(range.getClientRects()).every(
            (rect) => rect.left >= bounds.left && rect.right <= bounds.right,
          ),
          indicatorWidth:
            node.previousElementSibling!.getBoundingClientRect().width,
        };
      });
      expect(dimensions).toEqual({ textFits: true, indicatorWidth: 16 });
    }
    expect(
      await list.evaluate((node) => node.scrollWidth - node.clientWidth),
    ).toBe(0);

    const search = page.getByRole("combobox", { name: "Search labels" });
    await search.fill("Beta");
    await expect(list.getByRole("option")).toHaveCount(1);
    const beta = list.getByRole("option", { name: /TierBeta$/ });
    await search.press("ArrowDown");
    await expect(search).toHaveAttribute(
      "aria-activedescendant",
      (await beta.getAttribute("id"))!,
    );
    await search.press("Enter");
    await expect(page.locator("#support-layout-result")).toHaveText(
      "escalation-beta",
    );
  });
});
