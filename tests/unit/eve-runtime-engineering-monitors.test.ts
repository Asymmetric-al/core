import {
  createEveEngineeringMonitorDefaults,
  prepareEveEngineeringFinding,
} from "@asym/api/eve/engineering-monitors";
import { describe, expect, it } from "vitest";

import { collectEveEngineeringMonitorEvidence } from "../../packages/eve-runtime/src/monitors/collect";
import { auditMonitor } from "../../packages/eve-runtime/src/monitors/sweep";

import type { EveEngineeringMonitorType } from "@asym/api/eve/engineering-monitors";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const TENANT_ID = "11111111-1111-4111-8111-111111111111";
const NOW = new Date("2026-07-18T08:30:00.000Z");

function config(type: EveEngineeringMonitorType) {
  return createEveEngineeringMonitorDefaults({
    now: NOW.toISOString(),
    policyVersion: 7,
    tenantId: TENANT_ID,
  }).find((candidate) => candidate.type === type)!;
}

describe("Eve engineering monitor collectors", () => {
  it("collects only completed failing CI runs", async () => {
    const findings = await collectEveEngineeringMonitorEvidence({
      config: config("ci_failure"),
      github: async () => ({
        workflow_runs: [
          {
            conclusion: "failure",
            head_sha: "abc123",
            html_url: "https://github.com/Asymmetric-al/core/actions/runs/42",
            id: 42,
            name: "CI",
            updated_at: NOW.toISOString(),
          },
          {
            conclusion: "success",
            head_sha: "def456",
            html_url: "https://github.com/Asymmetric-al/core/actions/runs/43",
            id: 43,
            name: "CI",
            updated_at: NOW.toISOString(),
          },
        ],
      }),
      now: NOW,
    });

    expect(findings).toEqual([
      expect.objectContaining({
        type: "ci_failure",
        checkId: "42",
        targetRevision: "abc123",
      }),
    ]);
  });

  it("applies the persisted stale-PR age and blocker rules", async () => {
    const findings = await collectEveEngineeringMonitorEvidence({
      config: config("stale_pull_request"),
      github: async () => [
        {
          draft: false,
          head: { sha: "abc123" },
          html_url: "https://github.com/Asymmetric-al/core/pull/42",
          labels: [{ name: "blocked" }],
          number: 42,
          updated_at: "2026-07-10T08:30:00.000Z",
        },
        {
          head: { sha: "def456" },
          html_url: "https://github.com/Asymmetric-al/core/pull/43",
          number: 43,
          updated_at: "2026-07-18T08:00:00.000Z",
        },
      ],
      now: NOW,
    });

    expect(findings).toEqual([
      expect.objectContaining({
        blocked: true,
        pullRequestNumber: 42,
        type: "stale_pull_request",
      }),
    ]);
  });

  it("separates failing eval workflows from ordinary CI failures", async () => {
    const findings = await collectEveEngineeringMonitorEvidence({
      config: config("failing_eval"),
      github: async () => ({
        workflow_runs: [
          {
            conclusion: "failure",
            head_sha: "abc123",
            html_url: "https://github.com/Asymmetric-al/core/actions/runs/42",
            id: 42,
            name: "Eve Runtime Evaluations",
            updated_at: NOW.toISOString(),
          },
          {
            conclusion: "failure",
            head_sha: "def456",
            html_url: "https://github.com/Asymmetric-al/core/actions/runs/43",
            id: 43,
            name: "CI",
            updated_at: NOW.toISOString(),
          },
        ],
      }),
      now: NOW,
    });

    expect(findings).toEqual([
      expect.objectContaining({
        caseId: "42",
        suite: "Eve Runtime Evaluations",
        type: "failing_eval",
      }),
    ]);
  });

  it("normalizes Dependabot and code-scanning alerts", async () => {
    const findings = await collectEveEngineeringMonitorEvidence({
      config: config("dependency_security_alert"),
      github: async (path) =>
        path.includes("dependabot")
          ? [
              {
                created_at: "2026-01-01T00:00:00.000Z",
                dependency: { package: { name: "zod" }, scope: "runtime" },
                html_url:
                  "https://github.com/Asymmetric-al/core/security/dependabot/42",
                number: 42,
                security_advisory: {
                  ghsa_id: "GHSA-1234",
                  severity: "critical",
                },
              },
            ]
          : [
              {
                created_at: "2026-01-01T00:00:00.000Z",
                html_url:
                  "https://github.com/Asymmetric-al/core/security/code-scanning/43",
                most_recent_instance: { ref: "refs/heads/main" },
                number: 43,
                rule: {
                  security_severity_level: "high",
                  tags: ["security"],
                },
              },
            ],
      now: NOW,
    });

    expect(findings.map((finding) => finding.type)).toEqual([
      "dependency_security_alert",
      "dependency_security_alert",
    ]);
    expect(findings.map((finding) => finding.targetId)).toEqual([
      "dependabot-alert:42",
      "code-scanning-alert:43",
    ]);
    expect(findings.map((finding) => finding.observedAt)).toEqual([
      NOW.toISOString(),
      NOW.toISOString(),
    ]);
    for (const evidence of findings) {
      expect(() =>
        prepareEveEngineeringFinding({
          config: config("dependency_security_alert"),
          evidence,
          now: NOW.toISOString(),
          runId: "22222222-2222-4222-8222-222222222222",
        }),
      ).not.toThrow();
    }
  });

  it("creates a run summary before inserting a monitor audit event", async () => {
    const writes: string[] = [];
    let runSummary: Record<string, unknown> | undefined;
    let auditEvent: Record<string, unknown> | undefined;
    const upsert = async (value: Record<string, unknown>) => {
      writes.push("run_summary");
      runSummary = value;
      return { error: null };
    };
    const insert = async (value: Record<string, unknown>) => {
      writes.push("audit_event");
      auditEvent = value;
      return { error: null };
    };
    const client = {
      from: (table: string) => {
        if (table === "eve_run_summaries") return { upsert };
        if (table === "eve_audit_events") return { insert };
        throw new Error(`Unexpected table: ${table}`);
      },
    } as unknown as AdminSupabaseClient;
    const runId = "22222222-2222-4222-8222-222222222222";

    await auditMonitor({
      action: "engineering_monitor.collection_started",
      config: config("ci_failure"),
      evidence: { policyVersion: 7 },
      result: "started",
      runId,
      supabaseAdmin: client,
    });

    expect(writes).toEqual(["run_summary", "audit_event"]);
    expect(runSummary).toEqual(
      expect.objectContaining({ id: runId, status: "started" }),
    );
    expect(auditEvent).toEqual(expect.objectContaining({ run_id: runId }));
  });

  it("reports only PRs that touch the protected-area registry", async () => {
    const findings = await collectEveEngineeringMonitorEvidence({
      config: config("protected_area_pull_request"),
      github: async (path) =>
        path.includes("/files")
          ? [{ filename: ".env.production" }]
          : [
              {
                head: { sha: "abc123" },
                html_url: "https://github.com/Asymmetric-al/core/pull/42",
                number: 42,
                requested_reviewers: [{}],
              },
            ],
      now: NOW,
    });

    expect(findings).toEqual([
      expect.objectContaining({
        pullRequestNumber: 42,
        reviewState: "review_requested",
        type: "protected_area_pull_request",
      }),
    ]);
    expect(
      findings[0]?.type === "protected_area_pull_request" &&
        findings[0].matchedRules.length,
    ).toBeGreaterThan(0);
  });

  it("emits only rate-limit scopes at or below the persisted threshold", async () => {
    const findings = await collectEveEngineeringMonitorEvidence({
      config: config("budget_rate_limit"),
      github: async () => ({
        resources: {
          core: { limit: 5_000, remaining: 0, reset: 1_768_736_400 },
          graphql: {
            limit: 5_000,
            remaining: 4_000,
            reset: 1_768_736_400,
          },
        },
      }),
      now: NOW,
    });

    expect(findings).toEqual([
      expect.objectContaining({
        scope: "core",
        status: "exhausted",
        type: "budget_rate_limit",
      }),
    ]);
  });
});
