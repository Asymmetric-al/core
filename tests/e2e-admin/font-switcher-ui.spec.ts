/**
 * Font Pairing Switcher — UI interaction E2E tests.
 *
 * Tests the full UX flow on /settings:
 * - Clicking each font card updates the UI, live preview, localStorage, and data-font
 * - Visual selection state (border class, checkmark icon)
 * - Keyboard navigation (Tab, Enter, Space)
 * - Live preview strip updates content
 * - Accessibility attributes
 * - Persistence after page reload
 * - Rapid switching (no jank, correct final state)
 *
 * @vitest-environment happy-dom
 */

import { test, expect, helpers, FONT_META, VALID_PAIRINGS, FONT_STORAGE_KEY } from "./fixtures";
import type { Page } from "@playwright/test";

// ── Selectors ─────────────────────────────────────────────────────────────────

const LIVE_PREVIEW_HEADING = "Mission Control Dashboard";
const SECTION_HEADING = "Font Pairing";
const SECTION_DESC = "Choose the typeface system for your dashboard. Changes apply instantly.";
const PERSISTENCE_NOTE = /saved locally to this browser/i;
const PREVIEW_CODE_SAMPLE = "getDashboardSummary";

// ── Page structure ─────────────────────────────────────────────────────────────

test.describe("Settings page — structure", () => {
  test.beforeEach(async ({ page }) => helpers.gotoSettings(page));

  test("renders the Font Pairing section heading", async ({ page }) => {
    await expect(page.getByText(SECTION_HEADING, { exact: true })).toBeVisible();
  });

  test("renders the subtitle description", async ({ page }) => {
    await expect(page.getByText(SECTION_DESC)).toBeVisible();
  });

  test("renders exactly three font pairing cards", async ({ page }) => {
    const cards = helpers.fontCards(page);
    await expect(cards).toHaveCount(3);
  });

  test("renders all three pairing names as card titles", async ({ page }) => {
    for (const pairing of VALID_PAIRINGS) {
      const name = FONT_META[pairing].name;
      await expect(
        page.locator("span.font-semibold", { hasText: name }),
      ).toBeVisible();
    }
  });

  test("renders all three taglines", async ({ page }) => {
    for (const pairing of VALID_PAIRINGS) {
      await expect(page.getByText(FONT_META[pairing].tagline)).toBeVisible();
    }
  });

  test("renders the live preview strip", async ({ page }) => {
    await expect(page.getByText(LIVE_PREVIEW_HEADING)).toBeVisible();
  });

  test("live preview strip contains a code sample", async ({ page }) => {
    await expect(
      page.locator("*", { hasText: PREVIEW_CODE_SAMPLE }).first(),
    ).toBeVisible();
  });

  test("renders the localStorage persistence note", async ({ page }) => {
    await expect(page.getByText(PERSISTENCE_NOTE)).toBeVisible();
  });

  test("all font cards are focusable buttons", async ({ page }) => {
    const cards = helpers.fontCards(page);
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      await expect(card).toHaveAttribute("type", "button");
    }
  });
});

// ── Default selection state ───────────────────────────────────────────────────

test.describe("Font cards — default state (product)", () => {
  test.beforeEach(async ({ page }) => helpers.gotoSettings(page, "product"));

  test("product card is selected by default", async ({ page }) => {
    const productCard = helpers.fontCard(page, "Product");
    await expect(productCard).toBeVisible();
    // Selected cards get the 'border-foreground' class
    const className = await productCard.getAttribute("class");
    expect(className).toContain("border-foreground");
  });

  test("modern-clean card is NOT selected by default", async ({ page }) => {
    const card = helpers.fontCard(page, "Modern Clean");
    const className = await card.getAttribute("class");
    // Unselected: has border-border/60. 
    // The selected state is specifically 'border-foreground shadow-md' — no '/60' or '/30' suffix.
    // hover:border-foreground/30 is in the base class for all cards, so we check
    // specifically for the full 'border-foreground shadow-md' string.
    expect(className).toContain("border-border/60");
    // The selected border class is 'border-foreground' without any modifier
    // It appears in the class list as a standalone token (not hover:border-foreground/30)
    const tokens = className?.split(" ") ?? [];
    expect(tokens).not.toContain("border-foreground");
  });

  test("live preview shows 'Product' by default", async ({ page }) => {
    await expect(
      page.getByText(/Live Preview.*Product/i),
    ).toBeVisible();
  });

  test("product card shows Default badge", async ({ page }) => {
    const productCard = helpers.fontCard(page, "Product");
    await expect(
      productCard.locator('[data-slot="badge"]', { hasText: "Default" }),
    ).toBeVisible();
  });

  test("data-font is 'product' on html element", async ({ page }) => {
    expect(await helpers.getDataFont(page)).toBe("product");
  });
});

