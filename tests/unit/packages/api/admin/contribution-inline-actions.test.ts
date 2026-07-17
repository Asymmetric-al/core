import { describe, expect, it } from "vitest";

import { buildContributionActionAvailability } from "../../../../../packages/api/src/admin/contribution-operations/action-availability";
import { resolveCorrectionApprovalPolicy } from "../../../../../packages/api/src/admin/contribution-operations/approval-policy";
import { buildContributionDetail } from "../../../../../packages/api/src/admin/contribution-operations/detail-read-model";
import {
  buildInlineContributionActions,
  pickNextBestInlineContributionAction,
} from "../../../../../packages/api/src/admin/contribution-operations/inline-actions";
import { projectContributionDetailForViewer } from "../../../../../packages/api/src/admin/contribution-operations/viewer-projection";

import type { ContributionDetail } from "../../../../../packages/api/src/admin/contribution-operations/detail-read-model";

const ALL_CAPABILITIES = [
  "contributions.view_detail",
  "contributions.request_corrections",
  "contributions.apply_corrections",
  "contributions.approve_corrections",
  "contributions.manage_receipts",
  "contributions.run_refunds",
  "contributions.retry_crm_post",
  "contributions.use_provider_actions",
];

const DONOR_CARE_CAPABILITIES = [
  "contributions.view_detail",
  "contributions.request_corrections",
  "contributions.manage_table_preferences",
];

const FINANCE_STAFF_CAPABILITIES = [
  ...DONOR_CARE_CAPABILITIES,
  "contributions.apply_corrections",
  "contributions.manage_receipts",
  "contributions.retry_crm_post",
];

const APPLY_ONLY_CAPABILITIES = ["contributions.apply_corrections"];

const APPROVAL_SUPPRESSED_POLICY = resolveCorrectionApprovalPolicy({
  ownership_mode: "no_approval_required",
  suppressed_gates: [],
  stronger_approval_categories: [],
});

const postedStagedGift = {
  id: "staged-1",
  status: "posted",
  receiptStatus: "sent",
  crmPostStatus: "posted",
};

function availabilityFor(input?: {
  stagedGift?: typeof postedStagedGift | null;
  paymentStatus?: string;
  hasProviderCharge?: boolean;
}) {
  return buildContributionActionAvailability({
    stagedGift:
      input?.stagedGift === undefined ? postedStagedGift : input.stagedGift,
    paymentStatus: input?.paymentStatus ?? "completed",
    refund: {
      amountCents: 25_000,
      refundedAmountCents: 0,
      hasProviderCharge: input?.hasProviderCharge ?? true,
    },
  });
}

function detailForProjection(input: {
  paymentIntentId: string | null;
  chargeId: string | null;
}): ContributionDetail {
  const detail = buildContributionDetail({
    donation: {
      id: "donation-1",
      tenantId: "tenant-1",
      donorId: null,
      missionaryId: null,
      fundId: null,
      amount: 25_000,
      currency: "usd",
      status: "completed",
      donationType: "one_time",
      paymentMethod: "card",
      isRecurring: false,
      recurringInterval: null,
      notes: null,
      stripePaymentIntentId: input.paymentIntentId,
      stripeChargeId: input.chargeId,
      giftDate: "2026-05-01T00:00:00.000Z",
      campaignId: null,
      pledgeId: null,
      processedAt: null,
      completedAt: "2026-05-01T00:00:00.000Z",
      failedAt: null,
      errorCode: null,
      errorMessage: null,
      refundedAt: null,
      refundAmount: 0,
      source: "online",
      createdAt: "2026-05-01T00:00:00.000Z",
      updatedAt: "2026-05-01T00:00:00.000Z",
    },
    stagedGift: {
      id: postedStagedGift.id,
      status: postedStagedGift.status,
      receiptStatus: postedStagedGift.receiptStatus,
      crmPostStatus: postedStagedGift.crmPostStatus,
      reviewReason: null,
      twentyRecordId: null,
    },
  });
  detail.actionAvailability = availabilityFor();
  return detail;
}

