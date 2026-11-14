import { describe, expect, it, vi } from "vitest";

vi.mock("@asym/database/hooks", () => ({
  useDonorHistoryTransactions: () => ({ data: [], isLoading: false }),
}));

const { yearSummary } =
  await import("../../../../apps/donor/app/(dashboard)/donor-dashboard/history/page-content");

const gift = (recipient: string, amount: number, status = "Paid") =>
  ({ recipient, amount, status }) as never;

// The total sits right above this sentence, so the sentence says what the
// number doesn't: how many gifts, and to whom.
describe("yearSummary", () => {
  it("counts the gifts and names who they went to, without repeating the total", () => {
    const summary = yearSummary(
      [
        gift("Jordan Hale", 50),
        gift("Jordan Hale", 50),
        gift("Nairobi Water Wells", 34),
      ],
      "2026",
      "2026",
    );
    expect(summary).toBe(
      "3 gifts to Jordan Hale and Nairobi Water Wells so far this year.",
    );
    expect(summary).not.toContain("$");
  });

  it("uses the past tense for an earlier year", () => {
    expect(yearSummary([gift("Jordan Hale", 50)], "2025", "2026")).toBe(
      "1 gift to Jordan Hale in 2025.",
    );
  });
});
