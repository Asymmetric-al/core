import { createHash } from "node:crypto";

import { z } from "zod";

import {
  EVE_LAUNCH_COMPOSITION_CHECK_IDS,
  EVE_LAUNCH_ENVIRONMENTS,
  EVE_LAUNCH_REVERSAL_CHECK_IDS,
  EVE_LAUNCH_RUNBOOKS,
  EVE_LAUNCH_SLICE_IDS,
} from "./types";

const sensitiveTextPattern =
  /(-----begin [^-]*private key-----|(?:password|secret|api[_ -]?key|private[_ -]?key|access[_ -]?token|raw[_ -]?prompt|chain[_ -]?of[_ -]?thought)["']?\s*[:=]|(?:sk_(?:live|test)|whsec|ghp|github_pat)_[a-z0-9_-]{8,}|eyJ[a-z0-9_-]{8,}\.[a-z0-9_-]{8,}\.[a-z0-9_-]{8,})/iu;

export const eveLaunchSafeTextSchema = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .refine((value) => !sensitiveTextPattern.test(value), {
    message: "Launch evidence must contain only safe summaries and references.",
  });

export const eveLaunchTargetSchema = z
  .object({
    deploymentId: z.string().regex(/^[A-Za-z0-9._:-]{1,200}$/u),
    environment: z.enum(EVE_LAUNCH_ENVIRONMENTS),
    evalConfigRevision: z.string().regex(/^[0-9a-f]{64}$/u),
    governanceStateVersion: z.number().int().positive(),
    migrationVersion: z.string().regex(/^\d{14}_[a-z0-9_]{1,100}$/u),
    modelPolicyRevision: z.string().regex(/^[0-9a-f]{64}$/u),
    policyVersion: z.number().int().positive(),
    revision: z.string().regex(/^[0-9a-f]{40}$/u),
  })
  .strict();

const evidenceSchema = z
  .object({
    digest: z.string().regex(/^[0-9a-f]{64}$/u),
    expiresAt: z.string().datetime({ offset: true }),
    kind: z.enum([
      "audit_event",
      "ci_check",
      "deployment_probe",
      "operator_exercise",
      "runbook_check",
      "test_report",
    ]),
    observedAt: z.string().datetime({ offset: true }),
    reference: eveLaunchSafeTextSchema,
    result: z.enum(["failed", "passed"]),
    summary: eveLaunchSafeTextSchema,
    target: eveLaunchTargetSchema,
  })
  .strict();

export const eveLaunchManifestDocumentSchema = z
  .object({
    composition: z.array(
      z
        .object({
          checkId: z.enum(EVE_LAUNCH_COMPOSITION_CHECK_IDS),
          evidence: evidenceSchema,
        })
        .strict(),
    ),
    expiresAt: z.string().datetime({ offset: true }),
    generatedAt: z.string().datetime({ offset: true }),
    observations: z.array(eveLaunchSafeTextSchema).max(20),
    reversal: z.array(
      z
        .object({
          checkId: z.enum(EVE_LAUNCH_REVERSAL_CHECK_IDS),
          evidence: evidenceSchema,
        })
        .strict(),
    ),
    runbooks: z.array(
      z
        .object({
          evidence: evidenceSchema,
          owner: eveLaunchSafeTextSchema,
          path: z.string().min(1).max(300),
          runbookId: z.enum(
            Object.keys(EVE_LAUNCH_RUNBOOKS) as [
              keyof typeof EVE_LAUNCH_RUNBOOKS,
              ...(keyof typeof EVE_LAUNCH_RUNBOOKS)[],
            ],
          ),
        })
        .strict(),
    ),
    schemaVersion: z.literal("eve-launch-manifest-v1"),
    slices: z.array(
      z
        .object({
          acceptanceEvidence: evidenceSchema,
          implementationRevision: z.string().regex(/^[0-9a-f]{40}$/u),
          operationalEvidence: evidenceSchema,
          responsibleReviewer: eveLaunchSafeTextSchema,
          runbookId: z.enum(
            Object.keys(EVE_LAUNCH_RUNBOOKS) as [
              keyof typeof EVE_LAUNCH_RUNBOOKS,
              ...(keyof typeof EVE_LAUNCH_RUNBOOKS)[],
            ],
          ),
          sliceId: z.enum(EVE_LAUNCH_SLICE_IDS),
          status: z.enum(["draft_only", "implemented", "open_work"]),
        })
        .strict(),
    ),
    target: eveLaunchTargetSchema,
  })
  .strict();

export const eveLaunchReviewSchema = z
  .object({
    decision: z.enum(["approved", "rejected"]),
    manifestId: z.string().uuid(),
    reviewerRole: z.enum(["release", "security"]),
    summary: eveLaunchSafeTextSchema,
  })
  .strict();

export const eveLaunchPermissionMutationSchema = z
  .object({
    enabled: z.boolean(),
    permission: z.enum(["release.review", "release.activate"]),
    profileId: z.string().uuid(),
    reason: eveLaunchSafeTextSchema,
  })
  .strict();

export function normalizeEveLaunchManifest(
  document: z.infer<typeof eveLaunchManifestDocumentSchema>,
) {
  return {
    ...document,
    composition: [...document.composition].sort((left, right) =>
      left.checkId.localeCompare(right.checkId),
    ),
    reversal: [...document.reversal].sort((left, right) =>
      left.checkId.localeCompare(right.checkId),
    ),
    runbooks: [...document.runbooks].sort((left, right) =>
      left.runbookId.localeCompare(right.runbookId),
    ),
    slices: [...document.slices].sort((left, right) =>
      left.sliceId.localeCompare(right.sliceId),
    ),
  };
}

export function hashEveLaunchManifest(document: unknown): string {
  const parsed = eveLaunchManifestDocumentSchema.parse(document);
  const normalized = normalizeEveLaunchManifest(parsed);
  return createHash("sha256").update(JSON.stringify(normalized)).digest("hex");
}
