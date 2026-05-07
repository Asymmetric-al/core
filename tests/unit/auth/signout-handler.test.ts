import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFile } from "node:fs/promises";

const ORIGINAL_ENV = { ...process.env };
const ORIGINAL_FETCH = global.fetch;

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  process.env = {
    ...ORIGINAL_ENV,
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
  };
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  global.fetch = ORIGINAL_FETCH;
});

describe("api/auth/signout", () => {
  it("uses current-session Supabase signout scope explicitly", async () => {
    const source = await readFile("packages/api/src/auth/signout.ts", "utf8");
    expect(source).toContain('scope: "local"');
  });

  it("allows requests without origin context", async () => {
    const { POST } = await import("../../../packages/api/src/auth/signout");
    global.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url.includes("/auth/v1/logout")) {
        return new Response("", { status: 204 });
      }
      throw new Error(`Unexpected fetch URL: ${url}`);
    });

    const request = new Request("http://localhost/api/auth/signout", {
      method: "POST",
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("rejects cross-origin requests", async () => {
    const { POST } = await import("../../../packages/api/src/auth/signout");
    const request = new Request("http://localhost/api/auth/signout", {
      method: "POST",
      headers: { origin: "https://evil.example.com" },
    });

    const response = await POST(request);
    expect(response.status).toBe(403);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("accepts loopback same-port requests across localhost and 127.0.0.1", async () => {
    const { POST } = await import("../../../packages/api/src/auth/signout");
    global.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url.includes("/auth/v1/logout")) {
        return new Response("", { status: 204 });
      }
      throw new Error(`Unexpected fetch URL: ${url}`);
    });

    const request = new Request("http://localhost:3005/api/auth/signout", {
      method: "POST",
      headers: {
        origin: "http://127.0.0.1:3005",
        cookie: "sb-uljrxxfqekbbeajaztet-auth-token=demo-token",
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("returns ok true on valid same-origin request", async () => {
    const { POST } = await import("../../../packages/api/src/auth/signout");
    global.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url.includes("/auth/v1/logout")) {
        return new Response("", { status: 204 });
      }
      throw new Error(`Unexpected fetch URL: ${url}`);
    });

    const request = new Request("http://localhost/api/auth/signout", {
      method: "POST",
      headers: {
        origin: "http://localhost",
        cookie: "sb-uljrxxfqekbbeajaztet-auth-token=demo-token",
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("returns 503 when public Supabase config is missing", async () => {
    const { POST } = await import("../../../packages/api/src/auth/signout");
    process.env.NEXT_PUBLIC_SUPABASE_URL = "";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "";
    process.env.E2E_AUTH_BYPASS = "false";

    const request = new Request("http://localhost/api/auth/signout", {
      method: "POST",
      headers: { origin: "http://localhost" },
    });

    const response = await POST(request);
    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("clears the e2e bypass cookie when bypass mode is enabled", async () => {
    const { POST } = await import("../../../packages/api/src/auth/signout");
    process.env.E2E_AUTH_BYPASS = "true";

    const request = new Request("http://localhost/api/auth/signout", {
      method: "POST",
      headers: {
        origin: "http://localhost",
        cookie: "asym_e2e_auth=test-cookie",
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("set-cookie")).toContain("asym_e2e_auth=");
  });
});
