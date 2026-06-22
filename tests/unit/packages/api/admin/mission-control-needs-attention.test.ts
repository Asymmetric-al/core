import { describe, expect, it } from "vitest";

import {
  buildNeedsAttentionGroups,
  mapNeedsAttentionRow,
} from "../../../../../packages/api/src/admin/mission-control-tasks/read-model";

describe("mission control needs attention read model", () => {
  it("maps attention rows into contribution-facing cards", () => {
    const item = mapNeedsAttentionRow({
      id: "attention_1",
      task_id: "task_1",
      issue_type: "donor_notification_failed",
      urgency: "critical",
      status: "open",
      summary: "Donor correction email failed",
      dedupe_key: "notification:audit_1",
      first_seen_at: "2026-05-26T00:00:00.000Z",
      last_seen_at: "2026-05-26T01:00:00.000Z",
      details: {
        contributionId: "donation_1",
        donorId: "donor_1",
      },
    });

    expect(item).toEqual({
      id: "attention_1",
      taskId: "task_1",
      issueType: "donor_notification_failed",
      issueLabel: "Donor notification",
      urgency: "critical",
      status: "open",
      summary: "Donor correction email failed",
      contributionId: "donation_1",
      donorId: "donor_1",
      firstSeenAt: "2026-05-26T00:00:00.000Z",
      lastSeenAt: "2026-05-26T01:00:00.000Z",
    });
  });

  it("groups by urgency and issue type with critical items first", () => {
    const groups = buildNeedsAttentionGroups([
      {
        id: "attention_2",
        taskId: "task_2",
        issueType: "crm_post_failed",
        issueLabel: "CRM post",
        urgency: "high",
        status: "open",
        summary: "CRM post failed",
        contributionId: "donation_2",
        donorId: null,
        firstSeenAt: "2026-05-26T00:00:00.000Z",
        lastSeenAt: "2026-05-26T01:00:00.000Z",
      },
      {
        id: "attention_1",
        taskId: "task_1",
        issueType: "donor_notification_failed",
        issueLabel: "Donor notification",
        urgency: "critical",
        status: "open",
        summary: "Donor correction email failed",
        contributionId: "donation_1",
        donorId: "donor_1",
        firstSeenAt: "2026-05-26T00:00:00.000Z",
        lastSeenAt: "2026-05-26T01:00:00.000Z",
      },
    ]);

    expect(groups).toEqual([
      {
        key: "critical:donor_notification_failed",
        title: "Donor notification",
        urgency: "critical",
        count: 1,
        items: [expect.objectContaining({ id: "attention_1" })],
      },
      {
        key: "high:crm_post_failed",
        title: "CRM post",
        urgency: "high",
        count: 1,
        items: [expect.objectContaining({ id: "attention_2" })],
      },
    ]);
  });
});
