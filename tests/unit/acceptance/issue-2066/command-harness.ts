/**
 * Shared harness for the issue #2066 acceptance tests (command layer).
 * Spec (rev 2, Blake-approved 2026-10-20 7:01 PM PT):
 * {@link https://github.com/Asymmetric-al/core/issues/2066#issuecomment-6306182304}
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 *
 * ## Minimal test seam contract (spec §2, "Command-adapter and exit-code tests")
 *
 * The spec allows "exporting `main` or a thin adapter that takes detectors,
 * store, env and argv". These tests accept either of these exports from
 * `scripts/document-cutover/assess-document-cutover.ts`:
 *
 *   export async function runDocumentCutoverCommand(deps): Promise<number>
 *   export async function main(deps): Promise<number>
 *
 * (the adapter name wins when both exist), where `deps` is
 *
 *   {
 *     argv: string[];                               // CLI args only, no node/script prefix
 *     env: Record<string, string | undefined>;      // replaces process.env reads
 *     detectors?: DocumentCutoverDetector[];        // omitted => the real detectors
 *     store?: DocumentCutoverProofStore;            // omitted => the default store
 *   }
 *
 * and the promise resolves to the process exit code. Importing the module must
 * NOT run the command (today it runs `process.exitCode = await main()` on
 * import). To stay tolerant of either seam style, the harness ALSO mirrors
 * `argv` into `process.argv` and `env` into `process.env` for the duration of
 * each run, and captures console output plus raw stdout/stderr writes.
 */

import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { vi } from "vitest";

import {
  InMemoryDocumentCutoverProofStore,
  assessDocumentCutoverEnvironment,
  recordDocumentCutoverApproval,
} from "../../../../packages/api/src/document-cutover";
import { resolveDeploymentEnvironment } from "../../../../packages/env/src/target-env";
import {
  DocumentEnvironmentFixture,
  buildAssessmentInput,
} from "../../packages/api/document-cutover-test-fixture";

import type {
  DocumentCutoverDetector,
  DocumentCutoverEnvironmentIdentity,
  DocumentCutoverEnvironmentProof,
  DocumentCutoverProofStore,
} from "../../../../packages/api/src/document-cutover";

export const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);

export const COMMAND_SCRIPT_PATH = path.join(
  REPO_ROOT,
  "scripts/document-cutover/assess-document-cutover.ts",
);

export interface CommandDeps {
  argv: string[];
  env: Record<string, string | undefined>;
  detectors?: DocumentCutoverDetector[];
  store?: DocumentCutoverProofStore;
}

export type CommandEntry = (deps: CommandDeps) => Promise<number>;

export interface LoadedCommand {
  run: CommandEntry;
  exportName: "runDocumentCutoverCommand" | "main";
  /** True when importing the module executed the command (forbidden). */
  ranOnImport: boolean;
}

export interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  /** Keys of process.env added, removed, or changed by the command itself. */
  envMutations: string[];
}

/**
 * Isolated local target. Loopback Supabase is the only target that classifies
 * as non-production on its own, so no classification override is needed.
 * No production credentials: the only key is an obviously fake value under the
 * restricted read-key name that #2067 introduces; it is never sent anywhere
 * because every test injects detectors or mocks the client.
 */
export const LOCAL_TARGET_URL = "http://127.0.0.1:54321";
export const LOCAL_TARGET_ENV: Record<string, string> = {
  SUPABASE_URL: LOCAL_TARGET_URL,
  NEXT_PUBLIC_SUPABASE_URL: LOCAL_TARGET_URL,
  DOCUMENT_CUTOVER_SUPABASE_READ_KEY: "acceptance-2066-fake-read-key",
  // #2067 addendum 4 replaces the read key with a pg connection as
  // document_cutover_reader. Unroutable loopback port, obviously fake
  // password built at runtime; tests that need a target mock `pg`.
  DOCUMENT_CUTOVER_DATABASE_URL: `postgresql://document_cutover_reader:${[
    "acceptance",
    "2066",
    "not",
    "a",
    "password",
  ].join("-")}@127.0.0.1:9/postgres`,
};

