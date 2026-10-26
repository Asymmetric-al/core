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

interface SupabaseQueryMock {
  eq: ReturnType<typeof vi.fn>;
  in: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
  maybeSingle: ReturnType<typeof vi.fn>;
  select: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  upsert: ReturnType<typeof vi.fn>;
}

/** A chainable query; `terminal` is the method the route awaits. */
function createQuery<T>(
  result: QueryResult<T>,
  terminal?: "eq" | "limit",
): SupabaseQueryMock {
  const query = {} as SupabaseQueryMock;
  query.eq = vi.fn(() => query);
  query.in = vi.fn(() => query);
  query.limit = vi.fn(() => query);
  query.maybeSingle = vi.fn().mockResolvedValue(result);
  query.select = vi.fn(() => query);
  query.single = vi.fn().mockResolvedValue(result);
  query.upsert = vi.fn(() => query);
  if (terminal) query[terminal] = vi.fn().mockResolvedValue(result);
  return query;
}

const TENANT_ID = "3f6c1d2e-8a4b-4c5d-9e6f-7a8b9c0d1e2f";

function createJsonRequest(body: unknown) {
  return new Request("http://localhost/api/donor/feed-preferences", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function mockFeedPreferencesRoute(options?: {
  donors?: QueryResult<{ id: string }[]>;
  preferences?: QueryResult<Record<string, unknown>>;
  profiles?: QueryResult<{ id: string }[]>;
  user?: { id: string; app_metadata?: Record<string, unknown> } | null;
}) {
  const user =
    options && "user" in options
      ? options.user
      : { id: "user-1", app_metadata: { tenant_id: TENANT_ID } };
  const profilesQuery = createQuery(
    options?.profiles ?? { data: [{ id: "profile-1" }], error: null },
    "eq",
  );
  const donorQuery = createQuery(
    options?.donors ?? { data: [{ id: "donor-1" }], error: null },
    "limit",
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
    if (table === "profiles") {
      return profilesQuery;
    }

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

  return { donorQuery, from, getUser, preferencesQuery, profilesQuery };
}

const DEFAULT_RESPONSE = {
  showOrgPosts: true,
  showMissionaryPosts: true,
  followOrg: false,
  emailOrgPosts: false,
  emailMissionaryPosts: false,
};

describe("feed preferences route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 on GET and POST when the caller is not authenticated", async () => {
    const { from } = mockFeedPreferencesRoute({ user: null });

    const getResponse = await GET();
    const postResponse = await POST(createJsonRequest({ followOrg: true }));

    expect(getResponse.status).toBe(401);
    expect(await getResponse.json()).toEqual({ error: "Unauthorized" });
    expect(postResponse.status).toBe(401);
    expect(await postResponse.json()).toEqual({ error: "Unauthorized" });
    expect(from).not.toHaveBeenCalled();
  });

  it.each([
    ["no app_metadata", {}],
    ["no tenant_id", { app_metadata: {} }],
    ["a non-UUID tenant_id", { app_metadata: { tenant_id: "tenant-a" } }],
    [
      "the retired default tenant literal",
      { app_metadata: { tenant_id: "00000000-0000-0000-0000-000000000001" } },
    ],
  ])(
    "returns 403 on GET and POST for %s, before any preferences query",
    async (_name, claims) => {
      const { from } = mockFeedPreferencesRoute({
        user: { id: "user-1", ...claims },
      });

      const getResponse = await GET();
      const postResponse = await POST(createJsonRequest({ followOrg: true }));

      for (const response of [getResponse, postResponse]) {
        expect(response.status).toBe(403);
        expect(await response.json()).toEqual({
          error: "Tenant context required",
        });
      }
      expect(from).not.toHaveBeenCalledWith("donor_feed_preferences");
    },
  );

  it("finds the donor by profile ownership in the JWT tenant, never by email", async () => {
    const { donorQuery, preferencesQuery, profilesQuery } =
      mockFeedPreferencesRoute();

    const response = await GET();

    expect(response.status).toBe(200);
    expect(profilesQuery.select).toHaveBeenCalledWith("id");
    expect(profilesQuery.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(donorQuery.select).toHaveBeenCalledWith("id");
    expect(donorQuery.eq).toHaveBeenCalledWith("tenant_id", TENANT_ID);
    expect(donorQuery.in).toHaveBeenCalledWith("profile_id", ["profile-1"]);
    expect(donorQuery.limit).toHaveBeenCalledWith(2);
    for (const query of [profilesQuery, donorQuery]) {
      expect(query.eq).not.toHaveBeenCalledWith("email", expect.anything());
    }
    expect(preferencesQuery.eq).toHaveBeenCalledWith("donor_id", "donor-1");
    expect(preferencesQuery.eq).toHaveBeenCalledWith("tenant_id", TENANT_ID);
  });

  it.each([
    ["no profile", { profiles: { data: [], error: null } }],
    ["no donor in the tenant", { donors: { data: [], error: null } }],
  ])(
    "returns the default GET response and a POST 404 when the caller has %s",
    async (_name, options) => {
      const { donorQuery, preferencesQuery } =
        mockFeedPreferencesRoute(options);

      const getResponse = await GET();
      const postResponse = await POST(createJsonRequest({ followOrg: true }));

      expect(getResponse.status).toBe(200);
      expect(await getResponse.json()).toEqual(DEFAULT_RESPONSE);
      expect(postResponse.status).toBe(404);
      expect(await postResponse.json()).toEqual({ error: "Donor not found" });
      expect(preferencesQuery.upsert).not.toHaveBeenCalled();
      if (options.profiles) expect(donorQuery.limit).not.toHaveBeenCalled();
    },
  );

  it("returns 409 on GET and POST when the caller has two donors in the tenant, and writes nothing", async () => {
    const { from, preferencesQuery } = mockFeedPreferencesRoute({
      donors: { data: [{ id: "donor-1" }, { id: "donor-2" }], error: null },
    });

    const getResponse = await GET();
    const postResponse = await POST(createJsonRequest({ followOrg: true }));

    for (const response of [getResponse, postResponse]) {
      expect(response.status).toBe(409);
      expect(await response.json()).toEqual({
        error: "Multiple donor records for this account",
      });
    }
    expect(from).not.toHaveBeenCalledWith("donor_feed_preferences");
    expect(preferencesQuery.upsert).not.toHaveBeenCalled();
  });

  it.each([
    ["profiles", { profiles: { data: null, error: { message: "denied" } } }],
    ["donors", { donors: { data: null, error: { message: "denied" } } }],
  ])(
    "returns 500 instead of defaults when the %s lookup fails",
    async (_name, options) => {
      const { preferencesQuery } = mockFeedPreferencesRoute(options);

      const getResponse = await GET();
      const postResponse = await POST(createJsonRequest({ followOrg: true }));

      expect(getResponse.status).toBe(500);
      expect(await getResponse.json()).toEqual({
        error: "Failed to fetch preferences",
      });
      expect(postResponse.status).toBe(500);
      expect(await postResponse.json()).toEqual({
        error: "Failed to update preferences",
      });
      expect(preferencesQuery.upsert).not.toHaveBeenCalled();
    },
  );

  it("returns 500 when the preferences read fails instead of silently returning defaults", async () => {
    mockFeedPreferencesRoute({
      preferences: { data: null, error: { message: "permission denied" } },
    });

    const response = await GET();

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "Failed to fetch preferences",
    });
  });

  it("returns the default GET response when the donor has no saved row yet", async () => {
    mockFeedPreferencesRoute({ preferences: { data: null, error: null } });

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(DEFAULT_RESPONSE);
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

  it("upserts valid POST payloads in the JWT tenant using the database column names", async () => {
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
        tenant_id: TENANT_ID,
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
      tenant_id: TENANT_ID,
      follow_org: true,
      updated_at: expect.any(String),
    });
    expect(payload).not.toHaveProperty("show_org_posts");
    expect(payload).not.toHaveProperty("show_missionary_posts");
    expect(payload).not.toHaveProperty("email_org_posts");
    expect(payload).not.toHaveProperty("email_missionary_posts");
  });

  it("returns 500 when the upsert fails", async () => {
    mockFeedPreferencesRoute({
      preferences: { data: null, error: { message: "permission denied" } },
    });

    const response = await POST(createJsonRequest({ followOrg: true }));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "Failed to update preferences",
    });
  });
});
