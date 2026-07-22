#!/usr/bin/env bun
/**
 * Phase 18 D17 operator command: pre-production document-cutover assessment.
 *
 * Read-only. Resolves the actual target environment on the server side of the
 * connection, inventories every prototype document surface named by the Phase
 * 18 destructive plan, and either records a `clean_preproduction_proof` (only
 * after an explicit owner go decision on fully clean evidence) or stops the
 * line with grouped, redacted blockers.
 *
 * Exit codes: 0 only for a cryptographically verified clean proof; 1 for every
 * stopped, incomplete, or invalid state.
 *
 * Usage:
 *   bun scripts/document-cutover/assess-document-cutover.ts [options]
 *
 * Options:
 *   --decision <go|no_go>     Record a proof with the given owner decision.
 *                             Omit to run assess-only (no proof recorded).
 *   --owner <id>              Accountable owner id (required with --decision).
 *   --owner-role <role>       Accountable owner role (required with --decision).
 *   --approver <id>           Approver id (required with --decision).
 *   --statement <text>        Approval statement (required with --decision).
 *   --expect-project <ref>    Operator-declared database/project identity.
 *   --expect-env <label>      Operator-declared environment label.
 *   --allow-non-production-project <ref>
 *                             Explicitly declare a hosted Supabase project ref
 *                             as non-production (repeatable). Hosted targets
 *                             classify as `unknown` (stop-the-line) unless
 *                             declared here or in the env allowlist; only
 *                             loopback databases classify as non-production on
 *                             their own.
 *   --out <dir>               Proof output directory
 *                             (default var/document-cutover-proofs).
 *   --verify <proof.json>     Verify a stored proof file and exit (clean
 *                             proofs must also be within the freshness bound).
 *
 * Environment:
 *   DOCUMENT_CUTOVER_NON_PRODUCTION_PROJECTS  Comma-separated hosted project
 *                             refs that may classify as non-production.
 *   DOCUMENT_CUTOVER_OWNER_ALLOWLIST          Comma-separated owner ids
 *                             permitted to be recorded on proofs (when set).
 *   DOCUMENT_CUTOVER_APPROVER_ALLOWLIST       Comma-separated approver ids
 *                             permitted to be recorded on proofs (when set).
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
  PHASE_18_DESTRUCTIVE_CUTOVER_PLAN,
  assessDocumentCutoverEnvironment,
  recordDocumentCutoverApproval,
  verifyDocumentCutoverEnvironmentProof,
} from "../../packages/api/src/document-cutover";

import type {
  DocumentCutoverAssessment,
  DocumentCutoverBlockingReason,
  DocumentCutoverDetector,
  DocumentCutoverEnvironmentIdentity,
  DocumentCutoverEnvironmentProof,
  DocumentCutoverProofStore,
  DocumentCutoverSurfaceInspection,
} from "../../packages/api/src/document-cutover";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

const RESET_PROCEDURE = {
  reference: "docs/ops/document-cutover/reset-rebuild.md",
  pinnedVersion: "1",
};
const ROLLBACK_PROCEDURE = {
  reference:
    "docs/ops/document-cutover/rollback-before-first-canonical-write.md",
  pinnedVersion: "1",
};

type CliArgs = {
  decision?: "go" | "no_go";
  owner?: string;
  ownerRole?: string;
  approver?: string;
  statement?: string;
  expectProject?: string;
  expectEnv?: string;
  out: string;
  verify?: string;
  help?: boolean;
  allowNonProductionProjects: string[];
};

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    out: "var/document-cutover-proofs",
    allowNonProductionProjects: [],
  };

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
    else if (arg === "--approver") args.approver = next();
    else if (arg === "--statement") args.statement = next();
    else if (arg === "--expect-project") args.expectProject = next();
    else if (arg === "--expect-env") args.expectEnv = next();
    else if (arg === "--allow-non-production-project") {
      const ref = next();
      if (ref) args.allowNonProductionProjects.push(ref);
    } else if (arg === "--out") args.out = next() ?? args.out;
    else if (arg === "--verify") args.verify = next();
    else if (arg === "--help" || arg === "-h") args.help = true;
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

function nonProductionProjectAllowlist(
  cliAllowed: readonly string[],
): string[] {
  const fromEnv = (process.env.DOCUMENT_CUTOVER_NON_PRODUCTION_PROJECTS ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  return [...new Set([...fromEnv, ...cliAllowed])];
}

/** Comma-separated identity allowlist; undefined when the env var is unset. */
function parseIdentityAllowlist(raw: string | undefined): string[] | undefined {
  if (raw === undefined) return undefined;
  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/**
 * Classification never trusts the operator's runtime shell for a hosted
 * target: a remote Supabase project is `unknown` (stop-the-line) unless its
 * exact ref is explicitly declared non-production via the allowlist. Only
 * loopback databases classify as non-production on their own.
 */
async function resolveEnvironment(
  allowedNonProductionProjects: readonly string[],
): Promise<DocumentCutoverEnvironmentIdentity> {
  const env = {
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_TARGET_ENV: process.env.VERCEL_TARGET_ENV,
  };
  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const database = supabaseIdentity(supabaseUrl);

  let productionClassification: DocumentCutoverEnvironmentIdentity["productionClassification"];
  if (isProductionDeployment(env)) {
    productionClassification = "production";
  } else if (isProtectedNonProductionDeployment(env)) {
    productionClassification = "protected_non_production";
  } else if (database.kind === "local") {
    productionClassification = "non_production";
  } else if (
    database.kind === "hosted" &&
    allowedNonProductionProjects.includes(database.id)
  ) {
    productionClassification = "non_production";
  } else {
    productionClassification = "unknown";
  }

  return {
    environmentLabel: resolveDeploymentEnvironment(env),
    productionClassification,
    databaseProjectId: database.id,
    storageIdentity:
      database.id === "unknown" ? "unknown" : `${database.id}/storage/v1`,
    schemaVersion: latestMigrationVersion(),
    codeVersion: gitCommit(),
    deploymentVersion: process.env.VERCEL_DEPLOYMENT_ID,
  };
}

type SupabaseReadClient = ReturnType<typeof createClient> | null;

function createReadClient(): SupabaseReadClient {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function unavailable(query: string): DocumentCutoverSurfaceInspection {
  return {
    completeness: "indeterminate",
    detectorQuery: query,
    failure: {
      code: "permission_denied",
      message:
        "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for database evidence; unavailable services stop the line.",
    },
  };
}

function classifyPostgrestError(
  message: string,
): "permission_denied" | "unknown_schema" {
  const lowered = message.toLowerCase();
  if (
    lowered.includes("does not exist") ||
    lowered.includes("could not find") ||
    lowered.includes("schema cache")
  ) {
    return "unknown_schema";
  }
  return "permission_denied";
}

async function countRows(
  client: NonNullable<SupabaseReadClient>,
  table: string,
  filter?: (
    query: ReturnType<ReturnType<typeof client.from>["select"]>,
  ) => typeof query,
): Promise<{ count: number } | { error: string }> {
  let query = client.from(table).select("*", { count: "exact", head: true });
  if (filter) query = filter(query);
  const { count, error } = await query;
  if (error) return { error: error.message };
  return { count: count ?? 0 };
}

function tableDetector(client: SupabaseReadClient): DocumentCutoverDetector {
  return {
    detectorId: "supabase-table-census",
    detectorVersion: "1",
    surfaceKind: "database_table",
    surfaceIds: PHASE_18_DESTRUCTIVE_CUTOVER_PLAN.surfaces
      .filter((surface) => surface.surfaceKind === "database_table")
      .map((surface) => surface.surfaceId),
    async inspectSurface(table) {
      const detectorQuery = `select count(*) from public.${table}; select count(*) filter (where tenant_id is not null)`;
      if (!client) return unavailable(detectorQuery);

      const rows = await countRows(client, table);
      if ("error" in rows) {
        return {
          completeness: "indeterminate",
          detectorQuery,
          failure: {
            code: classifyPostgrestError(rows.error),
            message: rows.error,
          },
        };
      }

      const tenantRows = await countRows(client, table, (query) =>
        query.not("tenant_id", "is", null),
      );
      if ("error" in tenantRows) {
        return {
          completeness: "indeterminate",
          detectorQuery,
          failure: {
            code: classifyPostgrestError(tenantRows.error),
            message: tenantRows.error,
          },
        };
      }

      return {
        completeness: "complete",
        detectorQuery,
        relianceCounts: {
          rows: rows.count,
          tenants: tenantRows.count,
          ...(table === "pdf_template_audit_events"
            ? { retainedHistory: rows.count }
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
    detectorVersion: "2",
    surfaceKind: "storage_location",
    surfaceIds: ["pdf_template_artifacts.storage_objects"],
    async inspectSurface() {
      const detectorQuery =
        "count pdf_template_artifacts rows with storage references; list objects in every referenced or prototype-named storage bucket";
      if (!client) return unavailable(detectorQuery);

      const referencedRows = await countRows(
        client,
        "pdf_template_artifacts",
        (query) => query.not("storage_path", "is", null),
      );
      if ("error" in referencedRows) {
        return {
          completeness: "indeterminate",
          detectorQuery,
          failure: {
            code: classifyPostgrestError(referencedRows.error),
            message: referencedRows.error,
          },
        };
      }

      const { data: bucketRows, error: bucketRowsError } = await client
        .from("pdf_template_artifacts")
        .select("storage_bucket")
        .not("storage_bucket", "is", null)
        .limit(1000);
      if (bucketRowsError) {
        return {
          completeness: "indeterminate",
          detectorQuery,
          failure: {
            code: classifyPostgrestError(bucketRowsError.message),
            message: bucketRowsError.message,
          },
        };
      }

      const bucketsToInspect = new Set<string>(
        (bucketRows ?? [])
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
        return {
          completeness: "indeterminate",
          detectorQuery,
          failure: {
            code: "permission_denied",
            message: listBucketsError.message,
          },
        };
      }
      for (const bucket of allBuckets ?? []) {
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
          return {
            completeness: "indeterminate",
            detectorQuery,
            failure: { code: "permission_denied", message: listError.message },
          };
        }
        listedObjects += entries?.length ?? 0;
      }

      return {
        completeness: "complete",
        detectorQuery,
        relianceCounts: { objects: referencedRows.count + listedObjects },
        inventoryFindings: {
          referencedObjectRows: referencedRows.count,
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
    detectorVersion: "1",
    surfaceKind: "external_reference",
    surfaceIds: ["pdf_template_artifacts.external_urls"],
    async inspectSurface() {
      const detectorQuery =
        "select count(*), sample(url, 5) from public.pdf_template_artifacts where url is not null";
      if (!client) return unavailable(detectorQuery);

      const references = await countRows(
        client,
        "pdf_template_artifacts",
        (query) => query.not("url", "is", null),
      );
      if ("error" in references) {
        return {
          completeness: "indeterminate",
          detectorQuery,
          failure: {
            code: classifyPostgrestError(references.error),
            message: references.error,
          },
        };
      }

      let samples: string[] = [];
      if (references.count > 0) {
        const { data } = await client
          .from("pdf_template_artifacts")
          .select("url")
          .not("url", "is", null)
          .limit(5);
        samples = (data ?? [])
          .map((row) => (typeof row.url === "string" ? row.url : ""))
          .filter(Boolean);
      }

      return {
        completeness: "complete",
        detectorQuery,
        relianceCounts: { externalReferences: references.count },
        externalReferences: samples,
      };
    },
  };
}

function jobDetector(client: SupabaseReadClient): DocumentCutoverDetector {
  return {
    detectorId: "supabase-batch-job-census",
    detectorVersion: "1",
    surfaceKind: "background_job",
    surfaceIds: ["pdf_template_batch_jobs.queue"],
    async inspectSurface() {
      const detectorQuery =
        "select count(*) from public.pdf_template_batch_jobs";
      if (!client) return unavailable(detectorQuery);

      const jobs = await countRows(client, "pdf_template_batch_jobs");
      if ("error" in jobs) {
        return {
          completeness: "indeterminate",
          detectorQuery,
          failure: {
            code: classifyPostgrestError(jobs.error),
            message: jobs.error,
          },
        };
      }

      // Any queued job row is treated as an active reliance; the gate never
      // guesses which statuses are safe to abandon.
      return {
        completeness: "complete",
        detectorQuery,
        relianceCounts: { activeJobs: jobs.count },
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

class FileDocumentCutoverProofStore implements DocumentCutoverProofStore {
  constructor(private readonly directory: string) {
    mkdirSync(directory, { recursive: true });
  }

  private proofPath(proofId: string): string {
    return path.join(this.directory, `${proofId}.json`);
  }

  async append(proof: DocumentCutoverEnvironmentProof): Promise<void> {
    // "wx" makes the write append-only: an existing proof file never changes.
    await writeFile(
      this.proofPath(proof.proofId),
      JSON.stringify(proof, null, 2),
      {
        flag: "wx",
      },
    );
  }

  async getById(
    proofId: string,
  ): Promise<DocumentCutoverEnvironmentProof | null> {
    // Only a genuinely absent file is "not found"; an unreadable or corrupt
    // proof must surface loudly in a tamper-evidence store, never as null.
    try {
      return JSON.parse(readFileSync(this.proofPath(proofId), "utf8"));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw new Error(
        `Proof ${proofId} exists but cannot be read or parsed; treat the store as tampered.`,
        { cause: error },
      );
    }
  }

  async list(): Promise<DocumentCutoverEnvironmentProof[]> {
    return readdirSync(this.directory)
      .filter((name) => name.endsWith(".json"))
      .map((name) => {
        try {
          return JSON.parse(
            readFileSync(path.join(this.directory, name), "utf8"),
          ) as DocumentCutoverEnvironmentProof;
        } catch (error) {
          throw new Error(
            `Proof file ${name} cannot be read or parsed; treat the store as tampered.`,
            { cause: error },
          );
        }
      });
  }
}

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

async function verifyStoredProof(proofPath: string): Promise<number> {
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
  const result = await verifyDocumentCutoverEnvironmentProof(proof);

  if (result.valid && proof.outcome === "clean_preproduction_proof") {
    console.log(
      `VALID clean proof ${proof.proofId} for plan digest ${proof.planDigest}.`,
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

async function main(): Promise<number> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(
      "See the header of scripts/document-cutover/assess-document-cutover.ts for usage.",
    );
    return 0;
  }
  if (args.verify) {
    return verifyStoredProof(args.verify);
  }

  const client = createReadClient();
  const allowedNonProductionProjects = nonProductionProjectAllowlist(
    args.allowNonProductionProjects,
  );
  const assessment = await assessDocumentCutoverEnvironment({
    plan: PHASE_18_DESTRUCTIVE_CUTOVER_PLAN,
    resolveEnvironment: () => resolveEnvironment(allowedNonProductionProjects),
    detectors: [
      tableDetector(client),
      storageDetector(client),
      externalReferenceDetector(client),
      jobDetector(client),
      repoInventoryDetector("route"),
      repoInventoryDetector("configuration"),
      repoInventoryDetector("prototype_test"),
    ],
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
    },
  });

  printAssessment(assessment);

  if (!args.decision) {
    // Assess-only runs never mint a proof, and only a cryptographically
    // verified clean proof may exit zero.
    console.log(
      "\nAssess-only run: no proof recorded. Re-run with --decision to record one.",
    );
    return 1;
  }

  if (!args.owner || !args.ownerRole || !args.approver || !args.statement) {
    console.error(
      "--decision requires --owner, --owner-role, --approver, and --statement.",
    );
    return 1;
  }

  const store = new FileDocumentCutoverProofStore(
    path.resolve(repoRoot, args.out),
  );

  try {
    const proof = await recordDocumentCutoverApproval({
      assessment,
      owner: { ownerId: args.owner, ownerRole: args.ownerRole },
      approval: {
        approverId: args.approver,
        approvalStatement: args.statement,
        decision: args.decision,
      },
      attestation: {
        attestedBy: `cli:${os.userInfo().username}`,
        attestationContext: `git:${gitCommit()}`,
      },
      authorization: {
        allowedOwnerIds: parseIdentityAllowlist(
          process.env.DOCUMENT_CUTOVER_OWNER_ALLOWLIST,
        ),
        allowedApproverIds: parseIdentityAllowlist(
          process.env.DOCUMENT_CUTOVER_APPROVER_ALLOWLIST,
        ),
      },
      store,
    });

    const verification = await verifyDocumentCutoverEnvironmentProof(proof);
    console.log(
      `\nRecorded ${proof.outcome} proof ${proof.proofId} (digest ${proof.proofDigest.slice(0, 16)}…) in ${args.out}.`,
    );
    if (!verification.valid) {
      console.error("Recorded proof failed self-verification:");
      for (const failure of verification.failures) {
        console.error(`  - ${failure.code}: ${failure.detail}`);
      }
      return 1;
    }

    return proof.outcome === "clean_preproduction_proof" ? 0 : 1;
  } catch (error) {
    console.error(
      `\nApproval rejected: ${error instanceof Error ? error.message : error}`,
    );
    return 1;
  }
}

process.exitCode = await main();
