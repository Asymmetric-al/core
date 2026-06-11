import { describe, expect, it } from "vitest";

import {
  describeDonationPaymentStatus,
  describePledgeStatus,
  isFinalPaymentSuccess,
} from "../../../../packages/lib/payments/payment-status-language";
import { normalizeContributionGridStatus } from "../../../../packages/api/src/admin/contributions/model";

describe("payment status language (#292)", () => {
  it("never describes in-flight ACH as finally successful", () => {
    const donor = describeDonationPaymentStatus({
      state: "processing",
      rail: "ach_debit",
      audience: "donor",
    });

    expect(donor.isFinal).toBe(false);
    expect(donor.label).not.toMatch(/success|complete/i);
    expect(donor.message).toMatch(/business days/i);
    expect(isFinalPaymentSuccess("processing")).toBe(false);
  });

  it("treats only completed and refunded as final payment success states", () => {
    expect(isFinalPaymentSuccess("completed")).toBe(true);
    expect(isFinalPaymentSuccess("refunded")).toBe(true);
    for (const state of [
      "pending",
      "processing",
      "requires_action",
      "verification_required",
      "failed",
      "dead_letter",
    ] as const) {
      expect(isFinalPaymentSuccess(state), state).toBe(false);
    }
  });

  it("describes the bank account verification checkpoint distinctly", () => {
    const donor = describeDonationPaymentStatus({
      state: "verification_required",
      rail: "ach_debit",
      audience: "donor",
    });

    expect(donor.label).toMatch(/verif/i);
    expect(donor.isFinal).toBe(false);
    expect(donor.tone).toBe("attention");
  });

  it("describes the authorization checkpoint as action needed", () => {
    const donor = describeDonationPaymentStatus({
      state: "requires_action",
      rail: "card",
      audience: "donor",
    });

    expect(donor.tone).toBe("attention");
    expect(donor.isFinal).toBe(false);
  });

  it("confirms final success once Stripe says the payment completed", () => {
    const donor = describeDonationPaymentStatus({
      state: "completed",
      rail: "ach_debit",
      audience: "donor",
    });

    expect(donor.isFinal).toBe(true);
    expect(donor.tone).toBe("positive");
  });

  it("keeps failure copy calm and free of payment internals", () => {
    const donor = describeDonationPaymentStatus({
      state: "failed",
      rail: "card",
      audience: "donor",
    });

    expect(donor.tone).toBe("destructive");
    expect(donor.message).not.toMatch(
      /stripe|payment_intent|client_secret|webhook|saga|outbox/i,
    );
  });

  it("shows dead-letter recovery language to staff but not to donors", () => {
    const staff = describeDonationPaymentStatus({
      state: "dead_letter",
      rail: "card",
      audience: "staff",
    });
    const donor = describeDonationPaymentStatus({
      state: "dead_letter",
      rail: "card",
      audience: "donor",
    });

    expect(staff.label).toMatch(/attention|recovery/i);
    expect(staff.message).toMatch(/stripe/i);
    expect(donor.message).not.toMatch(/dead.?letter|workflow|recovery/i);
    expect(donor.isFinal).toBe(false);
  });

  it("describes recurring pledge states including collection distress", () => {
    const healthy = describePledgeStatus({
      status: "active",
      failedChargeCount: 0,
    });
    const distressed = describePledgeStatus({
      status: "active",
      failedChargeCount: 2,
    });
    const paused = describePledgeStatus({ status: "paused" });
    const cancelled = describePledgeStatus({ status: "cancelled" });

    expect(healthy.label).toBe("Active");
    expect(healthy.tone).toBe("positive");
    expect(distressed.tone).toBe("attention");
    expect(distressed.message).toMatch(/retry/i);
    expect(paused.label).toBe("Paused");
    expect(cancelled.label).toBe("Cancelled");
  });
});

describe("contribution grid status normalization (#292)", () => {
  it("keeps processing distinct instead of collapsing it into pending", () => {
    expect(normalizeContributionGridStatus("processing")).toBe("processing");
    expect(normalizeContributionGridStatus("pending")).toBe("pending");
  });

  it("never claims completion for unknown statuses", () => {
    expect(normalizeContributionGridStatus("anything-unknown")).toBe(
      "pending",
    );
    expect(normalizeContributionGridStatus(null)).toBe("pending");
    expect(normalizeContributionGridStatus("completed")).toBe("completed");
  });
});
