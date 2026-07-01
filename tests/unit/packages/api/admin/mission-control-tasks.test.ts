import { describe, expect, it, vi } from "vitest";

import { resolveMissionControlTaskAssignment } from "../../../../../packages/api/src/admin/mission-control-tasks/assignment-policy";
import { createMissionControlTask } from "../../../../../packages/api/src/admin/mission-control-tasks/service";
import {
  getSuggestedAttentionUrgency,
  recordUrgencyOverride,
} from "../../../../../packages/api/src/admin/mission-control-tasks/urgency";
import { upsertNeedsAttentionItem } from "../../../../../packages/api/src/admin/mission-control-tasks/attention";
import {
  createMissionControlTaskInSupabase,
  listContributionNeedsAttention,
} from "../../../../../packages/api/src/admin/mission-control-tasks/store";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

interface StubState {
  queues: Array<Record<string, unknown>>;
  tasks: Array<Record<string, unknown>>;
  links: Array<Record<string, unknown>>;
  events: Array<Record<string, unknown>>;
  attentionRows: Array<Record<string, unknown>>;
}

class QueryBuilder {
  private operation: "select" | "insert" | "upsert" = "select";
  private payload: unknown = null;
  private statusFilter: string | null = null;

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

  eq(column: string, value: unknown) {
    if (column === "status" && typeof value === "string") {
      this.statusFilter = value;
    }
    return this;
  }

  order() {
    return this;
  }

  limit() {
    return this;
  }

  single() {
    return this;
  }

  private resolve(): {
    data: unknown;
    error: { message: string } | null;
  } {
    if (this.table === "mission_control_queues") {
      if (this.operation === "upsert") {
        this.state.queues.push(this.payload as Record<string, unknown>);
      }
      return { data: { id: "queue_1" }, error: null };
    }

    if (this.table === "mission_control_tasks") {
      if (this.operation === "insert") {
        this.state.tasks.push(this.payload as Record<string, unknown>);
      }
      return { data: { id: "task_1" }, error: null };
    }

    if (this.table === "mission_control_task_links") {
      if (this.operation === "insert") {
        this.state.links.push(
          ...((Array.isArray(this.payload)
            ? this.payload
            : [this.payload]) as Array<Record<string, unknown>>),
        );
      }
      return { data: null, error: null };
    }

    if (this.table === "mission_control_task_events") {
      if (this.operation === "insert") {
        this.state.events.push(this.payload as Record<string, unknown>);
      }
      return { data: null, error: null };
    }

    if (this.table === "mission_control_attention_items") {
      const rows = this.statusFilter
        ? this.state.attentionRows.filter(
            (row) => row.status === this.statusFilter,
          )
        : this.state.attentionRows;

      return { data: rows, error: null };
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

function stubState(): StubState {
  return {
    queues: [],
    tasks: [],
    links: [],
    events: [],
    attentionRows: [],
  };
}

describe("mission control task assignment", () => {
  it("defaults contribution follow-up tasks to actor plus Finance Operations queue", () => {
    expect(
      resolveMissionControlTaskAssignment({
        actorProfileId: "actor_1",
        defaultQueueId: "finance_queue",
        mode: "actor_and_queue",
      }),
    ).toEqual({
      assigneeProfileId: "actor_1",
      queueId: "finance_queue",
    });
  });

  it("supports actor-only and queue-only assignment settings", () => {
    expect(
      resolveMissionControlTaskAssignment({
        actorProfileId: "actor_1",
        defaultQueueId: "finance_queue",
        mode: "actor_only",
      }),
    ).toEqual({
      assigneeProfileId: "actor_1",
      queueId: null,
    });

    expect(
      resolveMissionControlTaskAssignment({
        actorProfileId: "actor_1",
        defaultQueueId: "finance_queue",
        mode: "queue_only",
      }),
    ).toEqual({
      assigneeProfileId: null,
      queueId: "finance_queue",
    });
  });
});

describe("mission control task urgency", () => {
  it("marks donor trust and money-state risks as critical", () => {
    expect(
      getSuggestedAttentionUrgency({
        issueType: "failed_refund",
        firstSeenAt: "2026-05-26T00:00:00.000Z",
        now: new Date("2026-05-26T01:00:00.000Z"),
      }),
    ).toBe("critical");
  });

  it("ages normal issues into high urgency after tenant threshold", () => {
    expect(
      getSuggestedAttentionUrgency({
        issueType: "missing_designation",
        firstSeenAt: "2026-05-25T00:00:00.000Z",
        now: new Date("2026-05-26T01:00:00.000Z"),
        thresholds: {
          normalToHighHours: 24,
          highToCriticalHours: 48,
        },
      }),
    ).toBe("high");
  });

  it("records audited urgency overrides", () => {
    expect(
      recordUrgencyOverride({
        actorProfileId: "actor_1",
        previousUrgency: "normal",
        newUrgency: "high",
        reason: "Donor called twice.",
        now: new Date("2026-05-26T00:00:00.000Z"),
      }),
    ).toEqual({
      actorProfileId: "actor_1",
      previousUrgency: "normal",
      newUrgency: "high",
      reason: "Donor called twice.",
      changedAt: "2026-05-26T00:00:00.000Z",
    });
  });
});

describe("mission control task creation", () => {
  it("creates tasks with linked contribution context and audit event", async () => {
    const insertTask = vi.fn().mockResolvedValue("task_1");
    const insertLinks = vi.fn().mockResolvedValue(undefined);
    const appendEvent = vi.fn().mockResolvedValue(undefined);

    const result = await createMissionControlTask({
      tenantId: "tenant_1",
      source: "contribution_operations",
      issueType: "donor_notification_failed",
      title: "Follow up donor correction email",
      description: "Email failed after correction.",
      actorProfileId: "actor_1",
      queueId: "finance_queue",
      assignmentMode: "actor_and_queue",
      linkedRecords: [
        { type: "donor", id: "donor_1" },
        { type: "contribution", id: "donation_1" },
        { type: "audit_event", id: "audit_1" },
      ],
      dependencies: {
        insertTask,
        insertLinks,
        appendEvent,
      },
    });

    expect(result.taskId).toBe("task_1");
    expect(insertTask).toHaveBeenCalledWith(
      expect.objectContaining({
        assigneeProfileId: "actor_1",
        queueId: "finance_queue",
        urgency: "critical",
      }),
    );
    expect(insertLinks).toHaveBeenCalledWith(
      "task_1",
      expect.arrayContaining([
        { type: "contribution", id: "donation_1" },
        { type: "audit_event", id: "audit_1" },
      ]),
    );
  });

  it("persists tasks through Supabase with a Finance Operations queue", async () => {
    const state = stubState();

    const result = await createMissionControlTaskInSupabase({
      supabaseAdmin: createStub(state),
      tenantId: "tenant_1",
      title: "Resolve blocked donor correction notification",
      description: "Template is missing required tags.",
      issueType: "donor_notification_failed",
      actorProfileId: "actor_1",
      assignmentMode: "actor_and_queue",
      linkedRecords: [
        { type: "donor", id: "donor_1" },
        { type: "audit_event", id: "audit_1" },
      ],
    });

    expect(result).toEqual({ taskId: "task_1", urgency: "critical" });
    expect(state.queues[0]).toMatchObject({
      tenant_id: "tenant_1",
      key: "finance_operations",
      name: "Finance Operations",
    });
    expect(state.tasks[0]).toMatchObject({
      tenant_id: "tenant_1",
      source_module: "contribution_operations",
      issue_type: "donor_notification_failed",
      assignee_profile_id: "actor_1",
      queue_id: "queue_1",
      created_by_profile_id: "actor_1",
      created_by_kind: "human",
    });
    expect(state.links).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          task_id: "task_1",
          record_type: "donor",
          record_id: "donor_1",
        }),
        expect.objectContaining({
          task_id: "task_1",
          record_type: "audit_event",
          record_id: "audit_1",
        }),
      ]),
    );
    expect(state.events[0]).toMatchObject({
      task_id: "task_1",
      actor_profile_id: "actor_1",
      event_type: "created",
    });
  });
});

