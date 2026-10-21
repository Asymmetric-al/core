#!/usr/bin/env bun
/**
 * Phase 18 D17 operator command: pre-production document-cutover assessment.
 *
 * Read-only. Resolves the actual target environment on the server side of the
 * connection, inventories every prototype document surface named by the Phase
 * 18 destructive plan, and either records a `clean_preproduction_proof` (only
 * after an allowlisted owner's go decision on fully clean evidence) or stops
 * the line with grouped, redacted blockers.
 *
 * Proofs (#2067): each run that records a decision writes a new file at
 * docs/ops/document-cutover/proofs/<ISO>-<proofId>.json and never overwrites an
 * existing one. The file is committed through a PR, and the owner's approving
 * review of that PR is the go/no-go approval of record. The proof itself only
 * carries non-authorizing provenance (`recordedBy`, `proofPath`, `digest`).
 *
 * Target reads (#2067 addendum 4): the gate connects with `pg` as
 * `document_cutover_reader` and calls only the counts-only SECURITY DEFINER
 * functions in the private `document_cutover` schema
 * (supabase/migrations/20261021064500_document_cutover_reader.sql). It makes no
 * PostgREST call, no auth.admin call and no direct table or Storage read. The
 * connection fails closed unless it really is that unprivileged role.
 *
 * Exit codes: 0 only for a cryptographically verified clean proof (and for
 * --help); 1 for every stopped, incomplete, or invalid state.
 *
 * Usage:
 *   bun scripts/document-cutover/assess-document-cutover.ts [options]
 *
 * Options:
 *   --decision <go|no_go>     Record a proof with the given owner decision.
 *                             Omit to run assess-only (no proof recorded).
 *   --owner <id>              Accountable owner id (required with --decision);
 *                             must be listed in the committed allowlist.
 *   --owner-role <role>       Accountable owner role (required with --decision);
 *                             must match the allowlisted owner's role.
 *   --statement <text>        Decision statement (required with --decision).
 *   --expect-project <ref>    Operator-declared database/project identity
 *                             (mismatch check only).
 *   --expect-env <label>      Operator-declared environment label (mismatch
 *                             check only).
 *   --out <dir>               Proof output directory; must be
 *                             docs/ops/document-cutover/proofs (the default) or
 *                             a directory inside it.
 *   --verify <proof.json>     Verify a proof file inside
 *                             docs/ops/document-cutover/proofs/ against the
 *                             current target and exit (digest, legacy
 *                             attestation, 24h freshness from recordedAt,
 *                             environment).
 *
 * Owner and non-production project allowlist:
 *   docs/ops/document-cutover/allowlist.json, changed only through a PR
 *   (CODEOWNERS). A hosted Supabase project classifies as non-production only
 *   when its ref is listed there; a loopback target is non-production.
 *
 * Environment:
 *   SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL   Target identity (loopback or
 *                             <ref>.supabase.co).
 *   DOCUMENT_CUTOVER_DATABASE_URL             Required. postgres:// URL for
 *                             document_cutover_reader: the Supabase session-mode
 *                             pooler (port 5432, user
 *                             document_cutover_reader.<ref>), or a direct
 *                             db.<ref>.supabase.co host. It must name the
 *                             host, port, database, user and password, and its
 *                             only query parameter may be sslmode. A
 *                             non-loopback host needs sslmode=require,
 *                             verify-ca or verify-full (TLS with certificate
 *                             verification, always); IPv6 and multi-host URLs
 *                             are refused. Its project ref must match
 *                             SUPABASE_URL's. PG* variables, DATABASE_URL and
 *                             SUPABASE_SERVICE_ROLE_KEY are never used.
 *   NODE_EXTRA_CA_CERTS                       Deploy prerequisite for a
 *                             Supabase target: the path to Supabase's root CA
 *                             file (prod-ca-2021.crt, CN "Supabase Root 2021
 *                             CA", from Database Settings > SSL Configuration).
 *                             Node does not trust that CA by default, so
 *                             without it the TLS handshake fails and the gate
 *                             stops; it never retries without verification.
 */

import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
} from "node:fs";
import { writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import pg from "pg";

import {
  isProductionDeployment,
  isProtectedNonProductionDeployment,
  resolveDeploymentEnvironment,
} from "../../packages/env/src/target-env";
import {
  DOCUMENT_CUTOVER_ALLOWLIST_PATH,
  DOCUMENT_CUTOVER_DETECTOR_TIMEOUT_MS,
  DOCUMENT_CUTOVER_FUNCTIONS,
  DOCUMENT_CUTOVER_READER_ROLE as READER_ROLE,
  DOCUMENT_CUTOVER_PROOFS_DIR,
  PHASE_18_DESTRUCTIVE_CUTOVER_PLAN,
  PHASE_18_INTEGRATION_SURFACES,
  PHASE_18_REPORT_SURFACES,
  PHASE_18_USER_SURFACES,
  assessDocumentCutoverEnvironment,
  recordDocumentCutoverApproval,
  redactDiagnosticText,
  verifyDocumentCutoverEnvironmentProof,
} from "../../packages/api/src/document-cutover";

import type {
  DocumentCutoverAssessment,
  DocumentCutoverBlockingCode,
  DocumentCutoverBlockingReason,
  DocumentCutoverDetector,
  DocumentCutoverEnvironmentIdentity,
  DocumentCutoverEnvironmentProof,
  DocumentCutoverFunctionName,
  DocumentCutoverProofStore,
  DocumentCutoverSurfaceInspection,
  DocumentCutoverSurfaceKind,
  DocumentCutoverTargetIdentity,
} from "../../packages/api/src/document-cutover";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

const RESET_PROCEDURE = {
  reference: "docs/ops/document-cutover/reset-rebuild.md",
  pinnedVersion: "1",
  // Trusted digest of the committed procedure document at this pin. Editing
  // the markdown while leaving Procedure version: 1 must stop the line.
  expectedDigest:
    "9a3187dc574be5a004103c479dc04d0e80fb83994a98762f1611115a440bcc53",
};
const ROLLBACK_PROCEDURE = {
  reference:
    "docs/ops/document-cutover/rollback-before-first-canonical-write.md",
  pinnedVersion: "1",
  expectedDigest:
    "f33970631c86629179d4a188bfa560574a01b7322af15e5c1d513d0cdb933042",
};

/** Flags removed by #2067; passing one is rejected rather than ignored. */
const REMOVED_FLAGS: Record<string, string> = {
  "--approver":
    "approval comes only from the owner's PR review of the committed proof",
  "--allow-non-production-project":
    "non-production projects come only from the committed allowlist",
};

const DATABASE_URL_MISSING_BLOCKER =
  "STOP THE LINE — DOCUMENT_CUTOVER_DATABASE_URL is not set. The gate reads the target only as document_cutover_reader over that connection string; SUPABASE_SERVICE_ROLE_KEY, the old DOCUMENT_CUTOVER_SUPABASE_READ_KEY, DATABASE_URL and PG* variables are never used.";

/** Recorded when the target database's schema version cannot be read. */
const UNREADABLE_SCHEMA_VERSION = "unreadable";

/** Absolute directory every proof is written to and verified from. */
const PROOFS_ROOT = path.join(repoRoot, DOCUMENT_CUTOVER_PROOFS_DIR);

type CommandEnv = Record<string, string | undefined>;

/**
 * Minimal test seam (#2066): everything the command would otherwise read from
 * the process. Omitted detectors/store fall back to the real Supabase and
 * repo-inventory detectors and the committed proof file writer.
 */
export type DocumentCutoverCommandDeps = {
  /** CLI arguments only, without the runtime/script prefix. */
  argv: string[];
  env: CommandEnv;
  detectors?: DocumentCutoverDetector[];
  store?: DocumentCutoverProofStore;
};

type CliArgs = {
  decision?: "go" | "no_go";
  owner?: string;
  ownerRole?: string;
  statement?: string;
  expectProject?: string;
  expectEnv?: string;
  out: string;
  verify?: string;
  help?: boolean;
  removedFlags: string[];
};

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { out: DOCUMENT_CUTOVER_PROOFS_DIR, removedFlags: [] };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = () => argv[(index += 1)];

    if (arg === "--decision") {
      const value = next();
      if (value !== "go" && value !== "no_go") {
        throw new Error(`--decision must be go or no_go, got ${value}`);
      }
      args.decision = value;
    } else if (arg === "--owner") args.owner = next();
    else if (arg === "--owner-role") args.ownerRole = next();
    else if (arg === "--statement") args.statement = next();
    else if (arg === "--expect-project") args.expectProject = next();
    else if (arg === "--expect-env") args.expectEnv = next();
    else if (arg === "--out") args.out = next() ?? args.out;
    else if (arg === "--verify") args.verify = next();
    else if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg && Object.hasOwn(REMOVED_FLAGS, arg)) {
      args.removedFlags.push(arg);
      next();
    }
  }

  return args;
}

