import { describe, expect, it } from "vitest";

import { filterAndSortDonors } from "../../../../apps/missionary/app/donors/donors-list-model";

import type { Donor } from "../../../../apps/missionary/app/donors/donor-types";

const defaultFilters = {
  searchTerm: "",
  statusFilter: "All",
  tagFilter: [],
  pledgeFilter: "All",
  sortBy: "last_gift" as const,
  sortAsc: false,
};

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

describe("filterAndSortDonors", () => {
  it("matches search text across donor identity fields", () => {
    const donors = [
      createDonor({
        id: "name-match",
        name: "Ada Lovelace",
        email: "ada@example.com",
      }),
      createDonor({
        id: "org-match",
        name: "Grace Hopper",
        organization: "Naval Computing Lab",
      }),
      createDonor({
        id: "miss",
        name: "Katherine Johnson",
        email: "katherine@example.com",
      }),
    ];

    const result = filterAndSortDonors(donors, {
      ...defaultFilters,
      searchTerm: "computing",
    });

    expect(result.map((donor) => donor.id)).toEqual(["org-match"]);
  });

  it("trims search text before matching donor identity fields", () => {
    const donors = [
      createDonor({
        id: "alpha",
        name: "Alpha Partner",
        organization: "Local Computing Lab",
      }),
      createDonor({
        id: "zulu",
        name: "Zulu Partner",
      }),
    ];

    expect(
      filterAndSortDonors(donors, {
        ...defaultFilters,
        searchTerm: "  computing  ",
      }).map((donor) => donor.id),
    ).toEqual(["alpha"]);

    expect(
      filterAndSortDonors(donors, {
        ...defaultFilters,
        searchTerm: "   ",
        sortBy: "name",
        sortAsc: true,
      }).map((donor) => donor.id),
    ).toEqual(["alpha", "zulu"]);
  });

  it("applies status, tag, and pledge filters together", () => {
    const donors = [
      createDonor({
        id: "included",
        status: "Active",
        tags: ["monthly-partner"],
        has_active_pledge: true,
      }),
      createDonor({
        id: "wrong-status",
        status: "Lapsed",
        tags: ["monthly-partner"],
        has_active_pledge: true,
      }),
      createDonor({
        id: "wrong-tag",
        status: "Active",
        tags: ["family"],
        has_active_pledge: true,
      }),
      createDonor({
        id: "wrong-pledge",
        status: "Active",
        tags: ["monthly-partner"],
        has_active_pledge: false,
      }),
    ];

    const result = filterAndSortDonors(donors, {
      ...defaultFilters,
      statusFilter: "Active",
      tagFilter: ["monthly-partner"],
      pledgeFilter: "Active",
    });

    expect(result.map((donor) => donor.id)).toEqual(["included"]);
  });

  it("preserves existing descending defaults for gift date and total given", () => {
    const donors = [
      createDonor({
        id: "older-smaller",
        total_given: 100,
        last_gift_date: "2026-01-01T00:00:00.000Z",
      }),
      createDonor({
        id: "newer-larger",
        total_given: 500,
        last_gift_date: "2026-03-01T00:00:00.000Z",
      }),
    ];

    expect(
      filterAndSortDonors(donors, {
        ...defaultFilters,
        sortBy: "last_gift",
      }).map((donor) => donor.id),
    ).toEqual(["newer-larger", "older-smaller"]);

    expect(
      filterAndSortDonors(donors, {
        ...defaultFilters,
        sortBy: "total_given",
      }).map((donor) => donor.id),
    ).toEqual(["newer-larger", "older-smaller"]);
  });

  it("sorts names ascending when sortAsc is true", () => {
    const donors = [
      createDonor({ id: "alpha", name: "Alpha" }),
      createDonor({ id: "zulu", name: "Zulu" }),
    ];

    const result = filterAndSortDonors(donors, {
      ...defaultFilters,
      sortBy: "name",
      sortAsc: true,
    });

    expect(result.map((donor) => donor.id)).toEqual(["alpha", "zulu"]);
  });
});
