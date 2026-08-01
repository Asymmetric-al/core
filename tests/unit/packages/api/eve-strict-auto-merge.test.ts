import { describe, expect, it, vi } from "vitest";

import { createGithubBotEveAuditIdentity } from "@asym/api/eve/audit";
import {
  evaluateEveStrictAutoMerge,
  executeEveStrictAutoMerge,
  type EveStrictAutoMergeEvidence,
  type EveStrictAutoMergeInput,
} from "@asym/api/eve/strict-auto-merge";

import type { EveAuditEventRecord } from "@asym/api/eve/audit";
import type { EveGovernanceSnapshot } from "@asym/api/eve/governance/types";

const HEAD_SHA = "a".repeat(40);
const identity = createGithubBotEveAuditIdentity({
  actorProfileId: "11111111-1111-4111-8111-111111111111",
  actorRole: "super_admin",
  botId: "eve-asymmetric[bot]",
  initiatorId: "github:42",
  initiatorType: "github_sender",
  tenantId: "22222222-2222-4222-8222-222222222222",
});

function evidence(
  overrides: Partial<EveStrictAutoMergeEvidence> = {},
): EveStrictAutoMergeEvidence {
  return {
    activeRulesetCount: 0,
    baseBranch: "develop",
    changedPathsComplete: true,
    draft: false,
    expectedHeadSha: HEAD_SHA,
    headSha: HEAD_SHA,
    issueBranchVerified: true,
    issueLinkVerified: true,
    issueNumber: 432,
    mergeable: true,
    mergeableState: "clean",
    merged: false,
    observedChecks: [
      {
        appId: 15_368,
        conclusion: "success",
        context: "ci-gate",
        status: "completed",
      },
    ],
    observedReviews: [
      {
        commitId: HEAD_SHA,
        login: "maintainer",
        state: "APPROVED",
        submittedAt: "2026-07-17T12:00:00.000Z",
        userType: "User",
      },
    ],
    open: true,
    protectedAreas: [],
    protection: {
      bypassAllowanceCount: 0,
      dismissStaleReviews: true,
      enforceAdmins: true,
      requireCodeOwnerReviews: false,
      requireLastPushApproval: false,
      requiredApprovingReviewCount: 1,
      requiredChecks: [{ appId: 15_368, context: "ci-gate" }],
      requiredConversationResolution: true,
      strictStatusChecks: true,
    },
    pullRequestNumber: 900,
    pullRequestUrl: "https://github.com/Asymmetric-al/core/pull/900",
    ...overrides,
  };
}

function mergeInput(): EveStrictAutoMergeInput {
  return {
    accountableLogin: "maintainer",
    accountableTrigger: "github:42:delivery:one",
    actorProfileId: "11111111-1111-4111-8111-111111111111",
    expectedHeadSha: HEAD_SHA,
    identity,
    installationId: 42,
    owner: "Asymmetric-al",
    pullRequestNumber: 900,
    repo: "core",
    runId: "33333333-3333-4333-8333-333333333333",
  };
}

function governance(): EveGovernanceSnapshot {
  return {
    source: "persisted",
    releaseEnabled: true,
    emergencyOff: false,
    killSwitchState: {
      all_automation: false,
      active_runs: false,
      github_actions: false,
      production_writes: false,
      sandbox_networking: false,
      dynamic_workflows: false,
      model_policy_changes: false,
      force_approval: false,
    },
    policyStatus: "ready",
    stateVersion: 16,
    updatedAt: "2026-07-17T00:00:00.000Z",
  };
}

