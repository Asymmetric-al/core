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
import {
  signWebStudioSelection,
  WEB_STUDIO_TENANT_COOKIE,
} from "../../../packages/auth/web-studio";

const USER = "00000000-0000-4000-8000-0000000000e1";
const TA = "00000000-0000-0000-0000-000000000001";
const TB = "00000000-0000-0000-0000-000000000002";
const NAME_GEN = "x-asym-name-generation";
const PREFIX = "x-asym-address-prefix";
const PAYLOAD_SECRET = "unit-test-address-without-id-secret";

let nextId = 0xe00;
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
const Q_CARE_A = row(TA, "staff", "member_care");
const Q = [Q_CARE_A];
const D = [row(TA, "donor"), row(TB, "staff", "development")];

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
  lookups: [] as string[],
}));

vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: () => ({
    url: "https://example.supabase.co",
    key: "anon-key",
    keyType: "anon",
  }),
}));
vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: {
      getUser: async () => {
        state.sessionReads += 1;
        return {
          data: { user: state.userId ? { id: state.userId } : null },
          error: null,
        };
      },
    },
    rpc: async (fn: string) => {
      if (fn === "caller_is_platform_operator") {
        return { data: false, error: null };
      }
      if (fn !== "current_user_assignments") throw new Error(fn);
      return { data: state.rows, error: null };
    },
  }),
  parseCookieHeader: () => [],
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    rpc: (fn: string, args: { p_host: string }) => {
      if (fn !== "resolve_verified_host") throw new Error(fn);
      state.lookups.push(args.p_host);
      return {
        abortSignal: () =>
          Promise.resolve({
            data: [
              {
                tenant_id: TA,
                site_id: null,
                generation: 7,
                surfaces: ["website", "donor_account", "staff", "missionary"],
                state: "active",
                is_home: true,
              },
            ],
            error: null,
          }),
      };
    },
  }),
}));

const adminModule = await import("../../../apps/admin/proxy");
const missionaryModule = await import("../../../apps/missionary/proxy");

const ORIGIN = "http://a.test";
const ADMIN_INTERNAL = "http://localhost:25371";
const MISSIONARY_INTERNAL = "http://localhost:25372";

type App = "admin" | "missionary";
let keys: Record<App, string>;

function internalOf(app: App) {
  return app === "admin" ? ADMIN_INTERNAL : MISSIONARY_INTERNAL;
}

function selectApp(app: App) {
  vi.stubEnv("CORE_APP_BASE_PATH", `/${app}`);
  vi.stubEnv("FRONT_STAMP_KEY", keys[app]);
}

async function stamped(
  app: App,
  path: string,
  headers: Record<string, string> = {},
) {
  selectApp(app);
  const stamp = await signFrontStamp(ORIGIN, `/${app}`, keys[app]);
  const internal = internalOf(app);
  const request = new NextRequest(`${internal}/${app}${path}`, {
    headers: {
      host: internal.slice("http://".length),
      [FRONT_ORIGIN_HEADER]: ORIGIN,
      [FRONT_STAMP_HEADER]: stamp,
      ...headers,
    },
    nextConfig: { basePath: `/${app}` },
  });
  return (app === "admin" ? adminModule.proxy : missionaryModule.proxy)(
    request,
  );
}

function forwarded(response: Response, name: string) {
  return response.headers.get(`x-middleware-request-${name}`);
}

function expectNotFound(response: Response, label = "") {
  expect(response.status, label).toBe(404);
  expect(response.headers.get("cache-control"), label).toBe("no-store");
  expect(response.headers.get("location"), label).toBeNull();
  expect(response.headers.get("set-cookie"), label).toBeNull();
  expect(response.headers.get("x-middleware-rewrite"), label).toBeNull();
}

function expectServed(
  response: Response,
  app: App,
  innerPath: string,
  assignmentId: string,
  prefix: string,
) {
  expect(response.headers.get("location")).toBeNull();
  expect(response.headers.get("x-middleware-rewrite")).toBe(
    `${internalOf(app)}/${app}${innerPath === "/" ? "" : innerPath}`,
  );
  expect(forwarded(response, "x-asym-tenant")).toBe(TA);
  expect(forwarded(response, "x-asym-assignment")).toBe(assignmentId);
  expect(forwarded(response, PREFIX)).toBe(prefix);
  expect(forwarded(response, NAME_GEN)).toBe("7");
}

