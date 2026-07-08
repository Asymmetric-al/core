import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createE2EAuthCookieValue,
  E2E_AUTH_COOKIE_NAME,
} from "../../../packages/auth/e2e-auth";

// Stable object identity for hoisted mock factory (reassigning `let` can desync the mock).
const mockSupabaseConfig = {
  url: null as string | null,
  key: null as string | null,
  keyType: null as "anon" | "publishable" | null,
};
const { supabaseSessionRef } = vi.hoisted(() => ({
  supabaseSessionRef: { userId: null as string | null },
}));

vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: () => mockSupabaseConfig,
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: {
      getUser: () =>
        Promise.resolve({
          data: {
            user: supabaseSessionRef.userId
              ? { id: supabaseSessionRef.userId }
              : null,
          },
        }),
    },
  }),
}));

const { createAuthMiddleware } =
  await import("../../../packages/auth/middleware");

const originalE2EAuthBypass = process.env.E2E_AUTH_BYPASS;
const originalNodeEnv = process.env.NODE_ENV;
const originalE2ESecret = process.env.E2E_AUTH_SECRET;
const originalE2EAllowlist = process.env.E2E_AUTH_ALLOWED_SUPABASE_REFS;

function createRequest(
  pathname: string,
  cookieMap?: Record<string, string>,
  hostHeader?: string,
) {
  const nextUrl = new URL(`https://example.org${pathname}`);
  (nextUrl as URL & { clone: () => URL }).clone = () =>
    new URL(nextUrl.toString());

  const headers = new Headers();
  if (hostHeader) {
    headers.set("host", hostHeader);
  }

  return {
    nextUrl,
    headers,
    cookies: {
      get: vi.fn((name: string) =>
        cookieMap && name in cookieMap
          ? { name, value: cookieMap[name]! }
          : undefined,
      ),
      getAll: vi.fn(() => []),
      set: vi.fn(),
    },
  } as never;
}

function mockNoConfig() {
  mockSupabaseConfig.url = null;
  mockSupabaseConfig.key = null;
  mockSupabaseConfig.keyType = null;
  supabaseSessionRef.userId = null;
}

function mockConfigWithUser(userId: string | null = "user_123") {
  mockSupabaseConfig.url = "https://example.supabase.co";
  mockSupabaseConfig.key = "anon-key";
  mockSupabaseConfig.keyType = "anon";
  supabaseSessionRef.userId = userId;
}

