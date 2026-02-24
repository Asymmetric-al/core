import { expect, test } from "@playwright/test";

const adminBaseURL =
  process.env.PLAYWRIGHT_ADMIN_BASE_URL || "http://127.0.0.1:3030";

test.describe("Usability smoke audit", () => {
  test("public homepage exposes primary navigation and CTA actions", async ({
    page,
  }) => {
    const response = await page.goto("/");
    expect(response?.ok()).toBeTruthy();

    await expect(page.locator("body")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /support the frontlines/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /our methodology/i }),
    ).toBeVisible();
  });

  test("auth pages expose labelled form controls and submit actions", async ({
    page,
  }) => {
    await page.goto("/login");
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();

    await page.goto("/register");
    await expect(page.getByLabel("First Name")).toBeVisible();
    await expect(page.getByLabel("Last Name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /create account/i }),
    ).toBeVisible();
  });

  test("protected donor dashboard redirects unauthenticated users", async ({
    page,
  }) => {
    await page.goto("/donor-dashboard");
    await expect(page).toHaveURL(/\/login/);
    await expect(page).toHaveURL(/next=%2Fdonor-dashboard/);
  });

  test("payload admin route redirects unauthenticated users to login", async ({
    page,
  }) => {
    await page.goto(`${adminBaseURL}/admin`);
    await expect(page).toHaveURL(/\/login/);
    await expect(page).toHaveURL(/next=%2Fadmin/);
  });

  test("core public routes render without broken navigation states", async ({
    page,
  }) => {
    const publicRoutes = ["/about", "/workers", "/help/about"];

    for (const route of publicRoutes) {
      const response = await page.goto(route);
      expect(response?.ok()).toBeTruthy();
      await expect(page.locator("body")).toBeVisible();
      await expect(page.getByRole("link").first()).toBeVisible();
      await expect(
        page.getByText(/application error|something went wrong/i),
      ).toHaveCount(0);
    }
  });

  test("mobile viewport keeps primary CTA visible above-the-fold", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    await expect(
      page.getByRole("link", { name: /support the frontlines/i }),
    ).toBeVisible();
  });
});
