import {
  getAuthContext,
  requireAuth,
  type AuthContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "../../src/donate";
import { resolveTenantStripe } from "../../src/stripe/tenant-client";

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: vi.fn(),
}));

vi.mock("@asym/auth/context", () => ({
  getAuthContext: vi.fn(),
  requireAuth: vi.fn((context: { isAuthenticated?: boolean }) => {
    if (!context?.isAuthenticated) throw new Error("Unauthorized");
  }),
}));

vi.mock("../../src/stripe/tenant-client", () => ({
  resolveTenantStripe: vi.fn(),
}));

const mockedGetAdminClient = vi.mocked(getAdminClient);
const mockedGetAuthContext = vi.mocked(getAuthContext);
const mockedResolveTenantStripe = vi.mocked(resolveTenantStripe);

const from = vi.fn();
const supabaseAdmin = { from };

const authContext: AuthContext = {
  userId: "user-1",
  tenantId: "tenant-1",
  profileId: "profile-1",
  role: "donor",
  email: "donor@example.test",
  isAuthenticated: true,
  profileRole: "donor",
  memberships: [],
};

const configured = {
  ok: true as const,
  stripe: {} as never,
  secretKey: "sk_test_config",
  publishableKey: "pk_test_config",
};

const get = (query = "") =>
  GET(new NextRequest(`http://localhost/api/donate${query}`));

describe("GET /api/donate config", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetAdminClient.mockReturnValue({
      client: supabaseAdmin as never,
      error: null,
    });
    mockedGetAuthContext.mockResolvedValue(authContext);
    mockedResolveTenantStripe.mockResolvedValue(configured);
  });

  it.each(["", "?missionary_id=m-1&fund_id=f-1", "?missionary_id=not-a-uuid"])(
    "returns only the publishable key for query %j",
    async (query) => {
      const response = await get(query);

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        publishableKey: "pk_test_config",
      });
      expect(mockedResolveTenantStripe).toHaveBeenCalledWith({
        supabaseAdmin,
        tenantId: "tenant-1",
      });
      expect(from).not.toHaveBeenCalled();
    },
  );

  it("returns 503 when the admin client is unavailable", async () => {
    mockedGetAdminClient.mockReturnValue({
      client: null,
      error: "Supabase admin unavailable",
    });

    const response = await get();

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: "Supabase admin unavailable",
    });
    expect(requireAuth).not.toHaveBeenCalled();
  });

  it("returns 401 for an unauthenticated caller", async () => {
    mockedGetAuthContext.mockResolvedValue({
      ...authContext,
      isAuthenticated: false,
    });

    const response = await get();

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
    expect(mockedResolveTenantStripe).not.toHaveBeenCalled();
  });

  it.each([
    { ok: false as const, reason: "tenant_not_found" as const },
    {
      ok: false as const,
      reason: "lookup_failed" as const,
      message: "lookup failed",
    },
  ])("returns 404 when tenant Stripe resolution fails ($reason)", async (r) => {
    mockedResolveTenantStripe.mockResolvedValue(r);

    const response = await get();

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Tenant not found" });
  });

  it.each([
    { ok: false as const, reason: "stripe_unconfigured" as const },
    { ...configured, publishableKey: null },
  ])("returns the Stripe configuration error (%#)", async (r) => {
    mockedResolveTenantStripe.mockResolvedValue(r);

    const response = await get();

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "Checkout configuration is incomplete for this organization",
    });
  });
});
