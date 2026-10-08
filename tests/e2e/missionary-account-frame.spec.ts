import AxeBuilder from "@axe-core/playwright";
import { instant } from "@next/playwright";
import { expect, test, type Page, type TestInfo } from "@playwright/test";

/**
 * Run against the Missionary application with playwright.missionary.config.ts.
 * The full suite uses next dev and run-with-ci-env.mjs's non-production demo
 * fixture, not a provider session. Production rigs can run the account-links
 * case with INSTANT_NAV_RIG=1; NODE_ENV=production intentionally disables the
 * fixture. Authenticated /login redirects require a real Supabase user.
 */
async function expectStandaloneAccountFrame(page: Page) {
  // AppHeader and DashboardFooter are nested inside SidebarInset's main, so
  // banner/contentinfo roles alone would miss the original unwanted shell.
  await expect(page.locator("header, footer")).toHaveCount(0);
  await expect(page.locator('[data-slot="sidebar-wrapper"]')).toHaveCount(0);
  await expect(page.locator('[data-slot="sidebar"]')).toHaveCount(0);
  await expect(page.locator('[data-slot="sidebar-inset"]')).toHaveCount(0);
  await expect(page.getByTestId("auth-signout")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Search missionary pages" }),
  ).toHaveCount(0);
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.locator("main main")).toHaveCount(0);
}

async function expectFullViewportMain(page: Page) {
  const viewport = page.viewportSize()!;
  const main = await page.getByRole("main").boundingBox();
  expect(main).not.toBeNull();
  expect(main!.x).toBe(0);
  expect(main!.y).toBe(0);
  expect(main!.width).toBe(viewport.width);
  expect(main!.height).toBeGreaterThanOrEqual(viewport.height);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    viewport.width,
  );
}

async function capture(page: Page, testInfo: TestInfo, name: string) {
  const path = testInfo.outputPath(`${name}.png`);
  await page.screenshot({ path, fullPage: true });
  await testInfo.attach(name, { path, contentType: "image/png" });
}

async function enterDemoWorkspace(page: Page, next = "/") {
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  await page.getByRole("button", { name: "Demo Access" }).click();
  await page.waitForURL((url) => `${url.pathname}${url.search}` === next);
  await expect(page.getByTestId("auth-signout")).toBeVisible();
}

function watchHydrationErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /hydration|did not match/i.test(message.text())
    ) {
      errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    if (/hydration|did not match/i.test(error.message))
      errors.push(error.message);
  });
  return errors;
}

for (const viewport of [
  { name: "desktop", width: 1280, height: 800 },
  { name: "mobile", width: 390, height: 844 },
]) {
  test(`anonymous login fills the ${viewport.name} viewport without workspace chrome`, async ({
    page,
  }, testInfo) => {
    const hydrationErrors = watchHydrationErrors(page);
    await page.setViewportSize(viewport);
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
    await expectStandaloneAccountFrame(page);
    await expectFullViewportMain(page);
    await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    await page.getByLabel("Email", { exact: true }).focus();
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "Forgot password?" }),
    ).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("Password", { exact: true })).toBeFocused();
    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
    expect(hydrationErrors).toEqual([]);
    await capture(page, testInfo, `login-${viewport.name}`);
  });
}

test.describe("initial server account frame", () => {
  test.use({ javaScriptEnabled: false });

  for (const route of [
    { path: "/login", label: "Loading sign-in" },
    { path: "/register", label: "Loading registration" },
  ]) {
    test(`${route.path} streams a full-page fallback before the JavaScript swap`, async ({
      page,
    }, testInfo) => {
      await page.goto(route.path);
      // This is the real Next.js server Suspense fallback. With JavaScript
      // disabled the completed stream stays hidden and cannot replace it.
      await expect(
        page.getByRole("status", { name: route.label }),
      ).toBeVisible();
      await expect(page.getByRole("main")).toHaveAttribute("aria-busy", "true");
      await expectStandaloneAccountFrame(page);
      await expectFullViewportMain(page);
      await capture(page, testInfo, `${route.path.slice(1)}-server-fallback`);
    });
  }
});

