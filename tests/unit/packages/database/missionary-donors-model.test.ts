import {
  buildMissionaryDonorRows,
  type BuildMissionaryDonorRowsInput,
} from "@asym/database/hooks/missionary-donors-model";
import { describe, expect, it } from "vitest";

type DonorRow = BuildMissionaryDonorRowsInput["donors"][number];
type PledgeRow = BuildMissionaryDonorRowsInput["pledges"][number];
type ActivityRow = BuildMissionaryDonorRowsInput["activities"][number];

const TENANT_ID = "00000000-0000-0000-0000-000000000001";
const CREATED_AT = "2026-01-01T00:00:00Z";

// The ID-namespace split this model has to bridge (see supabase/seed.sql):
//  - donors.missionary_id stores a PROFILE id (FK -> profiles.id), and the
//    missionary app calls the hook with profile.id.
//  - donor_pledges.missionary_id stores a MISSIONARIES.id (FK -> missionaries.id),
//    which is a different value than the profile id.
const MISSIONARY_PROFILE_ID = "11111111-1111-1111-1111-111111111111";
const OTHER_MISSIONARY_PROFILE_ID = "99999999-9999-9999-9999-999999999999";
const MISSIONARIES_ROW_ID = "20000000-0000-0000-0000-000000000001";

function makeDonor(overrides: Partial<DonorRow> = {}): DonorRow {
  return {
    id: "30000000-0000-0000-0000-000000000001",
    tenant_id: TENANT_ID,
    profile_id: null,
    missionary_id: MISSIONARY_PROFILE_ID,
    name: "Avery Lopez",
    email: "avery.lopez@partners.test",
    phone: null,
    mobile: null,
    work_phone: null,
    preferred_contact: "email",
    avatar_url: null,
    location: "Austin, TX",
    type: "individual",
    status: "active",
    giving_preferences: {},
    total_given: 0,
    first_gift_date: null,
    last_gift_date: null,
    last_gift_amount: null,
    gift_count: 0,
    frequency: "monthly",
    joined_date: null,
    tags: [],
    score: 0,
    address: {},
    work_address: null,
    website: null,
    organization: null,
    title: null,
    birthday: null,
    anniversary: null,
    spouse: null,
    notes: null,
    do_not_contact: false,
    do_not_email: false,
    receipt_email_frequency: "monthly",
    default_update_frequency: null,
    preferred_language: "en",
    has_active_pledge: false,
    stripe_customer_id: null,
    created_at: CREATED_AT,
    updated_at: CREATED_AT,
    ...overrides,
  };
}

function makePledge(overrides: Partial<PledgeRow> = {}): PledgeRow {
  return {
    id: "60000000-0000-0000-0000-000000000001",
    tenant_id: TENANT_ID,
    donor_id: "30000000-0000-0000-0000-000000000001",
    // Deliberately the missionaries.id, NOT the profile id — this is what the
    // seed inserts and what previously broke the recurring-donations list.
    missionary_id: MISSIONARIES_ROW_ID,
    fund_id: null,
    amount: 3000,
    currency: "usd",
    frequency: "monthly",
    status: "active",
    start_date: "2025-10-01",
    end_date: null,
    next_payment_date: "2026-03-01",
    stripe_subscription_id: null,
    billing_day_of_month: null,
    billing_timezone: null,
    stripe_payment_method_id: null,
    retry_count: 0,
    last_charge_at: null,
    last_charge_attempt: null,
    failed_charge_count: 0,
    pause_reason: null,
    paused_at: null,
    next_charge_at: null,
    total_paid: 300,
    total_expected: 1200,
    payments_completed: 1,
    payments_remaining: 11,
    payment_method: "card",
    created_at: CREATED_AT,
    updated_at: CREATED_AT,
    ...overrides,
  };
}

function makeActivity(overrides: Partial<ActivityRow> = {}): ActivityRow {
  return {
    id: "activity-1",
    donor_id: "30000000-0000-0000-0000-000000000001",
    type: "gift",
    title: "Online gift",
    description: null,
    date: "2026-01-10",
    amount: 100,
    status: "completed",
    gift_type: "Online",
    note: null,
    created_at: CREATED_AT,
    updated_at: CREATED_AT,
    ...overrides,
  };
}

