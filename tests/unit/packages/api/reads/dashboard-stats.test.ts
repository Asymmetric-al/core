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

import { getDashboardStats } from "../../../../../packages/api/src/reads/dashboard-stats";

type QueryResult<T> = {
  data: T;
  count?: number | null;
  error: { message: string } | null;
};

function createThenableQuery<T>(result: QueryResult<T>) {
  const query: {
    select: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    gte: ReturnType<typeof vi.fn>;
    then?: PromiseLike<QueryResult<T>>["then"];
  } = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    gte: vi.fn(() => query),
  };

  query.then = (onFulfilled, onRejected) =>
    Promise.resolve(result).then(onFulfilled, onRejected);

  return query;
}

describe("api/reads/dashboard-stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns dashboard stats on the happy path", async () => {
    const queries = [
      createThenableQuery({ data: null, count: 3, error: null }),
      createThenableQuery({ data: null, count: 2, error: null }),
      createThenableQuery({ data: null, count: 5, error: null }),
      createThenableQuery({
        data: [{ amount: 120 }, { amount: 80 }, { amount: null }],
        error: null,
      }),
      createThenableQuery({ data: null, count: 4, error: null }),
    ];

    const from = vi.fn(() => queries.shift());
    getAdminClientMock.mockReturnValue({
      client: { from } as never,
      error: null,
    });

    const result = await getDashboardStats("tenant-1");

    expect(result).toEqual({
      totalDonors: 3,
      totalMissionaries: 2,
      totalDonationsThisMonth: 5,
      revenueThisMonth: 200,
      activeFundsCount: 4,
    });
    expect(from).toHaveBeenCalledTimes(5);
  });

  it("throws when the admin client is unavailable", async () => {
    getAdminClientMock.mockReturnValue({
      client: null,
      error: "Admin client unavailable",
    });

    await expect(getDashboardStats("tenant-1")).rejects.toThrow(
      "Admin client unavailable",
    );
  });

  it("throws when a database query returns an error", async () => {
    const queries = [
      createThenableQuery({
        data: null,
        count: 0,
        error: { message: "donor query failed" },
      }),
      createThenableQuery({ data: null, count: 0, error: null }),
      createThenableQuery({ data: null, count: 0, error: null }),
      createThenableQuery({ data: [], error: null }),
      createThenableQuery({ data: null, count: 0, error: null }),
    ];

    getAdminClientMock.mockReturnValue({
      client: { from: vi.fn(() => queries.shift()) } as never,
      error: null,
    });

    await expect(getDashboardStats("tenant-1")).rejects.toThrow(
      "donor query failed",
    );
  });
});
