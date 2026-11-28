import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fixture = vi.hoisted(() => ({
  cookies: new Map<string, string>(),
  take: vi.fn(),
  release: vi.fn(),
  clear: vi.fn(),
}));

vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: () => ({
    url: "https://password-fixture.supabase.co",
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

vi.mock(
  "../../../packages/api/src/identity/sign-in-limits",
  async (importActual) => {
    const actual = await importActual<Record<string, unknown>>();
    return {
      ...actual,
      takeSignInAttempt: fixture.take,
      releaseSignInAttempt: fixture.release,
      clearSignInAccount: fixture.clear,
    };
  },
);

import { POST } from "../../../packages/api/src/auth/password";
import { SignInLimitsUnavailableError } from "../../../packages/api/src/identity/sign-in-limits";

const CURRENT = "current account phrase";
const NEXT = "next account phrase";
const EMAIL = "Known@Example.test";
const USER = {
  id: "0f8fa7b5-2d8a-4c9e-9a51-2a4b7d0e8c11",
  aud: "authenticated",
  role: "authenticated",
  email: EMAIL.toLowerCase(),
  app_metadata: {},
  user_metadata: {},
  created_at: "2026-11-01T00:00:00Z",
};

const nowSeconds = () => Math.floor(Date.now() / 1000);

const SIGNATURE = Buffer.from("fixture-signature").toString("base64url");

function jwt(
  amr: Array<{ method: string; timestamp: number }>,
  options: { sessionId?: string; signature?: string } = {},
) {
  const part = (value: unknown) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  return [
    part({ alg: "HS256", typ: "JWT" }),
    part({
      sub: USER.id,
      email: USER.email,
      aud: "authenticated",
      role: "authenticated",
      session_id: options.sessionId ?? "session-1",
      exp: nowSeconds() + 3600,
      amr,
    }),
    options.signature ?? SIGNATURE,
  ].join(".");
}

function withSession(
  method: "password" | "recovery",
  ageSeconds = 60,
  signature?: string,
) {
  const accessToken = jwt([{ method, timestamp: nowSeconds() - ageSeconds }], {
    signature,
  });
  const session = {
    access_token: accessToken,
    token_type: "bearer",
    expires_in: 3600,
    expires_at: nowSeconds() + 3600,
    refresh_token: "fixture-refresh-token",
    user: USER,
  };
  fixture.cookies.set(
    "sb-password-fixture-auth-token",
    `base64-${Buffer.from(JSON.stringify(session)).toString("base64url")}`,
  );
  return accessToken;
}

type Call = { method: string; url: string; auth: string | null; body: string };

function sessionInJar(): { access_token: string } | null {
  const value = fixture.cookies.get("sb-password-fixture-auth-token");
  if (!value?.startsWith("base64-")) return null;
  return JSON.parse(Buffer.from(value.slice(7), "base64url").toString());
}

function fakeProvider(
  options: {
    updateRefusal?: "weak_password" | "same_password";
    refuseFreshSignIn?: boolean;
  } = {},
) {
  const calls: Call[] = [];
  const issued: string[] = [];
  let stored = CURRENT;
  const fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = input instanceof Request ? input.url : input.toString();
    const headers = new Headers(init?.headers);
    const call = {
      method: init?.method ?? "GET",
      url,
      auth: headers.get("authorization"),
      body: String(init?.body ?? ""),
    };
    calls.push(call);
    if (url.includes("/auth/v1/token?grant_type=password")) {
      const body = JSON.parse(call.body) as { email: string; password: string };
      const fresh = stored !== CURRENT;
      if (
        body.email.toLowerCase() === USER.email &&
        body.password === stored &&
        !(fresh && options.refuseFreshSignIn)
      ) {
        const token = jwt([{ method: "password", timestamp: nowSeconds() }], {
          sessionId: `session-${issued.length + 2}`,
        });
        issued.push(token);
        return Response.json({
          access_token: token,
          token_type: "bearer",
          expires_in: 3600,
          expires_at: nowSeconds() + 3600,
          refresh_token: `refresh-${issued.length}`,
          user: USER,
        });
      }
      return Response.json(
        {
          code: 400,
          error_code: "invalid_credentials",
          msg: "Invalid login credentials",
        },
        { status: 400 },
      );
    }
    if (url.includes("/auth/v1/logout"))
      return new Response(null, { status: 204 });
    if (url.endsWith("/auth/v1/user") && call.method === "PUT") {
      if (options.updateRefusal)
        return Response.json(
          {
            code: 422,
            error_code: options.updateRefusal,
            msg:
              options.updateRefusal === "same_password"
                ? "New password should be different from the old password."
                : "Password should contain at least one character of each",
          },
          { status: 422 },
        );
      stored = (JSON.parse(call.body) as { password: string }).password;
      return Response.json(USER);
    }
    if (url.endsWith("/auth/v1/user")) {
      if (!call.auth?.endsWith(`.${SIGNATURE}`))
        return Response.json(
          { code: 403, error_code: "bad_jwt", msg: "invalid JWT" },
          { status: 403 },
        );
      return Response.json(USER);
    }
    throw new Error(`Unexpected request from Core's password route: ${url}`);
  });
  return { fetch, calls, issued };
}

