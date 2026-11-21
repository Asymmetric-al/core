import { expect, test } from "@playwright/test";

import {
  AUTH_MAIL_SECOND_TENANT_ID,
  AUTH_MAIL_TENANT_ID,
  createConfirmedUser,
  deleteUser,
  readAuthMailEnv,
  uniqueTestEmail,
  waitForHydratedForm,
  warmUpRoutes,
  type AuthMailMembership,
} from "./helpers/auth-mail";
import { buildTenantPrefix } from "../../packages/auth/tenant-address";

/**
 * Council round 1, A23: the proxy's real membership read for a person with
 * rows in both of the seed's organizations. On a development server the rows
 * come from the signed test cookie and on the production run from the stub;
 * here they are real rows in a local Supabase stack, read through
 * `public.current_user_assignments()` on the person's own session.
 * Runs under `playwright.auth-mail.config.ts` (`bun run test:e2e:auth-mail`).
 */

const DEMO = AUTH_MAIL_TENANT_ID;
const SECOND = AUTH_MAIL_SECOND_TENANT_ID;
const FOREIGN = "6f1c2a4e-9b3d-4c5e-8f7a-0b1c2d3e4f5a";

/** Each app's row, and how the chooser names the second organization's. */
const SURFACES: Record<
  string,
  {
    rowIn: (tenantId: string) => Exclude<AuthMailMembership, { role: "donor" }>;
    secondChoice: string;
  }
> = {
  // A staff row is named by its role, with its organization (A13).
  "auth-mail-admin": {
    rowIn: (tenantId) => ({
      role: "staff",
      staffRole: "development",
      tenantId,
    }),
    secondChoice: "Harbor Light Mission: Development",
  },
  "auth-mail-missionary": {
    rowIn: (tenantId) => ({ role: "missionary", tenantId }),
    secondChoice: "Open Harbor Light Mission",
  },
};

const env = readAuthMailEnv();

test.beforeAll(async () => {
  const { project } = test.info();
  if (env && SURFACES[project.name] && project.use.baseURL) {
    await warmUpRoutes(project.use.baseURL, [
      "/login",
      "/choose-organization",
      buildTenantPrefix(DEMO, null),
    ]);
  }
});

test("a person in both organizations chooses one, works there, and is refused a third", async ({
  page,
  baseURL,
}, testInfo) => {
  const surface = SURFACES[testInfo.project.name];
  test.skip(!surface, "Mission Control and the missionary workspace only.");
  test.skip(!env, "Needs a local Supabase stack.");
  if (!surface || !env || !baseURL) return;
  const { rowIn } = surface;

  const email = uniqueTestEmail("al2675-two-organizations");
  const password = "two organizations phrase";
  const userId = await createConfirmedUser(env, {
    email,
    password,
    membership: rowIn(DEMO),
    moreMemberships: [rowIn(SECOND)],
  });

  try {
    await page.goto("/login");
    await waitForHydratedForm(page);
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();

    // Two organizations and no address naming one: the chooser, with the
    // organizations' names from the person's own session.
    await expect(page).toHaveURL(/\/choose-organization/, { timeout: 90_000 });
    await expect(
      page.getByRole("heading", { name: "Choose an organization" }),
    ).toBeVisible();
    const second = page.getByRole("link", { name: surface.secondChoice });
    await expect(second).toBeVisible();

    // Choosing loads the organization's address as a new document, where the
    // proxy reads the rows again and renders the page in that organization.
    await second.click();
    const secondHome = buildTenantPrefix(SECOND, null);
    await expect(page).toHaveURL((url) => url.pathname === secondHome, {
      timeout: 90_000,
    });
    await expect(page.locator("[data-tenant-scope]")).toHaveAttribute(
      "data-tenant-scope",
      secondHome,
    );

    // The other organization's address opens too; a third is refused.
    const demoHome = buildTenantPrefix(DEMO, null);
    await page.goto(demoHome);
    await expect(page.locator("[data-tenant-scope]")).toHaveAttribute(
      "data-tenant-scope",
      demoHome,
      { timeout: 90_000 },
    );
    const foreign = await page.request.get(buildTenantPrefix(FOREIGN, null), {
      maxRedirects: 0,
    });
    expect(foreign.status()).toBe(307);
    expect(new URL(foreign.headers()["location"]!, baseURL).pathname).toBe(
      "/no-access",
    );
  } finally {
    await deleteUser(env, userId);
  }
});
