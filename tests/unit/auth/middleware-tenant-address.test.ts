import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createE2EAuthCookieValue,
  E2E_AUTH_COOKIE_NAMES,
} from "../../../packages/auth/e2e-auth";

/**
 * The tenant in the page address (plan 5.2; AL-2675, WP2b). The proxy reads
 * `/<tenant>[~<sub-role>]`, decides membership before the page shell, and
 * rewrites onto the existing page with the scope as request headers.
 */

const USER = "00000000-0000-4000-8000-0000000000a1";
const TA = "00000000-0000-0000-0000-000000000001";
const TB = "00000000-0000-0000-0000-000000000002";
const TC = "6f1c2a4e-9b3d-4c5e-8f7a-0b1c2d3e4f5a";
let nextId = 0x100;
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
    updated_at: "2026-11-17T09:00:00.000000+00:00",
  };
}

const state = vi.hoisted(() => ({
  userId: null as string | null,
  rows: [] as unknown[],
  rpcError: null as unknown,
  rpcCalls: 0,
  refreshCookie: false,
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
        if (state.refreshCookie) {
          options.cookies.setAll([{ name: "sb-refreshed", value: "fresh" }], {
            "Cache-Control": "private, no-store",
          });
        }
        return { data: { user: state.userId ? { id: state.userId } : null } };
      },
    },
    rpc: async (fn: string) => {
      state.rpcCalls += 1;
      if (fn !== "current_user_assignments") throw new Error(fn);
      return {
        data: state.rpcError ? null : state.rows,
        error: state.rpcError,
      };
    },
  }),
}));

const { createAuthMiddleware } =
  await import("../../../packages/auth/middleware");
const { resolveUserRoleFromDatabase } =
  await import("../../../packages/auth/resolve-user-role");

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
  });
}

function missionaryProxy() {
  return createAuthMiddleware({
    publicRoutes: ["/auth/callback", "/no-access"],
    protectedRoutePrefixes: ["/"],
    loginPath: "/login",
    redirectAuthenticatedTo: "/",
    unauthorizedRedirectTo: "/no-access",
    roleClass: "missionary",
    allowedRoles: ["missionary"],
    resolveUserRole: resolveUserRoleFromDatabase,
    tenantAddress: true,
  });
}

function request(path: string, headers: Record<string, string> = {}) {
  return new NextRequest(new URL(path, "http://localhost:3330"), { headers });
}

/** A request header the proxy forwards to the render. */
function forwarded(response: Response, name: string) {
  return response.headers.get(`x-middleware-request-${name}`);
}

function rewriteTarget(response: Response) {
  const value = response.headers.get("x-middleware-rewrite");
  return value ? new URL(value).pathname + new URL(value).search : null;
}

function location(response: Response) {
  const value = response.headers.get("location");
  if (!value) return null;
  const url = new URL(value, "http://localhost:3330");
  return url.pathname + url.search;
}

beforeEach(() => {
  state.userId = USER;
  state.rows = [];
  state.rpcError = null;
  state.rpcCalls = 0;
  state.refreshCookie = false;
});

