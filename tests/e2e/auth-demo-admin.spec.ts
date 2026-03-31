import { expect, test } from "@playwright/test";

test("admin demo login redirects and persists session", async ({ page }) => {
  const availability = await page.request.get("/api/auth/demo-account");
  test.skip(!availability.ok(), "Demo availability endpoint is unavailable.");

  const payload = (await availability.json()) as {
    roles?: Record<string, boolean>;
    availableRoles?: Record<string, boolean>;
  };
  const roles = payload.roles ?? payload.availableRoles ?? {};
  test.skip(!roles.admin, "Admin demo account is not configured.");

  const protectedPath = "/";
  await page.goto(`/login?next=${encodeURIComponent(protectedPath)}`);
  await page.getByRole("button", { name: "Demo Access" }).click();
  await page.waitForURL((url) => url.pathname === protectedPath);

  await page.reload();
  await page.waitForLoadState("networkidle");
  expect(new URL(page.url()).pathname).toBe(protectedPath);
  expect(page.url()).not.toContain("/login");
});
