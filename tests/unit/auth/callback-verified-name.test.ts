import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fixture = vi.hoisted(() => ({
  cookies: new Map<string, string>(),
  rows: [] as Array<{ tenant: string; role: string }>,
  rowReads: 0,
}));

vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: () => ({
    url: "https://callback-fixture.supabase.co",
    key: "fixture-anon-key",
  }),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    getAll: () =>
      Array.from(fixture.cookies, ([name, value]) => ({ name, value })),
    set: (name: string, value: string) => {
      fixture.cookies.set(name, value);
    },
  }),
}));

import { GET } from "../../../packages/api/src/auth/callback";

const TA = "00000000-0000-0000-0000-000000000001";
const TB = "00000000-0000-0000-0000-000000000002";
const USER = {
  id: "8bc2cdfd-1607-4a44-8ab8-4a972ce9b7b0",
  aud: "authenticated",
  role: "authenticated",
  email: "fixture@example.com",
  app_metadata: {},
  user_metadata: {},
  created_at: "2026-10-07T00:00:00Z",
};

const D = [
  { tenant: TA, role: "donor" },
  { tenant: TB, role: "staff" },
];
const Q = [{ tenant: TA, role: "staff" }];

function fakeAuthFetch(
  outcome: "user" | "no user" | "refused exchange" = "user",
) {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = input instanceof Request ? input.url : input.toString();
    if (url.includes("/auth/v1/token") && outcome === "refused exchange")
      return Response.json(
        { error_code: "flow_state_not_found", msg: "invalid flow state" },
        { status: 404 },
      );
    if (url.endsWith("/auth/v1/user") && outcome === "no user")
      return Response.json(
        { error_code: "unexpected_failure", msg: "unavailable" },
        { status: 500 },
      );
    if (url.includes("/auth/v1/token")) {
      return Response.json({
        access_token: "fixture-access-token",
        token_type: "bearer",
        expires_in: 3600,
        refresh_token: "fixture-refresh-token",
        user: USER,
      });
    }
    if (url.endsWith("/auth/v1/user")) return Response.json(USER);
    if (url.includes("/rest/v1/rpc/current_user_assignments")) {
      fixture.rowReads += 1;
      return Response.json(
        fixture.rows.map(({ tenant, role }, index) => ({
          id: `00000000-0000-4000-8000-00000000010${index}`,
          user_id: USER.id,
          tenant_id: tenant,
          role,
          staff_role: role === "staff" ? "development" : null,
          is_tenant_admin: false,
          updated_at: "2026-11-26T00:00:00Z",
        })),
      );
    }
    throw new Error(`Unexpected fake auth request: ${url}`);
  });
}

function callback(headers: Record<string, string>, next = "") {
  fixture.cookies.set(
    "sb-callback-fixture-auth-token-code-verifier",
    JSON.stringify("fixture-code-verifier"),
  );
  return GET(
    new Request(
      `http://localhost:25361/admin/auth/callback?code=fixture-code${next ? `&next=${encodeURIComponent(next)}` : ""}`,
      { headers: { "x-asym-role-class": "staff", ...headers } },
    ),
  );
}

