import { describe, expect, it } from "vitest";

import {
  ensureCorrectionApprovalWorkflow,
  evaluatePendingApprovalSla,
  planApprovalNotifications,
  processCorrectionApprovalSla,
  recordCorrectionApprovalOutcome,
  resolveApprovalNotificationSettings,
  resolveApproverNotificationPreference,
} from "../../../../../packages/api/src/admin/contribution-operations/approval-notifications";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const TENANT_ID = "tenant-1";
const REQUEST_ID = "request-1";

interface StubState {
  request: Record<string, unknown>;
  requests: Array<Record<string, unknown>>;
  failingRequestUpdateIds: Set<string>;
  lostApprovalTaskUpdateTo: string | null;
  approvalSettings: Record<string, unknown> | null;
  approvers: Array<Record<string, unknown>>;
  preferences: Array<Record<string, unknown>>;
  approvalNotifications: Array<Record<string, unknown>>;
  queues: Array<Record<string, unknown>>;
  tasks: Array<Record<string, unknown>>;
  taskLinks: Array<Record<string, unknown>>;
  taskEvents: Array<Record<string, unknown>>;
  auditEvents: Array<Record<string, unknown>>;
}

function pendingRequest(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    id: REQUEST_ID,
    tenant_id: TENANT_ID,
    donation_id: "donation-1",
    action_type: "amount_correction",
    payload: { amount: 20_000 },
    reason: "Donor reported the wrong amount",
    requested_by_profile_id: "requester-1",
    source_surface: "donor_crm_record",
    status: "pending",
    expected_revision: null,
    idempotency_key: "request-key",
    receipt_delivery_proposal: {},
    decided_by_profile_id: null,
    decided_at: null,
    decision_reason: null,
    applied_adjustment_id: null,
    approval_task_id: null,
    follow_up_task_id: null,
    last_reminder_at: null,
    escalated_at: null,
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-01T00:00:00.000Z",
    ...overrides,
  };
}

function stubState(): StubState {
  const request = pendingRequest();
  return {
    request,
    requests: [request],
    failingRequestUpdateIds: new Set(),
    lostApprovalTaskUpdateTo: null,
    approvalSettings: null,
    approvers: [{ id: "approver-1" }, { id: "approver-2" }],
    preferences: [],
    approvalNotifications: [],
    queues: [],
    tasks: [],
    taskLinks: [],
    taskEvents: [],
    auditEvents: [],
  };
}

class QueryBuilder {
  private operation: "select" | "insert" | "upsert" | "update" = "select";
  private payload: unknown = null;
  private maybeSingleResult = false;
  private statusFilter: string | null = null;
  private idFilter: string | null = null;

  constructor(
    private readonly table: string,
    private readonly state: StubState,
  ) {}

  select() {
    return this;
  }

  insert(payload: unknown) {
    this.operation = "insert";
    this.payload = payload;
    return this;
  }

  upsert(payload: unknown) {
    this.operation = "upsert";
    this.payload = payload;
    return this;
  }

  update(payload: unknown) {
    this.operation = "update";
    this.payload = payload;
    return this;
  }

  eq(column: string, value: unknown) {
    if (column === "status" && typeof value === "string") {
      this.statusFilter = value;
    }
    if (column === "id" && typeof value === "string") {
      this.idFilter = value;
    }
    return this;
  }

  in() {
    return this;
  }

  is() {
    return this;
  }

  single() {
    this.maybeSingleResult = true;
    return this;
  }

  maybeSingle() {
    this.maybeSingleResult = true;
    return this;
  }