describe("a tenant address: the membership decision before the page shell", () => {
  it("rewrites a member's address onto the page, with the scope as request headers", async () => {
    const finance = row(TA, "staff", "finance");
    state.rows = [finance, row(TB, "donor")];

    const response = await adminProxy()(request(`/${TA}/care/directory?x=1`));

    expect(response.status).toBe(200);
    expect(rewriteTarget(response)).toBe("/care/directory?x=1");
    expect(forwarded(response, "x-asym-tenant")).toBe(TA);
    expect(forwarded(response, "x-asym-assignment")).toBe(finance.id);
    expect(forwarded(response, "x-asym-address-prefix")).toBe(`/${TA}`);
    expect(forwarded(response, "x-asym-role-class")).toBe("staff");
    // The full address, so a sign-in redirect returns to the same tenant.
    expect(forwarded(response, "x-asym-pathname")).toBe(
      `/${TA}/care/directory`,
    );
  });

  it("keeps refreshed session cookies on the rewrite", async () => {
    state.rows = [row(TA, "staff", "finance")];
    state.refreshCookie = true;

    const response = await adminProxy()(request(`/${TA}/care`));

    expect(rewriteTarget(response)).toBe("/care");
    expect(response.headers.get("set-cookie")).toContain("sb-refreshed=fresh");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("refuses a deep link to a tenant the person does not belong to, and switches nothing", async () => {
    state.rows = [row(TA, "staff", "finance"), row(TB, "donor")];

    for (const tenant of [TB, TC]) {
      const response = await adminProxy()(request(`/${tenant}/care`));
      expect(response.status).toBe(307);
      expect(location(response)).toBe("/no-access");
      expect(rewriteTarget(response)).toBeNull();
      expect(forwarded(response, "x-asym-tenant")).toBeNull();
    }
  });

  // Council round 1, A13: one list of the addresses outside the tenant
  // segment. A public route that list does not cover would get a prefix from
  // the helpers and a redirect back from the proxy, so a proxy with one is
  // refused when it is built.
  it("refuses a public route that the one list of outside addresses does not cover", () => {
    expect(() =>
      createAuthMiddleware({
        publicRoutes: ["/login", "/ways-to-give"],
        protectedRoutePrefixes: ["/"],
        loginPath: "/login",
        unauthorizedRedirectTo: "/no-access",
        roleClass: "staff",
        allowedRoles: ["staff"],
        resolveUserRole: resolveUserRoleFromDatabase,
        tenantAddress: true,
      }),
    ).toThrow(/\/ways-to-give.*OUTSIDE_TENANT_SEGMENT_ROOTS/);
    // Without a tenant address (the donor portal) there is no segment.
    expect(() =>
      createAuthMiddleware({
        publicRoutes: ["/", "/ways-to-give"],
        roleClass: "donor",
        allowedRoles: ["donor"],
        resolveUserRole: resolveUserRoleFromDatabase,
      }),
    ).not.toThrow();
  });

  it("builds both apps' proxies, whose public routes are all outside the segment", async () => {
    await expect(import("../../../apps/admin/proxy")).resolves.toBeTruthy();
    await expect(
      import("../../../apps/missionary/proxy"),
    ).resolves.toBeTruthy();
  });

  it("refuses when the membership read fails", async () => {
    state.rpcError = { code: "42501" };

    const response = await adminProxy()(request(`/${TA}/care`));

    expect(location(response)).toBe("/no-access");
  });

  // Council round 1, A5: the cause of a failed read reaches the server log,
  // as the preview access diagnostic the resolver already writes (literal
  // fields and a safe error code only), and the person's answer is the same.
  it("logs the cause of a failed membership read, with no personal data, and still refuses", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_TARGET_ENV", "preview");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      state.rpcError = {
        code: "42501",
        message: `permission denied for function current_user_assignments (${USER})`,
        details: `tenant ${TA}`,
        hint: "sb-access-token=secret-token",
      };

      const response = await adminProxy()(request(`/${TA}/care`));

      expect(location(response)).toBe("/no-access");
      expect(warn).toHaveBeenCalledExactlyOnceWith({
        event: "auth_access_diagnostic",
        stage: "membership_read",
        outcome: "query_failed",
        code: "42501",
      });
      const logged = JSON.stringify(warn.mock.calls);
      for (const secret of [USER, TA, "secret-token", "permission denied"]) {
        expect(logged).not.toContain(secret);
      }
    } finally {
      warn.mockRestore();
      vi.unstubAllEnvs();
    }
  });

  // Council round 2, AR6: in production and in development too, one server
  // line with literal fields only; the preview diagnostic stays silent there.
  it.each([
    ["production", "production", "production"],
    ["development", "development", ""],
  ])(
    "logs a failed membership read in %s, with no personal data, and still refuses",
    async (_label, nodeEnv, vercelEnv) => {
      vi.stubEnv("NODE_ENV", nodeEnv);
      vi.stubEnv("VERCEL_ENV", vercelEnv);
      vi.stubEnv("VERCEL_TARGET_ENV", vercelEnv);
      const error = vi.spyOn(console, "error").mockImplementation(() => {});
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      try {
        state.rpcError = {
          code: "PGRST002",
          message: `Could not query the database for the schema cache (${USER})`,
          details: `tenant ${TA}`,
          hint: "sb-access-token=secret-token",
        };

        const response = await adminProxy()(request(`/${TA}/care`));

        expect(location(response)).toBe("/no-access");
        expect(error).toHaveBeenCalledExactlyOnceWith({
          event: "auth_membership_read_failed",
          reason: "membership_query_failed",
          code: "PGRST002",
          class: "schema_cache",
        });
        expect(warn).not.toHaveBeenCalled();
        const logged = JSON.stringify(error.mock.calls);
        for (const secret of [USER, TA, "secret-token", "schema cache ("]) {
          expect(logged).not.toContain(secret);
        }
      } finally {
        error.mockRestore();
        warn.mockRestore();
        vi.unstubAllEnvs();
      }
    },
  );

  it("drops a suffix for a person with one row, keeping the page and query", async () => {
    state.rows = [row(TA, "staff", "development")];

    for (const subRole of ["development", "finance"]) {
      const response = await adminProxy()(
        request(`/${TA}~${subRole}/care?tab=open`),
      );
      expect(response.status).toBe(307);
      expect(location(response)).toBe(`/${TA}/care?tab=open`);
    }
  });

  it("acts under the row the suffix names for a person with several", async () => {
    const finance = row(TA, "staff", "finance");
    const care = row(TA, "staff", "member_care");
    state.rows = [finance, care];

    const response = await adminProxy()(request(`/${TA}~member_care/care`));

    expect(rewriteTarget(response)).toBe("/care");
    expect(forwarded(response, "x-asym-assignment")).toBe(care.id);
    expect(forwarded(response, "x-asym-address-prefix")).toBe(
      `/${TA}~member_care`,
    );
  });

  it("sends a person with several rows to the chooser when the address names none, or one they lack", async () => {
    state.rows = [row(TA, "staff", "finance"), row(TA, "staff", "member_care")];

    for (const prefix of [`/${TA}`, `/${TA}~hr`]) {
      const response = await adminProxy()(request(`${prefix}/care?tab=open`));
      expect(response.status).toBe(307);
      expect(location(response)).toBe(
        `/choose-organization?tenant=${TA}&next=%2Fcare%3Ftab%3Dopen`,
      );
      expect(rewriteTarget(response)).toBeNull();
    }
  });

  it("ignores scope headers a client forged, on every page request", async () => {
    const finance = row(TA, "staff", "finance");
    const care = row(TA, "staff", "member_care");
    state.rows = [finance, care];
    const forged = {
      "x-asym-tenant": TB,
      "x-asym-assignment": care.id,
      "x-asym-address-prefix": `/${TB}`,
      "x-asym-tenant-rewrite": "forged",
    };

    const tenantPage = await adminProxy()(
      request(`/${TA}~finance/care`, forged),
    );
    expect(forwarded(tenantPage, "x-asym-tenant")).toBe(TA);
    expect(forwarded(tenantPage, "x-asym-assignment")).toBe(finance.id);
    expect(forwarded(tenantPage, "x-asym-address-prefix")).toBe(
      `/${TA}~finance`,
    );
    expect(forwarded(tenantPage, "x-asym-tenant-rewrite")).not.toBe("forged");

    const chooser = await adminProxy()(request("/choose-organization", forged));
    for (const name of Object.keys(forged)) {
      expect(
        chooser.headers.get("x-middleware-override-headers"),
      ).not.toContain(name);
      expect(forwarded(chooser, name)).toBeNull();
    }
  });

  it("sends a signed-out visitor to sign-in with the prefixed address as next", async () => {
    state.userId = null;

    const response = await adminProxy()(request(`/${TA}/care?tab=open`));

    expect(location(response)).toBe(`/login?next=%2F${TA}%2Fcare%3Ftab%3Dopen`);
    expect(state.rpcCalls).toBe(0);
  });

  it("keeps sign-in and the other public pages outside the tenant segment", async () => {
    state.rows = [row(TA, "staff", "finance")];

    expect(location(await adminProxy()(request(`/${TA}/login?next=%2F`)))).toBe(
      "/login?next=%2F",
    );
    expect(location(await adminProxy()(request(`/${TA}/web-studio`)))).toBe(
      "/web-studio",
    );
    expect(
      location(await adminProxy()(request(`/${TA}~finance/no-access`))),
    ).toBe("/no-access");
  });

  it("serves no API route inside the tenant segment", async () => {
    const response = await adminProxy()(request(`/${TA}/api/admin/export`));

    expect(response.status).toBe(404);
  });

  it("passes an API request's tenant and assignment through as proposals for the resolver", async () => {
    const response = await adminProxy()(
      request("/api/admin/export", {
        "x-asym-tenant": TA,
        "x-asym-assignment": "00000000-0000-4000-8000-000000000999",
        "x-asym-address-prefix": `/${TA}`,
      }),
    );

    expect(forwarded(response, "x-asym-tenant")).toBe(TA);
    expect(forwarded(response, "x-asym-assignment")).toBe(
      "00000000-0000-4000-8000-000000000999",
    );
    expect(forwarded(response, "x-asym-address-prefix")).toBeNull();
    expect(state.rpcCalls).toBe(0);
  });

  it("applies the same rule in the missionary workspace, where a suffix is never kept", async () => {
    const missionary = row(TA, "missionary");
    state.rows = [missionary, row(TA, "staff", "finance")];

    const page = await missionaryProxy()(request(`/${TA}/donors`));
    expect(rewriteTarget(page)).toBe("/donors");
    expect(forwarded(page, "x-asym-assignment")).toBe(missionary.id);
    expect(forwarded(page, "x-asym-role-class")).toBe("missionary");

    expect(
      location(await missionaryProxy()(request(`/${TA}~finance/donors`))),
    ).toBe(`/${TA}/donors`);
    expect(location(await missionaryProxy()(request(`/${TB}/donors`)))).toBe(
      "/no-access",
    );
  });
});

