import { describe, expect, it } from "vitest";

import { buildContributionActionAvailability } from "../../../../../packages/api/src/admin/contribution-operations/action-availability";

function availabilityFor(
  entries: ReturnType<typeof buildContributionActionAvailability>,
  actionType: string,
) {
  const entry = entries.find((item) => item.actionType === actionType);
  if (!entry) {
    throw new Error(`No availability entry for ${actionType}`);
  }
  return entry;
}

describe("admin/contribution-operations/action-availability", () => {
  it("blocks staged-gift workflow actions with clear reasons when no staged gift exists", () => {
    const entries = buildContributionActionAvailability({
      stagedGift: null,
      paymentStatus: "completed",
    });

    for (const actionType of ["approve_staged_gift", "retry_staged_gift"]) {
      const entry = availabilityFor(entries, actionType);
      expect(entry.available).toBe(false);
      expect(entry.blockedReason).toMatch(
        /no longer an active product workflow/i,
      );
      expect(entry.nextStep).toMatch(/historical evidence.*Asym/i);
    }

    const receiptEntry = availabilityFor(entries, "resend_receipt");
    expect(receiptEntry.available).toBe(false);
    expect(receiptEntry.blockedReason).toMatch(/no staged gift/i);
    expect(receiptEntry.nextStep).toMatch(/valid/i);
  });

  it("computes staged-gift action availability from workflow state", () => {
    const reviewable = buildContributionActionAvailability({
      stagedGift: {
        id: "staged-1",
        status: "needs_review",
        receiptStatus: "pending",
        crmPostStatus: "queued",
      },
      paymentStatus: "completed",
    });

    expect(availabilityFor(reviewable, "approve_staged_gift")).toMatchObject({
      available: false,
      blockedReason: expect.stringMatching(
        /no longer an active product workflow/i,
      ),
      nextStep: expect.stringMatching(/historical evidence.*Asym/i),
    });
    expect(availabilityFor(reviewable, "retry_staged_gift").available).toBe(
      false,
    );
    expect(
      availabilityFor(reviewable, "retry_staged_gift").blockedReason,
    ).toBeTruthy();
    expect(availabilityFor(reviewable, "resend_receipt").available).toBe(true);

    const failed = buildContributionActionAvailability({
      stagedGift: {
        id: "staged-1",
        status: "failed",
        receiptStatus: "pending",
        crmPostStatus: "failed",
      },
      paymentStatus: "completed",
    });

    expect(availabilityFor(failed, "retry_staged_gift")).toMatchObject({
      available: false,
      blockedReason: expect.stringMatching(
        /no longer an active product workflow/i,
      ),
      nextStep: expect.stringMatching(/historical evidence.*Asym/i),
    });
    expect(availabilityFor(failed, "approve_staged_gift").available).toBe(
      false,
    );
  });

  it("fails closed when a posted gift reports a parent CRM failure", () => {
    const entries = buildContributionActionAvailability({
      stagedGift: {
        id: "staged-1",
        status: "posted",
        receiptStatus: "sent",
        crmPostStatus: "posted",
      },
      paymentStatus: "completed",
      crmPostFailedScopes: [{ scope: "parent" }],
    });

    expect(availabilityFor(entries, "retry_staged_gift")).toMatchObject({
      available: false,
      blockedReason: expect.stringMatching(
        /no longer an active product workflow/i,
      ),
      nextStep: expect.stringMatching(/historical evidence.*Asym/i),
    });
  });

  it("fails closed on a legacy posted scalar CRM failure", () => {
    const entries = buildContributionActionAvailability({
      stagedGift: {
        id: "staged-1",
        status: "posted",
        receiptStatus: "sent",
        crmPostStatus: "failed",
      },
      paymentStatus: "completed",
    });

    expect(availabilityFor(entries, "retry_staged_gift")).toMatchObject({
      available: false,
      blockedReason: expect.stringMatching(
        /no longer an active product workflow/i,
      ),
      nextStep: expect.stringMatching(/historical evidence.*Asym/i),
    });
  });

  it("keeps parent CRM retry unavailable while the provider-neutral workflow is missing", () => {
    const entries = buildContributionActionAvailability({
      stagedGift: {
        id: "staged-1",
        status: "ready_to_post",
        receiptStatus: "sent",
        crmPostStatus: "posted",
      },
      paymentStatus: "completed",
      crmPostFailedScopes: [{ scope: "parent" }],
    });

    expect(availabilityFor(entries, "retry_staged_gift")).toMatchObject({
      available: false,
      blockedReason: expect.stringMatching(
        /no longer an active product workflow/i,
      ),
    });
  });

  it("blocks designation-only retries until the route adapter supports them", () => {
    const entries = buildContributionActionAvailability({
      stagedGift: {
        id: "staged-1",
        status: "posted",
        receiptStatus: "sent",
        crmPostStatus: "posted",
      },
      paymentStatus: "completed",
      crmPostFailedScopes: [
        { scope: "designation", allocationId: "allocation-1" },
      ],
    });

    expect(availabilityFor(entries, "retry_staged_gift")).toMatchObject({
      available: false,
      blockedReason: expect.stringMatching(
        /no longer an active product workflow/i,
      ),
      nextStep: expect.stringMatching(/historical evidence.*Asym/i),
    });
  });

  it("keeps an independently failed staged-gift retry unavailable", () => {
    const entries = buildContributionActionAvailability({
      stagedGift: {
        id: "staged-1",
        status: "failed",
        receiptStatus: "sent",
        crmPostStatus: "posted",
      },
      paymentStatus: "completed",
      crmPostFailedScopes: [
        { scope: "designation", allocationId: "allocation-1" },
      ],
    });

    expect(availabilityFor(entries, "retry_staged_gift")).toMatchObject({
      available: false,
      blockedReason: expect.stringMatching(
        /no longer an active product workflow/i,
      ),
    });
  });

  it("keeps a paused ready-to-post gift visible but not retryable", () => {
    const entries = buildContributionActionAvailability({
      stagedGift: {
        id: "staged-1",
        status: "ready_to_post",
        receiptStatus: "sent",
        crmPostStatus: "blocked",
      },
      paymentStatus: "completed",
      crmPostFailedScopes: [],
    });

    expect(availabilityFor(entries, "retry_staged_gift")).toMatchObject({
      available: false,
      blockedReason: expect.stringMatching(
        /no longer an active product workflow/i,
      ),
    });
  });

  it("keeps mixed CRM failures unavailable", () => {
    const entries = buildContributionActionAvailability({
      stagedGift: {
        id: "staged-1",
        status: "ready_to_post",
        receiptStatus: "sent",
        crmPostStatus: "posted",
      },
      paymentStatus: "completed",
      crmPostFailedScopes: [
        { scope: "parent" },
        { scope: "designation", allocationId: "allocation-1" },
      ],
    });

    expect(availabilityFor(entries, "retry_staged_gift")).toMatchObject({
      available: false,
      blockedReason: expect.stringMatching(
        /no longer an active product workflow/i,
      ),
    });
  });

  it.each(["refunded", "voided"])(
    "does not advertise a parent CRM retry from terminal %s state",
    (status) => {
      const entries = buildContributionActionAvailability({
        stagedGift: {
          id: "staged-1",
          status,
          receiptStatus: "sent",
          crmPostStatus: "failed",
        },
        paymentStatus: "completed",
        crmPostFailedScopes: [{ scope: "parent" }],
      });

      expect(availabilityFor(entries, "retry_staged_gift")).toMatchObject({
        available: false,
        blockedReason: expect.stringMatching(
          /no longer an active product workflow/i,
        ),
        nextStep: expect.stringMatching(/historical evidence.*Asym/i),
      });
    },
  );

  it("blocks receipt sends for suppressed receipts and uncompleted payments", () => {
    const suppressed = buildContributionActionAvailability({
      stagedGift: {
        id: "staged-1",
        status: "posted",
        receiptStatus: "suppressed",
        crmPostStatus: "posted",
      },
      paymentStatus: "completed",
    });
    const suppressedEntry = availabilityFor(suppressed, "resend_receipt");
    expect(suppressedEntry.available).toBe(false);
    expect(suppressedEntry.blockedReason).toMatch(/suppressed/i);

    const pendingPayment = buildContributionActionAvailability({
      stagedGift: {
        id: "staged-1",
        status: "received",
        receiptStatus: "pending",
        crmPostStatus: "queued",
      },
      paymentStatus: "pending",
    });
    const pendingEntry = availabilityFor(pendingPayment, "resend_receipt");
    expect(pendingEntry.available).toBe(false);
    expect(pendingEntry.blockedReason).toMatch(/not completed/i);
  });

  it("normalizes provider success aliases for receipt availability", () => {
    for (const paymentStatus of ["succeeded", "success"]) {
      const entries = buildContributionActionAvailability({
        stagedGift: {
          id: "staged-1",
          status: "posted",
          receiptStatus: "sent",
          crmPostStatus: "posted",
        },
        paymentStatus,
        refund: {
          amountCents: 12_00,
          refundedAmountCents: 0,
          hasProviderCharge: true,
        },
      });

      expect(availabilityFor(entries, "resend_receipt").available).toBe(true);
    }
  });

  it("does not advertise refund while the shared route cannot execute it", () => {
    const entries = buildContributionActionAvailability({
      stagedGift: null,
      paymentStatus: "completed",
      refund: {
        amountCents: 12_00,
        refundedAmountCents: 0,
        hasProviderCharge: true,
      },
    });

    expect(availabilityFor(entries, "refund")).toMatchObject({
      available: false,
      blockedReason: expect.stringMatching(/not available/i),
      nextStep: expect.stringMatching(/provider-safe refund workflow/i),
    });
  });

  it("labels every entry with the policy risk level", () => {
    const entries = buildContributionActionAvailability({
      stagedGift: null,
      paymentStatus: "completed",
    });

    for (const entry of entries) {
      expect(["low", "medium", "high"]).toContain(entry.riskLevel);
    }
  });
});
