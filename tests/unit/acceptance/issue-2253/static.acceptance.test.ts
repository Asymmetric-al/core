/**
 * #2253 static acceptance (runs in test:unit): r1 §6 criteria 1 and 12 and
 * the lead's CI-step ruling. Owned by Acceptance.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

import {
  ALLOWLIST,
  CATALOG,
  CI_STEP,
  DOC,
  EXCEPTIONS,
  GATE,
  KINDS,
  MARKER,
  REALSTACK,
  VERIFIER,
  read,
} from "./harness";
import { expectRealstackStep } from "../shared/realstack-step";

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
});

describe("#2253 CI step (lead's ruling: own explicit-path migrate step, relative order only)", () => {
  it(`migrate has one blocking '${CI_STEP.name}' step that runs ${REALSTACK}`, () => {
    expectRealstackStep(CI_STEP.name, [REALSTACK], CI_STEP.env);
  });

  it("the real-stack suite fails (not skips) in the migrate job when the URL is empty", () => {
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      GITHUB_ACTIONS: "true",
      GITHUB_JOB: "migrate",
    };
    env.TENANT_GUARD_IT_ADMIN_DATABASE_URL = env.VITEST = "";
    const r = spawnSync(
      process.execPath,
      ["node_modules/vitest/vitest.mjs", "run", REALSTACK],
      { env, encoding: "utf8" },
    );
    expect(r.status).toBe(1);
    expect(r.stdout + r.stderr).toContain("TENANT_GUARD_IT_ADMIN_DATABASE_URL");
  }, 120_000);
});
