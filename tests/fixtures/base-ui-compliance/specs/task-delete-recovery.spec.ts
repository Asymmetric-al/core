import { writeFile } from "node:fs/promises";

import AxeBuilder from "@axe-core/playwright";

import { expect, test } from "./test";

import type { Page } from "@playwright/test";

type FixtureCommand =
  | { command: "mode"; mode: "success" | "false" | "throw" | "deferred" }
  | { command: "settle"; success: boolean }
  | { command: "complete-from-refresh" };

async function control(page: Page, detail: FixtureCommand) {
  await page.evaluate((payload) => {
    document.dispatchEvent(
      new CustomEvent("fixture-task-delete-control", { detail: payload }),
    );
  }, detail);
}

async function counts(page: Page) {
  return JSON.parse(
    (await page
      .getByRole("status", { name: "Task action counts", includeHidden: true })
      .textContent()) || "{}",
  );
}

async function fixtureState(page: Page) {
  return JSON.parse(
    (await page
      .getByRole("status", {
        name: "Task deletion fixture state",
        includeHidden: true,
      })
      .textContent()) || "{}",
  );
}

async function openFromKeyboard(page: Page) {
  const actions = page.getByRole("button", {
    name: "Open actions",
    exact: true,
  });
  await actions.press("Enter");
  const item = page.getByRole("menuitem", { name: "Delete Task", exact: true });
  await expect(item).toBeVisible();
  await page.keyboard.press("End");
  await expect(item).toBeFocused();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("alertdialog", {
    name: "Delete Task",
    exact: true,
  });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Call partner");
  await expect(dialog.getByRole("button", { name: "Cancel" })).toBeFocused();
  return { actions, dialog };
}

