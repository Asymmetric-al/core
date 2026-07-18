import {
  EVE_LAUNCH_COMPOSITION_CHECK_IDS,
  EVE_LAUNCH_REVERSAL_CHECK_IDS,
  EVE_LAUNCH_RUNBOOKS,
  EVE_LAUNCH_SLICE_IDS,
  eveLaunchManifestDocumentSchema,
  evaluateEveLaunchReadiness,
  hashEveLaunchManifest,
  resolveEveLaunchRuntimeTarget,
} from "@asym/api/eve/launch-readiness";
import { afterEach, describe, expect, it, vi } from "vitest";

import type {
  EveLaunchEvidence,
  EveLaunchManifestDocument,
  EveLaunchTarget,
} from "@asym/api/eve/launch-readiness";

const target: EveLaunchTarget = {
  deploymentId: "dpl_verified",
  environment: "production",
  evalConfigRevision: "e".repeat(64),
  governanceStateVersion: 12,
  migrationVersion: "20260718102000_eve_final_launch_verification",
  modelPolicyRevision: "d".repeat(64),
  policyVersion: 4,
  revision: "a".repeat(40),
};

afterEach(() => vi.unstubAllEnvs());

function evidence(reference: string): EveLaunchEvidence {
  return {
    digest: "b".repeat(64),
    expiresAt: "2026-07-18T12:00:00.000Z",
    kind: "test_report",
    observedAt: "2026-07-18T10:00:00.000Z",
    reference,
    result: "passed",
    summary: "Verified against the exact immutable launch target.",
    target,
  };
}

function validManifest(): EveLaunchManifestDocument {
  return {
    composition: EVE_LAUNCH_COMPOSITION_CHECK_IDS.map((checkId) => ({
      checkId,
      evidence: evidence(`composition:${checkId}`),
    })),
    expiresAt: "2026-07-18T12:00:00.000Z",
    generatedAt: "2026-07-18T10:00:00.000Z",
    observations: ["No unresolved launch blockers."],
    reversal: EVE_LAUNCH_REVERSAL_CHECK_IDS.map((checkId) => ({
      checkId,
      evidence: evidence(`reversal:${checkId}`),
    })),
    runbooks: Object.entries(EVE_LAUNCH_RUNBOOKS).map(([runbookId, path]) => ({
      evidence: evidence(`runbook:${runbookId}`),
      owner: "Eve platform owner",
      path,
      runbookId: runbookId as keyof typeof EVE_LAUNCH_RUNBOOKS,
    })),
    schemaVersion: "eve-launch-manifest-v1",
    slices: EVE_LAUNCH_SLICE_IDS.map((sliceId) => ({
      acceptanceEvidence: evidence(`slice:${sliceId}:acceptance`),
      implementationRevision: target.revision,
      operationalEvidence: evidence(`slice:${sliceId}:operations`),
      responsibleReviewer: `Owner for slice ${sliceId}`,
      runbookId: "activation",
      sliceId,
      status: "implemented",
    })),
    target,
  };
}

