import { describe, expect, it } from "vitest";

import {
  buildContributionCorrectionNotificationMergeValues,
  logContributionNotificationEvent,
  readContributionNotificationSettings,
} from "../../../../../packages/api/src/admin/contribution-operations/notifications/store";

class NotificationEventQuery {
  private payload: Record<string, unknown> | null = null;
  private filters = new Map<string, unknown>();

  constructor(
    private readonly options: {
      duplicate?: boolean;
      inserted?: Record<string, unknown>[];
      existing?: Record<string, unknown> | null;
    },
  ) {}

  insert(payload: Record<string, unknown>) {
    this.payload = payload;
    return this;
  }

  select() {
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.set(column, value);
    return this;
  }

  async single() {
    if (this.options.duplicate) {
      return {
        data: null,
        error: { code: "23505", message: "duplicate key" },
      };
    }

    if (this.payload) {
      this.options.inserted?.push(this.payload);
    }

    return {
      data: { id: "event_1", task_ids: this.payload?.task_ids ?? [] },
      error: null,
    };
  }

  async maybeSingle() {
    expect(this.filters.get("tenant_id")).toBe("tenant_1");
    expect(this.filters.get("idempotency_key")).toBe(
      "correction-notification/tenant_1/audit_1/donor_1/refund_notification/refund_completed",
    );

    return {
      data: this.options.existing ?? null,
      error: null,
    };
  }
}

function createSupabaseStub(options: {
  duplicate?: boolean;
  inserted?: Record<string, unknown>[];
  existing?: Record<string, unknown> | null;
}) {
  return {
    from(table: string) {
      expect(table).toBe("contribution_notification_events");
      return new NotificationEventQuery(options);
    },
  };
}

class NotificationSettingsQuery {
  private filters = new Map<string, unknown>();

  constructor(private readonly row: Record<string, unknown> | null) {}

  select() {
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.set(column, value);
    return this;
  }

  async maybeSingle() {
    expect(this.filters.get("tenant_id")).toBe("tenant_1");
    expect(this.filters.get("action_type")).toBe("designation_correction");

    return {
      data: this.row,
      error: null,
    };
  }
}

function createSettingsSupabaseStub(row: Record<string, unknown> | null) {
  return {
    from(table: string) {
      expect(table).toBe("contribution_notification_settings");
      return new NotificationSettingsQuery(row);
    },
  };
}

const baseEvent = {
  tenantId: "tenant_1",
  idempotencyKey:
    "correction-notification/tenant_1/audit_1/donor_1/refund_notification/refund_completed",
  operationAuditEventId: "audit_1",
  correctionId: "correction_1",
  actionType: "refund" as const,
  decision: "sent" as const,
  templateId: "template_1",
  templateVersionId: "version_1",
  templateFamily: "refund_notification",
  templateVariant: "refund_completed",
  templateVersion: 3,
  recipientDonorId: "donor_1",
  recipientEmail: "donor@example.com",
  policySnapshot: {
    mode: "auto_notify",
    suppressionReasonRequired: true,
  },
  personalNotePresent: false,
  providerStatus: "sent",
  providerMessageId: "msg_1",
  taskIds: [],
};

describe("logContributionNotificationEvent", () => {
  it("persists idempotency keys and policy snapshots", async () => {
    const inserted: Record<string, unknown>[] = [];

    const result = await logContributionNotificationEvent({
      supabaseAdmin: createSupabaseStub({ inserted }) as never,
      event: baseEvent,
    });

    expect(result).toEqual({ eventId: "event_1", taskIds: [] });
    expect(inserted[0]).toEqual(
      expect.objectContaining({
        tenant_id: "tenant_1",
        idempotency_key: baseEvent.idempotencyKey,
        policy_snapshot: baseEvent.policySnapshot,
        decision: "sent",
        sent_at: expect.any(String),
      }),
    );
  });

  it("returns existing task ids when idempotent logging is replayed", async () => {
    const result = await logContributionNotificationEvent({
      supabaseAdmin: createSupabaseStub({
        duplicate: true,
        existing: { id: "event_existing", task_ids: ["task_existing"] },
      }) as never,
      event: baseEvent,
    });

    expect(result).toEqual({
      eventId: "event_existing",
      taskIds: ["task_existing"],
    });
  });
});

describe("readContributionNotificationSettings", () => {
  it("returns tenant policy overrides from contribution_notification_settings", async () => {
    const result = await readContributionNotificationSettings({
      supabaseAdmin: createSettingsSupabaseStub({
        mode: "auto_notify",
        suppression_reason_required: true,
        task_assignment_mode: "queue_only",
      }) as never,
      tenantId: "tenant_1",
      actionType: "designation_correction",
    });

    expect(result).toEqual({
      mode: "auto_notify",
      suppressionReasonRequired: true,
      taskAssignmentMode: "queue_only",
    });
  });

  it("falls back to defaults when no tenant policy row exists", async () => {
    const result = await readContributionNotificationSettings({
      supabaseAdmin: createSettingsSupabaseStub(null) as never,
      tenantId: "tenant_1",
      actionType: "designation_correction",
    });

    expect(result).toEqual({
      mode: null,
      suppressionReasonRequired: null,
      taskAssignmentMode: null,
    });
  });
});

describe("buildContributionCorrectionNotificationMergeValues", () => {
  it("uses before and after summaries for designation names", () => {
    const values = buildContributionCorrectionNotificationMergeValues({
      detail: {
        id: "contribution_1",
        amount: { value: 12000, currency: "USD" },
        donor: { id: "donor_1", name: "Donor One", email: "donor@example.com" },
        donorVisible: { status: "Corrected" },
        gift: { date: "2026-05-01T00:00:00.000Z" },
        refund: { amount: 0, status: "none" },
        shared: { designationSummary: { fundName: "Fallback Fund" } },
      } as never,
      beforeSummary: { amount: 10000, designationName: "General Fund" },
      afterSummary: {
        amount: 12000,
        designationName: "Clean Water Initiative",
      },
      orgName: "Give Hope",
      supportContactEmail: "finance@givehope.test",
    });

    expect(values).toEqual(
      expect.objectContaining({
        previous_designation_name: "General Fund",
        corrected_designation_name: "Clean Water Initiative",
        support_contact_link: "mailto:finance@givehope.test",
      }),
    );
  });

  it("does not invent placeholder support links", () => {
    const values = buildContributionCorrectionNotificationMergeValues({
      detail: {
        id: "contribution_1",
        amount: { value: 12000, currency: "USD" },
        donor: null,
        donorVisible: { status: "Corrected" },
        gift: { date: "2026-05-01T00:00:00.000Z" },
        refund: { amount: 0, status: "none" },
        shared: { designationSummary: { fundName: "Fallback Fund" } },
      } as never,
    });

    expect(values.support_contact_link).toBeNull();
    expect(values.donor_portal_link).toMatch(/^https?:\/\//);
    expect(new URL(values.donor_portal_link as string).pathname).toBe(
      "/donor-dashboard/history",
    );
    expect(values.receipt_link).toBe(values.donor_portal_link);
    expect(values.statement_link).toBe(values.donor_portal_link);
  });
});
