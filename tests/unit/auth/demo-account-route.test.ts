import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const envKeys = [
  "ALLOW_DEMO_ACCOUNTS",
  "DEMO_ADMIN_EMAIL",
  "DEMO_DONOR_EMAIL",
  "DEMO_MISSIONARY_EMAIL",
  "DEMO_PASSWORD",
  "E2E_AUTH_BYPASS",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NODE_ENV",
] as const;

const originalEnv = Object.fromEntries(
  envKeys.map((key) => [key, process.env[key]]),
) as Record<(typeof envKeys)[number], string | undefined>;

let GET: () => Promise<Response>;
let POST: (request: Request) => Promise<Response>;
let fetchMock: ReturnType<typeof vi.spyOn<typeof globalThis, "fetch">>;

function restoreEnv(snapshot: Record<string, string | undefined>) {
  Object.entries(snapshot).forEach(([key, value]) => {
    if (value === undefined) {
      delete process.env[key];
      return;
    }

    process.env[key] = value;
  });
}

function createPostRequest(
  body: unknown,
  url = "https://example.com/api/auth/demo-account",
) {
  return new Request(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

beforeEach(async () => {
  vi.resetModules();
  restoreEnv(
    Object.fromEntries(envKeys.map((key) => [key, undefined])) as Record<
      string,
      undefined
    >,
  );
  process.env.NODE_ENV = "test";
  vi.restoreAllMocks();
  fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
    throw new Error("Unexpected fetch");
  });

  const routeModule =
    await import("../../../packages/api/src/auth/demo-account");
  GET = routeModule.GET;
  POST = routeModule.POST;
});

afterAll(() => {
  vi.restoreAllMocks();
  restoreEnv(originalEnv);
});

describe("demo account route", () => {
  it("keeps demo accounts unavailable in production unless explicitly enabled", async () => {
    process.env.NODE_ENV = "production";
    process.env.DEMO_ADMIN_EMAIL = "admin@example.com";
    process.env.DEMO_PASSWORD = "demo-password";

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      availableRoles: {
        admin: false,
        missionary: false,
        donor: false,
      },
    });
  });

  it("rejects unsupported roles before attempting sign-in", async () => {
    process.env.ALLOW_DEMO_ACCOUNTS = "true";

    const response = await POST(createPostRequest({ role: "staff" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ ok: false, error: "Demo login unavailable" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sets a secure bypass cookie when e2e bypass is enabled over https", async () => {
    process.env.E2E_AUTH_BYPASS = "true";

    const response = await POST(createPostRequest({ role: "donor" }));
    const body = await response.json();
    const setCookie = response.headers.get("set-cookie");

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true, role: "donor", bypass: true });
    expect(setCookie).toContain("asym_e2e_auth=");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("Max-Age=3600");
    expect(setCookie).toContain("Path=/");
    expect(setCookie).toContain("SameSite=lax");
    expect(setCookie).toContain("Secure");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 503 when demo credentials exist but Supabase env is missing", async () => {
    process.env.ALLOW_DEMO_ACCOUNTS = "true";
    process.env.DEMO_DONOR_EMAIL = "donor@example.com";
    process.env.DEMO_PASSWORD = "demo-password";

    const response = await POST(createPostRequest({ role: "donor" }));
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toEqual({ ok: false, error: "Demo login unavailable" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps Supabase auth failures to a 401 response", async () => {
    process.env.ALLOW_DEMO_ACCOUNTS = "true";
    process.env.DEMO_DONOR_EMAIL = "donor@example.com";
    process.env.DEMO_PASSWORD = "demo-password";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://supabase.example.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ msg: "Invalid login credentials" }), {
        status: 400,
        headers: {
          "content-type": "application/json",
        },
      }),
    );

    const response = await POST(createPostRequest({ role: "donor" }));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ ok: false, error: "Invalid demo credentials" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/auth/v1/token?grant_type=password");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toMatchObject({
      email: "donor@example.com",
      password: "demo-password",
    });
  });

  it("forwards auth cookies from Supabase sign-in on success", async () => {
    process.env.ALLOW_DEMO_ACCOUNTS = "true";
    process.env.DEMO_DONOR_EMAIL = "donor@example.com";
    process.env.DEMO_PASSWORD = "demo-password";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://supabase.example.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          access_token: "access-token",
          refresh_token: "refresh-token",
          expires_in: 3600,
          token_type: "bearer",
          user: {
            id: "user-1",
            email: "donor@example.com",
            aud: "authenticated",
            role: "authenticated",
          },
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );

    const response = await POST(createPostRequest({ role: "donor" }));
    const body = await response.json();
    const setCookie = response.headers.get("set-cookie");

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true, role: "donor" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/auth/v1/token?grant_type=password");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toMatchObject({
      email: "donor@example.com",
      password: "demo-password",
    });
    expect(typeof setCookie).toBe("string");
    expect(setCookie?.length ?? 0).toBeGreaterThan(0);
    expect(setCookie).toContain("sb-supabase-auth-token=");
    expect(setCookie).toContain("Path=/");
    expect(setCookie).toContain("SameSite=lax");
  });
});
