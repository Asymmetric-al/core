import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  readWebStudioCookie,
  signWebStudioSelection,
  WEB_STUDIO_TENANT_COOKIE,
} from "../../../packages/auth/web-studio";

const USER = "00000000-0000-4000-8000-0000000000a1";
const TA = "00000000-0000-0000-0000-000000000001";
const TB = "00000000-0000-0000-0000-000000000002";
const NAME = "x-asym-name-tenant";
const SECRET = "unit-test-middleware-name-secret";

let nextId = 0x600;
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
    updated_at: "2026-11-25T09:00:00.000000+00:00",
  };
}
const P_DEV_A = row(TA, "staff", "development");
const P_FIN_A = row(TA, "staff", "finance");
const P_DEV_B = row(TB, "staff", "development");
const P_MISS_A = row(TA, "missionary");
const P_MISS_B = row(TB, "missionary");
const P = [P_DEV_A, P_FIN_A, P_DEV_B, P_MISS_A, P_MISS_B];
const Q = [row(TA, "staff", "member_care")];
const R = [row(TA, "staff", "development"), row(TB, "staff", "development")];

const state = vi.hoisted(() => ({
  userId: null as string | null,
  rows: [] as unknown[],
  sessionReads: 0,
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
        state.sessionReads += 1;
        options.cookies.setAll([{ name: "sb-refreshed", value: "fresh" }], {
          "Cache-Control": "private, no-store",
        });
        return { data: { user: state.userId ? { id: state.userId } : null } };
      },
    },
    rpc: async (fn: string) => {
      if (fn !== "current_user_assignments") throw new Error(fn);
      return { data: state.rows, error: null };
    },
  }),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => {
    throw new Error("the middleware makes no lookup client");
  },
}));

const { createAuthMiddleware } =
  await import("../../../packages/auth/middleware");
const { resolveUserRoleFromDatabase } =
  await import("../../../packages/auth/resolve-user-role");

const adminProxy = createAuthMiddleware({
  publicRoutes: ["/auth/callback", "/login", "/invite", "/no-access"],
  protectedRoutePrefixes: ["/"],
  loginPath: "/login",
  redirectAuthenticatedTo: "/",
  unauthorizedRedirectTo: "/no-access",
  roleClass: "staff",
  allowedRoles: ["staff", "admin"],
  resolveUserRole: resolveUserRoleFromDatabase,
  tenantAddress: true,
  webStudio: { readCookie: (value) => readWebStudioCookie(value, SECRET) },
});

const missionaryProxy = createAuthMiddleware({
  publicRoutes: ["/auth/callback", "/login", "/no-access"],
  protectedRoutePrefixes: ["/"],
  loginPath: "/login",
  redirectAuthenticatedTo: "/",
  unauthorizedRedirectTo: "/no-access",
  roleClass: "missionary",
  allowedRoles: ["missionary"],
  resolveUserRole: resolveUserRoleFromDatabase,
  tenantAddress: true,
});

function request(path: string, headers: Record<string, string> = {}) {
  return new NextRequest(new URL(path, "http://localhost:3330"), { headers });
}

function location(response: Response) {
  const value = response.headers.get("location");
  if (!value) return null;
  const url = new URL(value, "http://localhost:3330");
  return url.pathname + url.search;
}

function forwarded(response: Response, name: string) {
  return response.headers.get(`x-middleware-request-${name}`);
}

async function studioCookie(tenantId: string, assignmentId: string) {
  return `${WEB_STUDIO_TENANT_COOKIE}=${await signWebStudioSelection({ tenantId, assignmentId }, SECRET)}`;
}

beforeEach(() => {
  state.userId = USER;
  state.rows = P;
  state.sessionReads = 0;
});

