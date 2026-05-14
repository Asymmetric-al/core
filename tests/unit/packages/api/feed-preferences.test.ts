import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
}));

vi.mock("@asym/database/supabase/server", () => ({
  createClient: createClientMock,
}));

import { GET, POST } from "../../../../packages/api/src/feed-preferences";

interface QueryResult<T> {
  data: T | null;
  error: { message: string } | null;
}

interface SupabaseQueryMock<T> {
  eq: ReturnType<typeof vi.fn>;
  maybeSingle: ReturnType<typeof vi.fn>;
  select: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  upsert: ReturnType<typeof vi.fn>;
}

function createQuery<T>(result: QueryResult<T>): SupabaseQueryMock<T> {
  const query = {} as SupabaseQueryMock<T>;
  query.eq = vi.fn(() => query);
  query.maybeSingle = vi.fn().mockResolvedValue(result);
  query.select = vi.fn(() => query);
  query.single = vi.fn().mockResolvedValue(result);
  query.upsert = vi.fn(() => query);
  return query;
}

function createJsonRequest(body: unknown) {
  return new Request("http://localhost/api/donor/feed-preferences", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function mockFeedPreferencesRoute(options?: {
  donor?: QueryResult<{ id: string }>;
  preferences?: QueryResult<Record<string, unknown>>;
  user?: { email?: string } | null;
}) {
  const user =
    options && "user" in options
      ? options.user
      : { email: "donor@example.com" };
  const donorQuery = createQuery(
    options?.donor ?? { data: { id: "donor-1" }, error: null },
  );
  const preferencesQuery = createQuery(
    options?.preferences ?? {
      data: {
        show_org_posts: false,
        show_missionary_posts: true,
        follow_org: true,
        email_org_posts: false,
        email_missionary_posts: true,
      },
      error: null,
    },
  );
  const getUser = vi.fn().mockResolvedValue({
    data: { user },
  });
  const from = vi.fn((table: string) => {
    if (table === "donors") {
      return donorQuery;
    }

    if (table === "donor_feed_preferences") {
      return preferencesQuery;
    }

    throw new Error(`Unexpected table: ${table}`);
  });

  createClientMock.mockResolvedValue({
    auth: { getUser },
    from,
  });

  return { donorQuery, from, getUser, preferencesQuery };
}

describe("feed preferences route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when the caller is not authenticated", async () => {
    mockFeedPreferencesRoute({ user: null });

    const response = await GET();

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
  });

  it("keeps the existing default GET response when the authenticated user has no donor row", async () => {
    mockFeedPreferencesRoute({
      donor: { data: null, error: { message: "No rows found" } },
    });

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      showOrgPosts: true,
      showMissionaryPosts: true,
      followOrg: false,
      emailOrgPosts: false,
      emailMissionaryPosts: false,
    });
  });

  it("maps stored preference rows to the public response shape", async () => {
    mockFeedPreferencesRoute();

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      showOrgPosts: false,
      showMissionaryPosts: true,
      followOrg: true,
      emailOrgPosts: false,
      emailMissionaryPosts: true,
    });
  });

  it("rejects malformed POST payloads before writing preferences", async () => {
    const { preferencesQuery } = mockFeedPreferencesRoute();

    const response = await POST(
      createJsonRequest({ showOrgPosts: "not-a-boolean" }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "Invalid preferences payload",
    });
    expect(preferencesQuery.upsert).not.toHaveBeenCalled();
  });

  it("upserts valid POST payloads using the database column names", async () => {
    const { preferencesQuery } = mockFeedPreferencesRoute({
      preferences: {
        data: {
          show_org_posts: true,
          show_missionary_posts: false,
          follow_org: true,
          email_org_posts: true,
          email_missionary_posts: false,
        },
        error: null,
      },
    });

    const response = await POST(
      createJsonRequest({
        showOrgPosts: true,
        showMissionaryPosts: false,
        followOrg: true,
        emailOrgPosts: true,
        emailMissionaryPosts: false,
      }),
    );

    expect(response.status).toBe(200);
    expect(preferencesQuery.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        donor_id: "donor-1",
        tenant_id: "00000000-0000-0000-0000-000000000001",
        show_org_posts: true,
        show_missionary_posts: false,
        follow_org: true,
        email_org_posts: true,
        email_missionary_posts: false,
        updated_at: expect.any(String),
      }),
      { onConflict: "donor_id,tenant_id" },
    );
    expect(await response.json()).toEqual({
      showOrgPosts: true,
      showMissionaryPosts: false,
      followOrg: true,
      emailOrgPosts: true,
      emailMissionaryPosts: false,
    });
  });

  it("omits preference columns that were not provided in partial POST payloads", async () => {
    const { preferencesQuery } = mockFeedPreferencesRoute();

    const response = await POST(createJsonRequest({ followOrg: true }));

    expect(response.status).toBe(200);
    const [payload, options] = preferencesQuery.upsert.mock.calls[0] ?? [];
    expect(options).toEqual({ onConflict: "donor_id,tenant_id" });
    expect(payload).toMatchObject({
      donor_id: "donor-1",
      tenant_id: "00000000-0000-0000-0000-000000000001",
      follow_org: true,
      updated_at: expect.any(String),
    });
    expect(payload).not.toHaveProperty("show_org_posts");
    expect(payload).not.toHaveProperty("show_missionary_posts");
    expect(payload).not.toHaveProperty("email_org_posts");
    expect(payload).not.toHaveProperty("email_missionary_posts");
  });
});
