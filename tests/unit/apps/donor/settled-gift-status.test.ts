import { describe, expect, it, vi } from "vitest";

vi.mock("@asym/database/hooks", () => ({
  useDonorHistoryTransactions: () => ({ data: [], isLoading: false }),
}));

const { givenThisYear, lastSupported, supportedMissionaries } =
  await import("../../../../apps/donor/features/donor/components/overview/overview-model");
const { monthlyGivingSeries, receiptPendingNote, unsettledNote, yearSummary } =
  await import("../../../../apps/donor/app/(dashboard)/donor-dashboard/history/page-content");

const NOW = new Date(2026, 10, 11, 12);
const jordan = { id: "m-jordan", name: "Jordan Hale", avatarUrl: null };

const gift = (status: string, overrides: Record<string, unknown> = {}) => ({
  id: `d-${status}`,
  date: "2026-11-05T15:00:00.000Z",
  amountCents: 5_000,
  amount: 50,
  currency: "usd",
  status,
  type: "One-Time",
  method: "Card",
  receiptUrl: null,
  statementYear: null,
  designation: {
    id: "m-jordan",
    name: "Jordan Hale",
    type: "missionary",
    avatarUrl: null,
  },
  missionary: jordan,
  fund: null,
  ...overrides,
});

const snapshot = (donations: unknown[]) =>
  ({
    donations,
    recurringGifts: [],
    donationsComplete: true,
    summary: { statementYears: [] },
  }) as never;

describe("AL-2681 issue 2857 item 16: every donor view counts a settled gift alike, Paid or Received (paid, awaiting review), and a failed one nowhere", () => {
  it("the overview counts a received gift in this year's total, its count, the last missionary supported and the missionaries supported", () => {
    const portal = snapshot([
      gift("Received"),
      gift("Failed", { id: "d-failed" }),
    ]);
    expect(givenThisYear(portal, NOW)).toMatchObject({
      paid: 50,
      paidCount: 1,
    });
    expect(lastSupported(portal)).toEqual(jordan);
    expect(supportedMissionaries(portal, NOW)).toEqual([jordan]);
  });

  it("the history counts a received gift in the month's giving and in the year's sentence", () => {
    const transactions = [
      { date: "2026-11-05T15:00:00.000Z", amount: 50, status: "Received" },
      { date: "2026-11-06T15:00:00.000Z", amount: 20, status: "Failed" },
    ];
    expect(monthlyGivingSeries(transactions, "2026")[10]!.amount).toBe(50);
    expect(
      yearSummary(
        [
          { recipient: "Jordan Hale", amount: 50, status: "Received" },
          { recipient: "Field Team 1", amount: 20, status: "Failed" },
        ] as never,
        "2026",
        "2026",
      ),
    ).toBe("1 gift to Jordan Hale so far this year.");
  });
});

describe("AL-2681 part 2a fix round F9: a Received gift is counted, so it is not listed under Not counted", () => {
  it("the Not counted note names processing, failed and refunded gifts and never a Received one; the Received gift's receipt state is said apart", () => {
    const year = [
      gift("Received"),
      gift("Processing", { id: "d-p" }),
      gift("Failed", { id: "d-f" }),
    ];
    expect(unsettledNote(year)).toBe("1 processing · 1 failed");
    expect(unsettledNote([gift("Received")])).toBeNull();
    expect(receiptPendingNote(year)).toBe("1 received, not yet receipted");
    expect(receiptPendingNote([gift("Paid")])).toBeNull();
  });
});
