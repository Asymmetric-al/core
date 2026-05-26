import {
  expect,
  type Locator,
  type Page,
  type TestInfo,
} from "@playwright/test";

/**
 * A positive authenticated-state marker. Each surface passes one of these in
 * so the login helper can confirm auth by waiting for a known authenticated
 * DOM element, not just by polling the URL.
 *
 * Example: `(page) => page.getByRole("heading", { name: /dashboard/i })`.
 */
export type AuthMarker = (page: Page) => Locator;

/**
 * Shared helpers for headless development-deployment smoke tests.
 *
 * Secrets stay inside the Playwright process — credentials are read once from
 * environment variables (injected by `.claude/local-bin/asym-qa headless …`
 * from `.claude/settings.local.json`), passed straight to Playwright's `fill`,
 * and never logged.
 */

export type QaCredentials = {
  readonly email: string;
  readonly password: string;
};

/**
 * Read QA credentials from env. Throws a clean error that names the missing
 * variable but never echoes any value.
 */
export function getQaCredentials(): QaCredentials {
  const email = process.env.QA_TEST_EMAIL;
  const password = process.env.QA_TEST_PASSWORD;

  if (!email) {
    throw new Error(
      "Missing QA_TEST_EMAIL. Set it in .claude/settings.local.json (env object).",
    );
  }
  if (!password) {
    throw new Error(
      "Missing QA_TEST_PASSWORD. Set it in .claude/settings.local.json (env object).",
    );
  }

  return { email, password };
}

/**
 * Quick check: is the current URL a /login page?
 */
export function isOnLoginRoute(page: Page): boolean {
  try {
    return new URL(page.url()).pathname.startsWith("/login");
  } catch {
    return false;
  }
}

/**
 * Clear the email and password fields, then fill them with the provided
 * credentials. Uses Playwright's `fill()` which always sets the full value
 * (no duplication risk), but we still explicitly clear first to match the
 * Cmd+A / Delete pattern proven safe in the visible-Chrome flow.
 */
async function fillLoginFields(
  page: Page,
  credentials: QaCredentials,
): Promise<void> {
  const emailInput = page
    .getByLabel(/email/i)
    .or(page.locator('input[type="email"]'))
    .first();
  const passwordInput = page
    .getByLabel(/password/i)
    .or(page.locator('input[type="password"]:not([aria-hidden="true"])'))
    .first();

  await emailInput.waitFor({ state: "visible", timeout: 30_000 });
  await emailInput.fill("");
  await emailInput.fill(credentials.email);

  await passwordInput.waitFor({ state: "visible", timeout: 30_000 });
  await passwordInput.fill("");
  await passwordInput.fill(credentials.password);

  // Sanity assertions on field state — verify shape only, never the value.
  await expect(emailInput).toHaveValue(/.+@.+/);
  expect(await passwordInput.inputValue()).not.toEqual("");
}

/**
 * Submit the visible "Sign In" / "Log in" button on the login form.
 */
async function clickSubmit(page: Page): Promise<void> {
  const submit = page
    .getByRole("button", { name: /^(sign in|log ?in)$/i })
    .first();
  await submit.click();
}

/**
 * Look for the visible "Invalid login credentials" toast/text that the app's
 * login form renders on rejection.
 */
async function rejectionVisible(page: Page): Promise<boolean> {
  try {
    return await page
      .getByText(/invalid login credentials/i)
      .first()
      .isVisible({ timeout: 3_000 });
  } catch {
    return false;
  }
}

/**
 * Wait for authentication to land. If an `authenticatedMarker` is supplied,
 * confirmation is positive (a known authenticated DOM element becomes
 * visible) and the URL-stability dance is unnecessary. If no marker is
 * supplied, fall back to "URL leaves /login and stays off /login for a short
 * stability window" — usable but inherently racier than a positive marker.
 *
 * Throws on timeout. The caller (loginThroughForm) decides whether to retry.
 */