function gitCommit(): string {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: repoRoot,
      encoding: "utf8",
    }).trim();
  } catch {
    return "unknown";
  }
}

/** Latest migration in this checkout; the target DB must report the same. */
function latestMigrationVersion(): string {
  try {
    const versions = readdirSync(path.join(repoRoot, "supabase", "migrations"))
      .filter((name) => /^\d{14}_.*\.sql$/.test(name))
      .sort();
    return versions.at(-1)?.slice(0, 14) ?? "unknown";
  } catch {
    return "unknown";
  }
}

function operatorIdentity(): string {
  let user = "unknown-operator";
  try {
    user = os.userInfo().username || user;
  } catch {
    // Some containers have no passwd entry; provenance stays non-authorizing.
  }
  return `${user} via cutover:assess:documents`;
}

// ---------------------------------------------------------------------------
// Committed allowlist (docs/ops/document-cutover/allowlist.json)
// ---------------------------------------------------------------------------

type AllowlistOwner = { id: string; role: string };
type DocumentCutoverAllowlist = {
  owners: AllowlistOwner[];
  nonProductionProjects: string[];
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, keys: string[]) {
  return Object.keys(value).sort().join(",") === [...keys].sort().join(",");
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

/**
 * Strict schema: `{ "owners": [{ "id", "role" }], "nonProductionProjects": [] }`
 * with no other keys, non-empty owner strings, and unique non-empty project
 * ref strings. Any other shape throws, so the gate fails closed.
 */
export function parseDocumentCutoverAllowlist(
  text: string,
): DocumentCutoverAllowlist {
  const json: unknown = JSON.parse(text);
  if (
    !isPlainObject(json) ||
    !hasExactKeys(json, ["owners", "nonProductionProjects"])
  ) {
    throw new Error(
      'the top level must have exactly the keys "owners" and "nonProductionProjects"',
    );
  }
  const { owners, nonProductionProjects } = json;
  if (!Array.isArray(owners) || !Array.isArray(nonProductionProjects)) {
    throw new Error('"owners" and "nonProductionProjects" must be arrays');
  }

  const parsedOwners = owners.map((owner: unknown, index) => {
    if (
      !isPlainObject(owner) ||
      !hasExactKeys(owner, ["id", "role"]) ||
      !isNonEmptyString(owner.id) ||
      !isNonEmptyString(owner.role)
    ) {
      throw new Error(
        `owners[${index}] must be { "id", "role" } with non-empty strings`,
      );
    }
    return { id: owner.id, role: owner.role };
  });

  const seen = new Set<string>();
  const parsedProjects = nonProductionProjects.map((ref: unknown, index) => {
    if (!isNonEmptyString(ref)) {
      throw new Error(
        `nonProductionProjects[${index}] must be a non-empty project ref string`,
      );
    }
    if (seen.has(ref)) {
      throw new Error(`nonProductionProjects[${index}] duplicates "${ref}"`);
    }
    seen.add(ref);
    return ref;
  });

  return { owners: parsedOwners, nonProductionProjects: parsedProjects };
}

/** Read on every run (never cached), so the committed file is the source. */
function loadAllowlist(): DocumentCutoverAllowlist {
  const absolute = path.join(repoRoot, DOCUMENT_CUTOVER_ALLOWLIST_PATH);
  try {
    return parseDocumentCutoverAllowlist(readFileSync(absolute, "utf8"));
  } catch (error) {
    throw new Error(
      `${DOCUMENT_CUTOVER_ALLOWLIST_PATH} is missing or invalid: ${error instanceof Error ? error.message : error}`,
      { cause: error },
    );
  }
}

// ---------------------------------------------------------------------------
// Target identity
// ---------------------------------------------------------------------------

function supabaseIdentity(url: string | undefined): {
  kind: "hosted" | "local" | "unknown";
  id: string;
} {
  if (!url) return { kind: "unknown", id: "unknown" };
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    if (
      host === "127.0.0.1" ||
      host === "localhost" ||
      host === "::1" ||
      host === "[::1]"
    ) {
      return { kind: "local", id: `local:${parsed.host}` };
    }
    const [ref, ...rest] = host.split(".");
    if (rest.join(".") === "supabase.co" && ref) {
      return { kind: "hosted", id: ref };
    }
    return { kind: "hosted", id: host };
  } catch {
    return { kind: "unknown", id: "unknown" };
  }
}

function targetUrl(env: CommandEnv): string | undefined {
  return env.SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL;
}

/** The fields `--verify` compares, resolved from the command env and target DB. */
function targetIdentity(
  env: CommandEnv,
  schemaVersion: string,
): DocumentCutoverTargetIdentity {
  const database = supabaseIdentity(targetUrl(env));
  return {
    environmentLabel: resolveDeploymentEnvironment({
      VERCEL_ENV: env.VERCEL_ENV,
      VERCEL_TARGET_ENV: env.VERCEL_TARGET_ENV,
    }),
    databaseProjectId: database.id,
    storageIdentity:
      database.id === "unknown" ? "unknown" : `${database.id}/storage/v1`,
    schemaVersion,
  };
}

