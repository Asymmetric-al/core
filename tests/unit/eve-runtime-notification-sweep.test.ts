import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { runEveNotificationSweep } from "../../packages/eve-runtime/src/notifications/sweep";

import type { EveGovernanceSnapshot } from "@asym/api/eve/governance/types";
import type {
  EveNotificationChannelConfig,
  EveNotificationRecord,
} from "@asym/api/eve/notifications";

const mocks = vi.hoisted(() => ({
  claimDueRecords: vi.fn(),
  claimSessionOwnership: vi.fn(),
  completeAttempt: vi.fn(),
  deliverRecord: vi.fn(),
  executePolicyConsult: vi.fn(),
  getAdminClient: vi.fn(),
  loadChannels: vi.fn(),
  loadGovernance: vi.fn(),
  resolveAttemptState: vi.fn(),
}));

vi.mock("@asym/api/eve/approval-budget", () => ({
  executeEveRuntimePolicyConsult: mocks.executePolicyConsult,
}));

vi.mock("@asym/api/eve/audit", () => ({
  createServiceEveAuditIdentity: vi.fn((identity) => identity),
}));

vi.mock("@asym/api/eve/governance", () => ({
  loadEveGovernanceSnapshot: mocks.loadGovernance,
}));

vi.mock("@asym/api/eve/notifications", () => ({
  claimDueEveNotificationRecords: mocks.claimDueRecords,
  completeEveNotificationAttempt: mocks.completeAttempt,
  deliverEveNotificationRecord: mocks.deliverRecord,
  loadEveNotificationChannels: mocks.loadChannels,
  resolveEveNotificationAttemptState: mocks.resolveAttemptState,
}));

vi.mock("@asym/api/eve/session-ownership", () => ({
  claimEveSessionOwnership: mocks.claimSessionOwnership,
  createServiceEveSessionIdentity: vi.fn((identity) => identity),
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: mocks.getAdminClient,
}));

const TENANT_ID = "11111111-1111-4111-8111-111111111111";
const NOW = new Date("2026-07-18T09:30:00.000Z");
const adminClient = {};

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
  updatedAt: NOW.toISOString(),
};

function notificationConfig(
  overrides: Partial<EveNotificationChannelConfig> = {},
): EveNotificationChannelConfig {
  return {
    tenantId: TENANT_ID,
    channel: "discord",
    enabled: true,
    paused: false,
    minimumSeverity: "high",
    richDetailEnabled: false,
    destinationKey: "discord:ops-primary",
    dedupeWindowSeconds: 3_600,
    maxAttempts: 3,
    retryBaseSeconds: 60,
    policyVersion: 7,
    ...overrides,
  };
}

function notificationRecord(
  id: string,
  overrides: Partial<EveNotificationRecord> = {},
): EveNotificationRecord {
  return {
    id,
    tenantId: TENANT_ID,
    channel: "discord",
    destinationClass: "discord:ops-primary",
    envelope: {
      version: "eve-notification-v1",
      eventId: "44444444-4444-4444-8444-444444444444",
      eventType: "ci_failure",
      severity: "high",
      sourceKind: "engineering_monitor",
      sourceId: "monitor:ci_failure",
      targetId: "workflow:42",
      occurredAt: NOW.toISOString(),
      decisionSummary: "The current CI revision failed deterministic checks.",
      allowedDetails: {},
      policyVersion: 7,
      redactionVersion: "eve-notification-redaction-v1",
      expiresAt: "2026-07-18T10:30:00.000Z",
    },
    dedupeKey: id,
    idempotencyKey: `eve-notification/${id}`,
    status: "sending",
    attemptCount: 0,
    nextAttemptAt: NOW.toISOString(),
    deliveryExpiresAt: "2026-07-18T10:30:00.000Z",
    leaseToken: "55555555-5555-4555-8555-555555555555",
    ...overrides,
  };
}

describe("Eve notification runtime sweep", () => {
  beforeEach(() => {
    process.env.EVE_GITHUB_TENANT_ID = TENANT_ID;
    mocks.getAdminClient.mockReturnValue({ client: adminClient });
    mocks.claimSessionOwnership.mockResolvedValue(undefined);
    mocks.completeAttempt.mockResolvedValue(undefined);
    mocks.deliverRecord.mockResolvedValue(undefined);
    mocks.loadGovernance.mockResolvedValue(governance);
    mocks.loadChannels.mockResolvedValue([notificationConfig()]);
  });

  afterAll(() => {
    delete process.env.EVE_GITHUB_TENANT_ID;
  });

  it("reloads governance and channel controls for every delivery attempt", async () => {
    const records = [
      notificationRecord("22222222-2222-4222-8222-222222222222"),
      notificationRecord("33333333-3333-4333-8333-333333333333"),
    ];
    const pausedConfig = notificationConfig({ paused: true });
    const emergencyGovernance = { ...governance, emergencyOff: true };
    mocks.claimDueRecords.mockResolvedValue(records);
    mocks.loadGovernance
      .mockResolvedValueOnce(governance)
      .mockResolvedValueOnce(emergencyGovernance);
    mocks.loadChannels
      .mockResolvedValueOnce([notificationConfig()])
      .mockResolvedValueOnce([pausedConfig]);

    await runEveNotificationSweep(NOW);

    expect(mocks.loadGovernance).toHaveBeenCalledTimes(2);
    expect(mocks.loadChannels).toHaveBeenCalledTimes(2);
    expect(mocks.deliverRecord).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        config: pausedConfig,
        governance: emergencyGovernance,
        record: records[1],
      }),
    );
  });

  it.each([
    {
      attemptCount: 0,
      expectedNextAttemptAt: "2026-07-18T09:31:00.000Z",
      expectedStatus: "retryable_failed",
    },
    {
      attemptCount: 2,
      expectedNextAttemptAt: undefined,
      expectedStatus: "terminal_failed",
    },
  ])(
    "bounds runtime failures at attempt $attemptCount",
    async ({ attemptCount, expectedNextAttemptAt, expectedStatus }) => {
      const record = notificationRecord(
        "22222222-2222-4222-8222-222222222222",
        { attemptCount },
      );
      mocks.claimDueRecords.mockResolvedValue([record]);
      mocks.deliverRecord.mockRejectedValue(
        new Error("persistent runtime failure"),
      );
      mocks.resolveAttemptState.mockReturnValue({
        nextAttemptAt: expectedNextAttemptAt,
        status: expectedStatus,
      });

      await runEveNotificationSweep(NOW);

      expect(mocks.resolveAttemptState).toHaveBeenCalledWith({
        attemptCount,
        maxAttempts: 3,
        now: NOW,
        outcome: { retryable: true, success: false },
        retryBaseSeconds: 60,
      });
      expect(mocks.completeAttempt).toHaveBeenCalledWith({
        errorCode: "notification_runtime_error",
        nextAttemptAt: expectedNextAttemptAt,
        providerResponseClass: "runtime_error",
        record,
        status: expectedStatus,
        supabaseAdmin: adminClient,
      });
    },
  );
});
