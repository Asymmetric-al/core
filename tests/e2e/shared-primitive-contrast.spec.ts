import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";

import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

const root = process.cwd();
const rootRequire = createRequire(path.join(root, "package.json"));
const tailwindPostcss = rootRequire("@tailwindcss/postcss");
const postcss = createRequire(rootRequire.resolve("@tailwindcss/postcss"))(
  "postcss",
);
let temporaryDirectory: string;
let javascript: string;
let css: string;

async function waitForFixtureAnimations(fixture: Locator) {
  return fixture.evaluate(async (element) => {
    let finishedAnimations = 0;
    while (true) {
      const animations = element
        .getAnimations({ subtree: true })
        .filter(
          (animation) => animation.playState === "running" || animation.pending,
        );
      if (animations.length === 0) return finishedAnimations;
      await Promise.allSettled(
        animations.map((animation) => animation.finished),
      );
      finishedAnimations += animations.length;
    }
  });
}

async function measureTextContrast(
  page: Page,
  selector = '[data-slot="alert-title"], [data-slot="alert-description"], [data-slot="avatar-fallback"], [data-slot="avatar-group-count"], [data-slot="field-label"], [data-slot="field-error"], [data-slot="field-description"], [data-slot="field"] input',
) {
  return page.evaluate((selector) => {
    const context = document.createElement("canvas").getContext("2d")!;
    const channels = (color: string) => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      return Array.from(context.getImageData(0, 0, 1, 1).data);
    };
    const composite = (foreground: number[], background: number[]) =>
      foreground.slice(0, 3).map((value, index) => {
        const alpha = foreground[3]! / 255;
        return value * alpha + background[index]! * (1 - alpha);
      });
    const luminance = (rgb: number[]) =>
      rgb.reduce((sum, value, index) => {
        const channel = value / 255;
        const linear =
          channel <= 0.04045
            ? channel / 12.92
            : ((channel + 0.055) / 1.055) ** 2.4;
        return sum + linear * [0.2126, 0.7152, 0.0722][index]!;
      }, 0);
    const measure = (element: Element) => {
      const backgrounds: number[][] = [];
      let ancestor: Element | null = element;
      while (ancestor) {
        backgrounds.push(channels(getComputedStyle(ancestor).backgroundColor));
        ancestor = ancestor.parentElement;
      }
      const background = backgrounds
        .reverse()
        .reduce((under, over) => composite(over, under), [255, 255, 255]);
      const foreground = composite(
        channels(getComputedStyle(element).color),
        background,
      );
      const light = luminance(foreground);
      const dark = luminance(background);
      return {
        foreground,
        background,
        ratio: (Math.max(light, dark) + 0.05) / (Math.min(light, dark) + 0.05),
      };
    };
    const samples = Array.from(document.querySelectorAll(selector))
      .filter((element) => element.getClientRects().length > 0)
      .map((element) => ({
        slot: element.getAttribute("data-slot"),
        fixture: element.closest("[data-testid]")?.getAttribute("data-testid"),
        selected: element.getAttribute("aria-selected"),
        ...measure(element),
      }));
    return samples;
  }, selector);
}

test.beforeAll(async () => {
  temporaryDirectory = await mkdtemp(
    path.join(os.tmpdir(), "core-primitive-contrast-"),
  );
  const bundle = path.join(temporaryDirectory, "fixture.js");
  execFileSync(
    "bun",
    [
      "--no-env-file",
      "build",
      "tests/e2e/fixtures/shared-primitive-contrast.tsx",
      "--target=browser",
      "--format=iife",
      "--define",
      'process.env.NODE_ENV="production"',
      "--outfile",
      bundle,
    ],
    { cwd: root, stdio: "pipe", timeout: 30_000 },
  );
  javascript = await readFile(bundle, "utf8");
  const stylesheet = path.join(root, "packages/ui/styles/globals.css");
  css = (
    await postcss([tailwindPostcss({ base: root, optimize: false })]).process(
      await readFile(stylesheet, "utf8"),
      { from: stylesheet },
    )
  ).css;
});

