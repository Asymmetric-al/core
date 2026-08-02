import { describe, expect, it } from "vitest";

import {
  getHubPaymentStatusFacetValues,
  getHubSharedFilterFacetValue,
  HUB_RECURRING_LINK_STATE_LABELS,
  hubSharedContributionFilterChips,
  hubSharedFilterColumnVisibility,
  matchesHubPaymentStatusSelection,
  matchesHubSharedFilterSelection,
} from "../../../../../apps/admin/app/(app)/contributions/shared-filters";
import {
  matchesSharedContributionFilter,
  SHARED_CONTRIBUTION_FILTERS,
  SHARED_CORRECTION_STATE_LABELS,
  SHARED_CRM_POST_STATUS_LABELS,
  SHARED_REFUND_STATE_LABELS,
} from "../../../../../packages/api/src/admin/contribution-shared";

import type { Contribution } from "../../../../../apps/admin/app/(app)/contributions/types";

function makeContribution(
  sharedOverrides: Partial<Contribution["shared"]> = {},
  overrides: Partial<Contribution> = {},
): Contribution {
  return {
    shared: {
      donationId: "00000000-0000-4000-8000-000000000001",
      amountCents: 10000,
      currencyCode: "USD",
      giftDate: "2026-05-30T00:00:00.000Z",
      donorId: "donor_1",
      donorName: "Ada Lovelace",
      designationSummary: {
        fundId: "fund_1",
        fundName: "General Fund",
        missionaryId: null,
        missionaryName: null,
        lineCount: 1,
      },
      paymentStatus: "completed",
      receiptStatus: "pending",
      crmPostStatus: null,
      refundState: "none",
      refundedAmountCents: 0,
      correctionState: "none",
      recurringLinkState: "none",
      ...sharedOverrides,
    },
    id: "00000000-0000-4000-8000-000000000001",
    donorId: "donor_1",
    donorName: "Ada Lovelace",
    donorEmail: "ada@example.com",
    donorAvatar: null,
    donorType: null,
    donorPhone: null,
    donorLocation: null,
    organizationName: null,
    amount: 10000,
    amountGross: 10000,
    amountNet: null,
    amountFee: null,
    amountTaxDeductible: null,
    currency: "USD",
    date: "2026-05-30T00:00:00.000Z",
    contributionDate: "2026-05-30T00:00:00.000Z",
    createdAt: "2026-05-30T00:00:00.000Z",
    updatedAt: "2026-05-30T00:00:00.000Z",
    settlementDate: null,
    depositDate: null,
    status: "completed",
    subStatus: null,
    type: "One-time",
    paymentMethod: "Credit Card",
    source: "Online",
    fundId: "fund_1",
    fundCode: "GENERAL",
    fundName: "General Fund",
    missionaryId: null,
    missionaryName: null,
    campaignId: null,
    receiptStatus: "pending",
    receiptSent: false,
    receiptSentAt: null,
    stagedGiftId: null,
    stagedGiftStatus: null,
    stagedGiftReviewReason: null,
    crmPostStatus: null,
    annualStatementEligible: true,
    entryMethod: "api",
    reconciliationStatus: "unreconciled",
    transactionId: "pi_1",
    externalTransactionId: null,
    processorTransactionId: "pi_1",
    notes: null,
    notesPreview: null,
    isAnonymous: false,
    ...overrides,
  };
}

