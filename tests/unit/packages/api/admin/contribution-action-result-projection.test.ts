import { describe, expect, it } from "vitest";

import { buildContributionDetail } from "../../../../../packages/api/src/admin/contribution-operations/detail-read-model";
import { projectContributionActionResultForViewer } from "../../../../../packages/api/src/admin/contribution-operations/viewer-projection";

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
    providerOutcome: {
      provider: "stripe",
      status: "succeeded",
      referenceId: "re_live_refund_id",
      raw: { amount: 25_000, currency: "usd", status: "succeeded" },
    },
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
    // The provider outcome's raw identifiers (e.g. the live Stripe refund id)
    // are also stripped, while workflow status stays visible.
    expect(projected.providerOutcome?.referenceId).toBeNull();
    expect(projected.providerOutcome?.raw).toBeUndefined();
    expect(projected.providerOutcome?.status).toBe("succeeded");
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
    // Provider-authorized viewers keep the raw provider outcome.
    expect(projected.providerOutcome?.referenceId).toBe("re_live_refund_id");
    expect(projected.providerOutcome?.raw).toEqual({
      amount: 25_000,
      currency: "usd",
      status: "succeeded",
    });
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

  it("shapes canonical availability under the tenant policy, matching the GET contract", () => {
    const projected = projectContributionActionResultForViewer(
      makeResult(),
      DONOR_CARE_CAPABILITIES,
      {
        approvalPolicy: {
          ownershipMode: "no_approval_required",
          suppressedGates: [],
          strongerApprovalCategories: [],
          reminderHours: 24,
          escalationHours: null,
        },
      },
    );
    const canonical = projected.canonicalContribution as {
      actionAvailability: Array<{ actionType: string }>;
    };
    const actionTypes = canonical.actionAvailability.map(
      (entry) => entry.actionType,
    );
    expect(actionTypes).not.toContain("amount_correction");
    expect(actionTypes).not.toContain("fund_correction");

    // Omitting the policy falls back to the conservative default, which
    // emits the request entries — the divergence the route must avoid by
    // always passing the tenant policy.
    const defaulted = projectContributionActionResultForViewer(
      makeResult(),
      DONOR_CARE_CAPABILITIES,
    );
    const defaultedCanonical = defaulted.canonicalContribution as {
      actionAvailability: Array<{ actionType: string }>;
    };
    expect(
      defaultedCanonical.actionAvailability.map((entry) => entry.actionType),
    ).toContain("amount_correction");
  });
});
