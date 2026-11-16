import { describe, expect, it } from "vitest";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) App module regression test at its public boundary.
import {
  formatReceiptFieldList,
  receiptOutcomeStatusLabel,
} from "../../../../../apps/admin/app/(app)/contributions/receipt-delivery-model";

describe("receipt delivery labels", () => {
  it("names every server receipt outcome in staff wording", () => {
    expect(receiptOutcomeStatusLabel("emailed")).toBe("Emailed to the donor");
    expect(receiptOutcomeStatusLabel("pdf_generated")).toBe("PDF generated");
    expect(receiptOutcomeStatusLabel("deferred")).toBe("Deferred");
    expect(receiptOutcomeStatusLabel("blocked")).toBe("Blocked");
    expect(receiptOutcomeStatusLabel("not_required")).toBe("Not required");
    expect(receiptOutcomeStatusLabel("failed")).toBe("Failed");
  });

  it("still reads an unknown stored outcome as words, never snake_case", () => {
    expect(receiptOutcomeStatusLabel("queued_for_review")).toBe(
      "Queued for review",
    );
  });

  it("lists changed receipt fields as a readable phrase", () => {
    expect(formatReceiptFieldList([])).toBe("");
    expect(formatReceiptFieldList(["amount"])).toBe("amount");
    // "designation" also covers missionary-only and designation-line
    // changes, so it is not narrowed to "fund designation".
    expect(formatReceiptFieldList(["amount", "designation"])).toBe(
      "amount and designation",
    );
    expect(
      formatReceiptFieldList(["amount", "designation", "payment status"]),
    ).toBe("amount, designation and payment status");
    expect(formatReceiptFieldList(["gift_date"])).toBe("gift date");
  });
});
