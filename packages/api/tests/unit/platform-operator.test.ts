import { createClient } from "@asym/database/supabase/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { confirmPlatformOperator } from "../../src/shared/platform-operator";

/**
 * AL-2675 (WP2c, part 1), review WC3: the shared operator check asks the
 * database on the caller's own session. A request that carries no Supabase
 * session (the test-only bypass identity is one) would reach PostgREST as
 * `anon`, to whom `public.platform_operator_session()` is not granted; it is
 * "not an operator" without a database call, never a 500. Any other failure
 * still throws: a broken check admits nobody.
 */
vi.mock("@asym/database/supabase/server", () => ({
  createClient: vi.fn(),
}));

const rpc = vi.fn();
const AN_OPERATOR = { data: { operator_id: "user-1" }, error: null };

function request(headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/test", { headers });
}

describe("confirmPlatformOperator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockResolvedValue({ rpc } as never);
    rpc.mockResolvedValue(AN_OPERATOR);
  });

  it.each([
    ["no cookie and no bearer token", {}],
    ["only the E2E bypass cookie", { cookie: "asym_e2e_auth=signed-value" }],
    [
      "a cookie that is not a Supabase session",
      { cookie: "theme=dark; sb-project-auth-token-code-verifier=abc" },
    ],
    [
      "an authorization header that is not a bearer token",
      { authorization: "Basic dXNlcjpwYXNz" },
    ],
    ["an empty bearer token", { authorization: "Bearer   " }],
  ])(
    "answers false with no database call for a request with %s",
    async (_what, headers) => {
      await expect(
        confirmPlatformOperator({
          request: request(headers),
          userId: "user-1",
        }),
      ).resolves.toBe(false);
      // An injected client is not asked either.
      await expect(
        confirmPlatformOperator({
          request: request(headers),
          userId: "user-1",
          client: { rpc },
        }),
      ).resolves.toBe(false);
      expect(createClient).not.toHaveBeenCalled();
      expect(rpc).not.toHaveBeenCalled();
    },
  );

  it.each([
    ["a Supabase session cookie", "sb-127-auth-token=base64-session"],
    [
      "a chunked Supabase session cookie",
      "theme=dark; sb-abcdefghijklmnop-auth-token.0=part; sb-abcdefghijklmnop-auth-token.1=part",
    ],
  ])("asks the database for a request with %s", async (_what, cookie) => {
    await expect(
      confirmPlatformOperator({
        request: request({ cookie }),
        userId: "user-1",
      }),
    ).resolves.toBe(true);
    expect(rpc).toHaveBeenCalledWith("platform_operator_session");
  });

  it("asks the database for a request with a bearer token", async () => {
    await expect(
      confirmPlatformOperator({
        request: request({ authorization: "Bearer a.jwt.token" }),
        userId: "user-1",
        client: { rpc },
      }),
    ).resolves.toBe(true);
    expect(rpc).toHaveBeenCalledWith("platform_operator_session");
  });

  it("answers false when the database refuses, and throws on any other failure", async () => {
    const cookie = { cookie: "sb-127-auth-token=base64-session" };
    rpc.mockResolvedValueOnce({
      data: null,
      error: {
        code: "42501",
        message: "platform: the caller is not a platform operator",
      },
    });
    await expect(
      confirmPlatformOperator({ request: request(cookie), userId: "user-1" }),
    ).resolves.toBe(false);

    rpc.mockResolvedValueOnce({
      data: null,
      error: { code: "PGRST202", message: "Could not find the function" },
    });
    await expect(
      confirmPlatformOperator({ request: request(cookie), userId: "user-1" }),
    ).rejects.toThrow("The platform operator check failed");
  });

  it("answers false when the database returns another login", async () => {
    rpc.mockResolvedValueOnce({ data: { operator_id: "user-2" }, error: null });
    await expect(
      confirmPlatformOperator({
        request: request({ cookie: "sb-127-auth-token=base64-session" }),
        userId: "user-1",
      }),
    ).resolves.toBe(false);
  });
});
