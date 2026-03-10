import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAuthContextMock, getAdminClientMock } = vi.hoisted(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://127.0.0.1:54321";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";

  return {
    getAuthContextMock: vi.fn(),
    getAdminClientMock: vi.fn(),
  };
});

vi.mock("@asym/auth/context", () => ({
  getAuthContext: getAuthContextMock,
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: getAdminClientMock,
}));

vi.mock("next/cache", () => ({
  cacheTag: vi.fn(),
  cacheLife: vi.fn(),
}));

import ContributionsPage from "../../../../../apps/admin/app/contributions/page";

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

describe("apps/admin/app/contributions/page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("surfaces an explicit error when loading donor history fails", async () => {
    getAuthContextMock.mockResolvedValue({
      isAuthenticated: true,
      tenantId: "tenant-1",
      profileId: "profile-1",
    });

    const queries = [
      createThenableQuery({
        data: { id: "donor-1" },
        error: null,
      }),
      createThenableQuery({
        data: [],
        error: { message: "db unavailable" },
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

    const result = await ContributionsPage({
      searchParams: Promise.resolve({ donorId: "donor-1" }),
    });

    expect(result.props.initialData).toEqual([]);
    expect(result.props.errorMessage).toBe("db unavailable");
  });

  it("shows a permission error when the requested donor id does not match the signed-in profile", async () => {
    getAuthContextMock.mockResolvedValue({
      isAuthenticated: true,
      tenantId: "tenant-1",
      profileId: "profile-1",
    });

    const donorLookupQuery = createThenableQuery({
      data: { id: "donor-1" },
      error: null,
    });

    getAdminClientMock.mockReturnValue({
      client: { from: vi.fn(() => donorLookupQuery) } as never,
      error: null,
    });

    const result = await ContributionsPage({
      searchParams: Promise.resolve({ donorId: "donor-2" }),
    });

    expect(result.props.initialData).toEqual([]);
    expect(result.props.errorMessage).toBe(
      "You do not have permission to view these contributions.",
    );
  });
});
