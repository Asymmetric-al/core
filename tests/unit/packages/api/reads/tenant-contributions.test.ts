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

import { getTenantContributions } from "../../../../../packages/api/src/reads/tenant-contributions";

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
    then?: PromiseLike<QueryResult<T>>["then"];
  } = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    order: vi.fn(() => query),
    range: vi.fn(() => query),
  };

  query.then = (onFulfilled, onRejected) =>
    Promise.resolve(result).then(onFulfilled, onRejected);

  return query;
}

describe("api/reads/tenant-contributions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns tenant-scoped contribution data with mapped fields", async () => {
    const listQuery = createThenableQuery({
      data: [
        {
          id: "donation-1",
          donor_id: "donor-1",
          amount: 2500,
          currency: "usd",
          status: "completed",
          donation_type: "one_time",
          payment_method: "card",
          source: "direct",
          notes: null,
          stripe_charge_id: "ch_123",
          stripe_payment_intent_id: "pi_123",
          created_at: "2026-02-20T10:00:00.000Z",
          updated_at: "2026-02-20T11:00:00.000Z",
          donor: {
            id: "donor-1",
            name: "Jane Donor",
            email: "jane@example.com",
            avatar_url: "https://example.com/avatar.png",
          },
          fund: {
            id: "fund-1",
            name: "General Fund",
          },
          missionary: {
            id: "missionary-1",
            profile: {
              display_name: "John Missionary",
              first_name: "John",
              last_name: "Missionary",
            },
          },
        },
      ],
      error: null,
    });
    const countQuery = createThenableQuery({
      data: null,
      count: 1,
      error: null,
    });

    const from = vi.fn(() => {
      if (from.mock.calls.length === 1) {
        return listQuery;
      }
      return countQuery;
    });

    getAdminClientMock.mockReturnValue({
      client: { from } as never,
      error: null,
    });

    const result = await getTenantContributions(
      "tenant-1",
      { limit: 20, offset: 0 },
      { donorId: "donor-1" },
    );

    expect(result.total).toBe(1);
    expect(result.data).toEqual([
      {
        id: "donation-1",
        donorId: "donor-1",
        donorName: "Jane Donor",
        donorEmail: "jane@example.com",
        donorAvatarUrl: "https://example.com/avatar.png",
        amount: 2500,
        currency: "usd",
        status: "completed",
        donationType: "one_time",
        paymentMethod: "card",
        source: "direct",
        fundCode: "fund-1",
        fundName: "General Fund",
        missionaryId: "missionary-1",
        missionaryName: "John Missionary",
        transactionId: "ch_123",
        notes: null,
        createdAt: "2026-02-20T10:00:00.000Z",
        updatedAt: "2026-02-20T11:00:00.000Z",
      },
    ]);
    expect(listQuery.eq).toHaveBeenCalledWith("donor_id", "donor-1");
    expect(countQuery.eq).toHaveBeenCalledWith("donor_id", "donor-1");
    expect(from).toHaveBeenCalledTimes(2);
  });

  it("throws when admin client is unavailable", async () => {
    getAdminClientMock.mockReturnValue({
      client: null,
      error: "Admin client unavailable",
    });

    await expect(
      getTenantContributions("tenant-1", { limit: 20, offset: 0 }),
    ).rejects.toThrow("Admin client unavailable");
  });

  it("throws when list query fails", async () => {
    const listQuery = createThenableQuery({
      data: [],
      error: { message: "query failed" },
    });
    const countQuery = createThenableQuery({
      data: null,
      count: 0,
      error: null,
    });

    const from = vi.fn(() => {
      if (from.mock.calls.length === 1) {
        return listQuery;
      }
      return countQuery;
    });

    getAdminClientMock.mockReturnValue({
      client: { from } as never,
      error: null,
    });

    await expect(
      getTenantContributions("tenant-1", { limit: 20, offset: 0 }),
    ).rejects.toThrow("query failed");
  });
});
