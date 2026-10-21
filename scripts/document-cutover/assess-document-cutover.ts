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
 *   --out <dir>               Proof output directory
 *                             (default docs/ops/document-cutover/proofs).
 *   --verify <proof.json>     Verify a stored proof file against the current
 *                             target and exit (digest, legacy attestation,
 *                             24h freshness from recordedAt, environment).
 *
 * Owner and non-production project allowlist:
 *   docs/ops/document-cutover/allowlist.json, changed only through a PR
 *   (CODEOWNERS). A hosted Supabase project classifies as non-production only
 *   when its ref is listed there; a loopback target is non-production.
 *
 * Environment:
 *   SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL   Target Supabase URL.
 *   DOCUMENT_CUTOVER_SUPABASE_READ_KEY        Restricted read-only Supabase
 *                             key. Required; SUPABASE_SERVICE_ROLE_KEY is
 *                             never used. Its role must be able to read the
 *                             prototype tables, Storage, auth users and
 *                             supabase_migrations.schema_migrations.
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";

import {
  isProductionDeployment,
  isProtectedNonProductionDeployment,
  resolveDeploymentEnvironment,
} from "../../packages/env/src/target-env";
import {
  DOCUMENT_CUTOVER_ALLOWLIST_PATH,
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
  DocumentCutoverProofStore,
  DocumentCutoverSurfaceInspection,
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

const READ_ONLY_CREDENTIAL_BLOCKER =
  "STOP THE LINE — read-only credential required: set DOCUMENT_CUTOVER_SUPABASE_READ_KEY, the restricted read-only Supabase key, for the target. SUPABASE_SERVICE_ROLE_KEY can write, so it is never used, and a Postgres URL alone cannot list Storage.";

/** Recorded when the target database's schema version cannot be read. */
const UNREADABLE_SCHEMA_VERSION = "unreadable";

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
// Read client and target reads
// ---------------------------------------------------------------------------

type SupabaseReadClient = ReturnType<typeof createClient>;

/**
 * Builds the only client the gate uses, from the restricted read key alone.
 * Without that key the gate stops; it never falls back to the service role.
 */
function createReadClient(
  env: CommandEnv,
): { client: SupabaseReadClient } | { blocker: string } {
  const key = env.DOCUMENT_CUTOVER_SUPABASE_READ_KEY?.trim();
  if (!key) return { blocker: READ_ONLY_CREDENTIAL_BLOCKER };
  const url = targetUrl(env);
  if (!url) {
    return {
      blocker:
        "STOP THE LINE — SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) must name the target.",
    };
  }
  return {
    client: createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    }),
  };
}

type ReadFailure = { code: DocumentCutoverBlockingCode; message: string };
type ReadResult<T> = { value: T } | { failure: ReadFailure };

function classifyReadError(message: string): DocumentCutoverBlockingCode {
  const lowered = message.toLowerCase();
  if (
    lowered.includes("does not exist") ||
    lowered.includes("could not find") ||
    lowered.includes("schema cache")
  ) {
    return "unknown_schema";
  }
  if (
    lowered.includes("fetch failed") ||
    lowered.includes("econnrefused") ||
    lowered.includes("enotfound") ||
    lowered.includes("network") ||
    lowered.includes("timed out")
  ) {
    return "detector_error";
  }
  return "permission_denied";
}

function readError(message: string): { failure: ReadFailure } {
  return { failure: { code: classifyReadError(message), message } };
}

function unknownShape(what: string): { failure: ReadFailure } {
  return {
    failure: {
      code: "unknown_schema",
      message: `${what} returned an unrecognized response shape.`,
    },
  };
}

function indeterminate(
  detectorQuery: string,
  failure: ReadFailure,
): DocumentCutoverSurfaceInspection {
  return { completeness: "indeterminate", detectorQuery, failure };
}

