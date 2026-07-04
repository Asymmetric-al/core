import { describe, expect, it } from "vitest";

import { buildMissionaryDonorRows } from "../../src/missionary-portal/donors";

/**
 * TDD — the missionary "Partners" list is built + redacted SERVER-side so the
 * client never receives raw identity for an anonymous donor.
 * Spec DONOR_ANONYMITY_GUEST_GIVING_SPEC §7.2 / §12.1.
 */

const missionaryProfileId = "prof-1";

const anonDonor = {
  id: "donor-A",
  missionary_id: "prof-1",
  name: "Ada Lovelace",
  email: "ada@example.com",
  phone: "+1-555-0100",
  mobile: "+1-555-0101",
  preferred_contact: "email",
  avatar_url: "https://cdn/a.png",
  location: "Chiang Mai",
  address: { street: "1 Analytical Way", city: "Chiang Mai" },
  organization: "Babbage Co",
  notes: "met at conference",
  tags: ["major-donor"],
  type: "Individual",
  status: "Active",
  total_given: 50000,
  last_gift_date: "2026-07-01",
  last_gift_amount: 10000,
  frequency: "Monthly",
  score: 90,
  has_active_pledge: true,
  created_at: "2025-01-01",
  giving_preferences: { defaultAnonymousToRecipient: true },
};

const namedDonor = {
  ...anonDonor,
  id: "donor-B",
  name: "Blaise Pascal",
  email: "blaise@example.com",
  phone: "+1-555-0200",
  location: "Paris",
  tags: ["monthly"],
  giving_preferences: { defaultAnonymousToRecipient: false },
};

const otherMissionaryDonor = {
  ...namedDonor,
  id: "donor-C",
  missionary_id: "prof-OTHER",
  name: "Not Mine",
  email: "notmine@example.com",
};

const activities = [
  {
    id: "act-A",
    donor_id: "donor-A",
    type: "note",
    date: "2026-07-01",
    created_at: "2026-07-01",
    title: "Called Ada",
    note: "ada@example.com follow-up",
  },
];

const pledges = [
  {
    id: "pl-A",
    donor_id: "donor-A",
    missionary_id: "prof-1",
    amount: 100,
    frequency: "Monthly",
    status: "active",
    start_date: "2026-01-01",
    created_at: "2026-01-01",
    total_paid: 600,
    total_expected: 1200,
  },
];

describe("buildMissionaryDonorRows", () => {
  const rows = buildMissionaryDonorRows({
    missionaryProfileId,
    donors: [anonDonor, namedDonor, otherMissionaryDonor],
    activities,
    pledges,
  });

  it("only returns donors for THIS missionary (tenant/ownership scoping)", () => {
    expect(rows.map((r) => r.id).sort()).toEqual(["donor-A", "donor-B"]);
  });

  it("redacts the anonymous donor — Anonymous donor + zero identifiers", () => {
    const a = rows.find((r) => r.id === "donor-A")!;
    expect(a.name).toBe("Anonymous donor");
    expect(a.email).toBe("");
    expect(a.phone).toBe("");
    expect(a.mobile).toBeUndefined();
    expect(a.avatar_url).toBeUndefined();
    expect(a.location).toBe("");
    expect(a.address).toEqual({});
    expect(a.organization).toBeUndefined();
    expect(a.notes).toBeUndefined();
    expect(a.tags).toEqual([]);
    expect(a.activities).toEqual([]); // activities carry free-text/PII
    // support stats stay visible (§7.2)
    expect(a.total_given).toBe(50000);
    expect(a.status).toBe("Active");
    expect(a.has_active_pledge).toBe(true);
  });

  it("shows the named (consented) donor in full", () => {
    const b = rows.find((r) => r.id === "donor-B")!;
    expect(b.name).toBe("Blaise Pascal");
    expect(b.email).toBe("blaise@example.com");
    expect(b.phone).toBe("+1-555-0200");
  });

  it("leaks NO raw identity of the anonymous donor anywhere in the payload", () => {
    const a = rows.find((r) => r.id === "donor-A")!;
    const s = JSON.stringify(a);
    expect(s).not.toContain("Ada");
    expect(s).not.toContain("ada@example.com");
    expect(s).not.toContain("555-0100");
    expect(s).not.toContain("Chiang Mai");
    expect(s).not.toContain("Babbage");
    expect(s).not.toContain("major-donor");
  });
});
