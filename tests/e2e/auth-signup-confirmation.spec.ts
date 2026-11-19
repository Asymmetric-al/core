import { expect, test } from "@playwright/test";

import {
  deleteUser,
  findUserIdByEmail,
  passwordSignInStatus,
  readAuthMailEnv,
  uniqueTestEmail,
  waitForAuthEmailLink,
  waitForHydratedForm,
  warmUpAuthMailer,
  warmUpRoutes,
} from "./helpers/auth-mail";

/**
 * WP1.4 acceptance, on the local stack: a new address registers, receives
 * the confirmation and lands signed in on the host it registered on, shown on
 * two hosts of the donor portal (the one app with open registration). Runs
 * under `playwright.auth-mail.config.ts`; skipped anywhere else.
 */

const env = readAuthMailEnv();

test.beforeAll(async () => {
  const { project } = test.info();
  if (env && project.name === "auth-mail-donor" && project.use.baseURL) {
    await warmUpAuthMailer(env);
    await warmUpRoutes(project.use.baseURL, [
      "/register",
      "/auth/callback",
      "/donor-dashboard",
    ]);
  }
});

// The server listens on 127.0.0.1; localhost reaches the same server under a
// different host, with its own cookies.
const HOSTS = ["localhost", "127.0.0.1"] as const;

for (const host of HOSTS) {
  test(`a new address confirms by email and lands signed in on ${host}`, async ({
    browser,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "auth-mail-donor",
      "Registration is open in the donor portal only.",
    );
    test.skip(!env, "Needs a local Supabase stack and its mail catcher.");
    if (!env) return;

    const projectBase = testInfo.project.use.baseURL;
    if (!projectBase) throw new Error("The donor project has no base URL.");
    const base = new URL(projectBase);
    base.hostname = host;
    const origin = base.origin;
    const otherOrigin = new URL(projectBase);
    otherOrigin.hostname = host === "localhost" ? "127.0.0.1" : "localhost";

    const email = uniqueTestEmail(`wp1-4-signup-${host.replace(/\W/g, "-")}`);
    const password = "confirm me phrase";
    const context = await browser.newContext({ baseURL: origin });
    const page = await context.newPage();

    try {
      await page.goto("/register");
      await waitForHydratedForm(page);
      await page.getByLabel("First name").fill("Wp");
      await page.getByLabel("Last name").fill("Confirm");
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password", { exact: true }).fill(password);
      await page.getByRole("button", { name: "Create account" }).click();
      await expect(page.getByRole("status")).toContainText(
        `we’ve sent a link to ${email}`,
      );

      // Confirmation is required: no session yet, and no password sign-in.
      await expect(page).toHaveURL(`${origin}/register`);
      expect(await passwordSignInStatus(env, email, password)).toBe(400);

      // The email returns to the callback on the host the person registered on.
      const link = await waitForAuthEmailLink(env, {
        to: email,
        subject: /confirm/i,
      });
      expect(link.searchParams.get("type")).toBe("signup");
      expect(link.searchParams.get("redirect_to")).toBe(
        `${origin}/auth/callback`,
      );

      await page.goto(link.toString());
      await expect(page).toHaveURL(`${origin}/donor-dashboard`);

      // Signed in on this host; the other host holds no session.
      const authCookie = (cookies: Array<{ name: string }>) =>
        cookies.some((cookie) =>
          /^sb-.+-auth-token(\.\d+)?$/.test(cookie.name),
        );
      expect(authCookie(await context.cookies(origin))).toBe(true);
      expect(authCookie(await context.cookies(otherOrigin.origin))).toBe(false);
      expect(await passwordSignInStatus(env, email, password)).toBe(200);
    } finally {
      await context.close();
      const userId = await findUserIdByEmail(env, email);
      if (userId) await deleteUser(env, userId);
    }
  });
}
