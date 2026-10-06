import AxeBuilder from "@axe-core/playwright";

import { test, expect } from "./test";

test("unavailable Administration actions remain explained and cannot activate", async ({
  page,
}, testInfo) => {
  await page.goto("/admin-availability.html");
  const scope = page.locator("#admin-availability-contracts");
  const header = scope.locator('[data-slot="page-shell-header"]');
  const audit = scope.getByRole("button", { name: "Audit Logs" });
  const scan = scope.getByRole("button", { name: "Security Scan" });
  const explanation =
    "Audit logs and security scans are not available from this page.";

  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(audit).toBeDisabled();
    await expect(scan).toBeDisabled();
    await expect(audit).toHaveAccessibleDescription(explanation);
    await expect(scan).toHaveAccessibleDescription(explanation);
    await expect(scope.getByText(explanation, { exact: true })).toBeVisible();
    await audit.evaluate((button: HTMLButtonElement) => button.click());
    await scan.evaluate((button: HTMLButtonElement) => button.click());
    await expect(page).toHaveURL(/\/admin-availability.html$/);
    await expect(
      scope.getByRole("link", { name: /Security Settings/ }),
    ).toHaveAttribute("href", "/mc/admin/security");
    await page.keyboard.press("Tab");
    await expect(audit).not.toBeFocused();
    await expect(scan).not.toBeFocused();
    await expect
      .poll(() =>
        header.evaluate(
          (element) => element.scrollWidth <= element.clientWidth,
        ),
      )
      .toBe(true);
    expect(
      (
        await new AxeBuilder({ page })
          .include(
            '#admin-availability-contracts [data-slot="page-shell-header"]',
          )
          .analyze()
      ).violations,
    ).toEqual([]);
    await header.screenshot({
      path: testInfo.outputPath(`administration-${width}.png`),
    });
  }
});
