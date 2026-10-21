/**
 * Shared harness for the issue #2067 acceptance tests.
 * Spec (rev 2, Blake-approved 2026-10-20 7:01 PM PT):
 * {@link https://github.com/Asymmetric-al/core/issues/2067#issuecomment-6306182453}
 * Addendum (allowlist path, CODEOWNERS wording):
 * {@link https://github.com/Asymmetric-al/core/issues/2067#issuecomment-6306190263}
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 *
 * ## Dependency on #2066
 *
 * The command is driven through the #2066 minimal test seam (see
 * tests/unit/acceptance/issue-2066/command-harness.ts on the #2066 acceptance
 * branch): `scripts/document-cutover/assess-document-cutover.ts` exports
 * `runDocumentCutoverCommand(deps)` or `main(deps)` with
 * `deps = { argv, env, detectors?, store? }`, resolving to the exit code, and
 * importing the module does not run the command. That loader is duplicated here
 * so this suite stands alone on `develop`.
 *
 * ## Rulings pinned by spec addendum 2 (Samson, 2026-10-20 7:40 PM PT)
 *
 * {@link https://github.com/Asymmetric-al/core/issues/2067#issuecomment-6306634165}
 *
 * 1. allowlist.json schema is exactly
 *    `{ "owners": [{ "id", "role" }], "nonProductionProjects": [ ... ] }`
 *    (enforced strictly by `readAllowlist()`); addendum 3 (7:47 PM PT,
 *    https://github.com/Asymmetric-al/core/issues/2067#issuecomment-6306730671)
 *    adds that `nonProductionProjects` entries are unique, non-empty plain
 *    strings.
 * 2. `digest` is the SHA-256 of the canonical JSON of the proof with the
 *    `digest` field left out (`expectedDigest()`); `--verify` recomputes it the
 *    same way and any one-byte change fails.
 * 3. (Superseded by addendum 4.) The target schema version was read from the
 *    migrations table, not through an RPC. Addendum 4 moves it into a
 *    `document_cutover` function called over the reader connection; `rpc`
 *    stays a write spy in ./fake-supabase.ts.
 * 4. A loopback target classifies as `non_production`.
 * 5. Detector names and proof ids from `crypto.randomUUID()` are as these
 *    tests assume. (The "read-only credential/key" blocker wording went with
 *    the read key; see addendum 4 below.)
 *
 * ## Addendum 4 (Blake-approved 2026-10-20 10:31 PM PT)
 *
 * {@link https://github.com/Asymmetric-al/core/issues/2067#issuecomment-6308840307}
 *
 * `DOCUMENT_CUTOVER_SUPABASE_READ_KEY` is replaced by
 * `DOCUMENT_CUTOVER_DATABASE_URL`, a `pg` connection as
 * `document_cutover_reader` that calls only `document_cutover.*` functions
 * (faked in ./fake-postgres.ts; every file that runs the command mocks `pg`
 * with it). `LOCAL_TARGET_ENV` / `hostedTargetEnv()` carry both variables so
 * that tests not about credentials keep one fixture across the switch: the
 * pre-addendum gate reads the key (and now hits the committed-exposure errors
 * Reviewer found), the post-addendum gate must ignore it (criterion 2,
 * asserted in reader-connection.acceptance.test.ts). The target's identity
 * (loopback vs hosted project ref) is still taken from `SUPABASE_URL`, and the
 * database URL points at the same target.
 *
 * Addendum 3 item 2: proof field names other than `digest`, `recordedBy` and
 * `proofPath` are not pinned by the spec; these tests are the contract. Proof
 * JSON keeps `proofId`,
 * `recordedAt`, `outcome`, `evidence[]` and
 * `environment.{environmentLabel,databaseProjectId,storageIdentity,schemaVersion}`;
 * timestamps come from `Date` (used only to force a filename collision in DC1).
 */

import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { vi } from "vitest";

