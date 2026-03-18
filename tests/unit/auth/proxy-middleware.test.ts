import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockedCreateServerClient,
  mockedGetUser,
  mockedGetSupabasePublicConfig,
} = vi.hoisted(() => ({
  mockedCreateServerClient: vi.fn(),
  mockedGetUser: vi.fn(),
  mockedGetSupabasePublicConfig: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: mockedCreateServerClient,
}));

vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: mockedGetSupabasePublicConfig,
}));

function createMockRequest(url: string) {
  const nextUrl = new URL(url);
  return {
    headers: new Headers(),
    nextUrl,
    cookies: {
      getAll: () => [],
      set: vi.fn(),
      get: vi.fn(() => undefined),
    },
  };
}

async function invokeDonorProxy(url: string) {
  const { proxy } = await import("../../../apps/donor/proxy");
  return proxy(createMockRequest(url) as never);
}

describe("apps/donor/proxy (auth middleware)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockedCreateServerClient.mockReturnValue({
      auth: {
        getUser: mockedGetUser,
      },
    });
  });

  afterEach(() => {
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
