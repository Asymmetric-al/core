import { beforeEach, describe, expect, it, vi } from "vitest";

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
  connection: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
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

vi.mock("next/server", () => ({ connection: mocks.connection }));
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
  createServerClient: vi.fn(requestClient),
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
  getSignedInAssignments,
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

  it.each([
    ["the protected shell", () => getAuthContext()],
    ["the organization chooser", () => getSignedInAssignments()],
  ] as const)(
    "waits for the request before creating the session client for %s",
    async (_, readSession) => {
      const { createServerClient } = await import("@supabase/ssr");
      let releaseRequest!: () => void;
      const request = new Promise<void>((resolve) => {
        releaseRequest = resolve;
      });
      mocks.connection.mockReturnValueOnce(request);

      const result = readSession();
      await vi.waitFor(() => expect(mocks.connection).toHaveBeenCalledOnce());
      expect(createServerClient).not.toHaveBeenCalled();
      releaseRequest();
      await result;
      expect(createServerClient).toHaveBeenCalledOnce();
    },
  );

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

describe("getAuthContext: the tenant and assignment the request names", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.headers.clear();
    mocks.headers.set("x-asym-role-class", "staff");
    mocks.getUser.mockResolvedValue({
      data: { user: { id: USER, email: "staff@example.test" } },
      error: null,
    });
    mocks.profile.mockResolvedValue({
      data: { id: "profile-one" },
      error: null,
    });
  });

  it("resolves a person in two organizations in the tenant the header names", async () => {
    const inA = row(TA, "staff", "finance");
    const inB = row(TB, "staff", "development");
    rows(inA, inB);

    const unscoped = await getAuthContext();
    expect(unscoped.assignmentDenial).toBe("ambiguous");

    mocks.headers.set("x-asym-tenant", TB);
    const inTenantB = await getAuthContext();
    expect(inTenantB.isAuthenticated).toBe(true);
    expect(inTenantB.tenantId).toBe(TB);
    expect(inTenantB.assignment?.assignmentId).toBe(inB.id);

    const onApi = await getAuthContext(
      new Request("https://example.test/api/admin/x", {
        headers: { "x-asym-role-class": "staff", "x-asym-tenant": TA },
      }),
    );
    expect(onApi.tenantId).toBe(TA);
  });

  it("acts under the chosen staff row, and never under a row in another tenant", async () => {
    const finance = row(TA, "staff", "finance");
    const care = row(TA, "staff", "member_care");
    const inB = row(TB, "staff", "development");
    rows(finance, care, inB);
    mocks.headers.set("x-asym-tenant", TA);

    expect((await getAuthContext()).assignmentDenial).toBe("ambiguous");

    mocks.headers.set("x-asym-assignment", care.id);
    const chosen = await getAuthContext();
    expect(chosen.assignment?.assignmentId).toBe(care.id);
    expect(hasContextCapability(chosen, "care.access")).toBe(true);

    mocks.headers.set("x-asym-assignment", finance.id);
    const financeContext = await getAuthContext();
    expect(financeContext.assignment?.assignmentId).toBe(finance.id);
    expect(hasContextCapability(financeContext, "care.access")).toBe(false);

    mocks.headers.set("x-asym-assignment", inB.id);
    expect((await getAuthContext()).assignmentDenial).toBe("tenant_mismatch");
  });

  describe("the scope-refused mark", () => {
    const NOT_THEIRS = "00000000-0000-4000-8000-0000000000ff";

    it.each([
      [
        "not_owned_or_inactive",
        "a row that is not the caller's, or revoked",
        () => {
          rows(row(TA, "staff", "finance"));
          mocks.headers.set("x-asym-tenant", TA);
          mocks.headers.set("x-asym-assignment", NOT_THEIRS);
        },
      ],
      [
        "role_class_mismatch",
        "a row of another class than the surface's",
        () => {
          const donor = row(TA, "donor");
          rows(row(TA, "staff", "finance"), donor);
          mocks.headers.set("x-asym-tenant", TA);
          mocks.headers.set("x-asym-assignment", donor.id);
        },
      ],
      [
        "tenant_mismatch",
        "a row in another tenant than the one named",
        () => {
          const inB = row(TB, "staff", "development");
          rows(row(TA, "staff", "finance"), inB);
          mocks.headers.set("x-asym-tenant", TA);
          mocks.headers.set("x-asym-assignment", inB.id);
        },
      ],
      [
        "ambiguous",
        "a tenant named in which the caller holds two rows, and no row",
        () => {
          rows(row(TA, "staff", "finance"), row(TA, "staff", "member_care"));
          mocks.headers.set("x-asym-tenant", TA);
        },
      ],
      [
        "no_assignment",
        "a tenant named in which the caller's last row was revoked",
        () => {
          rows(row(TB, "staff", "development"));
          mocks.headers.set("x-asym-tenant", TA);
        },
      ],
    ] as const)("marks %s: %s", async (reason, _what, arrange) => {
      arrange();
      const context = await getAuthContext();
      expect(context.isAuthenticated).toBe(false);
      expect(context.assignmentDenial).toBe(reason);
      expect(context.scopeRefused).toBe(true);
    });

    it.each([
      [
        "a failed read",
        () =>
          mocks.rpc.mockResolvedValue({ data: null, error: { code: "57014" } }),
      ],
      [
        "a malformed row",
        () =>
          mocks.rpc.mockResolvedValue({
            data: [{ ...row(TA, "staff", "finance"), tenant_id: "not-a-uuid" }],
            error: null,
          }),
      ],
      [
        "a reader that throws",
        () => mocks.rpc.mockRejectedValue(new Error("connection reset")),
      ],
    ] as const)(
      "does not mark a reader_error (%s): the request fails as any other",
      async (_what, arrange) => {
        const finance = row(TA, "staff", "finance");
        arrange();
        mocks.headers.set("x-asym-tenant", TA);
        mocks.headers.set("x-asym-assignment", finance.id);
        const context = await getAuthContext();
        expect(context.isAuthenticated).toBe(false);
        expect(context.assignmentDenial).toBe("reader_error");
        expect(context.scopeRefused).not.toBe(true);
      },
    );
  });
});

