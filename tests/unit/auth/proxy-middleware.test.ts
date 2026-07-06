import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createE2EAuthCookieValue,
  E2E_AUTH_COOKIE_NAMES,
} from "../../../packages/auth/e2e-auth";

const {
  mockedCreateServerClient,
  mockedGetUser,
  mockedGetSession,
  mockedGetSupabasePublicConfig,
} = vi.hoisted(() => ({
  mockedCreateServerClient: vi.fn(),
  mockedGetUser: vi.fn(),
  mockedGetSession: vi.fn(),
  mockedGetSupabasePublicConfig: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: mockedCreateServerClient,
}));

vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: mockedGetSupabasePublicConfig,
}));

const originalE2EAuthBypass = process.env.E2E_AUTH_BYPASS;
const originalNodeEnv = process.env.NODE_ENV;

function createMockRequest(
  url: string,
  cookieMap?: Record<string, string>,
  hostHeader?: string,
) {
  const nextUrl = new URL(url);
  const headers = new Headers();
  if (hostHeader) {
    headers.set("host", hostHeader);
  }

  return {
    headers,
    nextUrl,
    cookies: {
      getAll: () => [],
      set: vi.fn(),
      get: vi.fn((name: string) =>
        cookieMap && name in cookieMap
          ? { name, value: cookieMap[name]! }
          : undefined,
      ),
    },
  };
}

async function invokeDonorProxy(
  url: string,
  cookieMap?: Record<string, string>,
  hostHeader?: string,
) {
  const { proxy } = await import("../../../apps/donor/proxy");
  return proxy(createMockRequest(url, cookieMap, hostHeader) as never);
}

describe("apps/donor/proxy (auth middleware)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.E2E_AUTH_BYPASS = originalE2EAuthBypass;
    process.env.NODE_ENV = originalNodeEnv;
    mockedCreateServerClient.mockReturnValue({
      auth: {
        getUser: mockedGetUser,
        getSession: mockedGetSession,
      },
    });
  });

  afterEach(() => {
    process.env.E2E_AUTH_BYPASS = originalE2EAuthBypass;
    process.env.NODE_ENV = originalNodeEnv;
    vi.restoreAllMocks();
  });

  it("redirects unauthenticated protected routes to login with next param", async () => {
    mockedGetSupabasePublicConfig.mockReturnValue({
      url: "https://example.supabase.co",
      key: "anon-key",
      keyType: "anon",
    });
    mockedGetUser.mockResolvedValue({ data: { user: null } });

    const response = await invokeDonorProxy(
      "https://example.test/donor-dashboard?tab=history",
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://example.test/login?next=%2Fdonor-dashboard%3Ftab%3Dhistory",
    );
    expect(response.headers.get("location")).not.toContain(
      "auth_misconfigured",
    );
    expect(mockedGetSupabasePublicConfig).toHaveBeenCalled();
  });

  it("redirects unauthenticated checkout visitors to the homepage without a next param", async () => {
    mockedGetSupabasePublicConfig.mockReturnValue({
      url: "https://example.supabase.co",
      key: "anon-key",
      keyType: "anon",
    });
    mockedGetUser.mockResolvedValue({ data: { user: null } });

    const response = await invokeDonorProxy(
      "https://example.test/checkout?workerId=worker_1&fund_id=fund_1",
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://example.test/");
  });

  it("allows authenticated checkout visitors through the donor proxy", async () => {
    mockedGetSupabasePublicConfig.mockReturnValue({
      url: "https://example.supabase.co",
      key: "anon-key",
      keyType: "anon",
    });
    process.env.E2E_AUTH_BYPASS = "1";
    process.env.NODE_ENV = "development";
    mockedGetUser.mockResolvedValue({ data: { user: null } });
    const cookieValue = createE2EAuthCookieValue({
      userId: "e2e-donor-user",
      role: "donor",
      tenantId: null,
    });

    const response = await invokeDonorProxy(
      "https://example.test/checkout?workerId=worker_1",
      {
        [E2E_AUTH_COOKIE_NAMES.donor]: cookieValue,
      },
      "localhost:3005",
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("fails closed on protected routes when public Supabase config is missing", async () => {
    mockedGetSupabasePublicConfig.mockReturnValue({
      url: null,
      key: null,
      keyType: null,
    });
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const response = await invokeDonorProxy(
      "https://example.test/donor-dashboard?tab=history",
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://example.test/login?next=%2Fdonor-dashboard%3Ftab%3Dhistory&error=auth_misconfigured",
    );
    expect(mockedCreateServerClient).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining(
        'Failing closed for protected path "/donor-dashboard"',
      ),
    );
  });
});
