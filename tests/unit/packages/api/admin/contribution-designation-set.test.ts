import { describe, expect, it } from "vitest";

import {
  buildContributionDesignationSet,
  summarizeContributionDesignationSet,
} from "../../../../../packages/api/src/admin/contribution-shared/designation-set";

const donation = {
  id: "donation-1",
  amount: 30_000,
  currency: "usd",
  fund_id: "fund-1",
  missionary_id: "missionary-1",
};

const funds = new Map([
  [
    "fund-1",
    {
      id: "fund-1",
      name: "Clean Water Initiative",
      missionary_id: null,
      goal_amount: 50_000,
      start_date: null,
      end_date: null,
    },
  ],
  [
    "fund-2",
    {
      id: "fund-2",
      name: "Martinez Family Support",
      missionary_id: "missionary-1",
      goal_amount: 0,
      start_date: null,
      end_date: null,
    },
  ],
  [
    "fund-3",
    {
      id: "fund-3",
      name: "Spring Campaign",
      missionary_id: null,
      goal_amount: 100_000,
      start_date: "2026-03-01",
      end_date: "2026-05-31",
    },
  ],
]);

const missionaries = new Map([["missionary-1", "John Martinez"]]);

describe("admin/contribution-shared/designation-set", () => {
  it("builds equal designation lines for a split gift that reconcile to the gift amount", () => {
    const set = buildContributionDesignationSet({
      donation,
      effectiveAmountCents: 30_000,
      allocations: [
        {
          id: "alloc-1",
          amount: 10_000,
          fund_id: "fund-1",
          missionary_id: null,
          memo: "water project",
        },
        {
          id: "alloc-2",
          amount: 15_000,
          fund_id: "fund-2",
          missionary_id: "missionary-1",
          memo: null,
        },
        {
          id: "alloc-3",
          amount: 5_000,
          fund_id: "fund-3",
          missionary_id: null,
          memo: null,
        },
      ],
      funds,
      missionaries,
    });

    expect(set.lines).toHaveLength(3);
    expect(set.totalAmountCents).toBe(30_000);
    expect(set.reconcilesToGiftAmount).toBe(true);
    expect(set.issues).toEqual([]);

    const [project, missionary, campaign] = set.lines;
    expect(project).toMatchObject({
      id: "alloc-1",
      amountCents: 10_000,
      currencyCode: "USD",
      fundId: "fund-1",
      fundName: "Clean Water Initiative",
      fundType: "project",
      memo: "water project",
      restriction: null,
    });
    expect(missionary).toMatchObject({
      fundId: "fund-2",
      fundName: "Martinez Family Support",
      fundType: "missionary",
      missionaryId: "missionary-1",
      missionaryName: "John Martinez",
    });
    expect(campaign).toMatchObject({
      fundId: "fund-3",
      fundType: "campaign",
    });

    // No line is primary — the set carries no ordering flags or primary markers.
    for (const line of set.lines) {
      expect(line).not.toHaveProperty("isPrimary");
      expect(line).not.toHaveProperty("primary");
    }
  });

  it("falls back to one General Fund line when no allocations exist", () => {
    const set = buildContributionDesignationSet({
      donation: { ...donation, fund_id: null, missionary_id: null },
      effectiveAmountCents: 30_000,
      allocations: [],
      funds,
      missionaries,
    });

    expect(set.lines).toHaveLength(1);
    expect(set.lines[0]).toMatchObject({
      amountCents: 30_000,
      fundId: null,
      fundName: "General Fund",
      fundType: "general",
    });
    expect(set.reconcilesToGiftAmount).toBe(true);
  });

  it("normalizes fundless designation lines to General Fund and flags the issue", () => {
    const set = buildContributionDesignationSet({
      donation,
      effectiveAmountCents: 30_000,
      allocations: [
        {
          id: "alloc-1",
          amount: 30_000,
          fund_id: null,
          missionary_id: null,
          memo: "where most needed",
        },
      ],
      funds,
      missionaries,
    });

    expect(set.lines[0]).toMatchObject({
      fundId: null,
      fundName: "General Fund",
      fundType: "general",
      memo: "where most needed",
    });
    expect(set.issues.some((issue) => /general fund/i.test(issue))).toBe(true);
  });

  it("flags a reconciliation issue when lines do not sum to the effective amount", () => {
    const set = buildContributionDesignationSet({
      donation,
      effectiveAmountCents: 30_000,
      allocations: [
        {
          id: "alloc-1",
          amount: 12_000,
          fund_id: "fund-1",
          missionary_id: null,
          memo: null,
        },
      ],
      funds,
      missionaries,
    });

    expect(set.reconcilesToGiftAmount).toBe(false);
    expect(set.issues.some((issue) => /reconcile/i.test(issue))).toBe(true);
  });

  it("summarizes single-line and split sets with one shared derivation", () => {
    const single = buildContributionDesignationSet({
      donation,
      effectiveAmountCents: 30_000,
      allocations: [],
      funds,
      missionaries,
    });
    expect(summarizeContributionDesignationSet(single)).toEqual({
      fundId: "fund-1",
      fundName: "Clean Water Initiative",
      missionaryId: "missionary-1",
      missionaryName: "John Martinez",
      lineCount: 1,
    });

    const split = buildContributionDesignationSet({
      donation,
      effectiveAmountCents: 30_000,
      allocations: [
        {
          id: "alloc-1",
          amount: 10_000,
          fund_id: "fund-1",
          missionary_id: null,
          memo: null,
        },
        {
          id: "alloc-2",
          amount: 20_000,
          fund_id: "fund-2",
          missionary_id: "missionary-1",
          memo: null,
        },
      ],
      funds,
      missionaries,
    });
    expect(summarizeContributionDesignationSet(split)).toEqual({
      fundId: null,
      fundName: "2 designations",
      missionaryId: null,
      missionaryName: null,
      lineCount: 2,
    });
  });

  it("derives missionary identity from a missionary fund when the allocation omits it", () => {
    const set = buildContributionDesignationSet({
      donation,
      effectiveAmountCents: 30_000,
      allocations: [
        {
          id: "alloc-1",
          amount: 30_000,
          fund_id: "fund-2",
          missionary_id: null,
          memo: null,
        },
      ],
      funds,
      missionaries,
    });

    expect(set.lines[0]).toMatchObject({
      fundId: "fund-2",
      fundType: "missionary",
      missionaryId: "missionary-1",
      missionaryName: "John Martinez",
    });
  });
});

