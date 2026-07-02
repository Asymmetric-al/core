import { describe, expect, it } from "vitest";

import {
  getContributionNotificationPolicy,
  isContributionNotificationSuppressionReasonRequired,
} from "../../../../../packages/api/src/admin/contribution-operations/notifications/policy";
import {
  resolveContributionCorrectionTemplateVariant,
  validateContributionCorrectionTemplate,
} from "../../../../../packages/api/src/admin/contribution-operations/notifications/templates";

describe("contribution correction notification policy", () => {
  it.each([
    ["refund", "auto_notify"],
    ["amount_correction", "auto_notify"],
    ["receipt_correction", "auto_notify"],
    ["statement_correction", "auto_notify"],
    ["designation_correction", "always_ask"],
    ["payment_state_correction", "always_ask"],
    ["donor_relink", "staff_chooses"],
  ] as const)("defaults %s to %s", (actionType, expectedMode) => {
    expect(getContributionNotificationPolicy({ actionType }).mode).toBe(
      expectedMode,
    );
  });

  it("requires suppression reasons for money and official document changes", () => {
    expect(
      isContributionNotificationSuppressionReasonRequired({
        actionType: "refund",
        decision: "suppressed",
      }),
    ).toBe(true);
    expect(
      isContributionNotificationSuppressionReasonRequired({
        actionType: "donor_relink",
        decision: "suppressed",
      }),
    ).toBe(false);
  });

  it("selects variants from the actual action outcome", () => {
    expect(
      resolveContributionCorrectionTemplateVariant({
        actionType: "refund",
        outcome: { status: "succeeded", refundKind: "partial" },
      }),
    ).toEqual({
      family: "refund_notification",
      variant: "partial_refund_completed",
    });

    expect(
      resolveContributionCorrectionTemplateVariant({
        actionType: "refund",
        outcome: { status: "failed" },
      }),
    ).toEqual({
      family: "refund_notification",
      variant: "refund_failed",
    });
  });

  it("does not resolve templates for non-notification action types", () => {
    expect(
      resolveContributionCorrectionTemplateVariant({
        actionType: "crm_repost",
      }),
    ).toBeNull();
  });

  it("blocks active templates missing required correction tags", () => {
    const result = validateContributionCorrectionTemplate({
      family: "receipt_correction_notification",
      variant: "receipt_corrected",
      html: "<p>Hello {{full_name}}</p>",
      text: "Hello {{full_name}}",
      active: true,
    });

    expect(result.valid).toBe(false);
    expect(result.missingRequiredTags).toContain("receipt_link");
  });

  it("allows drafts to save with missing required correction tags", () => {
    const result = validateContributionCorrectionTemplate({
      family: "receipt_correction_notification",
      variant: "receipt_corrected",
      html: "<p>Hello {{full_name}}</p>",
      text: "Hello {{full_name}}",
      active: false,
    });

    expect(result.valid).toBe(true);
    expect(result.missingRequiredTags).toContain("receipt_link");
  });

  it("rejects variants that do not belong to the selected family", () => {
    const result = validateContributionCorrectionTemplate({
      family: "receipt_correction_notification",
      variant: "refund_completed",
      html: "<p>{{full_name}} {{gift_date}} {{receipt_link}}</p>",
      text: "{{full_name}} {{gift_date}} {{receipt_link}}",
      active: true,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Unknown contribution correction template variant.",
    );
  });
});
