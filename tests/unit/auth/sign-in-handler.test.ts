import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fixture = vi.hoisted(() => ({
  cookies: new Map<string, string>(),
  writes: [] as Array<{ name: string; value: string }>,
  take: vi.fn(),
  record: vi.fn(),
}));

vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: () => ({
    url: "https://sign-in-fixture.supabase.co",
    key: "fixture-anon-key",
  }),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    getAll: () =>
      Array.from(fixture.cookies, ([name, value]) => ({ name, value })),
    set: (name: string, value: string) => {
      fixture.writes.push({ name, value });
      fixture.cookies.set(name, value);
    },
  }),
}));

vi.mock(
  "../../../packages/api/src/identity/sign-in-limits",
  async (importActual) => {
    const actual =
      await importActual<
        typeof import("../../../packages/api/src/identity/sign-in-limits")
      >();
    return {
      ...actual,
      takeSignInAttempt: fixture.take,
      recordSignInFailure: fixture.record,
    };
  },
);

import { SignInLimitsUnavailableError } from "../../../packages/api/src/identity/sign-in-limits";
import { POST } from "../../../packages/api/src/auth/sign-in";

const RIGHT = "right sign-in phrase";
const WRONG = "wrong sign-in phrase";
const USER = {
  id: "0f8fa7b5-2d8a-4c9e-9a51-2a4b7d0e8c11",
  aud: "authenticated",
  role: "authenticated",
  email: "known@example.test",
  app_metadata: {},
  user_metadata: {},
  created_at: "2026-11-01T00:00:00Z",
};
const PROVIDER_TEXT = /invalid login credentials|email not confirmed/i;

/** The provider's password grant, as the installed Auth server answers it. */
function fakeProvider(options: { down?: boolean } = {}) {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = input instanceof Request ? input.url : input.toString();
    if (options.down) throw new TypeError("fetch failed");
    if (url.includes("/auth/v1/token?grant_type=password")) {
      const body = JSON.parse(String(init?.body)) as {
        email: string;
        password: string;
      };
      const email = body.email.toLowerCase();
      if (email === "unconfirmed@example.test")
        return Response.json(
          {
            code: 400,
            error_code: "email_not_confirmed",
            msg: "Email not confirmed",
          },
          { status: 400 },
        );
      if (email === USER.email && body.password === RIGHT)
        return Response.json({
          access_token: "fixture-access-token",
          token_type: "bearer",
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          refresh_token: "fixture-refresh-token",
          user: USER,
        });
      return Response.json(
        {
          code: 400,
          error_code: "invalid_credentials",
          msg: "Invalid login credentials",
        },
        { status: 400 },
      );
    }
    throw new Error(`Unexpected request from Core's sign-in: ${url}`);
  });
}

