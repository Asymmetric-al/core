import { randomBytes } from "node:crypto";

import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

const USER = "00000000-0000-4000-8000-0000000000a1";
const TA = "00000000-0000-0000-0000-000000000001";
const TB = "00000000-0000-0000-0000-000000000002";
const NAME = "x-asym-name-tenant";
const PAYLOAD_SECRET = "unit-test-name-admission-secret";

let nextId = 0x500;
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
    updated_at: "2026-11-25T09:00:00.000000+00:00",
  };
}
const P_DEV_A = row(TA, "staff", "development");
const P_FIN_A = row(TA, "staff", "finance");
const P_DEV_B = row(TB, "staff", "development");
const P_MISS_A = row(TA, "missionary");
const P_MISS_B = row(TB, "missionary");
const P = [P_DEV_A, P_FIN_A, P_DEV_B, P_MISS_A, P_MISS_B];

type Answer = { data: unknown; error: unknown };

const state = vi.hoisted(() => ({
  userId: null as string | null,
  rows: [] as unknown[],
  refreshCookie: false,
  sessionReads: 0,
  lookups: [] as string[],
  lookupClients: 0,
  offMode: false,
  answer: (() => ({ data: [], error: null })) as (
    host: string,
    n: number,
  ) => { data: unknown; error: unknown },
}));

vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: () => ({
    url: "https://example.supabase.co",
    key: "anon-key",
    keyType: "anon",
  }),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: (
    _url: string,
    _key: string,
    options: {
      cookies: {
        setAll: (
          cookies: Array<{ name: string; value: string }>,
          headers: Record<string, string>,
        ) => void;
      };
    },
  ) => ({
    auth: {
      getUser: async () => {
        state.sessionReads += 1;
        if (state.refreshCookie) {
          options.cookies.setAll([{ name: "sb-refreshed", value: "fresh" }], {
            "Cache-Control": "private, no-store",
          });
        }
        return { data: { user: state.userId ? { id: state.userId } : null } };
      },
    },
    rpc: async (fn: string) => {
      if (fn !== "current_user_assignments") throw new Error(fn);
      return { data: state.rows, error: null };
    },
  }),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => {
    if (state.offMode)
      throw new Error("no lookup client when the switch is off");
    state.lookupClients += 1;
    return {
      rpc: (fn: string, args: { p_host: string }) => {
        if (fn !== "resolve_verified_host") throw new Error(fn);
        state.lookups.push(args.p_host);
        const answer = state.answer(args.p_host, state.lookups.length);
        return { abortSignal: () => Promise.resolve(answer) };
      },
    };
  },
}));

const adminModule = await import("../../../apps/admin/proxy");
const missionaryModule = await import("../../../apps/missionary/proxy");
const donorModule = await import("../../../apps/donor/proxy");

function home(
  tenantId: string,
  overrides: Record<string, unknown> = {},
): Answer {
  return {
    data: [
      {
        tenant_id: tenantId,
        site_id: null,
        generation: 3,
        surfaces: ["website", "donor_account", "staff", "missionary"],
        state: "active",
        is_home: true,
        ...overrides,
      },
    ],
    error: null,
  };
}

const NAME_ORIGIN = "http://name-a.localhost:25060";
const NAME_HOST = "name-a.localhost:25060";
const ADMIN_INTERNAL = "http://localhost:25061";
const MISSIONARY_INTERNAL = "http://localhost:25062";

let adminKey: string;
let missionaryKey: string;

function freshKey() {
  return randomBytes(32).toString("hex").slice(0, 32);
}

type Init = {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
};

async function stamped(
  app: "admin" | "missionary",
  path: string,
  init: Init = {},
) {
  const key = app === "admin" ? adminKey : missionaryKey;
  const stamp = await signFrontStamp(NAME_ORIGIN, `/${app}`, key);
  const internal = app === "admin" ? ADMIN_INTERNAL : MISSIONARY_INTERNAL;
  const request = new NextRequest(`${internal}/${app}${path}`, {
    ...init,
    headers: {
      host: internal.slice("http://".length),
      [FRONT_ORIGIN_HEADER]: NAME_ORIGIN,
      [FRONT_STAMP_HEADER]: stamp,
      ...init.headers,
    },
    nextConfig: { basePath: `/${app}` },
  });
  return app === "admin"
    ? adminModule.proxy(request)
    : missionaryModule.proxy(request);
}

function unstamped(app: "admin" | "missionary", path: string, init: Init = {}) {
  const internal = app === "admin" ? ADMIN_INTERNAL : MISSIONARY_INTERNAL;
  const request = new NextRequest(`${internal}/${app}${path}`, {
    ...init,
    nextConfig: { basePath: `/${app}` },
  });
  return app === "admin"
    ? adminModule.proxy(request)
    : missionaryModule.proxy(request);
}