/** Latest version in the target's migrations table (never through an RPC). */
async function readTargetSchemaVersion(
  client: SupabaseReadClient | null,
): Promise<ReadResult<string>> {
  if (!client) {
    return {
      failure: {
        code: "detector_incomplete",
        message: "no read client for the target database",
      },
    };
  }
  try {
    const { data, error } = await client
      .schema("supabase_migrations")
      .from("schema_migrations")
      .select("version")
      .order("version", { ascending: false })
      .limit(1);
    if (error) return readError(error.message);
    const version: unknown = Array.isArray(data) ? data[0]?.version : undefined;
    if (typeof version !== "string" || !/^\d{14}$/.test(version)) {
      return unknownShape("supabase_migrations.schema_migrations");
    }
    return { value: version };
  } catch (error) {
    return readError(error instanceof Error ? error.message : String(error));
  }
}

async function targetSchemaVersion(
  client: SupabaseReadClient | null,
): Promise<string> {
  const result = await readTargetSchemaVersion(client);
  if ("value" in result) return result.value;
  console.error(
    `Target schema version unreadable (${result.failure.code}): ${redactDiagnosticText(result.failure.message)}`,
  );
  return UNREADABLE_SCHEMA_VERSION;
}

async function countRows(
  client: SupabaseReadClient,
  table: string,
  filter?: (
    query: ReturnType<ReturnType<typeof client.from>["select"]>,
  ) => typeof query,
): Promise<ReadResult<number>> {
  let query = client.from(table).select("*", { count: "exact", head: true });
  if (filter) query = filter(query);
  const { count, error } = await query;
  if (error) return readError(error.message);
  // A missing count is an unknown response, never "zero rows".
  if (typeof count !== "number") return unknownShape(`count(${table})`);
  return { value: count };
}

const TENANT_PAGE_SIZE = 1000;
const MAX_TENANT_PAGES = 100;

/**
 * Distinct non-null `tenant_id` values in `table`. The ids stay in memory for
 * counting only; they are never reported, logged or recorded.
 */
async function countDistinctTenants(
  client: SupabaseReadClient,
  table: string,
): Promise<ReadResult<number>> {
  const tenants = new Set<string>();
  for (let page = 0; page < MAX_TENANT_PAGES; page += 1) {
    const from = page * TENANT_PAGE_SIZE;
    const { data, error } = await client
      .from(table)
      .select("tenant_id")
      .not("tenant_id", "is", null)
      .order("tenant_id")
      .range(from, from + TENANT_PAGE_SIZE - 1);
    if (error) return readError(error.message);
    if (!Array.isArray(data)) return unknownShape(`tenant_id from ${table}`);
    for (const row of data as Array<Record<string, unknown>>) {
      tenants.add(String(row.tenant_id));
    }
    if (data.length < TENANT_PAGE_SIZE) return { value: tenants.size };
  }
  return {
    failure: {
      code: "detector_incomplete",
      message: `${table} has more than ${MAX_TENANT_PAGES * TENANT_PAGE_SIZE} tenant rows; distinct tenants were not fully counted.`,
    },
  };
}

// ---------------------------------------------------------------------------
// Detectors
// ---------------------------------------------------------------------------

function tableDetector(client: SupabaseReadClient): DocumentCutoverDetector {
  return {
    detectorId: "supabase-table-census",
    detectorVersion: "2",
    surfaceKind: "database_table",
    surfaceIds: PHASE_18_DESTRUCTIVE_CUTOVER_PLAN.surfaces
      .filter((surface) => surface.surfaceKind === "database_table")
      .map((surface) => surface.surfaceId),
    async inspectSurface(table) {
      const detectorQuery = `select count(*), count(distinct tenant_id) from public.${table}`;

      const rows = await countRows(client, table);
      if ("failure" in rows) return indeterminate(detectorQuery, rows.failure);

      const tenants = await countDistinctTenants(client, table);
      if ("failure" in tenants) {
        return indeterminate(detectorQuery, tenants.failure);
      }

      return {
        completeness: "complete",
        detectorQuery,
        relianceCounts: {
          rows: rows.value,
          tenants: tenants.value,
          ...(table === "pdf_template_audit_events"
            ? { retainedHistory: rows.value }
            : {}),
        },
      };
    },
  };
}

const PROTOTYPE_BUCKET_NAME_PATTERN = /pdf|template|artifact|receipt/i;

