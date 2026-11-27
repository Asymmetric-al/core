import { expect, test } from "@playwright/test";

import { proofReady } from "./helpers/n2-on";

test.skip(!proofReady(), "run through bun run test:e2e:n2-on");

const RESERVED_PATHS = [
  "/api/nope",
  "/auth/nope",
  "/web-studio/x",
  "/invite/x",
];

test("reserved public addresses show the not-found page", async ({ page }) => {
  for (const path of RESERVED_PATHS) {
    await test.step(path, async () => {
      await page.goto(path);
      await expect(
        page.getByRole("heading", {
          name: /page (?:could )?not (?:be )?found/i,
        }),
      ).toBeVisible();
    });
  }
});

test("reserved public addresses answer HTTP 404 (expected to fail until WP7's third pull request moves admission into the proxy: the public catch-all's prerendered shell is sent with 200)", async ({
  page,
}) => {
  test.fail();
  for (const path of RESERVED_PATHS) {
    expect((await page.goto(path))?.status(), path).toBe(404);
  }
});
