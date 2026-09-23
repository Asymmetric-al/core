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
