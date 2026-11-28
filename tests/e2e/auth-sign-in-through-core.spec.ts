import { expect, test, type Page, type Request } from "@playwright/test";

import {
  AUTH_MAIL_TENANT_ID,
  createConfirmedUser,
  deleteUser,
  passwordSignInStatus,
  readAuthMailEnv,
  uniqueTestEmail,
  waitForHydratedForm,
  warmUpRoutes,
  type AuthMailMembership,
} from "./helpers/auth-mail";
import { buildTenantPrefix } from "../../packages/auth/tenant-address";

const TENANT_HOME = buildTenantPrefix(AUTH_MAIL_TENANT_ID, null);

const SURFACES: Record<
  string,
  {
    membership: AuthMailMembership;
    homePath: string;
    passwordPath: string;
    securityTab: boolean;
  }
> = {
  "auth-mail-donor": {
    membership: { role: "donor" },
    homePath: "/donor-dashboard",
    passwordPath: "/donor-dashboard/settings",
    securityTab: true,
  },
  "auth-mail-admin": {
    membership: {
      role: "staff",
      staffRole: "finance",
      tenantId: AUTH_MAIL_TENANT_ID,
    },
    homePath: TENANT_HOME,
    passwordPath: `${TENANT_HOME}/account`,
    securityTab: false,
  },
  "auth-mail-missionary": {
    membership: { role: "missionary", tenantId: AUTH_MAIL_TENANT_ID },
    homePath: TENANT_HOME,
    passwordPath: `${TENANT_HOME}/settings`,
    securityTab: false,
  },
};

const env = readAuthMailEnv();
const PASSWORD = "n4 browser sign-in phrase";
const NEW_PASSWORD = "n4 browser second phrase";

test.beforeAll(async () => {
  const { project } = test.info();
  const surface = SURFACES[project.name];
  if (env && surface && project.use.baseURL) {
    await warmUpRoutes(project.use.baseURL, [
      "/login",
      surface.homePath,
      surface.passwordPath,
    ]);
  }
});

async function signInThroughTheForm(
  page: Page,
  email: string,
  password: string,
) {
  await page.goto("/login");
  await waitForHydratedForm(page);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("the sign-in form sends the password to Core's route alone, and no provider token or user request leaves the browser during sign-in or a signed-in page load (AL-2671 N4)", async ({
  page,
  baseURL,
}, testInfo) => {
  const surface = SURFACES[testInfo.project.name];
  test.skip(!surface, "Runs only under playwright.auth-mail.config.ts.");
  test.skip(!env, "Needs a local Supabase stack.");
  if (!surface || !env || !baseURL) return;

  const email = uniqueTestEmail(`n4-sign-in-${surface.membership.role}`);
  const userId = await createConfirmedUser(env, {
    email,
    password: PASSWORD,
    membership: surface.membership,
  });
  const requests: Request[] = [];
  page.on("request", (request) => requests.push(request));
  try {
    await signInThroughTheForm(page, email, PASSWORD);
    await expect(page).toHaveURL(new URL(surface.homePath, baseURL).toString());
    await page.reload();
    await waitForHydratedForm(page);

    const carriedPassword = requests.filter((request) =>
      (request.postData() ?? "").includes(PASSWORD),
    );
    expect(
      carriedPassword.map((request) => new URL(request.url()).pathname),
    ).toEqual(["/api/auth/sign-in"]);
    expect(new URL(carriedPassword[0]!.url()).origin).toBe(
      new URL(baseURL).origin,
    );
    const toTheProvider = requests
      .map((request) => new URL(request.url()))
      .filter(
        (url) =>
          url.origin === new URL(env.supabaseUrl).origin &&
          url.pathname.startsWith("/auth/v1/"),
      )
      .map((url) => url.pathname);
    expect(toTheProvider).toEqual([]);
    expect(
      requests.some((request) =>
        new URL(request.url()).pathname.endsWith("/api/auth/session"),
      ),
    ).toBe(true);
  } finally {
    await deleteUser(env, userId);
  }
});

test("each surface changes the password only by the current one (AL-2671 N4)", async ({
  page,
  baseURL,
}, testInfo) => {
  const surface = SURFACES[testInfo.project.name];
  test.skip(!surface, "Runs only under playwright.auth-mail.config.ts.");
  test.skip(!env, "Needs a local Supabase stack.");
  if (!surface || !env || !baseURL) return;

  const email = uniqueTestEmail(`n4-change-${surface.membership.role}`);
  const userId = await createConfirmedUser(env, {
    email,
    password: PASSWORD,
    membership: surface.membership,
  });
  try {
    await signInThroughTheForm(page, email, PASSWORD);
    await expect(page).toHaveURL(new URL(surface.homePath, baseURL).toString());
    await page.goto(surface.passwordPath);
    await waitForHydratedForm(page);
    if (surface.securityTab) {
      await page.getByRole("tab", { name: /security/i }).click();
    }
    const form = page.getByRole("form", { name: "Change password" });
    await expect(form).toBeVisible();

    await form.getByLabel("Current password").fill("n4 not the phrase");
    await form.getByLabel("New password", { exact: true }).fill(NEW_PASSWORD);
    await form.getByLabel("Confirm new password").fill(NEW_PASSWORD);
    await form.getByRole("button", { name: "Change password" }).click();
    await expect(
      form.getByText("That isn’t your current password."),
    ).toBeVisible();
    expect(await passwordSignInStatus(env, email, PASSWORD)).toBe(200);

    await form.getByLabel("Current password").fill(PASSWORD);
    await form.getByRole("button", { name: "Change password" }).click();
    await expect(form.getByRole("status")).toContainText(
      "Your password has been changed.",
    );
    expect(await passwordSignInStatus(env, email, NEW_PASSWORD)).toBe(200);
    expect(await passwordSignInStatus(env, email, PASSWORD)).toBe(400);
  } finally {
    await deleteUser(env, userId);
  }
});
