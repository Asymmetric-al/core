import AxeBuilder from "@axe-core/playwright";

import { expect, test } from "./test";

import type { Page } from "@playwright/test";

async function control(page: Page, detail: object) {
  await page.evaluate((payload) => {
    document.dispatchEvent(
      new CustomEvent("fixture-task-delete-control", { detail: payload }),
    );
  }, detail);
}

for (const width of [320, 1440]) {
  test(`donor-task confirmation survives refresh and retry at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/task-toolbar.html?surface=donor");
    const actions = page.getByRole("button", {
      name: "Open actions",
      exact: true,
    });
    await actions.press("Enter");
    const deleteItem = page.getByRole("menuitem", {
      name: "Delete",
      exact: true,
    });
    await page.keyboard.press("End");
    await expect(deleteItem).toBeFocused();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("alertdialog", {
      name: "Delete Call partner?",
      exact: true,
    });
    const cancel = dialog.getByRole("button", { name: "Cancel", exact: true });
    await expect(cancel).toBeFocused();
    await control(page, { command: "loading", loading: true });
    await expect(dialog).toBeVisible();
    await expect(cancel).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Add Task", exact: true }),
    ).toBeFocused();

    await control(page, { command: "loading", loading: false });
    await control(page, { command: "mode", mode: "deferred" });
    await actions.press("Enter");
    await page.keyboard.press("End");
    await expect(deleteItem).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(cancel).toBeFocused();
    await page.keyboard.press("Tab");
    const confirm = dialog.getByRole("button", {
      name: "Delete task",
      exact: true,
    });
    await expect(confirm).toBeFocused();
    await page.keyboard.press("Enter");
    const pending = dialog.getByRole("button", {
      name: "Deleting…",
      exact: true,
    });
    await expect(pending).toBeFocused();
    await control(page, { command: "loading", loading: true });
    await expect(dialog).toBeVisible();
    await expect(pending).toBeFocused();
    await expect(pending).toHaveAttribute("aria-disabled", "true");
    await page.keyboard.press("Space");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeVisible();
    await expect(pending).toBeFocused();
    await expect(dialog.getByRole("status")).toContainText(
      "Deleting Call partner",
    );
    await control(page, { command: "settle", success: false });
    await expect(dialog.getByRole("alert")).toContainText(
      "Could not delete this task",
    );
    await expect(confirm).toBeFocused();
    await control(page, { command: "loading", loading: false });
    await expect(dialog.getByRole("alert")).toContainText(
      "Could not delete this task",
    );
    await expect(confirm).toBeFocused();
    const axe = await new AxeBuilder({ page })
      .include('[role="alertdialog"]')
      .analyze();
    expect(axe.violations).toEqual([]);
    const geometry = await dialog.boundingBox();
    expect(geometry?.x).toBeGreaterThanOrEqual(0);
    expect(
      (geometry?.x ?? width) + (geometry?.width ?? width),
    ).toBeLessThanOrEqual(width);
    await page.screenshot({
      path: testInfo.outputPath("donor-task-refresh-error.png"),
      fullPage: true,
    });
    await confirm.press("Enter");
    await control(page, { command: "settle", success: true });
    await expect(dialog).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Add Task", exact: true }),
    ).toBeFocused();
    const counts = JSON.parse(
      (await page
        .getByRole("status", {
          name: "Task action counts",
          includeHidden: true,
        })
        .textContent()) || "{}",
    );
    expect(counts.delete).toBe(2);
  });
}
