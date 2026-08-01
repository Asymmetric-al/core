import { createServiceEveAuditIdentity } from "@asym/api/eve/audit";
import {
  createEveEngineeringFindingDedupeKey,
  createEveEngineeringMonitorDefaults,
  EVE_ENGINEERING_MONITOR_TYPES,
  evaluateEveEngineeringMonitorGate,
  isEveProductOpportunityMonitor,
  parseEveEngineeringMonitorType,
  prepareEveEngineeringFinding,
} from "@asym/api/eve/engineering-monitors";
import { publishEveGithubMonitorComment } from "@asym/api/eve/github-review";
import { describe, expect, it, vi } from "vitest";

import type {
  EveEngineeringFinding,
  EveEngineeringMonitorConfig,
  EveEngineeringMonitorEvidence,
} from "@asym/api/eve/engineering-monitors";
import type { EveGovernanceSnapshot } from "@asym/api/eve/governance";

const TENANT_ID = "11111111-1111-4111-8111-111111111111";
const NOW = "2026-07-18T08:30:00.000Z";

function config(type: EveEngineeringMonitorConfig["type"]) {
  return {
    ...createEveEngineeringMonitorDefaults({
      now: NOW,
      policyVersion: 7,
      tenantId: TENANT_ID,
    }).find((candidate) => candidate.type === type)!,
    enabled: true,
    paused: false,
  };
}

const governance: EveGovernanceSnapshot = {
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
  stateVersion: 7,
  updatedAt: NOW,
};

function evidence(
  type: EveEngineeringMonitorConfig["type"],
): EveEngineeringMonitorEvidence {
  const base = {
    observedAt: NOW,
    repository: "Asymmetric-al/core" as const,
    safeUrl: "https://github.com/Asymmetric-al/core/actions/runs/42",
    targetId: "target:42",
    targetRevision: "abc123",
  };
  switch (type) {
    case "ci_failure":
      return {
        ...base,
        type,
        checkId: "42",
        conclusion: "failure",
        workflowName: "CI",
      };
    case "stale_pull_request":
      return {
        ...base,
        type,
        blocked: false,
        draft: false,
        lastActivityAt: "2026-07-10T08:30:00.000Z",
        pullRequestNumber: 42,
        thresholdSeconds: 604_800,
      };
    case "failing_eval":
      return {
        ...base,
        type,
        caseId: "case-42",
        deterministicStatus: "failed",
        judgeStatus: "not_used",
        suite: "Eve Runtime Evaluations",
      };
    case "dependency_security_alert":
      return {
        ...base,
        type,
        advisoryId: "GHSA-1234",
        advisorySeverity: "critical",
        affectedScope: "zod:runtime",
        alertSource: "dependabot",
      };
    case "protected_area_pull_request":
      return {
        ...base,
        type,
        matchedRules: ["environment-file"],
        pullRequestNumber: 42,
        reviewState: "review_requested",
      };
    case "budget_rate_limit":
      return {
        ...base,
        type,
        remaining: 0,
        resetAt: "2026-07-18T09:00:00.000Z",
        scope: "core",
        status: "exhausted",
        total: 5_000,
      };
  }
}

