import AxeBuilder from "@axe-core/playwright";

import { test, expect } from "./test";

test("Administration lists only working settings and fits narrow screens", async ({
  page,
}, testInfo) => {
  await page.goto("/admin-availability.html");
  const scope = page.locator("#admin-availability-contracts");

  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(scope.getByRole("link", { name: /^Teams/ })).toHaveAttribute(
      "href",
      "/admin/teams",
    );
    await expect(
      scope.getByRole("link", { name: /^Email delivery/ }),
    ).toHaveAttribute("href", "/settings/integrations/resend");
    await expect(scope.getByRole("link", { name: /^Eve/ })).toHaveAttribute(
      "href",
      "/admin/eve",
    );
    // Settings that are not built are not offered as disabled buttons.
    await expect(scope.getByRole("button")).toHaveCount(0);
    await expect
      .poll(() =>
        scope.evaluate((element) => element.scrollWidth <= element.clientWidth),
      )
      .toBe(true);
    expect(
      (
        await new AxeBuilder({ page })
          .include("#admin-availability-contracts")
          .analyze()
      ).violations,
    ).toEqual([]);
    await scope.screenshot({
      path: testInfo.outputPath(`administration-${width}.png`),
    });
  }
});