describe("on: which organization a page acts in", () => {
  it("sends P to the chooser on name A, with A's rows only, and straight in on name B (D-18, N2 part 2b: no organization in the address, so no tenant on the chooser and no landing redirect)", async () => {
    expect(location(await adminProxy(request("/"), { nameTenantId: TA }))).toBe(
      "/choose-organization?next=%2F",
    );
    const onB = await adminProxy(request("/"), { nameTenantId: TB });
    expect(location(onB)).toBeNull();
    expect(onB.headers.get("x-middleware-rewrite")).toBe(
      "http://localhost:3330/",
    );
    expect(forwarded(onB, "x-asym-tenant")).toBe(TB);
    expect(forwarded(onB, "x-asym-address-prefix")).toBe("");
  });

  it.each([true, false])(
    "answers 404 no-store to another organization's segment on name A, signed in: %s, with no session read",
    async (signedIn) => {
      state.userId = signedIn ? USER : null;
      for (const path of [
        `/${TB}/donors`,
        `/${TB}/login`,
        `/${TB}/web-studio`,
        `/${TB}/choose-organization`,
        `/${TB}~development/donors`,
      ]) {
        const response = await adminProxy(request(path), { nameTenantId: TA });
        expect(response.status, path).toBe(404);
        expect(response.headers.get("cache-control"), path).toBe("no-store");
        expect(response.headers.get("set-cookie"), path).toBeNull();
        expect(response.headers.get("location"), path).toBeNull();
      }
      expect(state.sessionReads).toBe(0);
    },
  );

  it("sends Q, who holds no row in B, to /no-access on name B: nothing switches", async () => {
    state.rows = Q;
    const response = await adminProxy(request("/"), { nameTenantId: TB });
    expect(location(response)).toBe("/no-access");
    expect(response.headers.get("set-cookie")).not.toContain(
      WEB_STUDIO_TENANT_COOKIE,
    );
  });

  it("decides ~<sub-role> over A's rows, and the rewrite names A (D-18, N2 part 2b: the address is /~finance, without A's ID)", async () => {
    const response = await adminProxy(
      request("/~finance/donors", { [NAME]: TB, "x-asym-tenant": TB }),
      { nameTenantId: TA },
    );
    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "http://localhost:3330/donors",
    );
    expect(forwarded(response, "x-asym-tenant")).toBe(TA);
    expect(forwarded(response, "x-asym-assignment")).toBe(P_FIN_A.id);
    expect(forwarded(response, NAME)).toBe(TA);
  });

  it("scopes the role check to the name: Q is refused on B, R passes on either", async () => {
    state.rows = Q;
    expect(
      location(await adminProxy(request("/auth/x"), { nameTenantId: TB })),
    ).toBe("/no-access");
    state.rows = R;
    for (const tenantId of [TA, TB]) {
      const response = await adminProxy(request("/auth/x"), {
        nameTenantId: tenantId,
      });
      expect(response.headers.get("x-middleware-next"), tenantId).toBe("1");
      expect(forwarded(response, NAME), tenantId).toBe(tenantId);
    }
  });

  it("serves P in the missionary workspace on name A in A, and refuses B's segment there (D-18, N2 part 2b: one row serves at the bare path)", async () => {
    const served = await missionaryProxy(request("/"), { nameTenantId: TA });
    expect(location(served)).toBeNull();
    expect(forwarded(served, "x-asym-tenant")).toBe(TA);
    expect(forwarded(served, "x-asym-assignment")).toBe(P_MISS_A.id);
    const refused = await missionaryProxy(request(`/${TB}/donors`), {
      nameTenantId: TA,
    });
    expect(refused.status).toBe(404);
    expect(refused.headers.get("cache-control")).toBe("no-store");
  });

  it("sets the name on /api requests and on public pages, overwriting a client's copy", async () => {
    for (const path of ["/api/admin/funds", "/login"]) {
      state.userId = null;
      const response = await adminProxy(request(path, { [NAME]: TB }), {
        nameTenantId: TA,
      });
      expect(forwarded(response, NAME), path).toBe(TA);
    }
  });
});

