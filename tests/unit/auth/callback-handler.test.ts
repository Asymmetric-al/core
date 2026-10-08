import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fixture = vi.hoisted(() => ({
  cookies: new Map<string, string>(),
  writes: [] as Array<{
    name: string;
    value: string;
    options?: { maxAge?: number };
  }>,
}));

vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: () => ({
    url: "https://callback-fixture.supabase.co",
    key: "fixture-anon-key",
  }),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    getAll: () =>
      Array.from(fixture.cookies, ([name, value]) => ({ name, value })),
    set: (name: string, value: string, options?: { maxAge?: number }) => {
      fixture.writes.push({ name, value, options });
      fixture.cookies.set(name, value);
    },
  }),
}));

import { GET } from "../../../packages/api/src/auth/callback";

const USER = {
  id: "8bc2cdfd-1607-4a44-8ab8-4a972ce9b7af",
  aud: "authenticated",
  role: "authenticated",
  email: "fixture@example.com",
  app_metadata: {},
  user_metadata: {},
  created_at: "2026-10-07T00:00:00Z",
};

function fakeAuthFetch(
  options: { rejectExchange?: boolean; role?: string } = {},
) {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = input instanceof Request ? input.url : input.toString();
    if (url.includes("/auth/v1/token")) {
      return Response.json(
        options.rejectExchange
          ? { error_code: "bad_code_verifier", message: "Invalid auth code" }
          : {
              access_token: "fixture-access-token",
              token_type: "bearer",
              expires_in: 3600,
              refresh_token: "fixture-refresh-token",
              user: USER,
            },
        { status: options.rejectExchange ? 400 : 200 },
      );
    }
    if (url.endsWith("/auth/v1/user")) return Response.json(USER);
    if (url.includes("/rest/v1/profiles")) {
      return Response.json({ role: options.role ?? "donor" });
    }
    throw new Error(`Unexpected fake auth request: ${url}`);
  });
}

beforeEach(() => {
  fixture.cookies.clear();
  fixture.writes.length = 0;
  fixture.cookies.set(
    "sb-callback-fixture-auth-token-code-verifier",
    JSON.stringify("fixture-code-verifier"),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Supabase auth callback redirects", () => {
  it("keeps a successful session exchange private while writing its cookies", async () => {
    vi.stubGlobal("fetch", fakeAuthFetch());

    const response = await GET(
      new Request("https://donor.example/auth/callback?code=fixture-code"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://donor.example/donor-dashboard",
    );
    expect(fixture.writes).toContainEqual(
      expect.objectContaining({
        name: "sb-callback-fixture-auth-token",
        value: expect.stringContaining("base64-"),
      }),
    );
    expect(fixture.writes).toContainEqual(
      expect.objectContaining({
        name: "sb-callback-fixture-auth-token-code-verifier",
        value: "",
        options: expect.objectContaining({ maxAge: 0 }),
      }),
    );
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("expires")).toBe("0");
    expect(response.headers.get("pragma")).toBe("no-cache");
  });

  it.each([
    ["%2Fprofile", "https://donor.example/profile"],
    ["https%3A%2F%2Fother.example%2F", "https://donor.example/"],
  ])(
    "keeps the fallback destination safe and private for next=%s",
    async (next, destination) => {
      vi.stubGlobal("fetch", fakeAuthFetch({ role: "unmapped-role" }));

      const response = await GET(
        new Request(
          `https://donor.example/auth/callback?code=fixture-code&next=${next}`,
        ),
      );

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe(destination);
      expect(response.headers.get("cache-control")).toContain("no-store");
      expect(response.headers.get("expires")).toBe("0");
      expect(response.headers.get("pragma")).toBe("no-cache");
    },
  );

  it("keeps a rejected exchange private without issuing session cookies", async () => {
    vi.stubGlobal("fetch", fakeAuthFetch({ rejectExchange: true }));

    const response = await GET(
      new Request("https://donor.example/auth/callback?code=invalid-code"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://donor.example/login?error=Could%20not%20authenticate",
    );
    expect(fixture.writes).toEqual([]);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("expires")).toBe("0");
    expect(response.headers.get("pragma")).toBe("no-cache");
  });

  it("returns a private failure redirect without exchanging a missing code", async () => {
    const fetch = fakeAuthFetch();
    vi.stubGlobal("fetch", fetch);

    const response = await GET(
      new Request("https://donor.example/auth/callback"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login?error=");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("expires")).toBe("0");
    expect(response.headers.get("pragma")).toBe("no-cache");
    expect(fetch).not.toHaveBeenCalled();
    expect(fixture.writes).toEqual([]);
  });
});
