import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";

import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Browser proof for Web Studio's column order: the real View menu
// (apps/admin/src/cms-ui/web-studio/collections/shared/list-workspace/
// grid-view-menu.tsx) inside its Base UI popover, with Web Studio's
// agent grant. A picked-up column goes back on Escape without closing the
// popover, keyboard, move buttons and a pointer drag save the order, and an
// agent moves a column through WebMCP (a stand-in: Chromium has no
// `document.modelContext`) but is refused a list the grant does not name.
// Payload's `setColumns` is the unit-tested seam
// after `onReorder` (tests/unit/apps/admin/web-studio-collection-grid.test.tsx).

const root = process.cwd();
const rootRequire = createRequire(path.join(root, "package.json"));
const tailwindPostcss = rootRequire("@tailwindcss/postcss");
const postcss = createRequire(rootRequire.resolve("@tailwindcss/postcss"))(
  "postcss",
);
const fixture = "tests/e2e/fixtures/ui-sdk-web-studio-column-order.tsx";
let temporaryDirectory: string;
let javascript: string;
let css: string;
let serverHtml: string;

test.beforeAll(async () => {
  temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "core-columns-"));
  const bundle = path.join(temporaryDirectory, "fixture.js");
  execFileSync(
    "bun",
    [
      "--no-env-file",
      "build",
      fixture,
      "--target=browser",
      "--format=iife",
      "--define",
      'process.env.NODE_ENV="development"',
      "--outfile",
      bundle,
    ],
    { cwd: root, stdio: "pipe", timeout: 120_000 },
  );
  javascript = await readFile(bundle, "utf8");
  serverHtml = execFileSync(
    "bun",
    [
      "--no-env-file",
      "-e",
      `import React from "react";
       import { renderToString } from "react-dom/server";
       import { App } from "./${fixture}";
       console.log(renderToString(React.createElement(App)));`,
    ],
    { cwd: root, encoding: "utf8", timeout: 60_000 },
  ).trim();
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

type Tool = { name: string; execute: (input: unknown) => Promise<unknown> };

const webMcpStandIn = () => {
  const tools = new Map<string, Tool>();
  (window as unknown as { __tools: Map<string, Tool> }).__tools = tools;
  Object.defineProperty(document, "modelContext", {
    configurable: true,
    value: {
      registerTool(tool: Tool, options?: { signal?: AbortSignal }) {
        tools.set(tool.name, tool);
        options?.signal?.addEventListener("abort", () =>
          tools.delete(tool.name),
        );
        return Promise.resolve();
      },
    },
  });
};

