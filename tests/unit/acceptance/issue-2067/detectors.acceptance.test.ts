/**
 * Acceptance tests for GitHub issue #2067 — detectors, distinct tenants,
 * schemaVersion from the target DB, strict seeded demo data.
 * Spec (rev 2, Blake-approved): {@link https://github.com/Asymmetric-al/core/issues/2067#issuecomment-6306182453}
 *
 * Covers DC5 (users/reports/integrations detectors in plan coverage, counts
 * with detectorId/detectorVersion, indeterminate -> stop_the_line on
 * permission-denied / unavailable / unknown-shape), DC6 (N>1 rows from one
 * tenant => tenants: 1, tenant ID not in stdout/stderr), DC7 (checkout vs DB
 * schema version mismatch or unreadable => stop_the_line) and DC10 (a seeded
 * demo tenant row in any prototype table => stop_the_line). The real
 * detectors run against the scriptable fake target in ./fake-supabase.ts.
 *
 * Naming assumption (flagged to Scope): the new plan surfaces / detectors are
 * identifiable by /user/i, /report/i and /integration/i in their surfaceKind,
 * surfaceId or detectorId, outside the repo-inventory kinds.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  LOCAL_TARGET_ENV,
  SEEDED_DEMO_TENANT_ID,
  allowlistedOwner,
  cleanTarget,
  cleanupProofFiles,
  decisionArgs,
  proposedOutcome,
  runCommand,
} from "./command-harness";
import { fakeDb } from "./fake-supabase";
import {
  PHASE_18_DESTRUCTIVE_CUTOVER_PLAN,
  PHASE_18_PROTOTYPE_DOCUMENT_TABLES,
  InMemoryDocumentCutoverProofStore,
} from "../../../../packages/api/src/document-cutover";

import type { FakeMode } from "./fake-supabase";
import type { DocumentCutoverSurfaceEvidence } from "../../../../packages/api/src/document-cutover";

vi.mock("@supabase/supabase-js", async (importOriginal) =>
  (await import("./fake-supabase")).mockSupabaseModule(await importOriginal()),
);

afterEach(() => {
  vi.restoreAllMocks();
  cleanupProofFiles();
});

const REPO_INVENTORY_KINDS = new Set([
  "route",
  "configuration",
  "prototype_test",
]);
const NEW_DETECTORS = [
  ["users", /user/i],
  ["reports", /report/i],
  ["integrations", /integration/i],
] as const;

function matchesNew(
  pattern: RegExp,
  item: { surfaceKind: string; surfaceId: string; detectorId?: string },
): boolean {
  if (REPO_INVENTORY_KINDS.has(item.surfaceKind)) return false;
  return (
    pattern.test(item.surfaceKind) ||
    pattern.test(item.surfaceId) ||
    pattern.test(item.detectorId ?? "")
  );
}

/** no_go run on the fake target, real detectors, proof captured in memory. */
async function recordedEvidence(): Promise<{
  evidence: DocumentCutoverSurfaceEvidence[];
  outcome: string | undefined;
  stdout: string;
  stderr: string;
}> {
  const store = new InMemoryDocumentCutoverProofStore();
  const result = await runCommand({
    argv: decisionArgs("no_go", allowlistedOwner()),
    env: LOCAL_TARGET_ENV,
    store,
  });
  const [proof] = await store.list();
  if (!proof) {
    throw new Error(
      `#2067: the no_go run recorded no proof (exit ${result.exitCode}).\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
    );
  }
  return {
    evidence: proof.evidence,
    outcome: proof.outcome,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

async function assessOnly() {
  return runCommand({ argv: [], env: LOCAL_TARGET_ENV });
}

describe("issue #2067 — DC5 users, reports and integrations detectors", () => {
  it.each(NEW_DETECTORS)(
    "DC5: PHASE_18_DESTRUCTIVE_CUTOVER_PLAN covers %s outside the repo-inventory kinds",
    (_name, pattern) => {
      expect(
        PHASE_18_DESTRUCTIVE_CUTOVER_PLAN.surfaces.filter((surface) =>
          matchesNew(pattern, surface),
        ).length,
      ).toBeGreaterThan(0);
    },
  );

  it("control: on a clean fake target the real detectors give a clean assessment (so every plan surface has a detector)", async () => {
    cleanTarget();
    const result = await assessOnly();
    expect(proposedOutcome(result.stdout)).toBe("clean_preproduction_proof");
    expect(result.stdout).not.toMatch(/plan_surface_without_detector/);
  });

  it.each(NEW_DETECTORS)(
    "DC5: the %s detector reports counts with detectorId/detectorVersion",
    async (_name, pattern) => {
      cleanTarget();
      const { evidence } = await recordedEvidence();
      const items = evidence.filter((item) => matchesNew(pattern, item));
      expect(items.length).toBeGreaterThan(0);
      for (const item of items) {
        expect(item.detectorId.trim()).not.toBe("");
        expect(item.detectorVersion.trim()).not.toBe("");
        expect(item.completeness).toBe("complete");
        expect(
          Object.values(item.relianceCounts).some(
            (count) => typeof count === "number",
          ),
        ).toBe(true);
      }
    },
  );

  const MODES: FakeMode[] = [
    "permission_denied",
    "unavailable",
    "unknown_shape",
  ];
  describe.each(MODES)("target mode %s", (mode) => {
    it.each(NEW_DETECTORS)(
      "DC5: the %s detector returns indeterminate and the outcome is stop_the_line",
      async (_name, pattern) => {
        cleanTarget();
        fakeDb.mode = mode;
        const { evidence, outcome } = await recordedEvidence();
        const items = evidence.filter((item) => matchesNew(pattern, item));
        expect(items.length).toBeGreaterThan(0);
        for (const item of items) {
          expect(item.completeness).toBe("indeterminate");
        }
        expect(outcome).toBe("stop_the_line");
      },
    );
  });
});

describe("issue #2067 — DC6 distinct-tenant counting", () => {
  it("DC6: N>1 rows from one tenant report tenants: 1, and the tenant ID does not appear in stdout or stderr", async () => {
    const tenantId = "7f3a2067-acce-4ance-8000-000000000042";
    cleanTarget();
    fakeDb.tableRows.set(
      "pdf_templates",
      [1, 2, 3].map((n) => ({
        id: `acceptance-row-${n}`,
        tenant_id: tenantId,
      })),
    );

    const { evidence, stdout, stderr } = await recordedEvidence();
    const templates = evidence.find(
      (item) =>
        item.surfaceKind === "database_table" &&
        item.surfaceId === "pdf_templates",
    );

    expect(templates?.relianceCounts.tenants).toBe(1);
    expect(stdout).not.toContain(tenantId);
    expect(stderr).not.toContain(tenantId);
  });
});

describe("issue #2067 — DC7 schemaVersion is read from the target DB", () => {
  it("control: a DB-reported version equal to the checkout's migration version does not stop the line", async () => {
    cleanTarget();
    const result = await assessOnly();
    expect(proposedOutcome(result.stdout)).toBe("clean_preproduction_proof");
  });

  it("DC7: a DB-reported version that differs from the checkout's migration version yields stop_the_line", async () => {
    cleanTarget();
    fakeDb.schemaVersion = "19990101000000";
    const result = await assessOnly();
    expect(proposedOutcome(result.stdout)).toBe("stop_the_line");
    expect(result.exitCode).toBe(1);
  });

  it("DC7: an unreadable DB version yields stop_the_line", async () => {
    cleanTarget();
    fakeDb.schemaVersion = null;
    const result = await assessOnly();
    expect(proposedOutcome(result.stdout)).toBe("stop_the_line");
    expect(result.exitCode).toBe(1);
  });
});

describe("issue #2067 — DC10 strict seeded demo data", () => {
  it.each([...PHASE_18_PROTOTYPE_DOCUMENT_TABLES])(
    "DC10: a seeded demo tenant row in %s yields stop_the_line naming that table",
    async (table) => {
      cleanTarget();
      fakeDb.tableRows.set(table, [
        { id: "acceptance-demo-row", tenant_id: SEEDED_DEMO_TENANT_ID },
      ]);
      const result = await assessOnly();
      expect(proposedOutcome(result.stdout)).toBe("stop_the_line");
      expect(result.stdout).toContain(`[${table}]`);
    },
  );
});