describe("admin/contribution-operations/inline-actions", () => {
  it("reuses the exact detail availability entries for workflow actions", () => {
    const availability = availabilityFor();
    const inline = buildInlineContributionActions({
      availability,
      providerPaymentIntentId: "pi_1",
      viewerCapabilities: ALL_CAPABILITIES,
    });

    // Blocked reasons, next steps, and risk levels match contribution detail
    // because the entries ARE the shared derivation output (issue #270).
    for (const detailEntry of availability) {
      const inlineEntry = inline.entries.find(
        (entry) => entry.actionType === detailEntry.actionType,
      );
      expect(inlineEntry).toEqual(detailEntry);
    }
  });

  it("matches the viewer projection for provider replay availability", () => {
    const detailBase = detailForProjection({
      paymentIntentId: null,
      chargeId: null,
    });

    const projected = projectContributionDetailForViewer(
      detailBase,
      ALL_CAPABILITIES,
    );
    const projectedReplay = projected.actionAvailability.find(
      (entry) => entry.actionType === "stripe_replay",
    );

    const inline = buildInlineContributionActions({
      availability: availabilityFor(),
      providerPaymentIntentId: null,
      viewerCapabilities: ALL_CAPABILITIES,
    });
    const inlineReplay = inline.entries.find(
      (entry) => entry.actionType === "stripe_replay",
    );

    expect(inlineReplay).toEqual(projectedReplay);
    expect(inlineReplay?.available).toBe(false);
  });

  it("finds a detail availability entry for every inline entry a viewer can open (#270)", () => {
    const cases = [
      {
        approvalPolicy: undefined,
        expectedActionTypes: ["amount_correction", "fund_correction"],
        viewerCapabilities: DONOR_CARE_CAPABILITIES,
      },
      {
        // Approval-gated corrections execute as correction REQUESTS, so an
        // apply-only viewer (no request capability) must not see them — the
        // executor's assertCanRequestCorrection would answer 403.
        approvalPolicy: undefined,
        expectedActionTypes: ["approve_staged_gift"],
        viewerCapabilities: APPLY_ONLY_CAPABILITIES,
      },
      {
        approvalPolicy: APPROVAL_SUPPRESSED_POLICY,
        expectedActionTypes: [],
        viewerCapabilities: DONOR_CARE_CAPABILITIES,
      },
      {
        approvalPolicy: APPROVAL_SUPPRESSED_POLICY,
        expectedActionTypes: [
          "amount_correction",
          "approve_staged_gift",
          "fund_correction",
        ],
        viewerCapabilities: APPLY_ONLY_CAPABILITIES,
      },
      {
        approvalPolicy: undefined,
        expectedActionTypes: [
          "amount_correction",
          "approve_staged_gift",
          "fund_correction",
          "refund",
          "resend_receipt",
          "retry_staged_gift",
          "stripe_replay",
        ],
        viewerCapabilities: ALL_CAPABILITIES,
      },
      {
        approvalPolicy: undefined,
        expectedActionTypes: [
          "amount_correction",
          "approve_staged_gift",
          "fund_correction",
          "resend_receipt",
          "retry_staged_gift",
        ],
        viewerCapabilities: FINANCE_STAFF_CAPABILITIES,
      },
    ] as const;

    for (const {
      approvalPolicy,
      expectedActionTypes,
      viewerCapabilities,
    } of cases) {
      const detail = detailForProjection({
        paymentIntentId: "pi_1",
        chargeId: null,
      });

      const projected = projectContributionDetailForViewer(
        detail,
        [...viewerCapabilities],
        { approvalPolicy },
      );
      const inline = buildInlineContributionActions({
        availability: availabilityFor(),
        providerPaymentIntentId: "pi_1",
        approvalPolicy,
        viewerCapabilities: [...viewerCapabilities],
      });

      expect(inline.entries.map((entry) => entry.actionType).sort()).toEqual(
        [...expectedActionTypes].sort(),
      );
      expect(
        projected.actionAvailability.map((entry) => entry.actionType).sort(),
      ).toEqual([...expectedActionTypes].sort());
      for (const inlineEntry of inline.entries) {
        expect(
          projected.actionAvailability.find(
            (entry) => entry.actionType === inlineEntry.actionType,
          ),
        ).toEqual(inlineEntry);
      }
    }
  });

  it("allows provider replay when only a charge id is available", () => {
    const inline = buildInlineContributionActions({
      availability: availabilityFor(),
      providerPaymentIntentId: null,
      providerChargeId: "ch_1",
      viewerCapabilities: ALL_CAPABILITIES,
    });

    const inlineReplay = inline.entries.find(
      (entry) => entry.actionType === "stripe_replay",
    );

    expect(inlineReplay).toMatchObject({
      actionType: "stripe_replay",
      available: true,
      blockedReason: null,
    });
  });

  it("deduplicates provider replay when availability already includes it", () => {
    const staleReplayEntry = {
      actionType: "stripe_replay",
      available: false,
      blockedReason: "Stale projected availability",
      nextStep: "Reload contribution detail",
      riskLevel: "high",
    } satisfies ReturnType<typeof availabilityFor>[number];

    const inline = buildInlineContributionActions({
      availability: [...availabilityFor(), staleReplayEntry],
      providerPaymentIntentId: "pi_1",
      viewerCapabilities: ALL_CAPABILITIES,
    });

    const replayEntries = inline.entries.filter(
      (entry) => entry.actionType === "stripe_replay",
    );

    expect(replayEntries).toEqual([
      expect.objectContaining({
        actionType: "stripe_replay",
        available: true,
        blockedReason: null,
      }),
    ]);
  });

  it("deduplicates correction request entries when availability already includes them", () => {
    const staleAmountCorrection = {
      actionType: "amount_correction",
      available: false,
      blockedReason: "Stale projected availability",
      nextStep: "Reload contribution detail",
      riskLevel: "high",
    } satisfies ReturnType<typeof availabilityFor>[number];
    const staleFundCorrection = {
      actionType: "fund_correction",
      available: false,
      blockedReason: "Stale projected availability",
      nextStep: "Reload contribution detail",
      riskLevel: "high",
    } satisfies ReturnType<typeof availabilityFor>[number];

    const inline = buildInlineContributionActions({
      availability: [
        ...availabilityFor(),
        staleAmountCorrection,
        staleFundCorrection,
      ],
      providerPaymentIntentId: "pi_1",
      viewerCapabilities: ALL_CAPABILITIES,
    });

    const correctionEntries = inline.entries.filter(
      (entry) =>
        entry.actionType === "amount_correction" ||
        entry.actionType === "fund_correction",
    );

    expect(correctionEntries).toEqual([
      expect.objectContaining({
        actionType: "amount_correction",
        available: true,
        blockedReason: null,
      }),
      expect.objectContaining({
        actionType: "fund_correction",
        available: true,
        blockedReason: null,
      }),
    ]);
  });

  it("includes high-risk correction operations as request entries", () => {
    const inline = buildInlineContributionActions({
      availability: availabilityFor(),
      providerPaymentIntentId: "pi_1",
      viewerCapabilities: ALL_CAPABILITIES,
    });

    for (const actionType of ["amount_correction", "fund_correction"]) {
      const entry = inline.entries.find(
        (candidate) => candidate.actionType === actionType,
      );
      expect(entry).toMatchObject({
        actionType,
        available: true,
        blockedReason: null,
        riskLevel: "high",
      });
    }
  });

  it("allows donor-care staff to request non-provider approval-gated inline actions", () => {
    const inline = buildInlineContributionActions({
      availability: availabilityFor(),
      providerPaymentIntentId: "pi_1",
      viewerCapabilities: DONOR_CARE_CAPABILITIES,
    });

    // Corrections, refund, and provider replay route through the
    // approval-request path, so a request-capable viewer can raise them.
    expect(inline.entries.map((entry) => entry.actionType).sort()).toEqual([
      "amount_correction",
      "fund_correction",
    ]);
  });

  it.each([
    ["refund", "contributions.run_refunds"],
    ["stripe_replay", "contributions.use_provider_actions"],
  ] as const)(
    "requires request capability in addition to the direct capability for approval-gated %s",
    (actionType, directCapability) => {
      const inline = buildInlineContributionActions({
        availability: availabilityFor(),
        providerPaymentIntentId: "pi_1",
        viewerCapabilities: [directCapability],
      });

      expect(
        inline.entries.find((entry) => entry.actionType === actionType),
      ).toBeUndefined();
    },
  );

  it("requires the request capability for approval-gated correction entries", () => {
    // Default policy requires approval, so amount/fund corrections execute
    // through createPendingCorrectionRequest. A viewer holding only
    // contributions.apply_corrections cannot create that request (403), so
    // the entries must not be advertised.
    const inline = buildInlineContributionActions({
      availability: availabilityFor(),
      providerPaymentIntentId: "pi_1",
      viewerCapabilities: APPLY_ONLY_CAPABILITIES,
    });

    const actionTypes = inline.entries.map((entry) => entry.actionType);
    expect(actionTypes).not.toContain("amount_correction");
    expect(actionTypes).not.toContain("fund_correction");
  });

  it("hides request-only correction entries when approval policy allows direct apply", () => {
    const inline = buildInlineContributionActions({
      availability: availabilityFor(),
      providerPaymentIntentId: "pi_1",
      approvalPolicy: APPROVAL_SUPPRESSED_POLICY,
      viewerCapabilities: DONOR_CARE_CAPABILITIES,
    });

    expect(inline.entries).toEqual([]);
    expect(inline.nextBestActionType).toBeNull();
  });

  it("filters refund and provider actions away from finance staff when approval is suppressed", () => {
    const inline = buildInlineContributionActions({
      availability: availabilityFor(),
      providerPaymentIntentId: "pi_1",
      approvalPolicy: APPROVAL_SUPPRESSED_POLICY,
      viewerCapabilities: FINANCE_STAFF_CAPABILITIES,
    });

    const actionTypes = inline.entries.map((entry) => entry.actionType);
    expect(actionTypes).toContain("resend_receipt");
    expect(actionTypes).toContain("approve_staged_gift");
    expect(actionTypes).toContain("retry_staged_gift");
    expect(actionTypes).not.toContain("refund");
    expect(actionTypes).not.toContain("stripe_replay");

    const postingEntries = inline.entries.filter((entry) =>
      ["approve_staged_gift", "retry_staged_gift"].includes(entry.actionType),
    );
    expect(postingEntries).toHaveLength(2);
    for (const entry of postingEntries) {
      expect(entry.available).toBe(false);
      expect(entry.blockedReason).toMatch(
        /no longer an active product workflow/i,
      );
      expect(entry.nextStep).toMatch(/historical evidence.*Asym/i);
    }
  });

  it("never promotes retired CRM posting actions and falls through to receipt", () => {
    const needsReview = buildInlineContributionActions({
      availability: availabilityFor({
        stagedGift: { ...postedStagedGift, status: "needs_review" },
      }),
      providerPaymentIntentId: "pi_1",
      viewerCapabilities: ALL_CAPABILITIES,
    });
    expect(needsReview.nextBestActionType).toBe("resend_receipt");

    const failedPost = buildInlineContributionActions({
      availability: availabilityFor({
        stagedGift: {
          ...postedStagedGift,
          status: "failed",
          crmPostStatus: "failed",
        },
      }),
      providerPaymentIntentId: "pi_1",
      viewerCapabilities: ALL_CAPABILITIES,
    });
    expect(failedPost.nextBestActionType).toBe("resend_receipt");

    for (const inline of [needsReview, failedPost]) {
      const postingEntries = inline.entries.filter((entry) =>
        ["approve_staged_gift", "retry_staged_gift"].includes(entry.actionType),
      );
      expect(postingEntries).toHaveLength(2);
      for (const entry of postingEntries) {
        expect(entry.available).toBe(false);
        expect(entry.blockedReason).toMatch(
          /no longer an active product workflow/i,
        );
        expect(entry.nextStep).toMatch(/historical evidence.*Asym/i);
      }
    }

    const settled = buildInlineContributionActions({
      availability: availabilityFor(),
      providerPaymentIntentId: "pi_1",
      viewerCapabilities: ALL_CAPABILITIES,
    });
    expect(settled.nextBestActionType).toBe("resend_receipt");
  });

  it("never promotes high-risk operations as the next-best action", () => {
    // Refund and corrections are available, but every low-risk workflow
    // action is blocked (no staged gift, payment pending).
    const inline = buildInlineContributionActions({
      availability: availabilityFor({
        stagedGift: null,
        paymentStatus: "completed",
      }),
      providerPaymentIntentId: "pi_1",
      viewerCapabilities: ALL_CAPABILITIES,
    });

    const correctionEntry = inline.entries.find(
      (entry) => entry.actionType === "amount_correction",
    );
    expect(correctionEntry?.available).toBe(true);
    expect(inline.nextBestActionType).toBeNull();
  });

  it("respects capability when picking the next-best action", () => {
    const entries = buildInlineContributionActions({
      availability: availabilityFor({
        stagedGift: { ...postedStagedGift, status: "needs_review" },
      }),
      providerPaymentIntentId: "pi_1",
      viewerCapabilities: DONOR_CARE_CAPABILITIES,
    });

    // Donor care cannot approve, so nothing is promoted even though the
    // gift needs review.
    expect(entries.nextBestActionType).toBeNull();
    expect(pickNextBestInlineContributionAction(entries.entries)).toBeNull();
  });
});
