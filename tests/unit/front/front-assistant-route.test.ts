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

import { expectRefused, rawPathRequest } from "./donor-admission/fixtures";
import {
  FRONT_ORIGIN_HEADER,
  FRONT_STAMP_HEADER,
  resetFrontConfigLogForTests,
  verifyFrontStamp,
} from "../../../packages/auth/front";

const network = vi.hoisted(() => {
  const reached: string[] = [];
  const fetchSpy = vi.fn(async (input: unknown) => {
    reached.push(String(input));
    throw new Error("a test reached the network");
  });
  vi.stubGlobal("fetch", fetchSpy);
  return { reached, fetchSpy };
});

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
      const data =
        args.p_host === "one.example.test"
          ? [
              {
                tenant_id: "00000000-0000-0000-0000-000000000001",
                site_id: "00000000-0000-4000-8000-000000000011",
                generation: 1,
                surfaces: ["website", "donor_account", "staff", "missionary"],
                state: "active",
                is_home: true,
              },
            ]
          : [];
      return { abortSignal: async () => ({ data, error: null }) };
    },
  }),
}));

const donorModule = await import("../../../apps/donor/proxy");

const ADMIN_ORIGIN = "https://staff.example.test";
const MISSIONARY_ORIGIN = "https://missionary.example.test";
const FRONT_ONE = "https://one.example.test";

const FORGED_HEADERS = {
  "x-forwarded-host": "evil.example.test",
  [FRONT_ORIGIN_HEADER]: "https://evil.example.test",
  [FRONT_STAMP_HEADER]: "v1.1.forged",
  "x-asym-front-extra": "forged",
  "x-asym-name-tenant": "00000000-0000-0000-0000-000000000002",
  "x-vercel-protection-bypass": "client-bypass",
  "x-vercel-set-bypass-cookie": "samesitenone",
};

let adminKey: string;
let missionaryKey: string;

function freshKey(): string {
  return randomBytes(32).toString("hex").slice(0, 32);
}

function frontRequest(
  method: string,
  path: string,
  options: {
    raw?: string;
    host?: string;
    headers?: Record<string, string>;
  } = {},
) {
  const host = options.host ?? "one.example.test";
  const withBody = method === "POST" || method === "PUT" || method === "PATCH";
  const request = new NextRequest(`https://${host}${path}`, {
    method,
    headers: {
      host,
      ...(withBody ? { "content-type": "application/json" } : {}),
      ...options.headers,
    },
    ...(withBody ? { body: "{}" } : {}),
  });
  if (options.raw !== undefined) {
    Object.defineProperty(request.nextUrl, "pathname", {
      value: options.raw,
      configurable: true,
    });
  }
  return request;
}

function forwarded(response: Response, name: string) {
  return response.headers.get(`x-middleware-request-${name}`);
}

