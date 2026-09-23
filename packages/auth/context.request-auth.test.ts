import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  profile: vi.fn(),
  profileFilter: vi.fn(),
  memberships: vi.fn(),
  admin: vi.fn(),
  createBearerClient: vi.fn(),
}));

function requestClient() {
  return {
    auth: { getUser: mocks.getUser },
    from: () => ({
      select: () => ({
        eq: (...args: unknown[]) => {
          mocks.profileFilter(...args);
          return { single: mocks.profile };
        },
      }),
    }),
    rpc: mocks.memberships,
    schema: () => {
      throw new Error("authz is not exposed by the Data API");
    },
  };
}

vi.mock("next/headers", () => ({
  cookies: async () => ({ getAll: () => [], set: vi.fn() }),
  headers: async () => ({ get: () => null }),
}));
vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: () => ({
    url: "https://example.supabase.co",
    key: "unit-test-public-key",
  }),
}));
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: mocks.admin,
}));
vi.mock("@supabase/ssr", () => ({
  createServerClient: () => requestClient(),
  parseCookieHeader: () => [],
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: (...args: unknown[]) => {
    mocks.createBearerClient(...args);
    return requestClient();
  },
}));

import { getAuthContext, hasContextRole } from "./context";

describe("request-scoped auth context", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "user-one", email: "donor@example.test" } },
      error: null,
    });
    mocks.profile.mockResolvedValue({
      data: { id: "profile-one", tenant_id: "tenant-one", role: "donor" },
      error: null,
    });
    mocks.memberships.mockResolvedValue({ data: [], error: null });
    mocks.admin.mockReturnValue({
      client: {
        from: () => ({
          select: () => ({
            eq: () => ({
              single: async () => ({
                data: null,
                error: { code: "42501", message: "permission denied" },
              }),
            }),
          }),
        }),
      },
    });
  });

  it("resolves the signed-in donor even when a CMS service client cannot read profiles", async () => {
    const context = await getAuthContext();

    expect(context).toMatchObject({
      userId: "user-one",
      profileId: "profile-one",
      tenantId: "tenant-one",
      role: "donor",
      isAuthenticated: true,
    });
    expect(mocks.profileFilter).toHaveBeenCalledWith("user_id", "user-one");
    expect(mocks.admin).not.toHaveBeenCalled();
  });

  it("resolves active staff membership and its subrole through the caller-only RPC", async () => {
    mocks.memberships.mockResolvedValue({
      data: [
        {
          tenant_id: "tenant-one",
          role: "staff",
          staff_role: "finance",
          is_active: true,
        },
      ],
      error: null,
    });

    const context = await getAuthContext();

    expect(context.memberships).toEqual([
      {
        tenantId: "tenant-one",
        role: "staff",
        staffRole: "finance",
        isActive: true,
      },
    ]);
    expect(hasContextRole(context, "staff")).toBe(true);
    expect(mocks.memberships).toHaveBeenCalledWith("current_user_memberships", {
      target_tenant: "tenant-one",
    });
  });

  it("keeps bearer identity on the same client used for profile and membership reads", async () => {
    const context = await getAuthContext(
      new Request("https://example.test/api", {
        headers: { authorization: "Bearer unit-test-token" },
      }),
    );

    expect(context.isAuthenticated).toBe(true);
    expect(mocks.getUser).toHaveBeenCalledWith("unit-test-token");
    expect(mocks.createBearerClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "unit-test-public-key",
      expect.objectContaining({
        global: { headers: { Authorization: "Bearer unit-test-token" } },
      }),
    );
    expect(mocks.memberships).toHaveBeenCalledOnce();
    expect(mocks.admin).not.toHaveBeenCalled();
  });

  it("denies unresolved membership instead of falling back to a privileged profile role", async () => {
    mocks.profile.mockResolvedValue({
      data: { id: "profile-one", tenant_id: "tenant-one", role: "admin" },
      error: null,
    });
    mocks.memberships.mockResolvedValue({
      data: null,
      error: { code: "PGRST106" },
    });

    const context = await getAuthContext();

    expect(context.isAuthenticated).toBe(false);
    expect(hasContextRole(context, "admin")).toBe(false);
    expect(context.memberships).toEqual([]);
  });

  it("denies a failed profile read even if the provider also returns data", async () => {
    mocks.profile.mockResolvedValue({
      data: { id: "profile-one", tenant_id: "tenant-one", role: "admin" },
      error: { code: "42501" },
    });

    const context = await getAuthContext();

    expect(context.isAuthenticated).toBe(false);
    expect(hasContextRole(context, "admin")).toBe(false);
    expect(mocks.memberships).not.toHaveBeenCalled();
  });

  it("cannot authorize using another tenant, inactive membership, or an unknown role", async () => {
    mocks.memberships.mockResolvedValue({
      data: [
        {
          tenant_id: "tenant-other",
          role: "staff",
          staff_role: "finance",
          is_active: true,
        },
        {
          tenant_id: "tenant-one",
          role: "staff",
          staff_role: "finance",
          is_active: false,
        },
        {
          tenant_id: "tenant-one",
          role: "super_admin",
          staff_role: null,
          is_active: true,
        },
      ],
      error: null,
    });

    const context = await getAuthContext();

    expect(context.isAuthenticated).toBe(true);
    expect(context.memberships).toEqual([]);
    expect(hasContextRole(context, "staff")).toBe(false);
    expect(hasContextRole(context, "super_admin")).toBe(false);
    expect(hasContextRole(context, "donor")).toBe(true);
  });

  it("does not read authorization data for an invalid bearer session", async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: null },
      error: { code: "bad_jwt" },
    });

    const context = await getAuthContext(
      new Request("https://example.test/api", {
        headers: { authorization: "Bearer expired-unit-test-token" },
      }),
    );

    expect(context.isAuthenticated).toBe(false);
    expect(mocks.profile).not.toHaveBeenCalled();
    expect(mocks.memberships).not.toHaveBeenCalled();
  });
});
