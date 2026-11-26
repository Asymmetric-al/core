import { randomBytes } from "node:crypto";

import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  config: {
    url: "https://example.supabase.co" as string | null,
    key: "anon-key" as string | null,
  },
  clientsBuilt: 0,
  cookieReads: 0,
  getUserCalls: 0,
  rpcCalls: [] as string[],
  user: null as { id: string } | null,
  listAnswer: {
    data: true as unknown,
    error: null as null | { code: string; message: string },
  },
  rpcThrows: false,
  refresh: false,
}));

vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: () => ({
    url: state.config.url,
    key: state.config.key,
    keyType: state.config.key ? "anon" : null,
  }),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: (
    _url: string,
    _key: string,
    options: {
      cookies: {
        getAll(): unknown;
        setAll(
          cookies: { name: string; value: string; options?: unknown }[],
          headers?: Record<string, string>,
        ): void;
      };
    },
  ) => {
    state.clientsBuilt += 1;
    return {
      auth: {
        getUser: async () => {
          state.getUserCalls += 1;
          options.cookies.getAll();
          if (state.refresh) {
            options.cookies.setAll(
              [
                {
                  name: "sb-test-auth-token",
                  value: "rotated-session",
                  options: { path: "/", sameSite: "lax" },
                },
              ],
              {
                "Cache-Control":
                  "private, no-cache, no-store, must-revalidate, max-age=0",
                Expires: "0",
                Pragma: "no-cache",
              },
            );
          }
          return { data: { user: state.user }, error: null };
        },
      },
      rpc: async (fn: string) => {
        state.rpcCalls.push(fn);
        if (fn !== "caller_is_platform_operator") {
          return { data: [], error: null };
        }
        if (state.rpcThrows) throw new Error("network down");
        return state.listAnswer;
      },
    };
  },
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    rpc: () => ({
      abortSignal: async () => ({ data: [], error: null }),
    }),
  }),
}));

const { proxy } = await import("../../../../apps/admin/proxy");
const { frontNotFound, frontRefusal, signFrontStamp } =
  await import("../../../../packages/auth/front");

const OPS = "ops.example:3130";
const TENANT = "00000000-0000-0000-0000-000000000001";
const USER = "00000000-0000-4000-8000-0000000000a1";
const PROTECTED_CACHE = "private, no-store, no-transform, max-age=0";
const AREA_ONLY = [
  "cdn-cache-control",
  "vercel-cdn-cache-control",
  "referrer-policy",
] as const;

type Mode = { name: "off" | "on"; base: string };
const MODES: Mode[] = [
  { name: "off", base: "" },
  { name: "on", base: "/admin" },
];

let stampKey = "";

function request(
  mode: Mode,
  path: string,
  init: {
    host?: string;
    method?: string;
    headers?: Record<string, string>;
  } = {},
) {
  const host = init.host ?? OPS;
  const req = new NextRequest(`http://${OPS}${mode.base}${path}`, {
    method: init.method ?? "GET",
    headers: { host, ...init.headers },
    ...(mode.base ? { nextConfig: { basePath: mode.base } } : {}),
  });
  const cookies = req.cookies;
  Object.defineProperty(req, "cookies", {
    configurable: true,
    get() {
      state.cookieReads += 1;
      return cookies;
    },
  });
  return req;
}

async function expectSameAs(response: Response, expected: Response) {
  expect(response.status).toBe(expected.status);
  expect([...response.headers.entries()].sort()).toEqual(
    [...expected.headers.entries()].sort(),
  );
  expect(await response.text()).toBe("");
}

function expectNoSessionRead() {
  expect(state.clientsBuilt).toBe(0);
  expect(state.cookieReads).toBe(0);
  expect(state.getUserCalls).toBe(0);
  expect(state.rpcCalls).toEqual([]);
}

function expectNoAreaHeaders(response: Response) {
  for (const name of AREA_ONLY) {
    expect(response.headers.get(name), name).toBeNull();
  }
}

