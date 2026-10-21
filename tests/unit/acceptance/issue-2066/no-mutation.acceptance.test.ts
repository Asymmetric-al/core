/**
 * Acceptance tests for GitHub issue #2066 — command-layer no-mutation (DC7).
 * Spec (rev 2, Blake-approved): {@link https://github.com/Asymmetric-al/core/issues/2066#issuecomment-6306182304}
 *
 * Throwing spies guard the DB write methods (insert/update/upsert/delete/rpc),
 * storage write methods (upload/remove/move and bucket writes), file writes
 * outside the injected store, and configuration (process.env) writes. A full
 * assess run and a full `--verify` run must complete without invoking any.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  LOCAL_TARGET_ENV,
  buildCleanProof,
  loadCommand,
  runCommand,
  serializeProof,
  serverResolvedLocalIdentity,
  writeTempProofFile,
} from "./command-harness";
import { InMemoryDocumentCutoverProofStore } from "../../../../packages/api/src/document-cutover";
import {
  DocumentEnvironmentFixture,
  buildFixtureDetectors,
} from "../../packages/api/document-cutover-test-fixture";

const guard = vi.hoisted(() => ({
  armed: false,
  calls: [] as string[],
  clientsCreated: 0,
  migrationsVersion: null as string | null,
}));

const FS_WRITE_METHODS = vi.hoisted(() => [
  "writeFile",
  "writeFileSync",
  "appendFile",
  "appendFileSync",
  "mkdir",
  "mkdirSync",
  "mkdtemp",
  "mkdtempSync",
  "rm",
  "rmSync",
  "rmdir",
  "rmdirSync",
  "unlink",
  "unlinkSync",
  "rename",
  "renameSync",
  "copyFile",
  "copyFileSync",
  "cp",
  "cpSync",
  "truncate",
  "truncateSync",
  "symlink",
  "symlinkSync",
  "link",
  "linkSync",
  "chmod",
  "chmodSync",
  "createWriteStream",
]);

function guardedModule<T extends Record<string, unknown>>(
  actual: T,
  label: string,
): T {
  const wrapped: Record<string, unknown> = { ...actual };
  for (const name of FS_WRITE_METHODS) {
    const original = actual[name];
    if (typeof original !== "function") continue;
    wrapped[name] = (...args: unknown[]) => {
      if (guard.armed) {
        guard.calls.push(`${label}.${name}`);
        throw new Error(`#2066 DC7 forbidden write: ${label}.${name}`);
      }
      return (original as (...a: unknown[]) => unknown)(...args);
    };
  }
  return { ...wrapped, default: wrapped } as unknown as T;
}

vi.mock("node:fs", async (importOriginal) =>
  guardedModule(await importOriginal<Record<string, unknown>>(), "fs"),
);
vi.mock("node:fs/promises", async (importOriginal) =>
  guardedModule(await importOriginal<Record<string, unknown>>(), "fs/promises"),
);

/**
 * Permissive fake Supabase client (./migrations-read-mock.ts): every read chain
 * resolves to an empty, successful result, except a migrations-table read,
 * which reports `guard.migrationsVersion` when a test sets it; every write
 * method (including `rpc`) is a throwing spy recorded in `guard.calls`.
 */
vi.mock("@supabase/supabase-js", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  const { readOnlySupabaseClient } = await import("./migrations-read-mock");
  return {
    ...actual,
    createClient: (..._args: unknown[]) => {
      guard.clientsCreated += 1;
      return readOnlySupabaseClient({
        migrationsVersion: () => guard.migrationsVersion,
        onWrite: (call) => guard.calls.push(`supabase:${call}`),
        writeErrorPrefix: "#2066 DC7 forbidden write",
      });
    },
  };
});

beforeEach(() => {
  guard.armed = false;
  guard.calls = [];
  guard.clientsCreated = 0;
  guard.migrationsVersion = null;
});

