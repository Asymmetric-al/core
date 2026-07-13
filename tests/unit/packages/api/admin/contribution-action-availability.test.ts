import { describe, expect, it } from "vitest";

import { buildContributionActionAvailability } from "../../../../../packages/api/src/admin/contribution-operations/action-availability";
import { buildContributionDetail } from "../../../../../packages/api/src/admin/contribution-operations/detail-read-model";

import type { ContributionDetailInput } from "../../../../../packages/api/src/admin/contribution-operations/detail-read-model";

function availabilityFor(
  entries: ReturnType<typeof buildContributionActionAvailability>,
  actionType: string,
) {
  const entry = entries.find((item) => item.actionType === actionType);
  if (!entry) {
    throw new Error(`No availability entry for ${actionType}`);
  }
  return entry;
}

describe("admin/contribution-operations/action-availability", () => {
  it("blocks staged-gift workflow actions with clear reasons when no staged gift exists", () => {
    const entries = buildContributionActionAvailability({
      stagedGift: null,
      paymentStatus: "completed",
    });

    for (const actionType of [
      "approve_staged_gift",
      "retry_staged_gift",
      "resend_receipt",
    ]) {
      const entry = availabilityFor(entries, actionType);
      expect(entry.available).toBe(false);
      expect(entry.blockedReason).toMatch(/no staged gift/i);
      expect(entry.nextStep).toBeTruthy();
      // The donation itself must never be described as missing or invalid.
      expect(entry.blockedReason).not.toMatch(/invalid|missing donation/i);
      expect(entry.nextStep).toMatch(/valid/i);
    }
  });

  it("computes staged-gift action availability from workflow state", () => {
    const reviewable = buildContributionActionAvailability({
      stagedGift: {
        id: "staged-1",
        status: "needs_review",
        receiptStatus: "pending",
        crmPostStatus: "queued",
      },
      paymentStatus: "completed",
    });

    expect(availabilityFor(reviewable, "approve_staged_gift").available).toBe(
      true,
    );
    expect(availabilityFor(reviewable, "retry_staged_gift").available).toBe(
      false,
    );
    expect(
      availabilityFor(reviewable, "retry_staged_gift").blockedReason,
    ).toBeTruthy();
    expect(availabilityFor(reviewable, "resend_receipt").available).toBe(true);

    const failed = buildContributionActionAvailability({
      stagedGift: {
        id: "staged-1",
        status: "failed",
        receiptStatus: "pending",
        crmPostStatus: "failed",
      },
      paymentStatus: "completed",
    });

    expect(availabilityFor(failed, "retry_staged_gift").available).toBe(true);
    expect(availabilityFor(failed, "approve_staged_gift").available).toBe(
      false,
    );
  });

  it("allows retry when unified CRM post state reports link-derived failures", () => {
    const entries = buildContributionActionAvailability({
      stagedGift: {
        id: "staged-1",
        status: "posted",
        receiptStatus: "sent",
        crmPostStatus: "posted",
      },
      paymentStatus: "completed",
      hasCrmPostFailure: true,
    });

    expect(availabilityFor(entries, "retry_staged_gift").available).toBe(true);
  });

  it("blocks receipt sends for suppressed receipts and uncompleted payments", () => {
    const suppressed = buildContributionActionAvailability({
      stagedGift: {
        id: "staged-1",
        status: "posted",
        receiptStatus: "suppressed",
        crmPostStatus: "posted",
      },
      paymentStatus: "completed",
    });
    const suppressedEntry = availabilityFor(suppressed, "resend_receipt");
    expect(suppressedEntry.available).toBe(false);
    expect(suppressedEntry.blockedReason).toMatch(/suppressed/i);

    const pendingPayment = buildContributionActionAvailability({
      stagedGift: {
        id: "staged-1",
        status: "received",
        receiptStatus: "pending",
        crmPostStatus: "queued",
      },
      paymentStatus: "pending",
    });
    const pendingEntry = availabilityFor(pendingPayment, "resend_receipt");
    expect(pendingEntry.available).toBe(false);
    expect(pendingEntry.blockedReason).toMatch(/not completed/i);
  });

  it("normalizes provider success aliases for receipt and refund availability", () => {
    for (const paymentStatus of ["succeeded", "success"]) {
      const entries = buildContributionActionAvailability({
        stagedGift: {
          id: "staged-1",
          status: "posted",
          receiptStatus: "sent",
          crmPostStatus: "posted",
        },
        paymentStatus,
        refund: {
          amountCents: 12_00,
          refundedAmountCents: 0,
          hasProviderCharge: true,
        },
      });

      expect(availabilityFor(entries, "resend_receipt").available).toBe(true);
      expect(availabilityFor(entries, "refund").available).toBe(true);
    }
  });

  it("labels every entry with the policy risk level", () => {
    const entries = buildContributionActionAvailability({
      stagedGift: null,
      paymentStatus: "completed",
    });

    for (const entry of entries) {
      expect(["low", "medium", "high"]).toContain(entry.riskLevel);
    }
  });

  describe("refund availability basis in the detail read model", () => {
    function detailDonation(
      overrides: Partial<ContributionDetailInput["donation"]> = {},
    ): ContributionDetailInput["donation"] {
      return {
        id: "donation-1",
        tenantId: "tenant-1",
        donorId: null,
        missionaryId: null,
        fundId: null,
        amount: 5000,
        currency: "usd",
        status: "completed",
        donationType: "one_time",
        paymentMethod: "card",
        isRecurring: false,
        recurringInterval: null,
        notes: null,
        stripePaymentIntentId: "pi_1",
        stripeChargeId: "ch_1",
        giftDate: "2026-06-01",
        campaignId: null,
        pledgeId: null,
        processedAt: null,
        completedAt: null,
        failedAt: null,
        errorCode: null,
        errorMessage: null,
        refundedAt: null,
        refundAmount: 0,
        source: "online",
        createdAt: "2026-06-01T00:00:00.000Z",
        updatedAt: "2026-06-01T00:00:00.000Z",
        ...overrides,
      };
    }

    function refundEntryFor(
      detail: ReturnType<typeof buildContributionDetail>,
    ) {
      const entry = detail.actionAvailability.find(
        (item) => item.actionType === "refund",
      );
      if (!entry) {
        throw new Error("No refund availability entry.");
      }
      return entry;
    }

    it("blocks fully refunded gifts even when an adjustment raised the effective amount", () => {
      // Original charge 50.00 fully refunded; a later amount correction
      // raised the effective amount to 100.00. The provider can still only
      // refund what it charged, so refund must stay blocked.
      const detail = buildContributionDetail({
        donation: detailDonation({
          status: "refunded",
          refundAmount: 5000,
          refundedAt: "2026-06-02T00:00:00.000Z",
        }),
        adjustments: [
          {
            id: "adjustment-1",
            adjustmentType: "amount_correction",
            status: "applied",
            effectiveValues: { amountCents: 10_000 },
            reason: "Recorded amount was wrong",
            actorProfileId: null,
            sourceSurface: "api",
            createdAt: "2026-06-03T00:00:00.000Z",
          },
        ],
      });

      const entry = refundEntryFor(detail);
      expect(entry.available).toBe(false);
      expect(entry.blockedReason).toMatch(/already fully refunded/i);
    });

    it("keeps partially refunded gifts refundable when an adjustment lowered the effective amount", () => {
      // Original charge 50.00 with 20.00 refunded; a correction lowered the
      // effective amount to 10.00. The remaining 30.00 is still refundable
      // against the original provider charge.
      const detail = buildContributionDetail({
        donation: detailDonation({
          refundAmount: 2000,
          refundedAt: "2026-06-02T00:00:00.000Z",
        }),
        adjustments: [
          {
            id: "adjustment-1",
            adjustmentType: "amount_correction",
            status: "applied",
            effectiveValues: { amountCents: 1000 },
            reason: "Recorded amount was wrong",
            actorProfileId: null,
            sourceSurface: "api",
            createdAt: "2026-06-03T00:00:00.000Z",
          },
        ],
      });

      expect(refundEntryFor(detail).available).toBe(true);
    });
  });
});