  private resolve(): {
    data: unknown;
    error: { message: string } | null;
  } {
    if (this.table === "contribution_correction_requests") {
      if (this.operation === "update") {
        const payload =
          typeof this.payload === "object" &&
          this.payload !== null &&
          !Array.isArray(this.payload)
            ? (this.payload as Record<string, unknown>)
            : {};
        const targetRequest =
          this.state.requests.find((row) => row.id === this.idFilter) ??
          this.state.request;
        const targetRequestId =
          typeof targetRequest.id === "string" ? targetRequest.id : "";
        if (this.state.failingRequestUpdateIds.has(targetRequestId)) {
          return {
            data: null,
            error: { message: `failed to update ${targetRequestId}` },
          };
        }
        if (
          "approval_task_id" in payload &&
          this.state.lostApprovalTaskUpdateTo
        ) {
          targetRequest.approval_task_id = this.state.lostApprovalTaskUpdateTo;
          return { data: [], error: null };
        }

        Object.assign(targetRequest, this.payload);
        return {
          data: [
            {
              id: targetRequest.id,
              approval_task_id: targetRequest.approval_task_id,
            },
          ],
          error: null,
        };
      }

      if (this.idFilter) {
        const row =
          this.state.requests.find((request) => request.id === this.idFilter) ??
          this.state.request;
        return { data: { ...row }, error: null };
      }

      if (this.maybeSingleResult) {
        return { data: { ...this.state.request }, error: null };
      }

      const rows =
        this.statusFilter === "pending"
          ? this.state.requests.filter((row) => row.status === "pending")
          : this.state.requests;
      return { data: rows.map((row) => ({ ...row })), error: null };
    }

    if (this.table === "contribution_approval_notification_settings") {
      return { data: this.state.approvalSettings, error: null };
    }

    if (this.table === "profiles") {
      return { data: this.state.approvers, error: null };
    }

    if (this.table === "contribution_approval_notification_preferences") {
      return { data: this.state.preferences, error: null };
    }

    if (this.table === "contribution_approval_notifications") {
      if (this.operation === "upsert") {
        const rows = (
          Array.isArray(this.payload) ? this.payload : [this.payload]
        ) as Array<Record<string, unknown>>;
        const inserted: Array<Record<string, unknown>> = [];

        for (const row of rows) {
          const existing = this.state.approvalNotifications.some(
            (notification) => notification.dedupe_key === row.dedupe_key,
          );
          if (existing) {
            continue;
          }

          const stored = {
            id: `notification-${this.state.approvalNotifications.length + 1}`,
            ...row,
          };
          this.state.approvalNotifications.push(stored);
          inserted.push({ id: stored.id });
        }

        return { data: inserted, error: null };
      }
    }

    if (this.table === "mission_control_queues") {
      if (this.operation === "upsert") {
        this.state.queues.push(this.payload as Record<string, unknown>);
      }
      return { data: { id: "queue-1" }, error: null };
    }

    if (this.table === "mission_control_tasks") {
      if (this.operation === "insert") {
        this.state.tasks.push({
          id: "task-1",
          ...(this.payload as Record<string, unknown>),
        });
        return { data: { id: "task-1" }, error: null };
      }

      if (this.operation === "update") {
        const task = this.state.tasks.find((row) => row.id === this.idFilter);
        if (task) {
          Object.assign(task, this.payload);
        }
      }
      return { data: null, error: null };
    }

    if (this.table === "mission_control_task_links") {
      if (this.operation === "insert") {
        this.state.taskLinks.push(
          ...((Array.isArray(this.payload)
            ? this.payload
            : [this.payload]) as Array<Record<string, unknown>>),
        );
      }
      return { data: null, error: null };
    }

    if (this.table === "mission_control_task_events") {
      if (this.operation === "insert") {
        this.state.taskEvents.push(this.payload as Record<string, unknown>);
      }
      return { data: null, error: null };
    }

    if (this.table === "contribution_operation_audit_events") {
      if (this.operation === "insert") {
        this.state.auditEvents.push({
          id: "audit-1",
          ...(this.payload as Record<string, unknown>),
        });
      }
      return { data: { id: "audit-1" }, error: null };
    }

    return { data: null, error: null };
  }

  then<TResult>(
    onfulfilled: (value: {
      data: unknown;
      error: { message: string } | null;
    }) => TResult,
  ): Promise<TResult> {
    return Promise.resolve(this.resolve()).then(onfulfilled);
  }
}