describe("on: Web Studio's gate takes the name", () => {
  it("sends P with a cookie for B to the chooser with refused=1 on name A", async () => {
    const response = await adminProxy(
      request("/web-studio", { cookie: await studioCookie(TB, P_DEV_B.id) }),
      { nameTenantId: TA },
    );
    expect(location(response)).toBe(
      "/web-studio/organization?next=%2Fweb-studio&refused=1",
    );
  });

  it("sends Q to /no-access on name B, never the chooser", async () => {
    state.rows = Q;
    expect(
      location(
        await adminProxy(
          request("/web-studio", { cookie: await studioCookie(TA, Q[0]!.id) }),
          { nameTenantId: TB },
        ),
      ),
    ).toBe("/no-access");
  });

  it("lets Q with no cookie in on name A with no choice", async () => {
    state.rows = Q;
    const response = await adminProxy(request("/web-studio"), {
      nameTenantId: TA,
    });
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("keeps refused=1 on an entry link when the cookie names another organization (D-18, N2 part 2b: on, the entry link carries role only)", async () => {
    const cookie = await studioCookie(TB, P_DEV_B.id);
    expect(
      location(
        await adminProxy(request("/web-studio?role=development", { cookie }), {
          nameTenantId: TA,
        }),
      ),
    ).toBe("/web-studio/organization?next=%2Fweb-studio&refused=1");
  });

  it("adds no refused=1 to an entry link without a cookie (D-18, N2 part 2b: on, the entry link carries role only)", async () => {
    expect(
      location(
        await adminProxy(request("/web-studio?role=development"), {
          nameTenantId: TA,
        }),
      ),
    ).toBe("/web-studio/organization?next=%2Fweb-studio");
  });

  it("never names an organization on the chooser's address (D-18, N2 part 2b: organization and assignment are not read, and from is never set)", async () => {
    const response = await adminProxy(
      request(`/web-studio?organization=${TB}&assignment=${P_DEV_B.id}`),
      { nameTenantId: TA },
    );
    const target = new URL(location(response)!, "http://localhost:3330");
    expect(target.pathname).toBe("/web-studio/organization");
    expect(target.searchParams.has("from")).toBe(false);
  });
});

describe("on: a middleware without the tenant address scopes its sign-in role check to the name", () => {
  const plainProxy = createAuthMiddleware({
    publicRoutes: ["/no-access"],
    protectedRoutePrefixes: ["/"],
    loginPath: "/login",
    redirectAuthenticatedTo: "/home",
    unauthorizedRedirectTo: "/no-access",
    roleClass: "staff",
    allowedRoles: ["staff", "admin"],
    resolveUserRole: resolveUserRoleFromDatabase,
    tenantAddress: false,
  });

  it("refuses Q on name B and admits R on name B at a signed-in /login", async () => {
    state.rows = Q;
    expect(
      location(await plainProxy(request("/login"), { nameTenantId: TB })),
    ).toBe("/no-access");
    state.rows = R;
    expect(
      location(await plainProxy(request("/login"), { nameTenantId: TB })),
    ).toBe("/home");
  });

  it("decides as today without a name", async () => {
    state.rows = Q;
    expect(location(await plainProxy(request("/login")))).toBe("/home");
    state.rows = R;
    expect(location(await plainProxy(request("/login")))).toBe("/no-access");
  });
});

describe("on: an organization not active, or a revoked row", () => {
  beforeEach(() => {
    state.rows = [P_DEV_A, P_FIN_A, P_MISS_A];
  });

  it("answers a signed-out /login on name B", async () => {
    state.userId = null;
    const response = await adminProxy(request("/login"), { nameTenantId: TB });
    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("sends a signed-in /login, a page and /web-studio to /no-access on name B", async () => {
    expect(
      location(await adminProxy(request("/login"), { nameTenantId: TB })),
    ).toBe("/");
    expect(location(await adminProxy(request("/"), { nameTenantId: TB }))).toBe(
      "/no-access",
    );
    expect(
      location(await adminProxy(request("/web-studio"), { nameTenantId: TB })),
    ).toBe("/no-access");
  });
});

describe("off: a client's name header changes no decision and is never forwarded", () => {
  it("lands, addresses and refuses as without it", async () => {
    for (const path of ["/", `/${TB}/donors`, `/${TA}/donors`, "/auth/x"]) {
      for (const rows of [P, Q, R]) {
        state.rows = rows;
        const without = await adminProxy(request(path));
        const withName = await adminProxy(request(path, { [NAME]: TB }));
        expect(withName.status, path).toBe(without.status);
        expect(location(withName), path).toBe(location(without));
        expect(withName.headers.get("x-middleware-rewrite"), path).toBe(
          without.headers.get("x-middleware-rewrite"),
        );
        expect(forwarded(withName, "x-asym-tenant"), path).toBe(
          forwarded(without, "x-asym-tenant"),
        );
        expect(without.headers.get("set-cookie"), path).toContain(
          "sb-refreshed=fresh",
        );
        expect(withName.headers.get("set-cookie"), path).toBe(
          without.headers.get("set-cookie"),
        );
      }
    }
  });

  it("keeps today's entry-link chooser address, with no refused=1, whatever cookie is carried", async () => {
    const cookie = await studioCookie(TB, P_DEV_B.id);
    for (const headers of [{ cookie }, { cookie, [NAME]: TA }]) {
      expect(
        location(
          await adminProxy(
            request(
              `/web-studio?organization=${TA}&assignment=${P_DEV_A.id}`,
              headers,
            ),
          ),
        ),
      ).toBe(`/web-studio/organization?next=%2Fweb-studio&from=${TA}`);
    }
    expect(
      location(
        await adminProxy(
          request(`/web-studio?organization=${TA}&assignment=${P_DEV_A.id}`, {
            cookie: `${WEB_STUDIO_TENANT_COOKIE}=v1.x.y.z`,
          }),
        ),
      ),
    ).toBe(`/web-studio/organization?next=%2Fweb-studio&from=${TA}`);
  });

  it("decides Web Studio as without it, with today's chooser address", async () => {
    const cookie = await studioCookie(TB, P_DEV_B.id);
    const withName = await adminProxy(
      request("/web-studio", { cookie, [NAME]: TA }),
    );
    expect(withName.headers.get("x-middleware-next")).toBe("1");
    const entry = await adminProxy(
      request(`/web-studio?organization=${TB}&assignment=${P_DEV_B.id}`, {
        [NAME]: TA,
      }),
    );
    expect(location(entry)).toBe(
      `/web-studio/organization?next=%2Fweb-studio&from=${TB}`,
    );
    const unusable = await adminProxy(
      request("/web-studio", {
        cookie: `${WEB_STUDIO_TENANT_COOKIE}=v1.x.y.z`,
        [NAME]: TA,
      }),
    );
    expect(location(unusable)).toBe(
      "/web-studio/organization?next=%2Fweb-studio",
    );
  });

  it("forwards no name on a page, a rewrite, /api or /web-studio/api, keeping x-asym-tenant and x-asym-assignment where they are kept", async () => {
    const rewrite = await adminProxy(
      request(`/${TA}~finance/donors`, { [NAME]: TB }),
    );
    expect(forwarded(rewrite, "x-asym-tenant")).toBe(TA);
    expect(forwarded(rewrite, NAME)).toBeNull();
    for (const path of ["/api/admin/funds", "/web-studio/api/pages"]) {
      const response = await adminProxy(
        request(path, {
          [NAME]: TB,
          "x-asym-tenant": TB,
          "x-asym-assignment": P_DEV_B.id,
        }),
      );
      expect(forwarded(response, NAME), path).toBeNull();
      expect(forwarded(response, "x-asym-tenant"), path).toBe(TB);
      expect(forwarded(response, "x-asym-assignment"), path).toBe(P_DEV_B.id);
    }
    state.userId = null;
    const page = await adminProxy(request("/login", { [NAME]: TB }));
    expect(forwarded(page, NAME)).toBeNull();
  });
});
