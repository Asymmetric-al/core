import { describe, expect, it } from "vitest";

import {
  buildMissionaryPortalSnapshot,
  mapMissionaryTask,
  monthlyCommittedCents,
} from "../../../../../packages/api/src/missionary-portal/model";

describe("missionary portal model", () => {
  it("returns support context without staff-only donor fields", () => {
    const snapshot = buildMissionaryPortalSnapshot({
      profile: {
        id: "profile-1",
        email: "missionary@example.com",
        first_name: "Jane",
        last_name: "Missionary",
        full_name: "Jane Missionary",
        display_name: null,
        phone: null,
        avatar_url: null,
      },
      missionary: {
        id: "missionary-1",
        tenant_id: "tenant-1",
        profile_id: "profile-1",
        bio: "Serving locally.",
        mission_field: "Training",
        funding_goal: 600_000,
        current_funding: 450_000,
        tagline: "Equipping leaders",
        location: "Chiang Mai",
        phone: "+15555550100",
        timezone: "Asia/Bangkok",
        region: "SE Asia",
        cover_url: "https://example.com/cover.png",
        social_links: { website: "https://example.com" },
      },
      donations: [
        {
          id: "gift-1",
          donor_id: "donor-1",
          amount: 20_000,
          currency: "usd",
          status: "completed",
          donation_type: "recurring",
          is_recurring: true,
          gift_date: "2026-05-01T00:00:00.000Z",
          created_at: "2026-05-01T00:00:00.000Z",
        },
        {
          id: "gift-2",
          donor_id: "donor-1",
          amount: 30_000,
          currency: "usd",
          status: "failed",
          donation_type: "one_time",
          is_recurring: false,
          gift_date: "2026-05-03T00:00:00.000Z",
          created_at: "2026-05-03T00:00:00.000Z",
        },
      ],
      donors: [
        {
          id: "donor-1",
          name: "Support Partner",
          email: "partner@example.com",
          phone: "+15555550101",
          mobile: null,
          preferred_contact: "phone",
          avatar_url: null,
          location: "Austin",
          status: "active",
          total_given: 100_000,
          last_gift_date: "2026-05-01T00:00:00.000Z",
          last_gift_amount: 20_000,
          gift_count: 5,
          frequency: "monthly",
          tags: ["church"],
          has_active_pledge: true,
          giving_preferences: { defaultAnonymousToRecipient: false },
        },
        {
          id: "donor-2",
          name: "Quarterly Partner",
          email: "quarterly@example.com",
          phone: null,
          mobile: null,
          preferred_contact: "email",
          avatar_url: null,
          location: null,
          status: "lapsed",
          total_given: 30_000,
          last_gift_date: "2026-01-01T00:00:00.000Z",
          last_gift_amount: 30_000,
          gift_count: 1,
          frequency: "quarterly",
          tags: [],
          has_active_pledge: true,
          giving_preferences: { defaultAnonymousToRecipient: false },
        },
      ],
      // Monthly support counts each partner's active commitment once,
      // normalised to a month (as the Partners page does).
      pledges: [
        {
          donor_id: "donor-1",
          amount: 20_000,
          currency: "USD",
          frequency: "monthly",
          status: "active",
        },
        {
          donor_id: "donor-1",
          amount: 9_000,
          currency: "USD",
          frequency: "monthly",
          status: "active",
        },
        {
          donor_id: "donor-2",
          amount: 30_000,
          currency: "USD",
          frequency: "quarterly",
          status: "active",
        },
        {
          donor_id: "donor-2",
          amount: 50_000,
          currency: "USD",
          frequency: "monthly",
          status: "cancelled",
        },
      ],
      tasks: [
        {
          id: "task-1",
          missionary_id: "profile-1",
          donor_id: "donor-1",
          title: "Call partner",
          description: "Follow up after gift.",
          task_type: "call",
          status: "not_started",
          priority: "high",
          sort_key: 10,
          due_date: "2026-05-20T00:00:00.000Z",
          completed_at: null,
          is_auto_generated: false,
          created_at: "2026-05-01T00:00:00.000Z",
          updated_at: "2026-05-01T00:00:00.000Z",
          donor: {
            id: "donor-1",
            name: "Support Partner",
            email: "partner@example.com",
            avatar_url: null,
            giving_preferences: { defaultAnonymousToRecipient: false },
          },
        },
      ],
      posts: [
        {
          id: "post-1",
          title: null,
          content: "A ministry update with visible impact.",
          post_type: "Update",
          visibility: "partners_only",
          status: "published",
          created_at: "2026-05-04T00:00:00.000Z",
          like_count: 2,
          prayer_count: 3,
          comment_count: 1,
        },
      ],
    });

    expect(snapshot.profile.displayName).toBe("Jane Missionary");
    expect(snapshot.support).toMatchObject({
      goalCents: null,
      goalCurrency: null,
      raisedCents: null,
      recurringCurrency: "USD",
      // $200 monthly + $300 quarterly ($100/month) committed.
      recurringMonthlyCents: 30_000,
      percentFunded: null,
      // Lapsed partners aren't counted as active.
      activeDonorCount: 1,
      giftCount: 1,
    });
    expect(snapshot.donorRelationships[0]).toEqual({
      id: "donor-1",
      displayName: "Support Partner",
      email: "partner@example.com",
      phone: "+15555550101",
      preferredContact: "phone",
      avatarUrl: null,
      location: "Austin",
      status: "active",
      totalGivenCents: null,
      lastGiftAt: "2026-05-01T00:00:00.000Z",
      lastGiftAmountCents: null,
      giftCount: 5,
      frequency: "monthly",
      tags: ["church"],
      hasActivePledge: true,
    });
    expect(Object.keys(snapshot.donorRelationships[0] ?? {})).not.toEqual(
      expect.arrayContaining(["notes", "address", "score"]),
    );
    expect(snapshot.tasks[0]).toMatchObject({
      id: "task-1",
      donor: {
        id: "donor-1",
        name: "Support Partner",
      },
    });
    expect(snapshot.ministryUpdates[0]).toMatchObject({
      id: "post-1",
      title: "Ministry update",
      engagementCount: 6,
    });
  });
});

