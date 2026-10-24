/**
 * #2225 acceptance, C4: tests/e2e/performance.spec.ts (spec r2 §4 criteria
 * 5-7, 10) and §2 "docs edits: none" (pin P14).
 */
import { describe, expect, it } from "vitest";

import { PERF, loadSpec, read, runOne, sha256 } from "./harness";

const [HOME, LOGIN] = [/^Homepage LCP/, /^Login page LCP/];
const url = "http://app.test/_next/static/chunks/main-abc.js";
const HEAD = "0672b47ea6fdacbaf71d37d896409e08a872536987c7968ab6c3c67bea47929a";
const ASSET = { url, cacheControl: "public, max-age=31536000, immutable" };

describe("#2225 C4 perf budgets", () => {
  it.each([
    [HOME, { lcp: null }],
    [HOME, { ttfb: null }],
    [LOGIN, { lcp: null }],
  ])("criterion 5: %s fails on %o", async (re, vitals) => {
    expect((await runOne(PERF, re, { world: { vitals } })).outcome).toBe(
      "failed",
    );
  });

  it("criterion 5/6: with every metric in budget, each test passes and has an expect", async () => {
    const spec = loadSpec(PERF, { world: { assets: [ASSET] } });
    for (const t of spec.tests) {
      const r = await spec.run(t);
      expect(r.outcome, `${t.title}: ${r.error}`).toBe("passed");
      expect(
        r.steps.filter((s) => s.kind === "expect"),
        t.title,
      ).not.toEqual([]);
    }
  });

  it("criterion 6: the homepage test listens first and records assets; no cache test", async () => {
    expect(read(PERF)).not.toMatch(
      /Static assets should have cache headers|Edge Caching/,
    );
    const r = await runOne(PERF, HOME, { world: { assets: [ASSET] } });
    const at = (kind: string, path = "") =>
      r.steps.findIndex((s) => s.kind === kind && s.path.includes(path));
    expect(at("on:response")).toBeGreaterThanOrEqual(0);
    expect(at("on:response")).toBeLessThan(at("goto"));
    const logs = r.steps
      .filter((s) => /log|attach/.test(s.kind))
      .map((s) => s.path);
    expect(
      logs.some((l) => l.includes(url) && l.includes(ASSET.cacheControl)),
    ).toBe(true);
  });

  it("criterion 7: titles match measurements", () => {
    expect(read(PERF)).not.toMatch(/Login to dashboard/);
    const titles = loadSpec(PERF).tests.map((t) => t.title);
    expect(titles).toContain("Login page reaches DOMContentLoaded under 5s");
  });

  it("criterion 10: 5 @perf tests; budgets, window and waits unchanged; no FCP", async () => {
    const spec = loadSpec(PERF);
    expect(spec.tests).toHaveLength(5);
    for (const t of spec.tests)
      expect(t.describes.join(), t.title).toMatch(/@perf/);
    const head = read(PERF).slice(0, read(PERF).indexOf("test.describe("));
    expect(sha256(head), "thresholds + 3 s window").toBe(HEAD);
    expect(read(PERF)).toContain("expect(loginLoadTime).toBeLessThan(5000);");
    expect(read(PERF)).not.toMatch(
      /expect\(\s*vitals\.fcp|expect\([^)]*FCP_THRESHOLD/,
    );
    for (const re of [HOME, LOGIN, /hydration/i]) {
      const waits = (await runOne(PERF, re)).steps.map((s) => s.path);
      expect(waits, String(re)).toContain("networkidle");
    }
  });

  it("§2 docs (guard): the living docs still name the suites and no replaced title", () => {
    const docs = read("docs/ci.md") + read("docs/ai/rules/testing.md");
    for (const cmd of ["test:perf", "test:e2e:smoke", "Support Hub smoke"])
      expect(docs).toContain(cmd);
    expect(docs).not.toMatch(
      /Login to dashboard|Static assets should|hashes raw webhook/,
    );
  });
});
