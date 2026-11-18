import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Council round 1, A2 (AL-2675, WP2b slice A): the proxy's rewrite of a tenant
 * address never leaves the app's own origin.
 *
 * The proxy builds the rewrite target from the address's inner path. An inner
 * path that begins `//host/x` made that target another origin, and Next.js
 * then fetches it itself with the request headers the proxy set, the session
 * cookie among them. Next's own repeated-slash redirect stands in front only
 * for the raw `//` form; a tab between the slashes, which `new URL` strips,
 * goes past it. Runs each app's own proxy, as `proxy.ts` configures it.
 */

const USER = "00000000-0000-4000-8000-0000000000d1";
const TA = "00000000-0000-0000-0000-000000000001";
const ORIGIN = "http://localhost:3330";

const state = vi.hoisted(() => ({
  userId: null as string | null,
  rows: [] as unknown[],
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
      getUser: async () => ({
        data: { user: state.userId ? { id: state.userId } : null },
      }),
    },
    rpc: async (fn: string) => {
      if (fn !== "current_user_assignments") throw new Error(fn);
      return { data: state.rows, error: null };
    },
  }),
}));

const { proxy: adminProxy } = await import("../../../apps/admin/proxy");
const { proxy: missionaryProxy } =
  await import("../../../apps/missionary/proxy");

/** Inner paths that point at another host, in each form a request can carry. */
const OFF_ORIGIN = [
  "//evil.example/x",
  "/\\evil.example/x",
  "/\t/evil.example/x",
  "/\n/evil.example/x",
  "/%2F%2Fevil.example/x",
  "/%5C%5Cevil.example/x",
  "//127.0.0.1:9/latest/meta-data/",
];

describe.each([
  ["Mission Control", adminProxy, "staff", "development"],
  ["the missionary workspace", missionaryProxy, "missionary", null],
])("%s: the rewrite of a tenant address", (_app, proxy, role, staffRole) => {
  beforeEach(() => {
    state.userId = USER;
    state.rows = [
      {
        id: "00000000-0000-4000-8000-0000000000d2",
        user_id: USER,
        tenant_id: TA,
        role,
        staff_role: staffRole,
        is_tenant_admin: false,
        updated_at: "2026-11-18T00:00:00.000000+00:00",
      },
    ];
  });

  it.each(OFF_ORIGIN)(
    "sends nothing to another origin for the inner path %j, from a member of the tenant",
    async (inner) => {
      const request = new NextRequest(new URL(`/${TA}${inner}`, ORIGIN), {
        headers: { cookie: "sb-session=member-token" },
      });

      const response = await proxy(request);

      const rewrite = response.headers.get("x-middleware-rewrite");
      if (rewrite !== null) {
        expect(new URL(rewrite, ORIGIN).origin, rewrite).toBe(ORIGIN);
      }
      const location = response.headers.get("location");
      if (location !== null) {
        expect(new URL(location, ORIGIN).origin, location).toBe(ORIGIN);
      }
      // A response that forwards the caller's cookies does so only to a
      // rewrite on this origin.
      if (response.headers.get("x-middleware-request-cookie") !== null) {
        expect(
          rewrite === null || new URL(rewrite, ORIGIN).origin === ORIGIN,
        ).toBe(true);
      }
    },
  );
});
