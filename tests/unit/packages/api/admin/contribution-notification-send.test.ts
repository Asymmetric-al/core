import { describe, expect, it, vi } from "vitest";

const { logSystemAuditEventMock } = vi.hoisted(() => ({
  logSystemAuditEventMock: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@asym/lib/audit/logger", () => ({
  logSystemAuditEvent: logSystemAuditEventMock,
}));

import { sendContributionCorrectionNotification } from "../../../../../packages/api/src/admin/contribution-operations/notifications/send";

const activeRefundTemplate = {
  id: "template_1",
  versionId: "version_1",
  version: 3,
  family: "refund_notification" as const,
  variant: "refund_completed" as const,
  active: true,
  subject: "Your refund for {{donation_amount}}",
  html: "<p>{{full_name}} {{gift_date}} {{donation_amount}} {{refund_amount}} {{donor_portal_link}} {{personal_note}}</p>",
  text: "{{full_name}} {{gift_date}} {{donation_amount}} {{refund_amount}} {{donor_portal_link}} {{personal_note}}",
};

const connectedSettings = {
  apiKey: "re_test",
  fromEmail: "finance@example.com",
  fromName: "Finance Team",
};

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
    const logNotificationEvent = vi
      .fn()
      .mockResolvedValue({ eventId: "event_1" });

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
        subject: "Your refund for $100.00",
        html: expect.stringContaining("Thank you for your patience."),
      }),
    );
    expect(logNotificationEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        decision: "sent",
        idempotencyKey:
          "correction-notification/tenant_1/audit_1/donor_1/refund_notification/refund_completed",
        templateFamily: "refund_notification",
        templateVariant: "refund_completed",
      }),
    );
  });

  it("blocks invalid templates, audits the failure, and creates follow-up task intent", async () => {
    const sendEmail = vi.fn();
    const logNotificationEvent = vi
      .fn()
      .mockResolvedValue({ eventId: "event_1" });
    const createFollowUpTask = vi.fn().mockResolvedValue(["task_1", "task_2"]);
    const recordNotificationTaskIds = vi.fn();

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
        recordNotificationTaskIds,
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
        notificationEventId: "event_1",
        reason: expect.stringContaining("Missing required merge tag"),
      }),
    );
    expect(recordNotificationTaskIds).toHaveBeenCalledWith({
      notificationEventId: "event_1",
      taskIds: ["task_1", "task_2"],
    });
  });

  it("reuses task ids from an existing notification event instead of creating duplicate tasks", async () => {
    const logNotificationEvent = vi
      .fn()
      .mockResolvedValue({ eventId: "event_1", taskIds: ["task_existing"] });
    const createFollowUpTask = vi.fn();

    const result = await sendContributionCorrectionNotification({
      ...baseInput,
      template: null,
      settings: {
        apiKey: "re_test",
        fromEmail: "finance@example.com",
        fromName: "Finance Team",
      },
      dependencies: {
        logNotificationEvent,
        createFollowUpTask,
      },
    });

    expect(result.decision).toBe("blocked");
    expect(result.taskIds).toEqual(["task_existing"]);
    expect(createFollowUpTask).not.toHaveBeenCalled();
  });

  it("blocks missing tenant email settings with a specific task reason", async () => {
    const logNotificationEvent = vi
      .fn()
      .mockResolvedValue({ eventId: "event_1" });
    const createFollowUpTask = vi.fn().mockResolvedValue(["task_1"]);

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
        html: "<p>{{full_name}} {{gift_date}} {{donation_amount}} {{refund_amount}} {{donor_portal_link}}</p>",
        text: "{{full_name}} {{gift_date}} {{donation_amount}} {{refund_amount}} {{donor_portal_link}}",
      },
      settings: null,
      dependencies: {
        logNotificationEvent,
        createFollowUpTask,
      },
    });

    expect(result.decision).toBe("blocked");
    expect(logNotificationEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        decision: "blocked",
        errorCode: "missing_email_settings",
      }),
    );
    expect(createFollowUpTask).toHaveBeenCalledWith(
      expect.objectContaining({
        reason: expect.stringContaining("email sending is not connected"),
      }),
    );
  });

  it("audits provider exceptions and creates a follow-up task", async () => {
    const sendEmail = vi.fn().mockRejectedValue(new Error("resend timeout"));
    const logNotificationEvent = vi
      .fn()
      .mockResolvedValue({ eventId: "event_1" });
    const createFollowUpTask = vi.fn().mockResolvedValue(["task_1"]);

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
        html: "<p>{{full_name}} {{gift_date}} {{donation_amount}} {{refund_amount}} {{donor_portal_link}}</p>",
        text: "{{full_name}} {{gift_date}} {{donation_amount}} {{refund_amount}} {{donor_portal_link}}",
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

    expect(result.decision).toBe("failed");
    expect(result.taskIds).toEqual(["task_1"]);
    expect(logNotificationEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        decision: "failed",
        errorCode: "provider_exception",
        errorMessage: "resend timeout",
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

  it("does not auto-send always-ask notifications without a staff decision", async () => {
    const sendEmail = vi.fn();
    const logNotificationEvent = vi
      .fn()
      .mockResolvedValue({ eventId: "event_1" });

    const result = await sendContributionCorrectionNotification({
      ...baseInput,
      actionType: "designation_correction",
      mergeValues: {
        ...baseInput.mergeValues,
        previous_designation_name: "General Fund",
        corrected_designation_name: "Clean Water Initiative",
      },
      template: {
        id: "template_1",
        versionId: "version_1",
        version: 3,
        family: "designation_correction_notification",
        variant: "designation_changed",
        active: true,
        subject: "Designation updated",
        html: "<p>{{full_name}} {{gift_date}} {{previous_designation_name}} {{corrected_designation_name}} {{donor_portal_link}}</p>",
        text: "{{full_name}} {{gift_date}} {{previous_designation_name}} {{corrected_designation_name}} {{donor_portal_link}}",
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

    expect(result).toEqual({ decision: "not_required", taskIds: [] });
    expect(sendEmail).not.toHaveBeenCalled();
    expect(logNotificationEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        decision: "not_required",
        policySnapshot: expect.objectContaining({ mode: "always_ask" }),
      }),
    );
  });

  it("suppresses the notice, audits it, and raises a follow-up task when consent forbids", async () => {
    const sendEmail = vi.fn();
    const logNotificationEvent = vi
      .fn()
      .mockResolvedValue({ eventId: "event_1" });
    const createFollowUpTask = vi.fn().mockResolvedValue(["task_1"]);
    const evaluateEmailConsent = vi.fn().mockResolvedValue({
      allowed: false,
      reason: "do_not_contact",
    });

    const result = await sendContributionCorrectionNotification({
      ...baseInput,
      template: activeRefundTemplate,
      settings: connectedSettings,
      dependencies: {
        sendEmail,
        evaluateEmailConsent,
        logNotificationEvent,
        createFollowUpTask,
      },
    });

    expect(result.decision).toBe("suppressed");
    expect(result.taskIds).toEqual(["task_1"]);
    expect(sendEmail).not.toHaveBeenCalled();
    expect(evaluateEmailConsent).toHaveBeenCalledWith({
      email: "donor@example.com",
      donorId: "donor_1",
    });
    expect(logSystemAuditEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "email_send_suppressed",
        resourceType: "email_send",
        details: expect.objectContaining({
          source: "contribution_correction_notification",
          reason: "do_not_contact",
          donorId: "donor_1",
          recipientEmail: "donor@example.com",
        }),
      }),
    );
    expect(logNotificationEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        decision: "suppressed",
        errorCode: "consent_do_not_contact",
      }),
    );
    expect(createFollowUpTask).toHaveBeenCalledWith(
      expect.objectContaining({
        reason: expect.stringContaining("opted out of all outbound contact"),
      }),
    );
  });

  it("sends normally when the consent gate allows the recipient", async () => {
    const sendEmail = vi.fn().mockResolvedValue({
      success: true,
      messageId: "msg_1",
      correlationId: "corr_1",
      retryCount: 0,
    });
    const logNotificationEvent = vi
      .fn()
      .mockResolvedValue({ eventId: "event_1" });
    const evaluateEmailConsent = vi.fn().mockResolvedValue({ allowed: true });

    const result = await sendContributionCorrectionNotification({
      ...baseInput,
      template: activeRefundTemplate,
      settings: connectedSettings,
      dependencies: { sendEmail, evaluateEmailConsent, logNotificationEvent },
    });

    expect(evaluateEmailConsent).toHaveBeenCalledWith({
      email: "donor@example.com",
      donorId: "donor_1",
    });
    expect(result.decision).toBe("sent");
    expect(sendEmail).toHaveBeenCalled();
    expect(logSystemAuditEventMock).not.toHaveBeenCalled();
  });

  it("honors tenant policy overrides when deciding suppression requirements", async () => {
    await expect(
      sendContributionCorrectionNotification({
        ...baseInput,
        decisionOverride: "suppressed",
        suppressionReasonRequiredOverride: false,
        suppressionReason: null,
        template: null,
        settings: null,
        dependencies: {
          logNotificationEvent: vi
            .fn()
            .mockResolvedValue({ eventId: "event_1" }),
        },
      }),
    ).resolves.toEqual({ decision: "suppressed", taskIds: [] });
  });
});
