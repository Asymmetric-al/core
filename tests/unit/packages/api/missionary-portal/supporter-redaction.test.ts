import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as followers from "../../../../../packages/api/src/follower-requests";
import * as follower from "../../../../../packages/api/src/follower-requests/request";
import { redactAnonymousGiftDonors } from "../../../../../packages/api/src/missionaries/metrics";
import { buildMissionaryDonorRows } from "../../../../../packages/api/src/missionary-portal/donors";
import {
  buildMissionaryPortalSnapshot,
  mapMissionaryTask,
} from "../../../../../packages/api/src/missionary-portal/model";
import { membershipsForRole } from "../../../../fixtures/auth-memberships";

import type * as AuthModule from "../../../../../packages/auth/context";

const fake = vi.hoisted(() => ({
  rows: [] as unknown[],
  row: null as unknown,
}));
const tenant = "00000000-0000-4000-8000-0000000000a1";
const caller = "00000000-0000-4000-8000-0000000000a2";
const assignment = "00000000-0000-4000-8000-0000000000a3";
const requestId = "00000000-0000-4000-8000-0000000000a4";

function chain(result: () => { data: unknown; error: null }) {
  const query = {
    select: () => query,
    eq: () => query,
    order: () => query,
    maybeSingle: async () => result(),
    then: (resolve: (value: unknown) => unknown) => resolve(result()),
  };
  return query;
}

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({
    client: {
      rpc: (name: string) =>
        chain(() => ({
          data:
            name === "missionary_follower_request_write" ? fake.row : fake.rows,
          error: null,
        })),
    },
    error: null,
  }),
}));
vi.mock("@asym/auth/context", async (importOriginal) => ({
  ...(await importOriginal<typeof AuthModule>()),
  getAuthContext: async () => ({
    userId: caller,
    profileId: caller,
    tenantId: tenant,
    isAuthenticated: true,
    role: "missionary",
    memberships: membershipsForRole("missionary", tenant),
    assignment: {
      assignmentId: assignment,
      membershipRole: "missionary",
      tenantId: tenant,
      userId: caller,
    },
  }),
}));

const ROOK = "donor-rook";
const SAGE = "donor-sage";
const FORBIDDEN = [
  "Donor Rook",
  "rook@example.test",
  "+1-555-0177",
  "+1-555-0178",
  "+1-555-0179",
  "1 Rook Lane",
  "Rookton",
  "https://example.test/rook.png",
  "https://rook.example.test",
  "Rook Org",
  "Rook Title",
  "1970-01-01",
  "1990-02-02",
  "Spouse Rook",
  "Note Rook",
  "tag-rook",
  "Call Rook",
];
const notShown = (value: unknown) => {
  const body = JSON.stringify(value).toLowerCase();
  for (const text of FORBIDDEN) expect(body).not.toContain(text.toLowerCase());
};

const rookDonor = {
  id: ROOK,
  missionary_id: caller,
  name: "Donor Rook",
  email: "rook@example.test",
  phone: "+1-555-0177",
  mobile: "+1-555-0178",
  work_phone: "+1-555-0179",
  preferred_contact: "phone",
  avatar_url: "https://example.test/rook.png",
  location: "Rookton",
  address: { street: "1 Rook Lane", city: "Rookton" },
  work_address: { street: "1 Rook Lane", city: "Rookton" },
  website: "https://rook.example.test",
  organization: "Rook Org",
  title: "Rook Title",
  type: "Individual",
  status: "Active",
  total_given: 3333,
  last_gift_date: "2026-11-01",
  last_gift_amount: 2222,
  gift_count: 2,
  frequency: "Monthly",
  joined_date: "2026-01-05",
  created_at: "2026-01-05",
  birthday: "1970-01-01",
  anniversary: "1990-02-02",
  spouse: "Spouse Rook",
  notes: "Note Rook",
  tags: ["tag-rook"],
  score: 7,
  has_active_pledge: true,
  giving_preferences: { defaultAnonymousToRecipient: false },
  donor_is_restricted_party: true as unknown,
};
const sageDonor = {
  ...rookDonor,
  id: SAGE,
  name: "Donor Sage",
  email: "sage@example.test",
  phone: "+1-555-0199",
  mobile: null,
  work_phone: null,
  avatar_url: null,
  location: "Sageville",
  address: { street: "3 Sage Way", city: "Sageville" },
  work_address: null,
  website: null,
  organization: null,
  title: null,
  birthday: null,
  anniversary: null,
  spouse: null,
  notes: "Note Sage",
  tags: ["tag-sage"],
  donor_is_restricted_party: false as unknown,
};
const { donor_is_restricted_party: _missingFact, ...rookWithoutFact } =
  rookDonor;