/**
 * Classification never trusts the operator's runtime shell for a hosted
 * target: a remote Supabase project is `unknown` (stop-the-line) unless its
 * exact ref is listed in the committed allowlist. Loopback databases classify
 * as non-production on their own.
 */
function resolveEnvironment(
  env: CommandEnv,
  nonProductionProjects: readonly string[],
  schemaVersion: string,
): DocumentCutoverEnvironmentIdentity {
  const deployment = {
    VERCEL_ENV: env.VERCEL_ENV,
    VERCEL_TARGET_ENV: env.VERCEL_TARGET_ENV,
  };
  const database = supabaseIdentity(targetUrl(env));

  let productionClassification: DocumentCutoverEnvironmentIdentity["productionClassification"];
  if (isProductionDeployment(deployment)) {
    productionClassification = "production";
  } else if (isProtectedNonProductionDeployment(deployment)) {
    productionClassification = "protected_non_production";
  } else if (database.kind === "local") {
    productionClassification = "non_production";
  } else if (
    database.kind === "hosted" &&
    nonProductionProjects.includes(database.id)
  ) {
    productionClassification = "non_production";
  } else {
    productionClassification = "unknown";
  }

  return {
    ...targetIdentity(env, schemaVersion),
    productionClassification,
    codeVersion: gitCommit(),
    deploymentVersion: env.VERCEL_DEPLOYMENT_ID,
  };
}

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Reader connection (document_cutover_reader over DOCUMENT_CUTOVER_DATABASE_URL)
// ---------------------------------------------------------------------------

type PgClient = InstanceType<typeof pg.Client>;

/** The reader session: one connection, one query at a time. */
interface ReaderClient {
  query(
    text: string,
    values?: readonly unknown[],
  ): Promise<{ rows: unknown[] }>;
  end(): Promise<void>;
}
type ContractFunction = (typeof DOCUMENT_CUTOVER_FUNCTIONS)[number];
type ContractFunctionName = DocumentCutoverFunctionName;

const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "::1", "[::1]"]);

/** Roles the reader must not be, or be a member of (directly or inherited). */
const PRIVILEGED_ROLES = [
  "postgres",
  "service_role",
  "authenticator",
  "authenticated",
  "dashboard_user",
  "pg_read_all_data",
  "pg_write_all_data",
  "supabase_admin",
  "supabase_auth_admin",
  "supabase_storage_admin",
  "supabase_functions_admin",
  "supabase_realtime_admin",
  "supabase_replication_admin",
  "anon",
  "pg_execute_server_program",
  "pg_read_server_files",
  "pg_write_server_files",
  "pg_monitor",
  "pg_signal_backend",
  "pg_checkpoint",
  "pg_create_subscription",
];

/** sslmode values accepted for a non-loopback host: TLS with verification. */
const VERIFIED_SSLMODES = new Set(["require", "verify-ca", "verify-full"]);

/** The only query parameter the reader URL may carry (loopback values). */
const ALLOWED_SSLMODES = new Set([
  "disable",
  "prefer",
  "require",
  "verify-ca",
  "verify-full",
  "no-verify",
]);