for (const viewport of [
  { width: 320, height: 820 },
  { width: 1440, height: 1000 },
]) {
  test(`actual task deletion recovers from failure and pending work at ${viewport.width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.goto("/task-toolbar.html");
    await expect(
      page.getByRole("heading", { name: "Mission Tasks", exact: true }),
    ).toBeVisible();
    await expect(page.locator("html")).toHaveClass(/light/);
    await page
      .getByRole("button", { name: "List view", exact: true })
      .press("Enter");

    const actions = page.getByRole("button", {
      name: "Open actions",
      exact: true,
    });
    await expect(actions).toBeVisible();
    await actions.tap();
    await page
      .getByRole("menuitem", { name: "Delete Task", exact: true })
      .tap();
    let dialog = page.getByRole("alertdialog", {
      name: "Delete Task",
      exact: true,
    });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("Call partner");
    await expect(dialog.getByRole("button", { name: "Cancel" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(actions).toBeFocused();
    expect((await counts(page)).delete).toBe(0);

    ({ dialog } = await openFromKeyboard(page));
    await dialog.getByRole("button", { name: "Cancel" }).press("Enter");
    await expect(dialog).toHaveCount(0);
    await expect(actions).toBeFocused();
    expect((await counts(page)).delete).toBe(0);

    for (const mode of ["false", "throw"] as const) {
      await control(page, { command: "mode", mode });
      await expect.poll(async () => (await fixtureState(page)).mode).toBe(mode);
      ({ dialog } = await openFromKeyboard(page));
      const confirm = dialog.getByRole("button", {
        name: "Delete Task",
        exact: true,
      });
      await confirm.press("Enter");
      await expect(dialog.getByRole("alert")).toContainText(
        "Could not delete this task",
      );
      await expect(dialog).toContainText("Call partner");
      await expect(confirm).toBeFocused();
      await expect(confirm).toBeEnabled();
      await expect
        .poll(async () => (await fixtureState(page)).taskIds)
        .toEqual(["task-toolbar-fixture"]);
      await dialog.getByRole("button", { name: "Cancel" }).press("Enter");
      await expect(dialog).toHaveCount(0);
      await expect(actions).toBeFocused();
    }
    expect((await counts(page)).delete).toBe(2);

    await control(page, { command: "mode", mode: "deferred" });
    await expect
      .poll(async () => (await fixtureState(page)).mode)
      .toBe("deferred");
    ({ dialog } = await openFromKeyboard(page));
    await page.keyboard.press("Tab");
    let confirm = dialog.getByRole("button", {
      name: "Delete Task",
      exact: true,
    });
    await expect(confirm).toBeFocused();
    const focusIndicator = await confirm.evaluate((element) => ({
      focusVisible: element.matches(":focus-visible"),
      boxShadow: getComputedStyle(element).boxShadow,
    }));
    expect(focusIndicator.focusVisible).toBe(true);
    expect(focusIndicator.boxShadow).not.toBe("none");
    await page.keyboard.press("Enter");
    confirm = dialog.getByRole("button", { name: "Deleting…", exact: true });
    await expect(confirm).toHaveAttribute("aria-disabled", "true");
    await expect(confirm).toBeFocused();
    await expect(dialog.getByRole("status")).toContainText(
      "Deleting Call partner",
    );
    await expect(dialog.getByRole("button", { name: "Cancel" })).toBeDisabled();
    await page.keyboard.press("Space");
    await page.keyboard.press("Shift+Tab");
    await expect(confirm).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeVisible();
    await expect(confirm).toBeFocused();
    expect((await counts(page)).delete).toBe(3);
    await expect
      .poll(async () => (await fixtureState(page)).pending)
      .toBe(true);

    const pendingGeometry = await dialog.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return {
        left: bounds.left,
        right: bounds.right,
        width: bounds.width,
        viewportWidth: innerWidth,
        documentWidth: document.documentElement.scrollWidth,
      };
    });
    const axe = await new AxeBuilder({ page })
      .include('[role="alertdialog"]')
      .analyze();
    const pendingScreenshot = testInfo.outputPath("task-delete-pending.png");
    await page.screenshot({ path: pendingScreenshot, fullPage: true });
    await testInfo.attach("actual-task-delete-pending", {
      path: pendingScreenshot,
      contentType: "image/png",
    });

    await control(page, { command: "settle", success: false });
    await expect(dialog.getByRole("alert")).toContainText(
      "Could not delete this task",
    );
    await expect(dialog.getByRole("status")).toHaveCount(0);
    await expect
      .poll(async () => (await fixtureState(page)).taskIds)
      .toEqual(["task-toolbar-fixture"]);
    const errorScreenshot = testInfo.outputPath("task-delete-error.png");
    await page.screenshot({ path: errorScreenshot, fullPage: true });
    await testInfo.attach("actual-task-delete-error", {
      path: errorScreenshot,
      contentType: "image/png",
    });

    await dialog
      .getByRole("button", { name: "Delete Task", exact: true })
      .press("Enter");
    await expect(dialog.getByRole("alert")).toHaveCount(0);
    await expect(dialog.getByRole("status")).toContainText(
      "Deleting Call partner",
    );
    expect((await counts(page)).delete).toBe(4);
    await control(page, { command: "settle", success: true });
    await expect(dialog).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Add Task", exact: true }),
    ).toBeFocused();
    await expect
      .poll(async () => (await fixtureState(page)).taskIds)
      .toEqual([]);
    await expect(
      page.getByRole("checkbox", {
        name: "Complete Call partner",
        exact: true,
      }),
    ).toHaveCount(0);
    expect(await counts(page)).toEqual({
      refresh: 0,
      complete: 0,
      reopen: 0,
      delete: 4,
      move: 0,
    });

    await page.goto("/task-toolbar.html");
    await page
      .getByRole("button", { name: "List view", exact: true })
      .press("Enter");
    ({ dialog } = await openFromKeyboard(page));
    await control(page, { command: "complete-from-refresh" });
    await expect(
      page.getByRole("button", { name: "Open actions", includeHidden: true }),
    ).toHaveCount(0);
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Cancel" }).press("Enter");
    await expect(dialog).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Add Task", exact: true }),
    ).toBeFocused();
    expect(await counts(page)).toEqual({
      refresh: 0,
      complete: 0,
      reopen: 0,
      delete: 0,
      move: 0,
    });

    const evidencePath = testInfo.outputPath(
      "task-delete-browser-evidence.json",
    );
    await writeFile(
      evidencePath,
      JSON.stringify(
        {
          viewport,
          focusIndicator,
          pendingGeometry,
          axeViolations: axe.violations,
          fixtureApiOnly: true,
          productionComponent: "TasksPage",
        },
        null,
        2,
      ),
    );
    await testInfo.attach("task-delete-browser-evidence", {
      path: evidencePath,
      contentType: "application/json",
    });
    expect(axe.violations).toEqual([]);
    expect(pendingGeometry.left).toBeGreaterThanOrEqual(0);
    expect(pendingGeometry.right).toBeLessThanOrEqual(viewport.width);
    expect(pendingGeometry.documentWidth).toBeLessThanOrEqual(viewport.width);
  });
}