describe("a signed-in page address without a tenant: the landing rule", () => {
  it("takes a person with one organization there, keeping the page", async () => {
    state.rows = [row(TA, "staff", "finance"), row(TB, "donor")];

    expect(location(await adminProxy()(request("/care?tab=open")))).toBe(
      `/${TA}/care?tab=open`,
    );
    expect(location(await adminProxy()(request("/")))).toBe(`/${TA}`);
  });

  it("asks a person in two organizations to choose one", async () => {
    state.rows = [row(TA, "staff", "finance"), row(TB, "staff", "development")];

    expect(location(await adminProxy()(request("/care")))).toBe(
      "/choose-organization?next=%2Fcare",
    );
  });

  it("asks a person with several rows in one organization to choose one", async () => {
    state.rows = [row(TA, "staff", "finance"), row(TA, "staff", "hr")];

    expect(location(await adminProxy()(request("/")))).toBe(
      `/choose-organization?tenant=${TA}&next=%2F`,
    );
  });

  it("refuses a person with no row of the surface's class", async () => {
    state.rows = [row(TA, "donor")];

    expect(location(await adminProxy()(request("/care")))).toBe("/no-access");
  });

  it("lets a person in two organizations reach the chooser and sign-in", async () => {
    state.rows = [row(TA, "staff", "finance"), row(TB, "staff", "development")];

    const chooser = await adminProxy()(
      request("/choose-organization?next=%2F"),
    );
    expect(chooser.status).toBe(200);
    expect(location(chooser)).toBeNull();

    // Already signed in: on to `next`, which the landing rule then decides.
    expect(
      location(await adminProxy()(request(`/login?next=%2F${TA}%2Fcare`))),
    ).toBe(`/${TA}/care`);
  });
});

