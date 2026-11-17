import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";

import { expect, test, type Page } from "@playwright/test";

// Browser proof for Core's Shift+? help (packages/ui/components/primitives/
// shortcut-help.tsx): it lists the described shortcuts that would run where
// focus was, on the page and from inside a sheet, dialog or popover opened over
// it, closes back into that overlay, leaves a menu's or list's typing to it,
// opens from an account menu's "Keyboard shortcuts" item, and shows one list
// however many hosts are mounted.

const root = process.cwd();
const rootRequire = createRequire(path.join(root, "package.json"));
const tailwindPostcss = rootRequire("@tailwindcss/postcss");
const postcss = createRequire(rootRequire.resolve("@tailwindcss/postcss"))(
  "postcss",
);
const fixture = "tests/e2e/fixtures/ui-sdk-shortcut-help.tsx";
let temporaryDirectory: string;
let javascript: string;
let css: string;
let serverHtml: string;

test.beforeAll(async () => {
  temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "core-help-"));
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

async function mount(page: Page, { secondHost = false } = {}) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.setContent(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Shortcut help</title></head><body><div id="root">${serverHtml}</div></body></html>`,
  );
  await page.addStyleTag({ content: css });
  if (secondHost)
    await page.evaluate(() => {
      (window as unknown as { __secondHost: boolean }).__secondHost = true;
    });
  await page.addScriptTag({ content: javascript });
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  return errors;
}

const help = (page: Page) =>
  page.getByRole("dialog", { name: "Keyboard shortcuts" });
/** The descriptions the open help lists, sorted (it lists them oldest first). */
const rows = async (page: Page) =>
  (
    await help(page)
      .getByRole("listitem")
      .evaluateAll((items) =>
        items.map((item) => item.querySelector("span")?.textContent ?? ""),
      )
  ).sort();
const button = (page: Page, name: string) =>
  page.getByRole("button", { name, exact: true });
/** Two frames, so a help the key opened has rendered before a "stays closed" check. */
const settle = (page: Page) =>
  page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );

for (const width of [375, 1280]) {
  test(`lists the page's shortcuts from the page at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors = await mount(page);

    await button(page, "Page control").focus();
    await page.keyboard.press("Shift+?");
    await expect(help(page)).toBeVisible();
    expect(await rows(page)).toEqual([
      "Page action",
      "Show keyboard shortcuts",
    ]);
    await page.keyboard.press("Escape");
    await expect(help(page)).toBeHidden();
    await expect(button(page, "Page control")).toBeFocused();
    expect(errors).toEqual([]);
  });

  test(`opens over a sheet with the sheet's shortcuts and closes back into it at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors = await mount(page);

    await button(page, "Open panel").click();
    const panel = page.getByRole("dialog", { name: "Panel" });
    await expect(panel).toBeVisible();

    // Typing wins in the panel's text field: Shift+? types a question mark.
    const message = page.getByRole("textbox", { name: "Panel message" });
    await message.focus();
    await page.keyboard.press("Shift+?");
    await expect(message).toHaveValue("?");
    await expect(help(page)).toHaveCount(0);

    await button(page, "Panel action").focus();
    await page.keyboard.press("Shift+?");
    await expect(help(page)).toBeVisible();
    // What runs from the panel's action: its region key and the help itself,
    // not the page's key, which the open sheet pauses.
    expect(await rows(page)).toEqual([
      "Send from panel",
      "Show keyboard shortcuts",
    ]);

    // Escape closes only the help, and focus goes back into the sheet.
    await page.keyboard.press("Escape");
    await expect(help(page)).toBeHidden();
    await expect(panel).toBeVisible();
    await expect(button(page, "Panel action")).toBeFocused();
    await page.keyboard.press("Control+Enter");
    expect(await page.evaluate(() => window.__runs ?? [])).toEqual(["panel"]);

    // Shift+? toggles: it opens again and closes from inside the help.
    await page.keyboard.press("Shift+?");
    await expect(help(page)).toBeVisible();
    await page.keyboard.press("Shift+?");
    await expect(help(page)).toBeHidden();
    await expect(button(page, "Panel action")).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(button(page, "Open panel")).toBeFocused();
    expect(errors).toEqual([]);
  });

  test(`opens over a dialog with the dialog's always-on keys at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors = await mount(page);

    await button(page, "Edit template").click();
    const dialog = page.getByRole("dialog", { name: "Edit template" });
    await expect(dialog).toBeVisible();
    await button(page, "Template action").focus();
    await page.keyboard.press("Shift+?");
    await expect(help(page)).toBeVisible();
    expect(await rows(page)).toEqual([
      "Save template",
      "Show keyboard shortcuts",
    ]);
    await page.keyboard.press("Escape");
    await expect(help(page)).toBeHidden();
    await expect(dialog).toBeVisible();
    await expect(button(page, "Template action")).toBeFocused();
    expect(errors).toEqual([]);
  });

  for (const reducedMotion of ["reduce", "no-preference"] as const) {
    test(`opens over a popover with the popover's keys and closes back into it at ${width}px (motion: ${reducedMotion})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.emulateMedia({ reducedMotion });
      const errors = await mount(page);

      await button(page, "Filters").click();
      // Found by slot: the modal help hides it from the accessibility tree.
      const popover = page.locator('[data-slot="popover-content"]');
      await expect(popover).toBeVisible();
      await button(page, "Clear filters").focus();
      await page.keyboard.press("Shift+?");
      await expect(help(page)).toBeVisible();
      // The popover's region key and the help, not the page's paused key.
      expect(await rows(page)).toEqual([
        "Apply filters",
        "Show keyboard shortcuts",
      ]);
      // The non-modal popover stays open while the help holds focus.
      await settle(page);
      await expect(popover).toHaveAttribute("data-open", "");
      await expect(popover).toBeVisible();

      // Escape closes only the help, and focus goes back into the popover.
      await page.keyboard.press("Escape");
      await expect(help(page)).toBeHidden();
      await expect(button(page, "Clear filters")).toBeFocused();
      await expect(popover).toHaveAttribute("data-open", "");
      await expect(popover).toBeVisible();
      await page.keyboard.press("Control+Enter");
      expect(await page.evaluate(() => window.__runs ?? [])).toEqual([
        "filters",
      ]);

      await page.keyboard.press("Escape");
      await expect(popover).toBeHidden();
      await expect(button(page, "Filters")).toBeFocused();
      expect(errors).toEqual([]);
    });
  }
}

// Base UI's menu typeahead stops Shift+? before the help's listener sees it,
// so this checks what the reader gets, not the help's menu and list check.
// The list case below proves that check.
test("leaves Shift+? to an open menu's own typing", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors = await mount(page);
  await button(page, "Account").focus();
  await page.keyboard.press("Enter");
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Profile" })).toBeFocused();
  await page.keyboard.press("Shift+?");
  await settle(page);
  await expect(help(page)).toHaveCount(0);
  await expect(menu).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(button(page, "Account")).toBeFocused();
  expect(errors).toEqual([]);
});

// No Base UI typeahead takes the key from this list, so only the help's own
// menu and list check keeps it closed.
test("leaves Shift+? to a list's own typing outside Base UI", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors = await mount(page);
  const option = page.getByRole("option", { name: "All gifts" });
  await option.focus();
  await page.keyboard.press("Shift+?");
  await settle(page);
  await expect(help(page)).toHaveCount(0);
  await expect(option).toBeFocused();

  // The same key from a page control still opens the help.
  await button(page, "Page control").focus();
  await page.keyboard.press("Shift+?");
  await expect(help(page)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(help(page)).toBeHidden();
  expect(errors).toEqual([]);
});

for (const reducedMotion of ["reduce", "no-preference"] as const) {
  test(`opens from the account menu's Keyboard shortcuts item with the trigger's list (motion: ${reducedMotion})`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion });
    const errors = await mount(page);

    // The list Shift+? shows from the menu's trigger.
    await button(page, "Account").focus();
    await page.keyboard.press("Shift+?");
    await expect(help(page)).toBeVisible();
    const fromTrigger = await rows(page);
    await page.keyboard.press("Escape");
    await expect(button(page, "Account")).toBeFocused();

    // By pointer.
    await button(page, "Account").click();
    const item = page.getByRole("menuitem", { name: /Keyboard shortcuts/ });
    await expect(item).toHaveAttribute("aria-keyshortcuts", "Shift+?");
    await item.click();
    await expect(page.getByRole("menu")).toHaveCount(0);
    await expect(help(page)).toBeVisible();
    expect(await rows(page)).toEqual(fromTrigger);
    await page.keyboard.press("Escape");
    await expect(help(page)).toBeHidden();
    await expect(button(page, "Account")).toBeFocused();

    // By keyboard.
    await page.keyboard.press("Enter");
    await expect(page.getByRole("menu")).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await expect(item).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(help(page)).toBeVisible();
    expect(await rows(page)).toEqual(fromTrigger);
    await page.keyboard.press("Escape");
    await expect(button(page, "Account")).toBeFocused();
    expect(errors).toEqual([]);
  });
}

test("shows one list when a page mounts a second help host", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors = await mount(page, { secondHost: true });
  await button(page, "Page control").focus();
  await page.keyboard.press("Shift+?");
  await expect(help(page)).toHaveCount(1);
  expect(await rows(page)).toEqual(["Page action", "Show keyboard shortcuts"]);
  await page.keyboard.press("Escape");
  await expect(help(page)).toHaveCount(0);
  await expect(button(page, "Page control")).toBeFocused();
  expect(errors).toEqual([]);
});
