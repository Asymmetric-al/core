import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";

import { expect, test } from "@playwright/test";

const root = process.cwd();
const require = createRequire(path.join(root, "package.json"));
const tailwind = require("@tailwindcss/postcss");
const postcss = createRequire(require.resolve("@tailwindcss/postcss"))(
  "postcss",
);
let directory: string;
let javascript: string;
let css: string;

test.beforeAll(async () => {
  directory = await mkdtemp(path.join(os.tmpdir(), "core-wallet-layout-"));
  const bundle = path.join(directory, "fixture.js");
  execFileSync(
    "bun",
    ["--no-env-file", "tests/e2e/fixtures/build-donor-wallet.mjs", bundle],
    { cwd: root, stdio: "pipe", timeout: 30_000 },
  );
  javascript = await readFile(bundle, "utf8");
  const stylesheet = path.join(root, "packages/ui/styles/globals.css");
  css = (
    await postcss([tailwind({ base: root, optimize: false })]).process(
      await readFile(stylesheet, "utf8"),
      { from: stylesheet },
    )
  ).css;
});

test.afterAll(async () => {
  if (directory) await rm(directory, { recursive: true, force: true });
});

for (const theme of ["light", "dark"]) {
  for (const width of [320, 1280]) {
    for (const motion of ["reduce", "no-preference"] as const) {
      test(`wallet lists saved payment methods legibly in ${theme} at ${width}px with ${motion} motion`, async ({
        page,
      }) => {
        const errors: string[] = [];
        page.on("pageerror", (error) => errors.push(error.message));
        // No network: the fixture seeds the wallet and portal queries.
        await page.route("**/*", (route) => route.abort());
        await page.setViewportSize({
          width,
          height: width === 320 ? 568 : 900,
        });
        await page.emulateMedia({ reducedMotion: motion });
        await page.setContent(
          `<!doctype html><html lang="en" class="${theme === "dark" ? "dark" : ""}"><head><meta charset="utf-8"><title>Wallet regression</title></head><body><div id="root"></div></body></html>`,
        );
        await page.addStyleTag({ content: css });
        await page.addScriptTag({ content: javascript });

        await expect(
          page.getByRole("heading", { name: "Payment methods", exact: true }),
        ).toBeVisible();
        await expect(
          page.getByRole("button", { name: "Manage payment methods" }),
        ).toBeVisible();
        const methods = page
          .getByRole("list", { name: "Saved payment methods" })
          .locator(":scope > li");
        await expect(methods).toHaveCount(3);

        const visa = page.getByRole("listitem", {
          name: "Visa ending in 4242",
        });
        await expect(visa.getByText("Default", { exact: true })).toBeVisible();
        await expect(visa.getByText("Nairobi Water Wells")).toBeVisible();
        await expect(visa.getByText("$120.00 a quarter")).toBeVisible();
        await expect(
          page
            .getByRole("listitem", { name: "Mastercard ending in 5454" })
            .getByText("Expired", { exact: true }),
        ).toBeVisible();

        // Long gift and bank names wrap inside their card, never past it.
        for (const item of await methods.all()) {
          const fits = await item.evaluate((element) => {
            const card = element.getBoundingClientRect();
            return [...element.querySelectorAll("p, span")].every((node) => {
              const range = document.createRange();
              range.selectNodeContents(node);
              return [...range.getClientRects()].every(
                (rect) =>
                  rect.left >= card.left - 0.5 &&
                  rect.right <= card.right + 0.5,
              );
            });
          });
          expect(fits).toBe(true);
        }
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth),
        ).toBeLessThanOrEqual(width);
        expect(errors).toEqual([]);
      });
    }
  }
}
