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
    path.join(os.tmpdir(), "core-data-table-accessibility-"),
  );
  const bundle = path.join(temporaryDirectory, "fixture.js");
  execFileSync(
    "bun",
    [
      "--no-env-file",
      "build",
      "tests/e2e/fixtures/data-table-accessibility.tsx",
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
  for (const width of [320, 700, 1280]) {
    test(`shared table controls retain accessible names and keyboard behavior at ${width}px in ${theme}`, async ({
      page,
    }, testInfo) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.route("**/*", (route) => route.abort());
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setContent(
        `<!doctype html><html lang="en" class="${theme === "dark" ? "dark" : ""}"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Table accessibility</title></head><body><div id="root"></div></body></html>`,
      );
      await page.addStyleTag({ content: css });
      await page.addScriptTag({ content: javascript });
      const toolbar = page.getByTestId("toolbar");
      const pagination = page.getByTestId("pagination");
      await expect(
        page.getByRole("heading", { name: "Table controls" }),
      ).toBeVisible();

      await page.getByTestId("before-table-controls").focus();
      await page.keyboard.press("Tab");
      await expect(
        width < 640
          ? toolbar
              .getByRole("button")
              .filter({ has: page.locator("svg.lucide-search") })
          : toolbar.getByRole("textbox", { name: "Search people" }),
      ).toBeFocused();

      // Capture both empty and populated responsive controls before assertions
      // so a regression reports every unnamed action, including clear-search.
      const initial = await new AxeBuilder({ page })
        .include("main")
        .withRules([
          "button-name",
          "select-name",
          "aria-command-name",
          "aria-input-field-name",
        ])
        .analyze();
      if (width < 640) {
        await toolbar
          .getByRole("button")
          .filter({ has: page.locator("svg.lucide-search") })
          .click();
      }
      const search = toolbar.getByRole("textbox", { name: "Search people" });
      await search.fill("Alice");
      await expect(
        page
          .getByRole("list", { name: "Visible people" })
          .getByRole("listitem"),
      ).toHaveText(["Alice"]);
      const populated = await new AxeBuilder({ page })
        .include("main")
        .withRules([
          "button-name",
          "select-name",
          "aria-command-name",
          "aria-input-field-name",
        ])
        .analyze();
      await testInfo.attach("accessible-names", {
        body: JSON.stringify(
          { initial: initial.violations, populated: populated.violations },
          null,
          2,
        ),
        contentType: "application/json",
      });
      expect(initial.violations).toEqual([]);
      expect(populated.violations).toEqual([]);

      const clearSearch = toolbar.getByRole("button", {
        name: "Clear search",
        exact: true,
      });
      await clearSearch.focus();
      await page.keyboard.press("Enter");
      await expect(search).toHaveValue("");
      await expect(
        page
          .getByRole("list", { name: "Visible people" })
          .getByRole("listitem"),
      ).toHaveText(["Alice", "Bob"]);
      if (width < 640) {
        const toggle = toolbar.getByRole("button", {
          name: "Toggle search",
          exact: true,
        });
        await expect(toggle).toHaveAttribute("aria-expanded", "true");
        await toggle.focus();
        await page.keyboard.press("Enter");
        await expect(search).toHaveCount(0);
        await expect(toggle).toHaveAttribute("aria-expanded", "false");
        await page.keyboard.press("Space");
        await expect(search).toBeFocused();
      }

      const columnTrigger = toolbar.getByRole("button", {
        name: "Toggle columns",
        exact: true,
      });
      await columnTrigger.focus();
      expect(
        await columnTrigger.evaluate((node) => node.matches(":focus-visible")),
      ).toBe(true);
      await expect
        .poll(() =>
          columnTrigger.evaluate((node) => getComputedStyle(node).boxShadow),
        )
        .toMatch(/0px 0px 0px 5px(?:,|$)/);
      await page.keyboard.press("Enter");
      const city = page.getByRole("menuitemcheckbox", {
        name: "City",
        exact: true,
      });
      await expect(city).toBeChecked();
      await page.keyboard.press("End");
      await expect(city).toBeFocused();
      await page.keyboard.press("Space");
      await expect(page.getByTestId("visible-columns")).toHaveText("name");
      await page.keyboard.press("Escape");
      await expect(columnTrigger).toBeFocused();

      const sizes = page.getByRole("combobox", {
        name: "Rows per page",
        exact: true,
      });
      await expect(sizes).toHaveCount(2);
      const labels = await sizes.evaluateAll((nodes) =>
        nodes.map((node) => {
          const id = node.getAttribute("aria-labelledby");
          return {
            id,
            text: id ? document.getElementById(id)?.textContent : null,
          };
        }),
      );
      expect(labels.every((label) => label.text === "Rows per page")).toBe(
        true,
      );
      expect(new Set(labels.map((label) => label.id)).size).toBe(2);
      const size = pagination.getByRole("combobox", {
        name: "Rows per page",
        exact: true,
      });
      await size.focus();
      await page.keyboard.press("Enter");
      await page.keyboard.press("End");
      await page.keyboard.press("Enter");
      await expect(size.locator("[data-slot=select-value]")).toHaveText("6");
      await expect(size).toBeFocused();
      await expect(
        page
          .getByRole("list", { name: "Visible people" })
          .getByRole("listitem"),
      ).toHaveCount(6);
      await expect(
        pagination.getByRole("button", { name: "Go to next page" }),
      ).toBeDisabled();

      const refresh = toolbar.getByRole("button", {
        name: "Refresh",
        exact: true,
      });
      await refresh.focus();
      await page.keyboard.press("Space");
      await expect(page.getByTestId("refreshes")).toHaveText("1");
      if (width >= 640) {
        await toolbar
          .getByRole("button", { name: "Export", exact: true })
          .focus();
        await page.keyboard.press("Enter");
        await expect(page.getByTestId("exports")).toHaveText("1");
      }
      await page.getByRole("button", { name: "Toggle pending" }).click();
      await expect(size).toBeDisabled();
      await expect(columnTrigger).toBeDisabled();
      await expect(search).toBeDisabled();
      await expect(refresh).toBeDisabled();
      if (width < 640)
        await expect(
          toolbar.getByRole("button", { name: "Toggle search", exact: true }),
        ).toBeDisabled();
      expect(errors).toEqual([]);
    });
  }
}
