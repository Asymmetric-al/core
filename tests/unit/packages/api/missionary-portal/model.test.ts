import { describe, expect, it } from "vitest";

import { buildMissionaryPortalSnapshot } from "../../../../../packages/api/src/missionary-portal/model";

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
      goalCents: 600_000,
      raisedCents: 450_000,
      recurringMonthlyCents: 20_000,
      percentFunded: 75,
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
      totalGivenCents: 100_000,
      lastGiftAt: "2026-05-01T00:00:00.000Z",
      lastGiftAmountCents: 20_000,
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