const activities = [
  {
    id: "act-rook",
    donor_id: ROOK,
    type: "call",
    date: "2026-11-02",
    created_at: "2026-11-02",
    title: "Call Rook",
    note: "Note Rook",
  },
  {
    id: "act-sage",
    donor_id: SAGE,
    type: "note",
    date: "2026-11-02",
    created_at: "2026-11-02",
    title: "Thanked",
    note: "Note Sage",
  },
];
const pledges = [
  {
    id: "pledge-rook",
    donor_id: ROOK,
    amount: 1500,
    currency: "usd",
    frequency: "monthly",
    status: "active",
    start_date: "2026-02-01",
    created_at: "2026-02-01",
    total_paid: 0,
    total_expected: 0,
  },
];

describe("AL-2678 WP5 part 2-r2s, D2: the Partners row of a restricted person is an anonymous partner", () => {
  const build = (donor: Record<string, unknown>) =>
    buildMissionaryDonorRows({
      missionaryProfileId: caller,
      donors: [donor as never, sageDonor as never],
      activities,
      pledges,
    });

  it.each([
    ["true", rookDonor],
    ["null", { ...rookDonor, donor_is_restricted_party: null }],
    ["missing", rookWithoutFact],
  ])(
    "a donor whose fact is %s is hidden field by field; the stats stay",
    (_label, donor) => {
      const rows = build(donor);
      const rook = rows.find((row) => row.id === ROOK)!;
      expect(rook).toEqual({
        id: ROOK,
        type: "Individual",
        status: "Active",
        total_given: null,
        last_gift_date: "2026-11-01",
        last_gift_amount: null,
        frequency: "Monthly",
        score: 7,
        joined_date: "2026-01-05",
        has_active_pledge: true,
        name: "Anonymous partner",
        initials: "AP",
        email: "",
        phone: "",
        mobile: undefined,
        work_phone: undefined,
        preferred_contact: "email",
        avatar_url: undefined,
        location: "",
        address: {},
        work_address: undefined,
        website: undefined,
        organization: undefined,
        title: undefined,
        birthday: undefined,
        anniversary: undefined,
        spouse: undefined,
        notes: undefined,
        tags: [],
        activities: [],
        recurring_donations: [],
        is_anonymous: true,
      });
      notShown(rook);
    },
  );

  it("a donor whose fact is false and who chose to be named is shown by name", () => {
    const sage = build(rookDonor).find((row) => row.id === SAGE)!;
    expect(sage.name).toBe("Donor Sage");
    expect(sage.email).toBe("sage@example.test");
    expect(sage.is_anonymous).toBe(false);
    expect(sage.activities.map((a) => a.id)).toEqual(["act-sage"]);
  });
});

const profile = {
  id: caller,
  email: "cole@example.test",
  first_name: "Cole",
  last_name: "Worker",
  full_name: null,
  display_name: null,
  phone: null,
  avatar_url: null,
};
const missionary = {
  id: "assignment-cole",
  tenant_id: tenant,
  profile_id: caller,
  bio: null,
  mission_field: null,
  funding_goal: null,
  current_funding: null,
  tagline: null,
  location: null,
  phone: null,
  timezone: null,
  region: null,
  cover_url: null,
  social_links: null,
};
const gift = (id: string, donorId: string | null, amount: number) => ({
  id,
  donor_id: donorId,
  amount,
  currency: "usd",
  status: "completed",
  donation_type: "one_time",
  is_recurring: false,
  gift_date: "2026-11-03",
  created_at: "2026-11-03",
});
const taskFor = (id: string, donor: Record<string, unknown> | null) => ({
  id,
  missionary_id: caller,
  donor_id: (donor?.id as string | undefined) ?? null,
  title: "Follow up",
  description: null,
  task_type: "call",
  status: "not_started",
  priority: "none",
  sort_key: 1,
  due_date: null,
  completed_at: null,
  created_at: "2026-11-03",
  updated_at: "2026-11-03",
  donor: donor as never,
});
const embedOf = (donor: typeof rookDonor | typeof sageDonor) => ({
  id: donor.id,
  name: donor.name,
  email: donor.email,
  avatar_url: donor.avatar_url,
  giving_preferences: donor.giving_preferences,
  donor_is_restricted_party: donor.donor_is_restricted_party,
});

