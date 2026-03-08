/**
 * Admin app — comprehensive page smoke tests.
 *
 * For every meaningful route:
 * - Page loads without Next.js error overlay
 * - Page does not have uncaught JS errors (beyond expected Supabase/network noise)
 * - Page has correct <title>
 * - Key structural elements are present
 *
 * Uses SKIP_ENV_VALIDATION=1 so no real Supabase/DB is required.
 */

import { test, expect, helpers, ADMIN_ROUTES } from "./fixtures";

// ── Generic smoke for all routes ──────────────────────────────────────────────

test.describe("All routes — no crash", () => {
  for (const route of ADMIN_ROUTES) {
    test(`${route} serves page without JS error overlay`, async ({
      cleanPage: page,
    }) => {
      await helpers.gotoReady(page, route);
    });
  }
});

// ── Page titles ───────────────────────────────────────────────────────────────

test.describe("Page titles", () => {
  test("root / has Mission Control in title", async ({ page }) => {
    await helpers.gotoReady(page, "/");
    await expect(page).toHaveTitle(/Mission Control/i);
  });

  test("/login has Mission Control in title", async ({ page }) => {
    await helpers.gotoReady(page, "/login");
    await expect(page).toHaveTitle(/Mission Control/i);
  });

  test("/settings has Appearance Settings in title", async ({ page }) => {
    await helpers.gotoReady(page, "/settings");
    await expect(page).toHaveTitle(/Appearance Settings/i);
  });
});

// ── Login page structure ──────────────────────────────────────────────────────

test.describe("Login page — UI structure", () => {
  test.beforeEach(async ({ page }) => helpers.gotoReady(page, "/login"));

  test("shows Sign In card title", async ({ page }) => {
    await expect(
      page.locator('[data-slot="card-title"]', { hasText: "Sign In" }),
    ).toBeVisible();
  });

  test("shows card description", async ({ page }) => {
    await expect(
      page.getByText(/Enter your credentials/i),
    ).toBeVisible();
  });

  test("has email input", async ({ page }) => {
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test("email input has correct type", async ({ page }) => {
    await expect(page.getByLabel(/email/i)).toHaveAttribute("type", "email");
  });

  test("has password input", async ({ page }) => {
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test("password input has correct type", async ({ page }) => {
    await expect(page.getByLabel(/password/i)).toHaveAttribute(
      "type",
      "password",
    );
  });

  test("has Sign In submit button", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /sign in/i }),
    ).toBeVisible();
  });

  test("Sign In button is type=submit", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /sign in/i }),
    ).toHaveAttribute("type", "submit");
  });

  test("has Demo Access button", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /demo access/i }),
    ).toBeVisible();
  });

  test("has Register link", async ({ page }) => {
    await expect(page.getByRole("link", { name: /register/i })).toBeVisible();
  });

  test("Register link points to /register", async ({ page }) => {
    await expect(page.getByRole("link", { name: /register/i })).toHaveAttribute(
      "href",
      "/register",
    );
  });

  test("Sign In button is enabled by default", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /sign in/i }),
    ).toBeEnabled();
  });

  test("email input is empty by default", async ({ page }) => {
    await expect(page.getByLabel(/email/i)).toHaveValue("");
  });

  test("password input is empty by default", async ({ page }) => {
    await expect(page.getByLabel(/password/i)).toHaveValue("");
  });
});

// ── Login page — form interaction ─────────────────────────────────────────────

test.describe("Login page — form interaction", () => {
  test.beforeEach(async ({ page }) => helpers.gotoReady(page, "/login"));

  test("can type into email field", async ({ page }) => {
    await page.getByLabel(/email/i).fill("test@example.com");
    await expect(page.getByLabel(/email/i)).toHaveValue("test@example.com");
  });

  test("can type into password field", async ({ page }) => {
    await page.getByLabel(/password/i).fill("mypassword");
    await expect(page.getByLabel(/password/i)).toHaveValue("mypassword");
  });

  test("password field hides text (type=password)", async ({ page }) => {
    await page.getByLabel(/password/i).fill("secret");
    await expect(page.getByLabel(/password/i)).toHaveAttribute(
      "type",
      "password",
    );
  });

  test("submitting empty form shows auth error (not a crash)", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /sign in/i }).click();
    // The submit handler calls Supabase which returns an error — no page crash
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("#__next_error__")).toHaveCount(0);
  });

  test("Tab from email moves focus to password", async ({ page }) => {
    await page.getByLabel(/email/i).focus();
    await page.keyboard.press("Tab");
    await expect(page.getByLabel(/password/i)).toBeFocused();
  });
});

// ── Register page structure ───────────────────────────────────────────────────

test.describe("Register page — UI structure", () => {
  test.beforeEach(async ({ page }) => helpers.gotoReady(page, "/register"));

  test("shows Create Account card title", async ({ page }) => {
    await expect(
      page.locator('[data-slot="card-title"]', { hasText: "Create Account" }),
    ).toBeVisible();
  });

  test("has First Name input", async ({ page }) => {
    await expect(page.getByLabel(/first name/i)).toBeVisible();
  });

  test("has Last Name input", async ({ page }) => {
    await expect(page.getByLabel(/last name/i)).toBeVisible();
  });

  test("has Email input", async ({ page }) => {
    await expect(page.getByLabel("Email")).toBeVisible();
  });

  test("has Password input", async ({ page }) => {
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test("has back to sign in link", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: /sign in/i }),
    ).toBeVisible();
  });

  test("Sign In link points to /login", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: /sign in/i }),
    ).toHaveAttribute("href", "/login");
  });
});

