import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";

import { expect, test, type Page } from "@playwright/test";
const root = process.cwd();
const rootRequire = createRequire(path.join(root, "package.json"));
const tailwindPostcss = rootRequire("@tailwindcss/postcss");
const postcss = createRequire(rootRequire.resolve("@tailwindcss/postcss"))(
  "postcss",
);
let temporaryDirectory: string, javascript: string, css: string;
test.beforeAll(async () => {
  temporaryDirectory = await mkdtemp(
    path.join(os.tmpdir(), "core-popover-positioning-"),
  );
  const bundle = path.join(temporaryDirectory, "fixture.js");
  execFileSync(
    "bun",
    [
      "--no-env-file",
      "build",
      "tests/e2e/fixtures/popover-positioning.tsx",
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

async function renderFixture(page: Page, theme = "light") {
  await page.route("**/*", (route) => route.abort());
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setContent(
    `<!doctype html><html lang="en" class="${theme === "dark" ? "dark" : ""}"><head><title>Popover positioning</title></head><body><div id="root"></div></body></html>`,
  );
  await page.addStyleTag({ content: css });
  await page.addScriptTag({ content: javascript });
}
async function openCalendar(page: Page) {
  const trigger = page.getByRole("button", {
    name: "Open calendar",
    exact: true,
  });
  await trigger.click();
  const popup = page.locator('[data-slot="popover-content"]');
  await expect(popup).toBeVisible();
  await expect
    .poll(() =>
      popup.evaluate((n) =>
        n.getAnimations().every((a) => a.playState === "finished"),
      ),
    )
    .toBe(true);
  return { trigger, popup };
}

test("popover preserves anchored placement when collision preference is omitted", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await renderFixture(page);
  const { trigger, popup } = await openCalendar(page);
  const anchor = await trigger.boundingBox(),
    bounds = await popup.boundingBox();
  expect(bounds!.y).toBeGreaterThanOrEqual(anchor!.y + anchor!.height);
  await page.keyboard.press("Escape");
  await expect(popup).toBeHidden();
  await expect(trigger).toBeFocused();
});
for (const theme of ["light", "dark"])
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 844, height: 390 },
  ]) {
    test(`popover viewport shift keeps calendar usable in ${theme} at ${viewport.width}x${viewport.height}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await renderFixture(page, theme);
      await page
        .getByRole("button", { name: "Use viewport shift", exact: true })
        .click();
      const { trigger, popup } = await openCalendar(page);
      const bounds = await popup.boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.y).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width);
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(viewport.height);
      const lastDay = popup.getByRole("button", { name: /January 31st, 2026/ });
      await lastDay.click();
      await expect(page.getByTestId("selected-day")).toHaveText("31");
      await popup.getByRole("button", { name: /January 30th, 2026/ }).focus();
      await page.keyboard.press("Enter");
      await expect(page.getByTestId("selected-day")).toHaveText("30");
      await page.keyboard.press("Escape");
      await expect(popup).toBeHidden();
      await expect(trigger).toBeFocused();
    });
  }
