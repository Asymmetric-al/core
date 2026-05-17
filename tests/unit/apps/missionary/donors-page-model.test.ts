import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  applyDonorsStatFilter,
  createDefaultDonorsFilters,
  createDonorsPageSummary,
  formatDonorAddress,
  getGivingHistoryRows,
  hasDonorsActiveFilters,
  removeTagSelection,
  toggleTagSelection,
} from "../../../../apps/missionary/app/donors/donors-page-model";

import type {
  Activity,
  Donor,
  RecurringDonation,
} from "../../../../apps/missionary/app/donors/donor-types";

const root = new URL("../../../../", import.meta.url);

function readRepoFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

function createRecurringDonation(
  overrides: Partial<RecurringDonation>,
): RecurringDonation {
  return {
    id: "recurring-1",
    amount: 0,
    frequency: "Monthly",
    status: "active",
    start_date: "2026-01-01T00:00:00.000Z",
    total_paid: 0,
    total_expected: 0,
    payments_completed: 0,
    payments_remaining: 0,
    ...overrides,
  };
}

function createActivity(overrides: Partial<Activity>): Activity {
  return {
    id: "activity-1",
    type: "note",
    date: "2026-01-01T00:00:00.000Z",
    title: "Activity",
    ...overrides,
  };
}

function createDonor(overrides: Partial<Donor>): Donor {
  return {
    id: "donor-1",
    name: "Default Donor",
    initials: "DD",
    type: "Individual",
    status: "Active",
    total_given: 0,
    last_gift_date: null,
    last_gift_amount: null,
    frequency: "One-time",
    email: "default@example.com",
    phone: "555-0100",
    preferred_contact: "email",
    location: "Unknown",
    address: {},
    joined_date: "2026-01-01T00:00:00.000Z",
    tags: [],
    score: 0,
    activities: [],
    recurring_donations: [],
    has_active_pledge: false,
    ...overrides,
  };
}

describe("donors page model helpers", () => {
  it("derives summary counts and monthly pledge totals without changing frequency conversion", () => {
    const donors = [
      createDonor({
        id: "active-monthly",
        status: "Active",
        total_given: 100,
        has_active_pledge: true,
        recurring_donations: [
          createRecurringDonation({ amount: 90, frequency: "Monthly" }),
        ],
      }),
      createDonor({
        id: "risk-quarterly",
        status: "At Risk",
        total_given: 250,
        has_active_pledge: true,
        recurring_donations: [
          createRecurringDonation({ amount: 120, frequency: "Quarterly" }),
        ],
      }),
      createDonor({
        id: "lapsed-yearly",
        status: "Lapsed",
        total_given: 650,
        has_active_pledge: true,
        recurring_donations: [
          createRecurringDonation({ amount: 1200, frequency: "Yearly" }),
        ],
      }),
      createDonor({
        id: "new-no-pledge",
        status: "New",
      }),
    ];

    expect(createDonorsPageSummary(donors)).toEqual({
      activeCount: 1,
      activePledgeCount: 3,
      atRiskCount: 1,
      lapsedCount: 1,
      monthlyPledgeTotal: 230,
      totalGiven: 1000,
    });
  });

  it("represents the cleared filter state used by Clear All", () => {
    const filters = createDefaultDonorsFilters();

    expect(filters).toEqual({
      searchTerm: "",
      statusFilter: "All",
      tagFilter: [],
      pledgeFilter: "All",
    });
    expect(hasDonorsActiveFilters(filters)).toBe(false);
    expect(
      hasDonorsActiveFilters({
        ...filters,
        tagFilter: ["monthly-partner"],
      }),
    ).toBe(true);
  });

  it("maps stat card clicks to the existing filter states and clears selection", () => {
    expect(applyDonorsStatFilter("atRisk")).toEqual({
      searchTerm: "",
      statusFilter: "At Risk",
      tagFilter: [],
      pledgeFilter: "All",
      selectedDonorId: null,
    });
    expect(applyDonorsStatFilter("activePledge")).toEqual({
      searchTerm: "",
      statusFilter: "All",
      tagFilter: [],
      pledgeFilter: "Active",
      selectedDonorId: null,
    });
    expect(applyDonorsStatFilter("lapsed")).toEqual({
      searchTerm: "",
      statusFilter: "Lapsed",
      tagFilter: [],
      pledgeFilter: "All",
      selectedDonorId: null,
    });
    expect(applyDonorsStatFilter("new")).toEqual({
      searchTerm: "",
      statusFilter: "New",
      tagFilter: [],
      pledgeFilter: "All",
      selectedDonorId: null,
    });
  });

  it("formats addresses while preserving existing country suppression", () => {
    expect(
      formatDonorAddress({
        street: "123 Main St",
        street2: "Suite 4",
        city: "Denver",
        state: "CO",
        zip: "80202",
        country: "USA",
      }),
    ).toEqual(["123 Main St", "Suite 4", "Denver, CO, 80202"]);

    expect(
      formatDonorAddress({
        city: "Toronto",
        state: "ON",
        country: "Canada",
      }),
    ).toEqual(["Toronto, ON", "Canada"]);

    expect(formatDonorAddress({ country: "United States" })).toEqual([]);
  });

  it("derives giving history rows from gift activities only", () => {
    const gift = createActivity({
      id: "gift-activity",
      type: "gift",
      amount: 50,
    });
    const note = createActivity({
      id: "note-activity",
      type: "note",
    });

    expect(
      getGivingHistoryRows(
        createDonor({
          activities: [note, gift],
        }),
      ),
    ).toEqual([gift]);
    expect(getGivingHistoryRows(null)).toEqual([]);
  });

  it("toggles and removes tag selections without mutating the current array", () => {
    const currentTags = ["family"];
    const added = toggleTagSelection(currentTags, "monthly-partner");
    const removed = toggleTagSelection(added, "family");

    expect(added).toEqual(["family", "monthly-partner"]);
    expect(removed).toEqual(["monthly-partner"]);
    expect(removeTagSelection(added, "monthly-partner")).toEqual(["family"]);
    expect(currentTags).toEqual(["family"]);
  });
});

describe("donors page view-model source contract", () => {
  it("keeps the view-model profile concrete and file-local", () => {
    const source = readRepoFile(
      "apps/missionary/app/donors/use-donors-page-view.tsx",
    );

    expect(source).not.toContain('ReturnType<typeof useAuth>["profile"]');
    expect(source).not.toMatch(/export\s+type\s+DonorsPageViewModel/);
    expect(source).toContain("profile: Profile | null");
  });
});