test("account links preserve invitation-only registration and unavailable password help", async ({
  page,
}) => {
  const rigActive = process.env.INSTANT_NAV_RIG === "1";
  if (rigActive) {
    // A static destination alone could pass with the testing API disabled.
    // Login's request-time content must stay deferred until lock release.
    await instant(
      page,
      async () => {
        await page.goto("/login");
        await expect(
          page.getByRole("status", { name: "Loading sign-in" }),
        ).toBeVisible();
        await expectStandaloneAccountFrame(page);
        await expect(
          page.getByRole("heading", { name: "Sign In" }),
        ).toHaveCount(0);
      },
      { baseURL: test.info().project.use.baseURL },
    );
  } else {
    await page.goto("/login");
  }
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  const openPasswordHelp = async () => {
    await page.getByRole("link", { name: "Forgot password?" }).click();
    await expect(
      page.getByRole("heading", { name: "Forgot password?" }),
    ).toBeVisible();
    await expectStandaloneAccountFrame(page);
  };
  if (rigActive) await instant(page, openPasswordHelp);
  else await openPasswordHelp();
  await expect(page).toHaveURL(/\/forgot-password$/);
  await expect(
    page.getByRole("heading", { name: "Forgot password?" }),
  ).toBeVisible();
  await expect(
    page.getByText("Password reset is not enabled yet", { exact: false }),
  ).toBeVisible();
  await expectStandaloneAccountFrame(page);
  await page.getByRole("link", { name: "Back to login" }).click();
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  await expectStandaloneAccountFrame(page);
  if (rigActive) {
    await instant(page, async () => {
      await page.getByRole("link", { name: "Register", exact: true }).click();
      // This route's completed invitation-only content can be prefetched.
      await expect(
        page.getByRole("heading", { name: "Registration unavailable" }),
      ).toBeVisible();
      await expectStandaloneAccountFrame(page);
    });
  } else {
    await page.getByRole("link", { name: "Register", exact: true }).click();
  }
  await expect(
    page.getByRole("heading", { name: "Registration unavailable" }),
  ).toBeVisible();
  await expect(
    page.getByText("Missionary access is provisioned by invitation only."),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Create Account" }),
  ).toHaveCount(0);
  await expectStandaloneAccountFrame(page);
  await page.getByRole("link", { name: "Sign In", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  await expectStandaloneAccountFrame(page);
});

test("protected deep links retain their validated destination through the authorized demo fixture", async ({
  page,
}, testInfo) => {
  const destination = "/settings?tab=account";
  await page.goto(destination);
  await expect(page).toHaveURL(/\/login\?next=/);
  expect(new URL(page.url()).searchParams.get("next")).toBe(destination);
  await expectStandaloneAccountFrame(page);
  await page.getByRole("button", { name: "Demo Access" }).click();
  await expect(page).toHaveURL(/\/settings\?tab=account$/);
  await expect(page.getByTestId("auth-signout")).toBeVisible();
  await expect(page.locator('[data-slot="sidebar"]')).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Search missionary pages" }),
  ).toBeVisible();
  await page.reload();
  await expect(page).toHaveURL(/\/settings\?tab=account$/);
  await expect(page.getByTestId("auth-signout")).toBeVisible();
  await capture(page, testInfo, "fixture-protected-return");
});

test("mobile workspace sign-out removes sidebar portals and shortcuts and demo sign-in restores navigation", async ({
  page,
}, testInfo) => {
  const hydrationErrors = watchHydrationErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await enterDemoWorkspace(page);
  await page.getByRole("button", { name: "Toggle Sidebar" }).click();
  await expect(
    page.getByRole("dialog", { name: "Sidebar", exact: true }),
  ).toBeVisible();
  await capture(page, testInfo, "mobile-workspace-sidebar");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Search missionary pages" }).click();
  await expect(
    page.getByRole("dialog", { name: "Missionary navigation" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByTestId("auth-signout").click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  await expectStandaloneAccountFrame(page);
  await page.keyboard.press("Control+k");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.keyboard.press("Control+b");
  await expect(page.locator('[data-slot="sidebar"]')).toHaveCount(0);
  await page.getByRole("button", { name: "Demo Access" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("button", { name: "Search missionary pages" }),
  ).toBeVisible();
  await page.keyboard.press("Control+k");
  await expect(
    page.getByRole("dialog", { name: "Missionary navigation" }),
  ).toBeVisible();
  expect(hydrationErrors).toEqual([]);
});

test("no-access preserves the session until a successful explicit switch and exposes pending failures", async ({
  page,
}, testInfo) => {
  await enterDemoWorkspace(page);
  const signOutRequests: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/api/auth/signout") {
      signOutRequests.push(request.method());
    }
  });
  await page.goto("/no-access");
  await expect(page.getByRole("heading", { name: "No access" })).toBeVisible();
  await expectStandaloneAccountFrame(page);
  expect(signOutRequests).toEqual([]);

  let releaseFailure!: () => void;
  const pendingFailure = new Promise<void>((resolve) => {
    releaseFailure = resolve;
  });
  await page.route("**/api/auth/signout", async (route) => {
    await pendingFailure;
    await route.fulfill({
      status: 503,
      json: { error: "Unable to sign out. Please try again." },
    });
  });
  try {
    await page.getByRole("button", { name: "Switch account" }).click();
    await expect(
      page.getByRole("button", { name: "Signing out…" }),
    ).toBeDisabled();
    await expect(page).toHaveURL(/\/no-access$/);
    releaseFailure();
    await expect(
      page.getByRole("alert").filter({ hasText: "Unable to sign out" }),
    ).toHaveText("Unable to sign out. Please try again.");
    await expect(
      page.getByRole("button", { name: "Switch account" }),
    ).toBeEnabled();
    await expect(page).toHaveURL(/\/no-access$/);
    // The failed operation must not invalidate the authorized fixture session.
    const protectedResponse = await page.request.get("/settings", {
      maxRedirects: 0,
    });
    expect(protectedResponse.status()).toBe(200);
    await capture(page, testInfo, "no-access-signout-failure");
  } finally {
    releaseFailure();
    await page.unroute("**/api/auth/signout");
  }
  // Exercise the application's real sign-out handler on retry.
  const signOutResponse = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === "/api/auth/signout" &&
      response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Switch account" }).click();
  expect((await signOutResponse).status()).toBe(200);
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  await expectStandaloneAccountFrame(page);
  // Existing fixture sign-out clears only its legacy cookie, so this verifies
  // the shared operation and UI redirect rather than provider revocation.
});

test("Boneyard keeps its capture frame while existing workspace help retains chrome", async ({
  page,
}, testInfo) => {
  await page.goto("/boneyard/tasks");
  await expect(
    page.getByRole("heading", { name: "Mission Tasks" }),
  ).toBeVisible();
  await expect(page.locator('[data-slot="sidebar-wrapper"]')).toHaveCount(0);
  await expect(page.getByTestId("auth-signout")).toHaveCount(0);
  await capture(page, testInfo, "boneyard-capture-frame");

  await enterDemoWorkspace(page, "/settings");
  await page.getByRole("button", { name: "Help", exact: true }).click();
  await page.getByRole("menuitem", { name: "About", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "About asymmetric.al" }),
  ).toBeVisible();
  await expect(page.locator('[data-slot="sidebar-wrapper"]')).toHaveCount(1);
  await expect(page.locator("header")).toHaveCount(1);
  await expect(page.locator("footer")).toHaveCount(1);
  await expect(page.getByTestId("auth-signout")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Search missionary pages" }),
  ).toBeVisible();
});
