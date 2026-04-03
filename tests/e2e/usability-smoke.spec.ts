import { expect, test, type Page } from "@playwright/test";

import { getDemoRoleMap } from "./helpers/demo-auth";

async function installDemoDonorSession(page: Page) {
  const response = await page.request.post("/api/auth/demo-account", {
    data: { role: "donor" },
  });

  expect(response.ok()).toBeTruthy();
}

test.describe("Donor usability smoke", () => {
  test("home page loads with the primary giving CTA", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("#__next_error__")).toHaveCount(0);
    await expect(page.locator("#hero-heading")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /give now|donate|support/i }).first(),
    ).toBeVisible();
  });

  test("login page renders the shared auth screen", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /sign in|demo access/i }).first(),
    ).toBeVisible();
  });

  test("demo auth availability endpoint exposes donor access", async ({
    request,
  }) => {
    const response = await request.get("/api/auth/demo-account");

    expect(response.ok()).toBeTruthy();

    const roles = getDemoRoleMap(await response.json());

    expect(roles?.donor).toBe(true);
  });

  test("authenticated donor settings page renders avatar upload controls", async ({
    page,
  }) => {
    await installDemoDonorSession(page);
    await page.goto("/donor-dashboard/settings");

    await expect(page.getByText("Public Avatar")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /upload new/i }),
    ).toBeEnabled();
    await expect(page.getByRole("button", { name: /remove/i })).toBeVisible();
  });
});
