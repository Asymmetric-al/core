import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  DEMO_PROFILE_ID,
  DEMO_TENANT_ID,
} from "../../../packages/auth/constants";
import {
  E2E_AUTH_COOKIE_NAMES,
  parseE2EAuthCookieValue,
} from "../../../packages/auth/e2e-auth";

const ORIGINAL_ENV = { ...process.env };
const ORIGINAL_FETCH = global.fetch;

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  process.env = {
    ...ORIGINAL_ENV,
    NODE_ENV: "development",
    ALLOW_DEMO_ACCOUNTS: "true",
    E2E_AUTH_BYPASS: "false",
    E2E_AUTH_SECRET: "demo-account-test-secret",
    E2E_AUTH_ALLOWED_SUPABASE_REFS: "example",
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
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
  }, 20_000);

  it("returns ok true and sets auth cookie on successful POST", async () => {
    const { POST } =
      await import("../../../packages/api/src/auth/demo-account");
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

  it("sets the seeded donor tenant and profile in the E2E bypass cookie", async () => {
    vi.resetModules();
    process.env.E2E_AUTH_BYPASS = "true";

    const { POST } =
      await import("../../../packages/api/src/auth/demo-account");
    const request = new Request("http://localhost:3000/api/auth/demo-account", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role: "donor" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      ok: true,
      role: "donor",
      bypass: true,
    });

    const setCookie = response.headers.get("set-cookie") ?? "";
    const match = setCookie.match(
      new RegExp(`${E2E_AUTH_COOKIE_NAMES.donor}=([^;]+)`),
    );
    expect(match?.[1]).toBeTruthy();

    const session = await parseE2EAuthCookieValue(
      decodeURIComponent(match?.[1] ?? ""),
    );
    expect(session).toMatchObject({
      userId: "e2e-donor-user",
      role: "donor",
      tenantId: DEMO_TENANT_ID,
      profileId: DEMO_PROFILE_ID,
    });
  });

  it("fails closed for roles without a portal user mapping instead of minting an admin cookie", async () => {
    vi.resetModules();
    process.env.E2E_AUTH_BYPASS = "true";

    const { POST } =
      await import("../../../packages/api/src/auth/demo-account");
    const request = new Request("http://localhost:3000/api/auth/demo-account", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role: "delivery" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      ok: false,
      code: "DEMO_ROLE_UNSUPPORTED_FOR_BYPASS",
    });
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("mints a bypass cookie with zero secret config for the example placeholder", async () => {
    // The whole point of "easy for anyone to test": no E2E_AUTH_SECRET /
    // E2E_AUTH_ALLOWED_SUPABASE_REFS needed against the placeholder datasource.
    vi.resetModules();
    process.env.E2E_AUTH_BYPASS = "true";
    delete process.env.E2E_AUTH_SECRET;
    delete process.env.E2E_AUTH_ALLOWED_SUPABASE_REFS;
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";

    const { GET, POST } =
      await import("../../../packages/api/src/auth/demo-account");

    const availability = (await (await GET()).json()) as {
      availableRoles: Record<string, boolean>;
    };
    expect(availability.availableRoles.donor).toBe(true);

    const request = new Request("http://localhost:3000/api/auth/demo-account", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role: "donor" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie") ?? "").toContain(
      "asym_e2e_auth_donor=",
    );
  });

  it("reports E2E bypass unavailable on GET when a real datasource has no secret", async () => {
    vi.resetModules();
    process.env.E2E_AUTH_BYPASS = "true";
    delete process.env.E2E_AUTH_SECRET;
    // Real remote datasource → the public fallback does NOT apply.
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://realproj12345.supabase.co";

    const { GET } = await import("../../../packages/api/src/auth/demo-account");
    const response = await GET();
    expect(response.status).toBe(200);
    const payload = (await response.json()) as {
      availableRoles: Record<string, boolean>;
      reason?: string;
    };
    expect(payload.availableRoles.admin).toBe(false);
    expect(payload.availableRoles.donor).toBe(false);
    expect(payload.reason).toMatch(/E2E_AUTH_SECRET/);
  });

  it("returns 503 on POST when a real datasource has no secret", async () => {
    vi.resetModules();
    process.env.E2E_AUTH_BYPASS = "true";
    delete process.env.E2E_AUTH_SECRET;
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://realproj12345.supabase.co";

    const { POST } =
      await import("../../../packages/api/src/auth/demo-account");
    const request = new Request("http://localhost:3000/api/auth/demo-account", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role: "donor" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(503);
    const payload = (await response.json()) as { ok: boolean; code?: string };
    expect(payload.ok).toBe(false);
    expect(payload.code).toBe("DEMO_E2E_BYPASS_MISCONFIGURED");
  });

  it("blocks demo login in production unless explicitly enabled", async () => {
    vi.resetModules();
    process.env.NODE_ENV = "production";
    process.env.ALLOW_DEMO_ACCOUNTS = "false";
    const { POST } =
      await import("../../../packages/api/src/auth/demo-account");

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
