import { expect, test } from "@playwright/test";

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;
const expectedHomePath = process.env.E2E_EXPECTED_HOME_PATH;
const expectedPostSignOutPath =
  process.env.E2E_EXPECTED_SIGNOUT_PATH || "/login";

test("session guard flow: login, persistence, /login redirect, sign out", async ({
  page,
}) => {
  test.skip(
    !email || !password || !expectedHomePath,
    "Set E2E_EMAIL, E2E_PASSWORD, and E2E_EXPECTED_HOME_PATH.",
  );

  await page.goto("/login");
  await page.fill("#email", email!);
  await page.fill("#password", password!);
  await page.getByRole("button", { name: "Sign In" }).click();

  await page.waitForURL((url) => !url.pathname.startsWith("/login"), {
    timeout: 20000,
  });
  await expect
    .poll(() => new URL(page.url()).pathname, { timeout: 20000 })
    .toBe(expectedHomePath!);

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect
    .poll(() => new URL(page.url()).pathname, { timeout: 20000 })
    .toBe(expectedHomePath!);

  await page.goto("/login");
  await expect
    .poll(() => new URL(page.url()).pathname, { timeout: 20000 })
    .toBe(expectedHomePath!);

  const profileMenu = page.getByRole("button", { name: "Open profile menu" });
  const accountMenu = page.getByTestId("account-menu").first();
  if (await profileMenu.isVisible().catch(() => false)) {
    await profileMenu.click();
  } else if (await accountMenu.isVisible().catch(() => false)) {
    await accountMenu.click();
  }
  const signOutButton = page.getByTestId("auth-signout").first();
  await expect(signOutButton).toBeVisible({ timeout: 10000 });
  await signOutButton.click();

  await expect
    .poll(() => new URL(page.url()).pathname, { timeout: 20000 })
    .toBe(expectedPostSignOutPath);
});
