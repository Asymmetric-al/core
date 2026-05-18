import { expect, test } from "@playwright/test";

import { adminBaseURL } from "./base-urls";

test.setTimeout(180_000);

function adminPath(path: string): string {
  return new URL(path, adminBaseURL).toString();
}

test("admin demo login redirects and persists session", async ({ page }) => {
  const availability = await page.request.get(
    `${adminBaseURL}/api/auth/demo-account`,
  );
  test.skip(!availability.ok(), "Demo availability endpoint is unavailable.");

  const payload = (await availability.json()) as {
    roles?: Record<string, boolean>;
    availableRoles?: Record<string, boolean>;
  };
  const roles = payload.roles ?? payload.availableRoles ?? {};
  test.skip(!roles.admin, "Admin demo account is not configured.");

  const protectedPath = "/";
  await page.goto(
    adminPath(`/login?next=${encodeURIComponent(protectedPath)}`),
  );
  await page.getByRole("button", { name: "Demo Access" }).click();
  await page.waitForURL(
    (url) =>
      url.origin === new URL(adminBaseURL).origin &&
      url.pathname === protectedPath,
  );

  // Full navigation is more reliable than `reload()` in Next dev (streaming / long tasks).
  await page.goto(`${adminBaseURL}${protectedPath}`, {
    waitUntil: "domcontentloaded",
    timeout: 120_000,
  });
  expect(new URL(page.url()).pathname).toBe(protectedPath);
  expect(page.url()).not.toContain("/login");
});
