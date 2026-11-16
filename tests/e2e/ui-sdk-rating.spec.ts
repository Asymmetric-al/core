import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";

import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Reference proof for Core's UI SDK integration: the shared Maia-styled Rating
// (packages/ui/components/primitives/rating.tsx) renders on the server,
// hydrates that exact HTML in a real browser, and keeps UI SDK's radio-group
// keyboard, focus and form behavior.

const root = process.cwd();
const rootRequire = createRequire(path.join(root, "package.json"));
const tailwindPostcss = rootRequire("@tailwindcss/postcss");
const postcss = createRequire(rootRequire.resolve("@tailwindcss/postcss"))(
  "postcss",
);
const fixture = "tests/e2e/fixtures/ui-sdk-rating.tsx";
let temporaryDirectory: string;
let javascript: string;
let css: string;
let serverHtml: string;

test.beforeAll(async () => {
  temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "core-ui-sdk-"));
  const bundle = path.join(temporaryDirectory, "fixture.js");
  // Development React reports hydration mismatches; production stays silent.
  execFileSync(
    "bun",
    [
      "--no-env-file",
      "build",
      fixture,
      "--target=browser",
      "--format=iife",
      "--define",
      'process.env.NODE_ENV="development"',
      "--outfile",
      bundle,
    ],
    { cwd: root, stdio: "pipe", timeout: 60_000 },
  );
  javascript = await readFile(bundle, "utf8");
  serverHtml = execFileSync(
    "bun",
    [
      "--no-env-file",
      "-e",
      `import React from "react";
       import { renderToString } from "react-dom/server";
       import { App } from "./${fixture}";
       console.log(renderToString(React.createElement(App)));`,
    ],
    { cwd: root, encoding: "utf8", timeout: 60_000 },
  ).trim();
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

async function loadServerHtml(page: Page, theme: "light" | "dark") {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.setContent(
    `<!doctype html><html lang="en" class="${theme === "dark" ? "dark" : ""}"><head><meta charset="utf-8"><title>UI SDK rating</title></head><body><div id="root">${serverHtml}</div></body></html>`,
  );
  await page.addStyleTag({ content: css });
  return errors;
}

function contrastOf(page: Page, foregroundSelector: string) {
  return page.evaluate((selector) => {
    const context = document.createElement("canvas").getContext("2d")!;
    const channels = (color: string) => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      return Array.from(context.getImageData(0, 0, 1, 1).data).slice(0, 3);
    };
    const luminance = (rgb: number[]) =>
      rgb.reduce((sum, value, index) => {
        const channel = value / 255;
        const linear =
          channel <= 0.04045
            ? channel / 12.92
            : ((channel + 0.055) / 1.055) ** 2.4;
        return sum + linear * [0.2126, 0.7152, 0.0722][index]!;
      }, 0);
    const foreground = luminance(
      channels(getComputedStyle(document.querySelector(selector)!).color),
    );
    const background = luminance(
      channels(
        getComputedStyle(document.querySelector("main")!).backgroundColor,
      ),
    );
    return (
      (Math.max(foreground, background) + 0.05) /
      (Math.min(foreground, background) + 0.05)
    );
  }, foregroundSelector);
}

