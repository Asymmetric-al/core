import {
  DOCUMENT_CUTOVER_SERIALIZER_VERSION,
  compareOrdinal,
  digestCanonicalValue,
} from "./canonical";
import {
  checkDetectorCompleteness,
  digestDestructiveCutoverPlan,
  validateDestructiveCutoverPlan,
} from "./plan";
import { redactDiagnosticText, redactExternalReference } from "./redaction";
import {
  DOCUMENT_CUTOVER_PROOF_SCHEMA_VERSION,
  DOCUMENT_CUTOVER_TOOL_VERSION,
} from "./types";

import type {
  DestructiveCutoverPlan,
  DocumentCutoverAssessment,
  DocumentCutoverBlockingCode,
  DocumentCutoverBlockingReason,
  DocumentCutoverDetector,
  DocumentCutoverEnvironmentIdentity,
  DocumentCutoverProcedureReference,
  DocumentCutoverProcedureSet,
  DocumentCutoverRelianceCountKey,
  DocumentCutoverSurfaceEvidence,
  DocumentCutoverSurfaceInspection,
} from "./types";

const DEFAULT_DETECTOR_TIMEOUT_MS = 30_000;

const RELIANCE_REASON_BY_KEY: Record<
  DocumentCutoverRelianceCountKey,
  DocumentCutoverBlockingCode
> = {
  tenants: "tenant_data_present",
  users: "user_data_present",
  rows: "rows_present",
  objects: "storage_objects_present",
  externalReferences: "external_reference_present",
  retainedHistory: "retained_history_present",
  activeJobs: "active_job_present",
};

export interface DocumentCutoverProcedureInput {
  reference: string;
  pinnedVersion: string;
  /**
   * Trusted content digest for the pinned procedure version. Required: a
   * version label alone cannot vouch for altered procedure text. On-disk
   * content that no longer matches this digest stops the line.
   */
  expectedDigest: string;
}

export interface AssessDocumentCutoverEnvironmentInput {
  plan: DestructiveCutoverPlan;
  /** Server-side resolver for the actual target environment. */
  resolveEnvironment: () => Promise<DocumentCutoverEnvironmentIdentity>;
  detectors: readonly DocumentCutoverDetector[];
  procedures: {
    resetRebuild: DocumentCutoverProcedureInput;
    rollbackBeforeFirstCanonicalWrite: DocumentCutoverProcedureInput;
  };
  /** Read-only loader for procedure documents; null means missing. */
  readProcedure: (reference: string) => Promise<string | null>;
  /**
   * Operator-declared expectation of the target. Any mismatch with the
   * server-resolved identity stops the line; an operator cannot substitute a
   * different environment by pointing the tool somewhere else.
   */
  expectedEnvironment?: {
    databaseProjectId?: string;
    environmentLabel?: string;
  };
  detectorTimeoutMs?: number;
  now?: () => Date;
  generateId?: () => string;
}

async function inspectWithTimeout(
  detector: DocumentCutoverDetector,
  surfaceId: string,
  timeoutMs: number,
): Promise<DocumentCutoverSurfaceInspection> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    const timeout = new Promise<DocumentCutoverSurfaceInspection>((resolve) => {
      timer = setTimeout(() => {
        resolve({
          completeness: "indeterminate",
          detectorQuery: `${detector.detectorId} timed out after ${timeoutMs}ms`,
          failure: {
            code: "detector_timeout",
            message: `Detector ${detector.detectorId} exceeded ${timeoutMs}ms for ${surfaceId}.`,
          },
        });
      }, timeoutMs);
    });

    return await Promise.race([detector.inspectSurface(surfaceId), timeout]);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown detector failure";
    return {
      completeness: "indeterminate",
      detectorQuery: `${detector.detectorId} threw before producing evidence`,
      failure: {
        code: "detector_error",
        message: redactDiagnosticText(message),
      },
    };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function buildSurfaceEvidence(
  detector: DocumentCutoverDetector,
  surfaceId: string,
  inspection: DocumentCutoverSurfaceInspection,
): Promise<DocumentCutoverSurfaceEvidence> {
  const failure = inspection.failure
    ? {
        code: inspection.failure.code,
        message: redactDiagnosticText(inspection.failure.message),
      }
    : undefined;

  const body = {
    surfaceKind: detector.surfaceKind,
    surfaceId,
    detectorId: detector.detectorId,
    detectorVersion: detector.detectorVersion,
    completeness: inspection.completeness,
    relianceCounts: inspection.relianceCounts ?? {},
    inventoryFindings: inspection.inventoryFindings ?? {},
    externalReferenceSummaries: (inspection.externalReferences ?? []).map(
      redactExternalReference,
    ),
    detectorQuery: inspection.detectorQuery,
    failure,
  };

  return {
    ...body,
    evidenceDigest: await digestCanonicalValue(body),
  };
}

