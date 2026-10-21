/**
 * Acceptance tests for GitHub issue #2066 — command adapter and exit codes.
 * Spec (rev 2, Blake-approved): {@link https://github.com/Asymmetric-al/core/issues/2066#issuecomment-6306182304}
 *
 * Covers the minimal test seam (spec §2), DC3 (exit 0 only for a verified clean
 * proof; non-zero for each fail-closed state) and DC4 (stopped output grouped by
 * surfaceKind, no destructive command suggested). Seam contract: see
 * ./command-harness.ts.
 *
 * Spec addendum (Samson, 2026-10-20 7:40 PM PT,
 * https://github.com/Asymmetric-al/core/issues/2066#issuecomment-6306633299):
 * `--help` exits 0, runs no detectors and is excluded from the DC3 rule that
 * exit 0 means a verified clean proof.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { describe, expect, it } from "vitest";

import {
  LOCAL_TARGET_ENV,
  LOCAL_TARGET_URL,
  buildCleanProof,
  destructiveCommandTokens,
  loadCommand,
  parseGroupedBlockers,
  runCommand,
  serializeProof,
  serverResolvedLocalIdentity,
  tamperOneByte,
  writeTempProofFile,
} from "./command-harness";
import { InMemoryDocumentCutoverProofStore } from "../../../../packages/api/src/document-cutover";
import {
  DocumentEnvironmentFixture,
  buildFixtureDetectors,
} from "../../packages/api/document-cutover-test-fixture";

const VALID_APPROVAL_ARGS = [
  "--owner",
  "acceptance-owner",
  "--owner-role",
  "platform_owner",
  "--statement",
  "Acceptance #2066 approval statement.",
];

function withoutFlag(args: string[], flag: string): string[] {
  const index = args.indexOf(flag);
  return index < 0 ? args : [...args.slice(0, index), ...args.slice(index + 2)];
}

describe("issue #2066 — minimal test seam (spec §2)", () => {
  it("the command module exports main() or a thin adapter taking detectors, store, env and argv", async () => {
    const command = await loadCommand();
    expect(typeof command.run).toBe("function");
  });

  it("importing the command module does not run the command", async () => {
    const command = await loadCommand();
    expect(command.ranOnImport).toBe(false);
  });
});

describe("issue #2066 — --help (addendum item 3)", () => {
  it("--help exits 0, calls no detector and records no proof", async () => {
    const calls: string[] = [];
    const detectors = buildFixtureDetectors(
      new DocumentEnvironmentFixture(),
    ).map((detector) => ({
      ...detector,
      inspectSurface: async (surfaceId: string) => {
        calls.push(`${detector.detectorId}:${surfaceId}`);
        return detector.inspectSurface(surfaceId);
      },
    }));
    const store = new InMemoryDocumentCutoverProofStore();

    const result = await runCommand({
      argv: ["--help"],
      env: LOCAL_TARGET_ENV,
      detectors,
      store,
    });

    expect(result.exitCode).toBe(0);
    expect(calls).toEqual([]);
    expect(await store.list()).toEqual([]);
  });
});

describe("issue #2066 — DC3 exit codes", () => {
  it("DC3: exits 0 for --verify on a cryptographically verified clean proof for this target", async () => {
    const proof = await buildCleanProof(serverResolvedLocalIdentity());
    const file = writeTempProofFile(serializeProof(proof));

    const result = await runCommand({
      argv: ["--verify", file],
      env: LOCAL_TARGET_ENV,
      store: new InMemoryDocumentCutoverProofStore(),
    });

    expect(result.exitCode).toBe(0);
  });

  it("DC3: exits non-zero on stop_the_line (a seeded prototype table row)", async () => {
    const fixture = new DocumentEnvironmentFixture();
    fixture.seedRow("pdf_templates", {
      id: "acceptance-row",
      tenant_id: "acceptance-tenant",
    });
    const store = new InMemoryDocumentCutoverProofStore();

    const result = await runCommand({
      argv: [],
      env: LOCAL_TARGET_ENV,
      detectors: buildFixtureDetectors(fixture),
      store,
    });

    expect(result.exitCode).not.toBe(0);
    expect(result.stdout).toMatch(/stop_the_line/);
    expect(await store.list()).toEqual([]);
  });

  it("DC3: exits non-zero on indeterminate/incomplete evidence", async () => {
    const fixture = new DocumentEnvironmentFixture();
    const result = await runCommand({
      argv: [],
      env: LOCAL_TARGET_ENV,
      detectors: buildFixtureDetectors(fixture, {
        database_table: async (table) => ({
          completeness: "indeterminate",
          detectorQuery: `acceptance indeterminate ${table}`,
        }),
      }),
      store: new InMemoryDocumentCutoverProofStore(),
    });

    expect(result.exitCode).not.toBe(0);
    expect(result.stdout).toMatch(/incomplete|indeterminate/);
  });

  it("DC3: exits non-zero when database credentials are missing (credential-agnostic: no key of any name is set)", async () => {
    // Real detectors (none injected); only a loopback URL, no key of any kind.
    const result = await runCommand({
      argv: [],
      env: { SUPABASE_URL: LOCAL_TARGET_URL },
      store: new InMemoryDocumentCutoverProofStore(),
    });

    expect(result.exitCode).not.toBe(0);
    expect(`${result.stdout}\n${result.stderr}`).not.toMatch(/^CLEAN\b/m);
  });

  it.each([["--owner"], ["--owner-role"], ["--statement"]])(
    "DC3: invalid approval — --decision go without %s exits non-zero and records no proof",
    async (missing) => {
      const store = new InMemoryDocumentCutoverProofStore();
      const result = await runCommand({
        argv: [
          "--decision",
          "go",
          ...withoutFlag(VALID_APPROVAL_ARGS, missing),
        ],
        env: LOCAL_TARGET_ENV,
        detectors: buildFixtureDetectors(new DocumentEnvironmentFixture()),
        store,
      });

      expect(result.exitCode).not.toBe(0);
      expect(await store.list()).toEqual([]);
    },
  );

  it("DC3: assess-only (no --decision) on fully clean evidence exits non-zero and records no proof", async () => {
    const store = new InMemoryDocumentCutoverProofStore();
    const result = await runCommand({
      argv: [],
      env: LOCAL_TARGET_ENV,
      detectors: buildFixtureDetectors(new DocumentEnvironmentFixture()),
      store,
    });

    expect(result.exitCode).not.toBe(0);
    expect(await store.list()).toEqual([]);
  });

  it("DC3: --verify on a clean proof with exactly one byte changed exits non-zero", async () => {
    const proof = await buildCleanProof(serverResolvedLocalIdentity());
    const file = writeTempProofFile(tamperOneByte(serializeProof(proof)));

    const result = await runCommand({
      argv: ["--verify", file],
      env: LOCAL_TARGET_ENV,
      store: new InMemoryDocumentCutoverProofStore(),
    });

    expect(result.exitCode).not.toBe(0);
    expect(result.stdout).not.toMatch(/^VALID\b/m);
  });

  it("DC3 (fail-closed, non-pinned): --verify on a clean proof recorded years ago exits non-zero", async () => {
    // Far outside any candidate freshness bound; no threshold is pinned here.
    const proof = await buildCleanProof(serverResolvedLocalIdentity(), {
      now: new Date("2020-01-01T00:00:00.000Z"),
    });
    const file = writeTempProofFile(serializeProof(proof));

    const result = await runCommand({
      argv: ["--verify", file],
      env: LOCAL_TARGET_ENV,
      store: new InMemoryDocumentCutoverProofStore(),
    });

    expect(result.exitCode).not.toBe(0);
  });
});

describe("issue #2066 — DC4 stopped output", () => {
  async function stoppedRun() {
    const fixture = new DocumentEnvironmentFixture();
    fixture.seedRow("pdf_templates", {
      id: "acceptance-row",
      tenant_id: "acceptance-tenant",
    });
    fixture.seedStorageObject("acceptance-bucket/acceptance-object.bin");
    fixture.activeJobs = 1;
    return runCommand({
      argv: [],
      env: LOCAL_TARGET_ENV,
      detectors: buildFixtureDetectors(fixture),
      store: new InMemoryDocumentCutoverProofStore(),
    });
  }

  it("DC4: groups blockers under one per-surfaceKind heading (groupBlockers format), each blocker under its own kind", async () => {
    const result = await stoppedRun();
    expect(result.exitCode).not.toBe(0);

    const { headings, groups } = parseGroupedBlockers(result.stdout);
    expect(new Set(headings).size).toBe(headings.length);
    expect(headings).toEqual(
      expect.arrayContaining([
        "database_table",
        "storage_location",
        "background_job",
      ]),
    );
    expect(groups.get("database_table")?.join("\n")).toContain(
      "[pdf_templates]",
    );
    expect(groups.get("storage_location")?.join("\n")).toContain(
      "[pdf_template_artifacts.storage_objects]",
    );
    expect(groups.get("background_job")?.join("\n")).toContain(
      "[pdf_template_batch_jobs.queue]",
    );
    expect(groups.get("database_table")?.join("\n")).not.toContain(
      "[pdf_template_artifacts.storage_objects]",
    );
  });

  it("DC4: suggests no destructive command (no delete, drop, truncate or rm in stdout or stderr)", async () => {
    const result = await stoppedRun();
    expect(
      destructiveCommandTokens(`${result.stdout}\n${result.stderr}`),
    ).toEqual([]);
  });
});
