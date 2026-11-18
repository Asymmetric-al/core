import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Council round 1, A2 (AL-2675, WP2b slice A): the proxy itself refuses a
 * rewrite or redirect whose target is not on the request's own origin.
 *
 * `parseTenantAddress` no longer reads a second authority after the prefix
 * (A1), so a real address cannot produce such a target. This suite stands in
 * a parse that does, as a later change to the grammar might, and checks the
 * proxy's own refusal: no rewrite and no redirect to another origin, so
 * Next.js never sends the request, with the headers and cookies the proxy
 * forwards, to another host. Each app's own proxy, as `proxy.ts` sets it up.
 */

const USER = "00000000-0000-4000-8000-0000000000e1";
const TA = "00000000-0000-0000-0000-000000000001";
const ORIGIN = "http://localhost:3330";

const state = vi.hoisted(() => ({
  inner: "/",
  rows: [] as unknown[],
}));

vi.mock("../../../packages/auth/tenant-address", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../../packages/auth/tenant-address")
    >();
  return {
    ...actual,
    // A parse that lets a second authority through as the inner path.
    parseTenantAddress: (pathname: string) =>
      pathname.startsWith(`/${TA}`)
        ? {
            tenantId: TA,
            subRole: null,
            prefix: `/${TA}`,
            innerPathname: state.inner,
          }
        : actual.parseTenantAddress(pathname),
  };
});
vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: () => ({
    url: "https://example.supabase.co",
    key: "anon-key",
    keyType: "anon",
  }),
}));
vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: { getUser: async () => ({ data: { user: { id: USER } } }) },
    rpc: async () => ({ data: state.rows, error: null }),
  }),
}));

const { proxy: adminProxy } = await import("../../../apps/admin/proxy");
const { proxy: missionaryProxy } =
  await import("../../../apps/missionary/proxy");

describe.each([
  ["Mission Control", adminProxy, "staff", "development"],
  ["the missionary workspace", missionaryProxy, "missionary", null],
])("%s: a target on another origin", (_app, proxy, role, staffRole) => {
  beforeEach(() => {
    state.rows = [
      {
        id: "00000000-0000-4000-8000-0000000000e2",
        user_id: USER,
        tenant_id: TA,
        role,
        staff_role: staffRole,
        is_tenant_admin: false,
        updated_at: "2026-11-18T00:00:00.000000+00:00",
      },
    ];
  });

  it.each([
    "//evil.example/x",
    "/\\evil.example/x",
    "/\t/evil.example/x",
    "//127.0.0.1:9/latest/meta-data/",
  ])(
    "is refused as no page, with nothing sent elsewhere, for the inner path %j",
    async (inner) => {
      state.inner = inner;
      const response = await proxy(
        new NextRequest(new URL(`/${TA}/x`, ORIGIN), {
          headers: { cookie: "sb-session=member-token" },
        }),
      );

      expect(response.status).toBe(404);
      expect(response.headers.get("x-middleware-rewrite")).toBeNull();
      expect(response.headers.get("location")).toBeNull();
      expect(response.headers.get("x-middleware-request-cookie")).toBeNull();
    },
  );

  it.each(["//evil.example/x", "/\\evil.example/x"])(
    "is refused for an account path under a prefix too, instead of redirecting to %j",
    async (inner) => {
      // The proxy takes an account path out of the tenant segment with a
      // redirect to the inner path; that redirect stays on the origin too.
      state.inner = inner.replace("/x", "/login");
      const response = await proxy(
        new NextRequest(new URL(`/${TA}/x`, ORIGIN)),
      );
      const location = response.headers.get("location");
      if (location !== null) {
        expect(new URL(location, ORIGIN).origin).toBe(ORIGIN);
      }
      const rewrite = response.headers.get("x-middleware-rewrite");
      if (rewrite !== null) {
        expect(new URL(rewrite, ORIGIN).origin).toBe(ORIGIN);
      }
    },
  );
});
