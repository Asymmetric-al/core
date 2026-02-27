import { expect, test } from "@playwright/test";

const registrationEnabled = process.env.E2E_REGISTRATION_ENABLED === "true";

test("registration policy UI", async ({ page }) => {
  await page.goto("/register");

  if (registrationEnabled) {
    await expect(page.getByLabel("First Name")).toBeVisible();
    await expect(page.getByLabel("Last Name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Create Account" })).toBeVisible();

    // Public registration must not expose privileged role selection.
    await expect(page.getByText("I am a...")).toHaveCount(0);
    await expect(page.getByText("Administrator")).toHaveCount(0);
    await expect(page.getByText("Staff")).toHaveCount(0);
    return;
  }

  await expect(
    page.getByText("Self-service registration is not available for this portal."),
  ).toBeVisible();
});
