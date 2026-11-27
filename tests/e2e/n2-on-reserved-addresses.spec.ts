import { expect, test } from "@playwright/test";

test("reserved public addresses show the not-found page with HTTP 404", async ({
  page,
}) => {
  for (const path of [
    "/api/nope",
    "/auth/nope",
    "/web-studio/x",
    "/invite/x",
  ]) {
    await test.step(path, async () => {
      const response = await page.goto(path);
      expect.soft(response?.status(), path).toBe(404);
      await expect
        .soft(
          page.getByRole("heading", {
            name: /page (?:could )?not (?:be )?found/i,
          }),
        )
        .toBeVisible();
    });
  }
});