import { READER_ROLE, fakePg } from "./fake-postgres";
import {
  FAKE_SERVICE_ROLE_KEY as SERVICE_ROLE_KEY,
  fakeDb,
} from "./fake-supabase";
import { digestCanonicalValue } from "../../../../packages/api/src/document-cutover";

import type {
  DocumentCutoverDetector,
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

/** Spec rev 2 §2 / Resolved decision 1. */
export const PROOFS_DIR_REL = "docs/ops/document-cutover/proofs";
export const PROOFS_DIR = path.join(REPO_ROOT, PROOFS_DIR_REL);
/** Addendum (Samson, 2026-10-20 7:03 PM PT). */
export const ALLOWLIST_REL = "docs/ops/document-cutover/allowlist.json";
export const ALLOWLIST_PATH = path.join(REPO_ROOT, ALLOWLIST_REL);

/** Seeded demo tenant from supabase/seed.sql ("GiveHope Demo Organization"). */
export const SEEDED_DEMO_TENANT_ID = "00000000-0000-0000-0000-000000000001";

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
  ranOnImport: boolean;
}

export interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  envMutations: string[];
}

export const LOCAL_TARGET_URL = "http://127.0.0.1:54321";
/** The replaced read key (rev 2 Resolved decision 5); obviously fake value. */
export const FAKE_READ_KEY = ["acceptance", "2067", "fake", "read", "key"].join(
  "-",
);
export const FAKE_SERVICE_ROLE_KEY = SERVICE_ROLE_KEY;
export { READER_ROLE };

/** Obviously fake, built at runtime; never a real credential. */
const FAKE_DB_PASSWORD = ["acceptance", "2067", "not", "a", "password"].join(
  "-",
);

/**
 * A `DOCUMENT_CUTOVER_DATABASE_URL` for the fake target. `user` defaults to
 * the reader role; `projectRef` adds the Supabase pooler suffix
 * (`<role>.<ref>` on the pooler host).
 */
export function fakeDatabaseUrl(
  user: string = READER_ROLE,
  projectRef?: string,
): string {
  const login = projectRef ? `${user}.${projectRef}` : user;
  const host = projectRef
    ? "aws-0-us-east-1.pooler.supabase.com:6543"
    : "127.0.0.1:54322";
  return `postgresql://${login}:${FAKE_DB_PASSWORD}@${host}/postgres`;
}

/** A direct-connection URL (`db.<ref>.supabase.co`) for the fake target. */
export function fakeDirectDatabaseUrl(
  projectRef: string,
  user: string = READER_ROLE,
): string {
  return `postgresql://${user}:${FAKE_DB_PASSWORD}@db.${projectRef}.supabase.co:5432/postgres`;
}

/** A pooler URL whose user carries no `.<ref>` suffix (ref unparseable). */
export function fakePoolerUrlWithoutRef(user: string = READER_ROLE): string {
  return `postgresql://${user}:${FAKE_DB_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;
}

export const LOCAL_TARGET_ENV: Record<string, string> = {
  SUPABASE_URL: LOCAL_TARGET_URL,
  NEXT_PUBLIC_SUPABASE_URL: LOCAL_TARGET_URL,
  DOCUMENT_CUTOVER_SUPABASE_READ_KEY: FAKE_READ_KEY,
  DOCUMENT_CUTOVER_DATABASE_URL: fakeDatabaseUrl(),
};

export function hostedTargetEnv(projectRef: string): Record<string, string> {
  const url = `https://${projectRef}.supabase.co`;
  return {
    SUPABASE_URL: url,
    NEXT_PUBLIC_SUPABASE_URL: url,
    DOCUMENT_CUTOVER_SUPABASE_READ_KEY: FAKE_READ_KEY,
    DOCUMENT_CUTOVER_DATABASE_URL: fakeDatabaseUrl(READER_ROLE, projectRef),
  };
}

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
      "#2066 minimal test seam missing (dependency of #2067): scripts/document-cutover/assess-document-cutover.ts " +
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

