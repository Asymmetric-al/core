import { expect, test } from "@playwright/test";

const adminBaseURL =
  process.env.PLAYWRIGHT_ADMIN_BASE_URL || "http://localhost:3030";

test.describe("@cms Web Studio native shell", () => {
  test("authenticated staff sees Mission Control shell on Pages list", async ({
    page,
  }) => {
    const availability = await page.request.get("/api/auth/demo-account");
    test.skip(!availability.ok(), "Demo availability endpoint is unavailable.");

    const payload = (await availability.json()) as {
      roles?: Record<string, boolean>;
      availableRoles?: Record<string, boolean>;
    };
    const roles = payload.roles ?? payload.availableRoles ?? {};
    test.skip(!roles.admin, "Admin demo account is not configured.");

    await page.goto(
      `${adminBaseURL}/login?next=${encodeURIComponent("/web-studio/collections/pages")}`,
    );
    await page.getByRole("button", { name: "Demo Access" }).click();
    await page.waitForURL(/\/web-studio\/collections\/pages/);

    await expect(page.getByTestId("web-studio-native-shell")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /pages/i }).first(),
    ).toBeVisible();
  });
});