/** Env keys that could steer the command; cleared before every run. */
const CONTROLLED_ENV_PREFIXES = [
  "SUPABASE_",
  "NEXT_PUBLIC_SUPABASE_",
  "VERCEL_",
  "DOCUMENT_CUTOVER_",
];

let cachedCommand: LoadedCommand | undefined;

function captureConsole() {
  const stdout: string[] = [];
  const stderr: string[] = [];
  /**
   * console.log/info calls only: the command reports through console.log.
   * Raw stream writes and warnings can carry runner or dependency noise (e.g.
   * the supabase-js Node version warning printed on import).
   */
  const consoleCalls: string[] = [];
  const format = (args: unknown[]) =>
    args
      .map((arg) =>
        typeof arg === "string"
          ? arg
          : arg instanceof Error
            ? `${arg.message}\n${arg.stack ?? ""}`
            : JSON.stringify(arg),
      )
      .join(" ");
  const spies = [
    vi.spyOn(console, "log").mockImplementation((...args) => {
      stdout.push(format(args));
      consoleCalls.push(format(args));
    }),
    vi.spyOn(console, "info").mockImplementation((...args) => {
      stdout.push(format(args));
      consoleCalls.push(format(args));
    }),
    vi.spyOn(console, "error").mockImplementation((...args) => {
      stderr.push(format(args));
    }),
    vi.spyOn(console, "warn").mockImplementation((...args) => {
      stderr.push(format(args));
    }),
    vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
      stdout.push(String(chunk));
      return true;
    }),
    vi.spyOn(process.stderr, "write").mockImplementation((chunk) => {
      stderr.push(String(chunk));
      return true;
    }),
  ];
  return {
    stdout,
    stderr,
    consoleCalls,
    restore: () => {
      for (const spy of spies) spy.mockRestore();
    },
  };
}

/**
 * Import the operator command and resolve the seam. Throws a descriptive error
 * (the expected red state before implementation) when no seam is exported.
 */
export async function loadCommand(): Promise<LoadedCommand> {
  if (cachedCommand) return cachedCommand;

  const savedExitCode = process.exitCode;
  const savedArgv = process.argv;
  process.exitCode = undefined;
  process.argv = [process.execPath, COMMAND_SCRIPT_PATH];
  const capture = captureConsole();
  let module: Record<string, unknown>;
  let ranOnImport = false;
  try {
    module =
      (await import("../../../../scripts/document-cutover/assess-document-cutover")) as Record<
        string,
        unknown
      >;
  } finally {
    ranOnImport =
      process.exitCode !== undefined || capture.consoleCalls.length > 0;
    capture.restore();
    process.exitCode = savedExitCode;
    process.argv = savedArgv;
  }

  const adapter = module.runDocumentCutoverCommand;
  const main = module.main;
  const entry =
    typeof adapter === "function"
      ? { fn: adapter, name: "runDocumentCutoverCommand" as const }
      : typeof main === "function"
        ? { fn: main, name: "main" as const }
        : undefined;
  if (!entry) {
    throw new Error(
      "#2066 minimal test seam missing: scripts/document-cutover/assess-document-cutover.ts " +
        "must export `runDocumentCutoverCommand(deps)` or `main(deps)` taking " +
        "{ argv, env, detectors?, store? } and resolving to the exit code " +
        "(spec #2066 rev 2 §2). Exports found: " +
        (Object.keys(module).join(", ") || "(none)"),
    );
  }

  cachedCommand = {
    run: entry.fn as CommandEntry,
    exportName: entry.name,
    ranOnImport,
  };
  return cachedCommand;
}

function envSnapshot(): Record<string, string | undefined> {
  return { ...process.env };
}

function diffEnv(
  before: Record<string, string | undefined>,
  after: Record<string, string | undefined>,
): string[] {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  return [...keys].filter((key) => before[key] !== after[key]).sort();
}