async function mount(page: Page, { webMcp = false } = {}) {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.setContent(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Web Studio column order</title></head><body><div id="root">${serverHtml}</div></body></html>`,
  );
  await page.addStyleTag({ content: css });
  if (webMcp) await page.evaluate(webMcpStandIn);
  await page.addScriptTag({ content: javascript });
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  return errors;
}

const view = (page: Page) => page.getByRole("button", { name: "View" });
const popover = (page: Page) => page.getByRole("dialog", { name: "Columns" });
const columnList = (page: Page) =>
  page.getByRole("list", { name: "Column order" });
const handle = (page: Page, name: string) =>
  page.getByRole("button", { name: `Reorder ${name}`, exact: true });
const saved = (page: Page) => page.getByRole("status", { name: "Saved order" });
const shownOrder = (page: Page) =>
  columnList(page)
    .getByRole("listitem")
    .evaluateAll((rows) =>
      rows.map(
        (row) => row.querySelector("label span.truncate")?.textContent ?? "",
      ),
    );
const pinnedOrder = (page: Page) =>
  page
    .getByRole("list", { name: "Pinned pages" })
    .getByRole("listitem")
    .evaluateAll((rows) =>
      rows.map((row) => row.querySelector("span.truncate")?.textContent ?? ""),
    );

async function openView(page: Page) {
  await view(page).focus();
  await page.keyboard.press("Enter");
  await expect(popover(page)).toBeVisible();
}

test("puts a picked-up column back on Escape and keeps the popover open", async ({
  page,
}) => {
  const errors = await mount(page);
  await openView(page);
  await handle(page, "Slug").focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowDown");
  expect(await shownOrder(page)).toEqual(["Layout", "Slug", "Updated At"]);
  await page.keyboard.press("Escape");

  expect(await shownOrder(page)).toEqual(["Slug", "Layout", "Updated At"]);
  await expect(popover(page)).toBeVisible();
  await expect(handle(page, "Slug")).toBeFocused();
  expect(await page.evaluate(() => window.__saved ?? [])).toEqual([]);

  // With nothing picked up, Escape closes the popover back to View.
  await page.keyboard.press("Escape");
  await expect(popover(page)).toBeHidden();
  await expect(view(page)).toBeFocused();
  expect(errors).toEqual([]);
});

test("saves a keyboard move and keeps focus on the handle", async ({
  page,
}) => {
  const errors = await mount(page);
  await openView(page);
  await handle(page, "Slug").focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Space");

  await expect(saved(page)).toHaveText("layout,slug,updatedAt");
  expect(await shownOrder(page)).toEqual(["Layout", "Slug", "Updated At"]);
  await expect(handle(page, "Slug")).toBeFocused();
  await expect(popover(page)).toBeVisible();

  // The named move buttons do the same and keep focus where it was pressed.
  const down = page.getByRole("button", { name: "Move Slug down" });
  await down.click();
  await expect(saved(page)).toHaveText("layout,updatedAt,slug");
  await expect(down).toBeFocused();
  await expect(down).toHaveAttribute("aria-disabled", "true");
  expect(await page.evaluate(() => window.__saved)).toEqual([
    ["layout", "slug", "updatedAt"],
    ["layout", "updatedAt", "slug"],
  ]);

  const results = await new AxeBuilder({ page })
    .include('[role="dialog"]')
    .analyze();
  expect(results.violations.map((violation) => violation.id)).toEqual([]);
  expect(errors).toEqual([]);
});

test("saves a pointer drag inside the popover", async ({ page }) => {
  const errors = await mount(page);
  await openView(page);
  const from = await handle(page, "Slug").boundingBox();
  const to = await columnList(page).getByRole("listitem").nth(1).boundingBox();
  expect(from && to).toBeTruthy();
  await page.mouse.move(from!.x + from!.width / 2, from!.y + from!.height / 2);
  await page.mouse.down();
  for (let step = 1; step <= 12; step += 1) {
    await page.mouse.move(
      from!.x + from!.width / 2,
      from!.y + ((to!.y + to!.height * 0.75 - from!.y) * step) / 12,
    );
  }
  await page.mouse.up();
  await expect(saved(page)).toHaveText("layout,slug,updatedAt");
  await expect(popover(page)).toBeVisible();
  expect(errors).toEqual([]);
});

test("lets an agent move a column through WebMCP (stand-in) under Web Studio's grant", async ({
  page,
}) => {
  const errors = await mount(page, { webMcp: true });
  await expect
    .poll(() =>
      page.evaluate(() =>
        [
          ...(
            window as unknown as { __tools: Map<string, Tool> }
          ).__tools.keys(),
        ].sort(),
      ),
    )
    .toEqual(["act", "query", "snapshot"]);
  const call = (name: string, input: unknown) =>
    page.evaluate(
      ([toolName, toolInput]) =>
        (window as unknown as { __tools: Map<string, Tool> }).__tools
          .get(toolName as string)!
          .execute(toolInput),
      [name, input] as const,
    );

  // The list exists only while the View popover is open.
  await openView(page);
  type Listed = {
    ref: string;
    label?: string;
    actions: string[];
    items?: { value: string; label: string }[];
  };
  const entries = (await call("snapshot", {})) as Listed[];
  const snapshot = entries.find((entry) => entry.label === "Column order");
  expect(snapshot?.items?.map((item) => item.label)).toEqual([
    "Slug",
    "Layout",
    "Updated At",
  ]);
  // A sortable list offers an agent only `move`, so the grant's label is what
  // keeps the agent to this list.
  expect(snapshot?.actions).toEqual(["move"]);
  const pinned = entries.find((entry) => entry.label === "Pinned pages");
  expect(pinned?.actions).toEqual(["move"]);

  const moved = JSON.stringify(
    await call("act", {
      steps: [{ ref: "Column order", action: "move", args: ["Updated At", 0] }],
    }),
  );
  expect(moved).toContain('"ok":true');
  await expect(saved(page)).toHaveText("updatedAt,slug,layout");
  expect(await shownOrder(page)).toEqual(["Updated At", "Slug", "Layout"]);

  // The grant names only "Column order", so `move` on another list is refused
  // by the bridge's allowlist, not by the list.
  const refused = await call("act", {
    steps: [{ ref: "Pinned pages", action: "move", args: ["Contact", 0] }],
  });
  expect(refused).toMatchObject({
    ok: false,
    error: { step: 0, message: `The app refused move on ${pinned?.ref}.` },
  });
  expect(await pinnedOrder(page)).toEqual(["Home", "About", "Contact"]);
  await expect(saved(page)).toHaveText("updatedAt,slug,layout");
  expect(errors).toEqual([]);
});
