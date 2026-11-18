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
      page.getByRole("heading", { name: "Tasks", exact: true, level: 1 }),
    ).toBeVisible();
    await expect(page.locator("html")).toHaveClass(/light/);

    const viewSwitch = page.getByRole("group", {
      name: "Task view",
      exact: true,
    });
    const board = viewSwitch.getByRole("button", {
      name: "Board view",
      exact: true,
    });
    const list = viewSwitch.getByRole("button", {
      name: "List view",
      exact: true,
    });
    const refresh = page.getByRole("button", {
      name: "Refresh tasks",
      exact: true,
    });
    const toolbarSelector =
      '#task-toolbar-contracts div:has(> div > div > button[aria-label="Board view"])';
    const toolbar = page.locator(toolbarSelector);
    await expect(toolbar).toHaveCount(1);
    // Phones (below 768px) open on the list; wider screens open on the board.
    const phone = viewport.width < 768;
    const [initial, other] = phone ? [list, board] : [board, list];
    // Board comes first in the group, so the arrow toward it is ArrowLeft.
    const [toOther, toInitial] = phone
      ? ["ArrowLeft", "ArrowRight"]
      : ["ArrowRight", "ArrowLeft"];
    const boardHeading = page.getByRole("heading", {
      name: /^To do\s*1$/,
      exact: true,
    });
    const listCheckbox = page.getByRole("checkbox", {
      name: "Mark Call partner complete",
      exact: true,
    });
    const expectShowing = async (view: typeof board) => {
      if (view === board) {
        await expect(boardHeading).toBeVisible();
        await expect(listCheckbox).toHaveCount(0);
      } else {
        await expect(listCheckbox).toBeVisible();
        await expect(boardHeading).toHaveCount(0);
      }
    };
    await expect(initial).toHaveAttribute("aria-pressed", "true");
    await expect(other).toHaveAttribute("aria-pressed", "false");
    await expectShowing(initial);
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

    // The group is one tab stop that starts on the pressed view.
    await page.keyboard.press("Tab");
    await expect(initial).toBeFocused();
    const focusIndicator = await initial.evaluate((element) => ({
      focusVisible: element.matches(":focus-visible"),
      boxShadow: getComputedStyle(element).boxShadow,
    }));
    expect(focusIndicator.focusVisible).toBe(true);
    expect(focusIndicator.boxShadow).not.toBe("none");
    await page.keyboard.press(toOther);
    await expect(other).toBeFocused();
    await expect(initial).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press(toInitial);
    await expect(initial).toBeFocused();
    await page.keyboard.press(toOther);
    await page.keyboard.press("Enter");
    await expect(other).toBeFocused();
    await expect(other).toHaveAttribute("aria-pressed", "true");
    await expect(initial).toHaveAttribute("aria-pressed", "false");
    await expectShowing(other);

    await page.keyboard.press(toInitial);
    await expect(initial).toBeFocused();
    await page.keyboard.press("Space");
    await expect(initial).toBeFocused();
    await expect(initial).toHaveAttribute("aria-pressed", "true");
    await expect(other).toHaveAttribute("aria-pressed", "false");
    await expectShowing(initial);

    await page.keyboard.press("Tab");
    await expect(refresh).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(initial).toBeFocused();
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
