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
  mutation?: { kind: "insert" | "update"; payload: unknown };
  orderBy?: { column: string; ascending?: boolean };
  limitCount?: number;
};

class MissionControlAutomationsQueryStub {
  readonly filters: Array<[string, string, unknown]> = [];
  selected?: string;
  mutation?: QueryCall["mutation"];
  orderBy?: { column: string; ascending?: boolean };
  limitCount?: number;
  rangeWindow?: { from: number; to: number };

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

  insert(payload: unknown): this {
    this.mutation = { kind: "insert", payload };
    return this;
  }

  update(payload: unknown): this {
    this.mutation = { kind: "update", payload };
    return this;
  }

  gte(column: string, value: unknown): this {
    this.filters.push(["gte", column, value]);
    return this;
  }

  in(column: string, values: unknown): this {
    this.filters.push(["in", column, values]);
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
    // Like PostgREST: never more rows than asked for.
    const rows = Array.isArray(this.result.data)
      ? this.result.data.slice(0, count)
      : (this.result.data ?? null);
    return Promise.resolve({
      data: rows,
      error: this.result.error ?? null,
    });
  }

  /** Pages like PostgREST: the slice of the rows, at most 1,000. */
  range(from: number, to: number): Promise<QueryResult> {
    this.rangeWindow = { from, to };
    const rows = Array.isArray(this.result.data) ? this.result.data : null;
    return Promise.resolve({
      data: rows ? rows.slice(from, Math.min(to + 1, from + 1000)) : null,
      error: this.result.error ?? null,
    });
  }

  single(): Promise<QueryResult> {
    return Promise.resolve({
      data: this.result.data ?? null,
      error: this.result.error ?? null,
    });
  }
}

/**
 * One result per table, or a list answered in call order (the last one
 * repeats) for a table the code reads more than once.
 */
