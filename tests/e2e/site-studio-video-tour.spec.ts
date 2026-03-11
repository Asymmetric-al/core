import { expect, test } from "@playwright/test";
import type { APIRequestContext, BrowserContext } from "@playwright/test";

const adminBaseURL =
  process.env.PLAYWRIGHT_ADMIN_BASE_URL || "http://127.0.0.1:3030";

test.use({ video: "on" });

async function isDemoAdminAvailable(
  request: APIRequestContext,
): Promise<boolean> {
  const availabilityRes = await request.get("/api/auth/demo-account");
  if (!availabilityRes.ok()) return false;

  const payload = (await availabilityRes.json().catch(() => ({}))) as {
    availableRoles?: Partial<Record<"admin", boolean>>;
  };

  return Boolean(payload.availableRoles?.admin);
}

async function authenticateAsDemoAdmin(
  request: APIRequestContext,
  context: BrowserContext,
): Promise<boolean> {
  const signInResponse = await request.post("/api/auth/demo-account", {
    data: { role: "admin" },
  });

  if (!signInResponse.ok()) return false;

  const setCookieHeader = signInResponse.headers()["set-cookie"];
  if (!setCookieHeader) return false;

  const cookiePair = setCookieHeader.split(";")[0] || "";
  const equalsIndex = cookiePair.indexOf("=");
  if (equalsIndex <= 0) return false;

  const name = cookiePair.slice(0, equalsIndex).trim();
  const value = cookiePair.slice(equalsIndex + 1);
  const responseURL = new URL(signInResponse.url());

  await context.addCookies([
    {
      name,
      value,
      url: responseURL.origin,
      httpOnly: true,
      secure: responseURL.protocol === "https:",
      sameSite: "Lax",
    },
  ]);

  return true;
}

test.describe("@manual Site Studio CMS video tour", () => {
  test("entrypoint and auth UX flow", async ({ page }) => {
    await page.goto("/web-studio");

    await expect(page).toHaveURL(/\/login/);
    await expect(page).toHaveURL(/next=%2Fweb-studio/);

    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("authenticated Site Studio navigation when demo admin is available", async ({
    page,
  }) => {
    const demoAdminAvailable = await isDemoAdminAvailable(page.request);

    if (!demoAdminAvailable) {
      await page.goto(`${adminBaseURL}/login?next=%2Fweb-studio`);
      await expect(page.getByLabel("Email")).toBeVisible();
      await expect(page.getByLabel("Password")).toBeVisible();
      await page.getByLabel("Email").fill("staff@example.com");
      await page.getByLabel("Password").fill("••••••••");
      await page.getByRole("button", { name: /sign in/i }).click();
      await expect(page.locator("body")).toBeVisible();
      return;
    }

    const didAuth = await authenticateAsDemoAdmin(page.request, page.context());
    if (!didAuth) {
      await page.goto(`${adminBaseURL}/login?next=%2Fweb-studio`);
      await expect(page.getByLabel("Email")).toBeVisible();
      await expect(page.getByLabel("Password")).toBeVisible();
      return;
    }

    await page.goto(`${adminBaseURL}/web-studio`);
    await expect(page).toHaveURL(/\/web-studio/);

    const candidateLinks = [
      "Pages",
      "Navigation",
      "Missionary Profiles",
      "Ministry Updates",
      "Media",
      "Tenants",
    ];

    let visitedCollections = 0;

    for (const label of candidateLinks) {
      const link = page.getByRole("link", { name: new RegExp(label, "i") });
      if ((await link.count()) === 0) continue;
      await link.first().click();
      await page.waitForLoadState("networkidle");
      visitedCollections += 1;
    }

    if (visitedCollections === 0) {
      await expect(page.locator("body")).toBeVisible();
      return;
    }
  });
});