function createStub(state: StubState): AdminSupabaseClient {
  return {
    from(table: string) {
      return new QueryBuilder(table, state);
    },
  } as unknown as AdminSupabaseClient;
}

describe("admin/contribution-operations/approval-notifications", () => {
  it("uses conservative defaults: task and in-app on, email off", () => {
    const settings = resolveApprovalNotificationSettings(null);
    expect(settings).toEqual({
      createApprovalTask: true,
      inAppEnabled: true,
      emailEnabled: false,
    });

    const preference = resolveApproverNotificationPreference(null);
    expect(preference).toEqual({ inAppEnabled: true, emailEnabled: false });
  });

  it("plans at most one approval task per correction request", () => {
    const settings = resolveApprovalNotificationSettings(null);

    const fresh = planApprovalNotifications({
      requestId: "request-1",
      settings,
      eligibleApprovers: [
        {
          profileId: "approver-1",
          preference: { inAppEnabled: true, emailEnabled: false },
        },
      ],
      existingTaskId: null,
    });
    expect(fresh.createTask).toBe(true);

    const replay = planApprovalNotifications({
      requestId: "request-1",
      settings,
      eligibleApprovers: [
        {
          profileId: "approver-1",
          preference: { inAppEnabled: true, emailEnabled: false },
        },
      ],
      existingTaskId: "task-1",
    });
    expect(replay.createTask).toBe(false);
  });

  it("delivers per preferences without letting preferences widen who is notified", () => {
    const settings = resolveApprovalNotificationSettings({
      create_approval_task: true,
      in_app_enabled: true,
      email_enabled: true,
    });

    const plan = planApprovalNotifications({
      requestId: "request-1",
      settings,
      eligibleApprovers: [
        {
          profileId: "approver-in-app",
          preference: { inAppEnabled: true, emailEnabled: false },
        },
        {
          profileId: "approver-both",
          preference: { inAppEnabled: true, emailEnabled: true },
        },
        {
          profileId: "approver-quiet",
          preference: { inAppEnabled: false, emailEnabled: false },
        },
      ],
      existingTaskId: null,
    });

    const byRecipient = new Map<string, string[]>();
    for (const notification of plan.notifications) {
      const channels = byRecipient.get(notification.recipientProfileId) ?? [];
      channels.push(notification.channel);
      byRecipient.set(notification.recipientProfileId, channels);
    }

    expect(byRecipient.get("approver-in-app")).toEqual(["in_app"]);
    expect(byRecipient.get("approver-both")).toEqual(["in_app", "email"]);
    expect(byRecipient.has("approver-quiet")).toBe(false);
    // Only eligible approvers can ever appear in the plan; a preference row
    // for anyone else has no input path, so it cannot grant approval reach.
    expect(byRecipient.size).toBe(2);
  });

  it("suppresses email when the tenant has it disabled even if the user opted in", () => {
    const plan = planApprovalNotifications({
      requestId: "request-1",
      settings: resolveApprovalNotificationSettings({
        email_enabled: false,
      }),
      eligibleApprovers: [
        {
          profileId: "approver-1",
          preference: { inAppEnabled: true, emailEnabled: true },
        },
      ],
      existingTaskId: null,
    });

    expect(
      plan.notifications.filter((entry) => entry.channel === "email"),
    ).toHaveLength(0);
  });

  it("produces stable dedupe keys so retried deliveries are idempotent", () => {
    const settings = resolveApprovalNotificationSettings(null);
    const planA = planApprovalNotifications({
      requestId: "request-1",
      settings,
      eligibleApprovers: [
        {
          profileId: "approver-1",
          preference: { inAppEnabled: true, emailEnabled: false },
        },
      ],
      existingTaskId: null,
    });
    const planB = planApprovalNotifications({
      requestId: "request-1",
      settings,
      eligibleApprovers: [
        {
          profileId: "approver-1",
          preference: { inAppEnabled: true, emailEnabled: false },
        },
      ],
      existingTaskId: null,
    });

    expect(planA.notifications[0]!.dedupeKey).toBe(
      planB.notifications[0]!.dedupeKey,
    );
  });

  it("derives reminder, escalation, and pending-too-long state from tenant timing", () => {
    const base = {
      status: "pending",
      createdAt: "2026-06-01T00:00:00.000Z",
      lastReminderAt: null,
      escalatedAt: null,
      reminderHours: 24,
      escalationHours: 72,
    };

    expect(
      evaluatePendingApprovalSla({ ...base, now: "2026-06-01T12:00:00.000Z" }),
    ).toEqual({
      reminderDue: false,
      escalationDue: false,
      pendingTooLong: false,
    });

    expect(
      evaluatePendingApprovalSla({ ...base, now: "2026-06-02T01:00:00.000Z" }),
    ).toEqual({
      reminderDue: true,
      escalationDue: false,
      pendingTooLong: true,
    });

    // A recent reminder keeps things quiet until the next interval.
    expect(
      evaluatePendingApprovalSla({
        ...base,
        lastReminderAt: "2026-06-02T01:00:00.000Z",
        now: "2026-06-02T12:00:00.000Z",
      }).reminderDue,
    ).toBe(false);

    // Escalation fires once after the configured interval.
    const escalated = evaluatePendingApprovalSla({
      ...base,
      lastReminderAt: "2026-06-03T00:00:00.000Z",
      now: "2026-06-04T01:00:00.000Z",
    });
    expect(escalated.escalationDue).toBe(true);
    expect(
      evaluatePendingApprovalSla({
        ...base,
        escalatedAt: "2026-06-04T01:00:00.000Z",
        now: "2026-06-05T00:00:00.000Z",
      }).escalationDue,
    ).toBe(false);

    // Escalation disabled when not configured.
    expect(
      evaluatePendingApprovalSla({
        ...base,
        escalationHours: null,
        now: "2026-06-10T00:00:00.000Z",
      }).escalationDue,
    ).toBe(false);

    // Decided requests never remind or escalate (and nothing auto-approves).
    expect(
      evaluatePendingApprovalSla({
        ...base,
        status: "approved",
        now: "2026-06-10T00:00:00.000Z",
      }),
    ).toEqual({
      reminderDue: false,
      escalationDue: false,
      pendingTooLong: false,
    });
  });

  it("creates one approval task, approver notifications, and an audit event", async () => {
    const state = stubState();
    state.approvalSettings = {
      create_approval_task: true,
      in_app_enabled: true,
      email_enabled: true,
    };
    state.preferences = [
      {
        profile_id: "approver-2",
        in_app_enabled: true,
        email_enabled: true,
      },
    ];

    const outcome = await ensureCorrectionApprovalWorkflow({
      supabaseAdmin: createStub(state),
      tenantId: TENANT_ID,
      requestId: REQUEST_ID,
    });

    expect(outcome).toEqual({
      approvalTaskId: "task-1",
      notificationsCreated: 3,
    });
    expect(state.request.approval_task_id).toBe("task-1");
    expect(state.tasks[0]).toMatchObject({
      source_module: "contribution_operations",
      issue_type: "correction_review",
      queue_id: "queue-1",
    });
    expect(state.approvalNotifications).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          recipient_profile_id: "approver-1",
          channel: "in_app",
          kind: "approval_requested",
        }),
        expect.objectContaining({
          recipient_profile_id: "approver-2",
          channel: "email",
          kind: "approval_requested",
        }),
      ]),
    );
    expect(state.auditEvents[0]).toMatchObject({
      tenant_id: TENANT_ID,
      donation_id: "donation-1",
      operation: "amount_correction",
      downstream_effects: expect.objectContaining({
        correctionRequestId: REQUEST_ID,
        approvalTaskId: "task-1",
        approverNotifications: 3,
      }),
    });
  });

  it("uses the persisted approval task when a concurrent caller wins the link update", async () => {
    const state = stubState();
    state.lostApprovalTaskUpdateTo = "task-winner";

    const outcome = await ensureCorrectionApprovalWorkflow({
      supabaseAdmin: createStub(state),
      tenantId: TENANT_ID,
      requestId: REQUEST_ID,
    });

    expect(outcome.approvalTaskId).toBe("task-winner");
    expect(state.request.approval_task_id).toBe("task-winner");
    expect(state.tasks[0]).toMatchObject({
      id: "task-1",
      status: "dismissed",
      dismissed_reason:
        "Duplicate approval task superseded by concurrent workflow setup.",
    });
    expect(state.auditEvents[0]).toMatchObject({
      downstream_effects: expect.objectContaining({
        approvalTaskId: "task-winner",
      }),
    });
  });

  it("does not duplicate audit events on a pure workflow replay", async () => {
    const state = stubState();
    state.request.approval_task_id = "task-existing";
    state.approvalNotifications.push(
      {
        dedupe_key:
          "correction-request/request-1/approval_requested/in_app/approver-1",
      },
      {
        dedupe_key:
          "correction-request/request-1/approval_requested/in_app/approver-2",
      },
    );

    const outcome = await ensureCorrectionApprovalWorkflow({
      supabaseAdmin: createStub(state),
      tenantId: TENANT_ID,
      requestId: REQUEST_ID,
    });

    expect(outcome).toEqual({
      approvalTaskId: "task-existing",
      notificationsCreated: 0,
    });
    expect(state.tasks).toHaveLength(0);
    expect(state.auditEvents).toHaveLength(0);
  });

  it("records approval outcomes by completing tasks and notifying the requester", async () => {
    const state = stubState();
    state.request.approval_task_id = "task-1";
    state.tasks.push({
      id: "task-1",
      tenant_id: TENANT_ID,
      status: "open",
    });

    await recordCorrectionApprovalOutcome({
      supabaseAdmin: createStub(state),
      tenantId: TENANT_ID,
      request: {
        id: REQUEST_ID,
        tenantId: TENANT_ID,
        donationId: "donation-1",
        actionType: "amount_correction",
        payload: {},
        reason: "Donor reported the wrong amount",
        requestedByProfileId: "requester-1",
        sourceSurface: "donor_crm_record",
        status: "approved",
        expectedRevision: null,
        receiptDeliveryProposal: {},
        decidedByProfileId: "approver-1",
        decidedAt: "2026-06-02T00:00:00.000Z",
        decisionReason: null,
        appliedAdjustmentId: "adjustment-1",
        approvalTaskId: "task-1",
        followUpTaskId: null,
        lastReminderAt: null,
        escalatedAt: null,
        createdAt: "2026-06-01T00:00:00.000Z",
      },
      decision: "approved",
      decisionReason: null,
    });

    expect(state.tasks[0]).toMatchObject({
      status: "completed",
      completed_at: expect.any(String),
      updated_at: expect.any(String),
    });
    expect(state.approvalNotifications).toEqual([
      expect.objectContaining({
        recipient_profile_id: "requester-1",
        kind: "outcome",
        dedupe_key: "correction-request/request-1/outcome/approved/requester",
      }),
    ]);
  });

  it("processes pending approval SLA reminders and escalations without approving", async () => {
    const state = stubState();
    state.approvalSettings = {
      create_approval_task: true,
      in_app_enabled: true,
      email_enabled: false,
    };

    const outcome = await processCorrectionApprovalSla({
      supabaseAdmin: createStub(state),
      tenantId: TENANT_ID,
      policy: { reminderHours: 24, escalationHours: 72 },
      now: "2026-06-04T01:00:00.000Z",
    });

    expect(outcome).toEqual({ remindersSent: 2, escalationsSent: 2 });
    expect(state.request.status).toBe("pending");
    expect(state.request.last_reminder_at).toBe("2026-06-04T01:00:00.000Z");
    expect(state.request.escalated_at).toBe("2026-06-04T01:00:00.000Z");
    expect(
      state.approvalNotifications.map((notification) => notification.kind),
    ).toEqual(["reminder", "reminder", "escalation", "escalation"]);
  });

  it("marks escalation handled even when no escalation notifications are deliverable", async () => {
    const state = stubState();
    state.approvalSettings = {
      create_approval_task: true,
      in_app_enabled: false,
      email_enabled: false,
    };

    const outcome = await processCorrectionApprovalSla({
      supabaseAdmin: createStub(state),
      tenantId: TENANT_ID,
      policy: { reminderHours: 24, escalationHours: 72 },
      now: "2026-06-04T01:00:00.000Z",
    });

    expect(outcome).toEqual({ remindersSent: 0, escalationsSent: 0 });
    expect(state.approvalNotifications).toHaveLength(0);
    expect(state.request.last_reminder_at).toBeNull();
    expect(state.request.escalated_at).toBe("2026-06-04T01:00:00.000Z");
  });

  it("stamps reminder SLA state when a retry dedupes existing notifications", async () => {
    const state = stubState();
    state.approvalSettings = {
      create_approval_task: true,
      in_app_enabled: true,
      email_enabled: false,
    };
    state.approvalNotifications.push(
      {
        dedupe_key:
          "correction-request/request-1/reminder/in_app/approver-1/round-1",
      },
      {
        dedupe_key:
          "correction-request/request-1/reminder/in_app/approver-2/round-1",
      },
    );

    const outcome = await processCorrectionApprovalSla({
      supabaseAdmin: createStub(state),
      tenantId: TENANT_ID,
      policy: { reminderHours: 24, escalationHours: 72 },
      now: "2026-06-02T01:00:00.000Z",
    });

    expect(outcome).toEqual({ remindersSent: 0, escalationsSent: 0 });
    expect(state.approvalNotifications).toHaveLength(2);
    expect(state.request.last_reminder_at).toBe("2026-06-02T01:00:00.000Z");
    expect(state.request.escalated_at).toBeNull();
  });

  it("stamps escalation SLA state when a retry dedupes existing notifications", async () => {
    const state = stubState();
    state.request.last_reminder_at = "2026-06-04T00:30:00.000Z";
    state.approvalSettings = {
      create_approval_task: true,
      in_app_enabled: true,
      email_enabled: false,
    };
    state.approvalNotifications.push(
      {
        dedupe_key: "correction-request/request-1/escalation/in_app/approver-1",
      },
      {
        dedupe_key: "correction-request/request-1/escalation/in_app/approver-2",
      },
    );

    const outcome = await processCorrectionApprovalSla({
      supabaseAdmin: createStub(state),
      tenantId: TENANT_ID,
      policy: { reminderHours: 24, escalationHours: 72 },
      now: "2026-06-04T01:00:00.000Z",
    });

    expect(outcome).toEqual({ remindersSent: 0, escalationsSent: 0 });
    expect(state.approvalNotifications).toHaveLength(2);
    expect(state.request.last_reminder_at).toBe("2026-06-04T00:30:00.000Z");
    expect(state.request.escalated_at).toBe("2026-06-04T01:00:00.000Z");
  });

  it("continues processing later SLA rows when one request update fails", async () => {
    const state = stubState();
    const secondRequest = pendingRequest({
      id: "request-2",
      donation_id: "donation-2",
    });
    state.requests.push(secondRequest);
    state.failingRequestUpdateIds.add(REQUEST_ID);
    state.approvalSettings = {
      create_approval_task: true,
      in_app_enabled: true,
      email_enabled: false,
    };

    await expect(
      processCorrectionApprovalSla({
        supabaseAdmin: createStub(state),
        tenantId: TENANT_ID,
        policy: { reminderHours: 24, escalationHours: 72 },
        now: "2026-06-02T01:00:00.000Z",
      }),
    ).rejects.toThrow(
      "Failed to process 1 correction approval SLA request(s): request-1: failed to update request-1",
    );

    expect(state.request.last_reminder_at).toBeNull();
    expect(secondRequest.last_reminder_at).toBe("2026-06-02T01:00:00.000Z");
    expect(
      state.approvalNotifications.filter(
        (notification) => notification.correction_request_id === "request-2",
      ),
    ).toHaveLength(2);
  });
});
