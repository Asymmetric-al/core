import { expect, test, type Page } from "@playwright/test";

import { installDemoSessionInBrowser } from "./helpers/install-demo-session";

async function gotoHealthyHomepage(page: Page) {
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");
  await expect(page.locator("#__next_error__")).toHaveCount(0);
  await expect(page.locator("#hero-heading")).toBeVisible();
}

test.describe("Donation flow", () => {
  test("home page loads", async ({ page }) => {
    await gotoHealthyHomepage(page);
    await expect(page).toHaveTitle(/GiveHope/i);

    const byRole = page.getByRole("link", { name: /donate|give|support/i });
    if ((await byRole.count()) > 0) {
      await expect(byRole.first()).toBeVisible();
      return;
    }

    await expect(page.getByText(/donate|give|support/i).first()).toBeVisible();
  });

  test("signed-out checkout goes to sign-in, keeps the gift, and never reaches payment UI or API", async ({
    page,
  }) => {
    const donateApiRequests: string[] = [];

    page.on("request", (request) => {
      const requestUrl = new URL(request.url());
      if (requestUrl.pathname === "/api/donate") {
        donateApiRequests.push(request.url());
      }
    });

    await page.goto(
      "/checkout?amount=100&workerId=miss-001&missionary_id=20000000-0000-0000-0000-000000000001&fund_id=40000000-0000-0000-0000-000000000001",
      {
        waitUntil: "domcontentloaded",
      },
    );

    await page.waitForURL((url) => url.pathname === "/login");
    const redirectedUrl = new URL(page.url());
    expect(redirectedUrl.searchParams.get("next")).toBe(
      "/checkout?amount=100&workerId=miss-001&missionary_id=20000000-0000-0000-0000-000000000001&fund_id=40000000-0000-0000-0000-000000000001",
    );
    await expect(page.getByText(/sign in to finish your gift/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /your gift/i })).toHaveCount(
      0,
    );
    await expect(
      page.getByRole("heading", { name: /secure payment/i }),
    ).toHaveCount(0);
    expect(donateApiRequests).toHaveLength(0);
  });

  test("with giving off, a signed-in donor's checkout says giving is unavailable and offers no payment", async ({
    page,
  }) => {
    const session = await installDemoSessionInBrowser(page, "donor");
    test.skip(
      !session.ok,
      `Donor demo session unavailable: POST /api/auth/demo-account returned ${session.status}.`,
    );
    const donatePosts: string[] = [];
    page.on("request", (request) => {
      if (
        request.method() === "POST" &&
        new URL(request.url()).pathname === "/api/donate"
      )
        donatePosts.push(request.url());
    });
    const configAnswer = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        new URL(response.url()).pathname === "/api/checkout/config",
    );

    await page.goto(
      "/checkout?amount=100&missionary_id=20000000-0000-0000-0000-000000000001",
    );

    await expect(page).toHaveURL(/\/checkout/);
    expect((await configAnswer).status()).toBe(503);
    await expect(
      page.getByText(/We can't take this gift online right now/),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /^Give \$/ })).toHaveCount(0);
    expect(donatePosts).toHaveLength(0);
  });
});
