import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };
const ORIGINAL_FETCH = global.fetch;

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  process.env = {
    ...ORIGINAL_ENV,
    NODE_ENV: "development",
    ALLOW_DEMO_ACCOUNTS: "true",
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
    DEMO_PASSWORD: "demo-password",
    DEMO_ADMIN_EMAIL: "demo-admin@example.com",
    DEMO_MISSIONARY_EMAIL: "demo-missionary@example.com",
    DEMO_DONOR_EMAIL: "demo-donor@example.com",
  };
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  global.fetch = ORIGINAL_FETCH;
});

describe("api/auth/demo-account", () => {
  it("returns role availability on GET", async () => {
    const { GET } = await import("../../../packages/api/src/auth/demo-account");
    const response = await GET();
    expect(response.status).toBe(200);
    const payload = (await response.json()) as {
      enabled: boolean;
      roles: Record<string, boolean>;
    };
    expect(payload.enabled).toBe(true);
    expect(payload.roles.admin).toBe(true);
  });

  it("returns ok true and sets auth cookie on successful POST", async () => {
    const { POST } = await import("../../../packages/api/src/auth/demo-account");
    global.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url.includes("/auth/v1/token")) {
        return new Response(
          JSON.stringify({
            access_token: "access-token",
            token_type: "bearer",
            expires_in: 3600,
            refresh_token: "refresh-token",
            user: {
              id: "8bc2cdfd-1607-4a44-8ab8-4a972ce9b7af",
              aud: "authenticated",
              role: "authenticated",
              email: "demo-admin@example.com",
              app_metadata: { provider: "email", providers: ["email"] },
              user_metadata: {},
              identities: [],
              created_at: "2026-02-26T00:00:00Z",
            },
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      throw new Error(`Unexpected fetch URL: ${url}`);
    });

    const request = new Request("http://localhost/api/auth/demo-account", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role: "admin" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(response.headers.get("set-cookie")).toContain("sb-");
  });

  it("blocks demo login in production unless explicitly enabled", async () => {
    const { POST } = await import("../../../packages/api/src/auth/demo-account");
    process.env.NODE_ENV = "production";
    process.env.ALLOW_DEMO_ACCOUNTS = "false";

    const request = new Request("http://localhost/api/auth/demo-account", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role: "admin" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(403);
    const payload = (await response.json()) as { ok: boolean; code?: string };
    expect(payload.ok).toBe(false);
    expect(payload.code).toBe("DEMO_DISABLED");
  });
});
