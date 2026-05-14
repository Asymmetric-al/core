import { describe, expect, it } from "vitest";

import { buildDonationReceiptEmail } from "../../../../packages/api/src/giving/receipts";

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
});
