import { eveLaunchManifestDocumentSchema } from "./schema";
import {
  EVE_LAUNCH_COMPOSITION_CHECK_IDS,
  EVE_LAUNCH_REVERSAL_CHECK_IDS,
  EVE_LAUNCH_RUNBOOKS,
  EVE_LAUNCH_SLICE_IDS,
} from "./types";

import type {
  EveLaunchEvidence,
  EveLaunchManifestDocument,
  EveLaunchReadinessEvaluation,
  EveLaunchTarget,
} from "./types";

const MAX_MANIFEST_LIFETIME_MS = 24 * 60 * 60 * 1_000;
const MAX_EVIDENCE_LIFETIME_MS = 24 * 60 * 60 * 1_000;

function sameTarget(left: EveLaunchTarget, right: EveLaunchTarget): boolean {
  return (
    left.deploymentId === right.deploymentId &&
    left.environment === right.environment &&
    left.evalConfigRevision === right.evalConfigRevision &&
    left.governanceStateVersion === right.governanceStateVersion &&
    left.migrationVersion === right.migrationVersion &&
    left.modelPolicyRevision === right.modelPolicyRevision &&
    left.policyVersion === right.policyVersion &&
    left.revision === right.revision
  );
}

function requireExactIds(input: {
  actual: readonly string[];
  expected: readonly string[];
  label: string;
  blockers: string[];
}) {
  const actual = new Set(input.actual);
  if (actual.size !== input.actual.length) {
    input.blockers.push(`${input.label}_contains_duplicates`);
  }
  for (const required of input.expected) {
    if (!actual.has(required)) {
      input.blockers.push(`${input.label}_missing:${required}`);
    }
  }
  for (const value of actual) {
    if (!input.expected.includes(value)) {
      input.blockers.push(`${input.label}_unexpected:${value}`);
    }
  }
}

function evaluateEvidence(input: {
  blockers: string[];
  evidence: EveLaunchEvidence;
  generatedAt: number;
  label: string;
  nowMs: number;
  target: EveLaunchTarget;
}) {
  if (input.evidence.result !== "passed") {
    input.blockers.push(`${input.label}_failed`);
  }
  if (!sameTarget(input.evidence.target, input.target)) {
    input.blockers.push(`${input.label}_target_mismatch`);
  }
  const observedAt = Date.parse(input.evidence.observedAt);
  const expiresAt = Date.parse(input.evidence.expiresAt);
  if (!Number.isFinite(observedAt) || observedAt > input.nowMs) {
    input.blockers.push(`${input.label}_invalid_observation_time`);
  }
  if (observedAt > input.generatedAt) {
    input.blockers.push(`${input.label}_observed_after_manifest_generation`);
  }
  if (observedAt < input.nowMs - MAX_EVIDENCE_LIFETIME_MS) {
    input.blockers.push(`${input.label}_observation_stale`);
  }
  if (!Number.isFinite(expiresAt) || expiresAt <= input.nowMs) {
    input.blockers.push(`${input.label}_stale`);
  }
  if (expiresAt - observedAt > MAX_EVIDENCE_LIFETIME_MS) {
    input.blockers.push(`${input.label}_freshness_window_too_long`);
  }
}

export function evaluateEveLaunchReadiness(input: {
  document: EveLaunchManifestDocument;
  now?: Date;
}): EveLaunchReadinessEvaluation {
  const parsed = eveLaunchManifestDocumentSchema.safeParse(input.document);
  const evaluatedAt = (input.now ?? new Date()).toISOString();
  if (!parsed.success) {
    return {
      blockers: ["manifest_schema_invalid"],
      evaluatedAt,
      evidenceCount: 0,
      ready: false,
    };
  }

  const document = parsed.data;
  const nowMs = Date.parse(evaluatedAt);
  const generatedAt = Date.parse(document.generatedAt);
  const expiresAt = Date.parse(document.expiresAt);
  const blockers: string[] = [];

  if (!Number.isFinite(generatedAt) || generatedAt > nowMs) {
    blockers.push("manifest_generated_time_invalid");
  }
  if (!Number.isFinite(expiresAt) || expiresAt <= nowMs) {
    blockers.push("manifest_expired");
  }
  if (expiresAt - generatedAt > MAX_MANIFEST_LIFETIME_MS) {
    blockers.push("manifest_freshness_window_too_long");
  }

  requireExactIds({
    actual: document.slices.map((entry) => entry.sliceId),
    expected: EVE_LAUNCH_SLICE_IDS,
    label: "slice",
    blockers,
  });
  requireExactIds({
    actual: document.composition.map((entry) => entry.checkId),
    expected: EVE_LAUNCH_COMPOSITION_CHECK_IDS,
    label: "composition",
    blockers,
  });
  requireExactIds({
    actual: document.reversal.map((entry) => entry.checkId),
    expected: EVE_LAUNCH_REVERSAL_CHECK_IDS,
    label: "reversal",
    blockers,
  });
  requireExactIds({
    actual: document.runbooks.map((entry) => entry.runbookId),
    expected: Object.keys(EVE_LAUNCH_RUNBOOKS),
    label: "runbook",
    blockers,
  });

  for (const entry of document.slices) {
    if (entry.status !== "implemented") {
      blockers.push(`slice_not_implemented:${entry.sliceId}`);
    }
    if (entry.implementationRevision !== document.target.revision) {
      blockers.push(`slice_revision_mismatch:${entry.sliceId}`);
    }
    evaluateEvidence({
      blockers,
      evidence: entry.acceptanceEvidence,
      generatedAt,
      label: `slice_acceptance:${entry.sliceId}`,
      nowMs,
      target: document.target,
    });
    evaluateEvidence({
      blockers,
      evidence: entry.operationalEvidence,
      generatedAt,
      label: `slice_operational:${entry.sliceId}`,
      nowMs,
      target: document.target,
    });
  }
  for (const entry of document.composition) {
    evaluateEvidence({
      blockers,
      evidence: entry.evidence,
      generatedAt,
      label: `composition:${entry.checkId}`,
      nowMs,
      target: document.target,
    });
  }
  for (const entry of document.reversal) {
    evaluateEvidence({
      blockers,
      evidence: entry.evidence,
      generatedAt,
      label: `reversal:${entry.checkId}`,
      nowMs,
      target: document.target,
    });
  }
  for (const entry of document.runbooks) {
    if (entry.path !== EVE_LAUNCH_RUNBOOKS[entry.runbookId]) {
      blockers.push(`runbook_path_mismatch:${entry.runbookId}`);
    }
    evaluateEvidence({
      blockers,
      evidence: entry.evidence,
      generatedAt,
      label: `runbook:${entry.runbookId}`,
      nowMs,
      target: document.target,
    });
  }

  const evidenceCount =
    document.slices.length * 2 +
    document.composition.length +
    document.reversal.length +
    document.runbooks.length;
  const uniqueBlockers = [...new Set(blockers)].sort();
  return {
    blockers: uniqueBlockers,
    evaluatedAt,
    evidenceCount,
    ready: uniqueBlockers.length === 0,
  };
}
