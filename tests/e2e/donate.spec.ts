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

  test("unauthenticated checkout access redirects home before payment UI or API interaction", async ({
    page,
  }) => {
    const donateApiRequests: string[] = [];

    page.on("request", (request) => {
      const requestUrl = new URL(request.url());
      if (requestUrl.pathname === "/api/donate") {
        donateApiRequests.push(request.url());
      }
    });

    await page.goto("/checkout?amount=100&workerId=worker_1&fund_id=fund_1", {
      waitUntil: "domcontentloaded",
    });

    await page.waitForURL((url) => url.pathname === "/" && url.search === "");
    const redirectedUrl = new URL(page.url());
    expect(redirectedUrl.pathname).toBe("/");
    expect(redirectedUrl.search).toBe("");
    await expect(page.getByRole("heading", { name: /your gift/i })).toHaveCount(
      0,
    );
    await expect(
      page.getByRole("heading", { name: /secure payment/i }),
    ).toHaveCount(0);
    expect(donateApiRequests).toHaveLength(0);
  });

  test("authenticated checkout path still reaches the payment step", async ({
    page,
  }) => {
    const session = await installDemoSessionInBrowser(page, "donor");
    test.skip(
      !session.ok,
      `Donor demo session unavailable: POST /api/auth/demo-account returned ${session.status}.`,
    );

    await page.goto("/checkout?amount=100&workerId=worker_1");

    await expect(page).toHaveURL(/\/checkout/);
    await expect(
      page.getByRole("heading", { name: /your gift/i }),
    ).toBeVisible();

    await page.getByRole("button", { name: /next step/i }).click();
    await page.getByLabel(/first name/i).fill("Ada");
    await page.getByLabel(/last name/i).fill("Lovelace");
    await page.getByLabel(/email address/i).fill("ada@example.com");
    await page.getByRole("button", { name: /continue to payment/i }).click();

    await expect(
      page.getByRole("heading", { name: /secure payment/i }),
    ).toBeVisible();
  });
});