function forwarded(response: Response, name: string) {
  return response.headers.get(`x-middleware-request-${name}`);
}

function expectRefused(response: Response, label: string, status = 404) {
  expect(response.status, label).toBe(status);
  expect(response.headers.get("cache-control"), label).toBe("no-store");
  expect(response.headers.get("set-cookie"), label).toBeNull();
  expect(response.headers.get("x-middleware-next"), label).toBeNull();
  expect(response.headers.get("x-middleware-rewrite"), label).toBeNull();
}

beforeEach(() => {
  resetFrontConfigLogForTests();
  adminKey = freshKey();
  missionaryKey = freshKey();
  state.userId = USER;
  state.rows = P;
  state.refreshCookie = true;
  state.sessionReads = 0;
  state.lookups = [];
  state.lookupClients = 0;
  state.offMode = false;
  state.answer = () => home(TA);
  vi.stubEnv("PAYLOAD_SECRET", PAYLOAD_SECRET);
  vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
  vi.stubEnv("CORE_APP_BASE_PATH", "/admin");
  vi.stubEnv("FRONT_STAMP_KEY", adminKey);
  vi.stubEnv("FRONT_STAMP_KEY_PREVIOUS", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

function useMissionary() {
  vi.stubEnv("CORE_APP_BASE_PATH", "/missionary");
  vi.stubEnv("FRONT_STAMP_KEY", missionaryKey);
}

const ADMIN_PATHS: Array<[string, string, Init]> = [
  ["a page", "/donors", {}],
  ["an RSC request", "/donors", { headers: { rsc: "1" } }],
  [
    "a prefetch",
    "/donors",
    { headers: { "next-router-prefetch": "1", purpose: "prefetch" } },
  ],
  ["an API GET", "/api/admin/funds", {}],
  [
    "an API POST",
    "/api/admin/funds",
    {
      method: "POST",
      headers: { "content-type": "application/json", origin: NAME_ORIGIN },
      body: "{}",
    },
  ],
  [
    "a server action",
    "/donors",
    {
      method: "POST",
      headers: { "next-action": "abc123", origin: NAME_ORIGIN },
    },
  ],
  ["/web-studio", "/web-studio", {}],
  ["/web-studio/api", "/web-studio/api/pages", {}],
  ["/login", "/login", {}],
  ["/invite/x", "/invite/x", {}],
];

const MISSIONARY_PATHS: Array<[string, string, Init]> = [
  ["a page", "/donors", {}],
  ["an RSC request", "/donors", { headers: { rsc: "1" } }],
  [
    "a prefetch",
    "/donors",
    { headers: { "next-router-prefetch": "1", purpose: "prefetch" } },
  ],
  ["an API GET", "/api/missionary/profile", {}],
  [
    "an API POST",
    "/api/missionary/profile",
    {
      method: "POST",
      headers: { "content-type": "application/json", origin: NAME_ORIGIN },
      body: "{}",
    },
  ],
  [
    "a server action",
    "/donors",
    {
      method: "POST",
      headers: { "next-action": "abc123", origin: NAME_ORIGIN },
    },
  ],
  ["/login", "/login", {}],
  ["/invite/x", "/invite/x", {}],
];

const REFUSED_NAMES: Array<[string, () => Answer]> = [
  ["an unknown name", () => ({ data: [], error: null })],
  ["a name that is not home", () => home(TA, { is_home: false })],
  [
    "a home without the surface",
    () => home(TA, { surfaces: ["website", "donor_account"] }),
  ],
];

describe("on: a refused name is a 404 no-store before any session read", () => {
  for (const [nameLabel, answer] of REFUSED_NAMES) {
    it.each(ADMIN_PATHS)(
      `Mission Control, ${nameLabel}: %s`,
      async (label, path, init) => {
        state.answer = answer;
        const response = await stamped("admin", path, init);
        expectRefused(response, label);
        expect(state.sessionReads).toBe(0);
        expect(state.lookups).toEqual([NAME_HOST]);
      },
    );

    it.each(MISSIONARY_PATHS)(
      `the missionary workspace, ${nameLabel}: %s`,
      async (label, path, init) => {
        useMissionary();
        state.answer = answer;
        const response = await stamped("missionary", path, init);
        expectRefused(response, label);
        expect(state.sessionReads).toBe(0);
        expect(state.lookups).toEqual([NAME_HOST]);
      },
    );
  }
});

describe("on: a ready home admits staff only", () => {
  it("admits /admin and refuses the missionary workspace's pages, /login and /invite/x", async () => {
    state.answer = () => home(TA, { state: "ready" });
    state.userId = null;
    const admin = await stamped("admin", "/donors");
    expect(admin.status).toBe(307);
    expect(new URL(admin.headers.get("location")!).pathname).toBe(
      "/admin/login",
    );

    useMissionary();
    for (const path of ["/donors", "/login", "/invite/x"]) {
      state.sessionReads = 0;
      expectRefused(await stamped("missionary", path), path);
      expect(state.sessionReads).toBe(0);
    }
  });
});

describe("on: a lookup that fails is a 503 no-store and is never forwarded", () => {
  it.each([
    ["an error answer", () => ({ data: null, error: { message: "down" } })],
    ["a malformed answer", () => ({ data: { tenant_id: TA }, error: null })],
  ] as const)("%s, on every path, public ones included", async (_l, answer) => {
    state.answer = answer;
    for (const [label, path, init] of ADMIN_PATHS) {
      expectRefused(await stamped("admin", path, init), label, 503);
    }
    useMissionary();
    for (const [label, path, init] of MISSIONARY_PATHS) {
      expectRefused(await stamped("missionary", path, init), label, 503);
    }
    expect(state.sessionReads).toBe(0);
  });
});

describe("on: exempt paths make no lookup and forward no name", () => {
  it.each([
    [
      "POST /api/webhooks/stripe",
      "/api/webhooks/stripe",
      {
        method: "POST",
        headers: { [NAME]: TB, "stripe-signature": "t=1,v1=x" },
      },
    ],
    [
      "POST /eve/v1/github",
      "/eve/v1/github",
      { method: "POST", headers: { [NAME]: TB } },
    ],
  ] as const)("%s", async (_label, path, init) => {
    const response = await unstamped("admin", path, init);
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(forwarded(response, NAME)).toBeNull();
    expect(state.lookupClients).toBe(0);
    expect(state.lookups).toEqual([]);
  });

  it("refuses unstamped GET /api/cms/public/x after WP6 part 2a retires the prototype public CMS routes", async () => {
    const response = await unstamped("admin", "/api/cms/public/x", {
      headers: { [NAME]: TB },
    });
    expectRefused(response, "GET /api/cms/public/x", 403);
    expect(state.lookupClients).toBe(0);
    expect(state.lookups).toEqual([]);
  });

  it("the front's rewrite carries no client copy", async () => {
    vi.stubEnv("CORE_APP_BASE_PATH", "");
    vi.stubEnv("FRONT_ADMIN_ORIGIN", ADMIN_INTERNAL);
    vi.stubEnv("FRONT_MISSIONARY_ORIGIN", MISSIONARY_INTERNAL);
    vi.stubEnv("FRONT_STAMP_KEY_ADMIN", adminKey);
    vi.stubEnv("FRONT_STAMP_KEY_MISSIONARY", missionaryKey);
    vi.stubEnv("FRONT_NAMES", NAME_HOST);
    const response = await donorModule.proxy(
      new NextRequest(`${NAME_ORIGIN}/admin/donors`, {
        headers: { host: NAME_HOST, [NAME]: TB },
      }),
    );
    expect(response.headers.get("x-middleware-rewrite")).toBe(
      `${ADMIN_INTERNAL}/admin/donors`,
    );
    expect(forwarded(response, NAME)).toBeNull();
    expect(state.lookups).toEqual([]);
  });
});

describe("on: the name's organization is a fact of the request", () => {
  it("asks for the stamped host only, never a client's x-forwarded-host or the request URL", async () => {
    await stamped("admin", "/api/admin/funds", {
      headers: { "x-forwarded-host": "localhost:25061" },
    });
    expect(state.lookups).toEqual([NAME_HOST]);
  });

  it("overwrites a client's name header on /api and /web-studio/api, keeping x-asym-tenant and x-asym-assignment", async () => {
    for (const path of ["/api/admin/funds", "/web-studio/api/pages"]) {
      const response = await stamped("admin", path, {
        headers: {
          [NAME]: TB,
          "x-asym-tenant": TA,
          "x-asym-assignment": P_DEV_A.id,
        },
      });
      expect(forwarded(response, NAME), path).toBe(TA);
      expect(forwarded(response, "x-asym-tenant"), path).toBe(TA);
      expect(forwarded(response, "x-asym-assignment"), path).toBe(P_DEV_A.id);
    }
  });

  it("names the organization on a page rewrite (D-18, N2 part 2b: the page's address is /~finance, without A's ID)", async () => {
    const response = await stamped("admin", "/~finance/donors", {
      headers: { [NAME]: TB },
    });
    expect(response.headers.get("x-middleware-rewrite")).toContain(
      "/admin/donors",
    );
    expect(forwarded(response, NAME)).toBe(TA);
    expect(forwarded(response, "x-asym-tenant")).toBe(TA);
    expect(forwarded(response, "x-asym-assignment")).toBe(P_FIN_A.id);
  });

  it("remembers nothing: the second request is decided in the second answer's organization, one lookup each (D-18, N2 part 2b: the page's address is /~finance, without A's ID)", async () => {
    state.answer = (_host, n) => home(n === 1 ? TA : TB);
    const first = await stamped("admin", "/~finance/donors");
    expect(forwarded(first, NAME)).toBe(TA);
    expect(state.lookups).toHaveLength(1);

    const api = await stamped("admin", "/api/admin/funds", {
      headers: { "x-asym-tenant": TA },
    });
    expect(state.lookups).toHaveLength(2);
    expect(forwarded(api, NAME)).toBe(TB);

    state.answer = () => home(TB);
    const address = await stamped("admin", `/${TA}/donors`);
    expectRefused(address, "address of A on B");
    expect(state.lookups).toHaveLength(3);

    const cookie = await signWebStudioSelection(
      { tenantId: TA, assignmentId: P_DEV_A.id },
      PAYLOAD_SECRET,
    );
    const studio = await stamped("admin", "/web-studio", {
      headers: { cookie: `${WEB_STUDIO_TENANT_COOKIE}=${cookie}` },
    });
    expect(state.lookups).toHaveLength(4);
    expect(studio.status).toBe(307);
    const location = new URL(studio.headers.get("location")!);
    expect(location.pathname).toBe("/admin/web-studio/organization");
    expect(location.searchParams.get("refused")).toBe("1");
  });
});

describe.each([
  ["unset", undefined],
  ["0", "0"],
] as const)("off (switch %s): today's behavior, no lookup", (_label, value) => {
  beforeEach(() => {
    state.offMode = true;
    if (value === undefined) vi.stubEnv("CORE_SERVE_UNDER_PATHS", undefined);
    else vi.stubEnv("CORE_SERVE_UNDER_PATHS", value);
    vi.stubEnv("CORE_APP_BASE_PATH", "");
  });

  function plain(path: string, headers: Record<string, string> = {}) {
    return adminModule.proxy(
      new NextRequest(`${ADMIN_INTERNAL}${path}`, { headers }),
    );
  }

  it("makes no lookup client and answers a page as without the header", async () => {
    const withName = await plain(`/${TA}~finance/donors`, { [NAME]: TB });
    const without = await plain(`/${TA}~finance/donors`);
    expect(withName.status).toBe(without.status);
    expect(withName.headers.get("x-middleware-rewrite")).toBe(
      without.headers.get("x-middleware-rewrite"),
    );
    expect(forwarded(withName, "x-asym-tenant")).toBe(TA);
    expect(forwarded(withName, NAME)).toBeNull();
    expect(without.headers.get("set-cookie")).toContain("sb-refreshed=fresh");
    expect(withName.headers.get("set-cookie")).toBe(
      without.headers.get("set-cookie"),
    );
    expect(state.lookupClients).toBe(0);
  });

  it("forwards no name header on /api or /web-studio/api, where x-asym-tenant and x-asym-assignment still are", async () => {
    for (const path of ["/api/admin/funds", "/web-studio/api/pages"]) {
      const response = await plain(path, {
        [NAME]: TB,
        "x-asym-tenant": TA,
        "x-asym-assignment": P_DEV_A.id,
      });
      expect(forwarded(response, NAME), path).toBeNull();
      expect(forwarded(response, "x-asym-tenant"), path).toBe(TA);
      expect(forwarded(response, "x-asym-assignment"), path).toBe(P_DEV_A.id);
    }
    expect(state.lookupClients).toBe(0);
  });

  it("the missionary workspace lands as without the header", async () => {
    const without = await missionaryModule.proxy(
      new NextRequest(`${MISSIONARY_INTERNAL}/`),
    );
    const response = await missionaryModule.proxy(
      new NextRequest(`${MISSIONARY_INTERNAL}/`, { headers: { [NAME]: TB } }),
    );
    expect(response.headers.get("location")).toBe(
      without.headers.get("location"),
    );
    expect(without.headers.get("set-cookie")).toContain("sb-refreshed=fresh");
    expect(response.headers.get("set-cookie")).toBe(
      without.headers.get("set-cookie"),
    );
    expect(response.status).toBe(307);
    expect(new URL(response.headers.get("location")!).pathname).toBe(
      "/choose-organization",
    );
    expect(state.lookupClients).toBe(0);
  });
});
