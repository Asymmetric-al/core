/**
 * Council round 2, B7: password recovery adds no public route of its own. It
 * lives under `/forgot-password`, which each app's proxy already serves to
 * anyone, and the proxies serve nothing wider because of it. Exercised
 * through the real proxies, with only Supabase's client and config doubled.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { isMissionaryRoleGatePublicPath } from "../../../apps/missionary/lib/route-policy";
import { PASSWORD_RECOVERY_PATHS } from "../../../packages/auth/password-recovery";

const supabase = vi.hoisted(() => ({
  getUser: vi.fn(),
  createServerClient: vi.fn(),
  getSupabasePublicConfig: vi.fn(),
  resolveUserRole: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: supabase.createServerClient,
}));
vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: supabase.getSupabasePublicConfig,
}));
vi.mock("@asym/auth/resolve-user-role", () => ({
  resolveUserRoleFromDatabase: supabase.resolveUserRole,
}));

const PROXIES = {
  admin: () => import("../../../apps/admin/proxy"),
  donor: () => import("../../../apps/donor/proxy"),
  missionary: () => import("../../../apps/missionary/proxy"),
} as const;

type App = keyof typeof PROXIES;

const RECOVERY_PATHS = Object.values(PASSWORD_RECOVERY_PATHS);

/** Paths next to the recovery routes that each app still protects. */
const STILL_PROTECTED: Record<App, string[]> = {
  admin: [
    "/forgot-passwordx",
    "/forgot",
    "/forgot-password-reset",
    "/settings/forgot-password",
    "/",
  ],
  // The donor portal protects only its dashboard and checkout.
  donor: ["/donor-dashboard", "/donor-dashboard/forgot-password", "/checkout"],
  missionary: [
    "/forgot-passwordx",
    "/forgot",
    "/forgot-password-reset",
    "/settings/forgot-password",
    "/",
  ],
};

function request(path: string) {
  return {
    headers: new Headers(),
    nextUrl: new URL(`https://app.example.test${path}`),
    cookies: { getAll: () => [], set: vi.fn(), get: vi.fn() },
  };
}

async function visit(app: App, path: string) {
  const { proxy } = await PROXIES[app]();
  return proxy(request(path) as never);
}

beforeEach(() => {
  supabase.getSupabasePublicConfig.mockReturnValue({
    url: "https://example.supabase.co",
    key: "anon-key",
    keyType: "anon",
  });
  supabase.createServerClient.mockReturnValue({
    auth: { getUser: supabase.getUser },
  });
  supabase.getUser.mockResolvedValue({ data: { user: null } });
  supabase.resolveUserRole.mockResolvedValue(null);
});
afterEach(() => {
  vi.clearAllMocks();
});

describe.each(Object.keys(PROXIES) as App[])("the %s proxy", (app) => {
  it.each(RECOVERY_PATHS)("serves %s to a signed-out visitor", async (path) => {
    const response = await visit(app, path);
    expect(response.headers.get("location")).toBeNull();
    expect(response.status).toBe(200);
  });

  it.each(RECOVERY_PATHS)(
    "serves %s to the recovery session, whatever its role",
    async (path) => {
      // The session a recovery link creates is signed in; the reset screen
      // must reach it without a role check or a bounce to the app's home.
      supabase.getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
      const response = await visit(app, path);
      expect(response.headers.get("location")).toBeNull();
      expect(supabase.resolveUserRole).not.toHaveBeenCalled();
    },
  );

  it.each(STILL_PROTECTED[app])(
    "still sends a signed-out visitor at %s to sign in",
    async (path) => {
      const response = await visit(app, path);
      expect(response.status).toBe(307);
      expect(
        new URL(response.headers.get("location") ?? "", "https://x").pathname,
      ).toBe("/login");
    },
  );
});

describe("the missionary role gate", () => {
  it.each(RECOVERY_PATHS)("lets %s through", (path) => {
    expect(isMissionaryRoleGatePublicPath(path)).toBe(true);
  });

  it.each(["/forgot-passwordx", "/forgot", "/settings/forgot-password"])(
    "does not let %s through",
    (path) => {
      expect(isMissionaryRoleGatePublicPath(path)).toBe(false);
    },
  );
});