describe("Eve engineering health monitors", () => {
  it("defines exactly six disabled, paused, destinationless defaults", () => {
    const values = createEveEngineeringMonitorDefaults({
      now: NOW,
      policyVersion: 7,
      tenantId: TENANT_ID,
    });
    expect(values.map((value) => value.type)).toEqual([
      ...EVE_ENGINEERING_MONITOR_TYPES,
    ]);
    expect(values).toHaveLength(6);
    expect(
      values.every(
        (value) =>
          !value.enabled &&
          value.paused &&
          value.destinationPolicy.kind === "none",
      ),
    ).toBe(true);
  });

  it("fails closed for product-opportunity and unknown monitor types", () => {
    expect(isEveProductOpportunityMonitor("product_opportunity_scan")).toBe(
      true,
    );
    expect(() =>
      parseEveEngineeringMonitorType("product_opportunity_scan"),
    ).toThrow();
    expect(() => parseEveEngineeringMonitorType("customer_health")).toThrow();
  });

  it("requires enabled, unpaused, current-policy Core scope and active governance", () => {
    expect(
      evaluateEveEngineeringMonitorGate({
        config: config("ci_failure"),
        governance,
      }),
    ).toEqual({ allowed: true, reason: "allowed" });
    expect(
      evaluateEveEngineeringMonitorGate({
        config: { ...config("ci_failure"), paused: true },
        governance,
      }).reason,
    ).toBe("paused");
    expect(
      evaluateEveEngineeringMonitorGate({
        config: { ...config("ci_failure"), policyVersion: 6 },
        governance,
      }).reason,
    ).toBe("policy_version_mismatch");
    expect(
      evaluateEveEngineeringMonitorGate({
        config: config("ci_failure"),
        governance: { ...governance, releaseEnabled: false },
      }).reason,
    ).toBe("governance_blocked");
  });

  it.each(EVE_ENGINEERING_MONITOR_TYPES)(
    "normalizes minimum safe %s evidence",
    (type) => {
      const finding = prepareEveEngineeringFinding({
        config: config(type),
        evidence: evidence(type),
        now: NOW,
        runId: "22222222-2222-4222-8222-222222222222",
      });
      expect(finding.signalType).toBe(type);
      expect(finding.observationCount).toBe(1);
      expect(finding.safeEvidence).not.toHaveProperty("rawLogs");
    },
  );

  it("rejects stale evidence, mismatched types, non-GitHub references, and business data", () => {
    expect(() =>
      prepareEveEngineeringFinding({
        config: config("ci_failure"),
        evidence: {
          ...evidence("ci_failure"),
          observedAt: "2026-01-01T00:00:00.000Z",
        },
        now: NOW,
        runId: crypto.randomUUID(),
      }),
    ).toThrow("stale");
    expect(() =>
      prepareEveEngineeringFinding({
        config: config("ci_failure"),
        evidence: evidence("failing_eval"),
        now: NOW,
        runId: crypto.randomUUID(),
      }),
    ).toThrow("does not match");
    expect(() =>
      prepareEveEngineeringFinding({
        config: config("ci_failure"),
        evidence: {
          ...evidence("ci_failure"),
          safeUrl: "https://example.com/run",
        },
        now: NOW,
        runId: crypto.randomUUID(),
      }),
    ).toThrow();
    expect(() =>
      prepareEveEngineeringFinding({
        config: config("ci_failure"),
        evidence: {
          ...evidence("ci_failure"),
          workflowName: "donor email: donor@example.com",
        },
        now: NOW,
        runId: crypto.randomUUID(),
      }),
    ).toThrow("data boundary");
  });

  it("deduplicates rolling signals and reopens resolved findings", () => {
    const first = prepareEveEngineeringFinding({
      config: config("stale_pull_request"),
      evidence: evidence("stale_pull_request"),
      now: NOW,
      runId: crypto.randomUUID(),
    });
    const nextEvidence = {
      ...evidence("stale_pull_request"),
      targetRevision: "def456",
    } as EveEngineeringMonitorEvidence;
    expect(
      createEveEngineeringFindingDedupeKey({
        evidence: nextEvidence,
        monitorId: first.monitorId,
      }),
    ).toBe(first.dedupeKey);
    const reopened = prepareEveEngineeringFinding({
      config: config("stale_pull_request"),
      evidence: nextEvidence,
      existing: { ...first, status: "resolved" } as EveEngineeringFinding,
      now: NOW,
      runId: crypto.randomUUID(),
    });
    expect(reopened.status).toBe("open");
    expect(reopened.observationCount).toBe(2);
  });

  it("publishes comments only after both governance and policy allow", async () => {
    const append = vi.fn().mockResolvedValue(undefined);
    const postComment = vi.fn().mockResolvedValue({ resourceId: "99" });
    const result = await publishEveGithubMonitorComment(
      {
        accountableTrigger: "schedule:ci",
        body: "CI is failing for the current revision.",
        dedupeKey: "a".repeat(64),
        headSha: "abc123",
        identity: createServiceEveAuditIdentity({
          initiatorId: "schedule:ci",
          initiatorType: "schedule",
          serviceId: "eve-monitor-scheduler",
          tenantId: TENANT_ID,
        }),
        installationId: 42,
        owner: "Asymmetric-al",
        pullRequestNumber: 42,
        repo: "core",
        runId: "33333333-3333-4333-8333-333333333333",
      },
      {
        auditStore: { append },
        consultPolicy: vi.fn().mockResolvedValue({
          actionId: "engineering.github_operation.write",
          decision: "allow",
          reason: "operational_policy_allowed",
          trustZone: "engineering",
          writeClass: "operational",
        }),
        governanceStore: {
          loadSnapshot: vi.fn().mockResolvedValue(governance),
          recordDecision: vi.fn().mockResolvedValue(undefined),
        },
        postComment,
      },
    );
    expect(result).toMatchObject({ published: true, resourceId: "99" });
    expect(postComment).toHaveBeenCalledOnce();
    expect(append).toHaveBeenCalledTimes(2);
  });
});