function storageDetector(client: SupabaseReadClient): DocumentCutoverDetector {
  return {
    detectorId: "supabase-artifact-storage-census",
    detectorVersion: "3",
    surfaceKind: "storage_location",
    surfaceIds: ["pdf_template_artifacts.storage_objects"],
    async inspectSurface() {
      const detectorQuery =
        "count pdf_template_artifacts rows with storage references; list objects in every referenced or prototype-named storage bucket";

      const referencedRows = await countRows(
        client,
        "pdf_template_artifacts",
        (query) => query.not("storage_path", "is", null),
      );
      if ("failure" in referencedRows) {
        return indeterminate(detectorQuery, referencedRows.failure);
      }

      const { data: bucketRows, error: bucketRowsError } = await client
        .from("pdf_template_artifacts")
        .select("storage_bucket")
        .not("storage_bucket", "is", null)
        .limit(1000);
      if (bucketRowsError) {
        return indeterminate(
          detectorQuery,
          readError(bucketRowsError.message).failure,
        );
      }
      if (!Array.isArray(bucketRows)) {
        return indeterminate(
          detectorQuery,
          unknownShape("pdf_template_artifacts.storage_bucket").failure,
        );
      }

      const bucketsToInspect = new Set<string>(
        bucketRows
          .map((row) =>
            typeof row.storage_bucket === "string" ? row.storage_bucket : "",
          )
          .filter(Boolean),
      );

      // Also inspect any bucket whose name looks prototype-owned, so objects
      // orphaned from their rows still stop the line.
      const { data: allBuckets, error: listBucketsError } =
        await client.storage.listBuckets();
      if (listBucketsError) {
        return indeterminate(detectorQuery, {
          code: "permission_denied",
          message: listBucketsError.message,
        });
      }
      if (!Array.isArray(allBuckets)) {
        return indeterminate(
          detectorQuery,
          unknownShape("storage.listBuckets").failure,
        );
      }
      for (const bucket of allBuckets) {
        if (PROTOTYPE_BUCKET_NAME_PATTERN.test(bucket.name)) {
          bucketsToInspect.add(bucket.name);
        }
      }

      let listedObjects = 0;
      for (const bucket of bucketsToInspect) {
        const { data: entries, error: listError } = await client.storage
          .from(bucket)
          .list("", { limit: 1000 });
        if (listError) {
          return indeterminate(detectorQuery, {
            code: "permission_denied",
            message: listError.message,
          });
        }
        if (!Array.isArray(entries)) {
          return indeterminate(
            detectorQuery,
            unknownShape(`storage.from(${bucket}).list`).failure,
          );
        }
        listedObjects += entries.length;
      }

      return {
        completeness: "complete",
        detectorQuery,
        relianceCounts: { objects: referencedRows.value + listedObjects },
        inventoryFindings: {
          referencedObjectRows: referencedRows.value,
          listedBucketEntries: listedObjects,
          bucketsInspected: [...bucketsToInspect].sort().join(",") || "(none)",
        },
      };
    },
  };
}

function externalReferenceDetector(
  client: SupabaseReadClient,
): DocumentCutoverDetector {
  return {
    detectorId: "supabase-artifact-external-url-census",
    detectorVersion: "2",
    surfaceKind: "external_reference",
    surfaceIds: ["pdf_template_artifacts.external_urls"],
    async inspectSurface() {
      const detectorQuery =
        "select count(*), sample(url, 5) from public.pdf_template_artifacts where url is not null";

      const references = await countRows(
        client,
        "pdf_template_artifacts",
        (query) => query.not("url", "is", null),
      );
      if ("failure" in references) {
        return indeterminate(detectorQuery, references.failure);
      }

      let samples: string[] = [];
      if (references.value > 0) {
        const { data } = await client
          .from("pdf_template_artifacts")
          .select("url")
          .not("url", "is", null)
          .limit(5);
        samples = (Array.isArray(data) ? data : [])
          .map((row) => (typeof row.url === "string" ? row.url : ""))
          .filter(Boolean);
      }

      return {
        completeness: "complete",
        detectorQuery,
        relianceCounts: { externalReferences: references.value },
        externalReferences: samples,
      };
    },
  };
}

