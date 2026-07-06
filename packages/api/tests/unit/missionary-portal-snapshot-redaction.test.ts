import { describe, expect, it } from "vitest";

import {
  buildMissionaryPortalSnapshot,
  mapMissionaryTask,
} from "../../src/missionary-portal/model";

/**
 * TDD — end-to-end proof that the missionary-portal snapshot REDACTS anonymous
 * donors (no raw identity leaks), while a consenting (named) donor is shown.
 * buildMissionaryPortalSnapshot is pure → fully testable with no DB.
 */

const profile = {
  id: "prof-1",
  email: "missionary@example.com",
  first_name: "Grace",
  last_name: "Hopper",
  full_name: "Grace Hopper",
  display_name: "Grace Hopper",
  phone: "+1-555-0000",
  avatar_url: null,
};

const missionary = {
  id: "miss-1",
  tenant_id: "tenant-1",
  profile_id: "prof-1",
  bio: null,
  mission_field: null,
  funding_goal: 100000,
  current_funding: 60000,
  tagline: null,
  location: null,
  phone: null,
  timezone: null,
  region: null,
  cover_url: null,
  social_links: null,
};

// Donor A = anonymous-to-recipient (via giving_preferences). Donor B = named.
const anonDonor = {
  id: "donor-A",
  name: "Ada Lovelace",
  email: "ada@example.com",
  phone: "+1-555-0100",
  mobile: null,
  preferred_contact: "email",
  avatar_url: "https://cdn/a.png",
  location: "Chiang Mai",
  status: "active",
  total_given: 50000,
  last_gift_date: "2026-07-01",
  last_gift_amount: 10000,
  gift_count: 5,
  frequency: "monthly",
  tags: ["major-donor"],
  has_active_pledge: true,
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

const emptyPrefsDonor = {
  ...anonDonor,
  id: "donor-D",
  name: "Clara Empty",
  email: "clara.empty@example.com",
  phone: "+1-555-0300",
  location: "Lisbon",
  tags: ["empty-prefs-tag"],
  giving_preferences: {},
};

const nullPrefsDonor = {
  ...anonDonor,
  id: "donor-E",
  name: "Null Prefs",
  email: "null.prefs@example.com",
  phone: "+1-555-0400",
  location: "Oslo",
  tags: ["null-prefs-tag"],
  giving_preferences: null,
};

const { giving_preferences: _missingGivingPreferences, ...missingPrefsDonor } =
  {
    ...anonDonor,
    id: "donor-F",
    name: "Missing Prefs",
    email: "missing.prefs@example.com",
    phone: "+1-555-0500",
    location: "Quito",
    tags: ["missing-prefs-tag"],
  };

const donations = [
  {
    id: "gift-A",
    donor_id: "donor-A",
    amount: 10000,
    currency: "usd",
    status: "completed",
    donation_type: "one_time",
    is_recurring: false,
    gift_date: "2026-07-01",
    created_at: "2026-07-01",
  },
  {
    id: "gift-B",
    donor_id: "donor-B",
    amount: 20000,
    currency: "usd",
    status: "completed",
    donation_type: "one_time",
    is_recurring: false,
    gift_date: "2026-07-02",
    created_at: "2026-07-02",
  },
  {
    id: "gift-D",
    donor_id: "donor-D",
    amount: 30000,
    currency: "usd",
    status: "completed",
    donation_type: "one_time",
    is_recurring: false,
    gift_date: "2026-07-03",
    created_at: "2026-07-03",
  },
  {
    id: "gift-E",
    donor_id: "donor-E",
    amount: 40000,
    currency: "usd",
    status: "completed",
    donation_type: "one_time",
    is_recurring: false,
    gift_date: "2026-07-04",
    created_at: "2026-07-04",
  },
  {
    id: "gift-F",
    donor_id: "donor-F",
    amount: 50000,
    currency: "usd",
    status: "completed",
    donation_type: "one_time",
    is_recurring: false,
    gift_date: "2026-07-05",
    created_at: "2026-07-05",
  },
];

const tasks = [
  {
    id: "task-A",
    missionary_id: "prof-1",
    donor_id: "donor-A",
    title: "Send thank-you note",
    description: null,
    task_type: "to_do",
    status: "not_started",
    priority: "none",
    sort_key: 0,
    due_date: null,
    completed_at: null,
    is_auto_generated: false,
    created_at: "2026-07-01",
    updated_at: "2026-07-01",
    donor: {
      id: "donor-A",
      name: "Ada Lovelace",
      email: "ada@example.com",
      avatar_url: "https://cdn/a.png",
      giving_preferences: { defaultAnonymousToRecipient: true },
    },
  },
  {
    id: "task-D",
    missionary_id: "prof-1",
    donor_id: "donor-D",
    title: "Send partner update",
    description: null,
    task_type: "to_do",
    status: "not_started",
    priority: "none",
    sort_key: 0,
    due_date: null,
    completed_at: null,
    is_auto_generated: false,
    created_at: "2026-07-01",
    updated_at: "2026-07-01",
    donor: {
      id: "donor-D",
      name: "Clara Empty",
      email: "clara.empty@example.com",
      avatar_url: "https://cdn/d.png",
      giving_preferences: {},
    },
  },
  {
    id: "task-E",
    missionary_id: "prof-1",
    donor_id: "donor-E",
    title: "Send partner update",
    description: null,
    task_type: "to_do",
    status: "not_started",
    priority: "none",
    sort_key: 0,
    due_date: null,
    completed_at: null,
    is_auto_generated: false,
    created_at: "2026-07-01",
    updated_at: "2026-07-01",
    donor: {
      id: "donor-E",
      name: "Null Prefs",
      email: "null.prefs@example.com",
      avatar_url: "https://cdn/e.png",
      giving_preferences: null,
    },
  },
  {
    id: "task-F",
    missionary_id: "prof-1",
    donor_id: "donor-F",
    title: "Send partner update",
    description: null,
    task_type: "to_do",
    status: "not_started",
    priority: "none",
    sort_key: 0,
    due_date: null,
    completed_at: null,
    is_auto_generated: false,
    created_at: "2026-07-01",
    updated_at: "2026-07-01",
    donor: {
      id: "donor-F",
      name: "Missing Prefs",
      email: "missing.prefs@example.com",
      avatar_url: "https://cdn/f.png",
    },
  },
];

describe("buildMissionaryPortalSnapshot redaction", () => {
  const snap = buildMissionaryPortalSnapshot({
    profile,
    missionary,
    donations,
    donors: [
      anonDonor,
      namedDonor,
      emptyPrefsDonor,
      nullPrefsDonor,
      missingPrefsDonor,
    ],
    tasks,
    posts: [],
  } as Parameters<typeof buildMissionaryPortalSnapshot>[0]);

  function expectRedactedRelationship(id: string) {
    const relationship = snap.donorRelationships.find((d) => d.id === id);
    expect(relationship?.displayName).toBe("Anonymous donor");
    expect(relationship?.email).toBeNull();
    expect(relationship?.phone).toBeNull();
    expect(relationship?.avatarUrl).toBeNull();
    expect(relationship?.location).toBeNull();
    expect(relationship?.tags).toEqual([]);
  }

  it("redacts anonymous donor relationships but keeps the named one", () => {
    expectRedactedRelationship("donor-A");
    expectRedactedRelationship("donor-D");
    expectRedactedRelationship("donor-E");
    expectRedactedRelationship("donor-F");

    const b = snap.donorRelationships.find((d) => d.id === "donor-B");
    expect(b?.displayName).toBe("Blaise Pascal");
    expect(b?.email).toBe("blaise@example.com");
  });

  it("nulls donorId on anonymous donor gifts, keeps the named donor's", () => {
    expect(snap.recentGifts.find((g) => g.id === "gift-A")?.donorId).toBeNull();
    expect(snap.recentGifts.find((g) => g.id === "gift-D")?.donorId).toBeNull();
    expect(snap.recentGifts.find((g) => g.id === "gift-E")?.donorId).toBeNull();
    expect(snap.recentGifts.find((g) => g.id === "gift-F")?.donorId).toBeNull();
    expect(snap.recentGifts.find((g) => g.id === "gift-B")?.donorId).toBe(
      "donor-B",
    );
  });

  it("leaks NO raw identity of the anonymous donor anywhere in the snapshot", () => {
    const s = JSON.stringify(snap);
    expect(s).not.toContain("Ada");
    expect(s).not.toContain("ada@example.com");
    expect(s).not.toContain("555-0100");
    expect(s).not.toContain("Chiang Mai");
    expect(s).not.toContain("Clara Empty");
    expect(s).not.toContain("clara.empty@example.com");
    expect(s).not.toContain("555-0300");
    expect(s).not.toContain("Lisbon");
    expect(s).not.toContain("empty-prefs-tag");
    expect(s).not.toContain("Null Prefs");
    expect(s).not.toContain("null.prefs@example.com");
    expect(s).not.toContain("555-0400");
    expect(s).not.toContain("Oslo");
    expect(s).not.toContain("null-prefs-tag");
    expect(s).not.toContain("Missing Prefs");
    expect(s).not.toContain("missing.prefs@example.com");
    expect(s).not.toContain("555-0500");
    expect(s).not.toContain("Quito");
    expect(s).not.toContain("missing-prefs-tag");
    // named donor is fine to appear
    expect(s).toContain("Blaise Pascal");
  });
});

describe("mapMissionaryTask redaction (also covers standalone task endpoints)", () => {
  it("redacts the joined donor when that donor is anonymous", () => {
    const t = mapMissionaryTask(
      tasks[0] as Parameters<typeof mapMissionaryTask>[0],
    );
    expect(t.donor?.name).toBe("Anonymous donor");
    expect(t.donor?.email).toBeNull();
    expect(JSON.stringify(t)).not.toContain("ada@example.com");
  });

  it("redacts joined donors when giving_preferences are empty, null, or missing", () => {
    for (const id of ["task-D", "task-E", "task-F"]) {
      const task = tasks.find((candidate) => candidate.id === id)!;
      const mapped = mapMissionaryTask(
        task as Parameters<typeof mapMissionaryTask>[0],
      );
      expect(mapped.donor?.name).toBe("Anonymous donor");
      expect(mapped.donor?.email).toBeNull();
      expect(mapped.donor?.avatar_url).toBeNull();
    }
  });
});
