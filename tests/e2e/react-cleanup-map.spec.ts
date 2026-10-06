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
    path.join(os.tmpdir(), "core-react-cleanup-map-"),
  );
  const bundle = path.join(temporaryDirectory, "react-cleanup-map.js");
  execFileSync(
    "bun",
    [
      "--no-env-file",
      "tests/e2e/fixtures/build-react-cleanup.ts",
      temporaryDirectory,
      path.join(root, "tests/e2e/fixtures/react-cleanup-map.tsx"),
    ],
    { cwd: root, stdio: "pipe", timeout: 30000 },
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

for (const linked of [false, true])
  for (const theme of ["light", "dark"] as const)
    for (const motion of ["reduce", "no-preference"] as const) {
      test(`mobile location detail owns keyboard focus in ${theme}, motion ${motion}, linked ${linked}`, async ({
        page,
      }, testInfo) => {
        const errors: string[] = [],
          requests: string[] = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.route("**/*", (route) => {
          requests.push(route.request().url());
          return route.abort();
        });
        await page.setViewportSize({ width: 320, height: 900 });
        await page.emulateMedia({ colorScheme: theme, reducedMotion: motion });
        await page.setContent(
          `<!doctype html><html lang="en" class="${theme === "dark" ? "dark" : ""}"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Map detail</title></head><body><div id="root"></div></body></html>`,
        );
        await page.addStyleTag({ content: css });
        await page.evaluate(
          (linked) =>
            Reflect.set(globalThis, "__CORE_FIXTURE_LINKED__", linked),
          linked,
        );
        await page.addScriptTag({ content: javascript });
        const pin = page.getByRole("button", {
          name: "View Synthetic location",
          exact: true,
        });
        await expect(pin).toBeVisible();
        await pin.focus();
        await page.keyboard.press("Enter");
        const dialog = page.getByRole("dialog", {
          name: "Synthetic location",
          exact: true,
        });
        await expect(dialog).toBeVisible();
        await expect
          .poll(() =>
            dialog.evaluate((node) => node.contains(document.activeElement)),
          )
          .toBe(true);
        for (let i = 0; i < 5; i++) {
          await page.keyboard.press("Tab");
          await expect
            .poll(() =>
              dialog.evaluate((node) => node.contains(document.activeElement)),
            )
            .toBe(true);
        }
        if (linked) {
          await expect(dialog.locator("a button")).toHaveCount(0);
          await expect(
            dialog.getByRole("link", {
              name: "Give to Synthetic location",
              exact: true,
            }),
          ).toBeVisible();
          await expect(
            dialog.getByRole("link", { name: "View Profile", exact: true }),
          ).toHaveAttribute("href", "/workers/worker-1");
        }
        const axe = await new AxeBuilder({ page })
          .include('[role="dialog"]')
          .analyze();
        expect(axe.violations).toEqual([]);
        await page.screenshot({
          path: testInfo.outputPath(`mobile-map-${theme}-${motion}.png`),
          fullPage: true,
        });
        await page.keyboard.press("Escape");
        await expect(dialog).toHaveCount(0);
        await expect(pin).toBeFocused();
        await page.keyboard.press("Enter");
        await expect(dialog).toBeVisible();
        const close = dialog.getByRole("button", {
          name: "Close location details",
          exact: true,
        });
        await close.focus();
        await page.keyboard.press("Enter");
        await expect(dialog).toHaveCount(0);
        await expect(pin).toBeFocused();
        expect(errors).toEqual([]);
        expect(requests).toEqual([]);
      });
    }