/** A DNS hostname, IPv4 address or bracketed IPv6 address (never a socket path). */
const NETWORK_HOST =
  /^(?:\[[0-9a-f:.]+\]|[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*)$/i;

const GATE_APPLICATION_NAME = "document-cutover-gate";

/** TLS settings handed to pg: off (loopback only) or certificate-verified. */
type PgTlsConfig = false | { rejectUnauthorized: boolean };

/**
 * The exact object handed to `new pg.Client`. The connection string carries
 * no query, so pg's own sslmode parsing can't replace `ssl`.
 */
export type PgClientConfig = {
  connectionString: string;
  application_name: string;
  connectionTimeoutMillis: number;
  statement_timeout: number;
  ssl: PgTlsConfig;
};

/** Node's codes for a server certificate whose chain it does not trust. */
const UNTRUSTED_CERTIFICATE_CODES = new Set([
  "SELF_SIGNED_CERT_IN_CHAIN",
  "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
  "UNABLE_TO_GET_ISSUER_CERT_LOCALLY",
]);

/** The Supabase root CA the session pooler's certificate chains to. */
const SUPABASE_ROOT_CA = "Supabase Root 2021 CA";

/** The connection fields pg resolves for a client config (its own resolver). */
type PgEffectiveConnection = Record<string, unknown>;

const requireFromGate = createRequire(import.meta.url);

/**
 * Runs `build` while no environment variable whose name starts with PG is
 * visible, so pg never reads PG* variables when it resolves the connection;
 * they are put back afterwards, exactly as they were.
 */
function withoutPgEnvironment<T>(build: () => T): T {
  const saved = Object.keys(process.env)
    .filter((key) => key.startsWith("PG"))
    .map((key) => [key, process.env[key]] as const);
  for (const [key] of saved) delete process.env[key];
  try {
    return build();
  } finally {
    for (const [key, value] of saved) process.env[key] = value;
  }
}

/** What pg will actually use for `config`, resolved by pg itself. */
function effectivePgConnection(config: PgClientConfig): PgEffectiveConnection {
  const ConnectionParameters = requireFromGate(
    "pg/lib/connection-parameters.js",
  ) as new (config: PgClientConfig) => PgEffectiveConnection;
  return withoutPgEnvironment(() => {
    const params = new ConnectionParameters(config);
    // `password` is defined non-enumerable by pg; read it explicitly.
    return { ...params, password: params.password };
  });
}

function withDeadline<T>(
  promise: Promise<T>,
  label: string,
  timeoutMs: number = DOCUMENT_CUTOVER_DETECTOR_TIMEOUT_MS,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () =>
        reject(
          new Error(`${label} timed out after ${timeoutMs}ms (deadline).`),
        ),
      timeoutMs,
    );
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/** Project scope of SUPABASE_URL: loopback, or a hosted <ref>.supabase.co. */
function targetScope(
  env: CommandEnv,
): { local: true } | { local: false; ref: string | null } | null {
  const url = targetUrl(env);
  if (!url) return null;
  try {
    const host = new URL(url).hostname;
    if (LOOPBACK_HOSTS.has(host)) return { local: true };
    return {
      local: false,
      ref: /^([a-z0-9]+)\.supabase\.co$/.exec(host)?.[1] ?? null,
    };
  } catch {
    return null;
  }
}

/**
 * Checks DOCUMENT_CUTOVER_DATABASE_URL before any connection: present, a
 * postgres URL whose only query parameter is sslmode, naming a network host,
 * port, database, the reader's user and its password, and pointing at the
 * same project as SUPABASE_URL. The URL is the only source; PG* fallbacks are
 * never used. The config pg will actually use is then resolved by pg itself
 * and must match the URL field by field. Returns that config, or a blocker.
 */
export function checkDatabaseUrl(
  env: CommandEnv,
): { config: PgClientConfig } | { blocker: string } {
  const raw = env.DOCUMENT_CUTOVER_DATABASE_URL?.trim();
  if (!raw) return { blocker: DATABASE_URL_MISSING_BLOCKER };

  const urlBlocker = (detail: string) => ({
    blocker: `STOP THE LINE — DOCUMENT_CUTOVER_DATABASE_URL ${detail}; the URL alone decides the connection.`,
  });

  // Host checks that URL parsing would otherwise turn into a generic error.
  const authority = /^[a-z][a-z0-9+.-]*:\/\/([^/?#]*)/i.exec(raw)?.[1];
  if (authority !== undefined) {
    const hostAndPort = authority.slice(authority.lastIndexOf("@") + 1);
    if (hostAndPort.includes(",")) {
      return urlBlocker(
        "names more than one host (multi-host URLs are never used)",
      );
    }
    if (hostAndPort === "" || hostAndPort.startsWith(":")) {
      return urlBlocker("names no host");
    }
  }

  let parsed: URL | null = null;
  try {
    parsed = new URL(raw);
  } catch {
    parsed = null;
  }
  if (
    !parsed ||
    (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:")
  ) {
    return {
      blocker:
        "STOP THE LINE — DOCUMENT_CUTOVER_DATABASE_URL is not a postgres:// URL, so its project ref can't be checked against SUPABASE_URL.",
    };
  }

  const keys = [...parsed.searchParams.keys()];
  const extra = keys.find((key) => key !== "sslmode");
  if (extra !== undefined) {
    return urlBlocker(
      `carries the query parameter "${extra}", but only sslmode is allowed`,
    );
  }
  const sslmodes = parsed.searchParams.getAll("sslmode");
  const sslmode = sslmodes[0];
  if (
    sslmodes.length > 1 ||
    (sslmode !== undefined && !ALLOWED_SSLMODES.has(sslmode))
  ) {
    return urlBlocker("has an unsupported or repeated sslmode");
  }
  if (parsed.hash) return urlBlocker("carries a fragment");

  let host: string;
  let database: string;
  let login: string;
  let password: string;
  try {
    host = decodeURIComponent(parsed.hostname);
    database = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
    login = decodeURIComponent(parsed.username);
    password = decodeURIComponent(parsed.password);
  } catch {
    return urlBlocker("is not validly percent-encoded");
  }
  if (!host) return urlBlocker("names no host");
  if (host.startsWith("[")) {
    return urlBlocker(
      `names the IPv6 host ${host}, which pg would look up as a hostname; use 127.0.0.1 for a loopback reader`,
    );
  }
  if (!NETWORK_HOST.test(parsed.hostname) || host.includes("/")) {
    return urlBlocker(
      "host is not a network hostname or IP address (a Unix socket path is never used)",
    );
  }
  const loopback = LOOPBACK_HOSTS.has(host);
  if (!loopback && (sslmode === undefined || !VERIFIED_SSLMODES.has(sslmode))) {
    return urlBlocker(
      `uses ${sslmode === undefined ? "no sslmode" : `sslmode=${sslmode}`} for the non-loopback host ${host}; only sslmode=require, verify-ca or verify-full (TLS with certificate verification) is accepted`,
    );
  }
  if (!parsed.port) return urlBlocker("names no port");
  if (!database || database.includes("/")) {
    return urlBlocker("names no database");
  }

  const [role, ...refParts] = login.split(".");
  if (role !== READER_ROLE) {
    return {
      blocker: `STOP THE LINE — DOCUMENT_CUTOVER_DATABASE_URL connects as "${role || "(no user)"}", not ${READER_ROLE}; the gate never reads the target as a privileged user.`,
    };
  }
  if (!password) {
    return {
      blocker:
        "STOP THE LINE — DOCUMENT_CUTOVER_DATABASE_URL carries no password; the URL is the only connection source (PG* variables are never read).",
    };
  }

  const target = targetScope(env);
  const userRef = refParts.length > 0 ? refParts.join(".") : null;
  const hostRef = /^db\.([a-z0-9]+)\.supabase\.co$/.exec(host)?.[1] ?? null;
  const databaseIsLocal = LOOPBACK_HOSTS.has(host);
  const mismatch = (detail: string) => ({
    blocker: `STOP THE LINE — DOCUMENT_CUTOVER_DATABASE_URL does not match the SUPABASE_URL project: ${detail}`,
  });

  if (!target) return mismatch("SUPABASE_URL is missing or invalid.");
  if (target.local) {
    if (!databaseIsLocal || userRef || hostRef) {
      return mismatch(
        "SUPABASE_URL is a loopback target but the database URL names a hosted project ref.",
      );
    }
    return resolvedConfig(parsed, {
      host,
      port: Number(parsed.port),
      database,
      login,
      password,
      tls: tlsConfigFor(loopback, sslmode),
    });
  }
  if (!target.ref) {
    return mismatch("SUPABASE_URL has no <ref>.supabase.co project ref.");
  }
  const refs = [userRef, hostRef].filter((ref): ref is string => ref !== null);
  if (databaseIsLocal || refs.length === 0) {
    return mismatch(
      "the database URL carries no project ref (expected a pooler user document_cutover_reader.<ref> or a db.<ref>.supabase.co host).",
    );
  }
  if (refs.some((ref) => ref !== target.ref)) {
    return mismatch(
      `the database URL's project ref (${refs.join(", ")}) is not ${target.ref}.`,
    );
  }
  return resolvedConfig(parsed, {
    host,
    port: Number(parsed.port),
    database,
    login,
    password,
    tls: tlsConfigFor(loopback, sslmode),
  });
}

/**
 * TLS for the reader connection. A non-loopback host always verifies the
 * server certificate (and, through pg, its hostname); only loopback may run
 * without TLS or opt out of verification.
 */
function tlsConfigFor(
  loopback: boolean,
  sslmode: string | undefined,
): PgTlsConfig {
  if (!loopback) return { rejectUnauthorized: true };
  if (sslmode === undefined || sslmode === "disable") return false;
  if (sslmode === "no-verify") return { rejectUnauthorized: false };
  return { rejectUnauthorized: true };
}

/**
 * Builds the pg client config for a checked URL and requires that pg itself
 * resolves exactly the URL's host, port, database, user and password, with no
 * startup options, replication, binary mode or client encoding from anywhere.
 */
function resolvedConfig(
  url: URL,
  expected: {
    host: string;
    port: number;
    database: string;
    login: string;
    password: string;
    tls: PgTlsConfig;
  },
): { config: PgClientConfig } | { blocker: string } {
  // The URL's only query parameter is sslmode, already turned into `ssl`;
  // dropping the query keeps pg from re-reading it over that setting.
  const withoutQuery = new URL(url.href);
  withoutQuery.search = "";
  const config: PgClientConfig = {
    connectionString: withoutQuery.href,
    application_name: GATE_APPLICATION_NAME,
    connectionTimeoutMillis: 10_000,
    statement_timeout: DOCUMENT_CUTOVER_DETECTOR_TIMEOUT_MS,
    ssl: expected.tls,
  };
  const effective = effectivePgConnection(config);
  const unbracket = (value: unknown) =>
    String(value).replace(/^\[(.*)\]$/, "$1");
  const mismatches = [
    unbracket(effective.host) !== unbracket(expected.host) && "host",
    effective.isDomainSocket !== false && "host (Unix socket)",
    effective.port !== expected.port && "port",
    effective.database !== expected.database && "database",
    effective.user !== expected.login && "user",
    effective.password !== expected.password && "password",
    Boolean(effective.options) && "options",
    Boolean(effective.replication) && "replication",
    Boolean(effective.binary) && "binary",
    Boolean(effective.client_encoding) && "client_encoding",
    effective.application_name !== GATE_APPLICATION_NAME && "application_name",
    JSON.stringify(effective.ssl) !== JSON.stringify(expected.tls) && "ssl",
  ].filter((field): field is string => typeof field === "string");
  if (mismatches.length > 0) {
    return {
      blocker: `STOP THE LINE — DOCUMENT_CUTOVER_DATABASE_URL does not resolve to the connection it names (${mismatches.join(", ")}); the URL alone decides the connection.`,
    };
  }
  return { config };
}

const SESSION_IDENTITY_SQL =
  "select session_user as login_role, current_user as active_role, r.rolsuper, r.rolbypassrls from pg_catalog.pg_roles r where r.rolname = current_user";
const PRIVILEGED_MEMBERSHIP_SQL = `select r.rolname from pg_catalog.pg_roles r where r.rolname in (${PRIVILEGED_ROLES.map((role) => `'${role}'`).join(", ")}) and pg_has_role(current_user, r.oid, 'member')`;

/**
 * The connected session (session_user and current_user) must be
 * document_cutover_reader, without rolsuper or
 * rolbypassrls, and with no membership (direct or inherited) in a privileged
 * role. Returns a blocker, or null when the identity holds.
 */
async function readerIdentityBlocker(
  client: ReaderClient,
): Promise<string | null> {
  const self = await client.query(SESSION_IDENTITY_SQL);
  const row = self.rows[0] as Record<string, unknown> | undefined;
  if (self.rows.length !== 1 || !row) {
    return `STOP THE LINE — the reader connection's role could not be confirmed as ${READER_ROLE}.`;
  }
  if (row.login_role !== READER_ROLE) {
    return `STOP THE LINE — the reader connection's session_user is "${String(row.login_role)}", not ${READER_ROLE} (current_user "${String(row.active_role)}"); a session that switched role is never accepted.`;
  }
  if (row.active_role !== READER_ROLE) {
    return `STOP THE LINE — the reader connection's current_user is "${String(row.active_role)}", not ${READER_ROLE} (session_user "${String(row.login_role)}").`;
  }
  if (row.rolsuper !== false || row.rolbypassrls !== false) {
    return `STOP THE LINE — ${READER_ROLE} has rolsuper=${String(row.rolsuper)} rolbypassrls=${String(row.rolbypassrls)}; the gate requires an unprivileged reader.`;
  }

  const memberships = await client.query(PRIVILEGED_MEMBERSHIP_SQL);
  const privileged = memberships.rows.map((member) =>
    String((member as Record<string, unknown>).rolname),
  );
  if (privileged.length > 0) {
    return `STOP THE LINE — ${READER_ROLE} is a member (direct or inherited) of ${privileged.join(", ")}; the gate requires an unprivileged reader.`;
  }
  return null;
}

/**
 * Serializes queries on the single reader connection (pg's own queueing of
 * concurrent queries is deprecated). A query that never settles releases the
 * queue at the detector deadline, so one hung read can't hold the others
 * past it.
 */
function serialReader(client: PgClient): ReaderClient {
  let tail: Promise<unknown> = Promise.resolve();
  return {
    query(text, values = []) {
      const run = tail.then(() => client.query(text, [...values]));
      tail = withDeadline(run, "a document_cutover read").catch(
        () => undefined,
      );
      return run;
    },
    end: () => client.end(),
  };
}

async function closeReader(client: ReaderClient): Promise<void> {
  await withDeadline(
    client.end(),
    "closing the reader connection",
    5_000,
  ).catch(() => undefined);
}

/**
 * Opens the read-only reader session, or returns a blocker. Nothing is read
 * from the target until the connection's identity has been confirmed.
 */
async function openReaderConnection(
  env: CommandEnv,
): Promise<{ client: ReaderClient } | { blocker: string }> {
  const checked = checkDatabaseUrl(env);
  if ("blocker" in checked) return checked;

  // pg resolves its connection parameters when the client is built and
  // connected; PG* variables are never visible to it at that point.
  const { connection, connecting } = withoutPgEnvironment(() => {
    const created = new pg.Client(checked.config);
    // A dropped connection surfaces through the pending query; never crash.
    created.on("error", () => undefined);
    return { connection: created, connecting: created.connect() };
  });
  const client = serialReader(connection);
  try {
    await withDeadline(connecting, "connecting as the reader");
    const blocker = await withDeadline(
      readerIdentityBlocker(client),
      "checking the reader identity",
    );
    if (blocker) {
      await closeReader(client);
      return { blocker };
    }
    await client.query("set default_transaction_read_only = on");
    return { client };
  } catch (error) {
    await closeReader(client);
    const code = (error as { code?: unknown } | null)?.code;
    if (typeof code === "string" && UNTRUSTED_CERTIFICATE_CODES.has(code)) {
      // One attempt only: the gate never retries without verification.
      return {
        blocker: `STOP THE LINE — the reader connection's TLS certificate could not be verified (${code}). Node does not trust the Supabase root CA ("${SUPABASE_ROOT_CA}") by default: set NODE_EXTRA_CA_CERTS to that root CA file (prod-ca-2021.crt from Database Settings > SSL Configuration) and rerun. The gate never connects without certificate verification.`,
      };
    }
    return {
      blocker: `STOP THE LINE — could not open the ${READER_ROLE} connection: ${redactDiagnosticText(error instanceof Error ? error.message : String(error))}`,
    };
  }
}

// ---------------------------------------------------------------------------
// document_cutover function calls (counts only)
// ---------------------------------------------------------------------------

type ReadFailure = { code: DocumentCutoverBlockingCode; message: string };
type ReadResult<T> = { value: T } | { failure: ReadFailure };

function readError(error: unknown): { failure: ReadFailure } {
  const code = (error as { code?: unknown } | null)?.code;
  const message = error instanceof Error ? error.message : String(error);
  let blocking: DocumentCutoverBlockingCode = "detector_error";
  if (code === "42501") blocking = "permission_denied";
  else if (
    code === "42P01" ||
    code === "42883" ||
    code === "3F000" ||
    code === "42703"
  ) {
    blocking = "unknown_schema";
  }
  return { failure: { code: blocking, message } };
}

function indeterminate(
  detectorQuery: string,
  failure: ReadFailure,
): DocumentCutoverSurfaceInspection {
  return { completeness: "indeterminate", detectorQuery, failure };
}

function contractFunction(name: ContractFunctionName): ContractFunction {
  const fn = DOCUMENT_CUTOVER_FUNCTIONS.find(
    (candidate) => candidate.name === name,
  );
  if (!fn) throw new Error(`document_cutover.${name} is not in the contract`);
  return fn;
}

/**
 * Calls one `document_cutover` function and returns its count columns. The
 * call must return exactly one row whose every contract column is a
 * non-negative integer; anything else (no rows, as row-level security would
 * give, or an unknown shape) is indeterminate, never zero.
 */
async function callCounts(
  client: ReaderClient,
  name: ContractFunctionName,
  args: readonly string[] = [],
): Promise<ReadResult<Record<string, number>>> {
  const fn = contractFunction(name);
  const placeholders = fn.args.map((_, index) => `$${index + 1}`).join(", ");
  let rows: unknown[];
  try {
    const result = await client.query(
      `select * from document_cutover.${fn.name}(${placeholders})`,
      [...args],
    );
    rows = result.rows;
  } catch (error) {
    return readError(error);
  }
  if (!Array.isArray(rows) || rows.length !== 1) {
    return {
      failure: {
        code: "detector_incomplete",
        message: `document_cutover.${fn.name} returned ${Array.isArray(rows) ? rows.length : "no"} rows instead of one; an empty read (as row-level security would give) is never counted as zero.`,
      },
    };
  }
  const row = rows[0] as Record<string, unknown>;
  const counts: Record<string, number> = {};
  for (const column of fn.columns) {
    const value = row[column.name];
    const text =
      typeof value === "number" || typeof value === "bigint"
        ? String(value)
        : value;
    if (
      typeof text !== "string" ||
      !/^\d+$/.test(text) ||
      !Number.isSafeInteger(Number(text))
    ) {
      return {
        failure: {
          code: "unknown_schema",
          message: `document_cutover.${fn.name} returned no count in column ${column.name}.`,
        },
      };
    }
    counts[column.name] = Number(text);
  }
  return { value: counts };
}

/** The target's applied migration version, or UNREADABLE_SCHEMA_VERSION. */
async function targetSchemaVersion(
  client: ReaderClient | null,
): Promise<string> {
  const result: ReadResult<Record<string, number>> = client
    ? await callCounts(client, "schema_version")
    : {
        failure: {
          code: "detector_incomplete",
          message: "no reader connection for the target database",
        },
      };
  const version =
    "value" in result ? String(result.value.schema_version) : undefined;
  if (version && /^\d{14}$/.test(version)) return version;
  const detail =
    "failure" in result
      ? `${result.failure.code}: ${result.failure.message}`
      : `unexpected version ${version}`;
  console.error(
    `Target schema version unreadable (${redactDiagnosticText(detail)})`,
  );
  return UNREADABLE_SCHEMA_VERSION;
}

// ---------------------------------------------------------------------------
// Detectors
// ---------------------------------------------------------------------------

type CountInspection = Pick<
  DocumentCutoverSurfaceInspection,
  "relianceCounts" | "inventoryFindings"
>;

/** A detector backed by one `document_cutover` function call per surface. */
function functionDetector(
  client: ReaderClient,
  spec: {
    detectorId: string;
    detectorVersion: string;
    surfaceKind: DocumentCutoverSurfaceKind;
    surfaceIds: readonly string[];
    fn: ContractFunctionName;
    args?: (surfaceId: string) => string[];
    inspect: (
      counts: Record<string, number>,
      surfaceId: string,
    ) => CountInspection;
  },
): DocumentCutoverDetector {
  return {
    detectorId: spec.detectorId,
    detectorVersion: spec.detectorVersion,
    surfaceKind: spec.surfaceKind,
    surfaceIds: spec.surfaceIds,
    async inspectSurface(surfaceId) {
      const args = spec.args?.(surfaceId) ?? [];
      const detectorQuery = `select * from document_cutover.${spec.fn}(${args.map((arg) => `'${arg}'`).join(", ")})`;
      const result = await callCounts(client, spec.fn, args);
      if ("failure" in result)
        return indeterminate(detectorQuery, result.failure);
      return {
        completeness: "complete",
        detectorQuery,
        ...spec.inspect(result.value, surfaceId),
      };
    },
  };
}

function planSurfaceIds(surfaceKind: DocumentCutoverSurfaceKind): string[] {
  return PHASE_18_DESTRUCTIVE_CUTOVER_PLAN.surfaces
    .filter((surface) => surface.surfaceKind === surfaceKind)
    .map((surface) => surface.surfaceId);
}

function repoInventoryDetector(
  surfaceKind: "configuration" | "prototype_test" | "route",
): DocumentCutoverDetector {
  return {
    detectorId: `repo-inventory-${surfaceKind}`,
    detectorVersion: "1",
    surfaceKind,
    surfaceIds: planSurfaceIds(surfaceKind),
    async inspectSurface(surfaceId) {
      const [filePart = surfaceId] = surfaceId.split("#");
      const absolute = path.join(repoRoot, filePart);
      return {
        completeness: "complete",
        detectorQuery: `stat ${filePart}`,
        inventoryFindings: { fileExists: existsSync(absolute) },
      };
    },
  };
}

function realDetectors(client: ReaderClient): DocumentCutoverDetector[] {
  return [
    functionDetector(client, {
      detectorId: "supabase-table-census",
      detectorVersion: "3",
      surfaceKind: "database_table",
      surfaceIds: planSurfaceIds("database_table"),
      fn: "table_census",
      args: (table) => [table],
      inspect: (counts, table) => ({
        relianceCounts: {
          rows: counts.row_count,
          tenants: counts.tenant_count,
          ...(table === "pdf_template_audit_events"
            ? { retainedHistory: counts.row_count }
            : {}),
        },
      }),
    }),
    functionDetector(client, {
      detectorId: "supabase-artifact-storage-census",
      detectorVersion: "4",
      surfaceKind: "storage_location",
      surfaceIds: planSurfaceIds("storage_location"),
      fn: "artifact_storage_census",
      inspect: (counts) => ({
        relianceCounts: {
          objects: (counts.referenced_rows ?? 0) + (counts.bucket_objects ?? 0),
        },
        inventoryFindings: {
          referencedObjectRows: counts.referenced_rows ?? 0,
          bucketObjects: counts.bucket_objects ?? 0,
        },
      }),
    }),
    functionDetector(client, {
      detectorId: "supabase-artifact-external-url-census",
      detectorVersion: "3",
      surfaceKind: "external_reference",
      surfaceIds: planSurfaceIds("external_reference"),
      fn: "external_reference_count",
      inspect: (counts) => ({
        relianceCounts: { externalReferences: counts.external_reference_count },
      }),
    }),
    // Any queued job row is treated as an active reliance; the gate never
    // guesses which statuses are safe to abandon.
    functionDetector(client, {
      detectorId: "supabase-batch-job-census",
      detectorVersion: "3",
      surfaceKind: "background_job",
      surfaceIds: planSurfaceIds("background_job"),
      fn: "batch_job_count",
      inspect: (counts) => ({
        relianceCounts: { activeJobs: counts.batch_job_count },
      }),
    }),
    functionDetector(client, {
      detectorId: "supabase-auth-user-census",
      detectorVersion: "2",
      surfaceKind: "user_account",
      surfaceIds: [...PHASE_18_USER_SURFACES],
      fn: "auth_user_count",
      inspect: (counts) => ({
        relianceCounts: { users: counts.auth_user_count },
      }),
    }),
    functionDetector(client, {
      detectorId: "supabase-migration-report-census",
      detectorVersion: "2",
      surfaceKind: "report",
      surfaceIds: [...PHASE_18_REPORT_SURFACES],
      fn: "migration_report_count",
      inspect: (counts) => ({
        relianceCounts: { reports: counts.migration_report_count },
      }),
    }),
    functionDetector(client, {
      detectorId: "supabase-renderer-integration-census",
      detectorVersion: "2",
      surfaceKind: "integration",
      surfaceIds: [...PHASE_18_INTEGRATION_SURFACES],
      fn: "renderer_integration_count",
      inspect: (counts) => ({
        relianceCounts: { integrations: counts.renderer_integration_count },
      }),
    }),
    repoInventoryDetector("route"),
    repoInventoryDetector("configuration"),
    repoInventoryDetector("prototype_test"),
  ];
}

// ---------------------------------------------------------------------------
// Proof output (contained in docs/ops/document-cutover/proofs/)
// ---------------------------------------------------------------------------

function isInside(root: string, candidate: string): boolean {
  const relative = path.relative(root, candidate);
  return (
    relative === "" ||
    (!path.isAbsolute(relative) && relative.split(path.sep)[0] !== "..")
  );
}

/**
 * Repo-relative proof directory for `--out`, or null when it does not
 * resolve inside docs/ops/document-cutover/proofs/ (`.`, `""`, `../x`,
 * absolute paths elsewhere, siblings).
 */
function proofDirectoryFor(out: string): string | null {
  if (out.trim() === "") return null;
  const absolute = path.resolve(repoRoot, out);
  if (!isInside(PROOFS_ROOT, absolute)) return null;
  return path.relative(repoRoot, absolute).split(path.sep).join("/");
}

/**
 * Writes each new proof to its `proofPath` for commit through a PR. The `wx`
 * flag makes writing over an existing proof path throw, so a rerun never
 * changes an earlier proof, and a path outside the proofs directory is refused.
 */
const committedProofFileWriter: DocumentCutoverProofStore = {
  async append(proof) {
    const target = path.resolve(repoRoot, proof.proofPath);
    if (target === PROOFS_ROOT || !isInside(PROOFS_ROOT, target)) {
      throw new Error(
        `Proof path ${proof.proofPath} is outside ${DOCUMENT_CUTOVER_PROOFS_DIR}/; nothing written.`,
      );
    }
    mkdirSync(path.dirname(target), { recursive: true });
    await writeFile(target, `${JSON.stringify(proof, null, 2)}\n`, {
      flag: "wx",
    });
  },
};

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

function groupBlockers(reasons: DocumentCutoverBlockingReason[]): string {
  const groups = new Map<string, DocumentCutoverBlockingReason[]>();
  for (const reason of reasons) {
    const key = reason.surfaceKind ?? "environment";
    groups.set(key, [...(groups.get(key) ?? []), reason]);
  }

  const lines: string[] = [];
  for (const [surface, grouped] of groups) {
    lines.push(`  ${surface}:`);
    for (const reason of grouped) {
      const target = reason.surfaceId ? ` [${reason.surfaceId}]` : "";
      lines.push(`    - ${reason.code}${target}: ${reason.explanation}`);
    }
  }
  return lines.join("\n");
}

function printAssessment(assessment: DocumentCutoverAssessment): void {
  const lines = ["# Document Cutover Environment Assessment", ""];
  lines.push(`Assessment: ${assessment.assessmentId}`);
  lines.push(`Status: ${assessment.status}`);
  lines.push(`Proposed outcome: ${assessment.proposedOutcome}`);
  lines.push(`Plan digest: ${assessment.planDigest}`);
  if (assessment.environment) {
    lines.push(
      `Environment: ${assessment.environment.environmentLabel} (${assessment.environment.productionClassification}) db=${assessment.environment.databaseProjectId} schema=${assessment.environment.schemaVersion} code=${assessment.environment.codeVersion.slice(0, 12)}`,
    );
  }
  lines.push("");
  lines.push(`Checked surfaces (${assessment.evidence.length}):`);
  for (const evidence of assessment.evidence) {
    const counts = Object.entries(evidence.relianceCounts)
      .map(([key, count]) => `${key}=${count}`)
      .join(" ");
    lines.push(
      `  - [${evidence.completeness}] ${evidence.surfaceKind}:${evidence.surfaceId} ${counts}`.trimEnd(),
    );
  }
  lines.push("");
  if (assessment.proposedOutcome === "stop_the_line") {
    lines.push("STOP THE LINE — blocking evidence by surface:");
    lines.push(groupBlockers(assessment.blockingReasons));
    lines.push("");
    lines.push(
      "Safe next steps: investigate each blocker read-only, re-groom the plan if a surface carries reliance, and rerun this assessment. No destructive command is authorized.",
    );
  } else {
    lines.push(
      `CLEAN — evidence supports a later, separately authorized cutover of plan digest ${assessment.planDigest} only.`,
    );
  }
  console.log(lines.join("\n"));
}

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// --verify
// ---------------------------------------------------------------------------

/**
 * Checks the proof itself first (location, digests, legacy attestation, 24h
 * freshness from `recordedAt`, clean consistency). Only an intact clean proof
 * inside docs/ops/document-cutover/proofs/ is then compared with the current
 * target, read over the reader connection.
 */
async function verifyStoredProof(
  proofPath: string,
  env: CommandEnv,
): Promise<number> {
  const absolute = path.resolve(repoRoot, proofPath);
  if (!existsSync(absolute)) {
    console.error(`Unable to read the proof at ${proofPath}: no such file.`);
    return 1;
  }
  const location = realpathSync(absolute);
  if (
    !existsSync(PROOFS_ROOT) ||
    location === realpathSync(PROOFS_ROOT) ||
    !isInside(realpathSync(PROOFS_ROOT), location)
  ) {
    console.error(
      `INVALID proof location ${proofPath}: only proofs committed under ${DOCUMENT_CUTOVER_PROOFS_DIR}/ are verified.`,
    );
    return 1;
  }

  let proof: DocumentCutoverEnvironmentProof;
  try {
    proof = JSON.parse(
      readFileSync(location, "utf8"),
    ) as DocumentCutoverEnvironmentProof;
  } catch (error) {
    console.error(
      `Unable to read or parse the proof at ${proofPath}: ${error instanceof Error ? error.message : error}`,
    );
    return 1;
  }

  let result = await verifyDocumentCutoverEnvironmentProof(proof);
  if (result.valid && proof.outcome === "clean_preproduction_proof") {
    const opened = await openReaderConnection(env);
    if ("blocker" in opened) {
      console.error(opened.blocker);
      return 1;
    }
    let schemaVersion: string;
    try {
      schemaVersion = await withDeadline(
        targetSchemaVersion(opened.client),
        "reading the target schema version",
      ).catch(() => UNREADABLE_SCHEMA_VERSION);
    } finally {
      await closeReader(opened.client);
    }
    result = await verifyDocumentCutoverEnvironmentProof(proof, {
      currentTarget: targetIdentity(env, schemaVersion),
    });
  }

  if (result.valid && proof.outcome === "clean_preproduction_proof") {
    console.log(
      `VALID clean proof ${proof.proofId} for plan digest ${proof.planDigest} on the current target.`,
    );
    return 0;
  }

  console.log(
    result.valid
      ? `Proof ${proof.proofId} is intact but records outcome ${proof.outcome}.`
      : `INVALID proof ${proof.proofId}:`,
  );
  for (const failure of result.failures) {
    console.log(`  - ${failure.code}: ${failure.detail}`);
  }
  return 1;
}

// ---------------------------------------------------------------------------
// Command
// ---------------------------------------------------------------------------

/** Runs the operator command and resolves to its process exit code. */
export async function runDocumentCutoverCommand(
  deps: DocumentCutoverCommandDeps,
): Promise<number> {
  const { env } = deps;
  let args: CliArgs;
  try {
    args = parseArgs(deps.argv);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
  if (args.help) {
    console.log(
      "See the header of scripts/document-cutover/assess-document-cutover.ts for usage.",
    );
    return 0;
  }
  if (args.removedFlags.length > 0) {
    for (const flag of args.removedFlags) {
      console.error(`${flag} was removed: ${REMOVED_FLAGS[flag]}.`);
    }
    return 1;
  }
  if (args.verify) {
    try {
      return await verifyStoredProof(args.verify, env);
    } catch (error) {
      // A structurally malformed proof is invalid, never a crash.
      console.error(
        `INVALID proof at ${args.verify}: ${error instanceof Error ? error.message : error}`,
      );
      return 1;
    }
  }

  const proofDirectory = proofDirectoryFor(args.out);
  if (proofDirectory === null) {
    console.error(
      `STOP THE LINE — --out "${args.out}" does not resolve inside ${DOCUMENT_CUTOVER_PROOFS_DIR}/; nothing written.`,
    );
    return 1;
  }

  let allowlist: DocumentCutoverAllowlist;
  try {
    allowlist = loadAllowlist();
  } catch (error) {
    console.error(
      `STOP THE LINE — ${error instanceof Error ? error.message : error}`,
    );
    return 1;
  }

  if (args.decision) {
    if (!args.owner || !args.ownerRole || !args.statement) {
      console.error(
        "--decision requires --owner, --owner-role, and --statement.",
      );
      return 1;
    }
    // Fail fast before touching the target; the library check
    // (recordDocumentCutoverApproval) is authoritative.
    const listed = allowlist.owners.some(
      (owner) => owner.id === args.owner && owner.role === args.ownerRole,
    );
    if (!listed) {
      console.error(
        `--owner/--owner-role must name an owner listed in ${DOCUMENT_CUTOVER_ALLOWLIST_PATH}; no proof recorded.`,
      );
      return 1;
    }
  }

  // Injected detectors never need the target, so the reader connection is
  // only opened (and DOCUMENT_CUTOVER_DATABASE_URL only read) for the real
  // detectors. Without a real read the target schema version is unreadable
  // and the line stops.
  let reader: ReaderClient | null = null;
  let detectors = deps.detectors;
  if (!detectors) {
    const opened = await openReaderConnection(env);
    if ("blocker" in opened) {
      console.error(opened.blocker);
      return 1;
    }
    reader = opened.client;
    detectors = realDetectors(opened.client);
  }

  try {
    return await assessAndRecord({
      args,
      env,
      allowlist,
      proofDirectory,
      reader,
      detectors,
      store: deps.store ?? committedProofFileWriter,
    });
  } finally {
    if (reader) await closeReader(reader);
  }
}

async function assessAndRecord(input: {
  args: CliArgs;
  env: CommandEnv;
  allowlist: DocumentCutoverAllowlist;
  proofDirectory: string;
  reader: ReaderClient | null;
  detectors: DocumentCutoverDetector[];
  store: DocumentCutoverProofStore;
}): Promise<number> {
  const { args, env, allowlist, reader } = input;
  const assessment = await assessDocumentCutoverEnvironment({
    plan: PHASE_18_DESTRUCTIVE_CUTOVER_PLAN,
    // The schema-version read happens inside the resolver, so it runs under
    // the same deadline as the detectors.
    resolveEnvironment: async () =>
      resolveEnvironment(
        env,
        allowlist.nonProductionProjects,
        await targetSchemaVersion(reader),
      ),
    detectors: input.detectors,
    procedures: {
      resetRebuild: RESET_PROCEDURE,
      rollbackBeforeFirstCanonicalWrite: ROLLBACK_PROCEDURE,
    },
    readProcedure: async (reference) => {
      const absolute = path.join(repoRoot, reference);
      return existsSync(absolute) ? readFileSync(absolute, "utf8") : null;
    },
    expectedEnvironment: {
      databaseProjectId: args.expectProject,
      environmentLabel: args.expectEnv,
      schemaVersion: latestMigrationVersion(),
    },
  });

  printAssessment(assessment);

  if (!args.decision || !args.owner || !args.ownerRole || !args.statement) {
    // Assess-only runs never mint a proof, and only a cryptographically
    // verified clean proof may exit zero.
    console.log(
      "\nAssess-only run: no proof recorded. Re-run with --decision to record one.",
    );
    return 1;
  }

  try {
    const proof = await recordDocumentCutoverApproval({
      assessment,
      owner: { ownerId: args.owner, ownerRole: args.ownerRole },
      approval: {
        approvalStatement: args.statement,
        decision: args.decision,
      },
      authorization: { owners: allowlist.owners },
      provenance: {
        recordedBy: operatorIdentity(),
        proofDirectory: input.proofDirectory,
      },
      store: input.store,
    });

    const verification = await verifyDocumentCutoverEnvironmentProof(proof);
    console.log(
      `\nRecorded ${proof.outcome} proof ${proof.proofId} (digest ${proof.digest.slice(0, 16)}…) at ${proof.proofPath}.`,
    );
    if (!verification.valid) {
      console.error("Recorded proof failed self-verification:");
      for (const failure of verification.failures) {
        console.error(`  - ${failure.code}: ${failure.detail}`);
      }
      return 1;
    }
    console.log(
      "Commit this proof through a PR. The owner's approving review of that PR is the approval of record.",
    );

    return proof.outcome === "clean_preproduction_proof" ? 0 : 1;
  } catch (error) {
    console.error(
      `\nNo proof recorded: ${error instanceof Error ? error.message : error}`,
    );
    return 1;
  }
}

// Run only when executed as a script (`bun run cutover:assess:documents`);
// importing the module (tests) must not run the command. `process.argv[1]`
// cannot tell the two apart, so this relies on the runtime's `import.meta.main`.
if (import.meta.main) {
  process.exitCode = await runDocumentCutoverCommand({
    argv: process.argv.slice(2),
    env: process.env,
  });
}