beforeEach(() => {
  state.config = { url: "https://example.supabase.co", key: "anon-key" };
  state.clientsBuilt = 0;
  state.cookieReads = 0;
  state.getUserCalls = 0;
  state.rpcCalls = [];
  state.user = null;
  state.listAnswer = { data: true, error: null };
  state.rpcThrows = false;
  state.refresh = false;
  stampKey = randomBytes(32).toString("hex").slice(0, 32);
  vi.stubEnv("OPERATIONS_NAMES", OPS);
  vi.stubEnv("FRONT_STAMP_KEY", stampKey);
  vi.stubEnv("FRONT_STAMP_KEY_PREVIOUS", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe.each(MODES)(
  "AL-2675 WP2c part 2a, T2: the admin proxy's admission of /operator, switch $name",
  (mode) => {
    beforeEach(() => {
      vi.stubEnv("CORE_SERVE_UNDER_PATHS", mode.name === "on" ? "1" : "0");
      vi.stubEnv("CORE_APP_BASE_PATH", mode.base);
      vi.spyOn(console, "error").mockImplementation(() => undefined);
    });

    it.each([
      `/${TENANT}/operator`,
      `/${TENANT}/operator/`,
      `/${TENANT}~finance/operator/x`,
      `/${TENANT}/%6Fperator`,
    ])(
      "refuses the area inside a tenant address (%s) with frontNotFound(), before any session read",
      async (path) => {
        await expectSameAs(await proxy(request(mode, path)), frontNotFound());
        await expectSameAs(
          await proxy(request(mode, path, { host: "unlisted.example" })),
          frontNotFound(),
        );
        expectNoSessionRead();
      },
    );

    it.each([
      ["x-asym-front-stamp", "forged"],
      ["x-asym-front-stamp", ""],
      ["x-asym-front-origin", "https://one.example.test"],
    ])(
      "refuses a request carrying %s, valid or not, with frontNotFound() before any session read, on a listed or unlisted host",
      async (header, value) => {
        for (const host of [OPS, "unlisted.example"]) {
          await expectSameAs(
            await proxy(
              request(mode, "/operator", {
                host,
                headers: { [header]: value },
              }),
            ),
            frontNotFound(),
          );
        }
        expectNoSessionRead();
      },
    );

    it("refuses the front's own stamped request for /operator (an organization's name) with frontNotFound()", async () => {
      const origin = "https://one.example.test";
      const stamp = await signFrontStamp(origin, "/admin", stampKey);
      await expectSameAs(
        await proxy(
          request(mode, "/operator", {
            headers: {
              "x-asym-front-origin": origin,
              "x-asym-front-stamp": stamp,
            },
          }),
        ),
        frontNotFound(),
      );
      expectNoSessionRead();
    });

    it.each([
      "core-admin-git-feature.vercel.app",
      "127.0.0.1:3130",
      "ops.example:3131",
      "ops.example",
      " ops.example:3130",
      "x.ops.example:3130",
    ])("refuses the unlisted host %j before any session read", async (host) => {
      for (const path of ["/operator", "/operator/does-not-exist"]) {
        const response = await proxy(request(mode, path, { host }));
        await expectSameAs(
          response,
          mode.name === "on" ? frontRefusal() : frontNotFound(),
        );
      }
      expectNoSessionRead();
    });

    it("refuses a listed host whose x-forwarded-host names another host, before any session read", async () => {
      await expectSameAs(
        await proxy(
          request(mode, "/operator", {
            headers: { "x-forwarded-host": "evil.example" },
          }),
        ),
        mode.name === "on" ? frontRefusal() : frontNotFound(),
      );
      expectNoSessionRead();
    });

    it("refuses every host while OPERATIONS_NAMES is unset", async () => {
      vi.stubEnv("OPERATIONS_NAMES", "");
      await expectSameAs(
        await proxy(request(mode, "/operator")),
        mode.name === "on" ? frontRefusal() : frontNotFound(),
      );
      expectNoSessionRead();
    });

    it.each(["POST", "PUT", "PATCH", "DELETE", "OPTIONS"])(
      "refuses %s on a listed host with frontNotFound() before any session read",
      async (method) => {
        state.user = { id: USER };
        await expectSameAs(
          await proxy(request(mode, "/operator", { method })),
          frontNotFound(),
        );
        expectNoSessionRead();
      },
    );

    it("answers 503, empty and no-store, when the Supabase configuration is missing, building no client", async () => {
      state.config = { url: null, key: "anon-key" };
      let response = await proxy(request(mode, "/operator"));
      expect(response.status).toBe(503);
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(await response.text()).toBe("");
      state.config = { url: "https://example.supabase.co", key: null };
      response = await proxy(request(mode, "/operator"));
      expect(response.status).toBe(503);
      expectNoSessionRead();
      expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toMatch(
        /example\.supabase\.co|anon-key/,
      );
    });

    it("sends an anonymous visitor on a listed host to sign-in, on the request's own origin, private and uncached", async () => {
      const response = await proxy(request(mode, "/operator/anything"));
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe(
        `http://${OPS}${mode.base}/login?next=%2Foperator`,
      );
      expect(response.headers.get("cache-control")).toBe(PROTECTED_CACHE);
      expectNoAreaHeaders(response);
      expect(state.rpcCalls).not.toContain("caller_is_platform_operator");
    });

    it("keeps the cookies a refresh wrote on the sign-in redirect", async () => {
      state.refresh = true;
      const response = await proxy(request(mode, "/operator"));
      expect(response.status).toBe(307);
      expect(response.headers.get("set-cookie")).toContain(
        "sb-test-auth-token=rotated-session",
      );
      expect(response.headers.get("cache-control")).toBe(PROTECTED_CACHE);
    });

    it.each(["/operator", "/operator/zzz", "/%6Fperator"])(
      "refuses a signed-in person who is not on the list (%s) with frontNotFound(), header for header",
      async (path) => {
        state.user = { id: USER };
        state.listAnswer = { data: false, error: null };
        await expectSameAs(await proxy(request(mode, path)), frontNotFound());
        expect(state.rpcCalls).toEqual(["caller_is_platform_operator"]);
      },
    );

    it("keeps a rotated refresh token on the refusal of a person who is not on the list", async () => {
      state.user = { id: USER };
      state.refresh = true;
      state.listAnswer = { data: false, error: null };
      const response = await proxy(request(mode, "/operator"));
      expect(response.status).toBe(404);
      expect(await response.text()).toBe("");
      expect(response.headers.get("set-cookie")).toContain(
        "sb-test-auth-token=rotated-session",
      );
      expect(response.headers.get("pragma")).toBe("no-cache");
      expectNoAreaHeaders(response);
    });

    it.each([
      ["an error", { data: null, error: { code: "PGRST202", message: "x" } }],
      ["null", { data: null, error: null }],
      ["a string", { data: "true", error: null }],
      ["a number", { data: 1, error: null }],
      ["an object", { data: { ok: true }, error: null }],
    ])(
      "answers 503, empty and no-store, when the list read gives %s",
      async (_label, answer) => {
        state.user = { id: USER };
        state.listAnswer = answer as typeof state.listAnswer;
        const response = await proxy(request(mode, "/operator"));
        expect(response.status).toBe(503);
        expect(response.headers.get("cache-control")).toBe("no-store");
        expect(await response.text()).toBe("");
        expectNoAreaHeaders(response);
      },
    );

    it("answers 503 when the list read throws", async () => {
      state.user = { id: USER };
      state.rpcThrows = true;
      const response = await proxy(request(mode, "/operator"));
      expect(response.status).toBe(503);
      expect(await response.text()).toBe("");
    });

    it.each(["GET", "HEAD"])(
      "admits an operator's %s with the four protected headers and strips every x-asym-* request header",
      async (method) => {
        state.user = { id: USER };
        const response = await proxy(
          request(mode, "/operator", {
            method,
            headers: {
              "x-asym-tenant": TENANT,
              "x-asym-assignment": USER,
              "x-asym-address-prefix": `/${TENANT}`,
              "x-asym-tenant-rewrite": "forged",
              "x-asym-name-tenant": TENANT,
              "x-asym-pathname": "/settings",
              "x-asym-role-class": "staff",
              "x-asym-anything": "x",
            },
          }),
        );
        expect(response.status).toBe(200);
        expect(response.headers.get("x-middleware-next")).toBe("1");
        expect(response.headers.get("cache-control")).toBe(PROTECTED_CACHE);
        expect(response.headers.get("cdn-cache-control")).toBe("no-store");
        expect(response.headers.get("vercel-cdn-cache-control")).toBe(
          "no-store",
        );
        expect(response.headers.get("referrer-policy")).toBe("no-referrer");
        const overridden = (
          response.headers.get("x-middleware-override-headers") ?? ""
        ).split(",");
        expect(overridden).toContain("host");
        expect(overridden.filter((name) => name.startsWith("x-asym-"))).toEqual(
          [],
        );
        expect(
          [...response.headers.keys()].filter((name) =>
            name.startsWith("x-middleware-request-x-asym-"),
          ),
        ).toEqual([]);
        expect(state.rpcCalls).toEqual(["caller_is_platform_operator"]);
      },
    );

    it("admits an operator on every path of the area", async () => {
      state.user = { id: USER };
      for (const path of ["/operator/", "/operator/zzz", "/%6Fperator"]) {
        const response = await proxy(request(mode, path));
        expect(response.status, path).toBe(200);
        expect(response.headers.get("referrer-policy"), path).toBe(
          "no-referrer",
        );
      }
    });

    it("carries a refresh's cookies to the browser and to the page, and still marks the answer private", async () => {
      state.user = { id: USER };
      state.refresh = true;
      const response = await proxy(
        request(mode, "/operator", {
          headers: { cookie: "sb-test-auth-token=old-session" },
        }),
      );
      expect(response.status).toBe(200);
      expect(response.headers.get("set-cookie")).toContain(
        "sb-test-auth-token=rotated-session",
      );
      expect(response.headers.get("x-middleware-request-cookie")).toContain(
        "sb-test-auth-token=rotated-session",
      );
      expect(response.headers.get("cache-control")).toBe(PROTECTED_CACHE);
      expect(response.headers.get("referrer-policy")).toBe("no-referrer");
    });

    it.each(["/", "/settings", "/operators", "/login", `/${TENANT}/settings`])(
      "leaves %s, which is not the area, to the existing flow",
      async (path) => {
        const response = await proxy(request(mode, path));
        expect(state.rpcCalls).not.toContain("caller_is_platform_operator");
        expect(response.headers.get("referrer-policy")).toBeNull();
      },
    );
  },
);
