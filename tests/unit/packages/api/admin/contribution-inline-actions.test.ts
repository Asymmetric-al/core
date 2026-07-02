import { describe, expect, it } from "vitest";

import { buildContributionActionAvailability } from "../../../../../packages/api/src/admin/contribution-operations/action-availability";
import { resolveCorrectionApprovalPolicy } from "../../../../../packages/api/src/admin/contribution-operations/approval-policy";
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
    const detailBase = {
      actionAvailability: availabilityFor(),
      payment: {
        stripe: {
          paymentIntentId: null,
          chargeId: null,
          refundIds: [],
          replayContext: null,
        },
      },
      recurring: { agreement: null },
    } as unknown as ContributionDetail;

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
    // Gap 1 regression: every operation the CRM inline menu offers must have
    // a matching entry in the projected detail contract, or the operation
    // shell fails closed with "not available for the current gift".
    for (const viewerCapabilities of [
      ALL_CAPABILITIES,
      DONOR_CARE_CAPABILITIES,
      FINANCE_STAFF_CAPABILITIES,
    ]) {
      const detail = {
        actionAvailability: availabilityFor(),
        payment: {
          stripe: {
            paymentIntentId: "pi_1",
            chargeId: null,
            refundIds: [],
            replayContext: null,
          },
        },
        recurring: { agreement: null },
      } as unknown as ContributionDetail;

      const projected = projectContributionDetailForViewer(
        detail,
        viewerCapabilities,
      );
      const inline = buildInlineContributionActions({
        availability: availabilityFor(),
        providerPaymentIntentId: "pi_1",
        viewerCapabilities,
      });

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

  it("allows donor-care staff to request approval-gated inline actions", () => {
    const inline = buildInlineContributionActions({
      availability: availabilityFor(),
      providerPaymentIntentId: "pi_1",
      viewerCapabilities: DONOR_CARE_CAPABILITIES,
    });

    // Corrections and refund route through the approval-request path, so a
    // request-capable viewer can raise them. Provider replay does not — the
    // executor gates it on contributions.use_provider_actions — so it is
    // hidden here rather than offered as a dead-end.
    expect(inline.entries.map((entry) => entry.actionType).sort()).toEqual([
      "amount_correction",
      "fund_correction",
      "refund",
    ]);
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
  });

  it("promotes approval, then retry, then receipt as the next-best action", () => {
    const needsReview = buildInlineContributionActions({
      availability: availabilityFor({
        stagedGift: { ...postedStagedGift, status: "needs_review" },
      }),
      providerPaymentIntentId: "pi_1",
      viewerCapabilities: ALL_CAPABILITIES,
    });
    expect(needsReview.nextBestActionType).toBe("approve_staged_gift");

    const failedPost = buildInlineContributionActions({
      availability: availabilityFor({
        stagedGift: { ...postedStagedGift, crmPostStatus: "failed" },
      }),
      providerPaymentIntentId: "pi_1",
      viewerCapabilities: ALL_CAPABILITIES,
    });
    expect(failedPost.nextBestActionType).toBe("retry_staged_gift");

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

    const refundEntry = inline.entries.find(
      (entry) => entry.actionType === "refund",
    );
    expect(refundEntry?.available).toBe(true);
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
