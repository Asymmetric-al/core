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
];

describe("buildMissionaryPortalSnapshot redaction", () => {
  const snap = buildMissionaryPortalSnapshot({
    profile,
    missionary,
    donations,
    donors: [anonDonor, namedDonor],
    tasks,
    posts: [],
  } as Parameters<typeof buildMissionaryPortalSnapshot>[0]);

  it("redacts the anonymous donor relationship but keeps the named one", () => {
    const a = snap.donorRelationships.find((d) => d.id === "donor-A");
    const b = snap.donorRelationships.find((d) => d.id === "donor-B");
    expect(a?.displayName).toBe("Anonymous donor");
    expect(a?.email).toBeNull();
    expect(a?.phone).toBeNull();
    expect(b?.displayName).toBe("Blaise Pascal");
    expect(b?.email).toBe("blaise@example.com");
  });

  it("nulls donorId on the anonymous donor's gift, keeps the named donor's", () => {
    expect(snap.recentGifts.find((g) => g.id === "gift-A")?.donorId).toBeNull();
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
});