describe("apps/admin/app/(app)/contributions/shared-filters", () => {
  it("builds one chip per shared filter id, in registry order, except payment_status (Status chip) and the deferred designation_issue", () => {
    const expectedIds = SHARED_CONTRIBUTION_FILTERS.map(
      (definition) => definition.id,
    ).filter((id) => id !== "payment_status" && id !== "designation_issue");

    expect(hubSharedContributionFilterChips.map((chip) => chip.id)).toEqual(
      expectedIds,
    );

    for (const chip of hubSharedContributionFilterChips) {
      const definition = SHARED_CONTRIBUTION_FILTERS.find(
        (candidate) => candidate.id === chip.id,
      );
      expect(chip.label).toBe(definition?.label);
    }
  });

  it("derives enum chip options from the shared label records", () => {
    const optionsById = new Map(
      hubSharedContributionFilterChips.map((chip) => [chip.id, chip.options]),
    );

    expect(optionsById.get("approval_state")).toEqual(
      Object.entries(SHARED_CORRECTION_STATE_LABELS).map(([value, label]) => ({
        label,
        value,
      })),
    );
    expect(optionsById.get("refund_state")).toEqual(
      Object.entries(SHARED_REFUND_STATE_LABELS).map(([value, label]) => ({
        label,
        value,
      })),
    );
    expect(optionsById.get("crm_post_state")).toEqual(
      Object.entries(SHARED_CRM_POST_STATUS_LABELS).map(([value, label]) => ({
        label,
        value,
      })),
    );
    expect(optionsById.get("recurring_link")).toEqual(
      Object.entries(HUB_RECURRING_LINK_STATE_LABELS).map(([value, label]) => ({
        label,
        value,
      })),
    );
    // Flag filters render as single-option chips.
    expect(optionsById.get("receipt_affected")).toEqual([
      { label: "Receipt affected", value: "receipt_affected" },
    ]);
    expect(optionsById.get("pending_correction")).toEqual([
      { label: "Pending correction", value: "pending_correction" },
    ]);
  });

  it("hides every filter-only chip column via the shared visibility map", () => {
    expect(hubSharedFilterColumnVisibility).toEqual(
      Object.fromEntries(
        hubSharedContributionFilterChips.map((chip) => [chip.id, false]),
      ),
    );
  });

  it("evaluates chip selections through the shared evaluator (OR within a chip, unknown values never match)", () => {
    const pendingCorrection = makeContribution({ correctionState: "pending" });
    const applied = makeContribution({ correctionState: "applied" });
    const clean = makeContribution();

    // Empty selection = chip not engaged.
    expect(
      matchesHubSharedFilterSelection(clean, "approval_state", undefined),
    ).toBe(true);
    expect(matchesHubSharedFilterSelection(clean, "approval_state", [])).toBe(
      true,
    );

    // Single value evaluates via matchesSharedContributionFilter.
    expect(
      matchesHubSharedFilterSelection(pendingCorrection, "approval_state", [
        "pending",
      ]),
    ).toBe(
      matchesSharedContributionFilter(
        { shared: pendingCorrection.shared },
        { id: "approval_state", value: "pending" },
      ),
    );

    // Values within one chip OR together.
    expect(
      matchesHubSharedFilterSelection(applied, "approval_state", [
        "pending",
        "applied",
      ]),
    ).toBe(true);
    expect(
      matchesHubSharedFilterSelection(clean, "approval_state", [
        "pending",
        "applied",
      ]),
    ).toBe(false);

    // Unknown enum values never match (a chip must not lie).
    expect(
      matchesHubSharedFilterSelection(pendingCorrection, "approval_state", [
        "bogus",
      ]),
    ).toBe(false);

    // Flag chips match on any selection.
    const receiptAffected = makeContribution({
      receiptStatus: "sent",
      correctionState: "applied",
    });
    expect(
      matchesHubSharedFilterSelection(receiptAffected, "receipt_affected", [
        "receipt_affected",
      ]),
    ).toBe(true);
    expect(
      matchesHubSharedFilterSelection(clean, "receipt_affected", [
        "receipt_affected",
      ]),
    ).toBe(false);

    // The deferred designation_issue can never match through the Hub path.
    expect(
      matchesHubSharedFilterSelection(clean, "designation_issue", [
        "designation_issue",
      ]),
    ).toBe(false);
  });

  it("treats a null crmPostStatus as not_required like the shared evaluator", () => {
    const row = makeContribution({ crmPostStatus: null });

    expect(
      matchesHubSharedFilterSelection(row, "crm_post_state", ["not_required"]),
    ).toBe(true);
    expect(getHubSharedFilterFacetValue(row, "crm_post_state")).toBe(
      "not_required",
    );
  });

  it("facet values mirror what selecting the option would match", () => {
    const receiptAffected = makeContribution({
      receiptStatus: "sent",
      correctionState: "applied",
    });
    const clean = makeContribution();

    expect(
      getHubSharedFilterFacetValue(receiptAffected, "receipt_affected"),
    ).toBe("receipt_affected");
    expect(getHubSharedFilterFacetValue(clean, "receipt_affected")).toBeNull();
    expect(getHubSharedFilterFacetValue(clean, "refund_state")).toBe("none");
    expect(getHubSharedFilterFacetValue(clean, "recurring_link")).toBe("none");
  });

  it("matches refund_state selections through the Hub path (a chip that cannot match fails this)", () => {
    const partial = makeContribution({
      refundState: "partial_refund",
      refundedAmountCents: 5000,
    });
    const refunded = makeContribution({
      refundState: "refunded",
      refundedAmountCents: 10000,
    });
    const clean = makeContribution();

    expect(
      matchesHubSharedFilterSelection(partial, "refund_state", [
        "partial_refund",
      ]),
    ).toBe(true);
    expect(
      matchesHubSharedFilterSelection(clean, "refund_state", [
        "partial_refund",
      ]),
    ).toBe(false);
    expect(
      matchesHubSharedFilterSelection(refunded, "refund_state", [
        "partial_refund",
      ]),
    ).toBe(false);
    expect(
      matchesHubSharedFilterSelection(clean, "refund_state", ["none"]),
    ).toBe(true);
    expect(
      matchesHubSharedFilterSelection(refunded, "refund_state", ["none"]),
    ).toBe(false);
    // OR within the chip surfaces both refunded shapes.
    expect(
      matchesHubSharedFilterSelection(refunded, "refund_state", [
        "partial_refund",
        "refunded",
      ]),
    ).toBe(true);
  });

  it("matches recurring_link selections through the Hub path (a chip that cannot match fails this)", () => {
    const providerOnly = makeContribution({
      recurringLinkState: "provider_only",
    });
    const agreementLinked = makeContribution({
      recurringLinkState: "agreement_linked",
    });
    const oneTime = makeContribution({ recurringLinkState: "none" });

    expect(
      matchesHubSharedFilterSelection(providerOnly, "recurring_link", [
        "provider_only",
      ]),
    ).toBe(true);
    expect(
      matchesHubSharedFilterSelection(oneTime, "recurring_link", [
        "provider_only",
      ]),
    ).toBe(false);
    expect(
      matchesHubSharedFilterSelection(agreementLinked, "recurring_link", [
        "agreement_linked",
      ]),
    ).toBe(true);
    expect(
      matchesHubSharedFilterSelection(oneTime, "recurring_link", ["none"]),
    ).toBe(true);
    expect(
      matchesHubSharedFilterSelection(agreementLinked, "recurring_link", [
        "none",
      ]),
    ).toBe(false);
  });

  describe("Status chip payment-status split (issue #274)", () => {
    const refundedButGridCompleted = makeContribution(
      {
        paymentStatus: "refunded",
        refundState: "refunded",
        refundedAmountCents: 10000,
      },
      { status: "completed" },
    );
    const processing = makeContribution(
      { paymentStatus: "pending" },
      { status: "processing" },
    );
    const completed = makeContribution();

    it("matches Refunded through row.shared.paymentStatus even when the grid status stayed completed", () => {
      expect(
        matchesHubPaymentStatusSelection(refundedButGridCompleted, [
          "refunded",
        ]),
      ).toBe(true);
      expect(
        matchesHubPaymentStatusSelection(refundedButGridCompleted, [
          "completed",
        ]),
      ).toBe(false);
    });

    it("keeps Hub-only grid statuses working as extension selections", () => {
      expect(matchesHubPaymentStatusSelection(processing, ["processing"])).toBe(
        true,
      );
      expect(matchesHubPaymentStatusSelection(completed, ["processing"])).toBe(
        false,
      );
      // The shared "pending" meaning includes delayed rails (processing).
      expect(matchesHubPaymentStatusSelection(processing, ["pending"])).toBe(
        true,
      );
    });

    it("ORs selections within the Status chip and ignores empty selections", () => {
      expect(
        matchesHubPaymentStatusSelection(refundedButGridCompleted, [
          "completed",
          "refunded",
        ]),
      ).toBe(true);
      expect(matchesHubPaymentStatusSelection(completed, undefined)).toBe(true);
      expect(matchesHubPaymentStatusSelection(completed, [])).toBe(true);
    });

    it("counts Status facets by the values the filter matches, not the grid status", () => {
      // A refunded-but-grid-completed gift counts under Refunded only — the
      // popover count must agree with the filtered rows it targets.
      expect(getHubPaymentStatusFacetValues(refundedButGridCompleted)).toEqual([
        "refunded",
      ]);
      // A grid-processing gift counts under both Pending (shared meaning) and
      // Processing (Hub-only extension), matching both selections.
      expect(getHubPaymentStatusFacetValues(processing)).toEqual([
        "pending",
        "processing",
      ]);
      // A plain completed gift counts under Completed only.
      expect(getHubPaymentStatusFacetValues(completed)).toEqual(["completed"]);
    });

    it("every Status facet value the helper reports actually matches its selection", () => {
      for (const row of [refundedButGridCompleted, processing, completed]) {
        for (const value of getHubPaymentStatusFacetValues(row)) {
          expect(matchesHubPaymentStatusSelection(row, [value])).toBe(true);
        }
      }
    });
  });
});
