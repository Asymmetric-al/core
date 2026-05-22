import { expect, test, type Page } from "@playwright/test";

import { adminBaseURL } from "./base-urls";
import { getDemoRoleMap } from "./helpers/demo-auth";
import { installDemoSessionInBrowser } from "./helpers/install-demo-session";

test.setTimeout(180_000);

function adminPath(path: string): string {
  return new URL(path, adminBaseURL).toString();
}

async function ensureAdminDemo(page: Page) {
  const availability = await page.request.get(
    `${adminBaseURL}/api/auth/demo-account`,
  );
  test.skip(!availability.ok(), "Demo availability endpoint is unavailable.");

  const roles = getDemoRoleMap(await availability.json()) ?? {};
  test.skip(!roles.admin, "Admin demo account is not configured.");

  const { ok, status } = await installDemoSessionInBrowser(
    page,
    "admin",
    adminBaseURL,
  );
  if (!ok) {
    test.skip(true, `Demo admin session install failed (${status})`);
  }
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

test("admin profile menu exposes distinct real destinations", async ({
  page,
}) => {
  await ensureAdminDemo(page);
  await page.goto(adminPath("/"));
  await page.waitForLoadState("domcontentloaded");

  await page.getByRole("button", { name: "Open profile menu" }).click();
  const menu = page.getByRole("menu");

  const administration = menu.getByRole("menuitem", {
    name: "Administration",
  });
  const manageTeam = menu.getByRole("menuitem", { name: "Manage team" });
  const about = menu.getByRole("menuitem", { name: "About" });

  await expect(administration).toHaveAttribute("href", "/admin");
  await expect(manageTeam).toHaveAttribute("href", "/admin/teams");
  await expect(about).toHaveAttribute("href", "/help/about");
  await expect(menu.getByText("My account")).toHaveCount(0);
  await expect(menu.getByText("Settings")).toHaveCount(0);
  await expect(menu.getByText("Customization")).toHaveCount(0);
  await expect(menu.getByText("Add team account")).toHaveCount(0);

  await administration.click();
  await expect(page).toHaveURL(new RegExp("/admin$"));
  await expect(
    page.getByRole("heading", { name: "Administration" }),
  ).toBeVisible();
});
