import {
  createEveNotificationChannelDefaults,
  createEveNotificationDedupeKey,
  evaluateEveNotificationGate,
  prepareEveNotificationEnvelope,
  renderEveDiscordNotification,
  resolveEveNotificationAttemptState,
} from "@asym/api/eve/notifications";
import { describe, expect, it } from "vitest";

import type { EveEngineeringFinding } from "@asym/api/eve/engineering-monitors";
import type { EveGovernanceSnapshot } from "@asym/api/eve/governance";

const TENANT_ID = "11111111-1111-4111-8111-111111111111";
const NOW = "2026-07-18T09:30:00.000Z";

const finding: EveEngineeringFinding = {
  id: "22222222-2222-4222-8222-222222222222",
  tenantId: TENANT_ID,
  monitorId: "monitor:ci_failure",
  runId: "33333333-3333-4333-8333-333333333333",
  signalType: "ci_failure",
  targetId: "workflow:42",
  targetRevision: "abc123",
  firstObservedAt: NOW,
  lastObservedAt: NOW,
  severity: "high",
  status: "open",
  dedupeKey: "a".repeat(64),
  policyVersion: 7,
  safeEvidence: {
    checkId: "42",
    workflowName: "CI @core",
    safeUrl: "https://github.com/Asymmetric-al/core/actions/runs/42?token=nope",
    repository: "Asymmetric-al/core",
    ignoredRawLog: "never include this",
  },
  decisionSummary: "The current CI revision failed deterministic checks.",
  observationCount: 1,
};

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

describe("Eve operator notifications", () => {
  it("ships both channels disabled, paused, and minimal", () => {
    const configs = createEveNotificationChannelDefaults({
      policyVersion: 7,
      tenantId: TENANT_ID,
    });
    expect(configs.map((value) => value.channel)).toEqual(["email", "discord"]);
    expect(
      configs.every(
        (value) => !value.enabled && value.paused && !value.richDetailEnabled,
      ),
    ).toBe(true);
  });

  it("builds a strict safe envelope and strips URL credentials/query data", () => {
    const envelope = prepareEveNotificationEnvelope({ finding, now: NOW });
    expect(envelope.safeReference).toBe(
      "https://github.com/Asymmetric-al/core/actions/runs/42",
    );
    expect(envelope.allowedDetails).toEqual({
      checkId: "42",
      workflowName: "CI @core",
    });
    expect(JSON.stringify(envelope)).not.toContain("ignoredRawLog");
    expect(JSON.stringify(envelope)).not.toContain("token=nope");
  });

  it("uses stable destination- and time-bucket dedupe keys", () => {
    const envelope = prepareEveNotificationEnvelope({ finding, now: NOW });
    const input = {
      channel: "discord" as const,
      dedupeWindowSeconds: 3_600,
      destinationClass: "discord:ops-primary",
      envelope,
    };
    expect(createEveNotificationDedupeKey(input)).toBe(
      createEveNotificationDedupeKey(input),
    );
    expect(
      createEveNotificationDedupeKey({
        ...input,
        destinationClass: "discord:secondary",
      }),
    ).not.toBe(createEveNotificationDedupeKey(input));
  });

  it("fails closed on pause, release, policy version, severity, and expiry", () => {
    const config = {
      ...createEveNotificationChannelDefaults({
        policyVersion: 7,
        tenantId: TENANT_ID,
      })[1]!,
      enabled: true,
      paused: false,
    };
    expect(
      evaluateEveNotificationGate({
        config,
        governance,
        severity: "high",
        now: NOW,
        sourcePolicyVersion: 7,
        expiresAt: "2026-07-18T10:00:00.000Z",
      }),
    ).toEqual({ allowed: true, reason: "allowed" });
    for (const candidate of [
      {
        config: { ...config, paused: true },
        governance,
        severity: "high" as const,
      },
      {
        config,
        governance: { ...governance, releaseEnabled: false },
        severity: "high" as const,
      },
      {
        config: { ...config, policyVersion: 6 },
        governance,
        severity: "high" as const,
      },
      { config, governance, severity: "medium" as const },
    ]) {
      expect(
        evaluateEveNotificationGate({
          ...candidate,
          now: NOW,
          sourcePolicyVersion: 7,
          expiresAt: "2026-07-18T10:00:00.000Z",
        }).allowed,
      ).toBe(false);
    }
    expect(
      evaluateEveNotificationGate({
        config,
        governance,
        severity: "high",
        now: NOW,
        sourcePolicyVersion: 7,
        expiresAt: NOW,
      }).reason,
    ).toBe("notification_expired");
  });

  it("backs off retryable attempts and stops at the configured bound", () => {
    expect(
      resolveEveNotificationAttemptState({
        attemptCount: 0,
        maxAttempts: 3,
        now: new Date(NOW),
        outcome: { retryable: true, success: false },
        retryBaseSeconds: 60,
      }),
    ).toEqual({
      nextAttemptAt: "2026-07-18T09:31:00.000Z",
      retryable: true,
      status: "retryable_failed",
    });
    expect(
      resolveEveNotificationAttemptState({
        attemptCount: 2,
        maxAttempts: 3,
        now: new Date(NOW),
        outcome: { retryable: true, success: false },
        retryBaseSeconds: 60,
      }),
    ).toEqual({ retryable: false, status: "terminal_failed" });
  });

  it("keeps Discord mentions inert and rich details policy-bound", () => {
    const envelope = prepareEveNotificationEnvelope({ finding, now: NOW });
    const minimal = renderEveDiscordNotification({
      envelope,
      richDetailEnabled: false,
    }).text;
    const rich = renderEveDiscordNotification({
      envelope,
      richDetailEnabled: true,
    }).text;
    expect(minimal).not.toContain("checkId");
    expect(rich).toContain("checkId: 42");
    expect(rich).not.toContain("@core");
    expect(rich.length).toBeLessThanOrEqual(2_000);
  });

  it("rejects unsafe summaries before persistence or delivery", () => {
    expect(() =>
      prepareEveNotificationEnvelope({
        finding: { ...finding, decisionSummary: "donor@example.com failed" },
        now: NOW,
      }),
    ).toThrow("data boundary");
  });
});
