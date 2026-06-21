import { describe, expect, it } from "vitest";

import { buildContributionDetail } from "../../../../../packages/api/src/admin/contribution-operations/detail-read-model";
import { projectContributionDetailForViewer } from "../../../../../packages/api/src/admin/contribution-operations/viewer-projection";

function makeDetail() {
  return buildContributionDetail({
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
  });
}

describe("admin/contribution-operations/viewer-projection", () => {
  it("redacts provider identifiers and provider actions for normal staff", () => {
    const projected = projectContributionDetailForViewer(makeDetail(), [
      "contributions.view_detail",
      "contributions.request_corrections",
    ]);

    expect(projected.payment.stripe.paymentIntentId).toBeNull();
    expect(projected.payment.stripe.chargeId).toBeNull();
    expect(projected.payment.stripe.refundIds).toEqual([]);
    expect(projected.payment.stripe.replayContext).toBeNull();
    expect(projected.providerProof).toBeNull();
    expect(
      projected.actionAvailability.some(
        (entry) => entry.actionType === "stripe_replay",
      ),
    ).toBe(false);

    // Payment summary stays available for routine workflows.
    expect(projected.payment.status).toBe("completed");
    expect(projected.amount.value).toBe(25_000);
    expect(projected.shared.refundState).toBe("none");
  });

  it("exposes provider proof, dashboard links, and safe provider actions to authorized operators", () => {
    const projected = projectContributionDetailForViewer(makeDetail(), [
      "contributions.use_provider_actions",
    ]);

    expect(projected.providerProof).toMatchObject({
      paymentIntentId: "pi_proof",
      chargeId: "ch_proof",
      dashboardUrls: {
        paymentIntent: "https://dashboard.stripe.com/payments/pi_proof",
        charge: "https://dashboard.stripe.com/charges/ch_proof",
      },
    });

    const replayEntry = projected.actionAvailability.find(
      (entry) => entry.actionType === "stripe_replay",
    );
    expect(replayEntry?.available).toBe(true);
    expect(replayEntry?.riskLevel).toBe("high");
  });

  it("blocks webhook replay with a clear reason when no provider events exist", () => {
    const detail = makeDetail();
    detail.payment.stripe.paymentIntentId = null;

    const projected = projectContributionDetailForViewer(detail, [
      "contributions.use_provider_actions",
    ]);

    const replayEntry = projected.actionAvailability.find(
      (entry) => entry.actionType === "stripe_replay",
    );
    expect(replayEntry?.available).toBe(false);
    expect(replayEntry?.blockedReason).toMatch(/no provider payment events/i);
  });
});
