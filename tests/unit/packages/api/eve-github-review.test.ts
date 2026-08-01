import { describe, expect, it, vi } from "vitest";

import {
  createGithubBotEveAuditIdentity,
  type EveAuditEventRecord,
} from "@asym/api/eve/audit";
import {
  detectEveGithubProtectedAreas,
  parseEveGithubReviewOutput,
  prepareEveGithubReview,
  publishEveGithubReview,
  type EveGithubPreparedReview,
} from "@asym/api/eve/github-review";

import type { EveGovernanceSnapshot } from "@asym/api/eve/governance/types";

const identity = createGithubBotEveAuditIdentity({
  actorProfileId: "11111111-1111-4111-8111-111111111111",
  actorRole: "super_admin",
  botId: "eve-asymmetric[bot]",
  initiatorId: "github:42",
  initiatorType: "github_sender",
  tenantId: "22222222-2222-4222-8222-222222222222",
});

function governance(
  overrides: Partial<EveGovernanceSnapshot> = {},
): EveGovernanceSnapshot {
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
    stateVersion: 9,
    updatedAt: "2026-07-17T00:00:00.000Z",
    ...overrides,
  };
}

const rawOutput = JSON.stringify({
  summary: "The change is focused and the validation boundary is explicit.",
  findings: [
    {
      path: "packages/auth/context.ts",
      line: 72,
      side: "RIGHT",
      severity: "high",
      body: "Fail closed when the authenticated profile cannot be resolved.",
    },
  ],
});

describe("Eve GitHub review preparation", () => {
  it("parses a bounded structured decision summary", () => {
    expect(parseEveGithubReviewOutput(rawOutput)).toMatchObject({
      findings: [{ severity: "high", side: "RIGHT" }],
    });
  });

  it("withholds output containing external-surface sensitive data", () => {
    expect(() =>
      parseEveGithubReviewOutput(
        JSON.stringify({
          summary: "Contact donor@example.com about this change.",
          findings: [],
        }),
      ),
    ).toThrow(/withheld by data-boundary policy/u);
  });

  it("derives protected areas from server-observed changed paths", () => {
    expect(
      detectEveGithubProtectedAreas([
        "packages/auth/context.ts",
        "docs/guide.md",
        ".github/workflows/ci.yml",
      ]),
    ).toEqual([
      {
        path: "packages/auth/context.ts",
        rules: ["identity_data_runtime", "sensitive_behavior"],
      },
      { path: ".github/workflows/ci.yml", rules: ["github_workflows"] },
    ]);
  });

  it("makes protected-area and accountable-trigger metadata visible", () => {
    const review = prepareEveGithubReview({
      accountableLogin: "octocat",
      changedPaths: ["packages/auth/context.ts"],
      rawOutput,
    });

    expect(review.event).toBe("COMMENT");
    expect(review.body).toContain("Protected-area scan");
    expect(review.body).toContain("identity_data_runtime");
    expect(review.body).toContain("@octocat");
    expect(review.comments[0]).toMatchObject({
      body: expect.stringContaining("HIGH"),
      path: "packages/auth/context.ts",
      line: 72,
      side: "RIGHT",
    });
  });

  it("rejects inline findings for files outside the observed PR change", () => {
    expect(() =>
      prepareEveGithubReview({
        accountableLogin: "octocat",
        changedPaths: ["docs/guide.md"],
        rawOutput,
      }),
    ).toThrow(/not part of the reviewed change/u);
  });
});

describe("Eve GitHub review publication", () => {
  function dependencies(snapshot: EveGovernanceSnapshot) {
    const audit: EveAuditEventRecord[] = [];
    const decisions: unknown[] = [];
    const postReview = vi.fn(async (_review: EveGithubPreparedReview) => ({}));
    return {
      audit,
      decisions,
      postReview,
      value: {
        auditStore: {
          append: async (record: EveAuditEventRecord) => {
            audit.push(record);
          },
        },
        consultPolicy: vi.fn(async () => ({
          actionId: "engineering.review_artifact.write",
          decision: "allow" as const,
          reason: "operational_policy_allowed" as const,
          trustZone: "engineering" as const,
          writeClass: "operational" as const,
        })),
        governanceStore: {
          loadSnapshot: async () => snapshot,
          recordDecision: async (record: unknown) => {
            decisions.push(record);
          },
        },
        postReview,
      },
    };
  }

  const publication = {
    accountableLogin: "octocat",
    accountableTrigger: "github_sender:42:delivery:delivery-one",
    actorProfileId: "11111111-1111-4111-8111-111111111111",
    changedPaths: ["packages/auth/context.ts"],
    headSha: "a".repeat(40),
    identity,
    owner: "Asymmetric-al",
    pullRequestNumber: 430,
    rawOutput,
    repo: "core",
    runId: "33333333-3333-4333-8333-333333333333",
  };

  it("posts summary and inline findings in one COMMENT review after both gates", async () => {
    const deps = dependencies(governance());
    await expect(
      publishEveGithubReview(publication, deps.value),
    ).resolves.toEqual({
      published: true,
      findingCount: 1,
      protectedAreaCount: 1,
    });

    expect(deps.postReview).toHaveBeenCalledOnce();
    const review = deps.postReview.mock.calls[0]?.[0];
    expect(review?.event).toBe("COMMENT");
    expect(review?.body).toContain(`<!-- eve:run:${publication.runId} -->`);
    expect(deps.audit.map((record) => record.result)).toEqual([
      "started",
      "succeeded",
    ]);
    expect(deps.audit[0]).toMatchObject({
      identityMode: "github_bot",
      initiatorId: "github:42",
      modelRole: "review",
    });
  });

  it("does not consult policy or post while the release switch is off", async () => {
    const deps = dependencies(governance({ releaseEnabled: false }));
    await expect(
      publishEveGithubReview(publication, deps.value),
    ).resolves.toEqual({ published: false, reason: "release_disabled" });
    expect(deps.value.consultPolicy).not.toHaveBeenCalled();
    expect(deps.postReview).not.toHaveBeenCalled();
  });

  it("audits and withholds a review denied by approval policy", async () => {
    const deps = dependencies(governance());
    deps.value.consultPolicy.mockResolvedValueOnce({
      actionId: "engineering.review_artifact.write",
      decision: "deny",
      reason: "approval_required",
      trustZone: "engineering",
      writeClass: "operational",
    });

    await expect(
      publishEveGithubReview(publication, deps.value),
    ).resolves.toEqual({ published: false, reason: "approval_required" });
    expect(deps.postReview).not.toHaveBeenCalled();
    expect(deps.audit).toHaveLength(1);
    expect(deps.audit[0]?.result).toBe("blocked");
  });
});
