import { writeFile } from "node:fs/promises";

import AxeBuilder from "@axe-core/playwright";

import { expect, test } from "./test";

for (const viewport of [
  { width: 320, height: 820 },
  { width: 1440, height: 1000 },
]) {
  test(`actual Tasks toolbar supports keyboard, state and refresh at ${viewport.width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.goto("/task-toolbar.html");
    await expect(
      page.getByRole("heading", { name: "Mission Tasks", exact: true }),
    ).toBeVisible();
    await expect(page.locator("html")).toHaveClass(/light/);

    const board = page.getByRole("button", { name: "Board view", exact: true });
    const list = page.getByRole("button", { name: "List view", exact: true });
    const refresh = page.getByRole("button", {
      name: "Refresh tasks",
      exact: true,
    });
    const toolbarSelector =
      '#task-toolbar-contracts div:has(> div > button[aria-label="Board view"])';
    const toolbar = page.locator(toolbarSelector);
    await expect(toolbar).toHaveCount(1);
    await expect(board).toHaveAttribute("aria-pressed", "true");
    await expect(list).toHaveAttribute("aria-pressed", "false");
    await expect
      .poll(() =>
        toolbar.evaluate(
          (element) => getComputedStyle(element.parentElement!).transform,
        ),
      )
      .toBe("none");
    const initialGeometry = await toolbar.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return {
        viewportWidth: innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        toolbarLeft: bounds.left,
        toolbarRight: bounds.right,
        toolbarWidth: bounds.width,
        toolbarScrollWidth: element.scrollWidth,
      };
    });

    await page.keyboard.press("Tab");
    await expect(board).toBeFocused();
    const focusIndicator = await board.evaluate((element) => ({
      focusVisible: element.matches(":focus-visible"),
      boxShadow: getComputedStyle(element).boxShadow,
    }));
    expect(focusIndicator.focusVisible).toBe(true);
    expect(focusIndicator.boxShadow).not.toBe("none");
    await page.keyboard.press("Tab");
    await expect(list).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(board).toBeFocused();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await expect(list).toBeFocused();
    await expect(list).toHaveAttribute("aria-pressed", "true");
    await expect(board).toHaveAttribute("aria-pressed", "false");
    await expect(
      page.getByRole("checkbox", {
        name: "Complete Call partner",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /^To Do\s*1$/, exact: true }),
    ).toHaveCount(0);

    await page.keyboard.press("Shift+Tab");
    await expect(board).toBeFocused();
    await page.keyboard.press("Space");
    await expect(board).toBeFocused();
    await expect(board).toHaveAttribute("aria-pressed", "true");
    await expect(list).toHaveAttribute("aria-pressed", "false");
    await expect(
      page.getByRole("heading", { name: /^To Do\s*1$/, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("checkbox", {
        name: "Complete Call partner",
        exact: true,
      }),
    ).toHaveCount(0);

    await page.keyboard.press("Tab");
    await expect(list).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(refresh).toBeFocused();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Space");
    await expect(refresh).toBeFocused();
    await expect
      .poll(async () =>
        JSON.parse(
          (await page
            .getByRole("status", { name: "Task action counts", exact: true })
            .textContent()) || "{}",
        ),
      )
      .toEqual({ refresh: 2, complete: 0, reopen: 0, delete: 0, move: 0 });

    const axe = await new AxeBuilder({ page })
      .include(toolbarSelector)
      .analyze();
    const evidencePath = testInfo.outputPath(
      "task-toolbar-browser-evidence.json",
    );
    await writeFile(
      evidencePath,
      JSON.stringify(
        {
          viewport,
          initialGeometry,
          focusIndicator,
          axeViolations: axe.violations,
        },
        null,
        2,
      ),
    );
    await testInfo.attach("task-toolbar-browser-evidence", {
      path: evidencePath,
      contentType: "application/json",
    });
    const screenshotPath = testInfo.outputPath("task-toolbar.png");
    await page.screenshot({ path: screenshotPath, fullPage: true });
    await testInfo.attach("actual-task-toolbar", {
      path: screenshotPath,
      contentType: "image/png",
    });
    expect(axe.violations).toEqual([]);
    expect(initialGeometry.toolbarRight).toBeLessThanOrEqual(viewport.width);
    expect(initialGeometry.documentWidth).toBeLessThanOrEqual(viewport.width);
  });
}
