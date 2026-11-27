import { randomBytes } from "node:crypto";

import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  FRONT_ORIGIN_HEADER,
  FRONT_STAMP_HEADER,
  resetFrontConfigLogForTests,
  verifyFrontStamp,
} from "../../../packages/auth/front";

const TA = "00000000-0000-0000-0000-000000000001";
const GENERATION = "x-asym-name-generation";

type Answer = { data: unknown; error: unknown };

const state = vi.hoisted(() => ({
  lookups: [] as string[],
  answer: (() => ({ data: [], error: null })) as (host: string) => {
    data: unknown;
    error: unknown;
  },
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
    auth: { getUser: async () => ({ data: { user: null } }) },
    rpc: async () => ({ data: [], error: null }),
  }),
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

const donorModule = await import("../../../apps/donor/proxy");
const adminModule = await import("../../../apps/admin/proxy");

const ADMIN_INTERNAL = "http://localhost:25071";
const MISSIONARY_INTERNAL = "http://localhost:25072";

function row(overrides: Record<string, unknown>): Answer {
  return {
    data: [
      {
        tenant_id: TA,
        site_id: null,
        generation: 4,
        surfaces: ["website", "donor_account", "staff", "missionary"],
        state: "active",
        is_home: true,
        ...overrides,
      },
    ],
    error: null,
  };
}

function folded(host: string): string {
  return host.toLowerCase().replace(/:\d+$/, "").replace(/\.$/, "");
}

const NAMES: Record<string, Answer> = {
  "a.test": row({}),
  "r.test": row({ state: "ready" }),
  "w.test": row({ is_home: false, surfaces: ["website"] }),
};

function lookupAnswer(host: string): Answer {
  return NAMES[folded(host)] ?? { data: [], error: null };
}

let adminKey: string;
let missionaryKey: string;

beforeEach(() => {
  resetFrontConfigLogForTests();
  adminKey = randomBytes(32).toString("hex").slice(0, 32);
  missionaryKey = randomBytes(32).toString("hex").slice(0, 32);
  state.lookups = [];
  state.answer = lookupAnswer;
  vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
  vi.stubEnv("CORE_APP_BASE_PATH", "");
  vi.stubEnv("FRONT_ADMIN_ORIGIN", ADMIN_INTERNAL);
  vi.stubEnv("FRONT_MISSIONARY_ORIGIN", MISSIONARY_INTERNAL);
  vi.stubEnv("FRONT_STAMP_KEY_ADMIN", adminKey);
  vi.stubEnv("FRONT_STAMP_KEY_MISSIONARY", missionaryKey);
  vi.stubEnv("FRONT_NAMES", undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

function atFront(
  host: string,
  path: string,
  headers: Record<string, string> = {},
) {
  return donorModule.proxy(
    new NextRequest(`http://${host}${path}`, {
      headers: { host, ...headers },
    }),
  );
}

function rewrite(response: Response) {
  return response.headers.get("x-middleware-rewrite");
}

function forwarded(response: Response, name: string) {
  return response.headers.get(`x-middleware-request-${name}`);
}

function expectRefused(response: Response, label: string, status = 404) {
  expect(response.status, label).toBe(status);
  expect(response.headers.get("cache-control"), label).toBe("no-store");
  expect(rewrite(response), label).toBeNull();
}

describe("on: the front admits a dashboard by the verified-name lookup, with no list of names", () => {
  it("routes a.test/admin/login to the staff app with a valid stamp, FRONT_NAMES unset (base: 404)", async () => {
    const response = await atFront("a.test", "/admin/login");
    expect(rewrite(response)).toBe(`${ADMIN_INTERNAL}/admin/login`);
    const origin = forwarded(response, FRONT_ORIGIN_HEADER);
    expect(origin).toBe("http://a.test");
    expect(
      await verifyFrontStamp(
        origin,
        "/admin",
        forwarded(response, FRONT_STAMP_HEADER),
        { key: adminKey },
      ),
    ).toBe(true);
  });

  it("routes a ready home for staff and refuses it for the missionary workspace, which needs an active one (base: both routed when listed)", async () => {
    vi.stubEnv("FRONT_NAMES", "r.test");
    const admin = await atFront("r.test", "/admin/x");
    expect(rewrite(admin)).toBe(`${ADMIN_INTERNAL}/admin/x`);
    const missionary = await atFront("r.test", "/missionary/x");
    expectRefused(missionary, "r.test /missionary/x");
    expect(rewrite(missionary)).toBeNull();
  });

  it.each([
    ["w.test", "/admin/x", "active but not home, website only"],
    ["w.test", "/missionary/x", "active but not home, website only"],
    ["u.test", "/admin/x", "no row"],
    ["u.test", "/missionary/x", "no row"],
  ])(
    "refuses %s%s 404 no-store with no rewrite: %s, though FRONT_NAMES lists it (base: routed)",
    async (host, path) => {
      vi.stubEnv("FRONT_NAMES", host);
      expectRefused(await atFront(host, path), `${host}${path}`);
    },
  );

  it.each([
    ["the lookup errs", { data: null, error: { message: "boom" } }],
    ["the lookup returns two rows", { data: [{}, {}], error: null }],
  ] as const)(
    "answers /admin/x 503 no-store when %s, never as admitted (base: FRONT_NAMES decides)",
    async (_label, answer) => {
      vi.stubEnv("FRONT_NAMES", "a.test");
      state.answer = () => answer;
      expectRefused(await atFront("a.test", "/admin/x"), "/admin/x", 503);
    },
  );

  it("makes one lookup for /admin/x (base: none)", async () => {
    await atFront("a.test", "/admin/x");
    expect(state.lookups).toEqual(["a.test"]);
  });

  it("makes one lookup for /donor-dashboard (guard)", async () => {
    await atFront("a.test", "/donor-dashboard");
    expect(state.lookups).toHaveLength(1);
  });

  it.each(["A.TEST", "a.test."])(
    "looks up, for Host %s, the same bytes the staff app's lookup reads from the stamp (base: the front looks nothing up)",
    async (host) => {
      vi.stubEnv("FRONT_NAMES", folded(host));
      const routed = await atFront(host, "/admin/x");
      const frontLookups = [...state.lookups];
      expect(frontLookups).toHaveLength(1);
      const origin = forwarded(routed, FRONT_ORIGIN_HEADER)!;
      const stamp = forwarded(routed, FRONT_STAMP_HEADER)!;
      vi.stubEnv("CORE_APP_BASE_PATH", "/admin");
      vi.stubEnv("FRONT_STAMP_KEY", adminKey);
      state.lookups = [];
      await adminModule.proxy(
        new NextRequest(`${ADMIN_INTERNAL}/admin/x`, {
          headers: {
            host: ADMIN_INTERNAL.slice("http://".length),
            [FRONT_ORIGIN_HEADER]: origin,
            [FRONT_STAMP_HEADER]: stamp,
          },
          nextConfig: { basePath: "/admin" },
        }),
      );
      expect(state.lookups).toEqual(frontLookups);
    },
  );

  it("strips a client x-asym-name-generation from the front's rewrite (base: forwarded)", async () => {
    const response = await atFront("a.test", "/admin/x", { [GENERATION]: "7" });
    expect(rewrite(response)).toBe(`${ADMIN_INTERNAL}/admin/x`);
    expect(forwarded(response, GENERATION)).toBeNull();
  });

  it("drops a client x-asym-name-generation on a dashboard's exempt API path (base: present at the handler)", async () => {
    vi.stubEnv("CORE_APP_BASE_PATH", "/admin");
    vi.stubEnv("FRONT_STAMP_KEY", adminKey);
    const response = await adminModule.proxy(
      new NextRequest(`${ADMIN_INTERNAL}/admin/api/webhooks/stripe`, {
        method: "POST",
        headers: { [GENERATION]: "7", "stripe-signature": "t=1,v1=x" },
        nextConfig: { basePath: "/admin" },
      }),
    );
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(forwarded(response, GENERATION)).toBeNull();
  });
});

describe("off: the front's dashboard routing is as today (guards)", () => {
  it("routes nothing to a dashboard and looks nothing up for /admin/x", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", undefined);
    const response = await atFront("a.test", "/admin/x");
    expect(rewrite(response)).not.toBe(`${ADMIN_INTERNAL}/admin/x`);
    expect(state.lookups).toEqual([]);
  });
});