function createMissionControlAutomationsSupabaseStub(
  resultsByTable: Record<string, QueryResult | QueryResult[]>,
) {
  const calls: QueryCall[] = [];
  const callsByTable = new Map<string, number>();
  const supabaseAdmin = {
    from(table: string) {
      const configured = resultsByTable[table] ?? { data: [] };
      const index = callsByTable.get(table) ?? 0;
      callsByTable.set(table, index + 1);
      const result = Array.isArray(configured)
        ? (configured[Math.min(index, configured.length - 1)] ?? { data: [] })
        : configured;
      return new MissionControlAutomationsQueryStub(table, result, calls);
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

  it.each(["refund", "crm_repost"])(
    "rejects unsupported %s contribution execution",
    (actionType) => {
      expect(() =>
        automationRuleSchema.parse({
          name: "Unsupported automation",
          mode: "advanced",
          trigger: { kind: "contribution_issue_created" },
          conditions: [],
          actions: [{ kind: "contribution_action", actionType }],
          runMode: "review_first",
          enabled: false,
        }),
      ).toThrow();
    },
  );

  it("allows provider-backed donor notifications without widening contribution execution", () => {
    expect(() =>
      automationRuleSchema.parse({
        name: "Refund notification",
        mode: "advanced",
        trigger: { kind: "contribution_action_completed" },
        conditions: [],
        actions: [{ kind: "send_donor_notification", actionType: "refund" }],
        runMode: "review_first",
        enabled: false,
      }),
    ).not.toThrow();
  });
});

describe("mission control automation preview and evaluation", () => {
  it("previews matching records and proposed task actions without mutation", async () => {
    const fetchCandidates = vi.fn().mockResolvedValue([
      {
        id: "record_1",
        eventKind: "contribution_issue_created",
        issueType: "receipt_failed",
      },
      {
        id: "record_2",
        eventKind: "contribution_issue_created",
        issueType: "crm_post_failed",
      },
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
        action: "create_task",
      }),
    );
    expect(fetchCandidates).toHaveBeenCalled();
  });

  it("does not match records from the wrong trigger kind", () => {
    const result = evaluateAutomationRule({
      rule: {
        id: "rule_1",
        name: "Receipt follow-up",
        mode: "advanced",
        trigger: { kind: "contribution_issue_created" },
        conditions: [{ kind: "always" }],
        actions: [{ kind: "create_task", issueType: "receipt_failed" }],
        runMode: "automatic",
        enabled: true,
      },
      record: {
        id: "record_1",
        eventKind: "contribution_action_completed",
        issueType: "receipt_failed",
      },
    });

    expect(result).toEqual({ matches: false, plannedActions: [] });
  });

  it("does not match advanced rules without explicit conditions", () => {
    const result = evaluateAutomationRule({
      rule: {
        id: "rule_1",
        name: "Receipt follow-up",
        mode: "advanced",
        trigger: { kind: "contribution_issue_created" },
        conditions: [],
        actions: [{ kind: "create_task", issueType: "receipt_failed" }],
        runMode: "automatic",
        enabled: true,
      },
      record: {
        id: "record_1",
        eventKind: "contribution_issue_created",
        issueType: "receipt_failed",
      },
    });

    expect(result).toEqual({ matches: false, plannedActions: [] });
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
    ).rejects.toMatchObject({
      status: 400,
      message: "Automation activation requires a fresh preview.",
    });
  });

  it("rejects active lifecycle status when the rule is disabled", async () => {
    await expect(
      saveMissionControlAutomationRule({
        tenantId: "tenant_1",
        actorProfileId: "actor_1",
        rule: {
          id: "rule_active_disabled",
          name: "Contradictory active rule",
          mode: "advanced",
          trigger: { kind: "contribution_issue_created" },
          conditions: [],
          actions: [{ kind: "create_task", issueType: "receipt_failed" }],
          runMode: "automatic",
          enabled: false,
          activationStatus: "active",
        },
        supabaseAdmin: {} as never,
      }),
    ).rejects.toMatchObject({
      status: 400,
      message: "Active automation status requires the rule to be enabled.",
    });
  });

  it("preserves provided non-active lifecycle status on disabled updates", async () => {
    const { calls, supabaseAdmin } =
      createMissionControlAutomationsSupabaseStub({
        mission_control_automation_rules: {
          data: automationRuleRow({
            id: "rule_ready",
            activation_status: "ready",
          }),
        },
      });

    const savedRule = await saveMissionControlAutomationRule({
      tenantId: "tenant_1",
      actorProfileId: "actor_1",
      rule: {
        id: "rule_ready",
        name: "Ready rule",
        mode: "advanced",
        trigger: { kind: "contribution_issue_created" },
        conditions: [],
        actions: [{ kind: "create_task", issueType: "receipt_failed" }],
        runMode: "automatic",
        enabled: false,
        activationStatus: "ready",
      },
      supabaseAdmin,
    });

    const updatePayload = calls.find(
      (call) => call.table === "mission_control_automation_rules",
    )?.mutation?.payload as Record<string, unknown> | undefined;

    expect(updatePayload).toMatchObject({ activation_status: "ready" });
    expect(savedRule.activationStatus).toBe("ready");
  });

  it("does not overwrite lifecycle status on disabled updates when status is omitted", async () => {
    const { calls, supabaseAdmin } =
      createMissionControlAutomationsSupabaseStub({
        mission_control_automation_rules: {
          data: automationRuleRow({
            id: "rule_paused",
            activation_status: "paused",
          }),
        },
      });

    const savedRule = await saveMissionControlAutomationRule({
      tenantId: "tenant_1",
      actorProfileId: "actor_1",
      rule: {
        id: "rule_paused",
        name: "Paused rule",
        mode: "advanced",
        trigger: { kind: "contribution_issue_created" },
        conditions: [],
        actions: [{ kind: "create_task", issueType: "receipt_failed" }],
        runMode: "automatic",
        enabled: false,
      },
      supabaseAdmin,
    });

    const updatePayload = calls.find(
      (call) => call.table === "mission_control_automation_rules",
    )?.mutation?.payload as Record<string, unknown> | undefined;

    expect(updatePayload).not.toHaveProperty("activation_status");
    expect(savedRule.activationStatus).toBe("paused");
  });

  it("plans donor email actions through Email Studio notification service only", () => {
    const result = evaluateAutomationRule({
      rule: {
        id: "rule_1",
        name: "Notify donor",
        mode: "advanced",
        trigger: { kind: "contribution_action_completed" },
        conditions: [{ kind: "always" }],
        actions: [
          {
            kind: "send_donor_notification",
            actionType: "refund",
          },
        ],
        runMode: "review_first",
        enabled: true,
      },
      record: {
        id: "record_1",
        eventKind: "contribution_action_completed",
        issueType: "refund",
      },
    });

    expect(result.plannedActions).toEqual([
      expect.objectContaining({
        service: "email_studio_notifications",
        method: "sendContributionCorrectionNotification",
      }),
    ]);
  });

  it("plans supported contribution actions through the shared contribution service", () => {
    const result = evaluateAutomationRule({
      rule: {
        id: "rule_1",
        name: "Amount correction review",
        mode: "advanced",
        trigger: { kind: "contribution_action_completed" },
        conditions: [{ kind: "always" }],
        actions: [
          {
            kind: "contribution_action",
            actionType: "amount_correction",
          },
        ],
        runMode: "review_first",
        enabled: true,
      },
      record: {
        id: "donation_1",
        eventKind: "contribution_action_completed",
        issueType: "correction_review",
      },
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
        actionType: "amount_correction",
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
  it("quarantines persisted CRM repost rules without breaking dashboard reads", async () => {
    const { supabaseAdmin } = createMissionControlAutomationsSupabaseStub({
      mission_control_automation_rules: {
        data: [
          automationRuleRow({
            id: "legacy_crm_repost",
            name: "Legacy CRM repost",
            enabled: true,
            activation_status: "active",
            actions: [
              { kind: "contribution_action", actionType: "crm_repost" },
            ],
          }),
        ],
      },
      mission_control_automation_activity_logs: { data: [] },
    });

    const dashboard = await loadMissionControlAutomationDashboard({
      supabaseAdmin,
      tenantId: "tenant_1",
    });

    expect(dashboard.automationRules).toEqual([
      expect.objectContaining({
        id: "legacy_crm_repost",
        enabled: false,
        activationStatus: "disabled",
        actions: [{ kind: "create_task", issueType: "crm_post_failed" }],
      }),
    ]);
    expect(dashboard.summary).toMatchObject({
      totalRules: 1,
      activeRules: 0,
      pausedRules: 1,
      invalidRules: 0,
    });
  });

  it("disables mixed CRM repost rules while preserving valid actions", async () => {
    const { supabaseAdmin } = createMissionControlAutomationsSupabaseStub({
      mission_control_automation_rules: {
        data: [
          automationRuleRow({
            id: "mixed_crm_repost",
            name: "Mixed CRM repost",
            enabled: true,
            activation_status: "active",
            actions: [
              { kind: "contribution_action", actionType: "crm_repost" },
              { kind: "contribution_action", actionType: "resend_receipt" },
            ],
          }),
        ],
      },
      mission_control_automation_activity_logs: { data: [] },
    });

    const dashboard = await loadMissionControlAutomationDashboard({
      supabaseAdmin,
      tenantId: "tenant_1",
    });

    expect(dashboard.automationRules).toEqual([
      expect.objectContaining({
        id: "mixed_crm_repost",
        enabled: false,
        activationStatus: "disabled",
        actions: [
          { kind: "contribution_action", actionType: "resend_receipt" },
        ],
      }),
    ]);
    expect(dashboard.summary).toMatchObject({
      totalRules: 1,
      activeRules: 0,
      pausedRules: 1,
      invalidRules: 0,
    });
  });

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
          automationRuleRow({
            id: "rule_ready",
            name: "Ready rule",
            enabled: false,
            activation_status: "ready",
          }),
          automationRuleRow({
            id: "rule_disabled_active",
            name: "Invalid disabled active rule",
            enabled: false,
            activation_status: "active",
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
      totalRules: 5,
      activeRules: 1,
      draftRules: 1,
      pausedRules: 1,
      readyRules: 1,
      invalidRules: 1,
      executions24h: 0,
      failedRuns24h: 0,
      activityLogBacked: true,
      integrationHealthBacked: false,
    });
    expect(
      dashboard.summary.activeRules +
        dashboard.summary.draftRules +
        dashboard.summary.invalidRules +
        dashboard.summary.pausedRules +
        dashboard.summary.readyRules,
    ).toBe(dashboard.summary.totalRules);
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

  it("carries each rule's runs, failed runs and last failure from the last 24 hours", async () => {
    const { calls, supabaseAdmin } =
      createMissionControlAutomationsSupabaseStub({
        mission_control_automation_rules: {
          data: [
            automationRuleRow({ id: "rule_failing", name: "Failing rule" }),
            automationRuleRow({ id: "rule_clean", name: "Clean rule" }),
            automationRuleRow({ id: "rule_idle", name: "Idle rule" }),
          ],
        },
        mission_control_automation_activity_logs: {
          data: [
            {
              rule_id: "rule_failing",
              failures: [{ message: "Action failed" }],
              created_at: "2026-11-10T09:30:00.000Z",
            },
            {
              rule_id: "rule_clean",
              failures: [],
              created_at: "2026-11-10T09:00:00.000Z",
            },
            {
              rule_id: "rule_failing",
              failures: [],
              created_at: "2026-11-10T08:45:00.000Z",
            },
            {
              rule_id: "rule_failing",
              failures: [{ message: "Provider timeout" }],
              created_at: "2026-11-10T08:00:00.000Z",
            },
            // A run whose rule was deleted, or never had one.
            {
              rule_id: null,
              failures: [{ message: "Orphaned failure" }],
              created_at: "2026-11-10T07:00:00.000Z",
            },
          ],
        },
      });

    const dashboard = await loadMissionControlAutomationDashboard({
      supabaseAdmin,
      tenantId: "tenant_1",
    });

    const activityCall = calls.find(
      (call) => call.table === "mission_control_automation_activity_logs",
    );
    expect(activityCall?.selected).toContain("rule_id");

    const byId = Object.fromEntries(
      dashboard.automationRules.map((rule) => [rule.id, rule]),
    );
    expect(byId.rule_failing).toMatchObject({
      runs24h: 3,
      failedRuns24h: 2,
      lastFailureAt: "2026-11-10T09:30:00.000Z",
    });
    expect(byId.rule_clean).toMatchObject({
      runs24h: 1,
      failedRuns24h: 0,
      lastFailureAt: null,
    });
    expect(byId.rule_idle).toMatchObject({
      runs24h: 0,
      failedRuns24h: 0,
      lastFailureAt: null,
    });
    // The summary still counts every failed run, attributed or not.
    expect(dashboard.summary.failedRuns24h).toBe(3);
    expect(dashboard.summary.executions24h).toBe(5);
  });

  it("lists rules past the first page that ran, so their failures are not blamed on deleted rules", async () => {
    const pageRows = Array.from({ length: 100 }, (_, index) =>
      automationRuleRow({ id: `rule_${index}`, name: `Rule ${index}` }),
    );
    const { calls, supabaseAdmin } =
      createMissionControlAutomationsSupabaseStub({
        mission_control_automation_rules: [
          { data: pageRows },
          // The follow-up read of rules the page left out.
          {
            data: [
              automationRuleRow({ id: "rule_150", name: "Older busy rule" }),
            ],
          },
        ],
        mission_control_automation_activity_logs: {
          data: [
            {
              rule_id: "rule_150",
              failures: [{ message: "Action failed" }],
              created_at: "2026-11-10T09:30:00.000Z",
            },
            {
              rule_id: "rule_150",
              failures: [],
              created_at: "2026-11-10T09:00:00.000Z",
            },
            {
              rule_id: "rule_3",
              failures: [],
              created_at: "2026-11-10T08:00:00.000Z",
            },
            // A deleted rule's run: the foreign key cleared its rule_id.
            {
              rule_id: null,
              failures: [{ message: "Orphaned failure" }],
              created_at: "2026-11-10T07:00:00.000Z",
            },
          ],
        },
      });

    const dashboard = await loadMissionControlAutomationDashboard({
      supabaseAdmin,
      tenantId: "tenant_1",
    });

    const ruleCalls = calls.filter(
      (call) => call.table === "mission_control_automation_rules",
    );
    expect(ruleCalls).toHaveLength(2);
    // Only the rule the page left out is read, and only in this tenant.
    expect(ruleCalls[1]?.filters).toContainEqual(["in", "id", ["rule_150"]]);
    expect(ruleCalls[1]?.filters).toContainEqual([
      "eq",
      "tenant_id",
      "tenant_1",
    ]);

    expect(dashboard.automationRules).toHaveLength(101);
    expect(
      dashboard.automationRules.find((rule) => rule.id === "rule_150"),
    ).toMatchObject({
      name: "Older busy rule",
      runs24h: 2,
      failedRuns24h: 1,
      lastFailureAt: "2026-11-10T09:30:00.000Z",
    });
    expect(dashboard.summary.totalRules).toBe(101);
    expect(dashboard.summary.failedRuns24h).toBe(2);
    // Only the run with no rule on record is left unattributed.
    expect(dashboard.summary.failedRunsWithoutRule24h).toBe(1);
  });

  it("counts a failed run as without a rule when its rule can't be read", async () => {
    const { supabaseAdmin } = createMissionControlAutomationsSupabaseStub({
      mission_control_automation_rules: [
        { data: [automationRuleRow({ id: "rule_1" })] },
        { data: [] },
      ],
      mission_control_automation_activity_logs: {
        data: [
          {
            rule_id: "rule_gone",
            failures: [{ message: "Action failed" }],
            created_at: "2026-11-10T09:30:00.000Z",
          },
        ],
      },
    });

    const dashboard = await loadMissionControlAutomationDashboard({
      supabaseAdmin,
      tenantId: "tenant_1",
    });

    expect(dashboard.automationRules.map((rule) => rule.id)).toEqual([
      "rule_1",
    ]);
    expect(dashboard.summary.failedRunsWithoutRule24h).toBe(1);
  });

  it("reads no extra rules when every rule that ran is already listed", async () => {
    const { calls, supabaseAdmin } =
      createMissionControlAutomationsSupabaseStub({
        mission_control_automation_rules: {
          data: [automationRuleRow({ id: "rule_1" })],
        },
        mission_control_automation_activity_logs: {
          data: [
            {
              rule_id: "rule_1",
              failures: [{ message: "Action failed" }],
              created_at: "2026-11-10T09:30:00.000Z",
            },
          ],
        },
      });

    const dashboard = await loadMissionControlAutomationDashboard({
      supabaseAdmin,
      tenantId: "tenant_1",
    });

    expect(
      calls.filter((call) => call.table === "mission_control_automation_rules"),
    ).toHaveLength(1);
    expect(dashboard.summary.failedRunsWithoutRule24h).toBe(0);
  });

  it("does not hide a failed read of the rules that ran past the first page", async () => {
    const { supabaseAdmin } = createMissionControlAutomationsSupabaseStub({
      mission_control_automation_rules: [
        { data: [] },
        { error: { message: "rules unavailable" } },
      ],
      mission_control_automation_activity_logs: {
        data: [
          {
            rule_id: "rule_9",
            failures: [],
            created_at: "2026-11-10T09:30:00.000Z",
          },
        ],
      },
    });

    await expect(
      loadMissionControlAutomationDashboard({
        supabaseAdmin,
        tenantId: "tenant_1",
      }),
    ).rejects.toThrow("rules unavailable");
  });

  it("keeps the latest failure time whatever order the log rows arrive in", async () => {
    const { supabaseAdmin } = createMissionControlAutomationsSupabaseStub({
      mission_control_automation_rules: {
        data: [automationRuleRow({ id: "rule_1" })],
      },
      mission_control_automation_activity_logs: {
        data: [
          {
            rule_id: "rule_1",
            failures: [{ message: "Older" }],
            created_at: "2026-11-10T01:00:00.000Z",
          },
          {
            rule_id: "rule_1",
            failures: [{ message: "Newer" }],
            created_at: "2026-11-10T05:00:00.000Z",
          },
        ],
      },
    });

    const dashboard = await loadMissionControlAutomationDashboard({
      supabaseAdmin,
      tenantId: "tenant_1",
    });

    expect(dashboard.automationRules[0]).toMatchObject({
      failedRuns24h: 2,
      lastFailureAt: "2026-11-10T05:00:00.000Z",
    });
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
      readyRules: 0,
      draftRules: 0,
      invalidRules: 0,
      executions24h: 0,
      failedRuns24h: 0,
      failedRunsWithoutRule24h: 0,
      activityLogBacked: true,
      integrationHealthBacked: false,
    });
  });
});

describe("automation activity beyond one page", () => {
  it("counts every run in the 24-hour window, past the first 1,000 rows", async () => {
    const rows = Array.from({ length: 2500 }, (_, index) => ({
      rule_id: index < 1200 ? "rule_busy" : "rule_quiet",
      failures: index === 2400 ? [{ message: "Provider timeout" }] : [],
      created_at: new Date(
        Date.UTC(2026, 10, 10, 9, 0, 0) - index * 1000,
      ).toISOString(),
    }));
    const { supabaseAdmin } = createMissionControlAutomationsSupabaseStub({
      mission_control_automation_rules: {
        data: [
          automationRuleRow({ id: "rule_busy", name: "Busy rule" }),
          automationRuleRow({ id: "rule_quiet", name: "Quiet rule" }),
        ],
      },
      mission_control_automation_activity_logs: { data: rows },
    });

    const dashboard = await loadMissionControlAutomationDashboard({
      supabaseAdmin,
      tenantId: "tenant_1",
    });

    const byId = Object.fromEntries(
      dashboard.automationRules.map((rule) => [rule.id, rule]),
    );
    expect(byId.rule_quiet).toMatchObject({ runs24h: 1300, failedRuns24h: 1 });
    expect(byId.rule_busy).toMatchObject({ runs24h: 1200, failedRuns24h: 0 });
    expect(dashboard.summary).toMatchObject({
      executions24h: 2500,
      failedRuns24h: 1,
    });
  });
});
