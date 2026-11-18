import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * AL-2675 (WP2a; plan 5.1, 5.2 and WP2 "Interim rules"): `getAuthContext`
 * resolves the one live membership of the surface's role class through the
 * principal resolver. The profile supplies the profile id and nothing else:
 * no tenant, no role, no fallback.
 */
const USER = "00000000-0000-4000-8000-0000000000a1";
const TA = "00000000-0000-4000-8000-00000000000a";
const TB = "00000000-0000-4000-8000-00000000000b";
let next = 0x100;
function row(
  tenant: string,
  role: "donor" | "missionary" | "staff",
  staffRole: string | null = null,
  isTenantAdmin = false,
) {
  next += 1;
  return {
    id: `00000000-0000-4000-8000-${next.toString(16).padStart(12, "0")}`,
    user_id: USER,
    tenant_id: tenant,
    role,
    staff_role: staffRole,
    is_tenant_admin: isTenantAdmin,
    updated_at: "2026-11-17T09:00:00.000000+00:00",
  };
}

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  profile: vi.fn(),
  profileSelect: vi.fn(),
  profileFilter: vi.fn(),
  rpc: vi.fn(),
  admin: vi.fn(),
  createBearerClient: vi.fn(),
  headers: new Map<string, string>(),
}));

function requestClient() {
  return {
    auth: { getUser: mocks.getUser },
    from: (table: string) => {
      if (table !== "profiles") throw new Error(`unexpected table ${table}`);
      return {
        select: (columns: string) => {
          mocks.profileSelect(columns);
          return {
            eq: (...args: unknown[]) => {
              mocks.profileFilter(...args);
              return { single: mocks.profile };
            },
          };
        },
      };
    },
    rpc: mocks.rpc,
    schema: () => {
      throw new Error("authz is not exposed by the Data API");
    },
  };
}

