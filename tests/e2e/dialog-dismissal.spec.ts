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
    path.join(os.tmpdir(), "core-dialog-dismissal-"),
  );
  const bundle = path.join(temporaryDirectory, "fixture.js");
  execFileSync(
    "bun",
    [
      "build",
      "tests/e2e/fixtures/dialog-dismissal.tsx",
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

test.beforeEach(async ({ page }) => {
  await page.route("**/*", (route) => route.abort());
  await page.setViewportSize({ width: 375, height: 812 });
  await page.setContent(
    '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Dialog dismissal</title></head><body><div id="root"></div></body></html>',
  );
  await page.addStyleTag({ content: css });
  await page.addScriptTag({ content: javascript });
});

for (const replacement of [false, true]) {
  test(`dialog finishes closing after canceled exit ${replacement ? "with" : "without"} replacement motion`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const trigger = page.getByRole("button", {
      name: "Open dialog",
      exact: true,
    });
    const popup = page.getByRole("dialog", { name: "Dialog dismissal" });
    await trigger.click();
    await expect(popup).toBeVisible();
    await popup.evaluate((element) =>
      Promise.all(
        element
          .getAnimations()
          .map((animation) => animation.finished.catch(() => {})),
      ),
    );

    const cancellation = await popup.evaluateHandle(
      (element, replace) => ({
        completion: (async () => {
          await new Promise<void>((resolve) => {
            const observer = new MutationObserver(() => {
              if (element.hasAttribute("data-closed")) {
                observer.disconnect();
                resolve();
              }
            });
            observer.observe(element, {
              attributes: true,
              attributeFilter: ["data-closed"],
            });
          });
          // Register the real CSS exit before canceling it, as happens when a
          // transition's dependent property changes during dismissal.
          await new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
          );
          const animations = element
            .getAnimations()
            .filter((animation) => animation.playState !== "finished");
          const canceledExit = animations.some(
            (animation) =>
              animation instanceof CSSAnimation &&
              animation.animationName === "exit",
          );
          const replacementAnimation = replace
            ? element.animate([{ opacity: 1 }, { opacity: 0 }], {
                duration: 300,
                fill: "both",
              })
            : null;
          for (const animation of animations) animation.cancel();

          let retainedDuringReplacement = true;
          if (replacementAnimation) {
            const observer = new MutationObserver(() => {
              if (
                !element.isConnected &&
                replacementAnimation.playState !== "finished"
              ) {
                retainedDuringReplacement = false;
              }
            });
            observer.observe(document, { childList: true, subtree: true });
            try {
              await replacementAnimation.finished;
            } finally {
              observer.disconnect();
            }
          }
          return { canceledExit, retainedDuringReplacement };
        })(),
      }),
      replacement,
    );

    await page.keyboard.press("Escape");
    const result = await cancellation.evaluate((probe) => probe.completion);
    await cancellation.dispose();
    expect(result.canceledExit).toBe(true);
    expect(result.retainedDuringReplacement).toBe(true);
    await expect(
      page.locator(
        '[data-slot="dialog-content"], [data-slot="dialog-overlay"], [data-slot="dialog-portal"]',
      ),
    ).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await trigger.click();
    await expect(popup).toBeVisible();
    await popup.getByRole("button", { name: "Close", exact: true }).click();
    await expect(
      page.locator(
        '[data-slot="dialog-content"], [data-slot="dialog-overlay"], [data-slot="dialog-portal"]',
      ),
    ).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
}

test("reduced-motion dialogs close and reopen without retaining their portal", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const trigger = page.getByRole("button", {
    name: "Open dialog",
    exact: true,
  });
  const popup = page.getByRole("dialog", { name: "Dialog dismissal" });
  for (let iteration = 0; iteration < 5; iteration++) {
    await trigger.click();
    await expect(popup).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(
      page.locator(
        '[data-slot="dialog-content"], [data-slot="dialog-overlay"], [data-slot="dialog-portal"]',
      ),
    ).toHaveCount(0);
    await expect(trigger).toBeFocused();
  }
});
