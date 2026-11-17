import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";

import { expect, test, type Page } from "@playwright/test";

// UI SDK's testing kit checks any rendered widget against its WAI-ARIA
// pattern: roles, names, states, one tab stop, and the pattern's keys driven
// through the real focus model. This spec holds Core's retained Base UI
// wrappers, the cmdk command list and the one UI SDK control to it in a real
// browser, because jsdom has no layout and cannot tell a hidden form input
// from a visible one.

const root = process.cwd();
const rootRequire = createRequire(path.join(root, "package.json"));
const tailwindPostcss = rootRequire("@tailwindcss/postcss");
const postcss = createRequire(rootRequire.resolve("@tailwindcss/postcss"))(
  "postcss",
);
const fixture = "tests/e2e/fixtures/ui-sdk-pattern-conformance.tsx";
let temporaryDirectory: string;
let javascript: string;
let css: string;

test.beforeAll(async () => {
  temporaryDirectory = await mkdtemp(
    path.join(os.tmpdir(), "core-ui-sdk-patterns-"),
  );
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

async function mount(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setContent(
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>UI SDK pattern conformance</title></head><body><div id="root"></div></body></html>',
  );
  await page.addStyleTag({ content: css });
  await page.addScriptTag({ content: javascript });
  await page.locator('main[data-ready="true"]').waitFor();
  return errors;
}

// A widget id, "body", or a selector for a popup that has no trigger in its
// section.
const check = (page: Page, widget: string, pattern: string) =>
  page.evaluate(
    ([selector, name]) => window.__checkPattern!(selector!, name!),
    [
      widget === "body" || widget.startsWith("[")
        ? widget
        : `[data-widget="${widget}"]`,
      pattern,
    ],
  );

const widget = (page: Page, id: string) =>
  page.locator(`[data-widget="${id}"]`);

// Widgets that are on the page as rendered. Each meets the check outright.
const inPlace = [
  ["tabs", "tabs"],
  ["checkbox", "checkbox"],
  ["switch", "switch"],
  ["slider", "slider"],
  ["accordion", "accordion"],
  ["disclosure", "disclosure"],
  ["menubar", "menubar"],
  ["toolbar", "toolbar"],
  ["selection-bar", "toolbar"],
] as const;

for (const [id, pattern] of inPlace) {
  test(`${id} follows the ${pattern} pattern`, async ({ page }) => {
    const errors = await mount(page);
    expect(await check(page, id, pattern)).toEqual([]);
    expect(errors).toEqual([]);
  });
}

// Settings sections run down the side on a desktop, so Up and Down move
// between them, and across the top on a phone.
test("settings tabs are vertical on a desktop and follow the tabs pattern at both widths", async ({
  page,
}) => {
  const errors = await mount(page);
  const list = widget(page, "vertical-tabs").getByRole("tablist", {
    name: "Settings sections",
  });
  await expect(list).toHaveAttribute("aria-orientation", "vertical");
  expect(await check(page, "vertical-tabs", "tabs")).toEqual([]);
  await list.getByRole("tab", { name: "Profile" }).focus();
  await page.keyboard.press("ArrowDown");
  await expect(list.getByRole("tab", { name: "Email" })).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(list.getByRole("tab", { name: "Profile" })).toBeFocused();

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(list).not.toHaveAttribute("aria-orientation", "vertical");
  expect(await check(page, "vertical-tabs", "tabs")).toEqual([]);
  expect(errors).toEqual([]);
});

// `checkPattern` asks for a popup to be open before it is checked. Base UI
// portals popups to the body, so an open one is checked from there.
test("an open dropdown menu follows the menu pattern", async ({ page }) => {
  const errors = await mount(page);
  await widget(page, "menu").getByRole("button").click();
  await page.getByRole("menu").waitFor();
  expect(await check(page, "menu", "menu")).toEqual([]);
  // The check activates an item, as its documentation says.
  expect(await page.evaluate(() => window.__menuActions)).not.toEqual([]);
  expect(errors).toEqual([]);
});

// Base UI's filterable menu keeps focus in its search box, so typing always
// filters, and the arrow keys move the active item through
// `aria-activedescendant`, the editable-combobox focus model. Its popup is a
// dialog holding the search box and the menu, so the trigger announces a
// dialog. The menu check reads the search box, which controls the menu, as the
// menu button. A pointer open highlights no item, so the search box has no
// `aria-activedescendant` and the check stops at "focus is not in the menu"
// before it presses a key: those three problems are asserted exactly, and the
// keys are proven directly first.
test("an open filterable menu filters as you type while the arrow keys reach its items", async ({
  page,
}) => {
  const errors = await mount(page);
  const trigger = widget(page, "filter-menu").getByRole("button", {
    name: "Merge tag",
  });
  await trigger.click();
  const menu = page.getByRole("menu");
  const search = page.getByRole("searchbox", { name: "Search merge tags" });
  await expect(search).toBeFocused();
  await search.fill("zzz");
  await expect(menu.getByRole("menuitem")).toHaveCount(0);
  await expect(page.getByText("No matching tags")).toBeVisible();
  await search.fill("name");
  await expect(menu.getByRole("menuitem")).toHaveText([
    "First name",
    "Last name",
  ]);
  for (const name of ["First name", "Last name"]) {
    await page.keyboard.press("ArrowDown");
    const item = menu.getByRole("menuitem", { name });
    await expect(item).toHaveAttribute("data-highlighted");
    await expect(search).toHaveAttribute(
      "aria-activedescendant",
      (await item.getAttribute("id"))!,
    );
    await expect(search).toBeFocused();
  }
  await page.keyboard.press("Enter");
  expect(await page.evaluate(() => window.__menuActions)).toEqual([
    "Last name",
  ]);
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();

  await trigger.click();
  await expect(search).toBeFocused();
  expect(await check(page, '[role="menu"]', "menu")).toEqual([
    'input[role=searchbox]: opens a menu, so it has aria-haspopup="menu" or "true" (APG menu button).',
    'input[role=searchbox]: has aria-expanded="true" while its menu is open (APG menu button).',
    "div[role=menu]: is open, but focus is on input[role=searchbox]; opening a menu moves focus into it (APG menu button).",
  ]);
  expect(errors).toEqual([]);
});

test("an open select is a named listbox", async ({ page }) => {
  const errors = await mount(page);
  await widget(page, "select").getByRole("combobox", { name: "Year" }).click();
  await expect(page.getByRole("listbox", { name: "Year" })).toBeVisible();
  expect(await check(page, "body", "listbox")).toEqual([]);
  expect(errors).toEqual([]);
});

// A form select is named by its field label, open and closed, never by the
// value it shows.
test("an open form select is a listbox named by its field label", async ({
  page,
}) => {
  const errors = await mount(page);
  const trigger = widget(page, "form-select").getByRole("combobox", {
    name: "Giving frequency",
    exact: true,
  });
  await expect(trigger).toContainText("Monthly");
  await trigger.click();
  await expect(
    page.getByRole("listbox", { name: "Giving frequency", exact: true }),
  ).toBeVisible();
  expect(await check(page, "body", "listbox")).toEqual([]);
  expect(errors).toEqual([]);
});

test("an open searchable select follows the combobox pattern", async ({
  page,
}) => {
  const errors = await mount(page);
  await widget(page, "searchable-select")
    .getByRole("combobox", { name: "Missionary" })
    .click();
  await page.getByRole("listbox").waitFor();
  expect(await check(page, "body", "combobox")).toEqual([]);
  expect(errors).toEqual([]);
});

// A check from the body takes the first combobox on the page, so the bare
// Combobox wrapper is checked from its own section, through its trigger. The
// check never reaches the search box in the portaled popup, so its arrow keys
// are proven here: they move `aria-activedescendant` while focus stays put.
test("an open combobox follows the combobox pattern and shows its empty state", async ({
  page,
}) => {
  const errors = await mount(page);
  await widget(page, "combobox")
    .getByRole("combobox", { name: "Partner", exact: true })
    .click();
  const search = page.getByRole("combobox", { name: "Search partners" });
  await expect(search).toBeFocused();
  for (const name of ["Amara Okafor", "Lucas Silva"]) {
    await page.keyboard.press("ArrowDown");
    await expect(search).toHaveAttribute(
      "aria-activedescendant",
      (await page.getByRole("option", { name }).getAttribute("id"))!,
    );
    await expect(search).toBeFocused();
  }
  await search.fill("zzz");
  await expect(page.getByRole("option")).toHaveCount(0);
  await expect(page.getByText("No partners found.")).toBeVisible();
  await search.fill("");
  await expect(page.getByRole("option")).toHaveCount(3);
  expect(await check(page, "combobox", "combobox")).toEqual([]);
  expect(errors).toEqual([]);
});

// Base UI opens a multiple Combobox on its selected option, and its arrow keys
// loop through the search box: past the last option no option is active, and
// the next ArrowDown starts again at the first (APG lets the down arrow return
// visual focus to the combobox there). Focus stays in the search box while the
// keys move `aria-activedescendant`, and moving never changes the selection.
test("an open multiple combobox follows the combobox pattern and keeps its selection", async ({
  page,
}) => {
  const errors = await mount(page);
  await widget(page, "combobox-multiple")
    .getByRole("combobox", { name: "Labels, 1 selected" })
    .click();
  const listbox = page.getByRole("listbox");
  const option = (name: string) =>
    listbox.getByRole("option", { name, exact: true });
  const selection = async () => {
    await expect(option("Urgent")).toHaveAttribute("aria-selected", "true");
    await expect(option("Billing")).toHaveAttribute("aria-selected", "false");
    await expect(option("Prayer request")).toHaveAttribute(
      "aria-selected",
      "false",
    );
  };
  await expect(listbox).toHaveAttribute("aria-multiselectable", "true");
  await selection();
  const search = page.getByRole("combobox", { name: "Search labels" });
  await expect(search).toBeFocused();
  for (const [key, name] of [
    [null, "Urgent"],
    ["ArrowDown", null],
    ["ArrowDown", "Billing"],
    ["ArrowDown", "Prayer request"],
    ["ArrowDown", "Urgent"],
    ["ArrowUp", "Prayer request"],
    ["ArrowUp", "Billing"],
  ] as const) {
    if (key) await page.keyboard.press(key);
    if (name) {
      await expect(search).toHaveAttribute(
        "aria-activedescendant",
        (await option(name).getAttribute("id"))!,
      );
      await expect(option(name)).toHaveAttribute("data-highlighted");
    } else {
      await expect(search).not.toHaveAttribute("aria-activedescendant", /.+/);
      await expect(listbox.locator("[data-highlighted]")).toHaveCount(0);
    }
    await expect(search).toBeFocused();
  }
  await selection();
  await search.fill("zzz");
  await expect(page.getByText("No labels.")).toBeVisible();
  await search.fill("");
  expect(await check(page, "combobox-multiple", "combobox")).toEqual([]);
  expect(errors).toEqual([]);
});

// cmdk's listbox never closes: it lives inside a modal dialog, so Escape
// closes the dialog and returns focus to its opener, as the dialog pattern
// asks, instead of closing a popup and keeping focus in the input. Those are
// the two problems the combobox check lists, asserted exactly, with the dialog
// behavior proven after them. The check does not drive Home and End, so they
// are pressed here.
test("an open command dialog follows the combobox pattern, except that Escape closes the dialog", async ({
  page,
}) => {
  const errors = await mount(page);
  const opener = widget(page, "command").getByRole("button", {
    name: "Search pages",
  });
  await opener.click();
  const search = page.getByRole("combobox", { name: "Search pages" });
  await expect(search).toBeFocused();
  expect(await check(page, '[data-slot="dialog-content"]', "combobox")).toEqual(
    [
      "input[role=combobox]: Escape should close its popup (APG combobox).",
      'input[role=combobox]: focus stays here when Escape closes the popup, but went to button "Search pages" (APG combobox).',
    ],
  );
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(opener).toBeFocused();

  await opener.click();
  await expect(search).toBeFocused();
  const option = (name: string) => page.getByRole("option", { name });
  await expect(option("Home")).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("End");
  await expect(option("Tasks")).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Home");
  await expect(option("Home")).toHaveAttribute("aria-selected", "true");
  await search.fill("part");
  await expect(page.getByRole("option")).toHaveText(["Partners"]);
  await search.fill("zzz");
  await expect(page.getByRole("option")).toHaveCount(0);
  await expect(page.getByText("No matching pages.")).toBeVisible();
  expect(errors).toEqual([]);
});

// UI SDK holds a modal dialog to `aria-modal="true"`, which it documents as
// stricter than the pattern. Base UI makes the page behind inert instead,
// because `aria-modal` also hides popups a dialog opens outside itself, and
// Core's dialogs open selects, comboboxes and calendars that way. That one
// difference is asserted exactly, and the inert page is proven directly.
for (const [id, role, trigger, apgName] of [
  ["dialog", "dialog", "Edit note", "dialog (modal)"],
  ["alertdialog", "alertdialog", "Delete task", "alert dialog"],
  ["sheet", "dialog", "Open task", "dialog (modal)"],
] as const) {
  test(`an open ${id} differs from the ${role} pattern only by aria-modal, and makes the page inert`, async ({
    page,
  }) => {
    const errors = await mount(page);
    const opener = widget(page, id).getByRole("button", { name: trigger });
    await opener.click();
    const popup = page.getByRole(role);
    await popup.waitFor();
    expect(await check(page, id, role)).toEqual([
      `div[role=${role}]: is modal but has no aria-modal="true", which tells screen readers the page behind it is inert (APG ${apgName}).`,
    ]);

    await expect(popup).toBeVisible();
    // Everything outside the popup is hidden from assistive technology.
    expect(
      await page.evaluate(
        (popupRole) =>
          Boolean(
            document
              .querySelector('[data-widget="tabs"]')!
              .closest('[aria-hidden="true"]'),
          ) &&
          !document
            .querySelector(`[role="${popupRole}"]`)!
            .closest('[aria-hidden="true"]'),
        role,
      ),
    ).toBe(true);
    // Tab stays inside it.
    for (let step = 0; step < 6; step += 1) {
      await page.keyboard.press("Tab");
      await expect
        .poll(() =>
          page.evaluate(
            (popupRole) =>
              Boolean(document.activeElement?.closest(`[role="${popupRole}"]`)),
            role,
          ),
        )
        .toBe(true);
    }
    // Escape closes it and returns focus to what opened it.
    await page.keyboard.press("Escape");
    await expect(popup).toBeHidden();
    await expect(opener).toBeFocused();
    expect(errors).toEqual([]);
  });
}

// A popover is a non-modal dialog: no aria-modal, and the page behind it
// stays reachable. The check can close it, so it runs last.
test("an open popover is a named non-modal dialog that Escape closes back to its trigger", async ({
  page,
}) => {
  const errors = await mount(page);
  const opener = widget(page, "popover").getByRole("button", {
    name: "Personnel details",
  });
  await opener.click();
  const popup = page.getByRole("dialog", { name: "Amara Okafor" });
  await expect(popup).toBeVisible();
  await expect(popup).not.toHaveAttribute("aria-modal");
  expect(
    await page.evaluate(() =>
      Boolean(
        document
          .querySelector('[data-widget="tabs"]')!
          .closest('[aria-hidden="true"], [inert]'),
      ),
    ),
  ).toBe(false);
  await page.keyboard.press("Escape");
  await expect(popup).toBeHidden();
  await expect(opener).toBeFocused();

  await opener.click();
  await expect(popup).toBeVisible();
  expect(await check(page, "popover", "dialog")).toEqual([]);
  expect(errors).toEqual([]);
});

// A custom radio submits through a native input that is `aria-hidden` and
// out of the tab order. `checkPattern` counts that input as a second radio,
// for Base UI's radio group and for UI SDK's own Rating alike, so it cannot
// judge either. The radio pattern is checked with real keys instead.
test("the radio check cannot judge a radio that submits through a hidden input", async ({
  page,
}) => {
  await mount(page);
  for (const id of ["radio-group", "rating"]) {
    const problems = await check(page, id, "radio-group");
    expect(problems.length, id).toBeGreaterThan(0);
    for (const problem of problems) {
      expect(problem, id).toMatch(/checked radios|radio, input/);
    }
  }
});

test("a radio group has one tab stop and moves, checks and wraps with the arrow keys", async ({
  page,
}) => {
  const errors = await mount(page);
  const group = page.getByRole("radiogroup", { name: "Receipt delivery" });
  const radio = (name: string) =>
    group.getByRole("radio", { name, exact: true });
  const checked = () =>
    group.locator('[role="radio"][aria-checked="true"]').count();

  expect(await group.locator('[role="radio"][tabindex="0"]').count()).toBe(1);
  await radio("Email").focus();
  for (const [key, name] of [
    ["ArrowDown", "Mail"],
    ["ArrowRight", "None"],
    ["ArrowDown", "Email"],
    ["ArrowUp", "None"],
    ["ArrowLeft", "Mail"],
  ] as const) {
    await page.keyboard.press(key);
    await expect(radio(name)).toBeFocused();
    await expect(radio(name)).toHaveAttribute("aria-checked", "true");
    expect(await checked()).toBe(1);
    expect(await group.locator('[role="radio"][tabindex="0"]').count()).toBe(1);
  }
  // One Tab leaves the group: it never walks the other radios.
  await page.keyboard.press("Tab");
  expect(
    await page.evaluate(() =>
      document.activeElement
        ?.closest('[role="radiogroup"]')
        ?.getAttribute("aria-label"),
    ),
  ).not.toBe("Receipt delivery");
  expect(errors).toEqual([]);
});
