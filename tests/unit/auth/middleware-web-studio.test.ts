import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createE2EAuthCookieValue,
  E2E_AUTH_COOKIE_NAMES,
} from "../../../packages/auth/e2e-auth";
import {
  readWebStudioCookie,
  signWebStudioSelection,
  WEB_STUDIO_TENANT_COOKIE,
} from "../../../packages/auth/web-studio";

/**
 * Web Studio in the admin proxy (plan 5.2, "One stated exception: Web
 * Studio"; AL-2675, WP2b slice C). Payload's REST routes under
 * `/web-studio/api` only have their session refreshed: no role lookup, never
 * a redirect, so Payload's strategy answers an expired or unauthorized call
 * with JSON. Web Studio's pages stay outside the tenant segment and take the
 * organization from the signed Web Studio cookie, which only narrows.
 */

const SECRET = "middleware-web-studio-test-secret";
const USER = "00000000-0000-4000-8000-0000000000c1";
const TA = "00000000-0000-0000-0000-000000000001";
const TB = "00000000-0000-0000-0000-000000000002";
let nextId = 0x200;
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
    updated_at: "2026-11-18T09:00:00.000000+00:00",
  };
}

const state = vi.hoisted(() => ({
  userId: null as string | null,
  rows: [] as unknown[],
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
      return { data: state.rows, error: null };
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
    webStudio: {
      readCookie: (value) => readWebStudioCookie(value, SECRET),
    },
  });
}

function request(path: string, headers: Record<string, string> = {}) {
  return new NextRequest(new URL(path, "http://localhost:3330"), { headers });
}

function forwarded(response: Response, name: string) {
  return response.headers.get(`x-middleware-request-${name}`);
}

function location(response: Response) {
  const value = response.headers.get("location");
  if (!value) return null;
  const url = new URL(value, "http://localhost:3330");
  return url.pathname + url.search;
}

async function cookieFor(tenantId: string, assignmentId: string) {
  return `${WEB_STUDIO_TENANT_COOKIE}=${await signWebStudioSelection({ tenantId, assignmentId }, SECRET)}`;
}

beforeEach(() => {
  state.userId = USER;
  state.rows = [];
  state.rpcCalls = 0;
  state.refreshCookie = false;
});

describe("Payload's REST routes under /web-studio/api", () => {
  it("refresh the session and do nothing else: no role lookup, no redirect", async () => {
    state.rows = [
      row(TA, "staff", "development"),
      row(TB, "staff", "development"),
    ];
    state.refreshCookie = true;

    const response = await adminProxy()(
      request("/web-studio/api/pages?limit=1"),
    );

    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(location(response)).toBeNull();
    expect(response.headers.get("set-cookie")).toContain("sb-refreshed=fresh");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(state.rpcCalls).toBe(0);
    expect(forwarded(response, "x-asym-role-class")).toBe("staff");
  });

  it("pass an expired session on to Payload's strategy instead of redirecting it to sign-in", async () => {
    state.userId = null;

    for (const method of ["GET", "PATCH", "POST", "DELETE"]) {
      const response = await adminProxy()(
        new NextRequest(
          new URL("/web-studio/api/pages/7", "http://localhost:3330"),
          {
            method,
          },
        ),
      );
      expect(response.status).toBe(200);
      expect(response.headers.get("x-middleware-next")).toBe("1");
      expect(location(response)).toBeNull();
    }
    expect(state.rpcCalls).toBe(0);
  });

  it("keep the document's tenant and assignment headers, which the server compares with the cookie", async () => {
    const response = await adminProxy()(
      request("/web-studio/api/pages/7", {
        "x-asym-tenant": TA,
        "x-asym-assignment": "00000000-0000-4000-8000-0000000000aa",
        "x-asym-address-prefix": `/${TA}`,
      }),
    );

    expect(forwarded(response, "x-asym-tenant")).toBe(TA);
    expect(forwarded(response, "x-asym-assignment")).toBe(
      "00000000-0000-4000-8000-0000000000aa",
    );
    expect(forwarded(response, "x-asym-address-prefix")).toBeNull();
  });

  it("are the prefix with its slash: the bare path is a Web Studio page, gated, with no client scope headers", async () => {
    state.rows = [
      row(TA, "staff", "development"),
      row(TB, "staff", "development"),
    ];

    const response = await adminProxy()(
      request("/web-studio/api", { "x-asym-tenant": TA }),
    );

    expect(location(response)).toBe(
      "/web-studio/organization?next=%2Fweb-studio%2Fapi",
    );
    expect(state.rpcCalls).toBe(1);

    // Passed on as a page (one staff row needs no choice), it does not carry
    // a scope header the browser sent: those are an API request's only
    // (council r2: the redirect above forwards nothing, so it proved nothing).
    state.rows = [row(TA, "staff", "development")];
    const page = await adminProxy()(
      request("/web-studio/api", {
        "x-asym-tenant": TB,
        "x-asym-assignment": "00000000-0000-4000-8000-0000000000bb",
      }),
    );
    expect(page.headers.get("x-middleware-next")).toBe("1");
    expect(forwarded(page, "x-asym-tenant")).not.toBe(TB);
    expect(forwarded(page, "x-asym-assignment")).not.toBe(
      "00000000-0000-4000-8000-0000000000bb",
    );
  });

  it("never answer inside the tenant segment", async () => {
    const response = await adminProxy()(request(`/${TA}/web-studio/api/pages`));
    expect(response.status).toBe(404);
  });
});

