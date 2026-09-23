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
let temporaryDirectory: string;
let javascript: string;
let css: string;

test.beforeAll(async () => {
  temporaryDirectory = await mkdtemp(
    path.join(os.tmpdir(), "core-missionary-charts-"),
  );
  const buildScript = path.join(temporaryDirectory, "build.ts");
  await writeFile(
    buildScript,
    `const result = await Bun.build({
      entrypoints: [${JSON.stringify(path.join(root, "tests/e2e/fixtures/missionary-dashboard-charts.tsx"))}],
      outdir: ${JSON.stringify(temporaryDirectory)},
      target: "browser",
      format: "iife",
      define: { "process.env.NODE_ENV": '"production"' },
      plugins: [{ name: "loading-metrics", setup(build) {
        build.onResolve({ filter: /^@asym\\/lib\\/hooks$/ }, () => ({ path: "loading-state", namespace: "loading-metrics" }));
        build.onLoad({ filter: /.*/, namespace: "loading-metrics" }, () => ({
          contents: "const metric={total:90071992547409.9,change:12.5,trend:'up',data:[{date:'1',value:10},{date:'2',value:30}]}; export function useDonationMetrics() { return { thisMonth:metric,lastMonth:{...metric,total:-1234567890},yearToDate:metric,isLoading: false, error: null, monthlyBreakdown: Array.from({length:13},(_,i)=>({month:String(i+1),recurring:100,oneTime:50,offline:25,total:175})) }; }",
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
    path.join(temporaryDirectory, "missionary-dashboard-charts.js"),
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
      test(`missionary charts retain container geometry and tooltip values at ${width}px in ${theme}, motion ${reducedMotion}`, async ({
        page,
      }) => {
        const errors: string[] = [],
          requests: string[] = [];
        page.on("pageerror", (e) => errors.push(e.message));
        await page.route("**/*", (route) => {
          requests.push(route.request().url());
          return route.abort();
        });
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme: theme, reducedMotion });
        await page.setContent(
          `<!doctype html><html lang="en" class="${theme === "dark" ? "dark" : ""}"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Missionary charts</title></head><body><div id="root"></div></body></html>`,
        );
        await page.addStyleTag({ content: css });
        await page.addScriptTag({ content: javascript });
        await expect(page.locator("[data-chart]")).toHaveCount(4);
        await expect(page.locator(".recharts-bar-rectangle path")).toHaveCount(
          39,
        );
        const sizes = await page.locator("[data-chart]").evaluateAll((nodes) =>
          nodes.map((n) => {
            const r = n.getBoundingClientRect(),
              svg = n
                .querySelector("svg.recharts-surface")!
                .getBoundingClientRect();
            return {
              width: r.width,
              height: r.height,
              svgWidth: svg.width,
              svgHeight: svg.height,
            };
          }),
        );
        for (const size of sizes) {
          expect(size.width).toBeGreaterThan(0);
          expect(size.height).toBeGreaterThan(0);
          expect(Math.abs(size.width - size.svgWidth)).toBeLessThan(1.1);
          expect(Math.abs(size.height - size.svgHeight)).toBeLessThan(1.1);
        }
        expect(sizes[3]!.height).toBe(
          width < 640 ? 200 : width < 768 ? 250 : 300,
        );
        const amountBoundaries = await page.locator("h3").evaluateAll((nodes) =>
          nodes.map((n) => {
            const text = document.createRange();
            text.selectNodeContents(n);
            const rect = text.getBoundingClientRect();
            const chart =
              n.parentElement!.parentElement!.nextElementSibling!.getBoundingClientRect();
            return {
              amount: n.textContent,
              right: rect.right,
              chartLeft: chart.left,
            };
          }),
        );
        expect(amountBoundaries.map(({ amount }) => amount)).toEqual([
          "$90071992547.4k",
          "$-1,234,567,890",
          "$90071992547.4k",
        ]);
        for (const amount of amountBoundaries)
          expect(amount.right).toBeLessThanOrEqual(amount.chartLeft + 1);
        const tickBounds = await page
          .getByTestId("breakdown")
          .locator(".recharts-yAxis .recharts-cartesian-axis-tick-value")
          .evaluateAll((nodes) =>
            nodes.map((n) => {
              const r = n.getBoundingClientRect(),
                svg = n
                  .closest("svg.recharts-surface")!
                  .getBoundingClientRect();
              return {
                text: n.textContent,
                left: r.left - svg.left,
                right: r.right - svg.right,
                top: r.top - svg.top,
                bottom: r.bottom - svg.bottom,
              };
            }),
          );
        expect(tickBounds.length).toBeGreaterThan(0);
        for (const tick of tickBounds) {
          expect(
            tick.left,
            `${tick.text} must retain its currency prefix`,
          ).toBeGreaterThanOrEqual(0);
          expect(tick.right).toBeLessThanOrEqual(0);
        }
        const bar = page
          .getByTestId("breakdown")
          .locator(".recharts-bar-rectangle path")
          .first();
        await bar.hover();
        const tooltip = page.locator(".recharts-tooltip-wrapper");
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toContainText("Recurring");
        await expect(tooltip).toContainText("$100");
        await expect(tooltip).toContainText("One-Time");
        await expect(tooltip).toContainText("$50");
        await expect(tooltip).toContainText("Offline");
        await expect(tooltip).toContainText("$25");
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth),
        ).toBeLessThanOrEqual(width);
        expect(errors).toEqual([]);
        expect(requests).toEqual([]);
      });
    }
  }
}