function jobDetector(client: SupabaseReadClient): DocumentCutoverDetector {
  return {
    detectorId: "supabase-batch-job-census",
    detectorVersion: "2",
    surfaceKind: "background_job",
    surfaceIds: ["pdf_template_batch_jobs.queue"],
    async inspectSurface() {
      const detectorQuery =
        "select count(*) from public.pdf_template_batch_jobs";

      const jobs = await countRows(client, "pdf_template_batch_jobs");
      if ("failure" in jobs) return indeterminate(detectorQuery, jobs.failure);

      // Any queued job row is treated as an active reliance; the gate never
      // guesses which statuses are safe to abandon.
      return {
        completeness: "complete",
        detectorQuery,
        relianceCounts: { activeJobs: jobs.value },
      };
    },
  };
}

const USERS_PAGE_SIZE = 1000;
const MAX_USER_PAGES = 100;

function userDetector(client: SupabaseReadClient): DocumentCutoverDetector {
  return {
    detectorId: "supabase-auth-user-census",
    detectorVersion: "1",
    surfaceKind: "user_account",
    surfaceIds: [...PHASE_18_USER_SURFACES],
    async inspectSurface() {
      const detectorQuery = `auth.admin.listUsers (pages of ${USERS_PAGE_SIZE})`;

      let users = 0;
      for (let page = 1; page <= MAX_USER_PAGES; page += 1) {
        const { data, error } = await client.auth.admin.listUsers({
          page,
          perPage: USERS_PAGE_SIZE,
        });
        if (error) {
          return indeterminate(detectorQuery, readError(error.message).failure);
        }
        const listed: unknown = (data as { users?: unknown } | null)?.users;
        if (!Array.isArray(listed)) {
          return indeterminate(
            detectorQuery,
            unknownShape("auth.admin.listUsers").failure,
          );
        }
        users += listed.length;
        if (listed.length < USERS_PAGE_SIZE) {
          return {
            completeness: "complete",
            detectorQuery,
            relianceCounts: { users },
          };
        }
      }
      return indeterminate(detectorQuery, {
        code: "detector_incomplete",
        message: `More than ${MAX_USER_PAGES * USERS_PAGE_SIZE} auth users; the census did not finish.`,
      });
    },
  };
}

function reportDetector(client: SupabaseReadClient): DocumentCutoverDetector {
  return {
    detectorId: "supabase-migration-report-census",
    detectorVersion: "1",
    surfaceKind: "report",
    surfaceIds: [...PHASE_18_REPORT_SURFACES],
    async inspectSurface() {
      const detectorQuery =
        "select count(*) from public.pdf_templates where migration_report <> '{}'";

      const reports = await countRows(client, "pdf_templates", (query) =>
        query.neq("migration_report", "{}"),
      );
      if ("failure" in reports) {
        return indeterminate(detectorQuery, reports.failure);
      }
      return {
        completeness: "complete",
        detectorQuery,
        relianceCounts: { reports: reports.value },
      };
    },
  };
}

function integrationDetector(
  client: SupabaseReadClient,
): DocumentCutoverDetector {
  return {
    detectorId: "supabase-renderer-integration-census",
    detectorVersion: "1",
    surfaceKind: "integration",
    surfaceIds: [...PHASE_18_INTEGRATION_SURFACES],
    async inspectSurface() {
      const detectorQuery =
        "select count(*) from public.pdf_template_renders where renderer = 'docraptor'";

      const renders = await countRows(client, "pdf_template_renders", (query) =>
        query.eq("renderer", "docraptor"),
      );
      if ("failure" in renders) {
        return indeterminate(detectorQuery, renders.failure);
      }
      return {
        completeness: "complete",
        detectorQuery,
        relianceCounts: { integrations: renders.value },
      };
    },
  };
}

