import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

const CACHE_HEADERS = {
  "Cache-Control": "private, no-store",
  Expires: "0",
  Pragma: "no-cache",
};

vi.mock("@asym/auth", () => ({
  E2E_AUTH_COOKIE_NAME: "asym_e2e_auth",
  isE2EAuthBypassEnabled: () => false,
}));
vi.mock("@asym/auth/context", () => ({
  getAuthContext: async () => ({
    isAuthenticated: true,
    userId: "user-123",
    tenantId: "tenant-123",
    role: "admin",
  }),
  hasAnyContextRole: () => true,
}));
vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: () => ({
    url: "http://127.0.0.1:54321",
    key: "test-anon-key",
  }),
}));
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({ client: null }),
}));
vi.mock("@asym/env", () => ({
  serverEnv: {
    NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
  },
}));
vi.mock("@supabase/ssr", () => ({
  createServerClient: (
    _url: string,
    _key: string,
    options: {
      cookies: {
        setAll: (
          cookies: {
            name: string;
            value: string;
            options?: { maxAge: number };
          }[],
          headers: Record<string, string>,
        ) => void;
      };
    },
  ) => {
    const refresh = () => {
      options.cookies.setAll(
        [{ name: "sb-session", value: "", options: { maxAge: 0 } }],
        CACHE_HEADERS,
      );
    };
    return {
      auth: {
        signOut: async () => {
          refresh();
          return { error: null };
        },
      },
      from: () => ({
        select: () => ({
          or: () => ({
            maybeSingle: async () => {
              refresh();
              return { data: null, error: null };
            },
          }),
        }),
      }),
    };
  },
}));

describe("Supabase route response adapters", () => {
  it("keeps the SDK cache headers when metrics queries rotate the session", async () => {
    const { GET } =
      await import("../../../packages/api/src/missionaries/metrics");
    const response = await GET(
      new NextRequest("http://localhost/api/metrics"),
      {
        params: Promise.resolve({ id: "missionary-123" }),
      },
    );

    expect(response.status).toBe(404);
    expect(response.cookies.get("sb-session")?.value).toBe("");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("expires")).toBe("0");
    expect(response.headers.get("pragma")).toBe("no-cache");
  });

  it("keeps cookie cleanup and SDK expiry headers while signout remains no-store", async () => {
    const { POST } = await import("../../../packages/api/src/auth/signout");
    const response = await POST(
      new Request("http://localhost/api/auth/signout", {
        method: "POST",
      }),
    );

    expect(response.status).toBe(200);
    expect(response.cookies.get("sb-session")?.value).toBe("");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("expires")).toBe("0");
    expect(response.headers.get("pragma")).toBe("no-cache");
  });
});