test.afterAll(async () => {
  if (temporaryDirectory) {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});

for (const theme of ["light", "dark"] as const) {
  for (const width of [375, 1280]) {
    test(`shared destructive menu text remains readable in ${theme} at ${width}px`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      await page.setContent(
        `<!doctype html><html lang="en" class="${theme === "dark" ? "dark" : ""}"><head><meta charset="utf-8"><title>Menu contrast</title></head><body><div id="root"></div></body></html>`,
      );
      await page.addStyleTag({ content: css });
      await page.addScriptTag({ content: javascript });
      const trigger = page.getByRole("button", {
        name: "Open actions",
        exact: true,
      });
      await trigger.focus();
      await page.keyboard.press("Enter");
      const menu = page.getByTestId("menu-contrast-popup");
      const keep = page.getByRole("menuitem", {
        name: "Keep item",
        exact: true,
      });
      const remove = page.getByRole("menuitem", {
        name: "Remove item",
        exact: true,
      });
      const iconless = page.getByRole("menuitem", {
        name: "Delete without icon",
        exact: true,
      });
      await expect(keep).toBeFocused();
      const states = [];
      for (const target of [keep, remove, iconless]) {
        await target.focus();
        await waitForFixtureAnimations(menu);
        const samples = await measureTextContrast(
          page,
          '[data-testid="menu-contrast-popup"] [data-variant="destructive"]',
        );
        states.push({ focused: await target.textContent(), samples });
      }
      await testInfo.attach("menu-contrast.json", {
        body: JSON.stringify(states, null, 2),
        contentType: "application/json",
      });
      for (const state of states) {
        expect(state.samples).toHaveLength(2);
        for (const sample of state.samples)
          expect(
            sample.ratio,
            `${theme}: ${state.focused}`,
          ).toBeGreaterThanOrEqual(4.5);
      }
      const colors = await remove.evaluate((element) => ({
        text: getComputedStyle(element).color,
        icon: getComputedStyle(element.querySelector("svg")!).color,
      }));
      expect(colors.icon).not.toBe(colors.text);
      const severityColor = await page
        .getByTestId("alert-destructive")
        .locator("svg")
        .evaluate((element) => getComputedStyle(element).color);
      expect(colors.icon).toBe(severityColor);
      const axe = await new AxeBuilder({ page })
        .include('[data-testid="menu-contrast-popup"]')
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(axe.violations).toEqual([]);
      await remove.focus();
      await page.keyboard.press("Enter");
      await expect(menu).toBeHidden();
      await expect(page.getByTestId("menu-removal-count")).toHaveText("1");
      await expect(trigger).toBeFocused();
    });
  }
}

for (const theme of ["light", "dark"] as const) {
  for (const width of [375, 1280]) {
    test(`shared alert, avatar and field text remains readable in ${theme} at ${width}px`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: theme });
      await page.setContent(
        `<!doctype html><html lang="en" class="${theme === "dark" ? "dark" : ""}"><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Shared primitive contrast</title></head><body><div id="root"></div></body></html>`,
      );
      await page.addStyleTag({ content: css });
      await page.addScriptTag({ content: javascript });
      await expect(page.getByTestId("contrast-fixtures")).toBeVisible();
      await expect(page.getByRole("alert")).toHaveCount(6);
      await expect(
        page.getByRole("img", { name: "Loaded account image" }),
      ).toBeVisible();
      await expect(
        page.getByText("Loaded fallback", { exact: true }),
      ).toBeHidden();

      const defaultBorder = await page
        .getByTestId("alert-default-iconless")
        .evaluate((element) => getComputedStyle(element).borderTopColor);
      const destructiveBorder = await page
        .getByTestId("alert-destructive-iconless")
        .evaluate((element) => getComputedStyle(element).borderTopColor);
      expect(destructiveBorder).not.toBe(defaultBorder);
      const destructiveIconColor = await page
        .getByTestId("alert-destructive")
        .locator("svg")
        .evaluate((element) => getComputedStyle(element).color);
      expect(destructiveIconColor).toBe(destructiveBorder);

      for (const field of ["invalid-field", "invalid-field-card"]) {
        const accent = await page
          .getByTestId(field)
          .locator('[data-slot="field-error"]')
          .evaluate((element) => {
            const style = getComputedStyle(element);
            return {
              color: style.borderLeftColor,
              width: Number.parseFloat(style.borderLeftWidth),
            };
          });
        expect(accent.color).toBe(destructiveBorder);
        expect(accent.width).toBeGreaterThanOrEqual(2);
      }

      for (const [size, dimension] of [
        ["sm", 24],
        ["default", 32],
        ["lg", 40],
      ] as const) {
        const avatar = page.getByTestId(`avatar-${size}`);
        await expect(avatar.getByText("GH", { exact: true })).toBeVisible();
        const bounds = await avatar.boundingBox();
        expect(bounds?.width).toBe(dimension);
        expect(bounds?.height).toBe(dimension);
        const groupCount = page
          .getByTestId(`avatar-group-${size}`)
          .locator('[data-slot="avatar-group-count"]');
        const countBounds = await groupCount.boundingBox();
        expect(countBounds?.width).toBe(dimension);
        expect(countBounds?.height).toBe(dimension);
      }

      const result = await new AxeBuilder({ page })
        .include('[data-testid="contrast-fixtures"]')
        .withRules(["color-contrast"])
        .analyze();
      const contrasts = await measureTextContrast(page);
      await testInfo.attach("rendered-contrast.json", {
        body: JSON.stringify({ theme, width, contrasts }, null, 2),
        contentType: "application/json",
      });
      for (const contrast of contrasts) {
        expect(
          contrast.ratio,
          `${contrast.fixture}/${contrast.slot} text contrast`,
        ).toBeGreaterThanOrEqual(4.5);
      }
      expect(
        result.violations.map((violation) => ({
          id: violation.id,
          nodes: violation.nodes.map((node) => ({
            target: node.target,
            summary: node.failureSummary,
          })),
        })),
      ).toEqual([]);
      expect(result.incomplete).toEqual([]);
    });
  }
}

