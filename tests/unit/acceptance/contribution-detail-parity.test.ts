import { describe, expect, it, vi } from "vitest";

import {
  filterSharedContributions,
  formatSharedContributionAmount,
  SHARED_PAYMENT_STATUS_LABELS,
  SHARED_RECEIPT_STATUS_LABELS,
  type SharedContributionFilter,
} from "../../../packages/api/src/admin/contribution-shared";
import { executeContributionAction } from "../../../packages/api/src/admin/contribution-operations/actions";
import { resolveCorrectionApprovalPolicy } from "../../../packages/api/src/admin/contribution-operations/approval-policy";
import { buildContributionGridRow } from "../../../packages/api/src/admin/contributions/model";
import { buildCrmGiftHistoryRow } from "../../../packages/api/src/admin/crm/detail/gift-history";

/**
 * Acceptance coverage for the contribution detail PRD invariants (#275).
 * These tests assert externally visible behavior — what staff see and what
 * the shared contracts return — never implementation details.
 */

interface GiftSeed {
  id: string;
  amount: number;
  status: string;
  refund_amount: number;
  refunded_at: string | null;
  stagedGift: {
    id: string;
    status: string;
    receipt_status: string;
    crm_post_status: string;
  } | null;
  corrections: Array<{ status: string }>;
}

const GIFT_SEEDS: GiftSeed[] = [
  {
    id: "donation-clean",
    amount: 25_000,
    status: "completed",
    refund_amount: 0,
    refunded_at: null,
    stagedGift: {
      id: "staged-clean",
      status: "posted",
      receipt_status: "sent",
      crm_post_status: "posted",
    },
    corrections: [],
  },
  {
    id: "donation-troubled",
    amount: 50_000,
    status: "refunded",
    refund_amount: 50_000,
    refunded_at: "2026-05-02T00:00:00.000Z",
    stagedGift: {
      id: "staged-troubled",
      status: "posted",
      receipt_status: "sent",
      crm_post_status: "failed",
    },
    corrections: [{ status: "pending" }],
  },
  {
    id: "donation-import",
    amount: 10_000,
    status: "completed",
    refund_amount: 0,
    refunded_at: null,
    stagedGift: null,
    corrections: [],
  },
];

function donationFor(seed: GiftSeed) {
  return {
    id: seed.id,
    donor_id: "donor-1",
    missionary_id: null,
    fund_id: "fund-1",
    amount: seed.amount,
    currency: "usd",
    status: seed.status,
    gift_date: "2026-05-01",
    refund_amount: seed.refund_amount,
    refunded_at: seed.refunded_at,
    created_at: "2026-05-01T00:00:00.000Z",
    updated_at: "2026-05-02T00:00:00.000Z",
  };
}

const donor = { id: "donor-1", name: "Alice Johnson", email: "a@example.com" };
const fund = { id: "fund-1", name: "Clean Water Initiative" };

function buildBothSurfaceRows(seed: GiftSeed) {
  const crmRow = buildCrmGiftHistoryRow({
    donation: donationFor(seed),
    donor,
    fund,
    missionary: null,
    stagedGift: seed.stagedGift
      ? { ...seed.stagedGift, twenty_record_id: null }
      : null,
    corrections: seed.corrections,
  });

  const hubRow = buildContributionGridRow({
    donation: {
      ...donationFor(seed),
      donation_type: "one_time",
      payment_method: "card",
      is_recurring: false,
      recurring_interval: null,
      notes: null,
      stripe_payment_intent_id: null,
      campaign_id: null,
      pledge_id: null,
      processed_at: null,
      completed_at: null,
      failed_at: null,
      error_code: null,
      error_message: null,
      stripe_charge_id: null,
      source: "online",
    },
    donor: {
      ...donor,
      phone: null,
      type: null,
      location: null,
      organization: null,
      notes: null,
    },
    profile: null,
    fund,
    missionary: null,
    stagedGift: seed.stagedGift
      ? {
          ...seed.stagedGift,
          review_reason: null,
          receipt_send_log_id: null,
        }
      : null,
    corrections: seed.corrections,
  });

  return { crmRow, hubRow };
}

