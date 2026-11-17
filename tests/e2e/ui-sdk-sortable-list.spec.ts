import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";

import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Browser proof for Core's UI SDK sortable list
// (packages/ui/components/primitives/sortable-list.tsx) and agent bridge
// (agent-bridge.tsx): server HTML hydrates, the handle reorders with the
// keyboard and a real pointer drag, screen readers hear each step, touch
// targets fit, and the bridge moves a row through WebMCP. Chromium has no
// `document.modelContext`, so WebMCP runs against a stand-in that records the
// tools: that proves Core's wiring, not a browser agent.

const root = process.cwd();
const rootRequire = createRequire(path.join(root, "package.json"));
const tailwindPostcss = rootRequire("@tailwindcss/postcss");
const postcss = createRequire(rootRequire.resolve("@tailwindcss/postcss"))(
  "postcss",
);
const fixture = "tests/e2e/fixtures/ui-sdk-sortable-list.tsx";
let temporaryDirectory: string;
let javascript: string;
let css: string;
let serverHtml: string;

test.beforeAll(async () => {
  temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "core-sortable-"));
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

/** Records what UI SDK registers, before any page script runs. */
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
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.setContent(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>UI SDK sortable list</title></head><body><div id="root">${serverHtml}</div></body></html>`,
  );
  await page.addStyleTag({ content: css });
  if (webMcp) await page.evaluate(webMcpStandIn);
  await page.addScriptTag({ content: javascript });
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  return errors;
}

const list = (page: Page) => page.getByRole("list", { name: "Macro actions" });
const handle = (page: Page, name: string) =>
  page.getByRole("button", { name: `Move ${name}`, exact: true });
const saved = (page: Page) => page.getByRole("status", { name: "Saved order" });
const rowText = (page: Page) =>
  list(page)
    .getByRole("listitem")
    .evaluateAll((rows) =>
      rows.map((row) => row.querySelector("[data-step]")?.textContent),
    );
const announced = (page: Page) =>
  page.evaluate(
    () => document.querySelector('[aria-live="assertive"]')?.textContent ?? "",
  );

for (const width of [375, 1280]) {
  test(`reorders from the handle with the keyboard and announces each step at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors = await mount(page);

    await expect(list(page)).toHaveAttribute(
      "aria-roledescription",
      "sortable list",
    );
    expect(await rowText(page)).toEqual([
      "Assign to agent",
      "Add label",
      "Add private note",
      "Change status",
    ]);
    // Each handle describes how to use it.
    await expect(handle(page, "Add private note")).toHaveAccessibleDescription(
      /Press Space or Enter to pick up this row/,
    );

    await page.getByRole("button", { name: "Before list" }).focus();
    await page.keyboard.press("Tab");
    await expect(handle(page, "Assign to agent")).toBeFocused();

    await handle(page, "Add private note").focus();
    await page.keyboard.press("Space");
    await expect(handle(page, "Add private note")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect
      .poll(() => announced(page))
      .toMatch(/Picked up .*Add private note/);
    await page.keyboard.press("ArrowUp");
    await expect.poll(() => announced(page)).toMatch(/position 2 of 4/);
    await page.keyboard.press("Home");
    await expect.poll(() => announced(page)).toMatch(/position 1 of 4/);
    // Nothing is saved while the row is still picked up.
    await expect(saved(page)).toHaveText("assign,label,note,status");
    await page.keyboard.press("Space");
    await expect(saved(page)).toHaveText("note,assign,label,status");
    await expect
      .poll(() => announced(page))
      .toMatch(/Dropped .*position 1 of 4/);
    // Focus stays on the moved row's handle.
    await expect(handle(page, "Add private note")).toBeFocused();
    await expect(handle(page, "Add private note")).toHaveAttribute(
      "aria-pressed",
      "false",
    );

    // Escape puts a picked-up row back and saves nothing.
    await page.keyboard.press("Space");
    await page.keyboard.press("End");
    await page.keyboard.press("Escape");
    await expect(saved(page)).toHaveText("note,assign,label,status");
    expect(await rowText(page)).toEqual([
      "Add private note",
      "Assign to agent",
      "Add label",
      "Change status",
    ]);

    expect(
      await page.evaluate(() => window.__changes?.map((c) => c.reason)),
    ).toEqual(["move-key"]);
    expect(await page.evaluate(() => window.__recoverableErrors ?? [])).toEqual(
      [],
    );
    const axe = await new AxeBuilder({ page })
      .include("main")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(axe.violations).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test("reorders by dragging a row's handle with the pointer", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const errors = await mount(page);
  const from = await handle(page, "Assign to agent").boundingBox();
  const to = await list(page).getByRole("listitem").nth(2).boundingBox();
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
  await expect(saved(page)).toHaveText("label,note,assign,status");
  expect(
    await page.evaluate(() => window.__changes?.map((c) => c.reason)),
  ).toEqual(["drag"]);
  expect(errors).toEqual([]);
});

test("keeps each handle a 44px touch target on coarse pointers", async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 375, height: 800 },
  });
  const page = await context.newPage();
  try {
    await mount(page);
    expect(
      await page.evaluate(() => matchMedia("(pointer: coarse)").matches),
    ).toBe(true);
    const sizes = await list(page)
      .getByRole("button", { name: /^Move / })
      .evaluateAll((handles) =>
        handles.map((element) => {
          const box = element.getBoundingClientRect();
          return [box.width, box.height];
        }),
      );
    expect(sizes).toHaveLength(4);
    for (const [boxWidth, boxHeight] of sizes) {
      expect(boxWidth).toBeGreaterThanOrEqual(44);
      expect(boxHeight).toBeGreaterThanOrEqual(44);
    }
  } finally {
    await context.close();
  }
});