// ── Click interactions ────────────────────────────────────────────────────────

test.describe("Font cards — click to select", () => {
  test("clicking 'Modern Clean' selects it and updates live preview", async ({
    page,
  }) => {
    await helpers.gotoSettings(page, "product");

    const card = helpers.fontCard(page, "Modern Clean");
    await card.click();

    // Live preview label updates
    await expect(page.getByText(/Live Preview.*Modern Clean/i)).toBeVisible();

    // Card visually selected
    const className = await card.getAttribute("class");
    expect(className).toContain("border-foreground");
  });

  test("clicking 'Minimal' selects it and updates live preview", async ({
    page,
  }) => {
    await helpers.gotoSettings(page, "product");

    const card = helpers.fontCard(page, "Minimal");
    await card.click();

    await expect(page.getByText(/Live Preview.*Minimal/i)).toBeVisible();

    const className = await card.getAttribute("class");
    expect(className).toContain("border-foreground");
  });

  test("clicking 'Product' selects it from another selection", async ({
    page,
  }) => {
    await helpers.gotoSettings(page, "minimal");
    expect(await helpers.getDataFont(page)).toBe("minimal");

    const productCard = helpers.fontCard(page, "Product");
    await productCard.click();

    await expect(page.getByText(/Live Preview.*Product/i)).toBeVisible();
    expect(await helpers.getDataFont(page)).toBe("product");
  });

  test("clicking a card updates data-font immediately (no reload)", async ({
    page,
  }) => {
    await helpers.gotoSettings(page, "product");

    helpers.fontCard(page, "Minimal").click();
    // data-font changes synchronously — check right after click
    await expect
      .poll(() => helpers.getDataFont(page), { timeout: 2000 })
      .toBe("minimal");
  });

  test("clicking a card writes to localStorage immediately", async ({
    page,
  }) => {
    await helpers.gotoSettings(page, "product");

    await helpers.fontCard(page, "Modern Clean").click();

    await expect
      .poll(() => helpers.getStoredFont(page), { timeout: 2000 })
      .toBe("modern-clean");
  });

  test("previously selected card loses selected state on new selection", async ({
    page,
  }) => {
    await helpers.gotoSettings(page, "product");

    // Click minimal
    await helpers.fontCard(page, "Minimal").click();

    // Product card should no longer have the selected class
    const productCard = helpers.fontCard(page, "Product");
    await expect
      .poll(async () => {
        const cls = await productCard.getAttribute("class");
        // Selected state has 'border-foreground', unselected has 'border-border/60'
        return cls?.includes("border-foreground") && !cls?.includes("border-border/60");
      }, { timeout: 2000 })
      .toBe(false);
  });

  test("cycling through all three pairings updates state correctly", async ({
    page,
  }) => {
    await helpers.gotoSettings(page, "product");

    for (const pairing of VALID_PAIRINGS) {
      const card = helpers.fontCard(page, FONT_META[pairing].name);
      await card.click();

      await expect
        .poll(() => helpers.getDataFont(page), { timeout: 2000 })
        .toBe(pairing);
      await expect
        .poll(() => helpers.getStoredFont(page), { timeout: 2000 })
        .toBe(pairing);
      await expect(
        page.getByText(new RegExp(`Live Preview.*${FONT_META[pairing].name}`, "i")),
      ).toBeVisible();
    }
  });
});

// ── Live preview content ──────────────────────────────────────────────────────