describe("AL-2678 WP5 part 2-r2s, D3 and D4: the portal snapshot and the tasks", () => {
  const snapshot = () =>
    buildMissionaryPortalSnapshot({
      profile,
      missionary,
      donations: [
        gift("gift-rook-1", ROOK, 1111),
        gift("gift-rook-2", ROOK, 2222),
        gift("gift-sage", SAGE, 3333),
        gift("gift-unread", "donor-not-read", 4444),
      ],
      donors: [rookDonor as never, sageDonor as never],
      tasks: [
        taskFor("task-rook", embedOf(rookDonor)),
        taskFor("task-sage", embedOf(sageDonor)),
      ],
      posts: [],
    });

  it("a restricted donor's relationship is an anonymous partner; the stats stay", () => {
    const rook = snapshot().donorRelationships.find((d) => d.id === ROOK)!;
    expect(rook).toMatchObject({
      displayName: "Anonymous partner",
      email: null,
      phone: null,
      avatarUrl: null,
      location: null,
      preferredContact: "anonymous",
      tags: [],
      status: "Active",
      lastGiftAt: "2026-11-01",
      giftCount: 2,
      frequency: "Monthly",
      totalGivenCents: null,
      lastGiftAmountCents: null,
    });
    notShown(rook);
  });

  it("a gift keeps its donor id only when its donor was read and is shown (Q1): amounts and dates stay", () => {
    const gifts = snapshot().recentGifts;
    expect(
      gifts.map(({ id, donorId, amountCents, date }) => ({
        id,
        donorId,
        amountCents,
        date,
      })),
    ).toEqual([
      {
        id: "gift-rook-1",
        donorId: null,
        amountCents: 1111,
        date: "2026-11-03",
      },
      {
        id: "gift-rook-2",
        donorId: null,
        amountCents: 2222,
        date: "2026-11-03",
      },
      { id: "gift-sage", donorId: SAGE, amountCents: 3333, date: "2026-11-03" },
      {
        id: "gift-unread",
        donorId: null,
        amountCents: 4444,
        date: "2026-11-03",
      },
    ]);
  });

  it("a task keeps the donor id and hides the restricted donor's name, e-mail and photo", () => {
    const tasks = snapshot().tasks;
    expect(tasks.find((t) => t.id === "task-rook")!.donor).toEqual({
      id: ROOK,
      name: "Anonymous partner",
      email: null,
      avatar_url: null,
    });
    expect(tasks.find((t) => t.id === "task-sage")!.donor).toEqual({
      id: SAGE,
      name: "Donor Sage",
      email: "sage@example.test",
      avatar_url: null,
    });
    notShown(snapshot());
  });

  it.each([
    ["true", true],
    ["null", null],
    ["missing", undefined],
  ])("mapMissionaryTask hides a donor whose fact is %s", (_label, fact) => {
    const donor: Record<string, unknown> = embedOf(rookDonor);
    if (fact === undefined) delete donor.donor_is_restricted_party;
    else donor.donor_is_restricted_party = fact;
    expect(mapMissionaryTask(taskFor("task-rook", donor)).donor).toEqual({
      id: ROOK,
      name: "Anonymous partner",
      email: null,
      avatar_url: null,
    });
  });
});

describe("AL-2678 WP5 part 2-r2s, D7: a metrics gift keeps its donor id only for a shown donor", () => {
  it("nulls the restricted donor's id, keeps the shown donor's and every amount", () => {
    const gifts = [
      { id: "g1", donor_id: ROOK, amount: 1111 },
      { id: "g2", donor_id: SAGE, amount: 3333 },
    ];
    const donors = [
      {
        id: ROOK,
        giving_preferences: { defaultAnonymousToRecipient: false },
        donor_is_restricted_party: true,
      },
      {
        id: SAGE,
        giving_preferences: { defaultAnonymousToRecipient: false },
        donor_is_restricted_party: false,
      },
    ];
    expect(redactAnonymousGiftDonors(gifts, donors as never)).toEqual([
      { id: "g1", donor_id: null, amount: 1111 },
      { id: "g2", donor_id: SAGE, amount: 3333 },
    ]);
  });

  it("a donor row read without the fact hides the gift's donor", () => {
    expect(
      redactAnonymousGiftDonors([{ id: "g1", donor_id: SAGE }], [
        {
          id: SAGE,
          giving_preferences: { defaultAnonymousToRecipient: false },
        },
      ] as never),
    ).toEqual([{ id: "g1", donor_id: null }]);
  });
});