afterEach(() => {
  guard.armed = false;
});

async function armed<T>(run: () => Promise<T>): Promise<T> {
  guard.armed = true;
  try {
    return await run();
  } finally {
    guard.armed = false;
  }
}

// Must stay the first test in this file: it performs the module's first import.
describe("issue #2066 — test seam: importing the script does not run it (addendum item 1)", () => {
  it("importing the module triggers no detector call, no store or file write, no client and no process.exitCode change", async () => {
    const exitCodeBefore = process.exitCode;
    const command = await armed(() => loadCommand());

    expect(command.ranOnImport).toBe(false);
    expect(guard.calls).toEqual([]);
    expect(guard.clientsCreated).toBe(0);
    expect(process.exitCode).toBe(exitCodeBefore);
  });
});

describe("issue #2066 — DC7 no mutation at the command layer", () => {
  it("--help (addendum item 3) exits 0 without any DB/storage/file/config write or client", async () => {
    const result = await armed(() =>
      runCommand({
        argv: ["--help"],
        env: {
          ...LOCAL_TARGET_ENV,
          SUPABASE_SERVICE_ROLE_KEY: "acceptance-2066-fake-key",
        },
        store: new InMemoryDocumentCutoverProofStore(),
      }),
    );

    expect(result.exitCode).toBe(0);
    expect(guard.calls).toEqual([]);
    expect(guard.clientsCreated).toBe(0);
    expect(result.envMutations).toEqual([]);
  });

  it("DC7: a full assess run with injected fixture detectors and an in-memory store invokes no write method", async () => {
    const fixture = new DocumentEnvironmentFixture();
    fixture.seedRow("pdf_templates", {
      id: "acceptance-row",
      tenant_id: "acceptance-tenant",
    });
    const before = fixture.snapshot();

    const result = await armed(() =>
      runCommand({
        argv: [],
        env: LOCAL_TARGET_ENV,
        detectors: buildFixtureDetectors(fixture),
        store: new InMemoryDocumentCutoverProofStore(),
      }),
    );

    expect(result.exitCode).not.toBe(0);
    expect(guard.calls).toEqual([]);
    expect(fixture.attemptedWrites).toEqual([]);
    expect(fixture.snapshot()).toBe(before);
    expect(result.envMutations).toEqual([]);
  });

  it("DC7: a full assess run through the real detectors against a fake client invokes no DB/storage/file/config write", async () => {
    // Fake key values under both the current and the #2067 key names, so the
    // real detectors reach the (mocked) client before and after #2067.
    const result = await armed(() =>
      runCommand({
        argv: [],
        env: {
          ...LOCAL_TARGET_ENV,
          SUPABASE_SERVICE_ROLE_KEY: "acceptance-2066-fake-key",
        },
        store: new InMemoryDocumentCutoverProofStore(),
      }),
    );

    expect(result.exitCode).not.toBe(0);
    expect(guard.clientsCreated).toBeGreaterThan(0);
    expect(guard.calls).toEqual([]);
    expect(result.envMutations).toEqual([]);
  });

  it("DC7: a full --verify run invokes no DB/storage/file/config write", async () => {
    // The proof file is written by the test before the guard is armed.
    const proof = await buildCleanProof(serverResolvedLocalIdentity());
    const file = writeTempProofFile(serializeProof(proof));
    // Read-only target fixture (ruling option A): the migrations table reports
    // the proof's schema version. Reads never count as writes; rpc stays a
    // throwing write spy.
    guard.migrationsVersion = proof.environment?.schemaVersion ?? null;

    const result = await armed(() =>
      runCommand({
        argv: ["--verify", file],
        env: LOCAL_TARGET_ENV,
        store: new InMemoryDocumentCutoverProofStore(),
      }),
    );

    expect(result.exitCode).toBe(0);
    expect(guard.calls).toEqual([]);
    expect(result.envMutations).toEqual([]);
  });
});
