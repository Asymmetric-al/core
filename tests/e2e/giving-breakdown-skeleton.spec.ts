import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
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
const percentages = [45, 62, 38, 71, 55, 82, 48, 67, 41, 75, 58, 89, 52];
let temporaryDirectory: string;
let javascript: string;
let css: string;

test.beforeAll(async () => {
  temporaryDirectory = await mkdtemp(
    path.join(os.tmpdir(), "core-giving-skeleton-"),
  );
  const buildScript = path.join(temporaryDirectory, "build.ts");
  await writeFile(
    buildScript,
    `const result = await Bun.build({
      entrypoints: [${JSON.stringify(path.join(root, "tests/e2e/fixtures/giving-breakdown-skeleton.tsx"))}],
      outdir: ${JSON.stringify(temporaryDirectory)},
      target: "browser",
      format: "iife",
      define: { "process.env.NODE_ENV": '"production"' },
      plugins: [{ name: "loading-metrics", setup(build) {
        build.onResolve({ filter: /^@asym\\/lib\\/hooks$/ }, () => ({ path: "loading-state", namespace: "loading-metrics" }));
        build.onLoad({ filter: /.*/, namespace: "loading-metrics" }, () => ({
          contents: "export function useDonationMetrics() { return { isLoading: true, error: null, monthlyBreakdown: [] }; }",
          loader: "ts",
        }));
      }}],
    });
    if (!result.success) throw new Error(result.logs.join("\\n"));`,
  );
  execFileSync("bun", ["--no-env-file", buildScript], {
    cwd: root,
    stdio: "pipe",
    timeout: 30_000,
  });
  javascript = await readFile(
    path.join(temporaryDirectory, "giving-breakdown-skeleton.js"),
    "utf8",
  );
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

for (const width of [320, 768, 1280]) {
  for (const theme of ["light", "dark"] as const) {
    for (const reducedMotion of ["reduce", "no-preference"] as const) {
      test(`giving loading bars remain visible and proportional at ${width}px in ${theme}, motion ${reducedMotion}`, async ({
        page,
      }) => {
        const requests: string[] = [];
        const errors: string[] = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.route("**/*", (route) => {
          requests.push(route.request().url());
          return route.abort();
        });
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme: theme, reducedMotion });
        await page.setContent(
          `<!doctype html><html lang="en" class="${theme === "dark" ? "dark" : ""}"><head><title>Giving loading state</title></head><body><div id="root"></div></body></html>`,
        );
        await page.addStyleTag({ content: css });
        await page.addScriptTag({ content: javascript });
        const skeletons = page
          .getByTestId("giving-loading")
          .locator('[data-slot="skeleton"]');
        await expect(skeletons).toHaveCount(16);
        const overflow = await page.evaluate(() => ({
          viewport: window.innerWidth,
          pageWidth: document.documentElement.scrollWidth,
          fixtureWidth: document.querySelector(
            '[data-testid="giving-loading"]',
          )!.scrollWidth,
        }));
        expect(overflow.pageWidth).toBeLessThanOrEqual(overflow.viewport);
        expect(overflow.fixtureWidth).toBeLessThanOrEqual(overflow.viewport);
        const bars = await skeletons.evaluateAll((nodes) =>
          nodes.slice(0, 13).map((node) => {
            const bounds = node.getBoundingClientRect();
            const column = node.parentElement!.getBoundingClientRect();
            return {
              width: bounds.width,
              height: bounds.height,
              columnHeight: column.height,
              bottomGap: column.bottom - bounds.bottom,
              animationDuration: getComputedStyle(node).animationDuration,
            };
          }),
        );
        for (const [index, bar] of bars.entries()) {
          expect(bar.width).toBeGreaterThan(0);
          expect(Number.isFinite(bar.columnHeight)).toBe(true);
          expect(bar.columnHeight).toBeGreaterThan(0);
          expect(bar.height).toBeGreaterThan(0);
          expect(
            Math.abs(
              bar.height - (bar.columnHeight * percentages[index]!) / 100,
            ),
          ).toBeLessThanOrEqual(1 / 64);
          expect(Math.abs(bar.bottomGap)).toBeLessThanOrEqual(1 / 64);
          if (reducedMotion === "reduce") {
            expect(
              Number.parseFloat(bar.animationDuration),
            ).toBeLessThanOrEqual(0.00001);
          }
        }
        expect(errors).toEqual([]);
        expect(requests).toEqual([]);
      });
    }
  }
}
