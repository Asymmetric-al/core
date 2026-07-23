import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAuthContextMock, getSupabasePublicConfigMock } = vi.hoisted(() => ({
  getAuthContextMock: vi.fn(),
  getSupabasePublicConfigMock: vi.fn(),
}));

vi.mock("@asym/auth/context", () => ({
  getAuthContext: getAuthContextMock,
}));

vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: getSupabasePublicConfigMock,
}));

import { resolveAdminEveSessionIdentity } from "../../../../packages/api/src/eve/session-ownership/identity";

import type { AuthContext } from "@asym/auth/context";

const TENANT_ID = "00000000-0000-4000-8000-000000000001";
const PROFILE_ID = "00000000-0000-4000-8000-000000000002";

const verifiedAdmin = {
  userId: "verified-user",
  email: "admin@example.com",
  tenantId: TENANT_ID,
  role: "admin",
  profileRole: "admin",
  memberships: [],
  profileId: PROFILE_ID,
  isAuthenticated: true,
} satisfies AuthContext;

describe("Eve admin cookie authentication", () => {
  beforeEach(() => {
    getAuthContextMock.mockReset();
    getSupabasePublicConfigMock.mockReset();
    getSupabasePublicConfigMock.mockReturnValue({
      url: "https://project.supabase.co",
      key: "public-key",
    });
  });

  it("authenticates Request cookies without a Next request scope", async () => {
    getAuthContextMock.mockImplementation(async (request: Request) => {
      if (
        request.headers.get("authorization") !== "Bearer cookie-access-token"
      ) {
        throw new Error("cookies was called outside a request scope");
      }
      return verifiedAdmin;
    });

    const cookieSession = Buffer.from(
      JSON.stringify({
        access_token: "cookie-access-token",
        expires_at: Math.floor(Date.now() / 1000) + 3_600,
        expires_in: 3_600,
        refresh_token: "cookie-refresh-token",
        token_type: "bearer",
        user: {
          app_metadata: {},
          aud: "authenticated",
          created_at: "2026-01-01T00:00:00.000Z",
          email: "admin@example.com",
          id: "verified-user",
          role: "authenticated",
          user_metadata: {},
        },
      }),
    ).toString("base64url");

    const request = new Request("https://eve.test/eve/v1/session", {
      headers: {
        cookie: `sb-project-auth-token=base64-${cookieSession}; preference=compact`,
      },
      method: "POST",
    });

    const result = await resolveAdminEveSessionIdentity(request);

    expect(result).toEqual({
      ok: true,
      identity: expect.objectContaining({
        actorId: "verified-user",
        actorProfileId: PROFILE_ID,
        tenantId: TENANT_ID,
      }),
    });

    const verifiedRequest = getAuthContextMock.mock.calls[0]?.[0] as Request;
    expect(verifiedRequest.headers.get("authorization")).toBe(
      "Bearer cookie-access-token",
    );
    expect(verifiedRequest.headers.get("cookie")).toBe(
      request.headers.get("cookie"),
    );
  });
});
