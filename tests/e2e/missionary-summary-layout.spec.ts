import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";

import { expect, test } from "@playwright/test";

const root = process.cwd();
const rootRequire = createRequire(path.join(root, "package.json"));
const tailwindPostcss = rootRequire("@tailwindcss/postcss");
const postcss = createRequire(rootRequire.resolve("@tailwindcss/postcss"))(
  "postcss",
);
let temporaryDirectory: string;
let javascript: string;
let css: string;

test.beforeAll(async () => {
  temporaryDirectory = await mkdtemp(
    path.join(os.tmpdir(), "core-missionary-summary-"),
  );
  const bundle = path.join(temporaryDirectory, "fixture.js");
  execFileSync(
    "bun",
    [
      "--no-env-file",
      "build",
      "tests/e2e/fixtures/missionary-summary.tsx",
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
  if (temporaryDirectory)
    await rm(temporaryDirectory, { recursive: true, force: true });
});

for (const theme of ["light", "dark"]) {
  for (const width of [375, 768, 1280]) {
    test(`missionary funds and loading placeholders fit ${width}px in ${theme}`, async ({
      page,
    }) => {
      await page.route("**/*", (route) => route.abort());
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setContent(
        `<!doctype html><html lang="en" class="${theme === "dark" ? "dark" : ""}"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Missionary summary layout</title></head><body><div id="root"></div></body></html>`,
      );
      await page.addStyleTag({ content: css });
      await page.addScriptTag({ content: javascript });
      await expect(page.getByTestId("missionary-summary")).toBeVisible();
      for (const balance of [0, -1234.56, 1234567890123.45]) {
        const card = page.getByTestId(`balance-${balance}`);
        await expect(card.getByRole("heading")).toHaveText(
          `$${balance.toLocaleString("en-US")}`,
        );
        const amount = await card.getByRole("heading").evaluate((node) => ({
          available: node.clientWidth,
          used: node.scrollWidth,
        }));
        expect(amount.used).toBeLessThanOrEqual(amount.available + 1);
      }
      await expect(
        page.getByTestId("metrics").locator('[data-slot="skeleton"]'),
      ).toHaveCount(16);
      await expect(
        page.getByTestId("chart").locator('[data-slot="skeleton"]'),
      ).toHaveCount(3);
      await expect(
        page.getByTestId("activity").locator('[data-slot="skeleton"]'),
      ).toHaveCount(19);
      const placeholders = await page
        .locator('[data-slot="skeleton"]')
        .evaluateAll((nodes) =>
          nodes.map((node) => {
            const bounds = node.getBoundingClientRect();
            const parent = node.parentElement!.getBoundingClientRect();
            return {
              right: bounds.right,
              left: bounds.left,
              parentRight: parent.right,
              parentLeft: parent.left,
              duration: getComputedStyle(node).animationDuration,
            };
          }),
        );
      for (const placeholder of placeholders) {
        expect(placeholder.right).toBeLessThanOrEqual(
          placeholder.parentRight + 1,
        );
        expect(placeholder.left).toBeGreaterThanOrEqual(
          placeholder.parentLeft - 1,
        );
        expect(Number.parseFloat(placeholder.duration)).toBeLessThanOrEqual(
          0.001,
        );
      }
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
    });
  }
}
