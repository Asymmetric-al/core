import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const USER = "00000000-0000-4000-8000-0000000000a1";
const TA = "00000000-0000-0000-0000-000000000001";
const TB = "00000000-0000-0000-0000-000000000002";
const ROW_A = "00000000-0000-4000-8000-000000000201";
const ROW_A_FINANCE = "00000000-0000-4000-8000-000000000202";
const ROW_B = "00000000-0000-4000-8000-000000000203";

const state = vi.hoisted(() => ({
  userId: null as string | null,
  rows: [] as unknown[],
  cookieDecision: { kind: "absent" } as unknown,
  exchangeError: null as unknown,
  refreshCookies: null as Array<{
    name: string;
    value: string;
    options?: Record<string, unknown>;
  }> | null,
  refreshHeaders: null as Record<string, string> | null,
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
    opts?: {
      cookies?: {
        setAll?: (
          cookies: Array<{
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }>,
          headers?: Record<string, string>,
        ) => void;
      };
    },
  ) => ({
    auth: {
      getUser: async () => {
        if (state.refreshCookies && opts?.cookies?.setAll) {
          opts.cookies.setAll(
            state.refreshCookies,
            state.refreshHeaders ?? undefined,
          );
        }
        return {
          data: { user: state.userId ? { id: state.userId } : null },
        };
      },
    },
    rpc: async () => ({ data: state.rows, error: null }),
  }),
}));

vi.mock("@asym/database/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      exchangeCodeForSession: async () => ({ error: state.exchangeError }),
      getUser: async () => ({
        data: { user: state.userId ? { id: state.userId } : null },
      }),
    },
    rpc: async () => ({ data: state.rows, error: null }),
  }),
}));

const { createAuthMiddleware } =
  await import("../../../packages/auth/middleware");
const { resolveUserRoleFromDatabase } =
  await import("../../../packages/auth/resolve-user-role");
const { safeNextParam } = await import("../../../packages/auth/demo-login");
const { GET: authCallbackGet } =
  await import("../../../packages/api/src/auth/callback");
const { GET: passwordRecoveryCallbackGet } =
  await import("../../../packages/api/src/auth/password-recovery");

function row(
  id: string,
  tenantId: string,
  role: "donor" | "missionary" | "staff",
  staffRole: string | null = null,
) {
  return {
    id,
    user_id: USER,
    tenant_id: tenantId,
    role,
    staff_role: staffRole,
    is_tenant_admin: false,
    updated_at: "2026-11-24T00:00:00.000000+00:00",
  };
}

function adminProxy() {
  return createAuthMiddleware({
    publicRoutes: ["/auth/callback", "/login", "/no-access"],
    protectedRoutePrefixes: ["/"],
    loginPath: "/login",
    redirectAuthenticatedTo: "/",
    unauthorizedRedirectTo: "/no-access",
    roleClass: "staff",
    allowedRoles: ["staff", "admin"],
    resolveUserRole: resolveUserRoleFromDatabase,
    tenantAddress: true,
    webStudio: {
      readCookie: async () => state.cookieDecision as never,
    },
  });
}

function req(basePath: string, path: string) {
  return new NextRequest(
    new URL(`${basePath}${path}`, "http://localhost:25051"),
    basePath ? { nextConfig: { basePath } } : undefined,
  );
}

function pathOf(value: string | null) {
  if (!value) return null;
  const url = new URL(value, "http://localhost:25051");
  return `${url.pathname}${url.search}`;
}

