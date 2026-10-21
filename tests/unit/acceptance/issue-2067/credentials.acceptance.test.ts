/**
 * Acceptance tests for GitHub issue #2067 — read-only credential (DC4).
 * Spec (rev 2, Blake-approved): {@link https://github.com/Asymmetric-al/core/issues/2067#issuecomment-6306182453}
 *
 * With only SUPABASE_SERVICE_ROLE_KEY set, `bun run cutover:assess:documents`
 * exits 1 with a read-only-credential blocker and no client is created with
 * that key. With DOCUMENT_CUTOVER_SUPABASE_READ_KEY set, the read client uses
 * only that key. All key values are obviously fake; no network target is real.
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
  cleanTarget,
  cleanupProofFiles,
  runCommand,
} from "./command-harness";
import { fakeDb } from "./fake-supabase";

vi.mock("@supabase/supabase-js", async (importOriginal) =>
  (await import("./fake-supabase")).mockSupabaseModule(await importOriginal()),
);

afterEach(() => {
  vi.restoreAllMocks();
  cleanupProofFiles();
});

/** A line that names a read-only credential/key requirement (the blocker). */
const READ_ONLY_CREDENTIAL_BLOCKER =
  /read[- ]?only[^\n]*(credential|key)|(credential|key)[^\n]*read[- ]?only/i;

describe("issue #2067 — DC4 read-only credential", () => {
  it("DC4: with only SUPABASE_SERVICE_ROLE_KEY set, the command exits 1 with a read-only-credential blocker and creates no client with that key", async () => {
    cleanTarget();
    const result = await runCommand({
      argv: [],
      env: {
        SUPABASE_URL: LOCAL_TARGET_URL,
        SUPABASE_SERVICE_ROLE_KEY: FAKE_SERVICE_ROLE_KEY,
      },
    });

    expect(result.exitCode).toBe(1);
    expect(`${result.stdout}\n${result.stderr}`).toMatch(
      READ_ONLY_CREDENTIAL_BLOCKER,
    );
    expect(
      fakeDb.clients.filter(({ key }) => key === FAKE_SERVICE_ROLE_KEY),
    ).toEqual([]);
  });

  it("DC4: with DOCUMENT_CUTOVER_SUPABASE_READ_KEY set (service role key also present), every read client uses only the read key", async () => {
    cleanTarget();
    await runCommand({
      argv: [],
      env: {
        SUPABASE_URL: LOCAL_TARGET_URL,
        SUPABASE_SERVICE_ROLE_KEY: FAKE_SERVICE_ROLE_KEY,
        DOCUMENT_CUTOVER_SUPABASE_READ_KEY: FAKE_READ_KEY,
      },
    });

    expect(fakeDb.clients.length).toBeGreaterThan(0);
    expect(fakeDb.clients.map(({ key }) => key)).toEqual(
      fakeDb.clients.map(() => FAKE_READ_KEY),
    );
  });

  it("DC4: `bun run cutover:assess:documents` with only SUPABASE_SERVICE_ROLE_KEY exits 1 with a read-only-credential blocker", () => {
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
    expect(child.status).toBe(1);
    expect(`${child.stdout}\n${child.stderr}`).toMatch(
      READ_ONLY_CREDENTIAL_BLOCKER,
    );
  }, 150_000);
});