describe("Eve final launch readiness", () => {
  it("accepts complete, fresh evidence bound to the exact target", () => {
    const result = evaluateEveLaunchReadiness({
      document: validManifest(),
      now: new Date("2026-07-18T10:30:00.000Z"),
    });
    expect(result).toMatchObject({
      blockers: [],
      evidenceCount: 72,
      ready: true,
    });
  });

  it("fails closed for missing implementation slices", () => {
    const document = validManifest();
    document.slices = document.slices.filter(
      ({ sliceId }) => sliceId !== "436",
    );
    const result = evaluateEveLaunchReadiness({
      document,
      now: new Date("2026-07-18T10:30:00.000Z"),
    });
    expect(result.ready).toBe(false);
    expect(result.blockers).toContain("slice_missing:436");
  });

  it("rejects stale evidence and evidence for a different deployment", () => {
    const document = validManifest();
    document.composition[0]!.evidence.expiresAt = "2026-07-18T10:10:00.000Z";
    document.reversal[0]!.evidence.target = {
      ...target,
      deploymentId: "dpl_other",
    };
    const result = evaluateEveLaunchReadiness({
      document,
      now: new Date("2026-07-18T10:30:00.000Z"),
    });
    expect(result.ready).toBe(false);
    expect(result.blockers).toContain(
      `composition:${document.composition[0]!.checkId}_stale`,
    );
    expect(result.blockers).toContain(
      `reversal:${document.reversal[0]!.checkId}_target_mismatch`,
    );
  });

  it("rejects operator-defined evidence freshness that is too permissive", () => {
    const document = validManifest();
    document.composition[0]!.evidence.observedAt = "2026-07-16T10:00:00.000Z";
    const result = evaluateEveLaunchReadiness({
      document,
      now: new Date("2026-07-18T10:30:00.000Z"),
    });
    expect(result.blockers).toContain(
      `composition:${document.composition[0]!.checkId}_observation_stale`,
    );
    expect(result.blockers).toContain(
      `composition:${document.composition[0]!.checkId}_freshness_window_too_long`,
    );
  });

  it("rejects draft-only work and revision drift", () => {
    const document = validManifest();
    document.slices[0]!.status = "draft_only";
    document.slices[1]!.implementationRevision = "c".repeat(40);
    const result = evaluateEveLaunchReadiness({
      document,
      now: new Date("2026-07-18T10:30:00.000Z"),
    });
    expect(result.blockers).toContain("slice_not_implemented:417");
    expect(result.blockers).toContain("slice_revision_mismatch:418");
  });

  it("hashes semantically identical manifests deterministically", () => {
    const first = validManifest();
    const second = validManifest();
    second.slices.reverse();
    second.composition.reverse();
    second.reversal.reverse();
    second.runbooks.reverse();
    expect(hashEveLaunchManifest(second)).toBe(hashEveLaunchManifest(first));
  });

  it("allows safe control descriptions but rejects embedded credential values", () => {
    const safeDocument = validManifest();
    safeDocument.composition[0]!.evidence.summary =
      "Secret scanning passed without retaining any matched value.";
    expect(
      eveLaunchManifestDocumentSchema.safeParse(safeDocument).success,
    ).toBe(true);

    const unsafeDocument = validManifest();
    unsafeDocument.composition[0]!.evidence.summary =
      "api_key=example-sensitive-value";
    expect(
      eveLaunchManifestDocumentSchema.safeParse(unsafeDocument).success,
    ).toBe(false);
  });

  it("resolves only a configured target bound to the active evaluated model policy", () => {
    vi.stubEnv("EVE_LAUNCH_DEPLOYMENT_ID", target.deploymentId);
    vi.stubEnv("EVE_LAUNCH_ENVIRONMENT", target.environment);
    vi.stubEnv("EVE_LAUNCH_EVAL_CONFIG_REVISION", target.evalConfigRevision);
    vi.stubEnv("EVE_LAUNCH_MIGRATION_VERSION", target.migrationVersion);
    vi.stubEnv("EVE_LAUNCH_MODEL_POLICY_REVISION", target.modelPolicyRevision);
    vi.stubEnv("EVE_LAUNCH_POLICY_VERSION", String(target.policyVersion));
    vi.stubEnv("EVE_LAUNCH_REVISION", target.revision);

    expect(
      resolveEveLaunchRuntimeTarget({
        activeModelPolicy: {
          revision: target.modelPolicyRevision,
          version: target.policyVersion,
        },
        governanceStateVersion: target.governanceStateVersion,
      }),
    ).toEqual(target);
    expect(
      resolveEveLaunchRuntimeTarget({
        activeModelPolicy: {
          revision: "f".repeat(64),
          version: target.policyVersion,
        },
        governanceStateVersion: target.governanceStateVersion,
      }),
    ).toBeUndefined();
  });
});