for (const theme of ["light", "dark"] as const) {
  for (const width of [375, 1280]) {
    test(`UI SDK rating hydrates server HTML and keeps keyboard behavior in ${theme} at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      const errors = await loadServerHtml(page, theme);

      const group = page.getByRole("radiogroup", {
        name: "How was the visit?",
      });
      const star = (name: string) =>
        group.getByRole("radio", { name, exact: true });

      // Server HTML: named group, the default score checked and the only tab stop.
      await expect(group).toBeVisible();
      await expect(star("3 stars")).toHaveAttribute("aria-checked", "true");
      await expect(group.locator('[role="radio"][tabindex="0"]')).toHaveCount(
        1,
      );
      await page.evaluate(() => {
        (window as unknown as { __serverGroup: Element }).__serverGroup =
          document.querySelector('[data-slot="rating"]')!;
      });

      await page.addScriptTag({ content: javascript });
      await expect(page.locator("html")).toHaveAttribute(
        "data-hydrated",
        "true",
      );
      expect(
        await page.evaluate(
          () =>
            (window as unknown as { __serverGroup: Element }).__serverGroup ===
            document.querySelector('[data-slot="rating"]'),
        ),
      ).toBe(true);
      expect(
        await page.evaluate(() => window.__recoverableErrors ?? []),
      ).toEqual([]);

      // Keyboard: Tab enters on the checked star, arrows move and check it.
      await page.getByRole("button", { name: "Before rating" }).focus();
      await page.keyboard.press("Tab");
      await expect(star("3 stars")).toBeFocused();
      const focusRing = await star("3 stars").evaluate(
        (radio) => getComputedStyle(radio.parentElement!).boxShadow,
      );
      expect(focusRing).not.toBe("none");

      await page.keyboard.press("ArrowRight");
      await expect(star("4 stars")).toBeFocused();
      await expect(star("4 stars")).toHaveAttribute("aria-checked", "true");
      const output = (name: string) => page.getByRole("status", { name });
      await expect(output("Current score")).toHaveText("4");
      await page.keyboard.press("ArrowLeft");
      await page.keyboard.press("ArrowLeft");
      await expect(star("2 stars")).toBeFocused();
      await expect(output("Current score")).toHaveText("2");

      // One tab stop: the next Tab leaves the group; Shift+Tab returns to the score.
      await page.keyboard.press("Tab");
      await expect(
        page.getByRole("button", { name: "Send rating" }),
      ).toBeFocused();
      await page.keyboard.press("Shift+Tab");
      await expect(star("2 stars")).toBeFocused();

      // Enter submits the owning form with the score under its name.
      await page.keyboard.press("Enter");
      await expect(output("Submitted score")).toHaveText("2");

      // Maia tokens paint the stars, with at least 3:1 graphical contrast.
      const items = group.locator('[data-slot="rating-item"]');
      await expect(items).toHaveCount(5);
      const color = (selector: string) =>
        page
          .locator(selector)
          .first()
          .evaluate((element) => getComputedStyle(element).color);
      expect(await color('[data-slot="rating-item"][data-filled]')).toBe(
        await color('[data-testid="warning-reference"]'),
      );
      expect(await color('[data-slot="rating-item"]:not([data-filled])')).toBe(
        await color('[data-testid="muted-reference"]'),
      );
      expect(
        await contrastOf(page, '[data-slot="rating-item"][data-filled]'),
      ).toBeGreaterThanOrEqual(3);
      expect(
        await contrastOf(page, '[data-slot="rating-item"]:not([data-filled])'),
      ).toBeGreaterThanOrEqual(3);

      // The SDK's runtime layer ranks below every Tailwind layer.
      expect(
        await page.evaluate(() =>
          [...document.styleSheets]
            .flatMap((sheet) => [...sheet.cssRules])
            .filter((rule) => rule instanceof CSSLayerStatementRule)
            .flatMap((rule) => [...(rule as CSSLayerStatementRule).nameList])
            .slice(0, 3),
        ),
      ).toEqual(["properties", "ui-sdk", "theme"]);

      const axe = await new AxeBuilder({ page })
        .include("main")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(axe.violations).toEqual([]);
      expect(errors).toEqual([]);
    });
  }
}

test("UI SDK rating keeps each touch target inside its star on coarse pointers", async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 375, height: 800 },
  });
  const page = await context.newPage();
  try {
    await loadServerHtml(page, "light");
    await page.addScriptTag({ content: javascript });
    await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
    expect(
      await page.evaluate(() => matchMedia("(pointer: coarse)").matches),
    ).toBe(true);

    // Core's base layer gives touch buttons a 44px minimum; the star must hold
    // the SDK's radio so a tap below a star never changes the score.
    const boxes = await page.evaluate(() =>
      [...document.querySelectorAll('[data-slot="rating-item"]')].map(
        (item) => {
          const star = item.getBoundingClientRect();
          const radio = item
            .querySelector('[data-slot="rating-radio"]')!
            .getBoundingClientRect();
          return {
            star: [star.top, star.bottom, star.left, star.right, star.height],
            radio: [radio.top, radio.bottom, radio.left, radio.right],
          };
        },
      ),
    );
    expect(boxes).toHaveLength(5);
    for (const { star, radio } of boxes) {
      expect(star[4]).toBeGreaterThanOrEqual(44);
      expect(radio[0]).toBeGreaterThanOrEqual(star[0] - 0.5);
      expect(radio[1]).toBeLessThanOrEqual(star[1] + 0.5);
      expect(radio[2]).toBeGreaterThanOrEqual(star[2] - 0.5);
      expect(radio[3]).toBeLessThanOrEqual(star[3] + 0.5);
    }

    const group = page.getByRole("radiogroup", { name: "How was the visit?" });
    await group.getByRole("radio", { name: "5 stars", exact: true }).tap();
    await expect(
      page.getByRole("status", { name: "Current score" }),
    ).toHaveText("5");
  } finally {
    await context.close();
  }
});
