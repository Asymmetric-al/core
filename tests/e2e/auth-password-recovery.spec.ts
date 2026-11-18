import { expect, test, type Page } from "@playwright/test";

import {
  AUTH_MAIL_TENANT_ID,
  createConfirmedUser,
  deleteUser,
  passwordSignInStatus,
  readAuthMailEnv,
  uniqueTestEmail,
  waitForAuthEmailLink,
  waitForHydratedForm,
  warmUpAuthMailer,
  warmUpRoutes,
  type AuthMailMembership,
} from "./helpers/auth-mail";
import { buildTenantPrefix } from "../../packages/auth/tenant-address";

/**
 * WP0b acceptance: a password recovery email round trip succeeds in each
 * app. Runs under `playwright.auth-mail.config.ts`, against a local Supabase
 * stack and its mail catcher; skipped anywhere else.
 */

/**
 * Each app's person holds the membership that app admits, in the demo
 * organization. Mission Control and the missionary workspace land a person
 * with one row of their class on that organization's tenant address (AL-2675).
 */
const TENANT_HOME = buildTenantPrefix(AUTH_MAIL_TENANT_ID, null);
const SURFACES: Record<
  string,
  { membership: AuthMailMembership; homePath: string }
> = {
  "auth-mail-donor": {
    membership: { role: "donor" },
    homePath: "/donor-dashboard",
  },
  "auth-mail-admin": {
    membership: {
      role: "staff",
      staffRole: "development",
      tenantId: AUTH_MAIL_TENANT_ID,
    },
    homePath: TENANT_HOME,
  },
  "auth-mail-missionary": {
    membership: { role: "missionary", tenantId: AUTH_MAIL_TENANT_ID },
    homePath: TENANT_HOME,
  },
};

const env = readAuthMailEnv();

/** On a tenant address, the page rendered with that address's document scope. */
async function expectTenantPage(page: Page, homePath: string) {
  if (homePath !== TENANT_HOME) return;
  await expect(page.locator("[data-tenant-scope]")).toHaveCount(1);
  await expect(page.locator("[data-tenant-scope]")).toHaveAttribute(
    "data-tenant-scope",
    TENANT_HOME,
  );
}

test.beforeAll(async () => {
  const { project } = test.info();
  const surface = SURFACES[project.name];
  if (env && surface && project.use.baseURL) {
    await warmUpAuthMailer(env);
    await warmUpRoutes(project.use.baseURL, [
      "/login",
      "/forgot-password",
      "/forgot-password/reset",
      surface.homePath,
    ]);
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

  const email = uniqueTestEmail(`wp0b-recovery-${surface.membership.role}`);
  const oldPassword = "old recovery phrase";
  const newPassword = "new recovery phrase";
  const userId = await createConfirmedUser(env, {
    email,
    password: oldPassword,
    membership: surface.membership,
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

    // Signed in, in the app, on the same host, and the page rendered in the
    // organization its address names: a 500 there would keep the URL
    // (council round 1, A23).
    await expect(page).toHaveURL(home);
    await expectTenantPage(page, surface.homePath);

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
      await expectTenantPage(signIn, surface.homePath);

      // The link works once: opened again, in a browser with no recovery
      // session, it explains and offers a new link.
      const reuse = await fresh.newPage();
      await fresh.clearCookies();
      await reuse.goto(link.toString());
      // Auth reports the used link in the fragment, which survives the
      // redirect. The fragment is required: without it this browser would
      // reach the same page only because it holds no recovery session, and
      // the journey would pass with a link that works twice.
      await expect(reuse).toHaveURL(/\/forgot-password\/reset#error=.*$/);
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
