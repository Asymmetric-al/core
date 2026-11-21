import { beforeEach, describe, expect, it, vi } from "vitest";

import { hashEveLaunchManifest } from "../../../../packages/api/src/eve/launch-readiness/schema";
import {
  EVE_LAUNCH_CANARY_IDS,
  EVE_LAUNCH_COMPOSITION_CHECK_IDS,
  EVE_LAUNCH_REVERSAL_CHECK_IDS,
  EVE_LAUNCH_RUNBOOKS,
  EVE_LAUNCH_SLICE_IDS,
} from "../../../../packages/api/src/eve/launch-readiness/types";

import type {
  EveLaunchEvidence,
  EveLaunchManifestDocument,
  EveLaunchTarget,
} from "../../../../packages/api/src/eve/launch-readiness/types";
import type { NextRequest } from "next/server";

const { confirmed, governance, loadManifest, rpc } = vi.hoisted(() => ({
  confirmed: vi.fn(),
  governance: vi.fn(),
  loadManifest: vi.fn(),
  rpc: vi.fn(),
}));

const TARGET: EveLaunchTarget = {
  deploymentId: "dpl_verified",
  environment: "production",
  evalConfigRevision: "e".repeat(64),
  governanceStateVersion: 7,
  migrationVersion: "20260718102000_eve_final_launch_verification",
  modelPolicyRevision: "d".repeat(64),
  policyVersion: 4,
  revision: "a".repeat(40),
};
const READY = {
  blockers: [],
  evaluatedAt: "2026-07-18T10:30:00.000Z",
  evidenceCount: 72,
  ready: true,
};

// The route runs on the platform wrapper since AL-2677 split the lanes; the
// stub hands it the same context under either name.
vi.mock("../../../../packages/api/src/shared/with-operation", () => {
  const wrap =
    (handle: (context: unknown) => Promise<Response>) => (request: Request) =>
      handle({
        auth: {
          role: "admin",
          userId: "login",
          profileId: "profile",
          tenantId: "tenant",
        },
        request,
        requestId: "request",
        isPlatformOperator: confirmed,
        supabaseAdmin: { rpc },
      });
  return { withOperation: wrap, withPlatformOperation: wrap };
});
vi.mock("../../../../packages/api/src/eve/governance", () => ({
  loadEveGovernanceSnapshot: governance,
}));
vi.mock(
  "../../../../packages/api/src/eve/launch-readiness/store",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("../../../../packages/api/src/eve/launch-readiness/store")
    >()),
    loadActiveEveModelPolicyBinding: async () => null,
    loadEveLaunchAdminView: async () => ({}),
    loadEveLaunchManifest: loadManifest,
  }),
);
vi.mock(
  "../../../../packages/api/src/eve/launch-readiness/runtime-target",
  () => ({ resolveEveLaunchRuntimeTarget: () => TARGET }),
);
vi.mock(
  "../../../../packages/api/src/eve/launch-readiness/evaluator",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("../../../../packages/api/src/eve/launch-readiness/evaluator")
    >()),
    evaluateEveLaunchReadiness: () => READY,
  }),
);

import { POST } from "../../../../packages/api/src/eve/launch-readiness/route";

const MANIFEST_ID = "43700000-0000-4000-8000-000000000006";
const LAUNCH_ID = "43700000-0000-4000-8000-000000000007";
const GRANTEE = "43700000-0000-4000-8000-000000000009";
const NOT_AN_OPERATOR = "A confirmed platform operator is required.";

function evidence(reference: string): EveLaunchEvidence {
  return {
    digest: "b".repeat(64),
    expiresAt: "2026-07-18T12:00:00.000Z",
    kind: "test_report",
    observedAt: "2026-07-18T10:00:00.000Z",
    reference,
    result: "passed",
    summary: "Verified against the exact immutable launch target.",
    target: TARGET,
  };
}

function manifest(): EveLaunchManifestDocument {
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
      implementationRevision: TARGET.revision,
      operationalEvidence: evidence(`slice:${sliceId}:operations`),
      responsibleReviewer: `Owner for slice ${sliceId}`,
      runbookId: "activation",
      sliceId,
      status: "implemented",
    })),
    target: TARGET,
  };
}

/** What each launch RPC answers when it succeeds. */
function rpcResult(fn: string, params: Record<string, unknown>) {
  switch (fn) {
    case "create_eve_launch_manifest":
      return {
        audit_id: params.p_audit_id,
        content_hash: params.p_content_hash,
        created_at: "2026-07-18T10:30:00.000Z",
        created_by_profile_id: "43700000-0000-4000-8000-000000000002",
        document: params.p_document,
        evaluation: params.p_evaluation,
        id: MANIFEST_ID,
        status: "evidence_passed",
        tenant_id: "43700000-0000-4000-8000-000000000001",
      };
    case "review_eve_launch_manifest":
      return {
        createdAt: "2026-07-18T10:30:00.000Z",
        decision: "approved",
        manifestId: MANIFEST_ID,
        reviewerProfileId: "43700000-0000-4000-8000-000000000002",
        reviewerRole: "release",
        summary: "Release review passed.",
      };
    case "activate_eve_launch_manifest":
      return { launchId: LAUNCH_ID, stateVersion: 8 };
    case "set_eve_release_safety_control":
      return { stateVersion: 8 };
    default:
      return null;
  }
}