describe("Eve strict auto-merge policy", () => {
  it("passes only a protected, clean PR with successful checks and a current human approval", () => {
    expect(evaluateEveStrictAutoMerge(evidence())).toEqual({
      outcome: "merge",
      reasons: [],
    });
  });

  it("rejects an approval for an earlier head even when GitHub keeps stale reviews", () => {
    expect(
      evaluateEveStrictAutoMerge(
        evidence({
          observedReviews: [
            {
              commitId: "b".repeat(40),
              login: "maintainer",
              state: "APPROVED",
              submittedAt: "2026-07-17T12:00:00.000Z",
              userType: "User",
            },
          ],
          protection: {
            ...evidence().protection!,
            dismissStaleReviews: false,
          },
        }),
      ),
    ).toEqual({
      outcome: "escalate",
      reasons: ["required_human_review_missing"],
    });
  });

  it("blocks every protected-area finding even when checks and reviews pass", () => {
    expect(
      evaluateEveStrictAutoMerge(
        evidence({
          protectedAreas: [
            {
              path: "supabase/migrations/change.sql",
              rules: ["migrations_and_rls"],
            },
          ],
        }),
      ),
    ).toEqual({ outcome: "escalate", reasons: ["protected_area"] });
  });

  it("fails closed on stale heads, missing checks, bot-only reviews, bypasses, and unsupported protection", () => {
    const decision = evaluateEveStrictAutoMerge(
      evidence({
        activeRulesetCount: 1,
        headSha: "b".repeat(40),
        mergeable: null,
        mergeableState: "unknown",
        observedChecks: [],
        observedReviews: [
          {
            commitId: HEAD_SHA,
            login: "automation[bot]",
            state: "APPROVED",
            userType: "Bot",
          },
        ],
        protection: {
          ...evidence().protection!,
          bypassAllowanceCount: 1,
          enforceAdmins: false,
          requireCodeOwnerReviews: true,
          requireLastPushApproval: true,
        },
      }),
    );
    expect(decision.outcome).toBe("escalate");
    expect(decision.reasons).toEqual(
      expect.arrayContaining([
        "active_ruleset_unverified",
        "expected_head_changed",
        "mergeability_pending",
        "protection_bypass_configured",
        "protection_not_enforced_for_admins",
        "required_check_missing",
        "required_human_review_missing",
        "unsupported_code_owner_review_rule",
        "unsupported_last_push_approval_rule",
      ]),
    );
  });

  it("executes the merge only after governance, policy, and strict evidence pass", async () => {
    const audit: EveAuditEventRecord[] = [];
    const merge = vi.fn(async () => ({
      merged: true,
      resourceId: "c".repeat(40),
    }));
    const escalate = vi.fn(async () => undefined);
    const result = await executeEveStrictAutoMerge(mergeInput(), {
      auditStore: { append: async (record) => void audit.push(record) },
      consultPolicy: vi.fn(async () => ({
        actionId: "engineering.github_merge.execute" as const,
        decision: "allow" as const,
        reason: "operational_policy_allowed" as const,
        trustZone: "engineering" as const,
        writeClass: "operational" as const,
      })),
      escalate,
      governanceStore: {
        loadSnapshot: async () => governance(),
        recordDecision: vi.fn(async () => undefined),
      },
      inspect: vi.fn(async () => evidence()),
      merge,
    });

    expect(result).toMatchObject({ merged: true, reasons: [] });
    expect(merge).toHaveBeenCalledOnce();
    expect(escalate).not.toHaveBeenCalled();
    expect(audit.map((event) => event.result)).toEqual([
      "started",
      "succeeded",
    ]);
  });

  it("posts an explicit escalation and never calls merge for a protected PR", async () => {
    const merge = vi.fn();
    const escalate = vi.fn(async () => undefined);
    const audit: EveAuditEventRecord[] = [];
    const protectedEvidence = evidence({
      protectedAreas: [
        { path: "packages/auth/session.ts", rules: ["identity_data_runtime"] },
      ],
    });
    const result = await executeEveStrictAutoMerge(mergeInput(), {
      auditStore: { append: async (record) => void audit.push(record) },
      consultPolicy: vi.fn(async () => ({
        actionId: "engineering.github_merge.execute" as const,
        decision: "allow" as const,
        reason: "operational_policy_allowed" as const,
        trustZone: "engineering" as const,
        writeClass: "operational" as const,
      })),
      escalate,
      governanceStore: {
        loadSnapshot: async () => governance(),
        recordDecision: vi.fn(async () => undefined),
      },
      inspect: vi.fn(async () => protectedEvidence),
      merge,
    });

    expect(result).toMatchObject({
      merged: false,
      reasons: ["protected_area"],
    });
    expect(escalate).toHaveBeenCalledWith({
      evidence: protectedEvidence,
      reasons: ["protected_area"],
    });
    expect(merge).not.toHaveBeenCalled();
    expect(audit.at(-1)?.result).toBe("blocked");
  });
});