function repoInventoryDetector(
  surfaceKind: "configuration" | "prototype_test" | "route",
): DocumentCutoverDetector {
  return {
    detectorId: `repo-inventory-${surfaceKind}`,
    detectorVersion: "1",
    surfaceKind,
    surfaceIds: PHASE_18_DESTRUCTIVE_CUTOVER_PLAN.surfaces
      .filter((surface) => surface.surfaceKind === surfaceKind)
      .map((surface) => surface.surfaceId),
    async inspectSurface(surfaceId) {
      const [filePart] = surfaceId.split("#");
      const absolute = path.join(repoRoot, filePart);
      return {
        completeness: "complete",
        detectorQuery: `stat ${filePart}`,
        inventoryFindings: { fileExists: existsSync(absolute) },
      };
    },
  };
}

function realDetectors(client: SupabaseReadClient): DocumentCutoverDetector[] {
  return [
    tableDetector(client),
    storageDetector(client),
    externalReferenceDetector(client),
    jobDetector(client),
    userDetector(client),
    reportDetector(client),
    integrationDetector(client),
    repoInventoryDetector("route"),
    repoInventoryDetector("configuration"),
    repoInventoryDetector("prototype_test"),
  ];
}

// ---------------------------------------------------------------------------
// Proof output
// ---------------------------------------------------------------------------

/**
 * Writes each new proof to its `proofPath` for commit through a PR. The `wx`
 * flag makes writing over an existing proof path throw, so a rerun never
 * changes an earlier proof.
 */
const committedProofFileWriter: DocumentCutoverProofStore = {
  async append(proof) {
    const target = path.resolve(repoRoot, proof.proofPath);
    mkdirSync(path.dirname(target), { recursive: true });
    await writeFile(target, `${JSON.stringify(proof, null, 2)}\n`, {
      flag: "wx",
    });
  },
};

function repoRelativeDirectory(directory: string): string {
  return path
    .relative(repoRoot, path.resolve(repoRoot, directory))
    .split(path.sep)
    .join("/");
}

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
// --verify
// ---------------------------------------------------------------------------

/**
 * Checks the proof itself first (digests, legacy attestation, 24h freshness
 * from `recordedAt`, clean consistency). Only an intact clean proof is then
 * compared with the current target, read with the read-only key.
 */
async function verifyStoredProof(
  proofPath: string,
  env: CommandEnv,
): Promise<number> {
  let proof: DocumentCutoverEnvironmentProof;
  try {
    proof = JSON.parse(
      readFileSync(path.resolve(repoRoot, proofPath), "utf8"),
    ) as DocumentCutoverEnvironmentProof;
  } catch (error) {
    console.error(
      `Unable to read or parse the proof at ${proofPath}: ${error instanceof Error ? error.message : error}`,
    );
    return 1;
  }

  let result = await verifyDocumentCutoverEnvironmentProof(proof);
  if (result.valid && proof.outcome === "clean_preproduction_proof") {
    const read = createReadClient(env);
    if ("blocker" in read) {
      console.error(read.blocker);
      return 1;
    }
    const currentTarget = targetIdentity(
      env,
      await targetSchemaVersion(read.client),
    );
    result = await verifyDocumentCutoverEnvironmentProof(proof, {
      currentTarget,
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

  // Injected detectors never need the real client, so it is only built (and
  // the read key only read) for the real detectors. Without a real read the
  // target schema version is unreadable and the line stops.
  let client: SupabaseReadClient | null = null;
  let detectors = deps.detectors;
  if (!detectors) {
    const read = createReadClient(env);
    if ("blocker" in read) {
      console.error(read.blocker);
      return 1;
    }
    client = read.client;
    detectors = realDetectors(read.client);
  }
  const schemaVersion = await targetSchemaVersion(client);

  const assessment = await assessDocumentCutoverEnvironment({
    plan: PHASE_18_DESTRUCTIVE_CUTOVER_PLAN,
    resolveEnvironment: async () =>
      resolveEnvironment(env, allowlist.nonProductionProjects, schemaVersion),
    detectors,
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
      authorization: {
        allowedOwnerIds: allowlist.owners.map((owner) => owner.id),
      },
      provenance: {
        recordedBy: operatorIdentity(),
        proofDirectory: repoRelativeDirectory(args.out),
      },
      store: deps.store ?? committedProofFileWriter,
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
