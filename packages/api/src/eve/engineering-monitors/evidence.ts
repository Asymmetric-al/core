import { createHash } from "node:crypto";

import { z } from "zod";

import { classifyEveAdminMemoryExclusions } from "../admin-memory";
import {
  EVE_ENGINEERING_FINDING_SEVERITIES,
  type EveEngineeringFinding,
  type EveEngineeringFindingSeverity,
  type EveEngineeringMonitorConfig,
  type EveEngineeringMonitorEvidence,
} from "./types";

const safeUrlSchema = z
  .string()
  .url()
  .refine((value) => new URL(value).hostname === "github.com", {
    message: "Engineering monitor evidence must link to github.com.",
  });

const evidenceBaseSchema = z.object({
  observedAt: z.string().datetime({ offset: true }),
  repository: z.literal("Asymmetric-al/core"),
  safeUrl: safeUrlSchema,
  targetId: z.string().trim().min(1).max(300),
  targetRevision: z.string().trim().min(1).max(100),
});

const evidenceSchema = z.discriminatedUnion("type", [
  evidenceBaseSchema.extend({
    type: z.literal("ci_failure"),
    checkId: z.string().trim().min(1).max(100),
    conclusion: z.enum([
      "failure",
      "timed_out",
      "cancelled",
      "action_required",
    ]),
    workflowName: z.string().trim().min(1).max(300),
  }),
  evidenceBaseSchema.extend({
    type: z.literal("stale_pull_request"),
    blocked: z.boolean(),
    draft: z.boolean(),
    lastActivityAt: z.string().datetime({ offset: true }),
    pullRequestNumber: z.number().int().positive(),
    thresholdSeconds: z.number().int().positive(),
  }),
  evidenceBaseSchema.extend({
    type: z.literal("failing_eval"),
    caseId: z.string().trim().min(1).max(300),
    deterministicStatus: z.literal("failed"),
    judgeStatus: z.enum(["failed", "not_used"]).optional(),
    suite: z.string().trim().min(1).max(300),
  }),
  evidenceBaseSchema.extend({
    type: z.literal("dependency_security_alert"),
    advisoryId: z.string().trim().min(1).max(300),
    affectedScope: z.string().trim().min(1).max(500),
    alertSource: z.enum(["code_scanning", "dependabot"]),
    advisorySeverity: z.enum(EVE_ENGINEERING_FINDING_SEVERITIES),
  }),
  evidenceBaseSchema.extend({
    type: z.literal("protected_area_pull_request"),
    matchedRules: z.array(z.string().trim().min(1).max(200)).min(1).max(50),
    pullRequestNumber: z.number().int().positive(),
    reviewState: z.string().trim().min(1).max(100),
  }),
  evidenceBaseSchema.extend({
    type: z.literal("budget_rate_limit"),
    remaining: z.number().int().nonnegative(),
    resetAt: z.string().datetime({ offset: true }),
    scope: z.string().trim().min(1).max(200),
    status: z.enum(["near_limit", "exhausted"]),
    total: z.number().int().positive(),
  }),
]);

function selectSeverity(
  evidence: EveEngineeringMonitorEvidence,
  config: EveEngineeringMonitorConfig,
): EveEngineeringFindingSeverity {
  const key =
    evidence.type === "ci_failure"
      ? evidence.conclusion
      : evidence.type === "stale_pull_request"
        ? evidence.blocked
          ? "blocked"
          : "default"
        : evidence.type === "dependency_security_alert"
          ? evidence.advisorySeverity
          : evidence.type === "budget_rate_limit"
            ? evidence.status
            : "default";
  return config.severityRules[key] ?? "medium";
}

export function createEveEngineeringFindingDedupeKey(input: {
  evidence: EveEngineeringMonitorEvidence;
  monitorId: string;
}): string {
  const rolling =
    input.evidence.type === "stale_pull_request" ||
    input.evidence.type === "budget_rate_limit";
  return createHash("sha256")
    .update(
      JSON.stringify({
        monitorId: input.monitorId,
        signalType: input.evidence.type,
        targetId: input.evidence.targetId,
        targetRevision: rolling ? "rolling" : input.evidence.targetRevision,
      }),
    )
    .digest("hex");
}

export function prepareEveEngineeringFinding(input: {
  config: EveEngineeringMonitorConfig;
  evidence: unknown;
  existing?: EveEngineeringFinding;
  now: string;
  runId: string;
}): EveEngineeringFinding {
  const evidence = evidenceSchema.parse(input.evidence);
  if (evidence.type !== input.config.type) {
    throw new Error("Engineering monitor evidence type does not match config.");
  }
  const now = Date.parse(
    z.string().datetime({ offset: true }).parse(input.now),
  );
  const observedAt = Date.parse(evidence.observedAt);
  if (
    observedAt > now + 60_000 ||
    now - observedAt > input.config.freshnessWindowSeconds * 1_000
  ) {
    throw new Error("Engineering monitor evidence is stale.");
  }
  if (classifyEveAdminMemoryExclusions(JSON.stringify(evidence)).length > 0) {
    throw new Error("Engineering monitor evidence crossed a data boundary.");
  }
  const dedupeKey = createEveEngineeringFindingDedupeKey({
    evidence,
    monitorId: input.config.id,
  });
  if (input.existing && input.existing.dedupeKey !== dedupeKey) {
    throw new Error("Existing engineering finding has a different dedupe key.");
  }
  return {
    id: input.existing?.id ?? crypto.randomUUID(),
    tenantId: input.config.tenantId,
    monitorId: input.config.id,
    runId: input.runId,
    signalType: evidence.type,
    targetId: evidence.targetId,
    targetRevision: evidence.targetRevision,
    firstObservedAt: input.existing?.firstObservedAt ?? evidence.observedAt,
    lastObservedAt: evidence.observedAt,
    severity: selectSeverity(evidence, input.config),
    status:
      input.existing?.status === "resolved" ||
      input.existing?.status === "stale"
        ? "open"
        : (input.existing?.status ?? "open"),
    dedupeKey,
    policyVersion: input.config.policyVersion,
    safeEvidence: evidence,
    decisionSummary: `${evidence.type} observed for ${evidence.targetId} at revision ${evidence.targetRevision}.`,
    observationCount: (input.existing?.observationCount ?? 0) + 1,
  };
}
