import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const USER = "00000000-0000-4000-8000-0000000000a1";
const TA = "00000000-0000-0000-0000-000000000001";
const TB = "00000000-0000-0000-0000-000000000002";
const NAME = "x-asym-name-tenant";
const GEN = {
  "x-asym-name-generation": "7",
  "x-asym-scope-generation": "7",
} as const;

let next = 0x700;
function row(
  tenant: string,
  role: "donor" | "missionary" | "staff",
  staffRole: string | null = null,
) {
  next += 1;
  return {
    id: `00000000-0000-4000-8000-${next.toString(16).padStart(12, "0")}`,
    user_id: USER,
    tenant_id: tenant,
    role,
    staff_role: staffRole,
    is_tenant_admin: false,
    updated_at: "2026-11-25T09:00:00.000000+00:00",
  };
}
const P_DEV_A = row(TA, "staff", "development");
const P_FIN_A = row(TA, "staff", "finance");
const P_DEV_B = row(TB, "staff", "development");
const P_MISS_A = row(TA, "missionary");
const P_MISS_B = row(TB, "missionary");
const P = [P_DEV_A, P_FIN_A, P_DEV_B, P_MISS_A, P_MISS_B];
const R_A = row(TA, "staff", "development");
const R_B = row(TB, "staff", "development");
const R = [R_A, R_B];

function asAssignment(r: ReturnType<typeof row>) {
  return {
    assignmentId: r.id,
    userId: USER,
    tenantId: r.tenant_id,
    revision: "e2e-bypass",
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
            single: async () => ({ data: { id: "profile-p" }, error: null }),
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
    value === "e2e" ? { userId: USER, role: "staff" } : null,
}));
vi.mock("./principal/e2e-assignments", () => ({
  listE2EAuthAssignments: () => mocks.bypassRows,
}));

import { getAuthContext } from "./context";
import { readDocumentScope, readServerNameTenantState } from "./tenant-server";

function apiRequest(headers: Record<string, string>) {
  return new Request("http://localhost/api/x", {
    headers: { "x-asym-role-class": "staff", ...headers },
  });
}

function on(basePath = "/admin") {
  vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
  vi.stubEnv("CORE_APP_BASE_PATH", basePath);
}