/** Latest checked-in migration version (the "checkout migration version"). */
export function checkoutSchemaVersion(): string {
  const versions = readdirSync(path.join(REPO_ROOT, "supabase", "migrations"))
    .filter((name) => /^\d{14}_.*\.sql$/.test(name))
    .sort();
  return versions.at(-1)?.slice(0, 14) ?? "unknown";
}

// ---------------------------------------------------------------------------
// allowlist.json
// ---------------------------------------------------------------------------

export interface AllowlistOwner {
  id: string;
  role: string;
}

export interface ParsedAllowlist {
  text: string;
  json: unknown;
  owners: AllowlistOwner[];
  nonProductionProjects: string[];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function sortedKeys(value: Record<string, unknown>): string[] {
  return Object.keys(value).sort();
}

function schemaError(detail: string): Error {
  return new Error(
    `#2067: ${ALLOWLIST_REL} does not match the addendum-2 schema ` +
      '{ "owners": [{ "id", "role" }], "nonProductionProjects": [ ... ] }: ' +
      detail,
  );
}

/**
 * Read an allowlist file (default: the committed one) and enforce the exact
 * schema from spec addendum 2 item 1 and addendum 3 item 1: the top level has
 * exactly the keys `owners` and `nonProductionProjects`; every owner is an
 * object with exactly the keys `id` and `role`, both non-empty strings;
 * `nonProductionProjects` holds unique, non-empty plain strings (project
 * refs), so objects, empty strings and duplicates are rejected. Any other
 * shape throws.
 */
export function readAllowlist(
  filePath: string = ALLOWLIST_PATH,
): ParsedAllowlist {
  if (!existsSync(filePath)) {
    throw new Error(
      `#2067: committed allowlist missing at ${ALLOWLIST_REL} (spec addendum).`,
    );
  }
  return parseAllowlistText(readFileSync(filePath, "utf8"));
}

/** Strict parse of allowlist JSON text (see `readAllowlist()`). */
export function parseAllowlistText(text: string): ParsedAllowlist {
  const json: unknown = JSON.parse(text);
  if (!isPlainObject(json)) throw schemaError("top level is not an object");
  const topKeys = sortedKeys(json);
  if (topKeys.join(",") !== "nonProductionProjects,owners") {
    throw schemaError(`top-level keys are [${topKeys.join(", ")}]`);
  }
  if (!Array.isArray(json.owners)) throw schemaError("owners is not an array");
  if (!Array.isArray(json.nonProductionProjects)) {
    throw schemaError("nonProductionProjects is not an array");
  }

  const owners: AllowlistOwner[] = json.owners.map(
    (entry: unknown, index: number) => {
      if (!isPlainObject(entry)) {
        throw schemaError(`owners[${index}] is not an object`);
      }
      const keys = sortedKeys(entry);
      if (keys.join(",") !== "id,role") {
        throw schemaError(`owners[${index}] keys are [${keys.join(", ")}]`);
      }
      const { id, role } = entry;
      if (typeof id !== "string" || !id.trim()) {
        throw schemaError(`owners[${index}].id is not a non-empty string`);
      }
      if (typeof role !== "string" || !role.trim()) {
        throw schemaError(`owners[${index}].role is not a non-empty string`);
      }
      return { id, role };
    },
  );

  const seen = new Set<string>();
  const nonProductionProjects: string[] = json.nonProductionProjects.map(
    (entry: unknown, index: number) => {
      if (typeof entry !== "string" || !entry.trim()) {
        throw schemaError(
          `nonProductionProjects[${index}] is not a non-empty string`,
        );
      }
      if (seen.has(entry)) {
        throw schemaError(
          `nonProductionProjects[${index}] duplicates "${entry}"`,
        );
      }
      seen.add(entry);
      return entry;
    },
  );

  return { text, json, owners, nonProductionProjects };
}

export function allowlistedOwner(): AllowlistOwner {
  const owner = readAllowlist().owners[0];
  if (!owner) {
    throw new Error(
      `#2067: ${ALLOWLIST_REL} lists no owner (owners is empty).`,
    );
  }
  return owner;
}

/**
 * `authorization` for direct `recordDocumentCutoverApproval` calls. Addendum 4
 * m2 moves the role check into the library; Samson's ruling 5 (2026-10-20
 * 11:03 PM PT) pins the shape to the allowlist's own `owners: [{ id, role }]`.
 * See ./owner-role-library.acceptance.test.ts.
 */
export function authorizationFor(owners: AllowlistOwner[]) {
  return {
    owners: owners.map((owner) => ({ id: owner.id, role: owner.role })),
  };
}

export function decisionArgs(
  decision: "go" | "no_go",
  owner: AllowlistOwner,
  statement = "Acceptance #2067 decision statement.",
): string[] {
  return [
    "--decision",
    decision,
    "--owner",
    owner.id,
    "--owner-role",
    owner.role,
    "--statement",
    statement,
  ];
}

// ---------------------------------------------------------------------------
// Proof files under docs/ops/document-cutover/proofs/
// ---------------------------------------------------------------------------

/** `<ISO>-<proofId>.json`; ISO may use `:` or `-` as the time separator. */
export const PROOF_FILE_NAME =
  /^(\d{4}-\d{2}-\d{2}T\d{2}[:-]?\d{2}[:-]?\d{2}(?:[.,]\d+)?Z)-(.+)\.json$/;

const createdProofFiles = new Set<string>();

export function listProofFiles(): string[] {
  if (!existsSync(PROOFS_DIR)) return [];
  return readdirSync(PROOFS_DIR)
    .filter((name) => name.endsWith(".json"))
    .sort();
}

/**
 * A per-test marker carried in `--statement`, so a test can tell its own proof
 * files from those of another suite writing to the same directory in parallel
 * (proof-output and verify both use the default proofs directory). Uses
 * node:crypto randomBytes, not `crypto.randomUUID`, which DC1 stubs.
 */
export function proofRunMarker(): string {
  return `acceptance-2067-run-${randomBytes(8).toString("hex")}`;
}

/** Statement text for a run tagged with `marker`. */
export function markedStatement(marker: string): string {
  return `Acceptance #2067 decision statement (${marker}).`;
}

/**
 * Proof files created since `before` that belong to the run(s) tagged with
 * `marker`: new names whose contents contain the marker. Files another suite
 * creates (or deletes) concurrently are ignored. Only matched files are
 * tracked, so `cleanupProofFiles()` never removes another suite's proof.
 */
export function newProofFiles(before: string[], marker: string): string[] {
  const known = new Set(before);
  const created = listProofFiles().filter((name) => {
    if (known.has(name)) return false;
    try {
      return readFileSync(path.join(PROOFS_DIR, name), "utf8").includes(marker);
    } catch {
      return false;
    }
  });
  for (const name of created) createdProofFiles.add(name);
  return created;
}

export function cleanupProofFiles(): void {
  for (const name of createdProofFiles) {
    rmSync(path.join(PROOFS_DIR, name), { force: true });
  }
  createdProofFiles.clear();
}

export function readProofFile(name: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path.join(PROOFS_DIR, name), "utf8"));
}

