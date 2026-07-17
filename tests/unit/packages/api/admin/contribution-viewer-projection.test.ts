import { describe, expect, it } from "vitest";

import { resolveCorrectionApprovalPolicy } from "../../../../../packages/api/src/admin/contribution-operations/approval-policy";
import { buildContributionDetail } from "../../../../../packages/api/src/admin/contribution-operations/detail-read-model";
import { projectContributionDetailForViewer } from "../../../../../packages/api/src/admin/contribution-operations/viewer-projection";

const REQUEST_CAPABLE_STAFF = [
  "contributions.view_detail",
  "contributions.request_corrections",
];

const NO_APPROVAL_POLICY = resolveCorrectionApprovalPolicy({
  ownership_mode: "no_approval_required",
  suppressed_gates: [],
  stronger_approval_categories: [],
});

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
      stripeRefundIds: ["re_proof_1", "re_proof_2"],
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
  it("redacts provider identifiers for request-only staff while keeping correction requests", () => {
    const projected = projectContributionDetailForViewer(
      makeDetail(),
      REQUEST_CAPABLE_STAFF,
    );

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

    // Request-capable staff keep correction request entries so the shared
    // operation shell can open them (#270). The default policy routes these
    // through approval, and the shared inline derivation is reused, so no raw
    // provider identifiers leak through the entries themselves.
    for (const actionType of ["amount_correction", "fund_correction"]) {
      expect(
        projected.actionAvailability.find(
          (entry) => entry.actionType === actionType,
        ),
      ).toMatchObject({
        actionType,
        available: true,
        blockedReason: null,
        riskLevel: "high",
      });
    }
    // Provider-touching approval requests retain their direct capability
    // requirement, so request-only staff cannot see refund or replay.
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

  it("hides every entry from viewers without any operation capability", () => {
    const detail = makeDetail();
    const projected = projectContributionDetailForViewer(detail, [
      "contributions.view_detail",
    ]);

    // ADR-CD-018 mixed visibility: unauthorized → hidden. A read-only viewer
    // gets no availability entries at all — the base workflow entries pass
    // the same capability gate the inline builder applies.
    expect(projected.actionAvailability).toEqual([]);
  });

  it("keeps base workflow entries for viewers holding their capabilities", () => {
    const detail = makeDetail();
    const projected = projectContributionDetailForViewer(detail, [
      "contributions.view_detail",
      "contributions.request_corrections",
      "contributions.apply_corrections",
      "contributions.retry_crm_post",
      "contributions.manage_receipts",
      "contributions.run_refunds",
    ]);

    const baseEntries = detail.actionAvailability.filter(
      (entry) =>
        entry.actionType !== "stripe_replay" &&
        entry.actionType !== "amount_correction" &&
        entry.actionType !== "fund_correction",
    );
    for (const entry of baseEntries) {
      expect(projected.actionAvailability).toContainEqual(entry);
    }
  });

  it("omits request affordances when tenant policy applies corrections directly", () => {
    const staffProjected = projectContributionDetailForViewer(
      makeDetail(),
      REQUEST_CAPABLE_STAFF,
      { approvalPolicy: NO_APPROVAL_POLICY },
    );

    // A request-only viewer would be rejected by the operations route under
    // no_approval_required, so no request entries are offered (#270 gap 2).
    expect(
      staffProjected.actionAvailability.some(
        (entry) =>
          entry.actionType === "stripe_replay" ||
          entry.actionType === "amount_correction" ||
          entry.actionType === "fund_correction",
      ),
    ).toBe(false);

    // Provider operators keep the direct replay action regardless of policy.
    const operatorProjected = projectContributionDetailForViewer(
      makeDetail(),
      ["contributions.use_provider_actions"],
      { approvalPolicy: NO_APPROVAL_POLICY },
    );
    expect(
      operatorProjected.actionAvailability.find(
        (entry) => entry.actionType === "stripe_replay",
      ),
    ).toMatchObject({ available: true });
    expect(
      operatorProjected.actionAvailability.some(
        (entry) =>
          entry.actionType === "amount_correction" ||
          entry.actionType === "fund_correction",
      ),
    ).toBe(false);
  });

  it("keeps the revision fingerprint identical across viewer and policy projections", () => {
    const detail = makeDetail();

    const staffProjected = projectContributionDetailForViewer(
      detail,
      REQUEST_CAPABLE_STAFF,
    );
    const operatorProjected = projectContributionDetailForViewer(
      detail,
      ["contributions.use_provider_actions"],
      { approvalPolicy: NO_APPROVAL_POLICY },
    );

    // The viewer/policy-scoped entries are appended after the revision is
    // computed; they must never feed the optimistic-concurrency fingerprint.
    expect(staffProjected.revision).toBe(detail.revision);
    expect(operatorProjected.revision).toBe(detail.revision);
  });

  it("exposes provider proof, historical CRM evidence, dashboard links, and safe provider actions to authorized operators", () => {
    const projected = projectContributionDetailForViewer(makeDetail(), [
      "contributions.use_provider_actions",
      "contributions.request_corrections",
    ]);

    expect(projected.providerProof).toMatchObject({
      paymentIntentId: "pi_proof",
      chargeId: "ch_proof",
      refundIds: ["re_proof_1", "re_proof_2"],
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
    expect(projected.payment.stripe.refundIds).toEqual([
      "re_proof_1",
      "re_proof_2",
    ]);

    const replayEntry = projected.actionAvailability.find(
      (entry) => entry.actionType === "stripe_replay",
    );
    expect(replayEntry?.available).toBe(true);
    expect(replayEntry?.riskLevel).toBe("high");
  });

  it("links the test-mode Stripe dashboard when the tenant key runs in test mode", () => {
    const projected = projectContributionDetailForViewer(
      makeDetail(),
      ["contributions.use_provider_actions"],
      { providerDashboardTestMode: true },
    );

    expect(projected.providerProof?.dashboardUrls).toEqual({
      paymentIntent: "https://dashboard.stripe.com/test/payments/pi_proof",
      charge: "https://dashboard.stripe.com/test/charges/ch_proof",
    });
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
