import { expect, test } from "@playwright/test";

import { P_EMAIL, Q_EMAIL, proofReady, signIn } from "./helpers/n2-on";

test.skip(!proofReady(), "run through bun run test:e2e:n2-on");

for (const base of ["", "/missionary"]) {
  test(`a second person signing in at ${base}/login cannot paste the first person's Web Studio copy`, async ({
    page,
  }) => {
    await signIn(page, P_EMAIL);
    await page.evaluate(() =>
      localStorage.setItem("_payloadClipboard", "first person's copied block"),
    );
    await page.context().clearCookies();
    await page.goto(base + "/login");
    await page.getByLabel("Email", { exact: true }).fill(Q_EMAIL);
    await page.locator("#password").fill(process.env.N2_ON_PASSWORD ?? "");
    await page.getByRole("button", { name: /^Sign in$/ }).click();
    await page.waitForURL((url) => !url.pathname.endsWith("/login"));
    await page.goto("/admin/workers");
    await expect(page.locator("[data-tenant-scope]").first()).toBeAttached();
    await expect
      .poll(() =>
        page.evaluate(() => localStorage.getItem("_payloadClipboard")),
      )
      .toBeNull();
  });
}
