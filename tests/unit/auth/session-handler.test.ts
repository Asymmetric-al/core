import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fixture = vi.hoisted(() => ({
  cookies: new Map<string, string>(),
}));

vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: () => ({
    url: "https://session-fixture.supabase.co",
    key: "fixture-anon-key",
  }),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    getAll: () =>
      Array.from(fixture.cookies, ([name, value]) => ({ name, value })),
    set: (name: string, value: string) => {
      fixture.cookies.set(name, value);
    },
  }),
}));

import { GET } from "../../../packages/api/src/auth/session";

const USER = {
  id: "0f8fa7b5-2d8a-4c9e-9a51-2a4b7d0e8c11",
  aud: "authenticated",
  role: "authenticated",
  email: "known@example.test",
  app_metadata: {},
  user_metadata: { first_name: "Known" },
  created_at: "2026-11-01T00:00:00Z",
};

function withSessionCookie() {
  const session = {
    access_token: "fixture-access-token",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: "fixture-refresh-token",
    user: USER,
  };
  fixture.cookies.set(
    "sb-session-fixture-auth-token",
    `base64-${Buffer.from(JSON.stringify(session)).toString("base64url")}`,
  );
}

function fakeProvider(options: { down?: boolean } = {}) {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = input instanceof Request ? input.url : input.toString();
    if (options.down) throw new TypeError("fetch failed");
    if (url.endsWith("/auth/v1/user")) return Response.json(USER);
    throw new Error(`Unexpected request from Core's session route: ${url}`);
  });
}

beforeEach(() => {
  fixture.cookies.clear();
  vi.stubGlobal("fetch", fakeProvider());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Core's session-state route (AL-2671 N4 PR 1)", () => {
  it("answers a signed-out browser with no user and no provider call, never cached", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ user: null });
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("answers a signed-in browser with the user the provider verified, and no token", async () => {
    withSessionCookie();
    const response = await GET();
    const body = await response.text();
    expect(response.status).toBe(200);
    expect(JSON.parse(body)).toEqual({ user: USER });
    expect(body).not.toContain("fixture-access-token");
    expect(body).not.toContain("fixture-refresh-token");
    expect(response.headers.get("cache-control")).toContain("no-store");
  });

  it("answers no user, as unavailable, when the provider cannot be reached", async () => {
    withSessionCookie();
    vi.stubGlobal("fetch", fakeProvider({ down: true }));
    const response = await GET();
    const body = await response.text();
    expect(response.status).toBe(503);
    expect(JSON.parse(body)).toEqual({ user: null });
    expect(body).not.toContain("fetch failed");
  });
});