beforeEach(() => {
  fixture.cookies.clear();
  fixture.rowReads = 0;
  vi.stubGlobal("fetch", fakeAuthFetch());
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("on: the staff callback picks the home among the name's organization's rows", () => {
  beforeEach(() => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
    vi.stubEnv("CORE_APP_BASE_PATH", "/admin");
  });

  it.each([
    ["/missionary", "missionary", "staff", "/admin"],
    ["/admin", "staff", "missionary", "/missionary"],
    ["", "donor", "staff", "/admin"],
    ["", "donor", "missionary", "/missionary"],
    ["/missionary", "missionary", "donor", "/donor-dashboard"],
  ])(
    "from %s (%s), a %s membership lands on %s",
    async (base, surface, role, home) => {
      vi.stubEnv("CORE_APP_BASE_PATH", base);
      fixture.rows = [{ tenant: TA, role }];
      const res = await callback({
        "x-asym-role-class": surface,
        "x-asym-name-tenant": TA,
      });
      expect(res.headers.get("location")).toBe(home);
    },
  );
  it("lands D, a donor in A and staff only in B, on the donor dashboard on A's name", async () => {
    fixture.rows = D;
    const response = await callback({ "x-asym-name-tenant": TA });
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("/donor-dashboard");
  });

  it("lands Q, staff in A, on /admin (guard)", async () => {
    fixture.rows = Q;
    const response = await callback({ "x-asym-name-tenant": TA });
    expect(response.headers.get("location")).toBe("/admin");
  });

  it.each([
    ["absent", {}],
    ["invalid", { "x-asym-name-tenant": "not-a-uuid" }],
  ] as const)(
    "falls back to next when the name state is %s, reading no row",
    async (_label, headers) => {
      fixture.rows = D;
      const response = await callback(headers, "/donors");
      expect(response.headers.get("location")).toBe("/admin/donors");
      expect(fixture.rowReads).toBe(0);
    },
  );

  it.each([
    ["/admin/donors", "/"],
    ["/missionary/profile", "/"],
    ["/administration", "/administration"],
  ])(
    "on the donor app, a person with no class and next=%s lands on %s: next stays in the donor app",
    async (next, location) => {
      vi.stubEnv("CORE_APP_BASE_PATH", "");
      fixture.rows = [];
      const response = await callback(
        { "x-asym-role-class": "donor", "x-asym-name-tenant": TA },
        next,
      );
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe(location);
    },
  );
});

function operationsCallback(
  next: string,
  headers: Record<string, string> = {},
) {
  fixture.cookies.set(
    "sb-callback-fixture-auth-token-code-verifier",
    JSON.stringify("fixture-code-verifier"),
  );
  return GET(
    new Request(
      `http://ops.test/admin/auth/callback?code=fixture-code&next=${encodeURIComponent(next)}`,
      { headers: { host: "ops.test", ...headers } },
    ),
  );
}

describe("on: the callback on an operations address", () => {
  beforeEach(() => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
    vi.stubEnv("CORE_APP_BASE_PATH", "/admin");
    vi.stubEnv("OPERATIONS_NAMES", "ops.test");
  });

  it("lands on /operator whatever next says, reading no membership", async () => {
    fixture.rows = Q;
    const response = await operationsCallback("/donors");
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("/admin/operator");
    expect(fixture.rowReads).toBe(0);
  });

  it("lands a request that carries the name by class, as today (guard)", async () => {
    fixture.rows = Q;
    const response = await operationsCallback("/donors", {
      "x-asym-name-tenant": TA,
      "x-asym-role-class": "staff",
    });
    expect(response.headers.get("location")).toBe("/admin");
  });

  it("keeps next on another host, as today (guard)", async () => {
    fixture.rows = Q;
    const response = await operationsCallback("/donors", {
      host: "other.test",
    });
    expect(response.headers.get("location")).toBe("/admin/donors");
    expect(fixture.rowReads).toBe(0);
  });

  it("lands on /operator when the exchange succeeds and no user is read, never on next", async () => {
    vi.stubGlobal("fetch", fakeAuthFetch("no user"));
    const response = await operationsCallback("/donors");
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("/admin/operator");
    expect(fixture.rowReads).toBe(0);
  });

  it("keeps next on another host when no user is read, as today (guard)", async () => {
    vi.stubGlobal("fetch", fakeAuthFetch("no user"));
    const response = await operationsCallback("/donors", {
      host: "other.test",
    });
    expect(response.headers.get("location")).toBe("/admin/donors");
  });

  it("lands a refused exchange on the sign-in page with its error (guard)", async () => {
    vi.stubGlobal("fetch", fakeAuthFetch("refused exchange"));
    const response = await operationsCallback("/donors");
    expect(response.headers.get("location")).toBe(
      "/admin/login?error=Could%20not%20authenticate",
    );
  });
});

describe.each([
  ["unset", undefined],
  ["0", "0"],
] as const)(
  "off (switch %s): an operations name keeps next (guard)",
  (_label, value) => {
    it("lands a person with no class on next", async () => {
      vi.stubEnv("CORE_SERVE_UNDER_PATHS", value);
      vi.stubEnv("CORE_APP_BASE_PATH", "");
      vi.stubEnv("OPERATIONS_NAMES", "ops.test");
      fixture.rows = [];
      const response = await operationsCallback("/donors");
      expect(response.headers.get("location")).toBe("/donors");
    });

    it("lands on next when no user is read", async () => {
      vi.stubEnv("CORE_SERVE_UNDER_PATHS", value);
      vi.stubEnv("CORE_APP_BASE_PATH", "");
      vi.stubEnv("OPERATIONS_NAMES", "ops.test");
      vi.stubGlobal("fetch", fakeAuthFetch("no user"));
      const response = await operationsCallback("/donors");
      expect(response.headers.get("location")).toBe("/donors");
    });
  },
);

describe.each([
  ["unset", undefined],
  ["0", "0"],
] as const)("off (switch %s): every row counts (guard)", (_label, value) => {
  it("lands D on / through the staff app's own class, whatever name header a client sends", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", value);
    vi.stubEnv("CORE_APP_BASE_PATH", "");
    fixture.rows = D;
    for (const headers of [{}, { "x-asym-name-tenant": TA }]) {
      const response = await callback(headers);
      expect(response.headers.get("location")).toBe("/");
    }
  });
});
