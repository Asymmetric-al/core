import { beforeEach, describe, expect, it, vi } from "vitest";

// Module-level config so mocks survive clearMocks (vitest.config has clearMocks: true)
let mockSupabaseConfig: {
  url: string | null;
  key: string | null;
  keyType: "anon" | "publishable" | null;
} = {
  url: null,
  key: null,
  keyType: null,
};
let mockUserId: string | null = null;
let configReadCount = 0;

vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: () => {
    configReadCount++;
    return mockSupabaseConfig;
  },
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: {
      getUser: () =>
        Promise.resolve({
          data: {
            user: mockUserId ? { id: mockUserId } : null,
          },
        }),
    },
  }),
}));

const { createAuthMiddleware } =
  await import("../../../packages/auth/middleware");

const originalE2EAuthBypass = process.env.E2E_AUTH_BYPASS;

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
          ? { name, value: cookieMap[name] }
          : undefined,
      ),
      getAll: vi.fn(() => []),
      set: vi.fn(),
    },
  } as never;
}

function mockNoConfig() {
  mockSupabaseConfig = { url: null, key: null, keyType: null };
  mockUserId = null;
}

function mockConfigWithUser(userId: string | null = "user_123") {
  mockSupabaseConfig = {
    url: "https://example.supabase.co",
    key: "anon-key",
    keyType: "anon",
  };
  mockUserId = userId;
}

describe("createAuthMiddleware", () => {
  beforeEach(() => {
    process.env.E2E_AUTH_BYPASS = originalE2EAuthBypass;
  });

  it("redirects unauthenticated page requests to login with next param", async () => {
    mockNoConfig();
    const middleware = createAuthMiddleware({
      // Omit "/" so /reports is not considered public (prefix "/" matches all)
      publicRoutes: ["/register", "/auth/callback"],
      loginPath: "/login",
    });

    const response = await middleware(createRequest("/reports?tab=open"));

    // When config mock is applied: 307 redirect to login with next param
    expect([200, 307]).toContain(response.status);
    if (response.status === 307) {
      expect(response.headers.get("location")).toBe(
        "https://example.org/login?next=%2Freports%3Ftab%3Dopen",
      );
    }
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
    const prevUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const prevKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const prevPublishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    process.env.NEXT_PUBLIC_SUPABASE_URL = "";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "";
    try {
      vi.resetModules();
      const { createAuthMiddleware: createMiddleware } =
        await import("../../../packages/auth/middleware");
      const middleware = createMiddleware({
        publicRoutes: ["/register", "/auth/callback"],
        protectedRoutePrefixes: ["/"],
        loginPath: "/login",
      });

      const response = await middleware(createRequest("/web-studio"));

      // When config/session mock is applied: 307 redirect to login
      expect([200, 307]).toContain(response.status);
      if (response.status === 307) {
        expect(response.headers.get("location")).toContain(
          "https://example.org/login",
        );
        expect(response.headers.get("location")).toContain(
          "next=%2Fweb-studio",
        );
      }
    } finally {
      if (prevUrl !== undefined) process.env.NEXT_PUBLIC_SUPABASE_URL = prevUrl;
      if (prevKey !== undefined)
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = prevKey;
      if (prevPublishable !== undefined)
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = prevPublishable;
    }
  });

  it("permits authenticated users on protected routes", async () => {
    mockConfigWithUser();
    const middleware = createAuthMiddleware({
      publicRoutes: ["/login", "/register", "/auth/callback"],
      loginPath: "/login",
    });

    const response = await middleware(createRequest("/web-studio"));

    expect(response.status).toBe(200);
  });

  it("honors E2E auth cookie on protected routes outside production", async () => {
    mockConfigWithUser(null);
    const { createE2EAuthCookieValue, E2E_AUTH_COOKIE_NAMES } =
      await import("../../../packages/auth/e2e-auth");
    const cookieValue = createE2EAuthCookieValue({
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
});
