import { describe, expect, it, vi } from "vitest";

import {
  createGithubBotEveAuditIdentity,
  type EveAuditEventRecord,
} from "@asym/api/eve/audit";
import {
  EVE_GITHUB_OPERATOR_OPERATIONS,
  executeEveGithubOperation,
  prepareEveGithubOperation,
  type EveGithubOperatorInput,
} from "@asym/api/eve/github-operator";

import type { EveGovernanceSnapshot } from "@asym/api/eve/governance/types";

const identity = createGithubBotEveAuditIdentity({
  actorProfileId: "11111111-1111-4111-8111-111111111111",
  actorRole: "super_admin",
  botId: "eve-asymmetric[bot]",
  initiatorId: "github:42",
  initiatorType: "github_sender",
  tenantId: "22222222-2222-4222-8222-222222222222",
});

function input(
  request: EveGithubOperatorInput["request"],
): EveGithubOperatorInput {
  return {
    accountableTrigger: "github:42:delivery:one",
    actorProfileId: "11111111-1111-4111-8111-111111111111",
    identity,
    installationId: 42,
    owner: "Asymmetric-al",
    repo: "core",
    request,
    runId: "33333333-3333-4333-8333-333333333333",
  };
}

function governance(releaseEnabled = true): EveGovernanceSnapshot {
  return {
    source: "persisted",
    releaseEnabled,
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
    stateVersion: 12,
    updatedAt: "2026-07-17T00:00:00.000Z",
  };
}

describe("Eve GitHub operator guardrails", () => {
  it("exposes the mutating allowlist without any merge operation", () => {
    expect(EVE_GITHUB_OPERATOR_OPERATIONS).toHaveLength(7);
    expect(EVE_GITHUB_OPERATOR_OPERATIONS).toContain("push_safe_fix");
    expect(EVE_GITHUB_OPERATOR_OPERATIONS.join(" ")).not.toMatch(/merge/u);
  });

  it("requires issue-derived branches and inserts the closing issue link", () => {
    expect(() =>
      prepareEveGithubOperation(
        input({
          operation: "create_branch",
          issueNumber: 431,
          branch: "eve/free-floating-change",
          baseBranch: "develop",
        }),
      ),
    ).toThrow(/issue-first traceability/u);

    const prepared = prepareEveGithubOperation(
      input({
        operation: "open_pull_request",
        issueNumber: 431,
        branch: "eve/issue-431-safe-fix",
        baseBranch: "develop",
        title: "fix: safe improvement",
        body: "Explains the bounded engineering change.",
      }),
    );
    expect(
      prepared.request.operation === "open_pull_request"
        ? prepared.request.body
        : "",
    ).toContain("Closes #431");
  });

  it("blocks business data, sensitive files, and unapproved protected paths", () => {
    expect(() =>
      prepareEveGithubOperation(
        input({
          operation: "create_issue",
          title: "Investigate donor record",
          body: "Contact donor@example.com about their payment.",
        }),
      ),
    ).toThrow(/business-data boundary/u);
    expect(() =>
      prepareEveGithubOperation(
        input({
          operation: "push_safe_fix",
          issueNumber: 431,
          branch: "eve/issue-431-safe-fix",
          commitMessage: "fix: update configuration",
          changedFiles: [
            { path: ".env.production", status: "added", content: "SAFE=x" },
          ],
        }),
      ),
    ).toThrow(/sensitive path or content/u);
    expect(() =>
      prepareEveGithubOperation(
        input({
          operation: "push_safe_fix",
          issueNumber: 431,
          branch: "eve/issue-431-safe-fix",
          commitMessage: "fix: update workflow",
          changedFiles: [
            {
              path: ".github/workflows/ci.yml",
              status: "modified",
              content: "name: CI",
            },
          ],
        }),
      ),
    ).toThrow(/approval ID/u);
  });

  it("requires OpenSpec in a product-direction implementation", () => {
    expect(() =>
      prepareEveGithubOperation(
        input({
          operation: "push_safe_fix",
          issueNumber: 431,
          branch: "eve/issue-431-product-change",
          commitMessage: "feat: add product behavior",
          changedFiles: [
            {
              path: "packages/ui/product.ts",
              status: "added",
              content: "export {};",
            },
          ],
          productDirection: true,
        }),
      ),
    ).toThrow(/update OpenSpec/u);
  });

  it("blocks business data found inside a proposed source change", () => {
    expect(() =>
      prepareEveGithubOperation(
        input({
          operation: "push_safe_fix",
          issueNumber: 431,
          branch: "eve/issue-431-safe-fix",
          commitMessage: "fix: update safe documentation",
          changedFiles: [
            {
              path: "docs/guide.md",
              status: "modified",
              content:
                "Contact a-real-donor@example.com for the tenant balance.",
            },
          ],
        }),
      ),
    ).toThrow(/business-data boundary/u);
  });
});

describe("Eve GitHub operator control", () => {
  it("gates, performs, and audits one accountable operation", async () => {
    const audit: EveAuditEventRecord[] = [];
    const performOperation = vi.fn(async () => ({ resourceId: "431" }));
    const result = await executeEveGithubOperation(
      input({
        operation: "create_issue",
        title: "Improve a bounded engineering path",
        body: "Issue-first work initiation for a safe repository improvement.",
      }),
      {
        auditStore: { append: async (record) => void audit.push(record) },
        consultPolicy: vi.fn(async () => ({
          actionId: "engineering.github_operation.write",
          decision: "allow" as const,
          reason: "operational_policy_allowed" as const,
          trustZone: "engineering" as const,
          writeClass: "operational" as const,
        })),
        governanceStore: {
          loadSnapshot: async () => governance(),
          recordDecision: async () => undefined,
        },
        performOperation,
      },
    );

    expect(result).toMatchObject({ executed: true, resourceId: "431" });
    expect(performOperation).toHaveBeenCalledOnce();
    expect(audit.map((record) => record.result)).toEqual([
      "started",
      "succeeded",
    ]);
    expect(audit[0]).toMatchObject({
      identityMode: "github_bot",
      initiatorId: "github:42",
      toolName: "github_operator",
    });
  });

  it("takes no policy or GitHub action while release is disabled", async () => {
    const consultPolicy = vi.fn();
    const performOperation = vi.fn();
    const result = await executeEveGithubOperation(
      input({
        operation: "create_issue",
        title: "Safe issue",
        body: "Safe engineering issue body.",
      }),
      {
        auditStore: { append: async () => undefined },
        consultPolicy,
        governanceStore: {
          loadSnapshot: async () => governance(false),
          recordDecision: async () => undefined,
        },
        performOperation,
      },
    );
    expect(result).toMatchObject({
      executed: false,
      reason: "release_disabled",
    });
    expect(consultPolicy).not.toHaveBeenCalled();
    expect(performOperation).not.toHaveBeenCalled();
  });
});
