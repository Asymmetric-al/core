import { expect, test } from "@playwright/test";

import { DEMO_TENANT_PREFIX, routePathname } from "./helpers/tenant-address";

test("missionary demo login redirects and persists session", async ({
  page,
}) => {
  const availability = await page.request.get("/api/auth/demo-account");
  test.skip(!availability.ok(), "Demo availability endpoint is unavailable.");

  const payload = (await availability.json()) as {
    roles?: Record<string, boolean>;
    availableRoles?: Record<string, boolean>;
  };
  const roles = payload.roles ?? payload.availableRoles ?? {};
  test.skip(!roles.missionary, "Missionary demo account is not configured.");

  const protectedPath = "/";
  await page.goto(`/login?next=${encodeURIComponent(protectedPath)}`);
  await page.getByRole("button", { name: "Demo Access" }).click();
  // One organization: the address without a tenant lands in it (plan 5.2).
  await page.waitForURL((url) => url.pathname === DEMO_TENANT_PREFIX);

  await page.reload();
  await page.waitForLoadState("networkidle");
  expect(new URL(page.url()).pathname).toBe(DEMO_TENANT_PREFIX);
  expect(routePathname(page.url())).toBe(protectedPath);
  expect(page.url()).not.toContain("/login");
});
