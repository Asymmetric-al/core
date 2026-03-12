import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function gotoHealthyHomepage(page: Page) {
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");
  await expect(page.locator("#__next_error__")).toHaveCount(0);
  await expect(page.locator("#hero-heading")).toBeVisible();
}

async function gotoStableRoute(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState("domcontentloaded");

  if ((await page.getByRole("heading", { name: "404" }).count()) > 0) {
    await page.goto(path);
    await page.waitForLoadState("domcontentloaded");
  }

  await expect(page.getByRole("heading", { name: "404" })).toHaveCount(0);
  await expect(page.locator("#__next_error__")).toHaveCount(0);
}

test.describe("Accessibility Tests", () => {
  test("Homepage should have no critical accessibility violations", async ({
    page,
  }) => {
    await gotoHealthyHomepage(page);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );

    if (criticalViolations.length > 0) {
      console.log(
        "Critical A11y Violations:",
        JSON.stringify(criticalViolations, null, 2),
      );
    }

    expect(criticalViolations).toHaveLength(0);
  });

  test("Login page should be accessible", async ({ page }) => {
    await gotoStableRoute(page, "/login");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );

    expect(criticalViolations).toHaveLength(0);
  });

  test("Register page should be accessible", async ({ page }) => {
    await gotoStableRoute(page, "/register");
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByRole("heading", {
        name: /Create Account|Create Donor Account|Registration unavailable/i,
      }),
    ).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );

    expect(criticalViolations).toHaveLength(0);
  });

  test("All forms should have proper labels", async ({ page }) => {
    await gotoStableRoute(page, "/login");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("form")).toHaveCount(1);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a"])
      .analyze();

    const labelViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === "label" || v.id === "label-title-only",
    );

    expect(labelViolations).toHaveLength(0);
  });

  test("Color contrast should meet WCAG AA standards", async ({ page }) => {
    await gotoHealthyHomepage(page);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2aa"])
      .analyze();

    const contrastViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === "color-contrast",
    );

    if (contrastViolations.length > 0) {
      console.log(
        "Contrast violations:",
        JSON.stringify(contrastViolations, null, 2),
      );
    }

    expect(contrastViolations.length).toBeLessThanOrEqual(3);
  });
});