async function resolveProcedureReference(
  input: DocumentCutoverProcedureInput,
  readProcedure: (reference: string) => Promise<string | null>,
): Promise<DocumentCutoverProcedureReference> {
  let content: string | null = null;
  try {
    content = await readProcedure(input.reference);
  } catch {
    content = null;
  }

  return {
    reference: input.reference,
    pinnedVersion: input.pinnedVersion,
    present: content !== null,
    digest: content === null ? "" : await digestCanonicalValue(content),
  };
}

function procedureReasons(
  name: string,
  procedure: DocumentCutoverProcedureReference,
  expectedDigest: string,
): DocumentCutoverBlockingReason[] {
  const reasons: DocumentCutoverBlockingReason[] = [];

  if (!procedure.present) {
    reasons.push({
      code: "procedure_missing",
      explanation: `The ${name} procedure at ${procedure.reference} is missing; the cutover cannot proceed without it.`,
    });
  }
  if (!procedure.pinnedVersion.trim()) {
    reasons.push({
      code: "procedure_unpinned",
      explanation: `The ${name} procedure at ${procedure.reference} has no pinned version.`,
    });
  }
  if (!expectedDigest.trim()) {
    reasons.push({
      code: "procedure_unpinned",
      explanation: `The ${name} procedure at ${procedure.reference} has no trusted content digest; a version label alone is not a pin.`,
    });
  } else if (procedure.present && procedure.digest !== expectedDigest) {
    reasons.push({
      code: "procedure_digest_mismatch",
      explanation: `The ${name} procedure at ${procedure.reference} does not match its trusted pinned digest; the on-disk document was altered after pinning.`,
    });
  }

  return reasons;
}

function environmentReasons(
  environment: DocumentCutoverEnvironmentIdentity | null,
  expected: AssessDocumentCutoverEnvironmentInput["expectedEnvironment"],
  resolutionDetail?: string,
): DocumentCutoverBlockingReason[] {
  if (environment === null) {
    const detail = resolutionDetail
      ? ` Resolver detail: ${resolutionDetail}`
      : "";
    return [
      {
        code: "environment_resolution_failed",
        explanation: `The target environment could not be resolved on the server; nothing can be assessed.${detail}`,
      },
    ];
  }

  const reasons: DocumentCutoverBlockingReason[] = [];

  if (
    environment.productionClassification === "production" ||
    environment.productionClassification === "protected_non_production"
  ) {
    reasons.push({
      code: "production_classification",
      explanation: `The target is classified ${environment.productionClassification}; destructive document cutover is only assessable against unprotected pre-production targets.`,
    });
  }
  if (environment.productionClassification === "unknown") {
    reasons.push({
      code: "unknown_environment_classification",
      explanation:
        "The target environment classification is unknown; unknown always stops the line.",
    });
  }

  if (
    expected?.databaseProjectId &&
    expected.databaseProjectId !== environment.databaseProjectId
  ) {
    reasons.push({
      code: "environment_identity_mismatch",
      explanation:
        "The server-resolved database identity does not match the operator-declared target.",
    });
  }
  if (
    expected?.environmentLabel &&
    expected.environmentLabel !== environment.environmentLabel
  ) {
    reasons.push({
      code: "environment_identity_mismatch",
      explanation:
        "The server-resolved environment label does not match the operator-declared target.",
    });
  }

  return reasons;
}

function evidenceReasons(
  evidence: DocumentCutoverSurfaceEvidence,
): DocumentCutoverBlockingReason[] {
  const reasons: DocumentCutoverBlockingReason[] = [];
  const location = {
    surfaceKind: evidence.surfaceKind,
    surfaceId: evidence.surfaceId,
  };

  if (evidence.failure) {
    reasons.push({
      code: evidence.failure.code,
      ...location,
      explanation: evidence.failure.message,
    });
  } else if (evidence.completeness === "indeterminate") {
    reasons.push({
      code: "detector_incomplete",
      ...location,
      explanation: `Detector ${evidence.detectorId} could not fully inspect ${evidence.surfaceId}; indeterminate evidence stops the line.`,
    });
  }

  for (const [key, count] of Object.entries(evidence.relianceCounts)) {
    if (typeof count === "number" && count !== 0) {
      reasons.push({
        code: RELIANCE_REASON_BY_KEY[key as DocumentCutoverRelianceCountKey],
        ...location,
        explanation:
          count < 0
            ? `${evidence.surfaceId} reports impossible negative ${key} (${count}); forged or corrupt evidence stops the line.`
            : `${evidence.surfaceId} reports ${count} ${key}; any reliance stops the line.`,
      });
    }
  }

  return reasons;
}