beforeEach(() => {
  mocks.user = { id: USER };
  mocks.rows = P;
  mocks.rpcCalls = 0;
  mocks.headers.clear();
  mocks.headersCalls = 0;
  mocks.bypass = false;
  mocks.bypassRows = [];
  on();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("on: a claimed organization other than the name's is refused after sign-in (D-18, N2 part 2a: dashboard fixtures carry the name's generation and the claim)", () => {
  it.each([
    ["x-asym-tenant: B", { headers: { "x-asym-tenant": TB } }, {}],
    [
      "options.expectedTenantId of B (the media route)",
      { headers: {} },
      { expectedTenantId: TB },
    ],
    [
      "options A with x-asym-tenant: B",
      { headers: { "x-asym-tenant": TB } },
      { expectedTenantId: TA },
    ],
  ] as const)(
    "%s on name A: tenant_mismatch, scope refused, no row read",
    async (_label, input, options) => {
      const context = await getAuthContext(
        apiRequest({ [NAME]: TA, ...GEN, ...input.headers }),
        options,
      );
      expect(context.isAuthenticated).toBe(false);
      expect(context.assignmentDenial).toBe("tenant_mismatch");
      expect(context.scopeRefused).toBe(true);
      expect(mocks.rpcCalls).toBe(0);
    },
  );

  it("gives an anonymous caller the plain refusal", async () => {
    mocks.user = null;
    const context = await getAuthContext(
      apiRequest({ [NAME]: TA, "x-asym-tenant": TB }),
    );
    expect(context.isAuthenticated).toBe(false);
    expect(context.scopeRefused).toBeFalsy();
  });
});

describe("on: the name alone narrows, and proposes nothing (D-18, N2 part 2a: dashboard fixtures carry the name's generation and the claim)", () => {
  it("resolves R in A on name A and in B on name B", async () => {
    mocks.rows = R;
    for (const [name, rowId] of [
      [TA, R_A.id],
      [TB, R_B.id],
    ] as const) {
      const context = await getAuthContext(
        apiRequest({ [NAME]: name, ...GEN }),
      );
      expect(context.tenantId).toBe(name);
      expect(context.assignment?.assignmentId).toBe(rowId);
    }
  });

  it("resolves P on name B, leaves P ambiguous on name A with the plain refusal, until a row is named", async () => {
    expect(
      (await getAuthContext(apiRequest({ [NAME]: TB, ...GEN }))).tenantId,
    ).toBe(TB);
    const ambiguous = await getAuthContext(apiRequest({ [NAME]: TA, ...GEN }));
    expect(ambiguous.assignmentDenial).toBe("ambiguous");
    expect(ambiguous.scopeRefused).toBeFalsy();
    const named = await getAuthContext(
      apiRequest({ [NAME]: TA, ...GEN, "x-asym-assignment": P_FIN_A.id }),
    );
    expect(named.assignment?.assignmentId).toBe(P_FIN_A.id);
    const foreign = await getAuthContext(
      apiRequest({ [NAME]: TA, ...GEN, "x-asym-assignment": P_DEV_B.id }),
    );
    expect(foreign.isAuthenticated).toBe(false);
    expect(foreign.assignmentDenial).toBe("tenant_mismatch");
    expect(foreign.scopeRefused).toBe(true);
  });

  it("refuses P's missionary call claiming B on name A, and resolves it in A with no claim", async () => {
    const claim = await getAuthContext(
      apiRequest({
        [NAME]: TA,
        ...GEN,
        "x-asym-tenant": TB,
        "x-asym-role-class": "missionary",
      }),
    );
    expect(claim.assignmentDenial).toBe("tenant_mismatch");
    expect(claim.scopeRefused).toBe(true);
    const plain = await getAuthContext(
      apiRequest({ [NAME]: TA, ...GEN, "x-asym-role-class": "missionary" }),
    );
    expect(plain.assignment?.assignmentId).toBe(P_MISS_A.id);
  });

  it("gives a page render the name's organization from the request headers", async () => {
    mocks.rows = R;
    mocks.headers.set("x-asym-role-class", "staff");
    mocks.headers.set(NAME, TB);
    mocks.headers.set("x-asym-name-generation", "7");
    expect((await getAuthContext()).tenantId).toBe(TB);
  });
});

describe("on: a name header that cannot be trusted fails closed", () => {
  it.each([
    ["invalid", { [NAME]: "not-a-uuid" }],
    ["absent inside a dashboard", {}],
  ] as const)(
    "%s: the plain refusal, and readDocumentScope throws",
    async (_label, headers) => {
      mocks.rows = R;
      const context = await getAuthContext(apiRequest(headers));
      expect(context.isAuthenticated).toBe(false);
      expect(context.userId).toBe(USER);
      expect(context.profileId).toBe("profile-p");
      expect(context.assignmentDenial).toBe("no_assignment");
      expect(context.scopeRefused).toBeFalsy();
      expect(mocks.rpcCalls).toBe(0);
      for (const [name, value] of Object.entries(headers)) {
        mocks.headers.set(name, value);
      }
      mocks.headers.set("x-asym-address-prefix", `/${TA}`);
      await expect(
        readDocumentScope({
          userId: USER,
          email: null,
          tenantId: TA,
          role: "staff",
          memberships: [],
          assignment: asAssignment(R_A) as never,
          profileId: "profile-p",
          isAuthenticated: true,
        }),
      ).rejects.toThrow();
    },
  );

  it.each(["staff", "missionary"])(
    "refuses a %s API call on name B when the person's live rows are all in A (B suspended, or the row in B revoked): no_assignment, no scope refusal (D-18, N2 part 2a: the call carries the name's generation and the claim)",
    async (roleClass) => {
      mocks.rows = [P_DEV_A, P_FIN_A, P_MISS_A];
      const context = await getAuthContext(
        apiRequest({ [NAME]: TB, ...GEN, "x-asym-role-class": roleClass }),
      );
      expect(context.isAuthenticated).toBe(false);
      expect(context.tenantId).toBeNull();
      expect(context.assignmentDenial).toBe("no_assignment");
      expect(context.scopeRefused).toBeFalsy();
      expect(mocks.rpcCalls).toBe(1);
    },
  );

  it("refuses the same call with no role class before any row is read, as today", async () => {
    mocks.rows = [P_DEV_A, P_FIN_A, P_MISS_A];
    const context = await getAuthContext(
      new Request("http://localhost/api/x", { headers: { [NAME]: TB } }),
    );
    expect(context.isAuthenticated).toBe(false);
    expect(context.assignmentDenial).toBe("no_role_class");
    expect(context.scopeRefused).toBeFalsy();
    expect(mocks.rpcCalls).toBe(0);
  });

  it("refuses an absent header in the donor app (base path empty) with no_assignment and no scope refusal (D-18, WP3b part 1: on-mode refuses absent names in every app)", async () => {
    on("");
    mocks.rows = [R_A];
    const context = await getAuthContext(apiRequest({}));
    expect(context.isAuthenticated).toBe(false);
    expect(context.tenantId).toBeNull();
    expect(context.assignmentDenial).toBe("no_assignment");
    expect(context.scopeRefused).toBeFalsy();
    expect(mocks.rpcCalls).toBe(0);
  });
});

describe("the assistant's routes never read the name", () => {
  it.each(["/admin", ""])(
    "with nameTenant: ignore and base path %j, resolves as without the header",
    async (basePath) => {
      on(basePath);
      mocks.rows = R;
      const options = { roleClass: "staff", nameTenant: "ignore" } as const;
      const withName = await getAuthContext(
        new Request("http://localhost/eve/v1/x", { headers: { [NAME]: TA } }),
        options,
      );
      expect(withName.assignmentDenial).toBe("ambiguous");
      mocks.rows = [R_A];
      const absent = await getAuthContext(
        new Request("http://localhost/eve/v1/x"),
        options,
      );
      expect(absent.tenantId).toBe(TA);
    },
  );

  it("is what the assistant's identity passes", () => {
    const source = readFileSync(
      fileURLToPath(
        new URL(
          "../api/src/eve/session-ownership/identity.ts",
          import.meta.url,
        ),
      ),
      "utf8",
    );
    expect(source).toMatch(
      /const EVE_ADMIN_AUTH_OPTIONS = \{\s*roleClass: "staff",\s*nameTenant: "ignore",?\s*\} as const;/,
    );
  });
});

describe("on: the E2E bypass refuses the same conflicts (D-18, N2 part 2a: dashboard fixtures carry the name's generation and the claim)", () => {
  beforeEach(() => {
    mocks.user = null;
    mocks.bypass = true;
  });

  function bypassRequest(headers: Record<string, string>) {
    return new Request("http://localhost/api/x", {
      headers: { cookie: "asym_e2e_auth=e2e", ...headers },
    });
  }

  it("refuses a claim of B on name A, with or without a role class", async () => {
    mocks.bypassRows = P.map(asAssignment);
    const roleClasses: Record<string, string>[] = [
      { "x-asym-role-class": "staff" },
      {},
    ];
    for (const roleClass of roleClasses) {
      const context = await getAuthContext(
        bypassRequest({
          [NAME]: TA,
          ...GEN,
          "x-asym-tenant": TB,
          ...roleClass,
        }),
      );
      expect(context.isAuthenticated).toBe(false);
      expect(context.assignmentDenial).toBe("tenant_mismatch");
      expect(context.scopeRefused).toBe(true);
    }
  });

  it("narrows to the name before its single-row pick when there is no role class", async () => {
    mocks.bypassRows = R.map(asAssignment);
    expect((await getAuthContext(bypassRequest({}))).isAuthenticated).toBe(
      false,
    );
    const context = await getAuthContext(bypassRequest({ [NAME]: TB, ...GEN }));
    expect(context.tenantId).toBe(TB);
  });

  it("never picks the sole row of another organization", async () => {
    mocks.bypassRows = [R_A].map(asAssignment);
    expect(
      (await getAuthContext(bypassRequest({ [NAME]: TA, ...GEN }))).tenantId,
    ).toBe(TA);
    const foreign = await getAuthContext(bypassRequest({ [NAME]: TB, ...GEN }));
    expect(foreign.isAuthenticated).toBe(false);
    expect(foreign.tenantId).toBeNull();
    const staff = await getAuthContext(
      bypassRequest({ [NAME]: TB, ...GEN, "x-asym-role-class": "staff" }),
    );
    expect(staff.isAuthenticated).toBe(false);
    expect(staff.tenantId).toBeNull();
  });

  it("gives no bypass identity when the name fails closed", async () => {
    mocks.bypassRows = [R_A].map(asAssignment);
    const context = await getAuthContext(
      bypassRequest({ [NAME]: "not-a-uuid" }),
    );
    expect(context.isAuthenticated).toBe(false);
    expect(context.userId).toBeNull();
    expect(context.scopeRefused).toBeFalsy();
  });
});

describe("on: readDocumentScope compares the name (D-18, N2 part 2a: the page's headers carry the name's generation; N2 part 2b: on, the proxy's prefix is empty for one row)", () => {
  it("throws when the name's organization differs from the assignment's", async () => {
    mocks.headers.set(NAME, TA);
    mocks.headers.set("x-asym-name-generation", "7");
    mocks.headers.set("x-asym-address-prefix", "");
    await expect(
      readDocumentScope({
        userId: USER,
        email: null,
        tenantId: TB,
        role: "staff",
        memberships: [],
        assignment: asAssignment(R_B) as never,
        profileId: "profile-p",
        isAuthenticated: true,
      }),
    ).rejects.toThrow();
    mocks.headers.set(NAME, TB);
    await expect(
      readDocumentScope({
        userId: USER,
        email: null,
        tenantId: TB,
        role: "staff",
        memberships: [],
        assignment: asAssignment(R_B) as never,
        profileId: "profile-p",
        isAuthenticated: true,
      }),
    ).resolves.toMatchObject({ tenantId: TB, addressPrefix: "" });
  });
});

describe.each([
  ["unset", undefined],
  ["0", "0"],
] as const)(
  "off (switch %s): the name header changes nothing",
  (_label, value) => {
    beforeEach(() => {
      vi.stubEnv("CORE_SERVE_UNDER_PATHS", value);
      vi.stubEnv("CORE_APP_BASE_PATH", "");
    });

    it("readServerNameTenantState gives off and never calls headers()", async () => {
      mocks.headers.set(NAME, TB);
      await expect(readServerNameTenantState()).resolves.toEqual({
        kind: "off",
      });
      expect(mocks.headersCalls).toBe(0);
    });

    it.each([
      ["no claim", {}],
      ["x-asym-tenant: A", { "x-asym-tenant": TA }],
      ["an assignment of B", { "x-asym-assignment": "" }],
    ] as const)(
      "getAuthContext(request), %s, answers as without it",
      async (_label, headers) => {
        for (const rows of [P, R, [R_A]]) {
          mocks.rows = rows;
          const claims: Record<string, string> = { ...headers };
          if ("x-asym-assignment" in claims)
            claims["x-asym-assignment"] = P_DEV_B.id;
          const without = await getAuthContext(apiRequest(claims));
          const withName = await getAuthContext(
            apiRequest({ ...claims, [NAME]: TB }),
          );
          expect(withName).toEqual(without);
        }
      },
    );

    it("getAuthContext() and readDocumentScope answer as without it", async () => {
      mocks.rows = R;
      mocks.headers.set("x-asym-role-class", "staff");
      mocks.headers.set("x-asym-tenant", TA);
      const without = await getAuthContext();
      mocks.headers.set(NAME, TB);
      const withName = await getAuthContext();
      expect(withName).toEqual(without);
      expect(withName.tenantId).toBe(TA);
      mocks.headers.set("x-asym-address-prefix", `/${TA}`);
      const scope = await readDocumentScope(withName);
      mocks.headers.delete(NAME);
      expect(await readDocumentScope(without)).toEqual(scope);
    });
  },
);