function post(body: Record<string, unknown>) {
  return POST(
    // Typed as the browser sends it: the shared JSON reader refuses an
    // untyped or text/plain body (AL-2677, fix check G1).
    new Request("https://example.test/launch", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }) as NextRequest,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  governance.mockResolvedValue({ stateVersion: 7 });
  rpc.mockImplementation(
    async (fn: string, params: Record<string, unknown>) => ({
      data: rpcResult(fn, params),
      error: null,
    }),
  );
  const document = manifest();
  loadManifest.mockResolvedValue({
    contentHash: hashEveLaunchManifest(document),
    document,
    status: "ready",
  });
});

describe("launch safety control authority", () => {
  it.each([
    ["tenant administrator", false],
    ["listed operator at aal1", false],
    ["listed operator at aal2", true],
  ] as const)("checks each safety mode for a %s", async (_actor, passed) => {
    confirmed.mockResolvedValue(passed);
    for (const mode of ["emergency_off", "disable", "clear_emergency"]) {
      vi.clearAllMocks();
      const response = await post({
        kind: "safety_control",
        mode,
        expectedStateVersion: 1,
        reason: "Release safety review",
      });
      const needsOperator = mode !== "emergency_off";
      expect(confirmed).toHaveBeenCalledTimes(needsOperator ? 1 : 0);
      if (needsOperator && !passed) {
        expect(response.status).toBe(403);
        expect(rpc).not.toHaveBeenCalled();
      } else {
        expect(response.status).toBe(200);
        expect(rpc).toHaveBeenCalledWith(
          "set_eve_release_safety_control",
          expect.objectContaining({
            p_mode: mode,
            p_actor_role: needsOperator ? "super_admin" : "admin",
            p_tenant_id: "tenant",
          }),
        );
      }
    }
  });
});

/**
 * Review 4650094344 on #2741 (AL-2675 WP2c). Eve's SQL, called with the
 * service key, accepts its platform actor (`super_admin`) by the operator list
 * and a live row in the tenant alone: it cannot see the session's second
 * factor. The shared operator check is the only place that does, so every
 * launch step of the platform is refused at the route, before any control or
 * RPC runs, unless that check passed. A tenant administrator still submits a
 * manifest and engages emergency off without it.
 */
describe("the launch steps of the platform need the shared operator check", () => {
  const steps: Array<[string, Record<string, unknown>, string]> = [
    [
      "a launch review",
      {
        kind: "review",
        decision: "approved",
        manifestId: MANIFEST_ID,
        reviewerRole: "release",
        summary: "Release review passed.",
      },
      "review_eve_launch_manifest",
    ],
    [
      "a launch permission grant",
      {
        kind: "permission",
        enabled: true,
        permission: "release.review",
        profileId: GRANTEE,
        reason: "Release reviewer for the canary",
      },
      "grant_eve_launch_permission",
    ],
    [
      "an activation",
      {
        kind: "activate",
        expectedStateVersion: 7,
        justification: "Every readiness check passed.",
        manifestId: MANIFEST_ID,
      },
      "activate_eve_launch_manifest",
    ],
    [
      "a canary close",
      {
        kind: "canary",
        launchId: LAUNCH_ID,
        reason: "Canary observed for the full window.",
        results: Object.fromEntries(
          EVE_LAUNCH_CANARY_IDS.map((id) => [id, true]),
        ),
        status: "completed",
      },
      "close_eve_launch_canary",
    ],
    [
      "disabling release",
      {
        kind: "safety_control",
        mode: "disable",
        expectedStateVersion: 7,
        reason: "Release safety review",
      },
      "set_eve_release_safety_control",
    ],
    [
      "clearing emergency off",
      {
        kind: "safety_control",
        mode: "clear_emergency",
        expectedStateVersion: 7,
        reason: "Release safety review",
      },
      "set_eve_release_safety_control",
    ],
  ];

  it.each(steps)(
    "refuses %s from a listed operator at aal1 with 403, before any control or RPC runs",
    async (_step, body) => {
      confirmed.mockResolvedValue(false);
      const response = await post(body);
      expect(response.status).toBe(403);
      expect(await response.json()).toEqual({
        error: NOT_AN_OPERATOR,
        requestId: "request",
      });
      expect(confirmed).toHaveBeenCalledTimes(1);
      expect(rpc).not.toHaveBeenCalled();
      expect(governance).not.toHaveBeenCalled();
      expect(loadManifest).not.toHaveBeenCalled();
    },
  );

  it.each(steps)(
    "lets a listed operator at aal2 reach %s's RPC as the platform actor",
    async (_step, body, fn) => {
      confirmed.mockResolvedValue(true);
      const response = await post(body);
      expect(response.status).toBe(200);
      expect(confirmed).toHaveBeenCalledTimes(1);
      expect(rpc).toHaveBeenCalledWith(
        fn,
        expect.objectContaining({
          p_actor_role: "super_admin",
          p_tenant_id: "tenant",
        }),
      );
    },
  );

  it("lets a tenant administrator submit a manifest and engage emergency off, without the operator check", async () => {
    confirmed.mockResolvedValue(false);
    const submitted = await post({ kind: "manifest", document: manifest() });
    expect(submitted.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith(
      "create_eve_launch_manifest",
      expect.objectContaining({ p_actor_role: "admin", p_tenant_id: "tenant" }),
    );
    const engaged = await post({
      kind: "safety_control",
      mode: "emergency_off",
      expectedStateVersion: 7,
      reason: "Release safety review",
    });
    expect(engaged.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith(
      "set_eve_release_safety_control",
      expect.objectContaining({
        p_mode: "emergency_off",
        p_actor_role: "admin",
        p_tenant_id: "tenant",
      }),
    );
    expect(confirmed).not.toHaveBeenCalled();
  });
});
