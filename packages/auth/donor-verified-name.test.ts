import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const USER_D = "44444444-4444-4444-4444-444444444444";
const USER_E = "11111111-1111-1111-1111-111111111111";
const TA = "00000000-0000-0000-0000-000000000001";
const TB = "00000000-0000-0000-0000-000000000002";
const NAME = "x-asym-name-tenant";

let next = 0x800;
function makeRow(
  userId: string,
  tenant: string,
  role: "donor" | "missionary" | "staff",
  staffRole: string | null = null,
) {
  next += 1;
  return {
    id: `00000000-0000-4000-8000-${next.toString(16).padStart(12, "0")}`,
    user_id: userId,
    tenant_id: tenant,
    role,
    staff_role: staffRole,
    is_tenant_admin: false,
    updated_at: "2026-11-25T09:00:00.000000+00:00",
  };
}

const D_A = makeRow(USER_D, TA, "donor");
const D_B = makeRow(USER_D, TB, "donor");
const D_A2 = makeRow(USER_D, TA, "donor");
const E_A = makeRow(USER_E, TA, "donor");
const STAFF_A = makeRow(USER_D, TA, "staff", "development");
const STAFF_B = makeRow(USER_D, TB, "staff", "development");
const MISS_A = makeRow(USER_D, TA, "missionary");
const MISS_B = makeRow(USER_D, TB, "missionary");

function asAssignment(r: ReturnType<typeof makeRow>) {
  return {
    assignmentId: r.id,
    userId: r.user_id,
    tenantId: r.tenant_id,
    revision: "rev-1",
    membershipRole: r.role,
    staffRole: r.staff_role,
    isTenantAdmin: false,
  };
}

const mocks = vi.hoisted(() => ({
  user: null as { id: string } | null,
  rows: [] as unknown[],
  rpcCalls: 0,
  headers: new Map<string, string>(),
  headersCalls: 0,
  bypass: false,
  bypassRows: [] as unknown[],
  bypassUserId: "44444444-4444-4444-4444-444444444444",
}));

function client() {
  return {
    auth: {
      getUser: async () => ({ data: { user: mocks.user }, error: null }),
    },
    from: (table: string) => {
      if (table !== "profiles") throw new Error(table);
      return {
        select: () => ({
          eq: () => ({
            single: async () => ({
              data: { id: "profile-donor" },
              error: null,
            }),
          }),
        }),
      };
    },
    rpc: async (fn: string) => {
      if (fn !== "current_user_assignments") throw new Error(fn);
      mocks.rpcCalls += 1;
      return { data: mocks.rows, error: null };
    },
  };
}

vi.mock("next/server", () => ({ connection: async () => undefined }));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    getAll: () => [],
    get: () => undefined,
    set: vi.fn(),
  }),
  headers: async () => {
    mocks.headersCalls += 1;
    return {
      get: (name: string) => mocks.headers.get(name) ?? null,
      has: (name: string) => mocks.headers.has(name),
    };
  },
}));
vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: () => ({
    url: "https://example.supabase.co",
    key: "unit-test-public-key",
  }),
}));
vi.mock("@supabase/ssr", () => ({
  createServerClient: () => client(),
  parseCookieHeader: (header: string) =>
    header
      .split(";")
      .map((pair) => pair.trim())
      .filter(Boolean)
      .map((pair) => {
        const [name, ...value] = pair.split("=");
        return { name: name!, value: value.join("=") };
      }),
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => client(),
}));
vi.mock("./e2e-auth", async (original) => ({
  ...(await original<Record<string, unknown>>()),
  isE2EAuthBypassEnabled: () => mocks.bypass,
  assertSupabaseDatasourceAllowedForE2EBypass: () => undefined,
  getE2EAuthCookieNameForRequest: () => "asym_e2e_auth",
  getE2EAuthCookieNameForProxyHost: () => "asym_e2e_auth",
  parseE2EAuthCookieValue: async (value: string | undefined) =>
    value === "e2e" ? { userId: mocks.bypassUserId, role: "donor" } : null,
}));
vi.mock("./principal/e2e-assignments", () => ({
  listE2EAuthAssignments: () => mocks.bypassRows,
}));

import {
  getAuthContext,
  scopeRefusedHeaders,
  type AuthContext,
} from "./context";
import { selectAssignment } from "./principal/assignment";
import { isNameTenantRefused } from "./request-headers";
import { resolveUserRoleFromDatabase } from "./resolve-user-role";
import {
  readDocumentScope,
  readPortalDocumentScope,
  readServerNameTenantState,
} from "./tenant-server";

