import { describe, expect, it } from "vitest";

import { buildContributionDetail } from "../../../../../packages/api/src/admin/contribution-operations/detail-read-model";

describe("contribution operations detail read model", () => {
  it("builds canonical staff and donor-visible contribution truth", () => {
    const detail = buildContributionDetail({
      donation: {
        id: "donation_1",
        tenantId: "tenant_1",
        donorId: "donor_1",
        missionaryId: "missionary_1",
        fundId: "fund_1",
        amount: 12000,
        currency: "usd",
        status: "refunded",
        donationType: "recurring",
        paymentMethod: "card",
        isRecurring: true,
        recurringInterval: "month",
        notes: "internal note",
        stripePaymentIntentId: "pi_123",
        stripeChargeId: "ch_123",
        giftDate: "2026-05-01T00:00:00.000Z",
        campaignId: "campaign_1",
        pledgeId: "pledge_1",
        processedAt: "2026-05-01T00:01:00.000Z",
        completedAt: "2026-05-01T00:02:00.000Z",
        failedAt: null,
        errorCode: null,
        errorMessage: null,
        refundedAt: "2026-05-02T00:00:00.000Z",
        refundAmount: 12000,
        source: "online",
        createdAt: "2026-05-01T00:00:00.000Z",
        updatedAt: "2026-05-02T00:00:00.000Z",
      },
      donor: {
        id: "donor_1",
        profileId: "profile_1",
        name: "Jordan Donor",
        email: "jordan@example.com",
        phone: "555-0100",
        mobile: "555-0101",
        location: "Austin, TX",
        organization: "Jordan Family",
      },
      fund: { id: "fund_1", name: "General Fund" },
      missionary: { id: "missionary_1", name: "Riley Worker" },
      stagedGift: {
        id: "staged_1",
        status: "posted",
        receiptStatus: "sent",
        crmPostStatus: "posted",
        reviewReason: null,
        twentyRecordId: "twenty_1",
      },
      auditEvents: [
        {
          id: "audit_1",
          actionType: "refund",
          sourceSurface: "contribution_hub",
          reason: "duplicate gift",
          createdAt: "2026-05-02T00:00:00.000Z",
        },
      ],
      corrections: [
        {
          id: "correction_1",
          correctionType: "refund_correction",
          status: "applied",
        },
      ],
    });

    expect(detail.id).toBe("donation_1");
    expect(detail.donor?.phoneNumbers).toEqual(["555-0100", "555-0101"]);
    expect(detail.payment.stripe.paymentIntentId).toBe("pi_123");
    expect(detail.payment.stripe.chargeId).toBe("ch_123");
    expect(detail.refund.status).toBe("refunded");
    expect(detail.refund.amount).toBe(12000);
    expect(detail.receipt.status).toBe("sent");
    expect(detail.recurring.isRecurring).toBe(true);
    expect(detail.crm.postStatus).toBe("posted");
    expect(detail.auditEvents).toHaveLength(1);
    expect(detail.corrections).toHaveLength(1);
    expect(detail.donorVisible.status).toBe("Refunded");
    expect(detail.donorVisible.historyUpdatedImmediately).toBe(true);
  });

  it("keeps partial refunds distinct from full refunds in donor-visible staff detail", () => {
    const detail = buildContributionDetail({
      donation: {
        id: "donation_1",
        tenantId: "tenant_1",
        donorId: "donor_1",
        missionaryId: null,
        fundId: null,
        amount: 12000,
        currency: "usd",
        status: "completed",
        donationType: "one_time",
        paymentMethod: "card",
        isRecurring: false,
        recurringInterval: null,
        notes: null,
        stripePaymentIntentId: "pi_123",
        stripeChargeId: "ch_123",
        giftDate: "2026-05-01T00:00:00.000Z",
        campaignId: null,
        pledgeId: null,
        processedAt: null,
        completedAt: "2026-05-01T00:02:00.000Z",
        failedAt: null,
        errorCode: null,
        errorMessage: null,
        refundedAt: "2026-05-02T00:00:00.000Z",
        refundAmount: 2500,
        source: "online",
        createdAt: "2026-05-01T00:00:00.000Z",
        updatedAt: "2026-05-02T00:00:00.000Z",
      },
    });

    expect(detail.refund.status).toBe("partial_refund");
    expect(detail.donorVisible.status).toBe("Partially Refunded");
  });

  it("embeds the shared contribution row contract so detail and rows cannot drift", () => {
    const detail = buildContributionDetail({
      donation: {
        id: "donation_2",
        tenantId: "tenant_1",
        donorId: "donor_1",
        missionaryId: "missionary_1",
        fundId: "fund_1",
        amount: 25_000,
        currency: "usd",
        status: "completed",
        donationType: "one_time",
        paymentMethod: "card",
        isRecurring: false,
        recurringInterval: null,
        notes: null,
        stripePaymentIntentId: "pi_900",
        stripeChargeId: null,
        giftDate: "2026-05-10",
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
        createdAt: "2026-05-10T08:00:00.000Z",
        updatedAt: "2026-05-10T08:00:00.000Z",
      },
      donor: {
        id: "donor_1",
        profileId: null,
        name: "Alice Johnson",
        email: "alice@example.com",
        phone: null,
        location: null,
        organization: null,
      },
      fund: { id: "fund_1", name: "Clean Water Initiative" },
      missionary: { id: "missionary_1", name: "John Martinez" },
      stagedGift: {
        id: "staged_1",
        status: "posted",
        receiptStatus: "sent",
        crmPostStatus: "posted",
        reviewReason: null,
        twentyRecordId: null,
      },
      corrections: [
        { id: "c1", correctionType: "amount_correction", status: "pending" },
      ],
    });

    expect(detail.actionAvailability).toEqual([
      expect.objectContaining({
        actionType: "approve_staged_gift",
        available: false,
      }),
      expect.objectContaining({
        actionType: "retry_staged_gift",
        available: false,
      }),
      expect.objectContaining({
        actionType: "resend_receipt",
        available: true,
      }),
      expect.objectContaining({
        actionType: "refund",
        available: false,
      }),
    ]);

    expect(detail.shared).toEqual({
      donationId: "donation_2",
      amountCents: 25_000,
      currencyCode: "USD",
      giftDate: "2026-05-10",
      donorId: "donor_1",
      donorName: "Alice Johnson",
      designationSummary: {
        fundId: "fund_1",
        fundName: "Clean Water Initiative",
        missionaryId: "missionary_1",
        missionaryName: "John Martinez",
        lineCount: 1,
      },
      paymentStatus: "completed",
      receiptStatus: "sent",
      crmPostStatus: "posted",
      refundState: "none",
      refundedAmountCents: 0,
      correctionState: "pending",
    });
  });

  it("returns read-only truth with blocked workflow actions for gifts without staged gifts", () => {
    const detail = buildContributionDetail({
      donation: {
        id: "donation_3",
        tenantId: "tenant_1",
        donorId: "donor_1",
        missionaryId: null,
        fundId: null,
        amount: 7_500,
        currency: "usd",
        status: "completed",
        donationType: "one_time",
        paymentMethod: "check",
        isRecurring: false,
        recurringInterval: null,
        notes: null,
        stripePaymentIntentId: null,
        stripeChargeId: null,
        giftDate: "2026-03-15",
        campaignId: null,
        pledgeId: null,
        processedAt: null,
        completedAt: "2026-03-15T00:00:00.000Z",
        failedAt: null,
        errorCode: null,
        errorMessage: null,
        refundedAt: null,
        refundAmount: 0,
        source: "mail",
        createdAt: "2026-03-15T00:00:00.000Z",
        updatedAt: "2026-03-15T00:00:00.000Z",
      },
      donor: {
        id: "donor_1",
        profileId: null,
        name: "Legacy Donor",
        email: null,
        phone: null,
        location: null,
        organization: null,
      },
    });

    expect(detail.stagedGift).toBeNull();
    expect(detail.shared.amountCents).toBe(7_500);
    expect(detail.shared.designationSummary.fundName).toBe("General Fund");

    const workflowEntries = detail.actionAvailability.filter((entry) =>
      ["approve_staged_gift", "retry_staged_gift", "resend_receipt"].includes(
        entry.actionType,
      ),
    );
    for (const entry of workflowEntries) {
      expect(entry.available).toBe(false);
      expect(entry.blockedReason).toMatch(/no staged gift/i);
      expect(entry.nextStep).toMatch(/valid/i);
    }

    // A check gift with no provider charge cannot use provider refunds.
    const refundEntry = detail.actionAvailability.find(
      (entry) => entry.actionType === "refund",
    );
    expect(refundEntry?.available).toBe(false);
    expect(refundEntry?.blockedReason).toMatch(/no payment provider charge/i);
  });

  it("exposes a first-class designation set for split gifts that reconciles to the gift amount", () => {
    const detail = buildContributionDetail({
      donation: {
        id: "donation_4",
        tenantId: "tenant_1",
        donorId: "donor_1",
        missionaryId: null,
        fundId: "fund_1",
        amount: 30_000,
        currency: "usd",
        status: "completed",
        donationType: "one_time",
        paymentMethod: "card",
        isRecurring: false,
        recurringInterval: null,
        notes: null,
        stripePaymentIntentId: "pi_1",
        stripeChargeId: null,
        giftDate: "2026-05-20",
        campaignId: null,
        pledgeId: null,
        processedAt: null,
        completedAt: "2026-05-20T00:00:00.000Z",
        failedAt: null,
        errorCode: null,
        errorMessage: null,
        refundedAt: null,
        refundAmount: 0,
        source: "online",
        createdAt: "2026-05-20T00:00:00.000Z",
        updatedAt: "2026-05-20T00:00:00.000Z",
      },
      donor: {
        id: "donor_1",
        profileId: null,
        name: "Split Donor",
        email: "split@example.com",
        phone: null,
        location: null,
        organization: null,
      },
      fund: { id: "fund_1", name: "Clean Water Initiative" },
      allocations: [
        {
          id: "alloc_1",
          amount: 10_000,
          fund_id: "fund_1",
          missionary_id: null,
          memo: "water",
        },
        {
          id: "alloc_2",
          amount: 20_000,
          fund_id: "fund_2",
          missionary_id: "missionary_1",
          memo: null,
        },
      ],
      allocationFunds: [
        {
          id: "fund_1",
          name: "Clean Water Initiative",
          missionary_id: null,
          goal_amount: 50_000,
          start_date: null,
          end_date: null,
        },
        {
          id: "fund_2",
          name: "Martinez Family Support",
          missionary_id: "missionary_1",
          goal_amount: 0,
          start_date: null,
          end_date: null,
        },
      ],
      allocationMissionaries: [
        { id: "missionary_1", display_name: "John Martinez" },
      ],
    });

    expect(detail.designations.lines).toHaveLength(2);
    expect(detail.designations.totalAmountCents).toBe(30_000);
    expect(detail.designations.reconcilesToGiftAmount).toBe(true);
    expect(detail.designations.lines[0]).toMatchObject({
      fundName: "Clean Water Initiative",
      fundType: "project",
      memo: "water",
    });
    expect(detail.designations.lines[1]).toMatchObject({
      fundName: "Martinez Family Support",
      fundType: "missionary",
      missionaryName: "John Martinez",
    });

    // The shared row summary derives from the same designation set.
    expect(detail.shared.designationSummary).toEqual({
      fundId: null,
      fundName: "2 designations",
      missionaryId: null,
      missionaryName: null,
      lineCount: 2,
    });

    // No designation is labeled primary anywhere in the payload.
    expect(detail).not.toHaveProperty("designation");
  });

  it("derives effective values from applied adjustments while preserving the original", () => {
    const detail = buildContributionDetail({
      donation: {
        id: "donation_5",
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
        stripePaymentIntentId: "pi_1",
        stripeChargeId: null,
        giftDate: "2026-05-20",
        campaignId: null,
        pledgeId: null,
        processedAt: null,
        completedAt: "2026-05-20T00:00:00.000Z",
        failedAt: null,
        errorCode: null,
        errorMessage: null,
        refundedAt: null,
        refundAmount: 0,
        source: "online",
        createdAt: "2026-05-20T00:00:00.000Z",
        updatedAt: "2026-05-21T00:00:00.000Z",
      },
      donor: {
        id: "donor_1",
        profileId: null,
        name: "Adjusted Donor",
        email: "adjusted@example.com",
        phone: null,
        location: null,
        organization: null,
      },
      fund: { id: "fund_1", name: "Clean Water Initiative" },
      allocationFunds: [
        {
          id: "fund_1",
          name: "Clean Water Initiative",
          missionary_id: null,
          goal_amount: 0,
          start_date: null,
          end_date: null,
        },
        {
          id: "fund_2",
          name: "Disaster Relief",
          missionary_id: null,
          goal_amount: 0,
          start_date: null,
          end_date: null,
        },
      ],
      adjustments: [
        {
          id: "adj_1",
          adjustmentType: "amount_correction",
          status: "applied",
          effectiveValues: { amountCents: 20_000 },
          reason: "data entry error",
          actorProfileId: "profile_1",
          sourceSurface: "contribution_hub",
          createdAt: "2026-05-21T00:00:00.000Z",
        },
        {
          id: "adj_2",
          adjustmentType: "fund_correction",
          status: "applied",
          effectiveValues: { fundId: "fund_2" },
          reason: "donor intent clarified",
          actorProfileId: "profile_1",
          sourceSurface: "donor_crm_record",
          createdAt: "2026-05-22T00:00:00.000Z",
        },
      ],
    });

    // Original donation truth is preserved and visible.
    expect(detail.original).toEqual({
      amountCents: 25_000,
      fundId: "fund_1",
      missionaryId: null,
      paymentStatus: "completed",
    });

    // Effective values derive from original + applied adjustments.
    expect(detail.effective.amountCents).toBe(20_000);
    expect(detail.effective.fundId).toBe("fund_2");
    expect(detail.effective.materiallyDiffers).toBe(true);
    expect(detail.amount.value).toBe(20_000);
    expect(detail.shared.amountCents).toBe(20_000);
    expect(detail.shared.designationSummary.fundName).toBe("Disaster Relief");
    expect(detail.designations.totalAmountCents).toBe(20_000);

    // Adjustment history and version metadata are part of the contract.
    expect(detail.adjustments).toHaveLength(2);
    expect(detail.revision).toBe("2026-05-21T00:00:00.000Z#2");
  });
});
