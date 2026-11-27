import { randomBytes } from "node:crypto";

import { NextRequest } from "next/server";
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  FRONT_ORIGIN_HEADER,
  FRONT_STAMP_HEADER,
  resetFrontConfigLogForTests,
  signFrontStamp,
} from "../../../packages/auth/front";
import { answerAdmittedRedirect } from "../../../packages/auth/legacy-redirects";

const USER = "00000000-0000-4000-8000-0000000000d1";
const TA = "00000000-0000-0000-0000-000000000001";
const TB = "00000000-0000-0000-0000-000000000002";
const TC = "0000000a-000b-400c-800d-00000000000e";
const NAME = "x-asym-name-tenant";
const NAME_GEN = "x-asym-name-generation";
const CLAIM = "x-asym-scope-generation";

let nextId = 0xa00;
function row(
  tenant: string,
  role: "donor" | "missionary" | "staff",
  staffRole: string | null = null,
) {
  nextId += 1;
  return {
    id: `00000000-0000-4000-8000-${nextId.toString(16).padStart(12, "0")}`,
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

type Answer = { data: unknown; error: unknown };

const network = vi.hoisted(() => {
  const reached: string[] = [];
  const fetchSpy = vi.fn(async (input: unknown) => {
    reached.push(String(input));
    throw new Error("a test reached the network");
  });
  vi.stubGlobal("fetch", fetchSpy);
  return { reached, fetchSpy };
});

const state = vi.hoisted(() => ({
  userId: null as string | null,
  rows: [] as unknown[],
  sessionReads: 0,
  rowReads: 0,
  writes: [] as string[],
  lookups: [] as string[],
  answer: (() => ({ data: [], error: null })) as (host: string) => {
    data: unknown;
    error: unknown;
  },
}));

function sessionClient() {
  return {
    auth: {
      getUser: async () => {
        state.sessionReads += 1;
        return {
          data: { user: state.userId ? { id: state.userId } : null },
          error: null,
        };
      },
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
      state.rowReads += 1;
      return { data: state.rows, error: null };
    },
  };
}

function chain(): unknown {
  return new Proxy(() => undefined, {
    get(_target, key) {
      if (key === "then") {
        return (resolve: (value: unknown) => void) =>
          resolve({ data: [], error: null, count: 0 });
      }
      return (..._args: unknown[]) => {
        if (
          typeof key === "string" &&
          ["insert", "update", "upsert", "delete"].includes(key)
        ) {
          state.writes.push(key);
        }
        return chain();
      };
    },
  });
}

vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: () => ({
    url: "https://example.supabase.co",
    key: "anon-key",
    keyType: "anon",
  }),
}));
vi.mock("@supabase/ssr", () => ({
  createServerClient: () => sessionClient(),
  parseCookieHeader: () => [],
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    rpc: (fn: string, args: { p_host: string }) => {
      if (fn !== "resolve_verified_host") throw new Error(fn);
      state.lookups.push(args.p_host);
      const answer = state.answer(args.p_host);
      return { abortSignal: () => Promise.resolve(answer) };
    },
  }),
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({ getAll: () => [], get: () => undefined }),
  headers: async () => new Headers(),
}));
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({ client: chain(), error: null }),
}));
vi.mock("next/cache", () => ({ revalidateTag: vi.fn(), updateTag: vi.fn() }));

const adminModule = await import("../../../apps/admin/proxy");
const missionaryModule = await import("../../../apps/missionary/proxy");
const donorModule = await import("../../../apps/donor/proxy");
const locations = await import("../../../packages/api/src/admin/locations");
const followerRequests =
  await import("../../../packages/api/src/follower-requests");
const posts = await import("../../../packages/api/src/posts");

function home(
  tenantId: string,
  generation: number,
  overrides: Record<string, unknown> = {},
): Answer {
  return {
    data: [
      {
        tenant_id: tenantId,
        site_id: null,
        generation,
        surfaces: ["website", "donor_account", "staff", "missionary"],
        state: "active",
        is_home: true,
        ...overrides,
      },
    ],
    error: null,
  };
}

const ORIGIN = "http://a.test";
const HOST = "a.test";
const ADMIN_INTERNAL = "http://localhost:25361";
const MISSIONARY_INTERNAL = "http://localhost:25362";

type App = "admin" | "missionary";
type Init = {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
};

let keys: Record<App, string>;

function freshKey() {
  return randomBytes(32).toString("hex").slice(0, 32);
}

function internalOf(app: App) {
  return app === "admin" ? ADMIN_INTERNAL : MISSIONARY_INTERNAL;
}

function proxyOf(app: App) {
  return app === "admin" ? adminModule.proxy : missionaryModule.proxy;
}

