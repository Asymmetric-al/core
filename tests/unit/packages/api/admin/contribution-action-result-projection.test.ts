import { describe, expect, it } from "vitest";

import { buildContributionDetail } from "../../../../../packages/api/src/admin/contribution-operations/detail-read-model";
import { projectContributionActionResultForViewer } from "../../../../../packages/api/src/admin/contribution-operations/route";

import type { ContributionActionResult } from "../../../../../packages/api/src/admin/contribution-operations/types";

const DONOR_CARE_CAPABILITIES = [
  "contributions.view_detail",
  "contributions.request_corrections",
  "contributions.manage_table_preferences",
];

const PROVIDER_CAPABILITIES = ["contributions.use_provider_actions"];

function makeResult(): ContributionActionResult {
  return {
    canonicalContribution: buildContributionDetail({
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
    }),
    auditEventId: "audit_1",
    taskIds: [],
  };
}

describe("admin/contribution-operations route action-result projection", () => {
  it("redacts Stripe identifiers in the action result for non-provider viewers", () => {
    const projected = projectContributionActionResultForViewer(
      makeResult(),
      DONOR_CARE_CAPABILITIES,
    );

    const canonical = projected.canonicalContribution as {
      payment: {
        stripe: { paymentIntentId: string | null; chargeId: string | null };
      };
    };
    expect(canonical.payment.stripe.paymentIntentId).toBeNull();
    expect(canonical.payment.stripe.chargeId).toBeNull();
    // Non-canonical result fields are preserved.
    expect(projected.auditEventId).toBe("audit_1");
  });

  it("preserves Stripe identifiers for provider-authorized viewers", () => {
    const projected = projectContributionActionResultForViewer(
      makeResult(),
      PROVIDER_CAPABILITIES,
    );

    const canonical = projected.canonicalContribution as {
      payment: {
        stripe: { paymentIntentId: string | null; chargeId: string | null };
      };
    };
    expect(canonical.payment.stripe.paymentIntentId).toBe("pi_proof");
    expect(canonical.payment.stripe.chargeId).toBe("ch_proof");
  });

  it("passes through a result whose canonicalContribution is not a detail object", () => {
    const result: ContributionActionResult = {
      canonicalContribution: null,
      auditEventId: "audit_2",
      taskIds: [],
    };
    expect(
      projectContributionActionResultForViewer(result, DONOR_CARE_CAPABILITIES),
    ).toBe(result);
  });
});
