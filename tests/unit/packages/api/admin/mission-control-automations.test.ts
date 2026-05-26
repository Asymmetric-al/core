import { describe, expect, it, vi } from "vitest";

import {
  assertAutomationPermission,
  canManageAutomations,
} from "../../../../../packages/api/src/admin/mission-control-automations/permissions";
import {
  automationRuleSchema,
  compileSimpleAutomation,
} from "../../../../../packages/api/src/admin/mission-control-automations/schemas";
import { saveMissionControlAutomationRule } from "../../../../../packages/api/src/admin/mission-control-automations/store";
import {
  planContributionAutomationAction,
  planDonorNotificationAutomationAction,
  planTaskAutomationAction,
} from "../../../../../packages/api/src/admin/mission-control-automations/adapters";
import {
  createAutomationPreview,
  ensureActivationReady,
} from "../../../../../packages/api/src/admin/mission-control-automations/preview";
import { evaluateAutomationRule } from "../../../../../packages/api/src/admin/mission-control-automations/evaluator";

import type { AuthenticatedContext } from "@asym/auth/context";

function authContext(
  overrides: Partial<AuthenticatedContext>,
): AuthenticatedContext {
  return {
    userId: "user_1",
    email: "admin@example.com",
    tenantId: "tenant_1",
    role: "admin",
    profileRole: "admin",
    memberships: [],
    profileId: "profile_1",
    isAuthenticated: true,
    ...overrides,
  };
}

describe("mission control automation permissions", () => {
  it("allows admins with automation:manage compatibility to manage automations", () => {
    expect(canManageAutomations(authContext({}))).toBe(true);
    expect(() => assertAutomationPermission(authContext({}))).not.toThrow();
  });

  it("blocks non-admin staff from managing automations", () => {
    expect(
      canManageAutomations(
        authContext({ role: "staff", profileRole: "staff" }),
      ),
    ).toBe(false);
    expect(() =>
      assertAutomationPermission(
        authContext({ role: "staff", profileRole: "staff" }),
      ),
    ).toThrow("automation:manage");
  });
});

describe("mission control automation schemas", () => {
  it("rejects arbitrary code action definitions", () => {
    expect(() =>
      automationRuleSchema.parse({
        name: "Unsafe",
        mode: "advanced",
        trigger: { kind: "contribution_action_completed" },
        conditions: [],
        actions: [{ kind: "run_javascript", code: "process.exit()" }],
        runMode: "automatic",
        enabled: false,
      }),
    ).toThrow();
  });

  it("compiles simple mode into the same declarative rule shape", () => {
    expect(
      compileSimpleAutomation({
        name: "Create task on failed receipt",
        when: "receipt_failed",
        then: "create_task",
      }),
    ).toEqual(
      expect.objectContaining({
        mode: "simple",
        trigger: { kind: "contribution_issue_created" },
        actions: [{ kind: "create_task", issueType: "receipt_failed" }],
      }),
    );
  });
});

describe("mission control automation preview and evaluation", () => {
  it("previews matching records and proposed task actions without mutation", async () => {
    const fetchCandidates = vi.fn().mockResolvedValue([
      { id: "record_1", issueType: "receipt_failed" },
      { id: "record_2", issueType: "crm_post_failed" },
    ]);

    const preview = await createAutomationPreview({
      rule: compileSimpleAutomation({
        name: "Receipt follow-up",
        when: "receipt_failed",
        then: "create_task",
      }),
      fetchCandidates,
    });

    expect(preview.matchedRecords).toEqual([{ id: "record_1" }]);
    expect(preview.proposedChanges[0]).toEqual(
      expect.objectContaining({
        recordId: "record_1",
        action: "mission_control_tasks",
      }),
    );
    expect(fetchCandidates).toHaveBeenCalled();
  });

  it("blocks activation until preview and test run are complete", () => {
    expect(() =>
      ensureActivationReady({
        hasFreshPreview: true,
        hasSuccessfulTestRun: false,
        activityLogConfigured: true,
      }),
    ).toThrow("test run");
  });

  it("blocks saving enabled automations without activation readiness", async () => {
    await expect(
      saveMissionControlAutomationRule({
        tenantId: "tenant_1",
        actorProfileId: "actor_1",
        rule: {
          name: "Unsafe active rule",
          mode: "advanced",
          trigger: { kind: "contribution_issue_created" },
          conditions: [],
          actions: [{ kind: "create_task", issueType: "receipt_failed" }],
          runMode: "automatic",
          enabled: true,
        },
        supabaseAdmin: {} as never,
      }),
    ).rejects.toThrow("preview");
  });

  it("plans donor email actions through Email Studio notification service only", () => {
    const result = evaluateAutomationRule({
      rule: {
        id: "rule_1",
        name: "Notify donor",
        mode: "advanced",
        trigger: { kind: "contribution_action_completed" },
        conditions: [],
        actions: [
          {
            kind: "send_donor_notification",
            actionType: "refund",
          },
        ],
        runMode: "review_first",
        enabled: true,
      },
      record: { id: "record_1", issueType: "refund" },
    });

    expect(result.plannedActions).toEqual([
      expect.objectContaining({
        service: "email_studio_notifications",
        method: "sendContributionCorrectionNotification",
      }),
    ]);
  });

  it("plans contribution actions through the shared contribution service", () => {
    const result = evaluateAutomationRule({
      rule: {
        id: "rule_1",
        name: "Refund review",
        mode: "advanced",
        trigger: { kind: "contribution_action_completed" },
        conditions: [],
        actions: [
          {
            kind: "contribution_action",
            actionType: "refund",
          },
        ],
        runMode: "review_first",
        enabled: true,
      },
      record: { id: "donation_1", issueType: "refund" },
    });

    expect(result.plannedActions).toEqual([
      expect.objectContaining({
        service: "contribution_operations",
        method: "executeContributionAction",
      }),
    ]);
  });

  it("domain adapters point automations at shared services", () => {
    expect(
      planContributionAutomationAction({
        actionType: "refund",
        contributionId: "donation_1",
      }),
    ).toMatchObject({
      service: "contribution_operations",
      method: "executeContributionAction",
    });

    expect(
      planDonorNotificationAutomationAction({
        actionType: "refund",
        contributionId: "donation_1",
      }),
    ).toMatchObject({
      service: "email_studio_notifications",
      method: "sendContributionCorrectionNotification",
    });

    expect(
      planTaskAutomationAction({
        issueType: "receipt_failed",
        contributionId: "donation_1",
      }),
    ).toMatchObject({
      service: "mission_control_tasks",
      method: "createMissionControlTask",
    });
  });
});