describe("the rewrite stays inside the server (record D-19)", () => {
  it("fails loudly when its own rewritten request comes back through the proxy", async () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    state.rows = [row(TA, "staff", "finance")];
    const first = await adminProxy()(request(`/${TA}/care`));
    const marker = forwarded(first, "x-asym-tenant-rewrite");
    expect(marker).toMatch(/\S/);

    // What Next does with an external rewrite: fetch the inner path over HTTP
    // with the forwarded request headers.
    const second = await adminProxy()(
      request("/care", {
        "x-asym-tenant": TA,
        "x-asym-address-prefix": `/${TA}`,
        "x-asym-tenant-rewrite": marker!,
      }),
    );

    expect(second.status).toBe(500);
    expect(await second.text()).toMatch(/rewrite left the server/i);
    expect(rewriteTarget(second)).toBeNull();
    expect(errors).toHaveBeenCalled();
    errors.mockRestore();
  });

  // Council round 1, A4: the limit of the guard, pinned so the record states
  // what is true. Another process (another instance, or the proxy in its own
  // function) does not know the marker: it deletes it as a forgery and lands
  // the bare inner path on its tenant address. The browser then sees a
  // redirect loop, not the 500, and still never a page without its tenant.
  it("in another process the marker means nothing: the inner path is landed with a 307, not rendered", async () => {
    state.rows = [row(TA, "staff", "finance")];
    const first = await adminProxy()(request(`/${TA}/care`));
    const marker = forwarded(first, "x-asym-tenant-rewrite");
    expect(marker).toMatch(/\S/);

    vi.resetModules();
    const other = await import("../../../packages/auth/middleware");
    const otherResolve =
      await import("../../../packages/auth/resolve-user-role");
    const otherProxy = other.createAuthMiddleware({
      publicRoutes: ["/auth/callback", "/login", "/no-access"],
      protectedRoutePrefixes: ["/"],
      loginPath: "/login",
      redirectAuthenticatedTo: "/",
      unauthorizedRedirectTo: "/no-access",
      roleClass: "staff",
      allowedRoles: ["staff", "admin"],
      resolveUserRole: otherResolve.resolveUserRoleFromDatabase,
      tenantAddress: true,
    });

    const second = await otherProxy(
      request("/care", {
        "x-asym-tenant": TA,
        "x-asym-address-prefix": `/${TA}`,
        "x-asym-tenant-rewrite": marker!,
      }),
    );

    expect(second.status).toBe(307);
    expect(location(second)).toMatch(new RegExp(`^/${TA}(~finance)?/care$`));
    expect(rewriteTarget(second)).toBeNull();
    expect(forwarded(second, "x-asym-tenant-rewrite")).toBeNull();
  });
});