/** Run the command through the seam with isolated env/argv and captured output. */
export async function runCommand(deps: CommandDeps): Promise<CommandResult> {
  const command = await loadCommand();

  const savedEnv = envSnapshot();
  const savedArgv = process.argv;
  const savedExitCode = process.exitCode;

  for (const key of Object.keys(process.env)) {
    if (CONTROLLED_ENV_PREFIXES.some((prefix) => key.startsWith(prefix))) {
      delete process.env[key];
    }
  }
  for (const [key, value] of Object.entries(deps.env)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  process.argv = [process.execPath, COMMAND_SCRIPT_PATH, ...deps.argv];

  const envBefore = envSnapshot();
  const capture = captureConsole();
  let exitCode: number;
  let envAfter: Record<string, string | undefined>;
  try {
    exitCode = await command.run({ ...deps, env: { ...deps.env } });
  } finally {
    envAfter = envSnapshot();
    capture.restore();
    for (const key of Object.keys(process.env)) {
      if (!(key in savedEnv)) delete process.env[key];
    }
    Object.assign(process.env, savedEnv);
    process.argv = savedArgv;
    process.exitCode = savedExitCode;
  }

  return {
    exitCode,
    stdout: capture.stdout.join("\n"),
    stderr: capture.stderr.join("\n"),
    envMutations: diffEnv(envBefore, envAfter),
  };
}

/** Latest checked-in migration version, computed the way the command does today. */
export function checkoutSchemaVersion(): string {
  const versions = readdirSync(path.join(REPO_ROOT, "supabase", "migrations"))
    .filter((name) => /^\d{14}_.*\.sql$/.test(name))
    .sort();
  return versions.at(-1)?.slice(0, 14) ?? "unknown";
}

function checkoutCommit(): string {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: REPO_ROOT,
      encoding: "utf8",
    }).trim();
  } catch {
    return "unknown";
  }
}

/**
 * The identity the command resolves server-side for LOCAL_TARGET_ENV
 * (loopback Supabase, no Vercel env): environment label from the shared
 * resolver, project/storage from the loopback host.
 */
export function serverResolvedLocalIdentity(): DocumentCutoverEnvironmentIdentity {
  const host = new URL(LOCAL_TARGET_URL).host;
  return {
    environmentLabel: resolveDeploymentEnvironment({}),
    productionClassification: "non_production",
    databaseProjectId: `local:${host}`,
    storageIdentity: `local:${host}/storage/v1`,
    schemaVersion: checkoutSchemaVersion(),
    codeVersion: checkoutCommit(),
  };
}

/** A different, still non-production target (used for mismatch cases). */
export const OTHER_TARGET_IDENTITY: DocumentCutoverEnvironmentIdentity = {
  environmentLabel: "preview",
  productionClassification: "non_production",
  databaseProjectId: "acceptance2066otherproject",
  storageIdentity: "acceptance2066otherproject/storage/v1",
  schemaVersion: "19990101000000",
  codeVersion: "ffffffffffffffffffffffffffffffffffffffff",
};

export const ACCEPTANCE_OWNER = {
  ownerId: "acceptance-owner",
  ownerRole: "platform_owner",
};

/**
 * Build a genuine clean proof through the library (the command cannot mint
 * one without the approver flag that #2067 removes, which these tests must not
 * use). Uses an in-memory store only.
 */
export async function buildCleanProof(
  environment: DocumentCutoverEnvironmentIdentity,
  options: { now?: Date } = {},
): Promise<DocumentCutoverEnvironmentProof> {
  const now = options.now ? () => options.now as Date : undefined;
  const assessment = await assessDocumentCutoverEnvironment(
    buildAssessmentInput(new DocumentEnvironmentFixture(), {
      resolveEnvironment: async () => environment,
      ...(now ? { now } : {}),
    }),
  );
  return recordDocumentCutoverApproval({
    assessment,
    owner: ACCEPTANCE_OWNER,
    approval: {
      approverId: "acceptance-approver",
      approvalStatement:
        "Acceptance #2066: approved for the exact plan digest.",
      decision: "go",
    },
    attestation: {
      attestedBy: "acceptance-suite",
      attestationContext: "issue-2066",
    },
    authorization: {
      allowedOwnerIds: [ACCEPTANCE_OWNER.ownerId],
      allowedApproverIds: ["acceptance-approver"],
    },
    store: new InMemoryDocumentCutoverProofStore(),
    ...(now ? { now } : {}),
  });
}