async function mountWithTools(page: Page) {
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
  return { errors, call };
}

test("lets an agent read and reorder the list through WebMCP (stand-in), within the allowlist", async ({
  page,
}) => {
  const { errors, call } = await mountWithTools(page);

  const snapshot = JSON.stringify(await call("snapshot", {}));
  expect(snapshot).toContain('"component":"sortable-list"');
  expect(snapshot).toContain('"label":"Macro actions"');
  expect(snapshot).toContain('"move"');
  // A Base UI or native control is not in the bridge: only UI SDK parts are.
  expect(snapshot).not.toContain("Before list");

  const moved = JSON.stringify(
    await call("act", {
      steps: [{ ref: "Macro actions", action: "move", args: ["status", 0] }],
    }),
  );
  expect(moved).toContain('"ok":true');
  await expect(saved(page)).toHaveText("status,assign,label,note");
  expect(await page.evaluate(() => window.__changes?.at(-1))).toEqual({
    order: ["status", "assign", "label", "note"],
    reason: "imperative",
    source: "agent",
  });

  // An action the allowlist does not name is refused and changes nothing.
  const refused = JSON.stringify(
    await call("act", {
      steps: [{ ref: "Macro actions", action: "setValue", args: [[]] }],
    }),
  );
  expect(refused).toContain('"ok":false');
  await expect(saved(page)).toHaveText("status,assign,label,note");
  expect(errors).toEqual([]);
});

test("names each row for an agent by its label, not by the text it shows run together", async ({
  page,
}) => {
  const { errors, call } = await mountWithTools(page);
  const labels = [
    { value: "assign", label: "Action 1: Assign to agent Support" },
    { value: "label", label: "Action 2: Add label Urgent" },
    { value: "note", label: "Action 3: Add private note Callback" },
    { value: "status", label: "Action 4: Change status Open" },
  ];
  type Listed = { label?: string; items?: { value: string; label: string }[] };
  const macroList = (entries: unknown) =>
    (entries as Listed[]).find((entry) => entry.label === "Macro actions");

  // Each row shows its type, detail and Up button as separate text.
  await expect(list(page).getByRole("listitem").nth(1)).toContainText(
    "Add labelUrgentUp",
  );
  const snapshot = macroList(await call("snapshot", {}));
  expect(snapshot?.items).toEqual(labels);
  expect(macroList(await call("query", { text: "Urgent" }))?.items).toEqual([
    labels[1],
  ]);
  expect(
    macroList(await call("query", { within: "Macro actions" }))?.items,
  ).toEqual(labels);

  // A name read from the snapshot is one `move` takes.
  const moved = JSON.stringify(
    await call("act", {
      steps: [
        {
          ref: "Macro actions",
          action: "move",
          args: [snapshot!.items![3].label, 0],
        },
      ],
    }),
  );
  expect(moved).toContain('"ok":true');
  await expect(saved(page)).toHaveText("status,assign,label,note");

  // The rows' text run together names no row, and the refusal lists the names.
  const refused = (await call("act", {
    steps: [
      { ref: "Macro actions", action: "move", args: ["Add labelUrgent", 0] },
    ],
  })) as { ok: boolean; error?: { message: string } };
  expect(refused.ok).toBe(false);
  expect(refused.error?.message).toBe(
    'No row "Add labelUrgent". Rows: "Action 1: Change status Open", "Action 2: Assign to agent Support", "Action 3: Add label Urgent", "Action 4: Add private note Callback".',
  );
  await expect(saved(page)).toHaveText("status,assign,label,note");
  expect(errors).toEqual([]);
});