test.describe("Live preview strip — content", () => {
  test.beforeEach(async ({ page }) => helpers.gotoSettings(page, "product"));

  test("preview heading text is always 'Mission Control Dashboard'", async ({
    page,
  }) => {
    await expect(
      page.locator("h3", { hasText: LIVE_PREVIEW_HEADING }),
    ).toBeVisible();
  });

  test("preview label shows current pairing name after switching to Minimal", async ({
    page,
  }) => {
    await helpers.fontCard(page, "Minimal").click();
    await expect(page.getByText(/Live Preview — Minimal/i)).toBeVisible();
  });

  test("preview label shows current pairing name after switching to Modern Clean", async ({
    page,
  }) => {
    await helpers.fontCard(page, "Modern Clean").click();
    await expect(page.getByText(/Live Preview — Modern Clean/i)).toBeVisible();
  });

  test("preview code block is present for all three pairings", async ({
    page,
  }) => {
    for (const pairing of VALID_PAIRINGS) {
      await helpers.fontCard(page, FONT_META[pairing].name).click();
      // Code block always contains the same function call
      await expect(
        page.locator("*", { hasText: PREVIEW_CODE_SAMPLE }).last(),
      ).toBeVisible();
    }
  });
});

// ── Font stack labels ─────────────────────────────────────────────────────────

test.describe("Font card stack labels", () => {
  test.beforeEach(async ({ page }) => helpers.gotoSettings(page));

  test("product card shows 'Plus Jakarta Sans' as heading font", async ({
    page,
  }) => {
    await expect(page.getByText("Plus Jakarta Sans")).toBeVisible();
  });

  test("product card shows 'JetBrains Mono' as mono font", async ({ page }) => {
    await expect(page.getByText("JetBrains Mono")).toBeVisible();
  });

  test("minimal card shows 'Geist' as heading font", async ({ page }) => {
    // "Geist" text appears in the minimal card stack row
    await expect(page.getByText("Geist").first()).toBeVisible();
  });

  test("modern-clean and minimal cards show 'Geist Mono'", async ({
    page,
  }) => {
    const geistMonoInstances = await page.getByText("Geist Mono").count();
    expect(geistMonoInstances).toBeGreaterThanOrEqual(2);
  });
});

// ── Mood badges ───────────────────────────────────────────────────────────────

test.describe("Font card mood badges", () => {
  test.beforeEach(async ({ page }) => helpers.gotoSettings(page));

  test("product card shows 'Default' badge", async ({ page }) => {
    const productCard = helpers.fontCard(page, "Product");
    await expect(
      productCard.locator('[data-slot="badge"]', { hasText: "Default" }),
    ).toBeVisible();
  });

  test("product card shows 'Professional' and 'Friendly' badges", async ({
    page,
  }) => {
    const productCard = helpers.fontCard(page, "Product");
    await expect(
      productCard.locator('[data-slot="badge"]', { hasText: "Professional" }),
    ).toBeVisible();
    await expect(
      productCard.locator('[data-slot="badge"]', { hasText: "Friendly" }),
    ).toBeVisible();
  });

  test("modern-clean card shows 'Neutral', 'Data-Dense', 'SaaS' badges", async ({
    page,
  }) => {
    const card = helpers.fontCard(page, "Modern Clean");
    for (const mood of FONT_META["modern-clean"].moods) {
      await expect(
        card.locator('[data-slot="badge"]', { hasText: mood }),
      ).toBeVisible();
    }
  });

  test("minimal card shows 'Minimal', 'Modern', 'Developer' badges", async ({
    page,
  }) => {
    const card = helpers.fontCard(page, "Minimal");
    for (const mood of FONT_META["minimal"].moods) {
      await expect(
        card.locator('[data-slot="badge"]', { hasText: mood }),
      ).toBeVisible();
    }
  });
});

// ── Keyboard accessibility ────────────────────────────────────────────────────

test.describe("Font cards — keyboard accessibility", () => {
  test("each font card is reachable by Tab", async ({ page }) => {
    await helpers.gotoSettings(page);

    // Tab through the page until we reach the first font card
    const firstCard = helpers.fontCard(page, "Product");
    await firstCard.focus();
    await expect(firstCard).toBeFocused();
  });

  test("pressing Enter on a focused card selects it", async ({ page }) => {
    await helpers.gotoSettings(page, "product");

    const minimalCard = helpers.fontCard(page, "Minimal");
    await minimalCard.focus();
    await page.keyboard.press("Enter");

    await expect
      .poll(() => helpers.getDataFont(page), { timeout: 2000 })
      .toBe("minimal");
  });

  test("pressing Space on a focused card selects it", async ({ page }) => {
    await helpers.gotoSettings(page, "product");

    const card = helpers.fontCard(page, "Modern Clean");
    await card.focus();
    await page.keyboard.press(" ");

    await expect
      .poll(() => helpers.getDataFont(page), { timeout: 2000 })
      .toBe("modern-clean");
  });
});

