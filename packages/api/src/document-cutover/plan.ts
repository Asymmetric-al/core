import { digestCanonicalValue } from "./canonical";

import type {
  DestructiveCutoverPlan,
  DestructiveCutoverPlanSurface,
  DocumentCutoverBlockingReason,
  DocumentCutoverDetector,
  DocumentCutoverSurfaceEvidence,
} from "./types";

/**
 * The exact Phase 18 prototype document surface inventory named by the cutover
 * contract. This list is the plan/evidence contract itself: the assessment
 * covers every surface here, and the detector-completeness check fails when a
 * plan surface has no detector or a detector covers an undeclared surface.
 */
export const PHASE_18_PROTOTYPE_DOCUMENT_TABLES = [
  "pdf_templates",
  "pdf_template_versions",
  "pdf_template_renders",
  "pdf_template_artifacts",
  "pdf_template_audit_events",
  "pdf_template_batches",
  "pdf_template_batch_jobs",
  "contribution_receipt_snapshots",
  "gift_receipt_records",
] as const;

export const PHASE_18_PROTOTYPE_STORAGE_LOCATIONS = [
  "pdf_template_artifacts.storage_objects",
] as const;

export const PHASE_18_PROTOTYPE_ROUTES = [
  "apps/admin/app/api/pdf-templates/route.ts",
  "apps/admin/app/api/pdf-templates/[templateId]/route.ts",
  "apps/admin/app/api/pdf-templates/native/preview/route.ts",
  "apps/admin/app/api/pdf-templates/native/render/route.ts",
  "apps/admin/app/api/pdf-templates/native/migration-report/route.ts",
  "apps/admin/app/pdf/page.tsx",
  "apps/admin/app/api/admin/contribution-operations/receipt-snapshots/[snapshotId]/pdf/route.ts",
  "apps/admin/app/api/admin/contributions/staged-gifts/[stagedGiftId]/receipt/route.ts",
  "apps/donor/app/api/donor/receipts/[donationId]/route.ts",
  "apps/donor/app/api/donor/statements/[year]/route.ts",
] as const;

export const PHASE_18_PROTOTYPE_JOBS = [
  "pdf_template_batch_jobs.queue",
] as const;

export const PHASE_18_PROTOTYPE_CONFIGURATION = [
  "packages/env/src/schema.ts#DOCRAPTOR_API_KEY",
  "packages/env/src/schema.ts#PDF_STUDIO_*",
  "packages/config/pdf-studio-native.ts",
  "vendor/react-pdf-packages",
] as const;

export const PHASE_18_PROTOTYPE_TESTS = [
  "tests/unit/packages/api/pdf-templates.test.ts",
  "tests/unit/packages/api/pdf-template-store.test.ts",
  "tests/unit/packages/api/pdf-template-native-migration.test.ts",
  "tests/unit/packages/api/pdf-studio-docraptor.test.ts",
  "tests/unit/packages/api/pdf-studio-native-adapter.test.ts",
  "tests/unit/packages/api/pdf-studio-native-routes.test.ts",
  "tests/unit/packages/api/admin/contribution-receipt-pdf.test.ts",
  "tests/unit/packages/api/giving-receipt-record.test.ts",
  "tests/unit/apps/admin/pdf-studio-native-ui.test.ts",
  "tests/unit/supabase/gift-receipt-records-migration.test.ts",
] as const;

export const PHASE_18_EXTERNAL_REFERENCE_SURFACES = [
  "pdf_template_artifacts.external_urls",
] as const;

function tableSurface(surfaceId: string): DestructiveCutoverPlanSurface {
  return {
    surfaceKind: "database_table",
    surfaceId,
    action: "drop_table",
    description: `Drop prototype table ${surfaceId} after the gate proves it carries no reliance.`,
  };
}

export const PHASE_18_DESTRUCTIVE_CUTOVER_PLAN: DestructiveCutoverPlan = {
  planId: "phase-18-prototype-document-cutover",
  planTitle:
    "Phase 18 clean cutover: remove every prototype generated-document surface",
  planVersion: "1",
  surfaces: [
    ...PHASE_18_PROTOTYPE_DOCUMENT_TABLES.map(tableSurface),
    ...PHASE_18_PROTOTYPE_STORAGE_LOCATIONS.map(
      (surfaceId): DestructiveCutoverPlanSurface => ({
        surfaceKind: "storage_location",
        surfaceId,
        action: "delete_objects",
        description:
          "Delete artifact objects referenced by pdf_template_artifacts storage columns.",
      }),
    ),
    ...PHASE_18_PROTOTYPE_ROUTES.map(
      (surfaceId): DestructiveCutoverPlanSurface => ({
        surfaceKind: "route",
        surfaceId,
        action: "remove_route",
        description: `Remove prototype document route ${surfaceId}.`,
      }),
    ),
    ...PHASE_18_PROTOTYPE_JOBS.map(
      (surfaceId): DestructiveCutoverPlanSurface => ({
        surfaceKind: "background_job",
        surfaceId,
        action: "remove_job",
        description:
          "Remove the prototype batch-job queue; the gate proves no job is active.",
      }),
    ),
    ...PHASE_18_PROTOTYPE_CONFIGURATION.map(
      (surfaceId): DestructiveCutoverPlanSurface => ({
        surfaceKind: "configuration",
        surfaceId,
        action: "remove_configuration",
        description: `Remove prototype document configuration surface ${surfaceId}.`,
      }),
    ),
    ...PHASE_18_PROTOTYPE_TESTS.map(
      (surfaceId): DestructiveCutoverPlanSurface => ({
        surfaceKind: "prototype_test",
        surfaceId,
        action: "remove_test",
        description: `Remove prototype document test ${surfaceId}.`,
      }),
    ),
    ...PHASE_18_EXTERNAL_REFERENCE_SURFACES.map(
      (surfaceId): DestructiveCutoverPlanSurface => ({
        surfaceKind: "external_reference",
        surfaceId,
        action: "sever_external_reference",
        description:
          "Prove no externally shared artifact URL still relies on prototype storage.",
      }),
    ),
  ],
};