export function collectKeys(
  value: unknown,
  keys = new Set<string>(),
): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) collectKeys(item, keys);
  } else if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      keys.add(key);
      collectKeys(child, keys);
    }
  }
  return keys;
}

// ---------------------------------------------------------------------------
// Digest rule (spec addendum 2 item 2)
// ---------------------------------------------------------------------------

/**
 * The digest a proof must carry: SHA-256 of the canonical JSON of the proof
 * with the `digest` field left out (every other field, including `recordedBy`
 * and `proofPath`, is covered).
 */
export async function expectedDigest(
  proof: Record<string, unknown>,
): Promise<string> {
  const body = { ...proof };
  delete body.digest;
  return digestCanonicalValue(body);
}

/** Re-seal a modified proof with the addendum rule so its digest is valid. */
export async function reseal(
  modified: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  return { ...modified, digest: await expectedDigest(modified) };
}

// ---------------------------------------------------------------------------
// Output helpers
// ---------------------------------------------------------------------------

export function proposedOutcome(stdout: string): string | undefined {
  return /Proposed outcome:\s*(\S+)/.exec(stdout)?.[1];
}

export function git(args: string[]): string {
  return execFileSync("git", args, { cwd: REPO_ROOT, encoding: "utf8" });
}

// ---------------------------------------------------------------------------
// CODEOWNERS (GitHub semantics: first of .github/, root, docs/; last match wins)
// ---------------------------------------------------------------------------

