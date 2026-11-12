import { describe, expect, it } from "vitest";

import { buildMissionaryDonorRows } from "../../../../../packages/api/src/missionary-portal/donors";
import {
  buildMissionaryPortalSnapshot,
  monthlyCommittedCents,
  type MissionaryPortalPledgeRow,
} from "../../../../../packages/api/src/missionary-portal/model";

const pledge = (
  currency: string | null,
  donor_id = "partner",
): MissionaryPortalPledgeRow => ({
  donor_id,
  amount: 1000,
  frequency: "monthly",
  status: "active",
  currency,
});

const input = {
  profile: {
    id: "profile",
    email: null,
    first_name: null,
    last_name: null,
    full_name: null,
    display_name: null,
    phone: null,
    avatar_url: null,
  },
  missionary: {
    id: "missionary",
    tenant_id: "tenant",
    profile_id: "profile",
    bio: null,
    mission_field: null,
    funding_goal: 100000,
    current_funding: 50000,
    tagline: null,
    location: null,
    phone: null,
    timezone: null,
    region: null,
    cover_url: null,
    social_links: null,
  },
  donors: [],
  tasks: [],
  posts: [],
};

describe("missionary currency projections", () => {
  it("keeps known gift currencies and contains unqualified funding rollups", () => {
    const snapshot = buildMissionaryPortalSnapshot({
      ...input,
      donations: [
        {
          id: "gift",
          donor_id: null,
          amount: 1000,
          currency: "jpy",
          status: "completed",
          donation_type: "one_time",
          is_recurring: false,
          gift_date: "2026-11-01",
          created_at: null,
        },
      ],
      pledges: [pledge("JPY")],
    });
    expect(snapshot.recentGifts[0]).toMatchObject({
      amountCents: 1000,
      currency: "JPY",
    });
    expect(snapshot.support).toMatchObject({
      goalCents: null,
      raisedCents: null,
      percentFunded: null,
      recurringMonthlyCents: 1000,
      recurringCurrency: "JPY",
      monthlyPartnerCount: 1,
    });
  });

  it("never sums unlike or missing commitment currencies", () => {
    expect(
      monthlyCommittedCents([pledge("JPY"), pledge("USD", "other")]),
    ).toBeNull();
    expect(monthlyCommittedCents([pledge(null)])).toBeNull();
    expect(monthlyCommittedCents([pledge("ZZZ")])).toBeNull();
    expect(monthlyCommittedCents([pledge("usd"), pledge("USD", "other")])).toBe(
      2000,
    );
  });

  it("preserves unknown gifts as unknown instead of defaulting to USD", () => {
    const snapshot = buildMissionaryPortalSnapshot({
      ...input,
      donations: [
        {
          id: "gift",
          donor_id: null,
          amount: 1000,
          currency: null,
          status: "completed",
          donation_type: "one_time",
          is_recurring: false,
          gift_date: "2026-11-01",
          created_at: null,
        },
      ],
    });
    expect(snapshot.recentGifts[0]?.currency).toBeNull();
  });

  it("does not label donor lifetime, last-gift or activity scalars as money", () => {
    const [donor] = buildMissionaryDonorRows({
      missionaryProfileId: "profile",
      donors: [
        {
          id: "partner",
          missionary_id: "profile",
          total_given: 50000,
          last_gift_amount: 1000,
          giving_preferences: { defaultAnonymousToRecipient: false },
        },
      ],
      activities: [],
      pledges: [
        {
          id: "pledge",
          donor_id: "partner",
          amount: 1234,
          currency: "BHD",
          created_at: "2026-11-01",
          total_paid: 1234,
          total_expected: 2468,
        },
      ],
    });
    expect(donor).toMatchObject({ total_given: null, last_gift_amount: null });
    expect(donor?.recurring_donations[0]).toMatchObject({
      amount: 1234,
      currency: "BHD",
    });
  });
});
