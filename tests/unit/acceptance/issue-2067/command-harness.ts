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
 * ## Assumptions this suite makes where the spec is silent (flagged to Scope)
 *
 * - allowlist.json schema: see `readAllowlist()` for the accepted shapes.
 * - Proof JSON keeps `proofId`, `recordedAt`, `outcome`, `evidence[]` and
 *   `environment.{environmentLabel,databaseProjectId,storageIdentity,schemaVersion}`
 *   and adds `recordedBy`, `proofPath`, `digest`; `digest` is the canonical
 *   SHA-256 (`digestCanonicalValue`) of the proof without the digest field(s)
 *   (see `findDigestRule()`, which self-checks this on a real proof).
 * - Target schema version is read through a `*migrations*` table read, not rpc
 *   (see ./fake-supabase.ts).
 * - Proof ids come from `crypto.randomUUID()` and timestamps from `Date`
 *   (used only to force a filename collision in DC1).
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { vi } from "vitest";

import { fakeDb } from "./fake-supabase";
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
/** The restricted read key (#2067 Resolved decision 5); obviously fake value. */
export const FAKE_READ_KEY = "acceptance-2067-fake-read-key";
export const FAKE_SERVICE_ROLE_KEY = "acceptance-2067-fake-service-role-key";
export const LOCAL_TARGET_ENV: Record<string, string> = {
  SUPABASE_URL: LOCAL_TARGET_URL,
  NEXT_PUBLIC_SUPABASE_URL: LOCAL_TARGET_URL,
  DOCUMENT_CUTOVER_SUPABASE_READ_KEY: FAKE_READ_KEY,
};

export function hostedTargetEnv(projectRef: string): Record<string, string> {
  const url = `https://${projectRef}.supabase.co`;
  return {
    SUPABASE_URL: url,
    NEXT_PUBLIC_SUPABASE_URL: url,
    DOCUMENT_CUTOVER_SUPABASE_READ_KEY: FAKE_READ_KEY,
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

const ID_KEYS = ["id", "ownerId", "login", "github", "identity", "name"];
const ROLE_KEYS = ["role", "ownerRole"];
const PROJECT_KEYS = ["ref", "projectRef", "projectId", "id", "project"];

function pickString(
  value: Record<string, unknown>,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const candidate = value[key];
    if (typeof candidate === "string" && candidate.trim()) return candidate;
  }
  return undefined;
}

/**
 * Read the committed allowlist. The spec pins the path and contents (owner
 * identities with roles, and the non-production project list) but not the
 * schema, so the accepted shapes are:
 * - owners: a top-level array under `owners` (or `ownerIdentities`), whose
 *   entries are objects with an id (`id`/`ownerId`/`login`/`github`/`identity`/
 *   `name`) and a role (`role`/`ownerRole`), or objects with an id and a
 *   `roles` array (each role yields an entry);
 * - non-production projects: a top-level array under any key matching
 *   /non.?production/i, entries being strings or objects with
 *   `ref`/`projectRef`/`projectId`/`id`/`project`.
 */
export function readAllowlist(): ParsedAllowlist {
  if (!existsSync(ALLOWLIST_PATH)) {
    throw new Error(
      `#2067: committed allowlist missing at ${ALLOWLIST_REL} (spec addendum).`,
    );
  }
  const text = readFileSync(ALLOWLIST_PATH, "utf8");
  const json = JSON.parse(text) as Record<string, unknown>;
  const owners: AllowlistOwner[] = [];
  const ownerList = (json.owners ?? json.ownerIdentities) as unknown;
  if (Array.isArray(ownerList)) {
    for (const entry of ownerList) {
      if (!entry || typeof entry !== "object") continue;
      const record = entry as Record<string, unknown>;
      const id = pickString(record, ID_KEYS);
      if (!id) continue;
      const role = pickString(record, ROLE_KEYS);
      if (role) owners.push({ id, role });
      if (Array.isArray(record.roles)) {
        for (const r of record.roles) {
          if (typeof r === "string" && r.trim()) owners.push({ id, role: r });
        }
      }
    }
  }
  const nonProductionProjects: string[] = [];
  for (const [key, value] of Object.entries(json)) {
    if (!/non.?production/i.test(key) || !Array.isArray(value)) continue;
    for (const entry of value) {
      if (typeof entry === "string" && entry.trim()) {
        nonProductionProjects.push(entry);
      } else if (entry && typeof entry === "object") {
        const ref = pickString(entry as Record<string, unknown>, PROJECT_KEYS);
        if (ref) nonProductionProjects.push(ref);
      }
    }
  }
  return { text, json, owners, nonProductionProjects };
}

export function allowlistedOwner(): AllowlistOwner {
  const owner = readAllowlist().owners[0];
  if (!owner) {
    throw new Error(
      `#2067: ${ALLOWLIST_REL} lists no owner identity with a role in an accepted shape (see readAllowlist()).`,
    );
  }
  return owner;
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

/** Track files a test run created so `cleanupProofFiles()` removes only those. */
export function newProofFiles(before: string[]): string[] {
  const known = new Set(before);
  const created = listProofFiles().filter((name) => !known.has(name));
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
// Digest rule (self-checking)
// ---------------------------------------------------------------------------

export interface DigestRule {
  field: string;
  excluded: string[];
}

const DIGEST_FIELDS = ["digest", "proofDigest"];
const OPTIONAL_EXCLUSIONS = [[], ["proofPath"], ["recordedBy", "proofPath"]];

function omit(
  value: Record<string, unknown>,
  keys: string[],
): Record<string, unknown> {
  const copy = { ...value };
  for (const key of keys) delete copy[key];
  return copy;
}

/**
 * Find how the proof's whole-proof digest is computed by reproducing it from a
 * genuine proof: canonical SHA-256 over the proof without the digest field(s)
 * and, optionally, `proofPath` / `recordedBy`. Throws when no rule reproduces it.
 */
export async function findDigestRule(
  proof: Record<string, unknown>,
): Promise<DigestRule> {
  const present = DIGEST_FIELDS.filter((f) => typeof proof[f] === "string");
  for (const field of present) {
    for (const extra of OPTIONAL_EXCLUSIONS) {
      const excluded = [...present, ...extra];
      if (
        (await digestCanonicalValue(omit(proof, excluded))) === proof[field]
      ) {
        return { field, excluded };
      }
    }
  }
  throw new Error(
    "#2067: cannot reproduce the proof digest as canonical SHA-256 of the proof body; Scope must pin the digest rule.",
  );
}

/** Re-seal a modified proof with the same rule so the digest itself is valid. */
export async function reseal(
  modified: Record<string, unknown>,
  rule: DigestRule,
): Promise<Record<string, unknown>> {
  const sealed = { ...modified };
  const digest = await digestCanonicalValue(omit(sealed, rule.excluded));
  for (const field of DIGEST_FIELDS) {
    if (rule.excluded.includes(field)) sealed[field] = digest;
  }
  return sealed;
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
  const before = listProofFiles();
  const result = await runCommand({
    argv: decisionArgs("go", allowlistedOwner()),
    env: LOCAL_TARGET_ENV,
  });
  const created = newProofFiles(before);
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