function location(response: Response) {
  return response.headers.get("location");
}

async function studioCookie(assignmentId: string, tenantId = TA) {
  const value = await signWebStudioSelection(
    { tenantId, assignmentId },
    PAYLOAD_SECRET,
  );
  return `${WEB_STUDIO_TENANT_COOKIE}=${value}`;
}

beforeEach(() => {
  resetFrontConfigLogForTests();
  keys = {
    admin: randomBytes(32).toString("hex").slice(0, 32),
    missionary: randomBytes(32).toString("hex").slice(0, 32),
  };
  state.userId = USER;
  state.rows = P;
  state.sessionReads = 0;
  state.lookups = [];
  vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
  vi.stubEnv("FRONT_STAMP_KEY_PREVIOUS", "");
  vi.stubEnv("PAYLOAD_SECRET", PAYLOAD_SECRET);
  vi.stubEnv("OPERATIONS_NAMES", "ops.example.test");
  vi.stubGlobal("fetch", network.fetchSpy);
});

afterEach(() => {
  vi.unstubAllEnvs();
  expect(network.reached.splice(0)).toEqual([]);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

describe("on: one row of the surface works at the bare path", () => {
  it("serves Q at /admin/donors as Q's row, prefix empty, generation 7 (base: a redirect to /admin/<A>/donors)", async () => {
    state.rows = Q;
    expectServed(
      await stamped("admin", "/donors"),
      "admin",
      "/donors",
      Q_CARE_A.id,
      "",
    );
  });

  it("serves Q's home at /admin with no redirect (base: a redirect to /admin/<A>)", async () => {
    state.rows = Q;
    expectServed(await stamped("admin", ""), "admin", "/", Q_CARE_A.id, "");
  });

  it("serves P's one missionary row at /missionary/feed, prefix empty (base: a redirect to /missionary/<A>/feed)", async () => {
    expectServed(
      await stamped("missionary", "/feed"),
      "missionary",
      "/feed",
      P_MISS_A.id,
      "",
    );
  });

  it.each([
    ["/~member_care/donors?x=1", "/admin/donors?x=1"],
    ["/~finance/x", "/admin/x"],
    ["/~member_care", "/admin"],
    ["/~development/donors?a=1&b=2", "/admin/donors?a=1&b=2"],
  ])(
    "sends Q at /admin%s to %s, 307 no-store after the membership read, never under the named row (D-18: ruling 2 of 27 November, plan line 876; base: 404 no-store)",
    async (path, target) => {
      state.rows = Q;
      const response = await stamped("admin", path);
      expect(response.status, path).toBe(307);
      expect(response.headers.get("cache-control"), path).toBe("no-store");
      expect(location(response), path).toBe(`${ORIGIN}${target}`);
      expect(response.headers.get("x-middleware-rewrite"), path).toBeNull();
      expect(forwarded(response, "x-asym-assignment"), path).toBeNull();
      expect(state.sessionReads, path).toBeGreaterThan(0);
    },
  );

  it("sends P's one missionary row at /missionary/~development/feed?x=1 to /missionary/feed?x=1, 307 no-store after the membership read (D-18: ruling 2; base: 404 before any session read)", async () => {
    const response = await stamped("missionary", "/~development/feed?x=1");
    expect(response.status).toBe(307);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(location(response)).toBe(`${ORIGIN}/missionary/feed?x=1`);
    expect(forwarded(response, "x-asym-assignment")).toBeNull();
    expect(state.sessionReads).toBeGreaterThan(0);
  });

  it("still answers a sub-role in front of a root outside the segment 404 no-store before any session read (guard)", async () => {
    for (const [app, path] of [
      ["admin", "/~finance/login"],
      ["missionary", "/~development/login"],
    ] as Array<[App, string]>) {
      state.sessionReads = 0;
      expectNotFound(await stamped(app, path), path);
      expect(state.sessionReads, path).toBe(0);
    }
  });
});

describe("on: several staff rows work under /~<sub-role>", () => {
  it("serves P at /admin/~finance/gifts as P's finance row, prefix /~finance (base: a redirect)", async () => {
    expectServed(
      await stamped("admin", "/~finance/gifts"),
      "admin",
      "/gifts",
      P_FIN_A.id,
      "/~finance",
    );
    expectServed(
      await stamped("admin", "/~development"),
      "admin",
      "/",
      P_DEV_A.id,
      "/~development",
    );
  });

  it.each([
    ["/gifts", "/gifts"],
    ["", "/"],
    ["/~member_care/x", "/x"],
    ["/~Finance/x", "/~Finance/x"],
  ])(
    "sends P at /admin%s to the chooser with next %s and no tenant (base: an ID in the address)",
    async (path, next) => {
      const response = await stamped("admin", path);
      expect(response.status, path).toBe(307);
      const target = new URL(location(response)!);
      expect(target.origin).toBe(ORIGIN);
      expect(target.pathname).toBe("/admin/choose-organization");
      expect([...target.searchParams.keys()]).toEqual(["next"]);
      expect(target.searchParams.get("next")).toBe(next);
      expect(location(response)).not.toContain(TA);
      expect(location(response)).not.toContain(TB);
    },
  );

  it("refuses D, who holds no staff row in A, as today and shows nothing of B (guard)", async () => {
    state.rows = D;
    const response = await stamped("admin", "/x");
    expect(location(response)).toBe(`${ORIGIN}/admin/no-access`);
    expect(location(response)).not.toContain(TB);
  });
});

describe("on: an organization ID in the address is 404 no-store, before any session read", () => {
  it.each([
    ["admin", `/${TA}/donors`],
    ["admin", `/${TA}~finance/x`],
    ["admin", `/${TA.toUpperCase()}/x`],
    ["admin", `/${TA}/`],
    ["admin", `/${TB}/`],
    ["admin", `/${TA}`],
    ["missionary", `/${TA}/feed`],
    ["missionary", `/${TA}/ministry-updates`],
    ["missionary", `/${TA}/`],
  ] as Array<[App, string]>)(
    "%s %s (base: A's paths are answered, a trailing slash earns a 308)",
    async (app, path) => {
      expectNotFound(await stamped(app, path), path);
      expect(state.sessionReads, path).toBe(0);
    },
  );
});

describe("on: another organization's ID stays refused as in part 1", () => {
  it("answers /admin/<B>/donors 404 no-store before any session read (guard)", async () => {
    expectNotFound(await stamped("admin", `/${TB}/donors`));
    expect(state.sessionReads).toBe(0);
  });
});

describe("on: a sub-role laid over a path outside the segment is 404 no-store, before any session read", () => {
  it.each([
    ["admin", "/~finance/operator"],
    ["admin", "/~finance/%6Fperator"],
    ["admin", "/~finance/login"],
    ["admin", "/~finance/web-studio"],
    ["admin", "/~finance/web-studio/api/pages"],
    ["admin", "/~finance/api/x"],
    ["admin", "/~finance/choose-organization"],
    ["admin", "/~finance/login/"],
    ["admin", "/~finance//operator"],
    ["admin", "/~finance/%2foperator"],
    ["admin", "/~finance//login"],
    ["missionary", "/~development/login"],
  ] as Array<[App, string]>)(
    "%s %s (base: a 308, a 307, or a 404 without no-store)",
    async (app, path) => {
      expectNotFound(await stamped(app, path), path);
      expect(state.sessionReads, path).toBe(0);
    },
  );

  it("keeps the operator check first: /~finance/operator is refused before the name is looked up", async () => {
    for (const path of [
      "/~finance/operator",
      "/~finance/%6Fperator",
      "/~finance//operator",
      "/~finance/%2foperator",
    ]) {
      state.lookups = [];
      expectNotFound(await stamped("admin", path), path);
      expect(state.lookups, path).toEqual([]);
    }
  });
});

describe("on: Web Studio's entry carries the sub-role only (R7)", () => {
  it("opens Web Studio without the parameter when role names the cookie's row (base: role is ignored)", async () => {
    const response = await stamped("admin", "/web-studio?role=finance", {
      cookie: await studioCookie(P_FIN_A.id),
    });
    expect(response.status).toBe(307);
    expect(location(response)).toBe(`${ORIGIN}/admin/web-studio`);
    expect(response.headers.get("set-cookie") ?? "").not.toContain(
      WEB_STUDIO_TENANT_COOKIE,
    );
  });

  it.each([
    ["the cookie on the development row", "?role=finance", P_DEV_A.id],
    ["no cookie", "?role=finance", null],
    ["another case", "?role=Finance", P_FIN_A.id],
    ["two role values", "?role=finance&role=finance", P_FIN_A.id],
    ["an empty role", "?role=", P_FIN_A.id],
  ])(
    "sends %s to Web Studio's chooser with next kept, never from, cookie unchanged (base: served)",
    async (_label, query, assignmentId) => {
      const response = await stamped(
        "admin",
        `/web-studio/collections/pages${query}`,
        {
          ...(assignmentId ? { cookie: await studioCookie(assignmentId) } : {}),
        },
      );
      expect(response.status).toBe(307);
      const target = new URL(location(response)!);
      expect(target.pathname).toBe("/admin/web-studio/organization");
      expect(target.searchParams.get("next")).toBe(
        "/web-studio/collections/pages",
      );
      expect(target.searchParams.has("from")).toBe(false);
      expect(target.searchParams.has("refused")).toBe(false);
      expect(response.headers.get("set-cookie") ?? "").not.toContain(
        WEB_STUDIO_TENANT_COOKIE,
      );
    },
  );

  it("marks the chooser refused when the cookie names another organization", async () => {
    const response = await stamped("admin", "/web-studio?role=development", {
      cookie: await studioCookie(P_DEV_B.id, TB),
    });
    const target = new URL(location(response)!);
    expect(target.pathname).toBe("/admin/web-studio/organization");
    expect(target.searchParams.get("refused")).toBe("1");
    expect(target.searchParams.has("from")).toBe(false);
  });

  it("ignores organization and assignment: with an A cookie Web Studio opens in A", async () => {
    const response = await stamped(
      "admin",
      `/web-studio?organization=${TB}&assignment=${P_DEV_B.id}`,
      { cookie: await studioCookie(P_DEV_A.id) },
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("ignores organization and assignment: with no cookie P is asked, with no from (base: from=<B> dropped, but the entry decides)", async () => {
    const response = await stamped(
      "admin",
      `/web-studio?organization=${TA}&assignment=${P_DEV_A.id}`,
    );
    const target = new URL(location(response)!);
    expect(target.pathname).toBe("/admin/web-studio/organization");
    expect(target.searchParams.has("from")).toBe(false);
  });

  it("keeps no ID in the sign-in address of a signed-out entry (guard)", async () => {
    state.userId = null;
    const response = await stamped("admin", "/web-studio?role=finance");
    const target = new URL(location(response)!);
    expect(target.pathname).toBe("/admin/login");
    expect(target.searchParams.get("next")).toBe("/web-studio?role=finance");
  });
});

describe("off: every case above is as today (guards)", () => {
  async function plain(path: string) {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "0");
    vi.stubEnv("CORE_APP_BASE_PATH", "");
    return adminModule.proxy(
      new NextRequest(`http://localhost:3030${path}`, {
        headers: { host: "localhost:3030", [PREFIX]: "", [NAME_GEN]: "6" },
      }),
    );
  }

  it("lands, decides and rewrites with the organization in the address, and reads no name", async () => {
    expect(location(await plain("/gifts"))).toBe(
      "http://localhost:3030/choose-organization?next=%2Fgifts",
    );
    expect(location(await plain(`/${TA}/donors`))).toBe(
      `http://localhost:3030/choose-organization?tenant=${TA}&next=%2Fdonors`,
    );
    const rewrite = await plain(`/${TA}~finance/gifts`);
    expect(rewrite.headers.get("x-middleware-rewrite")).toBe(
      "http://localhost:3030/gifts",
    );
    expect(forwarded(rewrite, PREFIX)).toBe(`/${TA}~finance`);
    expect(forwarded(rewrite, NAME_GEN)).toBeNull();
    expect(location(await plain("/~finance/x"))).toBe(
      "http://localhost:3030/choose-organization?next=%2F%7Efinance%2Fx",
    );
    state.rows = Q;
    expect(location(await plain("/donors"))).toBe(
      `http://localhost:3030/${TA}/donors`,
    );
    expect(state.lookups).toEqual([]);
  });

  it("keeps today's Web Studio entry: organization and assignment, and from", async () => {
    const response = await plain(
      `/web-studio?organization=${TA}&assignment=${P_DEV_A.id}`,
    );
    expect(location(response)).toBe(
      `http://localhost:3030/web-studio/organization?next=%2Fweb-studio&from=${TA}`,
    );
    const role = await plain("/web-studio?role=finance");
    expect(location(role)).toBe(
      "http://localhost:3030/web-studio/organization?next=%2Fweb-studio%3Frole%3Dfinance",
    );
  });
});