function selectApp(app: App) {
  vi.stubEnv("CORE_APP_BASE_PATH", `/${app}`);
  vi.stubEnv("FRONT_STAMP_KEY", keys[app]);
}

async function stamped(app: App, path: string, init: Init = {}) {
  selectApp(app);
  const stamp = await signFrontStamp(ORIGIN, `/${app}`, keys[app]);
  const internal = internalOf(app);
  const request = new NextRequest(`${internal}/${app}${path}`, {
    ...init,
    headers: {
      host: internal.slice("http://".length),
      [FRONT_ORIGIN_HEADER]: ORIGIN,
      [FRONT_STAMP_HEADER]: stamp,
      ...init.headers,
    },
    nextConfig: { basePath: `/${app}` },
  });
  return proxyOf(app)(request);
}

function forwarded(response: Response, name: string) {
  return response.headers.get(`x-middleware-request-${name}`);
}

function forwardedHeaders(response: Response): Headers {
  const names = (response.headers.get("x-middleware-override-headers") ?? "")
    .split(",")
    .filter(Boolean);
  const headers = new Headers();
  for (const name of names) {
    const value = forwarded(response, name);
    if (value !== null) headers.set(name, value);
  }
  return headers;
}

function handed(response: Response, url: string, init: Init = {}) {
  expect(response.headers.get("x-middleware-next")).toBe("1");
  return new NextRequest(url, {
    method: init.method,
    body: init.body,
    headers: forwardedHeaders(response),
  });
}

function expectNotFound(response: Response, label = "") {
  expect(response.status, label).toBe(404);
  expect(response.headers.get("cache-control"), label).toBe("no-store");
  expect(response.headers.get("location"), label).toBeNull();
  expect(response.headers.get("set-cookie"), label).toBeNull();
}

function expectRedirect(
  response: Response,
  status: number,
  location: string,
  label = "",
) {
  expect(response.status, label).toBe(status);
  expect(response.headers.get("location"), label).toBe(location);
  expect(response.headers.get("set-cookie"), label).toBeNull();
}

