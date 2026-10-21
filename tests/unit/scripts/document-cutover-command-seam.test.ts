/**
 * Issue #2066 minimal test seam for the document-cutover operator command
 * (`runDocumentCutoverCommand(deps)` in
 * scripts/document-cutover/assess-document-cutover.ts).
 *
 * The #2066 acceptance suite covers the gate's exit codes, output, redaction
 * and no-mutation guarantees through this seam. These cases cover the seam
 * itself: env comes from `deps.env` rather than the process, injected
 * detectors never build the real Supabase client, and the script still runs
 * when executed directly.
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { InMemoryDocumentCutoverProofStore } from "../../../packages/api/src/document-cutover";
import { runDocumentCutoverCommand } from "../../../scripts/document-cutover/assess-document-cutover";
import {
  DocumentEnvironmentFixture,
  buildFixtureDetectors,
} from "../packages/api/document-cutover-test-fixture";

const createClientCalls = vi.hoisted(() => ({ count: 0 }));

vi.mock("@supabase/supabase-js", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    createClient: () => {
      createClientCalls.count += 1;
      throw new Error("#2066 seam test: the real Supabase client was built");
    },
  };
});

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const SCRIPT_PATH = path.join(
  REPO_ROOT,
  "scripts/document-cutover/assess-document-cutover.ts",
);

const LOOPBACK_URL = "http://127.0.0.1:54321";
const HOSTED_URL = "https://seam2066hostedproject.supabase.co";

let output: string[];
let savedEnv: NodeJS.ProcessEnv;

beforeEach(() => {
  createClientCalls.count = 0;
  output = [];
  savedEnv = { ...process.env };
  const capture = (...args: unknown[]) => {
    output.push(args.map(String).join(" "));
  };
  vi.spyOn(console, "log").mockImplementation(capture);
  vi.spyOn(console, "error").mockImplementation(capture);
});

afterEach(() => {
  vi.restoreAllMocks();
  for (const key of Object.keys(process.env)) {
    if (!(key in savedEnv)) delete process.env[key];
  }
  Object.assign(process.env, savedEnv);
});

function cleanDetectors() {
  return buildFixtureDetectors(new DocumentEnvironmentFixture());
}

describe("#2066 command seam — env comes from deps, not the process", () => {
  it("resolves the target from deps.env even when process.env names a different, production target", async () => {
    process.env.SUPABASE_URL = HOSTED_URL;
    process.env.VERCEL_ENV = "production";

    const exitCode = await runDocumentCutoverCommand({
      argv: [],
      env: { SUPABASE_URL: LOOPBACK_URL },
      detectors: cleanDetectors(),
      store: new InMemoryDocumentCutoverProofStore(),
    });

    const stdout = output.join("\n");
    expect(exitCode).not.toBe(0);
    expect(stdout).toContain("(non_production) db=local:127.0.0.1:54321");
    expect(stdout).not.toContain("seam2066hostedproject");
  });

  it("stops the line on a production target named only in deps.env", async () => {
    for (const key of Object.keys(process.env)) {
      if (key.startsWith("VERCEL_")) delete process.env[key];
    }

    const exitCode = await runDocumentCutoverCommand({
      argv: [],
      env: { SUPABASE_URL: LOOPBACK_URL, VERCEL_ENV: "production" },
      detectors: cleanDetectors(),
      store: new InMemoryDocumentCutoverProofStore(),
    });

    const stdout = output.join("\n");
    expect(exitCode).not.toBe(0);
    expect(stdout).toContain("(production) db=local:127.0.0.1:54321");
    expect(stdout).toMatch(/STOP THE LINE/);
  });
});

describe("#2066 command seam — injected detectors", () => {
  it("never builds the real Supabase client, even with a database key in deps.env", async () => {
    const exitCode = await runDocumentCutoverCommand({
      argv: [],
      env: {
        SUPABASE_URL: LOOPBACK_URL,
        SUPABASE_SERVICE_ROLE_KEY: "seam-2066-fake-key",
      },
      detectors: cleanDetectors(),
      store: new InMemoryDocumentCutoverProofStore(),
    });

    expect(exitCode).not.toBe(0);
    expect(createClientCalls.count).toBe(0);
    expect(output.join("\n")).toMatch(/^CLEAN\b/m);
  });
});

describe("#2066 command seam — script entry point", () => {
  it("still runs the command when the script is executed directly (--help exits 0)", () => {
    const result = spawnSync("bun", [SCRIPT_PATH, "--help"], {
      cwd: REPO_ROOT,
      encoding: "utf8",
      env: { PATH: process.env.PATH, HOME: process.env.HOME },
    });

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    expect(result.stdout).toContain(
      "See the header of scripts/document-cutover/assess-document-cutover.ts for usage.",
    );
  });
});
