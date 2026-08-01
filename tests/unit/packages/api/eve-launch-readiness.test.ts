import {
  EVE_LAUNCH_COMPOSITION_CHECK_IDS,
  EVE_LAUNCH_REVERSAL_CHECK_IDS,
  EVE_LAUNCH_RUNBOOKS,
  EVE_LAUNCH_SLICE_IDS,
  eveLaunchManifestDocumentSchema,
  evaluateEveLaunchReadiness,
  createEveLaunchManifestRecord,
  hashEveLaunchManifest,
  loadEveLaunchAdminView,
  resolveEveLaunchRuntimeTarget,
} from "@asym/api/eve/launch-readiness";
import { afterEach, describe, expect, it, vi } from "vitest";

import type {
  EveLaunchEvidence,
  EveLaunchManifestDocument,
  EveLaunchTarget,
} from "@asym/api/eve/launch-readiness";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

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

afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

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

function launchAdminSupabase(input: {
  manifestRows: unknown[];
}): AdminSupabaseClient {
  const listsByTable: Record<string, unknown[]> = {
    eve_launch_manifests: input.manifestRows,
    eve_launch_permission_grants: [],
    eve_launch_records: [],
    eve_launch_reviews: [],
  };

  return {
    from(table: string) {
      const query: Record<string, unknown> = {};
      const chain = () => query;

      query.eq = vi.fn(chain);
      query.limit = vi.fn(chain);
      query.order = vi.fn(chain);
      query.select = vi.fn(chain);
      query.maybeSingle = vi.fn(() =>
        Promise.resolve({ data: null, error: null }),
      );
      query.then = (
        resolve: (value: { data: unknown[]; error: null }) => unknown,
        reject: (reason: unknown) => unknown,
      ) =>
        Promise.resolve({ data: listsByTable[table] ?? [], error: null }).then(
          resolve,
          reject,
        );
      return query;
    },
  } as unknown as AdminSupabaseClient;
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

  it("creates the manifest and audit through one atomic RPC", async () => {
    const document = validManifest();
    const evaluation = evaluateEveLaunchReadiness({
      document,
      now: new Date("2026-07-18T10:30:00.000Z"),
    });
    const rpc = vi.fn().mockResolvedValue({
      data: {
        audit_id: "43700000-0000-4000-8000-000000000010",
        content_hash: "c".repeat(64),
        created_at: "2026-07-18T10:30:00.000Z",
        created_by_profile_id: "43700000-0000-4000-8000-000000000002",
        document,
        evaluation,
        id: "43700000-0000-4000-8000-000000000006",
        status: "evidence_passed",
        tenant_id: "43700000-0000-4000-8000-000000000001",
      },
      error: null,
    });

    await createEveLaunchManifestRecord({
      actorId: "verified-user-1",
      actorRole: "super_admin",
      auditId: "43700000-0000-4000-8000-000000000010",
      contentHash: "c".repeat(64),
      document,
      evaluation,
      initiatorId: "verified-user-1",
      initiatorType: "authenticated_admin",
      profileId: "43700000-0000-4000-8000-000000000002",
      supabaseAdmin: { rpc } as unknown as AdminSupabaseClient,
      tenantId: "43700000-0000-4000-8000-000000000001",
    });

    expect(rpc).toHaveBeenCalledOnce();
    expect(rpc).toHaveBeenCalledWith(
      "create_eve_launch_manifest",
      expect.objectContaining({
        p_audit_id: "43700000-0000-4000-8000-000000000010",
        p_document: document,
        p_evaluation: evaluation,
        p_manifest_id: expect.any(String),
      }),
    );
  });

  it("re-evaluates stored manifests so expired evidence never reads as ready", async () => {
    const document = validManifest();
    const manifestRow = {
      audit_id: "43700000-0000-4000-8000-000000000010",
      content_hash: hashEveLaunchManifest(document),
      created_at: "2026-07-18T10:30:00.000Z",
      created_by_profile_id: "43700000-0000-4000-8000-000000000002",
      document,
      evaluation: evaluateEveLaunchReadiness({
        document,
        now: new Date("2026-07-18T10:30:00.000Z"),
      }),
      id: "43700000-0000-4000-8000-000000000006",
      status: "ready",
      tenant_id: "43700000-0000-4000-8000-000000000001",
    };
    const loadAdminView = () =>
      loadEveLaunchAdminView({
        profileId: "43700000-0000-4000-8000-000000000002",
        supabaseAdmin: launchAdminSupabase({ manifestRows: [manifestRow] }),
        tenantId: "43700000-0000-4000-8000-000000000001",
      });

    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-07-18T10:30:00.000Z"));
    const fresh = await loadAdminView();
    expect(fresh.manifests[0]?.status).toBe("ready");
    expect(fresh.manifests[0]?.evaluation.ready).toBe(true);

    vi.setSystemTime(new Date("2026-07-18T13:00:00.000Z"));
    const stale = await loadAdminView();
    expect(stale.manifests[0]?.status).toBe("expired");
    expect(stale.manifests[0]?.evaluation.ready).toBe(false);
    expect(stale.manifests[0]?.evaluation.blockers).toContain(
      "manifest_expired",
    );
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