const followerEmbed = (donor: typeof rookDonor | typeof sageDonor) => ({
  id: donor.id,
  name: donor.name,
  avatar_url: donor.avatar_url ?? "https://example.test/sage.png",
  status: "active",
  total_given: 3333,
  last_gift_date: "2026-11-01",
  giving_preferences: donor.giving_preferences,
  donor_is_restricted_party: donor.donor_is_restricted_party,
});
const followerRow = (
  id: string,
  donor: typeof rookDonor | typeof sageDonor,
  wrap: boolean,
) => ({
  id,
  donor_id: donor.id,
  status: "pending",
  access_level: "view",
  created_at: "2026-11-04",
  updated_at: "2026-11-04",
  donor: wrap ? [followerEmbed(donor)] : followerEmbed(donor),
});
const get = () =>
  followers.GET(
    new NextRequest("https://app.test/api/follower-requests?status=pending"),
  );
const approve = () =>
  follower.PATCH(
    new NextRequest("https://app.test/api/follower-requests/" + requestId, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: "approved", access_level: "view" }),
    }),
    { params: Promise.resolve({ requestId }) },
  );

describe("AL-2678 WP5 part 2-r2s, D5: follower requests", () => {
  beforeEach(() => {
    fake.rows = [];
    fake.row = null;
  });

  it.each([
    ["an object", false],
    ["an array", true],
  ])(
    "GET hides a restricted donor whose embed is %s: no id, the label, AP, no photo",
    async (_label, wrap) => {
      fake.rows = [
        followerRow("req-rook", rookDonor, wrap),
        followerRow("req-sage", sageDonor, wrap),
      ];
      const response = await get();
      const body = (await response.json()) as {
        requests: Record<string, unknown>[];
      };
      expect(response.status).toBe(200);
      expect(body.requests.find((r) => r.id === "req-rook")).toEqual({
        id: "req-rook",
        donor_id: null,
        name: "Anonymous partner",
        avatar_url: null,
        is_donor: true,
        access_level: "view",
        status: "pending",
        created_at: "2026-11-04",
        initials: "AP",
      });
      expect(body.requests.find((r) => r.id === "req-sage")).toMatchObject({
        donor_id: SAGE,
        name: "Donor Sage",
        initials: "DS",
      });
      notShown(body);
    },
  );

  it("GET hides a donor whose embed lacks the fact", async () => {
    const row = followerRow("req-sage", sageDonor, false);
    const { donor_is_restricted_party: _gone, ...embed } = row.donor as Record<
      string,
      unknown
    >;
    fake.rows = [{ ...row, donor: embed }];
    const body = (await (await get()).json()) as {
      requests: Record<string, unknown>[];
    };
    expect(body.requests[0]).toMatchObject({
      donor_id: null,
      name: "Anonymous partner",
      avatar_url: null,
      initials: "AP",
    });
  });

  it.each([
    ["an object", false],
    ["an array", true],
  ])(
    "PATCH answers a restricted donor's request with no donor (embed as %s)",
    async (_label, wrap) => {
      fake.row = {
        ...followerRow("req-rook", rookDonor, wrap),
        status: "approved",
      };
      const response = await approve();
      const body = (await response.json()) as {
        request: Record<string, unknown>;
      };
      expect(response.status).toBe(200);
      expect(body.request).toEqual({
        id: "req-rook",
        donor_id: null,
        status: "approved",
        access_level: "view",
        created_at: "2026-11-04",
        updated_at: "2026-11-04",
        donor: null,
        name: "Anonymous partner",
        initials: "AP",
      });
      notShown(body);
    },
  );

  it("PATCH answers a shown donor's request with the donor's id, name and photo only (fix 7)", async () => {
    fake.row = {
      ...followerRow("req-sage", sageDonor, true),
      status: "approved",
    };
    const body = (await (await approve()).json()) as {
      request: Record<string, unknown>;
    };
    expect(body.request).toEqual({
      id: "req-sage",
      donor_id: SAGE,
      status: "approved",
      access_level: "view",
      created_at: "2026-11-04",
      updated_at: "2026-11-04",
      donor: {
        id: SAGE,
        name: "Donor Sage",
        avatar_url: "https://example.test/sage.png",
      },
      name: "Donor Sage",
      initials: "DS",
    });
  });
});