beforeEach(() => {
  vi.stubGlobal("fetch", network.fetchSpy);
  resetFrontConfigLogForTests();
  adminKey = freshKey();
  missionaryKey = freshKey();
  vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
  vi.stubEnv("CORE_APP_BASE_PATH", "");
  vi.stubEnv("FRONT_ADMIN_ORIGIN", ADMIN_ORIGIN);
  vi.stubEnv("FRONT_MISSIONARY_ORIGIN", MISSIONARY_ORIGIN);
  vi.stubEnv("FRONT_STAMP_KEY_ADMIN", adminKey);
  vi.stubEnv("FRONT_STAMP_KEY_MISSIONARY", missionaryKey);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  expect(network.reached.splice(0)).toEqual([]);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

describe("the front's five assistant routes under /admin/eve/v1/", () => {
  it.each([
    ["GET", "/admin/eve/v1/health", "", "health"],
    ["POST", "/admin/eve/v1/session", "", "session"],
    ["POST", "/admin/eve/v1/session/s-1", "", "session/s-1"],
    [
      "GET",
      "/admin/eve/v1/session/s-1/stream",
      "?startIndex=2",
      "session/s-1/stream",
    ],
    ["POST", "/admin/eve/v1/session/s-1/cancel", "", "session/s-1/cancel"],
  ])(
    "sends %s %s to the staff origin's root mount with a verifying /admin stamp",
    async (method, path, search, remainder) => {
      const response = await donorModule.proxy(
        frontRequest(method, `${path}${search}`, { headers: FORGED_HEADERS }),
      );

      expect(response.status).toBe(200);
      expect(response.headers.get("x-middleware-rewrite")).toBe(
        `${ADMIN_ORIGIN}/eve/v1/${remainder}${search}`,
      );
      expect(response.headers.get("x-middleware-rewrite")).not.toContain(
        "/admin/eve/",
      );
      const origin = forwarded(response, FRONT_ORIGIN_HEADER);
      const stamp = forwarded(response, FRONT_STAMP_HEADER);
      expect(origin).toBe(FRONT_ONE);
      await expect(
        verifyFrontStamp(origin, "/admin", stamp, { key: adminKey }),
      ).resolves.toBe(true);
      await expect(
        verifyFrontStamp(origin, "/admin", stamp, { key: missionaryKey }),
      ).resolves.toBe(false);
      for (const name of [
        "x-forwarded-host",
        "x-asym-front-extra",
        "x-asym-name-tenant",
        "x-vercel-protection-bypass",
        "x-vercel-set-bypass-cookie",
      ]) {
        expect(forwarded(response, name), name).toBeNull();
      }
    },
  );
});

describe("everything else under /admin/eve/v1/ is the front's 404", () => {
  it.each([
    ["POST", "/admin/eve/v1/github"],
    ["POST", "/admin/eve/v1/%67ithub"],
    ["GET", "/admin/eve/v1/callback/t"],
    ["POST", "/admin/eve/v1/callback/t"],
    ["GET", "/admin/eve/v1/connections/x/callback/t"],
    ["POST", "/admin/eve/v1/connections/x/callback/t"],
    ["GET", "/admin/eve/v1/info"],
    ["GET", "/admin/eve/v1/session"],
    ["POST", "/admin/eve/v1/health"],
    ["HEAD", "/admin/eve/v1/health"],
    ["GET", "/admin/eve/v1/session/s-1"],
    ["POST", "/admin/eve/v1/session/s-1/stream"],
    ["GET", "/admin/eve/v1/session/s-1/cancel"],
    ["POST", "/admin/eve/v1/session/s-1/extra"],
    ["GET", "/admin/eve/v1/session/s-1/stream/extra"],
    ["POST", "/admin/eve/v1/session/"],
    ["POST", "/admin/eve/v1/session/s-1/"],
    ["GET", "/admin/eve/v1/health/"],
    ["POST", "/admin/eve/v1/Session"],
    ["GET", "/admin/eve/v1/Health"],
    ["GET", "/admin/eve/v1/"],
    ["POST", "/admin/eve/v1/"],
    ["PUT", "/admin/eve/v1/session"],
    ["PATCH", "/admin/eve/v1/session"],
    ["DELETE", "/admin/eve/v1/session"],
    ["HEAD", "/admin/eve/v1/session"],
    ["OPTIONS", "/admin/eve/v1/session"],
    ["POST", "/admin/eve/v1/session%2F..%2Fx"],
    ["POST", "/admin/eve/v1/session/s%2D1"],
    ["GET", "/admin/eve/v1/a%5Cb"],
    ["GET", "/admin/eve/v1/%252e%252e/x"],
    ["GET", "/admin/eve/v1/%E0%A4%A"],
    ["GET", "/admin/eve/v1/./health"],
    ["GET", "/admin/eve/v1/../health"],
    ["POST", "/admin/eve/v1/session/./s-1"],
    ["POST", "/admin/eve/v1/session/../session"],
    ["GET", "/admin/eve/v1/a//b"],
    ["GET", "/admin/eve/v1//health"],
    ["POST", "/admin/eve/v1/session//s-1"],
    ["GET", "/admin/eve/v1/a\\b"],
  ])("refuses %s %s without a rewrite", async (method, raw) => {
    const response = await donorModule.proxy(
      frontRequest(method, "/", { raw, headers: FORGED_HEADERS }),
    );
    await expectRefused(response, `${method} ${raw}`);
  });

  it.each([
    "/admin/eve/v1/./health",
    "/admin/eve/v1/../health",
    "/admin/eve/v1/a//b",
    "/admin/eve/v1/a\\b",
  ])("refuses the raw path %s on the shared fixture", async (raw) => {
    const response = await donorModule.proxy(
      rawPathRequest("one.example.test", raw),
    );
    await expectRefused(response, raw);
  });
});

describe("other dashboard paths are routed as today", () => {
  it.each([
    ["GET", "/admin/eve", ADMIN_ORIGIN],
    ["GET", "/admin/eve/v1", ADMIN_ORIGIN],
    ["GET", "/admin/eve/v2/x", ADMIN_ORIGIN],
    ["POST", "/admin/eve/v1x/session", ADMIN_ORIGIN],
    ["POST", "/admin/EVE/v1/session", ADMIN_ORIGIN],
    ["GET", "/admin/care/directory", ADMIN_ORIGIN],
    ["POST", "/missionary/eve/v1/session", MISSIONARY_ORIGIN],
  ])("sends %s %s under the base path", async (method, path, origin) => {
    const response = await donorModule.proxy(frontRequest(method, path));
    expect(response.headers.get("x-middleware-rewrite")).toBe(
      `${origin}${path}`,
    );
  });

  it("follows the URL parser's resolution of /admin/eve/v1/%2e%2e/x to /admin/eve/x", async () => {
    const request = frontRequest("GET", "/admin/eve/v1/%2e%2e/x");
    expect(request.nextUrl.pathname).toBe("/admin/eve/x");
    const response = await donorModule.proxy(request);
    expect(response.headers.get("x-middleware-rewrite")).toBe(
      `${ADMIN_ORIGIN}/admin/eve/x`,
    );
  });

  it("refuses an allowed route on an unlisted name or with the configuration incomplete", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    await expectRefused(
      await donorModule.proxy(
        frontRequest("POST", "/admin/eve/v1/session", {
          host: "unknown.example.test",
        }),
      ),
      "unlisted name",
    );
    vi.stubEnv("FRONT_STAMP_KEY_ADMIN", "short");
    await expectRefused(
      await donorModule.proxy(frontRequest("POST", "/admin/eve/v1/session")),
      "short admin key",
    );
  });

  it("sends nothing to a dashboard with the switch off", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "0");
    for (const [method, path] of [
      ["POST", "/admin/eve/v1/session"],
      ["GET", "/admin/eve/v1/health"],
      ["POST", "/admin/eve/v1/github"],
    ] as const) {
      const response = await donorModule.proxy(frontRequest(method, path));
      expect(response.headers.get("x-middleware-rewrite"), path).toBeNull();
      expect(response.status, path).not.toBe(404);
    }
  });
});
