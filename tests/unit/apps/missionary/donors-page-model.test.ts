import { describe, expect, it } from "vitest";

import { ANONYMOUS_DONOR_LABEL } from "../../../../packages/api/src/missionary-portal/redaction";

import {
  applyDonorsStatFilter,
  createDefaultDonorsFilters,
  createDonorsPageSummary,
  createTagEditorDraft,
  formatDonorAddress,
  getDonorCallHref,
  getDonorEmailHref,
  getGivingHistoryRows,
  hasDonorsActiveFilters,
  removeTagSelection,
  toPartnerSafeDonor,
  toggleTagSelection,
  ANONYMOUS_DONOR_LABEL as PARTNER_ANONYMOUS_DONOR_LABEL,
} from "../../../../apps/missionary/app/donors/donors-page-model";

import type {
  Activity,
  Donor,
  RecurringDonation,
} from "../../../../apps/missionary/app/donors/donor-types";

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
    expect(
      hasDonorsActiveFilters({
        ...filters,
        searchTerm: "   ",
      }),
    ).toBe(false);
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
    expect(applyDonorsStatFilter("needsAttention")).toEqual({
      searchTerm: "",
      statusFilter: "Needs Attention",
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

  it("copies committed tags into a tag editor draft so aborted toggles cannot alias stored tags", () => {
    const committed = ["family"];
    const draft = createTagEditorDraft(committed);

    expect(draft).toEqual(["family"]);
    expect(draft).not.toBe(committed);

    const toggled = toggleTagSelection(draft, "monthly-partner");
    expect(toggled).toEqual(["family", "monthly-partner"]);
    expect(committed).toEqual(["family"]);
    expect(createTagEditorDraft(committed)).toEqual(["family"]);
    expect(createTagEditorDraft(undefined)).toEqual([]);
  });

  it("keeps the Partners anonymous label aligned with the server redaction SSOT", () => {
    expect(PARTNER_ANONYMOUS_DONOR_LABEL).toBe(ANONYMOUS_DONOR_LABEL);
  });

  it("strips leaked identity from an anonymous partner row while preserving support stats", () => {
    const poisoned = createDonor({
      name: "Jane Secret",
      initials: "JS",
      email: "jane@secret.test",
      phone: "555-0199",
      mobile: "555-0111",
      work_phone: "555-0222",
      avatar_url: "https://cdn.example/jane.jpg",
      location: "Denver, CO",
      address: { street: "123 Hidden St", city: "Denver" },
      work_address: { street: "9 Office Rd" },
      website: "https://janesecret.test",
      organization: "Secret Org",
      title: "Director",
      notes: "Do not share",
      tags: ["vip"],
      spouse: "Hidden Spouse",
      is_anonymous: true,
      total_given: 500,
      status: "Active",
      has_active_pledge: true,
    });

    const safe = toPartnerSafeDonor(poisoned);

    expect(safe.name).toBe(ANONYMOUS_DONOR_LABEL);
    expect(safe.initials).toBe("AD");
    expect(safe.email).toBe("");
    expect(safe.phone).toBe("");
    expect(safe.mobile).toBeUndefined();
    expect(safe.work_phone).toBeUndefined();
    expect(safe.avatar_url).toBeUndefined();
    expect(safe.location).toBe("");
    expect(safe.address).toEqual({});
    expect(safe.work_address).toBeUndefined();
    expect(safe.website).toBeUndefined();
    expect(safe.organization).toBeUndefined();
    expect(safe.title).toBeUndefined();
    expect(safe.notes).toBeUndefined();
    expect(safe.spouse).toBeUndefined();
    expect(safe.tags).toEqual([]);
    expect(safe.activities).toEqual([]);
    expect(safe.total_given).toBe(500);
    expect(safe.status).toBe("Active");
    expect(safe.has_active_pledge).toBe(true);
    expect(safe.is_anonymous).toBe(true);
    expect(getDonorCallHref(poisoned)).toBeNull();
    expect(getDonorCallHref(safe)).toBeNull();
    expect(getDonorEmailHref(poisoned.email, poisoned.is_anonymous)).toBeNull();
    expect(getDonorEmailHref(safe.email, safe.is_anonymous)).toBeNull();
  });

  it("leaves named partners unchanged", () => {
    const named = createDonor({
      name: "Ada Lovelace",
      email: "ada@example.com",
      phone: "555-0100",
    });

    expect(toPartnerSafeDonor(named)).toEqual(named);
    expect(getDonorCallHref(named)).toBe("tel:555-0100");
    expect(getDonorEmailHref(named.email, named.is_anonymous)).toBe(
      "mailto:ada@example.com",
    );
  });

  it("builds tel and mailto hrefs only when a phone or email is present", () => {
    expect(
      getDonorCallHref(
        createDonor({
          phone: "555-0100",
          mobile: "555-0199",
        }),
      ),
    ).toBe("tel:555-0100");
    expect(
      getDonorCallHref(
        createDonor({
          phone: "",
          mobile: "555-0199",
        }),
      ),
    ).toBe("tel:555-0199");
    expect(
      getDonorCallHref(
        createDonor({
          phone: "  ",
          mobile: undefined,
        }),
      ),
    ).toBeNull();
    expect(getDonorEmailHref("ada@example.com")).toBe("mailto:ada@example.com");
    expect(getDonorEmailHref("")).toBeNull();
    expect(getDonorEmailHref("   ")).toBeNull();
    expect(getDonorEmailHref(undefined)).toBeNull();
  });
});