beforeEach(() => {
  resetFrontConfigLogForTests();
  keys = { admin: freshKey(), missionary: freshKey() };
  state.userId = USER;
  state.rows = P;
  state.sessionReads = 0;
  state.rowReads = 0;
  state.writes = [];
  state.lookups = [];
  state.answer = () => home(TA, 7);
  vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
  vi.stubEnv("FRONT_STAMP_KEY_PREVIOUS", "");
  selectApp("admin");
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

const CLIENT = { [NAME_GEN]: "6", [CLAIM]: "6" };

describe("on: the proxies hand the name's generation to the handler", () => {
  const cases: Array<[App, string, string, boolean]> = [
    ["admin", "a page", "/login", false],
    [
      "admin",
      "the tenant rewrite (D-18, N2 part 2b: at /~development, without A's ID)",
      "/~development/donors",
      false,
    ],
    ["admin", "/api/x", "/api/x", true],
    ["admin", "/web-studio/api/x", "/web-studio/api/x", true],
    ["missionary", "a page", "/login", false],
    [
      "missionary",
      "the tenant rewrite (D-18, N2 part 2b: at the bare path, without A's ID)",
      "/feed",
      false,
    ],
    ["missionary", "/api/x", "/api/x", true],
  ];

  it.each(cases)(
    "%s, %s: the trusted 7 replaces a client's 6; the client's claim is %s",
    async (app, _label, path, keepsClaim) => {
      if (path === "/login") state.userId = null;
      const response = await stamped(app, path, { headers: CLIENT });
      expect(response.status).toBe(200);
      expect(forwarded(response, NAME)).toBe(TA);
      expect(forwarded(response, NAME_GEN)).toBe("7");
      expect(forwarded(response, CLAIM)).toBe(keepsClaim ? "6" : null);
    },
  );

  it("the donor app sets no generation (guard)", async () => {
    vi.stubEnv("CORE_APP_BASE_PATH", "");
    const request = new NextRequest(`${ORIGIN}/api/x`, {
      headers: { host: HOST },
    });
    const response = await donorModule.proxy(request);
    expect(forwarded(response, NAME)).toBe(TA);
    expect(forwarded(response, NAME_GEN)).toBeNull();
  });
});

const STALE: Array<
  [App, "GET" | "POST", string, (r: NextRequest) => Promise<Response>]
> = [
  ["admin", "GET", "/api/admin/locations", (r) => locations.GET(r)],
  ["admin", "POST", "/api/admin/locations", (r) => locations.POST(r)],
  [
    "missionary",
    "GET",
    "/api/follower-requests",
    (r) => followerRequests.GET(r),
  ],
  ["missionary", "POST", "/api/posts", (r) => posts.POST(r)],
];

function claimInit(
  method: "GET" | "POST",
  tenant: string,
  rowId: string,
  claim: string | null,
): Init {
  return {
    method,
    headers: {
      "x-asym-tenant": tenant,
      "x-asym-assignment": rowId,
      ...(claim === null ? {} : { [CLAIM]: claim }),
      ...(method === "POST"
        ? { origin: ORIGIN, "content-type": "application/json" }
        : {}),
    },
    ...(method === "POST" ? { body: "{}" } : {}),
  };
}

async function call(
  app: App,
  method: "GET" | "POST",
  path: string,
  handler: (r: NextRequest) => Promise<Response>,
  tenant: string,
  rowId: string,
  claim: string | null,
) {
  const init = claimInit(method, tenant, rowId, claim);
  const response = await stamped(app, path, init);
  const request = handed(response, `${internalOf(app)}/${app}${path}`, init);
  state.rowReads = 0;
  state.writes = [];
  return handler(request);
}

describe("on: a stale tab's read and write are refused, through each proxy", () => {
  it.each(STALE)(
    "%s %s: claim 7 after the name moved to 8 is refused, 8 is served, and B at 9 is another organization",
    async (app, method, path, handler) => {
      const rowId = app === "admin" ? P_DEV_A.id : P_MISS_A.id;
      state.answer = () => home(TA, 8);

      const stale = await call(app, method, path, handler, TA, rowId, "7");
      expect(stale.status).toBe(401);
      expect(stale.headers.get("x-asym-scope-refused")).toBe(
        "generation_mismatch",
      );
      expect(state.rowReads).toBe(0);
      expect(state.writes).toEqual([]);

      const fresh = await call(app, method, path, handler, TA, rowId, "8");
      expect(fresh.headers.get("x-asym-scope-refused")).toBeNull();
      expect(fresh.status).not.toBe(401);
      expect(state.rowReads).toBe(1);

      state.answer = () => home(TB, 9);
      const moved = await call(app, method, path, handler, TA, rowId, "8");
      expect(moved.status).toBe(401);
      expect(moved.headers.get("x-asym-scope-refused")).toBe("tenant_mismatch");
      expect(state.rowReads).toBe(0);
    },
  );
});

describe("on: one GET and one POST of each dashboard answer generation_mismatch marked", () => {
  it.each(STALE)("%s %s", async (app, method, path, handler) => {
    selectApp(app);
    const roleClass = app === "admin" ? "staff" : "missionary";
    const init = claimInit(
      method,
      TA,
      app === "admin" ? P_DEV_A.id : P_MISS_A.id,
      "6",
    );
    const request = new NextRequest(`${internalOf(app)}/${app}${path}`, {
      method: init.method,
      body: init.body,
      headers: {
        ...init.headers,
        "x-asym-role-class": roleClass,
        [NAME]: TA,
        [NAME_GEN]: "7",
      },
    });
    const response = await handler(request);
    expect(response.status).toBe(401);
    expect(response.headers.get("x-asym-scope-refused")).toBe(
      "generation_mismatch",
    );
    expect(state.rowReads).toBe(0);
  });
});

describe("on: what the generation does not cover still refuses before any session read (guards)", () => {
  it.each([
    ["not home", { is_home: false }],
    ["without the surface", { surfaces: ["website", "donor_account"] }],
  ] as const)("a.test at 7 %s: 404 no-store", async (_label, overrides) => {
    state.answer = () => home(TA, 7, overrides);
    for (const app of ["admin", "missionary"] as const) {
      const response = await stamped(
        app,
        "/api/x",
        claimInit("GET", TA, P_DEV_A.id, "7"),
      );
      expectNotFound(response, app);
    }
    expect(state.sessionReads).toBe(0);
  });
});

describe("on: the configuration's redirects answer only after the name is admitted", () => {
  const ADMITTED: Array<[App, string, number, string]> = [
    ["admin", "/mc", 307, `${ORIGIN}/admin`],
    ["admin", "/mc/", 307, `${ORIGIN}/admin`],
    ["admin", "/mc/x?y=1", 307, `${ORIGIN}/admin/x?y=1`],
    ["admin", "/MC/x", 307, `${ORIGIN}/admin/x`],
    [
      "admin",
      "/api/media/file/a.png?width=640",
      307,
      `${ORIGIN}/admin/web-studio/api/media/file/a.png?width=640`,
    ],
    ["admin", "/donors/", 308, `${ORIGIN}/admin/donors`],
    ["admin", "/mc/x/", 308, `${ORIGIN}/admin/mc/x`],
    ["missionary", "/ministry-updates", 308, `${ORIGIN}/missionary/feed`],
    ["missionary", "/email-studio", 308, `${ORIGIN}/missionary/feed`],
    ["missionary", "/donors/", 308, `${ORIGIN}/missionary/donors`],
  ];

  it.each(ADMITTED)(
    "%s %s: %i to %s, no session read",
    async (app, path, status, location) => {
      const response = await stamped(app, path);
      expectRedirect(response, status, location);
      expect(state.sessionReads).toBe(0);
    },
  );

  it.each([
    ["admin", "/mc//evil.com"],
    ["admin", "/mc/\\evil.com"],
  ] as const)("%s %s: 404 no-store", async (app, path) => {
    expectNotFound(await stamped(app, path));
    expect(state.sessionReads).toBe(0);
  });

  it("refuses a destination that still holds a backslash, which a parsed request never carries (a request double): 404 no-store", () => {
    const request = {
      nextUrl: {
        pathname: "/mc/\\evil.com",
        search: "",
        basePath: "/admin",
        origin: ADMIN_INTERNAL,
      },
    } as unknown as NextRequest;
    const response = answerAdmittedRedirect(request, [
      { source: "/mc/:path*", destination: "/:path*", permanent: false },
    ]);
    expect(response).not.toBeNull();
    expectNotFound(response!);
  });

  it.each([
    [TA, `/${TA}/ministry-updates`],
    [TA, `/${TB}/ministry-updates`],
    [TC, `/${TC.toUpperCase()}/ministry-updates`],
    [TA, `/${TA}~finance/ministry-updates`],
  ])(
    "missionary, the name's organization %s, %s: not answered by the table, 404 no-store (D-18, N2 part 2b: the table's form with an organization answers nothing on, R4)",
    async (tenantId, path) => {
      state.answer = () => home(tenantId, 7);
      const response = await stamped("missionary", path);
      expectNotFound(response);
      expect(state.sessionReads).toBe(0);
    },
  );

  it.each([
    ["refused", () => ({ data: [], error: null }), 404],
    ["unavailable", () => ({ data: null, error: { message: "down" } }), 503],
  ] as const)(
    "a %s name answers %i to every redirect path (guard)",
    async (_label, answer, status) => {
      state.answer = answer;
      for (const [app, path] of [
        ["admin", "/mc"],
        ["admin", "/mc/"],
        ["admin", "/donors/"],
        ["admin", "/api/media/file/a.png"],
        ["missionary", "/ministry-updates"],
        ["missionary", `/${TA}/ministry-updates`],
      ] as const) {
        const response = await stamped(app, path);
        expect(response.status, `${app} ${path}`).toBe(status);
        expect(response.headers.get("location")).toBeNull();
      }
      expect(state.sessionReads).toBe(0);
    },
  );

  it("answers an exempt path at either slash form before the lookup (guard)", async () => {
    for (const path of ["/api/webhooks/stripe", "/api/webhooks/stripe/"]) {
      const request = new NextRequest(`${ADMIN_INTERNAL}/admin${path}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}",
        nextConfig: { basePath: "/admin" },
      });
      const response = await adminModule.proxy(request);
      expect(response.headers.get("location"), path).toBeNull();
    }
    expect(state.lookups).toEqual([]);
  });
});

describe.each([
  ["unset", undefined],
  ["0", "0"],
] as const)(
  "off (switch %s): the proxies set no generation",
  (_label, value) => {
    beforeEach(() => {
      vi.stubEnv("CORE_SERVE_UNDER_PATHS", value);
      vi.stubEnv("CORE_APP_BASE_PATH", "");
    });

    it.each(["admin", "missionary"] as const)(
      "%s: no lookup, no trusted generation, and a client's copy of it is removed",
      async (app) => {
        state.userId = null;
        for (const path of ["/login", "/api/x"]) {
          const request = new NextRequest(`${internalOf(app)}${path}`, {
            headers: CLIENT,
          });
          const response = await proxyOf(app)(request);
          expect(forwarded(response, NAME_GEN), path).toBeNull();
          expect(forwarded(response, CLAIM), path).toBe(
            path === "/api/x" ? "6" : null,
          );
        }
        expect(state.lookups).toEqual([]);
      },
    );

    it.each([
      ["admin", "/mc"],
      ["missionary", "/ministry-updates"],
    ] as const)(
      "%s %s: the proxy answers no configuration redirect (guard)",
      async (app, path) => {
        state.userId = null;
        const response = await proxyOf(app)(
          new NextRequest(`${internalOf(app)}${path}`),
        );
        expect(response.status).not.toBe(308);
        expect(response.headers.get("location") ?? "").not.toMatch(/\/feed$/);
        expect(
          new URL(response.headers.get("location") ?? "http://x/").pathname,
        ).not.toBe("/");
      },
    );
  },
);