describe("getSignedInAssignments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.headers.clear();
    mocks.getUser.mockResolvedValue({
      data: { user: { id: USER, email: "staff@example.test" } },
      error: null,
    });
  });

  function rpcs(
    assignments: ReturnType<typeof row>[],
    organizations: { data: unknown; error: unknown } = {
      data: [
        { tenant_id: TA, name: "Alpha Mission" },
        { tenant_id: TB, name: "Bravo Mission" },
      ],
      error: null,
    },
  ) {
    mocks.rpc.mockImplementation(async (fn: string) =>
      fn === "current_user_organizations"
        ? organizations
        : { data: assignments, error: null },
    );
  }

  it("returns every live row of the signed-in person, validated, with the names of their organizations", async () => {
    const { getSignedInAssignments } = await import("./context");
    const inA = row(TA, "staff", "finance");
    const inB = row(TB, "missionary");
    rpcs([inA, inB]);

    const result = await getSignedInAssignments();

    expect(result).toMatchObject({
      kind: "signed_in",
      userId: USER,
      assignments: [
        { assignmentId: inA.id, tenantId: TA, staffRole: "finance" },
        { assignmentId: inB.id, tenantId: TB, membershipRole: "missionary" },
      ],
    });
    expect(mocks.rpc).toHaveBeenCalledWith("current_user_organizations");
    expect(
      result.kind === "signed_in" && [...result.organizationNames],
    ).toEqual([
      [TA, "Alpha Mission"],
      [TB, "Bravo Mission"],
    ]);
  });

  it.each([
    ["a failed read", { data: null, error: { code: "PGRST202" } }],
    ["a result that is not a list", { data: { tenant_id: TA }, error: null }],
    [
      "a row whose tenant is not a UUID",
      { data: [{ tenant_id: "x", name: "Alpha Mission" }], error: null },
    ],
    [
      "a row with no name",
      { data: [{ tenant_id: TA, name: null }], error: null },
    ],
  ])(
    "reports %s of the organizations' names as unavailable, never as missing names",
    async (_label, organizations) => {
      const { getSignedInAssignments } = await import("./context");
      rpcs([row(TA, "staff", "finance")], organizations);
      await expect(getSignedInAssignments()).resolves.toEqual({
        kind: "unavailable",
      });
    },
  );

  it("fails closed on a malformed row and says so for a signed-out visitor", async () => {
    const { getSignedInAssignments } = await import("./context");
    rpcs([{ ...row(TA, "staff", "finance"), staff_role: null }]);
    await expect(getSignedInAssignments()).resolves.toEqual({
      kind: "unavailable",
    });

    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    await expect(getSignedInAssignments()).resolves.toEqual({
      kind: "signed_out",
    });
  });
});