describe("an E2E bypass identity is judged by the rows its signed cookie names", () => {
  const originalBypass = process.env.E2E_AUTH_BYPASS;
  const originalSecret = process.env.E2E_AUTH_SECRET;

  beforeEach(() => {
    process.env.E2E_AUTH_BYPASS = "true";
    delete process.env.E2E_AUTH_SECRET;
    state.userId = null;
  });

  afterEach(() => {
    process.env.E2E_AUTH_BYPASS = originalBypass;
    if (originalSecret === undefined) delete process.env.E2E_AUTH_SECRET;
    else process.env.E2E_AUTH_SECRET = originalSecret;
  });

  it("admits each organization only under its own address", async () => {
    const inA = "00000000-0000-4000-8000-0000000e2e0a";
    const inB = "00000000-0000-4000-8000-0000000e2e0b";
    const cookie = await createE2EAuthCookieValue({
      userId: "e2e-two-tenants-user",
      role: "staff",
      tenantId: TA,
      memberships: [
        {
          id: inA,
          tenantId: TA,
          role: "staff",
          staffRole: "development",
          isTenantAdmin: false,
        },
        {
          id: inB,
          tenantId: TB,
          role: "staff",
          staffRole: "development",
          isTenantAdmin: false,
        },
      ],
    });
    const withCookie = (path: string) =>
      request(path, {
        cookie: `${E2E_AUTH_COOKIE_NAMES.admin}=${cookie}`,
        host: "localhost:3030",
      });

    const inTenantB = await adminProxy()(withCookie(`/${TB}/care`));
    expect(rewriteTarget(inTenantB)).toBe("/care");
    expect(forwarded(inTenantB, "x-asym-assignment")).toBe(inB);

    expect(location(await adminProxy()(withCookie(`/${TC}/care`)))).toBe(
      "/no-access",
    );
    expect(location(await adminProxy()(withCookie("/care")))).toBe(
      "/choose-organization?next=%2Fcare",
    );
    expect(state.rpcCalls).toBe(0);
  });
});

describe("AL-2675 WP2c part 2a, T7: the operator area lies outside the tenant segment", () => {
  it("lists /operator in OUTSIDE_TENANT_SEGMENT_ROOTS, so no link or redirect gives it a tenant", async () => {
    const {
      OUTSIDE_TENANT_SEGMENT_ROOTS,
      isOutsideTenantSegment,
      withTenantAddress,
    } = await import("../../../packages/auth/tenant-address");
    expect(OUTSIDE_TENANT_SEGMENT_ROOTS).toContain("/operator");
    expect(isOutsideTenantSegment("/operator")).toBe(true);
    expect(isOutsideTenantSegment("/operator/x")).toBe(true);
    expect(isOutsideTenantSegment("/operators")).toBe(false);
    expect(withTenantAddress(`/${TA}`, "/operator")).toBe("/operator");
  });

  it("in the missionary workspace, sends /<tenant>/operator out of the segment and lands no one there", async () => {
    state.rows = [row(TA, "missionary")];
    expect(location(await missionaryProxy()(request(`/${TA}/operator`)))).toBe(
      "/operator",
    );
    const outside = await missionaryProxy()(request("/operator"));
    expect(location(outside)).toBeNull();
    expect(rewriteTarget(outside)).toBeNull();
    state.userId = null;
    expect(location(await missionaryProxy()(request("/operator")))).toBe(
      "/login?next=%2Foperator",
    );
  });
});
