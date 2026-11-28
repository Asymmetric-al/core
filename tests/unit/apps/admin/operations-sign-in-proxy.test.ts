import { randomBytes } from "node:crypto";

import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  getUserCalls: 0,
  rpcCalls: [] as string[],
  user: null as { id: string } | null,
  lookups: 0,
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
        state.getUserCalls += 1;
        return { data: { user: state.user }, error: null };
      },
    },
    rpc: async (fn: string) => {
      state.rpcCalls.push(fn);
      return { data: [], error: null };
    },
  }),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    rpc: () => {
      state.lookups += 1;
      return { abortSignal: async () => ({ data: [], error: null }) };
    },
  }),
}));

const { proxy } = await import("../../../../apps/admin/proxy");
const { signFrontStamp } = await import("../../../../packages/auth/front");

const OPS = "ops.test";
const ORIGIN = `http://${OPS}`;
const TENANT = "00000000-0000-0000-0000-000000000001";
const USER = "00000000-0000-4000-8000-0000000000a1";
const FORGED = {
  "x-asym-tenant": TENANT,
  "x-asym-assignment": "00000000-0000-4000-8000-0000000000b1",
  "x-asym-name-tenant": TENANT,
  "x-asym-name-generation": "7",
  "x-asym-role-class": "staff",
  "x-asym-pathname": "/donors",
};

type Init = {
  method?: string;
  host?: string;
  headers?: Record<string, string>;
};

function onRequest(path: string, init: Init = {}) {
  return new NextRequest(`${ORIGIN}/admin${path}`, {
    method: init.method ?? "GET",
    headers: { host: init.host ?? OPS, ...init.headers },
    nextConfig: { basePath: "/admin" },
  });
}

function forwardedAsym(response: Response): string[] {
  const names: string[] = [];
  response.headers.forEach((_value, name) => {
    if (name.startsWith("x-middleware-request-x-asym-")) names.push(name);
  });
  const overridden = response.headers.get("x-middleware-override-headers");
  for (const name of overridden?.split(",") ?? []) {
    if (name.trim().startsWith("x-asym-")) names.push(name.trim());
  }
  return names;
}

function expectPassed(response: Response, label: string) {
  expect(response.status, label).toBe(200);
  expect(response.headers.get("x-middleware-next"), label).toBe("1");
  expect(forwardedAsym(response), label).toEqual([]);
}

function expectRefused(response: Response, label: string) {
  expect(response.status, label).toBe(403);
  expect(response.headers.get("cache-control"), label).toBe("no-store");
  expect(response.headers.get("x-middleware-next"), label).toBeNull();
}

