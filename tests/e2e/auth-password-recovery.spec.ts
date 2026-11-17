import { expect, test, type Page } from "@playwright/test";

import {
  createConfirmedUser,
  deleteUser,
  passwordSignInStatus,
  readAuthMailEnv,
  uniqueTestEmail,
  waitForAuthEmailLink,
  warmUpAuthMailer,
} from "./helpers/auth-mail";

/**
 * WP0b acceptance: a password recovery email round trip succeeds in each
 * app. Runs under `playwright.auth-mail.config.ts`, against a local Supabase
 * stack and its mail catcher; skipped anywhere else.
 */

const SURFACES: Record<string, { profileRole: string; homePath: string }> = {
  "auth-mail-donor": { profileRole: "donor", homePath: "/donor-dashboard" },
  "auth-mail-admin": { profileRole: "staff", homePath: "/" },
  "auth-mail-missionary": { profileRole: "missionary", homePath: "/" },
};

const env = readAuthMailEnv();

/**
 * Waits until the dev server has stopped sending the page's code, so the form
 * is hydrated. Text typed into a server-rendered field before hydration is
 * dropped when React takes the field over, which on a slow first compile made
 * the reset request go out with no address.
 */
async function waitForHydratedForm(page: Page) {
  await page.waitForLoadState("networkidle");
}

test.beforeAll(async () => {
  if (env && SURFACES[test.info().project.name]) {
    await warmUpAuthMailer(env);
  }
});

test("a recovery email round trip ends signed in with the new password", async ({
  browser,
  page,
  baseURL,
}, testInfo) => {
  const surface = SURFACES[testInfo.project.name];
  test.skip(!surface, "Runs only under playwright.auth-mail.config.ts.");
  test.skip(!env, "Needs a local Supabase stack and its mail catcher.");
  if (!surface || !env || !baseURL) return;

  const email = uniqueTestEmail(`wp0b-recovery-${surface.profileRole}`);
  const oldPassword = "old recovery phrase";
  const newPassword = "new recovery phrase";
  const userId = await createConfirmedUser(env, {
    email,
    password: oldPassword,
    profileRole: surface.profileRole,
  });
  const home = new URL(surface.homePath, baseURL).toString();

  try {
    // Ask for the link from the sign-in screen.
    await page.goto("/login");
    await waitForHydratedForm(page);
    await page.getByRole("link", { name: "Forgot password?" }).click();
    await expect(page).toHaveURL(/\/forgot-password$/);
    await waitForHydratedForm(page);
    // By role, which skips hidden elements: Next keeps the sign-in screen
    // mounted but hidden after the client navigation, with its own Email field.
    await page.getByRole("textbox", { name: "Email" }).fill(email);
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.getByRole("status")).toContainText(
      `If an account uses ${email}`,
    );

    // The email returns to the callback on the host it was asked from.
    const link = await waitForAuthEmailLink(env, {
      to: email,
      subject: /reset/i,
    });
    expect(link.searchParams.get("type")).toBe("recovery");
    expect(link.searchParams.get("redirect_to")).toBe(
      new URL("/forgot-password/callback", baseURL).toString(),
    );

    await page.goto(link.toString());
    await expect(page).toHaveURL(/\/forgot-password\/reset$/);
    await expect(
      page.getByRole("heading", { name: "Choose a new password" }),
    ).toBeVisible();
    await expect(page.getByText(`For ${email}.`)).toBeVisible();
    await waitForHydratedForm(page);
    await page.getByLabel("New password", { exact: true }).fill(newPassword);
    await page.getByLabel("Confirm new password").fill(newPassword);
    await page.getByRole("button", { name: "Save new password" }).click();

    // Signed in, in the app, on the same host.
    await expect(page).toHaveURL(home);

    // The new password works and the old one no longer does.
    expect(await passwordSignInStatus(env, email, newPassword)).toBe(200);
    expect(await passwordSignInStatus(env, email, oldPassword)).toBe(400);

    // A fresh browser signs in through the app with the new password.
    const fresh = await browser.newContext({ baseURL });
    try {
      const signIn = await fresh.newPage();
      await signIn.goto("/login");
      await waitForHydratedForm(signIn);
      await signIn.getByLabel("Email").fill(email);
      await signIn.getByLabel("Password", { exact: true }).fill(newPassword);
      await signIn.getByRole("button", { name: "Sign in" }).click();
      await expect(signIn).toHaveURL(home);

      // The link works once: opened again, in a browser with no recovery
      // session, it explains and offers a new link.
      const reuse = await fresh.newPage();
      await fresh.clearCookies();
      await reuse.goto(link.toString());
      // Auth reports the used link in the fragment, which survives the redirect.
      await expect(reuse).toHaveURL(/\/forgot-password\/reset(#error=.*)?$/);
      await expect(
        reuse.getByRole("heading", { name: "This link has expired" }),
      ).toBeVisible();
      await expect(
        reuse.getByRole("link", { name: "Send a new link" }),
      ).toHaveAttribute("href", "/forgot-password");
    } finally {
      await fresh.close();
    }
  } finally {
    await deleteUser(env, userId);
  }
});