/**
 * Read-only, rerunnable pre-production cutover assessment. It never mutates
 * the inspected database or object store: the only collaborators it calls are
 * the injected environment resolver, detectors, and procedure reader, all of
 * which are inspection seams by contract.
 */
export async function assessDocumentCutoverEnvironment(
  input: AssessDocumentCutoverEnvironmentInput,
): Promise<DocumentCutoverAssessment> {
  const now = input.now ?? (() => new Date());
  const generateId = input.generateId ?? (() => crypto.randomUUID());
  const timeoutMs = input.detectorTimeoutMs ?? DEFAULT_DETECTOR_TIMEOUT_MS;
  const startedAt = now().toISOString();

  const blockingReasons: DocumentCutoverBlockingReason[] = [];

  blockingReasons.push(...validateDestructiveCutoverPlan(input.plan));
  blockingReasons.push(
    ...checkDetectorCompleteness(input.plan, input.detectors),
  );

  let environment: DocumentCutoverEnvironmentIdentity | null = null;
  let environmentResolutionDetail: string | undefined;
  try {
    environment = await input.resolveEnvironment();
  } catch (error) {
    environment = null;
    environmentResolutionDetail = redactDiagnosticText(
      error instanceof Error ? error.message : "Unknown resolver failure",
    );
  }
  blockingReasons.push(
    ...environmentReasons(
      environment,
      input.expectedEnvironment,
      environmentResolutionDetail,
    ),
  );

  const planSurfaceKeys = new Set(
    input.plan.surfaces.map(
      (surface) => `${surface.surfaceKind}:${surface.surfaceId}`,
    ),
  );

  // Surfaces are independent read-only inspections, so they run concurrently;
  // the deterministic ordinal sort below fixes the recorded order.
  const evidence: DocumentCutoverSurfaceEvidence[] = await Promise.all(
    input.detectors.flatMap((detector) =>
      detector.surfaceIds
        .filter((surfaceId) =>
          planSurfaceKeys.has(`${detector.surfaceKind}:${surfaceId}`),
        )
        .map(async (surfaceId) => {
          const inspection = await inspectWithTimeout(
            detector,
            surfaceId,
            timeoutMs,
          );
          return buildSurfaceEvidence(detector, surfaceId, inspection);
        }),
    ),
  );
  evidence.sort((left, right) =>
    compareOrdinal(
      `${left.surfaceKind}:${left.surfaceId}`,
      `${right.surfaceKind}:${right.surfaceId}`,
    ),
  );

  for (const item of evidence) {
    blockingReasons.push(...evidenceReasons(item));
  }

  const procedures: DocumentCutoverProcedureSet = {
    resetRebuild: await resolveProcedureReference(
      input.procedures.resetRebuild,
      input.readProcedure,
    ),
    rollbackBeforeFirstCanonicalWrite: await resolveProcedureReference(
      input.procedures.rollbackBeforeFirstCanonicalWrite,
      input.readProcedure,
    ),
  };
  blockingReasons.push(
    ...procedureReasons(
      "fresh reset/rebuild",
      procedures.resetRebuild,
      input.procedures.resetRebuild.expectedDigest,
    ),
    ...procedureReasons(
      "rollback-before-first-canonical-write",
      procedures.rollbackBeforeFirstCanonicalWrite,
      input.procedures.rollbackBeforeFirstCanonicalWrite.expectedDigest,
    ),
  );

  const hasIndeterminateEvidence = evidence.some(
    (item) => item.completeness === "indeterminate",
  );
  const hasCoverageGap = blockingReasons.some(
    (reason) =>
      reason.code === "plan_surface_without_detector" ||
      reason.code === "detector_without_plan_surface",
  );
  const status =
    environment === null || hasIndeterminateEvidence || hasCoverageGap
      ? "incomplete"
      : "complete";

  return {
    assessmentId: generateId(),
    proofSchemaVersion: DOCUMENT_CUTOVER_PROOF_SCHEMA_VERSION,
    toolVersion: DOCUMENT_CUTOVER_TOOL_VERSION,
    serializerVersion: DOCUMENT_CUTOVER_SERIALIZER_VERSION,
    environment,
    startedAt,
    completedAt: now().toISOString(),
    status,
    plan: input.plan,
    planDigest: await digestDestructiveCutoverPlan(input.plan),
    procedures,
    evidence,
    proposedOutcome:
      blockingReasons.length === 0 && status === "complete"
        ? "clean_preproduction_proof"
        : "stop_the_line",
    blockingReasons,
  };
}
