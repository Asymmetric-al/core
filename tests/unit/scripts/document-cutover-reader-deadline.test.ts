/**
 * #2067 PR #2169 review r4340210576, Builder-owned: every reader query is
 * bounded. A mocked `pg` driver answers connect and the identity check, then
 * never replies to the query named by `stallOn`. The gate's deadline is
 * shortened to 200ms through the document-cutover barrel (the library's own
 * detector deadline stays 30s), so a run that is only bounded by the library
 * would exceed the per-test timeout.
 */

import { randomBytes } from "node:crypto";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  DOCUMENT_CUTOVER_PROOFS_DIR,
  InMemoryDocumentCutoverProofStore,
  assessDocumentCutoverEnvironment,
  recordDocumentCutoverApproval,
} from "../../../packages/api/src/document-cutover";
import { runDocumentCutoverCommand } from "../../../scripts/document-cutover/assess-document-cutover";
import {
  DocumentEnvironmentFixture,
  buildAssessmentInput,
} from "../packages/api/document-cutover-test-fixture";

const TEST_DEADLINE_MS = 200;

vi.mock(
  "../../../packages/api/src/document-cutover",
  async (importOriginal) => ({
    ...(await importOriginal<Record<string, unknown>>()),
    DOCUMENT_CUTOVER_DETECTOR_TIMEOUT_MS: 200,
  }),
);

const READER = "document_cutover_reader";

const fakePg = vi.hoisted(() => ({
  /** Queries matching this never settle. */
  stallOn: null as RegExp | null,
  queries: [] as string[],
  configs: [] as Record<string, unknown>[],
  ended: 0,
}));

vi.mock("pg", () => {
  class Client {
    constructor(config: Record<string, unknown>) {
      fakePg.configs.push(config);
    }
    on() {
      return this;
    }
    async connect() {}
    query(text: string) {
      fakePg.queries.push(text);
      if (fakePg.stallOn?.test(text)) {
        return new Promise(() => undefined);
      }
      if (/\bsession_user\b/.test(text) && /\brolsuper\b/.test(text)) {
        return Promise.resolve({
          rows: [
            {
              login_role: READER,
              active_role: READER,
              rolsuper: false,
              rolbypassrls: false,
            },
          ],
        });
      }
      if (/\bpg_has_role\b/.test(text)) return Promise.resolve({ rows: [] });
      if (/^set default_transaction_read_only/.test(text)) {
        return Promise.resolve({ rows: [] });
      }
      return Promise.reject(
        Object.assign(new Error("no target data in this test"), {
          code: "42501",
        }),
      );
    }
    async end() {
      fakePg.ended += 1;
    }
  }
  const api = { Client };
  return { ...api, default: api };
});

/** Obviously fake, built at runtime; never a real credential. */
const PASSWORD = ["reader", "deadline", "2067", "not", "a", "pw"].join("-");
const LOCAL_ENV = {
  SUPABASE_URL: "http://127.0.0.1:54321",
  DOCUMENT_CUTOVER_DATABASE_URL: `postgresql://${READER}:${PASSWORD}@127.0.0.1:54322/postgres`,
};

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

let output: string[] = [];
let scratchDir: string | null = null;

beforeEach(() => {
  fakePg.stallOn = null;
  fakePg.queries = [];
  fakePg.configs = [];
  fakePg.ended = 0;
  output = [];
  const capture = (...args: unknown[]) => {
    output.push(args.map(String).join(" "));
  };
  vi.spyOn(console, "log").mockImplementation(capture);
  vi.spyOn(console, "error").mockImplementation(capture);
});

afterEach(() => {
  vi.restoreAllMocks();
  if (scratchDir) rmSync(scratchDir, { recursive: true, force: true });
  scratchDir = null;
});

async function timed(
  run: Promise<number>,
): Promise<{ exitCode: number; elapsedMs: number }> {
  const started = performance.now();
  const exitCode = await run;
  return { exitCode, elapsedMs: performance.now() - started };
}

