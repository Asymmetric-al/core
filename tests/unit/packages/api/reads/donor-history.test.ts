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

import {
  getDonorHistory,
  resolveDonorId,
} from "../../../../../packages/api/src/reads/donor-history";

type QueryResult<T> = {
  data: T;
  count?: number | null;
  error: { message: string } | null;
};

function createThenableQuery<T>(result: QueryResult<T>) {
  const query: {
    select: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
    range: ReturnType<typeof vi.fn>;
    maybeSingle: ReturnType<typeof vi.fn>;
    then?: PromiseLike<QueryResult<T>>["then"];
  } = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    order: vi.fn(() => query),
    range: vi.fn(() => query),
    maybeSingle: vi.fn(() => Promise.resolve(result)),
  };

  query.then = (onFulfilled, onRejected) =>
    Promise.resolve(result).then(onFulfilled, onRejected);

  return query;
}

describe("api/reads/donor-history", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated donor history on the happy path", async () => {
    const queries = [
      createThenableQuery({
        data: [
          {
            id: "donation-1",
            amount: 50,
            currency: "usd",
            status: "completed",
            donation_type: "one_time",
            missionary_id: "missionary-1",
            created_at: "2026-01-10T10:00:00.000Z",
          },
          {
            id: "donation-2",
            amount: 75,
            currency: "usd",
            status: "pending",
            donation_type: "recurring",
            missionary_id: "missionary-2",
            created_at: "2026-01-09T10:00:00.000Z",
          },
        ],
        error: null,
      }),
      createThenableQuery({
        data: null,
        count: 3,
        error: null,
      }),
    ];

    const from = vi.fn(() => queries.shift());
    getAdminClientMock.mockReturnValue({
      client: { from } as never,
      error: null,
    });

    const result = await getDonorHistory("donor-1", "tenant-1", {
      limit: 2,
      offset: 0,
    });

    expect(result.total).toBe(3);
    expect(result.limit).toBe(2);
    expect(result.offset).toBe(0);
    expect(result.hasMore).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toEqual({
      id: "donation-1",
      amount: 50,
      currency: "usd",
      status: "completed",
      donationType: "one_time",
      missionaryId: "missionary-1",
      createdAt: "2026-01-10T10:00:00.000Z",
    });
    expect(from).toHaveBeenCalledTimes(2);
  });

  it("throws when the admin client is unavailable", async () => {
    getAdminClientMock.mockReturnValue({
      client: null,
      error: "Admin client unavailable",
    });

    await expect(
      getDonorHistory("donor-1", "tenant-1", { limit: 20, offset: 0 }),
    ).rejects.toThrow("Admin client unavailable");
  });

  it("throws when the database query returns an error", async () => {
    const queries = [
      createThenableQuery({
        data: [],
        error: { message: "history query failed" },
      }),
      createThenableQuery({
        data: null,
        count: 0,
        error: null,
      }),
    ];

    getAdminClientMock.mockReturnValue({
      client: { from: vi.fn(() => queries.shift()) } as never,
      error: null,
    });

    await expect(
      getDonorHistory("donor-1", "tenant-1", { limit: 20, offset: 0 }),
    ).rejects.toThrow("history query failed");
  });

  it("looks up the donor id from the profile id", async () => {
    const donorLookupQuery = createThenableQuery({
      data: { id: "donor-456" },
      error: null,
    });

    getAdminClientMock.mockReturnValue({
      client: { from: vi.fn(() => donorLookupQuery) } as never,
      error: null,
    });

    await expect(resolveDonorId(null, "tenant-1", "profile-1")).resolves.toBe(
      "donor-456",
    );
    expect(donorLookupQuery.maybeSingle).toHaveBeenCalledTimes(1);
  });

  it("returns the explicit donor id only when it matches the signed-in profile", async () => {
    const donorLookupQuery = createThenableQuery({
      data: { id: "donor-123" },
      error: null,
    });

    getAdminClientMock.mockReturnValue({
      client: { from: vi.fn(() => donorLookupQuery) } as never,
      error: null,
    });

    await expect(
      resolveDonorId("donor-123", "tenant-1", "profile-1"),
    ).resolves.toBe("donor-123");
    expect(donorLookupQuery.maybeSingle).toHaveBeenCalledTimes(1);
  });

  it("rejects an explicit donor id that does not match the signed-in profile", async () => {
    const donorLookupQuery = createThenableQuery({
      data: { id: "donor-456" },
      error: null,
    });

    getAdminClientMock.mockReturnValue({
      client: { from: vi.fn(() => donorLookupQuery) } as never,
      error: null,
    });

    await expect(
      resolveDonorId("donor-123", "tenant-1", "profile-1"),
    ).resolves.toBeNull();
  });
});