function donorRequest(headers: Record<string, string>) {
  return new Request("http://localhost/api/donor/portal", {
    headers: { "x-asym-role-class": "donor", ...headers },
  });
}

function on(basePath = "") {
  vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
  vi.stubEnv("CORE_APP_BASE_PATH", basePath);
}

function authenticatedDonor(r: ReturnType<typeof makeRow>): AuthContext {
  return {
    userId: r.user_id,
    email: null,
    tenantId: r.tenant_id,
    role: "donor",
    memberships: [
      {
        tenantId: r.tenant_id,
        role: "donor",
        staffRole: null,
        isActive: true,
        isTenantAdmin: false,
      },
    ],
    assignment: asAssignment(r) as never,
    assignmentDenial: null,
    profileId: "profile-donor",
    isAuthenticated: true,
  };
}

beforeEach(() => {
  mocks.user = { id: USER_D };
  mocks.rows = [D_A, D_B];
  mocks.rpcCalls = 0;
  mocks.headers.clear();
  mocks.headersCalls = 0;
  mocks.bypass = false;
  mocks.bypassRows = [];
  mocks.bypassUserId = USER_D;
  on("");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("on: which organization a donor acts in", () => {
  it("resolves D in A on home-a and in B on home-b across getAuthContext, role check and readPortalDocumentScope", async () => {
    for (const [tenant, expectedRow] of [
      [TA, D_A],
      [TB, D_B],
    ] as const) {
      const apiContext = await getAuthContext(donorRequest({ [NAME]: tenant }));
      expect(apiContext.isAuthenticated).toBe(true);
      expect(apiContext.tenantId).toBe(tenant);
      expect(apiContext.assignment?.assignmentId).toBe(expectedRow.id);

      mocks.headers.clear();
      mocks.headers.set("x-asym-role-class", "donor");
      mocks.headers.set(NAME, tenant);
      const serverContext = await getAuthContext();
      expect(serverContext.isAuthenticated).toBe(true);
      expect(serverContext.tenantId).toBe(tenant);
      expect(serverContext.assignment?.assignmentId).toBe(expectedRow.id);

      const roleSnapshot = await resolveUserRoleFromDatabase({
        userId: USER_D,
        supabase: client() as never,
        roleClass: "donor",
        nameTenantId: tenant,
      });
      expect(roleSnapshot).toEqual({
        memberships: [
          {
            tenantId: tenant,
            role: "donor",
            staffRole: null,
            isActive: true,
            isTenantAdmin: false,
          },
        ],
      });

      await expect(readPortalDocumentScope(serverContext)).resolves.toEqual({
        userId: USER_D,
        tenantId: tenant,
        assignmentId: expectedRow.id,
        addressPrefix: "",
      });
    }
  });

  it("refuses x-asym-tenant: B or expectedTenantId: B on home-a as tenant_mismatch with scopeRefused and zero row reads", async () => {
    for (const [headers, options] of [
      [{ [NAME]: TA, "x-asym-tenant": TB }, {}],
      [{ [NAME]: TA }, { expectedTenantId: TB }],
      [{ [NAME]: TA, "x-asym-tenant": TB }, { expectedTenantId: TA }],
    ] as const) {
      mocks.rpcCalls = 0;
      const context = await getAuthContext(donorRequest(headers), options);
      expect(context.isAuthenticated).toBe(false);
      expect(context.assignmentDenial).toBe("tenant_mismatch");
      expect(context.scopeRefused).toBe(true);
      expect(scopeRefusedHeaders(context)).toEqual({
        "x-asym-scope-refused": "tenant_mismatch",
      });
      expect(mocks.rpcCalls).toBe(0);
    }
  });

  it("refuses an assignment header naming D's row in B on home-a as tenant_mismatch with scopeRefused", async () => {
    const context = await getAuthContext(
      donorRequest({ [NAME]: TA, "x-asym-assignment": D_B.id }),
    );
    expect(context.isAuthenticated).toBe(false);
    expect(context.assignmentDenial).toBe("tenant_mismatch");
    expect(context.scopeRefused).toBe(true);
    expect(scopeRefusedHeaders(context)).toEqual({
      "x-asym-scope-refused": "tenant_mismatch",
    });
  });

  it("gives an anonymous caller with a foreign claim on home-a the plain refusal", async () => {
    mocks.user = null;
    const context = await getAuthContext(
      donorRequest({ [NAME]: TA, "x-asym-tenant": TB }),
    );
    expect(context.isAuthenticated).toBe(false);
    expect(context.scopeRefused).toBeFalsy();
    expect(scopeRefusedHeaders(context)).toBeUndefined();
    expect(mocks.rpcCalls).toBe(0);
  });

  it("refuses E on home-b with no_assignment and no scope", async () => {
    mocks.user = { id: USER_E };
    mocks.rows = [E_A];
    const apiContext = await getAuthContext(donorRequest({ [NAME]: TB }));
    expect(apiContext.isAuthenticated).toBe(false);
    expect(apiContext.assignmentDenial).toBe("no_assignment");
    expect(apiContext.scopeRefused).toBeFalsy();
    expect(
      await resolveUserRoleFromDatabase({
        userId: USER_E,
        supabase: client() as never,
        roleClass: "donor",
        nameTenantId: TB,
      }),
    ).toBeNull();
    mocks.headers.set(NAME, TB);
    await expect(readPortalDocumentScope(apiContext)).resolves.toBeNull();
  });

  it("returns null from readPortalDocumentScope when an authenticated A donor context meets valid name B", async () => {
    mocks.headers.set(NAME, TB);
    await expect(
      readPortalDocumentScope(authenticatedDonor(D_A)),
    ).resolves.toBeNull();
    mocks.headers.set(NAME, TA);
    await expect(
      readPortalDocumentScope(authenticatedDonor(D_A)),
    ).resolves.toEqual({
      userId: USER_D,
      tenantId: TA,
      assignmentId: D_A.id,
      addressPrefix: "",
    });
  });

  it.each([
    ["D", USER_D, [D_A, D_B]],
    ["E", USER_E, [E_A]],
  ] as const)(
    "fails closed in the donor app on absent or invalid name for %s with zero row reads and null portal scope",
    async (_label, userId, rows) => {
      mocks.user = { id: userId };
      mocks.rows = [...rows];
      const headerCases: Record<string, string>[] = [
        {},
        { [NAME]: "not-a-uuid" },
      ];
      for (const headers of headerCases) {
        mocks.rpcCalls = 0;
        const context = await getAuthContext(donorRequest(headers));
        expect(context.isAuthenticated).toBe(false);
        expect(context.assignmentDenial).toBe("no_assignment");
        expect(context.scopeRefused).toBeFalsy();
        expect(mocks.rpcCalls).toBe(0);

        mocks.headers.clear();
        for (const [k, v] of Object.entries(headers)) mocks.headers.set(k, v);
        await expect(
          readPortalDocumentScope(authenticatedDonor(rows[0]!)),
        ).resolves.toBeNull();
      }
    },
  );

  it.each(["/admin", "/missionary"])(
    "keeps refusing absent names when basePath is %s, identical to base",
    async (basePath) => {
      on(basePath);
      expect(isNameTenantRefused({ kind: "absent" })).toBe(true);
      expect(isNameTenantRefused({ kind: "invalid" })).toBe(true);
      expect(isNameTenantRefused({ kind: "off" })).toBe(false);
      expect(isNameTenantRefused({ kind: "valid", tenantId: TA })).toBe(false);

      mocks.rows = [STAFF_A];
      mocks.rpcCalls = 0;
      const context = await getAuthContext(
        new Request("http://localhost/api/x", {
          headers: { "x-asym-role-class": "staff" },
        }),
      );
      expect(context.isAuthenticated).toBe(false);
      expect(context.assignmentDenial).toBe("no_assignment");
      expect(context.scopeRefused).toBeFalsy();
      expect(mocks.rpcCalls).toBe(0);

      mocks.headers.clear();
      mocks.headers.set("x-asym-address-prefix", `/${TA}`);
      await expect(
        readDocumentScope({
          userId: USER_D,
          email: null,
          tenantId: TA,
          role: "staff",
          memberships: [],
          assignment: asAssignment(STAFF_A) as never,
          profileId: "profile-donor",
          isAuthenticated: true,
        }),
      ).rejects.toThrow();
    },
  );

  it("keeps assistant nameTenant: ignore reading no name across empty and dashboard base paths", async () => {
    for (const basePath of ["", "/admin", "/missionary"]) {
      on(basePath);
      mocks.rows = [STAFF_A];
      const context = await getAuthContext(
        new Request("http://localhost/eve/v1/x"),
        { roleClass: "staff", nameTenant: "ignore" },
      );
      expect(context.isAuthenticated).toBe(true);
      expect(context.tenantId).toBe(TA);
    }
  });
});

describe("selectAssignment directly with nameTenantId", () => {
  const donorRows = [asAssignment(D_A), asAssignment(D_B)] as never;
  const twoDonorA = [asAssignment(D_A), asAssignment(D_A2)] as never;
  const staffRows = [asAssignment(STAFF_A), asAssignment(STAFF_B)] as never;
  const missionaryRows = [asAssignment(MISS_A), asAssignment(MISS_B)] as never;

  it("refuses donor with nameTenantId and absent or different expectedTenantId as tenant_mismatch", () => {
    expect(
      selectAssignment(donorRows, { roleClass: "donor", nameTenantId: TA }),
    ).toEqual({ ok: false, reason: "tenant_mismatch" });
    expect(
      selectAssignment(donorRows, {
        roleClass: "donor",
        nameTenantId: TA,
        expectedTenantId: TB,
      }),
    ).toEqual({ ok: false, reason: "tenant_mismatch" });
  });

  it.each(["", "not-a-uuid", "00000000-0000-0000-0000-00000000000A"])(
    "refuses donor with malformed nameTenantId %j as no_assignment",
    (bad) => {
      expect(
        selectAssignment(donorRows, {
          roleClass: "donor",
          nameTenantId: bad,
          expectedTenantId: bad,
        }),
      ).toEqual({ ok: false, reason: "no_assignment" });
    },
  );

  it("selects donor in nameTenantId when expectedTenantId matches, and keeps off-mode ambiguity without nameTenantId", () => {
    expect(
      selectAssignment(donorRows, {
        roleClass: "donor",
        nameTenantId: TA,
        expectedTenantId: TA,
      }),
    ).toEqual({ ok: true, assignment: asAssignment(D_A), selection: "sole" });
    expect(
      selectAssignment(twoDonorA, {
        roleClass: "donor",
        nameTenantId: TA,
        expectedTenantId: TA,
      }),
    ).toEqual({ ok: false, reason: "ambiguous" });
    expect(
      selectAssignment(donorRows, {
        roleClass: "donor",
        expectedTenantId: TA,
      }),
    ).toEqual({ ok: false, reason: "ambiguous" });
  });

  it("leaves staff and missionary unchanged when given nameTenantId (never read by those classes)", () => {
    for (const [roleClass, rows, expected] of [
      ["staff", staffRows, asAssignment(STAFF_A)],
      ["missionary", missionaryRows, asAssignment(MISS_A)],
    ] as const) {
      expect(
        selectAssignment(rows, {
          roleClass,
          expectedTenantId: TA,
          nameTenantId: "not-a-uuid",
        }),
      ).toEqual({ ok: true, assignment: expected, selection: "sole" });
      expect(
        selectAssignment(rows, {
          roleClass,
          expectedTenantId: TA,
          nameTenantId: TB,
        }),
      ).toEqual({ ok: true, assignment: expected, selection: "sole" });
    }
  });
});

describe("on: E2E bypass for donor follows the same rules", () => {
  beforeEach(() => {
    mocks.user = null;
    mocks.bypass = true;
    mocks.bypassRows = [asAssignment(D_A), asAssignment(D_B)];
  });

  function bypassDonor(headers: Record<string, string>) {
    return new Request("http://localhost/api/donor/portal", {
      headers: {
        cookie: "asym_e2e_auth=e2e",
        "x-asym-role-class": "donor",
        ...headers,
      },
    });
  }

  it("resolves D in A on home-a and in B on home-b", async () => {
    expect(
      (await getAuthContext(bypassDonor({ [NAME]: TA }))).assignment
        ?.assignmentId,
    ).toBe(D_A.id);
    expect(
      (await getAuthContext(bypassDonor({ [NAME]: TB }))).assignment
        ?.assignmentId,
    ).toBe(D_B.id);
  });

  it("refuses tenant and foreign assignment conflicts on home-a with scopeRefused", async () => {
    const headerCases: Record<string, string>[] = [
      { [NAME]: TA, "x-asym-tenant": TB },
      { [NAME]: TA, "x-asym-assignment": D_B.id },
    ];
    for (const headers of headerCases) {
      const context = await getAuthContext(bypassDonor(headers));
      expect(context.isAuthenticated).toBe(false);
      expect(context.assignmentDenial).toBe("tenant_mismatch");
      expect(context.scopeRefused).toBe(true);
    }
  });

  it("gives no bypass identity when the name is absent or invalid", async () => {
    const headerCases: Record<string, string>[] = [
      {},
      { [NAME]: "not-a-uuid" },
    ];
    for (const headers of headerCases) {
      const context = await getAuthContext(bypassDonor(headers));
      expect(context.isAuthenticated).toBe(false);
      expect(context.userId).toBeNull();
      expect(context.scopeRefused).toBeFalsy();
    }
  });
});

describe("on: suspended B or revoked row in B returns D's row in A only", () => {
  it("refuses D's API call, role check and portal scope on home-b while serving home-a", async () => {
    mocks.rows = [D_A];
    const onB = await getAuthContext(donorRequest({ [NAME]: TB }));
    expect(onB.isAuthenticated).toBe(false);
    expect(onB.assignmentDenial).toBe("no_assignment");
    expect(onB.scopeRefused).toBeFalsy();
    expect(
      await resolveUserRoleFromDatabase({
        userId: USER_D,
        supabase: client() as never,
        roleClass: "donor",
        nameTenantId: TB,
      }),
    ).toBeNull();
    mocks.headers.set(NAME, TB);
    await expect(readPortalDocumentScope(onB)).resolves.toBeNull();

    const onA = await getAuthContext(donorRequest({ [NAME]: TA }));
    expect(onA.isAuthenticated).toBe(true);
    expect(onA.tenantId).toBe(TA);
    mocks.headers.set(NAME, TA);
    await expect(readPortalDocumentScope(onA)).resolves.toMatchObject({
      tenantId: TA,
      assignmentId: D_A.id,
    });
  });
});

describe.each([
  ["unset", undefined],
  ["0", "0"],
] as const)(
  "off (switch %s): donor resolution and scope are today",
  (_l, v) => {
    beforeEach(() => {
      vi.stubEnv("CORE_SERVE_UNDER_PATHS", v);
      vi.stubEnv("CORE_APP_BASE_PATH", "");
    });

    it("readServerNameTenantState gives off and readPortalDocumentScope gives today's scope without calling headers()", async () => {
      mocks.headers.set(NAME, TB);
      await expect(readServerNameTenantState()).resolves.toEqual({
        kind: "off",
      });
      await expect(
        readPortalDocumentScope(authenticatedDonor(E_A)),
      ).resolves.toEqual({
        userId: USER_E,
        tenantId: TA,
        assignmentId: E_A.id,
        addressPrefix: "",
      });
      expect(mocks.headersCalls).toBe(0);
    });

    it("refuses D as ambiguous in getAuthContext(), getAuthContext(request) and role check, and resolves E in A", async () => {
      mocks.user = { id: USER_D };
      mocks.rows = [D_A, D_B];
      mocks.headers.set("x-asym-role-class", "donor");
      mocks.headers.set(NAME, TA);
      expect((await getAuthContext()).assignmentDenial).toBe("ambiguous");
      expect(
        (await getAuthContext(donorRequest({ [NAME]: TA }))).assignmentDenial,
      ).toBe("ambiguous");
      expect((await getAuthContext(donorRequest({}))).assignmentDenial).toBe(
        "ambiguous",
      );
      expect(
        await resolveUserRoleFromDatabase({
          userId: USER_D,
          supabase: client() as never,
          roleClass: "donor",
        }),
      ).toBeNull();

      mocks.user = { id: USER_E };
      mocks.rows = [E_A];
      mocks.headers.set(NAME, TB);
      expect((await getAuthContext()).tenantId).toBe(TA);
      expect(
        (await getAuthContext(donorRequest({ [NAME]: TB }))).tenantId,
      ).toBe(TA);
      expect(
        await resolveUserRoleFromDatabase({
          userId: USER_E,
          supabase: client() as never,
          roleClass: "donor",
        }),
      ).toEqual({
        memberships: [
          {
            tenantId: TA,
            role: "donor",
            staffRole: null,
            isActive: true,
            isTenantAdmin: false,
          },
        ],
      });
    });
  },
);
