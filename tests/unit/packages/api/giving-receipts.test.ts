import { describe, expect, it } from "vitest";

import {
  buildDonationReceiptEmail,
  buildUpdatedDonationReceiptEmail,
} from "../../../../packages/api/src/giving/receipts";

describe("giving receipts", () => {
  it("renders deterministic donation receipt content and idempotency key", () => {
    const receipt = buildDonationReceiptEmail({
      amount: 2500,
      currency: "usd",
      donationId: "donation-1",
      donorName: "Ada <Lovelace>",
      receiptDate: new Date("2026-05-12T00:00:00.000Z"),
      stagedGiftId: "staged-gift-1",
      tenantId: "tenant-1",
    });

    expect(receipt.idempotencyKey).toBe(
      "donation-receipt/tenant-1/donation-1/staged-gift-1",
    );
    expect(receipt.subject).toContain("$25.00");
    expect(receipt.text).toContain("Ada <Lovelace>");
    expect(receipt.html).toContain("Ada &lt;Lovelace&gt;");
    expect(receipt.html).toContain("Donation ID");
  });

  it("renders updated receipt content from the immutable snapshot with a distinct idempotency key", () => {
    const receipt = buildUpdatedDonationReceiptEmail({
      tenantId: "tenant-1",
      snapshotId: "snapshot-1",
      content: {
        version: 1,
        donationId: "donation-1",
        donorName: "Ada <Lovelace>",
        giftDate: "2026-05-12",
        currencyCode: "USD",
        effective: {
          amountCents: 2000,
          fundId: null,
          missionaryId: null,
          paymentStatus: "completed",
        },
        designationLines: [
          {
            id: "line-1",
            amountCents: 2000,
            fundId: null,
            fundName: "General Fund",
            missionaryId: null,
            missionaryName: null,
            memo: "Corrected amount",
          },
        ],
        affectedFields: ["amount"],
        adjustmentId: "adjustment-1",
        generatedAt: "2026-05-13T00:00:00.000Z",
      },
    });

    expect(receipt.idempotencyKey).toBe(
      "contribution-receipt-snapshot/tenant-1/snapshot-1/email",
    );
    expect(receipt.idempotencyKey).not.toContain("donation-receipt/");
    expect(receipt.subject).toContain("$20.00");
    expect(receipt.text).toContain("updated receipt amount is $20.00");
    expect(receipt.text).toContain("Corrected amount");
    expect(receipt.html).toContain("Ada &lt;Lovelace&gt;");
    expect(receipt.html).toContain("<strong>$20.00</strong>");
  });
});