beforeEach(() => {
  state.userId = USER;
  state.rows = [];
  state.cookieDecision = { kind: "absent" };
  state.exchangeError = null;
  state.refreshCookies = null;
  state.refreshHeaders = null;
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("proxy redirects under basePath /admin (on) and empty basePath (off)", () => {
  it("prefixes sign-in redirect while keeping next app-relative and safe", async () => {
    state.userId = null;

    const onRes = await adminProxy()(req("/admin", "/care/directory?tab=open"));
    expect(onRes.status).toBe(307);
    const onUrl = new URL(onRes.headers.get("location")!);
    expect(onUrl.pathname).toBe("/admin/login");
    expect(onUrl.searchParams.get("next")).toBe("/care/directory?tab=open");
    expect(safeNextParam(onUrl.searchParams.get("next"))).toBe(
      "/care/directory?tab=open",
    );

    const offRes = await adminProxy()(req("", "/care/directory?tab=open"));
    expect(offRes.status).toBe(307);
    expect(pathOf(offRes.headers.get("location"))).toBe(
      "/login?next=%2Fcare%2Fdirectory%3Ftab%3Dopen",
    );
  });

  it("prefixes chooser, unauthorizedRedirectTo, canonical tenant, and ~sub-role redirects", async () => {
    state.rows = [
      row(ROW_A, TA, "staff", "development"),
      row(ROW_B, TB, "staff", "development"),
    ];
    const chooserOn = await adminProxy()(req("/admin", "/donors"));
    expect(pathOf(chooserOn.headers.get("location"))).toBe(
      "/admin/choose-organization?next=%2Fdonors",
    );
    const chooserOff = await adminProxy()(req("", "/donors"));
    expect(pathOf(chooserOff.headers.get("location"))).toBe(
      "/choose-organization?next=%2Fdonors",
    );

    state.rows = [row(ROW_A, TA, "donor")];
    const unauthOn = await adminProxy()(req("/admin", `/${TA}/donors`));
    expect(pathOf(unauthOn.headers.get("location"))).toBe("/admin/no-access");
    const unauthOff = await adminProxy()(req("", `/${TA}/donors`));
    expect(pathOf(unauthOff.headers.get("location"))).toBe("/no-access");

    state.rows = [row(ROW_A, TA, "staff", "finance")];
    const canonicalOn = await adminProxy()(
      req("/admin", `/${TA}~finance/care`),
    );
    expect(pathOf(canonicalOn.headers.get("location"))).toBe(
      `/admin/${TA}/care`,
    );
    const canonicalOff = await adminProxy()(req("", `/${TA}~finance/care`));
    expect(pathOf(canonicalOff.headers.get("location"))).toBe(`/${TA}/care`);

    state.rows = [
      row(ROW_A_FINANCE, TA, "staff", "finance"),
      row(ROW_A, TA, "staff", "member_care"),
    ];
    const subRoleOn = await adminProxy()(
      req("/admin", `/${TA}~finance/care/directory`),
    );
    expect(subRoleOn.status).toBe(200);
    expect(pathOf(subRoleOn.headers.get("x-middleware-rewrite"))).toBe(
      "/admin/care/directory",
    );
    expect(
      subRoleOn.headers.get("x-middleware-request-x-asym-address-prefix"),
    ).toBe(`/${TA}~finance`);
  });

  it("prefixes Web Studio chooser and entry redirects", async () => {
    state.rows = [
      row(ROW_A, TA, "staff", "development"),
      row(ROW_B, TB, "staff", "development"),
    ];
    const studioChooserOn = await adminProxy()(
      req("/admin", "/web-studio/collections/pages"),
    );
    expect(pathOf(studioChooserOn.headers.get("location"))).toBe(
      "/admin/web-studio/organization?next=%2Fweb-studio%2Fcollections%2Fpages",
    );

    state.cookieDecision = {
      kind: "selected",
      selection: { tenantId: TA, assignmentId: ROW_A },
    };
    const entryOn = await adminProxy()(
      req(
        "/admin",
        `/web-studio/collections/pages?organization=${TA}&assignment=${ROW_A}`,
      ),
    );
    expect(pathOf(entryOn.headers.get("location"))).toBe(
      "/admin/web-studio/collections/pages",
    );

    const entryOff = await adminProxy()(
      req(
        "",
        `/web-studio/collections/pages?organization=${TA}&assignment=${ROW_A}`,
      ),
    );
    expect(pathOf(entryOff.headers.get("location"))).toBe(
      "/web-studio/collections/pages",
    );
  });

  it("preserves private, no-store cache headers and host-only Path=/ session cookies on session refresh under basePath", async () => {
    state.rows = [row(ROW_A, TA, "staff", "development")];
    state.refreshCookies = [
      {
        name: "sb-example-auth-token",
        value: "refreshed-token",
        options: { path: "/", sameSite: "lax", httpOnly: false },
      },
    ];
    state.refreshHeaders = { "Cache-Control": "private, no-store" };

    const res = await adminProxy()(req("/admin", `/${TA}/donors`));
    expect(res.status).toBe(200);
    const cacheControl = res.headers.get("cache-control") ?? "";
    expect(cacheControl).toContain("private");
    expect(cacheControl).toContain("no-store");
    expect(cacheControl).not.toContain("immutable");
    const sessionCookies = res.headers
      .getSetCookie()
      .filter((c) => c.startsWith("sb-example-auth-token="));
    expect(sessionCookies).toHaveLength(1);
    expect(sessionCookies[0]).toContain("Path=/");
    expect(sessionCookies[0]).not.toMatch(/;\s*Domain=/i);
  });
});

describe("auth and password-recovery callbacks under basePath (on and off)", () => {
  it("prefixes same-app callback targets when on and keeps /donor-dashboard unprefixed", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
    vi.stubEnv("CORE_APP_BASE_PATH", "/admin");

    state.rows = [row(ROW_A, TA, "staff", "development")];
    const staffRes = await authCallbackGet(
      new Request("http://localhost:25051/admin/auth/callback?code=abc", {
        headers: { "x-asym-role-class": "staff" },
      }),
    );
    expect(staffRes.status).toBe(307);
    expect(staffRes.headers.get("location")).toBe("/admin");

    state.rows = [row(ROW_A, TA, "donor")];
    const donorRes = await authCallbackGet(
      new Request("http://localhost:25051/admin/auth/callback?code=abc", {
        headers: { "x-asym-role-class": "staff" },
      }),
    );
    expect(donorRes.status).toBe(307);
    expect(donorRes.headers.get("location")).toBe("/donor-dashboard");

    state.rows = [];
    const nextRes = await authCallbackGet(
      new Request(
        "http://localhost:25051/admin/auth/callback?code=abc&next=%2Finvite%2Fsel1",
      ),
    );
    expect(nextRes.headers.get("location")).toBe("/admin/invite/sel1");

    const failRes = await authCallbackGet(
      new Request("http://localhost:25051/admin/auth/callback"),
    );
    expect(failRes.headers.get("location")).toBe(
      "/admin/login?error=Could%20not%20authenticate",
    );

    const recoveryRes = await passwordRecoveryCallbackGet(
      new Request(
        "http://localhost:25051/admin/forgot-password/callback?code=abc",
      ),
    );
    expect(recoveryRes.headers.get("location")).toBe(
      "/admin/forgot-password/reset",
    );
  });

  it("keeps all callback targets unprefixed when off", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "0");
    vi.stubEnv("CORE_APP_BASE_PATH", "");

    state.rows = [row(ROW_A, TA, "staff", "development")];
    const staffRes = await authCallbackGet(
      new Request("http://localhost:3030/auth/callback?code=abc", {
        headers: { "x-asym-role-class": "staff" },
      }),
    );
    expect(staffRes.headers.get("location")).toBe("/");

    const recoveryRes = await passwordRecoveryCallbackGet(
      new Request("http://localhost:3030/forgot-password/callback?code=abc"),
    );
    expect(recoveryRes.headers.get("location")).toBe("/forgot-password/reset");
  });
});