describe("Web Studio's pages", () => {
  it("send a person with staff rows in two organizations and no cookie to the Web Studio chooser", async () => {
    state.rows = [row(TA, "staff", "development"), row(TB, "staff", "finance")];

    const response = await adminProxy()(
      request("/web-studio/collections/pages?limit=10"),
    );

    expect(response.status).toBe(307);
    expect(location(response)).toBe(
      "/web-studio/organization?next=%2Fweb-studio%2Fcollections%2Fpages%3Flimit%3D10",
    );
  });

  it("open for the organization the cookie names when the person holds that row live", async () => {
    const b = row(TB, "staff", "finance");
    state.rows = [row(TA, "staff", "development"), b];

    const response = await adminProxy()(
      request("/web-studio/collections/pages", {
        cookie: await cookieFor(TB, b.id),
      }),
    );

    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(location(response)).toBeNull();
  });

  it("let a person with one staff row in without a choice", async () => {
    state.rows = [row(TA, "staff", "development"), row(TB, "donor")];

    const response = await adminProxy()(request("/web-studio"));

    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("treat a forged, foreign or revoked selection as no selection at all: the person chooses again", async () => {
    const a = row(TA, "staff", "development");
    const revoked = row(TB, "staff", "finance");
    state.rows = [a];

    for (const cookie of [
      await cookieFor(TB, revoked.id),
      await cookieFor(TB, a.id),
      `${WEB_STUDIO_TENANT_COOKIE}=v1.${TA}.${a.id}.forged`,
    ]) {
      const response = await adminProxy()(request("/web-studio", { cookie }));
      expect(location(response)).toBe(
        "/web-studio/organization?next=%2Fweb-studio",
      );
    }
  });

  it("refuse a person with no staff row", async () => {
    state.rows = [row(TA, "donor"), row(TB, "missionary")];

    const response = await adminProxy()(request("/web-studio"));

    expect(location(response)).toBe("/no-access");
  });

  // Check of the fix lists, JR5: the proxy took only the exact chooser
  // address for the chooser, while isWebStudioPagePath leaves out everything
  // under it, so /web-studio/organization/x passed the gate as a Web Studio
  // page and its document, outside its own segment, reloaded without end.
  // The proxy reads the next path undecoded (NextURL keeps %6F), so an
  // encoded segment is read decoded here, as the routes see it.
  it.each([
    ["/web-studio/organization/x", "/web-studio/organization"],
    [
      "/web-studio/organization/x/y?next=%2Fweb-studio",
      "/web-studio/organization?next=%2Fweb-studio",
    ],
    ["/web-studio/organization/", "/web-studio/organization"],
    ["/web-studio/%6Frganization", "/web-studio/organization"],
    ["/web-studio/%6Frganization/x", "/web-studio/organization"],
    ["/web-studio/organization%2Fx", "/web-studio/organization"],
  ])(
    "send %s, under the chooser but not the chooser, to the chooser before the gate",
    async (path, target) => {
      const b = row(TB, "staff", "finance");
      state.rows = [row(TA, "staff", "development"), b];

      const response = await adminProxy()(
        request(path, { cookie: await cookieFor(TB, b.id) }),
      );

      expect(response.status).toBe(307);
      expect(location(response)).toBe(target);
    },
  );

  it("serve the chooser to any signed-in person, and send a signed-out one to sign in", async () => {
    state.rows = [
      row(TA, "staff", "development"),
      row(TB, "staff", "development"),
    ];
    const chooser = await adminProxy()(
      request("/web-studio/organization?next=%2Fweb-studio"),
    );
    expect(chooser.headers.get("x-middleware-next")).toBe("1");

    state.userId = null;
    const signedOut = await adminProxy()(request("/web-studio/organization"));
    expect(location(signedOut)).toBe(
      "/login?next=%2Fweb-studio%2Forganization",
    );
    // The chooser's own return address survives sign-in (council C11).
    const withNext = await adminProxy()(
      request(
        "/web-studio/organization?next=%2Fweb-studio%2Fcollections%2Fpages",
      ),
    );
    expect(location(withNext)).toBe(
      `/login?next=${encodeURIComponent(
        "/web-studio/organization?next=%2Fweb-studio%2Fcollections%2Fpages",
      )}`,
    );
  });

  it("judge an E2E bypass identity by the same rule", async () => {
    vi.stubEnv("E2E_AUTH_BYPASS", "true");
    try {
      state.userId = null;
      const memberships = [
        {
          id: "00000000-0000-4000-8000-0000000e2e31",
          tenantId: TA,
          role: "staff" as const,
          staffRole: "development" as const,
          isTenantAdmin: false,
        },
        {
          id: "00000000-0000-4000-8000-0000000e2e32",
          tenantId: TB,
          role: "staff" as const,
          staffRole: "development" as const,
          isTenantAdmin: false,
        },
      ];
      const e2e = `${E2E_AUTH_COOKIE_NAMES.admin}=${await createE2EAuthCookieValue(
        {
          userId: "00000000-0000-4000-8000-0000000e2e30",
          role: "staff",
          tenantId: TA,
          memberships,
        },
      )}`;
      const host = { host: "localhost:3030" };

      const none = await adminProxy()(
        request("/web-studio", { ...host, cookie: e2e }),
      );
      expect(location(none)).toBe(
        "/web-studio/organization?next=%2Fweb-studio",
      );

      const chosen = await adminProxy()(
        request("/web-studio", {
          ...host,
          cookie: `${e2e}; ${await cookieFor(TB, memberships[1]!.id)}`,
        }),
      );
      expect(chosen.headers.get("x-middleware-next")).toBe("1");
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
