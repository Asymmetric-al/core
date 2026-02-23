import { expect, test } from "@playwright/test";

test.describe("CMS ministry updates surface", () => {
  test("donor homepage remains reachable with CMS integration enabled", async ({
    page,
  }) => {
    const response = await page.goto("/");
    expect(response?.ok()).toBeTruthy();
  });
});