describe("createAuthMiddleware", () => {
  beforeEach(() => {
    process.env.E2E_AUTH_BYPASS = originalE2EAuthBypass;
    process.env.NODE_ENV = originalNodeEnv;
    process.env.E2E_AUTH_SECRET = "middleware-test-secret";
    process.env.E2E_AUTH_ALLOWED_SUPABASE_REFS = "example";
    mockNoConfig();
  });

  afterEach(() => {
    process.env.E2E_AUTH_BYPASS = originalE2EAuthBypass;
    process.env.NODE_ENV = originalNodeEnv;
    process.env.E2E_AUTH_SECRET = originalE2ESecret;
    process.env.E2E_AUTH_ALLOWED_SUPABASE_REFS = originalE2EAllowlist;
  });

  it("redirects unauthenticated page requests to login with next param", async () => {
    mockConfigWithUser(null);
    const middleware = createAuthMiddleware({
      publicRoutes: ["/register", "/auth/callback"],
      protectedRoutePrefixes: ["/"],
      loginPath: "/login",
    });

    const response = await middleware(createRequest("/reports?tab=open"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://example.org/login?next=%2Freports%3Ftab%3Dopen",
    );
  });

  it("passes API routes through when allowApi is true", async () => {
    const middleware = createAuthMiddleware({
      publicRoutes: ["/", "/register", "/auth/callback"],
      loginPath: "/login",
    });

    const response = await middleware(createRequest("/api/secure/tenants"));

    expect(response.status).toBe(200);
  });

  it("allows requests to auth routes without redirecting", async () => {
    mockConfigWithUser();
    const middleware = createAuthMiddleware({
      publicRoutes: ["/", "/register", "/auth/callback"],
      loginPath: "/login",
    });

    const response = await middleware(createRequest("/login"));

    expect(response.status).toBe(200);
  });

  it("redirects to login from protected route when no session", async () => {
    mockConfigWithUser(null);
    const middleware = createAuthMiddleware({
      publicRoutes: ["/register", "/auth/callback"],
      protectedRoutePrefixes: ["/"],
      loginPath: "/login",
    });

    const response = await middleware(createRequest("/web-studio"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain(
      "https://example.org/login",
    );
    expect(response.headers.get("location")).toContain("next=%2Fweb-studio");
  });

  it("accepts E2E auth cookie when bypass is enabled and role is allowed", async () => {
    process.env.E2E_AUTH_BYPASS = "1";
    mockConfigWithUser(null);
    const middleware = createAuthMiddleware({
      publicRoutes: ["/login", "/register", "/auth/callback"],
      protectedRoutePrefixes: ["/donor-dashboard"],
      loginPath: "/login",
      allowedRoles: ["donor", "super_admin"],
    });
    const cookieValue = await createE2EAuthCookieValue({
      userId: "e2e-donor-user",
      role: "donor",
      tenantId: null,
    });
    const response = await middleware(
      createRequest("/donor-dashboard/settings", {
        [E2E_AUTH_COOKIE_NAME]: cookieValue,
      }),
    );
    expect(response.status).toBe(200);
  });

  it("honors E2E auth cookie on protected routes outside production", async () => {
    mockConfigWithUser(null);
    const { createE2EAuthCookieValue: mkCookie, E2E_AUTH_COOKIE_NAMES } =
      await import("../../../packages/auth/e2e-auth");
    const cookieValue = await mkCookie({
      userId: "e2e-donor-user",
      role: "donor",
      tenantId: null,
    });

    const middleware = createAuthMiddleware({
      publicRoutes: ["/login", "/register", "/auth/callback"],
      protectedRoutePrefixes: ["/donor-dashboard"],
      loginPath: "/login",
      allowedRoles: ["donor", "super_admin"],
    });

    const response = await middleware(
      createRequest(
        "/donor-dashboard/settings",
        {
          [E2E_AUTH_COOKIE_NAMES.donor]: cookieValue,
        },
        "localhost:3005",
      ),
    );

    expect(response.status).toBe(200);
  });

  it("rejects E2E auth cookie when role is not allowed", async () => {
    process.env.E2E_AUTH_BYPASS = "1";
    mockConfigWithUser(null);
    const middleware = createAuthMiddleware({
      publicRoutes: ["/login", "/register", "/auth/callback"],
      protectedRoutePrefixes: ["/donor-dashboard"],
      loginPath: "/login",
      allowedRoles: ["donor", "super_admin"],
    });
    const cookieValue = await createE2EAuthCookieValue({
      userId: "e2e-admin-user",
      role: "admin",
      tenantId: null,
    });
    const response = await middleware(
      createRequest("/donor-dashboard/settings", {
        [E2E_AUTH_COOKIE_NAME]: cookieValue,
      }),
    );
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login");
  });

  it("allows auth route request when session present", async () => {
    mockConfigWithUser();
    const middleware = createAuthMiddleware({
      publicRoutes: ["/login", "/register", "/auth/callback"],
      loginPath: "/login",
    });

    const response = await middleware(createRequest("/login"));

    expect(response.status).toBe(200);
  });

  it("uses only nextUrl.origin for redirect (no open redirect)", async () => {
    mockNoConfig();
    const middleware = createAuthMiddleware({
      publicRoutes: ["/register", "/auth/callback"],
      loginPath: "/login",
    });

    const request = createRequest("/reports");
    const response = await middleware(request);

    if (response.status === 307) {
      const location = response.headers.get("location") ?? "";
      expect(location).toMatch(/^https:\/\/example\.org\/login/);
      expect(location).not.toMatch(/^https:\/\/evil\.com/);
    }
  });

  it("allows protected routes when E2E bypass cookie is present (no Supabase user)", async () => {
    process.env.E2E_AUTH_BYPASS = "true";
    process.env.NODE_ENV = "development";
    mockConfigWithUser(null);
    const e2eValue = await createE2EAuthCookieValue({
      userId: "e2e-donor-user",
      role: "donor",
      tenantId: null,
    });
    const middleware = createAuthMiddleware({
      publicRoutes: ["/login", "/register"],
      protectedRoutePrefixes: ["/donor-dashboard"],
      loginPath: "/login",
    });

    const response = await middleware(
      createRequest("/donor-dashboard/settings", {
        [E2E_AUTH_COOKIE_NAME]: e2eValue,
      }),
    );

    expect(response.status).toBe(200);
  });

  it("throws before serving when bypass is enabled against a non-allowlisted datasource", async () => {
    process.env.E2E_AUTH_BYPASS = "1";
    process.env.NODE_ENV = "development";
    process.env.E2E_AUTH_ALLOWED_SUPABASE_REFS = "example";
    mockConfigWithUser(null);
    // Point at a production-looking ref that is NOT in the allowlist.
    mockSupabaseConfig.url = "https://prodxxxx.supabase.co";
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const middleware = createAuthMiddleware({
      publicRoutes: ["/login"],
      protectedRoutePrefixes: ["/donor-dashboard"],
      loginPath: "/login",
    });

    await expect(
      middleware(createRequest("/donor-dashboard/settings")),
    ).rejects.toThrow(/allowlisted/i);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("E2E bypass blocked"),
    );
  });
});
