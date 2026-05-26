import { describe, expect, it, vi } from "vitest";

import { sendContributionCorrectionNotification } from "../../../../../packages/api/src/admin/contribution-operations/notifications/send";

const baseInput = {
  tenantId: "tenant_1",
  actionType: "refund" as const,
  correctionId: "correction_1",
  operationAuditEventId: "audit_1",
  actorProfileId: "actor_1",
  recipient: {
    donorId: "donor_1",
    email: "donor@example.com",
    name: "Donor One",
  },
  mergeValues: {
    full_name: "Donor One",
    org_name: "Give Hope",
    gift_date: "May 1, 2026",
    donation_amount: "$100.00",
    refund_amount: "$100.00",
    donor_portal_link: "https://example.com/history",
    support_contact_link: "https://example.com/support",
  },
  personalNote: "Thank you for your patience.",
};

describe("sendContributionCorrectionNotification", () => {
  it("sends active correction templates through Resend and logs the decision", async () => {
    const sendEmail = vi.fn().mockResolvedValue({
      success: true,
      messageId: "msg_1",
      correlationId: "corr_1",
      retryCount: 0,
    });
    const logNotificationEvent = vi.fn().mockResolvedValue("event_1");

    const result = await sendContributionCorrectionNotification({
      ...baseInput,
      template: {
        id: "template_1",
        versionId: "version_1",
        version: 3,
        family: "refund_notification",
        variant: "refund_completed",
        active: true,
        subject: "Your refund for {{donation_amount}}",
        html: "<p>{{full_name}} {{gift_date}} {{donation_amount}} {{refund_amount}} {{donor_portal_link}} {{personal_note}}</p>",
        text: "{{full_name}} {{gift_date}} {{donation_amount}} {{refund_amount}} {{donor_portal_link}} {{personal_note}}",
      },
      settings: {
        apiKey: "re_test",
        fromEmail: "finance@example.com",
        fromName: "Finance Team",
      },
      dependencies: {
        sendEmail,
        logNotificationEvent,
      },
    });

    expect(result.decision).toBe("sent");
    expect(sendEmail).toHaveBeenCalledWith(
      "re_test",
      expect.objectContaining({
        idempotencyKey:
          "correction-notification/tenant_1/audit_1/donor_1/refund_notification/refund_completed",
        html: expect.stringContaining("Thank you for your patience."),
      }),
    );
    expect(logNotificationEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        decision: "sent",
        templateFamily: "refund_notification",
        templateVariant: "refund_completed",
      }),
    );
  });

  it("blocks invalid templates, audits the failure, and creates follow-up task intent", async () => {
    const sendEmail = vi.fn();
    const logNotificationEvent = vi.fn().mockResolvedValue("event_1");
    const createFollowUpTask = vi.fn().mockResolvedValue(["task_1", "task_2"]);

    const result = await sendContributionCorrectionNotification({
      ...baseInput,
      template: {
        id: "template_1",
        versionId: "version_1",
        version: 3,
        family: "refund_notification",
        variant: "refund_completed",
        active: true,
        subject: "Refund update",
        html: "<p>{{full_name}}</p>",
        text: "{{full_name}}",
      },
      settings: {
        apiKey: "re_test",
        fromEmail: "finance@example.com",
        fromName: "Finance Team",
      },
      dependencies: {
        sendEmail,
        logNotificationEvent,
        createFollowUpTask,
      },
    });

    expect(result.decision).toBe("blocked");
    expect(result.taskIds).toEqual(["task_1", "task_2"]);
    expect(sendEmail).not.toHaveBeenCalled();
    expect(logNotificationEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        decision: "blocked",
        errorCode: "invalid_template",
      }),
    );
    expect(createFollowUpTask).toHaveBeenCalledWith(
      expect.objectContaining({
        assignmentMode: "actor_and_queue",
        reason: expect.stringContaining("Missing required merge tag"),
      }),
    );
  });

  it("requires a reason when suppressing money-change notifications", async () => {
    await expect(
      sendContributionCorrectionNotification({
        ...baseInput,
        decisionOverride: "suppressed",
        suppressionReason: null,
        template: null,
        settings: null,
        dependencies: {},
      }),
    ).rejects.toThrow("suppression reason");
  });
});
