import { beforeEach, describe, expect, it, vi } from "vitest";
import { createE2EAuthCookieValue } from "../../../packages/auth/e2e-auth";

// Stable object identity for hoisted mock factory (reassigning `let` can desync the mock).
const mockSupabaseConfig = {
  url: null as string | null,
  key: null as string | null,
  keyType: null as "anon" | "publishable" | null,
};
let configReadCount = 0;

const { supabaseSessionRef } = vi.hoisted(() => ({
  supabaseSessionRef: { userId: null as string | null },
}));

vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: () => {
    configReadCount++;
    return {
      url: mockSupabaseConfig.url,
      key: mockSupabaseConfig.key,
      keyType: mockSupabaseConfig.keyType,
    };
  },
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

function createRequest(pathname: string) {
  const nextUrl = new URL(`https://example.org${pathname}`);
  (nextUrl as URL & { clone: () => URL }).clone = () =>
    new URL(nextUrl.toString());

  return {
    nextUrl,
    cookies: {
      get: vi.fn(() => undefined),
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
    mockNoConfig();
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

  it("allows protected routes when the e2e bypass cookie is present", async () => {
    process.env.E2E_AUTH_BYPASS = "true";
    mockNoConfig();
    const middleware = createAuthMiddleware({
      publicRoutes: ["/login", "/register", "/auth/callback"],
      protectedRoutePrefixes: ["/"],
      loginPath: "/login",
    });
    const request = createRequest("/web-studio");
    const encoded = createE2EAuthCookieValue({
      userId: "e2e-donor-user",
      role: "donor",
      tenantId: null,
    });
    request.cookies.get = vi.fn((name: string) =>
      name === "asym_e2e_auth" ? { value: encoded } : undefined,
    );

    const response = await middleware(request);

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
