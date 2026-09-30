import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";

import { expect, test, type Locator } from "@playwright/test";

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
    path.join(os.tmpdir(), "core-public-about-"),
  );
  const bundle = path.join(temporaryDirectory, "fixture.js");
  // Keep the route, motion, theme, Next Image and navigation components real.
  // Environment configuration is an explicit local-only bundle boundary.
  const imageEntry = path.join(
    root,
    "packages/ui/node_modules/next/dist/client/image-component.js",
  );
  const imageAdapter = `import { Image } from ${JSON.stringify(imageEntry)}; export default Image;`;
  const build = `
    const result = await Bun.build({
      entrypoints: ["tests/e2e/fixtures/public-about-layout.tsx"],
      target: "browser", format: "iife",
      define: { "process.env": "{}", "process.env.NODE_ENV": '\"production\"', __dirname: '\"/\"' },
      plugins: [{ name: "local-about-boundaries", setup(build) {
        build.onResolve({ filter: /^@asym\\/env$/ }, () => ({ path: "config", namespace: "fixture-env" }));
        build.onLoad({ filter: /.*/, namespace: "fixture-env" }, () => ({ contents: "export const clientEnv={}; export const serverEnv={};", loader: "js" }));
        build.onResolve({ filter: /^next\\/image$/ }, () => ({ path: "image", namespace: "fixture-image" }));
        build.onLoad({ filter: /.*/, namespace: "fixture-image" }, () => ({ contents: ${JSON.stringify(imageAdapter)}, loader: "js" }));
      }}]
    });
    if (!result.success) throw new Error(result.logs.join("\\n"));
    await Bun.write(${JSON.stringify(bundle)}, result.outputs[0]);
  `;
  execFileSync("bun", ["--no-env-file", "-e", build], {
    cwd: root,
    stdio: "pipe",
    timeout: 30_000,
  });
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

async function finishEntrances(route: Locator) {
  const entrances = route.locator('[style*="opacity:"]');
  for (const entrance of await entrances.all()) {
    await entrance.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        entrance.evaluate((node) => Number(getComputedStyle(node).opacity)),
      )
      .toBe(1);
  }
}

