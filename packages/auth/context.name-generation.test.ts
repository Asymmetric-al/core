import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const USER = "00000000-0000-4000-8000-0000000000b1";
const TA = "00000000-0000-0000-0000-000000000001";
const TB = "00000000-0000-0000-0000-000000000002";
const NAME = "x-asym-name-tenant";
const NAME_GEN = "x-asym-name-generation";
const CLAIM = "x-asym-scope-generation";

let next = 0x900;
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
    updated_at: "2026-11-26T09:00:00.000000+00:00",
  };
}
const P_DEV_A = row(TA, "staff", "development");
const P_FIN_A = row(TA, "staff", "finance");
const P_DEV_B = row(TB, "staff", "development");
const P_MISS_A = row(TA, "missionary");
const P_MISS_B = row(TB, "missionary");
const P = [P_DEV_A, P_FIN_A, P_DEV_B, P_MISS_A, P_MISS_B];
const Q_A = row(TA, "staff", "member_care");
const Q = [Q_A];

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

const network = vi.hoisted(() => {
  const reached: string[] = [];
  const fetchSpy = vi.fn(async (input: unknown) => {
    reached.push(String(input));
    throw new Error("a test reached the network");
  });
  vi.stubGlobal("fetch", fetchSpy);
  return { reached, fetchSpy };
});

