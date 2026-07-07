import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DEMO_PROFILE_ID, DEMO_TENANT_ID } from "./constants";
import { createE2EAuthCookieValue, E2E_AUTH_COOKIE_NAME } from "./e2e-auth";

const originalBypass = process.env.E2E_AUTH_BYPASS;
const originalNodeEnv = process.env.NODE_ENV;
const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalSupabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const mockedCreateServerClient = vi.hoisted(() => vi.fn());
const mockedGetSupabasePublicConfig = vi.hoisted(() => vi.fn());

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
  headers: vi.fn(() =>
    Promise.resolve({
      get: () => null,
    }),
  ),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: mockedCreateServerClient,
}));

vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: mockedGetSupabasePublicConfig,
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: vi.fn(() => ({ client: null, error: null })),
}));

describe("getAuthContext E2E bypass", () => {
  beforeEach(() => {
    process.env.E2E_AUTH_BYPASS = "true";
    process.env.NODE_ENV = "development";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "example-anon-key";
    mockedGetSupabasePublicConfig.mockReturnValue({
      url: "https://example.supabase.co",
      key: "example-anon-key",
      keyType: "anon",
    });
  });

  afterEach(() => {
    process.env.E2E_AUTH_BYPASS = originalBypass;
    process.env.NODE_ENV = originalNodeEnv;
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalSupabaseAnon;
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("returns authenticated context from asym_e2e_auth cookie when Supabase returns no user", async () => {
    mockedCreateServerClient.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    });

    const value = createE2EAuthCookieValue({
      userId: "e2e-donor-user",
      role: "donor",
      tenantId: null,
    });

    const { cookies } = await import("next/headers");
    vi.mocked(cookies).mockResolvedValue({
      get: (name: string) =>
        name === E2E_AUTH_COOKIE_NAME ? { value } : undefined,
      getAll: () => [],
      set: vi.fn(),
    } as never);

    const { getAuthContext } = await import("./context");
    const ctx = await getAuthContext();

    expect(ctx.isAuthenticated).toBe(true);
    expect(ctx.userId).toBe("e2e-donor-user");
    expect(ctx.role).toBe("donor");
    expect(ctx.profileRole).toBe("donor");
    expect(ctx.tenantId).toBe(DEMO_TENANT_ID);
    expect(ctx.profileId).toBe(DEMO_PROFILE_ID);
  });

  it("injects demo tenant and profile for super_admin E2E bypass when ids are null", async () => {
    mockedCreateServerClient.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    });

    const value = createE2EAuthCookieValue({
      userId: "e2e-super",
      role: "super_admin",
      tenantId: null,
    });

    const { cookies } = await import("next/headers");
    vi.mocked(cookies).mockResolvedValue({
      get: (name: string) =>
        name === E2E_AUTH_COOKIE_NAME ? { value } : undefined,
      getAll: () => [],
      set: vi.fn(),
    } as never);

    const { getAuthContext } = await import("./context");
    const ctx = await getAuthContext();

    expect(ctx.isAuthenticated).toBe(true);
    expect(ctx.tenantId).toBe(DEMO_TENANT_ID);
    expect(ctx.profileId).toBe(DEMO_PROFILE_ID);
  });

  it("injects demo tenant and profile for staff-capable E2E bypass when ids are null", async () => {
    mockedCreateServerClient.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    });

    const value = createE2EAuthCookieValue({
      userId: "e2e-admin-user",
      role: "admin",
      tenantId: null,
    });

    const { cookies } = await import("next/headers");
    vi.mocked(cookies).mockResolvedValue({
      get: (name: string) =>
        name === E2E_AUTH_COOKIE_NAME ? { value } : undefined,
      getAll: () => [],
      set: vi.fn(),
    } as never);

    const { getAuthContext } = await import("./context");
    const ctx = await getAuthContext();

    expect(ctx.isAuthenticated).toBe(true);
    expect(ctx.tenantId).toBe(DEMO_TENANT_ID);
    expect(ctx.profileId).toBe(DEMO_PROFILE_ID);
  });

  it("injects demo tenant and profile for donor E2E bypass when ids are null", async () => {
    mockedCreateServerClient.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    });

    const value = createE2EAuthCookieValue({
      userId: "e2e-donor",
      role: "donor",
      tenantId: null,
    });

    const { cookies } = await import("next/headers");
    vi.mocked(cookies).mockResolvedValue({
      get: (name: string) =>
        name === E2E_AUTH_COOKIE_NAME ? { value } : undefined,
      getAll: () => [],
      set: vi.fn(),
    } as never);

    const { getAuthContext } = await import("./context");
    const ctx = await getAuthContext();

    expect(ctx.isAuthenticated).toBe(true);
    expect(ctx.tenantId).toBe(DEMO_TENANT_ID);
    expect(ctx.profileId).toBe(DEMO_PROFILE_ID);
  });

  it("preserves explicit tenant IDs for donor E2E bypass", async () => {
    mockedCreateServerClient.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    });

    const value = createE2EAuthCookieValue({
      userId: "e2e-donor",
      role: "donor",
      tenantId: "00000000-0000-0000-0000-000000000099",
    });

    const { cookies } = await import("next/headers");
    vi.mocked(cookies).mockResolvedValue({
      get: (name: string) =>
        name === E2E_AUTH_COOKIE_NAME ? { value } : undefined,
      getAll: () => [],
      set: vi.fn(),
    } as never);

    const { getAuthContext } = await import("./context");
    const ctx = await getAuthContext();

    expect(ctx.isAuthenticated).toBe(true);
    expect(ctx.tenantId).toBe("00000000-0000-0000-0000-000000000099");
    expect(ctx.profileId).toBe(DEMO_PROFILE_ID);
  });

  it("prefers Supabase session over stale asym_e2e_auth when both are present", async () => {
    const e2eValue = createE2EAuthCookieValue({
      userId: "e2e-stale-user",
      role: "super_admin",
      tenantId: "00000000-0000-0000-0000-000000000099",
    });

    mockedCreateServerClient.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "real-supabase-user" } },
        }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () =>
              Promise.resolve({
                data: {
                  id: "profile-real",
                  tenant_id: "00000000-0000-0000-0000-000000000001",
                  role: "staff",
                },
              }),
          }),
        }),
      }),
      schema: () => ({
        from: () => ({
          select: () => ({
            eq: () => ({
              eq: () => ({
                eq: () => Promise.resolve({ data: [] }),
              }),
            }),
          }),
        }),
      }),
    });

    const { cookies } = await import("next/headers");
    vi.mocked(cookies).mockResolvedValue({
      get: (name: string) =>
        name === E2E_AUTH_COOKIE_NAME ? { value: e2eValue } : undefined,
      getAll: () => [],
      set: vi.fn(),
    } as never);

    const { getAuthContext } = await import("./context");
    const ctx = await getAuthContext();

    expect(ctx.userId).toBe("real-supabase-user");
    expect(ctx.profileId).toBe("profile-real");
    expect(ctx.tenantId).toBe("00000000-0000-0000-0000-000000000001");
    expect(ctx.role).toBe("staff");
  });
});
