/**
 * Acceptance tests for #2223 done criteria 7 and 10 plus spec §2.4: callers and
 * protected config stay as they are, so the fake bun above stays faithful to
 * Playwright's report location; getting-started.md:77 names the real default.
 * Owned by Acceptance; implementers must not edit this file to satisfy their PR.
 * Spec: https://github.com/Asymmetric-al/core/issues/2223#issuecomment-6369083832
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const read = (f: string) => readFileSync(f, "utf8");

describe("#2223 criteria 7, 10: callers and protected config unchanged", () => {
  it("package.json keeps the verify:e2e, loop and test:e2e commands", () => {
    const { scripts } = JSON.parse(read("package.json")) as {
      scripts: Record<string, string>;
    };
    expect(scripts["verify:e2e"]).toBe("bun scripts/verify-e2e.mjs");
    expect(scripts["verify:e2e:loop"]).toBe("bun scripts/verify-e2e-loop.mjs");
    expect(scripts["test:e2e"]).toBe(
      'node scripts/run-with-ci-env.mjs -- node node_modules/@playwright/test/cli.js test --grep-invert "@perf|@manual|@cms"',
    );
  });
  it("turbo.json keeps verify:e2e uncached and the loop persistent", () => {
    const { tasks } = JSON.parse(read("turbo.json")) as {
      tasks: Record<string, unknown>;
    };
    expect(tasks["verify:e2e"]).toEqual({ cache: false });
    expect(tasks["verify:e2e:loop"]).toEqual({
      cache: false,
      persistent: true,
    });
  });
  it("no workflow runs verify:e2e or the loop (not added to any gate)", () => {
    const dir = ".github/workflows";
    for (const f of readdirSync(dir))
      expect(read(path.join(dir, f)), f).not.toMatch(/verify[-:]e2e/);
  });
  it("playwright.config.ts keeps the report-dir rule, JSON reporter path and retries", () => {
    const cfg = read("playwright.config.ts");
    expect(cfg).toMatch(
      /process\.env\.PLAYWRIGHT_REPORT_DIR \|\| "playwright-report"/,
    );
    expect(cfg).toContain(
      '["json", { outputFile: path.join(reportDirectory, "results.json") }]',
    );
    expect(cfg).toContain("retries: process.env.CI ? 2 : 0,");
  });
});

describe("#2223 spec §2.4: getting-started.md documents the real default projects", () => {
  it("the VERIFY_E2E_PROJECTS row names all four default projects, not 'Only Chromium'", () => {
    const row = read("docs/guides/development/getting-started.md")
      .split("\n")
      .find((l) => l.includes("`VERIFY_E2E_PROJECTS`"));
    expect(row).toBeDefined();
    expect(row).not.toMatch(/Only Chromium/i);
    for (const p of [
      "chromium",
      "mobile-chrome",
      "chromium-donor",
      "chromium-admin",
    ])
      expect(row).toContain(`\`${p}\``);
  });
});