export async function digestDestructiveCutoverPlan(
  plan: DestructiveCutoverPlan,
): Promise<string> {
  return digestCanonicalValue(plan);
}

export function validateDestructiveCutoverPlan(
  plan: DestructiveCutoverPlan,
): DocumentCutoverBlockingReason[] {
  const reasons: DocumentCutoverBlockingReason[] = [];

  if (!plan.planId.trim() || !plan.planVersion.trim()) {
    reasons.push({
      code: "plan_invalid",
      explanation: "The destructive plan must carry a stable id and version.",
    });
  }

  if (plan.surfaces.length === 0) {
    reasons.push({
      code: "plan_invalid",
      explanation:
        "The destructive plan names no surfaces; an empty plan cannot be assessed.",
    });
  }

  const seen = new Set<string>();
  for (const surface of plan.surfaces) {
    const key = `${surface.surfaceKind}:${surface.surfaceId}`;
    if (seen.has(key)) {
      reasons.push({
        code: "plan_invalid",
        surfaceKind: surface.surfaceKind,
        surfaceId: surface.surfaceId,
        explanation: `The destructive plan lists ${key} more than once.`,
      });
    }
    seen.add(key);

    if (!surface.surfaceId.trim()) {
      reasons.push({
        code: "plan_invalid",
        surfaceKind: surface.surfaceKind,
        explanation: "A plan surface is missing its surface id.",
      });
    }
  }

  return reasons;
}

/**
 * Both directions of detector completeness: every plan surface needs exactly
 * one covering detector, and no detector may cover a surface the plan does not
 * declare. Either violation blocks the assessment.
 */
export function checkDetectorCompleteness(
  plan: DestructiveCutoverPlan,
  detectors: readonly DocumentCutoverDetector[],
): DocumentCutoverBlockingReason[] {
  const reasons: DocumentCutoverBlockingReason[] = [];
  const planSurfaces = new Set(
    plan.surfaces.map(
      (surface) => `${surface.surfaceKind}:${surface.surfaceId}`,
    ),
  );

  const covered = new Map<string, string>();
  for (const detector of detectors) {
    for (const surfaceId of detector.surfaceIds) {
      const key = `${detector.surfaceKind}:${surfaceId}`;
      if (!planSurfaces.has(key)) {
        reasons.push({
          code: "detector_without_plan_surface",
          surfaceKind: detector.surfaceKind,
          surfaceId,
          explanation: `Detector ${detector.detectorId} covers ${key}, which the destructive plan does not declare.`,
        });
        continue;
      }
      const existing = covered.get(key);
      if (existing && existing !== detector.detectorId) {
        reasons.push({
          code: "plan_invalid",
          surfaceKind: detector.surfaceKind,
          surfaceId,
          explanation: `Surface ${key} is claimed by both ${existing} and ${detector.detectorId}; coverage must be unambiguous.`,
        });
      }
      covered.set(key, detector.detectorId);
    }
  }

  for (const surface of plan.surfaces) {
    const key = `${surface.surfaceKind}:${surface.surfaceId}`;
    if (!covered.has(key)) {
      reasons.push({
        code: "plan_surface_without_detector",
        surfaceKind: surface.surfaceKind,
        surfaceId: surface.surfaceId,
        explanation: `Plan surface ${key} has no detector, so its state is unknown.`,
      });
    }
  }

  return reasons;
}

/**
 * Every plan surface must be covered by exactly one evidence record and no
 * evidence record may describe a surface outside the plan. Returns
 * human-readable gap descriptions; an empty array means coverage is exact.
 */
export function checkPlanEvidenceCoverage(
  plan: DestructiveCutoverPlan,
  evidence: readonly DocumentCutoverSurfaceEvidence[],
): string[] {
  const gaps: string[] = [];
  const planKeys = new Set(
    plan.surfaces.map(
      (surface) => `${surface.surfaceKind}:${surface.surfaceId}`,
    ),
  );

  const seen = new Map<string, number>();
  for (const item of evidence) {
    const key = `${item.surfaceKind}:${item.surfaceId}`;
    seen.set(key, (seen.get(key) ?? 0) + 1);
    if (!planKeys.has(key)) {
      gaps.push(`evidence for undeclared surface ${key}`);
    }
  }

  for (const key of planKeys) {
    const count = seen.get(key) ?? 0;
    if (count === 0) {
      gaps.push(`no evidence for plan surface ${key}`);
    } else if (count > 1) {
      gaps.push(`duplicate evidence for plan surface ${key}`);
    }
  }

  return gaps.sort();
}