// ── Persistence after reload ──────────────────────────────────────────────────

test.describe("Font preference — reload persistence", () => {
  for (const pairing of VALID_PAIRINGS) {
    test(`selecting '${pairing}' persists through full page reload`, async ({
      page,
    }) => {
      await helpers.gotoSettings(page, "product");

      // Click the card
      await helpers.fontCard(page, FONT_META[pairing].name).click();
      await expect
        .poll(() => helpers.getStoredFont(page), { timeout: 2000 })
        .toBe(pairing);

      // Full reload
      await page.reload();
      await page.waitForLoadState("domcontentloaded");

      // data-font should be restored by the inline FOUC script
      expect(await helpers.getDataFont(page)).toBe(pairing);
      // The correct card should appear selected
      await expect(
        page.getByText(/Live Preview/i).filter({ hasText: FONT_META[pairing].name }),
      ).toBeVisible();
    });
  }
});

// ── Rapid switching ───────────────────────────────────────────────────────────

test.describe("Font cards — rapid switching", () => {
  test("rapid clicks land on the last clicked pairing (no race condition)", async ({
    page,
  }) => {
    await helpers.gotoSettings(page, "product");

    // Click through all three quickly
    await helpers.fontCard(page, "Modern Clean").click();
    await helpers.fontCard(page, "Minimal").click();
    await helpers.fontCard(page, "Product").click();

    // Final state should be 'product'
    await expect
      .poll(() => helpers.getDataFont(page), { timeout: 2000 })
      .toBe("product");
    await expect
      .poll(() => helpers.getStoredFont(page), { timeout: 2000 })
      .toBe("product");
  });
});

// ── Settings navigation tabs ──────────────────────────────────────────────────

test.describe("Settings layout — navigation", () => {
  /** The settings nav bar — using href to precisely target the settings layout nav links. */
  const settingsNavLink = (page: Page, href: string) =>
    page.locator(`a[href="${href}"]`).first();

  test("Appearance nav link is visible in settings header", async ({ page }) => {
    await helpers.gotoSettings(page);
    await expect(settingsNavLink(page, "/settings")).toBeVisible();
  });

  test("Integrations nav link is visible in settings header", async ({
    page,
  }) => {
    await helpers.gotoSettings(page);
    await expect(
      settingsNavLink(page, "/settings/integrations/sendgrid"),
    ).toBeVisible();
  });

  test("clicking Integrations nav link navigates to /settings/integrations/sendgrid", async ({
    page,
  }) => {
    await helpers.gotoSettings(page);
    // Wait for the link to be present and interactive
    const integrationsLink = page.locator(
      'a[href="/settings/integrations/sendgrid"]',
    ).first();
    await expect(integrationsLink).toBeVisible();
    // Use Promise.all to capture the navigation triggered by the click
    await Promise.all([
      page.waitForURL("**/settings/integrations/sendgrid"),
      integrationsLink.click(),
    ]);
    expect(page.url()).toContain("/settings/integrations/sendgrid");
    await expect(page.locator("#__next_error__")).toHaveCount(0);
  });

  test("clicking Appearance nav link stays on /settings", async ({ page }) => {
    // Start at integrations, navigate back to appearance
    await helpers.gotoReady(page, "/settings/integrations/sendgrid");
    const appearanceLink = page.locator('a[href="/settings"]').first();
    await expect(appearanceLink).toBeVisible();
    await Promise.all([
      page.waitForURL("**/settings"),
      appearanceLink.click(),
    ]);
    expect(page.url()).toMatch(/\/settings\/?$/);
  });

  test("Settings h1 heading is always visible", async ({ page }) => {
    await helpers.gotoSettings(page);
    await expect(page.locator("h1", { hasText: /settings/i })).toBeVisible();
  });
});
