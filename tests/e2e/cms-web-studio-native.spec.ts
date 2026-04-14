import { expect, test, type Page } from "@playwright/test";

const adminBaseURL =
  process.env.PLAYWRIGHT_ADMIN_BASE_URL || "http://localhost:3030";

const nativePagesUiDisabled =
  process.env.CMS_WEB_STUDIO_NATIVE_PAGES === "false" ||
  process.env.CMS_WEB_STUDIO_NATIVE_PAGES === "0";

test.describe("@cms Web Studio native shell", () => {
  test.beforeEach(({}, testInfo) => {
    if (nativePagesUiDisabled) {
      testInfo.skip(
        true,
        "CMS_WEB_STUDIO_NATIVE_PAGES disables native Pages UI; shell assertions do not apply. Smoke script sets CMS_WEB_STUDIO_NATIVE_PAGES=true — see docs/guides/development/site-studio-payload.md.",
      );
    }
  });

  async function signInAsAdmin(page: Page) {
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
  }

  test("authenticated staff sees Mission Control shell on Pages list", async ({
    page,
  }) => {
    await signInAsAdmin(page);

    await expect(page.getByTestId("web-studio-native-shell")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /pages/i }).first(),
    ).toBeVisible();
  });

  test("editorial collection routes use the native shell", async ({ page }) => {
    await signInAsAdmin(page);

    const editorialRoutes = [
      { href: "/web-studio/collections/navigation", heading: /navigation/i },
      {
        href: "/web-studio/collections/missionary-profiles",
        heading: /missionary profiles/i,
      },
      {
        href: "/web-studio/collections/ministry-updates",
        heading: /ministry updates/i,
      },
      { href: "/web-studio/collections/media", heading: /media/i },
    ] as const;

    for (const route of editorialRoutes) {
      await page.goto(`${adminBaseURL}${route.href}`);
      await page.waitForURL(new RegExp(route.href.replace(/\//g, "\\/")));
      await expect(page.getByTestId("web-studio-native-shell")).toBeVisible();
      await expect(
        page.getByRole("heading", { name: route.heading }).first(),
      ).toBeVisible();
    }
  });
});