async function waitForAuthenticatedState(
  page: Page,
  options: {
    timeoutMs?: number;
    stabilityWindowMs?: number;
    authenticatedMarker?: AuthMarker;
  } = {},
): Promise<void> {
  const timeoutMs = options.timeoutMs ?? 30_000;
  const deadline = Date.now() + timeoutMs;

  if (options.authenticatedMarker) {
    // Wait for URL to leave /login first (fast signal that the submit
    // request resolved), then wait for the positive authenticated marker.
    await page.waitForURL((url) => !url.pathname.startsWith("/login"), {
      timeout: Math.max(1_000, deadline - Date.now()),
    });
    await options
      .authenticatedMarker(page)
      .first()
      .waitFor({
        state: "visible",
        timeout: Math.max(1_000, deadline - Date.now()),
      });
    // If we got the marker but the URL has since bounced back, that's still a
    // failure — the marker may have rendered transiently before the redirect.
    if (isOnLoginRoute(page)) {
      throw new Error(
        "Authenticated marker appeared but page bounced back to /login.",
      );
    }
    return;
  }

  // Legacy fallback: URL leaves /login + small stability window.
  const stabilityWindowMs = options.stabilityWindowMs ?? 2_500;
  while (Date.now() < deadline) {
    const remaining = deadline - Date.now();
    await page.waitForURL((url) => !url.pathname.startsWith("/login"), {
      timeout: Math.max(1_000, remaining),
    });

    const bouncedBack = await page
      .waitForURL((url) => url.pathname.startsWith("/login"), {
        timeout: stabilityWindowMs,
      })
      .then(() => true)
      .catch(() => false);

    if (!bouncedBack) {
      await page
        .waitForLoadState("domcontentloaded", { timeout: 5_000 })
        .catch(() => {});
      return;
    }
  }

  throw new Error(
    "Authenticated state did not stabilize off /login within timeout.",
  );
}

/**
 * Log in via the visible app login form. Retries once if the first attempt
 * doesn't land — either because the form rejected the credentials, or because
 * the page bounced back to /login after a transient redirect. Throws a clean
 * error if still not authenticated after the retry.
 *
 * Call this only when the page is already on `/login` (or has just been
 * redirected there). Use `ensureAuthenticated()` for the higher-level entry.
 */
export async function loginThroughForm(
  page: Page,
  options: { authenticatedMarker?: AuthMarker } = {},
): Promise<void> {
  const credentials = getQaCredentials();
  const { authenticatedMarker } = options;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    await fillLoginFields(page, credentials);
    await clickSubmit(page);

    try {
      await waitForAuthenticatedState(page, {
        authenticatedMarker,
        timeoutMs: 25_000,
      });
      return;
    } catch {
      // First attempt: fall through to retry. Second attempt: handled below.
    }

    if (attempt === 2) break;

    // Decide whether retry is sensible. If the app surfaced a rejection
    // toast, give it one more clean attempt. If we're back on /login without
    // an explicit rejection, that's the post-login bounce — also worth a
    // retry. Anything else (not on /login but marker still missing) is a
    // different kind of failure; do not loop.
    const rejected = await rejectionVisible(page);
    const stillOnLogin = isOnLoginRoute(page);
    if (!rejected && !stillOnLogin) break;
  }

  if (isOnLoginRoute(page)) {
    throw new Error(
      "Login form did not pass auth after a retry. " +
        "App stayed on /login. Treat as login/session issue.",
    );
  }

  // Last-resort marker assertion so the caller never observes a half-authed
  // state. No-op if no marker was provided.
  if (authenticatedMarker) {
    await authenticatedMarker(page).first().waitFor({
      state: "visible",
      timeout: 10_000,
    });
  }
}

/**
 * Ensure the page is past the login screen. Navigates to `targetPath` (default
 * `/`), then logs in only if the app redirects to `/login`. Idempotent — safe
 * to call from multiple specs in the same project.
 *
 * Pass an authenticated-only `targetPath` (e.g. `/donor-dashboard`) on
 * surfaces whose `/` is a public marketing page; that way the login flow
 * fires reliably even when the public landing renders without an auth check.
 *
 * Pass an `authenticatedMarker` to confirm auth by a positive DOM signal
 * (recommended). Without one, the helper falls back to URL-only polling with
 * a short stability window, which is racier on surfaces that flick to `/`
 * then bounce back to `/login` while client-side guards re-check the session.
 *
 * Backward-compatible: `ensureAuthenticated(page, "/donor-dashboard")` still
 * works (string short-hand for `{ targetPath }`).
 */