describe("buildMissionaryDonorRows", () => {
  it("attaches a pledge to its donor even though pledge.missionary_id is a missionaries.id, not the profile id", () => {
    const donor = makeDonor({ missionary_id: MISSIONARY_PROFILE_ID });
    const pledge = makePledge({
      donor_id: donor.id,
      missionary_id: MISSIONARIES_ROW_ID,
    });

    const rows = buildMissionaryDonorRows({
      missionaryId: MISSIONARY_PROFILE_ID,
      donors: [donor],
      activities: [],
      pledges: [pledge],
    });

    expect(rows).toHaveLength(1);
    expect(rows[0].recurring_donations).toHaveLength(1);
    expect(rows[0].recurring_donations[0]).toMatchObject({
      id: pledge.id,
      amount: 3000,
      frequency: "Monthly",
      status: "active",
    });
  });

  it("does not leak a pledge whose donor belongs to a different missionary", () => {
    const myDonor = makeDonor({
      id: "30000000-0000-0000-0000-000000000001",
      missionary_id: MISSIONARY_PROFILE_ID,
    });
    const otherDonor = makeDonor({
      id: "30000000-0000-0000-0000-000000000002",
      missionary_id: OTHER_MISSIONARY_PROFILE_ID,
    });
    const otherPledge = makePledge({
      id: "60000000-0000-0000-0000-000000000002",
      donor_id: otherDonor.id,
      missionary_id: MISSIONARIES_ROW_ID,
    });

    const rows = buildMissionaryDonorRows({
      missionaryId: MISSIONARY_PROFILE_ID,
      donors: [myDonor, otherDonor],
      activities: [],
      pledges: [otherPledge],
    });

    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe(myDonor.id);
    expect(rows[0].recurring_donations).toHaveLength(0);
  });

  it("scopes activities through donor_id the same way", () => {
    const donor = makeDonor({ missionary_id: MISSIONARY_PROFILE_ID });
    const activity = makeActivity({ donor_id: donor.id });

    const rows = buildMissionaryDonorRows({
      missionaryId: MISSIONARY_PROFILE_ID,
      donors: [donor],
      activities: [activity],
      pledges: [],
    });

    expect(rows[0].activities).toHaveLength(1);
    expect(rows[0].activities[0]).toMatchObject({
      id: activity.id,
      type: "gift",
    });
  });

  it("does not leak an activity whose donor belongs to a different missionary", () => {
    const myDonor = makeDonor({
      id: "30000000-0000-0000-0000-000000000001",
      missionary_id: MISSIONARY_PROFILE_ID,
    });
    const otherDonor = makeDonor({
      id: "30000000-0000-0000-0000-000000000002",
      missionary_id: OTHER_MISSIONARY_PROFILE_ID,
    });
    const otherActivity = makeActivity({
      id: "activity-other",
      donor_id: otherDonor.id,
    });

    const rows = buildMissionaryDonorRows({
      missionaryId: MISSIONARY_PROFILE_ID,
      donors: [myDonor, otherDonor],
      activities: [otherActivity],
      pledges: [],
    });

    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe(myDonor.id);
    expect(rows[0].activities).toHaveLength(0);
  });

  it("returns no rows when the missionary id is missing", () => {
    const donor = makeDonor();
    const pledge = makePledge({ donor_id: donor.id });

    expect(
      buildMissionaryDonorRows({
        missionaryId: null,
        donors: [donor],
        activities: [],
        pledges: [pledge],
      }),
    ).toEqual([]);
  });

  it("normalizes lowercase donor row enums to presentation-case types and statuses", () => {
    const donor = makeDonor({
      missionary_id: MISSIONARY_PROFILE_ID,
      type: "church",
      status: "at_risk",
    });

    const rows = buildMissionaryDonorRows({
      missionaryId: MISSIONARY_PROFILE_ID,
      donors: [donor],
      activities: [],
      pledges: [],
    });

    expect(rows[0]).toMatchObject({
      type: "Church",
      status: "At Risk",
    });
  });

  it("normalizes lowercase failed activity status for the UI", () => {
    const donor = makeDonor({ missionary_id: MISSIONARY_PROFILE_ID });
    const activity = makeActivity({
      donor_id: donor.id,
      status: "failed",
    });

    const rows = buildMissionaryDonorRows({
      missionaryId: MISSIONARY_PROFILE_ID,
      donors: [donor],
      activities: [activity],
      pledges: [],
    });

    expect(rows[0].activities[0].status).toBe("Failed");
  });

  it.each([
    ["organization", "Organization"],
    ["foundation", "Organization"],
  ] as const)("normalizes donor type %s to %s", (type, expected) => {
    const donor = makeDonor({
      missionary_id: MISSIONARY_PROFILE_ID,
      type,
    });

    const rows = buildMissionaryDonorRows({
      missionaryId: MISSIONARY_PROFILE_ID,
      donors: [donor],
      activities: [],
      pledges: [],
    });

    expect(rows[0].type).toBe(expected);
  });

  it("normalizes lowercase pledge frequency for monthly pledge math", () => {
    const donor = makeDonor({ missionary_id: MISSIONARY_PROFILE_ID });
    const pledge = makePledge({
      donor_id: donor.id,
      frequency: "quarterly",
    });

    const rows = buildMissionaryDonorRows({
      missionaryId: MISSIONARY_PROFILE_ID,
      donors: [donor],
      activities: [],
      pledges: [pledge],
    });

    expect(rows[0].recurring_donations[0].frequency).toBe("Quarterly");
  });

  it("normalizes lowercase online gift type", () => {
    const donor = makeDonor({ missionary_id: MISSIONARY_PROFILE_ID });
    const activity = makeActivity({
      donor_id: donor.id,
      gift_type: "online",
    });

    const rows = buildMissionaryDonorRows({
      missionaryId: MISSIONARY_PROFILE_ID,
      donors: [donor],
      activities: [activity],
      pledges: [],
    });

    expect(rows[0].activities[0].gift_type).toBe("Online");
  });

  it("normalizes done activity status to Completed", () => {
    const donor = makeDonor({ missionary_id: MISSIONARY_PROFILE_ID });
    const activity = makeActivity({
      donor_id: donor.id,
      status: "done",
    });

    const rows = buildMissionaryDonorRows({
      missionaryId: MISSIONARY_PROFILE_ID,
      donors: [donor],
      activities: [activity],
      pledges: [],
    });

    expect(rows[0].activities[0].status).toBe("Completed");
  });
});
