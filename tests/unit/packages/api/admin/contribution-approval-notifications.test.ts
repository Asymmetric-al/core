import { describe, expect, it } from "vitest";

import {
  evaluatePendingApprovalSla,
  planApprovalNotifications,
  resolveApprovalNotificationSettings,
  resolveApproverNotificationPreference,
} from "../../../../../packages/api/src/admin/contribution-operations/approval-notifications";

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
});
