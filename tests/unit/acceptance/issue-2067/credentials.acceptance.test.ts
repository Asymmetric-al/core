/**
 * Acceptance tests for GitHub issue #2067 — the gate's database credential.
 * Spec rev 2 DC4 (read-only credential), as replaced by addendum 4
 * (Blake-approved 2026-10-20 10:31 PM PT):
 * {@link https://github.com/Asymmetric-al/core/issues/2067#issuecomment-6308840307}
 *
 * Addendum 4 item 5 / criterion 3 (fourth case): the gate fails closed when
 * `DOCUMENT_CUTOVER_DATABASE_URL` is missing, including when only
 * `SUPABASE_SERVICE_ROLE_KEY` is set. It exits non-zero with a blocker that
 * names `DOCUMENT_CUTOVER_DATABASE_URL`, writes no proof, and creates no
 * client of any kind with the service-role key. The old read key is replaced
 * (criterion 2), so it no longer satisfies the gate on its own either.
 *
 * Reworked for addendum 4 (was: "with only SUPABASE_SERVICE_ROLE_KEY ... a
 * read-only-credential blocker" and "every read client uses only
 * DOCUMENT_CUTOVER_SUPABASE_READ_KEY"). The read-key client test is removed:
 * the gate must create no Supabase client at all (reader-connection
 * criterion 2 tests). All values are obviously fake; no network target is real.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { spawnSync } from "node:child_process";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  FAKE_READ_KEY,
  FAKE_SERVICE_ROLE_KEY,
  LOCAL_TARGET_URL,
  REPO_ROOT,
  allowlistedOwner,
  cleanTarget,
  cleanupProofFiles,
  decisionArgs,
  fakeDatabaseUrl,
  listProofFiles,
  markedStatement,
  newProofFiles,
  proofRunMarker,
  runCommand,
} from "./command-harness";
import { READER_ROLE } from "./document-cutover-contract";
import { fakePg } from "./fake-postgres";
import { fakeDb } from "./fake-supabase";
import { InMemoryDocumentCutoverProofStore } from "../../../../packages/api/src/document-cutover";

vi.mock("@supabase/supabase-js", async (importOriginal) =>
  (await import("./fake-supabase")).mockSupabaseModule(await importOriginal()),
);
vi.mock("pg", async () => (await import("./fake-postgres")).mockPgModule());

afterEach(() => {
  vi.restoreAllMocks();
  cleanupProofFiles();
});

/** The blocker names the missing variable (addendum 4 item 5). */
const DATABASE_URL_BLOCKER = /DOCUMENT_CUTOVER_DATABASE_URL/;

async function goWithEnv(env: Record<string, string>) {
  cleanTarget();
  const marker = proofRunMarker();
  const before = listProofFiles();
  const store = new InMemoryDocumentCutoverProofStore();
  const result = await runCommand({
    argv: decisionArgs("go", allowlistedOwner(), markedStatement(marker)),
    env,
    store,
  });
  return {
    result,
    output: `${result.stdout}\n${result.stderr}`,
    stored: await store.list(),
    files: newProofFiles(before, marker),
  };
}

describe("issue #2067 addendum 4 — criterion 3: DOCUMENT_CUTOVER_DATABASE_URL missing", () => {
  it("criterion 3 (missing URL, only SUPABASE_SERVICE_ROLE_KEY set): --decision go exits non-zero with a blocker naming DOCUMENT_CUTOVER_DATABASE_URL, writes no proof, and creates no client with that key", async () => {
    const { result, output, stored, files } = await goWithEnv({
      SUPABASE_URL: LOCAL_TARGET_URL,
      SUPABASE_SERVICE_ROLE_KEY: FAKE_SERVICE_ROLE_KEY,
    });

    expect(result.exitCode).not.toBe(0);
    expect(output).toMatch(DATABASE_URL_BLOCKER);
    expect(stored).toEqual([]);
    expect(files).toEqual([]);
    expect(
      fakeDb.clients.filter(({ key }) => key === FAKE_SERVICE_ROLE_KEY),
    ).toEqual([]);
    expect(fakePg.connections).toEqual([]);
  });

  it("criterion 3 (missing URL, only the replaced DOCUMENT_CUTOVER_SUPABASE_READ_KEY set): --decision go exits non-zero with a blocker naming DOCUMENT_CUTOVER_DATABASE_URL and writes no proof", async () => {
    const { result, output, stored, files } = await goWithEnv({
      SUPABASE_URL: LOCAL_TARGET_URL,
      DOCUMENT_CUTOVER_SUPABASE_READ_KEY: FAKE_READ_KEY,
    });

    expect(result.exitCode).not.toBe(0);
    expect(output).toMatch(DATABASE_URL_BLOCKER);
    expect(stored).toEqual([]);
    expect(files).toEqual([]);
    expect(fakeDb.clients).toEqual([]);
  });

  it("ruling 1 (URL only, no PG* fallback): with DOCUMENT_CUTOVER_DATABASE_URL missing but PGHOST/PGUSER/PGPASSWORD/PGDATABASE and DATABASE_URL set, --decision go exits non-zero with a blocker naming DOCUMENT_CUTOVER_DATABASE_URL, opens no connection and writes no proof", async () => {
    const { result, output, stored, files } = await goWithEnv({
      SUPABASE_URL: LOCAL_TARGET_URL,
      PGHOST: "127.0.0.1",
      PGPORT: "54322",
      PGUSER: READER_ROLE,
      PGPASSWORD: ["acceptance", "2067", "pg", "env", "fake"].join("-"),
      PGDATABASE: "postgres",
      DATABASE_URL: fakeDatabaseUrl(),
    });

    expect(result.exitCode).not.toBe(0);
    expect(output).toMatch(DATABASE_URL_BLOCKER);
    expect(stored).toEqual([]);
    expect(files).toEqual([]);
    expect(fakePg.connections).toEqual([]);
    expect(fakePg.fallbackAttempts).toBe(0);
  });

  it("criterion 3 (missing URL): `bun run cutover:assess:documents` with only SUPABASE_SERVICE_ROLE_KEY exits non-zero with a blocker naming DOCUMENT_CUTOVER_DATABASE_URL", () => {
    // Real process, no mocks; the URL is an unroutable loopback port and the
    // key is fake, so nothing real is contacted.
    const child = spawnSync("bun", ["run", "cutover:assess:documents"], {
      cwd: REPO_ROOT,
      encoding: "utf8",
      timeout: 120_000,
      env: {
        PATH: process.env.PATH,
        HOME: process.env.HOME,
        SUPABASE_URL: "http://127.0.0.1:9",
        SUPABASE_SERVICE_ROLE_KEY: FAKE_SERVICE_ROLE_KEY,
      },
    });

    expect(child.error).toBeUndefined();
    expect(child.status).not.toBe(0);
    expect(child.status).not.toBeNull();
    expect(`${child.stdout}\n${child.stderr}`).toMatch(DATABASE_URL_BLOCKER);
  }, 150_000);
});
