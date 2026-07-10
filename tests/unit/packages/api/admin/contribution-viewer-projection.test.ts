import { describe, expect, it } from "vitest";

import { buildContributionDetail } from "../../../../../packages/api/src/admin/contribution-operations/detail-read-model";
import { projectContributionDetailForViewer } from "../../../../../packages/api/src/admin/contribution-operations/viewer-projection";

function makeDetail() {
  const detail = buildContributionDetail({
    donation: {
      id: "donation_1",
      tenantId: "tenant_1",
      donorId: "donor_1",
      missionaryId: null,
      fundId: "fund_1",
      amount: 25_000,
      currency: "usd",
      status: "completed",
      donationType: "one_time",
      paymentMethod: "card",
      isRecurring: false,
      recurringInterval: null,
      notes: null,
      stripePaymentIntentId: "pi_proof",
      stripeChargeId: "ch_proof",
      giftDate: "2026-05-10",
      campaignId: null,
      pledgeId: null,
      processedAt: null,
      completedAt: "2026-05-10T00:00:00.000Z",
      failedAt: null,
      errorCode: null,
      errorMessage: null,
      refundedAt: null,
      refundAmount: 0,
      source: "online",
      createdAt: "2026-05-10T00:00:00.000Z",
      updatedAt: "2026-05-10T00:00:00.000Z",
    },
    donor: {
      id: "donor_1",
      profileId: null,
      name: "Proof Donor",
      email: "proof@example.com",
      phone: null,
      location: null,
      organization: null,
    },
    fund: { id: "fund_1", name: "General Fund" },
    stagedGift: {
      id: "staged-1",
      status: "posted",
      receiptStatus: "sent",
      crmPostStatus: "failed",
      reviewReason: null,
      twentyRecordId: "twenty-staged",
    },
  });

  detail.crm = {
    ...detail.crm,
    postStatus: "failed",
    twentyRecordId: "twenty-summary",
    parent: {
      status: "failed",
      twentyRecordId: "twenty-parent",
      lastError: "Historical parent failure",
    },
    designationRecords: [
      {
        allocationId: "allocation-1",
        status: "failed",
        twentyRecordId: "twenty-designation",
        lastError: "Historical designation failure",
      },
    ],
    failedScopes: [
      { scope: "parent" },
      { scope: "designation", allocationId: "allocation-1" },
    ],
  };

  return detail;
}

describe("admin/contribution-operations/viewer-projection", () => {
  it("redacts provider proof and omits replay for request-only staff", () => {
    const projected = projectContributionDetailForViewer(makeDetail(), [
      "contributions.view_detail",
      "contributions.request_corrections",
    ]);

    expect(projected.payment.stripe.paymentIntentId).toBeNull();
    expect(projected.payment.stripe.chargeId).toBeNull();
    expect(projected.payment.stripe.refundIds).toEqual([]);
    expect(projected.payment.stripe.replayContext).toBeNull();
    expect(projected.providerProof).toBeNull();
    expect(projected.crm.twentyRecordId).toBeNull();
    expect(projected.crm.parent.twentyRecordId).toBeNull();
    expect(projected.crm.designationRecords[0]?.twentyRecordId).toBeNull();
    expect(projected.stagedGift?.twentyRecordId).toBeNull();
    expect(projected.crm.parent.lastError).toBe(
      "Historical CRM posting failed. Provider details are available to authorized operators.",
    );
    expect(projected.crm.designationRecords[0]?.lastError).toBe(
      "Historical CRM posting failed. Provider details are available to authorized operators.",
    );
    expect(
      projected.actionAvailability.find(
        (entry) => entry.actionType === "stripe_replay",
      ),
    ).toBeUndefined();
    expect(
      projected.actionAvailability.find(
        (entry) => entry.actionType === "refund",
      ),
    ).toBeUndefined();

    // Payment summary stays available for routine workflows.
    expect(projected.payment.status).toBe("completed");
    expect(projected.amount.value).toBe(25_000);
    expect(projected.shared.refundState).toBe("none");
  });

  it("exposes provider proof, dashboard links, and replay to provider-capable requesters", () => {
    const projected = projectContributionDetailForViewer(makeDetail(), [
      "contributions.use_provider_actions",
      "contributions.request_corrections",
    ]);

    expect(projected.providerProof).toMatchObject({
      paymentIntentId: "pi_proof",
      chargeId: "ch_proof",
      dashboardUrls: {
        paymentIntent: "https://dashboard.stripe.com/payments/pi_proof",
        charge: "https://dashboard.stripe.com/charges/ch_proof",
      },
    });
    expect(projected.crm.twentyRecordId).toBe("twenty-summary");
    expect(projected.crm.parent.twentyRecordId).toBe("twenty-parent");
    expect(projected.crm.designationRecords[0]?.twentyRecordId).toBe(
      "twenty-designation",
    );
    expect(projected.stagedGift?.twentyRecordId).toBe("twenty-staged");
    expect(projected.crm.parent.lastError).toBe("Historical parent failure");
    expect(projected.crm.designationRecords[0]?.lastError).toBe(
      "Historical designation failure",
    );

    const replayEntry = projected.actionAvailability.find(
      (entry) => entry.actionType === "stripe_replay",
    );
    expect(replayEntry?.available).toBe(true);
    expect(replayEntry?.riskLevel).toBe("high");
  });

  it("blocks webhook replay with a clear reason when no provider events exist", () => {
    const detail = makeDetail();
    detail.payment.stripe.paymentIntentId = null;
    detail.payment.stripe.chargeId = null;

    const projected = projectContributionDetailForViewer(detail, [
      "contributions.use_provider_actions",
      "contributions.request_corrections",
    ]);

    const replayEntry = projected.actionAvailability.find(
      (entry) => entry.actionType === "stripe_replay",
    );
    expect(replayEntry?.available).toBe(false);
    expect(replayEntry?.blockedReason).toMatch(/no provider payment events/i);
  });

  it("allows webhook replay when only a charge id is available", () => {
    const detail = makeDetail();
    detail.payment.stripe.paymentIntentId = null;
    detail.payment.stripe.chargeId = "ch_only";

    const projected = projectContributionDetailForViewer(detail, [
      "contributions.use_provider_actions",
      "contributions.request_corrections",
    ]);

    const replayEntry = projected.actionAvailability.find(
      (entry) => entry.actionType === "stripe_replay",
    );
    expect(replayEntry?.available).toBe(true);
    expect(projected.providerProof?.dashboardUrls).toMatchObject({
      paymentIntent: null,
      charge: "https://dashboard.stripe.com/charges/ch_only",
    });
  });

  it("keeps provider proof visible but omits approval-gated replay without request capability", () => {
    const projected = projectContributionDetailForViewer(makeDetail(), [
      "contributions.use_provider_actions",
    ]);

    expect(projected.providerProof?.paymentIntentId).toBe("pi_proof");
    expect(
      projected.actionAvailability.find(
        (entry) => entry.actionType === "stripe_replay",
      ),
    ).toBeUndefined();
  });
});