const mocks = vi.hoisted(() => ({
  user: null as { id: string } | null,
  rows: [] as unknown[],
  rpcCalls: 0,
  headers: new Map<string, string>(),
  headersCalls: 0,
  bypass: false,
  bypassRows: [] as unknown[],
  headersThrow: false,
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
    if (mocks.headersThrow) throw new Error("outside a request");
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

import {
  getAuthContext,
  type AuthContext,
  type AuthContextOptions,
} from "./context";
import { readDocumentScope, readServerNameGeneration } from "./tenant-server";

type GenerationOptions = AuthContextOptions & {
  allowAbsentScopeGeneration?: true;
};

const INVALID_CLAIMS = [
  "",
  "0",
  "07",
  "+7",
  "-7",
  "7.0",
  "1e3",
  "0x7",
  "7, 7",
  "Ù§",
  "ï¼",
  "9007199254740992",
  "x",
];

function apiRequest(headers: Record<string, string>) {
  return new Request("http://localhost/api/x", {
    headers: { "x-asym-role-class": "staff", ...headers },
  });
}

function onName(
  extra: Record<string, string> = {},
  generation: string | null = "7",
) {
  return {
    [NAME]: TA,
    ...(generation === null ? {} : { [NAME_GEN]: generation }),
    ...extra,
  };
}

function resolve(
  headers: Record<string, string>,
  options: GenerationOptions = {},
) {
  return getAuthContext(apiRequest(headers), options as AuthContextOptions);
}

function expectGenerationRefused(context: AuthContext, label = "") {
  expect(context.isAuthenticated, label).toBe(false);
  expect(context.assignmentDenial, label).toBe("generation_mismatch");
  expect(context.scopeRefused, label).toBe(true);
  expect(mocks.rpcCalls, label).toBe(0);
}

function expectPlainRefusal(context: AuthContext, label = "") {
  expect(context.isAuthenticated, label).toBe(false);
  expect(context.scopeRefused, label).toBeFalsy();
  expect(mocks.rpcCalls, label).toBe(0);
}

function authOf(r: ReturnType<typeof row>): AuthContext {
  return {
    userId: USER,
    email: null,
    tenantId: r.tenant_id,
    role: "staff",
    memberships: [],
    assignment: asAssignment(r) as never,
    profileId: "profile-p",
    isAuthenticated: true,
  };
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
  mocks.headersThrow = false;
  on();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

beforeEach(() => {
  vi.stubGlobal("fetch", network.fetchSpy);
});

afterEach(() => {
  expect(network.reached.splice(0)).toEqual([]);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

describe("on: an own-API call claims the name's generation", () => {
  it("resolves P claiming A, its development row and 7 (guard)", async () => {
    const context = await resolve(
      onName({
        "x-asym-tenant": TA,
        "x-asym-assignment": P_DEV_A.id,
        [CLAIM]: "7",
      }),
    );
    expect(context.isAuthenticated).toBe(true);
    expect(context.assignment?.assignmentId).toBe(P_DEV_A.id);
  });

  it.each([
    [
      "claims tenant and row",
      { "x-asym-tenant": TA, "x-asym-assignment": P_DEV_A.id },
    ],
    ["claims no tenant or row", {}],
  ] as const)(
    "refuses another generation, each invalid value and no claim when the call %s: generation_mismatch, no row read",
    async (_label, scope) => {
      for (const claim of ["6", "8", ...INVALID_CLAIMS, null]) {
        mocks.rpcCalls = 0;
        const context = await resolve(
          onName({ ...scope, ...(claim === null ? {} : { [CLAIM]: claim }) }),
        );
        expectGenerationRefused(context, `claim ${JSON.stringify(claim)}`);
      }
    },
  );

  it("refuses a claim with a space inside, before or after, read untrimmed from a request double (guard)", async () => {
    for (const claim of ["7 7", " 7", "7 ", "\t7", "7\u00a0"]) {
      mocks.rpcCalls = 0;
      const sent: Record<string, string> = {
        "x-asym-role-class": "staff",
        ...onName({ "x-asym-assignment": P_DEV_A.id }),
        [CLAIM]: claim,
      };
      const request = {
        url: "http://localhost/api/x",
        headers: {
          get: (name: string) => sent[name.toLowerCase()] ?? null,
          has: (name: string) => name.toLowerCase() in sent,
        },
      } as unknown as Request;
      expectGenerationRefused(
        await getAuthContext(request),
        `claim ${JSON.stringify(claim)}`,
      );
    }
  });

  it("resolves each of two staff rows with 7 (guards) and refuses finance with 6", async () => {
    for (const r of [P_FIN_A, P_DEV_A]) {
      const context = await resolve(
        onName({ "x-asym-assignment": r.id, [CLAIM]: "7" }),
      );
      expect(context.assignment?.assignmentId).toBe(r.id);
    }
    mocks.rpcCalls = 0;
    expectGenerationRefused(
      await resolve(onName({ "x-asym-assignment": P_FIN_A.id, [CLAIM]: "6" })),
    );
  });

  it("resolves Q's one row with 7 alone (guard), refuses Q with no claim", async () => {
    mocks.rows = Q;
    const claimed = await resolve(onName({ [CLAIM]: "7" }));
    expect(claimed.assignment?.assignmentId).toBe(Q_A.id);
    mocks.rpcCalls = 0;
    expectGenerationRefused(await resolve(onName()));
  });

  it("resolves Q through getAuthContext() with the proxy's page headers, which carry no claim (guard)", async () => {
    mocks.rows = Q;
    mocks.headers.set("x-asym-role-class", "staff");
    mocks.headers.set(NAME, TA);
    mocks.headers.set(NAME_GEN, "7");
    const context = await getAuthContext();
    expect(context.assignment?.assignmentId).toBe(Q_A.id);
  });

  it("gives tenant_mismatch when the tenant and the generation conflict together (guard)", async () => {
    for (const claim of ["7", "6", null]) {
      mocks.rpcCalls = 0;
      const context = await resolve(
        onName({
          "x-asym-tenant": TB,
          "x-asym-assignment": P_DEV_B.id,
          ...(claim === null ? {} : { [CLAIM]: claim }),
        }),
      );
      expect(context.assignmentDenial).toBe("tenant_mismatch");
      expect(context.scopeRefused).toBe(true);
      expect(mocks.rpcCalls).toBe(0);
    }
  });
});

describe("on: the media route's <img> GET may omit the claim, never send another", () => {
  const media = {
    roleClass: "staff",
    expectedTenantId: TA,
    proposedAssignmentId: P_DEV_A.id,
    allowAbsentScopeGeneration: true,
  } as const;

  it("resolves an asset of A with no claim (guard)", async () => {
    const context = await resolve(onName(), media);
    expect(context.assignment?.assignmentId).toBe(P_DEV_A.id);
  });

  it("refuses a claim of 6", async () => {
    expectGenerationRefused(await resolve(onName({ [CLAIM]: "6" }), media));
  });
});

describe("on: a name without a trusted generation fails closed", () => {
  it.each([
    ["absent", null],
    ["x", "x"],
    ["0", "0"],
  ] as const)(
    "a valid name with the generation %s: the plain refusal, no row read",
    async (_label, generation) => {
      expectPlainRefusal(await resolve(onName({ [CLAIM]: "7" }, generation)));
      mocks.headers.set("x-asym-role-class", "staff");
      mocks.headers.set(NAME, TA);
      if (generation !== null) mocks.headers.set(NAME_GEN, generation);
      expectPlainRefusal(await getAuthContext());
    },
  );

  it("under the donor app's empty base, an absent generation answers as without it (guard)", async () => {
    on("");
    mocks.rows = Q;
    const context = await resolve(onName({}, null));
    expect(context.assignment?.assignmentId).toBe(Q_A.id);
  });

  it("gives an anonymous caller claiming 6 the plain refusal (guard)", async () => {
    mocks.user = null;
    expectPlainRefusal(await resolve(onName({ [CLAIM]: "6" })));
  });

  it("leaves the assistant's routes as today with no claim (guard)", async () => {
    mocks.rows = Q;
    const context = await getAuthContext(
      new Request("http://localhost/eve/v1/x", { headers: onName() }),
      { roleClass: "staff", nameTenant: "ignore" },
    );
    expect(context.assignment?.assignmentId).toBe(Q_A.id);
  });
});

describe("on: the E2E bypass refuses the same conflicts", () => {
  beforeEach(() => {
    mocks.user = null;
    mocks.bypass = true;
    mocks.bypassRows = P.map(asAssignment);
  });

  function bypass(headers: Record<string, string>) {
    return getAuthContext(
      new Request("http://localhost/api/x", {
        headers: {
          cookie: "asym_e2e_auth=e2e",
          "x-asym-role-class": "staff",
          ...headers,
        },
      }),
    );
  }

  it("resolves the claimed row with 7 (guard) and refuses 6 or no claim", async () => {
    const claimed = await bypass(
      onName({ "x-asym-assignment": P_DEV_A.id, [CLAIM]: "7" }),
    );
    expect(claimed.assignment?.assignmentId).toBe(P_DEV_A.id);
    for (const claim of ["6", null]) {
      const context = await bypass(
        onName({
          "x-asym-assignment": P_DEV_A.id,
          ...(claim === null ? {} : { [CLAIM]: claim }),
        }),
      );
      expect(context.isAuthenticated).toBe(false);
      expect(context.assignmentDenial).toBe("generation_mismatch");
      expect(context.scopeRefused).toBe(true);
    }
  });

  it("gives no bypass identity without a trusted generation", async () => {
    const context = await bypass(onName({ [CLAIM]: "7" }, null));
    expect(context.isAuthenticated).toBe(false);
    expect(context.userId).toBeNull();
    expect(context.scopeRefused).toBeFalsy();
  });
});

describe("on: what the generation does not cover still refuses (guards)", () => {
  it("refuses P's revoked finance row with a matching claim: not_owned_or_inactive, scope refused", async () => {
    mocks.rows = [P_DEV_A, P_DEV_B, P_MISS_A, P_MISS_B];
    const context = await resolve(
      onName({ "x-asym-assignment": P_FIN_A.id, [CLAIM]: "7" }),
    );
    expect(context.isAuthenticated).toBe(false);
    expect(context.assignmentDenial).toBe("not_owned_or_inactive");
    expect(context.scopeRefused).toBe(true);
  });

  it("resolves the development row after a call as finance: no current sub-role on the server", async () => {
    const finance = await resolve(
      onName({ "x-asym-assignment": P_FIN_A.id, [CLAIM]: "7" }),
    );
    expect(finance.assignment?.assignmentId).toBe(P_FIN_A.id);
    const development = await resolve(
      onName({ "x-asym-assignment": P_DEV_A.id, [CLAIM]: "7" }),
    );
    expect(development.assignment?.assignmentId).toBe(P_DEV_A.id);
  });
});

describe("on: readDocumentScope carries the name's generation", () => {
  beforeEach(() => {
    mocks.headers.set(NAME, TA);
    mocks.headers.set("x-asym-address-prefix", `/${TA}~finance`);
  });

  it("sets generation 7 from the trusted header", async () => {
    mocks.headers.set(NAME_GEN, "7");
    const scope = await readDocumentScope(authOf(P_FIN_A));
    expect(scope).toEqual({
      userId: USER,
      tenantId: TA,
      assignmentId: P_FIN_A.id,
      addressPrefix: `/${TA}~finance`,
      generation: 7,
    });
  });

  it.each(["/admin", "/missionary"])(
    "under %s, throws on an absent or invalid generation",
    async (basePath) => {
      on(basePath);
      await expect(readDocumentScope(authOf(P_FIN_A))).rejects.toThrow();
      for (const value of ["", "07", "x", "9007199254740992"]) {
        mocks.headers.set(NAME_GEN, value);
        await expect(readDocumentScope(authOf(P_FIN_A))).rejects.toThrow();
      }
    },
  );
});

describe.each([
  ["unset", undefined],
  ["0", "0"],
] as const)(
  "off (switch %s): the generation headers change nothing",
  (_label, value) => {
    beforeEach(() => {
      vi.stubEnv("CORE_SERVE_UNDER_PATHS", value);
      vi.stubEnv("CORE_APP_BASE_PATH", "");
    });

    const clientHeaders = { [NAME_GEN]: "6", [CLAIM]: "6" };

    it("getAuthContext(request) answers as without them, with or without other claims", async () => {
      for (const rows of [P, Q]) {
        const claimSets: Record<string, string>[] = [
          {},
          { "x-asym-tenant": TA },
          { "x-asym-tenant": TA, "x-asym-assignment": P_DEV_A.id },
        ];
        for (const claims of claimSets) {
          mocks.rows = rows;
          const without = await getAuthContext(apiRequest(claims));
          const withThem = await getAuthContext(
            apiRequest({ ...claims, ...clientHeaders }),
          );
          expect(withThem).toEqual(without);
        }
      }
    });

    it("getAuthContext() and readDocumentScope answer as without them, and the scope has today's keys", async () => {
      mocks.rows = Q;
      mocks.headers.set("x-asym-role-class", "staff");
      const without = await getAuthContext();
      for (const [name, header] of Object.entries(clientHeaders)) {
        mocks.headers.set(name, header);
      }
      const withThem = await getAuthContext();
      expect(withThem).toEqual(without);
      mocks.headers.set("x-asym-address-prefix", `/${TA}`);
      const scope = await readDocumentScope(withThem);
      expect(scope).toEqual({
        userId: USER,
        tenantId: TA,
        assignmentId: Q_A.id,
        addressPrefix: `/${TA}`,
      });
      expect(Object.keys(scope!).sort()).toEqual([
        "addressPrefix",
        "assignmentId",
        "tenantId",
        "userId",
      ]);
    });
  },
);

describe("readServerNameGeneration", () => {
  it("reads the trusted header on", async () => {
    mocks.headers.set(NAME_GEN, "7");
    await expect(readServerNameGeneration()).resolves.toEqual({
      kind: "valid",
      generation: 7,
    });
  });

  it("answers absent when the request's headers cannot be read", async () => {
    mocks.headersThrow = true;
    await expect(readServerNameGeneration()).resolves.toEqual({
      kind: "absent",
    });
  });

  it.each([undefined, "0"])(
    "answers off with the switch %j without calling headers()",
    async (value) => {
      vi.stubEnv("CORE_SERVE_UNDER_PATHS", value);
      mocks.headers.set(NAME_GEN, "7");
      await expect(readServerNameGeneration()).resolves.toEqual({
        kind: "off",
      });
      expect(mocks.headersCalls).toBe(0);
    },
  );
});