for (const variant of ["default", "line"] as const) {
  for (const theme of ["light", "dark"] as const) {
    for (const width of [375, 1280]) {
      test(`shared tabs ${variant} remain readable and keyboard-operable in ${theme} at ${width}px`, async ({
        page,
      }, testInfo) => {
        const errors: string[] = [];
        const requests: string[] = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.route("**/*", (route) => {
          requests.push(route.request().url());
          return route.abort();
        });
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme: theme });
        await page.setContent(
          `<!doctype html><html lang="en" class="${theme === "dark" ? "dark" : ""}"><head><title>Shared tabs contrast</title></head><body><div id="root"></div></body></html>`,
        );
        await page.addStyleTag({ content: css });
        await page.addScriptTag({ content: javascript });
        const fixture = page.getByTestId(`tabs-contrast-${variant}`);
        const overview = fixture.getByRole("tab", {
          name: "Overview",
          exact: true,
        });
        const details = fixture.getByRole("tab", {
          name: "Details",
          exact: true,
        });
        const locked = fixture.getByRole("tab", {
          name: "Locked",
          exact: true,
        });
        const selector = `[data-testid="tabs-contrast-${variant}"] [data-slot="tabs-trigger"]:not(:disabled):not([aria-disabled="true"])`;
        await expect(overview).toHaveAttribute("aria-selected", "true");
        await expect(details).toHaveAttribute("aria-selected", "false");
        await expect(locked).toBeDisabled();
        const initialAnimations = await waitForFixtureAnimations(fixture);
        const initial = await measureTextContrast(page, selector);
        expect(initial).toHaveLength(2);
        await testInfo.attach("tabs-initial-contrast.json", {
          body: JSON.stringify(
            { variant, theme, width, initialAnimations, samples: initial },
            null,
            2,
          ),
          contentType: "application/json",
        });
        for (const sample of initial) {
          expect(
            sample.ratio,
            `${variant} selected=${sample.selected}`,
          ).toBeGreaterThanOrEqual(4.5);
        }

        await page.getByTestId(`before-tabs-${variant}`).focus();
        await page.keyboard.press("Tab");
        await expect(overview).toBeFocused();
        expect(
          await overview.evaluate((node) => node.matches(":focus-visible")),
        ).toBe(true);
        await expect
          .poll(() =>
            overview.evaluate((node) => getComputedStyle(node).boxShadow),
          )
          .toMatch(/0px 0px 0px 5px(?:,|$)/);
        await page.keyboard.press("ArrowRight");
        await expect(details).toBeFocused();
        await expect(overview).toHaveAttribute("aria-selected", "true");
        await expect(details).toHaveAttribute("aria-selected", "false");
        await page.keyboard.press("Enter");
        await expect(details).toHaveAttribute("aria-selected", "true");
        await expect(
          fixture.getByRole("tabpanel", { name: "Details" }),
        ).toBeVisible();
        await page.keyboard.press("ArrowRight");
        await expect(locked).toBeFocused();
        await page.keyboard.press("Enter");
        await expect(locked).toHaveAttribute("aria-selected", "false");
        await expect(details).toHaveAttribute("aria-selected", "true");
        await page.keyboard.press("ArrowRight");
        await expect(overview).toBeFocused();
        await expect(details).toHaveAttribute("aria-selected", "true");
        await page.keyboard.press("Space");
        await expect(overview).toHaveAttribute("aria-selected", "true");
        await page.keyboard.press("End");
        await expect(locked).toBeFocused();
        await page.keyboard.press("Home");
        await expect(overview).toBeFocused();
        await page.keyboard.press("ArrowRight");
        await expect(details).toBeFocused();
        await page.keyboard.press("Enter");
        await expect(details).toHaveAttribute("aria-selected", "true");
        await page.keyboard.press("Tab");
        await expect(
          fixture.getByRole("tabpanel", { name: "Details" }),
        ).toBeFocused();
        await page.keyboard.press("Tab");
        await expect(page.getByTestId(`after-tabs-${variant}`)).toBeFocused();

        const selectedDetailsAnimations =
          await waitForFixtureAnimations(fixture);
        const selectedDetails = await measureTextContrast(page, selector);
        await overview.hover();
        const hoveredAnimations = await waitForFixtureAnimations(fixture);
        const hovered = await measureTextContrast(page, selector);
        for (const sample of [...selectedDetails, ...hovered]) {
          expect(
            sample.ratio,
            `${variant} selected=${sample.selected}`,
          ).toBeGreaterThanOrEqual(4.5);
        }
        const axe = await new AxeBuilder({ page })
          .include(`[data-testid="tabs-contrast-${variant}"]`)
          .withRules(["color-contrast"])
          .analyze();
        expect(axe.violations).toEqual([]);
        expect(axe.incomplete).toEqual([]);
        await testInfo.attach("tabs-interaction-contrast.json", {
          body: JSON.stringify(
            {
              variant,
              theme,
              width,
              settledAnimations: {
                selectedDetails: selectedDetailsAnimations,
                hovered: hoveredAnimations,
              },
              selectedDetails,
              hovered,
            },
            null,
            2,
          ),
          contentType: "application/json",
        });
        expect(errors).toEqual([]);
        expect(requests).toEqual([]);
      });
    }
  }
}