export function serializeProof(proof: DocumentCutoverEnvironmentProof): string {
  return JSON.stringify(proof, null, 2);
}

/** Change exactly one byte (inside the owner role value) of a serialized proof. */
export function tamperOneByte(serialized: string): string {
  const marker = `"ownerRole": "`;
  const index = serialized.indexOf(marker);
  if (index < 0) throw new Error("ownerRole not found in serialized proof");
  const at = index + marker.length;
  const original = serialized[at];
  const replacement = original === "a" ? "b" : "a";
  const tampered =
    serialized.slice(0, at) + replacement + serialized.slice(at + 1);
  if (Buffer.byteLength(tampered) !== Buffer.byteLength(serialized)) {
    throw new Error("tamper must keep the byte length");
  }
  return tampered;
}

/** Write a proof file to a fresh temp dir (outside the repo) and return its absolute path. */
const writtenProofFiles = new Set<string>();

/**
 * Write a proof file for `--verify`. #2067 addendum 4 m3 makes `--verify`
 * reject any path outside docs/ops/document-cutover/proofs/, so the file is
 * written there, named after the proof's own `proofPath` when the contents
 * parse (otherwise a unique `acceptance-2066-*.json`). Call
 * `cleanupWrittenProofFiles()` in `afterEach`.
 */
export function writeTempProofFile(contents: string): string {
  const dir = path.join(REPO_ROOT, "docs", "ops", "document-cutover", "proofs");
  mkdirSync(dir, { recursive: true });
  let name = `acceptance-2066-${randomBytes(8).toString("hex")}.json`;
  try {
    const proofPath = (JSON.parse(contents) as { proofPath?: unknown })
      .proofPath;
    if (typeof proofPath === "string" && proofPath.endsWith(".json")) {
      name = path.basename(proofPath);
    }
  } catch {
    // tampered bytes may not parse; keep the unique name
  }
  const file = path.join(dir, name);
  writeFileSync(file, contents, { encoding: "utf8", flag: "wx" });
  writtenProofFiles.add(file);
  return file;
}

export function cleanupWrittenProofFiles(): void {
  for (const file of writtenProofFiles) rmSync(file, { force: true });
  writtenProofFiles.clear();
}

/** Destructive verbs that must never appear as a suggested command (DC4). */
export function destructiveCommandTokens(output: string): string[] {
  const found: string[] = [];
  const pattern = /(^|[\s`$;&|(])(delete|drop|truncate|rm)(?=[\s`;&|)]|$)/gim;
  for (const match of output.matchAll(pattern)) found.push(match[2] ?? "");
  return found;
}

/**
 * Parse the `groupBlockers` format: `  <surfaceKind>:` headings, each followed
 * by `    - <code> [<surfaceId>]: <explanation>` lines.
 */
export function parseGroupedBlockers(output: string): {
  headings: string[];
  groups: Map<string, string[]>;
} {
  const groups = new Map<string, string[]>();
  const headings: string[] = [];
  let current: string | undefined;
  for (const line of output.split("\n")) {
    const heading = /^ {2}([a-z_]+):$/.exec(line);
    if (heading?.[1]) {
      current = heading[1];
      headings.push(current);
      if (!groups.has(current)) groups.set(current, []);
      continue;
    }
    if (current && /^ {4}- /.test(line)) {
      groups.get(current)?.push(line.trim());
      continue;
    }
    if (line.trim() !== "") current = undefined;
  }
  return { headings, groups };
}
