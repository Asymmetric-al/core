import { expect, test } from "@playwright/test";

import { P_EMAIL, proofReady } from "./helpers/n2-on";

test.skip(
  !proofReady() || !process.env.N2_ON_OPERATIONS_URL,
  "run through bun run test:e2e:n2-on",
);

test("on the operations address only sign-in answers unstamped, and sign-in lands on /admin/operator whatever next says", async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: process.env.N2_ON_OPERATIONS_URL,
  });
  const page = await context.newPage();
  try {
    for (const path of [
      "/admin/donors",
      "/admin/web-studio",
      "/admin/forgot-password",
    ]) {
      const refused = await page.goto(path);
      expect(refused?.status(), path).toBe(403);
      expect(refused?.headers()["cache-control"] ?? "", path).toContain(
        "no-store",
      );
    }

    const login = await page.goto("/admin/login?next=%2Fdonors");
    expect(login?.status()).toBe(200);
    const button = page.getByRole("button", { name: /^Sign in$/ });
    await expect(button).toBeVisible();
    await page.getByLabel("Email", { exact: true }).fill(P_EMAIL);
    await page.locator("#password").fill(process.env.N2_ON_PASSWORD ?? "");
    await button.click();
    await page.waitForURL((url) => url.pathname === "/admin/operator");

    const operator = await page.goto("/admin/operator");
    expect(operator?.status(), "P is not on the operator list").toBe(404);

    await page.goto("/admin/login?next=%2Fdonors");
    expect(new URL(page.url()).pathname).toBe("/admin/operator");

    const signOut = await page.evaluate(async () => {
      const response = await fetch("/admin/api/auth/signout", {
        method: "POST",
      });
      return response.status;
    });
    expect(signOut).toBe(200);
  } finally {
    await context.close();
  }
});