export async function ensureAuthenticated(
  page: Page,
  pathOrOptions?:
    | string
    | {
        targetPath?: string;
        authenticatedMarker?: AuthMarker;
      },
): Promise<void> {
  const options =
    typeof pathOrOptions === "string"
      ? { targetPath: pathOrOptions }
      : (pathOrOptions ?? {});
  const targetPath = options.targetPath ?? "/";

  await page.goto(targetPath);

  // Up to two cycles: try to confirm auth; if `/login` appears (now or during
  // the marker wait), run the login form, then re-confirm. This handles the
  // post-goto race where `page.goto()` resolves before the unauthenticated
  // middleware redirect to `/login` fires.
  for (let cycle = 1; cycle <= 2; cycle += 1) {
    await page.waitForLoadState("domcontentloaded").catch(() => {});
    // Give any in-flight unauthenticated redirect a chance to manifest before
    // sampling the URL, without using a fixed sleep.
    await page
      .waitForURL((url) => url.pathname.startsWith("/login"), {
        timeout: 300,
      })
      .catch(() => {});

    if (isOnLoginRoute(page)) {
      await loginThroughForm(page, {
        authenticatedMarker: options.authenticatedMarker,
      });
      // loginThroughForm asserts the marker (if provided) before returning.
      break;
    }

    if (options.authenticatedMarker) {
      try {
        await options
          .authenticatedMarker(page)
          .first()
          .waitFor({ state: "visible", timeout: 15_000 });
        break;
      } catch (err) {
        // If the wait failed because the page redirected to /login, loop and
        // run the login form on the next cycle. Otherwise the failure is real.
        if (isOnLoginRoute(page) && cycle === 1) continue;
        throw err;
      }
    }

    // No marker provided and not on /login — accept as authenticated.
    break;
  }

  // Final defensive check — should never still be on /login at this point.
  expect(isOnLoginRoute(page)).toBeFalsy();
}

/**
 * Common assertion: no visible login form remains on the current page.
 */
export async function assertNoVisibleLoginPrompt(page: Page): Promise<void> {
  const visiblePassword = page.locator(
    'input[type="password"]:visible:not([aria-hidden="true"])',
  );
  await expect(visiblePassword).toHaveCount(0);
}

/**
 * Common assertion: no visible role=alert error banner on the page.
 *
 * Intentionally narrow — only counts `[role="alert"]` with non-empty text.
 * Skeleton / loading placeholders and toast notifications without role=alert
 * are not flagged here.
 */
export async function assertNoErrorBanner(page: Page): Promise<void> {
  const alerts = page.locator('[role="alert"]:has(:not(:empty))');
  await expect(alerts).toHaveCount(0);
}

/**
 * Capture compact, non-secret evidence on failure. Attaches:
 *  - current URL
 *  - page title
 *  - main heading text (first h1/h2/h3)
 *  - count of password inputs still in the DOM
 *  - screenshot (Playwright also retains one via `screenshot: only-on-failure`)
 *
 * Never reads or attaches input values. Call from a `test.afterEach` block
 * when `testInfo.status !== testInfo.expectedStatus`.
 */
export async function collectFailureEvidence(
  page: Page,
  testInfo: TestInfo,
): Promise<void> {
  if (testInfo.status === testInfo.expectedStatus) return;

  const evidence = await page
    .evaluate(() => ({
      url: location.href,
      title: document.title,
      heading:
        document.querySelector("h1,h2,h3")?.textContent?.trim().slice(0, 120) ??
        null,
      visiblePasswordInputs: Array.from(
        document.querySelectorAll('input[type="password"]'),
      ).filter((el) => {
        const e = el as HTMLElement;
        return !!(e.offsetWidth || e.offsetHeight);
      }).length,
    }))
    .catch(() => ({
      url: null,
      title: null,
      heading: null,
      visiblePasswordInputs: null,
    }));

  await testInfo.attach("evidence.json", {
    body: JSON.stringify(evidence, null, 2),
    contentType: "application/json",
  });
}