/** A clean proof inside a unique subdirectory of the committed proofs dir. */
async function cleanProofOnDisk(): Promise<string> {
  const assessment = await assessDocumentCutoverEnvironment(
    buildAssessmentInput(new DocumentEnvironmentFixture()),
  );
  const proof = await recordDocumentCutoverApproval({
    assessment,
    owner: { ownerId: "owner-blake", ownerRole: "platform_owner" },
    approval: {
      approvalStatement: "Approved for the exact plan digest.",
      decision: "go",
    },
    authorization: { owners: [{ id: "owner-blake", role: "platform_owner" }] },
    store: new InMemoryDocumentCutoverProofStore(),
  });
  const relativeDir = `${DOCUMENT_CUTOVER_PROOFS_DIR}/__unit-2169-deadline-${randomBytes(6).toString("hex")}`;
  scratchDir = path.join(REPO_ROOT, relativeDir);
  mkdirSync(scratchDir, { recursive: true });
  writeFileSync(
    path.join(scratchDir, "clean-proof.json"),
    `${JSON.stringify(proof, null, 2)}\n`,
  );
  return `${relativeDir}/clean-proof.json`;
}

describe("#2067 review r4340210576 — the reader setup and every read are bounded", () => {
  it("the pg client gets a client-side query_timeout past statement_timeout", async () => {
    await runDocumentCutoverCommand({ argv: [], env: LOCAL_ENV });
    const config = fakePg.configs[0] ?? {};
    expect(config.query_timeout).toBe(TEST_DEADLINE_MS + 5_000);
    expect(Number(config.query_timeout)).toBeGreaterThan(
      Number(config.statement_timeout),
    );
  });

  it("assess: a read-only setup query that never replies stops the line at the deadline and closes the reader", async () => {
    fakePg.stallOn = /^set default_transaction_read_only/;
    const run = await timed(
      runDocumentCutoverCommand({ argv: [], env: LOCAL_ENV }),
    );

    expect(run.exitCode).toBe(1);
    expect(run.elapsedMs).toBeLessThan(3_000);
    expect(output.join("\n")).toMatch(
      new RegExp(`timed out after ${TEST_DEADLINE_MS}ms`),
    );
    expect(fakePg.ended).toBe(1);
    expect(
      fakePg.queries.some((query) => query.includes("document_cutover.")),
    ).toBe(false);
  }, 5_000);

  it("--verify: a read-only setup query that never replies is rejected at the deadline and closes the reader", async () => {
    const proofPath = await cleanProofOnDisk();
    fakePg.stallOn = /^set default_transaction_read_only/;
    const run = await timed(
      runDocumentCutoverCommand({
        argv: ["--verify", proofPath],
        env: LOCAL_ENV,
      }),
    );

    expect(run.exitCode).toBe(1);
    expect(run.elapsedMs).toBeLessThan(3_000);
    const text = output.join("\n");
    expect(text).toMatch(new RegExp(`timed out after ${TEST_DEADLINE_MS}ms`));
    expect(text).not.toContain("VALID clean proof");
    expect(fakePg.ended).toBe(1);
  }, 5_000);

  it("assess: a target read that never replies is rejected through the serial reader at the deadline, not the library's 30s", async () => {
    fakePg.stallOn = /document_cutover\.schema_version/;
    const run = await timed(
      runDocumentCutoverCommand({ argv: [], env: LOCAL_ENV }),
    );

    expect(run.exitCode).toBe(1);
    expect(run.elapsedMs).toBeLessThan(3_000);
    const text = output.join("\n");
    expect(text).toMatch(/Target schema version unreadable/);
    expect(text).toMatch(
      new RegExp(
        `a document_cutover read timed out after ${TEST_DEADLINE_MS}ms`,
      ),
    );
    expect(text).toContain("STOP THE LINE");
    expect(fakePg.ended).toBe(1);
  }, 5_000);
});