describe("mapMissionaryTask legacy values", () => {
  const row = {
    id: "task-1",
    missionary_id: "missionary-1",
    donor_id: null,
    title: "Follow up",
    description: null,
    task_type: "call",
    status: "not_started",
    priority: "none",
    sort_key: 1,
    due_date: null,
    completed_at: null,
    is_auto_generated: false,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    donor: null,
  };

  // The database column is unconstrained and the seed writes "pending",
  // "cancelled", "note" and "report" (the older packages/config task
  // vocabulary), none of which the task UI can render.
  it("maps legacy statuses and types onto the task model", () => {
    expect(mapMissionaryTask({ ...row, status: "pending" }).status).toBe(
      "not_started",
    );
    expect(mapMissionaryTask({ ...row, status: "cancelled" }).status).toBe(
      "deferred",
    );
    expect(mapMissionaryTask({ ...row, status: "mystery" }).status).toBe(
      "not_started",
    );
    expect(mapMissionaryTask({ ...row, status: "in_progress" }).status).toBe(
      "in_progress",
    );
    expect(mapMissionaryTask({ ...row, task_type: "note" }).task_type).toBe(
      "to_do",
    );
    expect(mapMissionaryTask({ ...row, task_type: "email" }).task_type).toBe(
      "email",
    );
    expect(mapMissionaryTask({ ...row, priority: "urgent" }).priority).toBe(
      "high",
    );
    expect(mapMissionaryTask({ ...row, priority: "mystery" }).priority).toBe(
      "none",
    );
  });
});

describe("monthlyCommittedCents", () => {
  // Weekly and every-two-weeks pledges are supported schedules; leaving them
  // out would understate committed support.
  it("counts weekly and every-two-weeks pledges at their monthly rate", () => {
    expect(
      monthlyCommittedCents([
        {
          donor_id: "a",
          amount: 1200,
          currency: "USD",
          frequency: "weekly",
          status: "active",
        },
        {
          donor_id: "b",
          amount: 2400,
          currency: "USD",
          frequency: "biweekly",
          status: "active",
        },
        {
          donor_id: "c",
          amount: 5000,
          currency: "USD",
          frequency: "monthly",
          status: "active",
        },
      ]),
    ).toBe(5200 + 5200 + 5000);
  });
});

it("rounds the exact combined biweekly support once", () => {
  expect(
    monthlyCommittedCents(
      ["a", "b", "c"].map((donor_id) => ({
        donor_id,
        amount: 1001,
        currency: "USD",
        frequency: "biweekly",
        status: "active",
      })),
    ),
  ).toBe(6507);
});
