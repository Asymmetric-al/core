import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetUser = vi.fn();
const mockCookieGet = vi.fn();

vi.mock("next/headers", () => ({
  cookies: () =>
    Promise.resolve({
      get: mockCookieGet,
      getAll: () => [],
      set: vi.fn(),
    }),
  headers: () =>
    Promise.resolve({
      get: (name: string) => (name === "host" ? "localhost:3005" : null),
    }),
}));

vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: () => ({
    url: "https://example.supabase.co",
    key: "anon",
    keyType: "anon" as const,
  }),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
  }),
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({ client: null }),
}));

import {
  E2E_AUTH_COOKIE_NAMES,
  createE2EAuthCookieValue,
} from "../../../packages/auth/e2e-auth";
import {
  DEMO_PROFILE_ID,
  DEMO_TENANT_ID,
} from "../../../packages/auth/constants";
import { getAuthContext, requireAuth } from "../../../packages/auth/context";

describe("getAuthContext E2E cookie", () => {
  const originalBypass = process.env.E2E_AUTH_BYPASS;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    mockGetUser.mockReset();
    mockCookieGet.mockReset();
    process.env.E2E_AUTH_BYPASS = originalBypass;
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("returns authenticated donor context when bypass is on and cookie is valid", async () => {
    process.env.E2E_AUTH_BYPASS = "1";
    process.env.NODE_ENV = "development";
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const cookieValue = createE2EAuthCookieValue({
      userId: "e2e-donor-user",
      role: "donor",
      tenantId: null,
    });
    mockCookieGet.mockImplementation((name: string) =>
      name === E2E_AUTH_COOKIE_NAMES.donor
        ? { name, value: cookieValue }
        : undefined,
    );

    const ctx = await getAuthContext();

    expect(ctx.isAuthenticated).toBe(true);
    expect(ctx.userId).toBe("e2e-donor-user");
    expect(ctx.role).toBe("donor");
    expect(ctx.tenantId).toBe(DEMO_TENANT_ID);
    expect(ctx.profileId).toBe(DEMO_PROFILE_ID);
    expect(() => requireAuth(ctx)).not.toThrow();
  });
});
