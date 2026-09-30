import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
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

async function settle(locator: Locator) {
  await locator.evaluate(async (element) => {
    while (true) {
      const animations = element
        .getAnimations({ subtree: true })
        .filter(
          (animation) => animation.playState === "running" || animation.pending,
        );
      if (!animations.length) return;
      await Promise.allSettled(
        animations.map((animation) => animation.finished),
      );
    }
  });
}

async function expectInsideSheet(locator: Locator, sheet: Locator) {
  const bounds = await locator.boundingBox();
  const container = await sheet.boundingBox();
  expect(bounds).not.toBeNull();
  expect(container).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(container!.x);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(
    container!.x + container!.width,
  );
  expect(bounds!.y).toBeGreaterThanOrEqual(container!.y);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(
    container!.y + container!.height,
  );
}

test.beforeAll(async () => {
  temporaryDirectory = await mkdtemp(
    path.join(os.tmpdir(), "core-teams-surface-"),
  );
  const buildScript = path.join(temporaryDirectory, "build.ts");
  const sections = path.join(
    root,
    "apps/admin/app/(app)/admin/teams/teams-sections.tsx",
  );
  const hooks = `import {TEAMS,MEMBERS} from ${JSON.stringify(sections)}; export function useTeams(){return{data:TEAMS,isLoading:false}} export function useTeamMembers(){return{data:MEMBERS,isLoading:false}}`;
  await writeFile(
    buildScript,
    `const result=await Bun.build({
    entrypoints:[${JSON.stringify(path.join(root, "tests/e2e/fixtures/teams-surface.tsx"))}],
    outdir:${JSON.stringify(temporaryDirectory)},target:"browser",format:"iife",
    define:{"process.env.NODE_ENV":'"production"'},
    plugins:[{name:"local-teams-boundaries",setup(build){
      build.onResolve({filter:/^@asym\\/database\\/hooks$/},()=>({path:"queries",namespace:"local-teams"}));
      build.onResolve({filter:/^@asym\\/env$/},()=>({path:"flags",namespace:"local-teams"}));
      build.onResolve({filter:/^next\\/image$/},()=>({path:"image",namespace:"local-teams"}));
      build.onLoad({filter:/.*/,namespace:"local-teams"},({path})=>({loader:"tsx",contents:path==="queries"?${JSON.stringify(hooks)}:path==="flags"?"export const clientEnv={NEXT_PUBLIC_VIEW_TRANSITIONS_ENABLED:false};":"import React from 'react';export default function Image({fill,priority,unoptimized,...props}){return React.createElement('img',props)}"}));
    }}]
  });if(!result.success)throw new Error(result.logs.join("\\n"));`,
  );
  execFileSync("bun", ["--no-env-file", buildScript], {
    cwd: root,
    stdio: "pipe",
    timeout: 30_000,
  });
  javascript = await readFile(
    path.join(temporaryDirectory, "teams-surface.js"),
    "utf8",
  );
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
    for (const reducedMotion of ["reduce", "no-preference"] as const) {
      test(`Teams management remains mounted, named and dismissible at ${width}px in ${theme}, motion ${reducedMotion}`, async ({
        page,
      }) => {
        const errors: string[] = [],
          requests: string[] = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.route("**/*", (route) => {
          requests.push(route.request().url());
          return route.abort();
        });
        await page.setViewportSize({ width, height: 800 });
        await page.emulateMedia({ colorScheme: theme, reducedMotion });
        await page.setContent(
          `<!doctype html><html lang="en" class="${theme === "dark" ? "dark" : ""}"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Teams management</title></head><body><div id="root"></div></body></html>`,
        );
        await page.addStyleTag({ content: css });
        await page.addScriptTag({ content: javascript });
        await expect(
          page.getByRole("heading", { name: "Manage Teams", exact: true }),
        ).toBeVisible();
        await expect(
          page.getByRole("columnheader", { name: "Team actions", exact: true }),
        ).toHaveCount(1);
        const manage = page
          .getByRole("button", { name: "Manage", exact: true })
          .first();
        await manage.focus();
        await page.keyboard.press("Enter");
        const sheet = page.getByRole("dialog", {
          name: "Executive Leadership",
          exact: true,
        });
        await expect(sheet).toBeVisible();
        await settle(sheet);
        await expect(
          sheet.getByRole("combobox", {
            name: "People & Churches CRM access level",
            exact: true,
          }),
        ).toContainText("Admin");
        const members = sheet.getByRole("tab", {
          name: "Members (5)",
          exact: true,
        });
        await members.focus();
        await page.keyboard.press("Enter");
        await expect(
          sheet.getByText("alex@example.com", { exact: true }),
        ).toBeVisible();
        await expect(
          sheet.getByText("sarah@example.com", { exact: true }),
        ).toHaveCount(0);
        const settings = sheet.getByRole("tab", {
          name: "Settings",
          exact: true,
        });
        await settings.focus();
        await page.keyboard.press("Enter");
        await settle(sheet);
        await expectInsideSheet(settings, sheet);
        await sheet
          .getByRole("button", { name: "Permanently Delete Team", exact: true })
          .focus();
        await expectInsideSheet(settings, sheet);
        await expectInsideSheet(
          sheet.getByRole("heading", {
            name: "Executive Leadership",
            exact: true,
          }),
          sheet,
        );
        await expect(
          sheet.getByRole("textbox", {
            name: "Team Branding Name",
            exact: true,
          }),
        ).toHaveValue("Executive Leadership");
        await sheet
          .getByRole("textbox", { name: "Team Branding Name", exact: true })
          .fill("Unsaved local draft");
        await sheet
          .getByRole("button", { name: "Save Changes", exact: true })
          .click();
        await expect(page.locator("[data-slot=sheet-content]")).toHaveCount(0);
        await expect(page.locator("[data-slot=sheet-overlay]")).toHaveCount(0);
        await expect(manage).toBeFocused();
        await manage.click();
        await expect(sheet).toBeVisible();
        await sheet.getByRole("tab", { name: "Settings", exact: true }).click();
        await expect(
          sheet.getByRole("textbox", {
            name: "Team Branding Name",
            exact: true,
          }),
        ).toHaveValue("Executive Leadership");
        await sheet
          .getByRole("button", { name: "Cancel", exact: true })
          .click();
        await expect(page.locator("[data-slot=sheet-content]")).toHaveCount(0);
        await expect(page.locator("[data-slot=sheet-overlay]")).toHaveCount(0);
        await expect(manage).toBeFocused();
        await manage.click();
        await expect(sheet).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(page.locator("[data-slot=sheet-content]")).toHaveCount(0);
        await expect(page.locator("[data-slot=sheet-overlay]")).toHaveCount(0);
        await expect(manage).toBeFocused();
        const search = page.getByRole("textbox", {
          name: "Search teams",
          exact: true,
        });
        await search.fill("  GLOBAL SUPPORT  ");
        await expect(
          page.getByRole("button", { name: "Manage", exact: true }),
        ).toHaveCount(1);
        await expect(
          page.getByText("Field Mobilizers", { exact: true }).first(),
        ).toBeVisible();
        const filteredManage = page.getByRole("button", {
          name: "Manage",
          exact: true,
        });
        await filteredManage.click();
        const fieldSheet = page.getByRole("dialog", {
          name: "Field Mobilizers",
          exact: true,
        });
        await expect(fieldSheet).toBeVisible();
        await fieldSheet.getByRole("tab", { name: "Members (12)" }).click();
        await expect(fieldSheet.getByText("mike@example.com")).toBeVisible();
        await expect(fieldSheet.getByText("rachel@example.com")).toBeVisible();
        await expect(fieldSheet.getByText("alex@example.com")).toHaveCount(0);
        await fieldSheet
          .getByRole("tab", { name: "Settings", exact: true })
          .click();
        await expect(
          fieldSheet.getByRole("textbox", { name: "Team Branding Name" }),
        ).toHaveValue("Field Mobilizers");
        await page.keyboard.press("Escape");
        await expect(page.locator("[data-slot=sheet-content]")).toHaveCount(0);
        await expect(filteredManage).toBeFocused();
        await search.fill("not-a-team");
        await expect(
          page.getByText("No teams found", { exact: true }),
        ).toBeVisible();
        await search.fill("");
        const options = page.getByRole("button", {
          name: "Open user options for Alex Johnson",
          exact: true,
        });
        await options.click();
        await expect(
          page.getByRole("menuitem", { name: "Change Role", exact: true }),
        ).toBeVisible();
        await expect(
          page.getByRole("menuitem", { name: "Remove Access", exact: true }),
        ).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(options).toBeFocused();
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth),
        ).toBeLessThanOrEqual(width);
        expect(errors).toEqual([]);
        expect(requests).toEqual([]);
      });
    }