vi.mock("next/headers", () => ({
  cookies: async () => ({ getAll: () => [], set: vi.fn() }),
  headers: async () => ({
    get: (name: string) => mocks.headers.get(name) ?? null,
  }),
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

import {
  contextCapabilities,
  getAuthContext,
  hasContextCapability,
  hasContextRole,
} from "./context";

const rows = (...r: ReturnType<typeof row>[]) =>
  mocks.rpc.mockResolvedValue({ data: r, error: null });

describe("getAuthContext: the one assignment of the surface's role class", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.headers.clear();
    mocks.headers.set("x-asym-role-class", "donor");
    mocks.getUser.mockResolvedValue({
      data: { user: { id: USER, email: "donor@example.test" } },
      error: null,
    });
    mocks.profile.mockResolvedValue({
      data: { id: "profile-one" },
      error: null,
    });
    rows(row(TA, "donor"));
  });

  it("resolves a signed-in donor's one donor membership, with its tenant, through the assignments RPC", async () => {
    const context = await getAuthContext();

    expect(context).toMatchObject({
      userId: USER,
      profileId: "profile-one",
      tenantId: TA,
      role: "donor",
      isAuthenticated: true,
      assignmentDenial: null,
    });
    expect(context.assignment).toMatchObject({
      tenantId: TA,
      membershipRole: "donor",
    });
    expect(mocks.rpc).toHaveBeenCalledExactlyOnceWith(
      "current_user_assignments",
    );
    expect(mocks.profileSelect).toHaveBeenCalledWith("id");
    expect(mocks.profileFilter).toHaveBeenCalledWith("user_id", USER);
    expect(mocks.admin).not.toHaveBeenCalled();
  });

  it("refuses a person with donor memberships in two tenants on the donor portal (before WP3)", async () => {
    rows(row(TA, "donor"), row(TB, "donor"));

    const context = await getAuthContext();

    expect(context).toMatchObject({
      userId: USER,
      tenantId: null,
      role: null,
      isAuthenticated: false,
      assignmentDenial: "ambiguous",
    });
    expect(context.memberships).toEqual([]);
  });

  it("acts on the staff row on a staff surface and on the donor row on the donor portal, never both", async () => {
    rows(row(TA, "staff", "finance"), row(TA, "donor"));

    mocks.headers.set("x-asym-role-class", "staff");
    const staff = await getAuthContext();
    expect(staff.memberships).toEqual([
      {
        tenantId: TA,
        role: "staff",
        staffRole: "finance",
        isActive: true,
        isTenantAdmin: false,
      },
    ]);
    expect(hasContextRole(staff, "staff")).toBe(true);
    expect(hasContextRole(staff, "donor")).toBe(false);

    mocks.headers.set("x-asym-role-class", "donor");
    const donor = await getAuthContext();
    expect(donor.role).toBe("donor");
    expect(hasContextRole(donor, "staff")).toBe(false);
  });

  it("reads the role class from the request's own headers, and an explicit option wins", async () => {
    rows(row(TA, "staff", "hr"), row(TB, "missionary"));
    mocks.headers.clear();
    const request = new Request("https://example.test/api/x", {
      headers: { "x-asym-role-class": "missionary" },
    });

    expect((await getAuthContext(request)).role).toBe("missionary");
    expect(
      (await getAuthContext(request, { roleClass: "staff" })).tenantId,
    ).toBe(TA);
  });

  it("makes the tenant-administrator flag the admin role (A06)", async () => {
    mocks.headers.set("x-asym-role-class", "staff");
    rows(row(TA, "staff", "development", true));

    const context = await getAuthContext();

    expect(context.role).toBe("admin");
    expect(hasContextRole(context, "admin")).toBe(true);
    expect(hasContextRole(context, "staff")).toBe(true);
  });

  // The profile-role fallback is removed (plan WP2 "Exit"): a profile that
  // says admin, with no live staff membership, is not authenticated on a staff
  // surface and holds no role.
  it("denies a profile role admin with no membership instead of falling back to it", async () => {
    mocks.headers.set("x-asym-role-class", "staff");
    mocks.profile.mockResolvedValue({
      data: { id: "profile-one", tenant_id: TA, role: "admin" },
      error: null,
    });
    rows();

    const context = await getAuthContext();

    expect(context.isAuthenticated).toBe(false);
    expect(context.assignmentDenial).toBe("no_assignment");
    expect(hasContextRole(context, "admin")).toBe(false);
    expect(hasContextRole(context, "staff")).toBe(false);
  });

  it("refuses several staff rows in a tenant until one is chosen, then acts under the chosen row only", async () => {
    mocks.headers.set("x-asym-role-class", "staff");
    const finance = row(TA, "staff", "finance");
    const care = row(TA, "staff", "member_care");
    rows(finance, care);

    expect((await getAuthContext()).assignmentDenial).toBe("ambiguous");

    mocks.headers.set("x-asym-assignment", care.id);
    const chosen = await getAuthContext();
    expect(chosen.assignment?.assignmentId).toBe(care.id);
    expect(chosen.memberships).toHaveLength(1);
  });

  it("refuses a chosen row of another class, or not the caller's", async () => {
    mocks.headers.set("x-asym-role-class", "staff");
    const staff = row(TA, "staff", "finance");
    const donor = row(TA, "donor");
    rows(staff, donor);

    mocks.headers.set("x-asym-assignment", donor.id);
    expect((await getAuthContext()).assignmentDenial).toBe(
      "role_class_mismatch",
    );
    mocks.headers.set("x-asym-assignment", row(TB, "staff", "hr").id);
    expect((await getAuthContext()).assignmentDenial).toBe(
      "not_owned_or_inactive",
    );
  });

  it("denies a request with no surface class without reading memberships", async () => {
    mocks.headers.clear();

    const context = await getAuthContext();

    expect(context.isAuthenticated).toBe(false);
    expect(context.assignmentDenial).toBe("no_role_class");
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("gives the request the capabilities of its one assignment only", async () => {
    mocks.headers.set("x-asym-role-class", "staff");
    const finance = row(TA, "staff", "finance");
    const care = row(TA, "staff", "member_care");
    rows(finance, care);

    mocks.headers.set("x-asym-assignment", finance.id);
    const underFinance = await getAuthContext();
    expect(
      hasContextCapability(underFinance, "contributions.apply_corrections"),
    ).toBe(true);
    expect(hasContextCapability(underFinance, "care.access")).toBe(false);

    mocks.headers.set("x-asym-assignment", care.id);
    const underCare = await getAuthContext();
    expect(hasContextCapability(underCare, "care.access")).toBe(true);
    expect(
      hasContextCapability(underCare, "contributions.apply_corrections"),
    ).toBe(false);
  });

  it("gives a tenant administrator the contribution settings and administration capabilities, and staff without the flag neither", async () => {
    mocks.headers.set("x-asym-role-class", "staff");
    rows(row(TA, "staff", "hr", true));
    const admin = await getAuthContext();
    for (const capability of [
      "contributions.manage_settings",
      "people.manage_members",
      "sites.manage",
    ] as const)
      expect(hasContextCapability(admin, capability), capability).toBe(true);

    rows(row(TA, "staff", "hr"));
    const staff = await getAuthContext();
    expect(hasContextCapability(staff, "contributions.manage_settings")).toBe(
      false,
    );
    expect(hasContextCapability(staff, "people.manage_members")).toBe(false);
    expect(contextCapabilities(staff)).toContain("web_studio.edit");
  });

  it("gives a denied context no capability", async () => {
    rows(row(TA, "donor"), row(TB, "donor"));
    expect(contextCapabilities(await getAuthContext())).toEqual([]);
  });

  it("denies at the next request once the membership is revoked", async () => {
    const donor = row(TA, "donor");
    mocks.rpc
      .mockResolvedValueOnce({ data: [donor], error: null })
      .mockResolvedValueOnce({ data: [], error: null });

    expect((await getAuthContext()).isAuthenticated).toBe(true);
    expect((await getAuthContext()).isAuthenticated).toBe(false);
  });

  it("denies when the assignments read fails", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { code: "PGRST202" } });

    const context = await getAuthContext();

    expect(context.isAuthenticated).toBe(false);
    expect(context.assignmentDenial).toBe("reader_error");
  });

  it("keeps bearer identity on the same client used for profile and membership reads", async () => {
    const context = await getAuthContext(
      new Request("https://example.test/api", {
        headers: {
          authorization: "Bearer unit-test-token",
          "x-asym-role-class": "donor",
        },
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
    expect(mocks.rpc).toHaveBeenCalledOnce();
    expect(mocks.admin).not.toHaveBeenCalled();
  });

  it("denies a failed profile read even if the provider also returns data", async () => {
    mocks.profile.mockResolvedValue({
      data: { id: "profile-one" },
      error: { code: "42501" },
    });

    const context = await getAuthContext();

    expect(context.isAuthenticated).toBe(false);
    expect(mocks.rpc).not.toHaveBeenCalled();
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
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});