export interface CodeownersRule {
  pattern: string;
  owners: string[];
}

export function parseCodeowners(text: string): CodeownersRule[] {
  const rules: CodeownersRule[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.replace(/(^|\s)#.*$/, "").trim();
    if (!line) continue;
    const [pattern, ...owners] = line.split(/\s+/);
    if (pattern) rules.push({ pattern, owners });
  }
  return rules;
}

function globToRegExp(glob: string): string {
  let out = "";
  for (let i = 0; i < glob.length; i += 1) {
    const char = glob[i] ?? "";
    if (char === "*") {
      if (glob[i + 1] === "*") {
        out += ".*";
        i += 1;
      } else {
        out += "[^/]*";
      }
    } else if (char === "?") {
      out += "[^/]";
    } else {
      out += char.replace(/[.+^${}()|[\]\\]/g, "\\$&");
    }
  }
  return out;
}

export function codeownersPatternMatches(
  pattern: string,
  filePath: string,
): boolean {
  let p = pattern;
  const anchored = p.startsWith("/") || p.slice(0, -1).includes("/");
  if (p.startsWith("/")) p = p.slice(1);
  const dirOnly = p.endsWith("/");
  if (dirOnly) p = p.slice(0, -1);
  const body = globToRegExp(p);
  const prefix = anchored ? "^" : "^(?:.*/)?";
  const suffix = "(?:/.*)?$";
  return new RegExp(`${prefix}${body}${suffix}`).test(filePath);
}

export function effectiveOwners(
  rules: CodeownersRule[],
  filePath: string,
): string[] | undefined {
  let owners: string[] | undefined;
  for (const rule of rules) {
    if (codeownersPatternMatches(rule.pattern, filePath)) owners = rule.owners;
  }
  return owners;
}

// ---------------------------------------------------------------------------
// Clean target + minting a real proof through the command
// ---------------------------------------------------------------------------

/** Fake target with no reliance anywhere and a DB schema version equal to the checkout's. */
export function cleanTarget(): void {
  fakeDb.reset();
  fakePg.reset();
  fakeDb.schemaVersion = checkoutSchemaVersion();
}

export interface MintedProof {
  name: string;
  relPath: string;
  absPath: string;
  bytes: Buffer;
  proof: Record<string, unknown>;
  result: CommandResult;
}

/**
 * Record a clean proof through the real command (real detectors on a clean
 * fake target, allowlisted owner, `--decision go`, default proof store).
 * Throws with the command output when that does not yield exit 0 plus exactly
 * one new proof file. Callers must call `cleanupProofFiles()` afterwards.
 */
export async function mintCleanProof(): Promise<MintedProof> {
  cleanTarget();
  const marker = proofRunMarker();
  const before = listProofFiles();
  const result = await runCommand({
    argv: decisionArgs("go", allowlistedOwner(), markedStatement(marker)),
    env: LOCAL_TARGET_ENV,
  });
  const created = newProofFiles(before, marker);
  const name = created[0];
  if (result.exitCode !== 0 || created.length !== 1 || !name) {
    throw new Error(
      `#2067: could not record a clean proof through the command (exit ${result.exitCode}, new files ${created.length}).\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
    );
  }
  const absPath = path.join(PROOFS_DIR, name);
  return {
    name,
    relPath: `${PROOFS_DIR_REL}/${name}`,
    absPath,
    bytes: readFileSync(absPath),
    proof: readProofFile(name),
    result,
  };
}
