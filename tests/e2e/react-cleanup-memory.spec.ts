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
    path.join(os.tmpdir(), "core-react-cleanup-memory-"),
  );
  const bundle = path.join(temporaryDirectory, "react-cleanup-memory.js");
  execFileSync(
    "bun",
    [
      "--no-env-file",
      "tests/e2e/fixtures/build-react-cleanup.ts",
      temporaryDirectory,
      path.join(root, "tests/e2e/fixtures/react-cleanup-memory.tsx"),
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

for (const width of [320, 1280])
  for (const theme of ["light", "dark"] as const)
    for (const motion of ["reduce", "no-preference"] as const) {
      test(`memory feedback and pending delete focus at ${width}px in ${theme}, ${motion}`, async ({
        page,
      }, testInfo) => {
        const errors: string[] = [],
          requests: string[] = [];
        page.on("pageerror", (e) => errors.push(e.message));
        await page.route("**/*", (route) => {
          requests.push(route.request().url());
          return route.abort();
        });
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme: theme, reducedMotion: motion });
        await page.setContent(
          `<!doctype html><html lang="en" class="${theme === "dark" ? "dark" : ""}"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Private memory</title></head><body><div id="root"></div></body></html>`,
        );
        await page.addStyleTag({ content: css });
        await page.evaluate(() => {
          const timestamp = "2026-10-06T00:00:00.000Z";
          const view = {
            requestId: "synthetic",
            entries: [
              {
                id: "entry-1",
                title: "Shared conventions",
                content: "Use shared tokens.",
                category: "preference",
                ownerProfileId: "synthetic-profile",
                tenantId: "synthetic-tenant",
                scopeType: "admin_private",
                source: "manual",
                version: 1,
                isDeleted: false,
                createdAt: timestamp,
                updatedAt: timestamp,
              },
            ],
            history: [],
            settings: [],
          };
          Reflect.set(globalThis, "__MEMORY_VIEW__", view);
          Reflect.set(globalThis, "__MEMORY_REQUESTS__", []);
          globalThis.fetch = async (input, init) => {
            if (String(input) !== "/api/admin/eve/admin-memory")
              throw new Error("Unexpected fixture request");
            if (!init?.method)
              return Response.json(Reflect.get(globalThis, "__MEMORY_VIEW__"));
            Reflect.get(globalThis, "__MEMORY_REQUESTS__").push({
              method: init.method,
              body: JSON.parse(String(init.body)),
            });
            return await new Promise<Response>((resolve) =>
              Reflect.set(globalThis, "__MEMORY_RESOLVE__", resolve),
            );
          };
        });
        await page.addScriptTag({ content: javascript });
        await expect(
          page.getByRole("button", { name: "Edit", exact: true }),
        ).toBeVisible();
        await page
          .getByLabel("Title", { exact: true })
          .fill("Project convention");
        await page
          .getByLabel("Advisory context", { exact: true })
          .fill("Use the shared design system.");
        const add = page.getByRole("button", {
          name: "Add private memory",
          exact: true,
        });
        await add.focus();
        await page.keyboard.press("Enter");
        await expect(
          page.getByText("Saving private memory change…", { exact: true }),
        ).toBeVisible();
        await expect(add).toBeFocused();
        await page.keyboard.press("Enter");
        await expect
          .poll(() =>
            page.evaluate(
              () => Reflect.get(globalThis, "__MEMORY_REQUESTS__").length,
            ),
          )
          .toBe(1);
        await page.evaluate(() =>
          Reflect.get(
            globalThis,
            "__MEMORY_RESOLVE__",
          )(
            Response.json({ error: "Synthetic save failure" }, { status: 409 }),
          ),
        );
        await expect(
          page.getByRole("alert").filter({ hasText: "Synthetic save failure" }),
        ).toBeVisible();
        await expect(page.getByLabel("Title", { exact: true })).toHaveValue(
          "Project convention",
        );
        await page.keyboard.press("Enter");
        await expect(
          page.getByText("Saving private memory change…", { exact: true }),
        ).toBeVisible();
        await page.evaluate(() =>
          Reflect.get(
            globalThis,
            "__MEMORY_RESOLVE__",
          )(Response.json(Reflect.get(globalThis, "__MEMORY_VIEW__"))),
        );
        await expect(
          page.getByText("Private memory change saved.", { exact: true }),
        ).toBeVisible();
        await expect(page.getByLabel("Title", { exact: true })).toHaveValue("");
        const remove = page.getByRole("button", {
          name: "Delete",
          exact: true,
        });
        await remove.focus();
        await page.keyboard.press("Enter");
        const confirm = page.getByRole("button", {
          name: "Confirm delete",
          exact: true,
        });
        await expect(confirm).toBeVisible();
        await confirm.focus();
        await page.keyboard.press("Enter");
        await expect(page.getByRole("alertdialog")).toHaveCount(0);
        await expect(remove).toBeFocused();
        await page.keyboard.press("Enter");
        await expect(page.getByRole("alertdialog")).toHaveCount(0);
        await expect
          .poll(() =>
            page.evaluate(
              () =>
                Reflect.get(globalThis, "__MEMORY_REQUESTS__").filter(
                  (x: { method: string }) => x.method === "DELETE",
                ).length,
            ),
          )
          .toBe(1);
        const axe = await new AxeBuilder({ page }).analyze();
        expect(axe.violations).toEqual([]);
        await page.screenshot({
          path: testInfo.outputPath(`memory-${width}-${theme}-${motion}.png`),
          fullPage: true,
        });
        await page.evaluate(() =>
          Reflect.get(
            globalThis,
            "__MEMORY_RESOLVE__",
          )(
            Response.json(
              { error: "Synthetic delete failure" },
              { status: 409 },
            ),
          ),
        );
        await expect(
          page
            .getByRole("alert")
            .filter({ hasText: "Synthetic delete failure" }),
        ).toBeVisible();
        await expect(remove).toBeFocused();
        expect(errors).toEqual([]);
        expect(requests).toEqual([]);
      });
    }