// ── Dashboard shell structure ─────────────────────────────────────────────────

test.describe("Dashboard shell — sidebar and header", () => {
  test.beforeEach(async ({ page }) => helpers.gotoReady(page, "/"));

  test("sidebar is rendered", async ({ page }) => {
    await expect(page.locator('[data-slot="sidebar"]')).toBeVisible();
  });

  test("sidebar shows brand name GIVE HOPE", async ({ page }) => {
    await expect(page.getByText("GIVE HOPE")).toBeVisible();
  });

  test("sidebar shows MISSION CONTROL tagline", async ({ page }) => {
    await expect(page.getByText("MISSION CONTROL")).toBeVisible();
  });

  test("sidebar contains Dashboard nav link", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: /dashboard/i }).first(),
    ).toBeVisible();
  });

  test("sidebar contains Contributions nav link", async ({ page }) => {
    await expect(
      page.locator("a", { hasText: "CONTRIBUTIONS" }),
    ).toBeVisible();
  });

  test("sidebar contains CRM nav link", async ({ page }) => {
    await expect(page.locator("a", { hasText: "CRM" })).toBeVisible();
  });

  test("sidebar contains Settings nav link", async ({ page }) => {
    await expect(page.locator("a", { hasText: "SETTINGS" })).toBeVisible();
  });

  test("sidebar contains Support nav link", async ({ page }) => {
    await expect(page.locator("a", { hasText: "SUPPORT" })).toBeVisible();
  });

  test("header is rendered with sidebar trigger", async ({ page }) => {
    await expect(page.locator("header")).toBeVisible();
  });

  test("header search button is visible on desktop", async ({ page }) => {
    await expect(
      page.locator("button", { hasText: "Search..." }),
    ).toBeVisible();
  });

  test("notification bell is visible in header", async ({ page }) => {
    // Bell icon button in header
    await expect(
      page.locator("header button svg.lucide-bell").first(),
    ).toBeVisible();
  });
});

// ── Sidebar navigation — clicking links ───────────────────────────────────────

test.describe("Sidebar navigation — links", () => {
  test.beforeEach(async ({ page }) => helpers.gotoReady(page, "/"));

  test("clicking Settings opens /settings page", async ({ page }) => {
    await page.locator("a", { hasText: "SETTINGS" }).click();
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toContain("/settings");
    await expect(page.locator("#__next_error__")).toHaveCount(0);
  });

  test("clicking Contributions opens /contributions page", async ({
    page,
  }) => {
    await page.locator("a", { hasText: "CONTRIBUTIONS" }).click();
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toContain("/contributions");
    await expect(page.locator("#__next_error__")).toHaveCount(0);
  });

  test("clicking Support opens /support page", async ({ page }) => {
    await page.locator("a", { hasText: "SUPPORT" }).click();
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toContain("/support");
    await expect(page.locator("#__next_error__")).toHaveCount(0);
  });
});

// ── Contributions page ────────────────────────────────────────────────────────

test.describe("Contributions page — structure", () => {
  test.beforeEach(async ({ page }) => helpers.gotoReady(page, "/contributions"));

  test("page has no JS error overlay", async ({ page }) => {
    await expect(page.locator("#__next_error__")).toHaveCount(0);
  });

  test("page renders at least one card or table structure", async ({
    page,
  }) => {
    // Contributions page has stat cards + data table
    await expect(
      page.locator('[data-slot="card"]').first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test("page renders stat cards", async ({ page }) => {
    // There should be multiple cards on the contributions page
    const cards = page.locator('[data-slot="card"]');
    await expect(
      async () => expect(await cards.count()).toBeGreaterThan(0)
    ).toPass({ timeout: 5000 });
  });
});

// ── Settings integrations page ────────────────────────────────────────────────

test.describe("Settings — integrations (SendGrid) page", () => {
  test.beforeEach(async ({ page }) =>
    helpers.gotoReady(page, "/settings/integrations/sendgrid"),
  );

  test("page loads without error overlay", async ({ page }) => {
    await expect(page.locator("#__next_error__")).toHaveCount(0);
  });

  test("Settings h1 heading is visible", async ({ page }) => {
    await expect(page.locator("h1", { hasText: /settings/i })).toBeVisible();
  });

  test("Appearance nav link is visible", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: /appearance/i }),
    ).toBeVisible();
  });

  test("Integrations nav link is visible", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: /integrations/i }),
    ).toBeVisible();
  });
});

// ── Header — responsive behavior ─────────────────────────────────────────────

test.describe("Header — responsive behavior", () => {
  test("sidebar toggle button is visible", async ({ page }) => {
    await helpers.gotoReady(page, "/");
    // The sidebar trigger renders a button
    const sidebarTrigger = page.locator('button[data-sidebar="trigger"]');
    await expect(sidebarTrigger).toBeVisible();
  });

  test("on narrow viewport, sidebar can be toggled", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await helpers.gotoReady(page, "/");
    const trigger = page.locator('button[data-sidebar="trigger"]');
    await expect(trigger).toBeVisible();
    await trigger.click();
    // After toggle, sidebar state changes — just assert no crash
    await expect(page.locator("#__next_error__")).toHaveCount(0);
  });
});
