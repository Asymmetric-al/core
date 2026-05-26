import { describe, expect, it } from "vitest";

import {
  getContributionActionPolicy,
  isContributionReasonRequired,
  isContributionConfirmationRequired,
} from "../../../../../packages/api/src/admin/contribution-operations/policy";

describe("contribution operations policy", () => {
  it.each([
    "refund",
    "donor_relink",
    "designation_correction",
    "fund_correction",
    "payment_state_correction",
    "stripe_replay",
  ] as const)(
    "keeps %s reason and confirmation non-suppressible",
    (actionType) => {
      const policy = getContributionActionPolicy({
        actionType,
        organizationSettings: {
          defaultReasonMode: "optional",
          allowUserReasonPromptReduction: true,
        },
        userPreferences: {
          reduceReasonPrompts: true,
        },
      });

      expect(policy.riskLevel).toBe("high");
      expect(policy.requiresReason).toBe(true);
      expect(policy.requiresConfirmation).toBe(true);
      expect(policy.canSuppressReason).toBe(false);
      expect(isContributionReasonRequired(policy)).toBe(true);
      expect(isContributionConfirmationRequired(policy)).toBe(true);
    },
  );

  it("allows low-risk receipt resend reason prompts to be reduced by settings", () => {
    const policy = getContributionActionPolicy({
      actionType: "resend_receipt",
      organizationSettings: {
        defaultReasonMode: "optional",
        allowUserReasonPromptReduction: true,
      },
      userPreferences: {
        reduceReasonPrompts: true,
      },
    });

    expect(policy.riskLevel).toBe("low");
    expect(policy.requiresReason).toBe(false);
    expect(policy.requiresConfirmation).toBe(false);
    expect(policy.canSuppressReason).toBe(true);
  });

  it("requires reasons for metadata edits when the organization baseline is required", () => {
    const policy = getContributionActionPolicy({
      actionType: "metadata_update",
      organizationSettings: {
        defaultReasonMode: "required",
        allowUserReasonPromptReduction: false,
      },
      userPreferences: {
        reduceReasonPrompts: true,
      },
    });

    expect(policy.riskLevel).toBe("low");
    expect(policy.requiresReason).toBe(true);
    expect(policy.canSuppressReason).toBe(true);
  });
});
