/**
 * Acceptance tests for GitHub issue #2067 addendum 4, engineering ruling 6
 * (Samson, 2026-10-20 11:03 PM PT): the database URL must point at the same
 * project as SUPABASE_URL.
 * Addendum 4: {@link https://github.com/Asymmetric-al/core/issues/2067#issuecomment-6308840307}
 *
 * The target's identity is still taken from `SUPABASE_URL`. The project ref
 * of `DOCUMENT_CUTOVER_DATABASE_URL` — from the pooler user
 * `<name>.<ref>`, or from the host of a direct `db.<ref>.supabase.co`
 * connection — must equal SUPABASE_URL's ref. A mismatch, or a ref that is
 * missing or can't be parsed, is a blocker and no proof (fail closed).
 *
 * Local targets: a loopback SUPABASE_URL with a loopback DB URL (no ref on
 * either side) is the local case and stays accepted (every other suite runs
 * it). A loopback SUPABASE_URL with a hosted DB URL (pooler `<name>.<ref>` or
 * `db.<ref>.supabase.co`) fails closed — Samson, 2026-10-20 11:15 PM PT.
 *
 * The hosted ref is listed in a scripted allowlist's `nonProductionProjects`
 * (./scripted-allowlist.ts) so that the matching controls can record a clean
 * proof; each mismatch changes only the database URL.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  LOCAL_TARGET_ENV,
  cleanTarget,
  cleanupProofFiles,
  decisionArgs,
  fakeDatabaseUrl,
  fakeDirectDatabaseUrl,
  fakePoolerUrlWithoutRef,
  hostedTargetEnv,
  listProofFiles,
  markedStatement,
  newProofFiles,
  proofRunMarker,
  runCommand,
} from "./command-harness";
import { READER_ROLE } from "./document-cutover-contract";
import { fakePg } from "./fake-postgres";
import { scriptedAllowlist } from "./scripted-allowlist";
import { InMemoryDocumentCutoverProofStore } from "../../../../packages/api/src/document-cutover";

vi.mock("@supabase/supabase-js", async (importOriginal) =>
  (await import("./fake-supabase")).mockSupabaseModule(await importOriginal()),
);
vi.mock("pg", async () => (await import("./fake-postgres")).mockPgModule());
vi.mock("node:fs", async (importOriginal) =>
  (await import("./scripted-allowlist")).mockFs(await importOriginal()),
);
vi.mock("node:fs/promises", async (importOriginal) =>
  (await import("./scripted-allowlist")).mockFsPromises(await importOriginal()),
);

const TARGET_REF = "acceptance2067targetref";
const OTHER_REF = "acceptance2067otherref";
const OWNER = {
  id: "acceptance-2067-target-ref-owner",
  role: "platform_owner",
};

afterEach(() => {
  scriptedAllowlist.text = null;
  vi.restoreAllMocks();
  cleanupProofFiles();
});

async function goWithDatabaseUrl(
  databaseUrl: string,
  targetEnv: Record<string, string> = hostedTargetEnv(TARGET_REF),
) {
  scriptedAllowlist.text = JSON.stringify({
    owners: [OWNER],
    nonProductionProjects: [TARGET_REF],
  });
  cleanTarget();
  const marker = proofRunMarker();
  const before = listProofFiles();
  const store = new InMemoryDocumentCutoverProofStore();
  const result = await runCommand({
    argv: decisionArgs("go", OWNER, markedStatement(marker)),
    env: {
      ...targetEnv,
      DOCUMENT_CUTOVER_DATABASE_URL: databaseUrl,
    },
    store,
  });
  return {
    exitCode: result.exitCode,
    output: `${result.stdout}\n${result.stderr}`,
    stored: await store.list(),
    files: newProofFiles(before, marker),
  };
}

/** A project-ref mismatch blocker (wording not pinned). */
const REF_BLOCKER =
  /project[ _-]?ref|\bref\b|project|mismatch|does not match|DOCUMENT_CUTOVER_DATABASE_URL/i;

describe("issue #2067 addendum 4 ruling 6 — DB URL project ref must match SUPABASE_URL", () => {
  it("control (pooler): user document_cutover_reader.<same ref> records one clean proof and exits 0", async () => {
    const run = await goWithDatabaseUrl(
      fakeDatabaseUrl(READER_ROLE, TARGET_REF),
    );
    expect(run.exitCode, run.output).toBe(0);
    expect(run.stored).toHaveLength(1);
    expect(run.stored[0]?.outcome).toBe("clean_preproduction_proof");
    expect(fakePg.connections.length).toBeGreaterThan(0);
  });

  it("control (direct): host db.<same ref>.supabase.co records one clean proof and exits 0", async () => {
    const run = await goWithDatabaseUrl(fakeDirectDatabaseUrl(TARGET_REF));
    expect(run.exitCode, run.output).toBe(0);
    expect(run.stored).toHaveLength(1);
    expect(run.stored[0]?.outcome).toBe("clean_preproduction_proof");
  });

  it.each([
    [
      "mismatch via pooler user (document_cutover_reader.<other ref>)",
      () => fakeDatabaseUrl(READER_ROLE, OTHER_REF),
    ],
    [
      "mismatch via host (db.<other ref>.supabase.co)",
      () => fakeDirectDatabaseUrl(OTHER_REF),
    ],
    [
      "conflicting refs (pooler user names the target, host db.<other ref>.supabase.co)",
      () => fakeDirectDatabaseUrl(OTHER_REF, `${READER_ROLE}.${TARGET_REF}`),
    ],
    [
      "missing ref (pooler host, user without .<ref>)",
      () => fakePoolerUrlWithoutRef(),
    ],
    [
      "missing ref (loopback host for a hosted target)",
      () => fakeDatabaseUrl(),
    ],
    ["unparseable URL", () => ["not", "a", "url"].join(" ")],
  ])(
    "ruling 6: %s is a blocker, a non-zero exit and no proof",
    async (_label, url) => {
      const run = await goWithDatabaseUrl(url());
      expect(run.exitCode, run.output).not.toBe(0);
      expect(run.output).toMatch(REF_BLOCKER);
      expect(run.stored).toEqual([]);
      expect(run.files).toEqual([]);
    },
  );

  it.each([
    [
      "hosted pooler DB URL (document_cutover_reader.<ref>)",
      () => fakeDatabaseUrl(READER_ROLE, TARGET_REF),
    ],
    [
      "hosted direct DB URL (db.<ref>.supabase.co)",
      () => fakeDirectDatabaseUrl(TARGET_REF),
    ],
  ])(
    "ruling 6 (11:15 PM): a loopback SUPABASE_URL with a %s fails closed — blocker, non-zero exit, no proof",
    async (_label, url) => {
      const run = await goWithDatabaseUrl(url(), { ...LOCAL_TARGET_ENV });
      expect(run.exitCode, run.output).not.toBe(0);
      expect(run.output).toMatch(REF_BLOCKER);
      expect(run.stored).toEqual([]);
      expect(run.files).toEqual([]);
    },
  );
});
