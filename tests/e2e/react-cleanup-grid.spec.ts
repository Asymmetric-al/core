import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";

import AxeBuilder from "@axe-core/playwright";
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
    path.join(os.tmpdir(), "core-react-cleanup-grid-"),
  );
  const bundle = path.join(temporaryDirectory, "fixture.js");
  execFileSync(
    "bun",
    [
      "--no-env-file",
      "build",
      "tests/e2e/fixtures/react-cleanup-grid.tsx",
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

for (const width of [320, 1280])
  for (const theme of ["light", "dark"] as const) {
    test(`editable grid keeps Delete and Ctrl+C with its editor at ${width}px in ${theme}`, async ({
      page,
    }, testInfo) => {
      const errors: string[] = [],
        requests: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.route("**/*", (route) => {
        requests.push(route.request().url());
        return route.abort();
      });
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      await page.setContent(
        `<!doctype html><html lang="en" class="${theme === "dark" ? "dark" : ""}"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Grid ownership</title></head><body><div id="root"></div></body></html>`,
      );
      await page.addStyleTag({ content: css });
      await page.addScriptTag({ content: javascript });
      const grid = page.getByRole("grid", { name: "Data grid" });
      await expect(grid).toBeVisible();
      await grid
        .getByRole("checkbox", { name: "Select row 1", exact: true })
        .check();
      const cell = grid.getByRole("gridcell").filter({ hasText: "Alpha" });
      await cell.focus();
      await page.keyboard.press("Enter");
      const editor = grid.getByRole("textbox", {
        name: "Name, row 1",
        exact: true,
      });
      await expect(editor).toBeFocused();
      await page.keyboard.press("Delete");
      await expect(page.getByTestId("row-deletions")).toHaveText("[]");
      await expect(
        grid.getByRole("checkbox", { name: "Select row 2", exact: true }),
      ).toBeVisible();
      await editor.fill("Gamma");
      await editor.selectText();
      await page.keyboard.press("Control+c");
      await expect(page.getByTestId("grid-copies")).toHaveText("0");
      await expect(page.getByTestId("row-deletions")).toHaveText("[]");
      await expect(editor).toBeFocused();
      const axe = await new AxeBuilder({ page })
        .include("main")
        .withRules([
          "button-name",
          "aria-input-field-name",
          "aria-allowed-role",
          "aria-valid-attr-value",
        ])
        .analyze();
      expect(axe.violations).toEqual([]);
      await page.keyboard.press("Escape");
      await expect(editor).toHaveCount(0);
      await grid.focus();
      await page.keyboard.press("Delete");
      await expect(page.getByTestId("row-deletions")).toHaveText("[[0]]");
      await expect(
        grid.getByRole("gridcell").filter({ hasText: "Beta" }),
      ).toBeVisible();
      expect(errors).toEqual([]);
      expect(requests).toEqual([]);
      await page.screenshot({
        path: testInfo.outputPath(`grid-${width}-${theme}.png`),
        fullPage: true,
      });
    });
  }
