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
    url: "https://recovery-fixture.supabase.co",
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

import { GET } from "../../../packages/api/src/auth/password-recovery";

const USER = {
  id: "0f8fa7b5-2d8a-4c9e-9a51-2a4b7d0e8c11",
  aud: "authenticated",
  role: "authenticated",
  email: "recover@example.com",
  app_metadata: {},
  user_metadata: {},
  created_at: "2026-11-01T00:00:00Z",
};

function fakeAuthFetch(options: { rejectExchange?: boolean } = {}) {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = input instanceof Request ? input.url : input.toString();
    if (url.includes("/auth/v1/token")) {
      return Response.json(
        options.rejectExchange
          ? {
              error_code: "flow_state_not_found",
              message: "invalid flow state",
            }
          : {
              access_token: "fixture-access-token",
              token_type: "bearer",
              expires_in: 3600,
              refresh_token: "fixture-refresh-token",
              user: USER,
            },
        { status: options.rejectExchange ? 404 : 200 },
      );
    }
    throw new Error(`Unexpected request from the recovery callback: ${url}`);
  });
}

function expectPrivate(response: Response) {
  expect(response.headers.get("cache-control")).toContain("no-store");
  expect(response.headers.get("expires")).toBe("0");
  expect(response.headers.get("pragma")).toBe("no-cache");
}

beforeEach(() => {
  fixture.cookies.clear();
  fixture.writes.length = 0;
  fixture.cookies.set(
    "sb-recovery-fixture-auth-token-code-verifier",
    JSON.stringify("fixture-code-verifier"),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("password recovery callback", () => {
  it("exchanges the emailed code and sends the person to choose a password", async () => {
    const fetch = fakeAuthFetch();
    vi.stubGlobal("fetch", fetch);

    const response = await GET(
      new Request(
        "http://localhost:3130/forgot-password/callback?code=fixture-code",
      ),
    );

    expect(response.status).toBe(307);
    // Never the role home: the person must set a password first, whatever
    // their role, and on the host the email link returned to.
    expect(response.headers.get("location")).toBe(
      "http://localhost:3130/forgot-password/reset",
    );
    expect(fixture.writes).toContainEqual(
      expect.objectContaining({
        name: "sb-recovery-fixture-auth-token",
        value: expect.stringContaining("base64-"),
      }),
    );
    expect(fetch).toHaveBeenCalledTimes(1);
    expectPrivate(response);
  });

  it("issues no session for a used or expired code and lets the reset page explain", async () => {
    vi.stubGlobal("fetch", fakeAuthFetch({ rejectExchange: true }));

    const response = await GET(
      new Request(
        "https://give.example.org/forgot-password/callback?code=used-code",
      ),
    );

    expect(response.headers.get("location")).toBe(
      "https://give.example.org/forgot-password/reset",
    );
    expect(
      fixture.writes.filter(
        (write) => write.name === "sb-recovery-fixture-auth-token",
      ),
    ).toEqual([]);
    expectPrivate(response);
  });

  it("does not call Supabase when the link carries an error instead of a code", async () => {
    const fetch = fakeAuthFetch();
    vi.stubGlobal("fetch", fetch);

    const response = await GET(
      new Request(
        "http://127.0.0.1:4100/forgot-password/callback?error=access_denied&error_code=otp_expired",
      ),
    );

    expect(response.headers.get("location")).toBe(
      "http://127.0.0.1:4100/forgot-password/reset",
    );
    expect(fetch).not.toHaveBeenCalled();
    expect(fixture.writes).toEqual([]);
    expectPrivate(response);
  });
});