for (const reducedMotion of ["reduce", "no-preference"] as const) {
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 1024, height: 900 },
    { width: 844, height: 390 },
  ]) {
    test(`About content and links remain usable at ${viewport.width}x${viewport.height} with ${reducedMotion} motion`, async ({
      page,
    }, testInfo) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => {
        errors.push(error.message);
      });
      await page.route("**/*", (route) => route.abort());
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion });
      await page.setContent(
        '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>About layout</title></head><body class="font-sans"><div id="root"></div></body></html>',
      );
      await page.addStyleTag({ content: css });
      await page.addScriptTag({ content: javascript });
      const route = page.getByTestId("about-route-shell");
      await expect(route).toBeVisible();
      await finishEntrances(route);
      const clipping = await route.evaluate((root) => {
        const clipped: string[] = [];
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const text = walker.currentNode;
          if (
            !text.textContent?.trim() ||
            text.parentElement?.closest("script,style,svg")
          )
            continue;
          let block = text.parentElement;
          while (block && getComputedStyle(block).display === "inline")
            block = block.parentElement;
          if (!block) continue;
          const bounds = block.getBoundingClientRect();
          const range = document.createRange();
          range.selectNodeContents(text);
          const clippingAncestors: DOMRect[] = [];
          let ancestor = text.parentElement;
          while (ancestor && root.contains(ancestor)) {
            if (
              ["hidden", "clip", "scroll", "auto"].includes(
                getComputedStyle(ancestor).overflowX,
              )
            ) {
              clippingAncestors.push(ancestor.getBoundingClientRect());
            }
            ancestor = ancestor.parentElement;
          }
          if (
            [...range.getClientRects()].some(
              (rect) =>
                rect.width > 0 &&
                [bounds, ...clippingAncestors].some(
                  (boundary) =>
                    rect.left < boundary.left - 1 ||
                    rect.right > boundary.right + 1,
                ),
            )
          ) {
            clipped.push(text.textContent.trim());
          }
        }
        return clipped;
      });
      await testInfo.attach("clipped-text", {
        body: JSON.stringify(clipping),
        contentType: "application/json",
      });
      const geometry = await page.evaluate(() => ({
        width: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        outside: [...document.querySelectorAll("body *")]
          .map((node) => {
            const rect = node.getBoundingClientRect();
            return {
              tag: node.tagName,
              className: node.getAttribute("class"),
              text: node.textContent?.slice(0, 80),
              left: rect.left,
              right: rect.right,
              width: rect.width,
              position: getComputedStyle(node).position,
              parentWidth: node.parentElement?.getBoundingClientRect().width,
            };
          })
          .filter(
            (node) =>
              node.width > 0 && (node.left < -1 || node.right > innerWidth + 1),
          ),
      }));
      await testInfo.attach("document-geometry", {
        body: JSON.stringify(geometry, null, 2),
        contentType: "application/json",
      });
      expect.soft(clipping).toEqual([]);
      // The unchanged Footer has a separately recorded 34px social-row
      // overflow at 1024px. Keep it rendered, but own About's geometry here.
      const aboutBounds = await route.evaluate((node) => ({
        left: node.getBoundingClientRect().left,
        right: node.getBoundingClientRect().right,
        width: node.clientWidth,
        scrollWidth: node.scrollWidth,
      }));
      expect(aboutBounds.left).toBeGreaterThanOrEqual(0);
      expect(aboutBounds.right).toBeLessThanOrEqual(viewport.width);
      expect(aboutBounds.scrollWidth).toBeLessThanOrEqual(aboutBounds.width);

      const main = page.getByRole("main");
      await expect(main).toHaveCount(1);
      await expect(main).toHaveAttribute("id", "main-content");
      await page.getByRole("link", { name: "Skip to main content" }).focus();
      await page.keyboard.press("Enter");
      await expect(main).toBeFocused();
      const links = route.getByRole("link");
      for (let index = 0; index < 3; index++) {
        await page.keyboard.press("Tab");
        await expect(links.nth(index)).toBeFocused();
        expect(
          await links
            .nth(index)
            .evaluate((node) => node.matches(":focus-visible")),
        ).toBe(true);
      }
      for (let index = 1; index >= 0; index--) {
        await page.keyboard.press("Shift+Tab");
        await expect(links.nth(index)).toBeFocused();
        const bounds = await links.nth(index).boundingBox();
        const nav = await page
          .getByRole("navigation", { name: "Main navigation" })
          .boundingBox();
        expect(bounds!.y).toBeGreaterThanOrEqual(nav!.y + nav!.height);
      }
      await expect(links.nth(0)).toHaveAttribute("href", "/workers");
      await expect(links.nth(1)).toHaveAttribute("href", "/workers");
      await expect(links.nth(2)).toHaveAttribute(
        "href",
        "/checkout?fund=general",
      );
      await expect(page.locator("html")).toHaveClass("light");
      // Public sections also inherit an enclosing dark surface. Keep this
      // compatibility check separate from the donor's forced-light document.
      await page.getByTestId("about-theme-parent").evaluate(async (node) => {
        node.classList.add("dark");
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        );
        await Promise.all(
          node
            .getAnimations({ subtree: true })
            .map((animation) => animation.finished.catch(() => {})),
        );
      });
      const eyebrowContrast = await route
        .getByText("The Protocol", { exact: true })
        .evaluate((node) => {
          const canvas = document.createElement("canvas");
          canvas.width = canvas.height = 1;
          const context = canvas.getContext("2d")!;
          const luminance = (color: string) => {
            context.clearRect(0, 0, 1, 1);
            context.fillStyle = color;
            context.fillRect(0, 0, 1, 1);
            return [...context.getImageData(0, 0, 1, 1).data]
              .slice(0, 3)
              .reduce((sum, value, index) => {
                const channel = value / 255;
                return (
                  sum +
                  (channel <= 0.04045
                    ? channel / 12.92
                    : ((channel + 0.055) / 1.055) ** 2.4) *
                    [0.2126, 0.7152, 0.0722][index]!
                );
              }, 0);
          };
          const foreground = luminance(getComputedStyle(node).color);
          const background = luminance(
            getComputedStyle(node.closest("section")!).backgroundColor,
          );
          return {
            color: getComputedStyle(node).color,
            colorScheme: getComputedStyle(node).colorScheme,
            background: getComputedStyle(node.closest("section")!)
              .backgroundColor,
            ratio:
              (Math.max(foreground, background) + 0.05) /
              (Math.min(foreground, background) + 0.05),
          };
        });
      await testInfo.attach("dark-parent-eyebrow", {
        body: JSON.stringify(eyebrowContrast),
        contentType: "application/json",
      });
      expect(eyebrowContrast.colorScheme).toBe("dark");
      expect(eyebrowContrast.ratio).toBeGreaterThanOrEqual(4.5);
      await expect(page.locator("html")).toHaveClass("light");
      expect(errors).toEqual([]);
    });
  }
}