describe("mission control needs attention", () => {
  it("dedupes contribution attention by tenant and source key", async () => {
    const upsert = vi.fn().mockResolvedValue({
      attentionItemId: "attention_1",
      created: false,
    });

    const result = await upsertNeedsAttentionItem({
      tenantId: "tenant_1",
      dedupeKey: "notification:audit_1",
      issueType: "donor_notification_failed",
      summary: "Donor notification failed",
      linkedRecords: [{ type: "audit_event", id: "audit_1" }],
      dependencies: { upsert },
    });

    expect(result).toEqual({
      attentionItemId: "attention_1",
      created: false,
    });
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        dedupeKey: "notification:audit_1",
        urgency: "critical",
      }),
    );
  });

  it("loads and groups open Needs Attention rows from Supabase", async () => {
    const state = stubState();
    state.attentionRows = [
      {
        id: "attention_1",
        task_id: "task_1",
        issue_type: "donor_notification_failed",
        urgency: "critical",
        status: "open",
        summary: "Donor notification failed",
        dedupe_key: "notification:audit_1",
        first_seen_at: "2026-06-01T00:00:00.000Z",
        last_seen_at: "2026-06-01T01:00:00.000Z",
        details: { donorId: "donor_1" },
      },
      {
        id: "attention_2",
        task_id: null,
        issue_type: "missing_designation",
        urgency: "high",
        status: "resolved",
        summary: "Resolved item",
        dedupe_key: "resolved:item",
        first_seen_at: "2026-06-01T00:00:00.000Z",
        last_seen_at: "2026-06-01T01:00:00.000Z",
        details: {},
      },
    ];

    const result = await listContributionNeedsAttention({
      supabaseAdmin: createStub(state),
      tenantId: "tenant_1",
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      id: "attention_1",
      urgency: "critical",
      donorId: "donor_1",
    });
    expect(result.groups).toEqual([
      expect.objectContaining({
        key: "critical:donor_notification_failed",
        title: "Donor notification",
        count: 1,
      }),
    ]);
  });
});
