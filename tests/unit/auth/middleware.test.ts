import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createE2EAuthCookieValue,
  E2E_AUTH_COOKIE_NAME,
  E2E_AUTH_COOKIE_NAMES,
} from "../../../packages/auth/e2e-auth";

import type { RoleSnapshot } from "../../../packages/auth/permissions";

type MockCookieToSet = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

// Stable object identity for hoisted mock factory (reassigning `let` can desync the mock).
const mockSupabaseConfig = {
  url: null as string | null,
  key: null as string | null,
  keyType: null as "anon" | "publishable" | null,
};
const { supabaseCookiesToSetRef, supabaseSessionRef } = vi.hoisted(() => ({
  supabaseCookiesToSetRef: { cookies: [] as MockCookieToSet[] },
  supabaseSessionRef: { userId: null as string | null },
}));

vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: () => mockSupabaseConfig,
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: (
    _url: string,
    _key: string,
    options: { cookies: { setAll: (cookies: MockCookieToSet[]) => void } },
  ) => ({
    auth: {
      getUser: () => {
        if (supabaseCookiesToSetRef.cookies.length > 0) {
          options.cookies.setAll(supabaseCookiesToSetRef.cookies);
        }

        return Promise.resolve({
          data: {
            user: supabaseSessionRef.userId
              ? { id: supabaseSessionRef.userId }
              : null,
          },
        });
      },
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
  supabaseCookiesToSetRef.cookies = [];
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

  it("accepts legacy E2E auth cookie when bypass is enabled and role is allowed", async () => {
    process.env.E2E_AUTH_BYPASS = "1";
    mockConfigWithUser(null);
    const middleware = createAuthMiddleware({
      publicRoutes: ["/login", "/register", "/auth/callback"],
      protectedRoutePrefixes: ["/donor-dashboard"],
      loginPath: "/login",
      allowedRoles: ["donor", "super_admin"],
      resolveUserRole: async () => null,
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

  it("accepts surface E2E auth cookie when bypass is enabled and role is allowed", async () => {
    process.env.E2E_AUTH_BYPASS = "1";
    mockConfigWithUser(null);
    const cookieValue = await createE2EAuthCookieValue({
      userId: "e2e-donor-user",
      role: "donor",
      tenantId: null,
    });

    const middleware = createAuthMiddleware({
      publicRoutes: ["/login", "/register", "/auth/callback"],
      protectedRoutePrefixes: ["/donor-dashboard"],
      loginPath: "/login",
      allowedRoles: ["donor", "super_admin"],
      resolveUserRole: async () => null,
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

  it("redirects valid surface E2E auth cookie when bypass is unset in development", async () => {
    delete process.env.E2E_AUTH_BYPASS;
    process.env.NODE_ENV = "development";
    mockConfigWithUser(null);
    const cookieValue = await createE2EAuthCookieValue({
      userId: "e2e-donor-user",
      role: "donor",
      tenantId: null,
    });
    const middleware = createAuthMiddleware({
      publicRoutes: ["/login", "/register", "/auth/callback"],
      protectedRoutePrefixes: ["/donor-dashboard"],
      loginPath: "/login",
      allowedRoles: ["donor", "super_admin"],
      resolveUserRole: async () => null,
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

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://example.org/login?next=%2Fdonor-dashboard%2Fsettings",
    );
  });

  it("redirects valid surface E2E auth cookie when bypass is false against a non-allowlisted datasource", async () => {
    process.env.E2E_AUTH_BYPASS = "false";
    process.env.NODE_ENV = "development";
    process.env.E2E_AUTH_ALLOWED_SUPABASE_REFS = "example";
    mockConfigWithUser(null);
    mockSupabaseConfig.url = "https://prodxxxx.supabase.co";
    const cookieValue = await createE2EAuthCookieValue({
      userId: "e2e-donor-user",
      role: "donor",
      tenantId: null,
    });
    const middleware = createAuthMiddleware({
      publicRoutes: ["/login", "/register", "/auth/callback"],
      protectedRoutePrefixes: ["/donor-dashboard"],
      loginPath: "/login",
      allowedRoles: ["donor", "super_admin"],
      resolveUserRole: async () => null,
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

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://example.org/login?next=%2Fdonor-dashboard%2Fsettings",
    );
  });

  it("rejects E2E auth cookie when role is not allowed", async () => {
    process.env.E2E_AUTH_BYPASS = "1";
    mockConfigWithUser(null);
    const middleware = createAuthMiddleware({
      publicRoutes: ["/login", "/register", "/auth/callback"],
      protectedRoutePrefixes: ["/donor-dashboard"],
      loginPath: "/login",
      allowedRoles: ["donor", "super_admin"],
      resolveUserRole: async () => null,
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

  it("redirects a signed-in visitor away from an auth route when redirectAuthenticatedTo is set", async () => {
    mockConfigWithUser();
    const middleware = createAuthMiddleware({
      publicRoutes: ["/login", "/register", "/auth/callback"],
      loginPath: "/login",
      redirectAuthenticatedTo: "/donor-dashboard",
    });

    const response = await middleware(createRequest("/login"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://example.org/donor-dashboard",
    );
  });

  it("preserves refreshed auth cookies when redirecting a signed-in visitor off an auth route", async () => {
    mockConfigWithUser();
    supabaseCookiesToSetRef.cookies = [
      {
        name: "sb-access-token",
        value: "refreshed-access-token",
        options: { path: "/", httpOnly: true },
      },
    ];
    const middleware = createAuthMiddleware({
      publicRoutes: ["/login", "/register", "/auth/callback"],
      loginPath: "/login",
      redirectAuthenticatedTo: "/donor-dashboard",
    });

    const response = await middleware(createRequest("/login"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://example.org/donor-dashboard",
    );
    expect(response.cookies.get("sb-access-token")?.value).toBe(
      "refreshed-access-token",
    );
  });

  it("honours a safe next param when redirecting a signed-in visitor off an auth route", async () => {
    mockConfigWithUser();
    const middleware = createAuthMiddleware({
      publicRoutes: ["/login", "/register", "/auth/callback"],
      loginPath: "/login",
      redirectAuthenticatedTo: "/donor-dashboard",
    });

    const response = await middleware(
      createRequest("/login?next=%2Fdonor-dashboard%2Fhistory"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://example.org/donor-dashboard/history",
    );
  });

  it("ignores an off-origin next param when redirecting a signed-in visitor", async () => {
    mockConfigWithUser();
    const middleware = createAuthMiddleware({
      publicRoutes: ["/login", "/register", "/auth/callback"],
      loginPath: "/login",
      redirectAuthenticatedTo: "/donor-dashboard",
    });

    const response = await middleware(
      createRequest("/login?next=https%3A%2F%2Fevil.example%2Fsteal"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://example.org/donor-dashboard",
    );
  });

  it("redirects a signed-in wrong-role visitor without entering an auth loop", async () => {
    mockConfigWithUser("user_donor");
    const middleware = createAuthMiddleware({
      publicRoutes: ["/login", "/register", "/no-access"],
      protectedRoutePrefixes: ["/"],
      loginPath: "/login",
      redirectAuthenticatedTo: "/",
      unauthorizedRedirectTo: "/no-access",
      allowedRoles: ["staff", "admin", "super_admin"],
      resolveUserRole: async () => ({
        profileRole: "donor",
        memberships: [],
      }),
    });

    const response = await middleware(createRequest("/login"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://example.org/no-access",
    );
  });

  it("leaves auth routes alone for an E2E-bypass session with no Supabase user", async () => {
    // The bypass cookie populates `userId` but never a Supabase `user`; keying
    // the redirect off `userId` would bounce the e2e suite off /login.
    mockConfigWithUser(null);
    process.env.E2E_AUTH_BYPASS = "true";
    const middleware = createAuthMiddleware({
      publicRoutes: ["/login", "/register", "/auth/callback"],
      loginPath: "/login",
      redirectAuthenticatedTo: "/donor-dashboard",
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
    const cookieValue = await createE2EAuthCookieValue({
      userId: "e2e-donor-user",
      role: "donor",
      tenantId: null,
    });

    await expect(
      middleware(
        createRequest(
          "/donor-dashboard/settings",
          {
            [E2E_AUTH_COOKIE_NAMES.donor]: cookieValue,
          },
          "localhost:3005",
        ),
      ),
    ).rejects.toThrow(/allowlisted/i);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("E2E bypass blocked"),
    );
  });
});

describe("preview role-gate diagnostics", () => {
  const middlewareFor = (snapshot: RoleSnapshot | null) =>
    createAuthMiddleware({
      protectedRoutePrefixes: ["/crm"],
      allowedRoles: ["staff"],
      redirectAuthenticatedTo: "/crm",
      unauthorizedRedirectTo: "/no-access",
      resolveUserRole: async () => snapshot,
    });

  beforeEach(() => {
    mockNoConfig();
    mockConfigWithUser("private-user");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("E2E_AUTH_BYPASS", "false");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_TARGET_ENV", "preview");
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    mockNoConfig();
  });

  it.each(["/crm", "/login"])(
    "identifies role denial on %s while preserving redirect and refreshed cookies",
    async (pathname) => {
      supabaseCookiesToSetRef.cookies = [
        {
          name: "sb-access-token",
          value: "private-refresh-cookie",
          options: { path: "/", httpOnly: true, sameSite: "lax" },
        },
      ];
      const middleware = middlewareFor({
        profileRole: "donor",
        memberships: [],
      });

      const response = await middleware(
        createRequest(pathname + "?private=secret-query"),
      );
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe(
        "https://example.org/no-access",
      );
      expect(response.cookies.get("sb-access-token")).toMatchObject({
        value: "private-refresh-cookie",
        path: "/",
        httpOnly: true,
        sameSite: "lax",
      });
      expect(console.warn).toHaveBeenCalledExactlyOnceWith({
        event: "auth_access_diagnostic",
        stage: "role_gate",
        outcome: "role_denied",
        code: null,
      });
    },
  );

  it.each(["/crm", "/login"])(
    "keeps %s denied with refreshed cookies when the diagnostic sink throws",
    async (pathname) => {
      vi.mocked(console.warn).mockImplementation(() => {
        throw new Error("private sink error");
      });
      supabaseCookiesToSetRef.cookies = [
        {
          name: "sb-access-token",
          value: "private-refresh-cookie",
          options: { path: "/", httpOnly: true },
        },
      ];
      const middleware = middlewareFor({
        profileRole: "donor",
        memberships: [],
      });
      const response = await middleware(createRequest(pathname));
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe(
        "https://example.org/no-access",
      );
      expect(response.cookies.get("sb-access-token")?.value).toBe(
        "private-refresh-cookie",
      );
      expect(console.warn).toHaveBeenCalledTimes(1);
    },
  );

  it.each(["/crm", "/login"])(
    "keeps %s denied but silent when production contradicts a preview target",
    async (pathname) => {
      vi.stubEnv("VERCEL_ENV", "production");
      const middleware = middlewareFor({
        profileRole: "donor",
        memberships: [],
      });
      const response = await middleware(createRequest(pathname));
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe(
        "https://example.org/no-access",
      );
      expect(console.warn).not.toHaveBeenCalled();
    },
  );

  it.each(["/crm", "/login"])(
    "preserves allowed and unresolved behavior on %s without a role-denial event",
    async (pathname) => {
      const allowed = await middlewareFor({
        profileRole: "staff",
        memberships: [],
      })(createRequest(pathname));
      expect(allowed.status).toBe(pathname === "/login" ? 307 : 200);
      expect(allowed.headers.get("location")).toBe(
        pathname === "/login" ? "https://example.org/crm" : null,
      );
      const unresolved = await middlewareFor(null)(createRequest(pathname));
      expect(unresolved.status).toBe(307);
      expect(unresolved.headers.get("location")).toBe(
        "https://example.org/no-access",
      );
      expect(console.warn).not.toHaveBeenCalled();
    },
  );
});

describe("edge role enforcement", () => {
  beforeEach(() => {
    process.env.E2E_AUTH_BYPASS = "false";
    mockConfigWithUser("user_donor");
  });

  it("redirects a signed-in user whose role is not allowed for the app", async () => {
    const middleware = createAuthMiddleware({
      protectedRoutePrefixes: ["/crm"],
      allowedRoles: ["staff", "admin", "super_admin"],
      unauthorizedRedirectTo: "/no-access",
      resolveUserRole: async () => ({
        profileRole: "donor",
        memberships: [],
      }),
    });

    const response = await middleware(createRequest("/crm"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://example.org/no-access",
    );
  });

  it("lets a signed-in user with an allowed role through", async () => {
    const middleware = createAuthMiddleware({
      protectedRoutePrefixes: ["/crm"],
      allowedRoles: ["staff", "admin", "super_admin"],
      unauthorizedRedirectTo: "/no-access",
      resolveUserRole: async () => ({
        profileRole: "staff",
        memberships: [],
      }),
    });

    const response = await middleware(createRequest("/crm"));

    expect(response.status).toBe(200);
  });

  it("allows any active membership instead of only the primary role", async () => {
    const middleware = createAuthMiddleware({
      protectedRoutePrefixes: ["/donor-dashboard"],
      allowedRoles: ["donor"],
      unauthorizedRedirectTo: "/no-access",
      resolveUserRole: async () => ({
        profileRole: "staff",
        memberships: [
          {
            tenantId: "tenant_1",
            role: "donor",
            staffRole: null,
            isActive: true,
          },
          {
            tenantId: "tenant_1",
            role: "staff",
            staffRole: null,
            isActive: true,
          },
        ],
      }),
    });

    const response = await middleware(createRequest("/donor-dashboard"));

    expect(response.status).toBe(200);
  });

  /**
   * The missionary app's shape: everything protected, and the app's own home
   * page is the dashboard. Listing "/" as public cancels the gate outright,
   * because the public check returns before authentication runs.
   */
  const missionaryLikeMiddleware = (
    resolveUserRole: () => Promise<{
      profileRole: "missionary" | "donor";
      memberships: [];
    }>,
  ) =>
    createAuthMiddleware({
      publicRoutes: ["/login", "/register", "/no-access"],
      protectedRoutePrefixes: ["/"],
      loginPath: "/login",
      redirectAuthenticatedTo: "/",
      unauthorizedRedirectTo: "/no-access",
      allowedRoles: ["missionary", "admin", "staff", "super_admin"],
      resolveUserRole,
    });

  it("sends an anonymous visitor on a protected home page to login", async () => {
    mockConfigWithUser(null);
    const middleware = missionaryLikeMiddleware(async () => ({
      profileRole: "missionary",
      memberships: [],
    }));

    const response = await middleware(createRequest("/"));

    // A 200 here means the dashboard shell was generated and the redirect was
    // left to the layout, which arrives after the markup does.
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://example.org/login?next=%2F",
    );
  });

  it("sends a wrong-role visitor on a protected home page to a terminal page", async () => {
    const middleware = missionaryLikeMiddleware(async () => ({
      profileRole: "donor",
      memberships: [],
    }));

    const response = await middleware(createRequest("/"));

    expect(response.status).toBe(307);
    // Not "/": bouncing there re-enters this same failing check and loops.
    expect(response.headers.get("location")).toBe(
      "https://example.org/no-access",
    );
  });

  it("still serves a protected home page to an allowed role", async () => {
    const middleware = missionaryLikeMiddleware(async () => ({
      profileRole: "missionary",
      memberships: [],
    }));

    expect((await middleware(createRequest("/"))).status).toBe(200);
  });

  it("refuses to build a role-gated middleware without a role resolver", () => {
    // Without this guard the misconfiguration is silent and total: every
    // signed-in user resolves to a `null` role, fails closed, and is redirected
    // off every protected path. All three apps set `allowedRoles`, and admin and
    // missionary protect "/", so that is a full lockout. Fail at construction.
    expect(() =>
      createAuthMiddleware({
        protectedRoutePrefixes: ["/"],
        allowedRoles: ["staff"],
      }),
    ).toThrow(/resolveUserRole/);
  });
});
