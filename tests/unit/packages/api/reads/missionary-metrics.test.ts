import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAdminClientMock } = vi.hoisted(() => ({
  getAdminClientMock: vi.fn(),
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: getAdminClientMock,
}));

vi.mock("next/cache", () => ({
  cacheTag: vi.fn(),
  cacheLife: vi.fn(),
}));

import { getMissionaryMetrics } from "../../../../../packages/api/src/reads/missionary-metrics";

type QueryResult<T> = {
  data: T;
  count?: number | null;
  error: { message: string } | null;
};

function createThenableQuery<T>(result: QueryResult<T>) {
  const query: {
    select: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    in: ReturnType<typeof vi.fn>;
    gte: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
    maybeSingle: ReturnType<typeof vi.fn>;
    then?: PromiseLike<QueryResult<T>>["then"];
  } = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    in: vi.fn(() => query),
    gte: vi.fn(() => query),
    order: vi.fn(() => query),
    maybeSingle: vi.fn(() => Promise.resolve(result)),
  };

  query.then = (onFulfilled, onRejected) =>
    Promise.resolve(result).then(onFulfilled, onRejected);

  return query;
}

describe("api/reads/missionary-metrics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns missionary metrics on the happy path", async () => {
    const now = new Date();
    const thisMonthDate = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 15),
    ).toISOString();
    const lastMonthDate = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 10),
    ).toISOString();

    const missionaryQuery = createThenableQuery({
      data: { id: "missionary-1", profile_id: "profile-1" },
      error: null,
    });
    const followerCountQuery = createThenableQuery({
      data: null,
      count: 12,
      error: null,
    });
    const postsQuery = createThenableQuery({
      data: [
        { id: "post-1", like_count: 2, prayer_count: 3, comment_count: 1 },
        { id: "post-2", like_count: 1, prayer_count: 0, comment_count: 4 },
      ],
      error: null,
    });
    const donationTotalsQuery = createThenableQuery({
      data: [{ amount: 125 }, { amount: 75 }],
      error: null,
    });
    const donationSeriesQuery = createThenableQuery({
      data: [
        { amount: 125, created_at: thisMonthDate },
        { amount: 75, created_at: lastMonthDate },
      ],
      error: null,
    });

    const queries = [
      missionaryQuery,
      followerCountQuery,
      postsQuery,
      donationTotalsQuery,
      donationSeriesQuery,
    ];

    const from = vi.fn(() => queries.shift());
    getAdminClientMock.mockReturnValue({
      client: { from } as never,
      error: null,
    });

    const result = await getMissionaryMetrics("missionary-1", "tenant-1");

    expect(result.missionaryId).toBe("missionary-1");
    expect(result.tenantId).toBe("tenant-1");
    expect(result.totalDonations).toBe(2);
    expect(result.totalRevenue).toBe(200);
    expect(result.followerCount).toBe(12);
    expect(result.postCount).toBe(2);
    expect(result.reactionCount).toBe(11);
    expect(result.donationsLast13Months).toHaveLength(13);
    expect(result.donationsLast13Months.some((point) => point.amount > 0)).toBe(
      true,
    );
    expect(donationTotalsQuery.in).toHaveBeenCalledWith("status", [
      "completed",
      "succeeded",
      "success",
    ]);
    expect(donationSeriesQuery.in).toHaveBeenCalledWith("status", [
      "completed",
      "succeeded",
      "success",
    ]);
    expect(from).toHaveBeenCalledTimes(5);
  });

  it("throws when the admin client is unavailable", async () => {
    getAdminClientMock.mockReturnValue({
      client: null,
      error: "Admin client unavailable",
    });

    await expect(
      getMissionaryMetrics("missionary-1", "tenant-1"),
    ).rejects.toThrow("Admin client unavailable");
  });

  it("throws when a database query returns an error", async () => {
    const queries = [
      createThenableQuery({
        data: { id: "missionary-1", profile_id: "profile-1" },
        error: null,
      }),
      createThenableQuery({
        data: null,
        count: 0,
        error: { message: "followers query failed" },
      }),
      createThenableQuery({ data: [], error: null }),
      createThenableQuery({ data: [], error: null }),
      createThenableQuery({ data: [], error: null }),
    ];

    getAdminClientMock.mockReturnValue({
      client: { from: vi.fn(() => queries.shift()) } as never,
      error: null,
    });

    await expect(
      getMissionaryMetrics("missionary-1", "tenant-1"),
    ).rejects.toThrow("followers query failed");
  });
});