function change(
  body: unknown,
  headers: Record<string, string> = { "x-forwarded-for": "198.51.100.9" },
) {
  return POST(
    new Request("http://localhost:3000/api/auth/password", {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
    }),
  );
}

let provider: ReturnType<typeof fakeProvider>;
const logged: unknown[][] = [];
const updates = () =>
  provider.calls.filter(
    (call) => call.method === "PUT" && call.url.endsWith("/auth/v1/user"),
  );
const verifications = () =>
  provider.calls.filter((call) => call.url.includes("grant_type=password"));

beforeEach(() => {
  fixture.cookies.clear();
  fixture.take.mockReset().mockResolvedValue(true);
  fixture.release.mockReset().mockResolvedValue(undefined);
  fixture.clear.mockReset().mockResolvedValue(undefined);
  provider = fakeProvider();
  vi.stubGlobal("fetch", provider.fetch);
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

describe("Core's password route (AL-2671 N4 PR 1)", () => {
  it("refuses a signed-out browser and calls nothing", async () => {
    const response = await change({
      currentPassword: CURRENT,
      newPassword: NEXT,
    });
    expect(response.status).toBe(401);
    expect(provider.calls).toEqual([]);
  });

  it("refuses a wrong current password, changes nothing, and counts it against the account and the address", async () => {
    withSession("password");
    const response = await change({
      currentPassword: "not the current phrase",
      newPassword: NEXT,
    });
    const body = await response.text();
    expect(response.status).toBe(403);
    expect(JSON.parse(body)).toMatchObject({
      ok: false,
      code: "CURRENT_PASSWORD_REFUSED",
    });
    expect(body).not.toMatch(/invalid login credentials/i);
    expect(updates()).toEqual([]);
    expect(fixture.take).toHaveBeenCalledWith({
      account: USER.email,
      address: "198.51.100.9",
    });
    expect(fixture.release).not.toHaveBeenCalled();
  });

  it("with the right current password, ends the check's own session before changing the password on the person's session", async () => {
    const personToken = withSession("password");
    const response = await change({
      currentPassword: CURRENT,
      newPassword: NEXT,
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(response.headers.get("cache-control")).toContain("no-store");

    const order = provider.calls.map((call) =>
      call.url.includes("grant_type=password")
        ? "verify"
        : call.url.includes("/logout")
          ? `logout ${call.auth}`
          : call.method === "PUT"
            ? `update ${call.auth}`
            : null,
    );
    expect(order.filter(Boolean)).toEqual([
      "verify",
      `logout Bearer ${provider.issued[0]}`,
      `update Bearer ${personToken}`,
    ]);
    expect(JSON.parse(updates()[0]!.body)).toMatchObject({ password: NEXT });
    expect(fixture.release).toHaveBeenCalledWith(
      { account: USER.email, address: "198.51.100.9" },
      { cleared: true },
    );
  });

  it("a limited check never reaches the provider and changes nothing", async () => {
    withSession("password");
    fixture.take.mockResolvedValueOnce(false);
    const response = await change({
      currentPassword: CURRENT,
      newPassword: NEXT,
    });
    expect(response.status).toBe(429);
    expect(verifications()).toEqual([]);
    expect(updates()).toEqual([]);

    fixture.take.mockRejectedValueOnce(new SignInLimitsUnavailableError());
    expect(
      (await change({ currentPassword: CURRENT, newPassword: NEXT })).status,
    ).toBe(503);
    expect(updates()).toEqual([]);
  });

  it("saves without a current password only on a recovery session inside its window, checked on the server", async () => {
    withSession("password");
    const ordinary = await change({ newPassword: NEXT });
    expect(ordinary.status).toBe(403);
    expect(await ordinary.json()).toMatchObject({
      code: "CURRENT_PASSWORD_REQUIRED",
    });
    expect(updates()).toEqual([]);

    withSession("recovery", 2 * 60 * 60);
    expect((await change({ newPassword: NEXT })).status).toBe(403);
    expect(updates()).toEqual([]);

    withSession("recovery", 60);
    const recovery = await change({ newPassword: NEXT });
    expect(recovery.status).toBe(200);
    expect(fixture.clear).toHaveBeenCalledWith(USER.email);
    expect(updates()).toHaveLength(1);
    expect(verifications()).toEqual([]);
  });

  it("refuses a short new password, and gives Core's words, not the provider's, when the provider refuses one", async () => {
    withSession("password");
    expect(
      (await change({ currentPassword: CURRENT, newPassword: "short" })).status,
    ).toBe(400);
    expect(verifications()).toEqual([]);

    provider = fakeProvider({ updateRefusal: "weak_password" });
    vi.stubGlobal("fetch", provider.fetch);
    const refused = await change({
      currentPassword: CURRENT,
      newPassword: NEXT,
    });
    const body = await refused.text();
    expect(refused.status).toBe(422);
    expect(body).not.toMatch(/at least one character/i);
  });

  it("answers the provider's refusal of the old password again in Core's words, as Core's own check does", async () => {
    withSession("recovery", 60);
    provider = fakeProvider({ updateRefusal: "same_password" });
    vi.stubGlobal("fetch", provider.fetch);
    const response = await change({ newPassword: NEXT });
    const body = await response.text();
    expect(response.status).toBe(400);
    expect(JSON.parse(body)).toMatchObject({ code: "PASSWORD_UNCHANGED" });
    expect(body).not.toMatch(/different from the old password/i);
  });

  it("ends the recovery exception with its save: the person goes on in a fresh session made from the new password, the recovery session is ended, and a second save needs the current password", async () => {
    const recoveryToken = withSession("recovery", 60);
    const saved = await change({ newPassword: NEXT });
    expect(saved.status).toBe(200);
    expect(
      provider.calls
        .filter((call) => call.url.includes("/auth/v1/logout"))
        .map((call) => call.auth),
    ).toEqual([`Bearer ${recoveryToken}`]);
    expect(sessionInJar()?.access_token).toBe(provider.issued.at(-1));

    const again = await change({ newPassword: "third account phrase" });
    expect(again.status).toBe(403);
    expect(await again.json()).toMatchObject({
      code: "CURRENT_PASSWORD_REQUIRED",
    });
  });

  it("keeps the person signed in on the recovery session when no fresh session can be made, and logs it", async () => {
    provider = fakeProvider({ refuseFreshSignIn: true });
    vi.stubGlobal("fetch", provider.fetch);
    const recoveryToken = withSession("recovery", 60);
    const saved = await change({ newPassword: NEXT });
    expect(saved.status).toBe(200);
    expect(sessionInJar()?.access_token).toBe(recoveryToken);
    expect(
      provider.calls.filter((call) => call.url.includes("/auth/v1/logout")),
    ).toEqual([]);
    expect(JSON.stringify(logged)).toContain("recovery_session_not_replaced");
  });

  it("refuses a session whose token the provider did not sign, however recent its recovery", async () => {
    withSession("recovery", 60, Buffer.from("forged").toString("base64url"));
    const response = await change({ newPassword: NEXT });
    expect(response.status).toBe(401);
    expect(updates()).toEqual([]);
  });

  it("never writes a password to a log", async () => {
    withSession("password");
    await change({
      currentPassword: "not the current phrase",
      newPassword: NEXT,
    });
    await change({ currentPassword: CURRENT, newPassword: NEXT });
    const text = JSON.stringify(logged.map((args) => args.map(String)));
    expect(text).not.toContain(CURRENT);
    expect(text).not.toContain(NEXT);
    expect(text).not.toContain("not the current phrase");
  });
});
