import { afterEach, describe, expect, it, vi } from "vitest";

import {
  assertAutomationPermission,
  canManageAutomations,
} from "../../../../../packages/api/src/admin/mission-control-automations/permissions";
import {
  automationRuleSchema,
  compileSimpleAutomation,
} from "../../../../../packages/api/src/admin/mission-control-automations/schemas";
import {
  loadMissionControlAutomationDashboard,
  saveMissionControlAutomationRule,
} from "../../../../../packages/api/src/admin/mission-control-automations/store";
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
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

type QueryResult = {
  data?: unknown;
  error?: { message: string } | null;
};

type QueryCall = {
  table: string;
  selected?: string;
  filters: Array<[string, string, unknown]>;
  orderBy?: { column: string; ascending?: boolean };
  limitCount?: number;
};

class MissionControlAutomationsQueryStub {
  readonly filters: Array<[string, string, unknown]> = [];
  selected?: string;
  orderBy?: { column: string; ascending?: boolean };
  limitCount?: number;

  constructor(
    readonly table: string,
    private readonly result: QueryResult,
    private readonly calls: QueryCall[],
  ) {
    this.calls.push(this);
  }

  select(columns: string): this {
    this.selected = columns;
    return this;
  }

  eq(column: string, value: unknown): this {
    this.filters.push(["eq", column, value]);
    return this;
  }

  gte(column: string, value: unknown): this {
    this.filters.push(["gte", column, value]);
    return this;
  }

  order(
    column: string,
    options?: {
      ascending?: boolean;
    },
  ): this {
    this.orderBy = { column, ascending: options?.ascending };
    return this;
  }

  limit(count: number): Promise<QueryResult> {
    this.limitCount = count;
    return Promise.resolve({
      data: this.result.data ?? null,
      error: this.result.error ?? null,
    });
  }
}

function createMissionControlAutomationsSupabaseStub(
  resultsByTable: Record<string, QueryResult>,
) {
  const calls: QueryCall[] = [];
  const supabaseAdmin = {
    from(table: string) {
      return new MissionControlAutomationsQueryStub(
        table,
        resultsByTable[table] ?? { data: [] },
        calls,
      );
    },
  } as unknown as AdminSupabaseClient;

  return { calls, supabaseAdmin };
}

function automationRuleRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "rule_1",
    name: "Receipt follow-up",
    mode: "advanced",
    trigger: { kind: "contribution_issue_created" },
    conditions: [],
    actions: [{ kind: "create_task", issueType: "receipt_failed" }],
    run_mode: "automatic",
    enabled: false,
    activation_status: "draft",
    updated_at: "2026-05-30T00:00:00.000Z",
    ...overrides,
  };
}

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

afterEach(() => {
  vi.useRealTimers();
});

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

describe("mission control automation dashboard summary", () => {
  it("counts persisted rules by activation state", async () => {
    const { supabaseAdmin } = createMissionControlAutomationsSupabaseStub({
      mission_control_automation_rules: {
        data: [
          automationRuleRow({
            id: "rule_active",
            name: "Active rule",
            enabled: true,
            activation_status: "active",
          }),
          automationRuleRow({
            id: "rule_draft",
            name: "Draft rule",
            enabled: false,
            activation_status: "draft",
          }),
          automationRuleRow({
            id: "rule_paused",
            name: "Paused rule",
            enabled: false,
            activation_status: "paused",
          }),
        ],
      },
      mission_control_automation_activity_logs: { data: [] },
    });

    const dashboard = await loadMissionControlAutomationDashboard({
      supabaseAdmin,
      tenantId: "tenant_1",
    });

    expect(dashboard.summary).toMatchObject({
      totalRules: 3,
      activeRules: 1,
      draftRules: 1,
      pausedRules: 1,
      executions24h: 0,
      failedRuns24h: 0,
      activityLogBacked: true,
      integrationHealthBacked: false,
    });
    expect(dashboard.automationRules[0]).toHaveProperty(
      "activationStatus",
      "active",
    );
  });

  it("counts executions and failed runs from recent activity logs", async () => {
    const { supabaseAdmin } = createMissionControlAutomationsSupabaseStub({
      mission_control_automation_rules: {
        data: [
          automationRuleRow({
            id: "rule_active",
            enabled: true,
            activation_status: "active",
          }),
        ],
      },
      mission_control_automation_activity_logs: {
        data: [
          { failures: [] },
          { failures: [{ message: "Action failed" }] },
          { failures: "not-an-array" },
        ],
      },
    });

    const dashboard = await loadMissionControlAutomationDashboard({
      supabaseAdmin,
      tenantId: "tenant_1",
    });

    expect(dashboard.summary.executions24h).toBe(3);
    expect(dashboard.summary.failedRuns24h).toBe(1);
  });

  it("scopes activity queries to the tenant and the last 24 hours", async () => {
    const earliestExpectedCutoff = Date.now() - 24 * 60 * 60 * 1000 - 1000;
    const { calls, supabaseAdmin } =
      createMissionControlAutomationsSupabaseStub({
        mission_control_automation_rules: { data: [] },
        mission_control_automation_activity_logs: { data: [] },
      });

    await loadMissionControlAutomationDashboard({
      supabaseAdmin,
      tenantId: "tenant_1",
    });

    const activityCall = calls.find(
      (call) => call.table === "mission_control_automation_activity_logs",
    );

    expect(activityCall).toBeTruthy();
    expect(activityCall?.filters).toContainEqual([
      "eq",
      "tenant_id",
      "tenant_1",
    ]);
    const cutoffFilter = activityCall?.filters.find(
      ([operator, column]) => operator === "gte" && column === "created_at",
    );
    const cutoff = Date.parse(String(cutoffFilter?.[2] ?? ""));

    expect(Number.isNaN(cutoff)).toBe(false);
    expect(cutoff).toBeGreaterThanOrEqual(earliestExpectedCutoff);
    expect(cutoff).toBeLessThanOrEqual(Date.now());
  });

  it("does not mask activity log query failures as zero activity", async () => {
    const { supabaseAdmin } = createMissionControlAutomationsSupabaseStub({
      mission_control_automation_rules: { data: [] },
      mission_control_automation_activity_logs: {
        error: { message: "activity log unavailable" },
      },
    });

    await expect(
      loadMissionControlAutomationDashboard({
        supabaseAdmin,
        tenantId: "tenant_1",
      }),
    ).rejects.toThrow("activity log unavailable");
  });

  it("does not return demo dashboard defaults", async () => {
    const { supabaseAdmin } = createMissionControlAutomationsSupabaseStub({
      mission_control_automation_rules: { data: [] },
      mission_control_automation_activity_logs: { data: [] },
    });

    const dashboard = await loadMissionControlAutomationDashboard({
      supabaseAdmin,
      tenantId: "tenant_1",
    });

    expect(dashboard.summary).toEqual({
      totalRules: 0,
      activeRules: 0,
      pausedRules: 0,
      draftRules: 0,
      executions24h: 0,
      failedRuns24h: 0,
      activityLogBacked: true,
      integrationHealthBacked: false,
    });
  });
});
