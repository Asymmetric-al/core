import { describe, expect, it, vi } from "vitest";

import { resolveMissionControlTaskAssignment } from "../../../../../packages/api/src/admin/mission-control-tasks/assignment-policy";
import { createMissionControlTask } from "../../../../../packages/api/src/admin/mission-control-tasks/service";
import {
  getSuggestedAttentionUrgency,
  recordUrgencyOverride,
} from "../../../../../packages/api/src/admin/mission-control-tasks/urgency";
import { upsertNeedsAttentionItem } from "../../../../../packages/api/src/admin/mission-control-tasks/attention";

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
});