beforeEach(() => {
  state.getUserCalls = 0;
  state.rpcCalls = [];
  state.user = null;
  state.lookups = 0;
  vi.stubEnv("OPERATIONS_NAMES", OPS);
  vi.stubEnv("FRONT_STAMP_KEY", randomBytes(32).toString("hex").slice(0, 32));
  vi.stubEnv("FRONT_STAMP_KEY_PREVIOUS", "");
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("on: an operations address admits sign-in, and nothing else, unstamped", () => {
  beforeEach(() => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
    vi.stubEnv("CORE_APP_BASE_PATH", "/admin");
  });

  it.each(["GET", "HEAD"])(
    "%s /admin/login reaches the sign-in page, with every client x-asym-* header stripped (base: 403)",
    async (method) => {
      expectPassed(
        await proxy(
          onRequest("/login?next=%2Fdonors", { method, headers: FORGED }),
        ),
        `${method} /login`,
      );
      expect(state.rpcCalls).toEqual([]);
      expect(state.lookups).toBe(0);
    },
  );

  it("passes /admin/auth/callback to its handler, stripped, reading nothing (base: 403)", async () => {
    expectPassed(
      await proxy(
        onRequest("/auth/callback?code=x&next=%2Fdonors", { headers: FORGED }),
      ),
      "/auth/callback",
    );
    expect(state.getUserCalls).toBe(0);
    expect(state.rpcCalls).toEqual([]);
    expect(state.lookups).toBe(0);
  });

  it("sends a signed-in visit to /admin/login to /admin/operator whatever next says, reading no membership, name or generation (base: 403)", async () => {
    state.user = { id: USER };
    const response = await proxy(
      onRequest("/login?next=%2Fdonors", { headers: FORGED }),
    );
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(`${ORIGIN}/admin/operator`);
    expect(response.headers.get("cache-control")).toBe(
      "private, no-store, no-transform, max-age=0",
    );
    expect(state.rpcCalls).toEqual([]);
    expect(state.lookups).toBe(0);
  });

  it("passes a same-origin POST /admin/api/auth/signout, stripped, and refuses a cross-origin one through the mutation admission", async () => {
    expectPassed(
      await proxy(
        onRequest("/api/auth/signout", {
          method: "POST",
          headers: { ...FORGED, origin: ORIGIN },
        }),
      ),
      "same-origin sign-out",
    );
    const crossOrigin = await proxy(
      onRequest("/api/auth/signout", {
        method: "POST",
        headers: { origin: "https://evil.test" },
      }),
    );
    expect(crossOrigin.status).toBe(403);
    expect(crossOrigin.headers.get("x-middleware-next")).toBeNull();
  });

  it("passes a same-origin POST /admin/api/auth/sign-in, stripped, and refuses a cross-origin one through the mutation admission (N4: Core's sign-in; base: 403)", async () => {
    expectPassed(
      await proxy(
        onRequest("/api/auth/sign-in", {
          method: "POST",
          headers: {
            ...FORGED,
            origin: ORIGIN,
            "content-type": "application/json",
          },
        }),
      ),
      "same-origin sign-in",
    );
    const crossOrigin = await proxy(
      onRequest("/api/auth/sign-in", {
        method: "POST",
        headers: { origin: "https://evil.test" },
      }),
    );
    expect(crossOrigin.status).toBe(403);
    expect(crossOrigin.headers.get("x-middleware-next")).toBeNull();
    expect(state.rpcCalls).toEqual([]);
    expect(state.lookups).toBe(0);
  });

  it.each(["GET", "HEAD"])(
    "passes %s /admin/api/auth/session, stripped, reading nothing (N4: Core's session state; base: 403)",
    async (method) => {
      expectPassed(
        await proxy(
          onRequest("/api/auth/session", { method, headers: FORGED }),
        ),
        `${method} /api/auth/session`,
      );
      expect(state.getUserCalls).toBe(0);
      expect(state.rpcCalls).toEqual([]);
      expect(state.lookups).toBe(0);
    },
  );

  it("admits a host spelled with ASCII spaces, tabs and capitals (base: 403)", async () => {
    expectPassed(
      await proxy(onRequest("/login", { host: " OPS.test\t" })),
      "spelled host",
    );
  });

  it.each([
    ["/donors", "GET"],
    [`/${TENANT}/x`, "GET"],
    ["/web-studio", "GET"],
    ["/api/admin/eve/launch-readiness", "GET"],
    ["/api/auth/demo-account", "POST"],
    ["/api/auth/demo-account", "GET"],
    ["/forgot-password", "GET"],
    ["/register", "GET"],
    ["/login", "POST"],
    ["/%6Cogin", "GET"],
    ["/login/", "GET"],
    ["/auth/callback", "POST"],
    ["/api/auth/signout", "GET"],
    ["/api/auth/sign-in", "GET"],
    ["/api/auth/session", "POST"],
    ["/api/auth/password", "POST"],
    ["/api/auth/sign-in/", "POST"],
  ])("refuses %s (%s) with 403 no-store (guard)", async (path, method) => {
    expectRefused(
      await proxy(
        onRequest(path, {
          method,
          headers: method === "POST" ? { origin: ORIGIN } : {},
        }),
      ),
      `${method} ${path}`,
    );
  });

  it("refuses an x-forwarded-host that names another host, and an unlisted host (guards)", async () => {
    expectRefused(
      await proxy(
        onRequest("/login", { headers: { "x-forwarded-host": "other.test" } }),
      ),
      "forwarded elsewhere",
    );
    expectRefused(
      await proxy(onRequest("/login", { host: "unlisted.test" })),
      "unlisted host",
    );
  });

  it("still answers the staff project's explicit exempt list there (guard)", async () => {
    const response = await proxy(onRequest("/api/health/migrations"));
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("sends a signed-out visit to /admin/operator to sign-in with next=/operator (guard)", async () => {
    const response = await proxy(onRequest("/operator"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      `${ORIGIN}/admin/login?next=%2Foperator`,
    );
  });

  it("leaves a request with a front header to the front's admission, as today (guard)", async () => {
    const origin = "https://a.test";
    const stamp = await signFrontStamp(
      origin,
      "/admin",
      process.env.FRONT_STAMP_KEY!,
    );
    const response = await proxy(
      onRequest("/login", {
        headers: { "x-asym-front-origin": origin, "x-asym-front-stamp": stamp },
      }),
    );
    expect(state.lookups).toBe(1);
    expect(response.status).toBe(404);
  });
});

describe.each([
  ["unset", undefined],
  ["0", "0"],
] as const)(
  "off (switch %s): an operations name is a staff host as today (guards)",
  (_label, value) => {
    beforeEach(() => {
      vi.stubEnv("CORE_SERVE_UNDER_PATHS", value);
      vi.stubEnv("CORE_APP_BASE_PATH", "");
    });

    function offRequest(path: string, init: Init = {}) {
      return new NextRequest(`${ORIGIN}${path}`, {
        method: init.method ?? "GET",
        headers: { host: OPS, ...init.headers },
      });
    }

    it("a signed-in visit to /login keeps its next", async () => {
      state.user = { id: USER };
      const response = await proxy(offRequest("/login?next=%2Fdonors"));
      expect(response.status).toBe(307);
      expect(new URL(response.headers.get("location")!).pathname).toBe(
        "/donors",
      );
    });

    it.each(["/forgot-password", "/register"])(
      "%s is served as today",
      async (path) => {
        const response = await proxy(offRequest(path));
        expect(response.headers.get("x-middleware-next")).toBe("1");
      },
    );
  },
);