function signIn(
  body: unknown,
  headers: Record<string, string> = { "x-forwarded-for": "198.51.100.7" },
) {
  return POST(
    new Request("http://localhost:3000/api/auth/sign-in", {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

async function answer(response: Response) {
  return {
    status: response.status,
    body: await response.text(),
    cacheControl: response.headers.get("cache-control"),
  };
}

let provider: ReturnType<typeof fakeProvider>;
const logged: unknown[][] = [];

beforeEach(() => {
  fixture.cookies.clear();
  fixture.writes.length = 0;
  fixture.take.mockReset().mockResolvedValue(true);
  fixture.record.mockReset().mockResolvedValue(undefined);
  provider = fakeProvider();
  vi.stubGlobal("fetch", provider);
  logged.length = 0;
  for (const level of ["log", "info", "warn", "error", "debug"] as const)
    vi.spyOn(console, level).mockImplementation((...args: unknown[]) => {
      logged.push(args);
    });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Core's sign-in route (AL-2671 N4 PR 1)", () => {
  it("answers an unknown address, a wrong password, an unconfirmed address and a limited attempt alike, with no provider text and no session", async () => {
    const unknown = await answer(
      await signIn({ email: "nobody@example.test", password: WRONG }),
    );
    const wrong = await answer(
      await signIn({ email: USER.email, password: WRONG }),
    );
    const unconfirmed = await answer(
      await signIn({ email: "unconfirmed@example.test", password: RIGHT }),
    );
    fixture.take.mockResolvedValueOnce(false);
    const limited = await answer(
      await signIn({ email: USER.email, password: RIGHT }),
    );

    expect(wrong).toEqual(unknown);
    expect(unconfirmed).toEqual(unknown);
    expect(limited).toEqual(unknown);
    expect(unknown.status).toBe(401);
    expect(unknown.cacheControl).toContain("no-store");
    expect(unknown.body).not.toMatch(PROVIDER_TEXT);
    expect(JSON.parse(unknown.body)).toMatchObject({ ok: false });
    expect(fixture.writes).toEqual([]);
  });

  it("counts by the account in the provider's normalisation and the client address the platform set", async () => {
    await signIn(
      { email: "  Known@Example.TEST ", password: WRONG },
      { "x-forwarded-for": "198.51.100.7, 10.0.0.1" },
    );
    expect(fixture.take).toHaveBeenCalledWith({
      account: "known@example.test",
      address: "198.51.100.7",
    });
    expect(fixture.record).toHaveBeenCalledWith({
      account: "known@example.test",
      address: "198.51.100.7",
    });
  });

  it("records a refused password once, and an unconfirmed address as refused; a limited attempt never reaches the provider and records nothing", async () => {
    await signIn({ email: USER.email, password: WRONG });
    expect(fixture.record).toHaveBeenCalledTimes(1);
    await signIn({ email: "unconfirmed@example.test", password: RIGHT });
    expect(fixture.record).toHaveBeenCalledTimes(2);

    provider.mockClear();
    fixture.record.mockClear();
    fixture.take.mockResolvedValueOnce(false);
    await signIn({ email: USER.email, password: RIGHT });
    expect(provider).not.toHaveBeenCalled();
    expect(fixture.record).not.toHaveBeenCalled();
  });

  it("signs in with the right password: the server sets the session cookie, and the body carries no token", async () => {
    const response = await signIn({ email: USER.email, password: RIGHT });
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(JSON.parse(body)).toEqual({ ok: true });
    expect(body).not.toContain("fixture-access-token");
    expect(body).not.toContain("fixture-refresh-token");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(
      fixture.writes.some(({ name }) =>
        name.startsWith("sb-sign-in-fixture-auth-token"),
      ),
    ).toBe(true);
    expect(fixture.record).not.toHaveBeenCalled();
  });

  it("is unavailable, never a pass, without a client address or without its limits; the provider is not called", async () => {
    const noAddress = await signIn({ email: USER.email, password: RIGHT }, {});
    expect(noAddress.status).toBe(503);

    fixture.take.mockRejectedValueOnce(new SignInLimitsUnavailableError());
    const noLimits = await signIn({ email: USER.email, password: RIGHT });
    expect(noLimits.status).toBe(503);

    expect(provider).not.toHaveBeenCalled();
    expect(fixture.writes).toEqual([]);
  });

  it("is unavailable when the provider is, and records nothing", async () => {
    provider = fakeProvider({ down: true });
    vi.stubGlobal("fetch", provider);
    const response = await signIn({ email: USER.email, password: RIGHT });
    const body = await response.text();
    expect(response.status).toBe(503);
    expect(body).not.toContain("fetch failed");
    expect(fixture.record).not.toHaveBeenCalled();
  });

  it("refuses a body without an email and a password, and a body that is not JSON", async () => {
    expect((await signIn({ email: USER.email })).status).toBe(400);
    expect((await signIn({ email: "", password: RIGHT })).status).toBe(400);
    expect((await signIn({ email: USER.email, password: 7 })).status).toBe(400);
    expect((await signIn("not json")).status).toBe(400);
    expect(fixture.take).not.toHaveBeenCalled();
  });

  it("never writes the password to a log, whatever the outcome", async () => {
    await signIn({ email: USER.email, password: WRONG });
    await signIn({ email: USER.email, password: RIGHT });
    fixture.take.mockRejectedValueOnce(new SignInLimitsUnavailableError());
    await signIn({ email: USER.email, password: RIGHT });
    fixture.record.mockRejectedValueOnce(new SignInLimitsUnavailableError());
    await signIn({ email: USER.email, password: WRONG });
    provider = fakeProvider({ down: true });
    vi.stubGlobal("fetch", provider);
    await signIn({ email: USER.email, password: RIGHT });

    const text = JSON.stringify(logged.map((args) => args.map(String)));
    expect(text).not.toContain(RIGHT);
    expect(text).not.toContain(WRONG);
    expect(text).not.toContain("fixture-access-token");
  });
});
