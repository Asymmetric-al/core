import { expect, test } from "@playwright/test";

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;
const expectedPostLoginPath = process.env.E2E_EXPECTED_POST_LOGIN_PATH;
const protectedPath = process.env.E2E_PROTECTED_PATH;
const expectedProtectedPath = process.env.E2E_EXPECTED_PROTECTED_PATH;

test("permissions guard flow", async ({ page }) => {
  test.skip(
    !email ||
      !password ||
      !expectedPostLoginPath ||
      !protectedPath ||
      !expectedProtectedPath,
    "Set E2E_EMAIL, E2E_PASSWORD, E2E_EXPECTED_POST_LOGIN_PATH, E2E_PROTECTED_PATH, E2E_EXPECTED_PROTECTED_PATH.",
  );

  await page.goto("/login");
  await page.fill("#email", email!);
  await page.fill("#password", password!);
  await page.getByRole("button", { name: "Sign In" }).click();

  await page.waitForURL((url) => !url.pathname.startsWith("/login"), {
    timeout: 20000,
  });
  await page.waitForTimeout(1500);
  await expect
    .poll(() => new URL(page.url()).pathname, { timeout: 20000 })
    .toBe(expectedPostLoginPath!);

  await page.goto(protectedPath!, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await expect
    .poll(() => new URL(page.url()).pathname, { timeout: 20000 })
    .toBe(expectedProtectedPath!);
});
