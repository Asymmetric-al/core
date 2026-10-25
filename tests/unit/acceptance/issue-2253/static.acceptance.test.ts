/**
 * #2253 static acceptance (runs in test:unit): r1 §6 criteria 1 and 12, with
 * the merge-base scope check. Owned by Acceptance.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

import {
  ALLOWLIST,
  CATALOG,
  DOC,
  EXCEPTIONS,
  GATE,
  KINDS,
  MARKER,
  VERIFIER,
  read,
} from "./harness";

const git = (...args: string[]) => spawnSync("git", args, { encoding: "utf8" });
const base = git("merge-base", "origin/develop", "HEAD").stdout.trim();

describe("#2253 static (1, 12)", () => {
  it(`1: ${CATALOG} exports the marked SQL, the evaluator and the runner`, async () => {
    expect(read(CATALOG), `${CATALOG} exists`).not.toBe("");
    const m = (await import(
      pathToFileURL(path.resolve(CATALOG)).href
    )) as Record<string, unknown>;
    expect(String(m.TENANT_RLS_CATALOG_SQL)).toContain(MARKER);
    expect(typeof m.evaluateTenantRlsCatalog).toBe("function");
    expect(typeof m.runTenantRlsCatalogGate).toBe("function");
  });

  it(`1: ${VERIFIER} runs the gate after the census and before the success line`, () => {
    const src = read(VERIFIER);
    const [census = -1, gate = -1, done = -1] = [
      "field-policy-census.mjs",
      "runTenantRlsCatalogGate(",
      "forward Supabase migrations",
    ].map((s) => src.lastIndexOf(s));
    expect(src).toContain("tenant-rls-catalog.mjs");
    expect(census).toBeGreaterThan(0);
    expect(gate).toBeGreaterThan(census);
    expect(done).toBeGreaterThan(gate);
  });

  it(`12: ${DOC} has a "CI gates" section covering both gates, where they run, the kinds and the review rules`, () => {
    const doc = read(DOC);
    const i = doc.search(/^#+ CI gates\s*$/m);
    expect(i, "CI gates heading").toBeGreaterThan(-1);
    const sec = doc.slice(i);
    for (const s of [
      CATALOG,
      VERIFIER,
      GATE,
      ALLOWLIST,
      EXCEPTIONS,
      "migrate",
      "test:unit",
      "verify:service-role-clients",
      "#516",
      ...KINDS,
    ])
      expect(sec, s).toContain(s);
    expect(sec).toMatch(/shrink[- ]only/i);
    expect(sec).toMatch(/re-?export/i);
  });

  it.skipIf(!base)(
    "1, 12 (scope vs merge-base): no workflow file and docs/ci.md unchanged",
    () => {
      const changed = git(
        "diff",
        "--name-only",
        base,
        "--",
        ".github",
        "docs/ci.md",
      ).stdout.trim();
      expect(changed).toBe("");
    },
  );
});
