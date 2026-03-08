/**
 * Shared test helpers, constants, and Playwright fixtures for the admin E2E suite.
 *
 * Import from this file in every spec:
 *   import { test, expect, helpers } from "./fixtures";
 */
import { test as base, expect, type Page } from "@playwright/test";

// ── Constants ─────────────────────────────────────────────────────────────────

export const FONT_STORAGE_KEY = "admin-font-pairing";
export const VALID_PAIRINGS = ["product", "modern-clean", "minimal"] as const;
export type FontPairing = (typeof VALID_PAIRINGS)[number];

export const FONT_META = {
  product: {
    name: "Product",
    tagline: "Warm clarity, built for apps",
    heading: "Plus Jakarta Sans",
    body: "Inter",
    mono: "JetBrains Mono",
    moods: ["Default", "Professional", "Friendly"],
  },
  "modern-clean": {
    name: "Modern Clean",
    tagline: "Neutral precision for data-dense UIs",
    heading: "Inter",
    body: "Inter",
    mono: "Geist Mono",
    moods: ["Neutral", "Data-Dense", "SaaS"],
  },
  minimal: {
    name: "Minimal",
    tagline: "Vercel-style — one font for everything",
    heading: "Geist",
    body: "Geist",
    mono: "Geist Mono",
    moods: ["Minimal", "Modern", "Developer"],
  },
} as const;

/** All admin app routes that must render without a JS error overlay. */
export const ADMIN_ROUTES = [
  "/",
  "/login",
  "/register",
  "/settings",
  "/settings/integrations/sendgrid",
  "/contributions",
  "/crm",
  "/care",
  "/events",
  "/reports",
  "/feed",
  "/tasks",
  "/mobilize",
  "/email",
  "/sign",
  "/pdf",
  "/automations",
  "/admin",
  "/support",
] as const;

// ── Low-level DOM helpers ─────────────────────────────────────────────────────

export const helpers = {
  /** Navigate and wait for domcontentloaded without any Next.js error overlay. */
  async gotoReady(page: Page, path = "/") {
    await page.goto(path);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("#__next_error__")).toHaveCount(0);
  },

  // Font preference helpers
  async clearFont(page: Page) {
    await page.evaluate(
      (key) => localStorage.removeItem(key),
      FONT_STORAGE_KEY,
    );
  },
  async setFont(page: Page, value: string) {
    await page.evaluate(
      ([k, v]) => localStorage.setItem(k, v),
      [FONT_STORAGE_KEY, value],
    );
  },
  async getDataFont(page: Page): Promise<string | null> {
    return page.evaluate(() =>
      document.documentElement.getAttribute("data-font"),
    );
  },
  async getStoredFont(page: Page): Promise<string | null> {
    return page.evaluate(
      (key) => localStorage.getItem(key),
      FONT_STORAGE_KEY,
    );
  },

  /** Navigate with a seeded localStorage font preference and return data-font. */
  async reloadWithFont(
    page: Page,
    font: string | null,
    path = "/login",
  ): Promise<string | null> {
    await page.goto(path);
    if (font !== null) {
      await helpers.setFont(page, font);
    } else {
      await helpers.clearFont(page);
    }
    await page.goto(path);
    await page.waitForLoadState("domcontentloaded");
    return helpers.getDataFont(page);
  },

  /** Seed font pref, navigate to /settings, and wait for page ready. */
  async gotoSettings(page: Page, font: FontPairing = "product") {
    await page.goto("/login");
    await helpers.setFont(page, font);
    await helpers.gotoReady(page, "/settings");
  },

  /** Get the three font card buttons on /settings. */
  fontCards(page: Page) {
    return page.locator(
      '.grid button[type="button"]',
    );
  },

  /** Get a specific font card by its pairing name text. */
  fontCard(page: Page, name: string) {
    return page
      .locator('button[type="button"]')
      .filter({ hasText: name })
      .first();
  },

  /** Wait for the live preview label to match a pairing name. */
  async waitForPreviewName(page: Page, name: string) {
    await expect(
      page.locator("[class*='font-bold'][class*='uppercase']", {
        hasText: new RegExp(`Live Preview.*${name}`, "i"),
      }),
    ).toBeVisible({ timeout: 3000 });
  },

  /** Collect all uncaught JS errors on a page (filtered for known noise). */
  collectErrors(page: Page): string[] {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    return errors;
  },

  unexpectedErrors(errors: string[]): string[] {
    return errors.filter(
      (e) =>
        !e.includes("supabase") &&
        !e.includes("fetch") &&
        !e.includes("network") &&
        !e.includes("Failed to fetch") &&
        !e.includes("NEXT_REDIRECT") &&
        !e.includes("AbortError"),
    );
  },
};

// ── Playwright fixture augmentation ──────────────────────────────────────────

type AdminFixtures = {
  /** Page with common error listener already attached. */
  cleanPage: Page;
};

export const test = base.extend<AdminFixtures>({
  cleanPage: async ({ page }, use) => {
    const errors = helpers.collectErrors(page);
    await use(page);
    // Assert no unexpected JS errors (React internals / Supabase noise filtered)
    const unexpected = helpers.unexpectedErrors(errors).filter(
      // React reconciler diffs logged in dev mode — not real errors
      (e) =>
        !e.includes("React") &&
        !e.includes("Minified React") &&
        !e.includes("Warning:") &&
        !e.includes("reconcil") &&
        !e.includes("hydrat") &&
        !e.includes("script"),
    );
    expect(unexpected, "Unexpected JS errors on page").toHaveLength(0);
  },
});

export { expect };