describe("acceptance: CRM/Hub display parity (ADR-CD-032)", () => {
  it("shows the same shared fields and display values for the same gift", () => {
    for (const seed of GIFT_SEEDS) {
      const { crmRow, hubRow } = buildBothSurfaceRows(seed);

      // The shared row contract is byte-identical across surfaces.
      expect(crmRow.shared).toEqual(hubRow.shared);

      // What staff actually read on screen agrees too: formatted amount and
      // status vocabulary come from the same shared maps.
      expect(
        formatSharedContributionAmount(
          crmRow.shared.amountCents,
          crmRow.shared.currencyCode,
        ),
      ).toBe(
        formatSharedContributionAmount(
          hubRow.shared.amountCents,
          hubRow.shared.currencyCode,
        ),
      );
      expect(SHARED_PAYMENT_STATUS_LABELS[crmRow.shared.paymentStatus]).toBe(
        SHARED_PAYMENT_STATUS_LABELS[hubRow.shared.paymentStatus],
      );
      expect(SHARED_RECEIPT_STATUS_LABELS[crmRow.shared.receiptStatus]).toBe(
        SHARED_RECEIPT_STATUS_LABELS[hubRow.shared.receiptStatus],
      );
    }
  });
});

describe("acceptance: shared filters agree across surfaces (#274)", () => {
  it("returns the same gifts on CRM and Hub for every overlapping filter", () => {
    const rows = GIFT_SEEDS.map(buildBothSurfaceRows);
    const crmRows = rows.map((pair) => pair.crmRow);
    const hubRows = rows.map((pair) => pair.hubRow);

    const overlappingFilters: SharedContributionFilter[] = [
      { id: "receipt_affected" },
      { id: "pending_correction" },
      { id: "approval_state", value: "pending" },
      { id: "refund_state", value: "refunded" },
      { id: "crm_post_state", value: "failed" },
      { id: "crm_post_state", value: "not_required" },
      { id: "recurring_link", value: "none" },
      { id: "payment_status", value: "completed" },
      { id: "payment_status", value: "refunded" },
    ];

    for (const filter of overlappingFilters) {
      const crmIds = filterSharedContributions(crmRows, [filter]).map(
        (row) => row.shared.donationId,
      );
      const hubIds = filterSharedContributions(hubRows, [filter]).map(
        (row) => row.shared.donationId,
      );
      expect(crmIds).toEqual(hubIds);
    }
  });
});

describe("acceptance: inline CRM operations share detail contracts (#270)", () => {
  const APPROVAL_SUPPRESSED_POLICY = resolveCorrectionApprovalPolicy({
    ownership_mode: "no_approval_required",
    suppressed_gates: [],
    stronger_approval_categories: [],
  });

  function correctionInput(sourceSurface: "donor_crm_record" | "contribution_hub") {
    const applyCorrection = vi.fn().mockResolvedValue({
      before: { amount: 25_000 },
      after: { amount: 20_000 },
    });
    const createCorrectionRecord = vi.fn().mockResolvedValue("correction-1");
    const appendAuditEvent = vi.fn().mockResolvedValue(`audit-${sourceSurface}`);
    const loadContributionDetail = vi.fn().mockResolvedValue({
      id: "donation-1",
      amount: { value: 20_000 },
    });

    return {
      input: {
        tenantId: "tenant-1",
        actorProfileId: "profile-1",
        actorPermissions: ["finance:manage_contributions" as const],
        sourceSurface,
        contributionId: "donation-1",
        actionType: "amount_correction" as const,
        reason: "Donor reported the wrong amount",
        confirmationToken: "confirm",
        payload: { amount: 20_000 },
        approvalPolicy: APPROVAL_SUPPRESSED_POLICY,
        dependencies: {
          applyCorrection,
          createCorrectionRecord,
          appendAuditEvent,
          loadContributionDetail,
        },
      },
      appendAuditEvent,
    };
  }

  it("applies the same policy gates regardless of surface", async () => {
    for (const surface of ["donor_crm_record", "contribution_hub"] as const) {
      const { input } = correctionInput(surface);
      await expect(
        executeContributionAction({
          ...input,
          reason: undefined,
          confirmationToken: undefined,
        }),
      ).rejects.toThrow(/reason/i);
    }
  });

  it("produces the same result shape and audit behavior from either surface", async () => {
    const crm = correctionInput("donor_crm_record");
    const hub = correctionInput("contribution_hub");

    const crmResult = await executeContributionAction(crm.input);
    const hubResult = await executeContributionAction(hub.input);

    // Identical result contract: only the audit id (per event) differs.
    expect(Object.keys(crmResult).sort()).toEqual(
      Object.keys(hubResult).sort(),
    );
    expect(crmResult.correctionId).toBe(hubResult.correctionId);
    expect(crmResult.canonicalContribution).toEqual(
      hubResult.canonicalContribution,
    );

    // Both audit events record the same operation with their own surface.
    expect(crm.appendAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        actionType: "amount_correction",
        sourceSurface: "donor_crm_record",
        reason: "Donor reported the wrong amount",
      }),
    );
    expect(hub.appendAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        actionType: "amount_correction",
        sourceSurface: "contribution_hub",
        reason: "Donor reported the wrong amount",
      }),
    );
  });
});
