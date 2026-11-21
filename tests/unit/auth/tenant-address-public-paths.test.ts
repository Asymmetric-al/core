import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PASSWORD_RECOVERY_PATHS } from "../../../packages/auth/password-recovery";
import { SIGN_UP_CONFIRMATION_CALLBACK_PATH } from "../../../packages/auth/sign-up-confirmation";
import { withTenantAddress } from "../../../packages/auth/tenant-address";

/**
 * Where WP0b and WP1.4 meet the tenant in the page address (AL-2675): in each
 * app that has a tenant segment, the password recovery steps, the sign-up
 * confirmation's callback and the sign-in callback stay public and outside
 * the tenant segment, while sign-in still returns to the full prefixed
 * address. Runs the apps' own proxies, as `proxy.ts` configures them.
 */

const USER = "00000000-0000-4000-8000-0000000000b1";
const TA = "00000000-0000-0000-0000-000000000001";

const state = vi.hoisted(() => ({
  userId: null as string | null,
  rows: [] as unknown[],
  rpcCalls: 0,
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
      state.rpcCalls += 1;
      if (fn !== "current_user_assignments") throw new Error(fn);
      return { data: state.rows, error: null };
    },
  }),
}));

const { proxy: adminProxy } = await import("../../../apps/admin/proxy");
const { proxy: missionaryProxy } =
  await import("../../../apps/missionary/proxy");

const APPS = [
  {
    app: "Mission Control",
    proxy: adminProxy,
    row: {
      id: "00000000-0000-4000-8000-0000000000b2",
      user_id: USER,
      tenant_id: TA,
      role: "staff",
      staff_role: "development",
      is_tenant_admin: false,
      updated_at: "2026-11-17T09:00:00.000000+00:00",
    },
  },
  {
    app: "the missionary workspace",
    proxy: missionaryProxy,
    row: {
      id: "00000000-0000-4000-8000-0000000000b3",
      user_id: USER,
      tenant_id: TA,
      role: "missionary",
      staff_role: null,
      is_tenant_admin: false,
      updated_at: "2026-11-17T09:00:00.000000+00:00",
    },
  },
] as const;

/** Every path WP0b and WP1.4 made public, and the sign-in callback. */
const ACCOUNT_PATHS = [
  PASSWORD_RECOVERY_PATHS.request,
  PASSWORD_RECOVERY_PATHS.callback,
  PASSWORD_RECOVERY_PATHS.reset,
  SIGN_UP_CONFIRMATION_CALLBACK_PATH,
];

function request(path: string) {
  return new NextRequest(new URL(path, "http://localhost:3330"));
}

function location(response: Response) {
  const value = response.headers.get("location");
  if (!value) return null;
  const url = new URL(value, "http://localhost:3330");
  return url.pathname + url.search;
}

beforeEach(() => {
  state.userId = null;
  state.rows = [];
  state.rpcCalls = 0;
});

describe.each(APPS)("$app: account paths and the tenant address", (surface) => {
  it.each(ACCOUNT_PATHS)(
    "serves %s to a visitor who is not signed in, outside the tenant segment",
    async (path) => {
      const response = await surface.proxy(request(`${path}?code=c`));

      expect(response.status).toBe(200);
      expect(response.headers.get("location")).toBeNull();
      expect(response.headers.get("x-middleware-rewrite")).toBeNull();
      expect(state.rpcCalls).toBe(0);
    },
  );

  it.each(ACCOUNT_PATHS)(
    "serves %s to a signed-in session, such as recovery's, without sending it into the tenant segment",
    async (path) => {
      state.userId = USER;
      state.rows = [surface.row];

      const response = await surface.proxy(request(path));

      expect(response.status).toBe(200);
      expect(response.headers.get("location")).toBeNull();
      expect(response.headers.get("x-middleware-rewrite")).toBeNull();
    },
  );

  it.each(ACCOUNT_PATHS)(
    "takes %s out of a tenant prefix, back to the bare address",
    async (path) => {
      state.userId = USER;
      state.rows = [surface.row];

      const response = await surface.proxy(request(`/${TA}${path}?code=c`));

      expect(response.status).toBe(307);
      expect(location(response)).toBe(`${path}?code=c`);
      expect(withTenantAddress(`/${TA}`, path)).toBe(path);
    },
  );

  it("still sends sign-in back to the full prefixed address", async () => {
    const response = await surface.proxy(request(`/${TA}/settings?tab=team`));

    expect(response.status).toBe(307);
    expect(location(response)).toBe(
      `/login?next=${encodeURIComponent(`/${TA}/settings?tab=team`)}`,
    );
  });

  it("lands the callback's home address on the person's prefix", async () => {
    // The sign-in callback redirects a person of this app to `/` (relative,
    // tests/unit/auth/callback-handler.test.ts); the proxy then enters their
    // one organization.
    state.userId = USER;
    state.rows = [surface.row];

    const response = await surface.proxy(request("/"));

    expect(response.status).toBe(307);
    expect(location(response)).toBe(`/${TA}`);
  });
});
